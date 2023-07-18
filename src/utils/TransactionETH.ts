import { getParams } from "../api/params.js";
import { getFeeEstimation } from "../api/universal/getFeeEstimation.js";
import { submitSignedTx } from "../api/universal/submitSignedTx.js";
import { Net } from "../common/blockchain.types.js";
import { AccountETH } from "./AccountETH.js";
import { TransactionRequest } from "ethers";
import { Priority, Transaction } from "./Transaction.types.js";

export class TransactionETH implements Transaction {
  private account: AccountETH;
  private tx: TransactionRequest;

  fee: number;
  value: number;
  address: string;
  priority: Priority;

  constructor(account: AccountETH) {
    this.account = account;
  }

  public async create(address: string, value: number, priority: Priority) {
    this.value = value;
    this.address = address;
    this.priority = priority;

    const { net } = this.account;
    const gasPrice = await this.calcGasPrice(priority);
    const gasLimit = 21000;
    this.fee = gasPrice * gasLimit;

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

  private async calcGasPrice(priority: Priority) {
    const gas = (await getFeeEstimation(getParams(this.account)))
      .estimated_fees;
    const gasPrice =
      gas && (gas[priority] as { max_total_fee: number }).max_total_fee;

    return gasPrice;
  }

  public async signAndSend() {
    const signed = await this.account.wallet.signTransaction(this.tx);
    await submitSignedTx(signed, getParams(this.account));
  }
}
