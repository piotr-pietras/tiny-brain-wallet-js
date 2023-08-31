import { getRawTx } from "../api/native/btc/getRawTx.js";
import { getParams } from "../api/params.js";
import { submitSignedTx } from "../api/universal/submitSignedTx.js";
import { AccountBTC } from "./AccountBTC.js";
import { Psbt, networks } from "bitcoinjs-lib";
import { Transaction } from "./Transaction.types.js";
import { Net } from "../common/blockchain.types.js";
import { ECPairFactory } from "ecpair";
import * as secp256k1 from "tiny-secp256k1";
interface Input {
  hash: string;
  index: number;
  nonWitnessUtxo: Buffer;
}

export class TransactionBTC implements Transaction {
  private account: AccountBTC;
  private psbt: Psbt;

  txid: string;
  fee: bigint; //satoshi
  feeRate: number;
  feeRateUnit = "sats/vB";
  value: bigint;
  address: string;

  constructor(account: AccountBTC) {
    this.account = account;
  }

  public async create(address: string, value: bigint, feeRate: number) {
    this.value = value;
    this.address = address;
    this.feeRate = feeRate;

    const { utxos, net } = this.account;
    const network = this.getNetwork(net);
    const inputs = await this.prepareInputs(utxos);
    if (!utxos.length) throw "No utxos";

    this.fee = await this.calcFee(address, this.value, inputs, feeRate);
    const outputs = this.prepareOutputs(
      address,
      this.value,
      this.fee,
      this.account
    );
    this.psbt = new Psbt({ network }).addInputs(inputs).addOutputs(outputs);
    return this;
  }

  private async calcFee(
    address: string,
    value: bigint,
    inputs: Input[],
    feeRate: number
  ) {
    const { net, ecPair: ECPair } = this.account;
    const network = this.getNetwork(net);
    const noFeeOutputs = this.prepareOutputs(
      address,
      value,
      BigInt(0),
      this.account
    );

    if (!feeRate || feeRate < 1) throw "Fee rate is invalid";

    //TO DO find easier way to calc fee
    const size = new Psbt({ network })
      .addInputs(inputs)
      .addOutputs(noFeeOutputs)
      .signAllInputs(ECPair)
      .finalizeAllInputs()
      .extractTransaction()
      .virtualSize();
    return BigInt(feeRate * size);
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
    value: bigint,
    fee: bigint,
    account: AccountBTC
  ) {
    const { balance } = account;
    if (balance - value - fee < 0)
      throw `Not enough funds\n (Estimated fee: ${fee})`;
    return [
      {
        address,
        value: Number(value),
      },
      {
        address: account.address,
        value: Number(balance - value - fee),
      },
    ];
  }

  public async signAndSend() {
    const { ecPair: ECPair } = this.account;
    this.psbt.signAllInputs(ECPair);

    const validator = (
      pubkey: Buffer,
      msghash: Buffer,
      signature: Buffer
    ): boolean =>
      ECPairFactory(secp256k1).fromPublicKey(pubkey).verify(msghash, signature);
    if (!this.psbt.validateSignaturesOfAllInputs(validator))
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
