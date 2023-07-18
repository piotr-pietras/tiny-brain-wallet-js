export type Priority = "fast" | "medium" | "slow";

export interface Transaction {
  fee: number;
  value: number;
  address: string;
  priority: Priority;

  create: (address: string, value: number, priority: Priority) => Promise<this>;
  signAndSend: () => Promise<void>;
}
