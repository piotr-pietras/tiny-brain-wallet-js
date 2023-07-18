import { Blockchains, Net } from "../common/blockchain.types.js";

const params: { [key in Blockchains]: { [key in Net]: [string, string] } } = {
  btc: {
    main: ["bitcoin", "mainnet"],
    test: ["bitcoin", "testnet"],
  },
  eth: {
    main: ["ethereum", "mainnet"],
    test: ["ethereum", "goerli"],
  },
};

interface GetParams {
  blockchain: Blockchains;
  net: Net;
}

export const getParams = (account: GetParams) => {
  return params[account.blockchain][account.net];
};
