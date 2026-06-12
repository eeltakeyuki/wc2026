import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");
  try {
    const gnewsKey = process.env.GNEWS_API_KEY;
    if (!gnewsKey) return res.status(500).json({ error: "GNEWS_API_KEY not set" });

    const q = req.query.q as string;
    if (!q) return res.status(400).json({ error: "q is required" });

    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=ja&max=5&token=${gnewsKey}`;
    const r = await fetch(url);
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
