import type { LeadEventInput } from "./leadTracking";

export type ProjectContactIntent = "inquiry" | "reserve" | "advice";

export function buildProjectContactMessage({ intent, projectName, inquiryText, canReserve }: {
  intent: ProjectContactIntent;
  projectName: string;
  inquiryText: string;
  canReserve: boolean;
}): string | null {
  if (intent === "advice") {
    return `Hola, vengo de N.I.A. Quiero agendar una asesoría por WhatsApp sobre ${projectName}.\nMe gustaría comparar tipologías, disponibilidad y planes de pago.\n¿Qué horarios tienen disponibles para conversar?`;
  }
  if (intent === "inquiry") return inquiryText;
  if (!canReserve) return null;
  const [selection, plan] = inquiryText.split(/\r?\n/);
  if (!selection?.trim() || !plan?.trim()) return null;
  return `${selection}\n${plan}\nQuiero reservar esta unidad. ¿Podemos confirmar disponibilidad y coordinar la reserva?`;
}

export function projectContactLeadInput(intent: ProjectContactIntent, input: LeadEventInput): LeadEventInput {
  const projectContext = input.propertyRef == null ? {} : { proyecto: String(input.propertyRef) };
  return intent === "advice"
    ? { ...input, presupuesto: undefined, extraFilters: { ...projectContext, intencion: "asesoria" } }
    : { ...input, extraFilters: { ...input.extraFilters, ...projectContext, intencion: intent === "reserve" ? "reserva" : "consulta_unidad" } };
}
