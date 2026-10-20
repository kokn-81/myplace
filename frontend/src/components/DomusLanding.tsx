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
  ExternalLink,
  Eye,
  Layers,
  MapPin,
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
  const projectConfig: DomusProjectConfig = DOMUS_PROJECTS_CONFIG[activeProjectId] || DOMUS_PROJECTS_CONFIG["domus-black"];

  // Units state for active project
  const [units, setUnits] = useState<DomusUnit[]>(() => DOMUS_BASELINE_UNITS[activeProjectId] || []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  // Gallery
  const [activeImage, setActiveImage] = useState<string>(projectConfig.heroImage);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Selector state
  const [selectedTypologyId, setSelectedTypologyId] = useState<string>("");
  const [selectedFloor, setSelectedFloor] = useState<number>(0);
  const [selectedUnitNumber, setSelectedUnitNumber] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<"contado" | "inicial60" | "inicial40">("contado");

  // Sync when activeProjectId changes
  useEffect(() => {
    const config = DOMUS_PROJECTS_CONFIG[activeProjectId];
    if (config) {
      setActiveImage(config.heroImage);
      setActiveImageIndex(0);
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
      // Find typology with available units
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

    // Plusvalía estimada a la entrega (valor estimado de mercado terminado en Equipetrol: $1.850/m²)
    const deliveryEstimatedM2 = 1850;
    const deliveryEstimatedValue = Math.round(activeUnit.areaM2 * deliveryEstimatedM2);
    const estimatedGain = Math.max(0, deliveryEstimatedValue - totalPrice);
    const estimatedGainPct = Math.round((estimatedGain / totalPrice) * 100);

    return {
      totalPrice,
      pricePerM2,
      initialPayment,
      planLabel,
      deliveryEstimatedValue,
      estimatedGain,
      estimatedGainPct,
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

  const handleWhatsAppReservation = () => {
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: activeProjectId,
      operacion: "Preventa",
      zona: projectConfig.zone,
    }).catch(() => {});

    const phone = (property.agentWhatsapp || CONTACT_WHATSAPP_NUMBER).replace(/\D/g, "") || CONTACT_WHATSAPP_NUMBER;
    const planText = financialSummary?.planLabel || "100% Contado";
    const unitText = activeUnit ? `Dpto ${activeUnit.unitNumber} (${activeUnit.floorLabel}, ${activeUnit.areaM2} m²)` : "una unidad";
    const priceText = financialSummary ? `$${formatDomusUsd(financialSummary.totalPrice)} USD` : "";

    const text = `Hola Alejandro, vengo de la plataforma de N.I.A y deseo reservar información directa para ${projectConfig.name}:
- Unidad: ${unitText}
- Tipología: ${activeTypology?.name || ""}
- Modalidad: ${planText}
- Precio: ${priceText}
¿Podrías confirmarme el procedimiento de reserva y la documentación del anteproyecto?`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const allDomusProjects = [
    { id: "domus-black", label: "DOMUS BLACK", zone: "Equipetrol Norte" },
    { id: "domus-gold", label: "DOMUS GOLD", zone: "Equipetrol / San Martín" },
    { id: "domus-onix", label: "DOMUS ONIX", zone: "Av. Radial 23 & Sirari" },
    { id: "domus-insignia", label: "DOMUS INSIGNIA", zone: "Plaza Italia / Los Tajibos" },
    { id: "domus-luxury", label: "DOMUS LUXURY", zone: "Zona Norte / Las Brisas" },
    { id: "domus-tower", label: "DOMUS TOWER", zone: "Equipetrol Norte" },
    { id: "domus-infinity", label: "DOMUS INFINITY", zone: "Los Tajibos" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-[#0d0f12] text-stone-100 font-sans"
    >
      {/* Botón flotante para cerrar */}
      {onClose && (
        <button
          onClick={onClose}
          className="fixed right-4 top-4 z-[120] flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-stone-200 backdrop-blur-md border border-white/10 transition-transform active:scale-95 hover:bg-black/90"
          aria-label="Cerrar proyecto"
        >
          <X size={20} />
        </button>
      )}

      {/* CONTENEDOR PRINCIPAL */}
      <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 sm:pt-10">
        {/* SELECTOR DE PROYECTOS DOMUS */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400">
                Colección Domus · Alborada Group
              </p>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-stone-300 transition-colors hover:bg-white/10"
            >
              <Share2 size={12} />
              <span>{shareFeedback ? "¡Enlace copiado!" : "Compartir"}</span>
            </button>
          </div>

          {/* Carrusel horizontal de proyectos */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {allDomusProjects.map((p) => {
              const isActive = p.id === activeProjectId;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProjectId(p.id);
                    setSelectedTypologyId("");
                    setSelectedFloor(0);
                    setSelectedUnitNumber("");
                  }}
                  className={`flex-shrink-0 rounded-xl px-3.5 py-2 text-left transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-400/50 text-white shadow-lg shadow-amber-500/10"
                      : "bg-white/5 border border-white/5 text-stone-400 hover:bg-white/10 hover:text-stone-200"
                  }`}
                >
                  <p className="text-xs font-semibold tracking-wide">{p.label}</p>
                  <p className="text-[10px] text-stone-400 font-light truncate max-w-[130px]">{p.zone}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* HERO HEADER */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-stone-900 to-[#12151b] p-6 sm:p-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
              <Sparkles size={12} />
              <span>{projectConfig.delivery}</span>
            </div>

            <h1 className="mt-3 font-serif text-3xl font-light tracking-tight text-white sm:text-5xl">
              {projectConfig.name}
            </h1>
            <p className="mt-2 text-sm text-amber-200/80 font-light tracking-wide sm:text-base">
              {projectConfig.tagline}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-stone-400">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-amber-400" />
                <span>{projectConfig.address}</span>
              </span>
              <span className="h-1 w-1 rounded-full bg-stone-600" />
              <span>{projectConfig.floorsCount} pisos</span>
              <span className="h-1 w-1 rounded-full bg-stone-600" />
              <span>Desde ${formatDomusUsd(projectConfig.priceFromUsd)} USD</span>
            </div>
          </div>

          {/* FOTO PRINCIPAL Y MINIATURAS */}
          <div className="mt-6">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black/40 border border-white/10">
              <img
                src={activeImage}
                alt={projectConfig.name}
                className="h-full w-full object-cover transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Selector de galería */}
            {projectConfig.galleryImages.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {projectConfig.galleryImages.map((img, idx) => (
                  <button
                    key={img + idx}
                    onClick={() => {
                      setActiveImage(img);
                      setActiveImageIndex(idx);
                    }}
                    className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border transition-all ${
                      activeImage === img
                        ? "border-amber-400 scale-105 shadow-md shadow-amber-400/20"
                        : "border-white/10 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="Miniatura" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BARRA DE DISPONIBILIDAD EN TIEMPO REAL */}
        <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-center sm:gap-4 sm:p-5">
          <div className="border-r border-white/10 pr-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 sm:text-xs">
              Total Unidades
            </p>
            <p className="mt-1 font-serif text-xl font-light text-white sm:text-3xl">
              {totalUnitsCount}
            </p>
            <p className="text-[10px] text-stone-500 font-light">{projectConfig.floorsCount} pisos</p>
          </div>

          <div className="border-r border-white/10 pr-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 sm:text-xs flex items-center justify-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Disponibles
            </p>
            <p className="mt-1 font-serif text-xl font-semibold text-emerald-400 sm:text-3xl">
              {availableUnitsCount}
            </p>
            <p className="text-[10px] text-stone-500 font-light">Para reserva inmediata</p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 sm:text-xs">
              Colocación
            </p>
            <p className="mt-1 font-serif text-xl font-light text-stone-300 sm:text-3xl">
              {soldUnitsCount + reservedUnitsCount}
            </p>
            <p className="text-[10px] text-stone-500 font-light">
              {totalUnitsCount > 0
                ? `${Math.round(((soldUnitsCount + reservedUnitsCount) / totalUnitsCount) * 100)}% comprometido`
                : ""}
            </p>
          </div>
        </div>

        {/* SECCIÓN INTERACTIVA: FLUJO EN 3 PASOS PARA CLIENTE */}
        <section className="mt-10 rounded-3xl border border-white/10 bg-[#12151b] p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-amber-400" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400">
                  Selector de Unidades & Planes
                </p>
              </div>
              <h2 className="mt-1 font-serif text-2xl font-light text-white sm:text-3xl">
                Elige tu departamento en {projectConfig.name}.
              </h2>
            </div>

            {projectConfig.sheetCsvUrl && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-stone-300 hover:bg-white/10 active:scale-95 disabled:opacity-50"
                  title="Actualizar datos con Google Sheets"
                >
                  <RefreshCw size={12} className={isRefreshing ? "animate-spin text-amber-400" : ""} />
                  <span>{isRefreshing ? "Actualizando..." : "Planilla en Vivo"}</span>
                </button>
              </div>
            )}
          </div>

          {/* PASO 1: ELEGIR TIPOLOGÍA */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              1. Selecciona la tipología
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {projectConfig.typologies.map((t) => {
                const isSelected = t.id === selectedTypologyId;
                const availableInType = units.filter((u) => u.rooms === t.rooms && u.status === "disponible").length;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTypologyId(t.id);
                      setSelectedUnitNumber("");
                    }}
                    className={`rounded-2xl p-3.5 text-left transition-all border ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-400/60 shadow-md shadow-amber-500/10 text-white"
                        : "bg-white/5 border-white/5 text-stone-400 hover:bg-white/10 hover:text-stone-200"
                    }`}
                  >
                    <p className="text-xs font-semibold">{t.name}</p>
                    <p className="mt-1 text-[11px] text-stone-400 font-light">{t.areaRange}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-amber-300 font-medium">Desde ${formatDomusUsd(t.cashFrom)}</span>
                      <span
                        className={`font-semibold ${
                          availableInType > 0 ? "text-emerald-400" : "text-stone-500"
                        }`}
                      >
                        {availableInType > 0 ? `${availableInType} disp.` : "Agotado"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASO 2: ELEGIR PISO Y UNIDAD */}
          {floorsForTypology.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
                2. Selecciona el piso
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {floorsForTypology.map((f) => {
                  const isSelected = f.floor === selectedFloor;
                  return (
                    <button
                      key={f.floor}
                      onClick={() => {
                        setSelectedFloor(f.floor);
                        setSelectedUnitNumber("");
                      }}
                      className={`flex-shrink-0 rounded-xl px-4 py-2.5 text-center transition-all border ${
                        isSelected
                          ? "bg-amber-400 text-stone-950 font-bold border-amber-300 shadow-md shadow-amber-400/20"
                          : f.hasAvailable
                          ? "bg-white/5 border-white/10 text-stone-200 hover:bg-white/10"
                          : "bg-white/[0.02] border-white/5 text-stone-600 line-through"
                      }`}
                    >
                      <p className="text-xs font-medium">{f.floorLabel}</p>
                      <p className="text-[10px] mt-0.5 opacity-80">
                        {f.hasAvailable ? `${f.availableCount} disp.` : "Vendido"}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Selector de departamento en el piso */}
              {unitsOnSelectedFloor.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-medium text-stone-400 mb-2">
                    Departamentos en {unitsOnSelectedFloor[0]?.floorLabel || `Piso ${selectedFloor}`}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {unitsOnSelectedFloor.map((u) => {
                      const isSelected = u.unitNumber === selectedUnitNumber;
                      const isAvailable = u.status === "disponible";
                      return (
                        <button
                          key={u.unitNumber}
                          disabled={!isAvailable}
                          onClick={() => setSelectedUnitNumber(u.unitNumber)}
                          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all border flex items-center gap-2 ${
                            isSelected
                              ? "bg-white text-stone-950 border-white shadow-lg shadow-white/10"
                              : isAvailable
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                              : "bg-white/[0.02] border-white/5 text-stone-600 cursor-not-allowed"
                          }`}
                        >
                          <span>Dpto {u.unitNumber}</span>
                          <span className="text-[10px] opacity-75">({u.areaM2} m²)</span>
                          {!isAvailable && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-stone-800 text-stone-500">
                              {u.status}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASO 3: MODALIDAD DE PAGO & TARJETA DE LIQUIDACIÓN */}
          {activeUnit && financialSummary && (
            <div className="mt-8 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <p className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                      Unidad Seleccionada · Dpto {activeUnit.unitNumber}
                    </p>
                  </div>
                  <h3 className="text-lg font-serif text-white mt-1">
                    {activeUnit.roomsLabel} · {activeUnit.areaM2} m² ({activeUnit.floorLabel})
                  </h3>
                </div>

                {/* Switch de planes de pago */}
                <div className="flex rounded-xl bg-black/40 p-1 border border-white/10">
                  <button
                    onClick={() => setSelectedPlan("contado")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      selectedPlan === "contado"
                        ? "bg-amber-400 text-stone-950 shadow"
                        : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    100% Contado
                  </button>
                  {activeUnit.initial60Total && (
                    <button
                      onClick={() => setSelectedPlan("inicial60")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        selectedPlan === "inicial60"
                          ? "bg-amber-400 text-stone-950 shadow"
                          : "text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      60% Inicial
                    </button>
                  )}
                  {activeUnit.initial40Total && (
                    <button
                      onClick={() => setSelectedPlan("inicial40")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        selectedPlan === "inicial40"
                          ? "bg-amber-400 text-stone-950 shadow"
                          : "text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      40% Inicial
                    </button>
                  )}
                </div>
              </div>

              {/* Métricas financieras */}
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-black/30 p-3.5 border border-white/5">
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-stone-400">Precio Total</p>
                  <p className="mt-1 font-serif text-xl sm:text-2xl font-semibold text-white">
                    ${formatDomusUsd(financialSummary.totalPrice)}
                  </p>
                  <p className="text-[10px] text-amber-300/80 font-light mt-0.5">
                    ${formatDomusUsd(financialSummary.pricePerM2)} USD/m²
                  </p>
                </div>

                <div className="rounded-xl bg-black/30 p-3.5 border border-white/5">
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-stone-400">Cuota Inicial</p>
                  <p className="mt-1 font-serif text-xl sm:text-2xl font-semibold text-amber-300">
                    ${formatDomusUsd(financialSummary.initialPayment)}
                  </p>
                  <p className="text-[10px] text-stone-400 font-light mt-0.5">{financialSummary.planLabel}</p>
                </div>

                <div className="rounded-xl bg-black/30 p-3.5 border border-white/5">
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-stone-400">Entrega Estimada</p>
                  <p className="mt-1 font-serif text-base sm:text-lg font-light text-stone-200">
                    {activeUnit.deliveryYear || projectConfig.delivery}
                  </p>
                  <p className="text-[10px] text-stone-400 font-light mt-0.5">Alborada Group</p>
                </div>

                <div className="rounded-xl bg-black/30 p-3.5 border border-white/5">
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400 flex items-center gap-1">
                    <TrendingUp size={11} />
                    <span>Plusvalía Estimada</span>
                  </p>
                  <p className="mt-1 font-serif text-xl sm:text-2xl font-semibold text-emerald-400">
                    +${formatDomusUsd(financialSummary.estimatedGain)}
                  </p>
                  <p className="text-[10px] text-emerald-300/80 font-light mt-0.5">
                    +{financialSummary.estimatedGainPct}% a valor de entrega
                  </p>
                </div>
              </div>

              {/* BOTÓN DIRECTO DE RESERVA POR WHATSAPP */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-amber-500/10 border border-amber-400/30 p-4">
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">¿Te interesa reservar el Dpto {activeUnit.unitNumber}?</p>
                  <p className="text-[11px] text-amber-200/70 font-light">
                    Bloqueo prioritario con reserva formal y asesoramiento directo con el captador.
                  </p>
                </div>
                <button
                  onClick={handleWhatsAppReservation}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700 active:scale-95 transition-all"
                >
                  <MessageCircle size={16} />
                  <span>Reservar Dpto {activeUnit.unitNumber} en WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* AMENIDADES DE CATEGORÍA SUPERIOR */}
        <section className="mt-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={15} className="text-amber-400" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400">
              Amenidades & Estilo de Vida
            </p>
          </div>
          <h2 className="font-serif text-2xl font-light text-white sm:text-3xl">
            Experiencias de categoría en {projectConfig.name}.
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {projectConfig.amenities.map((am, idx) => (
              <div
                key={am.name + idx}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/[0.08]"
              >
                {am.image && (
                  <div className="mb-4 aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10">
                    <img src={am.image} alt={am.name} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                  <CheckCircle2 size={12} />
                  <span>{am.category}</span>
                </div>
                <h3 className="mt-1 font-serif text-lg font-medium text-white">{am.name}</h3>
                <p className="mt-1 text-xs font-light text-stone-400 leading-relaxed">{am.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SELLO DE CONFIANZA & DESARROLLADORA */}
        <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center sm:p-8">
          <ShieldCheck size={32} className="mx-auto text-amber-400" />
          <h3 className="mt-3 font-serif text-xl font-light text-white">Desarrollado por Alborada Group Bolivia SRL</h3>
          <p className="mx-auto mt-2 max-w-xl text-xs font-light text-stone-400 leading-relaxed">
            Respaldo legal completo con anteproyecto aprobado, alodial registrado y trazabilidad de fondos. Todos los pagos y cuotas se canalizan a través de cuentas bancarias corporativas bajo supervisión contractual.
          </p>
        </section>
      </div>
    </motion.div>
  );
}
