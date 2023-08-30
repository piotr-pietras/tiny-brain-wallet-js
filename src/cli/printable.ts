import { Blockchains, Net } from "../common/blockchain.types.js";
import { Account } from "../utils/Account.types.js";
import { Transaction } from "../utils/Transaction.types.js";
import { TransferERC20 } from "../utils/TransferERC20.js";

export const log = console.log;

export const boxedLog = (line: any, startChar?: string) => {
  const s = startChar ? startChar : "-";
  log(`\n${s}-------------------------------------------`);
  log(line);
  log(`${s}-------------------------------------------\n`);
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
  const priceConfirmed = balance / BigInt(Math.pow(10, decimals));
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
  const { address, fee, value, feeRateUnit, feeRate } = transaction;
  const amountCoins = parseFloat(value.toString()) / Math.pow(10, decimals);
  const amountUsd = (
    (parseFloat(value.toString()) * marketPrice) /
    Math.pow(10, decimals)
  ).toFixed(2);
  const feeUsd = (
    (parseFloat(fee.toString()) * marketPrice) /
    Math.pow(10, decimals)
  ).toFixed(2);
  const diff = balance - value - fee;
  const balanceCoins = (
    parseFloat(diff.toString()) / Math.pow(10, decimals)
  ).toFixed(4);
  const balanceUsd = (
    (parseFloat(diff.toString()) * marketPrice) /
    Math.pow(10, decimals)
  ).toFixed(2);

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

export const printMethodInfo = (
  account: Account,
  method: TransferERC20,
  ethMarketPrice: number
) => {
  const { decimals } = account;
  const { address, fee, value, feeRateUnit, feeRate, contractData } = method;
  const amountTokens = (
    parseFloat(value.toString()) / Math.pow(10, contractData.decimals)
  ).toFixed(4);

  const feeUsd = (
    (parseFloat(fee.toString()) * ethMarketPrice) /
    Math.pow(10, decimals)
  ).toFixed(2);

  log("\n-------------------------------------------");
  log("Your tx was created successfully!");
  log("Check address, value and fee TWICE before sign!");
  log("-------------------------------------------");
  log("Destination:");
  log(`   -> ${address}`);
  log("Amount:");
  log(`   -> ${value} (${amountTokens} ${contractData.name})`);
  log("Fee:");
  log(`   -> ${fee} (${feeUsd} usd)`);
  log("Fee rate:");
  log(`   -> ${feeRate} ${feeRateUnit}`);
  log("-------------------------------------------\n");
};

export const printWebsite = (account: Account) => {
  const more = "More about your wallet can be faound here: \n";
  if (account.blockchain === Blockchains.ETH) {
    if (account.net === Net.TEST)
      boxedLog(
        `${more}https://goerli.etherscan.io/address/${account.address}`,
        "?"
      );
    if (account.net === Net.MAIN)
      boxedLog(`${more}https://etherscan.io/address/${account.address}`, "?");
  }
  if (account.blockchain === Blockchains.BTC) {
    if (account.net === Net.TEST)
      boxedLog(
        `${more}https://mempool.space/testnet/address/${account.address}`,
        "?"
      );
    if (account.net === Net.MAIN)
      boxedLog(`${more}https://mempool.space/address/${account.address}`, "?");
  }
};
