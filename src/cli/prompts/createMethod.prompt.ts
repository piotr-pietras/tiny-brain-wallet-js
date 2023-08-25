import inq from "inquirer";
import { Context } from "../context.js";
import { boxedLog, printWelcome } from "../printable.js";
import { promptWalletMenu } from "./walletMenu.prompt.js";
import { AccountETH } from "../../utils/AccountETH.js";
import { TransferERC20 } from "../../utils/TransferERC20.js";
import { erc20Test } from "../../common/erc20.test.js";
import { promptCallMethod } from "./callMethod.prompt.js";
import { erc20 } from "../../common/erc20.main.js";
import { Net } from "../../common/blockchain.types.js";

export const promptCreateMethod = (context: Context) => {
  console.clear();
  printWelcome();

  const feeRateUnit = new TransferERC20({} as any, {} as any).feeRateUnit;
  const { account } = context.wallet;
  const { net } = account;
  const tokens = net === Net.MAIN ? erc20 : erc20Test;

  inq
    .prompt([
      {
        name: "token",
        message: "1)Choose token",
        type: "list",
        choices: Object.keys(tokens),
      },
      {
        name: "method",
        message: "1)Choose method",
        type: "list",
        choices: ["transfer"],
      },
      {
        name: "address",
        message: "2)Paste your output address\n->",
        type: "input",
      },
      {
        name: "value",
        message: `3)How much tokens do you want to send\n->`,
        type: "input",
      },
      {
        name: "feeRate",
        message: `4)What fee you want to pay (${feeRateUnit})\n->`,
        type: "input",
      },
    ])
    .then(async ({ token, address, value, feeRate }) => {
      const method = new TransferERC20(account as AccountETH, tokens[token]);

      try {
        const v = (
          parseInt(value) * Math.pow(10, method.contractData.decimals)
        ).toFixed(0);
        await method.create(address, v, parseInt(feeRate));
        context.wallet.method = method;
        promptCallMethod(context);
      } catch (err) {
        promptWalletMenu(context, () => boxedLog(err));
      }
    });
};
