export type GuidedOperation = "" | "Comprar" | "Alquilar" | "Vender";
export type GuidedStage = "operation" | "buyPurpose" | "zone" | "budget" | "sell";

export const GUIDED_OPERATIONS: Exclude<GuidedOperation, "">[] = ["Comprar", "Alquilar", "Vender"];
export const GUIDED_BUY_PURPOSES = ["Vivir", "Invertir", "Proyecto preventa"] as const;
export const GUIDED_RENT_BUDGET_OPTIONS = ["menos de 5.000 Bs", "entre 5.000 y 8.000", "más de 8.000 Bs"] as const;
export const GUIDED_BUY_BUDGET_OPTIONS = ["menos de 150.000$", "más de 150.000$"] as const;
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
  if (operation === "Comprar") return "buyPurpose";
  return "zone";
};

export const previousGuidedStage = (stage: GuidedStage, operation: GuidedOperation): GuidedStage | null => {
  if (stage === "budget") return "zone";
  if (stage === "zone") return operation === "Comprar" ? "buyPurpose" : "operation";
  if (stage === "buyPurpose" || stage === "sell") return "operation";
  return null;
};

export const budgetOptionsFor = (operation: GuidedOperation): readonly string[] => {
  if (operation === "Comprar") return GUIDED_BUY_BUDGET_OPTIONS;
  return GUIDED_RENT_BUDGET_OPTIONS;
};

export const getGuidedChoiceOptions = (
  stage: GuidedStage,
  operation: GuidedOperation,
  zoneOptions: string[] = [],
): string[] => {
  if (stage === "operation") return [...GUIDED_OPERATIONS];
  if (stage === "buyPurpose") return [...GUIDED_BUY_PURPOSES];
  if (stage === "zone") return zoneOptions;
  if (stage === "budget") return [...budgetOptionsFor(operation)];
  return [];
};

export const getGuidedSearchPlaceholder = (stage: GuidedStage) => {
  if (stage === "operation") return "¿Qué estás buscando?";
  if (stage === "buyPurpose") return "¿Desea comprar para...?";
  if (stage === "zone") return "¿En qué zona(s)?";
  if (stage === "budget") return "¿Cuánto es tu presupuesto aproximado?";
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
  purpose = "",
  zone = "",
  budget = "",
  history = [],
}: {
  operation?: GuidedOperation | string;
  purpose?: string;
  zone?: string;
  budget?: string;
  history?: string[];
}) => {
  const parts = [
    operation === "Comprar" || operation === "Alquilar" || operation === "Vender" ? operation : "",
    operation === "Comprar" ? purpose.trim() : "",
    zone.trim(),
    budget.trim(),
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(" · ");
  const lastQuery = [...history].reverse().find((item) => item.trim());
  return lastQuery?.trim() || "Busqueda activa";
};

export const buildGuidedSearchQuery = ({
  operation,
  purpose = "",
  zone = "",
  budget = "",
}: {
  operation: GuidedOperation;
  purpose?: string;
  zone?: string;
  budget?: string;
}) => {
  const operationText =
    operation === "Alquilar"
      ? "quiero alquilar"
      : operation === "Comprar"
        ? purpose === "Invertir"
          ? "quiero comprar para invertir"
          : purpose === "Proyecto preventa"
            ? "quiero comprar proyecto preventa"
            : purpose === "Vivir"
              ? "quiero comprar para vivir"
              : "quiero comprar"
        : "busco";
  const normalizedBudget = normalizeGuidedBudget(operation, budget);
  return [operationText, zone.trim() && `en ${zone.trim()}`, normalizedBudget].filter(Boolean).join(" ");
};
