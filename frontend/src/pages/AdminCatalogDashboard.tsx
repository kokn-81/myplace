import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Database, Loader2, LogOut, Moon, Pencil, RefreshCw, Save, Search, ShieldCheck, Sun, Trash2, X } from "lucide-react";
import { GoogleAuthProvider, User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { AppRole, authFetch, cacheAuthProfile, clearCachedAuthProfile, fetchAuthProfile, getCachedAuthProfile } from "../roleAccess";
import { auth, authPersistenceReady } from "../firebase";

interface LocalAgent {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
}

const formatOffersSummary = (property: any) => {
  const offers = Array.isArray(property?.ofertas) && property.ofertas.length > 0
    ? property.ofertas
    : [{ operacion: property.operacion, precio: property.precio_usd, moneda: property.moneda }];
  return offers.map((offer: any) => `${offer.operacion}: ${offer.moneda || "$ (USD)"} ${Number(offer.precio || 0).toLocaleString("es-BO")}`).join(" Â· ");
};

const getPropertyImageLinks = (inm: any) => Array.isArray(inm.images) ? inm.images.join(", ") : (inm.imagenes || "");
const getPropertyAmenitiesText = (inm: any) => Array.isArray(inm.amenidades) ? inm.amenidades.join(", ") : (inm.amenidades || "");
const getPropertyKeywordsText = (inm: any) => Array.isArray(inm.keywords) ? inm.keywords.join(", ") : (inm.keywords || "");

export default function AdminCatalogDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [role, setRole] = useState<AppRole>("user");
  const [roleLoading, setRoleLoading] = useState(false);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [agents, setAgents] = useState<LocalAgent[]>([]);
  const [query, setQuery] = useState("");
  const [editingProperty, setEditingProperty] = useState<any | null>(null);
  const [editOperation, setEditOperation] = useState("Venta");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | number | null>(null);
  const [isBackfillingEmbeddings, setIsBackfillingEmbeddings] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    const dark = saved ? saved === "dark" : document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
    return dark;
  });

  const isAdmin = role === "admin";

  const applyTheme = (dark: boolean) => {
    document.documentElement.classList.add("theme-switching");
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
    setIsDarkMode(dark);
    window.setTimeout(() => document.documentElement.classList.remove("theme-switching"), 90);
  };

  const getOfferMode = (property: any) => {
    const offers = Array.isArray(property?.ofertas) ? property.ofertas : [];
    const hasRent = offers.some((offer: any) => String(offer.operacion).toLowerCase().includes("alquiler"));
    const hasSale = offers.some((offer: any) => String(offer.operacion).toLowerCase().includes("venta"));
    if (hasRent && hasSale) return "Alquiler y Venta";
    return property?.operacion || "Venta";
  };

  const findOffer = (property: any, operation: "Alquiler" | "Venta") => {
    const offers = Array.isArray(property?.ofertas) ? property.ofertas : [];
    return offers.find((offer: any) => String(offer.operacion).toLowerCase().includes(operation.toLowerCase()));
  };

  const buildOffersPayload = (fd: FormData, operation: string, agentId: number, fallbackCurrency: string, offerStatus: string) => {
    if (operation === "Alquiler y Venta") {
      return [
        { operacion: "Alquiler", precio: Number(fd.get("rentPrice")) || 0, moneda: String(fd.get("rentCurrency") || "Bs"), agente_id: agentId, estado: offerStatus },
        { operacion: "Venta", precio: Number(fd.get("salePrice")) || 0, moneda: String(fd.get("saleCurrency") || "$ (USD)"), agente_id: agentId, estado: offerStatus },
      ].filter((offer) => offer.precio > 0);
    }
    return [{ operacion: operation, precio: Number(fd.get("price")) || 0, moneda: fallbackCurrency, agente_id: agentId, estado: offerStatus }];
  };

  const fetchCatalog = useCallback(async () => {
    if (!user || !isAdmin) return;
    const res = await authFetch("/inmuebles/admin", user);
    if (!res.ok) throw new Error("No se pudo cargar el catalogo.");
    setCatalog(await res.json());
  }, [user, isAdmin]);

  const fetchAgents = useCallback(async () => {
    if (!user || !isAdmin) return;
    const res = await authFetch("/agentes", user);
    if (res.ok) setAgents(await res.json());
  }, [user, isAdmin]);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (cancelled) return;

      setUser(currentUser);
      if (!currentUser) {
        setRole("user");
        setRoleLoading(false);
        setAuthLoading(false);
        return;
      }

      const cachedProfile = getCachedAuthProfile(currentUser.email);
      setRole(cachedProfile?.role || "user");
      setRoleLoading(true);
      setAuthLoading(false);

      try {
        const profile = await fetchAuthProfile(currentUser);
        if (cancelled) return;
        cacheAuthProfile(profile);
        setRole(profile.role);
      } catch (error) {
        console.error("Error validando rol admin:", error);
        if (!cachedProfile) setRole("user");
      } finally {
        if (!cancelled) setRoleLoading(false);
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchCatalog().catch((error) => setErrorMsg(error.message));
    fetchAgents().catch(console.error);
  }, [user, isAdmin, fetchCatalog, fetchAgents]);

  const filteredCatalog = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return catalog;
    return catalog.filter((inm) => {
      const haystack = [
        inm.id,
        inm.titulo,
        inm.estado,
        getOfferMode(inm),
        formatOffersSummary(inm),
        inm.tipo_inmueble,
        inm.ciudad,
        inm.zona,
        getPropertyAmenitiesText(inm),
        getPropertyKeywordsText(inm),
        inm.search_text,
      ].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [catalog, query]);

  const embeddingCoverage = useMemo(() => {
    const total = catalog.length;
    const ready = catalog.filter((inm) => Boolean(inm.embedding_ready)).length;
    return {
      total,
      ready,
      pending: Math.max(total - ready, 0),
      percentage: total ? Math.round((ready / total) * 100) : 0,
    };
  }, [catalog]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await authPersistenceReady;
    await signInWithPopup(auth, provider);
  };

  const handleLogout = async () => {
    clearCachedAuthProfile(user?.email);
    await signOut(auth);
    setUser(null);
    setRole("user");
  };

  const handleDeleteProperty = async (id: string | number) => {
    if (!window.confirm("Seguro que deseas eliminar permanentemente este inmueble?")) return;
    const res = await authFetch(`/inmuebles/${id}`, user, { method: "DELETE" });
    if (!res.ok) {
      setErrorMsg("No se pudo eliminar el inmueble.");
      return;
    }
    setCatalog((current) => current.filter((property) => property.id !== id));
    setSuccessMsg(`Inmueble #${id} eliminado.`);
  };

  const handleRegenerateSearchText = async (id: string | number) => {
    setRegeneratingId(id);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await authFetch(`/admin/inmuebles/${id}/regenerar-search-text`, user, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "No se pudo regenerar el search text.");
      setCatalog((current) => current.map((property) => property.id === id ? data.inmueble : property));
      setSuccessMsg(`Search text regenerado para #${id}.`);
    } catch (error: any) {
      setErrorMsg(error.message || "No se pudo regenerar el search text.");
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleBackfillEmbeddings = async () => {
    setIsBackfillingEmbeddings(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await authFetch("/admin/nia/embeddings/backfill", user, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "No se pudieron regenerar los embeddings.");
      await fetchCatalog();
      setSuccessMsg(`Embeddings actualizados: ${data.updated || 0}. Omitidos: ${data.skipped || 0}. Fallidos: ${data.failed || 0}.`);
    } catch (error: any) {
      setErrorMsg(error.message || "No se pudieron regenerar los embeddings.");
    } finally {
      setIsBackfillingEmbeddings(false);
    }
  };

  const handleUpdateProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProperty) return;
    const fd = new FormData(e.currentTarget);
    const coordsParts = String(fd.get("coords") || "").split(",").map((s) => parseFloat(s.trim()));
    const lat = coordsParts.length === 2 && !Number.isNaN(coordsParts[0]) ? coordsParts[0] : Number(editingProperty.lat || 0);
    const lng = coordsParts.length === 2 && !Number.isNaN(coordsParts[1]) ? coordsParts[1] : Number(editingProperty.lng || 0);
    const agentId = Number(fd.get("agentId")) || 0;
    const operation = String(fd.get("operation") || editOperation || "Venta");
    const propertyStatus = String(fd.get("status") || editingProperty.estado || "Borrador");
    const offers = buildOffersPayload(fd, operation, agentId, String(fd.get("currency") || "$ (USD)"), propertyStatus);
    const primaryOffer = offers[0];
    const payload = {
      titulo: String(fd.get("title") || "").trim() || "Propiedad sin titulo",
      precio_usd: primaryOffer?.precio || 0,
      moneda: primaryOffer?.moneda || "$ (USD)",
      habitaciones: Number(fd.get("rooms")) || 0,
      banos: Number(fd.get("bathrooms")) || 1,
      ciudad: String(fd.get("area") || "").trim() || "Santa Cruz",
      lat,
      lng,
      operacion: primaryOffer?.operacion || operation,
      tipo_inmueble: String(fd.get("type") || "Departamento"),
      estado: propertyStatus,
      descripcion: String(fd.get("description") || "").trim() || "Sin descripcion.",
      agente_id: agentId,
      imagenes: String(fd.get("imageLinks") || "").trim(),
      amenidades: String(fd.get("amenities") || "").trim(),
      keywords: String(fd.get("keywords") || "").trim(),
      ofertas: offers,
    };

    if (!payload.agente_id || offers.length === 0) {
      setErrorMsg("Selecciona un asesor y al menos una oferta con precio.");
      return;
    }

    setIsSavingEdit(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await authFetch(`/inmuebles/${editingProperty.id}`, user, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "No se pudo editar el inmueble.");
      setSuccessMsg("Inmueble actualizado. El search text se regenero automaticamente.");
      setEditingProperty(null);
      await fetchCatalog();
    } catch (error: any) {
      setErrorMsg("Error al editar inmueble: " + error.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  if (authLoading || (roleLoading && role === "user")) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--surface-page)]"><Loader2 className="animate-spin text-[var(--accent-main)] w-8 h-8" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center font-sans p-4">
        <div className="bg-[var(--surface-panel)] p-8 rounded-xl shadow-[var(--shadow-warm)] border border-[var(--border-soft)] text-center max-w-sm w-full">
          <ShieldCheck className="w-12 h-12 text-[var(--accent-main)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--text-main)] mb-2 uppercase tracking-widest">O.P.A.L.O.</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">Identificacion admin requerida.</p>
          <button onClick={handleLogin} className="w-full bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-[#2F241D] hover:text-white font-bold py-3 rounded transition-colors uppercase tracking-widest text-xs shadow-md">Acceder con Google</button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center font-sans p-4">
        <div className="bg-[var(--surface-panel)] p-8 rounded-xl shadow-[var(--shadow-warm)] border border-[var(--border-soft)] text-center max-w-md w-full">
          <ShieldCheck className="w-12 h-12 text-[var(--accent-main)] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-main)] mb-2">Acceso admin restringido</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">Tu correo no tiene permisos de administrador.</p>
          <Link to="/" className="bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-[#2F241D] hover:text-white font-bold px-4 py-3 rounded transition-colors uppercase tracking-widest text-xs shadow-md">Volver al mapa</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-main)] p-8 font-sans transition-colors">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 border-b border-[var(--border-soft)] pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent-main)]"><Database size={16} /> Catalogo</p>
              <h1 className="text-4xl font-bold uppercase tracking-tight text-[var(--color-chocolate)] dark:text-[var(--text-main)]">Inmuebles y Search Text</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Edicion rapida, keywords y texto interno usado para ranking semantico.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => applyTheme(!isDarkMode)} className="text-[10px] bg-[var(--color-chocolate)] dark:bg-[var(--surface-control)] hover:bg-[var(--accent-hover)] border border-[var(--accent-main)]/50 dark:border-[var(--border-soft)] text-[var(--color-ivory)] dark:text-[var(--text-muted)] px-3 py-2 rounded font-bold uppercase tracking-wider transition-colors flex items-center gap-1">
                {isDarkMode ? <Sun size={12} /> : <Moon size={12} />} {isDarkMode ? "Claro" : "Oscuro"}
              </button>
              <Link to="/admin" className="text-[10px] bg-[var(--color-chocolate)] dark:bg-[var(--surface-control)] hover:bg-[var(--accent-hover)] border border-[var(--accent-main)]/50 dark:border-[var(--border-soft)] text-[var(--color-ivory)] dark:text-[var(--text-muted)] px-3 py-2 rounded font-bold uppercase tracking-wider transition-colors flex items-center gap-1">
                <ArrowLeft size={12} /> Admin
              </Link>
              <button onClick={handleLogout} className="text-[10px] bg-[var(--color-brick)] dark:bg-[var(--surface-panel)] hover:bg-[var(--accent-hover)] border border-[var(--color-brick)]/60 dark:border-red-900/50 text-[var(--color-ivory)] dark:text-red-400 px-3 py-2 rounded font-bold uppercase tracking-wider transition-colors flex items-center gap-1">
                <LogOut size={12} /> Cerrar Admin
              </button>
            </div>
          </div>
        </header>

        {(errorMsg || successMsg) && (
          <div className={`mb-5 rounded border px-4 py-3 text-sm font-bold ${errorMsg ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {errorMsg || successMsg}
          </div>
        )}

        <section className="mb-6 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-[var(--shadow-warm)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-2xl flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-main)]" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded border border-[var(--border-soft)] bg-[var(--surface-control)] py-3 pl-10 pr-4 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent-main)]"
                placeholder="Buscar por ID, titulo, zona, estado, keyword o search text..."
              />
            </div>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
              <span>{filteredCatalog.length} de {catalog.length} inmuebles</span>
              <button onClick={() => fetchCatalog().catch((error) => setErrorMsg(error.message))} className="rounded border border-[var(--border-soft)] px-3 py-2 text-[var(--text-main)] hover:border-[var(--accent-main)] flex items-center gap-2">
                <RefreshCw size={13} /> Actualizar
              </button>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-[var(--shadow-warm)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-main)]">Indice semantico</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--text-main)]">{embeddingCoverage.ready} / {embeddingCoverage.total} inmuebles con embedding</h2>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Cobertura {embeddingCoverage.percentage}% | Pendientes {embeddingCoverage.pending}. El backfill regenera search text y embeddings cuando cambian keywords, descripcion o modelo.</p>
            </div>
            <button onClick={handleBackfillEmbeddings} disabled={isBackfillingEmbeddings || !catalog.length} className="rounded bg-[var(--accent-main)] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#2F241D] shadow-md transition-colors hover:bg-[var(--accent-hover)] hover:text-white disabled:opacity-60 flex items-center justify-center gap-2">
              {isBackfillingEmbeddings ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} Regenerar embeddings
            </button>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded bg-[var(--surface-control)]">
            <div className="h-full bg-[var(--accent-main)] transition-all" style={{ width: `${embeddingCoverage.percentage}%` }} />
          </div>
        </section>

        <section className="space-y-4">
          {filteredCatalog.map((inm) => (
            <article key={inm.id} className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-[var(--shadow-warm)]">
              <div className="grid gap-4 xl:grid-cols-[1.1fr_1.4fr]">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-[var(--accent-main)]/15 px-2 py-1 font-mono text-xs font-bold text-[var(--accent-main)]">#{inm.id}</span>
                    <span className="rounded border border-[var(--border-soft)] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{inm.estado || "Sin estado"}</span>
                    <span className="rounded border border-[var(--border-soft)] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{getOfferMode(inm)}</span>
                    <span className={`rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${inm.embedding_ready ? "border-emerald-200 text-emerald-600" : "border-amber-200 text-amber-600"}`}>{inm.embedding_ready ? "Embedding listo" : "Embedding pendiente"}</span>
                  </div>
                  <h2 className="mb-2 text-lg font-bold uppercase tracking-tight text-[var(--text-main)]">{inm.titulo}</h2>
                  <p className="mb-3 text-sm font-semibold text-[var(--accent-main)]">{formatOffersSummary(inm)}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-muted)]">
                    <span>Tipo: <strong className="text-[var(--text-main)]">{inm.tipo_inmueble || "-"}</strong></span>
                    <span>Zona: <strong className="text-[var(--text-main)]">{inm.ciudad || "-"}</strong></span>
                    <span>Dorm: <strong className="text-[var(--text-main)]">{inm.habitaciones ?? 0}</strong></span>
                    <span>Banos: <strong className="text-[var(--text-main)]">{inm.banos ?? 1}</strong></span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => { setEditingProperty(inm); setEditOperation(getOfferMode(inm)); }} className="rounded bg-[var(--accent-main)] px-3 py-2 text-xs font-bold uppercase tracking-widest text-[#2F241D] hover:bg-[var(--accent-hover)] hover:text-white flex items-center gap-2">
                      <Pencil size={13} /> Editar
                    </button>
                    <button onClick={() => handleRegenerateSearchText(inm.id)} disabled={regeneratingId === inm.id} className="rounded border border-[var(--border-soft)] px-3 py-2 text-xs font-bold uppercase tracking-widest text-[var(--text-main)] hover:border-[var(--accent-main)] disabled:opacity-60 flex items-center gap-2">
                      {regeneratingId === inm.id ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Regenerar
                    </button>
                    <button onClick={() => handleDeleteProperty(inm.id)} className="rounded border border-red-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 flex items-center gap-2">
                      <Trash2 size={13} /> Eliminar
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-main)]">Keywords</h3>
                    <div className="flex min-h-9 flex-wrap gap-2 rounded border border-[var(--border-soft)] bg-[var(--surface-control)] p-2">
                      {(Array.isArray(inm.keywords) && inm.keywords.length > 0) ? inm.keywords.map((keyword: string) => (
                        <span key={keyword} className="rounded bg-[var(--text-main)]/10 px-2 py-1 text-xs font-bold text-[var(--text-main)]">{keyword}</span>
                      )) : <span className="text-xs italic text-[var(--text-muted)]">Sin keywords</span>}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-main)]">Search text generado</h3>
                    <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded border border-[var(--border-soft)] bg-[var(--surface-control)] p-3 text-xs leading-relaxed text-[var(--text-main)]">{inm.search_text || "Sin search text generado."}</pre>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {filteredCatalog.length === 0 && (
            <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-8 text-center shadow-[var(--shadow-warm)]">
              <Building2 className="mx-auto mb-3 h-8 w-8 text-[var(--accent-main)]" />
              <p className="text-sm text-[var(--text-muted)]">No encontramos inmuebles con ese criterio.</p>
            </div>
          )}
        </section>
      </div>

      {editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(58,33,25,0.22)] p-4 backdrop-blur-sm dark:bg-[rgba(16,12,10,0.72)]">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[var(--border-soft)] bg-[var(--surface-panel)] shadow-[var(--shadow-warm)]">
            <div className="flex items-center justify-between border-b border-[var(--border-soft)] p-6">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[var(--text-main)]"><Pencil className="text-[var(--accent-main)]" size={16}/> Editar Inmueble #{editingProperty.id}</h3>
              <button onClick={() => setEditingProperty(null)} className="text-stone-400 hover:text-primary dark:hover:text-white"><X size={18}/></button>
            </div>
            <form onSubmit={handleUpdateProperty} className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Titulo comercial</label><input name="title" required defaultValue={editingProperty.titulo || ""} className="w-full rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-gold" /></div>
                <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Asesor</label><select name="agentId" required defaultValue={String(editingProperty.agente_id || editingProperty.agentId || "")} className="w-full rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-gold"><option value="">Selecciona un asesor...</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></div>
                <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Operacion</label><select name="operation" value={editOperation} onChange={(e) => setEditOperation(e.target.value)} className="w-full rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-gold"><option>Venta</option><option>Alquiler</option><option>Alquiler y Venta</option><option>Inversion</option></select></div>
                <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Tipo</label><select name="type" defaultValue={editingProperty.tipo_inmueble || "Departamento"} className="w-full rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-gold"><option>Departamento</option><option>Casa</option><option>Oficina</option><option>Terreno</option><option>Local Comercial</option></select></div>
                <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Estado</label><select name="status" defaultValue={editingProperty.estado || "Borrador"} className="w-full rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-gold"><option>Borrador</option><option>Publicado</option><option>Pausado</option></select></div>
                {editOperation === "Alquiler y Venta" ? <>
                  <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Moneda alquiler</label><select name="rentCurrency" defaultValue={findOffer(editingProperty, "Alquiler")?.moneda || "Bs"} className="w-full rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)]"><option>Bs</option><option>$ (USD)</option></select></div>
                  <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Precio alquiler</label><input name="rentPrice" type="number" min="0" defaultValue={findOffer(editingProperty, "Alquiler")?.precio || 0} className="w-full rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)]" /></div>
                  <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Moneda venta</label><select name="saleCurrency" defaultValue={findOffer(editingProperty, "Venta")?.moneda || "$ (USD)"} className="w-full rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)]"><option>$ (USD)</option><option>Bs</option></select></div>
                  <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Precio venta</label><input name="salePrice" type="number" min="0" defaultValue={findOffer(editingProperty, "Venta")?.precio || 0} className="w-full rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)]" /></div>
                </> : <>
                  <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Moneda</label><select name="currency" defaultValue={findOffer(editingProperty, editOperation as "Alquiler" | "Venta")?.moneda || editingProperty.moneda || "$ (USD)"} className="w-full rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)]"><option>$ (USD)</option><option>Bs</option></select></div>
                  <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Precio</label><input name="price" type="number" required defaultValue={findOffer(editingProperty, editOperation as "Alquiler" | "Venta")?.precio || editingProperty.precio_usd || 0} className="w-full rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)]" /></div>
                </>}
                <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Habitaciones</label><input name="rooms" type="number" min="0" defaultValue={editingProperty.habitaciones || 0} className="w-full rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)]" /></div>
                <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Banos</label><input name="bathrooms" type="number" min="0" defaultValue={editingProperty.banos || 1} className="w-full rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)]" /></div>
                <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Zona</label><input name="area" defaultValue={editingProperty.ciudad || ""} className="w-full rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)]" /></div>
                <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Coordenadas</label><input name="coords" defaultValue={`${editingProperty.lat || 0}, ${editingProperty.lng || 0}`} className="w-full rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)]" /></div>
              </div>
              <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Descripcion publica</label><textarea name="description" rows={5} defaultValue={editingProperty.descripcion || ""} className="w-full resize-y rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-gold" /></div>
              <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Amenidades</label><textarea name="amenities" rows={3} defaultValue={getPropertyAmenitiesText(editingProperty)} className="w-full resize-y rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-gold" placeholder="Piscina, Parqueo, Sauna" /></div>
              <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Keywords de busqueda</label><textarea name="keywords" rows={2} defaultValue={getPropertyKeywordsText(editingProperty)} className="w-full resize-y rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-gold" placeholder="ideal pareja, inversion, zona premium" /></div>
              <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Search text actual</label><pre className="max-h-32 overflow-y-auto whitespace-pre-wrap rounded border border-[var(--border-soft)] bg-[var(--surface-control)] p-3 text-xs text-[var(--text-main)]">{editingProperty.search_text || "Se generara al guardar."}</pre></div>
              <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Imagenes / videos</label><textarea name="imageLinks" rows={3} defaultValue={getPropertyImageLinks(editingProperty)} className="w-full resize-y rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-gold" placeholder="URLs separadas por coma" /></div>
              <div className="flex flex-col justify-end gap-3 pt-2 sm:flex-row">
                <button type="button" onClick={() => setEditingProperty(null)} className="rounded border border-[var(--border-soft)] px-5 py-3 font-bold text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]">Cancelar</button>
                <button disabled={isSavingEdit} type="submit" className="flex items-center justify-center gap-2 rounded bg-[var(--accent-main)] px-5 py-3 font-bold text-[#2F241D] shadow-md transition-colors hover:bg-[var(--accent-hover)] hover:text-white disabled:opacity-60">
                  {isSavingEdit ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : <><Save size={18} /> Guardar Cambios</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


