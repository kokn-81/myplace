const SITE = "https://nia-web.com";

const usd = (value) =>
  Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export const PROJECTS = {
  gardenzen: {
    id: "gardenzen",
    title: "Garden Zen · Preventa Eco-Sostenible en Equipetrol Norte",
    description:
      "Departamentos eco-sostenibles con paneles solares y 50% menos expensas en Equipetrol Norte desde USD 56.672.",
    image: `${SITE}/garden_zen/fachada.jpg`,
    imageAlt: "Fachada de Garden Zen en Equipetrol Norte",
    imageWidth: 1125,
    imageHeight: 783,
    canonicalPath: "/gardenzen",
    appUrl: "/?proyecto=garden-zen",
  },
  ona: {
    id: "ona",
    title: "ONA Residences · Preventa en Los Cusis",
    description:
      "Departamentos de 1 y 2 dormitorios en Los Cusis desde USD 40.375. Arquitectura contemporánea y alta rentabilidad. Reserva con USD 2.000.",
    image: `${SITE}/ona/og-ona.jpg`,
    imageAlt: "ONA Residences en Los Cusis",
    imageWidth: 1200,
    imageHeight: 630,
    canonicalPath: "/ona",
    appUrl: "/?proyecto=ona",
  },
  eurodesign: {
    id: "eurodesign",
    title: "Tower Eurodesign · Preventa Exclusiva en Equipetrol Norte",
    description:
      "Departamentos premium en Equipetrol Norte desde USD 71.780. Torre de 18 niveles con obra gruesa al 100%.",
    image: `${SITE}/eurodesign/fachada-principal.jpg`,
    imageAlt: "Tower Eurodesign en Equipetrol Norte",
    canonicalPath: "/eurodesign",
    appUrl: "/?proyecto=eurodesign",
  },
  "domus-black": domus(
    "domus-black",
    "DOMUS Black",
    "Equipetrol Norte",
    45602,
    "/domus/domus_black/fachada_principal.jpg"
  ),
  "domus-gold": domus(
    "domus-gold",
    "DOMUS Gold",
    "Equipetrol / San Martín",
    53454,
    "/domus/domus_gold/fachada_torre.jpg"
  ),
  "domus-onix": domus(
    "domus-onix",
    "DOMUS Onix",
    "Equipetrol / Sirari",
    46647,
    "/domus/domus_onix/lobby_cafeteria.jpg"
  ),
  "domus-insignia": domus(
    "domus-insignia",
    "DOMUS Insignia",
    "Equipetrol / Los Tajibos",
    39060,
    "/domus/domus_insignia/brochure_p08.jpg"
  ),
  "domus-luxury": domus(
    "domus-luxury",
    "DOMUS Luxury",
    "Zona Norte / Las Brisas",
    42050,
    "/domus/domus_luxury/fachada_principal.jpg"
  ),
  "domus-tower": domus(
    "domus-tower",
    "DOMUS Tower",
    "Equipetrol Norte",
    48500,
    "/domus/domus_tower/fachada_principal.jpg"
  ),
  "domus-infinity": domus(
    "domus-infinity",
    "DOMUS Infinity",
    "Equipetrol / Los Tajibos",
    49500,
    "/domus/domus_infinity/fachada_principal.jpg"
  ),
};

function domus(id, name, zone, priceFrom, imagePath) {
  return {
    id,
    title: `${name} · Preventa en ${zone}`,
    description: `Departamentos en preventa en ${name} (${zone}) desde USD ${usd(priceFrom)}.`,
    image: `${SITE}${imagePath}`,
    imageAlt: `${name} en ${zone}`,
    canonicalPath: `/domus/${id}`,
    appUrl: `/?proyecto=${id}`,
  };
}

const PATH_ALIASES = {
  gardenzen: "gardenzen",
  "garden-zen": "gardenzen",
  zen: "gardenzen",
  garden: "gardenzen",
  ona: "ona",
  "ona-residences": "ona",
  eurodesign: "eurodesign",
  "euro-design": "eurodesign",
  "domus-lux": "domus-luxury",
};

function fromQuery(value) {
  const q = String(value || "").trim().toLowerCase();
  if (!q) return null;
  if (PATH_ALIASES[q]) return PROJECTS[PATH_ALIASES[q]];
  if (q.includes("garden") || q === "zen") return PROJECTS.gardenzen;
  if (q.includes("ona")) return PROJECTS.ona;
  if (q.includes("euro")) return PROJECTS.eurodesign;
  if (PROJECTS[q]) return PROJECTS[q];
  if (q.includes("domus")) return PROJECTS["domus-black"];
  return null;
}

export function projectFromUrl(url) {
  const path = (url.pathname || "/").toLowerCase().replace(/\/+$/, "") || "/";
  const queryProject =
    url.searchParams.get("proyecto") || url.searchParams.get("project") || url.searchParams.get("p");
  const parts = path.split("/").filter(Boolean);
  const head = parts[0] || "";

  if (head === "domus") {
    return fromQuery(parts[1]) || fromQuery(queryProject) || PROJECTS["domus-black"];
  }

  if (head && PATH_ALIASES[head]) return PROJECTS[PATH_ALIASES[head]];
  if (head && PROJECTS[head]) return PROJECTS[head];
  return fromQuery(queryProject);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export function projectOgHtml(project, requestUrl) {
  const title = escapeHtml(project.title);
  const description = escapeHtml(project.description);
  const image = escapeHtml(project.image);
  const alt = escapeHtml(project.imageAlt);
  const canonical = escapeHtml(requestUrl || `${SITE}${project.canonicalPath}`);
  const size = project.imageWidth
    ? `<meta property="og:image:width" content="${project.imageWidth}" />
  <meta property="og:image:height" content="${project.imageHeight}" />`
    : "";

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="N.I.A" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:type" content="image/jpeg" />
  ${size}
  <meta property="og:image:alt" content="${alt}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
</head>
<body>
  <p><a href="${escapeHtml(project.appUrl)}">${title}</a></p>
</body>
</html>`;
}

export const BOT_UA =
  /facebookexternalhit|facebot|whatsapp|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|applebot|googlebot|bingbot|curl|wget/i;
