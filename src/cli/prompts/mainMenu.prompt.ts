import inq from "inquirer";
import { Context } from "../context.js";
import { promptLoginToWallet } from "./loginToWallet.prompt.js";
import { printWelcome } from "../printable.js";

enum Choices {
  LOGIN = "Login to a wallet",
  EXIT = "Exit",
}

export const promptMainMenu = (context: Context) => {
  console.clear();
  printWelcome();

  inq
    .prompt<{ menu: Choices }>([
      {
        name: "menu",
        message: "What do you want to do?",
        type: "list",
        choices: Object.values(Choices),
      },
    ])
    .then(({ menu }) => {
      switch (menu) {
        case Choices.EXIT:
          break;
        case Choices.LOGIN:
          promptLoginToWallet(context);
          break;
      }
    });
};
