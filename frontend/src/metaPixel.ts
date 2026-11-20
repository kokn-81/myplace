export type MetaContent = {
  id?: string | number | null;
  title?: string | null;
};

type PixelWindow = Window & { fbq?: (...args: unknown[]) => void };

function track(event: "ViewContent" | "Lead", content: MetaContent, extra = {}) {
  if (typeof window === "undefined") return false;

  try {
    const pixel = (window as PixelWindow).fbq;
    if (typeof pixel !== "function") return false;
    const id = content.id == null ? "" : String(content.id).trim();
    pixel("track", event, {
      content_name: content.title?.trim() || "Consulta NIA",
      ...(id ? { content_ids: [id], content_type: "product" } : {}),
      ...extra,
    });
    return true;
  } catch {
    // La medición nunca debe interrumpir la navegación ni la apertura de WhatsApp.
    return false;
  }
}

export const trackMetaLead = (content: MetaContent) =>
  track("Lead", content, { contact_method: "whatsapp", lead_source: "website_cta" });

// Cada apertura de ficha es una visita. Una actualización del inventario no lo es.
export function createMetaViewTracker() {
  let lastContent: string | null = null;
  return (content: MetaContent | null) => {
    const key = content ? String(content.id ?? content.title ?? "").trim() : null;
    if (key === lastContent) return false;
    lastContent = key;
    return content ? track("ViewContent", content) : false;
  };
}
