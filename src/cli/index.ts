import { Net } from "../common/blockchain.types.js";
import { AccountETH } from "../utils/AccountETH.js";
import { TransactionETH } from "../utils/TransactionETH.js";
import { getInitContext } from "./context.js";
import { promptMainMenu } from "./prompts/mainMenu.prompt.js";

// console.clear();
// promptMainMenu(getInitContext());

async function test() {
  const eth1 = new AccountETH("test1", Net.TEST);
  const eth2 = new AccountETH("test2", Net.TEST);
  await eth1.initialize();
  const tx = new TransactionETH(eth1);
  await tx.create(eth2.wallet.address, 10000, "fast");
  await tx.signAndSend();
}

test();
