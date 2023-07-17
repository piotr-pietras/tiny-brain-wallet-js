import { Blockchains } from "../common/blockchain.types.js";
import { AccountBTC } from "../utils/AccountBTC.js";
import { TransactionBTC } from "../utils/TransactionBTC.js";

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
  log(`Private Key: \n->${keys.priv} `);
  log(`Public Key (uncompressed): \n->${keys.pub}`);
  log("-------------------------------------------\n");
};

export const printBalance = (
  balance: number,
  decimals: number,
  name: string
) => {
  log("\n-------------------------------------------");
  log(`Balance: ${balance} (${balance / Math.pow(10, decimals)} ${name})`);
  log("-------------------------------------------\n");
};

export const printTransactionInfo = (
  account: AccountBTC,
  transaction: TransactionBTC,
  marketPrice: number
) => {
  const { balance, blockchain, decimals } = account;
  const { address, fee, value } = transaction;
  const amountCoins = value / Math.pow(10, decimals);
  const amountUsd = ((value * marketPrice) / Math.pow(10, decimals)).toFixed(2);
  const feeCoins = fee / Math.pow(10, decimals);
  const feeUsd = ((fee * marketPrice) / Math.pow(10, decimals)).toFixed(2);
  const balanceCoins = (balance - value - fee) / Math.pow(10, decimals);
  const balanceUsd = (
    ((balance - value - fee) * marketPrice) /
    Math.pow(10, decimals)
  ).toFixed(2);

  log("-------------------------------------------");
  log("Your tx was created successfully!");
  log("Check address, value and fee TWICE before sign!");
  log("-------------------------------------------");
  log("Destination:");
  log(`   -> ${address}`);
  log("Amount:");
  log(`   -> ${value} (${amountCoins} ${blockchain}) (${amountUsd} usd)`);
  log("Fee:");
  log(`   -> ${fee} (${feeCoins} ${blockchain}) (${feeUsd} usd)`);
  log("Balance after transaction:");
  log(`   -> ${balance} (${balanceCoins} ${blockchain}) (${balanceUsd} usd)`);
  log("-------------------------------------------");
};
