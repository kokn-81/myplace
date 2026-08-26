export type SearchIntent = "rent" | "buy" | "both" | null;

const RENT_INTENT_TERMS = new Set(["alquiler", "alquilar", "renta", "rentar", "arriendo", "arrendar"]);
const BUY_INTENT_TERMS = new Set(["compra", "comprar", "venta", "vender", "adquirir"]);

const normalizeIntentText = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

export const detectSearchIntent = (queries: string[]): SearchIntent => {
  const tokens = normalizeIntentText(queries.join(" ")).split(" ").filter(Boolean);
  const wantsRent = tokens.some((token) => RENT_INTENT_TERMS.has(token));
  const wantsBuy = tokens.some((token) => BUY_INTENT_TERMS.has(token));
  if (wantsRent && wantsBuy) return "both";
  if (wantsRent) return "rent";
  if (wantsBuy) return "buy";
  return null;
};
