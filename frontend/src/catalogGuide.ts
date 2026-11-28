import type { LocalSearchCriteria } from "./localSearch";

export type CatalogGuideStep = "category" | "bedrooms" | "zone" | "budget" | "delivery" | "results" | "sort";

export function skipCatalogQuestion(
  step: CatalogGuideStep,
  criteria: LocalSearchCriteria,
  hasDeliveryQuestion: boolean,
): { criteria: LocalSearchCriteria; nextStep: CatalogGuideStep } | null {
  switch (step) {
    case "bedrooms":
      return { criteria: { ...criteria, bedrooms: undefined }, nextStep: "zone" };
    case "zone":
      return { criteria: { ...criteria, zone: undefined }, nextStep: "budget" };
    case "budget":
      return {
        criteria: { ...criteria, minBudget: undefined, maxBudget: undefined },
        nextStep: hasDeliveryQuestion ? "delivery" : "results",
      };
    case "delivery":
      return { criteria: { ...criteria, deliveryYear: undefined }, nextStep: "results" };
    default:
      return null;
  }
}
