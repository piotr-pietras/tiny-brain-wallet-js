import { erc20Abi } from "./erc20.abi.js";
import { ContractData } from "./erc20.types.js";

enum Token {
  USDC = "usdc",
}

export const erc20: { [keys in Token]: ContractData } = {
  usdc: {
    name: "USDC",
    abi: erc20Abi,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
  },
};
