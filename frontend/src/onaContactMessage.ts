import { formatOnaM2, type OnaUnit } from "./onaInventory";

export type OnaContactIntent = "inquiry" | "reserve" | "advice";

export function buildOnaContactMessage({ intent, unit, modelName, planLabel, extra = "" }: {
  intent: OnaContactIntent;
  unit: OnaUnit | null;
  modelName: string;
  planLabel: string;
  extra?: string;
}): string | null {
  if (intent === "advice") {
    return "Hola, vengo de N.I.A. Quiero agendar una asesoría por WhatsApp sobre ONA Residences.\nMe gustaría comparar tipologías, disponibilidad y planes de pago.\n¿Qué horarios tienen disponibles para conversar?";
  }
  if (!unit || unit.status !== "disponible") {
    return intent === "reserve" ? null : "Hola, vengo de N.I.A. Quiero consultar ONA Residences.\nAún no elegí una unidad disponible.\n¿Me ayudan a ver qué hay disponible?";
  }
  const action = intent === "reserve" ? "Quiero reservar" : "Quiero";
  const question = intent === "reserve"
    ? "¿Podemos confirmar disponibilidad y coordinar la reserva?"
    : "¿Sigue disponible y cuáles son los pasos para reservar?";
  return `Hola, vengo de N.I.A. ${action} la unidad T${unit.tipo}, piso ${unit.floor}, ${modelName} (${formatOnaM2(unit.totalM2)} m², ${unit.view}) en ONA Residences.\nPlan: ${planLabel}${extra}.\n${question}`;
}
