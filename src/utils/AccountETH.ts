import { sha256 } from "@noble/hashes/sha256";
import { Blockchains, Net } from "../common/blockchain.types.js";
import { SigningKey, BaseWallet } from "ethers";
import { getBalances } from "../api/universal/getBalances.js";
import { getParams } from "../api/params.js";
import { Account } from "./Account.types.js";

export class AccountETH implements Account {
  blockchain = Blockchains.ETH;
  net: Net;
  balance: bigint;
  decimals = 18;
  address: string;

  ecPair: SigningKey;
  wallet: BaseWallet;

  constructor(phrase: string, net: Net) {
    this.net = net;
    const privKey = this.phraseToPrivKey(phrase);
    this.ecPair = new SigningKey(privKey);
    this.wallet = new BaseWallet(this.ecPair);
    this.address = this.wallet.address;
  }

  private phraseToPrivKey(phrase: string) {
    return Buffer.from(sha256(phrase));
  }

  public async initizalize() {
    this.balance = await this.initBalance();
    return this;
  }

  private async initBalance() {
    const balances = await getBalances(this.address, getParams(this));
    if (
      balances[0] &&
      balances[0].currency.symbol.toLowerCase() === this.blockchain
    ) {
      return BigInt(balances[0].confirmed_balance);
    }
    return BigInt(0);
  }

  get keysHex() {
    return {
      priv: this.ecPair.privateKey,
      pub: this.ecPair.publicKey,
    };
  }
}
