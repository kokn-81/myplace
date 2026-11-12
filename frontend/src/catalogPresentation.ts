import type { Property } from "./types";
import type { CatalogSort } from "./components/CatalogFilters";
import { getProjectAvailableUnits } from "./projectInventory";
import { getProjectCardSummary } from "./projectCardSummary";
import { matchesBedrooms } from "./localSearch";

export function catalogPrice(property: Property, bedrooms?: string | null, minBudget?: number | null, maxBudget?: number | null): number | null {
  const units = getProjectAvailableUnits(property.id);
  if (units) {
    const prices = units.filter(u => !bedrooms || matchesBedrooms(u.rooms, "", "", bedrooms)).map(u => u.price).filter(p => p > 0 && (!minBudget || p >= minBudget) && (!maxBudget || p <= maxBudget));
    return prices.length ? Math.min(...prices) : null;
  }
  return property.price > 0 ? property.price : null;
}
export function deliveryTimestamp(value?: string | null) {
  const year = value?.match(/20\d{2}/)?.[0];
  if (!year) return Infinity;
  const month = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"].findIndex(m => value!.toLowerCase().includes(m));
  return Number(year) * 12 + Math.max(0, month);
}
export function sortCatalogResults(properties: Property[], sort: CatalogSort, bedrooms?: string | null, minBudget?: number | null, maxBudget?: number | null) {
  if (sort === "recommended") return properties;
  return [...properties].sort((a, b) => {
    const left = sort === "delivery" ? deliveryTimestamp(getProjectCardSummary(a)?.delivery || a.fechaEntrega) : catalogPrice(a, bedrooms, minBudget, maxBudget) ?? Infinity;
    const right = sort === "delivery" ? deliveryTimestamp(getProjectCardSummary(b)?.delivery || b.fechaEntrega) : catalogPrice(b, bedrooms, minBudget, maxBudget) ?? Infinity;
    if (left === right) return 0;
    if (!Number.isFinite(left)) return 1;
    if (!Number.isFinite(right)) return -1;
    return sort === "price-desc" ? right - left : left - right;
  });
}
export function propertyPath(property: Pick<Property, "id">) {
  const id = String(property.id);
  const paths: Record<string, string> = { "5": "/ona", ona: "/ona", "1816": "/eurodesign", eurodesign: "/eurodesign", "garden-zen": "/gardenzen", "bless-tower": "/bless-tower", "bless-drei": "/bless-drei", "trivento-iv": "/trivento", "beton-brut-ii": "/beton-brut-ii", "vertical-guemes": "/vertical-guemes" };
  return paths[id] || (id.startsWith("domus-") ? `/domus/${id}` : `/departamento/${encodeURIComponent(id)}`);
}
export function propertyIdFromLocation(url: URL): string | null {
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] === "departamento") return decodeURIComponent(parts[1] || "") || null;
  return url.searchParams.get("proyecto") || url.searchParams.get("project") || url.searchParams.get("p") || (parts[0] === "domus" ? parts[1] : parts[0] === "proyecto" || parts[0] === "p" ? parts[1] : parts[0]) || null;
}
