import inq from "inquirer";
import { Context } from "../context.js";
import { promptMainMenu } from "./mainMenu.prompt.js";
import {
  boxedLog,
  printBalance,
  printKeys,
  printWelcome,
} from "../printable.js";
import { promptCreateTransaction } from "./createTransaction.prompt.js";
import { Blockchains } from "../../common/blockchain.types.js";

enum Choices {
  TRANSACTION = "Make transaction",
  BALANCE = "Check balance",
  KEYS = "Show your keys (unsafe)",
  LOGOUT = "Logout",
}

export const promptWalletMenu = (context: Context, before?: () => void) => {
  console.clear();
  printWelcome();
  before && before();

  const { blockchain, net, decimals, balance, addressP2PKH, keysHex } =
    context.wallet.account;

  inq
    .prompt<{ wallet: Choices }>([
      {
        name: "wallet",
        message: `${blockchain}-${net} => address: ${addressP2PKH}`,
        type: "list",
        choices: Object.values(Choices),
      },
    ])
    .then(async ({ wallet }) => {
      switch (wallet) {
        case Choices.TRANSACTION:
          promptCreateTransaction(context);
          break;
        case Choices.BALANCE:
          promptWalletMenu(context, () =>
            printBalance(balance, decimals, blockchain)
          );
          break;
        case Choices.KEYS:
          promptWalletMenu(context, () => printKeys(keysHex));
          break;
        case Choices.LOGOUT:
          promptMainMenu(context);
          break;
      }
    });
};
