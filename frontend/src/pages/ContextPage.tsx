import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_BASE } from "../roleAccess";

type ContextPayload = {
  slug?: string;
  property_ref?: number | null;
  operacion?: string | null;
  zona?: string | null;
  presupuesto?: string | null;
  plazo?: string | null;
  property?: {
    ref?: number;
    title?: string;
    zona?: string;
    image?: string;
    type?: string;
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
        <p className="text-sm text-[var(--text-muted)]">Resumen de la consulta. Sin datos personales.</p>
        <ul className="mt-6 divide-y divide-[var(--border-soft)]">
          {rows.map(([label, value]) => (
            <li key={label} className="flex items-center justify-between gap-4 py-3">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</span>
              <strong>{value}</strong>
            </li>
          ))}
        </ul>
        <Link to="/" className="mt-8 inline-block text-sm font-bold uppercase tracking-[0.14em] text-[var(--accent-main)]">
          Abrir NIA
        </Link>
      </article>
    </main>
  );
}
