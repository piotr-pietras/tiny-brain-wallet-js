import { getRawTx } from "../api/native/getRawTx.js";
import { getParams } from "../api/params.js";
import { getFeeEstimation } from "../api/universal/getFeeEstimation.js";
import { submitSignedTx } from "../api/universal/submitSignedTx.js";
import { Net } from "../common/blockchain.types.js";
import { AccountBTC } from "./AccountBTC.js";
import { Psbt, networks } from "bitcoinjs-lib";

type Priority = "fast" | "medium" | "slow";

interface Input {
  hash: string;
  index: number;
  nonWitnessUtxo: Buffer;
}

export class TransactionBTC {
  private account: AccountBTC;
  private psbt: Psbt;
  fee: number;

  constructor(account: AccountBTC) {
    this.account = account;
  }

  public async create(address: string, value: number, priority: Priority) {
    const { utxos } = this.account;
    const network = this.getNetwork();
    const inputs = await this.prepareInputs(utxos);
    if (!utxos.length) throw "No utxos";

    const fee = await this.calcFee(address, value, inputs, priority);
    const outputs = this.prepareOutputs(address, value, fee, this.account);
    this.psbt = new Psbt({ network }).addInputs(inputs).addOutputs(outputs);
    return this;
  }

  private getNetwork() {
    const { net } = this.account;
    const { bitcoin, testnet } = networks;
    return net === Net.MAIN ? bitcoin : testnet;
  }

  private async calcFee(
    address: string,
    value: number,
    inputs: Input[],
    priority: Priority
  ) {
    const network = this.getNetwork();
    const noFeeOutputs = this.prepareOutputs(address, value, 0, this.account);
    const fees = (await getFeeEstimation(getParams(this.account)))
      ?.estimated_fees;
    const feeRate = fees && fees[priority];
    const size = new Psbt({ network })
      .addInputs(inputs)
      .addOutputs(noFeeOutputs)
      .signAllInputs(this.account.ECPair)
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
    if (account.balance - value - fee < 0) throw "Not enough funds";
    return [
      {
        address,
        value,
      },
      {
        address: account.addressP2PKH,
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
