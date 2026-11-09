export const ALBORADA_FURNISHED_RATE = 150;
export const ALBORADA_FURNISHED_IMAGE = "/domus/alborada/furnished.jpg";

export const ALBORADA_FURNISHED_ITEMS = [
  "Sofá, mesas de centro y mobiliario para el living.",
  "Comedor, camas, colchones, respaldos y veladores.",
  "Cortinas, blackouts, ropa de cama y textiles.",
  "Televisores y equipamiento tecnológico.",
  "Cuadros, espejos, alfombras e iluminación decorativa.",
  "Línea blanca según la colección elegida.",
  "Vajilla, cubiertos, vasos y utensilios de uso diario.",
];

export const ALBORADA_SPECIAL_SERVICES = [
  "Cafetería con room service", "Limpieza de departamentos",
  "Máquinas expendedoras", "Recepción de delivery en lockers",
  "Asistencia en lobby", "Almacenamiento temporal de equipaje",
  "Carga para autos y movilidad eléctrica", "Inflado de neumáticos",
  "Lavado de vehículos",
];

export function supportsAlboradaFurnished(projectId: string): boolean {
  return projectId === "domus-black" || projectId === "domus-gold";
}

export function quoteAlboradaFurnished(
  projectId: string,
  unit: { areaM2: number; status: string } | null,
  selected: boolean,
) {
  if (!selected || !supportsAlboradaFurnished(projectId) || !unit || unit.status !== "disponible" || !Number.isFinite(unit.areaM2) || unit.areaM2 <= 0) return null;
  return {
    areaM2: unit.areaM2,
    rate: ALBORADA_FURNISHED_RATE,
    amount: Math.round(unit.areaM2 * ALBORADA_FURNISHED_RATE * 100) / 100,
  };
}

export function formatAlboradaUsd(value: number): string {
  return value.toLocaleString("es-BO", { maximumFractionDigits: 2 });
}
