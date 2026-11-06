/* Béton Brut II. Prices and availability come from the official list
 * "07 Béton Brut II - Disponibilidad.pdf", vigente al 25/10/2026.
 * There is no live Google Sheet. Do not invent a reserve, a rent, or a plusvalía.
 */

export type BetonRooms = "1" | "2" | "3";
export type BetonEstado = "LIBRE" | "VENDIDO";
export type BetonPlan = "contado" | "plan";
export type BetonAddon = "none" | "auto" | "moto";

export interface BetonModel {
  id: string;
  letter: string;
  rooms: BetonRooms;
  name: string;
  areaM2: number;
  areaNote: string;
  where: string;
  detail: string;
  preview: string;
  full: string;
}

export interface BetonUnit {
  codigo: string;
  piso: number;
  letra: string;
  modelId: string;
  rooms: BetonRooms;
  tipologia: string;
  ubicacion: string;
  superficieM2: number;
  estado: BetonEstado;
  precioContado: number | null;
  precioPlan: number | null;
}

export const BETON_BRUT_CONFIG = {
  id: "beton-brut-ii",
  name: "Béton Brut II",
  zone: "Equipetrol",
  address: "Calle 8, Equipetrol, entre 2° y 3° anillo",
  city: "Santa Cruz de la Sierra",
  delivery: "Diciembre 2028",
  totalUnits: 40,
  floors: "7 niveles de departamentos",
  priceListDate: "2026-10-25",
  priceListLabel: "25/10/2026",
  cashPerM2: 1700,
  planPerM2: 1800,
  parkingCarUsd: 13000,
  parkingMotoUsd: 3000,
  lat: -17.7663,
  lng: -63.1957,
  driveFolder: "https://drive.google.com/drive/folders/1hSSACfbzwdtL1BQwnQPUz9CJoEklUuau",
  brochurePdfUrl: "https://drive.google.com/file/d/1cevw8pGJfGvkdDF3hhO8FYNUqOKgLrMz/view",
  priceListUrl: "https://drive.google.com/file/d/1VYjukAAfQ3d3W5rXtmtDvv4gShpv-L3-/view",
  website: "https://www.betonbrut.com.bo",
  instagram: "https://www.instagram.com/betonbrut24/",
};

export const BETON_MODELS: BetonModel[] = [
  {
    id: "d-1-5",
    letter: "D",
    rooms: "1",
    name: "Modelo D · pisos 1 a 5",
    areaM2: 57.38,
    areaNote: "",
    where: "Vista a vecino, con balcón",
    detail: "1 dormitorio. Cocina, living comedor, 1 baño, balcón y área de servicio.",
    preview: "/beton_brut/modelos/d-1-5.jpg",
    full: "/beton_brut/fichas/d-1-5.jpg",
  },
  {
    id: "b-1-5",
    letter: "B",
    rooms: "1",
    name: "Modelo B · pisos 1 a 5",
    areaM2: 67.69,
    areaNote: "",
    where: "Contrafachada, con balcón",
    detail: "1 dormitorio en suite. Cocina, living comedor, baño de visitas, balcón y área de servicio.",
    preview: "/beton_brut/modelos/b-1-5.jpg",
    full: "/beton_brut/fichas/b-1-5.jpg",
  },
  {
    id: "c-1-5",
    letter: "C",
    rooms: "1",
    name: "Modelo C · pisos 1 a 5",
    areaM2: 77.53,
    areaNote: "",
    where: "Contrafachada, con balcón",
    detail: "1 dormitorio en suite. Cocina, living comedor, baño de visitas, balcón y área de servicio.",
    preview: "/beton_brut/modelos/c-1-5.jpg",
    full: "/beton_brut/fichas/c-1-5.jpg",
  },
  {
    id: "b-7",
    letter: "B",
    rooms: "1",
    name: "Modelo B · piso 7",
    areaM2: 59.01,
    areaNote: "",
    where: "Contrafachada",
    detail: "1 dormitorio. Cocina, living comedor, 1 baño y área de servicio.",
    preview: "/beton_brut/modelos/b-7.jpg",
    full: "/beton_brut/fichas/b-7.jpg",
  },
  {
    id: "c-7",
    letter: "C",
    rooms: "1",
    name: "Modelo C · piso 7",
    areaM2: 73.18,
    areaNote: "",
    where: "Contrafachada",
    detail: "1 dormitorio en suite. Cocina, living comedor, baño de visitas y área de servicio.",
    preview: "/beton_brut/modelos/c-7.jpg",
    full: "/beton_brut/fichas/c-7.jpg",
  },
  {
    id: "a-7",
    letter: "A",
    rooms: "1",
    name: "Modelo A · piso 7",
    areaM2: 81.93,
    areaNote: "",
    where: "Vista perpetua a la iglesia",
    detail: "1 dormitorio en suite. Cocina, living comedor, baño de visitas y área de servicio.",
    preview: "/beton_brut/modelos/a-7.jpg",
    full: "/beton_brut/fichas/a-7.jpg",
  },
  {
    id: "b-6",
    letter: "B",
    rooms: "1",
    name: "Modelo B · piso 6",
    areaM2: 95.42,
    areaNote: "",
    where: "Contrafachada, con balcón",
    detail: "1 dormitorio. Cocina, living comedor, 1 baño, terraza y área de servicio.",
    preview: "/beton_brut/modelos/b-6.jpg",
    full: "/beton_brut/fichas/b-6.jpg",
  },
  {
    id: "c-6",
    letter: "C",
    rooms: "1",
    name: "Modelo C · piso 6",
    areaM2: 96.74,
    areaNote: "",
    where: "Contrafachada, con balcón",
    detail: "1 dormitorio en suite. Cocina, living comedor, baño de visitas, terraza y área de servicio.",
    preview: "/beton_brut/modelos/c-6.jpg",
    full: "/beton_brut/fichas/c-6.jpg",
  },
  {
    id: "a-6",
    letter: "A",
    rooms: "1",
    name: "Modelo A · piso 6",
    areaM2: 106.78,
    areaNote: "El plano marca 106,78 m². La lista de precios anota 105,82 m². La unidad está vendida.",
    where: "Vista perpetua a la iglesia, con balcón",
    detail: "1 dormitorio en suite. Cocina, living comedor, baño de visitas, terraza y área de servicio.",
    preview: "/beton_brut/modelos/a-6.jpg",
    full: "/beton_brut/fichas/a-6.jpg",
  },
  {
    id: "e-7",
    letter: "E",
    rooms: "2",
    name: "Modelo E · piso 7",
    areaM2: 99.21,
    areaNote: "",
    where: "Fachada",
    detail: "2 dormitorios en suite. Cocina, living comedor, baño de visitas y área de servicio.",
    preview: "/beton_brut/modelos/e-7.jpg",
    full: "/beton_brut/fichas/e-7.jpg",
  },
  {
    id: "e-1-5",
    letter: "E",
    rooms: "2",
    name: "Modelo E · pisos 1 a 5",
    areaM2: 105.16,
    areaNote: "",
    where: "Fachada, con balcón",
    detail: "2 dormitorios en suite. Cocina, living comedor, baño de visitas, balcón y área de servicio.",
    preview: "/beton_brut/modelos/e-1-5.jpg",
    full: "/beton_brut/fichas/e-1-5.jpg",
  },
  {
    id: "f-1-5",
    letter: "F",
    rooms: "2",
    name: "Modelo F · pisos 1 a 5",
    areaM2: 131.33,
    areaNote: "",
    where: "Fachada, con balcón",
    detail: "2 dormitorios en suite. Cocina, living comedor, baño de visitas, balcón y área de servicio.",
    preview: "/beton_brut/modelos/f-1-5.jpg",
    full: "/beton_brut/fichas/f-1-5.jpg",
  },
  {
    id: "d-6",
    letter: "D",
    rooms: "2",
    name: "Modelo D · piso 6",
    areaM2: 133.52,
    areaNote: "",
    where: "Fachada, con balcón",
    detail: "2 dormitorios en suite. Cocina, living comedor, baño de visitas, terraza y área de servicio.",
    preview: "/beton_brut/modelos/d-6.jpg",
    full: "/beton_brut/fichas/d-6.jpg",
  },
  {
    id: "e-6",
    letter: "E",
    rooms: "2",
    name: "Modelo E · piso 6",
    areaM2: 129.99,
    areaNote: "",
    where: "Fachada, con balcón",
    detail: "2 dormitorios en suite. Cocina, living comedor, baño de visitas, terraza y área de servicio.",
    preview: "/beton_brut/modelos/e-6.jpg",
    full: "/beton_brut/fichas/e-6.jpg",
  },
  {
    id: "d-7",
    letter: "D",
    rooms: "2",
    name: "Modelo D · piso 7",
    areaM2: 89.05,
    areaNote: "",
    where: "Fachada",
    detail: "2 dormitorios en suite. Cocina, living comedor, baño de visitas y área de servicio.",
    preview: "/beton_brut/modelos/d-7.jpg",
    full: "/beton_brut/fichas/d-7.jpg",
  },
  {
    id: "a-1-5",
    letter: "A",
    rooms: "3",
    name: "Modelo A · pisos 1 a 5",
    areaM2: 149.65,
    areaNote: "",
    where: "Pasillo · vista perpetua a la iglesia",
    detail: "3 dormitorios en suite. Cocina, living comedor, baño de visitas, balcón y área de servicio.",
    preview: "/beton_brut/modelos/a-1-5.jpg",
    full: "/beton_brut/fichas/a-1-5.jpg",
  },
];

interface RowSeed {
  letra: string;
  modelId: string;
  rooms: BetonRooms;
  tipologia: string;
  ubicacion: string;
  m2: number;
  contado: number;
  plan: number;
}

const SOLD = new Set(["5F", "6A", "6E", "7D"]);

const FLOORS_1_5: RowSeed[] = [
  { letra: "A", modelId: "a-1-5", rooms: "3", tipologia: "3 dormitorios", ubicacion: "Pasillo · vista perpetua a la iglesia", m2: 149.65, contado: 254405, plan: 269370 },
  { letra: "B", modelId: "b-1-5", rooms: "1", tipologia: "1 dormitorio", ubicacion: "Contrafachada con balcón", m2: 67.69, contado: 115073, plan: 121842 },
  { letra: "C", modelId: "c-1-5", rooms: "1", tipologia: "1 dormitorio", ubicacion: "Contrafachada con balcón", m2: 77.53, contado: 131801, plan: 139554 },
  { letra: "D", modelId: "d-1-5", rooms: "1", tipologia: "1 dormitorio", ubicacion: "Vista a vecino con balcón", m2: 57.38, contado: 97546, plan: 103284 },
  { letra: "E", modelId: "e-1-5", rooms: "2", tipologia: "2 dormitorios", ubicacion: "Fachada con balcón", m2: 105.16, contado: 178772, plan: 189288 },
  { letra: "F", modelId: "f-1-5", rooms: "2", tipologia: "2 dormitorios", ubicacion: "Fachada con balcón", m2: 131.33, contado: 223261, plan: 236394 },
];

const FLOOR_6: RowSeed[] = [
  { letra: "A", modelId: "a-6", rooms: "1", tipologia: "1 dormitorio", ubicacion: "Vista perpetua a la iglesia con balcón", m2: 105.82, contado: 0, plan: 0 },
  { letra: "B", modelId: "b-6", rooms: "1", tipologia: "1 dormitorio", ubicacion: "Contrafachada con balcón", m2: 95.42, contado: 162214, plan: 171756 },
  { letra: "C", modelId: "c-6", rooms: "1", tipologia: "1 dormitorio", ubicacion: "Contrafachada con balcón", m2: 96.74, contado: 164458, plan: 174132 },
  { letra: "D", modelId: "d-6", rooms: "2", tipologia: "2 dormitorios", ubicacion: "Fachada con balcón", m2: 133.52, contado: 226984, plan: 240336 },
  { letra: "E", modelId: "e-6", rooms: "2", tipologia: "2 dormitorios", ubicacion: "Fachada con balcón", m2: 129.99, contado: 0, plan: 0 },
];

const FLOOR_7: RowSeed[] = [
  { letra: "A", modelId: "a-7", rooms: "1", tipologia: "1 dormitorio", ubicacion: "Vista perpetua a la iglesia", m2: 81.93, contado: 139281, plan: 147474 },
  { letra: "B", modelId: "b-7", rooms: "1", tipologia: "1 dormitorio", ubicacion: "Contrafachada", m2: 59.01, contado: 100317, plan: 106218 },
  { letra: "C", modelId: "c-7", rooms: "1", tipologia: "1 dormitorio", ubicacion: "Contrafachada", m2: 73.18, contado: 124406, plan: 131724 },
  { letra: "D", modelId: "d-7", rooms: "2", tipologia: "2 dormitorios", ubicacion: "Fachada", m2: 89.05, contado: 0, plan: 0 },
  { letra: "E", modelId: "e-7", rooms: "2", tipologia: "2 dormitorios", ubicacion: "Fachada", m2: 99.21, contado: 168657, plan: 178578 },
];

function expand(floors: number[], rows: RowSeed[]): BetonUnit[] {
  const units: BetonUnit[] = [];
  for (const piso of floors) {
    for (const row of rows) {
      const codigo = `${piso}${row.letra}`;
      const sold = SOLD.has(codigo);
      units.push({
        codigo,
        piso,
        letra: row.letra,
        modelId: row.modelId,
        rooms: row.rooms,
        tipologia: row.tipologia,
        ubicacion: row.ubicacion,
        superficieM2: row.m2,
        estado: sold ? "VENDIDO" : "LIBRE",
        precioContado: sold ? null : row.contado,
        precioPlan: sold ? null : row.plan,
      });
    }
  }
  return units;
}

export const BETON_UNITS: BetonUnit[] = [
  ...expand([1, 2, 3, 4, 5], FLOORS_1_5),
  ...expand([6], FLOOR_6),
  ...expand([7], FLOOR_7),
];

export function formatBetonUsd(value: number): string {
  return Math.round(value).toLocaleString("es-BO");
}

export function formatBetonM2(value: number): string {
  return value.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function betonModel(id: string): BetonModel {
  const found = BETON_MODELS.find((model) => model.id === id);
  if (!found) throw new Error(`Modelo desconocido: ${id}`);
  return found;
}

export function unitsForModel(modelId: string, units: BetonUnit[] = BETON_UNITS): BetonUnit[] {
  return units.filter((unit) => unit.modelId === modelId).sort((a, b) => a.piso - b.piso);
}

export function minContadoForRooms(rooms: BetonRooms, units: BetonUnit[] = BETON_UNITS): number | null {
  const prices = units
    .filter((unit) => unit.rooms === rooms && unit.estado === "LIBRE" && unit.precioContado != null)
    .map((unit) => unit.precioContado as number);
  return prices.length ? Math.min(...prices) : null;
}

export function minContado(units: BetonUnit[] = BETON_UNITS): number {
  const prices = units.filter((unit) => unit.estado === "LIBRE" && unit.precioContado != null).map((unit) => unit.precioContado as number);
  return Math.min(...prices);
}

export interface BetonQuote {
  total: number;
  initial: number;
  balance: number | null;
  installments: number;
  department: number;
  parking: number;
  rate: number;
}

export function quoteBetonUnit(unit: BetonUnit, plan: BetonPlan, addon: BetonAddon): BetonQuote | null {
  const department = plan === "contado" ? unit.precioContado : unit.precioPlan;
  if (department == null) return null;
  const parking = addon === "auto" ? BETON_BRUT_CONFIG.parkingCarUsd : addon === "moto" ? BETON_BRUT_CONFIG.parkingMotoUsd : 0;
  if (plan === "contado") {
    const total = department + parking;
    return { total, initial: total, balance: null, installments: 0, department, parking, rate: BETON_BRUT_CONFIG.cashPerM2 };
  }
  const initial = Math.round(department * 0.3);
  const balance = Math.round(department * 0.4);
  const installments = department - initial - balance;
  return {
    total: department + parking,
    initial,
    balance,
    installments,
    department,
    parking,
    rate: BETON_BRUT_CONFIG.planPerM2,
  };
}
