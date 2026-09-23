export interface ProjectUnitOption {
  id?: string;
  tipologia: string;
  superficieM2: number;
  precio: number;
  moneda?: string;
}

export const TYPOLOGY_PRESETS = [
  "Monoambiente",
  "1 Dormitorio",
  "2 Dormitorios",
  "3 Dormitorios",
  "Penthouse",
  "Local Comercial",
  "Oficina",
];

export interface ProjectDetails {
  unidades: ProjectUnitOption[];
  mensajeUrgencia?: string | null;
  totalUnidades?: number | null;
  unidadesDisponibles?: number | null;
  pisos?: number | null;
  reservaUsd?: number | null;
  precioM2Desde?: number | null;
  brochureUrl?: string | null;
  planesPago?: string | null;
}

export const URGENCY_PRESETS = [
  "🔥 ¡Últimas unidades disponibles en Lista Cero!",
  "⚡ 75% Vendido - Precios de lanzamiento hasta fin de mes",
  "🎯 Reserva tu departamento con solo $2.000 USD",
  "📈 Alta plusvalía en Av. Los Cusis - Preventa exclusiva",
  "⭐ Entrega garantizada 2028 - Planes de pago flexibles",
];

export function parseProjectUnitsJson(raw: unknown): ProjectUnitOption[] {
  if (!raw) return [];

  let data = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      data = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }

  const list = Array.isArray(data)
    ? data
    : typeof data === "object" && data !== null && Array.isArray((data as any).unidades)
    ? (data as any).unidades
    : [];

  return list
    .map((item: any, index: number) => {
      if (!item || typeof item !== "object") return null;
      const tipologia = String(item.tipologia || item.nombre || item.tipo || "").trim();
      const superficieM2 = Number(item.superficie_m2 ?? item.superficieM2 ?? item.superficie ?? 0);
      const precio = Number(item.precio ?? item.precio_usd ?? 0);
      const moneda = String(item.moneda || "$ (USD)").trim() || "$ (USD)";
      if (!tipologia && (!superficieM2 || superficieM2 <= 0)) return null;

      return {
        id: String(item.id || `unit-${index}-${Date.now()}`),
        tipologia: tipologia || "Unidad",
        superficieM2: Math.max(0, superficieM2),
        precio: Math.max(0, precio),
        moneda,
      };
    })
    .filter((item): item is ProjectUnitOption => item !== null);
}

export function parseProjectDetailsJson(raw: unknown): ProjectDetails {
  const unidades = parseProjectUnitsJson(raw);
  if (!raw) return { unidades: [] };

  let data = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return { unidades: [] };
    try {
      data = JSON.parse(trimmed);
    } catch {
      return { unidades };
    }
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { unidades };
  }

  const obj = data as Record<string, any>;
  return {
    unidades,
    mensajeUrgencia: obj.mensaje_urgencia ? String(obj.mensaje_urgencia).trim() : (obj.mensajeUrgencia ? String(obj.mensajeUrgencia).trim() : null),
    totalUnidades: Number(obj.total_unidades ?? obj.totalUnidades) || null,
    unidadesDisponibles: Number(obj.unidades_disponibles ?? obj.unidadesDisponibles) || null,
    pisos: Number(obj.pisos) || null,
    reservaUsd: Number(obj.reserva_usd ?? obj.reservaUsd) || null,
    precioM2Desde: Number(obj.precio_m2_desde ?? obj.precioM2Desde) || null,
    brochureUrl: obj.brochure_url ? String(obj.brochure_url).trim() : (obj.brochureUrl ? String(obj.brochureUrl).trim() : null),
    planesPago: obj.planes_pago ? String(obj.planes_pago).trim() : (obj.planesPago ? String(obj.planesPago).trim() : null),
  };
}

export function serializeProjectUnitsJson(units: ProjectUnitOption[]): string | null {
  if (!Array.isArray(units) || units.length === 0) return null;
  const cleanUnits = units
    .filter((u) => u && (u.tipologia?.trim() || u.superficieM2 > 0 || u.precio > 0))
    .map((u) => ({
      tipologia: u.tipologia.trim(),
      superficie_m2: Number(u.superficieM2) || 0,
      precio: Number(u.precio) || 0,
      moneda: u.moneda || "$ (USD)",
    }));

  if (cleanUnits.length === 0) return null;
  return JSON.stringify({ unidades: cleanUnits });
}

export function serializeProjectDetailsJson(details: ProjectDetails): string | null {
  const cleanUnits = (details.unidades || [])
    .filter((u) => u && (u.tipologia?.trim() || u.superficieM2 > 0 || u.precio > 0))
    .map((u) => ({
      tipologia: u.tipologia.trim(),
      superficie_m2: Number(u.superficieM2) || 0,
      precio: Number(u.precio) || 0,
      moneda: u.moneda || "$ (USD)",
    }));

  const payload: Record<string, any> = {};
  if (cleanUnits.length > 0) payload.unidades = cleanUnits;
  if (details.mensajeUrgencia?.trim()) payload.mensaje_urgencia = details.mensajeUrgencia.trim();
  if (details.totalUnidades && details.totalUnidades > 0) payload.total_unidades = details.totalUnidades;
  if (details.unidadesDisponibles && details.unidadesDisponibles > 0) payload.unidades_disponibles = details.unidadesDisponibles;
  if (details.pisos && details.pisos > 0) payload.pisos = details.pisos;
  if (details.reservaUsd && details.reservaUsd > 0) payload.reserva_usd = details.reservaUsd;
  if (details.precioM2Desde && details.precioM2Desde > 0) payload.precio_m2_desde = details.precioM2Desde;
  if (details.brochureUrl?.trim()) payload.brochure_url = details.brochureUrl.trim();
  if (details.planesPago?.trim()) payload.planes_pago = details.planesPago.trim();

  if (Object.keys(payload).length === 0) return null;
  return JSON.stringify(payload);
}

export function getProjectUnitsSummary(units: ProjectUnitOption[]) {
  if (!units || units.length === 0) {
    return {
      count: 0,
      minSurface: 0,
      maxSurface: 0,
      minPrice: 0,
      maxPrice: 0,
      surfaceLabel: "",
      priceLabel: "",
    };
  }

  const surfaces = units.map((u) => u.superficieM2).filter((s) => s > 0);
  const prices = units.map((u) => u.precio).filter((p) => p > 0);

  const minSurface = surfaces.length > 0 ? Math.min(...surfaces) : 0;
  const maxSurface = surfaces.length > 0 ? Math.max(...surfaces) : 0;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  let surfaceLabel = "";
  if (minSurface > 0 && maxSurface > 0) {
    surfaceLabel = minSurface === maxSurface ? `${minSurface} m²` : `Desde ${minSurface} m²`;
  }

  let priceLabel = "";
  if (minPrice > 0) {
    priceLabel = `Desde $${minPrice.toLocaleString("en-US")}`;
  }

  return {
    count: units.length,
    minSurface,
    maxSurface,
    minPrice,
    maxPrice,
    surfaceLabel,
    priceLabel,
  };
}
