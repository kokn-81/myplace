export const CONTACT_WHATSAPP_NUMBER = "59157015854";
export const PUBLIC_SITE_URL = "https://nia-web.com";

export const PLAZO_OPTIONS = ["esta semana", "30 días", "3 meses", "sin apuro"] as const;
export type PlazoOption = (typeof PLAZO_OPTIONS)[number];

const clean = (value?: string | number | null) => String(value ?? "").trim();

export const plazoToPhrase = (plazo?: string | null) => {
  const value = clean(plazo).toLowerCase();
  if (value === "esta semana") return "para esta semana";
  if (value === "30 dias" || value === "30 días") return "para este mes";
  if (value === "3 meses") return "para los próximos 3 meses";
  if (value === "sin apuro") return "sin apuro";
  return "";
};

const appendPlazo = (line: string, phrase: string) => {
  if (!phrase) return `${line}:`;
  if (phrase === "sin apuro") return `${line}, ${phrase}:`;
  return `${line} ${phrase}:`;
};

export const buildContextUrl = (slug: string, siteUrl = PUBLIC_SITE_URL) =>
  `${siteUrl.replace(/\/$/, "")}/c/${clean(slug)}`;

export const buildWhatsappMessage = ({
  propertyRef,
  zona,
  operacion,
  presupuesto,
  plazo,
  slug,
  siteUrl = PUBLIC_SITE_URL,
}: {
  propertyRef?: string | number | null;
  zona?: string | null;
  operacion?: string | null;
  presupuesto?: string | null;
  plazo?: string | null;
  slug: string;
  siteUrl?: string;
}) => {
  const ref = clean(propertyRef).replace(/^#/, "");
  const zone = clean(zona);
  const operation = clean(operacion);
  const budget = clean(presupuesto);
  const phrase = plazoToPhrase(plazo);
  const url = buildContextUrl(slug, siteUrl);
  const lines = ["Hola, vengo de NIA."];

  if (ref) {
    let line = `Me interesa la REF ${ref}`;
    if (zone) line += ` en ${zone}`;
    const bits = [operation, budget].filter(Boolean);
    if (bits.length) line += ` (${bits.join(", ")})`;
    lines.push(appendPlazo(line, phrase));
  } else {
    let line = operation ? `Busco ${operation}` : "Busco un inmueble";
    if (zone) line += ` en ${zone}`;
    if (budget) line += `, presupuesto ${budget}`;
    lines.push(appendPlazo(line, phrase));
  }

  lines.push(url);
  return lines.join("\n");
};

export const buildWhatsappUrl = (text: string, phone = CONTACT_WHATSAPP_NUMBER) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
