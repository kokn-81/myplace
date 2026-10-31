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

export function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function projectByKey(value) {
  const key = String(value || "").trim().toLowerCase();
  if (!key) return null;
  if (PROJECTS[key]) return PROJECTS[key];
  if (PATH_ALIASES[key]) return PROJECTS[PATH_ALIASES[key]] || null;
  return null;
}

function catalogImages(item) {
  const list = [];
  if (Array.isArray(item.images)) list.push(...item.images);
  if (Array.isArray(item.imagenes)) list.push(...item.imagenes);
  if (typeof item.imagenes === "string") list.push(...item.imagenes.split(","));
  if (item.imagen_url) list.push(item.imagen_url);
  return list;
}

function catalogImage(item) {
  for (const raw of catalogImages(item)) {
    const url = String(raw || "").trim();
    if (!url || /\.(mp4|webm|mov|m4v|pdf)(\?|$)/i.test(url)) continue;
    if (url.startsWith("https://")) return url;
    if (url.startsWith("http://")) return `https://${url.slice("http://".length)}`;
    if (url.startsWith("/")) return `${SITE}${url}`;
  }
  return "";
}

export function projectFromCatalogItem(item, slug) {
  if (!item) return null;
  const id = String(item.id ?? "").trim();
  const title = String(item.titulo || item.title || "").trim();
  if (!id || !title) return null;

  const zone = String(item.zona || item.ciudad || item.complejo_nombre || item.complejoNombre || "").trim();
  const price = Number(item.precio_usd ?? item.precio ?? 0);
  const requested = slugify(slug) || id;
  const bits = [];
  if (zone) bits.push(zone);
  if (price > 0) bits.push(`desde USD ${usd(price)}`);
  let description = bits.join(" · ");
  const blurb = String(item.descripcion || item.description || "").replace(/\s+/g, " ").trim();
  if (blurb) description = description ? `${description}. ${blurb}` : blurb;

  return {
    id,
    title,
    description: (description || title).slice(0, 220),
    image: catalogImage(item),
    imageAlt: title,
    canonicalPath: `/proyecto/${requested}`,
    appUrl: `/?proyecto=${encodeURIComponent(id)}`,
  };
}

export function findCatalogItem(items, slug) {
  const key = String(slug || "").trim().toLowerCase();
  const slugKey = slugify(slug);
  if (!key || !Array.isArray(items)) return null;

  const byId = items.find((item) => String(item.id) === key);
  if (byId) return byId;

  const matches = items.filter((item) => {
    const title = slugify(item.titulo || item.title || "");
    const complejo = slugify(item.complejo_nombre || item.complejoNombre || "");
    return (title && title === slugKey) || (complejo && complejo === slugKey);
  });
  if (matches.length === 0) return null;
  return (
    matches.find((item) => /proyecto|preventa/i.test(String(item.tipo_inmueble || item.type || ""))) ||
    matches[0]
  );
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
  const image = project.image ? escapeHtml(project.image) : "";
  const alt = escapeHtml(project.imageAlt || project.title);
  const canonical = escapeHtml(requestUrl || `${SITE}${project.canonicalPath}`);
  const size = project.imageWidth
    ? `<meta property="og:image:width" content="${project.imageWidth}" />
  <meta property="og:image:height" content="${project.imageHeight}" />`
    : "";
  const imageType = /\.png(\?|$)/i.test(project.image || "")
    ? "image/png"
    : /\.webp(\?|$)/i.test(project.image || "")
      ? "image/webp"
      : /\.gif(\?|$)/i.test(project.image || "")
        ? "image/gif"
        : "image/jpeg";
  const imageTags = image
    ? `<meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:type" content="${imageType}" />
  ${size}
  <meta property="og:image:alt" content="${alt}" />
  <meta name="twitter:image" content="${image}" />`
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
  ${imageTags}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
</head>
<body>
  <p><a href="${escapeHtml(project.appUrl)}">${title}</a></p>
</body>
</html>`;
}

export const BOT_UA =
  /facebookexternalhit|facebot|whatsapp|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|applebot|googlebot|bingbot|curl|wget/i;
