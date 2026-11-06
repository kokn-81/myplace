import { ONA_BUILDER, ONA_DELIVERY } from "./onaInventory";
import type { Property } from "./types";

export interface ProjectCardSummary {
  name: string;
  builder: string;
  address: string;
  delivery: string;
  sourceUrl: string;
}

// Verified against the ONA artwork in the user's Fachadas folder. These
// editorial details take precedence over older API, cache and fallback data.
const ONA_CARD_SUMMARY: ProjectCardSummary = {
  name: "ONA Residences",
  builder: ONA_BUILDER,
  address: "Av. Los Cusis, entre Banzer y Beni",
  delivery: ONA_DELIVERY,
  sourceUrl: "https://drive.google.com/file/d/1atcLLHEwr3V1EVczorNzfLK1iAPhiy7c/view",
};

export function getProjectCardSummary(property: Pick<Property, "id">): ProjectCardSummary | null {
  const id = String(property.id).toLowerCase();
  return ["5", "ona", "ona-residences"].includes(id) ? ONA_CARD_SUMMARY : null;
}
