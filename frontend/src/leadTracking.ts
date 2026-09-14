import { API_BASE } from "./roleAccess";
import { getNiaSessionId, resolveNiaUserId } from "./visitorId";
import { buildWhatsappMessage, buildWhatsappUrl } from "./whatsappMessage";

export type LeadAction = "contact_tap" | "share";

export type LeadEventInput = {
  action: LeadAction;
  propertyRef?: string | number | null;
  operacion?: string | null;
  zona?: string | null;
  presupuesto?: string | null;
  extraFilters?: Record<string, unknown> | null;
  plazo?: string | null;
  firebaseUid?: string | null;
};

export type LeadEventResult = {
  slug: string;
  url: string;
  action: LeadAction;
  property_ref: number | null;
  contacted_agent: boolean;
  session_id?: string | null;
  whatsapp_text: string;
  whatsapp_url: string;
};

const parseRef = (value?: string | number | null) => {
  const numeric = Number(String(value ?? "").replace(/^#/, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
};

export const recordLeadEvent = async (input: LeadEventInput): Promise<LeadEventResult | null> => {
  const body = {
    action: input.action,
    property_ref: parseRef(input.propertyRef),
    operacion: input.operacion || undefined,
    zona: input.zona || undefined,
    presupuesto: input.presupuesto || undefined,
    extra_filters: input.extraFilters || undefined,
    plazo: input.plazo || undefined,
    session_id: getNiaSessionId() || undefined,
    user_id: resolveNiaUserId(input.firebaseUid) || undefined,
  };

  try {
    const response = await fetch(`${API_BASE}/leads/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data?.slug) return null;
    return data as LeadEventResult;
  } catch {
    return null;
  }
};

export const openContactWhatsapp = (event: LeadEventResult, fallback: Omit<LeadEventInput, "action" | "firebaseUid">) => {
  const text = event.whatsapp_text || buildWhatsappMessage({
    propertyRef: fallback.propertyRef,
    zona: fallback.zona,
    operacion: fallback.operacion,
    presupuesto: fallback.presupuesto,
    plazo: fallback.plazo,
    slug: event.slug,
  });
  const url = event.whatsapp_url || buildWhatsappUrl(text);
  window.open(url, "_blank", "noopener,noreferrer");
};

export const shareLeadUrl = async (title: string, url: string) => {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      await navigator.share({ title, url });
      return "shared" as const;
    }
  } catch (error) {
    if ((error as DOMException)?.name === "AbortError") return "aborted" as const;
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied" as const;
  } catch {
    return "failed" as const;
  }
};
