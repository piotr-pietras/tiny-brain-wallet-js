import { getInitContext } from "./context.js";
import { promptMainMenu } from "./prompts/mainMenu.prompt.js";

console.clear();
promptMainMenu(getInitContext());
