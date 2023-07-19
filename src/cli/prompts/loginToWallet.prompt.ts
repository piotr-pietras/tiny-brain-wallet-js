import inq from "inquirer";
import { Context } from "../context.js";
import { Blockchains, Net } from "../../common/blockchain.types.js";
import { promptWalletMenu } from "./walletMenu.prompt.js";
import { printWelcome } from "../printable.js";
import { AccountBTC } from "../../utils/AccountBTC.js";
import { AccountETH } from "../../utils/AccountETH.js";

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
        message: "3)Type phrases",
        type: "input",
      },
    ])
    .then(async ({ blockchain, net, phrase }) => {
      let account: AccountBTC | AccountETH;
      switch (blockchain) {
        case Blockchains.BTC:
          account = new AccountBTC(phrase, net);
          break;
        case Blockchains.ETH:
          account = new AccountETH(phrase, net);
          break;
      }
      await account.initizalize();
      context.wallet = { account };
      promptWalletMenu(context);
    });
};
