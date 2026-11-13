export type LuxeRooms = "1" | "2";
export type LuxeEstado = "LIBRE" | "AGOTADO";

export const LUXE_TOWER_CONFIG = {
  id: "luxe-tower",
  name: "Luxe Tower",
  builder: "Luxe Design SRL",
  address: "Calle Enrique Finot",
  zone: "Equipetrol",
  city: "Santa Cruz de la Sierra",
  delivery: "Noviembre 2026",
  levels: 18,
  homes: 140,
  lat: -17.7712594,
  lng: -63.1929074,
  mapsUrl: "https://maps.app.goo.gl/BX8EBrgqzYj8XmXQ8",
  brochurePdfUrl: "https://drive.google.com/file/d/1diJOXnE14v8CxmgtrT9qCzOmb2a3NqB0/view",
};

export interface LuxeModel {
  id: string;
  letter: string;
  name: string;
  rooms: LuxeRooms;
  areaM2: number;
  floors: number[];
  estado: LuxeEstado;
  where: string;
  detail: string;
  preview: string;
  plan: string;
}

export interface LuxeUnit {
  codigo: string;
  piso: number;
  modelId: string;
  rooms: LuxeRooms;
  superficieM2: number;
  estado: LuxeEstado;
}

const detailFor = (rooms: LuxeRooms, terrace: boolean) => {
  const roomsLabel = rooms === "1" ? "1 dormitorio" : "2 dormitorios";
  const terraceLabel = terrace ? " Con terraza." : " Con balcón.";
  return `${roomsLabel}, vestidores, lavandería, baño de visita y cocina equipada.${terraceLabel}`;
};

function model(
  id: string,
  letter: string,
  rooms: LuxeRooms,
  areaM2: number,
  floors: number[],
  floorLabel: string,
  estado: LuxeEstado,
  where: string,
  terrace: boolean,
): LuxeModel {
  return {
    id,
    letter,
    name: `Modelo ${letter} · ${floorLabel}`,
    rooms,
    areaM2,
    floors,
    estado,
    where,
    detail: detailFor(rooms, terrace),
    preview: `/luxe_tower/modelos/${id}.jpg`,
    plan: `/luxe_tower/planos/${id}.jpg`,
  };
}

const odds = [5, 7, 9, 11, 13, 15, 17];
const evens = [6, 8, 10, 12, 14, 16];
const fiveToEleven = [5, 6, 7, 8, 9, 10, 11];
const twelveToSeventeen = [12, 13, 14, 15, 16, 17];
const fiveToSeventeen = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

export const LUXE_MODELS: LuxeModel[] = [
  model("a-terraza", "A", "2", 125.7, [4], "piso 4", "AGOTADO", "Calle Enrique Finot", true),
  model("a-impar", "A", "2", 97.7, odds, "pisos impares 5 al 17", "LIBRE", "Calle Enrique Finot", false),
  model("a-par", "A", "2", 102.7, evens, "pisos pares 6 al 16", "AGOTADO", "Calle Enrique Finot", false),
  model("b-terraza", "B", "2", 183, [4], "piso 4", "LIBRE", "Calle Enrique Finot", true),
  model("b-impar", "B", "2", 103, odds, "pisos impares 5 al 17", "LIBRE", "Calle Enrique Finot", false),
  model("b-par", "B", "2", 112, evens, "pisos pares 6 al 16", "LIBRE", "Calle Enrique Finot", false),
  model("c-terraza", "C", "2", 130, [4], "piso 4", "LIBRE", "Col. Alemán", true),
  model("c-bajo", "C", "2", 92, fiveToEleven, "pisos 5 al 11", "AGOTADO", "Col. Alemán", false),
  model("c-alto", "C", "2", 79.9, twelveToSeventeen, "pisos 12 al 17", "AGOTADO", "Col. Alemán", false),
  model("d-terraza", "D", "2", 162, [4], "piso 4", "LIBRE", "Col. Alemán", true),
  model("d-bajo", "D", "2", 95, fiveToEleven, "pisos 5 al 11", "LIBRE", "Col. Alemán", false),
  model("d-alto", "D", "2", 95, twelveToSeventeen, "pisos 12 al 17", "LIBRE", "Col. Alemán", false),
  model("e-terraza", "E", "1", 102.5, [4], "piso 4", "LIBRE", "Vecino", true),
  model("e-tipo", "E", "1", 63, fiveToSeventeen, "pisos 5 al 17", "AGOTADO", "Vecino", false),
  model("f-terraza", "F", "1", 100.5, [4], "piso 4", "LIBRE", "Vecino", true),
  model("f-tipo", "F", "1", 63, fiveToSeventeen, "pisos 5 al 17", "AGOTADO", "Vecino", false),
  model("g-terraza", "G", "2", 160, [4], "piso 4", "LIBRE", "Calle Güemes", true),
  model("g-tipo", "G", "2", 95, fiveToSeventeen, "pisos 5 al 17", "LIBRE", "Calle Güemes", false),
  model("h-terraza", "H", "2", 111, [4], "piso 4", "AGOTADO", "Calle Güemes", true),
  model("h-tipo", "H", "2", 92, fiveToSeventeen, "pisos 5 al 17", "LIBRE", "Calle Güemes", false),
  model("i-terraza", "I", "2", 158, [4], "piso 4", "AGOTADO", "Calle Enrique Finot y Güemes", true),
  model("i-tipo", "I", "2", 103, fiveToSeventeen, "pisos 5 al 17", "LIBRE", "Calle Enrique Finot y Güemes", false),
  model("j-terraza", "J", "2", 125.7, [4], "piso 4", "AGOTADO", "Calle Enrique Finot y Güemes", true),
  model("j-tipo", "J", "2", 97.7, fiveToSeventeen, "pisos 5 al 17", "AGOTADO", "Calle Enrique Finot y Güemes", false),
];

export const LUXE_UNITS: LuxeUnit[] = LUXE_MODELS.flatMap((item) =>
  item.floors.map((piso) => ({
    codigo: `${piso}${item.letter}`,
    piso,
    modelId: item.id,
    rooms: item.rooms,
    superficieM2: item.areaM2,
    estado: item.estado,
  })),
);

export function formatLuxeM2(value: number) {
  return value.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function unitsForModel(modelId: string) {
  return LUXE_UNITS.filter((unit) => unit.modelId === modelId);
}

export function areaRangeForRooms(rooms: LuxeRooms) {
  const sizes = LUXE_UNITS.filter((unit) => unit.rooms === rooms).map((unit) => unit.superficieM2);
  if (sizes.length === 0) return null;
  return { low: Math.min(...sizes), high: Math.max(...sizes) };
}

export function hasFreeRooms(rooms: LuxeRooms) {
  return LUXE_UNITS.some((unit) => unit.rooms === rooms && unit.estado === "LIBRE");
}
