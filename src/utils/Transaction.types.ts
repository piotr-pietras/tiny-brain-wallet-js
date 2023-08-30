export interface Transaction {
  txid: string;
  feeRate: number;
  feeRateUnit: string;
  fee: bigint;
  value: bigint;
  address: string;

  create: (address: string, value: bigint, feeRate: number) => Promise<this>;
  signAndSend: () => Promise<void>;
}
