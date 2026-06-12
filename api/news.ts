import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");
  try {
    const q = req.query.q as string;
    if (!q) return res.status(400).json({ error: "q is required" });

    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ja&gl=JP&ceid=JP:ja`;
    const r = await fetch(rssUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; newsbot/1.0)" },
    });
    if (!r.ok) return res.status(r.status).json({ error: "RSS fetch failed" });

    const xml = await r.text();

    // <item> ブロックを抽出
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 5);

    const articles = items.map((m) => {
      const block = m[1];
      const title = decode(extract(block, "title"));
      const link  = extract(block, "link") || extractCdata(block, "link");
      const pubDate = extract(block, "pubDate");
      const source = extract(block, "source") || extractAttr(block, "source", "url");
      // Google News のリンクは実際の記事URLにリダイレクトされる
      return {
        title,
        url: link,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source: { name: source || "Google News" },
        image: null,
      };
    });

    return res.status(200).json({ articles });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}

function extract(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`)
  ) || xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`));
  return m ? m[1].trim() : "";
}

function extractCdata(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`));
  return m ? m[1].trim() : "";
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*>`));
  return m ? m[1].trim() : "";
}

function decode(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
