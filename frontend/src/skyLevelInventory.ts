export type SkyLevelRooms = "1" | "2" | "local";
export type SkyLevelEstado = "LIBRE" | "VENDIDO";
export type SkyLevelPlan = "contado" | "aporte20";
export type SkyLevelAddon = "none" | "parkingStorage";

export const SKY_LEVEL_CONFIG = {
  id: "sky-level",
  name: "Sky Level",
  builder: "Sky Properties",
  address: "Equipetrol, entre el 2.º y el 3.er anillo",
  streets: "Calle 5, Calle Enrique Finot y Calle 6 Oeste",
  near: "a 150 m de la Av. San Martín",
  zone: "Equipetrol",
  city: "Santa Cruz de la Sierra",
  delivery: "Marzo 2027",
  levels: 18,
  lat: -17.7682141,
  lng: -63.1963337,
  mapsUrl: "https://maps.app.goo.gl/f5jopf8v2UnCV2Jr8",
  brochurePdfUrl: "https://drive.google.com/file/d/182nHLNjRn6TNrMb9Xd-ITT70dQt_58w8/view",
  priceListUrl: "https://drive.google.com/file/d/1ONQSd05Ib6GtL2V4KGI4qvpMYleqs2FQ/view",
  parkingStorageUsd: 15000,
  finishedProjects: 37,
  deliveredUnits: 2518,
  years: 24,
};

export interface SkyLevelModel {
  id: string;
  name: string;
  rooms: SkyLevelRooms;
  areaM2: number;
  estado: SkyLevelEstado;
  where: string;
  detail: string;
  preview: string;
  interior: string;
  plan: string;
}

export interface SkyLevelUnit {
  codigo: string;
  modelId: string;
  rooms: SkyLevelRooms;
  superficieM2: number;
  estado: SkyLevelEstado;
  cash: number;
  plan20: number;
  cashPerM2: number;
  plan20PerM2: number;
  cashCents: number;
  plan20Cents: number;
}

export interface SkyLevelQuote {
  total: number;
  initial: number;
  balance: number | null;
  department: number;
  parking: number;
  rate: number | null;
  percent: 100 | 20;
}

interface Row {
  id: string;
  name: string;
  rooms: SkyLevelRooms;
  areaHundredths: number;
  estado: SkyLevelEstado;
  cash: number;
  plan20: number;
  cashPerM2: number;
  plan20PerM2: number;
  where: string;
  detail: string;
}

const ROWS: Row[] = [
  {
    id: "m2",
    name: "Modelo 2",
    rooms: "2",
    areaHundredths: 8850,
    estado: "LIBRE",
    cash: 132750,
    plan20: 141600,
    cashPerM2: 1500,
    plan20PerM2: 1600,
    where: "Con balcón",
    detail: "2 dormitorios en suite, baño de visitas y balcón. En la planta tipo: deptos. 1, 6, 13 y 18.",
  },
  {
    id: "m1",
    name: "Modelo 1",
    rooms: "2",
    areaHundredths: 9400,
    estado: "LIBRE",
    cash: 141000,
    plan20: 150400,
    cashPerM2: 1500,
    plan20PerM2: 1600,
    where: "Con balcón",
    detail: "2 dormitorios en suite, baño de visitas y balcón. En la planta tipo: deptos. 2, 3, 4, 5, 14, 15, 16 y 17.",
  },
  {
    id: "m4",
    name: "Modelo 4",
    rooms: "1",
    areaHundredths: 5200,
    estado: "LIBRE",
    cash: 78000,
    plan20: 83200,
    cashPerM2: 1500,
    plan20PerM2: 1600,
    where: "1 dormitorio",
    detail: "1 dormitorio en suite y baño de visitas. En la planta tipo: deptos. 8, 11, 20 y 23.",
  },
  {
    id: "m5",
    name: "Modelo 5",
    rooms: "1",
    areaHundredths: 5000,
    estado: "VENDIDO",
    cash: 0,
    plan20: 0,
    cashPerM2: 0,
    plan20PerM2: 0,
    where: "Con balcón",
    detail: "1 dormitorio en suite, baño de visitas y balcón. En la planta tipo: deptos. 9, 10, 21 y 22.",
  },
  {
    id: "m3",
    name: "Modelo 3",
    rooms: "1",
    areaHundredths: 5400,
    estado: "VENDIDO",
    cash: 0,
    plan20: 0,
    cashPerM2: 0,
    plan20PerM2: 0,
    where: "1 dormitorio",
    detail: "1 dormitorio en suite y baño de visitas. En la planta tipo: deptos. 7, 12, 19 y 24.",
  },
  {
    id: "c106",
    name: "Local 106 m²",
    rooms: "local",
    areaHundredths: 10600,
    estado: "LIBRE",
    cash: 265000,
    plan20: 275600,
    cashPerM2: 2500,
    plan20PerM2: 2600,
    where: "Planta baja",
    detail: "Local comercial de 106 m² en planta baja.",
  },
  {
    id: "c75",
    name: "Local 75 m²",
    rooms: "local",
    areaHundredths: 7500,
    estado: "VENDIDO",
    cash: 0,
    plan20: 0,
    cashPerM2: 0,
    plan20PerM2: 0,
    where: "Planta baja",
    detail: "Local comercial de 75 m² en planta baja.",
  },
  {
    id: "c635",
    name: "Local 63,50 m²",
    rooms: "local",
    areaHundredths: 6350,
    estado: "VENDIDO",
    cash: 0,
    plan20: 0,
    cashPerM2: 0,
    plan20PerM2: 0,
    where: "Planta baja",
    detail: "Local comercial de 63,50 m² en planta baja.",
  },
];

const fromCents = (cents: number) => cents / 100;

export const SKY_LEVEL_UNITS: SkyLevelUnit[] = ROWS.map((row) => ({
  codigo: row.id,
  modelId: row.id,
  rooms: row.rooms,
  superficieM2: row.areaHundredths / 100,
  estado: row.estado,
  cash: row.cash,
  plan20: row.plan20,
  cashPerM2: row.cashPerM2,
  plan20PerM2: row.plan20PerM2,
  cashCents: row.cash * 100,
  plan20Cents: row.plan20 * 100,
}));

export const SKY_LEVEL_MODELS: SkyLevelModel[] = ROWS.map((row) => ({
  id: row.id,
  name: row.name,
  rooms: row.rooms,
  areaM2: row.areaHundredths / 100,
  estado: row.estado,
  where: row.where,
  detail: row.detail,
  preview: row.rooms === "local" ? "/sky_level/comercial.jpg" : `/sky_level/modelos/${row.id}.jpg`,
  interior: row.rooms === "local" ? "/sky_level/comercial.jpg" : `/sky_level/interiores/${row.id}.jpg`,
  plan: row.rooms === "local" ? "/sky_level/comercial.jpg" : "/sky_level/planta.jpg",
}));

export function formatSkyLevelUsd(value: number): string {
  const [whole, frac] = Math.abs(value).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return frac === "00" ? grouped : `${grouped},${frac}`;
}

export function formatSkyLevelM2(value: number): string {
  return value.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function skyLevelModel(id: string): SkyLevelModel {
  const found = SKY_LEVEL_MODELS.find((model) => model.id === id);
  if (!found) throw new Error(`Modelo desconocido: ${id}`);
  return found;
}

export function skyLevelUnit(id: string): SkyLevelUnit | null {
  return SKY_LEVEL_UNITS.find((unit) => unit.codigo === id) || null;
}

const freeUnits = (units: SkyLevelUnit[]) => units.filter((unit) => unit.estado === "LIBRE" && unit.cashCents > 0);

export function minCashForRooms(rooms: SkyLevelRooms, units: SkyLevelUnit[] = SKY_LEVEL_UNITS): number | null {
  const prices = freeUnits(units).filter((unit) => unit.rooms === rooms).map((unit) => unit.cashCents);
  return prices.length ? fromCents(Math.min(...prices)) : null;
}

export function minApartmentCash(units: SkyLevelUnit[] = SKY_LEVEL_UNITS): number {
  const prices = freeUnits(units).filter((unit) => unit.rooms !== "local").map((unit) => unit.cashCents);
  return fromCents(Math.min(...prices));
}

export function minRate(plan: SkyLevelPlan, units: SkyLevelUnit[] = SKY_LEVEL_UNITS): number {
  const key = plan === "contado" ? "cashPerM2" : "plan20PerM2";
  return Math.min(...freeUnits(units).map((unit) => unit[key]));
}

export function areaRangeForRooms(rooms: SkyLevelRooms, units: SkyLevelUnit[] = SKY_LEVEL_UNITS) {
  const sizes = units.filter((unit) => unit.rooms === rooms).map((unit) => unit.superficieM2);
  if (sizes.length === 0) return null;
  return { low: Math.min(...sizes), high: Math.max(...sizes) };
}

export function quoteSkyLevelUnit(unit: SkyLevelUnit, plan: SkyLevelPlan, addon: SkyLevelAddon): SkyLevelQuote {
  if (unit.estado !== "LIBRE" || unit.cashCents <= 0) {
    throw new Error(`Sin precio publicado: ${unit.codigo}`);
  }
  const departmentCents = plan === "contado" ? unit.cashCents : unit.plan20Cents;
  const rate = plan === "contado" ? unit.cashPerM2 : unit.plan20PerM2;
  const areaCents = Math.round(unit.superficieM2 * 100);
  const rateMatches = rate > 0 && areaCents * rate === departmentCents;
  const parkingCents = addon === "parkingStorage" ? SKY_LEVEL_CONFIG.parkingStorageUsd * 100 : 0;
  if (plan === "contado") {
    const total = departmentCents + parkingCents;
    return {
      total: fromCents(total),
      initial: fromCents(total),
      balance: null,
      department: fromCents(departmentCents),
      parking: fromCents(parkingCents),
      rate: rateMatches ? rate : null,
      percent: 100,
    };
  }
  const initialDepartment = (departmentCents * 20) / 100;
  const balance = departmentCents - initialDepartment;
  return {
    total: fromCents(departmentCents + parkingCents),
    initial: fromCents(initialDepartment + parkingCents),
    balance: fromCents(balance),
    department: fromCents(departmentCents),
    parking: fromCents(parkingCents),
    rate: rateMatches ? rate : null,
    percent: 20,
  };
}
