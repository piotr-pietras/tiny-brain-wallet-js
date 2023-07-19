import inq from "inquirer";
import { Context } from "../context.js";
import { boxedLog, printWelcome } from "../printable.js";
import { promptSendTransaction } from "./sendTransaction.prompt.js";
import { promptWalletMenu } from "./walletMenu.prompt.js";
import { TransactionBTC } from "../../utils/TransactionBTC.js";
import { TransactionETH } from "../../utils/TransactionETH.js";
import { Blockchains } from "../../common/blockchain.types.js";
import { AccountBTC } from "../../utils/AccountBTC.js";
import { AccountETH } from "../../utils/AccountETH.js";

export const promptCreateTransaction = (context: Context) => {
  console.clear();
  printWelcome();

  const { account } = context.wallet;
  const { decimals, blockchain } = account;

  inq
    .prompt([
      {
        name: "address",
        message: "1)Paste your output address",
        type: "input",
      },
      {
        name: "value",
        message: "2)How much do you want to send",
        type: "input",
      },
    ])
    .then(async ({ address, value }) => {
      let transaction: TransactionBTC | TransactionETH;
      switch (blockchain) {
        case Blockchains.BTC:
          transaction = new TransactionBTC(account as AccountBTC);
          break;
        case Blockchains.ETH:
          transaction = new TransactionETH(account as AccountETH);
          break;
      }
      try {
        const v = (parseFloat(value) * Math.pow(10, decimals)).toFixed(0);
        await transaction.create(address, parseInt(v), "fast");
        context.wallet.transaction = transaction;
        promptSendTransaction(context);
      } catch (err) {
        promptWalletMenu(context, () => boxedLog(err));
      }
    });
};
