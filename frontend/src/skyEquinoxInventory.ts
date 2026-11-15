export type SkyEquinoxRooms = "0" | "1";
export type SkyEquinoxPlan = "contado" | "aporte20";

export const SKY_EQUINOX_CONFIG = {
  id: "sky-equinox",
  name: "Sky Equinox",
  builder: "Sky Properties",
  address: "Sirari, Calle Los Jazmines, 4.º anillo",
  zone: "Sirari",
  city: "Santa Cruz de la Sierra",
  delivery: "Junio 2027",
  levels: 22,
  lat: -17.7658745,
  lng: -63.2049568,
  mapsUrl: "https://maps.app.goo.gl/a8jEVqYQyMW33AMLA",
  brochurePdfUrl: "https://drive.google.com/file/d/1LO-bKqZdGOfhSh_EnTt-CrDcaRYSSEaL/view",
  priceListUrl: "https://drive.google.com/file/d/10MicvNCWxCHynCxVGTHuFdiqHOsh7cG6/view",
  finishedProjects: 38,
  deliveredUnits: 2718,
  years: 24,
};

export interface SkyEquinoxModel {
  id: string;
  name: string;
  rooms: SkyEquinoxRooms;
  where: string;
  detail: string;
  preview: string;
  interior: string;
  plan: string;
}

export interface SkyEquinoxUnit {
  codigo: string;
  modelId: string;
  rooms: SkyEquinoxRooms;
  band: string;
  superficieM2: number;
  cash: number;
  plan20: number;
  cashPerM2: number;
  plan20PerM2: number;
  cashCents: number;
  plan20Cents: number;
}

export interface SkyEquinoxQuote {
  total: number;
  initial: number;
  balance: number | null;
  department: number;
  rate: number | null;
  percent: 100 | 20;
}

interface Band {
  codigo: string;
  modelId: string;
  rooms: SkyEquinoxRooms;
  band: string;
  areaHundredths: number;
  cash: number;
  plan20: number;
  cashPerM2: number;
  plan20PerM2: number;
}

const BANDS: Band[] = [
  { codigo: "b-4-16", modelId: "b", rooms: "1", band: "Pisos 4 al 16", areaHundredths: 4990, cash: 74850, plan20: 79840, cashPerM2: 1500, plan20PerM2: 1600 },
  { codigo: "b-17-20", modelId: "b", rooms: "1", band: "Pisos 17 al 20", areaHundredths: 4880, cash: 74850, plan20: 79840, cashPerM2: 1534, plan20PerM2: 1636 },
  { codigo: "a-4-16", modelId: "a", rooms: "1", band: "Pisos 4 al 16", areaHundredths: 5530, cash: 82950, plan20: 88480, cashPerM2: 1500, plan20PerM2: 1600 },
  { codigo: "a-17-20", modelId: "a", rooms: "1", band: "Pisos 17 al 20", areaHundredths: 5400, cash: 82950, plan20: 88480, cashPerM2: 1536, plan20PerM2: 1639 },
  { codigo: "c-4-20", modelId: "c", rooms: "0", band: "Pisos 4 al 20", areaHundredths: 3520, cash: 52800, plan20: 56320, cashPerM2: 1500, plan20PerM2: 1600 },
];

const fromCents = (cents: number) => cents / 100;

export const SKY_EQUINOX_UNITS: SkyEquinoxUnit[] = BANDS.map((band) => ({
  codigo: band.codigo,
  modelId: band.modelId,
  rooms: band.rooms,
  band: band.band,
  superficieM2: band.areaHundredths / 100,
  cash: band.cash,
  plan20: band.plan20,
  cashPerM2: band.cashPerM2,
  plan20PerM2: band.plan20PerM2,
  cashCents: band.cash * 100,
  plan20Cents: band.plan20 * 100,
}));

export const SKY_EQUINOX_MODELS: SkyEquinoxModel[] = [
  {
    id: "b",
    name: "Modelo B",
    rooms: "1",
    where: "1 dormitorio",
    detail: "1 dormitorio en suite y baño de visitas. 49,90 m² del piso 4 al 16, y 48,80 m² del 17 al 20.",
    preview: "/sky_equinox/modelos/b.jpg",
    interior: "/sky_equinox/modelos/b.jpg",
    plan: "/sky_equinox/planta.jpg",
  },
  {
    id: "a",
    name: "Modelo A",
    rooms: "1",
    where: "Con balcón",
    detail: "1 dormitorio en suite, baño de visitas y balcón. 55,30 m² del piso 4 al 16, y 54,00 m² del 17 al 20.",
    preview: "/sky_equinox/modelos/a.jpg",
    interior: "/sky_equinox/interiores/a.jpg",
    plan: "/sky_equinox/planta.jpg",
  },
  {
    id: "c",
    name: "Modelo C",
    rooms: "0",
    where: "Studio con balcón",
    detail: "Estudio equipado, baño completo y balcón. 35,20 m² del piso 4 al 20.",
    preview: "/sky_equinox/modelos/c.jpg",
    interior: "/sky_equinox/interiores/c.jpg",
    plan: "/sky_equinox/planta.jpg",
  },
];

export function formatSkyEquinoxUsd(value: number): string {
  const [whole, frac] = Math.abs(value).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return frac === "00" ? grouped : `${grouped},${frac}`;
}

export function formatSkyEquinoxM2(value: number): string {
  return value.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function unitsForModel(modelId: string, units: SkyEquinoxUnit[] = SKY_EQUINOX_UNITS): SkyEquinoxUnit[] {
  return units.filter((unit) => unit.modelId === modelId);
}

export function minCashForRooms(rooms: SkyEquinoxRooms, units: SkyEquinoxUnit[] = SKY_EQUINOX_UNITS): number | null {
  const prices = units.filter((unit) => unit.rooms === rooms).map((unit) => unit.cashCents);
  return prices.length ? fromCents(Math.min(...prices)) : null;
}

export function minCash(units: SkyEquinoxUnit[] = SKY_EQUINOX_UNITS): number {
  return fromCents(Math.min(...units.map((unit) => unit.cashCents)));
}

export function minRate(plan: SkyEquinoxPlan, units: SkyEquinoxUnit[] = SKY_EQUINOX_UNITS): number {
  const key = plan === "contado" ? "cashPerM2" : "plan20PerM2";
  const exact = units.filter((unit) => {
    const department = plan === "contado" ? unit.cashCents : unit.plan20Cents;
    const rate = unit[key];
    return Math.round(unit.superficieM2 * 100) * rate === department;
  });
  return Math.min(...exact.map((unit) => unit[key]));
}

export function areaRangeForRooms(rooms: SkyEquinoxRooms, units: SkyEquinoxUnit[] = SKY_EQUINOX_UNITS) {
  const sizes = units.filter((unit) => unit.rooms === rooms).map((unit) => unit.superficieM2);
  if (sizes.length === 0) return null;
  return { low: Math.min(...sizes), high: Math.max(...sizes) };
}

export function quoteSkyEquinoxUnit(unit: SkyEquinoxUnit, plan: SkyEquinoxPlan): SkyEquinoxQuote {
  const departmentCents = plan === "contado" ? unit.cashCents : unit.plan20Cents;
  const rate = plan === "contado" ? unit.cashPerM2 : unit.plan20PerM2;
  const rateMatches = Math.round(unit.superficieM2 * 100) * rate === departmentCents;
  if (plan === "contado") {
    return {
      total: fromCents(departmentCents),
      initial: fromCents(departmentCents),
      balance: null,
      department: fromCents(departmentCents),
      rate: rateMatches ? rate : null,
      percent: 100,
    };
  }
  const initial = (departmentCents * 20) / 100;
  return {
    total: fromCents(departmentCents),
    initial: fromCents(initial),
    balance: fromCents(departmentCents - initial),
    department: fromCents(departmentCents),
    rate: rateMatches ? rate : null,
    percent: 20,
  };
}
