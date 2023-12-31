import { AccountBTC } from "../utils/AccountBTC.js";
import { AccountETH } from "../utils/AccountETH.js";
import { TransferERC20 } from "../utils/TransferERC20.js";
import { TransactionBTC } from "../utils/TransactionBTC.js";
import { TransactionETH } from "../utils/TransactionETH.js";

export type Context = {
  wallet?: {
    account: AccountBTC | AccountETH;
    transaction?: TransactionBTC | TransactionETH;
    method?: TransferERC20;
  };
};

export const getInitContext = (): Context => ({});
