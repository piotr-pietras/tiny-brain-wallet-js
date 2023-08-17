import { Account } from "../utils/Account.types.js";
import { Transaction } from "../utils/Transaction.types.js";

export const log = console.log;

export const boxedLog = (line: any) => {
  log("\n-------------------------------------------");
  log(line);
  log("-------------------------------------------\n");
};

export const printWelcome = () => {
  log("Welcome to tiny-brain-wallet-js");
  log(`
    /\\_____/\\
   /  o   o  \\
  ( ==  ^  == )
   )         (
  (           )
 ( (  )   (  ) )
(__(__)___(__)__)`);
  log("");
};

export const printKeys = (keys: { priv: string; pub: string }) => {
  log("\n-------------------------------------------");
  log(`Private Key:`);
  log(`   ->${keys.priv}`);
  log(`Public Key (uncompressed):`);
  log(`   ->${keys.pub}`);
  log("-------------------------------------------\n");
};

export const printBalance = (account: Account) => {
  const { balance, decimals, blockchain } = account;
  const priceConfirmed = balance / Math.pow(10, decimals);
  log("\n-------------------------------------------");
  log(`Balance: ${balance} (${priceConfirmed} ${blockchain})`);
  log("-------------------------------------------\n");
};

export const printTransactionInfo = (
  account: Account,
  transaction: Transaction,
  marketPrice: number
) => {
  const { balance, blockchain, decimals } = account;
  const { address, fee, value, feeRateUnit } = transaction;
  const valueInt = parseInt(value);
  const feeRate = transaction.feeRate;
  const amountCoins = valueInt / Math.pow(10, decimals);
  const amountUsd = ((valueInt * marketPrice) / Math.pow(10, decimals)).toFixed(
    2
  );
  const feeUsd = ((fee * marketPrice) / Math.pow(10, decimals)).toFixed(2);
  const diff = balance - valueInt - fee;
  const balanceCoins = diff / Math.pow(10, decimals);
  const balanceUsd = ((diff * marketPrice) / Math.pow(10, decimals)).toFixed(2);

  log("\n-------------------------------------------");
  log("Your tx was created successfully!");
  log("Check address, value and fee TWICE before sign!");
  log("-------------------------------------------");
  log("Destination:");
  log(`   -> ${address}`);
  log("Amount:");
  log(`   -> ${value} (${amountCoins} ${blockchain}) (${amountUsd} usd)`);
  log("Fee:");
  log(`   -> ${fee} (${feeUsd} usd)`);
  log("Fee rate:");
  log(`   -> ${feeRate} ${feeRateUnit}`);
  log("Balance after transaction:");
  log(`   -> ${balance} (${balanceCoins} ${blockchain}) (${balanceUsd} usd)`);
  log("-------------------------------------------\n");
};
