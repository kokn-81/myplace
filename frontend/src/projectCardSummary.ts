import { ONA_BUILDER, ONA_DELIVERY, ONA_UNITS } from "./onaInventory";
import { DOMUS_PROJECTS_CONFIG } from "./domusInventory";
import { GARDEN_ZEN_BASELINE_UNITS, GARDEN_ZEN_CONFIG } from "./gardenZenInventory";
import { EURODESIGN_DELIVERY, EURODESIGN_UNITS } from "./eurodesignInventory";
import { BLESS_TOWER_BASELINE_UNITS, BLESS_TOWER_CONFIG } from "./blessTowerInventory";
import { BLESS_DREI_BASELINE_UNITS, BLESS_DREI_CONFIG } from "./blessDreiInventory";
import { TRIVENTO_CONFIG, TRIVENTO_MODELS } from "./triventoInventory";
import { BETON_BRUT_CONFIG } from "./betonBrutInventory";
import { VERTICAL_GUEMES_CONFIG } from "./verticalGuemesInventory";
import { LUXE_TOWER_CONFIG } from "./luxeTowerInventory";
import { ALPHA_LUXE_CONFIG } from "./alphaLuxeInventory";
import type { Property } from "./types";

export interface ProjectCardSummary {
  name: string;
  builder: string | null;
  address: string;
  delivery: string | null;
  bedrooms: number[];
  sourceUrl: string;
}

const uniqueBedrooms = (values: number[]) =>
  [...new Set(values.filter((value) => Number.isInteger(value) && value >= 0))].sort((a, b) => a - b);

const bedroomsFromTypologies = (units: { tipologia: string }[]) =>
  uniqueBedrooms(units.map((unit) => /monoambiente/i.test(unit.tipologia) ? 0 : Number.parseInt(unit.tipologia, 10)));

export function formatBedroomOptions(bedrooms: number[]): string {
  const options = uniqueBedrooms(bedrooms);
  const counts = options.filter((rooms) => rooms > 0);
  const parts: string[] = [];
  if (options.includes(0)) parts.push("Monoambientes");
  if (counts.length > 0) {
    const list = new Intl.ListFormat("es", { type: "conjunction" }).format(counts.map(String));
    parts.push(`${list} ${counts.length === 1 && counts[0] === 1 ? "dormitorio" : "dormitorios"}`);
  }
  return parts.join(" · ");
}

// Editorial details verified against the user's Fachadas artwork and the
// project inventories. Do not let older catalogue/cache fields override them.
const PROJECT_CARD_SUMMARIES: Record<string, ProjectCardSummary> = {
  ona: {
    name: "ONA Residences",
    builder: ONA_BUILDER,
    address: "Av. Los Cusis, entre Banzer y Beni",
    delivery: ONA_DELIVERY,
    bedrooms: uniqueBedrooms(ONA_UNITS.map((unit) => unit.rooms)),
    sourceUrl: "https://drive.google.com/file/d/1atcLLHEwr3V1EVczorNzfLK1iAPhiy7c/view",
  },
  eurodesign: {
    name: "Tower Eurodesign",
    builder: "Grupo Eurodesign",
    address: "Equipetrol Norte, calle Enrique Finot esq. La Plata",
    delivery: EURODESIGN_DELIVERY,
    // Rooms=0 also identifies commercial offices in this inventory, not studios.
    bedrooms: uniqueBedrooms(EURODESIGN_UNITS.filter((unit) => unit.rooms > 0).map((unit) => unit.rooms)),
    sourceUrl: "https://drive.google.com/file/d/1Nb1Tkl4hYHLht5BMcqFnvERV83Xy2NfB/view",
  },
  "garden-zen": {
    name: GARDEN_ZEN_CONFIG.name,
    builder: GARDEN_ZEN_CONFIG.builder,
    address: "Equipetrol Norte, calle Dra. María de Oliveira",
    delivery: GARDEN_ZEN_CONFIG.delivery,
    bedrooms: uniqueBedrooms(GARDEN_ZEN_BASELINE_UNITS.map((unit) => unit.rooms)),
    sourceUrl: "https://drive.google.com/file/d/1DM32-4g4BNaAXpU7MjbslxTmUHBUvIXF/view",
  },
  "bless-tower": {
    name: BLESS_TOWER_CONFIG.name,
    builder: "Alta Vida",
    address: "Av. Banzer, entre 2.º anillo y Av. Los Cusis",
    delivery: BLESS_TOWER_CONFIG.delivery,
    bedrooms: bedroomsFromTypologies(BLESS_TOWER_BASELINE_UNITS),
    sourceUrl: "https://drive.google.com/file/d/1ibex_nccnFG6E7i-a-8L_zoMZYD9OxDX/view",
  },
  "bless-drei": {
    name: BLESS_DREI_CONFIG.name,
    builder: "Alta Vida",
    address: "Equipetrol, calle Alejandro Ramírez",
    delivery: BLESS_DREI_CONFIG.delivery,
    bedrooms: bedroomsFromTypologies(BLESS_DREI_BASELINE_UNITS),
    sourceUrl: "https://drive.google.com/file/d/1JXcNVWpjdS_1i78bBpBwYQ-6iyC1qour/view",
  },
  "trivento-iv": {
    name: TRIVENTO_CONFIG.name,
    builder: null, // A builder has not been verified in the published project material.
    address: TRIVENTO_CONFIG.address,
    delivery: TRIVENTO_CONFIG.delivery,
    bedrooms: uniqueBedrooms(TRIVENTO_MODELS.map((model) => model.dormitorios)),
    sourceUrl: TRIVENTO_CONFIG.driveUrl,
  },
  "beton-brut-ii": {
    name: BETON_BRUT_CONFIG.name,
    builder: "Mediterráneo Constructora",
    address: BETON_BRUT_CONFIG.address,
    delivery: BETON_BRUT_CONFIG.delivery,
    bedrooms: [1, 2, 3],
    sourceUrl: BETON_BRUT_CONFIG.brochurePdfUrl,
  },
  "vertical-guemes": {
    name: VERTICAL_GUEMES_CONFIG.name,
    builder: VERTICAL_GUEMES_CONFIG.builder,
    address: `${VERTICAL_GUEMES_CONFIG.address}, ${VERTICAL_GUEMES_CONFIG.zone}`,
    delivery: VERTICAL_GUEMES_CONFIG.delivery,
    bedrooms: [1, 2, 3],
    sourceUrl: VERTICAL_GUEMES_CONFIG.brochurePdfUrl,
  },
  "luxe-tower": {
    name: LUXE_TOWER_CONFIG.name,
    builder: LUXE_TOWER_CONFIG.builder,
    address: `${LUXE_TOWER_CONFIG.address}, 2.º anillo`,
    delivery: LUXE_TOWER_CONFIG.delivery,
    bedrooms: [1, 2],
    sourceUrl: LUXE_TOWER_CONFIG.brochurePdfUrl,
  },
  "alpha-luxe": {
    name: ALPHA_LUXE_CONFIG.name,
    builder: ALPHA_LUXE_CONFIG.builder,
    address: ALPHA_LUXE_CONFIG.address,
    delivery: ALPHA_LUXE_CONFIG.delivery,
    bedrooms: [1, 2],
    sourceUrl: ALPHA_LUXE_CONFIG.brochurePdfUrl,
  },
  ...Object.fromEntries(Object.values(DOMUS_PROJECTS_CONFIG).map((project) => [project.id, {
    name: project.name,
    builder: project.developer,
    address: project.address,
    // A sales phase is not a delivery date. Preserve unknown dates explicitly.
    delivery: /\b20\d{2}\b/.test(project.delivery) ? project.delivery.replace(/^Entrega\s+/i, "") : null,
    bedrooms: uniqueBedrooms(project.typologies.map((typology) => typology.rooms)),
    sourceUrl: project.sheetCsvUrl,
  }])),
};

const PROJECT_ALIASES: Record<string, string> = {
  "5": "ona",
  "ona-residences": "ona",
  "1816": "eurodesign",
  "tower-eurodesign": "eurodesign",
  "euro-design": "eurodesign",
  gardenzen: "garden-zen",
  zen: "garden-zen",
  blesstower: "bless-tower",
  blessdrei: "bless-drei",
  trivento: "trivento-iv",
  triventoiv: "trivento-iv",
  "beton-brut": "beton-brut-ii",
  betonbrut: "beton-brut-ii",
  betonbrut2: "beton-brut-ii",
  verticalguemes: "vertical-guemes",
  luxetower: "luxe-tower",
  "alpha-by-luxe": "alpha-luxe",
  alphabyluxe: "alpha-luxe",
  "luxe-alpha": "alpha-luxe",
  domus: "domus-black",
  "domus-lux": "domus-luxury",
};

export function getProjectCardSummary(property: Pick<Property, "id">): ProjectCardSummary | null {
  const id = String(property.id).trim().toLowerCase();
  return PROJECT_CARD_SUMMARIES[PROJECT_ALIASES[id] || id] || null;
}
