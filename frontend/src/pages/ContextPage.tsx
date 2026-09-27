import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, MessageCircle, Phone, UserCheck } from "lucide-react";
import { API_BASE } from "../roleAccess";
import { normalizeWhatsappNumber } from "../guidedSearch";

type CaptadorInfo = {
  name: string;
  whatsapp?: string;
  phone?: string;
  oficina?: string;
};

type ContextPayload = {
  slug?: string;
  property_ref?: number | null;
  operacion?: string | null;
  zona?: string | null;
  presupuesto?: string | null;
  plazo?: string | null;
  captador?: CaptadorInfo | null;
  property?: {
    ref?: number;
    title?: string;
    zona?: string;
    image?: string;
    type?: string;
    captador?: CaptadorInfo | null;
  } | null;
};

export default function ContextPage() {
  const { slug = "" } = useParams();
  const [payload, setPayload] = useState<ContextPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const robots = document.querySelector('meta[name="robots"]') || document.createElement("meta");
    robots.setAttribute("name", "robots");
    robots.setAttribute("content", "noindex, nofollow");
    if (!robots.parentNode) document.head.appendChild(robots);

    fetch(`${API_BASE}/leads/c/${encodeURIComponent(slug)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("missing");
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setPayload(data);
      })
      .catch(() => {
        if (!cancelled) setError("No encontre esa consulta.");
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const [captador, setCaptador] = useState<CaptadorInfo | null>(null);

  useEffect(() => {
    const directCaptador = payload?.captador || payload?.property?.captador;
    if (directCaptador && directCaptador.name && !directCaptador.name.toLowerCase().includes("alejandro coca")) {
      setCaptador(directCaptador);
      return;
    }
    const ref = payload?.property_ref || payload?.property?.ref;
    if (ref) {
      fetch(`/catalog-snapshot.json?t=${Date.now()}`, { cache: "no-cache" })
        .then((res) => res.json())
        .then((catalog: any[]) => {
          const match = catalog.find((item) => String(item.id) === String(ref));
          if (match && match.captador_nombre && !match.captador_nombre.toLowerCase().includes("alejandro coca")) {
            setCaptador({
              name: match.captador_nombre,
              whatsapp: match.captador_whatsapp || "",
              phone: match.captador_whatsapp || "",
              oficina: match.captador_oficina || "RE/MAX Plus",
            });
          } else {
            setCaptador(null);
          }
        })
        .catch(() => {});
    }
  }, [payload]);

  const property = payload?.property;
  const title = property?.title || "Consulta NIA";

  useEffect(() => {
    document.title = title;
  }, [title]);

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--surface-page)] px-4 py-16 text-center text-[var(--text-main)]">
        <p className="text-sm font-semibold">{error}</p>
        <Link to="/" className="mt-6 inline-block text-[var(--accent-main)]">Volver a NIA</Link>
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--surface-page)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-main)] border-t-transparent" />
      </main>
    );
  }

  const rows = [
    ["Operacion", payload.operacion],
    ["Zona", payload.zona || property?.zona],
    ["Presupuesto", payload.presupuesto],
    ["Plazo", payload.plazo],
  ].filter(([, value]) => Boolean(value));

  const cleanPhone = captador?.phone ? normalizeWhatsappNumber(captador.phone) : "";
  const cleanWhatsapp = captador?.whatsapp ? normalizeWhatsappNumber(captador.whatsapp) : "";

  return (
    <main className="min-h-screen bg-[var(--surface-page)] px-4 py-10 text-[var(--text-main)]">
      <article className="mx-auto max-w-xl">
        {property?.image ? (
          <img src={property.image} alt={title} referrerPolicy="no-referrer" className="mb-5 w-full rounded-2xl object-cover" />
        ) : null}
        {property ? (
          <>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent-main)]">
              REF {payload.property_ref || property.ref}
            </p>
            <h1 className="font-serif mb-3 text-3xl">{title}</h1>
          </>
        ) : (
          <h1 className="font-serif mb-3 text-3xl">Consulta NIA</h1>
        )}
        <p className="text-sm text-[var(--text-muted)]">Resumen de la consulta para el equipo comercial y asesor.</p>
        <ul className="mt-6 divide-y divide-[var(--border-soft)]">
          {rows.map(([label, value]) => (
            <li key={label} className="flex items-center justify-between gap-4 py-3">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</span>
              <strong>{value}</strong>
            </li>
          ))}
        </ul>

        {captador && (
          <section className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--accent-main)]">
                <UserCheck size={14} /> Asesor Captador
              </span>
              {captador.oficina && (
                <span className="flex items-center gap-1 rounded-full bg-[var(--surface-page)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--text-muted)] border border-[var(--border-soft)]">
                  <Building2 size={12} /> {captador.oficina}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">
              {captador.name}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              {cleanPhone ? `Tel: +${cleanPhone}` : "Contacto directo"}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {cleanPhone && (
                <a
                  href={`tel:+${cleanPhone}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-page)] py-2.5 text-xs font-bold text-[var(--text-main)] hover:border-[var(--accent-main)] hover:text-[var(--accent-main)] transition-colors shadow-sm"
                  title={`Llamar a ${captador.name}`}
                >
                  <Phone size={14} className="text-[var(--accent-main)]" />
                  <span>Llamar</span>
                </a>
              )}
              {cleanWhatsapp && (
                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                    `Hola ${captador.name}, te contacto por la propiedad REF ${payload.property_ref || payload.property?.ref || ""} vista en NIA.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-main)] py-2.5 text-xs font-bold text-[#2F241D] hover:bg-[var(--accent-hover)] hover:text-white transition-colors shadow-sm"
                  title={`Enviar WhatsApp a ${captador.name}`}
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </section>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Link to="/" className="inline-block text-sm font-bold uppercase tracking-[0.14em] text-[var(--accent-main)] hover:underline">
            Abrir mapa NIA
          </Link>
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            ID: {payload.slug}
          </span>
        </div>
      </article>
    </main>
  );
}
