import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API_KEY is not configured" });
    }

    const segments = Array.isArray(req.query.path)
      ? req.query.path
      : [req.query.path ?? ""];
    const path = "/" + segments.join("/");

    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(req.query)) {
      if (k === "path") continue;
      query.set(k, String(v));
    }
    const qs = query.toString();
    const upstream = `https://api.football-data.org/v4${path}${qs ? "?" + qs : ""}`;

    const upstreamRes = await fetch(upstream, {
      headers: { "X-Auth-Token": apiKey },
    });

    const data = await upstreamRes.json();
    return res.status(upstreamRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
