import { Blockchains, Net } from "../common/blockchain.types.js";

export interface Account {
  blockchain: Blockchains;
  net: Net;
  balance: bigint;
  decimals: number;
  address: string;

  keysHex: {
    priv: string;
    pub: string;
  };

  initizalize: () => Promise<this>;
}
