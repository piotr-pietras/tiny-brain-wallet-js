import inq from "inquirer";
import { Context } from "../context.js";
import { boxedLog, printTransactionInfo, printWelcome } from "../printable.js";
import { promptWalletMenu } from "./walletMenu.prompt.js";
import { getMarketPrice } from "../../api/market/getMarketPrice.js";

export const promptSendTransaction = async (context: Context) => {
  console.clear();
  printWelcome();

  const { account, transaction } = context.wallet;
  const marketPrice = (await getMarketPrice(account.blockchain)).price;

  printTransactionInfo(account, transaction, marketPrice);

  inq
    .prompt([
      {
        name: "confirm",
        message: "Are you sure to sign this transaction?",
        type: "confirm",
      },
    ])
    .then(async ({ confirm }) => {
      if (confirm) {
        try {
          await transaction.signAndSend();
        } catch (err) {
          promptWalletMenu(context, () => boxedLog(err));
        }
        promptWalletMenu(context, () =>
          boxedLog(`Transaction signed!\ntxid:\n   -> ${transaction.txid}`)
        );
      } else {
        promptWalletMenu(context, () => boxedLog("Transaction canceled"));
      }
    });
};
