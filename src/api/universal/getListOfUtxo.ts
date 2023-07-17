import https from "https";
import { BLOCK_DEAMON_HOST, BLOCK_DEAMON_TOKEN } from "../api.const.js";

type ScriptType =
  | "witness_v0_keyhash"
  | "witness_v1_taproot"
  | "scripthash"
  | "pubkeyhash";

interface Response {
  data: {
    status: string;
    value: number;
    mined?: {
      index: number;
      tx_id: string;
      meta: {
        script_type: ScriptType;
      };
    };
  }[];
  meta?: {
    paging?: {
      next_page_token: string;
    };
  };
}

export const getListOfTx = (
  address: string,
  params: [string, string],
  pageToken?: string
): Promise<Response> => {
  const query = pageToken ? `&page_token=${pageToken}` : "";
  const options: https.RequestOptions = {
    ...BLOCK_DEAMON_HOST,
    path: `/universal/v1/${params[0]}/${params[1]}/account/${address}/utxo?page_size=100&spent=false${query}`,
    method: "GET",
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
    req.end();
  });
};
