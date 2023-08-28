import { getParams } from "../api/params.js";
import { submitSignedTx } from "../api/universal/submitSignedTx.js";
import { Net } from "../common/blockchain.types.js";
import { AccountETH } from "./AccountETH.js";
import { TransactionRequest, Contract, ethers } from "ethers";
import { Priority } from "./Transaction.types.js";
import { getTxCount } from "../api/native/eth/getTxCount.js";
import { ContractData } from "../common/erc20.types.js";
import { estimateTxGas } from "../api/native/eth/estimateTxGas.js";

export class TransferERC20 {
  private account: AccountETH;
  contractData: ContractData;
  private tx: TransactionRequest;

  txid: string;
  txCount: number;
  fee: bigint;
  feeRate: number;
  feeRateUnit = "Gwei";
  value: string;
  address: string;
  priority: Priority;

  constructor(account: AccountETH, contract: ContractData) {
    this.account = account;
    this.contractData = contract;
  }

  public async create(address: string, value: string, feeRate: number) {
    this.value = value;
    this.address = address;
    this.feeRate = feeRate;

    const contract = new Contract(
      this.contractData.address,
      this.contractData.abi
    );
    const methodSignature = contract.interface.encodeFunctionData("transfer", [
      address,
      value,
    ]);

    const { net, wallet } = this.account;
    const gasPrice = BigInt(feeRate * Math.pow(10, 9));
    const gasLimit = await this.estimateGasLimit(methodSignature);

    this.fee = gasPrice * gasLimit;

    const params = getParams(this.account);
    const countResponse = await getTxCount(wallet.address, params);
    this.txCount = parseInt(countResponse.result);

    this.tx = {
      to: this.contractData.address,
      data: methodSignature,
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

  private async estimateGasLimit(methodSignature: string) {
    const EXTRA_FEE = 15; //percents
    const { result } = await estimateTxGas(
      {
        from: this.account.address,
        to: this.contractData.address,
        data: methodSignature,
      },
      getParams(this.account)
    );

    return (BigInt(result) * BigInt(100 + EXTRA_FEE)) / BigInt(100);
  }
}
