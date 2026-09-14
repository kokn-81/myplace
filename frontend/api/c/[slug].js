export default async function handler(req, res) {
  const slug = encodeURIComponent(String(req.query.slug || "").trim());
  const apiBase = process.env.VITE_API_BASE_URL || "http://localhost:8010/api";
  const origin = apiBase.replace(/\/api\/?$/, "");
  try {
    const response = await fetch(`${origin}/c/${slug}`);
    const html = await response.text();
    res.status(response.status);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.send(html);
  } catch {
    res.status(502).send("No pude abrir esa consulta.");
  }
}
