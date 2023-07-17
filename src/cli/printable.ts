export const log = console.log;

export const boxedLog = (line: any) => {
  log("\n-------------------------------------------");
  log(line);
  log("-------------------------------------------\n");
};

export const printWelcome = () => {
  log("Welcome to TinyBrainWallet");
  log(`
    /\\_____/\\
   /  o   o  \\
  ( ==  ^  == )
   )         (
  (           )
 ( (  )   (  ) )
(__(__)___(__)__)`);
  log("");
};

export const printKeys = (keys: { priv: string; pub: string }) => {
  log("\n-------------------------------------------");
  log(`Private Key: \n->${keys.priv} `);
  log(`Public Key (uncompressed): \n->${keys.pub}`);
  log("-------------------------------------------\n");
};

export const printBalance = (
  balance: number,
  decimals: number,
  name: string
) => {
  log("\n-------------------------------------------");
  log(`Balance: ${balance} (${balance / Math.pow(10, decimals)} ${name})`);
  log("-------------------------------------------\n");
};

export const printTransactionInfo = (info: {
  balance: number;
  value: number;
  fees: number;
}) => {
  const { balance, value, fees } = info;
  log("-------------------------------------------");
  log("Your TX object was created successfully!");
  log("Check address, value and fees TWICE!");
  log("-------------------------------------------");
  log(`Current balance: \n -> ${balance}`);
  log(`Output: \n -> ${value}`);
  log(`Fees: \n -> ${fees}`);
  log(`Balance after transaction: \n -> ${balance - value - fees}`);
  log("-------------------------------------------");
};
