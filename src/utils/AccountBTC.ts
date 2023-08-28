import { sha256 } from "@noble/hashes/sha256";
import { Blockchains, Net } from "../common/blockchain.types.js";
import { ECPair, ECPairInterface, networks, payments } from "bitcoinjs-lib";
import { getListOfTx } from "../api/universal/getListOfUtxo.js";
import { getParams } from "../api/params.js";
import { Account } from "./Account.types.js";
import { getBalances } from "../api/universal/getBalances.js";

interface UTXO {
  txid: string;
  index: number;
  value: number;
  type: string;
}

export class AccountBTC implements Account {
  blockchain = Blockchains.BTC;
  net: Net;
  balance: bigint;
  decimals = 8;
  address: string;

  ecPair: ECPairInterface;
  utxos: UTXO[];

  constructor(phrase: string, net: Net) {
    this.net = net;
    const network = Net.MAIN ? networks.bitcoin : networks.testnet;
    const privKey = this.phraseToPrivKey(phrase);
    this.ecPair = ECPair.fromPrivateKey(privKey, { network });
    this.address = payments.p2pkh({
      network,
      pubkey: this.ecPair.publicKey,
    }).address;
  }

  private phraseToPrivKey(phrase: string) {
    return Buffer.from(sha256(phrase));
  }

  public async initizalize() {
    this.utxos = await this.fetchUtxos();
    this.balance = await this.initBalance();
    return this;
  }

  private async fetchUtxos() {
    const utxos: UTXO[] = [];
    let pageToken;
    let isMore = true;
    while (isMore) {
      const list = await getListOfTx(this.address, getParams(this), pageToken);

      if (list.meta && list.meta.paging.next_page_token) {
        pageToken = list.meta.paging.next_page_token;
      } else {
        isMore = false;
      }

      list.data.forEach(
        ({ is_spent, value, mined: { index, tx_id, meta } }) => {
          if (meta.script_type === "pubkeyhash" && !is_spent)
            utxos.push({ txid: tx_id, index, value, type: meta.script_type });
        }
      );
    }
    return utxos;
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
      priv: this.ecPair.privateKey.toString("hex"),
      pub: this.ecPair.publicKey.toString("hex"),
    };
  }
}
