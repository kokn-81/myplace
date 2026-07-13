import React, { Suspense, lazy, useCallback, useEffect, useState, useMemo } from "react";
import { Property, PropertyOffer } from "../types";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { CustomSelect } from "../components/CustomSelect";
import { Search, MapPin, Building, Bed, Bath, X, Sparkles, LogOut, Sun, Moon, ChevronLeft, ChevronRight, Images, ExternalLink, ShieldCheck } from "lucide-react";
import { GoogleAuthProvider, User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { API_BASE, AppRole, fetchAuthProfile } from "../roleAccess";

const MapCanvas = lazy(() => import("../components/MapCanvas"));




const MAPBOX_TOKEN =
  process.env.VITE_MAPBOX_TOKEN ||
  (import.meta as any).env?.VITE_MAPBOX_TOKEN ||
  (globalThis as any).VITE_MAPBOX_TOKEN ||
  "";

const isCloudinaryCollectionUrl = (url?: string) =>
  Boolean(url && /^https:\/\/collection\.cloudinary\.com\//i.test(url.trim()));

const isVideoUrl = (url?: string) =>
  Boolean(url && /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url.trim()));

const normalizeMediaLinks = (inm: any): string[] => {
  if (Array.isArray(inm.images)) {
    return inm.images.map((url: unknown) => String(url).trim()).filter(Boolean);
  }

  if (inm.imagen_url) return [String(inm.imagen_url).trim()];
  if (inm.imagenes) {
    return String(inm.imagenes)
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
  }

  return [];
};

const mapApiProperty = (inm: any): Property => {
  const offers: PropertyOffer[] = Array.isArray(inm.ofertas)
    ? inm.ofertas.map((offer: any) => ({
        id: offer.id?.toString(),
        operation: offer.operacion,
        price: Number(offer.precio ?? 0),
        currency: offer.moneda || "$ (USD)",
        status: offer.estado || "Publicado",
        agentId: offer.agente_id?.toString(),
        agentName: offer.agente?.name ?? "",
        agentWhatsapp: offer.agente?.whatsapp ?? "",
      }))
    : [];
  const primaryOffer = offers[0];

  return {
    id: inm.id.toString(),
    title: inm.titulo,
    price: Number(primaryOffer?.price ?? inm.precio_usd ?? 0),
    rooms: inm.habitaciones,
    bathrooms: Number(inm.banos ?? inm.bathrooms ?? 1) || 1,
    area: inm.ciudad,
    lat: inm.lat,
    lng: inm.lng,
    operation: primaryOffer?.operation ?? inm.operacion,
    type: inm.tipo_inmueble,
    description: inm.descripcion || "",
    amenities: Array.isArray(inm.amenidades) ? inm.amenidades : [],
    images: normalizeMediaLinks(inm),
    currency: primaryOffer?.currency ?? inm.moneda,
    exchangeRate: "Oficial",
    agentId: primaryOffer?.agentId ?? inm.agente_id,
    agentName: primaryOffer?.agentName ?? inm.agente?.name ?? inm.agente_nombre ?? "",
    agentWhatsapp: primaryOffer?.agentWhatsapp ?? inm.agente?.whatsapp ?? inm.agente_whatsapp ?? "",
    offers,
    detailsLoaded: Boolean(inm.detalle_completo),
  };
};

const renderMedia = (url: string, className: string, alt: string, controls = false) => (
  isVideoUrl(url) ? (
    <video
      src={url}
      className={className}
      controls={controls}
      muted={!controls}
      playsInline
      preload="metadata"
    />
  ) : (
    <img
      src={url}
      className={className}
      alt={alt}
      loading="lazy"
    />
  )
);

const formatPropertyPrice = (price: number, currency?: string) => {
  const symbol = currency?.toLowerCase().includes("bs") ? "Bs" : "$";
  return `${symbol} ${Number(price || 0).toLocaleString("es-BO")}`;
};

const normalizeWhatsappNumber = (value?: string) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("591")) return digits;
  if (digits.length === 8) return `591${digits}`;
  return digits;
};

type SearchIntent = "rent" | "buy" | null;

const detectSearchIntent = (queries: string[]): SearchIntent => {
  const text = queries.join(" ").toLowerCase();
  const investmentIntent =
    /(^|\s)(invertir|inversion|inversión|rentabilidad)(\s|$)/.test(text) ||
    /generar\s+renta/.test(text) ||
    /para\s+(rentar|alquilar|arrendar)/.test(text);

  if (investmentIntent || /(^|\s)(comprar|compra|venta|vender|adquirir)(\s|$)/.test(text)) return "buy";
  if (/(^|\s)(alquilar|alquiler|rentar|arriendo|arrendar)(\s|$)/.test(text)) return "rent";
  return null;
};

const normalizeOfferOperation = (operation?: string) => {
  const value = String(operation || "").toLowerCase();
  if (value.includes("alquiler") || value.includes("renta") || value.includes("arrendar")) return "rent";
  if (value.includes("venta") || value.includes("compra") || value.includes("comprar")) return "buy";
  return null;
};

const selectPropertyOffer = (property: Property, intent: SearchIntent): PropertyOffer => {
  const offers = property.offers?.filter((offer) => (offer.status || "Publicado") === "Publicado") ?? [];
  const matchingOffer = intent ? offers.find((offer) => normalizeOfferOperation(offer.operation) === intent) : undefined;
  return matchingOffer || offers[0] || {
    operation: property.operation,
    price: property.price,
    currency: property.currency,
    agentId: property.agentId,
    agentName: property.agentName,
    agentWhatsapp: property.agentWhatsapp,
  };
};

const getPropertyOffers = (property: Property): PropertyOffer[] => {
  const offers = property.offers?.filter((offer) => (offer.status || "Publicado") === "Publicado") ?? [];
  if (offers.length > 0) return offers;
  return [{
    operation: property.operation,
    price: property.price,
    currency: property.currency,
    agentId: property.agentId,
    agentName: property.agentName,
    agentWhatsapp: property.agentWhatsapp,
  }];
};

const hasRentAndSaleOffers = (property: Property) => {
  const offerTypes = getPropertyOffers(property).map((offer) => normalizeOfferOperation(offer.operation));
  return offerTypes.includes("rent") && offerTypes.includes("buy");
};

const getCarouselOfferLabel = (property: Property, offer: PropertyOffer, intent: SearchIntent) => {
  if (!intent && hasRentAndSaleOffers(property)) return "Alquiler / Venta";
  return offer.operation;
};

const shouldShowCarouselPrice = (property: Property, intent: SearchIntent) => {
  return Boolean(intent) || getPropertyOffers(property).length === 1;
};

const getWhatsappContactUrl = (property: Property, offer?: PropertyOffer) => {
  const phone = normalizeWhatsappNumber(offer?.agentWhatsapp || property.agentWhatsapp);
  if (!phone) return "";
  const operationText = offer?.operation ? ` (${offer.operation})` : "";
  const message = `Hola, quisiera recibir informacion sobre el inmueble #${property.id}${operationText} - ${property.title}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export default function MapPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [userRole, setUserRole] = useState<AppRole>("user");
  const [loginError, setLoginError] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const selectProperty = useCallback(async (property: Property) => {
    setSelectedProperty(property);
    if (property.detailsLoaded) return;

    try {
      const res = await fetch(`${API_BASE}/inmuebles/${property.id}`);
      if (!res.ok) return;
      const detail = mapApiProperty(await res.json());
      setProperties((current) => current.map((item) => (item.id === detail.id ? detail : item)));
      setSelectedProperty(detail);
    } catch (error) {
      console.error("Error cargando detalle del inmueble:", error);
    }
  }, []);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryDirection, setGalleryDirection] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    const dark = saved ? saved === 'dark' : document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    return dark;
  });
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);

  const applyTheme = (dark: boolean) => {
    setIsThemeTransitioning(true);
    document.documentElement.classList.add('theme-switching');
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    setIsDarkMode(dark);

    window.setTimeout(() => {
      document.documentElement.classList.remove('theme-switching');
      setIsThemeTransitioning(false);
    }, 420);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setUserRole("user");
      if (currentUser) {
        setRoleLoading(true);
        try {
          const profile = await fetchAuthProfile(currentUser);
          setUserRole(profile.role);
        } catch (error) {
          console.error("Error validando rol:", error);
          setUserRole("user");
        } finally {
          setRoleLoading(false);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setLoginError("");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      setLoginError(error.message || "No se pudo iniciar sesion.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const dashboardLink = userRole === "admin" ? "/admin" : userRole === "advisor" ? "/asesor" : null;
  const dashboardLabel = userRole === "admin" ? "Admin" : "Asesor";
  // --- ESTADOS DE FILTRADO ---
  const [geminiQuery, setGeminiQuery] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [aiFilteredIds, setAiFilteredIds] = useState<string[] | null>(null);
  const [aiFilterHistory, setAiFilterHistory] = useState<string[]>([]);
  const [activeSearchIntent, setActiveSearchIntent] = useState<SearchIntent>(null);


  // [OPALO-BRIDGE] Lectura Consolidada
  useEffect(() => {
    const fetchDatos = async () => {
      try {

        const resInmuebles = await fetch(`${API_BASE}/inmuebles/resumen`);
        if (!resInmuebles.ok) throw new Error("Fallo en la conexion al motor Python");

        const datosPython = await resInmuebles.json();
        setProperties(datosPython.map(mapApiProperty));
      } catch (error) {
        console.error("Error cargando el catalogo:", error);
      }
    };

    fetchDatos();
  }, []);

  const clearAiFilters = () => {
    setAiFilteredIds(null);
    setAiFilterHistory([]);
    setGeminiQuery("");
    setCurrentIndex(0);
  };

  // [OPALO-BRIDGE] Motor de Filtrado Semantico acumulativo
  const handleAskGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = geminiQuery.trim();
    if (!query) {
      clearAiFilters();
      return;
    }

    const queryIntent = detectSearchIntent([query]);
    setIsAsking(true);

    try {
      const candidateIds = aiFilteredIds?.map((id) => Number(id)).filter((id) => !Number.isNaN(id));
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: query,
          candidate_ids: candidateIds && candidateIds.length > 0 ? candidateIds : undefined,
        }),
      });

      if (!res.ok) throw new Error("Fallo en la red neuronal");

      const data = await res.json();

      if (data.ids && Array.isArray(data.ids)) {
        const stringIds = data.ids.map((id: number | string) => id.toString());
        setAiFilteredIds(stringIds);
        setAiFilterHistory((current) => [...current, query]);
        if (queryIntent) setActiveSearchIntent(queryIntent);
        setGeminiQuery("");
        setCurrentIndex(0);
      } else {
        setAiFilteredIds([]);
        setAiFilterHistory((current) => [...current, query]);
        if (queryIntent) setActiveSearchIntent(queryIntent);
      }
    } catch (err) {
      console.error("Fallo critico en motor semantico:", err);
      setAiFilteredIds([]);
    } finally {
      setIsAsking(false);
    }
  };
  // --- LÃ“GICA DE INTERSECCIÃ“N DE FILTROS ---
  const filteredProperties = useMemo(() => properties.filter((p) => {
   // Si la IA filtrÃ³ algo y el ID no estÃ en la lista, lo ocultamos
    if (aiFilteredIds !== null && !aiFilteredIds.includes(p.id)) return false;
    return true;
  }), [properties, aiFilteredIds]);

  const searchIntent = useMemo(() => activeSearchIntent ?? detectSearchIntent(aiFilterHistory), [activeSearchIntent, aiFilterHistory]);
  const selectedDisplayOffer = selectedProperty ? selectPropertyOffer(selectedProperty, searchIntent) : null;

  useEffect(() => {
    setGalleryIndex(0);
  }, [selectedProperty?.id]);

  const selectedMedia = selectedProperty?.images ?? [];
  const selectedMediaCount = selectedMedia.length;
  const normalizedGalleryIndex = selectedMediaCount > 0 ? galleryIndex % selectedMediaCount : 0;
  const activeMedia = selectedMedia[normalizedGalleryIndex] || "";
  const previousMedia = selectedMediaCount > 1 ? selectedMedia[(normalizedGalleryIndex - 1 + selectedMediaCount) % selectedMediaCount] : "";
  const nextMedia = selectedMediaCount > 1 ? selectedMedia[(normalizedGalleryIndex + 1) % selectedMediaCount] : "";

  const shiftGallery = (direction: number) => {
    if (selectedMediaCount <= 1) return;
    setGalleryDirection(direction);
    setGalleryIndex((prev) => (prev + direction + selectedMediaCount) % selectedMediaCount);
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobileCarousel, setIsMobileCarousel] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobileCarousel(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const carouselStep = isMobileCarousel ? 1 : 2;

  const visibleProperties = useMemo(() => {
    return filteredProperties.slice(currentIndex, currentIndex + carouselStep);
  }, [filteredProperties, currentIndex, carouselStep]);

  useEffect(() => {
    if (currentIndex >= filteredProperties.length) {
      setCurrentIndex(Math.max(0, filteredProperties.length - carouselStep));
    }
  }, [carouselStep, currentIndex, filteredProperties.length]);


  return (
    // CONTENEDOR MAESTRO: 100% Pantalla
    <div className="relative h-screen w-full overflow-hidden bg-[var(--surface-page)] dark:bg-[var(--surface-panel)] font-sans">

      {/* CAPA 0: EL MAPA DE FONDO */}
      <main className="absolute inset-0 z-0">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center bg-[var(--surface-page)] text-[var(--accent-main)] dark:bg-[var(--surface-panel)]">
              <div className="h-8 w-8 rounded-full border-2 border-[var(--accent-main)] border-t-transparent animate-spin" />
            </div>
          }
        >
          <MapCanvas
            mapboxToken={MAPBOX_TOKEN}
            properties={filteredProperties}
            isDarkMode={isDarkMode}
            onSelectProperty={selectProperty}
          />
        </Suspense>
        <AnimatePresence>
          {isThemeTransitioning && (
            <motion.div
              key="theme-transition-veil"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="theme-transition-veil pointer-events-none absolute inset-0 z-10 bg-[var(--surface-page)] dark:bg-[var(--surface-panel)]"
            />
          )}
        </AnimatePresence>
      </main>

      {/* BOTONES SUPERIORES (Laterales) */}
      <div className="absolute top-6 left-6 z-10 hidden md:block">
        <button
          onClick={() => applyTheme(!isDarkMode)}
          className="p-3 bg-[var(--color-chocolate)] dark:bg-[rgba(27,20,17,0.94)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--accent-main)]/50 dark:border-[var(--border-soft)] text-[var(--color-ivory)] dark:text-[var(--text-main)] hover:bg-[var(--accent-hover)] hover:text-white transition-colors flex items-center justify-center"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      {dashboardLink ? (
        <Link to={dashboardLink} className="absolute top-6 right-6 bg-[var(--color-chocolate)] dark:bg-[rgba(27,20,17,0.94)] backdrop-blur px-4 py-2.5 rounded-xl border border-[var(--accent-main)]/50 dark:border-[var(--border-soft)] shadow-lg text-xs font-bold text-[var(--color-ivory)] dark:text-[var(--text-muted)] hover:bg-[var(--accent-hover)] hover:text-white hidden md:flex items-center gap-2 transition-colors z-10">
          <LogOut size={14} /> <span className="hidden sm:inline">{roleLoading ? "..." : dashboardLabel}</span>
        </Link>
      ) : user ? (
        <button onClick={handleLogout} className="absolute top-6 right-6 bg-[var(--color-chocolate)] dark:bg-[rgba(27,20,17,0.94)] backdrop-blur px-4 py-2.5 rounded-xl border border-[var(--accent-main)]/50 dark:border-[var(--border-soft)] shadow-lg text-xs font-bold text-[var(--color-ivory)] dark:text-[var(--text-muted)] hover:bg-[var(--accent-hover)] hover:text-white hidden md:flex items-center gap-2 transition-colors z-10">
          <LogOut size={14} /> <span className="hidden sm:inline">Salir</span>
        </button>
      ) : (
        <button onClick={handleLogin} disabled={authLoading} className="absolute top-6 right-6 bg-[var(--color-chocolate)] dark:bg-[rgba(27,20,17,0.94)] backdrop-blur px-4 py-2.5 rounded-xl border border-[var(--accent-main)]/50 dark:border-[var(--border-soft)] shadow-lg text-xs font-bold text-[var(--color-ivory)] dark:text-[var(--text-muted)] hover:bg-[var(--accent-hover)] hover:text-white hidden md:flex items-center gap-2 transition-colors z-10">
          <ShieldCheck size={14} /> <span className="hidden sm:inline">Entrar</span>
        </button>
      )}

      {/* HUD MOVIL: controles compactos en una sola fila */}
      <div className="absolute left-4 right-4 top-5 z-10 flex items-center gap-2 md:hidden">
        <button
          onClick={() => applyTheme(!isDarkMode)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-main)]/50 bg-[var(--color-chocolate)] text-[var(--color-ivory)] shadow-lg transition-colors hover:bg-[var(--accent-hover)]"
          aria-label="Cambiar tema"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <form
          onSubmit={handleAskGemini}
          className="min-w-0 flex-1 rounded-full border border-[var(--border-soft)] bg-[rgba(255,253,246,0.9)] p-1 shadow-[var(--shadow-warm)] backdrop-blur-xl dark:bg-[rgba(16,12,10,0.62)]"
        >
          <div className="flex items-center">
            <div className="flex items-center pl-3 pr-1">
              {isAsking ? (
                <div className="h-4 w-4 rounded-full border-2 border-gold border-t-transparent animate-spin" />
              ) : (
                <Sparkles className="h-5 w-4 text-[var(--accent-main)]" />
              )}
            </div>

            <input
              type="text"
              value={geminiQuery}
              onChange={(e) => setGeminiQuery(e.target.value)}
              disabled={isAsking}
              placeholder={isAsking ? "IA analizando..." : "Ej: Depto pet-friendly..."}
              className="min-w-0 flex-1 bg-transparent px-1 text-[13px] text-[var(--text-main)] outline-none placeholder-[var(--text-muted)] disabled:opacity-50"
            />

            {aiFilteredIds !== null && (
              <button type="button" onClick={clearAiFilters} className="p-1.5 text-stone-500 transition-colors hover:text-red-400" title="Limpiar filtros">
                <X size={15} />
              </button>
            )}

            <button
              type="submit"
              disabled={isAsking}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-main)] text-[#2F241D] shadow-md transition-colors hover:bg-[var(--accent-hover)] hover:text-white disabled:opacity-70"
              aria-label="Buscar"
            >
              <Search size={16} />
            </button>
          </div>
        </form>

        {dashboardLink ? (
          <Link to={dashboardLink} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-main)]/50 bg-[var(--color-chocolate)] text-[var(--color-ivory)] shadow-lg transition-colors hover:bg-[var(--accent-hover)]" aria-label={dashboardLabel}>
            <LogOut size={16} />
          </Link>
        ) : user ? (
          <button onClick={handleLogout} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-main)]/50 bg-[var(--color-chocolate)] text-[var(--color-ivory)] shadow-lg transition-colors hover:bg-[var(--accent-hover)]" aria-label="Salir">
            <LogOut size={16} />
          </button>
        ) : (
          <button onClick={handleLogin} disabled={authLoading} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-main)]/50 bg-[var(--color-chocolate)] text-[var(--color-ivory)] shadow-lg transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-60" aria-label="Entrar">
            <ShieldCheck size={16} />
          </button>
        )}
      </div>
      {/* CAPA 1: HUD SUPERIOR (Pildora de Busqueda IA - Version Conserjeria) */}
      <div className="absolute top-6 left-1/2 z-10 hidden w-[60%] max-w-2xl -translate-x-1/2 md:block">
        <form
          onSubmit={handleAskGemini}
          className="bg-[rgba(255,253,246,0.88)] dark:bg-[rgba(16,12,10,0.58)] backdrop-blur-xl shadow-[var(--shadow-warm)] rounded-full p-1 flex items-center border border-[var(--border-soft)] dark:border-[var(--border-soft)] transition-all focus-within:bg-[var(--surface-panel)] dark:focus-within:bg-[rgba(27,20,17,0.88)]"
        >
          <div className="pl-3 pr-1.5 sm:pl-4 sm:pr-2 flex items-center">
            {isAsking ? (
              <div className="h-4 w-4 rounded-full border-2 border-gold border-t-transparent animate-spin" />
            ) : (
              <Sparkles className="h-6 w-4 text-[var(--accent-main)]" />
            )}
          </div>

          <input
            type="text"
            value={geminiQuery}
            onChange={(e) => setGeminiQuery(e.target.value)}
            disabled={isAsking}
            placeholder={isAsking ? "IA analizando..." : "Ej: Depto pet-friendly..."}
            className="w-full min-w-0 bg-transparent border-none outline-none px-1.5 sm:px-2 text-[var(--text-main)] dark:text-[var(--text-main)] placeholder-[var(--text-muted)] dark:placeholder-stone-300 font-sans text-[13px] sm:text-sm tracking-wide disabled:opacity-50"
          />

          {aiFilteredIds !== null && (
            <button type="button" onClick={clearAiFilters} className="p-2 text-stone-500 hover:text-red-400 transition-colors" title="Limpiar filtros">
              <X size={16} />
            </button>
          )}

          {/* Boton Conserje: Ajustado en padding y tipografia para ser compacto */}
          <button
            type="submit"
            disabled={isAsking}
            className="bg-[var(--accent-main)] text-[#2F241D] px-4 sm:px-5 py-2 rounded-full hover:bg-[var(--accent-hover)] hover:text-white transition-all duration-300 font-bold shadow-md flex items-center gap-1.5 disabled:opacity-70 text-[11px] uppercase tracking-[0.1em]"
          >
            <Search size={14} className="md:hidden" />
            <span className="hidden md:inline">Buscar</span>
          </button>
        </form>
        {aiFilteredIds !== null && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[10px] uppercase tracking-[0.12em]">
            {aiFilterHistory.map((filter, index) => (
              <span key={`${filter}-${index}`} className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-panel)]/90 dark:bg-[rgba(27,20,17,0.88)] px-3 py-1.5 text-[var(--text-muted)] shadow-sm">
                {filter}
              </span>
            ))}
            <span className="rounded-full border border-[var(--accent-main)]/40 bg-[var(--accent-main)]/15 px-3 py-1.5 font-bold text-[var(--accent-main)]">
              {filteredProperties.length} resultado{filteredProperties.length === 1 ? "" : "s"}
            </span>
            <button type="button" onClick={clearAiFilters} className="rounded-full bg-[var(--color-chocolate)] px-3 py-1.5 font-bold text-[var(--color-ivory)] transition-colors hover:bg-[var(--accent-hover)]">
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* CAPA 2: VISOR EDITORIAL PANORAMICO (Formato Ejecutivo) */}
<div className="absolute bottom-24 left-0 right-0 z-20 flex h-[230px] w-full items-center justify-center px-4 md:bottom-8 md:left-1/2 md:right-auto md:h-[240px] md:w-[98%] md:max-w-[1040px] md:-translate-x-1/2 md:justify-between md:gap-4 md:px-0">

  <button
    onClick={() => setCurrentIndex(prev => Math.max(0, prev - carouselStep))}
    disabled={currentIndex === 0}
    className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-[var(--accent-main)]/85 p-3 text-[#2F241D] shadow-xl transition-all hover:bg-[var(--accent-hover)] hover:text-white disabled:opacity-30 dark:bg-[rgba(27,20,17,0.94)] dark:text-[var(--text-main)] md:static md:translate-y-0 md:shrink-0"
  >
    <ChevronLeft size={28} />
  </button>

  {/* Contenedor central expandido */}
  <motion.div
    layout
    className="flex h-full w-full items-center justify-center overflow-hidden px-12 md:flex-1 md:gap-7 md:px-0"
  >
    <AnimatePresence mode="popLayout" initial={false}>
      {visibleProperties.map((p, index) => {
        const coverUrl = p.images[0];
        const isCollection = isCloudinaryCollectionUrl(coverUrl);
        const displayOffer = selectPropertyOffer(p, searchIntent);
        const showCarouselPrice = shouldShowCarouselPrice(p, searchIntent);

        return (
        <motion.div
          layout
          key={p.id}
          initial={{ opacity: 0, x: 42, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: -34, y: 8, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.9, delay: index * 0.035 }}
          onClick={() => selectProperty(p)}
          // Tarjetas compactas para que el borde respire completo
          className="group flex h-[210px] w-full max-w-[400px] shrink-0 cursor-pointer flex-row overflow-hidden rounded-xl border border-[var(--border-strong)]/50 bg-[var(--surface-panel)] shadow-[var(--shadow-warm)] ring-[var(--accent-main)] transition-shadow duration-300 hover:ring-2 dark:border-[var(--border-soft)] dark:bg-[var(--surface-panel)] md:w-[430px] md:max-w-none"
        >
        {/* PANEL IZQUIERDO: Imagen (50% del ancho) */}
        <div className="relative h-full w-[48%] shrink-0 overflow-hidden md:w-[50%]">
          {coverUrl && !isCollection ? (
            isVideoUrl(coverUrl) ? (
              <video
                src={coverUrl}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={coverUrl}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt={p.title}
              />
            )
          ) : (
            <div className="w-full h-full bg-[var(--surface-panel-muted)] dark:bg-[var(--surface-control)] flex flex-col items-center justify-center text-[var(--accent-main)] gap-3 px-6 text-center">
              <Images size={32} />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-main)] dark:text-[var(--text-muted)]">
                Galeria Cloudinary
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[var(--surface-panel)] dark:to-stone-900 pointer-events-none" />
        </div>

        {/* PANEL DERECHO: Informacion (50% del ancho) con mas margen de respiro */}
        <div className="relative flex h-full min-w-0 flex-1 flex-col justify-center bg-[var(--surface-panel)] p-4 text-[var(--text-main)] dark:bg-[var(--surface-panel)] dark:text-[var(--text-main)] md:w-[50%] md:flex-none md:p-5">

          <span className="text-[10px] text-[var(--accent-main)] font-bold tracking-[0.18em] uppercase mb-2">Ref. #{p.id}</span>
          <h3 className="mb-2 line-clamp-2 text-[13px] font-bold leading-snug tracking-wide md:text-sm">
            {p.title}
          </h3>

          <div className={`mb-3 flex min-w-0 items-baseline md:mb-4 ${showCarouselPrice ? "justify-between gap-3" : ""}`}>
            <span className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] md:text-xs">
              {getCarouselOfferLabel(p, displayOffer, searchIntent)}
            </span>
            {showCarouselPrice && (
              <span className="shrink-0 text-sm font-bold text-[var(--accent-main)] md:text-base">
                {formatPropertyPrice(displayOffer.price, displayOffer.currency)}
              </span>
            )}
          </div>

          <div className="mt-auto grid grid-cols-2 gap-x-2 gap-y-2 border-t border-[var(--border-soft)] pt-3 text-[9px] font-medium uppercase tracking-wider text-[var(--text-muted)] dark:border-[var(--border-soft)] dark:text-[var(--text-muted)] md:gap-x-4 md:text-[10px]">
             <div className="flex min-w-0 items-center gap-2">
                <Bed size={14} className="shrink-0 text-[var(--accent-secondary)] dark:text-[var(--text-muted)]" />
                <span className="truncate">{p.rooms} dorm</span>
             </div>
             <div className="flex min-w-0 items-center gap-2">
                <Bath size={14} className="shrink-0 text-[var(--accent-secondary)] dark:text-[var(--text-muted)]" />
                <span className="truncate">{p.bathrooms} baño{p.bathrooms === 1 ? "" : "s"}</span>
             </div>
             <div className="col-span-2 flex min-w-0 items-center gap-2">
                <Building size={14} className="shrink-0 text-[var(--accent-secondary)] dark:text-[var(--text-muted)]" />
                <span className="truncate">{p.area}</span>
             </div>
          </div>
        </div>
        </motion.div>
      )})}
    </AnimatePresence>
  </motion.div>

  <button
    onClick={() => setCurrentIndex(prev => Math.min(Math.max(0, filteredProperties.length - carouselStep), prev + carouselStep))}
    disabled={currentIndex + carouselStep >= filteredProperties.length}
    className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-[var(--accent-main)]/85 p-3 text-[#2F241D] shadow-xl transition-all hover:bg-[var(--accent-hover)] hover:text-white disabled:opacity-30 dark:bg-[rgba(27,20,17,0.94)] dark:text-[var(--text-main)] md:static md:translate-y-0 md:shrink-0"
  >
    <ChevronRight size={28} />
  </button>
</div>

      {/* CAPA 3: MODAL INMERSIVO DE PANTALLA COMPLETA (Desliza desde abajo) */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 w-full h-full bg-[var(--surface-panel)] dark:bg-[var(--surface-page)] z-[100] flex flex-col overflow-y-auto"
          >
            {/* Boton de Cierre Flotante */}
            <button
              onClick={() => setSelectedProperty(null)}
              className="fixed top-6 right-6 md:right-10 p-3 bg-[var(--color-chocolate)]/90 backdrop-blur-md rounded-full text-[var(--color-ivory)] hover:bg-[var(--accent-hover)] transition-all z-50 shadow-2xl border border-[var(--accent-main)]/40"
            >
              <X size={24} />
            </button>

            {/* GALERIA CINEMATOGRAFICA (Carrusel Horizontal Completo) */}
            <div className="w-full bg-[#EFE3C9] dark:bg-[#120D0B] py-8 pt-24 shrink-0 border-b border-[var(--border-soft)] dark:border-[var(--border-soft)]">
              {isCloudinaryCollectionUrl(selectedMedia[0]) ? (
                <div className="px-6 md:px-12 pb-6">
                  <div className="max-w-6xl mx-auto aspect-[16/9] min-h-[420px] rounded-xl overflow-hidden shadow-[var(--shadow-warm)] relative bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-strong)]/40 dark:border-[var(--border-soft)]">
                    <iframe
                      src={selectedMedia[0]}
                      title={`${selectedProperty.title} - Galeria Cloudinary`}
                      className="w-full h-full bg-white"
                      loading="lazy"
                    />
                    <a
                      href={selectedMedia[0]}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white hover:text-[var(--accent-main)] text-[10px] font-bold tracking-widest px-3 py-2 rounded-full uppercase flex items-center gap-2 transition-colors"
                    >
                      <ExternalLink size={13} />
                      Abrir galeria
                    </a>
                  </div>
                </div>
              ) : selectedMediaCount > 0 ? (
                <div className="relative w-full overflow-hidden px-4 md:px-0 pb-8">
                  <div className="relative min-h-[360px] h-[68vw] max-h-[680px] flex items-center justify-center overflow-hidden">
                    {previousMedia && (
                      <button
                        type="button"
                        onClick={() => shiftGallery(-1)}
                        className="hidden md:block absolute left-[-6vw] top-1/2 z-10 aspect-square h-[78%] max-h-[520px] -translate-y-1/2 overflow-hidden rounded-r-xl bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-strong)]/50 dark:border-[var(--border-soft)] opacity-70 hover:opacity-100 transition-opacity"
                        aria-label="Imagen anterior"
                      >
                        {renderMedia(previousMedia, "w-full h-full object-cover", `${selectedProperty.title} - anterior`)}
                        <div className="absolute inset-0 bg-black/35" />
                        <div className="absolute left-8 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/20 p-4 text-white backdrop-blur-sm">
                          <ChevronLeft size={42} />
                        </div>
                      </button>
                    )}

                    {nextMedia && (
                      <button
                        type="button"
                        onClick={() => shiftGallery(1)}
                        className="hidden md:block absolute right-[-6vw] top-1/2 z-10 aspect-square h-[78%] max-h-[520px] -translate-y-1/2 overflow-hidden rounded-l-xl bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-strong)]/50 dark:border-[var(--border-soft)] opacity-70 hover:opacity-100 transition-opacity"
                        aria-label="Imagen siguiente"
                      >
                        {renderMedia(nextMedia, "w-full h-full object-cover", `${selectedProperty.title} - siguiente`)}
                        <div className="absolute inset-0 bg-black/35" />
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/20 p-4 text-white backdrop-blur-sm">
                          <ChevronRight size={42} />
                        </div>
                      </button>
                    )}

                    <div className="relative z-20 aspect-square h-full max-h-[680px] w-[min(86vw,680px)] overflow-hidden rounded-xl bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] shadow-[var(--shadow-warm)] border border-[var(--border-strong)]/60 dark:border-[var(--border-soft)]">
                      <AnimatePresence initial={false}>
                        <motion.div
                          key={activeMedia}
                          initial={{ x: galleryDirection > 0 ? "100%" : "-100%", opacity: 1 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: galleryDirection > 0 ? "-100%" : "100%", opacity: 1 }}
                          transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute inset-0"
                        >
                          {renderMedia(activeMedia, "w-full h-full object-cover", `${selectedProperty.title} - Fotografia ${normalizedGalleryIndex + 1}`, true)}
                        </motion.div>
                      </AnimatePresence>
                      <div className="absolute bottom-5 right-5 bg-[var(--color-chocolate)]/80 backdrop-blur-md text-[var(--color-ivory)] text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full uppercase z-30">
                        {normalizedGalleryIndex + 1} / {selectedMediaCount}
                      </div>
                    </div>

                    {selectedMediaCount > 1 && (
                      <div className="md:hidden absolute inset-x-4 top-1/2 z-30 flex -translate-y-1/2 justify-between pointer-events-none">
                        <button
                          type="button"
                          onClick={() => shiftGallery(-1)}
                          className="pointer-events-auto rounded-full bg-black/45 p-3 text-white backdrop-blur-sm border border-white/20"
                          aria-label="Imagen anterior"
                        >
                          <ChevronLeft size={28} />
                        </button>
                        <button
                          type="button"
                          onClick={() => shiftGallery(1)}
                          className="pointer-events-auto rounded-full bg-black/45 p-3 text-white backdrop-blur-sm border border-white/20"
                          aria-label="Imagen siguiente"
                        >
                          <ChevronRight size={28} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="px-6 md:px-12 pb-6">
                  <div className="mx-auto flex aspect-[16/9] max-w-5xl items-center justify-center rounded-xl bg-[var(--surface-panel-muted)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)]">
                    <span className="text-[var(--text-muted)] dark:text-[var(--text-muted)] uppercase tracking-widest text-sm font-bold">Imagenes no disponibles</span>
                  </div>
                </div>
              )}
            </div>

            {/* CONTENIDO EDITORIAL (Maxima Legibilidad) */}
            <div className="w-full max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-12 shrink-0">

               {/* Columna Izquierda: Informacion Extendida */}
               <div className="flex-1">
                  <span className="text-[var(--accent-main)] text-xs font-bold uppercase tracking-[0.24em] block mb-4">Ref. #{selectedProperty.id}</span>
                  <h2 className="text-3xl md:text-5xl font-serif text-[var(--text-main)] dark:text-[var(--text-main)] leading-tight mb-4 tracking-wide">
                    {selectedProperty.title}
                  </h2>
                  <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {getPropertyOffers(selectedProperty).map((offer) => {
                      const isActiveOffer = selectedDisplayOffer && normalizeOfferOperation(offer.operation) === normalizeOfferOperation(selectedDisplayOffer.operation);
                      return (
                        <div key={offer.id || offer.operation} className={`rounded-lg border px-4 py-3 shadow-sm ${isActiveOffer ? "border-[var(--accent-main)] bg-[var(--accent-main)]/10" : "border-[var(--border-soft)] bg-[var(--surface-panel)]/65 dark:bg-[var(--surface-control)]/45"}`}>
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{offer.operation}</div>
                          <div className="mt-1 text-xl font-semibold text-[var(--accent-main)]">{formatPropertyPrice(offer.price, offer.currency)}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bloque de Descripcion */}
                  <div className="mb-12">
                    <h4 className="text-[var(--text-muted)] dark:text-[var(--text-muted)] text-xs font-bold uppercase tracking-[0.2em] mb-4 border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-2">
                      Descripcion de la Propiedad
                    </h4>
                    <p className="text-[var(--text-main)] dark:text-[var(--text-muted)] leading-7 text-[15px] whitespace-pre-wrap font-normal">
                       {selectedProperty.description || "Esta propiedad exclusiva cuenta con acabados de primera calidad y diseno de vanguardia. Contacte a nuestro equipo para obtener el dossier completo y coordinar una visita privada."}
                    </p>
                  </div>

                  {/* Bloque de Amenities / Areas Sociales */}
                  <div className="mb-8">
                    <h4 className="text-[var(--text-muted)] dark:text-[var(--text-muted)] text-xs font-bold uppercase tracking-[0.2em] mb-4 border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-2">
                      Amenities & Detalles
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm text-[var(--text-main)] dark:text-[var(--text-muted)]">
                      {/* Renderizado dinamico o estatico de prueba */}
                      {selectedProperty.amenities ? (
                        selectedProperty.amenities.map((amenity, index) => (
                          <div key={index} className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border-soft)]/70 bg-[var(--surface-panel)]/55 px-3 py-2 text-[13px] font-medium shadow-sm dark:bg-[var(--surface-control)]/45">
                            <Sparkles size={14} className="text-[var(--accent-main)]" />
                            <span>{amenity}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border-soft)]/70 bg-[var(--surface-panel)]/55 px-3 py-2 text-[13px] font-medium shadow-sm dark:bg-[var(--surface-control)]/45"><Sparkles size={14} className="text-[var(--accent-main)]" /><span>Coworking Space</span></div>
                          <div className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border-soft)]/70 bg-[var(--surface-panel)]/55 px-3 py-2 text-[13px] font-medium shadow-sm dark:bg-[var(--surface-control)]/45"><Sparkles size={14} className="text-[var(--accent-main)]" /><span>Piscina Infinita</span></div>
                          <div className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border-soft)]/70 bg-[var(--surface-panel)]/55 px-3 py-2 text-[13px] font-medium shadow-sm dark:bg-[var(--surface-control)]/45"><Sparkles size={14} className="text-[var(--accent-main)]" /><span>Gimnasio Equipado</span></div>
                          <div className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border-soft)]/70 bg-[var(--surface-panel)]/55 px-3 py-2 text-[13px] font-medium shadow-sm dark:bg-[var(--surface-control)]/45"><Sparkles size={14} className="text-[var(--accent-main)]" /><span>Seguridad 24/7</span></div>
                          <div className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border-soft)]/70 bg-[var(--surface-panel)]/55 px-3 py-2 text-[13px] font-medium shadow-sm dark:bg-[var(--surface-control)]/45"><Sparkles size={14} className="text-[var(--accent-main)]" /><span>Pet Friendly</span></div>
                        </>
                      )}
                    </div>
                  </div>
               </div>

               {/* Columna Derecha: Ficha Tecnica (Sticky) */}
               <div className="w-full md:w-[380px] shrink-0">
                  <div className="bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-strong)]/40 dark:border-[var(--border-soft)] rounded-xl p-8 sticky top-8 shadow-[var(--shadow-warm)]">
                     <h4 className="text-[var(--text-muted)] dark:text-[var(--text-muted)] text-xs font-bold uppercase tracking-[0.2em] mb-6">Ficha Tecnica</h4>

                     <div className="flex flex-col gap-5">
                        <div className="flex justify-between items-center border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-4">
                           <span className="text-[var(--text-muted)] dark:text-[var(--text-muted)] flex items-center gap-3 text-sm"><Building size={16}/> Referencia</span>
                           <span className="text-[var(--text-main)] dark:text-[var(--text-main)] text-sm font-semibold leading-none">#{selectedProperty.id}</span>
                        </div>
                        <div className="border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-4">
                           <span className="text-[var(--text-muted)] dark:text-[var(--text-muted)] flex items-center gap-3 text-sm"><Sparkles size={16}/> Ofertas</span>
                           <div className="mt-3 space-y-2">
                             {getPropertyOffers(selectedProperty).map((offer) => (
                               <div key={offer.id || offer.operation} className="flex items-center justify-between gap-3 rounded-lg bg-[var(--surface-panel-muted)] px-3 py-2 text-sm dark:bg-[var(--surface-control)]/45">
                                 <span className="font-semibold text-[var(--text-main)] dark:text-[var(--text-main)]">{offer.operation}</span>
                                 <span className="shrink-0 font-bold text-[var(--accent-main)]">{formatPropertyPrice(offer.price, offer.currency)}</span>
                               </div>
                             ))}
                           </div>
                        </div>
                        <div className="flex justify-between items-center border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-4">
                           <span className="text-[var(--text-muted)] dark:text-[var(--text-muted)] flex items-center gap-3 text-sm"><Bed size={16}/> Habitaciones</span>
                           <span className="text-[var(--text-main)] dark:text-[var(--text-main)] text-sm font-semibold leading-none">{selectedProperty.rooms}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-4">
                           <span className="text-[var(--text-muted)] dark:text-[var(--text-muted)] flex items-center gap-3 text-sm"><Bath size={16}/> Baños</span>
                           <span className="text-[var(--text-main)] dark:text-[var(--text-main)] text-sm font-semibold leading-none">{selectedProperty.bathrooms}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-4">
                           <span className="text-[var(--text-muted)] dark:text-[var(--text-muted)] flex items-center gap-3 text-sm"><MapPin size={16}/> Zona</span>
                           <span className="text-[var(--text-main)] dark:text-[var(--text-main)] text-sm font-semibold leading-none">{selectedProperty.area}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                           <span className="text-[var(--text-muted)] dark:text-[var(--text-muted)] flex items-center gap-3 text-sm"><Building size={16}/> Tipo</span>
                           <span className="text-[var(--text-main)] dark:text-[var(--text-main)] text-sm font-semibold leading-none">{selectedProperty.type || "Departamento"}</span>
                        </div>
                     </div>

                     {getWhatsappContactUrl(selectedProperty, selectedDisplayOffer || undefined) ? (
                       <a
                         href={getWhatsappContactUrl(selectedProperty, selectedDisplayOffer || undefined)}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="block w-full rounded-lg bg-[var(--accent-main)] py-4 mt-8 text-center text-xs font-bold uppercase tracking-[0.15em] text-[#2F241D] shadow-lg transition-colors hover:bg-[var(--accent-hover)] hover:text-white"
                       >
                         Contactar Agente
                       </a>
                     ) : (
                       <button
                         type="button"
                         disabled
                         className="w-full rounded-lg bg-[var(--surface-control)] py-4 mt-8 text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-muted)] opacity-70"
                       >
                         Contacto no disponible
                       </button>
                     )}
                  </div>
               </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}




















