import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API_KEY not set" });

    const id = req.query.id as string;
    const r = await fetch(`https://api.football-data.org/v4/matches/${id}/head2head`, {
      headers: { "X-Auth-Token": apiKey },
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
