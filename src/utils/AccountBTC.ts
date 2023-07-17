import { sha256 } from "@noble/hashes/sha256";
import { Blockchains, Net } from "../common/blockchain.types.js";
import { ECPair, ECPairInterface, payments } from "bitcoinjs-lib";
import { getListOfTx } from "../api/universal/getListOfUtxo.js";
import { getParams } from "../api/params.js";
import { HelpersBTC } from "./HelpersBTC.js";

interface UTXO {
  txid: string;
  index: number;
  value: number;
  type: string;
}

export class AccountBTC extends HelpersBTC {
  blockchain = Blockchains.BTC;
  net: Net;
  balance: number = 0;
  decimals = 8;

  ECPair: ECPairInterface;
  address: string;
  utxos: UTXO[];

  constructor(phrase: string, net: Net) {
    super();
    this.net = net;
    const network = this.getNetwork(net);
    const privKey = this.phraseToPrivKey(phrase);
    this.ECPair = ECPair.fromPrivateKey(privKey, { network });
    const addresses = this.toAddress(this.ECPair.publicKey, net);
    //TO DO enabled p2wpkh transaction
    this.address = addresses["p2pkh"];
  }

  private phraseToPrivKey(phrase: string) {
    return Buffer.from(sha256(phrase));
  }

  private toAddress(pubKey: Buffer, net: Net) {
    const network = this.getNetwork(net);
    const p2pkh = payments.p2pkh({ network, pubkey: pubKey });
    const p2wpkh = payments.p2wpkh({ network, pubkey: pubKey });

    return { p2pkh: p2pkh.address, p2wpkh: p2wpkh.address };
  }

  public async initizalize() {
    this.utxos = await this.fetchUtxos();
    this.balance = this.calcBalance(this.utxos);
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

      list.data.forEach(({ value, mined: { index, tx_id, meta } }) => {
        if (meta.script_type === "pubkeyhash")
          utxos.push({ txid: tx_id, index, value, type: meta.script_type });
      });
    }
    return utxos;
  }

  private calcBalance(utxos: UTXO[]) {
    let balance = 0;
    utxos.forEach(({ value }) => (balance += value));
    return balance;
  }

  get keysHex() {
    return {
      priv: this.ECPair.privateKey.toString("hex"),
      pub: this.ECPair.publicKey.toString("hex"),
    };
  }
}
