import { BOT_UA, PROJECTS, projectFromUrl, projectOgHtml } from "../ogProjects.js";

function projectFromHint(value) {
  const hinted = String(value || "").trim().toLowerCase();
  if (!hinted) return null;
  if (PROJECTS[hinted]) return PROJECTS[hinted];
  return projectFromUrl(new URL(`https://nia-web.com/?proyecto=${encodeURIComponent(hinted)}`));
}

export default function handler(req, res) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "nia-web.com";
  const proto = req.headers["x-forwarded-proto"] || "https";
  const query = req.query || {};
  const requestUrl = `${proto}://${host}${req.url || "/"}`;
  const project =
    projectFromHint(query.project) ||
    projectFromHint(query.proyecto) ||
    projectFromHint(query.p) ||
    projectFromUrl(new URL(requestUrl));

  if (!project) {
    res.writeHead(307, { Location: "/" });
    res.end();
    return;
  }

  const ua = req.headers["user-agent"] || "";
  if (!BOT_UA.test(ua)) {
    res.writeHead(307, { Location: project.appUrl });
    res.end();
    return;
  }

  const canonical = `${proto}://${host}${project.canonicalPath}`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=86400");
  res.status(200).send(projectOgHtml(project, canonical));
}
