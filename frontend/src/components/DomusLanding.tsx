import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Download,
  ExternalLink,
  Eye,
  HardHat,
  Layers,
  MapPin,
  Maximize2,
  MessageCircle,
  Percent,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import {
  DOMUS_BASELINE_UNITS,
  DOMUS_PROJECTS_CONFIG,
  DomusProjectConfig,
  DomusUnit,
  fetchDomusLiveUnits,
  formatDomusUsd,
} from "../domusInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

const ALL_DOMUS_PROJECTS = [
  { id: "domus-black", label: "DOMUS BLACK", zone: "Equipetrol Norte" },
  { id: "domus-gold", label: "DOMUS GOLD", zone: "Equipetrol / San Martín" },
  { id: "domus-onix", label: "DOMUS ONIX", zone: "Av. Radial 23 & Sirari" },
  { id: "domus-insignia", label: "DOMUS INSIGNIA", zone: "Plaza Italia / Los Tajibos" },
  { id: "domus-luxury", label: "DOMUS LUXURY", zone: "Zona Norte / Las Brisas" },
  { id: "domus-tower", label: "DOMUS TOWER", zone: "Equipetrol Norte" },
  { id: "domus-infinity", label: "DOMUS INFINITY", zone: "Los Tajibos" },
];

export default function DomusLanding({ property, onClose }: Props) {
  // Determine default DOMUS project ID from property
  const initialProjectId = useMemo(() => {
    const raw = `${property.id} ${property.title || ""} ${property.complejoNombre || ""}`.toLowerCase();
    if (raw.includes("black")) return "domus-black";
    if (raw.includes("gold")) return "domus-gold";
    if (raw.includes("onix") || raw.includes("ónix")) return "domus-onix";
    if (raw.includes("insignia")) return "domus-insignia";
    if (raw.includes("luxury")) return "domus-luxury";
    if (raw.includes("tower")) return "domus-tower";
    if (raw.includes("infinity")) return "domus-infinity";
    return "domus-black";
  }, [property]);

  const [activeProjectId, setActiveProjectId] = useState<string>(initialProjectId);
  const projectConfig: DomusProjectConfig =
    DOMUS_PROJECTS_CONFIG[activeProjectId] || DOMUS_PROJECTS_CONFIG["domus-black"];

  // Units state for active project
  const [units, setUnits] = useState<DomusUnit[]>(() => DOMUS_BASELINE_UNITS[activeProjectId] || []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  // Left panel active scene & image
  const [activeImage, setActiveImage] = useState<string>(projectConfig.heroImage);
  const [activeLabel, setActiveLabel] = useState<string>("Fachada Principal");

  // Amenities Carousel index
  const [amenityIndex, setAmenityIndex] = useState(0);

  // Selector state
  const [selectedTypologyId, setSelectedTypologyId] = useState<string>("");
  const [selectedFloor, setSelectedFloor] = useState<number>(0);
  const [selectedUnitNumber, setSelectedUnitNumber] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<"contado" | "inicial60" | "inicial40">("contado");

  // Modal zoom for plans
  const [zoomPlanImage, setZoomPlanImage] = useState<string | null>(null);

  // Sync when activeProjectId changes
  useEffect(() => {
    const config = DOMUS_PROJECTS_CONFIG[activeProjectId];
    if (config) {
      setActiveImage(config.heroImage);
      setActiveLabel("Fachada Principal");
      setAmenityIndex(0);
      const baseUnits = DOMUS_BASELINE_UNITS[activeProjectId] || [];
      setUnits(baseUnits);

      // Fetch live sheet updates
      fetchDomusLiveUnits(activeProjectId).then((live) => {
        if (live && live.length > 0) {
          setUnits(live);
        }
      });
    }
  }, [activeProjectId]);

  // Set initial typology once units are loaded
  useEffect(() => {
    if (projectConfig.typologies.length > 0 && !selectedTypologyId) {
      const firstWithAvailable = projectConfig.typologies.find((t) => {
        return units.some((u) => u.rooms === t.rooms && u.status === "disponible");
      });
      setSelectedTypologyId(firstWithAvailable?.id || projectConfig.typologies[0].id);
    }
  }, [projectConfig, units, selectedTypologyId]);

  const activeTypology = useMemo(() => {
    return projectConfig.typologies.find((t) => t.id === selectedTypologyId) || projectConfig.typologies[0];
  }, [projectConfig, selectedTypologyId]);

  // Units for current typology
  const unitsForTypology = useMemo(() => {
    if (!activeTypology) return [];
    return units.filter((u) => u.rooms === activeTypology.rooms);
  }, [units, activeTypology]);

  // Distinct floors with availability indicator
  const floorsForTypology = useMemo(() => {
    const floorNums = Array.from(new Set(unitsForTypology.map((u) => u.floor))).sort((a, b) => a - b);
    return floorNums.map((floor) => {
      const unitsOnFloor = unitsForTypology.filter((u) => u.floor === floor);
      const availableCount = unitsOnFloor.filter((u) => u.status === "disponible").length;
      return {
        floor,
        floorLabel: unitsOnFloor[0]?.floorLabel || `Piso ${floor}`,
        totalCount: unitsOnFloor.length,
        availableCount,
        hasAvailable: availableCount > 0,
      };
    });
  }, [unitsForTypology]);

  // Auto-select floor when typology changes
  useEffect(() => {
    if (floorsForTypology.length === 0) return;
    const currentFloorItem = floorsForTypology.find((f) => f.floor === selectedFloor);
    if (!currentFloorItem || !currentFloorItem.hasAvailable) {
      const firstAvailable = floorsForTypology.find((f) => f.hasAvailable);
      if (firstAvailable) {
        setSelectedFloor(firstAvailable.floor);
      } else {
        setSelectedFloor(floorsForTypology[0].floor);
      }
    }
  }, [floorsForTypology, selectedFloor]);

  // Available units on selected floor
  const unitsOnSelectedFloor = useMemo(() => {
    return unitsForTypology.filter((u) => u.floor === selectedFloor);
  }, [unitsForTypology, selectedFloor]);

  // Auto-select unit on floor
  useEffect(() => {
    if (unitsOnSelectedFloor.length === 0) return;
    const currentUnit = unitsOnSelectedFloor.find((u) => u.unitNumber === selectedUnitNumber);
    if (!currentUnit || currentUnit.status !== "disponible") {
      const firstAvail = unitsOnSelectedFloor.find((u) => u.status === "disponible");
      if (firstAvail) {
        setSelectedUnitNumber(firstAvail.unitNumber);
      } else {
        setSelectedUnitNumber(unitsOnSelectedFloor[0].unitNumber);
      }
    }
  }, [unitsOnSelectedFloor, selectedUnitNumber]);

  // Active unit
  const activeUnit = useMemo(() => {
    return (
      unitsOnSelectedFloor.find((u) => u.unitNumber === selectedUnitNumber) ||
      unitsOnSelectedFloor[0] ||
      null
    );
  }, [unitsOnSelectedFloor, selectedUnitNumber]);

  // Calculations for active unit
  const financialSummary = useMemo(() => {
    if (!activeUnit) return null;
    let totalPrice = activeUnit.cashTotal;
    let initialPayment = activeUnit.cashTotal;
    let pricePerM2 = activeUnit.cashPerM2;
    let planLabel = "100% Contado";

    if (selectedPlan === "inicial60" && activeUnit.initial60Total) {
      totalPrice = activeUnit.initial60Total;
      pricePerM2 = activeUnit.initial60PerM2 || Math.round(totalPrice / activeUnit.areaM2);
      initialPayment = activeUnit.cuotaInicial60 || Math.round(totalPrice * 0.6);
      planLabel = "60% Inicial + Saldo a Entrega";
    } else if (selectedPlan === "inicial40" && activeUnit.initial40Total) {
      totalPrice = activeUnit.initial40Total;
      pricePerM2 = activeUnit.initial40PerM2 || Math.round(totalPrice / activeUnit.areaM2);
      initialPayment = activeUnit.cuotaInicial40 || Math.round(totalPrice * 0.4);
      planLabel = "40% Inicial + Saldo a Entrega";
    }

    // Plusvalía estimada a la entrega (valor estimado de mercado terminado en Equipetrol: $1.900/m²)
    const deliveryEstimatedM2 = 1900;
    const deliveryEstimatedValue = Math.round(activeUnit.areaM2 * deliveryEstimatedM2);
    const estimatedGain = Math.max(0, deliveryEstimatedValue - totalPrice);
    const estimatedGainPct = Math.round((estimatedGain / totalPrice) * 100);

    const rentEstimateUsd = Math.round(activeUnit.areaM2 * 14.5);
    const rentEstimateRange = `USD ${Math.round(rentEstimateUsd * 0.9)} – ${Math.round(rentEstimateUsd * 1.15)} / mes`;
    const rentYield = Math.round(((rentEstimateUsd * 12) / totalPrice) * 1000) / 10;

    return {
      totalPrice,
      pricePerM2,
      initialPayment,
      planLabel,
      deliveryEstimatedValue,
      estimatedGain,
      estimatedGainPct,
      rentEstimateRange,
      rentYield,
    };
  }, [activeUnit, selectedPlan]);

  // Counts
  const totalUnitsCount = units.length;
  const availableUnitsCount = units.filter((u) => u.status === "disponible").length;
  const soldUnitsCount = units.filter((u) => u.status === "vendido").length;
  const reservedUnitsCount = units.filter((u) => u.status === "reservado").length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const live = await fetchDomusLiveUnits(activeProjectId);
      if (live && live.length > 0) {
        setUnits(live);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/?proyecto=${activeProjectId}`;
    const shareTitle = `${projectConfig.name} · Preventa en ${projectConfig.zone}`;
    const shareText = `Departamentos en Preventa en ${projectConfig.name} (${projectConfig.zone}) desde $${formatDomusUsd(projectConfig.priceFromUsd)} USD. Conoce la disponibilidad:`;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2500);
    } catch {}
  };

  // Section Refs for Scroll Spy
  const introRef = useRef<HTMLElement>(null);
  const placeRef = useRef<HTMLElement>(null);
  const amenitiesRef = useRef<HTMLElement>(null);
  const typesRef = useRef<HTMLElement>(null);
  const payRef = useRef<HTMLElement>(null);
  const investorRef = useRef<HTMLElement>(null);
  const disponibilidadRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLElement>(null);

  // Dynamic scenes matching project config
  const scenes = useMemo<Record<string, { src: string; label: string }>>(() => {
    const hero = projectConfig.heroImage;
    const g = projectConfig.galleryImages || [];
    return {
      intro: { src: hero, label: "Fachada Principal" },
      lugar: { src: g[1] || hero, label: "Entorno & Ubicación" },
      amenidades: { src: projectConfig.amenities[0]?.image || g[2] || hero, label: "Áreas Sociales" },
      tipologias: { src: projectConfig.typologies[0]?.planImage || g[3] || hero, label: "Tipologías" },
      pago: { src: g[4] || hero, label: "Formas de Pago" },
      inversion: { src: g[0] || hero, label: "Rentabilidad & Plusvalía" },
      disponibilidad: { src: g[1] || hero, label: "Disponibilidad" },
      cierre: { src: hero, label: "Contacto & Reserva" },
    };
  }, [projectConfig]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const scene = visible ? scenes[visible.target.id] : undefined;
        if (!scene) return;
        setActiveImage(scene.src);
        setActiveLabel(scene.label);
      },
      { threshold: [0.22, 0.5] }
    );

    [introRef, placeRef, amenitiesRef, typesRef, payRef, investorRef, disponibilidadRef, closeRef].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [scenes]);

  const phone =
    (property.agentWhatsapp || CONTACT_WHATSAPP_NUMBER).replace(/\D/g, "") ||
    CONTACT_WHATSAPP_NUMBER;

  const reserve = (messageText: string, budget?: number) => {
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: activeProjectId,
      operacion: "Preventa",
      zona: projectConfig.zone,
      presupuesto: budget ? `USD ${formatDomusUsd(budget)}` : `desde USD ${formatDomusUsd(projectConfig.priceFromUsd)}`,
    }).catch(() => {});

    if (typeof window !== "undefined") {
      try {
        (window as any).fbq?.("track", "Lead", {
          content_name: projectConfig.name,
          content_category: "Preventa Inmobiliaria",
          value: budget || projectConfig.priceFromUsd,
          currency: "USD",
        });
      } catch {}
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`, "_blank", "noopener,noreferrer");
  };

  const currentAmenity = projectConfig.amenities[amenityIndex] || projectConfig.amenities[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-[#fbfaf8] text-stone-800 font-sans overflow-hidden"
    >
      {/* PANEL IZQUIERDO: Visual Editorial Interactivo (Desktop fijo / Mobile top) */}
      <div className="w-full md:w-[48%] lg:w-[50%] shrink-0 h-[42vh] md:h-screen relative overflow-hidden bg-stone-950">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage + activeProjectId}
            src={activeImage}
            alt={`${projectConfig.name} - ${activeLabel}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            className="h-full w-full object-cover object-center"
          />
        </AnimatePresence>

        {/* Gradiente cinemático de protección de textos */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20" />

        {/* Información Editorial sobre la imagen izquierda */}
        <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-between pointer-events-none">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-black/60 px-3.5 py-1 text-[11px] font-semibold tracking-wider text-amber-200/90 backdrop-blur-md border border-white/10 uppercase">
              {projectConfig.developer} · {activeLabel}
            </span>
          </div>

          <div className="space-y-3">
            <div className="inline-block rounded-md bg-[#8a6d3b]/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              {projectConfig.delivery}
            </div>

            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight drop-shadow-md">
              {projectConfig.name}
            </h1>

            <p className="max-w-md text-sm md:text-base text-stone-200/90 font-light leading-relaxed drop-shadow line-clamp-2 md:line-clamp-none">
              {projectConfig.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] md:text-xs text-stone-300 font-light">
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                Torre de {projectConfig.floorsCount} Niveles
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                {projectConfig.zone}
              </span>
              <span className="rounded-full bg-[#8a6d3b]/30 text-amber-200 px-3 py-1 backdrop-blur-sm border border-amber-400/20 font-medium">
                Desde USD {formatDomusUsd(projectConfig.priceFromUsd)}
              </span>
            </div>

            {/* Accesos rápidos de escena (Desktop) */}
            <div className="hidden lg:flex items-center gap-1.5 pt-3 pointer-events-auto">
              {Object.entries(scenes).map(([key, s]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(key);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider transition cursor-pointer backdrop-blur-md ${
                    activeImage === s.src
                      ? "bg-[#8a6d3b] text-white font-semibold shadow-sm"
                      : "bg-black/40 text-stone-300 hover:bg-black/60 border border-white/10"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO: Contenido Editorial y Tesis del Inversor */}
      <div className="relative min-h-0 flex-1 md:h-screen md:overflow-y-auto">
        <div className="mx-auto max-w-xl px-5 py-8 pb-32 md:px-10 md:py-14">

          {/* BOTONES SUPERIORES: Brochure, Compartir y Cerrar */}
          <div className="flex items-center justify-end gap-2 mb-6">
            <button
              onClick={() => {
                reserve(
                  `Hola Alejandro, me interesa recibir el dossier completo y brochure oficial en PDF de ${projectConfig.name} (${projectConfig.zone}).`,
                  projectConfig.priceFromUsd
                );
              }}
              className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm backdrop-blur hover:bg-stone-50 transition cursor-pointer"
            >
              <Download size={14} className="text-[#8a6d3b]" />
              <span className="text-[11px] uppercase tracking-wider font-semibold">Brochure</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm backdrop-blur hover:bg-stone-50 transition cursor-pointer"
            >
              <Share2 size={14} className="text-[#8a6d3b]" />
              <span className="text-[11px] uppercase tracking-wider font-semibold">
                {shareFeedback ? "¡Copiado!" : "Compartir"}
              </span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white/90 text-stone-700 shadow-sm backdrop-blur hover:bg-stone-100 transition cursor-pointer"
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* SELECTOR DE PROYECTOS DE LA COLECCIÓN DOMUS */}
          <div className="mb-8 rounded-2xl border border-stone-200/80 bg-[#f7f4ed] p-3 shadow-xs">
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[#8a6d3b] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8a6d3b]" />
                Colección Domus · Alborada Group
              </p>
              <span className="text-[10px] text-stone-500 font-light">7 Proyectos Activos</span>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {ALL_DOMUS_PROJECTS.map((p) => {
                const isSelected = p.id === activeProjectId;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProjectId(p.id);
                      setSelectedTypologyId("");
                      setSelectedFloor(0);
                      setSelectedUnitNumber("");
                    }}
                    className={`flex-shrink-0 rounded-xl px-3 py-1.5 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#8a6d3b] text-white shadow-sm font-medium"
                        : "bg-white/80 border border-stone-200/70 text-stone-600 hover:bg-white hover:text-stone-900"
                    }`}
                  >
                    <p className="text-[11px] font-semibold tracking-wide whitespace-nowrap">{p.label}</p>
                    <p className={`text-[9px] truncate max-w-[110px] ${isSelected ? "text-amber-100" : "text-stone-400"}`}>
                      {p.zone}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1. HERO / INTRODUCCIÓN EDITORIAL */}
          <section id="intro" ref={introRef} className="scroll-mt-6">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-[#8a6d3b]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#8a6d3b]">
                {projectConfig.developer} · {projectConfig.zone}
              </p>
            </div>

            <h2 className="mt-3 font-serif text-3xl font-light leading-snug text-stone-900 md:text-5xl">
              {projectConfig.name}. <br />
              <span className="italic font-normal text-[#8a6d3b]">
                {projectConfig.tagline}
              </span>
            </h2>

            <p className="mt-5 text-[15px] font-light leading-relaxed text-stone-600 md:text-base [text-align:justify] [text-justify:inter-word]">
              {projectConfig.name} representa la excelencia arquitectónica contemporánea de Alborada Group en Santa Cruz. Ubicado estratégicamente en <strong>{projectConfig.zone}</strong>, combina terminaciones de categoría europea, áreas sociales panorámicas en altura y tipologías optimizadas concebidas tanto para vivienda de primer nivel como para maximizar retornos por alquiler temporal o tradicional en dólares.
            </p>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-white/70 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8a6d3b]/10 text-[#8a6d3b]">
                  <HardHat size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-[#8a6d3b]">
                    {projectConfig.delivery}
                  </p>
                  <p className="text-sm font-medium text-stone-800">
                    {soldUnitsCount + reservedUnitsCount} unidades comercializadas de {totalUnitsCount} en esta torre de {projectConfig.floorsCount} niveles.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 2. UBICACIÓN & ENTORNO */}
          <section id="lugar" ref={placeRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#8a6d3b]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#8a6d3b]">
                Ubicación & Conectividad
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Ubicación privilegiada en {projectConfig.zone}.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Conectividad inmediata a centros comerciales, sedes corporativas, hoteles de clase mundial y la oferta gastronómica más cotizada de Santa Cruz de la Sierra.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-100">
                <img
                  src={projectConfig.galleryImages[1] || projectConfig.heroImage}
                  alt={`Ubicación ${projectConfig.name}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-4 left-4 rounded-full bg-stone-900/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {projectConfig.zone}
                </div>
              </div>

              <div className="p-5 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-serif text-lg text-stone-900 font-medium">
                      {projectConfig.address}
                    </p>
                    <p className="text-xs text-stone-500 font-light mt-0.5">
                      {projectConfig.city}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${projectConfig.lat},${projectConfig.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#8a6d3b] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-[#6c5328] transition shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <ExternalLink size={13} />
                    <span>Ver en Google Maps</span>
                  </a>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-stone-600 font-light border-t border-stone-100 pt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8a6d3b]" />
                    <span>Ventura Mall & Boulevard</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8a6d3b]" />
                    <span>Hotel Los Tajibos & Marriott</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8a6d3b]" />
                    <span>Torre Empresarial Platinum</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8a6d3b]" />
                    <span>Green Tower & Centro Empresarial</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. ÁREAS SOCIALES & AMENIDADES EXCLUSIVAS */}
          <section id="amenidades" ref={amenitiesRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#8a6d3b]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#8a6d3b]">
                Áreas Sociales & Club Privado
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Amenities panorámicos concebidos para un estilo de vida superior.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Espacios comunes climatizados y al aire libre para disfrutar, entrenar y recibir visitas con total privacidad y confort.
            </p>

            {/* CARRUSEL INTERACTIVO CON FOTOS OFICIALES */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900 sm:aspect-[16/9]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentAmenity.name + activeProjectId}
                    src={currentAmenity.image || projectConfig.heroImage}
                    alt={currentAmenity.name}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="h-full w-full object-cover"
                  />
                </AnimatePresence>

                {/* Controles de Navegación del Carrusel */}
                <div className="absolute inset-0 flex items-center justify-between p-3 pointer-events-none">
                  <button
                    type="button"
                    onClick={() =>
                      setAmenityIndex((prev) =>
                        prev === 0 ? projectConfig.amenities.length - 1 : prev - 1
                      )
                    }
                    className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 hover:bg-black/80 transition cursor-pointer"
                    aria-label="Amenity anterior"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAmenityIndex((prev) =>
                        prev === projectConfig.amenities.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 hover:bg-black/80 transition cursor-pointer"
                    aria-label="Amenity siguiente"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/10">
                  {amenityIndex + 1} / {projectConfig.amenities.length}
                </div>
              </div>

              {/* Ficha descriptiva del Amenity activo */}
              <div className="p-6 md:p-7">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-[#8a6d3b]/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#8a6d3b]">
                    {currentAmenity.category}
                  </span>
                  <p className="text-xs text-stone-400 font-light">
                    Uso Exclusivo Residentes {projectConfig.name}
                  </p>
                </div>

                <h3 className="mt-2.5 font-serif text-2xl font-normal text-stone-900">
                  {currentAmenity.name}
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
                  {currentAmenity.description}
                </p>

                {/* Miniaturas de selección directa */}
                <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-stone-100 pt-4">
                  {projectConfig.amenities.map((item, idx) => (
                    <button
                      key={item.name + idx}
                      type="button"
                      onClick={() => setAmenityIndex(idx)}
                      className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer ${
                        amenityIndex === idx
                          ? "border-[#8a6d3b] shadow-md scale-105"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={item.image || projectConfig.heroImage}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 4. TIPOLOGÍAS & MODELOS */}
          <section id="tipologias" ref={typesRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-[#8a6d3b]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#8a6d3b]">
                Modelos de Departamento
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Modelos concebidos para optimizar cada metro cuadrado.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Desde monoambientes inteligentes pensados para alta rentabilidad en Airbnb hasta departamentos familiares de 2 y 3 dormitorios con amplios balcones.
            </p>

            <div className="mt-8 space-y-10">
              {projectConfig.typologies.map((tipo) => (
                <article
                  key={tipo.id}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md transition-shadow hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 sm:aspect-[16/10] p-4 flex items-center justify-center">
                    <img
                      src={tipo.planImage || projectConfig.heroImage}
                      alt={`Plano renderizado de tipología ${tipo.name}`}
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="absolute top-4 left-4 rounded-full bg-stone-900/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      {tipo.areaRange}
                    </div>
                    {tipo.planImage && (
                      <button
                        type="button"
                        onClick={() => setZoomPlanImage(tipo.planImage || null)}
                        className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur border border-white/15 hover:bg-black transition cursor-pointer"
                      >
                        <Maximize2 size={13} />
                        <span>Ver Plano en HD</span>
                      </button>
                    )}
                  </div>

                  <div className="p-6 md:p-7">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-serif text-2xl font-normal text-stone-900">
                        {tipo.name}
                      </h3>
                      <p className="text-sm font-semibold uppercase tracking-wider text-[#8a6d3b]">
                        Desde ${formatDomusUsd(tipo.cashFrom)} USD
                      </p>
                    </div>

                    <p className="mt-2 text-sm font-light text-stone-600 leading-relaxed [text-align:justify] [text-justify:inter-word]">
                      {tipo.description}
                    </p>

                    <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-md bg-[#faf8f5] px-3 py-1 text-xs font-medium text-[#6c5328] border border-stone-200">
                      <CheckCircle2 size={13} /> {tipo.rooms === 0 ? "Monoambiente" : `${tipo.rooms} Dormitorio${tipo.rooms > 1 ? "s" : ""}`}
                    </div>

                    <div className="mt-5 border-t border-stone-100 pt-4">
                      <p className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                        Lo que incluye tu departamento:
                      </p>
                      <ul className="mt-2.5 space-y-2 text-xs font-light text-stone-700">
                        {tipo.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#8a6d3b] shrink-0" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100 pt-5">
                      <div>
                        <p className="text-xs text-stone-400 font-light">Precio Contado desde:</p>
                        <p className="font-serif text-2xl font-normal text-stone-900">
                          ${formatDomusUsd(tipo.cashFrom)}{" "}
                          <span className="text-xs font-sans text-stone-500 font-light">USD</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTypologyId(tipo.id);
                          const el = document.getElementById("disponibilidad");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="w-full sm:w-auto rounded-full bg-[#8a6d3b] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-[#6c5328] transition cursor-pointer text-center"
                      >
                        Ver Unidades en Simulador
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* 5. FORMAS DE PAGO & PLANES DE FINANCIACIÓN */}
          <section id="pago" ref={payRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-[#8a6d3b]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#8a6d3b]">
                Financiación Flexible
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Planes a tu medida para comprar o invertir en preventa.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Asegura tu departamento con precios preferenciales de preventa mediante esquemas al contado con descuento o cuotas programadas.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-5">
              {/* Opción 1: Contado */}
              <div className="rounded-2xl border-2 border-[#8a6d3b] bg-white p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#8a6d3b] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                  Recomendado Inversores
                </div>
                <p className="text-xs uppercase tracking-wider font-semibold text-[#8a6d3b]">
                  Modalidad 1
                </p>
                <h3 className="mt-1 font-serif text-2xl text-stone-900">
                  Plan 100% Contado
                </h3>
                <p className="mt-2 text-sm text-stone-600 font-light leading-relaxed">
                  Accedes al valor por m² más competitivo de {projectConfig.name} (${projectConfig.pricePerM2Cash} USD/m²). Descuento inmediato y mayor margen de plusvalía a la entrega.
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-serif text-3xl text-stone-900 font-medium">${projectConfig.pricePerM2Cash}</span>
                  <span className="text-xs text-stone-500 uppercase tracking-wider">USD / m² contado</span>
                </div>
              </div>

              {/* Opción 2: 60% Inicial */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-wider font-semibold text-stone-500">
                  Modalidad 2
                </p>
                <h3 className="mt-1 font-serif text-2xl text-stone-900">
                  Plan 60% Inicial + Saldo a Entrega
                </h3>
                <p className="mt-2 text-sm text-stone-600 font-light leading-relaxed">
                  Entrega el 60% a la firma del contrato privado y el saldo restante del 40% contra entrega definitiva de llaves del departamento.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-stone-600">
                  <span className="font-semibold text-stone-900">60% firma</span>
                  <span>•</span>
                  <span className="font-semibold text-stone-900">40% contra entrega</span>
                </div>
              </div>

              {/* Opción 3: 40% Inicial */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-wider font-semibold text-stone-500">
                  Modalidad 3
                </p>
                <h3 className="mt-1 font-serif text-2xl text-stone-900">
                  Plan 40% Inicial + Saldo a Entrega
                </h3>
                <p className="mt-2 text-sm text-stone-600 font-light leading-relaxed">
                  La barrera de entrada más accesible para asegurar tu unidad en preventa y financiar el saldo mediante crédito hipotecario bancario o fondos propios.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-stone-600">
                  <span className="font-semibold text-stone-900">40% cuota inicial</span>
                  <span>•</span>
                  <span className="font-semibold text-stone-900">60% contra entrega / crédito</span>
                </div>
              </div>
            </div>
          </section>

          {/* 6. RENTABILIDAD & PLUSVALÍA EN EQUIPETROL */}
          <section id="inversion" ref={investorRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#8a6d3b]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#8a6d3b]">
                Rentabilidad & Plusvalía
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Por qué invertir en {projectConfig.name} es una decisión rentable y segura.
            </h2>
            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              {projectConfig.zone} concentra la mayor demanda corporativa y turística de Santa Cruz. Comprar a precio de preventa (${projectConfig.pricePerM2Cash} USD/m²) frente al precio de venta terminado en la zona genera una ganancia inmediata de capital acumulada a la entrega.
            </p>

            <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#8a6d3b]/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#6c5328]">
                  Diferencial Financiero
                </span>
              </div>
              <h3 className="mt-2 font-serif text-2xl text-stone-900">
                Alta plusvalía proyectada y retorno en dólares.
              </h3>
              <p className="mt-2 text-xs text-stone-600 font-light leading-relaxed [text-align:justify] [text-justify:inter-word]">
                El respaldo de Alborada Group con más de 7 torres consolidadas garantiza calidad de ejecución y entrega. El inversor ingresa en el punto óptimo de valorización, permitiendo vender con alta ganancia a la entrega o generar ingresos por alquiler de hasta USD 1.200 mensuales.
              </p>

              <div className="mt-5 rounded-xl border-2 border-[#8a6d3b] bg-[#fbf8f2] p-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#8a6d3b] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-bl-lg">
                  Plusvalía Domus
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6c5328]">
                    {projectConfig.name} · {projectConfig.zone}
                  </p>
                  <p className="font-serif text-2xl text-stone-900 font-medium">
                    ${projectConfig.pricePerM2Cash} <span className="text-xs font-sans text-stone-500">USD/m²</span>
                  </p>
                </div>
                <ul className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-800 font-light border-t border-[#8a6d3b]/20 pt-3">
                  <li>• Entrada departamento: <strong className="text-stone-900 block mt-0.5">Desde USD {formatDomusUsd(projectConfig.priceFromUsd)}</strong></li>
                  <li>• Retorno anual por renta: <strong className="text-[#6c5328] block mt-0.5">9,5% – 11,0% en USD</strong></li>
                  <li>• Plusvalía a la entrega: <strong className="text-stone-900 block mt-0.5">+25% a +35% proyectada</strong></li>
                </ul>
              </div>
            </div>
          </section>

          {/* 7. DISPONIBILIDAD & SIMULADOR EN TIEMPO REAL */}
          <section id="disponibilidad" ref={disponibilidadRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-[#8a6d3b]" />
                <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#8a6d3b]">
                  Disponibilidad en Vivo
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {availableUnitsCount} Disponibles
                </span>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 hover:text-stone-900 transition disabled:opacity-50 cursor-pointer"
                  title="Sincronizar con Google Sheets"
                >
                  <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Simulador interactivo y reserva por unidad.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Consulta en tiempo real el precio exacto, la cuota inicial y el estado de cada departamento en {projectConfig.name}.
            </p>

            {/* PASO 1: SELECCIONAR TIPOLOGÍA */}
            <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                Paso 1: Selecciona la tipología deseada
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {projectConfig.typologies.map((t) => {
                  const isSelected = selectedTypologyId === t.id;
                  const countForType = units.filter((u) => u.rooms === t.rooms && u.status === "disponible").length;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTypologyId(t.id);
                        setSelectedFloor(0);
                        setSelectedUnitNumber("");
                      }}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs transition cursor-pointer ${
                        isSelected
                          ? "bg-[#8a6d3b] text-white shadow-md font-semibold"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      <span>{t.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? "bg-white/20" : "bg-white text-stone-600"}`}>
                        {countForType} disp.
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PASO 2: SELECCIONAR PISO */}
            {floorsForTypology.length > 0 && (
              <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                    Paso 2: Selecciona el piso
                  </p>
                  <span className="text-xs text-stone-500 font-light">
                    {floorsForTypology.filter((f) => f.hasAvailable).length} pisos con disponibilidad
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                  {floorsForTypology.map((f) => {
                    const isSelected = selectedFloor === f.floor;
                    return (
                      <button
                        key={f.floor}
                        type="button"
                        onClick={() => setSelectedFloor(f.floor)}
                        disabled={!f.hasAvailable}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs transition cursor-pointer ${
                          isSelected
                            ? "bg-[#8a6d3b] text-white shadow font-semibold"
                            : f.hasAvailable
                            ? "bg-stone-100 text-stone-800 hover:bg-stone-200"
                            : "bg-stone-100 text-stone-400 line-through opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <span>{f.floorLabel}</span>
                        {f.hasAvailable && (
                          <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PASO 3: SELECCIONAR UNIDAD Y PLAN */}
            {unitsOnSelectedFloor.length > 0 && (
              <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                  Paso 3: Selecciona la unidad específica
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {unitsOnSelectedFloor.map((u) => {
                    const isSelected = selectedUnitNumber === u.unitNumber;
                    const isAvail = u.status === "disponible";
                    return (
                      <button
                        key={u.unitNumber}
                        type="button"
                        onClick={() => isAvail && setSelectedUnitNumber(u.unitNumber)}
                        disabled={!isAvail}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs transition cursor-pointer ${
                          isSelected
                            ? "bg-[#8a6d3b] text-white shadow-md font-semibold"
                            : isAvail
                            ? "bg-stone-100 text-stone-800 hover:bg-stone-200"
                            : "bg-stone-100 text-stone-400 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <span>Dpto {u.unitNumber}</span>
                        <span className="text-[10px] opacity-75">{u.areaM2} m²</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full uppercase ${
                          isAvail ? (isSelected ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800") : "bg-stone-200 text-stone-500"
                        }`}>
                          {u.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DETALLE Y SIMULADOR FINANCIERO DE LA UNIDAD SELECCIONADA */}
            {activeUnit && financialSummary && (
              <div className="mt-6 rounded-2xl border-2 border-[#8a6d3b] bg-white p-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-4">
                  <div>
                    <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800">
                      Disponible para Reserva Inmediata
                    </span>
                    <h3 className="mt-2 font-serif text-2xl text-stone-900 font-medium">
                      Unidad {activeUnit.unitNumber} · {activeUnit.floorLabel}
                    </h3>
                    <p className="text-xs text-stone-500 font-light">
                      {activeTypology?.name} · {activeUnit.areaM2} m² propios
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-stone-400 font-light">Precio Total:</p>
                    <p className="font-serif text-3xl text-stone-900 font-medium">
                      ${formatDomusUsd(financialSummary.totalPrice)}{" "}
                      <span className="text-xs font-sans text-stone-500 font-light">USD</span>
                    </p>
                  </div>
                </div>

                {/* MODALIDAD DE PAGO EN EL SIMULADOR */}
                <div className="mt-5">
                  <p className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                    Selecciona modalidad de pago:
                  </p>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlan("contado")}
                      className={`rounded-xl p-3 text-left border transition cursor-pointer ${
                        selectedPlan === "contado"
                          ? "border-[#8a6d3b] bg-[#fbf8f2] shadow-sm"
                          : "border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <p className="text-xs font-semibold text-stone-900">100% Contado</p>
                      <p className="text-[11px] text-[#8a6d3b] font-medium mt-0.5">
                        ${activeUnit.cashPerM2} USD/m²
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPlan("inicial60")}
                      className={`rounded-xl p-3 text-left border transition cursor-pointer ${
                        selectedPlan === "inicial60"
                          ? "border-[#8a6d3b] bg-[#fbf8f2] shadow-sm"
                          : "border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <p className="text-xs font-semibold text-stone-900">60% Inicial</p>
                      <p className="text-[11px] text-[#8a6d3b] font-medium mt-0.5">
                        40% a la Entrega
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPlan("inicial40")}
                      className={`rounded-xl p-3 text-left border transition cursor-pointer ${
                        selectedPlan === "inicial40"
                          ? "border-[#8a6d3b] bg-[#fbf8f2] shadow-sm"
                          : "border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <p className="text-xs font-semibold text-stone-900">40% Inicial</p>
                      <p className="text-[11px] text-[#8a6d3b] font-medium mt-0.5">
                        60% a la Entrega
                      </p>
                    </button>
                  </div>
                </div>

                {/* DESGLOSE FINANCIERO */}
                <div className="mt-5 rounded-xl bg-stone-50 p-4 border border-stone-200/70">
                  <div className="grid grid-cols-2 gap-3 text-xs text-stone-700">
                    <div>
                      <span className="text-stone-400 block text-[11px]">Cuota Inicial Requerida:</span>
                      <strong className="text-sm font-semibold text-stone-900">
                        USD {formatDomusUsd(financialSummary.initialPayment)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[11px]">Renta Estimada en USD:</span>
                      <strong className="text-sm font-semibold text-[#8a6d3b]">
                        {financialSummary.rentEstimateRange}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* BOTÓN DIRECTO DE RESERVA POR WHATSAPP */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-100 pt-5">
                  <div className="text-xs text-stone-500 font-light">
                    <p>Reserva Unidad {activeUnit.unitNumber} en {activeUnit.floorLabel}.</p>
                    <p className="text-[11px] text-stone-400">Precio oficial congelado con firma de contrato Alborada Group.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      reserve(
                        `Hola Alejandro, vengo de la web N.I.A y deseo reservar información directa para ${projectConfig.name}:
- Unidad: Dpto ${activeUnit.unitNumber} (${activeUnit.floorLabel}, ${activeUnit.areaM2} m²)
- Tipología: ${activeTypology?.name || ""}
- Modalidad: ${financialSummary.planLabel}
- Precio Total: $${formatDomusUsd(financialSummary.totalPrice)} USD
¿Podrías confirmarme el procedimiento de reserva y disponibilidad actualizada?`,
                        financialSummary.totalPrice
                      );
                    }}
                    className="w-full sm:w-auto rounded-full bg-[#8a6d3b] px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white shadow-xl hover:bg-[#6c5328] active:scale-95 transition cursor-pointer text-center"
                  >
                    Reservar Unidad por WhatsApp
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* 8. CIERRE & AGENDAR VISITA A OBRA */}
          <section id="cierre" ref={closeRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10 text-center">
            <span className="rounded-full bg-[#8a6d3b]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#8a6d3b] inline-flex items-center gap-1.5">
              <Calendar size={14} />
              Atención Personalizada
            </span>

            <h2 className="mt-4 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Agenda una visita al anteproyecto o showroom
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm font-light text-stone-600 leading-relaxed">
              Te asesoramos para comparar unidades, simular planes de pago a medida y revisar la documentación legal antes de tomar tu decisión.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  reserve(
                    `Hola Alejandro, deseo agendar una visita informativa para conocer el proyecto ${projectConfig.name} en ${projectConfig.zone}.`,
                    projectConfig.priceFromUsd
                  );
                }}
                className="w-full sm:w-auto rounded-full bg-[#8a6d3b] px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:bg-[#6c5328] transition cursor-pointer"
              >
                Agendar Cita por WhatsApp
              </button>
              <button
                type="button"
                onClick={() => {
                  reserve(
                    `Hola Alejandro, por favor envíame el brochure oficial y la lista de acabados de ${projectConfig.name}.`,
                    projectConfig.priceFromUsd
                  );
                }}
                className="w-full sm:w-auto rounded-full border border-stone-300 bg-white px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-700 hover:bg-stone-50 transition cursor-pointer"
              >
                Solicitar Dossier Completo
              </button>
            </div>

            <p className="mt-8 text-xs text-stone-400 font-light">
              {projectConfig.name} · {projectConfig.address} · {projectConfig.city} · Gestión Inmobiliaria N.I.A
            </p>
          </section>

        </div>
      </div>

      {/* MODAL DE ZOOM DE PLANO EN ALTA RESOLUCIÓN */}
      <AnimatePresence>
        {zoomPlanImage && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="relative max-h-[92vh] max-w-5xl w-full overflow-hidden rounded-3xl border border-stone-700 bg-white p-4">
              <button
                type="button"
                onClick={() => setZoomPlanImage(null)}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white hover:bg-[#8a6d3b] transition cursor-pointer"
              >
                <X size={20} />
              </button>
              <div className="max-h-[82vh] overflow-auto flex items-center justify-center p-2">
                <img
                  src={zoomPlanImage}
                  alt="Plano arquitectónico ampliado"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
