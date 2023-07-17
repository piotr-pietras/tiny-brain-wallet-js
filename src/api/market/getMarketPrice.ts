import https from "https";
import { BINANCE_HOST } from "../api.const.js";

export const getMarketPrice = (symbol: string): Promise<{ price: number }> => {
  const options: https.RequestOptions = {
    ...BINANCE_HOST,
    path: `/api/v3/avgPrice?symbol=${symbol.toUpperCase()}USDC`,
    method: "GET",
    headers: {
      accept: "application/json",
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

    req.on("error", (err) => reject(err));
    req.end();
  });
};
