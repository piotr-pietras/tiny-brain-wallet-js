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

enum Choices {
  TRANSACTION = "Make transaction",
  BALANCE = "Check balance",
  UTXOS = "List all utxos",
  KEYS = "Show your keys (unsafe)",
  LOGOUT = "Logout",
}

export const promptWalletMenu = (context: Context, before?: () => void) => {
  console.clear();
  printWelcome();
  before && before();

  const { account } = context.wallet;
  const { blockchain, net, decimals, balance, address, keysHex, utxos } =
    account;

  inq
    .prompt<{ wallet: Choices }>([
      {
        name: "wallet",
        message: `${blockchain}-${net} => address: ${address}`,
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
          await account.initizalize();
          promptWalletMenu(context, () =>
            printBalance(balance, decimals, blockchain)
          );
          break;
        case Choices.UTXOS:
          await account.initizalize();
          promptWalletMenu(context, async () => boxedLog(utxos));
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
