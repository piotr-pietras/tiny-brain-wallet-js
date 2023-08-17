export type Priority = "fast" | "medium" | "slow";

export interface Transaction {
  txid: string;
  feeRate: number;
  feeRateUnit: string;
  fee: number;
  value: string;
  address: string;

  create: (address: string, value: string, feeRate: number) => Promise<this>;
  signAndSend: () => Promise<void>;
}
