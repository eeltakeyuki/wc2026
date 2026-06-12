import type { VercelRequest, VercelResponse } from "@vercel/node";
import { proxyRequest } from "../../_lib";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return proxyRequest("/competitions/WC/matches", res);
}
