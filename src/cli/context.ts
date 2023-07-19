import { AccountBTC } from "../utils/AccountBTC.js";
import { AccountETH } from "../utils/AccountETH.js";
import { Transaction } from "../utils/Transaction.types.js";
import { TransactionBTC } from "../utils/TransactionBTC.js";
import { TransactionETH } from "../utils/TransactionETH.js";

export type Context = {
  wallet?: {
    account: AccountBTC | AccountETH;
    transaction?: TransactionBTC | TransactionETH;
  };
};

export const getInitContext = (): Context => ({});
