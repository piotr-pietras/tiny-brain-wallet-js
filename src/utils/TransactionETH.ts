import { getParams } from "../api/params.js";
import { submitSignedTx } from "../api/universal/submitSignedTx.js";
import { Net } from "../common/blockchain.types.js";
import { AccountETH } from "./AccountETH.js";
import { TransactionRequest } from "ethers";
import { Priority, Transaction } from "./Transaction.types.js";

export class TransactionETH implements Transaction {
  private account: AccountETH;
  private tx: TransactionRequest;

  txid: string;
  fee: number;
  feeRate: number;
  static feeRateUnit = "Gwei";
  value: number;
  address: string;
  priority: Priority;

  constructor(account: AccountETH) {
    this.account = account;
  }

  public async create(address: string, value: number, feeRate: number) {
    this.value = value;
    this.address = address;
    this.feeRate = feeRate;

    const { net } = this.account;
    const gasPrice = feeRate * Math.pow(10, 9);
    const gasLimit = 21000;
    this.fee = feeRate * gasLimit;

    this.tx = {
      from: this.account.wallet.address,
      to: address,
      value,
      gasLimit,
      gasPrice,
      nonce: this.account.txCount,
      chainId: net === Net.MAIN ? 1 : 5,
    };

    return this;
  }

  public async signAndSend() {
    const signed = await this.account.wallet.signTransaction(this.tx);
    const res = await submitSignedTx(signed, getParams(this.account));
    this.txid = res.id;
  }
}
