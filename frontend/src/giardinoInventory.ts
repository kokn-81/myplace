export type GiardinoRooms = "1" | "2" | "3";

export const GIARDINO_CONFIG = {
  id: "giardino",
  name: "Giardino",
  address: "Av. San Martín y 3.er anillo",
  zone: "Equipetrol",
  city: "Santa Cruz de la Sierra",
  lat: -17.7635749,
  lng: -63.1974606,
  mapsUrl: "https://maps.app.goo.gl/6TbW26yL7cTKRPH66",
  brochurePdfUrl: "https://drive.google.com/file/d/1igp_mc_aGHIqv-7cK1vLIPCNkfaMY9lu/view",
  availabilityPdfUrl: "https://drive.google.com/file/d/1M9o8i501Z_d-pxSQ2QMOlY6MmTkHUeZ9/view",
  availabilityDate: "27/11/2026",
  reservePercent: 15,
};

export interface GiardinoModel {
  id: string;
  name: string;
  rooms: GiardinoRooms;
  sector: string;
  beds: string;
  view: string;
  internalM2: number;
  preview: string;
  interior: string;
}

export interface GiardinoUnit {
  codigo: string;
  modelId: string;
  rooms: GiardinoRooms;
  piso: number;
  terraceM2: number;
  totalM2: number;
  cash: number;
  cashCents: number;
}

export interface GiardinoQuote {
  total: number;
  reserve: number;
  balance: number;
  department: number;
  percent: 15;
}

const fromHundredths = (value: number) => value / 100;

export const GIARDINO_MODELS: GiardinoModel[] = [
  {
    id: "01",
    name: "Tipo 01",
    rooms: "2",
    sector: "Residenza",
    beds: "2 habitaciones",
    view: "Av. San Martín y Urubó",
    internalM2: 110.5,
    preview: "/giardino/modelos/01.jpg",
    interior: "/giardino/interiores/2hab.jpg",
  },
  {
    id: "02",
    name: "Tipo 02",
    rooms: "3",
    sector: "Residenza",
    beds: "3 habitaciones",
    view: "Hotel Los Tajibos y Av. San Martín",
    internalM2: 124.0,
    preview: "/giardino/modelos/02.jpg",
    interior: "/giardino/interiores/3hab.jpg",
  },
  {
    id: "03",
    name: "Tipo 03",
    rooms: "2",
    sector: "Residenza",
    beds: "2 habitaciones",
    view: "Hotel Los Tajibos",
    internalM2: 95.8,
    preview: "/giardino/modelos/03.jpg",
    interior: "/giardino/interiores/2hab.jpg",
  },
  {
    id: "04",
    name: "Tipo 04",
    rooms: "2",
    sector: "Residenza",
    beds: "2 habitaciones",
    view: "Hotel Los Tajibos, 3.er anillo y UTEPSA",
    internalM2: 100.0,
    preview: "/giardino/modelos/04.jpg",
    interior: "/giardino/interiores/2hab.jpg",
  },
  {
    id: "05",
    name: "Tipo 05",
    rooms: "1",
    sector: "Vita",
    beds: "1 habitación",
    view: "3.er anillo externo y UTEPSA",
    internalM2: 52.0,
    preview: "/giardino/modelos/05.jpg",
    interior: "/giardino/interiores/1hab.jpg",
  },
  {
    id: "06",
    name: "Tipo 06",
    rooms: "1",
    sector: "Vita",
    beds: "1 habitación",
    view: "3.er anillo externo y UTEPSA",
    internalM2: 52.0,
    preview: "/giardino/modelos/06.jpg",
    interior: "/giardino/interiores/1hab.jpg",
  },
  {
    id: "08",
    name: "Tipo 08",
    rooms: "1",
    sector: "Vita",
    beds: "1 habitación",
    view: "3.er anillo externo y Urubó",
    internalM2: 59.0,
    preview: "/giardino/modelos/08.jpg",
    interior: "/giardino/interiores/1hab.jpg",
  },
  {
    id: "09",
    name: "Tipo 09",
    rooms: "1",
    sector: "Vita",
    beds: "1 habitación",
    view: "3.er anillo externo y Urubó",
    internalM2: 58.0,
    preview: "/giardino/modelos/09.jpg",
    interior: "/giardino/interiores/1hab.jpg",
  },
];

// Only priced, visible rows in the availability PDF dated 27/11/2026.
// Greyed-out floors and the unpriced La Riserva section are not available units.
const ROWS: [string, number, number, number, number][] = [
  ["01", 6, 7495, 18545, 411049],
  ["02", 18, 2659, 15059, 343093],
  ["02", 11, 2509, 14909, 333505],
  ["02", 6, 3098, 15498, 343510],
  ["03", 16, 1908, 11488, 260515],
  ["03", 14, 1900, 11480, 259175],
  ["03", 13, 1699, 11279, 253505],
  ["03", 9, 1699, 11279, 251134],
  ["03", 8, 1908, 11488, 255773],
  ["04", 11, 1804, 11804, 270120],
  ["04", 8, 2566, 12566, 279794],
  ["04", 6, 2482, 12482, 276701],
  ["05", 8, 1072, 6272, 139691],
  ["05", 6, 898, 6098, 135155],
  ["06", 9, 1067, 6267, 139588],
  ["06", 7, 969, 6169, 136701],
  ["06", 6, 887, 6087, 134948],
  ["08", 23, 1827, 7727, 181649],
  ["09", 26, 1472, 7272, 172474],
  ["09", 19, 1706, 7506, 174845],
];

export const GIARDINO_UNITS: GiardinoUnit[] = ROWS.map(([modelId, piso, terrace, total, cash]) => {
  const model = GIARDINO_MODELS.find((item) => item.id === modelId);
  if (!model) throw new Error(modelId);
  return {
    codigo: `${modelId}-${piso}`,
    modelId,
    rooms: model.rooms,
    piso,
    terraceM2: fromHundredths(terrace),
    totalM2: fromHundredths(total),
    cash,
    cashCents: cash * 100,
  };
});

export function formatGiardinoUsd(value: number): string {
  const [whole, frac] = Math.abs(value).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return frac === "00" ? grouped : `${grouped},${frac}`;
}

export function formatGiardinoM2(value: number): string {
  return value.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function unitsForModel(modelId: string, units: GiardinoUnit[] = GIARDINO_UNITS): GiardinoUnit[] {
  return units.filter((unit) => unit.modelId === modelId).sort((a, b) => b.piso - a.piso);
}

export function minCashForRooms(rooms: GiardinoRooms, units: GiardinoUnit[] = GIARDINO_UNITS): number | null {
  const prices = units.filter((unit) => unit.rooms === rooms).map((unit) => unit.cashCents);
  return prices.length ? Math.min(...prices) / 100 : null;
}

export function minCash(units: GiardinoUnit[] = GIARDINO_UNITS): number {
  return Math.min(...units.map((unit) => unit.cashCents)) / 100;
}

export function areaRangeForRooms(rooms: GiardinoRooms, units: GiardinoUnit[] = GIARDINO_UNITS) {
  const sizes = units.filter((unit) => unit.rooms === rooms).map((unit) => unit.totalM2);
  if (sizes.length === 0) return null;
  return { low: Math.min(...sizes), high: Math.max(...sizes) };
}

export function quoteGiardinoUnit(unit: GiardinoUnit): GiardinoQuote {
  if (unit.cashCents <= 0) throw new Error("Sin precio");
  const reserve = (unit.cashCents * GIARDINO_CONFIG.reservePercent) / 100;
  return {
    total: unit.cashCents / 100,
    reserve: reserve / 100,
    balance: (unit.cashCents - reserve) / 100,
    department: unit.cashCents / 100,
    percent: 15,
  };
}
