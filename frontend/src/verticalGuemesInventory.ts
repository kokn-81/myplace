/* Vertical Güemes. Prices and availability come from
 * "Precios y Disponibilidad Vertical Güemes REMAX.pdf" (archivo del 5/11/2026).
 * There is no live sheet. Do not invent a reserve, a rent, or a plusvalía.
 * NO DISPONIBLE stays "NO_DISPONIBLE": the list does not say sold versus reserved.
 */

export type VerticalRooms = "1" | "2" | "3";
export type VerticalEstado = "LIBRE" | "NO_DISPONIBLE";
export type VerticalPlan = "contado" | "aporte75" | "aporte50";
export type VerticalAddon = "none" | "parking" | "parkingStorage";

export interface VerticalModel {
  id: string;
  rooms: VerticalRooms;
  name: string;
  areaM2: number;
  where: string;
  detail: string;
  preview: string;
  plan: string;
  full: string;
}

export interface VerticalUnit {
  codigo: string;
  piso: number;
  letra: string;
  modelId: string;
  rooms: VerticalRooms;
  interiorM2: number;
  terraceM2: number;
  superficieM2: number;
  estado: VerticalEstado;
  cashPerM2: number;
  cash: number;
  plan75PerM2: number;
  plan75: number;
  plan50PerM2: number;
  plan50: number;
}

export const VERTICAL_GUEMES_CONFIG = {
  id: "vertical-guemes",
  name: "Vertical Güemes",
  zone: "Equipetrol",
  address: "Calle Manuel Güemes",
  city: "Santa Cruz de la Sierra",
  delivery: "Julio 2028",
  builder: "Constructora Mediterráneo",
  architect: "Sommet",
  totalUnits: 59,
  levels: "20 niveles",
  priceListDate: "2026-11-05",
  priceListLabel: "5/11/2026",
  parkingUsd: 13580,
  parkingStorageUsd: 17080,
  lat: -17.7699027,
  lng: -63.1910632,
  mapsUrl: "https://maps.app.goo.gl/MVYyYVWBhZ1AS4zb9",
  brochurePdfUrl: "https://drive.google.com/file/d/1ydbglyaAKd1z9A9oKfZpSXtKsElSRo1G/view",
  priceListUrl: "https://drive.google.com/file/d/1IKDzrOawLDxMHpmgzra4v5DihePTHsA7/view",
  rendersFolder: "https://drive.google.com/drive/folders/1TDboFMoPQZCY3ruD1HUx7iWpJzQpa3V0",
};

type Raw = [
  number,
  string,
  1 | 2 | 3,
  string,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  0 | 1,
];

const RAW: Raw[] = [
  [3, "A", 1, "1-terraza", 44.2, 29.54, 73.74, 1425, 87692.8, 1450, 89180.57, 1475, 90641.82, 1],
  [3, "B", 2, "2-terraza", 65.05, 43.1, 108.15, 1425, 127267.35, 1450, 129401.5, 1475, 131547.81, 0],
  [3, "C", 3, "3-terraza", 92.27, 61.55, 153.82, 1425, 182971.41, 1450, 186039.39, 1475, 189124.9, 0],
  [4, "A", 1, "1-51", 51.55, 0, 51.55, 1425, 73458.75, 1450, 74747.5, 1475, 76036.25, 1],
  [4, "B", 1, "1-49", 49.91, 0, 49.91, 1450, 72369.5, 1475, 73617.25, 1500, 74865, 1],
  [4, "C", 1, "1-49", 49.91, 0, 49.91, 1425, 71121.75, 1450, 72369.5, 1475, 73617.25, 0],
  [4, "D", 1, "1-51", 51.55, 0, 51.55, 1450, 74747.5, 1475, 76036.25, 1500, 77325, 0],
  [5, "A", 1, "1-51", 51.55, 0, 51.55, 1510, 77840.5, 1535.11, 79134.92, 1560.37, 80437.07, 0],
  [5, "B", 1, "1-49", 49.91, 0, 49.91, 1510, 75364.1, 1535.11, 76617.34, 1560.37, 77878.07, 1],
  [5, "C", 1, "1-49", 49.91, 0, 49.91, 1510, 75364.1, 1535.11, 76617.34, 1560.37, 77878.07, 1],
  [5, "D", 1, "1-51", 51.55, 0, 51.55, 1510, 77840.5, 1535.11, 79134.92, 1560.37, 80437.07, 1],
  [6, "A", 1, "1-51", 51.55, 0, 51.55, 1520, 78356, 1534.11, 79083.37, 1570.72, 80970.62, 1],
  [6, "B", 1, "1-49", 49.91, 0, 49.91, 1520, 75863.2, 1534.11, 76567.43, 1570.72, 78394.64, 1],
  [6, "C", 1, "1-49", 49.91, 0, 49.91, 1520, 75863.2, 1534.11, 76567.43, 1570.72, 78394.64, 1],
  [6, "D", 1, "1-51", 51.55, 0, 51.55, 1520, 78356, 1534.11, 79083.37, 1570.72, 80970.62, 1],
  [7, "A", 1, "1-51", 51.55, 0, 51.55, 1530, 78871.5, 1555.46, 80183.96, 1581.06, 81503.64, 1],
  [7, "B", 1, "1-49", 49.91, 0, 49.91, 1530, 76362.3, 1555.46, 77633.01, 1581.06, 78910.7, 0],
  [7, "C", 1, "1-49", 49.91, 0, 49.91, 1530, 76362.3, 1555.46, 77633.01, 1581.06, 78910.7, 1],
  [7, "D", 1, "1-51", 51.55, 0, 51.55, 1530, 78871.5, 1555.46, 80183.96, 1581.06, 81503.64, 1],
  [8, "A", 1, "1-51", 51.55, 0, 51.55, 1540, 79387, 1565.63, 80708.23, 1591.41, 82037.19, 0],
  [8, "B", 1, "1-49", 49.91, 0, 49.91, 1540, 76861.4, 1565.63, 78140.59, 1591.41, 79427.27, 1],
  [8, "C", 1, "1-49", 49.91, 0, 49.91, 1540, 76861.4, 1565.63, 78140.59, 1591.41, 79427.27, 1],
  [8, "D", 1, "1-51", 51.55, 0, 51.55, 1540, 79387, 1565.63, 80708.23, 1591.41, 82037.19, 0],
  [9, "A", 1, "1-51", 51.55, 0, 51.55, 1550, 79902.5, 1575.8, 81232.49, 1601.75, 82570.21, 0],
  [9, "B", 1, "1-49", 49.91, 0, 49.91, 1550, 77360.5, 1575.8, 78648.18, 1601.75, 79943.34, 0],
  [9, "C", 1, "1-49", 49.91, 0, 49.91, 1550, 77360.5, 1575.8, 78648.18, 1601.75, 79943.34, 1],
  [9, "D", 1, "1-51", 51.55, 0, 51.55, 1550, 79902.5, 1575.8, 81232.49, 1601.75, 82570.21, 1],
  [10, "A", 1, "1-51", 51.55, 0, 51.55, 1560, 80418, 1585.97, 81756.75, 1612.1, 83103.76, 0],
  [10, "B", 1, "1-49", 49.91, 0, 49.91, 1560, 77859.6, 1585.97, 79155.76, 1612.1, 80459.91, 0],
  [10, "C", 1, "1-49", 49.91, 0, 49.91, 1560, 77859.6, 1585.97, 79155.76, 1612.1, 80459.91, 1],
  [10, "D", 1, "1-51", 51.55, 0, 51.55, 1560, 80418, 1585.97, 81756.75, 1612.1, 83103.76, 1],
  [11, "A", 1, "1-51", 51.55, 0, 51.55, 1570, 80933.5, 1596.14, 82281.02, 1622.44, 83636.78, 0],
  [11, "B", 1, "1-49", 49.91, 0, 49.91, 1570, 78358.7, 1596.14, 79663.35, 1622.44, 80975.98, 0],
  [11, "C", 1, "1-49", 49.91, 0, 49.91, 1570, 78358.7, 1596.14, 79663.35, 1622.44, 80975.98, 0],
  [11, "D", 1, "1-51", 51.55, 0, 51.55, 1570, 80933.5, 1596.14, 82281.02, 1622.44, 83636.78, 0],
  [12, "A", 1, "1-51", 51.55, 0, 51.55, 1580, 81449, 1609, 82943.95, 1633, 84181.15, 0],
  [12, "B", 1, "1-49", 49.91, 0, 49.91, 1580, 78857.8, 1609, 80305.19, 1633, 81503.03, 0],
  [12, "C", 1, "1-49", 49.91, 0, 49.91, 1580, 78857.8, 1609, 80305.19, 1633, 81503.03, 0],
  [12, "D", 1, "1-51", 51.55, 0, 51.55, 1580, 81449, 1609, 82943.95, 1633, 84181.15, 0],
  [13, "A", 1, "1-51", 51.55, 0, 51.55, 1595, 82222.25, 1621.57, 83591.93, 1648.3, 84969.87, 0],
  [13, "B", 2, "2-74", 74.75, 0, 74.75, 1595, 119226.25, 1621.57, 121212.36, 1648.3, 123210.43, 1],
  [13, "C", 2, "2-76", 76.48, 0, 76.48, 1595, 121985.6, 1621.57, 124017.67, 1648.3, 126061.98, 0],
  [14, "A", 1, "1-51", 51.55, 0, 51.55, 1610, 82995.5, 1636.83, 84378.59, 1663.82, 85769.92, 0],
  [14, "B", 2, "2-74", 74.75, 0, 74.75, 1610, 120347.5, 1636.83, 122353.04, 1663.82, 124370.55, 0],
  [14, "C", 2, "2-76", 76.48, 0, 76.48, 1610, 123132.8, 1636.83, 125184.76, 1663.82, 127248.95, 1],
  [15, "A", 1, "1-51", 51.55, 0, 51.55, 1630, 84026.5, 1670, 86088.5, 1684.51, 86836.49, 0],
  [15, "B", 2, "2-74", 74.75, 0, 74.75, 1630, 121842.5, 1670, 124832.5, 1684.51, 125917.12, 0],
  [15, "C", 2, "2-76", 76.48, 0, 76.48, 1630, 124662.4, 1670, 127721.6, 1684.51, 128831.32, 0],
  [16, "A", 1, "1-51", 51.55, 0, 51.55, 1637.5, 84413.13, 1657.18, 85427.63, 1690, 87119.5, 0],
  [16, "B", 2, "2-74", 74.75, 0, 74.75, 1637.5, 122403.13, 1657.18, 123874.21, 1690, 126327.5, 1],
  [16, "C", 2, "2-76", 76.48, 0, 76.48, 1637.5, 125236, 1657.18, 126741.13, 1690, 129251.2, 1],
  [17, "A", 1, "1-51", 51.55, 0, 51.55, 1645, 84799.75, 1677.5, 86475.13, 1697.5, 87506.13, 0],
  [17, "B", 2, "2-74", 74.75, 0, 74.75, 1645, 122963.75, 1677.5, 125393.13, 1697.5, 126888.13, 0],
  [17, "C", 2, "2-76", 76.48, 0, 76.48, 1645, 125809.6, 1677.5, 128295.2, 1697.5, 129824.8, 0],
  [18, "A", 1, "1-51", 51.55, 0, 51.55, 1653, 85186.38, 1685, 86861.75, 1705, 87892.75, 0],
  [18, "B", 2, "2-74", 74.75, 0, 74.75, 1653, 123524.38, 1685, 125953.75, 1705, 127448.75, 0],
  [18, "C", 2, "2-76", 76.48, 0, 76.48, 1653, 126383.2, 1685, 128868.8, 1705, 130398.4, 0],
  [19, "B", 2, "2-76", 76.48, 0, 76.48, 1660, 126956.8, 1692.5, 129442.4, 1712.5, 130972, 0],
  [19, "C", 2, "2-76", 76.48, 0, 76.48, 1660, 126956.8, 1692.5, 129442.4, 1712.5, 130972, 0],
];

const roomsOf = (rooms: 1 | 2 | 3): VerticalRooms => (rooms === 1 ? "1" : rooms === 2 ? "2" : "3");

export const VERTICAL_UNITS: VerticalUnit[] = RAW.map((row) => ({
  piso: row[0],
  letra: row[1],
  codigo: `${row[0]}${row[1]}`,
  rooms: roomsOf(row[2]),
  modelId: row[3],
  interiorM2: row[4],
  terraceM2: row[5],
  superficieM2: row[6],
  cashPerM2: row[7],
  cash: row[8],
  plan75PerM2: row[9],
  plan75: row[10],
  plan50PerM2: row[11],
  plan50: row[12],
  estado: row[13] === 1 ? "LIBRE" : "NO_DISPONIBLE",
}));

const img = (folder: string, id: string) => `/vertical_guemes/${folder}/${id}.jpg`;

export const VERTICAL_MODELS: VerticalModel[] = [
  {
    id: "1-49",
    rooms: "1",
    name: "1 dormitorio 49,91 m²",
    areaM2: 49.91,
    where: "Con balcón",
    detail: "Niveles 4 al 12. Área social, cocina y dormitorio, con balcón para disfrutar cada día.",
    preview: img("modelos", "1"),
    plan: img("planos", "1"),
    full: img("fichas", "1"),
  },
  {
    id: "1-51",
    rooms: "1",
    name: "1 dormitorio 51,55 m²",
    areaM2: 51.55,
    where: "Con balcón",
    detail: "Niveles 4 al 18. Más espacio para tu rutina, con área social, cocina, dormitorio y balcón.",
    preview: img("modelos", "1"),
    plan: img("planos", "1"),
    full: img("fichas", "1"),
  },
  {
    id: "1-terraza",
    rooms: "1",
    name: "1 dormitorio con terraza",
    areaM2: 73.74,
    where: "Terraza privada, nivel 3",
    detail: "44,20 m² interiores y terraza privada de 29,54 m² para disfrutar al aire libre, en el nivel 3. La planta publicada es la tipo con balcón.",
    preview: img("modelos", "1"),
    plan: img("planos", "1"),
    full: img("fichas", "1"),
  },
  {
    id: "2-74",
    rooms: "2",
    name: "2 dormitorios 74,75 m²",
    areaM2: 74.75,
    where: "Con balcón",
    detail: "Niveles 13 al 18. Dos dormitorios para tu próxima etapa, con área social, cocina y balcón.",
    preview: img("modelos", "2"),
    plan: img("planos", "2"),
    full: img("fichas", "2"),
  },
  {
    id: "2-76",
    rooms: "2",
    name: "2 dormitorios 76,48 m²",
    areaM2: 76.48,
    where: "Con balcón",
    detail: "Niveles 13 al 19. Dos dormitorios para combinar encuentros y privacidad, con área social, cocina y balcón.",
    preview: img("modelos", "2"),
    plan: img("planos", "2"),
    full: img("fichas", "2"),
  },
  {
    id: "2-terraza",
    rooms: "2",
    name: "2 dormitorios con terraza",
    areaM2: 108.15,
    where: "Terraza privada, nivel 3",
    detail: "65,05 m² interiores y terraza privada de 43,10 m² para tus encuentros, en el nivel 3. La planta publicada es la tipo con balcón.",
    preview: img("modelos", "2"),
    plan: img("planos", "2"),
    full: img("fichas", "2"),
  },
  {
    id: "3-terraza",
    rooms: "3",
    name: "3 dormitorios con terraza",
    areaM2: 153.82,
    where: "Terraza privada, nivel 3",
    detail: "92,27 m² interiores y terraza privada de 61,55 m²: más lugar para tu familia y tus encuentros.",
    preview: img("modelos", "3"),
    plan: img("planos", "3"),
    full: img("fichas", "3"),
  },
];

export function formatVerticalUsd(value: number): string {
  const negative = value < 0;
  const abs = Math.abs(value);
  const [whole, frac] = abs.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const body = frac === "00" ? grouped : `${grouped},${frac}`;
  return `${negative ? "-" : ""}${body}`;
}

export function formatVerticalM2(value: number): string {
  return value.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function verticalModel(id: string): VerticalModel {
  const found = VERTICAL_MODELS.find((model) => model.id === id);
  if (!found) throw new Error(`Modelo desconocido: ${id}`);
  return found;
}

export function unitsForModel(modelId: string, units: VerticalUnit[] = VERTICAL_UNITS): VerticalUnit[] {
  return units.filter((unit) => unit.modelId === modelId).sort((a, b) => a.piso - b.piso || a.letra.localeCompare(b.letra));
}

export function minCashForRooms(rooms: VerticalRooms, units: VerticalUnit[] = VERTICAL_UNITS): number | null {
  const prices = units
    .filter((unit) => unit.rooms === rooms && unit.estado === "LIBRE")
    .map((unit) => unit.cash);
  return prices.length ? Math.min(...prices) : null;
}

export function minCash(units: VerticalUnit[] = VERTICAL_UNITS): number {
  return Math.min(...units.filter((unit) => unit.estado === "LIBRE").map((unit) => unit.cash));
}

export function minRate(plan: VerticalPlan, units: VerticalUnit[] = VERTICAL_UNITS): number {
  const free = units.filter((unit) => unit.estado === "LIBRE");
  const rates = free.map((unit) => (plan === "contado" ? unit.cashPerM2 : plan === "aporte75" ? unit.plan75PerM2 : unit.plan50PerM2));
  return Math.min(...rates);
}

const money = (value: number) => Math.round(value * 100) / 100;

export interface VerticalQuote {
  total: number;
  initial: number;
  balance: number | null;
  department: number;
  parking: number;
  rate: number;
  percent: 100 | 75 | 50;
}

export function quoteVerticalUnit(unit: VerticalUnit, plan: VerticalPlan, addon: VerticalAddon): VerticalQuote | null {
  if (unit.estado !== "LIBRE") return null;
  const department = plan === "contado" ? unit.cash : plan === "aporte75" ? unit.plan75 : unit.plan50;
  const rate = plan === "contado" ? unit.cashPerM2 : plan === "aporte75" ? unit.plan75PerM2 : unit.plan50PerM2;
  const percent = plan === "contado" ? 100 : plan === "aporte75" ? 75 : 50;
  const parking = addon === "parking" ? VERTICAL_GUEMES_CONFIG.parkingUsd : addon === "parkingStorage" ? VERTICAL_GUEMES_CONFIG.parkingStorageUsd : 0;
  if (plan === "contado") {
    const total = money(department + parking);
    return { total, initial: total, balance: null, department, parking, rate, percent };
  }
  const initialDepartment = money(department * (percent / 100));
  const balance = money(department - initialDepartment);
  return {
    total: money(department + parking),
    initial: money(initialDepartment + parking),
    balance,
    department,
    parking,
    rate,
    percent,
  };
}
