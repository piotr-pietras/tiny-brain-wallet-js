import { AccountBTC } from "../utils/AccountBTC.js";
import { TransactionBTC } from "../utils/TransactionBTC.js";

export type Context = {
  wallet?: {
    account: AccountBTC;
    transaction?: TransactionBTC;
  };
};

export const getInitContext = (): Context => ({});
