import { erc20Abi } from "./erc20.abi.js";
import { ContractData } from "./erc20.types.js";

enum TokenTest {
  USDC = "usdc",
}

export const erc20Test: { [keys in TokenTest]: ContractData } = {
  usdc: {
    name: "USDC test",
    abi: erc20Abi,
    address: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
    decimals: 6,
  },
};
