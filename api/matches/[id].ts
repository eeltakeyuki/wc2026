import type { VercelRequest, VercelResponse } from "@vercel/node";
import { proxyRequest } from "../_lib";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  return proxyRequest(`/matches/${id}/head2head`, res);
}
