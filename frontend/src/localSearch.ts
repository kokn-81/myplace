import { Property } from "./types";
import { normalizeGeoText } from "./geographicLocations";

export const normalizeOfferOperation = (operation?: string) => {
  const value = String(operation || "").toLowerCase();
  if (value.includes("anticret") || value.includes("anticr") || value === "anticretico") return "anticretico";
  if (value.includes("alquiler") || value.includes("renta") || value.includes("arrendar") || value === "rent") return "rent";
  if (value.includes("venta") || value.includes("compra") || value.includes("comprar") || value.includes("invers") || value === "buy") return "buy";
  return null;
};

export interface LocalSearchCriteria {
  referenceId?: string | null;
  keywords?: string[];
  operation?: "buy" | "rent" | "anticretico" | null;
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
  intent: "buy" | "rent" | "anticretico" | null;
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

export const extractReferenceId = (rawQuery: string): string | null => {
  const norm = normalizeGeoText(rawQuery);
  // Matches: #ref 3, #ref3, ref 3, ref #3, ref. 3, ref: 3, #3, referencia 3, id 3, id: 3, #448, ref 448
  const refMatch = norm.match(/(?:#\s*ref(?:erencia)?\.?|ref(?:erencia)?\.?|#|id)\s*[:#.]*\s*([a-z0-9_-]+)/i);
  if (refMatch && refMatch[1]) {
    return refMatch[1];
  }
  // Standalone digits only query (e.g. "3" or "448")
  const trimmed = norm.trim();
  if (/^\d{1,6}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
};

const COMMON_STOP_WORDS = new Set([
  "de", "en", "la", "el", "los", "las", "un", "una", "unos", "unas", "del", "al", "con", "por", "para", "y", "o", "a",
  "busco", "quiero", "necesito", "inmueble", "inmuebles", "propiedad", "propiedades", "zona", "barrio", "edificio",
  "condominio", "complejo", "ref", "referencia", "id", "#"
]);

export const extractSearchCriteria = (rawQuery: string): LocalSearchCriteria => {
  const query = normalizeGeoText(rawQuery);
  const criteria: LocalSearchCriteria = {};

  // 1. Reference ID
  const refId = extractReferenceId(rawQuery);
  if (refId) {
    criteria.referenceId = refId;
  }

  // 2. Operation
  if (/\b(anticretico|anticreticos|anticretica|anticresis)\b/.test(query)) {
    criteria.operation = "anticretico";
  } else if (/\b(alquiler|alquilar|alquilo|renta|rent)\b/.test(query)) {
    criteria.operation = "rent";
  } else if (/\b(venta|vender|comprar|compro|compra|inversion|invertir|preventa)\b/.test(query)) {
    criteria.operation = "buy";
  }

  // 3. Property Type
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

  // 4. Bedrooms
  if (/\b(monoambiente|monoambientes|studio|studios|0\s*dorms?|0\s*dormitorios?|0\s*hab(?:itacion(?:es)?)?)\b/.test(query)) {
    criteria.bedrooms = "Monoambiente";
  } else if (/\b(1\s*dorms?|1\s*dormitorios?|1\s*hab(?:itacion(?:es)?)?|un\s*dormitorio)\b/.test(query)) {
    criteria.bedrooms = "1 Dorm";
  } else if (/\b(2\s*dorms?|2\s*dormitorios?|2\s*hab(?:itacion(?:es)?)?|dos\s*dormitorios)\b/.test(query)) {
    criteria.bedrooms = "2 Dorms";
  } else if (/\b(3\s*dorms?|3\s*dormitorios?|3\s*hab(?:itacion(?:es)?)?|tres\s*dormitorios|4\s*dorms?|4\s*dormitorios?|cuatro\s*dormitorios|3\+\s*dorms?)\b/.test(query)) {
    criteria.bedrooms = "3+ Dorms";
  }

  // 5. Zone
  for (const zone of KNOWN_ZONES) {
    if (query.includes(zone)) {
      criteria.zone = zone;
      break;
    }
  }

  // 6. City
  if (query.includes("santa cruz")) criteria.city = "Santa Cruz";
  else if (query.includes("cochabamba") || query.includes("cbba")) criteria.city = "Cochabamba";
  else if (query.includes("la paz")) criteria.city = "La Paz";

  // 7. Budget (Make sure reference tokens are not misinterpreted as budgets)
  let textForBudget = rawQuery;
  if (criteria.referenceId) {
    textForBudget = textForBudget.replace(/(?:#\s*ref(?:erencia)?\.?|ref(?:erencia)?\.?|#|id)\s*[:#.]*\s*[a-z0-9_-]+/gi, " ");
    if (/^\s*\d{1,6}\s*$/.test(rawQuery)) {
      textForBudget = "";
    }
  }
  const budgetMatch = textForBudget.replace(/\./g, "").match(/(?:menos de|hasta|<|maximo|max|presupuesto de)\s*(\d{2,7})\s*(\$|usd|bs|bolivianos)?/i) ||
    textForBudget.replace(/\./g, "").match(/(\d{2,7})\s*(\$|usd|bs|bolivianos)/i);
  if (budgetMatch && Number(budgetMatch[1]) > 50) {
    criteria.maxBudget = Number(budgetMatch[1]);
  }

  // 8. Amenities
  const amenities: string[] = [];
  if (query.includes("piscina")) amenities.push("piscina");
  if (query.includes("churrasquera") || query.includes("parrillero")) amenities.push("churrasquera");
  if (query.includes("amoblado") || query.includes("amoblada")) amenities.push("amoblado");
  if (query.includes("garaje") || query.includes("parqueo") || query.includes("estacionamiento")) amenities.push("garaje");
  if (amenities.length > 0) criteria.amenities = amenities;

  // 9. Free-text & Building Keywords
  // Strip recognized tokens and gather remaining words
  let leftover = query;
  if (criteria.referenceId) {
    leftover = leftover.replace(/(?:#\s*ref(?:erencia)?\.?|ref(?:erencia)?\.?|#|id)\s*[:#.]*\s*[a-z0-9_-]+/gi, " ");
    leftover = leftover.replace(new RegExp(`\\b${criteria.referenceId}\\b`, "gi"), " ");
  }
  leftover = leftover
    .replace(/\b(anticretico|anticreticos|anticretica|anticresis|alquiler|alquilar|alquilo|renta|rent|venta|vender|comprar|compro|compra|inversion|invertir|preventa)\b/gi, " ")
    .replace(/\b(departamento|departamentos|depa|depas|depto|deptos|monoambiente|monoambientes|studio|studios|suite|suites|casa|casas|chalet|chalets|vivienda|viviendas|terreno|terrenos|lote|lotes|comercial|comerciales|oficina|oficinas|local|locales|galpon|galpones)\b/gi, " ")
    .replace(/\b(\d+\s*dorms?|\d+\s*dormitorios?|\d+\s*hab(?:itacion(?:es)?)?|un\s*dormitorio|dos\s*dormitorios|tres\s*dormitorios|cuatro\s*dormitorios)\b/gi, " ")
    .replace(/\b(menos de|hasta|<|maximo|max|presupuesto de|\$|usd|bs|bolivianos|\d+)\b/gi, " ")
    .replace(/\b(piscina|churrasquera|parrillero|amoblado|amoblada|garaje|parqueo|estacionamiento)\b/gi, " ")
    .replace(/\b(santa cruz|cochabamba|cbba|la paz)\b/gi, " ");

  for (const z of KNOWN_ZONES) {
    leftover = leftover.replace(new RegExp(`\\b${z}\\b`, "gi"), " ");
  }

  const rawWords = leftover.split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !COMMON_STOP_WORDS.has(w));
  if (rawWords.length > 0) {
    criteria.keywords = Array.from(new Set(rawWords));
  }

  return criteria;
};

export const localSearchCatalog = (rawQuery: string, catalog: Property[]): LocalSearchResult => {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return {
      ids: catalog.map((p) => p.id),
      matchedProperties: catalog,
      intent: null,
      criteria: {},
    };
  }

  const criteria = extractSearchCriteria(rawQuery);
  const hasCriteria = Boolean(
    criteria.referenceId ||
    criteria.operation ||
    criteria.propertyType ||
    criteria.bedrooms ||
    criteria.zone ||
    criteria.city ||
    criteria.maxBudget ||
    (criteria.amenities && criteria.amenities.length > 0) ||
    (criteria.keywords && criteria.keywords.length > 0)
  );

  if (!hasCriteria && trimmed.length > 0) {
    return {
      ids: [],
      matchedProperties: [],
      intent: null,
      criteria,
    };
  }

  const matched = catalog.filter((p) => {
    // 1. Reference ID filter
    if (criteria.referenceId) {
      const targetRef = criteria.referenceId.toLowerCase();
      const pId = String(p.id || "").toLowerCase();
      const cId = String(p.complejoId || "").toLowerCase();
      const matchesRef = pId === targetRef || cId === targetRef || pId.includes(targetRef);
      if (!matchesRef) {
        const text = normalizeGeoText(`${p.title || ""} ${p.complejoNombre || ""}`);
        if (!text.includes(targetRef)) {
          return false;
        }
      }
    }

    // 2. Operation filter
    if (criteria.operation === "anticretico") {
      const isAnticretico =
        normalizeOfferOperation(p.operation) === "anticretico" ||
        p.offers?.some((o) => normalizeOfferOperation(o.operation) === "anticretico") ||
        normalizeGeoText(`${p.title || ""} ${p.description || ""}`).includes("anticr");
      if (!isAnticretico) return false;
    } else if (criteria.operation === "rent") {
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

    // 3. Property Type filter
    if (criteria.propertyType && !matchesPropertyType(p.type, criteria.propertyType)) {
      return false;
    }

    // 4. Bedrooms filter
    if (criteria.bedrooms && !matchesBedrooms(p.rooms, p.title, p.description, criteria.bedrooms)) {
      return false;
    }

    // 5. Zone filter
    if (criteria.zone) {
      const zoneText = normalizeGeoText(`${p.zone || ""} ${p.area || ""} ${p.title || ""} ${p.description || ""}`);
      if (!zoneText.includes(criteria.zone)) {
        return false;
      }
    }

    // 6. City filter
    if (criteria.city) {
      const normCity = normalizeGeoText(criteria.city);
      const cityText = normalizeGeoText(`${p.city || ""} ${p.area || ""} ${p.title || ""}`);
      if (!cityText.includes(normCity)) {
        return false;
      }
    }

    // 7. Budget filter
    if (criteria.maxBudget) {
      const price = p.price;
      if (price > criteria.maxBudget) {
        return false;
      }
    }

    // 8. Amenities filter
    if (criteria.amenities && criteria.amenities.length > 0) {
      const amText = normalizeGeoText(
        `${(p.amenities || []).join(" ")} ${p.title || ""} ${p.description || ""}`
      );
      for (const am of criteria.amenities) {
        if (!amText.includes(am)) return false;
      }
    }

    // 9. Building / Free-text Keywords filter
    if (criteria.keywords && criteria.keywords.length > 0) {
      const fullSearchText = normalizeGeoText(
        `${p.title || ""} ${p.complejoNombre || ""} ${p.zone || ""} ${p.area || ""} ${p.description || ""}`
      );
      const allKeywordsMatch = criteria.keywords.every((kw) => fullSearchText.includes(kw));
      if (!allKeywordsMatch) {
        return false;
      }
    }

    return true;
  });

  // If a reference ID was requested, sort exact ID matches first, then complex matches
  if (criteria.referenceId) {
    const target = criteria.referenceId.toLowerCase();
    matched.sort((a, b) => {
      const aExact = String(a.id).toLowerCase() === target;
      const bExact = String(b.id).toLowerCase() === target;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      const aComp = String(a.complejoId || "").toLowerCase() === target;
      const bComp = String(b.complejoId || "").toLowerCase() === target;
      if (aComp && !bComp) return -1;
      if (!aComp && bComp) return 1;
      return 0;
    });
  }

  return {
    ids: matched.map((p) => p.id),
    matchedProperties: matched,
    intent: criteria.operation || null,
    criteria,
  };
};