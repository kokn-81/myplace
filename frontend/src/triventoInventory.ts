/* Inventario de Trivento IV tomado del cuadro oficial en imagen
 * "SIN LOGO - DISPONIBILIDAD", modificado el 28 oct 2026.
 * No hay Google Sheet público en el Drive de disponibilidad.
 * Los precios de unidades vendidas o reservadas no figuran en el cuadro.
 */

export type TriventoEstado = "LIBRE" | "RESERVADO" | "VENDIDO";
export type TriventoPlan = "contado" | "credito";

export interface TriventoModel {
  id: string;
  codigo: string;
  titulo: string;
  tipologia: "Monoambiente" | "1 Dormitorio";
  posicion: "Fachada" | "Atrás";
  m2Depto: number;
  m2Balcon: number;
  m2Total: number;
  dormitorios: number;
  plan: string;
  render: string;
  iso: string;
}

export interface TriventoUnit {
  id: string;
  codigo: string;
  piso: number;
  modelo: string;
  tipologia: "Monoambiente" | "1 Dormitorio";
  posicion: "Fachada" | "Atrás";
  m2Depto: number;
  m2Balcon: number;
  m2Total: number;
  estado: TriventoEstado;
  puContado: number | null;
  puCredito: number | null;
  precioContado: number | null;
  precioCredito: number | null;
}

export const TRIVENTO_INVENTORY_DATE = "2026-10-28";

export const TRIVENTO_CONFIG = {
  id: "trivento-iv",
  name: "Trivento IV",
  zone: "Equipetrol",
  address: "Av. San Martín y Calle A. Ramírez",
  city: "Santa Cruz de la Sierra",
  delivery: "Noviembre 2027",
  exchange: "Tipo de cambio BCB",
  lat: -17.7612,
  lng: -63.197,
  totalUnits: 25,
  floorsPublished: "Pisos 1 a 5",
  brochurePdfUrl: "/trivento/brochure.pdf",
  driveUrl: "https://drive.google.com/drive/folders/1nSLFJjgxsC1v-pUFqi8LrxizGSASSS51",
  /** Referencia editorial N.I.A para la columna de plusvalía. No está en el cuadro del proyecto. */
  marketUsdPerM2: 1800,
};

export const TRIVENTO_MODELS: TriventoModel[] = [
  {
    id: "01",
    codigo: "01",
    titulo: "1 dormitorio · fachada",
    tipologia: "1 Dormitorio",
    posicion: "Fachada",
    m2Depto: 38.93,
    m2Balcon: 3.38,
    m2Total: 42.31,
    dormitorios: 1,
    plan: "/trivento/iso_01.jpg",
    render: "/trivento/vista_01.jpg",
    iso: "/trivento/iso_01.jpg",
  },
  {
    id: "02",
    codigo: "02",
    titulo: "Monoambiente · fachada",
    tipologia: "Monoambiente",
    posicion: "Fachada",
    m2Depto: 35.45,
    m2Balcon: 3.95,
    m2Total: 39.4,
    dormitorios: 0,
    plan: "/trivento/iso_02.jpg",
    render: "/trivento/vista_02.jpg",
    iso: "/trivento/iso_02.jpg",
  },
  {
    id: "03",
    codigo: "03",
    titulo: "1 dormitorio · fachada",
    tipologia: "1 Dormitorio",
    posicion: "Fachada",
    m2Depto: 40.59,
    m2Balcon: 3.98,
    m2Total: 44.57,
    dormitorios: 1,
    plan: "/trivento/iso_03.jpg",
    render: "/trivento/vista_03.jpg",
    iso: "/trivento/iso_03.jpg",
  },
  {
    id: "04",
    codigo: "04",
    titulo: "1 dormitorio · atrás",
    tipologia: "1 Dormitorio",
    posicion: "Atrás",
    m2Depto: 34.23,
    m2Balcon: 2.6,
    m2Total: 36.83,
    dormitorios: 1,
    plan: "/trivento/iso_04.jpg",
    render: "/trivento/vista_04.jpg",
    iso: "/trivento/iso_04.jpg",
  },
  {
    id: "05",
    codigo: "05",
    titulo: "1 dormitorio · atrás",
    tipologia: "1 Dormitorio",
    posicion: "Atrás",
    m2Depto: 44.66,
    m2Balcon: 2.52,
    m2Total: 47.18,
    dormitorios: 1,
    plan: "/trivento/iso_05.jpg",
    render: "/trivento/vista_05.jpg",
    iso: "/trivento/iso_05.jpg",
  },
];

const MODEL_BY_SLOT = Object.fromEntries(TRIVENTO_MODELS.map((model) => [Number(model.codigo), model]));

/** Precio publicado solo cuando el cuadro lo trae. El resto queda vacío a propósito. */
const PUBLISHED_PRICES: Record<string, { puContado: number; puCredito: number; contado: number; credito: number }> = {
  "201": { puContado: 1400, puCredito: 1600, contado: 59234, credito: 67696 },
  "204": { puContado: 1400, puCredito: 1600, contado: 51562, credito: 58928 },
  "303": { puContado: 1400, puCredito: 1600, contado: 62398, credito: 71312 },
  "305": { puContado: 1300, puCredito: 1500, contado: 61334, credito: 70770 },
  "401": { puContado: 1450, puCredito: 1650, contado: 61349.5, credito: 69811.5 },
  "404": { puContado: 1400, puCredito: 1600, contado: 51562, credito: 58928 },
  "405": { puContado: 1350, puCredito: 1500, contado: 63693, credito: 70770 },
};

const ESTADOS: Record<string, TriventoEstado> = {
  "101": "VENDIDO",
  "102": "VENDIDO",
  "103": "RESERVADO",
  "104": "RESERVADO",
  "105": "VENDIDO",
  "201": "LIBRE",
  "202": "VENDIDO",
  "203": "VENDIDO",
  "204": "LIBRE",
  "205": "VENDIDO",
  "301": "VENDIDO",
  "302": "VENDIDO",
  "303": "LIBRE",
  "304": "VENDIDO",
  "305": "LIBRE",
  "401": "LIBRE",
  "402": "VENDIDO",
  "403": "VENDIDO",
  "404": "LIBRE",
  "405": "LIBRE",
  "501": "VENDIDO",
  "502": "VENDIDO",
  "503": "VENDIDO",
  "504": "VENDIDO",
  "505": "VENDIDO",
};

function buildUnits(): TriventoUnit[] {
  const units: TriventoUnit[] = [];
  for (let piso = 1; piso <= 5; piso += 1) {
    for (let slot = 1; slot <= 5; slot += 1) {
      const model = MODEL_BY_SLOT[slot];
      const codigo = `${piso}0${slot}`;
      const precio = PUBLISHED_PRICES[codigo];
      units.push({
        id: `T4-${codigo}`,
        codigo,
        piso,
        modelo: model.codigo,
        tipologia: model.tipologia,
        posicion: model.posicion,
        m2Depto: model.m2Depto,
        m2Balcon: model.m2Balcon,
        m2Total: model.m2Total,
        estado: ESTADOS[codigo],
        puContado: precio?.puContado ?? null,
        puCredito: precio?.puCredito ?? null,
        precioContado: precio?.contado ?? null,
        precioCredito: precio?.credito ?? null,
      });
    }
  }
  return units;
}

export const TRIVENTO_UNITS: TriventoUnit[] = buildUnits();

export function formatTriventoUsd(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const hasCents = Math.abs(rounded - Math.round(rounded)) > 0.001;
  return rounded.toLocaleString("es-BO", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  });
}

export function formatTriventoM2(value: number): string {
  return value.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function availableUnits(units: TriventoUnit[] = TRIVENTO_UNITS): TriventoUnit[] {
  return units.filter((unit) => unit.estado === "LIBRE" && unit.precioContado != null);
}

export function cheapestAvailable(units: TriventoUnit[] = TRIVENTO_UNITS): TriventoUnit {
  return availableUnits(units).reduce((best, unit) =>
    (unit.precioContado || 0) < (best.precioContado || Infinity) ? unit : best
  );
}

export function minRate(plan: TriventoPlan, units: TriventoUnit[] = TRIVENTO_UNITS): number {
  const rates = availableUnits(units)
    .map((unit) => (plan === "contado" ? unit.puContado : unit.puCredito))
    .filter((rate): rate is number => rate != null);
  return Math.min(...rates);
}
