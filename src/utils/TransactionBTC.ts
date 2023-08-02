import { getRawTx } from "../api/native/btc/getRawTx.js";
import { getParams } from "../api/params.js";
import { getFeeEstimation } from "../api/universal/getFeeEstimation.js";
import { submitSignedTx } from "../api/universal/submitSignedTx.js";
import { AccountBTC } from "./AccountBTC.js";
import { Psbt, networks } from "bitcoinjs-lib";
import { Priority, Transaction } from "./Transaction.types.js";
import { Net } from "../common/blockchain.types.js";
interface Input {
  hash: string;
  index: number;
  nonWitnessUtxo: Buffer;
}

export class TransactionBTC implements Transaction {
  private account: AccountBTC;
  private psbt: Psbt;
  
  txid: string;
  feeRate: number;
  fee: number;
  value: number;
  address: string;
  priority: Priority;

  constructor(account: AccountBTC, feeRate?: number) {
    this.account = account;
    this.feeRate = feeRate;
  }

  public async create(address: string, value: number, priority: Priority) {
    this.value = value;
    this.address = address;
    this.priority = priority;

    const { utxos, net } = this.account;
    const network = this.getNetwork(net);
    const inputs = await this.prepareInputs(utxos);
    if (!utxos.length) throw "No utxos";

    this.fee = await this.calcFee(address, value, inputs, priority);
    const outputs = this.prepareOutputs(address, value, this.fee, this.account);
    this.psbt = new Psbt({ network }).addInputs(inputs).addOutputs(outputs);
    return this;
  }

  private async calcFee(
    address: string,
    value: number,
    inputs: Input[],
    priority: Priority
  ) {
    const { net, ecPair: ECPair } = this.account;
    const network = this.getNetwork(net);
    const noFeeOutputs = this.prepareOutputs(address, value, 0, this.account);

    let feeRate;
    if (this.feeRate) {
      feeRate = this.feeRate;
    } else {
      const fees = (await getFeeEstimation(getParams(this.account)))
        .estimated_fees;
      feeRate = fees && (fees[priority] as number);
    }

    if (!feeRate || feeRate < 1) throw "Fee rate is invalid";

    //TO DO find easier way to calc fee
    const size = new Psbt({ network })
      .addInputs(inputs)
      .addOutputs(noFeeOutputs)
      .signAllInputs(ECPair)
      .finalizeAllInputs()
      .extractTransaction()
      .virtualSize();
    return feeRate * size;
  }

  private async prepareInputs(utxos: AccountBTC["utxos"]) {
    return Promise.all<Input>(
      utxos.map(
        ({ txid, index }) =>
          new Promise(async (resolve) => {
            const { result } = await getRawTx(txid, getParams(this.account));
            resolve({
              hash: txid,
              index,
              nonWitnessUtxo: Buffer.from(result, "hex"),
            });
          })
      )
    );
  }

  private prepareOutputs(
    address: string,
    value: number,
    fee: number,
    account: AccountBTC
  ) {
    const { balance } = account;
    if (balance - value - fee < 0)
      throw `Not enough funds\n (Estimated fee: ${fee})`;
    return [
      {
        address,
        value,
      },
      {
        address: account.address,
        value: balance - value - fee,
      },
    ];
  }

  public async signAndSend() {
    const { ecPair: ECPair } = this.account;
    this.psbt.signAllInputs(ECPair);
    if (!this.psbt.validateSignaturesOfAllInputs())
      throw "Signatures not validated";
    this.psbt.finalizeAllInputs();

    const tx = this.psbt.extractTransaction().toHex();
    const res = await submitSignedTx(tx, getParams(this.account));
    this.txid = res.id;
  }

  private getNetwork(net: Net) {
    const { bitcoin, testnet } = networks;
    return net === Net.MAIN ? bitcoin : testnet;
  }
}
