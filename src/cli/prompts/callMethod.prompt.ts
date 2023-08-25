import inq from "inquirer";
import { Context } from "../context.js";
import { boxedLog, printMethodInfo, printWelcome } from "../printable.js";
import { promptWalletMenu } from "./walletMenu.prompt.js";
import { Blockchains } from "../../common/blockchain.types.js";
import { getMarketPrice } from "../../api/market/getMarketPrice.js";

export const promptCallMethod = async (context: Context) => {
  console.clear();
  printWelcome();

  const { account, method } = context.wallet;
  const ethMarketPrice = (await getMarketPrice(Blockchains.ETH)).price;
  console.log(ethMarketPrice);

  printMethodInfo(account, method, ethMarketPrice);

  inq
    .prompt([
      {
        name: "confirm",
        message: "Are you sure to call this method?",
        type: "confirm",
      },
    ])
    .then(async ({ confirm }) => {
      if (confirm) {
        try {
          await method.signAndSend();
          promptWalletMenu(context, () =>
            boxedLog(`Transaction signed!\ntxid:\n   -> ${method.txid}`)
          );
        } catch (err) {
          promptWalletMenu(context, () => boxedLog(err));
        }
      } else {
        promptWalletMenu(context, () => boxedLog("Transaction canceled"));
      }
    });
};
