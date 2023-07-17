import inq from "inquirer";
import { Context } from "../context.js";
import { boxedLog, printWelcome } from "../printable.js";
import { promptSendTransaction } from "./sendTransaction.prompt.js";
import { promptWalletMenu } from "./walletMenu.prompt.js";
import { TransactionBTC } from "../../utils/TransactionBTC.js";

export const promptCreateTransaction = (context: Context) => {
  console.clear();
  printWelcome();

  const { account } = context.wallet;
  const { decimals } = account;

  inq
    .prompt<{ address: string; value: string }>([
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
      const transaction = new TransactionBTC(account);
      try {
        const v = (parseFloat(value) * Math.pow(10, decimals)).toFixed(0);
        await transaction.create(address, parseInt(v), "medium");
        context.wallet.transaction = transaction;
        promptSendTransaction(context);
      } catch (err) {
        promptWalletMenu(context, () => boxedLog(err));
      }
    });
};
