export type GiardinoRooms = "1" | "2" | "3";

export const GIARDINO_CONFIG = {
  id: "giardino",
  name: "Giardino",
  collaborator: "RE/MAX Fortaleza",
  address: "Av. San Martín y 3.er anillo",
  zone: "Equipetrol",
  city: "Santa Cruz de la Sierra",
  lat: -17.7635749,
  lng: -63.1974606,
  mapsUrl: "https://maps.app.goo.gl/6TbW26yL7cTKRPH66",
  brochurePdfUrl: "https://drive.google.com/file/d/1igp_mc_aGHIqv-7cK1vLIPCNkfaMY9lu/view",
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

const ROWS: [string, number, number, number, number][] = [
  ["01", 30, 2590, 13640, 305155],
  ["01", 29, 2110, 13160, 293093],
  ["01", 28, 2420, 13470, 300000],
  ["01", 27, 2070, 13120, 290825],
  ["01", 26, 2590, 13640, 302371],
  ["01", 25, 2110, 13160, 290309],
  ["01", 24, 2420, 13470, 297216],
  ["01", 23, 2070, 13120, 288144],
  ["01", 22, 2590, 13640, 299485],
  ["01", 21, 2110, 13160, 287629],
  ["01", 20, 2420, 13470, 294433],
  ["01", 19, 2070, 13120, 285361],
  ["01", 18, 2590, 13640, 296701],
  ["01", 17, 2110, 13160, 284948],
  ["01", 16, 2420, 13470, 291649],
  ["01", 15, 2070, 13120, 282680],
  ["01", 14, 2590, 13640, 293918],
  ["01", 13, 2110, 13160, 282165],
  ["01", 12, 2420, 13470, 288866],
  ["01", 11, 2070, 13120, 280000],
  ["01", 10, 2590, 13640, 291031],
  ["01", 9, 2110, 13160, 279485],
  ["01", 8, 2420, 13470, 286082],
  ["01", 7, 2070, 13120, 277320],
  ["01", 6, 7427, 18477, 390515],
  ["02", 25, 2757, 15157, 350000],
  ["02", 24, 3181, 15581, 359794],
  ["02", 23, 2509, 14909, 342784],
  ["02", 22, 2659, 15059, 346186],
  ["02", 21, 2757, 15157, 346907],
  ["02", 20, 3181, 15581, 356598],
  ["02", 19, 2509, 14909, 339691],
  ["02", 18, 2659, 15059, 343093],
  ["02", 17, 2757, 15157, 343814],
  ["02", 16, 3181, 15581, 353402],
  ["02", 15, 2509, 14909, 336598],
  ["02", 14, 2659, 15059, 340000],
  ["02", 13, 2757, 15157, 340619],
  ["02", 12, 3181, 15581, 350206],
  ["02", 11, 2509, 14909, 333505],
  ["02", 10, 2659, 15059, 336907],
  ["02", 9, 2757, 15157, 337526],
  ["02", 8, 3181, 15581, 346907],
  ["02", 7, 2509, 14909, 330412],
  ["02", 6, 3098, 15498, 343510],
  ["03", 25, 1699, 11279, 260412],
  ["03", 24, 1908, 11488, 265258],
  ["03", 23, 1793, 11373, 261443],
  ["03", 22, 1900, 11480, 263918],
  ["03", 21, 1699, 11279, 258144],
  ["03", 20, 1908, 11488, 262887],
  ["03", 19, 1793, 11373, 259072],
  ["03", 18, 1900, 11480, 261546],
  ["03", 17, 1699, 11279, 255773],
  ["03", 16, 1908, 11488, 260515],
  ["03", 15, 1793, 11373, 256804],
  ["03", 14, 1900, 11480, 259175],
  ["03", 13, 1699, 11279, 253505],
  ["03", 12, 1908, 11488, 258144],
  ["03", 11, 1793, 11373, 254433],
  ["03", 10, 1900, 11480, 256804],
  ["03", 9, 1699, 11279, 251134],
  ["03", 8, 1908, 11488, 255773],
  ["03", 7, 1793, 11373, 252062],
  ["03", 6, 1900, 11480, 254433],
  ["04", 25, 2019, 12019, 277526],
  ["04", 24, 2566, 12566, 290206],
  ["04", 23, 1804, 11804, 271340],
  ["04", 22, 2482, 12482, 286907],
  ["04", 21, 2019, 12019, 275052],
  ["04", 20, 2566, 12566, 287629],
  ["04", 19, 1804, 11804, 268969],
  ["04", 18, 2482, 12482, 284433],
  ["04", 17, 2019, 12019, 272577],
  ["04", 16, 2566, 12566, 285052],
  ["04", 15, 1804, 11804, 266495],
  ["04", 14, 2482, 12482, 281856],
  ["04", 13, 2019, 12019, 270103],
  ["04", 12, 2566, 12566, 282371],
  ["04", 11, 1804, 11804, 270120],
  ["04", 10, 2482, 12482, 279278],
  ["04", 9, 2019, 12019, 267629],
  ["04", 8, 2566, 12566, 279794],
  ["04", 7, 1804, 11804, 261649],
  ["04", 6, 2482, 12482, 276701],
  ["05", 25, 859, 6059, 139897],
  ["05", 24, 1072, 6272, 144845],
  ["05", 23, 858, 6058, 139278],
  ["05", 22, 898, 6098, 140206],
  ["05", 21, 859, 6059, 138660],
  ["05", 20, 1072, 6272, 143505],
  ["05", 19, 858, 6058, 138041],
  ["05", 18, 898, 6098, 138969],
  ["05", 17, 859, 6059, 137423],
  ["05", 16, 1072, 6272, 142268],
  ["05", 15, 858, 6058, 136804],
  ["05", 14, 898, 6098, 137629],
  ["05", 13, 859, 6059, 136186],
  ["05", 12, 1072, 6272, 140928],
  ["05", 11, 858, 6058, 135567],
  ["05", 10, 898, 6098, 136392],
  ["05", 9, 859, 6059, 134948],
  ["05", 8, 1072, 6272, 139691],
  ["05", 7, 858, 6058, 134227],
  ["05", 6, 898, 6098, 135155],
  ["06", 30, 887, 6087, 142474],
  ["06", 29, 1067, 6267, 145979],
  ["06", 28, 772, 5972, 139175],
  ["06", 27, 969, 6169, 143093],
  ["06", 26, 887, 6087, 141237],
  ["06", 25, 1067, 6267, 144742],
  ["06", 24, 772, 5972, 137938],
  ["06", 23, 969, 6169, 141856],
  ["06", 22, 887, 6087, 139897],
  ["06", 21, 1067, 6267, 143402],
  ["06", 20, 772, 5972, 136701],
  ["06", 19, 969, 6169, 140515],
  ["06", 18, 887, 6087, 138660],
  ["06", 17, 1067, 6267, 142165],
  ["06", 16, 772, 5972, 135464],
  ["06", 15, 969, 6169, 139278],
  ["06", 14, 887, 6087, 137423],
  ["06", 13, 1067, 6267, 140825],
  ["06", 12, 772, 5972, 134227],
  ["06", 11, 969, 6169, 138041],
  ["06", 10, 887, 6087, 136186],
  ["06", 9, 1067, 6267, 139588],
  ["06", 8, 772, 5972, 132990],
  ["06", 7, 969, 6169, 136701],
  ["06", 6, 887, 6087, 134948],
  ["08", 30, 1921, 7821, 187010],
  ["08", 29, 1603, 7503, 178660],
  ["08", 28, 1750, 7650, 182165],
  ["08", 27, 1827, 7727, 183196],
  ["08", 26, 1921, 7821, 185464],
  ["08", 25, 1603, 7503, 177113],
  ["08", 24, 1750, 7650, 180619],
  ["08", 23, 1827, 7727, 181649],
  ["08", 22, 1921, 7821, 183814],
  ["08", 21, 1603, 7503, 175567],
  ["08", 20, 1750, 7650, 179072],
  ["08", 19, 1827, 7727, 180000],
  ["08", 18, 1921, 7821, 182268],
  ["08", 17, 1603, 7503, 174021],
  ["08", 16, 1750, 7650, 177423],
  ["08", 15, 1827, 7727, 178454],
  ["08", 14, 1921, 7821, 180619],
  ["08", 13, 1603, 7503, 172474],
  ["08", 12, 1750, 7650, 175876],
  ["08", 11, 1827, 7727, 176804],
  ["08", 10, 1921, 7821, 178969],
  ["08", 9, 1603, 7503, 170928],
  ["08", 8, 1750, 7650, 174330],
  ["08", 7, 1827, 7727, 175258],
  ["08", 6, 1921, 7821, 177423],
  ["09", 30, 1472, 7272, 173918],
  ["09", 29, 1623, 7423, 176804],
  ["09", 28, 1372, 7172, 170825],
  ["09", 27, 1706, 7506, 177938],
  ["09", 26, 1472, 7272, 172474],
  ["09", 25, 1623, 7423, 175258],
  ["09", 24, 1372, 7172, 169278],
  ["09", 23, 1706, 7506, 176392],
  ["09", 22, 1472, 7272, 170928],
  ["09", 21, 1623, 7423, 173711],
  ["09", 20, 1372, 7172, 167835],
  ["09", 19, 1706, 7506, 174845],
  ["09", 18, 1472, 7272, 169381],
  ["09", 17, 1623, 7423, 172165],
  ["09", 16, 1372, 7172, 166392],
  ["09", 15, 1706, 7506, 173299],
  ["09", 14, 1472, 7272, 167938],
  ["09", 13, 1623, 7423, 170619],
  ["09", 12, 1372, 7172, 164845],
  ["09", 11, 1706, 7506, 171753],
  ["09", 10, 1472, 7272, 166392],
  ["09", 9, 1623, 7423, 169072],
  ["09", 8, 1372, 7172, 163402],
  ["09", 7, 1706, 7506, 170206],
  ["09", 6, 1472, 7272, 164948],
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

export const GIARDINO_RESERVED_FLOORS: Record<string, number[]> = {
  "02": [30, 29, 28, 27, 26],
  "03": [30, 29, 28, 27, 26],
  "04": [30, 29, 28, 27, 26],
  "05": [30, 29, 28, 27, 26],
};

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
