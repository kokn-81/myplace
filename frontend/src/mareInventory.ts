export type MareRooms = "1" | "2" | "3";

export const MARE_CONFIG = {
  id: "mare",
  name: "Mare",
  builder: "Mariscal Construcciones",
  commercial: "Lifestyle Group S.C.",
  address: "3.er anillo externo, esquina Calle Los Nogales",
  near: "Al lado de Chaplin Show",
  zone: "Equipetrol",
  city: "Santa Cruz de la Sierra",
  lat: -17.7656331,
  lng: -63.2003751,
  mapsUrl: "https://maps.app.goo.gl/uH1fBKSAnxCJ3gQq8",
  brochurePdfUrl: "https://drive.google.com/file/d/1jg73MSH_EjcW8AAI2Ts8iE4ldgdRuBPM/view",
};

export interface MareModel {
  id: string;
  name: string;
  rooms: MareRooms;
  beds: string;
  detail: string;
  preview: string;
}

export interface MareUnit {
  codigo: string;
  modelId: string;
  rooms: MareRooms;
  piso: string;
  superficieM2: number;
  cash: number;
  cashCents: number;
  note: string;
  parkingIncluded: boolean;
}

export interface MareQuote {
  total: number;
  initial: number;
  balance: null;
  department: number;
  percent: 100;
}

export const MARE_MODELS: MareModel[] = [
  {
    id: "16",
    name: "Tipo 16",
    rooms: "1",
    beds: "1 habitación",
    detail: "51,67 m². En el piso 12 el vestidor va incluido.",
    preview: "/mare/modelos/16.jpg",
  },
  {
    id: "17",
    name: "Tipo 17",
    rooms: "1",
    beds: "1 habitación",
    detail: "72,26 m² en el piso 20, con balcón.",
    preview: "/mare/modelos/17.jpg",
  },
  {
    id: "20",
    name: "Tipo 20",
    rooms: "1",
    beds: "1 habitación dúplex",
    detail: "60,10 m² en los pisos 25 y 26. Incluye parqueo XL y baulera Mz-108, y muebles fijos.",
    preview: "/mare/modelos/20.jpg",
  },
  {
    id: "12",
    name: "Tipo 12",
    rooms: "2",
    beds: "2 habitaciones",
    detail: "83,37 m² en el piso 5 y 83,19 m² en el piso 10, con balcón.",
    preview: "/mare/modelos/12.jpg",
  },
  {
    id: "4",
    name: "Tipo 4",
    rooms: "2",
    beds: "2 habitaciones",
    detail: "86,76 m² en el piso 8, con balcón.",
    preview: "/mare/modelos/4.jpg",
  },
  {
    id: "1",
    name: "Tipo 1'",
    rooms: "3",
    beds: "3 habitaciones",
    detail: "142,75 m² en el piso 22, con balcón.",
    preview: "/mare/modelos/1.jpg",
  },
];

const ROWS: [string, string, number, number, string, boolean][] = [
  ["16", "10", 5167, 101210, "", false],
  ["16", "12", 5167, 103515, "Vestidor incluido", false],
  ["17", "20", 7226, 145265, "", false],
  ["20", "25 y 26", 6010, 160000, "Parqueo XL y baulera Mz-108 incluidos", true],
  ["12", "5", 8337, 156430, "", false],
  ["12", "10", 8319, 158665, "", false],
  ["4", "8", 8676, 165500, "", false],
  ["1", "22", 14275, 279620, "", false],
];

export const MARE_UNITS: MareUnit[] = ROWS.map(([modelId, piso, area, cash, note, parkingIncluded]) => {
  const model = MARE_MODELS.find((item) => item.id === modelId);
  if (!model) throw new Error(modelId);
  return {
    codigo: `${modelId}-${piso.replace(/\s+/g, "")}`,
    modelId,
    rooms: model.rooms,
    piso,
    superficieM2: area / 100,
    cash,
    cashCents: cash * 100,
    note,
    parkingIncluded,
  };
});

export function formatMareUsd(value: number): string {
  const [whole, frac] = Math.abs(value).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return frac === "00" ? grouped : `${grouped},${frac}`;
}

export function formatMareM2(value: number): string {
  return value.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function unitsForModel(modelId: string, units: MareUnit[] = MARE_UNITS): MareUnit[] {
  return units.filter((unit) => unit.modelId === modelId);
}

export function minCashForRooms(rooms: MareRooms, units: MareUnit[] = MARE_UNITS): number | null {
  const prices = units.filter((unit) => unit.rooms === rooms).map((unit) => unit.cashCents);
  return prices.length ? Math.min(...prices) / 100 : null;
}

export function minCash(units: MareUnit[] = MARE_UNITS): number {
  return Math.min(...units.map((unit) => unit.cashCents)) / 100;
}

export function areaRangeForRooms(rooms: MareRooms, units: MareUnit[] = MARE_UNITS) {
  const sizes = units.filter((unit) => unit.rooms === rooms).map((unit) => unit.superficieM2);
  if (sizes.length === 0) return null;
  return { low: Math.min(...sizes), high: Math.max(...sizes) };
}

export function quoteMareUnit(unit: MareUnit): MareQuote {
  if (unit.cashCents <= 0) throw new Error("Sin precio");
  return {
    total: unit.cashCents / 100,
    initial: unit.cashCents / 100,
    balance: null,
    department: unit.cashCents / 100,
    percent: 100,
  };
}
