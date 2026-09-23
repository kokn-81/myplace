import { BOLIVIA_DEPARTMENTS, normalizeGeoText } from "./geographicLocations";

export type GuidedOperation = "" | "Comprar" | "Alquilar" | "Vender";
export type GuidedStage = "operation" | "propertyType" | "city" | "zone" | "budget" | "sell";

export const GUIDED_OPERATIONS: Exclude<GuidedOperation, "">[] = ["Comprar", "Alquilar", "Vender"];
export const GUIDED_BUY_PROPERTY_TYPES = ["Casa", "Departamento", "Preventa"] as const;
export const GUIDED_RENT_PROPERTY_TYPES = ["Casa", "Departamento", "Comercial"] as const;
export const GUIDED_RENT_BUDGET_OPTIONS = ["5.000 Bs", "8.000 Bs", "12.000 Bs"] as const;
export const GUIDED_BUY_BUDGET_OPTIONS = ["100.000 $", "200.000 $", "350.000 $"] as const;
export const SELL_WHATSAPP_NUMBER = "57015854";
export const SELL_WHATSAPP_MESSAGE = "Hola, vengo de N.I.A y quiero vender mi inmueble.";

export const normalizeWhatsappNumber = (value?: string) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("591")) return digits;
  if (digits.length === 8) return `591${digits}`;
  return digits;
};

export const buildSellWhatsappUrl = (phone = SELL_WHATSAPP_NUMBER) => {
  const normalized = normalizeWhatsappNumber(phone);
  if (!normalized) return "";
  return `https://wa.me/${normalized}?text=${encodeURIComponent(SELL_WHATSAPP_MESSAGE)}`;
};

export const nextGuidedStageFromOperation = (operation: Exclude<GuidedOperation, "">): GuidedStage => {
  if (operation === "Vender") return "sell";
  return "propertyType";
};

export const previousGuidedStage = (stage: GuidedStage, operation: GuidedOperation): GuidedStage | null => {
  if (stage === "budget") return "zone";
  if (stage === "zone") return "city";
  if (stage === "city") return "propertyType";
  if (stage === "propertyType" || stage === "sell") return "operation";
  return null;
};

export const budgetOptionsFor = (operation: GuidedOperation): readonly string[] => {
  if (operation === "Comprar") return GUIDED_BUY_BUDGET_OPTIONS;
  return GUIDED_RENT_BUDGET_OPTIONS;
};

export const getGuidedChoiceOptions = (
  stage: GuidedStage,
  operation: GuidedOperation,
  cityOptions: string[] = [],
  zoneOptions: string[] = [],
): string[] => {
  if (stage === "operation") return [...GUIDED_OPERATIONS];
  if (stage === "propertyType") {
    return operation === "Alquilar" ? [...GUIDED_RENT_PROPERTY_TYPES] : [...GUIDED_BUY_PROPERTY_TYPES];
  }
  if (stage === "city") return cityOptions.length > 0 ? cityOptions : [...BOLIVIA_DEPARTMENTS];
  if (stage === "zone") return zoneOptions;
  if (stage === "budget") return [...budgetOptionsFor(operation)];
  return [];
};

export const filterGuidedChoiceOptions = ({
  options,
  query,
  stage,
  aliasResolver,
}: {
  options: string[];
  query: string;
  stage: GuidedStage;
  aliasResolver?: (option: string) => string[];
}): string[] => {
  const clean = query.trim();
  if (!clean) return options;
  const normQuery = normalizeGeoText(clean);

  return options.filter((option) => {
    if (stage === "zone" && option === "Todas") {
      return normQuery === "todas" || normQuery === "toda" || normQuery === "all";
    }
    const normOption = normalizeGeoText(option);
    if (normOption.includes(normQuery)) return true;

    if (aliasResolver) {
      const aliases = aliasResolver(option);
      if (aliases.some((alias) => normalizeGeoText(alias).includes(normQuery))) {
        return true;
      }
    }
    return false;
  });
};

export const getGuidedSearchPlaceholder = (stage: GuidedStage, city = "", operation: GuidedOperation = "") => {
  if (stage === "operation") return "¿Qué estás buscando?";
  if (stage === "propertyType") {
    return operation === "Alquilar" ? "¿Qué buscas alquilar?" : "¿Qué buscas comprar?";
  }
  if (stage === "city") return "¿En qué ciudad buscas?";
  if (stage === "zone") return city ? `¿En qué zona de ${city}?` : "¿En qué zona(s)?";
  if (stage === "budget") return "Presupuesto máximo...";
  if (stage === "sell") return "¿Quieres vender tu inmueble?";
  return "Dile a NIA como es tu proximo hogar...";
};

export const normalizeGuidedBudget = (operation: GuidedOperation, budget: string) => {
  const value = budget.trim();
  if (!value) return "";
  if (/(\$|usd|bs|boliviano)/i.test(value)) return value;
  if (operation === "Comprar") return `${value}$`;
  if (operation === "Alquilar") return `${value} Bs`;
  return value;
};

export const formatCompactSearchLabel = ({
  operation = "",
  propertyType = "",
  purpose = "",
  city = "",
  zone = "",
  budget = "",
  history = [],
}: {
  operation?: GuidedOperation | string;
  propertyType?: string;
  purpose?: string;
  city?: string;
  zone?: string;
  budget?: string;
  history?: string[];
}) => {
  const typeText = (propertyType || purpose).trim();
  const parts = [
    operation === "Comprar" || operation === "Alquilar" || operation === "Vender" ? operation : "",
    typeText,
    city.trim(),
    zone.trim(),
    budget.trim(),
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(" · ");
  const lastQuery = [...history].reverse().find((item) => item.trim());
  return lastQuery?.trim() || "Busqueda activa";
};

export const buildGuidedSearchQuery = ({
  operation,
  propertyType = "",
  purpose = "",
  city = "",
  zone = "",
  budget = "",
}: {
  operation: GuidedOperation;
  propertyType?: string;
  purpose?: string;
  city?: string;
  zone?: string;
  budget?: string;
}) => {
  const selectedType = (propertyType || purpose).trim();
  const lower = selectedType.toLowerCase();
  let operationText = "busco";
  if (operation === "Alquilar") {
    operationText = lower ? `quiero alquilar ${lower}` : "quiero alquilar";
  } else if (operation === "Comprar") {
    if (lower === "vivir") {
      operationText = "quiero comprar para vivir";
    } else if (lower === "invertir") {
      operationText = "quiero comprar para invertir";
    } else if (lower === "proyecto preventa") {
      operationText = "quiero comprar proyecto preventa";
    } else if (lower) {
      operationText = `quiero comprar ${lower}`;
    } else {
      operationText = "quiero comprar";
    }
  }
  const locationParts = [zone.trim(), city.trim()].filter(Boolean);
  const locationText = locationParts.length > 0 ? `en ${locationParts.join(", ")}` : "";
  const normalizedBudget = normalizeGuidedBudget(operation, budget);
  return [operationText, locationText, normalizedBudget].filter(Boolean).join(" ");
};
