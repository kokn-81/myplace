import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3, Loader2, LogOut, Moon, ShieldCheck, Sun } from "lucide-react";
import { GoogleAuthProvider, User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { AppRole, authFetch, cacheAuthProfile, clearCachedAuthProfile, fetchAuthProfile, getCachedAuthProfile } from "../roleAccess";
import { auth, authPersistenceReady } from "../firebase";

const formatMetricNumber = (value: unknown, decimals = 0) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number.toLocaleString("es-BO", { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) : "0";
};

const formatMetricCurrency = (value: unknown) => {
  const number = Number(value ?? 0);
  return number > 0 ? `$ ${number.toFixed(4)}` : "$ 0";
};

const formatMetricDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("es-BO", { dateStyle: "short", timeStyle: "short" });
};

export default function NiaMetricsDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [role, setRole] = useState<AppRole>("user");
  const [roleLoading, setRoleLoading] = useState(false);
  const [niaMetrics, setNiaMetrics] = useState<any | null>(null);
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

  const fetchNiaMetrics = useCallback(async () => {
    if (!user || !isAdmin) return;
    const res = await authFetch("/admin/nia/metrics", user);
    if (!res.ok) return;
    setNiaMetrics(await res.json());
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
    fetchNiaMetrics();
  }, [fetchNiaMetrics]);

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

  if (authLoading || (roleLoading && role === "user")) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--surface-page)]"><Loader2 className="animate-spin text-[var(--accent-main)] w-8 h-8" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center font-sans p-4">
        <div className="bg-[var(--surface-panel)] p-8 rounded-xl shadow-[var(--shadow-warm)] border border-[var(--border-soft)] text-center max-w-sm w-full">
          <ShieldCheck className="w-12 h-12 text-[var(--accent-main)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--text-main)] mb-2 uppercase tracking-widest">O.P.A.L.O.</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">Identificacion biometrica digital requerida.</p>
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
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-[var(--border-soft)] pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent-main)]"><BarChart3 size={16} /> NIA</p>
              <h1 className="text-4xl font-bold uppercase tracking-tight text-[var(--color-chocolate)] dark:text-[var(--text-main)]">Metricas de Busqueda</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Coste, velocidad, cache, precision operativa y uso del LLM.</p>
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

        {!niaMetrics ? (
          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-8 text-center shadow-[var(--shadow-warm)]">
            <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-[var(--accent-main)]" />
            <p className="text-sm text-[var(--text-muted)]">Cargando metricas...</p>
          </div>
        ) : (
          <section className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-[var(--shadow-warm)]">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ["Busquedas", formatMetricNumber(niaMetrics.total_searches), "Total registrado"],
                ["LLM", `${formatMetricNumber(niaMetrics.llm_percentage, 2)}%`, `${formatMetricNumber(niaMetrics.llm_searches)} consultas`],
                ["Cache", `${formatMetricNumber(niaMetrics.cache_hit_percentage, 2)}%`, `${formatMetricNumber(niaMetrics.active_cache_entries)} activas`],
                ["Sin resultados", `${formatMetricNumber(niaMetrics.zero_result_percentage, 2)}%`, `${formatMetricNumber(niaMetrics.zero_result_searches)} consultas`],
                ["Latencia media", `${formatMetricNumber(niaMetrics.avg_latency_ms, 1)} ms`, `P95 ${formatMetricNumber(niaMetrics.p95_latency_ms)} ms`],
                ["Embeddings", `${formatMetricNumber(niaMetrics.embedding_percentage, 2)}%`, `${formatMetricNumber(niaMetrics.embedding_searches)} consultas`],
                ["Cobertura emb.", `${formatMetricNumber(niaMetrics.embedding_coverage_percentage, 2)}%`, `${formatMetricNumber(niaMetrics.embedded_properties)} / ${formatMetricNumber(niaMetrics.total_properties)} inmuebles`],
                ["Tokens LLM", formatMetricNumber(niaMetrics.tokens_total), `${formatMetricNumber(niaMetrics.tokens_input_total)} in / ${formatMetricNumber(niaMetrics.tokens_output_total)} out`],
                ["Costo estimado", formatMetricCurrency(niaMetrics.estimated_cost_total), "Configurable por modelo"],
              ].map(([label, value, detail]) => (
                <div key={label} className="rounded border border-[var(--border-soft)] bg-[var(--surface-control)] p-3">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
                  <p className="mt-1 text-xl font-bold text-[var(--text-main)]">{value}</p>
                  <p className="mt-1 text-[10px] text-[var(--text-muted)]">{detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded border border-[var(--border-soft)] bg-[var(--surface-control)] p-4">
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-main)]">Capas del router</h3>
                <div className="space-y-3">
                  {(niaMetrics.layer_details || []).length === 0 ? <p className="text-xs text-[var(--text-muted)]">Sin datos.</p> : niaMetrics.layer_details.map((layer: any) => (
                    <div key={layer.layer}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                        <span className="font-bold text-[var(--text-main)]">{layer.layer}</span>
                        <span className="text-[var(--text-muted)]">{formatMetricNumber(layer.count)} / {formatMetricNumber(layer.percentage, 2)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded bg-[var(--surface-panel-muted)]">
                        <div className="h-full bg-[var(--accent-main)]" style={{ width: `${Math.min(100, Number(layer.percentage || 0))}%` }} />
                      </div>
                      <p className="mt-1 text-[10px] text-[var(--text-muted)]">{formatMetricNumber(layer.avg_latency_ms, 1)} ms promedio | {formatMetricNumber(layer.avg_results, 1)} resultados promedio | {formatMetricNumber((layer.tokens_input || 0) + (layer.tokens_output || 0))} tokens</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded border border-[var(--border-soft)] bg-[var(--surface-control)] p-4">
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-main)]">Consultas frecuentes</h3>
                <div className="space-y-2">
                  {(niaMetrics.top_queries || []).length === 0 ? <p className="text-xs text-[var(--text-muted)]">Sin datos.</p> : niaMetrics.top_queries.map((item: any) => (
                    <div key={item.query} className="flex items-start justify-between gap-3 border-b border-[var(--border-soft)] pb-2 last:border-0 last:pb-0">
                      <p className="text-xs font-medium text-[var(--text-main)]">{item.query}</p>
                      <p className="shrink-0 text-right text-[10px] text-[var(--text-muted)]">{formatMetricNumber(item.count)}x<br />{formatMetricNumber(item.avg_results, 1)} res.</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded border border-[var(--border-soft)] bg-[var(--surface-control)] p-4">
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-main)]">Consultas sin resultados</h3>
                <div className="space-y-2">
                  {(niaMetrics.zero_result_queries || []).length === 0 ? <p className="text-xs text-[var(--text-muted)]">Sin fallos registrados.</p> : niaMetrics.zero_result_queries.map((item: any) => (
                    <div key={item.query} className="flex justify-between gap-3 text-xs">
                      <span className="text-[var(--text-main)]">{item.query}</span>
                      <span className="font-bold text-[var(--accent-main)]">{formatMetricNumber(item.count)}x</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded border border-[var(--border-soft)] bg-[var(--surface-control)] p-4">
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-main)]">Ultimas busquedas</h3>
                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {(niaMetrics.recent_searches || []).length === 0 ? <p className="text-xs text-[var(--text-muted)]">Sin datos.</p> : niaMetrics.recent_searches.map((item: any, index: number) => (
                    <div key={`${item.created_at}-${index}`} className="rounded border border-[var(--border-soft)] bg-[var(--surface-panel)] p-2">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-medium text-[var(--text-main)]">{item.query}</p>
                        <span className="shrink-0 rounded bg-[var(--accent-main)]/15 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--accent-main)]">{item.layer}</span>
                      </div>
                      <p className="mt-1 text-[10px] text-[var(--text-muted)]">{formatMetricDate(item.created_at)} | {formatMetricNumber(item.result_count)} resultados | {formatMetricNumber(item.latency_ms)} ms | {item.cache_hit ? "cache" : "nuevo"} | {item.llm_used ? "LLM" : "sin LLM"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
