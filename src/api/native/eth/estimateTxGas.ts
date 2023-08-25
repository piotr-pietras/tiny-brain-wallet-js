import https from "https";
import { BLOCK_DEAMON_TOKEN, BLOCK_DEAMON_HOST } from "../../api.const.js";
import { TransactionRequest } from "ethers";

export const estimateTxGas = (
  tx: TransactionRequest,
  params: [string, string]
): Promise<{ result: string }> => {
  const toSend = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "eth_estimateGas",
    params: [tx, "latest"],
  });
  const options: https.RequestOptions = {
    ...BLOCK_DEAMON_HOST,
    path: `/ethereum/${params[1]}/native`,
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-API-Key": BLOCK_DEAMON_TOKEN,
    },
  };

  return new Promise((resolver, reject) => {
    const req = https.request(options, (res) => {
      let data = Buffer.from([]);
      res.on("data", (chunk) => (data = Buffer.concat([data, chunk])));
      res.on("end", () => {
        const json = JSON.parse(data.toString());
        if (json?.status) reject(json);
        resolver(json);
      });
    });

    req.write(toSend);
    req.on("error", (err) => reject(err));
    req.end();
  });
};
