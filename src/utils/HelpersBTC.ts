import { networks } from "bitcoinjs-lib";
import { Net } from "../common/blockchain.types.js";

export class HelpersBTC {
  protected getNetwork(net: Net) {
    const { bitcoin, testnet } = networks;
    return net === Net.MAIN ? bitcoin : testnet;
  }
}
