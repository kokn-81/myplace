import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Property, PropertyOffer, formatPropertyTypeLabel, isProjectType } from "../types";
import { calculateDeliveryCountdown } from "../projectCountdown";
import { parseProjectUnitsJson, parseProjectDetailsJson, getProjectUnitsSummary } from "../projectUnits";
import {
  parseDepartamentoDetails,
  parseCasaDetails,
  parseTerrenoDetails,
  parseComercialDetails,
} from "../propertyArchetypes";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { CustomSelect } from "../components/CustomSelect";
import { Search, MapPin, Building, Bed, Bath, X, Sparkles, LogOut, Sun, Moon, ChevronLeft, ChevronRight, Images, ExternalLink, ShieldCheck, FilterX, MessageCircle, Share2, UserCircle, Layers, Flame, FileText, CheckCircle2, TrendingUp, Calendar, Building2, Download } from "lucide-react";
import { GoogleAuthProvider, User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, authPersistenceReady } from "../firebase";
import { API_BASE, AppRole, cacheAuthProfile, clearCachedAuthProfile, fetchAuthProfile, getCachedAuthProfile, getLastCachedAuthProfile } from "../roleAccess";
import { detectSearchIntent, SearchIntent } from "../searchIntent";
import { openContactWhatsapp, recordLeadEvent, shareLeadUrl } from "../leadTracking";
import { resolveNiaUserId } from "../visitorId";
import { CONTACT_WHATSAPP_NUMBER, PLAZO_OPTIONS } from "../whatsappMessage";
import {
  GuidedOperation,
  GuidedStage,
  buildGuidedSearchQuery,
  filterGuidedChoiceOptions,
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
import {
  getCities,
  getCity,
  getZonesForCity,
  getZoneNamesForCity,
  resolveLocationCenter,
  normalizeGeoText,
} from "../geographicLocations";

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
        agentId: offer.agente_id?.toString() || "5",
        agentName: offer.agente?.name || offer.colocador?.name || "Alejandro Coca",
        agentWhatsapp: offer.agente?.whatsapp || offer.colocador?.whatsapp || CONTACT_WHATSAPP_NUMBER,
        captador: offer.captador || null,
        colocador: offer.colocador || null,
        incluyeExpensas: Boolean(offer.incluye_expensas),
        montoExpensas: offer.monto_expensas ?? null,
      }))
    : [];
  const primaryOffer = offers[0];

  return {
    id: inm.id.toString(),
    title: inm.titulo,
    price: Number(primaryOffer?.price ?? inm.precio_usd ?? 0),
    rooms: inm.habitaciones,
    bathrooms: Number(inm.banos ?? inm.bathrooms ?? 1) || 1,
    area: inm.zona || inm.complejo_nombre || inm.ciudad,
    city: inm.ciudad || "",
    zone: inm.zona || "",
    lat: inm.lat,
    lng: inm.lng,
    operation: primaryOffer?.operation ?? inm.operacion,
    type: inm.tipo_inmueble,
    description: inm.descripcion || "",
    amenities: Array.isArray(inm.amenidades) ? inm.amenidades : [],
    images: normalizeMediaLinks(inm),
    currency: primaryOffer?.currency ?? inm.moneda,
    exchangeRate: "Oficial",
    agentId: primaryOffer?.agentId ?? (inm.agente_id ? String(inm.agente_id) : "5"),
    agentName: primaryOffer?.agentName || inm.agente?.name || inm.agente_nombre || "Alejandro Coca",
    agentWhatsapp: primaryOffer?.agentWhatsapp || inm.agente?.whatsapp || inm.agente_whatsapp || CONTACT_WHATSAPP_NUMBER,
    offers,
    detailsLoaded: Boolean(inm.detalle_completo),
    complejoId: inm.complejo_id ? String(inm.complejo_id) : null,
    complejoNombre: inm.complejo_nombre || null,
    ocupacion: inm.ocupacion || "Disponible",
    superficieM2: inm.superficie_m2 ?? null,
    amoblado: Boolean(inm.amoblado),
    fechaEntrega: inm.fecha_entrega ?? null,
    avanceObra: inm.avance_obra !== undefined && inm.avance_obra !== null ? Number(inm.avance_obra) : null,
    faseObra: inm.fase_obra ?? null,
    subtipoComercial: inm.subtipo_comercial ?? null,
    dimensiones: inm.dimensiones ?? null,
    serviciosBasicos: inm.servicios_basicos ?? null,
    piso: inm.piso || null,
    captador: primaryOffer?.captador || inm.captador || null,
    captadorId: primaryOffer?.captador?.id || (inm.captador_id ? String(inm.captador_id) : null),
    captadorNombre: primaryOffer?.captador?.name || inm.captador_nombre || null,
    captadorWhatsapp: primaryOffer?.captador?.whatsapp || inm.captador_whatsapp || null,
    captadorOficina: primaryOffer?.captador?.oficina || inm.captador_oficina || null,
    ...(() => {
      const proj = parseProjectDetailsJson(inm.datos_especificos_json || inm);
      return {
        unidadesProyecto: Array.isArray(inm.unidades_proyecto) && inm.unidades_proyecto.length > 0
          ? parseProjectUnitsJson(inm.unidades_proyecto)
          : proj.unidades,
        datosEspecificosJson: inm.datos_especificos_json || null,
        mensajeUrgencia: inm.mensaje_urgencia || proj.mensajeUrgencia || null,
        totalUnidades: inm.total_unidades ?? proj.totalUnidades ?? null,
        unidadesDisponibles: inm.unidades_disponibles ?? proj.unidadesDisponibles ?? null,
        pisos: inm.pisos ?? proj.pisos ?? null,
        reservaUsd: inm.reserva_usd ?? proj.reservaUsd ?? null,
        precioM2Desde: inm.precio_m2_desde ?? proj.precioM2Desde ?? null,
        brochureUrl: inm.brochure_url || proj.brochureUrl || null,
        planesPago: inm.planes_pago || proj.planesPago || null,
      };
    })(),
  };
};

const CATALOG_CACHE_KEY = "nia.catalog.summary.v2";
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

  setTimeout(() => {
    try {
      window.localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), items }));
    } catch (error) {
      console.warn("No se pudo guardar el cache del catalogo:", error);
    }
  }, 100);
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  const src = target.src;
  if (!target.dataset.fallbackTried) {
    target.dataset.fallbackTried = "true";
    if (src.includes("lh3.googleusercontent.com/d/")) {
      const id = src.split("/d/")[1]?.split(/[?=/]/)[0];
      if (id) {
        target.src = `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
        return;
      }
    } else if (src.includes("drive.google.com/thumbnail")) {
      const match = src.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        target.src = `https://lh3.googleusercontent.com/d/${match[1]}`;
        return;
      }
    }
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
      referrerPolicy="no-referrer"
      onError={handleImageError}
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

  const canOpenAdmin = userRole === "admin";
  const canOpenAdvisor = userRole === "admin" || userRole === "advisor";
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
  const [guidedPropertyType, setGuidedPropertyType] = useState("");
  const [guidedBudget, setGuidedBudget] = useState("");
  const [guidedZones, setGuidedZones] = useState<string[]>([]);
  const guidedZone = guidedZones.join(", ");
  const [guidedCity, setGuidedCity] = useState("");
  const [showSuggested, setShowSuggested] = useState(false);
  const [contactDraft, setContactDraft] = useState<ContactDraft | null>(null);
  const [isRecordingLead, setIsRecordingLead] = useState(false);
  const [shareHint, setShareHint] = useState("");

  const cityOptions = useMemo(() => {
    return getCities("BO").map((c) => c.name);
  }, []);

  const zoneOptions = useMemo(() => {
    if (!guidedCity) return [];
    const fromGeo = getZoneNamesForCity(guidedCity);
    const normCity = normalizeGeoText(guidedCity);
    const fromCatalog = properties
      .filter((p) => normalizeGeoText(p.city || "") === normCity || normalizeGeoText(p.area || "").includes(normCity))
      .map((p) => p.zone?.trim())
      .filter((z): z is string => Boolean(z) && normalizeGeoText(z) !== normCity && !normalizeGeoText(z).includes("santa cruz de la sierra"));
    return [...new Set(["Todas", ...fromGeo, ...fromCatalog])].slice(0, 7);
  }, [guidedCity, properties]);

  const guidedChoiceOptions = getGuidedChoiceOptions(
    guidedStage,
    guidedOperation,
    cityOptions,
    zoneOptions,
  );

  const visibleGuidedChoiceOptions = useMemo(() => {
    return filterGuidedChoiceOptions({
      options: guidedChoiceOptions,
      query: geminiQuery,
      stage: guidedStage,
      aliasResolver: (option) => {
        if (guidedStage === "propertyType") {
          if (option === "Preventa") return ["preventa", "proyecto", "en construccion", "edificio"];
          if (option === "Casa") return ["casa", "chalet", "vivienda"];
          if (option === "Departamento") return ["departamento", "depa", "monoambiente", "suite"];
          if (option === "Comercial") return ["comercial", "oficina", "local", "galpon"];
          if (option === "Terreno") return ["terreno", "lote"];
          return [];
        }
        if (guidedStage === "city") {
          return getCity(option)?.aliases || [];
        }
        if (guidedStage === "zone" && guidedCity) {
          const zones = getZonesForCity(guidedCity);
          const match = zones.find((z) => z.name === option);
          return match?.aliases || [];
        }
        return [];
      },
    });
  }, [guidedChoiceOptions, geminiQuery, guidedStage, guidedCity]);

  const selectedGuidedChoice =
    guidedStage === "operation" ? guidedOperation
      : guidedStage === "propertyType" ? guidedPropertyType
        : guidedStage === "city" ? guidedCity
          : guidedStage === "zone" ? guidedZone
            : guidedStage === "budget" ? guidedBudget
              : "";

  const isChoiceSelected = (option: string) => {
    if (guidedStage === "zone") {
      if (option === "Todas") {
        return guidedZones.length === 0 || guidedZones.includes("Todas");
      }
      return guidedZones.some((z) => normalizeGeoText(z) === normalizeGeoText(option));
    }
    return selectedGuidedChoice === option;
  };

  const searchPlaceholder = isAsking ? "NIA analizando..." : getGuidedSearchPlaceholder(guidedStage, guidedCity, guidedOperation);
  const isGuidedActive = guidedStage !== "operation";
  const isGuidedSearchOpen = isGuidedActive;
  const hasFinishedAiSearch = aiFilteredIds !== null && !isGuidedActive;
  const hasActiveResults = hasFinishedAiSearch;
  const showGuidedChoices = isGuidedActive || (!hasFinishedAiSearch && !aiClarification);
  const compactSearchLabel = formatCompactSearchLabel({
    operation: guidedOperation,
    propertyType: guidedPropertyType,
    city: guidedCity,
    zone: guidedZone,
    budget: guidedBudget,
    history: aiFilterHistory,
  });

  const resetGuidedSearch = () => {
    setGuidedStage("operation");
    setGuidedOperation("");
    setGuidedPropertyType("");
    setGuidedCity("");
    setGuidedZones([]);
    setGuidedBudget("");
    setShowSuggested(false);
    setGeminiQuery("");
    setAiFilteredIds(null);
    setActiveSearchIntent(null);
    setCurrentIndex(0);
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
    setGuidedPropertyType("");
    setGuidedZones([]);
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
        setAiFilteredIds(stringIds);
        setShowSuggested(false);
        setAiFilterHistory((current) => options?.replaceHistory ?? [...current, trimmedQuery]);
        if (queryIntent) setActiveSearchIntent(queryIntent);
        setAiClarification("");
        setGeminiQuery("");
        setCurrentIndex(0);
        const matched = stringIds
          .map((id: string) => properties.find((property) => property.id === id))
          .filter((property): property is Property => Boolean(property));
        await applyMapFocus(matched);
      } else {
        setAiFilteredIds([]);
        setShowSuggested(false);
        setAiFilterHistory((current) => options?.replaceHistory ?? [...current, trimmedQuery]);
        if (queryIntent) setActiveSearchIntent(queryIntent);
        setAiClarification("");
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


  const submitGuidedSearch = async (overrides?: { zone?: string; city?: string; budget?: string; propertyType?: string }) => {
    const query = buildGuidedSearchQuery({
      operation: guidedOperation,
      propertyType: overrides?.propertyType ?? guidedPropertyType,
      city: overrides?.city ?? guidedCity,
      zone: overrides?.zone ?? guidedZone,
      budget: overrides?.budget ?? guidedBudget,
    });
    goToGuidedStage("operation");
    await runNiaSearch(query);
  };

  const handleOnboardingOperation = (option: Exclude<GuidedOperation, "">) => {
    setGuidedOperation(option);
    setGuidedPropertyType("");
    setGuidedCity("");
    setGuidedZones([]);
    setGuidedBudget("");
    setShowSuggested(false);
    setCurrentIndex(0);

    if (option === "Alquilar") {
      setActiveSearchIntent("rent");
      const rentalIds = properties
        .filter((p) => {
          const op = normalizeOfferOperation(p.operation);
          const hasRent = p.offers?.some(
            (o) => normalizeOfferOperation(o.operation) === "rent" && (o.status || "Publicado") === "Publicado"
          );
          return op === "rent" || hasRent;
        })
        .map((p) => p.id);
      setAiFilteredIds(rentalIds.length > 0 ? rentalIds : []);
    } else if (option === "Comprar") {
      setActiveSearchIntent("buy");
      const saleIds = properties
        .filter((p) => {
          const op = normalizeOfferOperation(p.operation);
          const hasBuy = p.offers?.some(
            (o) => normalizeOfferOperation(o.operation) === "buy" && (o.status || "Publicado") === "Publicado"
          );
          return op === "buy" || hasBuy || isProjectType(p.type);
        })
        .map((p) => p.id);
      setAiFilteredIds(saleIds.length > 0 ? saleIds : []);
    }

    goToGuidedStage(nextGuidedStageFromOperation(option));
  };

  const matchesPropertyType = (pType?: string | null, requestedType = "") => {
    if (!requestedType) return true;
    const norm = normalizeGeoText(requestedType);
    const pNorm = normalizeGeoText(pType || "");
    if (norm.includes("preventa") || norm.includes("proyecto")) return isProjectType(pType);
    if (norm.includes("casa")) return pNorm.includes("casa");
    if (norm.includes("departamento") || norm.includes("depa")) return pNorm.includes("departamento");
    if (norm.includes("comercial")) return pNorm.includes("comercial");
    if (norm.includes("terreno") || norm.includes("lote")) return pNorm.includes("terreno");
    return true;
  };

  const handlePropertyTypeSelect = (type: string) => {
    const value = type.trim();
    if (!value) return;
    setGuidedPropertyType(value);
    setCurrentIndex(0);

    const matches = properties
      .filter((p) => {
        if (guidedOperation === "Alquilar") {
          const hasRent = normalizeOfferOperation(p.operation) === "rent" || p.offers?.some((o) => normalizeOfferOperation(o.operation) === "rent");
          if (!hasRent) return false;
        } else if (guidedOperation === "Comprar") {
          const hasBuy = normalizeOfferOperation(p.operation) === "buy" || p.offers?.some((o) => normalizeOfferOperation(o.operation) === "buy") || isProjectType(p.type);
          if (!hasBuy) return false;
        }
        return matchesPropertyType(p.type, value);
      })
      .map((p) => p.id);

    if (matches.length > 0) {
      setAiFilteredIds(matches);
    }

    goToGuidedStage("city");
  };

  const handleCitySelect = (city: string) => {
    const raw = city.trim();
    if (!raw) return;
    const resolvedCity = getCity(raw);
    const value = resolvedCity ? resolvedCity.name : raw;
    setGuidedCity(value);
    setGuidedZones([]);
    setCurrentIndex(0);

    const center = resolveLocationCenter(value);
    if (center) {
      setMapFocus({
        longitude: center.lng,
        latitude: center.lat,
        zoom: center.zoom,
        key: Date.now(),
        label: value,
        source: "search",
      });
    }

    const normCity = normalizeGeoText(value);
    const matches = properties
      .filter((p) => {
        const text = normalizeGeoText(`${p.city || ""} ${p.area || ""} ${p.title || ""}`);
        const inCity =
          text.includes(normCity) ||
          (normCity === "santa cruz" && (text.includes("ichilo") || text.includes("san carlos")));
        if (!inCity) return false;
        if (guidedOperation === "Alquilar") {
          const hasRent = normalizeOfferOperation(p.operation) === "rent" || p.offers?.some((o) => normalizeOfferOperation(o.operation) === "rent");
          if (!hasRent) return false;
        }
        if (guidedOperation === "Comprar") {
          const hasBuy = normalizeOfferOperation(p.operation) === "buy" || p.offers?.some((o) => normalizeOfferOperation(o.operation) === "buy") || isProjectType(p.type);
          if (!hasBuy) return false;
        }
        if (guidedPropertyType && !matchesPropertyType(p.type, guidedPropertyType)) {
          return false;
        }
        return true;
      })
      .map((p) => p.id);

    if (matches.length > 0) {
      setAiFilteredIds(matches);
    }

    goToGuidedStage("zone");
  };

  const handleZoneSelect = (zone: string) => {
    const raw = zone.trim();
    if (!raw) return;
    const normRaw = normalizeGeoText(raw);

    // Si hace clic en "Todas"
    if (raw === "Todas" || normRaw === "todas") {
      setGuidedZones([]);
      setGeminiQuery("");
      setCurrentIndex(0);

      const center = resolveLocationCenter(guidedCity);
      if (center) {
        setMapFocus({
          longitude: center.lng,
          latitude: center.lat,
          zoom: center.zoom,
          key: Date.now(),
          label: guidedCity,
          source: "search",
        });
      }

      const matches = properties
        .filter((p) => {
          const normCity = normalizeGeoText(guidedCity);
          const textCity = normalizeGeoText(`${p.city || ""} ${p.area || ""} ${p.title || ""}`);
          const inCity =
            textCity.includes(normCity) ||
            (normCity === "santa cruz" && (textCity.includes("ichilo") || textCity.includes("san carlos")));
          if (!inCity) return false;
          if (guidedOperation === "Alquilar") {
            const hasRent = normalizeOfferOperation(p.operation) === "rent" || p.offers?.some((o) => normalizeOfferOperation(o.operation) === "rent");
            if (!hasRent) return false;
          }
          if (guidedOperation === "Comprar") {
            const hasBuy = normalizeOfferOperation(p.operation) === "buy" || p.offers?.some((o) => normalizeOfferOperation(o.operation) === "buy") || isProjectType(p.type);
            if (!hasBuy) return false;
          }
          if (guidedPropertyType && !matchesPropertyType(p.type, guidedPropertyType)) {
            return false;
          }
          return true;
        })
        .map((p) => p.id);

      if (matches.length > 0) {
        setAiFilteredIds(matches);
      }
      return;
    }

    const zones = getZonesForCity(guidedCity);
    const matchedZone = zones.find(
      (z) =>
        normalizeGeoText(z.name) === normRaw ||
        z.aliases.some((a) => normalizeGeoText(a) === normRaw || normalizeGeoText(a).startsWith(normRaw))
    );
    const value = matchedZone ? matchedZone.name : raw;

    const exists = guidedZones.includes(value);
    const nextZones = exists
      ? guidedZones.filter((z) => z !== value)
      : [...guidedZones.filter((z) => z !== "Todas"), value];

    setGuidedZones(nextZones);
    setGeminiQuery("");
    setCurrentIndex(0);

    if (nextZones.length > 0) {
      rememberRecentZone(value);
      const center = resolveLocationCenter(guidedCity, value);
      if (center) {
        setMapFocus({
          longitude: center.lng,
          latitude: center.lat,
          zoom: center.zoom,
          key: Date.now(),
          label: `${value}, ${guidedCity}`,
          source: "search",
        });
      }

      const matches = properties
        .filter((p) => {
          const normCity = normalizeGeoText(guidedCity);
          const textCity = normalizeGeoText(`${p.city || ""} ${p.area || ""} ${p.title || ""}`);
          const inCity =
            textCity.includes(normCity) ||
            (normCity === "santa cruz" && (textCity.includes("ichilo") || textCity.includes("san carlos")));
          if (!inCity) return false;

          if (guidedOperation === "Alquilar") {
            const hasRent = normalizeOfferOperation(p.operation) === "rent" || p.offers?.some((o) => normalizeOfferOperation(o.operation) === "rent");
            if (!hasRent) return false;
          }
          if (guidedOperation === "Comprar") {
            const hasBuy = normalizeOfferOperation(p.operation) === "buy" || p.offers?.some((o) => normalizeOfferOperation(o.operation) === "buy") || isProjectType(p.type);
            if (!hasBuy) return false;
          }
          if (guidedPropertyType && !matchesPropertyType(p.type, guidedPropertyType)) {
            return false;
          }

          const textZone = normalizeGeoText(`${p.zone || ""} ${p.area || ""} ${p.title || ""} ${p.description || ""}`);
          return nextZones.some((z) => textZone.includes(normalizeGeoText(z)));
        })
        .map((p) => p.id);

      if (matches.length > 0) {
        setAiFilteredIds(matches);
      }
    } else {
      const center = resolveLocationCenter(guidedCity);
      if (center) {
        setMapFocus({
          longitude: center.lng,
          latitude: center.lat,
          zoom: center.zoom,
          key: Date.now(),
          label: guidedCity,
          source: "search",
        });
      }

      const matches = properties
        .filter((p) => {
          const normCity = normalizeGeoText(guidedCity);
          const textCity = normalizeGeoText(`${p.city || ""} ${p.area || ""} ${p.title || ""}`);
          const inCity =
            textCity.includes(normCity) ||
            (normCity === "santa cruz" && (textCity.includes("ichilo") || textCity.includes("san carlos")));
          if (!inCity) return false;
          if (guidedOperation === "Alquilar") {
            const hasRent = normalizeOfferOperation(p.operation) === "rent" || p.offers?.some((o) => normalizeOfferOperation(o.operation) === "rent");
            if (!hasRent) return false;
          }
          if (guidedOperation === "Comprar") {
            const hasBuy = normalizeOfferOperation(p.operation) === "buy" || p.offers?.some((o) => normalizeOfferOperation(o.operation) === "buy") || isProjectType(p.type);
            if (!hasBuy) return false;
          }
          if (guidedPropertyType && !matchesPropertyType(p.type, guidedPropertyType)) {
            return false;
          }
          return true;
        })
        .map((p) => p.id);

      if (matches.length > 0) {
        setAiFilteredIds(matches);
      }
    }
  };

  const handleZonesConfirm = () => {
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
    else if (guidedStage === "propertyType") handlePropertyTypeSelect(option);
    else if (guidedStage === "city") handleCitySelect(option);
    else if (guidedStage === "zone") handleZoneSelect(option);
    else if (guidedStage === "budget") void handleBudgetSelect(option);
  };

  const goPrevGuidedStep = () => {
    const previous = previousGuidedStage(guidedStage, guidedOperation);
    if (previous) {
      if (previous === "operation") {
        resetGuidedSearch();
        return;
      }
      setGuidedBudget("");
      setShowSuggested(false);
      if (previous === "propertyType") {
        setGuidedCity("");
        setGuidedZones([]);
        if (guidedPropertyType) handlePropertyTypeSelect(guidedPropertyType);
      }
      if (previous === "city") {
        setGuidedZones([]);
        if (guidedCity) handleCitySelect(guidedCity);
      }
      goToGuidedStage(previous);
    }
  };

  const handleAskGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    const custom = geminiQuery.trim();
    if (guidedStage === "sell") return;
    if (guidedStage === "propertyType") {
      if (!custom) return;
      handlePropertyTypeSelect(custom);
      return;
    }
    if (guidedStage === "city") {
      if (!custom) return;
      handleCitySelect(custom);
      return;
    }
    if (guidedStage === "zone") {
      if (!custom) {
        handleZonesConfirm();
        return;
      }
      const parts = custom.split(/[,+y]/).map((s) => s.trim()).filter(Boolean);
      if (parts.length > 0) {
        parts.forEach((part) => handleZoneSelect(part));
      }
      handleZonesConfirm();
      return;
    }
    if (guidedStage === "budget") {
      if (!custom) return;
      await handleBudgetSelect(custom);
      return;
    }
    await runNiaSearch(geminiQuery);
  };
  const exactProperties = useMemo(() => {
    let list: Property[] = [];
    if (aiFilteredIds !== null) {
      const propertyById = new Map(properties.map((property) => [property.id, property]));
      list = aiFilteredIds
        .map((id) => propertyById.get(id))
        .filter((property): property is Property => Boolean(property));
    } else {
      list = properties;
    }

    if (guidedOperation || guidedPropertyType || guidedCity || guidedZones.length > 0 || guidedBudget) {
      const normCity = guidedCity ? normalizeGeoText(guidedCity) : "";
      const normZones = guidedZones.length > 0 ? guidedZones.map(normalizeGeoText) : [];
      const cleanBudget = guidedBudget ? guidedBudget.replace(/\./g, "").replace(/,/g, "") : "";
      const budgetMatch = cleanBudget.match(/(\d+)/);
      const maxBudget = budgetMatch ? Number(budgetMatch[1]) : null;

      list = list.filter((p) => {
        if (guidedOperation === "Alquilar") {
          const hasRent = normalizeOfferOperation(p.operation) === "rent" || p.offers?.some((o) => normalizeOfferOperation(o.operation) === "rent");
          if (!hasRent) return false;
        } else if (guidedOperation === "Comprar") {
          const hasBuy = normalizeOfferOperation(p.operation) === "buy" || p.offers?.some((o) => normalizeOfferOperation(o.operation) === "buy") || isProjectType(p.type);
          if (!hasBuy) return false;
        }

        if (guidedPropertyType && !matchesPropertyType(p.type, guidedPropertyType)) {
          return false;
        }

        if (normCity) {
          const textCity = normalizeGeoText(`${p.city || ""} ${p.area || ""} ${p.title || ""}`);
          const inCity = textCity.includes(normCity) || (normCity === "santa cruz" && (textCity.includes("ichilo") || textCity.includes("san carlos")));
          if (!inCity) return false;
        }

        if (normZones.length > 0) {
          const textZone = normalizeGeoText(`${p.zone || ""} ${p.area || ""} ${p.title || ""}`);
          const inZone = normZones.some((nz) => textZone.includes(nz));
          if (!inZone) return false;
        }

        if (maxBudget !== null) {
          const offer = selectPropertyOffer(p, guidedOperation === "Alquilar" ? "rent" : "buy");
          const price = offer?.price ?? p.price;
          if (price > maxBudget) return false;
        }

        return true;
      });
    }

    return list;
  }, [properties, aiFilteredIds, guidedOperation, guidedPropertyType, guidedCity, guidedZones, guidedBudget]);

  const suggestedProperties = useMemo(() => {
    if (!guidedOperation && !guidedCity && !guidedBudget) return [];

    const normCity = guidedCity ? normalizeGeoText(guidedCity) : "";
    const cleanBudget = guidedBudget ? guidedBudget.replace(/\./g, "").replace(/,/g, "") : "";
    const budgetMatch = cleanBudget.match(/(\d+)/);
    const maxBudget = budgetMatch ? Number(budgetMatch[1]) : null;

    const exactIds = new Set(exactProperties.map((p) => p.id));
    return properties
      .filter((p) => {
        if (exactIds.has(p.id)) return false;

        if (guidedOperation === "Alquilar") {
          const hasRent = normalizeOfferOperation(p.operation) === "rent" || p.offers?.some((o) => normalizeOfferOperation(o.operation) === "rent");
          if (!hasRent) return false;
        } else if (guidedOperation === "Comprar") {
          const hasBuy = normalizeOfferOperation(p.operation) === "buy" || p.offers?.some((o) => normalizeOfferOperation(o.operation) === "buy") || isProjectType(p.type);
          if (!hasBuy) return false;
        }

        if (normCity) {
          const textCity = normalizeGeoText(`${p.city || ""} ${p.area || ""} ${p.title || ""}`);
          const inCity = textCity.includes(normCity) || (normCity === "santa cruz" && (textCity.includes("ichilo") || textCity.includes("san carlos")));
          if (!inCity) return false;
        }

        if (guidedPropertyType && !matchesPropertyType(p.type, guidedPropertyType)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (maxBudget !== null) {
          const priceA = selectPropertyOffer(a, guidedOperation === "Alquilar" ? "rent" : "buy")?.price ?? a.price;
          const priceB = selectPropertyOffer(b, guidedOperation === "Alquilar" ? "rent" : "buy")?.price ?? b.price;
          return Math.abs(priceA - maxBudget) - Math.abs(priceB - maxBudget);
        }
        return 0;
      })
      .slice(0, 6);
  }, [properties, exactProperties, guidedOperation, guidedCity, guidedPropertyType, guidedBudget]);

  const filteredProperties = useMemo(() => {
    if (exactProperties.length > 0) {
      if (showSuggested) {
        return [...exactProperties, ...suggestedProperties];
      }
      return exactProperties;
    }
    if (showSuggested) {
      return suggestedProperties;
    }
    return [];
  }, [exactProperties, suggestedProperties, showSuggested]);

  const isSuggestedProperty = (prop: Property) =>
    suggestedProperties.some((sp) => sp.id === prop.id) && !exactProperties.some((ep) => ep.id === prop.id);

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

  const goToGalleryIndex = (index: number) => {
    if (index === normalizedGalleryIndex || selectedMediaCount <= 1) return;
    setGalleryDirection(index > normalizedGalleryIndex ? 1 : -1);
    setGalleryIndex(index);
  };

  useEffect(() => {
    if (!selectedProperty) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProperty(null);
      } else if (e.key === "ArrowLeft") {
        shiftGallery(-1);
      } else if (e.key === "ArrowRight") {
        shiftGallery(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProperty, selectedMediaCount]);

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

  const highlightedIds = useMemo(() => visibleProperties.map((property) => property.id), [visibleProperties]);

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
        purpose: guidedPropertyType || undefined,
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
            highlightedIds={highlightedIds}
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
      {canOpenAdvisor || canOpenAdmin ? (
        <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
          {canOpenAdmin ? (
            <Link to="/admin" className="flex items-center gap-2 rounded-xl border border-[var(--accent-main)]/50 bg-[var(--color-chocolate)] px-4 py-2.5 text-xs font-bold text-[var(--color-ivory)] shadow-lg backdrop-blur transition-colors hover:bg-[var(--accent-hover)] hover:text-white dark:border-[var(--border-soft)] dark:bg-[rgba(27,20,17,0.94)] dark:text-[var(--text-muted)]">
              <ShieldCheck size={14} /> Admin
            </Link>
          ) : null}
          {canOpenAdvisor ? (
            <Link to="/asesor" className="flex items-center gap-2 rounded-xl border border-[var(--accent-main)]/50 bg-[var(--color-chocolate)] px-4 py-2.5 text-xs font-bold text-[var(--color-ivory)] shadow-lg backdrop-blur transition-colors hover:bg-[var(--accent-hover)] hover:text-white dark:border-[var(--border-soft)] dark:bg-[rgba(27,20,17,0.94)] dark:text-[var(--text-muted)]">
              <UserCircle size={14} /> {roleLoading ? "..." : "Panel asesor"}
            </Link>
          ) : null}
        </div>
      ) : user ? (
        <button onClick={handleLogout} className="absolute top-6 right-6 z-10 flex items-center gap-2 rounded-xl border border-[var(--accent-main)]/50 bg-[var(--color-chocolate)] px-4 py-2.5 text-xs font-bold text-[var(--color-ivory)] shadow-lg backdrop-blur transition-colors hover:bg-[var(--accent-hover)] hover:text-white dark:border-[var(--border-soft)] dark:bg-[rgba(27,20,17,0.94)] dark:text-[var(--text-muted)]">
          <LogOut size={14} /> Salir
        </button>
      ) : (
        <button onClick={handleLogin} disabled={authLoading} className="absolute top-6 right-6 z-10 flex items-center gap-2 rounded-xl border border-[var(--accent-main)]/50 bg-[var(--color-chocolate)] px-4 py-2.5 text-xs font-bold text-[var(--color-ivory)] shadow-lg backdrop-blur transition-colors hover:bg-[var(--accent-hover)] hover:text-white disabled:opacity-60 dark:border-[var(--border-soft)] dark:bg-[rgba(27,20,17,0.94)] dark:text-[var(--text-muted)]">
          <ShieldCheck size={14} /> Entrar
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

        {canOpenAdvisor || canOpenAdmin ? (
          <>
            {canOpenAdmin ? (
              <Link to="/admin" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-main)]/50 bg-[var(--color-chocolate)] text-[var(--color-ivory)] shadow-lg transition-colors hover:bg-[var(--accent-hover)]" aria-label="Admin">
                <ShieldCheck size={16} />
              </Link>
            ) : null}
            {canOpenAdvisor ? (
              <Link to="/asesor" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-main)]/50 bg-[var(--color-chocolate)] text-[var(--color-ivory)] shadow-lg transition-colors hover:bg-[var(--accent-hover)]" aria-label="Panel asesor">
                <UserCircle size={16} />
              </Link>
            ) : null}
          </>
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
              {guidedStage !== "sell" && visibleGuidedChoiceOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleGuidedChoice(option)}
                  className={onboardingButtonClass("mobile", isChoiceSelected(option))}
                >
                  {option}
                </button>
              ))}
              {guidedStage === "zone" && (
                <button
                  type="button"
                  onClick={handleZonesConfirm}
                  className="rounded-full border border-[var(--accent-main)] bg-[var(--accent-main)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#2F241D] shadow-[var(--shadow-warm)] backdrop-blur transition-all hover:bg-[var(--accent-hover)] hover:text-white flex items-center gap-1"
                >
                  Continuar {guidedZones.length > 0 ? `(${guidedZones.length})` : ""} →
                </button>
              )}
              {guidedStage !== "sell" && visibleGuidedChoiceOptions.length === 0 && geminiQuery.trim() && (
                <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-panel)]/95 px-3 py-1.5 text-[11px] font-medium text-[var(--text-muted)]">
                  Sin opciones para "{geminiQuery}". Presiona Buscar.
                </span>
              )}
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
              <>
                {visibleGuidedChoiceOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleGuidedChoice(option)}
                    className={onboardingButtonClass("desktop", isChoiceSelected(option))}
                  >
                    {option}
                  </button>
                ))}
                {guidedStage === "zone" && (
                  <button
                    type="button"
                    onClick={handleZonesConfirm}
                    className="rounded-full border border-[var(--accent-main)] bg-[var(--accent-main)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#2F241D] shadow-sm backdrop-blur transition-all hover:bg-[var(--accent-hover)] hover:text-white flex items-center gap-1"
                  >
                    Continuar {guidedZones.length > 0 ? `(${guidedZones.length})` : ""} →
                  </button>
                )}
                {visibleGuidedChoiceOptions.length === 0 && geminiQuery.trim() && (
                  <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-panel)]/95 px-3 py-1 text-xs font-medium text-[var(--text-muted)]">
                    Sin opciones para "{geminiQuery}". Presiona <strong className="text-[var(--accent-main)]">Buscar</strong> para consultar con IA.
                  </span>
                )}
              </>
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
      {/* Indicador / Toggle para opciones sugeridas */}
      {hasFinishedAiSearch && (
        <div className="absolute bottom-[245px] left-1/2 z-20 -translate-x-1/2 md:bottom-[255px]">
          {showSuggested ? (
            <div className="flex items-center gap-2 rounded-full border border-amber-500/50 bg-[var(--surface-panel)]/95 px-4 py-1.5 shadow-md backdrop-blur dark:bg-[rgba(27,20,17,0.95)]">
              <Sparkles size={13} className="text-amber-500 shrink-0" />
              <span className="text-[11px] font-bold text-[var(--text-main)]">
                Mostrando {suggestedProperties.length} opciones cercanas
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowSuggested(false);
                  setCurrentIndex(0);
                }}
                className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:bg-amber-500/30 transition-colors"
              >
                {exactProperties.length > 0 ? "Solo exactos" : "Volver"}
              </button>
            </div>
          ) : exactProperties.length > 0 && suggestedProperties.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setShowSuggested(true);
                setCurrentIndex(0);
              }}
              className="rounded-full border border-[var(--accent-main)]/60 bg-[var(--surface-panel)]/92 px-4 py-1.5 text-[11px] font-bold text-[var(--accent-main)] shadow-sm backdrop-blur transition-all hover:bg-[var(--accent-main)] hover:text-[#2F241D] flex items-center gap-1.5"
            >
              <Sparkles size={13} />
              Ver {suggestedProperties.length} opciones cercanas (+presupuesto)
            </button>
          ) : null}
        </div>
      )}

      {/* CAPA 2: VISOR EDITORIAL PANORAMICO (Formato Ejecutivo) */}
      {(visibleProperties.length > 0 || hasFinishedAiSearch) && (
        <div className="nia-property-carousel absolute left-0 right-0 z-20 flex h-[230px] w-full items-center justify-center px-4 md:bottom-8 md:left-1/2 md:right-auto md:h-[240px] md:w-[98%] md:max-w-[1040px] md:-translate-x-1/2 md:justify-between md:gap-4 md:px-0">

          {visibleProperties.length > 0 && (
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - carouselStep))}
              disabled={currentIndex === 0}
              className="nia-carousel-arrow nia-carousel-arrow-left absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-[var(--accent-main)]/85 p-3 text-[#2F241D] shadow-xl transition-all hover:bg-[var(--accent-hover)] hover:text-white disabled:opacity-30 dark:bg-[rgba(27,20,17,0.94)] dark:text-[var(--text-main)] md:static md:translate-y-0 md:shrink-0"
            >
              <ChevronLeft size={28} />
            </button>
          )}

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
              {visibleProperties.length === 0 && hasFinishedAiSearch && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--accent-main)]/40 bg-[var(--surface-panel)]/95 px-6 py-5 text-center shadow-[var(--shadow-warm)] backdrop-blur dark:bg-[rgba(27,20,17,0.95)] max-w-md w-full mx-auto">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-main)]/15 text-[var(--accent-main)]">
            <Sparkles size={18} />
          </div>
          <h4 className="text-sm font-bold text-[var(--text-main)] mb-1">
            Sin opciones exactas para estos filtros
          </h4>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            No encontramos inmuebles que cumplan con todos tus criterios actuales.
          </p>
          {suggestedProperties.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setShowSuggested(true);
                setCurrentIndex(0);
              }}
              className="rounded-full border border-[var(--accent-main)] bg-[var(--accent-main)] px-5 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#2F241D] shadow-md transition-all hover:bg-[var(--accent-hover)] hover:text-white flex items-center gap-2"
            >
              <Sparkles size={14} /> Ver {suggestedProperties.length} opciones cercanas que se aproximan
            </button>
          ) : (
            <button
              type="button"
              onClick={resetGuidedSearch}
              className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-control)] px-4 py-2 text-xs font-bold text-[var(--text-main)] transition-colors hover:border-[var(--accent-main)]"
            >
              Explorar todo el catálogo
            </button>
          )}
        </div>
      )}
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
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt={p.title}
                referrerPolicy="no-referrer"
                onError={handleImageError}
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

          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="shrink-0 text-[10px] text-[var(--accent-main)] font-bold tracking-[0.18em] uppercase">Ref. #{p.id}</span>
            {isSuggestedProperty(p) ? (
              <span className="shrink-0 rounded-full border border-amber-500/50 bg-amber-500/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Opción Cercana
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-[var(--accent-main)]/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--text-main)]">
                {formatPropertyTypeLabel(p.type)}
              </span>
            )}
          </div>

          <h3 className="nia-property-card-title mb-2 line-clamp-2 text-[13px] font-bold leading-snug tracking-wide text-[var(--text-main)] md:text-sm">
            {p.title}
          </h3>

          <div className={`mb-3 flex min-w-0 items-baseline md:mb-4 ${showCarouselPrice ? "justify-between gap-3" : ""}`}>
            <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] md:text-xs">
              {isProjectType(p.type) ? "Venta" : getCarouselOfferLabel(p, displayOffer, searchIntent)}
            </span>
            {showCarouselPrice && (
              <span className="shrink-0 text-sm font-bold text-[var(--accent-main)] md:text-base">
                {isProjectType(p.type) && p.unidadesProyecto && p.unidadesProyecto.length > 0
                  ? `Desde ${formatPropertyPrice(displayOffer.price, displayOffer.currency)}`
                  : formatPropertyPrice(displayOffer.price, displayOffer.currency)}
              </span>
            )}
          </div>

          <div className="nia-property-card-meta mt-auto grid grid-cols-2 gap-x-2 gap-y-2 border-t border-[var(--border-soft)] pt-3 text-[9px] font-medium uppercase tracking-wider text-[var(--text-muted)] dark:border-[var(--border-soft)] dark:text-[var(--text-muted)] md:gap-x-4 md:text-[10px]">
            {p.type === "Terreno" ? (
              <>
                <div className="flex min-w-0 items-center gap-2">
                  <Building size={14} className="shrink-0 text-[var(--accent-secondary)] dark:text-[var(--text-muted)]" />
                  <span className="truncate">{p.superficieM2 ? `${p.superficieM2} m²` : "Terreno"}</span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate">{p.dimensiones || "Lote"}</span>
                </div>
              </>
            ) : p.type === "Comercial" ? (
              <>
                <div className="flex min-w-0 items-center gap-2">
                  <Building size={14} className="shrink-0 text-[var(--accent-secondary)] dark:text-[var(--text-muted)]" />
                  <span className="truncate">{p.subtipoComercial || "Comercial"}</span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate">{p.superficieM2 ? `${p.superficieM2} m²` : (p.bathrooms ? `${p.bathrooms} baño${p.bathrooms === 1 ? "" : "s"}` : "")}</span>
                </div>
              </>
            ) : isProjectType(p.type) ? (
              <>
                <div className="flex min-w-0 items-center gap-2">
                  <Layers size={14} className="shrink-0 text-[var(--accent-secondary)] dark:text-[var(--text-muted)]" />
                  <span className="truncate">
                    {p.unidadesProyecto && p.unidadesProyecto.length > 0
                      ? `${p.unidadesProyecto.length} Tipologías`
                      : (p.rooms ? `${p.rooms} dorm` : "En pozo")}
                  </span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <Calendar size={14} className="shrink-0 text-[var(--accent-secondary)] dark:text-[var(--text-muted)]" />
                  <span className="truncate">
                    {p.fechaEntrega ? `Entrega ${p.fechaEntrega}` : (p.faseObra || "En planos")}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex min-w-0 items-center gap-2">
                  <Bed size={14} className="shrink-0 text-[var(--accent-secondary)] dark:text-[var(--text-muted)]" />
                  <span className="truncate">{p.rooms} dorm</span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <Bath size={14} className="shrink-0 text-[var(--accent-secondary)] dark:text-[var(--text-muted)]" />
                  <span className="truncate">{p.bathrooms} baño{p.bathrooms === 1 ? "" : "s"}</span>
                </div>
              </>
            )}
            <div className="col-span-2 flex min-w-0 items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <Building size={14} className="shrink-0 text-[var(--accent-secondary)] dark:text-[var(--text-muted)]" />
                <span className="truncate">{p.area}</span>
              </div>
              {isProjectType(p.type) && p.unidadesDisponibles !== null && p.unidadesDisponibles !== undefined ? (
                <span className="shrink-0 rounded bg-[var(--accent-main)]/15 px-1.5 py-0.5 text-[8px] font-bold text-[var(--accent-main)]">
                  {p.unidadesDisponibles} disp.
                </span>
              ) : p.amoblado ? (
                <span className="shrink-0 rounded bg-stone-200/70 dark:bg-stone-800 px-1.5 py-0.5 text-[8px] font-bold text-stone-700 dark:text-stone-300">
                  Amoblado
                </span>
              ) : null}
            </div>
          </div>
        </div>
        </div>
      )})}
      </motion.div>
    </AnimatePresence>
  </div>

          {visibleProperties.length > 0 && (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(Math.max(0, filteredProperties.length - carouselStep), prev + carouselStep))}
              disabled={currentIndex + carouselStep >= filteredProperties.length}
              className="nia-carousel-arrow nia-carousel-arrow-right absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-[var(--accent-main)]/85 p-3 text-[#2F241D] shadow-xl transition-all hover:bg-[var(--accent-hover)] hover:text-white disabled:opacity-30 dark:bg-[rgba(27,20,17,0.94)] dark:text-[var(--text-main)] md:static md:translate-y-0 md:shrink-0"
            >
              <ChevronRight size={28} />
            </button>
          )}
        </div>
      )}

      {/* CAPA 3: MODAL INMERSIVO DE PANTALLA COMPLETA */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 w-full h-full bg-[var(--surface-panel)] dark:bg-[var(--surface-page)] z-[100] flex flex-col overflow-y-auto"
          >
            {/* Boton de Cierre Flotante */}
            <button
              onClick={() => setSelectedProperty(null)}
              className="fixed top-5 right-5 md:right-8 p-3 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-[var(--accent-main)] hover:text-[#2F241D] transition-all z-50 shadow-2xl border border-white/20"
              title="Cerrar (Esc)"
            >
              <X size={22} />
            </button>

            {/* GALERIA CINEMATOGRAFICA EDITORIAL */}
            <div className="w-full bg-[var(--surface-control)]/30 border-b border-[var(--border-soft)] py-6 pt-20 shrink-0">
              {isCloudinaryCollectionUrl(selectedMedia[0]) ? (
                <div className="max-w-5xl mx-auto px-4 md:px-8 pb-4">
                  <div className="aspect-[16/9] min-h-[400px] rounded-2xl overflow-hidden shadow-2xl relative bg-black/40 border border-[var(--border-soft)]">
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
                      className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white hover:text-[var(--accent-main)] text-[10px] font-bold tracking-widest px-3.5 py-2 rounded-full uppercase flex items-center gap-2 transition-colors border border-white/15"
                    >
                      <ExternalLink size={13} />
                      Abrir galería
                    </a>
                  </div>
                </div>
              ) : selectedMediaCount > 0 ? (
                <div className="w-full max-w-6xl mx-auto px-2 sm:px-6">
                  {/* Escenario Principal: Foto Activa en Centro + Vistas Previas Transparentes de Foto Anterior y Siguiente */}
                  <div className="relative w-full h-[360px] sm:h-[460px] md:h-[540px] flex items-center justify-center gap-3 sm:gap-4 select-none">
                    
                    {/* FOTO ANTERIOR: Peek lateral transparente e interactivo */}
                    {selectedMediaCount > 1 && (
                      <button
                        type="button"
                        onClick={() => shiftGallery(-1)}
                        className="hidden md:flex relative h-[78%] w-[13%] md:w-[15%] shrink-0 items-center justify-center rounded-2xl overflow-hidden opacity-30 hover:opacity-80 transition-all duration-300 scale-95 hover:scale-100 cursor-pointer border border-[var(--border-soft)]/40 shadow-lg group bg-black/10 backdrop-blur-xs"
                        aria-label="Foto anterior"
                        title="Ver foto anterior"
                      >
                        {isVideoUrl(previousMedia) ? (
                          <div className="w-full h-full bg-stone-900/60 flex items-center justify-center text-xs text-white">Video</div>
                        ) : (
                          <img
                            src={previousMedia}
                            alt="Foto anterior"
                            referrerPolicy="no-referrer"
                            onError={handleImageError}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="rounded-full bg-black/60 p-2 text-white/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 shadow-md">
                            <ChevronLeft size={20} />
                          </div>
                        </div>
                      </button>
                    )}

                    {/* FOTO ACTIVA: Centro de atención, libre de marcos plomos */}
                    <div className="relative h-full flex-1 max-w-4xl flex items-center justify-center">
                      <AnimatePresence initial={false} mode="wait">
                        <motion.div
                          key={activeMedia}
                          initial={{ opacity: 0, x: galleryDirection > 0 ? 30 : -30, scale: 0.98 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: galleryDirection > 0 ? -30 : 30, scale: 0.98 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className="relative w-full h-full flex items-center justify-center"
                        >
                          {isVideoUrl(activeMedia) ? (
                            <video
                              src={activeMedia}
                              className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl border border-[var(--border-soft)]/60"
                              controls
                              autoPlay
                              playsInline
                            />
                          ) : (
                            <img
                              src={activeMedia}
                              alt={`${selectedProperty.title} - Foto ${normalizedGalleryIndex + 1}`}
                              referrerPolicy="no-referrer"
                              onError={handleImageError}
                              className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl border border-[var(--border-soft)]/60"
                            />
                          )}
                        </motion.div>
                      </AnimatePresence>

                      {/* Flechas de Navegación flotantes sobre la foto activa */}
                      {selectedMediaCount > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => shiftGallery(-1)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/60 hover:bg-[var(--accent-main)] hover:text-[#2F241D] text-white p-2.5 sm:p-3 backdrop-blur-md border border-white/20 transition-all shadow-xl"
                            aria-label="Foto anterior"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            type="button"
                            onClick={() => shiftGallery(1)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/60 hover:bg-[var(--accent-main)] hover:text-[#2F241D] text-white p-2.5 sm:p-3 backdrop-blur-md border border-white/20 transition-all shadow-xl"
                            aria-label="Foto siguiente"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </>
                      )}

                      {/* Contador de fotos elegante */}
                      <div className="absolute bottom-3 right-3 z-20 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-[11px] font-bold tracking-wider text-[var(--accent-main)] border border-white/15 shadow-md">
                        {normalizedGalleryIndex + 1} / {selectedMediaCount}
                      </div>
                    </div>

                    {/* FOTO SIGUIENTE: Peek lateral transparente e interactivo */}
                    {selectedMediaCount > 1 && (
                      <button
                        type="button"
                        onClick={() => shiftGallery(1)}
                        className="hidden md:flex relative h-[78%] w-[13%] md:w-[15%] shrink-0 items-center justify-center rounded-2xl overflow-hidden opacity-30 hover:opacity-80 transition-all duration-300 scale-95 hover:scale-100 cursor-pointer border border-[var(--border-soft)]/40 shadow-lg group bg-black/10 backdrop-blur-xs"
                        aria-label="Foto siguiente"
                        title="Ver foto siguiente"
                      >
                        {isVideoUrl(nextMedia) ? (
                          <div className="w-full h-full bg-stone-900/60 flex items-center justify-center text-xs text-white">Video</div>
                        ) : (
                          <img
                            src={nextMedia}
                            alt="Foto siguiente"
                            referrerPolicy="no-referrer"
                            onError={handleImageError}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="rounded-full bg-black/60 p-2 text-white/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 shadow-md">
                            <ChevronRight size={20} />
                          </div>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Tira de Miniaturas (Thumbnails) con diseño limpio y fallbacks */}
                  {selectedMediaCount > 1 && (
                    <div className="mt-4 flex items-center justify-center gap-2 overflow-x-auto py-1.5 px-2 scrollbar-none max-w-4xl mx-auto">
                      {selectedMedia.map((mediaUrl, idx) => (
                        <button
                          key={mediaUrl + idx}
                          type="button"
                          onClick={() => goToGalleryIndex(idx)}
                          className={`relative h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                            idx === normalizedGalleryIndex
                              ? "border-[var(--accent-main)] ring-2 ring-[var(--accent-main)]/40 opacity-100 scale-105 shadow-md"
                              : "border-[var(--border-soft)]/40 opacity-40 hover:opacity-85"
                          }`}
                          title={`Ver foto ${idx + 1}`}
                        >
                          {isVideoUrl(mediaUrl) ? (
                            <div className="w-full h-full bg-stone-900 flex items-center justify-center text-xs text-white">Video</div>
                          ) : (
                            <img
                              src={mediaUrl}
                              alt=""
                              referrerPolicy="no-referrer"
                              onError={handleImageError}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-6 md:px-12 pb-6">
                  <div className="mx-auto flex aspect-[16/9] max-w-5xl items-center justify-center rounded-2xl bg-[var(--surface-control)]/40 border border-[var(--border-soft)]">
                    <span className="text-[var(--text-muted)] uppercase tracking-widest text-xs font-bold">Imágenes no disponibles</span>
                  </div>
                </div>
              )}
            </div>

            {/* CONTENIDO EDITORIAL (Maxima Legibilidad) */}
            <div className="w-full max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-12 shrink-0">

                {/* Columna Izquierda: Informacion Extendida */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[var(--accent-main)] text-xs font-bold uppercase tracking-[0.24em]">Ref. #{selectedProperty.id}</span>
                    <span className="rounded-full bg-[var(--accent-main)]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-main)]">
                      {formatPropertyTypeLabel(selectedProperty.type)}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-serif text-[var(--text-main)] dark:text-[var(--text-main)] leading-tight mb-4 tracking-wide">
                    {selectedProperty.title}
                  </h2>

                  {/* BLOQUE EXCLUSIVO PARA PROYECTO (PREVENTA) - GRADO INVERSIONISTA */}
                  {isProjectType(selectedProperty.type) && (
                    <div className="mb-10 space-y-6">
                      {/* 1. Estado Comercial y Disponibilidad */}
                      {(selectedProperty.mensajeUrgencia || (selectedProperty.unidadesDisponibles !== null && selectedProperty.unidadesDisponibles !== undefined)) && (
                        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-control)]/40 p-5 shadow-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-main)]/15 text-[var(--accent-main)] border border-[var(--accent-main)]/25">
                                <Sparkles size={18} />
                              </div>
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-main)]">
                                  Estado del Proyecto
                                </span>
                                <h3 className="text-sm sm:text-base font-semibold text-[var(--text-main)] leading-snug">
                                  {selectedProperty.mensajeUrgencia || "Unidades en preventa disponibles"}
                                </h3>
                              </div>
                            </div>
                            {selectedProperty.unidadesDisponibles !== null && selectedProperty.unidadesDisponibles !== undefined && (
                              <div className="shrink-0 rounded-xl bg-[var(--surface-panel)] border border-[var(--border-soft)] px-4 py-2 text-left sm:text-right">
                                <span className="block text-xl font-bold text-[var(--accent-main)] leading-none">
                                  {selectedProperty.unidadesDisponibles}
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                  Unidades Libres
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 2. Cronograma de Entrega y Avance */}
                      {(selectedProperty.fechaEntrega || selectedProperty.avanceObra !== null) && (
                        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-5 shadow-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                                Cronograma de Entrega
                              </span>
                              <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-xl md:text-2xl font-bold text-[var(--text-main)]">
                                  {selectedProperty.fechaEntrega ? calculateDeliveryCountdown(selectedProperty.fechaEntrega).label : "En construcción"}
                                </span>
                                {selectedProperty.fechaEntrega && (
                                  <span className="text-xs font-medium text-[var(--text-muted)]">
                                    · {selectedProperty.fechaEntrega}
                                  </span>
                                )}
                              </div>
                            </div>
                            {selectedProperty.faseObra && (
                              <span className="self-start sm:self-auto rounded-full border border-[var(--accent-main)]/40 bg-[var(--accent-main)]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--accent-main)]">
                                {selectedProperty.faseObra}
                              </span>
                            )}
                          </div>
                          {selectedProperty.avanceObra !== null && selectedProperty.avanceObra !== undefined && (
                            <div className="mt-4 pt-4 border-t border-[var(--border-soft)]">
                              <div className="flex justify-between text-xs font-medium text-[var(--text-main)] mb-2">
                                <span className="text-[var(--text-muted)]">Avance de Obra</span>
                                <span className="font-bold text-[var(--accent-main)]">{selectedProperty.avanceObra}%</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-control)]">
                                <div
                                  className="h-full rounded-full bg-[var(--accent-main)] transition-all duration-700"
                                  style={{ width: `${Math.min(100, Math.max(0, selectedProperty.avanceObra))}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. Tarjetas de Métricas de Inversión */}
                      {(selectedProperty.pisos || selectedProperty.totalUnidades || selectedProperty.reservaUsd || selectedProperty.precioM2Desde) && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {selectedProperty.pisos && (
                            <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Pisos</span>
                              <div className="mt-1 text-xl font-bold text-[var(--text-main)]">{selectedProperty.pisos}</div>
                              <span className="text-[9px] text-[var(--text-muted)]">Niveles de diseño</span>
                            </div>
                          )}
                          {selectedProperty.totalUnidades && (
                            <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Departamentos</span>
                              <div className="mt-1 text-xl font-bold text-[var(--text-main)]">{selectedProperty.totalUnidades}</div>
                              <span className="text-[9px] text-[var(--text-muted)]">Total unidades</span>
                            </div>
                          )}
                          {selectedProperty.reservaUsd && (
                            <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Reserva</span>
                              <div className="mt-1 text-xl font-bold text-[var(--accent-main)]">
                                ${selectedProperty.reservaUsd.toLocaleString()} USD
                              </div>
                              <span className="text-[9px] text-[var(--text-muted)]">Vigencia 7 días</span>
                            </div>
                          )}
                          {selectedProperty.precioM2Desde && (
                            <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Precio / m²</span>
                              <div className="mt-1 text-xl font-bold text-[var(--accent-main)]">
                                Desde ${selectedProperty.precioM2Desde.toLocaleString()}
                              </div>
                              <span className="text-[9px] text-[var(--text-muted)]">USD por metro</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 4. Tipologías y Unidades Disponibles */}
                      {selectedProperty.unidadesProyecto && selectedProperty.unidadesProyecto.length > 0 && (
                        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-xs">
                          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Layers size={18} className="text-[var(--accent-main)] shrink-0" />
                              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">
                                Tipologías de Unidades ({selectedProperty.unidadesProyecto.length})
                              </h4>
                            </div>
                            <span className="text-[11px] font-medium text-[var(--text-muted)]">
                              {getProjectUnitsSummary(selectedProperty.unidadesProyecto).surfaceLabel}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                            {selectedProperty.unidadesProyecto.map((unit, uIdx) => (
                              <div
                                key={unit.id || uIdx}
                                className="flex flex-col justify-between rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/50 p-4 shadow-xs transition-all hover:border-[var(--accent-main)]/50"
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-[var(--text-main)]">
                                      {unit.tipologia}
                                    </span>
                                    {unit.superficieM2 > 0 && (
                                      <span className="rounded bg-[var(--accent-main)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--accent-main)]">
                                        {unit.superficieM2} m²
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                                    {unit.superficieM2 > 0 ? `${unit.superficieM2} m² construidos` : "Superficie a consultar"}
                                  </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between border-t border-[var(--border-soft)] pt-3">
                                  <span className="text-sm font-bold text-[var(--accent-main)]">
                                    {unit.precio > 0 ? `$${unit.precio.toLocaleString()} ${unit.moneda || "USD"}` : "Consultar precio"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const baseDraft = currentLeadContext(selectedProperty);
                                      beginContact({
                                        ...baseDraft,
                                        title: `${selectedProperty.title} (${unit.tipologia} - ${unit.superficieM2 > 0 ? `${unit.superficieM2} m²` : ""} - $${unit.precio.toLocaleString()} ${unit.moneda || "USD"})`,
                                      });
                                    }}
                                    className="rounded-lg border border-[var(--accent-main)]/50 bg-[var(--accent-main)]/10 px-3 py-1.5 text-[11px] font-bold text-[var(--accent-main)] transition-colors hover:bg-[var(--accent-main)] hover:text-[#2F241D]"
                                  >
                                    Consultar
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 5. Planes de Pago e Inversión */}
                      <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-xs">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp size={18} className="text-[var(--accent-main)]" />
                          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">
                            Planes de Pago y Estructura Financiera
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="rounded-xl border border-[var(--accent-main)]/50 bg-[var(--accent-main)]/10 p-4 flex flex-col justify-between">
                            <div>
                              <span className="rounded bg-[var(--accent-main)]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--accent-main)]">
                                Pago al Contado
                              </span>
                              <div className="mt-2 text-lg font-bold text-[var(--text-main)]">100% Contado</div>
                              <p className="mt-1 text-xs text-[var(--text-muted)]">
                                Precio preferencial con descuento de inversor lista cero.
                              </p>
                            </div>
                            <div className="mt-3 text-sm font-bold text-[var(--accent-main)] pt-2 border-t border-[var(--accent-main)]/20">
                              Desde $1.250 / m²
                            </div>
                          </div>

                          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/40 p-4 flex flex-col justify-between">
                            <div>
                              <span className="rounded bg-[var(--surface-control)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                Plan Flexible
                              </span>
                              <div className="mt-2 text-lg font-bold text-[var(--text-main)]">60% Inicial</div>
                              <p className="mt-1 text-xs text-[var(--text-muted)]">
                                60% cuota inicial y 40% saldo contra entrega de llaves.
                              </p>
                            </div>
                            <div className="mt-3 text-sm font-bold text-[var(--accent-main)] pt-2 border-t border-[var(--border-soft)]">
                              Desde $1.300 / m²
                            </div>
                          </div>

                          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/40 p-4 flex flex-col justify-between">
                            <div>
                              <span className="rounded bg-[var(--surface-control)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                Plan Clásico
                              </span>
                              <div className="mt-2 text-lg font-bold text-[var(--text-main)]">40% Inicial</div>
                              <p className="mt-1 text-xs text-[var(--text-muted)]">
                                40% cuota inicial y 60% financiado / contra entrega.
                              </p>
                            </div>
                            <div className="mt-3 text-sm font-bold text-[var(--accent-main)] pt-2 border-t border-[var(--border-soft)]">
                              Desde $1.350 / m²
                            </div>
                          </div>
                        </div>

                        {/* Parqueos y Bauleras */}
                        <div className="mt-4 pt-4 border-t border-[var(--border-soft)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
                          <span>
                            <strong className="text-[var(--text-main)]">Parqueos con baulera:</strong> Simple $15.000 USD · Doble $22.000 USD
                          </span>
                          {selectedProperty.brochureUrl && (
                            <a
                              href={selectedProperty.brochureUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-main)] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#2F241D] hover:bg-[var(--accent-hover)] hover:text-white transition-colors self-start sm:self-auto"
                            >
                              <FileText size={14} /> Ver Dossier Oficial (PDF)
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BLOQUE EXCLUSIVO PARA DEPARTAMENTO */}
                  {selectedProperty.type === "Departamento" && (() => {
                    const depto = parseDepartamentoDetails(selectedProperty.datosEspecificosJson, {
                      rooms: selectedProperty.rooms,
                      bathrooms: selectedProperty.bathrooms,
                      surfaceM2: selectedProperty.superficieM2,
                    });
                    if (!depto) return null;

                    return (
                      <div className="mb-10 space-y-6">
                        {/* 1. Oportunidad & Nuevo Precio */}
                        {depto.descuentoUsd ? (
                          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-control)]/40 p-5 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-3.5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-main)]/15 text-[var(--accent-main)] border border-[var(--accent-main)]/25">
                                  <Sparkles size={18} />
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-main)]">
                                    Precio de Oportunidad
                                  </span>
                                  <h3 className="text-sm sm:text-base font-semibold text-[var(--text-main)] leading-snug">
                                    {depto.tipoCambioNota || "Descuento preferencial de inversión"}
                                  </h3>
                                </div>
                              </div>
                              <div className="shrink-0 rounded-xl bg-[var(--surface-panel)] border border-[var(--border-soft)] px-4 py-2 text-left sm:text-right">
                                {depto.precioAnteriorUsd && (
                                  <span className="block text-xs line-through text-[var(--text-muted)]">
                                    Antes: ${depto.precioAnteriorUsd.toLocaleString()} USD
                                  </span>
                                )}
                                <span className="block text-lg font-bold text-[var(--accent-main)] leading-tight">
                                  Ahorro ${depto.descuentoUsd.toLocaleString()} USD
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {/* 2. Tarjetas de Métricas de Habitabilidad */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Nivel</span>
                            <div className="mt-1 text-xl font-bold text-[var(--text-main)]">
                              {depto.piso ? `Piso ${depto.piso}` : (selectedProperty.piso ? `Piso ${selectedProperty.piso}` : "Nivel Alto")}
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)]">
                              {depto.vista || "Vista abierta"}
                            </span>
                          </div>

                          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Superficie</span>
                            <div className="mt-1 text-xl font-bold text-[var(--text-main)]">
                              {selectedProperty.superficieM2 ? `${selectedProperty.superficieM2} m²` : "54.22 m²"}
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)]">
                              {depto.precioM2 ? `$${Math.round(depto.precioM2)} / m²` : "Área construida"}
                            </span>
                          </div>

                          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Dormitorios</span>
                            <div className="mt-1 text-xl font-bold text-[var(--text-main)]">
                              {selectedProperty.rooms} Dorms
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)]">
                              {selectedProperty.bathrooms} {selectedProperty.bathrooms === 1 ? "baño completo" : "baños completos"}
                            </span>
                          </div>
                        </div>

                        {/* 3. Equipamiento Interior & Acabados */}
                        {depto.equipamiento && depto.equipamiento.length > 0 && (
                          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-xs">
                            <div className="mb-4 flex items-center gap-2">
                              <CheckCircle2 size={18} className="text-[var(--accent-main)] shrink-0" />
                              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">
                                Equipamiento Interior & Acabados
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {depto.equipamiento.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2.5 rounded-lg border border-[var(--border-soft)]/70 bg-[var(--surface-control)]/40 p-3 text-xs text-[var(--text-main)]">
                                  <Sparkles size={13} className="text-[var(--accent-main)] mt-0.5 shrink-0" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 4. Club House & Amenidades del Condominio */}
                        {depto.amenidadesEdificio && depto.amenidadesEdificio.length > 0 && (
                          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-xs">
                            <div className="mb-4 flex items-center gap-2">
                              <Building2 size={18} className="text-[var(--accent-main)] shrink-0" />
                              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">
                                Club House & Amenidades Exclusivas
                              </h4>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              {depto.amenidadesEdificio.map((amenity, idx) => (
                                <div key={idx} className="flex flex-col justify-center items-center text-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3 shadow-xs">
                                  <Sparkles size={14} className="text-[var(--accent-main)] mb-1" />
                                  <span className="text-xs font-semibold text-[var(--text-main)]">{amenity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* BLOQUE EXCLUSIVO PARA CASA */}
                  {selectedProperty.type === "Casa" && (() => {
                    const casa = parseCasaDetails(selectedProperty.datosEspecificosJson);
                    if (!casa) return null;

                    return (
                      <div className="mb-10 space-y-6">
                        {/* 1. Potencial Comercial y Flujo Peatonal */}
                        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-control)]/40 p-5 shadow-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-main)]/15 text-[var(--accent-main)] border border-[var(--accent-main)]/25">
                                <Building size={18} />
                              </div>
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-main)]">
                                  Vocación Inmobiliaria
                                </span>
                                <h3 className="text-sm sm:text-base font-semibold text-[var(--text-main)] leading-snug">
                                  {casa.vocacion || "Propiedad Polifacética de Alta Rentabilidad"}
                                </h3>
                              </div>
                            </div>
                            {casa.tiendaCalleM2 && (
                              <div className="shrink-0 rounded-xl bg-[var(--surface-panel)] border border-[var(--border-soft)] px-4 py-2 text-left sm:text-right">
                                <span className="block text-xl font-bold text-[var(--accent-main)] leading-none">
                                  {casa.tiendaCalleM2} m²
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                  Tienda a la Calle
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 2. Tarjetas de Distribución & Metraje */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Terreno</span>
                            <div className="mt-1 text-xl font-bold text-[var(--text-main)]">
                              {casa.superficieTerrenoM2 || selectedProperty.superficieM2} m²
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)]">Superficie de lote</span>
                          </div>

                          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Construcción</span>
                            <div className="mt-1 text-xl font-bold text-[var(--text-main)]">
                              {casa.superficieConstruidaM2 ? `${casa.superficieConstruidaM2} m²` : "Sólida"}
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)]">Área cubierta</span>
                          </div>

                          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Ambientes</span>
                            <div className="mt-1 text-xl font-bold text-[var(--text-main)]">
                              {casa.ambientesTotales || selectedProperty.rooms} Amb.
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)]">
                              {casa.banosTotales || selectedProperty.bathrooms} baños estratégicos
                            </span>
                          </div>

                          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Divisibilidad</span>
                            <div className="mt-1 text-xl font-bold text-[var(--accent-main)]">
                              {casa.patiosInternos ? `${casa.patiosInternos} Patios` : "Multiuso"}
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)]">
                              {casa.cocinasIndependientes ? `${casa.cocinasIndependientes} cocinas sep.` : "Uso mixto"}
                            </span>
                          </div>
                        </div>

                        {/* 3. Matriz de Usos Comerciales Recomendados */}
                        {casa.usosRecomendados && casa.usosRecomendados.length > 0 && (
                          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-xs">
                            <div className="mb-4 flex items-center gap-2">
                              <Layers size={18} className="text-[var(--accent-main)] shrink-0" />
                              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">
                                Matriz de Usos Recomendados & Rentabilidad
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {casa.usosRecomendados.map((uso, idx) => (
                                <div key={idx} className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/40 p-3.5 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-main)]/20 text-[10px] font-bold text-[var(--accent-main)]">
                                        {idx + 1}
                                      </span>
                                      <h5 className="text-xs font-bold text-[var(--text-main)]">{uso.titulo}</h5>
                                    </div>
                                    <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
                                      {uso.detalle}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 4. Ventajas Operativas */}
                        {casa.ventajasComerciales && casa.ventajasComerciales.length > 0 && (
                          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-xs">
                            <div className="mb-3 flex items-center gap-2">
                              <CheckCircle2 size={18} className="text-[var(--accent-main)] shrink-0" />
                              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">
                                Factibilidad & Ventajas Operativas
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {casa.ventajasComerciales.map((ventaja, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-[var(--text-main)] py-1">
                                  <Sparkles size={12} className="text-[var(--accent-main)] shrink-0" />
                                  <span>{ventaja}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* BLOQUE EXCLUSIVO PARA TERRENO */}
                  {selectedProperty.type === "Terreno" && (() => {
                    const terr = parseTerrenoDetails(selectedProperty.datosEspecificosJson);
                    if (!terr) return null;

                    return (
                      <div className="mb-10 space-y-6">
                        {/* 1. Métrica Clave de Inversión en Tierra */}
                        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-control)]/40 p-5 shadow-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-main)]/15 text-[var(--accent-main)] border border-[var(--accent-main)]/25">
                                <TrendingUp size={18} />
                              </div>
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-main)]">
                                  Métrica de Inversión Patrimonial
                                </span>
                                <h3 className="text-sm sm:text-base font-semibold text-[var(--text-main)] leading-snug">
                                  {terr.vocacion || "Terreno Productivo en Radio Urbano"}
                                </h3>
                              </div>
                            </div>
                            <div className="shrink-0 rounded-xl bg-[var(--surface-panel)] border border-[var(--border-soft)] px-4 py-2 text-left sm:text-right">
                              <span className="block text-xl font-bold text-[var(--accent-main)] leading-none">
                                {terr.precioM2 ? `$${terr.precioM2} USD / m²` : "$10.25 / m²"}
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                Valor por Metro Cuadrado
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 2. Métricas del Predio */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Superficie Total</span>
                            <div className="mt-1 text-xl font-bold text-[var(--text-main)]">
                              {terr.superficieTotalM2 || selectedProperty.superficieM2} m²
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)]">Extensión aprovechable</span>
                          </div>

                          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Zonificación</span>
                            <div className="mt-1 text-xl font-bold text-[var(--text-main)]">
                              Urbano
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)]">
                              {terr.radioUrbano || "Área Urbana El Cercado"}
                            </span>
                          </div>

                          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Servicios</span>
                            <div className="mt-1 text-xl font-bold text-[var(--accent-main)]">
                              Luz y Agua
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)]">En puerta / Activos</span>
                          </div>

                          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Productividad</span>
                            <div className="mt-1 text-xl font-bold text-[var(--accent-main)]">
                              Frutales
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)]">Renta inmediata</span>
                          </div>
                        </div>

                        {/* 3. Servicios Básicos e Infraestructura */}
                        {terr.serviciosDisponibles && terr.serviciosDisponibles.length > 0 && (
                          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-xs">
                            <div className="mb-4 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-[var(--accent-main)] shrink-0" />
                                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">
                                  Factibilidad de Servicios & Acceso
                                </h4>
                              </div>
                              {terr.mapsUrl && (
                                <a
                                  href={terr.mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent-main)]/50 bg-[var(--accent-main)]/10 px-3 py-1.5 text-xs font-bold text-[var(--accent-main)] hover:bg-[var(--accent-main)] hover:text-[#2F241D] transition-colors"
                                >
                                  <MapPin size={13} /> Ver en Google Maps
                                </a>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {terr.serviciosDisponibles.map((srv, idx) => (
                                <div key={idx} className="flex items-center gap-2.5 rounded-lg border border-[var(--border-soft)]/70 bg-[var(--surface-control)]/40 p-3 text-xs text-[var(--text-main)]">
                                  <Sparkles size={13} className="text-[var(--accent-main)] shrink-0" />
                                  <span>{srv}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 4. Vocaciones de Desarrollo */}
                        {terr.vocacionesDesarrollo && terr.vocacionesDesarrollo.length > 0 && (
                          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-xs">
                            <div className="mb-4 flex items-center gap-2">
                              <Layers size={18} className="text-[var(--accent-main)] shrink-0" />
                              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">
                                Vocaciones de Desarrollo & Usos del Suelo
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {terr.vocacionesDesarrollo.map((voc, idx) => (
                                <div key={idx} className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/40 p-3.5 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-main)]/20 text-[10px] font-bold text-[var(--accent-main)]">
                                        {idx + 1}
                                      </span>
                                      <h5 className="text-xs font-bold text-[var(--text-main)]">{voc.titulo}</h5>
                                    </div>
                                    <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
                                      {voc.detalle}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* BLOQUE EXCLUSIVO PARA COMERCIAL */}
                  {selectedProperty.type === "Comercial" && (() => {
                    const com = parseComercialDetails(selectedProperty.datosEspecificosJson);
                    if (!com) return null;

                    return (
                      <div className="mb-10 space-y-6">
                        {/* 1. Header de Exposición Comercial */}
                        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-control)]/40 p-5 shadow-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-main)]/15 text-[var(--accent-main)] border border-[var(--accent-main)]/25">
                                <Building2 size={18} />
                              </div>
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-main)]">
                                  Visibilidad Comercial Troncal
                                </span>
                                <h3 className="text-sm sm:text-base font-semibold text-[var(--text-main)] leading-snug">
                                  {com.vocacion || "Inmueble Mixto sobre Segundo Anillo"}
                                </h3>
                              </div>
                            </div>
                            <div className="shrink-0 rounded-xl bg-[var(--surface-panel)] border border-[var(--border-soft)] px-4 py-2 text-left sm:text-right">
                              <span className="block text-xl font-bold text-[var(--accent-main)] leading-none">
                                {com.niveles || 3} Niveles
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                PB + PA + Terraza
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 2. Tarjetas de Métricas de Superficie */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Construcción</span>
                            <div className="mt-1 text-xl font-bold text-[var(--text-main)]">
                              {com.superficieConstruidaM2 || selectedProperty.superficieM2} m²
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)]">Área cubierta total</span>
                          </div>

                          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Terreno</span>
                            <div className="mt-1 text-xl font-bold text-[var(--text-main)]">
                              {com.superficieTerrenoM2 ? `${com.superficieTerrenoM2} m²` : "Lote propio"}
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)]">Frente a la avenida</span>
                          </div>

                          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Flujo Vehicular</span>
                            <div className="mt-1 text-xl font-bold text-[var(--accent-main)]">
                              Muy Alto
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)]">Arteria principal 2do Anillo</span>
                          </div>

                          <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-3.5 text-center shadow-xs">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Servicios</span>
                            <div className="mt-1 text-xl font-bold text-[var(--text-main)]">
                              Gas & Trifásica
                            </div>
                            <span className="text-[9px] text-[var(--text-muted)]">Apto industria/cocina</span>
                          </div>
                        </div>

                        {/* 3. Desglose Arquitectónico por Plantas */}
                        <div className="space-y-3">
                          {com.plantaBaja && (
                            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-xs">
                              <div className="mb-3 flex items-center gap-2">
                                <Layers size={16} className="text-[var(--accent-main)] shrink-0" />
                                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">
                                  {com.plantaBaja.titulo}
                                </h4>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {com.plantaBaja.ambientes.map((amb, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-xs text-[var(--text-main)] py-1">
                                    <Sparkles size={13} className="text-[var(--accent-main)] mt-0.5 shrink-0" />
                                    <span>{amb}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {com.plantaAlta && (
                            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-xs">
                              <div className="mb-3 flex items-center gap-2">
                                <Building size={16} className="text-[var(--accent-main)] shrink-0" />
                                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">
                                  {com.plantaAlta.titulo}
                                </h4>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {com.plantaAlta.ambientes.map((amb, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-xs text-[var(--text-main)] py-1">
                                    <CheckCircle2 size={13} className="text-[var(--accent-main)] mt-0.5 shrink-0" />
                                    <span>{amb}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {com.nivelSuperior && (
                            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-xs">
                              <div className="mb-3 flex items-center gap-2">
                                <TrendingUp size={16} className="text-[var(--accent-main)] shrink-0" />
                                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">
                                  {com.nivelSuperior.titulo}
                                </h4>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {com.nivelSuperior.ambientes.map((amb, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-xs text-[var(--text-main)] py-1">
                                    <Sparkles size={13} className="text-[var(--accent-main)] mt-0.5 shrink-0" />
                                    <span>{amb}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 4. Usos Comerciales Recomendados */}
                        {com.usosRecomendados && com.usosRecomendados.length > 0 && (
                          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-xs">
                            <div className="mb-4 flex items-center gap-2">
                              <Layers size={18} className="text-[var(--accent-main)] shrink-0" />
                              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-main)]">
                                Usos Comerciales e Institucionales Recomendados
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {com.usosRecomendados.map((uso, idx) => (
                                <div key={idx} className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/40 p-3.5 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-main)]/20 text-[10px] font-bold text-[var(--accent-main)]">
                                        {idx + 1}
                                      </span>
                                      <h5 className="text-xs font-bold text-[var(--text-main)]">{uso.titulo}</h5>
                                    </div>
                                    <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
                                      {uso.detalle}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

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

                     <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-3">
                           <span className="text-[var(--text-muted)] dark:text-[var(--text-muted)] flex items-center gap-3 text-sm"><Building size={16}/> Referencia</span>
                           <span className="text-[var(--text-main)] dark:text-[var(--text-main)] text-sm font-semibold leading-none">#{selectedProperty.id}</span>
                        </div>
                        <div className="border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-3">
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
                        <div className="flex justify-between items-center border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-3">
                           <span className="text-[var(--text-muted)] dark:text-[var(--text-muted)] flex items-center gap-3 text-sm"><Building size={16}/> Tipo</span>
                           <span className="text-[var(--text-main)] dark:text-[var(--text-main)] text-sm font-semibold leading-none">{selectedProperty.type || "Departamento"}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-3">
                           <span className="text-[var(--text-muted)] dark:text-[var(--text-muted)] flex items-center gap-3 text-sm"><MapPin size={16}/> Zona</span>
                           <span className="text-[var(--text-main)] dark:text-[var(--text-main)] text-sm font-semibold leading-none">{selectedProperty.area}</span>
                        </div>

                        {/* EXCLUSIVO SEGUN TIPO */}
                        {selectedProperty.type === "Terreno" ? (() => {
                          const terr = parseTerrenoDetails(selectedProperty.datosEspecificosJson);
                          return (
                            <>
                              {selectedProperty.superficieM2 ? (
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Superficie Total</span>
                                  <span className="text-sm font-semibold">{selectedProperty.superficieM2} m²</span>
                                </div>
                              ) : null}
                              {terr?.precioM2 ? (
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Valor / m²</span>
                                  <span className="text-sm font-bold text-[var(--accent-main)]">${terr.precioM2} USD / m²</span>
                                </div>
                              ) : null}
                              {selectedProperty.serviciosBasicos ? (
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Servicios Básicos</span>
                                  <span className="text-sm font-semibold text-right">{selectedProperty.serviciosBasicos}</span>
                                </div>
                              ) : null}
                              {terr?.radioUrbano ? (
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Zonificación</span>
                                  <span className="text-sm font-semibold text-right">{terr.radioUrbano}</span>
                                </div>
                              ) : null}
                              {terr?.coordenadasGps ? (
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Coordenadas</span>
                                  <span className="text-xs font-mono font-semibold">{terr.coordenadasGps}</span>
                                </div>
                              ) : null}
                            </>
                          );
                        })() : selectedProperty.type === "Comercial" ? (() => {
                          const com = parseComercialDetails(selectedProperty.datosEspecificosJson);
                          return (
                            <>
                              {selectedProperty.subtipoComercial ? (
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Subtipo Comercial</span>
                                  <span className="text-sm font-semibold">{selectedProperty.subtipoComercial}</span>
                                </div>
                              ) : null}
                              {com?.niveles ? (
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Niveles</span>
                                  <span className="text-sm font-semibold">{com.niveles} plantas + terraza</span>
                                </div>
                              ) : null}
                              {selectedProperty.superficieM2 ? (
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Construcción</span>
                                  <span className="text-sm font-semibold">{selectedProperty.superficieM2} m²</span>
                                </div>
                              ) : null}
                              {com?.superficieTerrenoM2 ? (
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Superficie Terreno</span>
                                  <span className="text-sm font-semibold">{com.superficieTerrenoM2} m²</span>
                                </div>
                              ) : null}
                              {com?.flujoVehicular ? (
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Flujo Vehicular</span>
                                  <span className="text-sm font-semibold text-[var(--accent-main)]">{com.flujoVehicular}</span>
                                </div>
                              ) : null}
                              {Number(selectedProperty.bathrooms) > 0 ? (
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Baños</span>
                                  <span className="text-sm font-semibold">{selectedProperty.bathrooms}</span>
                                </div>
                              ) : null}
                              {selectedProperty.serviciosBasicos ? (
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Instalaciones</span>
                                  <span className="text-xs font-semibold text-right">{selectedProperty.serviciosBasicos}</span>
                                </div>
                              ) : null}
                            </>
                          );
                        })() : selectedProperty.type === "Casa" ? (() => {
                          const casa = parseCasaDetails(selectedProperty.datosEspecificosJson);
                          return (
                            <>
                              {casa?.superficieTerrenoM2 || selectedProperty.superficieM2 ? (
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Superficie Terreno</span>
                                  <span className="text-sm font-semibold">{casa?.superficieTerrenoM2 || selectedProperty.superficieM2} m²</span>
                                </div>
                              ) : null}
                              {casa?.superficieConstruidaM2 ? (
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Construcción</span>
                                  <span className="text-sm font-semibold">{casa.superficieConstruidaM2} m²</span>
                                </div>
                              ) : null}
                              {casa?.tiendaCalleM2 ? (
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Tienda a la Calle</span>
                                  <span className="text-sm font-bold text-[var(--accent-main)]">{casa.tiendaCalleM2} m² (Independiente)</span>
                                </div>
                              ) : null}
                              <div className="flex justify-between items-center border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-3">
                                <span className="text-[var(--text-muted)] dark:text-[var(--text-muted)] flex items-center gap-3 text-sm"><Bed size={16}/> Ambientes</span>
                                <span className="text-[var(--text-main)] dark:text-[var(--text-main)] text-sm font-semibold leading-none">{casa?.ambientesTotales || selectedProperty.rooms}</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-3">
                                <span className="text-[var(--text-muted)] dark:text-[var(--text-muted)] flex items-center gap-3 text-sm"><Bath size={16}/> Baños</span>
                                <span className="text-[var(--text-main)] dark:text-[var(--text-main)] text-sm font-semibold leading-none">{casa?.banosTotales || selectedProperty.bathrooms}</span>
                              </div>
                              {casa?.patiosInternos ? (
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Patios Internos</span>
                                  <span className="text-sm font-semibold">{casa.patiosInternos}</span>
                                </div>
                              ) : null}
                              {casa?.cocinasIndependientes ? (
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Cocinas</span>
                                  <span className="text-sm font-semibold">{casa.cocinasIndependientes} independientes</span>
                                </div>
                              ) : null}
                            </>
                          );
                        })() : isProjectType(selectedProperty.type) ? (
                          <>
                            {selectedProperty.fechaEntrega ? (
                              <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                <span className="text-[var(--text-muted)] text-sm">Entrega Estimada</span>
                                <span className="text-sm font-semibold">{selectedProperty.fechaEntrega}</span>
                              </div>
                            ) : null}
                            {selectedProperty.avanceObra !== null && selectedProperty.avanceObra !== undefined ? (
                              <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                <span className="text-[var(--text-muted)] text-sm">Avance Obra</span>
                                <span className="text-sm font-semibold">{selectedProperty.avanceObra}%</span>
                              </div>
                            ) : null}
                            {selectedProperty.faseObra ? (
                              <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                <span className="text-[var(--text-muted)] text-sm">Fase</span>
                                <span className="text-sm font-semibold">{selectedProperty.faseObra}</span>
                              </div>
                            ) : null}
                            {selectedProperty.unidadesProyecto && selectedProperty.unidadesProyecto.length > 0 ? (
                              <>
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Tipologías</span>
                                  <span className="text-sm font-semibold">{selectedProperty.unidadesProyecto.length} opciones disponibles</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Superficie</span>
                                  <span className="text-sm font-semibold">
                                    {getProjectUnitsSummary(selectedProperty.unidadesProyecto).surfaceLabel || (selectedProperty.superficieM2 ? `${selectedProperty.superficieM2} m²` : "A consultar")}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                {Number(selectedProperty.rooms) > 0 ? (
                                  <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                    <span className="text-[var(--text-muted)] text-sm">Tipologias</span>
                                    <span className="text-sm font-semibold">{selectedProperty.rooms} dorm{selectedProperty.rooms === 1 ? "" : "s"}</span>
                                  </div>
                                ) : null}
                                {selectedProperty.superficieM2 ? (
                                  <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                    <span className="text-[var(--text-muted)] text-sm">Superficie</span>
                                    <span className="text-sm font-semibold">{selectedProperty.superficieM2} m²</span>
                                  </div>
                                ) : null}
                              </>
                            )}
                            {selectedProperty.pisos ? (
                              <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                <span className="text-[var(--text-muted)] text-sm">Pisos Edificio</span>
                                <span className="text-sm font-semibold">{selectedProperty.pisos} pisos</span>
                              </div>
                            ) : null}
                            {selectedProperty.totalUnidades ? (
                              <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                <span className="text-[var(--text-muted)] text-sm">Departamentos</span>
                                <span className="text-sm font-semibold">{selectedProperty.totalUnidades} unidades</span>
                              </div>
                            ) : null}
                            {selectedProperty.reservaUsd ? (
                              <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                <span className="text-[var(--text-muted)] text-sm">Monto Reserva</span>
                                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">${selectedProperty.reservaUsd.toLocaleString()} USD</span>
                              </div>
                            ) : null}
                            {selectedProperty.precioM2Desde ? (
                              <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                <span className="text-[var(--text-muted)] text-sm">Precio Desde</span>
                                <span className="text-sm font-bold text-[var(--accent-main)]">${selectedProperty.precioM2Desde.toLocaleString()} USD / m²</span>
                              </div>
                            ) : null}
                          </>
                        ) : (
                          /* Departamento */
                          (() => {
                            const depto = parseDepartamentoDetails(selectedProperty.datosEspecificosJson);
                            return (
                              <>
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-3">
                                   <span className="text-[var(--text-muted)] dark:text-[var(--text-muted)] flex items-center gap-3 text-sm"><Bed size={16}/> Habitaciones</span>
                                   <span className="text-[var(--text-main)] dark:text-[var(--text-main)] text-sm font-semibold leading-none">{selectedProperty.rooms} dorms</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-3">
                                   <span className="text-[var(--text-muted)] dark:text-[var(--text-muted)] flex items-center gap-3 text-sm"><Bath size={16}/> Baños</span>
                                   <span className="text-[var(--text-main)] dark:text-[var(--text-main)] text-sm font-semibold leading-none">{selectedProperty.bathrooms}</span>
                                </div>
                                {selectedProperty.superficieM2 ? (
                                  <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                    <span className="text-[var(--text-muted)] text-sm">Superficie</span>
                                    <span className="text-sm font-semibold">{selectedProperty.superficieM2} m²</span>
                                  </div>
                                ) : null}
                                {depto?.piso || selectedProperty.piso ? (
                                  <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                    <span className="text-[var(--text-muted)] text-sm">Piso / Nivel</span>
                                    <span className="text-sm font-semibold">Piso {depto?.piso || selectedProperty.piso}</span>
                                  </div>
                                ) : null}
                                <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                  <span className="text-[var(--text-muted)] text-sm">Amoblado</span>
                                  <span className="text-sm font-semibold">{selectedProperty.amoblado ? "Sí" : "No"}</span>
                                </div>
                                {depto?.aptoAirbnb ? (
                                  <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                    <span className="text-[var(--text-muted)] text-sm">Perfil Renta</span>
                                    <span className="text-sm font-bold text-[var(--accent-main)]">Apto Airbnb</span>
                                  </div>
                                ) : null}
                                {selectedDisplayOffer?.incluyeExpensas ? (
                                  <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                    <span className="text-[var(--text-muted)] text-sm">Expensas</span>
                                    <span className="text-sm font-semibold">Incluidas{selectedDisplayOffer.montoExpensas ? ` (${selectedDisplayOffer.montoExpensas})` : ""}</span>
                                  </div>
                                ) : null}
                                {selectedProperty.complejoNombre ? (
                                  <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-3">
                                    <span className="text-[var(--text-muted)] text-sm">Condominio</span>
                                    <span className="text-sm font-semibold">{selectedProperty.complejoNombre}</span>
                                  </div>
                                ) : null}
                              </>
                            );
                          })()
                        )}

                        {/* ASESOR CAPTADOR - EXCLUSIVO PARA USUARIOS CON ROL ASESOR O ADMIN */}
                        {canOpenAdvisor && (() => {
                          const captador = selectedDisplayOffer?.captador ||
                            selectedProperty.offers?.find(o => o.captador?.name)?.captador ||
                            selectedProperty.captador ||
                            (selectedProperty as any).captador;
                          const captadorName = captador?.name || selectedProperty.captadorNombre || (selectedProperty as any).captador_nombre;
                          if (!captadorName) return null;
                          const rawWa = captador?.whatsapp || selectedProperty.captadorWhatsapp || (selectedProperty as any).captador_whatsapp;
                          const captadorWa = rawWa && String(rawWa).includes("57015854") && !captadorName.toLowerCase().includes("alejandro coca") ? "" : rawWa;
                          const captadorOffice = captador?.oficina || selectedProperty.captadorOficina || (selectedProperty as any).captador_oficina;
                          return (
                            <div className="flex justify-between items-center border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-3 bg-[var(--surface-control)]/30 rounded p-2 my-1">
                              <span className="text-[var(--text-muted)] dark:text-[var(--text-muted)] flex items-center gap-2 text-sm">
                                <UserCircle size={16} /> Asesor Captador (Confidencial)
                              </span>
                              <div className="text-right">
                                <span className="text-[var(--text-main)] dark:text-[var(--text-main)] text-sm font-semibold block">
                                  {captadorName} {captadorWa ? `(+${String(captadorWa).replace(/^\+/, "")})` : ""}
                                </span>
                                {captadorOffice ? (
                                  <span className="text-xs text-[var(--accent-main)] font-medium block">
                                    {captadorOffice}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          );
                        })()}
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
