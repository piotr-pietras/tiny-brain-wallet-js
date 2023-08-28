import { getParams } from "../api/params.js";
import { submitSignedTx } from "../api/universal/submitSignedTx.js";
import { Net } from "../common/blockchain.types.js";
import { AccountETH } from "./AccountETH.js";
import { TransactionRequest } from "ethers";
import { Priority, Transaction } from "./Transaction.types.js";
import { getTxCount } from "../api/native/eth/getTxCount.js";

export class TransactionETH implements Transaction {
  private account: AccountETH;
  private tx: TransactionRequest;

  txid: string;
  txCount: number;
  fee: bigint; //wei
  feeRate: number;
  feeRateUnit = "Gwei";
  value: bigint;
  address: string;
  priority: Priority;

  constructor(account: AccountETH) {
    this.account = account;
  }

  public async create(address: string, value: string, feeRate: number) {
    this.value = BigInt(value);
    this.address = address;
    this.feeRate = feeRate;

    const { net } = this.account;
    const gasPrice = BigInt(feeRate * Math.pow(10, 9));
    const gasLimit = BigInt(21000);
    this.fee = gasPrice * gasLimit;

    const params = getParams(this.account);
    const countResponse = await getTxCount(this.account.wallet.address, params);
    this.txCount = parseInt(countResponse.result);

    this.tx = {
      from: this.account.wallet.address,
      to: address,
      value,
      gasLimit,
      gasPrice,
      nonce: this.txCount,
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
