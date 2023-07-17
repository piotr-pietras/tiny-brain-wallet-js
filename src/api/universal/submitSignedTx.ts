import https from "https";
import { BLOCK_DEAMON_HOST, BLOCK_DEAMON_TOKEN } from "../api.const.js";

interface Response {
  id: string;
}

export const submitSignedTx = (
  tx: string,
  params: [string, string]
): Promise<Response> => {
  const toSend = JSON.stringify({ tx });
  const options: https.RequestOptions = {
    ...BLOCK_DEAMON_HOST,
    path: `/universal/v1/${params[0]}/${params[1]}/tx/send`,
    method: "POST",
    headers: {
      accept: "application/json",
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

    req.on("error", (err) => reject(err));
    req.write(toSend);
    req.end();
  });
};
