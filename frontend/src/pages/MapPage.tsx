import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Property, PropertyOffer } from "../types";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { CustomSelect } from "../components/CustomSelect";
import { Search, MapPin, Building, Bed, Bath, X, Sparkles, LogOut, Sun, Moon, ChevronLeft, ChevronRight, Images, ExternalLink, ShieldCheck, FilterX, MessageCircle, Share2 } from "lucide-react";
import { GoogleAuthProvider, User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, authPersistenceReady } from "../firebase";
import { API_BASE, AppRole, cacheAuthProfile, clearCachedAuthProfile, fetchAuthProfile, getCachedAuthProfile, getLastCachedAuthProfile } from "../roleAccess";
import { detectSearchIntent, SearchIntent } from "../searchIntent";
import { openContactWhatsapp, recordLeadEvent, shareLeadUrl } from "../leadTracking";
import { resolveNiaUserId } from "../visitorId";
import { PLAZO_OPTIONS } from "../whatsappMessage";
import {
  GuidedOperation,
  GuidedStage,
  buildGuidedSearchQuery,
  formatCompactSearchLabel,
  getGuidedChoiceOptions,
  getGuidedSearchPlaceholder,
  nextGuidedStageFromOperation,
  normalizeGuidedBudget,
  previousGuidedStage,
} from "../guidedSearch";
import {
  MapFocusTarget,
  MapLocationChoice,
  extractRequestedLocation,
  focusFromProperties,
  geocodeRequestedLocation,
  normalizePlainText,
} from "../mapLocation";

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
    area: inm.zona || inm.ciudad,
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

const CATALOG_CACHE_KEY = "nia.catalog.summary.v1";
const CATALOG_SNAPSHOT_URL = "/catalog-snapshot.json";

const readCachedCatalog = (): Property[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CATALOG_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    return items
      .map(mapApiProperty)
      .filter((property) => property.id && Number.isFinite(property.lat) && Number.isFinite(property.lng));
  } catch (error) {
    console.warn("No se pudo leer el cache del catalogo:", error);
    return [];
  }
};

const writeCachedCatalog = (items: unknown[]) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), items }));
  } catch (error) {
    console.warn("No se pudo guardar el cache del catalogo:", error);
  }
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

const FALLBACK_ZONES = ["Equipetrol", "Norte", "Urubo", "Centro"];
const RECENT_ZONES_KEY = "nia.recent.zones.v1";

const readRecentZones = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_ZONES_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map((value) => String(value).trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
};

const rememberRecentZone = (zone: string) => {
  const value = zone.trim();
  if (!value) return;
  const next = [value, ...readRecentZones().filter((item) => normalizePlainText(item) !== normalizePlainText(value))].slice(0, 8);
  try {
    window.localStorage.setItem(RECENT_ZONES_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
};

const getPopularZoneOptions = (properties: Property[]): string[] => {
  const counts = new Map<string, { label: string; count: number }>();
  for (const property of properties) {
    const label = String(property.area || "").trim();
    if (!label) continue;
    const key = normalizePlainText(label);
    if (!key) continue;
    const current = counts.get(key);
    counts.set(key, { label: current?.label || label, count: (current?.count || 0) + 1 });
  }
  const popular = [...counts.values()]
    .sort((left, right) => right.count - left.count)
    .map((item) => item.label);

  const merged: string[] = [];
  const seen = new Set<string>();
  for (const zone of [...readRecentZones(), ...popular, ...FALLBACK_ZONES]) {
    const key = normalizePlainText(zone);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(zone);
    if (merged.length >= 4) break;
  }
  return merged;
};

const normalizeOfferOperation = (operation?: string) => {
  const value = String(operation || "").toLowerCase();
  if (value.includes("alquiler") || value.includes("renta") || value.includes("arrendar")) return "rent";
  if (value.includes("venta") || value.includes("compra") || value.includes("comprar")) return "buy";
  return null;
};

const selectPropertyOffer = (property: Property, intent: SearchIntent): PropertyOffer => {
  const offers = property.offers?.filter((offer) => (offer.status || "Publicado") === "Publicado") ?? [];
  const matchingOffer = intent && intent !== "both"
    ? offers.find((offer) => normalizeOfferOperation(offer.operation) === intent)
    : undefined;
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
  if ((!intent || intent === "both") && hasRentAndSaleOffers(property)) return "Alquiler / Venta";
  return offer.operation;
};

const shouldShowCarouselPrice = (property: Property, intent: SearchIntent) => {
  return (Boolean(intent) && intent !== "both") || getPropertyOffers(property).length === 1;
};

type ContactDraft = {
  propertyRef?: string | null;
  title?: string;
  zona?: string;
  operacion?: string;
  presupuesto?: string;
  extraFilters?: Record<string, unknown>;
};

export default function MapPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [userRole, setUserRole] = useState<AppRole>(() => getLastCachedAuthProfile()?.role || "user");
  const [loginError, setLoginError] = useState("");
  const [properties, setProperties] = useState<Property[]>(readCachedCatalog);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const hasSearchInteractionRef = useRef(false);

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
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (cancelled) return;

      setUser(currentUser);
      if (!currentUser) {
        setUserRole("user");
        setRoleLoading(false);
        setAuthLoading(false);
        return;
      }

      const cachedProfile = getCachedAuthProfile(currentUser.email);
      setUserRole(cachedProfile?.role || "user");
      setRoleLoading(true);
      setAuthLoading(false);

      try {
        const profile = await fetchAuthProfile(currentUser);
        if (cancelled) return;
        cacheAuthProfile(profile);
        setUserRole(profile.role);
      } catch (error) {
        console.error("Error validando rol:", error);
        if (!cachedProfile) setUserRole("user");
      } finally {
        if (!cancelled) setRoleLoading(false);
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    try {
      setLoginError("");
      const provider = new GoogleAuthProvider();
      await authPersistenceReady;
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      setLoginError(error.message || "No se pudo iniciar sesion.");
    }
  };

  const handleLogout = async () => {
    clearCachedAuthProfile(user?.email);
    await signOut(auth);
    setUser(null);
    setUserRole("user");
  };

  const dashboardLink = userRole === "admin" ? "/admin" : userRole === "advisor" ? "/asesor" : null;
  const dashboardLabel = userRole === "admin" ? "Admin" : "Asesor";
  // --- ESTADOS DE FILTRADO ---
  const [geminiQuery, setGeminiQuery] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [aiFilteredIds, setAiFilteredIds] = useState<string[] | null>(null);
  const [aiFilterHistory, setAiFilterHistory] = useState<string[]>([]);
  const [aiClarification, setAiClarification] = useState<string>("");
  const [lastSearchLogId, setLastSearchLogId] = useState<number | null>(null);

  const [activeSearchIntent, setActiveSearchIntent] = useState<SearchIntent>(null);
  const [mapFocus, setMapFocus] = useState<MapFocusTarget | null>(null);
  const [locationChoices, setLocationChoices] = useState<MapLocationChoice[]>([]);
  const [locationQuestion, setLocationQuestion] = useState("");
  const [customLocationText, setCustomLocationText] = useState("");
  const [isCustomLocationOpen, setIsCustomLocationOpen] = useState(false);
  const [guidedStage, setGuidedStage] = useState<GuidedStage>("operation");
  const [guidedOperation, setGuidedOperation] = useState<GuidedOperation>("");
  const [guidedBuyPurpose, setGuidedBuyPurpose] = useState("");
  const [guidedBudget, setGuidedBudget] = useState("");
  const [guidedZone, setGuidedZone] = useState("");
  const [contactDraft, setContactDraft] = useState<ContactDraft | null>(null);
  const [isRecordingLead, setIsRecordingLead] = useState(false);
  const [shareHint, setShareHint] = useState("");

  const isGuidedSearchOpen = guidedStage !== "operation";
  const zoneOptions = getPopularZoneOptions(properties);
  const guidedChoiceOptions = getGuidedChoiceOptions(guidedStage, guidedOperation, zoneOptions);
  const selectedGuidedChoice =
    guidedStage === "operation" ? guidedOperation
      : guidedStage === "buyPurpose" ? guidedBuyPurpose
        : guidedStage === "zone" ? guidedZone
          : guidedStage === "budget" ? guidedBudget
            : "";
  const searchPlaceholder = isAsking ? "NIA analizando..." : getGuidedSearchPlaceholder(guidedStage);
  const hasActiveResults = aiFilteredIds !== null;
  const showGuidedChoices = !hasActiveResults && !aiClarification;
  const compactSearchLabel = formatCompactSearchLabel({
    operation: guidedOperation,
    purpose: guidedBuyPurpose,
    zone: guidedZone,
    budget: guidedBudget,
    history: aiFilterHistory,
  });

  const resetGuidedSearch = () => {
    setGuidedStage("operation");
    setGeminiQuery("");
  };

  const goToGuidedStage = (stage: GuidedStage) => {
    setGeminiQuery("");
    setGuidedStage(stage);
  };

  const onboardingButtonClass = (variant: "mobile" | "desktop", selected: boolean) => {
    if (variant === "mobile") {
      return `rounded-full border border-[var(--accent-main)]/50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] shadow-[var(--shadow-warm)] backdrop-blur transition-colors ${
        selected
          ? "bg-[var(--accent-main)] text-[#2F241D]"
          : "bg-[var(--surface-panel)]/95 text-[var(--accent-main)] hover:bg-[var(--accent-main)] hover:text-[#2F241D]"
      }`;
    }
    return `rounded-full border border-[var(--accent-main)]/50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] shadow-sm backdrop-blur transition-colors ${
      selected
        ? "bg-[var(--accent-main)] text-[#2F241D]"
        : "bg-[var(--surface-panel)]/92 text-[var(--accent-main)] hover:bg-[var(--accent-main)] hover:text-[#2F241D] dark:bg-[rgba(27,20,17,0.88)]"
    }`;
  };


  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (hasSearchInteractionRef.current) return;
        setMapFocus({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          zoom: 12,
          key: Date.now(),
          source: "user",
        });
      },
      () => {
        // Si no hay permiso, el mapa queda en Santa Cruz como fallback inicial.
      },
      { enableHighAccuracy: false, timeout: 4500, maximumAge: 300000 }
    );
  }, []);

  // [OPALO-BRIDGE] Lectura Consolidada con snapshot estatico + refresh en segundo plano.
  useEffect(() => {
    let cancelled = false;
    const hasCatalogAtMount = properties.length > 0;

    const applyCatalog = (items: unknown[], shouldCache = true) => {
      if (!Array.isArray(items)) throw new Error("Catalogo invalido");
      if (shouldCache) writeCachedCatalog(items);
      if (!cancelled) setProperties(items.map(mapApiProperty));
    };

    const loadSnapshotIfNeeded = async () => {
      if (hasCatalogAtMount) return;
      try {
        const snapshotResponse = await fetch(CATALOG_SNAPSHOT_URL, { cache: "force-cache" });
        if (!snapshotResponse.ok) return;
        applyCatalog(await snapshotResponse.json());
      } catch (error) {
        console.warn("No se pudo cargar el snapshot del catalogo:", error);
      }
    };

    const refreshFromBackend = async () => {
      try {
        const resInmuebles = await fetch(`${API_BASE}/inmuebles/resumen`);
        if (!resInmuebles.ok) throw new Error("Fallo en la conexion al motor Python");
        applyCatalog(await resInmuebles.json());
      } catch (error) {
        console.error("Error cargando el catalogo:", error);
      }
    };

    loadSnapshotIfNeeded();
    refreshFromBackend();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLocationChoice = (choice: MapLocationChoice) => {
    hasSearchInteractionRef.current = true;
    setMapFocus({
      longitude: choice.longitude,
      latitude: choice.latitude,
      zoom: choice.zoom ?? 12.2,
      key: Date.now(),
      label: choice.name,
      source: "search",
    });
    setLocationChoices([]);
    setLocationQuestion("");
    setCustomLocationText("");
    setIsCustomLocationOpen(false);
  };

  const handleCustomLocationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = customLocationText.trim();
    if (!value) return;

    try {
      const resolution = await geocodeRequestedLocation(`en ${value}`, [], MAPBOX_TOKEN);
      if (resolution?.choices && resolution.choices.length > 1) {
        setLocationQuestion(`A que ${resolution.requestedLocation || value} te refieres?`);
        setLocationChoices(resolution.choices);
        return;
      }
      if (resolution?.focus) {
        setMapFocus(resolution.focus);
        setLocationChoices([]);
        setLocationQuestion("");
        setCustomLocationText("");
        setIsCustomLocationOpen(false);
      } else {
        setLocationQuestion(`No encontre "${value}". Prueba con ciudad y pais.`);
      }
    } catch (error) {
      console.warn("No se pudo resolver la ubicacion escrita:", error);
      setLocationQuestion(`No pude ubicar "${value}". Prueba con ciudad y pais.`);
    }
  };


  const clearAiFilters = () => {
    setAiFilteredIds(null);
    setAiFilterHistory([]);
    setAiClarification("");
    setLocationChoices([]);
    setLocationQuestion("");
    setCustomLocationText("");
    setIsCustomLocationOpen(false);
    setGeminiQuery("");
    setCurrentIndex(0);
    setLastSearchLogId(null);
    setGuidedStage("operation");
    setGuidedOperation("");
    setGuidedBuyPurpose("");
    setGuidedZone("");
    setGuidedBudget("");
    setActiveSearchIntent(null);
  };

  // [OPALO-BRIDGE] Motor de Filtrado Semantico acumulativo
  const runNiaSearch = async (query: string, options?: { candidateIds?: number[] | null; replaceHistory?: string[] }) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      clearAiFilters();
      return;
    }

    const queryIntent = detectSearchIntent([trimmedQuery]);
    const previousFilteredIds = aiFilteredIds;
    hasSearchInteractionRef.current = true;
    setIsAsking(true);
    setAiClarification("");
    setLocationChoices([]);
    setLocationQuestion("");
    setCustomLocationText("");
    setIsCustomLocationOpen(false);

    const applyMapFocus = async (matchedProperties: Array<{ lat?: number | null; lng?: number | null; area?: string | null }>) => {
      const locationLabel = extractRequestedLocation(trimmedQuery);
      const resultFocus = focusFromProperties(matchedProperties, locationLabel);
      if (resultFocus) {
        setMapFocus(resultFocus);
        return;
      }
      try {
        const resolution = await geocodeRequestedLocation(trimmedQuery, aiFilterHistory, MAPBOX_TOKEN);
        if (!resolution) return;
        if (resolution.choices && resolution.choices.length > 1) {
          setLocationQuestion(`A que ${resolution.requestedLocation || "ubicacion"} te refieres?`);
          setLocationChoices(resolution.choices);
          return;
        }
        if (resolution.focus) setMapFocus(resolution.focus);
      } catch (error) {
        console.warn("No se pudo mover el mapa a la ubicacion solicitada:", error);
      }
    };

    try {
      const candidateIds = options?.candidateIds === undefined
        ? aiFilteredIds?.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
        : options.candidateIds || undefined;
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: trimmedQuery,
          candidate_ids: candidateIds && candidateIds.length > 0 ? candidateIds : undefined,
          user_id: resolveNiaUserId(user?.uid),
        }),
      });

      if (!res.ok) throw new Error("Fallo en la red neuronal");

      const data = await res.json();
      const searchLogId = Number(data.search_log_id);
      if (Number.isFinite(searchLogId) && searchLogId > 0) setLastSearchLogId(searchLogId);

      if (data.needs_clarification) {
        setAiClarification(data.clarification || "Necesito un dato mas para buscar bien.");
        setAiFilterHistory((current) => options?.replaceHistory ?? [...current, trimmedQuery]);
        setGeminiQuery(`${trimmedQuery} `);
        return;
      }

      if (data.ids && Array.isArray(data.ids)) {
        const stringIds = data.ids.map((id: number | string) => id.toString());
        if (stringIds.length === 0 && previousFilteredIds && previousFilteredIds.length > 0) {
          setAiClarification("Ese filtro dejo 0 resultados. Mantengo las opciones anteriores; prueba quitar presupuesto, zona o dormitorio.");
          setGeminiQuery(trimmedQuery);
          return;
        }

        setAiFilteredIds(stringIds);
        setAiFilterHistory((current) => options?.replaceHistory ?? [...current, trimmedQuery]);
        if (queryIntent) setActiveSearchIntent(queryIntent);
        setAiClarification(stringIds.length === 0 ? "No encontre inmuebles con esos filtros. Prueba ampliar zona o presupuesto." : "");
        setGeminiQuery(stringIds.length === 0 ? trimmedQuery : "");
        setCurrentIndex(0);
        const matched = stringIds
          .map((id: string) => properties.find((property) => property.id === id))
          .filter((property): property is Property => Boolean(property));
        await applyMapFocus(matched);
      } else {
        setAiFilteredIds([]);
        setAiFilterHistory((current) => options?.replaceHistory ?? [...current, trimmedQuery]);
        if (queryIntent) setActiveSearchIntent(queryIntent);
        setAiClarification("No encontre inmuebles con esos filtros. Prueba ampliar zona o presupuesto.");
        await applyMapFocus([]);
      }
    } catch (err) {
      console.error("Fallo critico en motor semantico:", err);
      setAiClarification(previousFilteredIds?.length ? "No pude aplicar ese filtro ahora. Mantengo tus resultados anteriores." : "No pude conectar con NIA ahora. Te muestro el catalogo disponible.");
      if (!previousFilteredIds?.length) setAiFilteredIds(null);
    } finally {
      setIsAsking(false);
    }
  };


  const submitGuidedSearch = async (overrides?: { zone?: string; budget?: string; purpose?: string }) => {
    const query = buildGuidedSearchQuery({
      operation: guidedOperation,
      purpose: overrides?.purpose ?? guidedBuyPurpose,
      zone: overrides?.zone ?? guidedZone,
      budget: overrides?.budget ?? guidedBudget,
    });
    goToGuidedStage("operation");
    await runNiaSearch(query);
  };

  const handleOnboardingOperation = (option: Exclude<GuidedOperation, "">) => {
    setGuidedOperation(option);
    setGuidedBuyPurpose("");
    setGuidedZone("");
    setGuidedBudget("");
    goToGuidedStage(nextGuidedStageFromOperation(option));
  };

  const handleBuyPurposeSelect = (purpose: string) => {
    setGuidedBuyPurpose(purpose);
    goToGuidedStage("zone");
  };

  const handleZoneSelect = (zone: string) => {
    const value = zone.trim();
    if (!value) return;
    setGuidedZone(value);
    rememberRecentZone(value);
    goToGuidedStage("budget");
  };

  const handleBudgetSelect = async (budget: string) => {
    const value = normalizeGuidedBudget(guidedOperation, budget);
    if (!value) return;
    setGuidedBudget(value);
    await submitGuidedSearch({ budget: value });
  };

  const handleGuidedChoice = (option: string) => {
    if (guidedStage === "operation") handleOnboardingOperation(option as Exclude<GuidedOperation, "">);
    else if (guidedStage === "buyPurpose") handleBuyPurposeSelect(option);
    else if (guidedStage === "zone") handleZoneSelect(option);
    else if (guidedStage === "budget") void handleBudgetSelect(option);
  };

  const goPrevGuidedStep = () => {
    const previous = previousGuidedStage(guidedStage, guidedOperation);
    if (previous) goToGuidedStage(previous);
  };

  const handleAskGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    const custom = geminiQuery.trim();
    if (guidedStage === "sell") return;
    if (guidedStage === "buyPurpose") {
      if (!custom) return;
      handleBuyPurposeSelect(custom);
      return;
    }
    if (guidedStage === "zone") {
      if (!custom) return;
      handleZoneSelect(custom);
      return;
    }
    if (guidedStage === "budget") {
      if (!custom) return;
      await handleBudgetSelect(custom);
      return;
    }
    await runNiaSearch(geminiQuery);
  };
  // Conserva el orden de ranking que devuelve NIA. filter() sobre el catalogo original
  // ocultaba inmuebles, pero perdia la prioridad de embeddings.
  const filteredProperties = useMemo(() => {
    if (aiFilteredIds === null) return properties;
    const propertyById = new Map(properties.map((property) => [property.id, property]));
    return aiFilteredIds
      .map((id) => propertyById.get(id))
      .filter((property): property is Property => Boolean(property));
  }, [properties, aiFilteredIds]);

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
  const carouselSwipeStartX = useRef<number | null>(null);
  const isCompactCarouselViewport = () => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768 || (window.innerHeight <= 560 && window.innerWidth < 760);
  };

  const [isMobileCarousel, setIsMobileCarousel] = useState(isCompactCarouselViewport);

  useEffect(() => {
    const handleResize = () => setIsMobileCarousel(isCompactCarouselViewport());
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

  useEffect(() => {
    if (aiFilteredIds === null || visibleProperties.length === 0) return;
    const focus = focusFromProperties(visibleProperties);
    if (focus) setMapFocus(focus);
  }, [aiFilteredIds, visibleProperties]);

  const handleCarouselTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    carouselSwipeStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleCarouselTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = carouselSwipeStartX.current;
    carouselSwipeStartX.current = null;
    const endX = event.changedTouches[0]?.clientX;
    if (startX === null || endX === undefined) return;

    const deltaX = endX - startX;
    if (Math.abs(deltaX) < 44) return;

    if (deltaX < 0) {
      setCurrentIndex(prev => Math.min(Math.max(0, filteredProperties.length - carouselStep), prev + carouselStep));
    } else {
      setCurrentIndex(prev => Math.max(0, prev - carouselStep));
    }
  };

  const currentLeadContext = (property?: Property | null): ContactDraft => {
    const offer = property ? selectPropertyOffer(property, searchIntent) : null;
    return {
      propertyRef: property?.id || null,
      title: property?.title,
      zona: guidedZone || property?.area || "",
      operacion: offer?.operation || property?.operation || guidedOperation || "",
      presupuesto: guidedBudget || "",
      extraFilters: {
        purpose: guidedBuyPurpose || undefined,
        history: aiFilterHistory,
      },
    };
  };

  const beginContact = (draft: ContactDraft) => {
    setShareHint("");
    setContactDraft(draft);
  };

  const confirmContact = async (plazo: string) => {
    if (!contactDraft || isRecordingLead) return;
    setIsRecordingLead(true);
    const event = await recordLeadEvent({
      action: "contact_tap",
      propertyRef: contactDraft.propertyRef,
      operacion: contactDraft.operacion,
      zona: contactDraft.zona,
      presupuesto: contactDraft.presupuesto,
      extraFilters: contactDraft.extraFilters,
      plazo,
      firebaseUid: user?.uid,
    });
    setIsRecordingLead(false);
    if (event) {
      openContactWhatsapp(event, contactDraft);
    }
    setContactDraft(null);
  };

  const handleShare = async (property?: Property | null) => {
    const draft = currentLeadContext(property);
    const event = await recordLeadEvent({
      action: "share",
      propertyRef: draft.propertyRef,
      operacion: draft.operacion,
      zona: draft.zona,
      presupuesto: draft.presupuesto,
      extraFilters: draft.extraFilters,
      firebaseUid: user?.uid,
    });
    if (!event) return;
    const result = await shareLeadUrl(draft.title || "NIA", event.url);
    if (result === "copied") setShareHint("Enlace copiado");
    else if (result === "shared") setShareHint("");
  };

  const renderCompactFilter = (variant: "mobile" | "desktop") => {
    if (!hasActiveResults && !aiClarification) return null;
    return (
      <div className={`flex items-center justify-center ${variant === "desktop" ? "mt-2" : ""}`}>
        <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--accent-main)]/40 bg-[var(--surface-panel)]/95 py-1 pl-3 pr-1 shadow-[var(--shadow-warm)] backdrop-blur dark:bg-[rgba(27,20,17,0.92)]">
          <span className="min-w-0 max-w-[11.5rem] truncate text-[10px] font-black uppercase tracking-[0.12em] text-[var(--text-main)] md:max-w-[18rem]">
            {aiClarification || compactSearchLabel}
          </span>
          {!aiClarification && (
            <span className="shrink-0 rounded-full bg-[var(--accent-main)]/20 px-2 py-0.5 text-[10px] font-black tabular-nums text-[var(--accent-main)]">
              {filteredProperties.length}
            </span>
          )}
          <button
            type="button"
            onClick={() => beginContact(currentLeadContext(null))}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--accent-main)] transition-colors hover:bg-[var(--accent-main)]/15"
            title="Contactar"
            aria-label="Contactar"
          >
            <MessageCircle size={14} />
          </button>
          <button
            type="button"
            onClick={clearAiFilters}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
            title="Limpiar filtros"
            aria-label="Limpiar filtros"
          >
            <FilterX size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    // CONTENEDOR MAESTRO: 100% Pantalla
    <div className="nia-map-shell relative h-screen w-full overflow-hidden bg-[var(--surface-page)] dark:bg-[var(--surface-panel)] font-sans">

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
            properties={properties}
            isDarkMode={isDarkMode}
            onSelectProperty={selectProperty}
            focusLocation={mapFocus}
            highlightedIds={visibleProperties.map((property) => property.id)}
            matchedIds={aiFilteredIds}
            selectedId={selectedProperty?.id ?? null}
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
      <div className="nia-mobile-hud absolute left-4 right-4 top-5 z-40 flex items-center gap-2 md:hidden">
        <button
          onClick={() => applyTheme(!isDarkMode)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-main)]/50 bg-[var(--color-chocolate)] text-[var(--color-ivory)] shadow-lg transition-colors hover:bg-[var(--accent-hover)]"
          aria-label="Cambiar tema"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <form
          onSubmit={handleAskGemini}
          className="nia-mobile-search-form min-w-0 flex-1 rounded-full border border-[var(--border-soft)] bg-[rgba(255,253,246,0.9)] p-1 shadow-[var(--shadow-warm)] backdrop-blur-xl dark:bg-[rgba(16,12,10,0.62)]"
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
              placeholder={searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent px-1 text-[13px] text-[var(--text-main)] outline-none placeholder-[var(--text-muted)] disabled:opacity-50"
            />

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
      <div className="nia-mobile-guide-toggle absolute left-4 right-4 top-[4.75rem] z-30 flex flex-col items-center gap-2 md:hidden">
        {hasActiveResults || aiClarification ? (
          renderCompactFilter("mobile")
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {guidedStage !== "operation" && (
                <button
                  type="button"
                  onClick={goPrevGuidedStep}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--accent-main)]/50 bg-[var(--surface-panel)]/95 text-[var(--accent-main)] shadow-[var(--shadow-warm)] backdrop-blur transition-colors hover:bg-[var(--accent-main)] hover:text-[#2F241D]"
                  aria-label="Anterior"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              {guidedStage !== "sell" && guidedChoiceOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleGuidedChoice(option)}
                  className={onboardingButtonClass("mobile", selectedGuidedChoice === option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {guidedStage === "sell" && (
              <div className="w-full rounded-2xl border border-[var(--accent-main)]/45 bg-[var(--surface-panel)]/95 px-4 py-3 text-center shadow-[var(--shadow-warm)] backdrop-blur dark:bg-[rgba(27,20,17,0.94)]">
                <p className="mb-3 text-sm font-semibold text-[var(--text-main)]">Si quieres vender tu inmueble, escribenos por WhatsApp y te ayudamos.</p>
                <button
                  type="button"
                  onClick={() => beginContact({ operacion: "Vender", extraFilters: { source: "sell" } })}
                  className={`${onboardingButtonClass("mobile", true)} inline-flex items-center gap-2`}
                >
                  <MessageCircle size={14} /> Contactar
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {locationQuestion && !isGuidedSearchOpen && (
        <div className="nia-mobile-location-question absolute left-4 right-4 top-[7.25rem] z-30 rounded-2xl border-2 border-[var(--accent-main)] bg-[var(--surface-panel)]/96 p-3 text-left shadow-[var(--shadow-warm)] backdrop-blur-xl md:hidden dark:bg-[rgba(27,20,17,0.94)]">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent-main)]">
            <Sparkles size={14} />
            <span>Pregunta de NIA</span>
            <button type="button" onClick={() => setLocationQuestion("")} className="ml-auto text-[var(--text-muted)] hover:text-red-500" aria-label="Cerrar pregunta">
              <X size={15} />
            </button>
          </div>
          <p className="mb-3 text-sm font-semibold normal-case tracking-normal text-[var(--text-main)]">{locationQuestion}</p>
          <div className="flex flex-wrap gap-2">
            {locationChoices.map((choice) => (
              <button key={`mobile-location-${choice.id}`} type="button" onClick={() => handleLocationChoice(choice)} className="rounded-full border border-[var(--accent-main)]/50 bg-[var(--accent-main)]/10 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.1em] text-[var(--accent-main)] transition-colors hover:bg-[var(--accent-main)] hover:text-[#2F241D]">
                {choice.name}
              </button>
            ))}
            <button type="button" onClick={() => setIsCustomLocationOpen((open) => !open)} className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-panel)] px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.1em] text-[var(--text-main)] transition-colors hover:border-[var(--accent-main)]">
              Otro
            </button>
          </div>
          {isCustomLocationOpen && (
            <form onSubmit={handleCustomLocationSubmit} className="mt-3 flex gap-2">
              <input value={customLocationText} onChange={(event) => setCustomLocationText(event.target.value)} placeholder="Ej. Santa Cruz de la Sierra, Bolivia" className="min-w-0 flex-1 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent-main)]" />
              <button type="submit" className="rounded-xl bg-[var(--accent-main)] px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.1em] text-[#2F241D] hover:bg-[var(--accent-hover)] hover:text-white">
                Usar
              </button>
            </form>
          )}
        </div>
      )}
      {/* CAPA 1: HUD SUPERIOR (Pildora de Busqueda IA - Version Conserjeria) */}
      <div className="nia-desktop-hud absolute top-6 left-1/2 z-10 hidden w-[60%] max-w-2xl -translate-x-1/2 md:block">
        <>
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
              placeholder={searchPlaceholder}
              className="w-full min-w-0 bg-transparent border-none outline-none px-1.5 sm:px-2 text-[var(--text-main)] dark:text-[var(--text-main)] placeholder-[var(--text-muted)] dark:placeholder-stone-300 font-sans text-[13px] sm:text-sm tracking-wide disabled:opacity-50"
            />

            {guidedStage !== "operation" && (
              <button type="button" onClick={resetGuidedSearch} className="p-2 text-stone-500 hover:text-red-400 transition-colors" title="Cerrar guia">
                <X size={16} />
              </button>
            )}

            <button
              type="submit"
              disabled={isAsking || guidedStage === "sell"}
              className="bg-[var(--accent-main)] text-[#2F241D] px-5 sm:px-6 py-2.5 rounded-full hover:bg-[var(--accent-hover)] hover:text-white transition-all duration-300 font-bold shadow-md flex items-center gap-1.5 disabled:opacity-70 text-[11px] uppercase tracking-[0.1em]"
            >
              <Search size={14} className="md:hidden" />
              <span className="hidden md:inline">Buscar</span>
            </button>
          </form>
          {showGuidedChoices ? (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {guidedStage !== "operation" && (
              <button
                type="button"
                onClick={goPrevGuidedStep}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--accent-main)]/50 bg-[var(--surface-panel)]/92 text-[var(--accent-main)] shadow-sm backdrop-blur transition-colors hover:bg-[var(--accent-main)] hover:text-[#2F241D] dark:bg-[rgba(27,20,17,0.88)]"
                aria-label="Anterior"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            {guidedStage === "sell" ? (
              <div className="flex max-w-xl flex-col items-center gap-2 rounded-2xl border border-[var(--accent-main)]/45 bg-[var(--surface-panel)]/92 px-4 py-3 text-center shadow-sm backdrop-blur dark:bg-[rgba(27,20,17,0.88)]">
                <p className="text-sm font-semibold text-[var(--text-main)]">Si quieres vender tu inmueble, escribenos por WhatsApp y te ayudamos.</p>
                <button
                  type="button"
                  onClick={() => beginContact({ operacion: "Vender", extraFilters: { source: "sell" } })}
                  className={`${onboardingButtonClass("desktop", true)} inline-flex items-center gap-2`}
                >
                  <MessageCircle size={14} /> Contactar
                </button>
              </div>
            ) : (
              guidedChoiceOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleGuidedChoice(option)}
                  className={onboardingButtonClass("desktop", selectedGuidedChoice === option)}
                >
                  {option}
                </button>
              ))
            )}
          </div>
          ) : (
            renderCompactFilter("desktop")
          )}
        </>
        {locationQuestion && !isGuidedSearchOpen && (
          <div className="mt-3 rounded-xl border-2 border-[var(--accent-main)] bg-[var(--surface-panel)]/95 p-3 text-left shadow-[0_18px_42px_rgba(58,33,25,0.18)] backdrop-blur-xl dark:bg-[rgba(27,20,17,0.94)]">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent-main)]">
              <Sparkles size={14} />
              <span>Pregunta de NIA</span>
            </div>
            <p className="mb-3 text-sm font-semibold normal-case tracking-normal text-[var(--text-main)]">{locationQuestion}</p>
            <div className="flex flex-wrap items-center gap-2">
              {locationChoices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handleLocationChoice(choice)}
                  className="rounded-full border border-[var(--accent-main)]/50 bg-[var(--accent-main)]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent-main)] transition-colors hover:bg-[var(--accent-main)] hover:text-[#2F241D]"
                >
                  {choice.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustomLocationOpen((open) => !open)}
                className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-panel)] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-main)] transition-colors hover:border-[var(--accent-main)]"
              >
                Otro
              </button>
            </div>
            {isCustomLocationOpen && (
              <form onSubmit={handleCustomLocationSubmit} className="mt-3 flex gap-2">
                <input
                  value={customLocationText}
                  onChange={(event) => setCustomLocationText(event.target.value)}
                  placeholder="Ej. Santa Cruz de la Sierra, Bolivia"
                  className="min-w-0 flex-1 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent-main)]"
                />
                <button type="submit" className="rounded-lg bg-[var(--accent-main)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#2F241D] hover:bg-[var(--accent-hover)] hover:text-white">
                  Usar
                </button>
              </form>
            )}
          </div>
        )}

      </div>

      <div className="nia-landscape-use-portrait absolute left-1/2 z-30 -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--accent-main)]/45 bg-[var(--surface-panel)]/95 px-4 py-2 text-center text-[11px] font-black uppercase tracking-[0.12em] text-[var(--accent-main)] shadow-[var(--shadow-warm)] backdrop-blur dark:bg-[rgba(27,20,17,0.92)]">
        Gira el celular a vertical para ver los inmuebles
      </div>
      {/* CAPA 2: VISOR EDITORIAL PANORAMICO (Formato Ejecutivo) */}
<div className="nia-property-carousel absolute left-0 right-0 z-20 flex h-[230px] w-full items-center justify-center px-4 md:bottom-8 md:left-1/2 md:right-auto md:h-[240px] md:w-[98%] md:max-w-[1040px] md:-translate-x-1/2 md:justify-between md:gap-4 md:px-0">

  <button
    onClick={() => setCurrentIndex(prev => Math.max(0, prev - carouselStep))}
    disabled={currentIndex === 0}
    className="nia-carousel-arrow nia-carousel-arrow-left absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-[var(--accent-main)]/85 p-3 text-[#2F241D] shadow-xl transition-all hover:bg-[var(--accent-hover)] hover:text-white disabled:opacity-30 dark:bg-[rgba(27,20,17,0.94)] dark:text-[var(--text-main)] md:static md:translate-y-0 md:shrink-0"
  >
    <ChevronLeft size={28} />
  </button>

  {/* Contenedor central expandido */}
  <div
    className="nia-carousel-track flex h-full w-full items-center justify-center overflow-hidden px-12 md:flex-1 md:gap-7 md:px-0"
    onTouchStart={handleCarouselTouchStart}
    onTouchEnd={handleCarouselTouchEnd}
  >
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={`carousel-${currentIndex}-${filteredProperties.length}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="flex h-full w-full items-center justify-center gap-4 md:gap-7"
      >
      {visibleProperties.map((p, index) => {
        const coverUrl = p.images[0];
        const isCollection = isCloudinaryCollectionUrl(coverUrl);
        const displayOffer = selectPropertyOffer(p, searchIntent);
        const showCarouselPrice = shouldShowCarouselPrice(p, searchIntent);
        const globalResultRank = currentIndex + index;
        const isRankedSearchResult = aiFilteredIds !== null && !aiClarification;
        const isBestSearchMatch = isRankedSearchResult && globalResultRank === 0;

        return (
        <div
          key={p.id}
          onClick={() => selectProperty(p)}
          // Tarjetas compactas para que el borde respire completo
          className={`nia-property-card group relative flex h-[210px] w-full max-w-[400px] shrink-0 cursor-pointer flex-row overflow-hidden rounded-xl border bg-[var(--surface-panel)] ring-[var(--accent-main)] transition-all duration-300 hover:-translate-y-0.5 hover:ring-2 dark:bg-[var(--surface-panel)] md:w-[430px] md:max-w-none ${isBestSearchMatch ? "border-[var(--accent-main)] shadow-[0_22px_55px_rgba(199,145,88,0.38)] ring-2 ring-[var(--accent-main)]/70" : isRankedSearchResult ? "border-[var(--accent-main)]/70 shadow-[var(--shadow-warm)] ring-1 ring-[var(--accent-main)]/30" : "border-[var(--border-strong)]/50 shadow-[var(--shadow-warm)] dark:border-[var(--border-soft)]"}`}
        >
        {isRankedSearchResult && (
          <span className={`absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-black shadow-md ${isBestSearchMatch ? "border-[var(--accent-main)] bg-[var(--accent-main)] text-[#2F241D]" : "border-[var(--accent-main)]/50 bg-[var(--surface-panel)]/95 text-[var(--accent-main)]"}`} title={isBestSearchMatch ? "Mejor opcion" : `Opcion ${globalResultRank + 1}`}>
            {globalResultRank + 1}
          </span>
        )}
        {/* PANEL IZQUIERDO: Imagen (50% del ancho) */}
        <div className="nia-property-card-media relative h-full w-[48%] shrink-0 overflow-hidden md:w-[50%]">
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
        <div className="nia-property-card-body relative flex h-full min-w-0 flex-1 flex-col justify-center bg-[var(--surface-panel)] p-4 text-[var(--text-main)] dark:bg-[var(--surface-panel)] dark:text-[var(--text-main)] md:w-[50%] md:flex-none md:p-5">

          <span className="text-[10px] text-[var(--accent-main)] font-bold tracking-[0.18em] uppercase mb-2">Ref. #{p.id}</span>
          <h3 className="nia-property-card-title mb-2 line-clamp-2 text-[13px] font-bold leading-snug tracking-wide md:text-sm">
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

          <div className="nia-property-card-meta mt-auto grid grid-cols-2 gap-x-2 gap-y-2 border-t border-[var(--border-soft)] pt-3 text-[9px] font-medium uppercase tracking-wider text-[var(--text-muted)] dark:border-[var(--border-soft)] dark:text-[var(--text-muted)] md:gap-x-4 md:text-[10px]">
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
        </div>
      )})}
      </motion.div>
    </AnimatePresence>
  </div>

  <button
    onClick={() => setCurrentIndex(prev => Math.min(Math.max(0, filteredProperties.length - carouselStep), prev + carouselStep))}
    disabled={currentIndex + carouselStep >= filteredProperties.length}
    className="nia-carousel-arrow nia-carousel-arrow-right absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-[var(--accent-main)]/85 p-3 text-[#2F241D] shadow-xl transition-all hover:bg-[var(--accent-hover)] hover:text-white disabled:opacity-30 dark:bg-[rgba(27,20,17,0.94)] dark:text-[var(--text-main)] md:static md:translate-y-0 md:shrink-0"
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

                     <div className="mt-8 flex flex-col gap-3">
                       <button
                         type="button"
                         onClick={() => beginContact(currentLeadContext(selectedProperty))}
                         className="block w-full rounded-lg bg-[var(--accent-main)] py-4 text-center text-xs font-bold uppercase tracking-[0.15em] text-[#2F241D] shadow-lg transition-colors hover:bg-[var(--accent-hover)] hover:text-white"
                       >
                         Contactar
                       </button>
                       <button
                         type="button"
                         onClick={() => void handleShare(selectedProperty)}
                         className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--accent-main)]/50 bg-[var(--surface-panel)] py-3 text-xs font-bold uppercase tracking-[0.15em] text-[var(--accent-main)] transition-colors hover:bg-[var(--accent-main)]/10"
                       >
                         <Share2 size={14} /> Compartir
                       </button>
                       {shareHint ? <p className="text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">{shareHint}</p> : null}
                     </div>
                  </div>
               </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {contactDraft && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/40 p-4 md:items-center">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-[var(--shadow-warm)]">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--accent-main)]">Antes de WhatsApp</p>
            <h3 className="mb-4 text-lg font-semibold text-[var(--text-main)]">¿Para cuándo lo necesitas?</h3>
            <div className="grid grid-cols-2 gap-2">
              {PLAZO_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={isRecordingLead}
                  onClick={() => void confirmContact(option)}
                  className="rounded-full border border-[var(--accent-main)]/50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[var(--accent-main)] transition-colors hover:bg-[var(--accent-main)] hover:text-[#2F241D] disabled:opacity-60"
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={isRecordingLead}
              onClick={() => void confirmContact("")}
              className="mt-4 w-full text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              Saltar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
