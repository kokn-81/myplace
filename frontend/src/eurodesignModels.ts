import type { EurodesignUnit } from "./eurodesignInventory";

export const EURODESIGN_MODELOS: {
  id: string;
  rooms: 1 | 2;
  name: string;
  area: string;
  units: string;
  full: string;
  preview: string;
  note?: string;
}[] = [
  { id: "d03", rooms: 1, name: "Modelo 03", area: "57,00 m²", units: "503 – 1703", full: "/eurodesign/fichas/1d-03-57.jpg", preview: "/eurodesign/modelos/1d-03-57.jpg" },
  { id: "d04", rooms: 1, name: "Modelo 04", area: "48,50 m²", units: "504 – 1704", full: "/eurodesign/fichas/1d-04-485.jpg", preview: "/eurodesign/modelos/1d-04-485.jpg" },
  { id: "d05", rooms: 1, name: "Modelo 05", area: "35,00 m²", units: "505 – 1705", note: "Vendido", full: "/eurodesign/fichas/1d-05-35.jpg", preview: "/eurodesign/modelos/1d-05-35.jpg" },
  { id: "d06", rooms: 1, name: "Modelo 06", area: "48,30 m²", units: "506 – 1706", note: "Vendido", full: "/eurodesign/fichas/1d-06-483.jpg", preview: "/eurodesign/modelos/1d-06-483.jpg" },
  { id: "d07", rooms: 1, name: "Modelo 07", area: "57,00 m²", units: "507 – 1707", full: "/eurodesign/fichas/1d-07-57.jpg", preview: "/eurodesign/modelos/1d-07-57.jpg" },
  { id: "d03p4", rooms: 1, name: "Modelo 03", area: "92,20 m²", units: "Piso 4 · 403", full: "/eurodesign/fichas/1d-03-922.jpg", preview: "/eurodesign/modelos/1d-03-922.jpg" },
  { id: "d04p4", rooms: 1, name: "Modelo 04", area: "92,80 m²", units: "Piso 4 · 404", full: "/eurodesign/fichas/1d-04-928.jpg", preview: "/eurodesign/modelos/1d-04-928.jpg" },
  { id: "d05p4", rooms: 1, name: "Modelo 05", area: "58,00 m²", units: "Piso 4 · 405", full: "/eurodesign/fichas/1d-05-58.jpg", preview: "/eurodesign/modelos/1d-05-58.jpg" },
  { id: "d06p4", rooms: 1, name: "Modelo 06", area: "97,60 m²", units: "Piso 4 · 406", full: "/eurodesign/fichas/1d-06-976.jpg", preview: "/eurodesign/modelos/1d-06-976.jpg" },
  { id: "d07p4", rooms: 1, name: "Modelo 07", area: "64,00 m²", units: "Piso 4 · 407", full: "/eurodesign/fichas/1d-07-64.jpg", preview: "/eurodesign/modelos/1d-07-64.jpg" },
  { id: "d01", rooms: 2, name: "Modelo 01", area: "82,00 m²", units: "501 – 1701", full: "/eurodesign/fichas/2d-01-82.jpg", preview: "/eurodesign/modelos/2d-01-82.jpg" },
  { id: "d02", rooms: 2, name: "Modelo 02", area: "84,30 m²", units: "502 – 1702", full: "/eurodesign/fichas/2d-02-843.jpg", preview: "/eurodesign/modelos/2d-02-843.jpg" },
  { id: "d08", rooms: 2, name: "Modelo 08", area: "84,60 m²", units: "508 – 1708", full: "/eurodesign/fichas/2d-08-846.jpg", preview: "/eurodesign/modelos/2d-08-846.jpg" },
  { id: "d01p4", rooms: 2, name: "Modelo 01", area: "81,20 m²", units: "Piso 4 · 401", full: "/eurodesign/fichas/2d-01-812.jpg", preview: "/eurodesign/modelos/2d-01-812.jpg" },
  { id: "d02p4", rooms: 2, name: "Modelo 02", area: "128,50 m²", units: "Piso 4 · 402", full: "/eurodesign/fichas/2d-02-1285.jpg", preview: "/eurodesign/modelos/2d-02-1285.jpg" },
  { id: "d08p4", rooms: 2, name: "Modelo 08", area: "100,00 m²", units: "Piso 4 · 408", full: "/eurodesign/fichas/2d-08-100.jpg", preview: "/eurodesign/modelos/2d-08-100.jpg" },
];

export type EurodesignModel = (typeof EURODESIGN_MODELOS)[number];

export function matchesEurodesignModel(model: EurodesignModel, unit: EurodesignUnit): boolean {
  const modelNumber = model.id.slice(1, 3);
  const matchesFloor = model.id.endsWith("p4") ? unit.floor === 4 : unit.floor > 4;
  return matchesFloor && unit.rooms === model.rooms && unit.unitNumber === String(unit.floor) + modelNumber;
}

export function availableEurodesignModelUnits(model: EurodesignModel, units: EurodesignUnit[]): EurodesignUnit[] {
  return units.filter((unit) => unit.status === "disponible" && matchesEurodesignModel(model, unit));
}
