import https from "https";
import { BLOCK_DEAMON_TOKEN, BLOCK_DEAMON_HOST } from "../../api.const.js";

export const getTxCount = (
  address: string,
  params: [string, string]
): Promise<{ result: string }> => {
  const toSend = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "eth_getTransactionCount",
    params: [address, "latest"],
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
        if (json?.error) reject(json);
        resolver(json);
      });
    });

    req.write(toSend);
    req.on("error", (err) => reject(err));
    req.end();
  });
};
