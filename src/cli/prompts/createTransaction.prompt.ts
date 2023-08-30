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

  let feeRateUnit;

  switch (blockchain) {
    case Blockchains.BTC:
      feeRateUnit = new TransactionBTC({} as any).feeRateUnit;
      break;
    case Blockchains.ETH:
      feeRateUnit = new TransactionETH({} as any).feeRateUnit;
      break;
  }

  inq
    .prompt([
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
      {
        name: "feeRate",
        message: `3)What fee you want to pay (${feeRateUnit})\n->`,
        type: "input",
      },
    ])
    .then(async ({ address, value, feeRate }) => {
      let transaction: TransactionBTC | TransactionETH;
      switch (blockchain) {
        case Blockchains.BTC:
          transaction = new TransactionBTC(account as AccountBTC);
          break;
        case Blockchains.ETH:
          transaction = new TransactionETH(account as AccountETH);
          break;
      }
      try {
        const v = BigInt(Number(value) * Math.pow(10, decimals));
        await transaction.create(address, v, parseInt(feeRate));
        context.wallet.transaction = transaction;
        promptSendTransaction(context);
      } catch (err) {
        promptWalletMenu(context, () => boxedLog(err));
      }
    });
};
