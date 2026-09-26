import { Property } from "./types";
import { normalizeGeoText } from "./geographicLocations";

export const normalizeOfferOperation = (operation?: string) => {
  const value = String(operation || "").toLowerCase();
  if (value.includes("alquiler") || value.includes("renta") || value.includes("arrendar") || value === "rent") return "rent";
  if (value.includes("venta") || value.includes("compra") || value.includes("comprar") || value.includes("invers") || value === "buy") return "buy";
  return null;
};

export interface LocalSearchCriteria {
  operation?: "buy" | "rent" | null;
  propertyType?: string | null;
  bedrooms?: string | null;
  zone?: string | null;
  city?: string | null;
  maxBudget?: number | null;
  amenities?: string[];
}

export interface LocalSearchResult {
  ids: string[];
  matchedProperties: Property[];
  intent: "buy" | "rent" | null;
  criteria: LocalSearchCriteria;
}

export const KNOWN_ZONES = [
  "equipetrol",
  "sirari",
  "urubo",
  "las palmas",
  "norte",
  "centro",
  "sur",
  "san aurelio",
  "banzer",
  "canal isuto",
  "los cusis",
  "marina del este",
  "barrio fidalga",
  "parque urbano",
];

export const isProjectType = (type?: string | null) => {
  const norm = normalizeGeoText(type || "");
  return norm.includes("preventa") || norm.includes("proyecto");
};

export const matchesPropertyType = (pType?: string | null, requestedType = "") => {
  if (!requestedType) return true;
  const norm = normalizeGeoText(requestedType);
  const pNorm = normalizeGeoText(pType || "");
  if (norm.includes("preventa") || norm.includes("proyecto")) return isProjectType(pType);
  if (norm.includes("casa")) return pNorm.includes("casa");
  if (norm.includes("departamento") || norm.includes("depa") || norm.includes("monoambiente")) {
    return pNorm.includes("departamento") || pNorm.includes("monoambiente") || pNorm.includes("suite");
  }
  if (norm.includes("comercial") || norm.includes("oficina")) {
    return pNorm.includes("comercial") || pNorm.includes("oficina") || pNorm.includes("local") || pNorm.includes("galpon");
  }
  if (norm.includes("terreno") || norm.includes("lote")) {
    return pNorm.includes("terreno") || pNorm.includes("lote");
  }
  return true;
};

export const matchesBedrooms = (
  rooms: number | undefined | null,
  title = "",
  description = "",
  requested = "",
) => {
  if (!requested || requested === "Cualquiera" || requested === "Todos") return true;
  const r = rooms ?? 0;
  const t = (title + " " + description).toLowerCase();

  if (requested.includes("Monoambiente") || requested.includes("Studio") || requested === "0") {
    return r === 0 || (r === 1 && (t.includes("monoambiente") || t.includes("studio")));
  }
  if (requested.includes("1 Dorm") || requested === "1") {
    return r === 1 && !t.includes("monoambiente");
  }
  if (requested.includes("2 Dorm") || requested === "2") {
    return r === 2;
  }
  if (requested.includes("3+") || requested === "3" || requested.includes("3 Dorm")) {
    return r >= 3;
  }
  return true;
};

export const extractSearchCriteria = (rawQuery: string): LocalSearchCriteria => {
  const query = normalizeGeoText(rawQuery);
  const criteria: LocalSearchCriteria = {};

  // 1. Operation
  if (/\b(alquiler|alquilar|alquilo|renta|rent)\b/.test(query)) {
    criteria.operation = "rent";
  } else if (/\b(venta|vender|comprar|compro|compra|inversion|invertir|preventa)\b/.test(query)) {
    criteria.operation = "buy";
  }

  // 2. Property Type
  if (/\b(departamento|departamentos|depa|depas|depto|deptos|monoambiente|monoambientes|studio|studios|suite|suites)\b/.test(query)) {
    criteria.propertyType = "Departamento";
  } else if (/\b(casa|casas|chalet|chalets|vivienda|viviendas)\b/.test(query)) {
    criteria.propertyType = "Casa";
  } else if (/\b(terreno|terrenos|lote|lotes)\b/.test(query)) {
    criteria.propertyType = "Terreno / Lote";
  } else if (/\b(comercial|comerciales|oficina|oficinas|local|locales|galpon|galpones)\b/.test(query)) {
    criteria.propertyType = "Comercial / Oficina";
  } else if (/\b(preventa|preventas|proyecto|proyectos|en pozo|pozo)\b/.test(query)) {
    criteria.propertyType = "Preventa";
  }

  // 3. Bedrooms
  if (/\b(monoambiente|monoambientes|studio|studios|0\s*dorms?|0\s*dormitorios?|0\s*hab(?:itacion(?:es)?)?)\b/.test(query)) {
    criteria.bedrooms = "Monoambiente";
  } else if (/\b(1\s*dorms?|1\s*dormitorios?|1\s*hab(?:itacion(?:es)?)?|un\s*dormitorio)\b/.test(query)) {
    criteria.bedrooms = "1 Dorm";
  } else if (/\b(2\s*dorms?|2\s*dormitorios?|2\s*hab(?:itacion(?:es)?)?|dos\s*dormitorios)\b/.test(query)) {
    criteria.bedrooms = "2 Dorms";
  } else if (/\b(3\s*dorms?|3\s*dormitorios?|3\s*hab(?:itacion(?:es)?)?|tres\s*dormitorios|4\s*dorms?|4\s*dormitorios?|cuatro\s*dormitorios|3\+\s*dorms?)\b/.test(query)) {
    criteria.bedrooms = "3+ Dorms";
  }

  // 4. Zone
  for (const zone of KNOWN_ZONES) {
    if (query.includes(zone)) {
      criteria.zone = zone;
      break;
    }
  }

  // 5. City
  if (query.includes("santa cruz")) criteria.city = "Santa Cruz";
  else if (query.includes("cochabamba") || query.includes("cbba")) criteria.city = "Cochabamba";
  else if (query.includes("la paz")) criteria.city = "La Paz";

  // 6. Budget
  const budgetMatch = rawQuery.replace(/\./g, "").match(/(?:menos de|hasta|<|maximo|max|presupuesto de)?\s*(\d{2,7})\s*(\$|usd|bs|bolivianos)?/i);
  if (budgetMatch && Number(budgetMatch[1]) > 50) {
    criteria.maxBudget = Number(budgetMatch[1]);
  }

  // 7. Amenities
  const amenities: string[] = [];
  if (query.includes("piscina")) amenities.push("piscina");
  if (query.includes("churrasquera") || query.includes("parrillero")) amenities.push("churrasquera");
  if (query.includes("amoblado") || query.includes("amoblada")) amenities.push("amoblado");
  if (query.includes("garaje") || query.includes("parqueo") || query.includes("estacionamiento")) amenities.push("garaje");
  if (amenities.length > 0) criteria.amenities = amenities;

  return criteria;
};

export const localSearchCatalog = (rawQuery: string, catalog: Property[]): LocalSearchResult => {
  const criteria = extractSearchCriteria(rawQuery);

  const matched = catalog.filter((p) => {
    // Operation filter
    if (criteria.operation === "rent") {
      const isRent =
        normalizeOfferOperation(p.operation) === "rent" ||
        p.offers?.some((o) => normalizeOfferOperation(o.operation) === "rent");
      if (!isRent) return false;
    } else if (criteria.operation === "buy") {
      const isBuy =
        normalizeOfferOperation(p.operation) === "buy" ||
        p.offers?.some((o) => normalizeOfferOperation(o.operation) === "buy") ||
        isProjectType(p.type);
      if (!isBuy) return false;
    }

    // Property Type filter
    if (criteria.propertyType && !matchesPropertyType(p.type, criteria.propertyType)) {
      return false;
    }

    // Bedrooms filter
    if (criteria.bedrooms && !matchesBedrooms(p.rooms, p.title, p.description, criteria.bedrooms)) {
      return false;
    }

    // Zone filter
    if (criteria.zone) {
      const zoneText = normalizeGeoText(`${p.zone || ""} ${p.area || ""} ${p.title || ""} ${p.description || ""}`);
      if (!zoneText.includes(criteria.zone)) {
        return false;
      }
    }

    // City filter
    if (criteria.city) {
      const normCity = normalizeGeoText(criteria.city);
      const cityText = normalizeGeoText(`${p.city || ""} ${p.area || ""} ${p.title || ""}`);
      if (!cityText.includes(normCity)) {
        return false;
      }
    }

    // Budget filter
    if (criteria.maxBudget) {
      const price = p.price;
      if (price > criteria.maxBudget) {
        return false;
      }
    }

    // Amenities filter
    if (criteria.amenities && criteria.amenities.length > 0) {
      const amText = normalizeGeoText(
        `${(p.amenities || []).join(" ")} ${p.title || ""} ${p.description || ""}`
      );
      for (const am of criteria.amenities) {
        if (!amText.includes(am)) return false;
      }
    }

    return true;
  });

  return {
    ids: matched.map((p) => p.id),
    matchedProperties: matched,
    intent: criteria.operation || null,
    criteria,
  };
};