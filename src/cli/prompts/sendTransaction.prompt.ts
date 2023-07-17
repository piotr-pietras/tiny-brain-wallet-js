import inq from "inquirer";
import { Context } from "../context.js";
import { boxedLog, printWelcome } from "../printable.js";
import { promptWalletMenu } from "./walletMenu.prompt.js";

export const promptSendTransaction = (context: Context) => {
  console.clear();
  printWelcome();

  inq
    .prompt<{ confirm: boolean }>([
      {
        name: "confirm",
        message: "Are you sure to sign this transaction?",
        type: "confirm",
      },
    ])
    .then(async ({ confirm }) => {
      if (confirm) {
        try {
          await context.wallet.transaction.signAndSend();
        } catch (err) {
          promptWalletMenu(context, () => boxedLog(err));
        }
        promptWalletMenu(context, () => boxedLog("Transaction signed!"));
      } else {
        promptWalletMenu(context, () => boxedLog("Transaction canceled"));
      }
    });
};
