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

  const choices = [
    {
      name: "address",
      message: "1)Paste your output address\n->",
      type: "input",
    },
    {
      name: "value",
      message: `2)How much do you want to send (x * 10^${decimals})\n->`,
      type: "input",
    },
  ];

  blockchain === Blockchains.BTC &&
    choices.push({
      name: "feeRate",
      message: "3)What fee you want to pay (sats/vB) (empty == default)\n->",
      type: "input",
    });

  inq.prompt(choices).then(async ({ address, value, feeRate }) => {
    let transaction: TransactionBTC | TransactionETH;
    switch (blockchain) {
      case Blockchains.BTC:
        transaction = new TransactionBTC(
          account as AccountBTC,
          feeRate && parseInt(feeRate)
        );
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

// mtM3NuQr71FSkn33xfdcSuN8PBTzYbQeSj;
