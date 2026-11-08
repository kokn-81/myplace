import {
  TRIVENTO_MODELS,
  TRIVENTO_UNITS,
  availableUnits,
  formatTriventoM2,
  type TriventoModel,
  type TriventoPlan,
  type TriventoUnit,
} from "./triventoInventory";

export type TriventoRooms = "0" | "1";

export interface TriventoSlide {
  id: string;
  name: string;
  areaLabel: string;
  where: string;
  detail: string;
  preview: string;
  plan: string;
  ficha: string;
  model: TriventoModel;
}

export function triventoSlidesForRooms(rooms: TriventoRooms): TriventoSlide[] {
  return TRIVENTO_MODELS.filter((model) => model.dormitorios === Number(rooms)).map((model) => ({
    id: model.id,
    name: model.titulo,
    areaLabel: `${formatTriventoM2(model.m2Total)} m²`,
    where: model.posicion,
    detail: `${model.tipologia} · depto ${formatTriventoM2(model.m2Depto)} m² + balcón ${formatTriventoM2(model.m2Balcon)} m²`,
    preview: model.iso,
    plan: `/trivento/planos/${model.id}.png`,
    ficha: `/trivento/fichas/${model.id}.jpg`,
    model,
  }));
}

export function firstAvailableTriventoSelection(slides: TriventoSlide[], units: TriventoUnit[] = TRIVENTO_UNITS) {
  const free = availableUnits(units);
  const index = Math.max(0, slides.findIndex((slide) => free.some((unit) => unit.modelo === slide.model.codigo)));
  const unit = free.find((item) => item.modelo === slides[index]?.model.codigo) || null;
  return { index, unit };
}

export function quoteTriventoUnit(unit: TriventoUnit | null, plan: TriventoPlan) {
  if (!unit || unit.estado !== "LIBRE" || unit.precioContado == null || unit.precioCredito == null) return null;
  if (plan === "contado") {
    return { total: unit.precioContado, initial: unit.precioContado, balance: null as number | null, rate: unit.puContado || 0 };
  }
  const total = unit.precioCredito;
  const initial = Math.round(total * 50) / 100;
  const balance = Math.round((total - initial) * 100) / 100;
  return { total, initial, balance, rate: unit.puCredito || 0 };
}
