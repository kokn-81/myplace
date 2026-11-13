export type AlphaRooms = "1" | "2";
export type AlphaEstado = "LIBRE";
export type AlphaPlan = "contado" | "aporte50" | "aporte40";
export type AlphaAddon = "none" | "parking" | "parkingStorage" | "storage";

export const ALPHA_LUXE_CONFIG = {
  id: "alpha-luxe",
  name: "Alpha by Luxe Design",
  builder: "Luxe Design",
  address: "Avenida Beni, a pasos del 2.º anillo",
  zone: "Norte",
  city: "Santa Cruz de la Sierra",
  delivery: "Febrero 2028",
  priceListLabel: "27/10/2026",
  levels: 21,
  homes: 102,
  listed: 62,
  lat: -17.7692349,
  lng: -63.1782311,
  mapsUrl: "https://maps.app.goo.gl/sxdAyEQrUhUuYB7v8",
  brochurePdfUrl: "https://drive.google.com/file/d/1LYHuoO2R9nSXXqdMF9rj27n7ZmVb59qp/view",
  priceListUrl: "https://drive.google.com/file/d/1dtoz3cYgfHEC9tUnZvlYNUZVNdYnvdpP/view",
  parkingUsd: 12000,
  parkingStorageUsd: 16000,
  storageUsd: 4000,
};

export interface AlphaModel {
  id: string;
  tipo: number;
  name: string;
  rooms: AlphaRooms;
  areaM2: number;
  floors: number[];
  where: string;
  detail: string;
  preview: string;
  plan: string;
}

export interface AlphaUnit {
  codigo: string;
  piso: number;
  tipo: number;
  modelId: string;
  rooms: AlphaRooms;
  superficieM2: number;
  estado: AlphaEstado;
  cash: number;
  plan50: number;
  plan40: number;
  cashPerM2: number;
  plan50PerM2: number;
  plan40PerM2: number;
  cashCents: number;
  plan50Cents: number;
  plan40Cents: number;
}

export interface AlphaQuote {
  total: number;
  initial: number;
  balance: number | null;
  department: number;
  parking: number;
  rate: number;
  percent: 100 | 50 | 40;
}

const AREA_HUNDREDTHS: Record<number, number> = {
  1: 8560,
  2: 5210,
  3: 4970,
  4: 4970,
  5: 4970,
  6: 5035,
  7: 3650,
  8: 3430,
  9: 3430,
};

const LISTED: Record<number, number[]> = {
  4: [1, 2, 4, 5, 6, 7, 8, 9],
  5: [1, 4, 5, 6, 7, 8, 9],
  6: [3, 4, 5, 6],
  7: [1, 4, 5, 6],
  8: [4, 5, 6],
  9: [1, 4, 5, 6],
  10: [1, 4, 6],
  11: [1, 3, 4, 5, 6],
  12: [1, 3, 4, 5, 6],
  13: [1, 3, 4, 5, 6],
  14: [1, 4, 5, 6],
  15: [1, 4, 5],
  16: [1, 3, 4],
  17: [5, 6],
  18: [1, 5],
};

const MODEL_COPY: Record<number, { rooms: AlphaRooms; where: string; detail: string }> = {
  1: { rooms: "2", where: "Con balcón", detail: "2 dormitorios con balcón. Incluye horno." },
  2: { rooms: "1", where: "Con balcón", detail: "1 dormitorio con balcón." },
  3: { rooms: "1", where: "Con balcón", detail: "1 dormitorio con balcón." },
  4: { rooms: "1", where: "Con balcón", detail: "1 dormitorio con balcón." },
  5: { rooms: "1", where: "Con balcón", detail: "1 dormitorio con balcón." },
  6: { rooms: "1", where: "Con balcón", detail: "1 dormitorio con balcón." },
  7: { rooms: "1", where: "1 dormitorio", detail: "1 dormitorio." },
  8: { rooms: "1", where: "1 dormitorio", detail: "1 dormitorio." },
  9: { rooms: "1", where: "1 dormitorio", detail: "1 dormitorio." },
};

function rates(piso: number, tipo: number) {
  if (piso >= 11) return { plan40: 1564, plan50: 1496, cash: 1394 };
  if (tipo >= 7) return { plan40: 1548, plan50: 1482, cash: 1383 };
  return { plan40: 1518, plan50: 1452, cash: 1353 };
}

const fromCents = (cents: number) => cents / 100;

export const ALPHA_UNITS: AlphaUnit[] = Object.entries(LISTED).flatMap(([floor, tipos]) => {
  const piso = Number(floor);
  return tipos.map((tipo) => {
    const area = AREA_HUNDREDTHS[tipo];
    const rate = rates(piso, tipo);
    const cashCents = area * rate.cash;
    const plan50Cents = area * rate.plan50;
    const plan40Cents = area * rate.plan40;
    return {
      codigo: `${piso}-${tipo}`,
      piso,
      tipo,
      modelId: String(tipo),
      rooms: MODEL_COPY[tipo].rooms,
      superficieM2: area / 100,
      estado: "LIBRE" as const,
      cash: fromCents(cashCents),
      plan50: fromCents(plan50Cents),
      plan40: fromCents(plan40Cents),
      cashPerM2: rate.cash,
      plan50PerM2: rate.plan50,
      plan40PerM2: rate.plan40,
      cashCents,
      plan50Cents,
      plan40Cents,
    };
  });
});

export const ALPHA_MODELS: AlphaModel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((tipo) => {
  const copy = MODEL_COPY[tipo];
  const floors = ALPHA_UNITS.filter((unit) => unit.tipo === tipo).map((unit) => unit.piso);
  return {
    id: String(tipo),
    tipo,
    name: `Tipo ${tipo}`,
    rooms: copy.rooms,
    areaM2: AREA_HUNDREDTHS[tipo] / 100,
    floors,
    where: copy.where,
    detail: copy.detail,
    preview: `/alpha_luxe/modelos/${tipo}.jpg`,
    plan: `/alpha_luxe/planos/${tipo}.jpg`,
  };
});

export function formatAlphaUsd(value: number): string {
  const negative = value < 0;
  const abs = Math.abs(value);
  const [whole, frac] = abs.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const body = frac === "00" ? grouped : `${grouped},${frac}`;
  return `${negative ? "-" : ""}${body}`;
}

export function formatAlphaM2(value: number): string {
  return value.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function alphaModel(id: string): AlphaModel {
  const found = ALPHA_MODELS.find((model) => model.id === id);
  if (!found) throw new Error(`Modelo desconocido: ${id}`);
  return found;
}

export function unitsForModel(modelId: string, units: AlphaUnit[] = ALPHA_UNITS): AlphaUnit[] {
  return units.filter((unit) => unit.modelId === modelId).sort((a, b) => a.piso - b.piso);
}

export function minCashForRooms(rooms: AlphaRooms, units: AlphaUnit[] = ALPHA_UNITS): number | null {
  const prices = units.filter((unit) => unit.rooms === rooms).map((unit) => unit.cashCents);
  return prices.length ? fromCents(Math.min(...prices)) : null;
}

export function minCash(units: AlphaUnit[] = ALPHA_UNITS): number {
  return fromCents(Math.min(...units.map((unit) => unit.cashCents)));
}

export function minRate(plan: AlphaPlan, units: AlphaUnit[] = ALPHA_UNITS): number {
  const key = plan === "contado" ? "cashPerM2" : plan === "aporte50" ? "plan50PerM2" : "plan40PerM2";
  return Math.min(...units.map((unit) => unit[key]));
}

export function areaRangeForRooms(rooms: AlphaRooms) {
  const sizes = ALPHA_UNITS.filter((unit) => unit.rooms === rooms).map((unit) => unit.superficieM2);
  if (sizes.length === 0) return null;
  return { low: Math.min(...sizes), high: Math.max(...sizes) };
}

const addonCents = (addon: AlphaAddon) => {
  if (addon === "parking") return ALPHA_LUXE_CONFIG.parkingUsd * 100;
  if (addon === "parkingStorage") return ALPHA_LUXE_CONFIG.parkingStorageUsd * 100;
  if (addon === "storage") return ALPHA_LUXE_CONFIG.storageUsd * 100;
  return 0;
};

export function quoteAlphaUnit(unit: AlphaUnit, plan: AlphaPlan, addon: AlphaAddon): AlphaQuote {
  const departmentCents = plan === "contado" ? unit.cashCents : plan === "aporte50" ? unit.plan50Cents : unit.plan40Cents;
  const rate = plan === "contado" ? unit.cashPerM2 : plan === "aporte50" ? unit.plan50PerM2 : unit.plan40PerM2;
  const percent = plan === "contado" ? 100 : plan === "aporte50" ? 50 : 40;
  const parkingCents = addonCents(addon);
  if (plan === "contado") {
    const total = departmentCents + parkingCents;
    return {
      total: fromCents(total),
      initial: fromCents(total),
      balance: null,
      department: fromCents(departmentCents),
      parking: fromCents(parkingCents),
      rate,
      percent,
    };
  }
  const initialDepartment = Math.round((departmentCents * percent) / 100);
  const balance = departmentCents - initialDepartment;
  return {
    total: fromCents(departmentCents + parkingCents),
    initial: fromCents(initialDepartment + parkingCents),
    balance: fromCents(balance),
    department: fromCents(departmentCents),
    parking: fromCents(parkingCents),
    rate,
    percent,
  };
}
