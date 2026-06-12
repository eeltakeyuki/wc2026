import type { VercelResponse } from "@vercel/node";

export async function proxyRequest(path: string, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API_KEY is not configured" });
    }
    const upstream = `https://api.football-data.org/v4${path}`;
    const upstreamRes = await fetch(upstream, {
      headers: { "X-Auth-Token": apiKey },
    });
    const data = await upstreamRes.json();
    return res.status(upstreamRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
