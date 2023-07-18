import { getRawTx } from "../api/native/btc/getRawTx.js";
import { getParams } from "../api/params.js";
import { getFeeEstimation } from "../api/universal/getFeeEstimation.js";
import { submitSignedTx } from "../api/universal/submitSignedTx.js";
import { AccountBTC } from "./AccountBTC.js";
import { Psbt } from "bitcoinjs-lib";
import { HelpersBTC } from "./HelpersBTC.js";

type Priority = "fast" | "medium" | "slow";

interface Input {
  hash: string;
  index: number;
  nonWitnessUtxo: Buffer;
}

export class TransactionBTC extends HelpersBTC {
  private account: AccountBTC;
  private psbt: Psbt;
  fee: number;
  value: number;
  address: string;
  priority: Priority;

  constructor(account: AccountBTC) {
    super();
    this.account = account;
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
    const { net, ECPair } = this.account;
    const network = this.getNetwork(net);
    const noFeeOutputs = this.prepareOutputs(address, value, 0, this.account);
    const fees = (await getFeeEstimation(getParams(this.account)))
      .estimated_fees;
    const feeRate = fees && (fees[priority] as number);
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
    if (account.balance - value - fee < 0)
      throw `Not enough funds\n (Estimated fee: ${fee})`;
    return [
      {
        address,
        value,
      },
      {
        address: account.address,
        value: account.balance - value - fee,
      },
    ];
  }

  public async signAndSend() {
    const { ECPair } = this.account;
    this.psbt.signAllInputs(ECPair);
    if (!this.psbt.validateSignaturesOfAllInputs())
      throw "Signatures not validated";
    this.psbt.finalizeAllInputs();

    const tx = this.psbt.extractTransaction().toHex();
    await submitSignedTx(tx, getParams(this.account));
  }
}
