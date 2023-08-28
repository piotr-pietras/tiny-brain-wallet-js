export type Priority = "fast" | "medium" | "slow";

export interface Transaction {
  txid: string;
  feeRate: number;
  feeRateUnit: string;
  fee: bigint;
  value: bigint;
  address: string;

  create: (address: string, value: string, feeRate: number) => Promise<this>;
  signAndSend: () => Promise<void>;
}
