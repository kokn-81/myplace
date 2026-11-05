import {
  BOT_UA,
  findCatalogItem,
  projectByKey,
  projectFromCatalogItem,
  projectFromUrl,
  projectOgHtml,
} from "../ogProjects.js";

const API_BASE = (process.env.CATALOG_API_URL || process.env.VITE_API_BASE_URL || "https://myplace-2udd.onrender.com/api").replace(/\/$/, "");
let catalogCache = { at: 0, items: [] };

function varyByVisitor(res) {
  res.setHeader("Vary", "User-Agent");
  res.setHeader("CDN-Cache-Control", "no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");
}

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;
  return response.json();
}

async function projectFromCatalog(slug) {
  const key = String(slug || "").trim();
  if (!key || projectByKey(key)) return null;
  try {
    if (/^\d+$/.test(key)) {
      const item = await fetchJson(`${API_BASE}/inmuebles/${key}`);
      if (item && item.id != null) return projectFromCatalogItem(item, key);
    }

    if (!catalogCache.items.length || Date.now() - catalogCache.at > 5 * 60 * 1000) {
      const items = await fetchJson(`${API_BASE}/inmuebles/resumen`);
      if (Array.isArray(items)) catalogCache = { at: Date.now(), items };
    }

    const found = findCatalogItem(catalogCache.items, key);
    return found ? projectFromCatalogItem(found, key) : null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "nia-web.com";
  const proto = req.headers["x-forwarded-proto"] || "https";
  const query = req.query || {};
  const slug = String(query.project || query.proyecto || query.p || "");
  const requestUrl = `${proto}://${host}${req.url || "/"}`;
  const project =
    projectByKey(slug) ||
    (slug ? await projectFromCatalog(slug) : null) ||
    (slug ? null : projectFromUrl(new URL(requestUrl)));

  if (!project) {
    const ua = req.headers["user-agent"] || "";
    if (slug && BOT_UA.test(ua)) {
      const canonical = `${proto}://${host}/proyecto/${encodeURIComponent(slug)}`;
      varyByVisitor(res);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "private, max-age=60");
      res.status(200).send(projectOgHtml({
        title: "N.I.A",
        description: "Proyecto inmobiliario en Santa Cruz.",
        image: "",
        imageAlt: "N.I.A",
        canonicalPath: `/proyecto/${slug}`,
        appUrl: `/?proyecto=${encodeURIComponent(slug)}`,
      }, canonical));
      return;
    }
    varyByVisitor(res);
    res.writeHead(307, {
      Location: slug ? `/?proyecto=${encodeURIComponent(slug)}` : "/",
      "Cache-Control": "private, no-store",
    });
    res.end();
    return;
  }

  const ua = req.headers["user-agent"] || "";
  if (!BOT_UA.test(ua)) {
    varyByVisitor(res);
    res.writeHead(307, {
      Location: project.appUrl,
      "Cache-Control": "private, no-store",
    });
    res.end();
    return;
  }

  const canonical = `${proto}://${host}${project.canonicalPath}`;
  varyByVisitor(res);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "private, max-age=300");
  res.status(200).send(projectOgHtml(project, canonical));
}
