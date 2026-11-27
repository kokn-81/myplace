import availability from "./data/westgate-tower-availability.json";

export type WestgateRooms = 0 | 1 | 2;
export type WestgatePlan = "contado" | "aporte50" | "aporte30";

export const WESTGATE_CONFIG = {
  id: "westgate-tower",
  name: "Westgate Tower",
  brand: "Westgate",
  address: "Av. Roca y Coronado, frente a Fexpocruz",
  zone: "Fexpocruz",
  city: "Santa Cruz de la Sierra",
  lat: -17.7858175,
  lng: -63.2109837,
  mapsUrl: "https://maps.app.goo.gl/Vs45UCahELiA6pes8",
  brochurePdfUrl: "https://drive.google.com/file/d/1MiDlxp4W69eQL4-jZ71B8CsqEKsU1vCp/view",
  website: "https://www.westgate.com.bo",
  delivery: availability.delivery,
  priceListUrl: availability.sourceUrl,
  reviewedAt: availability.reviewedAt,
};

export interface WestgateModel {
  id: string;
  name: string;
  rooms: WestgateRooms;
  areaM2: number;
  floors: number[];
  orientation: string;
  detail: string;
  preview: string;
  plan: string;
  sheet: string;
  sourcePage: number;
}

// These are documented layouts, not a list of available apartments.
// Piso 4: brochure pp. 12–13. Typical floors 5–16: pp. 15–19.
const fourthFloor: [number, number][] = [
  [401, 5750], [402, 5800], [403, 5725], [404, 6680],
  [409, 5870], [410, 5515], [411, 5670], [412, 5710],
];

export const WESTGATE_MODELS: WestgateModel[] = [
  ...Array.from({ length: 12 }, (_, i): WestgateModel => {
    const number = i + 1;
    const id = `m${String(number).padStart(2, "0")}`;
    const rooms: WestgateRooms = [6, 7].includes(number) ? 0 : [1, 12].includes(number) ? 1 : 2;
    const sourcePage = rooms === 0 ? 19 : rooms === 1 ? 16 : [2, 5, 8, 11].includes(number) ? 17 : 18;
    return {
      id,
      name: `Modelo ${String(number).padStart(2, "0")}`,
      rooms,
      areaM2: rooms === 0 ? 34 : rooms === 1 ? 52.5 : sourcePage === 17 ? 75.2 : 79.9,
      floors: Array.from({ length: 12 }, (_, floor) => floor + 5),
      orientation: [1, 2, 3, 10, 11, 12].includes(number) ? "Hacia el 4.º anillo" : "Hacia el 3.er anillo",
      detail: rooms === 0 ? "Un ambiente integrado para vivir a tu ritmo." : rooms === 1 ? "Dormitorio independiente, estar y cocina integrados." : "Dos dormitorios y balcón para compartir más espacio.",
      preview: `/westgate-tower/modelos/${id}.jpg`,
      plan: `/westgate-tower/planos/${id}.svg`,
      sheet: `/westgate-tower/fichas/${sourcePage}.jpg`,
      sourcePage,
    };
  }),
  ...fourthFloor.map(([number, areaHundredths]): WestgateModel => ({
    id: `d${number}`,
    name: `Depto. ${number}`,
    rooms: 1,
    areaM2: areaHundredths / 100,
    floors: [4],
    orientation: "Piso 4 · hacia el 4.º anillo",
    detail: "Un dormitorio, balcón y las áreas sociales en el mismo nivel.",
    preview: `/westgate-tower/modelos/d${number}.jpg`,
    plan: `/westgate-tower/planos/d${number}.svg`,
    sheet: "/westgate-tower/fichas/13.jpg",
    sourcePage: 13,
  })),
];

export const WESTGATE_ROOM_FILTERS: { id: WestgateRooms; label: string }[] = [
  { id: 0, label: "Monoambiente" },
  { id: 1, label: "1 dormitorio" },
  { id: 2, label: "2 dormitorios" },
];

export function westgateAreaRange(rooms: WestgateRooms) {
  const areas = WESTGATE_MODELS.filter(model => model.rooms === rooms).map(model => model.areaM2);
  return { low: Math.min(...areas), high: Math.max(...areas) };
}

export const formatWestgateM2 = (value: number) =>
  value.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export interface WestgateUnit {
  code: string;
  modelId: string;
  rooms: number;
  floor: number;
  areaM2: number;
  cashCents: number;
  halfCents: number;
  thirtyCents: number;
  status: "LIBRE" | "RESERVADO";
}

export const WESTGATE_UNITS: WestgateUnit[] = availability.units.map(unit => ({
  ...unit, status: unit.status as WestgateUnit["status"],
}));

export const WESTGATE_PLANS: { id: WestgatePlan; label: string; initialPercent: number }[] = [
  { id: "contado", label: "Contado", initialPercent: 100 },
  { id: "aporte50", label: "Inicial 50%", initialPercent: 50 },
  { id: "aporte30", label: "Inicial 30%", initialPercent: 30 },
];

export const formatWestgateUsd = (value: number) =>
  value.toLocaleString("es-BO", { minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 });

export function westgateUnitsForModel(id: string) {
  return WESTGATE_UNITS.filter(unit => unit.modelId === id).sort((a,b) => a.floor - b.floor);
}

export function westgateMinCash(rooms?: WestgateRooms, modelId?: string): number | null {
  const prices = WESTGATE_UNITS.filter(unit => unit.status === "LIBRE" && (rooms == null || unit.rooms === rooms) && (!modelId || unit.modelId === modelId)).map(unit => unit.cashCents);
  return prices.length ? Math.min(...prices) / 100 : null;
}

export function westgateAvailableAreaRange(rooms: WestgateRooms) {
  const areas = WESTGATE_UNITS.filter(unit => unit.status === "LIBRE" && unit.rooms === rooms).map(unit => unit.areaM2);
  return areas.length ? { low: Math.min(...areas), high: Math.max(...areas) } : null;
}

export function quoteWestgateUnit(unit: WestgateUnit, plan: WestgatePlan) {
  if (unit.status !== "LIBRE") throw new Error("La unidad está reservada");
  const totalCents = plan === "contado" ? unit.cashCents : plan === "aporte50" ? unit.halfCents : unit.thirtyCents;
  const percent = plan === "contado" ? 100 : plan === "aporte50" ? 50 : 30;
  const initialCents = Math.round(totalCents * percent / 100);
  return {
    total: totalCents / 100,
    initial: initialCents / 100,
    balance: plan === "contado" ? null : (totalCents - initialCents) / 100,
    percent,
    rate: Math.round(totalCents / unit.areaM2) / 100,
  };
}

export function westgateContactText(model: WestgateModel, unit: WestgateUnit | null, plan: WestgatePlan): string {
  const label = WESTGATE_PLANS.find(option => option.id === plan)!.label;
  return unit && unit.status === "LIBRE"
    ? `Hola, vengo de N.I.A. Quiero la unidad ${unit.code}, piso ${unit.floor}, ${model.name} (${formatWestgateM2(unit.areaM2)} m²) en Westgate Tower.\nPlan: ${label}.\n¿Sigue disponible y cuáles son los pasos para reservar?`
    : `Hola, vengo de N.I.A. Me interesa ${model.name} en Westgate Tower.\nQuiero conocer las opciones disponibles de este modelo.\n¿Me ayudan a elegir una unidad y revisar las formas de pago?`;
}
