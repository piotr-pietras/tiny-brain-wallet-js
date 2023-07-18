import { Blockchains, Net } from "../common/blockchain.types.js";

export interface Account {
  blockchain: Blockchains;
  net: Net;
  balance: number;
  decimals: number;
  keysHex: {
    priv: string;
    pub: string;
  };

  initizalize: () => Promise<this>;
}
