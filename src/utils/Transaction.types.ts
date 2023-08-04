export type Priority = "fast" | "medium" | "slow";

export interface Transaction {
  txid: string;
  feeRate: number;
  fee: number;
  value: number;
  address: string;

  create: (address: string, value: number, feeRate: number) => Promise<this>;
  signAndSend: () => Promise<void>;
}


