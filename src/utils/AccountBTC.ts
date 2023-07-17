import { sha256 } from "@noble/hashes/sha256";
import bs58 from "bs58";
import ripemd160 from "ripemd160";
import { Blockchains, Net } from "../common/blockchain.types.js";
import { networks, ECPair, ECPairInterface } from "bitcoinjs-lib";
import { getListOfTx } from "../api/universal/getListOfUtxo.js";
import { getParams } from "../api/params.js";

const ADR_MAIN_NET_PREFIX = "00";
const ADR_TEST_NET_PREFIX = "6F";

interface UTXO {
  txid: string;
  index: number;
  value: number;
}

export class AccountBTC {
  blockchain = Blockchains.BTC;
  net: Net;
  balance: number = 0;
  decimals = 8;

  ECPair: ECPairInterface;
  addressP2PKH: string;
  utxos: UTXO[];

  constructor(phrase: string, net: Net) {
    this.net = net;
    const { bitcoin, testnet } = networks;
    const network = net === Net.MAIN ? bitcoin : testnet;
    const privKey = this.phraseToPrivKey(phrase);
    this.ECPair = ECPair.fromPrivateKey(privKey, { network });
    const pubKey = this.ECPair.publicKey;
    this.addressP2PKH = this.toAddressP2PKH(pubKey);
  }

  private phraseToPrivKey(phrase: string) {
    return Buffer.from(sha256(phrase));
  }

  private toAddressP2PKH(pubKey: Buffer) {
    const prefix =
      this.net === Net.MAIN ? ADR_MAIN_NET_PREFIX : ADR_TEST_NET_PREFIX;
    const base = sha256(Buffer.from(pubKey));

    const ripemd = new ripemd160().update(Buffer.from(base)).digest();
    const ripemdPrefixed = Buffer.concat([Buffer.from(prefix, "hex"), ripemd]);
    const checksum = Buffer.from(sha256(sha256(ripemdPrefixed)).slice(0, 4));
    const ripemdChecksum = Buffer.concat([ripemdPrefixed, checksum]);

    return bs58.encode(ripemdChecksum);
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
      const list = await getListOfTx(
        this.addressP2PKH,
        getParams(this),
        pageToken
      );

      if (list.meta && list.meta.paging.next_page_token) {
        pageToken = list.meta.paging.next_page_token;
      } else {
        isMore = false;
      }

      list.data.forEach(({ value, mined: { index, tx_id, meta } }) => {
        if (meta.script_type === "pubkeyhash")
          utxos.push({ txid: tx_id, index, value });
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
