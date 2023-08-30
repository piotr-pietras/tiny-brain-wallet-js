import inq from "inquirer";
import { Context } from "../context.js";
import { Blockchains, Net } from "../../common/blockchain.types.js";
import { promptWalletMenu } from "./walletMenu.prompt.js";
import { boxedLog, printWelcome } from "../printable.js";
import { AccountBTC } from "../../utils/AccountBTC.js";
import { AccountETH } from "../../utils/AccountETH.js";
import { phraseMixer } from "../../utils/phraseMixer.js";

export const promptLoginToWallet = (context: Context) => {
  console.clear();
  printWelcome();

  inq
    .prompt([
      {
        name: "blockchain",
        message: "1)Choose blockchain wallet",
        type: "list",
        choices: Object.values(Blockchains),
      },
      {
        name: "net",
        message: "2)Choose net",
        type: "list",
        choices: Object.values(Net),
      },
      {
        name: "phrase",
        message: "3)Type your phrases\n->",
        type: "input",
      },
      {
        name: "mix",
        message: "4)Type your mix number (bigger than 10^4)\n->",
        type: "input",
      },
    ])
    .then(async ({ blockchain, net, phrase, mix }) => {
      let account: AccountBTC | AccountETH;
      const mixedPhrase = phraseMixer(phrase, mix, (i, iteration) => {
        console.clear();
        printWelcome();
        boxedLog(`${Math.ceil((i / iteration) * 100)}%`);
      });
      switch (blockchain) {
        case Blockchains.BTC:
          account = new AccountBTC(mixedPhrase, net);
          break;
        case Blockchains.ETH:
          account = new AccountETH(mixedPhrase, net);
          break;
      }
      await account.initizalize();
      context.wallet = { account };
      promptWalletMenu(context);
    });
};
