import { sha256 } from "@noble/hashes/sha256";
import { Blockchains, Net } from "../common/blockchain.types.js";
import { SigningKey } from "ethers";
import { BaseWallet } from "ethers";
import { getBalances } from "../api/universal/getBalances.js";
import { getParams } from "../api/params.js";
import { getTxCount } from "../api/native/eth/getTxCount.js";

export class AccountETH {
  blockchain = Blockchains.ETH;
  net: Net;
  balance: number = 0;
  decimals = 18;

  ECPair: SigningKey;
  wallet: BaseWallet;
  txCount: number;

  constructor(phrase: string, net: Net) {
    this.net = net;
    const privKey = this.phraseToPrivKey(phrase);
    this.ECPair = new SigningKey(privKey);
    this.wallet = new BaseWallet(this.ECPair);
  }

  private phraseToPrivKey(phrase: string) {
    return Buffer.from(sha256(phrase));
  }

  public async initialize() {
    this.txCount = await this.initTxCount();
    this.balance = await this.initBalance();
  }

  private async initBalance() {
    const balances = await getBalances(this.wallet.address, getParams(this));
    if (
      balances[0] &&
      balances[0].currency.symbol.toLowerCase() === this.blockchain
    ) {
      return parseInt(balances[0].confirmed_balance);
    }
    return 0;
  }

  private async initTxCount() {
    const countHex = (await getTxCount(this.wallet.address, getParams(this)))
      .result;
    return parseInt(countHex);
  }

  get keysHex() {
    return {
      priv: this.ECPair.privateKey,
      pub: this.ECPair.publicKey,
    };
  }
}
