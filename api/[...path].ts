import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API_KEY is not configured" });
  }

  // /api/competitions/WC/matches → /competitions/WC/matches
  const path = ("/" + (Array.isArray(req.query.path) ? req.query.path.join("/") : req.query.path ?? ""));
  const query = new URLSearchParams(req.query as Record<string, string>);
  query.delete("path");
  const qs = query.toString();

  const upstream = `https://api.football-data.org/v4${path}${qs ? "?" + qs : ""}`;

  const upstream_res = await fetch(upstream, {
    headers: { "X-Auth-Token": apiKey },
  });

  const data = await upstream_res.json();
  res.status(upstream_res.status).json(data);
}
