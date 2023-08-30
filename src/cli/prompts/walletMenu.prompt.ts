import inq from "inquirer";
import { Context } from "../context.js";
import { promptMainMenu } from "./mainMenu.prompt.js";
import {
  boxedLog,
  printBalance,
  printKeys,
  printWebsite,
  printWelcome,
} from "../printable.js";
import { promptCreateTransaction } from "./createTransaction.prompt.js";
import { Blockchains } from "../../common/blockchain.types.js";
import { AccountBTC } from "../../utils/AccountBTC.js";
import { promptCreateMethod } from "./createMethod.prompt.js";

enum ChoicesCommon {
  TRANSACTION = "Make transaction",
  BALANCE = "Check balance",
  KEYS = "Show your keys (unsafe)",
  LOGOUT = "Logout",
}
enum ChoicesBTC {
  UTXOS = "List all utxos",
}
enum ChoicesETH {
  ERC20 = "Call ERC20 method",
}
type Choices = (ChoicesCommon | ChoicesBTC | ChoicesETH)[];

const getChoices = (blockchain: Blockchains) => {
  const choices: Choices = [...Object.values(ChoicesCommon)];
  blockchain === Blockchains.BTC &&
    choices.splice(2, 0, ...Object.values(ChoicesBTC));
  blockchain === Blockchains.ETH &&
    choices.splice(1, 0, ...Object.values(ChoicesETH));
  return choices;
};

export const promptWalletMenu = async (
  context: Context,
  before?: () => void
) => {
  console.clear();
  printWelcome();
  before && before();

  const { account } = context.wallet;
  const { blockchain, net, address, keysHex } = account;
  const utxos = blockchain === Blockchains.BTC && (account as AccountBTC).utxos;
  printWebsite(account);

  inq
    .prompt([
      {
        name: "wallet",
        message: `${blockchain}-${net} => address: ${address}`,
        type: "list",
        choices: getChoices(blockchain),
      },
    ])
    .then(async ({ wallet }) => {
      switch (wallet) {
        case ChoicesCommon.TRANSACTION:
          promptCreateTransaction(context);
          break;
        case ChoicesETH.ERC20:
          await account.initizalize();
          promptCreateMethod(context);
          break;
        case ChoicesCommon.BALANCE:
          await account.initizalize();
          promptWalletMenu(context, () => printBalance(account));
          break;
        case ChoicesBTC.UTXOS:
          await account.initizalize();
          promptWalletMenu(context, () => boxedLog(utxos));
          break;
        case ChoicesCommon.KEYS:
          promptWalletMenu(context, () => printKeys(keysHex));
          break;
        case ChoicesCommon.LOGOUT:
          promptMainMenu(context);
          break;
      }
    });
};
