import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Building2,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Flame,
  Gamepad2,
  Home,
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
  Zap,
} from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import {
  BLESS_TOWER_BASELINE_UNITS,
  BLESS_TOWER_CONFIG,
  BLESS_TOWER_PARKINGS,
  BlessTowerUnit,
  fetchBlessTowerLiveUnits,
  formatBlessUsd,
} from "../blessTowerInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

type TabCategory = "fachada" | "interiores" | "sociales" | "plano";

const GALLERY_IMAGES = {
  fachada: [
    { src: "/bless_tower/fachada_principal.jpg", label: "Fachada Principal Sobre Av. Cristo Redentor" },
    { src: "/bless_tower/fachada_2.jpg", label: "Perspectiva Urbana y Torre de 30 Niveles" },
    { src: "/bless_tower/fachada_3.jpg", label: "Diseño Arquitectónico Contemporáneo" },
  ],
  interiores: [
    { src: "/bless_tower/interior_1.jpg", label: "Living / Comedor Integrado con Vistas Panorámicas" },
    { src: "/bless_tower/interior_2.jpg", label: "Dormitorio Principal con Acabados de Primera" },
    { src: "/bless_tower/interior_3.jpg", label: "Cocina Equipada y Espacios Optimizados" },
  ],
  sociales: [
    { src: "/bless_tower/social_1.jpg", label: "Piscina Sin Fin en Rooftop con Vista a la Ciudad" },
    { src: "/bless_tower/social_2.jpg", label: "Churrasquera Gourmet y Salón Lounge Exclusivo" },
    { src: "/bless_tower/social_3.jpg", label: "Área de Fogatero y Coworking Moderno" },
  ],
};

const TYPOLOGY_FILTERS = [
  { id: "TODOS", label: "Todos los Modelos" },
  { id: "Monoambiente", label: "Monoambientes (32 a 40 m²)" },
  { id: "1 Dormitorio", label: "1 Dormitorio (41 a 63 m²)" },
  { id: "2 Dormitorios", label: "2 Dormitorios (76 a 87 m²)" },
];

export default function BlessTowerLanding({ property, onClose }: Props) {
  const [units, setUnits] = useState<BlessTowerUnit[]>(BLESS_TOWER_BASELINE_UNITS);
  const [loading, setLoading] = useState(true);
  const [selectedTypology, setSelectedTypology] = useState<string>("TODOS");
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [includeParking, setIncludeParking] = useState(false);
  const [parkingType, setParkingType] = useState<"simple" | "combo">("simple");
  const [paymentPlan, setPaymentPlan] = useState<"contado" | "cuotas40" | "lista">("contado");
  const [activeMediaTab, setActiveMediaTab] = useState<TabCategory>("fachada");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [shareFeedback, setShareFeedback] = useState(false);

  // Carga en vivo desde Google Sheet con fallback
  useEffect(() => {
    let isMounted = true;
    fetchBlessTowerLiveUnits()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setUnits(data);
        }
      })
      .catch((err) => console.warn("[BlessTower] Error cargando inventario en vivo:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Unidades disponibles filtradas por tipología
  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      if (selectedTypology !== "TODOS" && u.tipologia !== selectedTypology) return false;
      return true;
    });
  }, [units, selectedTypology]);

  // Pisos disponibles para la tipología elegida
  const availableFloors = useMemo(() => {
    const floorSet = new Set<number>();
    filteredUnits.forEach((u) => {
      if (u.pisoNumero > 0) floorSet.add(u.pisoNumero);
    });
    return Array.from(floorSet).sort((a, b) => a - b);
  }, [filteredUnits]);

  // Asegurar selección de piso válida
  useEffect(() => {
    if (availableFloors.length > 0) {
      if (!selectedFloor || !availableFloors.includes(selectedFloor)) {
        // Preferir piso con unidades disponibles (LIBRE)
        const floorWithLibre = availableFloors.find((f) =>
          filteredUnits.some((u) => u.pisoNumero === f && u.estado === "LIBRE")
        );
        setSelectedFloor(floorWithLibre || availableFloors[0]);
      }
    } else {
      setSelectedFloor(null);
    }
  }, [availableFloors, filteredUnits, selectedFloor]);

  // Unidades en el piso seleccionado
  const unitsInFloor = useMemo(() => {
    if (!selectedFloor) return [];
    return filteredUnits.filter((u) => u.pisoNumero === selectedFloor);
  }, [filteredUnits, selectedFloor]);

  // Asegurar unidad seleccionada
  useEffect(() => {
    if (unitsInFloor.length > 0) {
      const currentExists = unitsInFloor.some((u) => u.id === selectedUnitId);
      if (!currentExists) {
        const firstLibre = unitsInFloor.find((u) => u.estado === "LIBRE");
        setSelectedUnitId((firstLibre || unitsInFloor[0]).id);
      }
    }
  }, [unitsInFloor, selectedUnitId]);

  const activeUnit = useMemo(() => {
    return units.find((u) => u.id === selectedUnitId) || unitsInFloor[0] || units[0];
  }, [units, selectedUnitId, unitsInFloor]);

  // Costo de estacionamiento adicional
  const parkingCost = useMemo(() => {
    if (!includeParking) return 0;
    if (paymentPlan === "contado") {
      return parkingType === "combo" ? 16591 : 14720;
    }
    return parkingType === "combo" ? 21090 : 17250;
  }, [includeParking, parkingType, paymentPlan]);

  // Cálculos financieros transparentes
  const financials = useMemo(() => {
    if (!activeUnit) {
      return {
        unitPrice: 0,
        totalPrice: 0,
        reserva: BLESS_TOWER_CONFIG.reservaUsd,
        cuotaInicial: 0,
        cuotaInicialPct: 100,
        saldoContraEntrega: 0,
        saldoPct: 0,
        pricePerM2: 0,
        ahorroContado: 0,
      };
    }

    let baseUnitPrice = activeUnit.precioContado;
    if (paymentPlan === "cuotas40") {
      baseUnitPrice = activeUnit.precioCuotas || activeUnit.precioLista * 0.8;
    } else if (paymentPlan === "lista") {
      baseUnitPrice = activeUnit.precioLista || activeUnit.precioContado * 1.25;
    }

    const total = baseUnitPrice + parkingCost;
    const m2 = activeUnit.superficieM2 || 1;
    const pricePerM2 = Math.round(baseUnitPrice / m2);
    const ahorro = Math.max(0, (activeUnit.precioLista || activeUnit.precioContado * 1.25) - activeUnit.precioContado);

    if (paymentPlan === "contado") {
      return {
        unitPrice: baseUnitPrice,
        totalPrice: total,
        reserva: BLESS_TOWER_CONFIG.reservaUsd,
        cuotaInicial: total,
        cuotaInicialPct: 100,
        saldoContraEntrega: 0,
        saldoPct: 0,
        pricePerM2,
        ahorroContado: ahorro,
      };
    }

    if (paymentPlan === "cuotas40") {
      const cuotaInicial = Math.round(total * 0.4);
      const saldo = total - cuotaInicial;
      return {
        unitPrice: baseUnitPrice,
        totalPrice: total,
        reserva: BLESS_TOWER_CONFIG.reservaUsd,
        cuotaInicial,
        cuotaInicialPct: 40,
        saldoContraEntrega: saldo,
        saldoPct: 60,
        pricePerM2,
        ahorroContado: ahorro,
      };
    }

    // Plan lista (30% inicial / 70% entrega)
    const cuotaInicial = Math.round(total * 0.3);
    const saldo = total - cuotaInicial;
    return {
      unitPrice: baseUnitPrice,
      totalPrice: total,
      reserva: BLESS_TOWER_CONFIG.reservaUsd,
      cuotaInicial,
      cuotaInicialPct: 30,
      saldoContraEntrega: saldo,
      saldoPct: 70,
      pricePerM2,
      ahorroContado: ahorro,
    };
  }, [activeUnit, parkingCost, paymentPlan]);

  // Estadísticas globales de disponibilidad
  const stats = useMemo(() => {
    const total = units.length;
    const libres = units.filter((u) => u.estado === "LIBRE").length;
    const reservados = units.filter((u) => u.estado === "RESERVADO").length;
    const vendidos = units.filter((u) => u.estado === "VENDIDO").length;
    const pctVendido = Math.round(((vendidos + reservados) / total) * 100);
    return { total, libres, reservados, vendidos, pctVendido };
  }, [units]);

  // Mensaje oficial a WhatsApp
  const contactWhatsApp = () => {
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: "bless-tower",
      operacion: "Preventa",
      zona: BLESS_TOWER_CONFIG.zone,
    }).catch(() => {});

    const unitInfo = activeUnit
      ? `Unidad ${activeUnit.codigo} (Piso ${activeUnit.pisoNumero}, Modelo ${activeUnit.modelo} - ${activeUnit.tipologia} de ${activeUnit.superficieM2} m²)`
      : "Bless Tower";
    const parkingInfo = includeParking
      ? ` + ${parkingType === "combo" ? "Parqueo + Baulera" : "Parqueo Simple"}`
      : " (Sin parqueo)";
    const planInfo =
      paymentPlan === "contado"
        ? "Plan Al Contado (100%)"
        : paymentPlan === "cuotas40"
        ? "Plan 40% en Cuotas + 60% Saldo contra entrega"
        : "Plan de Lista (30% Inicial + 70% contra entrega)";

    const text = `Hola, vengo de N.I.A y deseo reservar en BLESS TOWER:\n\n• ${unitInfo}${parkingInfo}\n• Modalidad: ${planInfo}\n• Inversión Total: USD ${formatBlessUsd(financials.totalPrice)}\n• Cuota Inicial: USD ${formatBlessUsd(financials.cuotaInicial)}\n\n¿Me pueden confirmar la disponibilidad oficial y los pasos para asegurar con la reserva de USD ${formatBlessUsd(BLESS_TOWER_CONFIG.reservaUsd)}?`;

    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/proyecto/bless-tower`;
    const shareText = "Bless Tower · 30 Niveles de Lujo en Av. Cristo Redentor | Preventa N.I.A";
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "Bless Tower", text: shareText, url: shareUrl });
        return;
      }
    } catch {
      // Ignorar rechazo
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2500);
    } catch {
      setShareFeedback(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col lg:flex-row bg-[#faf8f5] text-stone-900 overflow-y-auto lg:overflow-hidden font-sans"
    >
      {/* Botón flotante cerrar */}
      {onClose && (
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[120] rounded-full bg-black/70 hover:bg-black p-3 text-white backdrop-blur-md shadow-2xl transition-all border border-white/20"
          title="Cerrar modal (Esc)"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
      )}

      {/* ========================================================
          PANEL IZQUIERDO VISUAL EDITORIAL (44% en desktop)
          ======================================================== */}
      <div className="w-full lg:w-[44%] h-[50vh] lg:h-full relative flex flex-col justify-between bg-stone-950 text-white shrink-0 overflow-hidden select-none">
        {/* Imagen o Plano activo */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            {activeMediaTab === "plano" ? (
              <motion.div
                key={`plano-${activeUnit?.modelo || "def"}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full h-full flex items-center justify-center p-6 bg-[#0f0e0d]"
              >
                <img
                  src={activeUnit?.planoUrl || "/bless_tower/modelos_pages/page_2.jpg"}
                  alt={`Plano Modelo ${activeUnit?.modelo || ""}`}
                  className="max-h-full max-w-full object-contain filter drop-shadow-2xl"
                />
              </motion.div>
            ) : (
              <motion.img
                key={`${activeMediaTab}-${activeImageIndex}`}
                src={GALLERY_IMAGES[activeMediaTab][activeImageIndex]?.src}
                alt={GALLERY_IMAGES[activeMediaTab][activeImageIndex]?.label}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="w-full h-full object-cover"
              />
            )}
          </AnimatePresence>

          {/* Degradado cinematográfico */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-black/40 pointer-events-none" />
        </div>

        {/* Encabezado sobre imagen */}
        <div className="relative z-10 p-6 sm:p-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] bg-amber-500/90 text-stone-950 shadow-lg">
                <Sparkles size={12} /> Preventa Exclusiva
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/10">
                30 Niveles
              </span>
            </div>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-light text-white tracking-wide drop-shadow-md">
              Bless Tower
            </h2>
            <p className="mt-1 text-xs text-stone-300 font-light tracking-wider flex items-center gap-1.5">
              <MapPin size={13} className="text-amber-400" /> Av. Cristo Redentor entre 2° y 3° Anillo · Santa Cruz
            </p>
          </div>
        </div>

        {/* Barra inferior del panel visual con controles de galería */}
        <div className="relative z-10 p-6 sm:p-8 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent">
          {/* Tabs visuales */}
          <div className="flex items-center gap-2 p-1 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 overflow-x-auto max-w-full">
            {(
              [
                { id: "fachada", label: "Fachada" },
                { id: "interiores", label: "Interiores" },
                { id: "sociales", label: "Áreas Sociales" },
                { id: "plano", label: `Plano Mod. ${activeUnit?.modelo || "A"}` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveMediaTab(tab.id);
                  setActiveImageIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  activeMediaTab === tab.id
                    ? "bg-amber-500 text-stone-950 font-semibold shadow"
                    : "text-stone-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Selector de sub-imagen si aplica */}
          {activeMediaTab !== "plano" && GALLERY_IMAGES[activeMediaTab].length > 1 && (
            <div className="mt-3 flex items-center justify-between text-xs text-stone-300">
              <span className="text-[11px] font-light truncate max-w-[70%]">
                {GALLERY_IMAGES[activeMediaTab][activeImageIndex]?.label}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {GALLERY_IMAGES[activeMediaTab].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-2 transition-all rounded-full ${
                      activeImageIndex === idx ? "w-6 bg-amber-400" : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Ver foto ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {activeMediaTab === "plano" && activeUnit && (
            <div className="mt-3 flex items-center justify-between text-xs text-stone-300 bg-white/5 p-2.5 rounded-lg border border-white/10">
              <span className="font-medium text-amber-300">
                Modelo {activeUnit.modelo} · {activeUnit.tipologia}
              </span>
              <span className="font-mono text-white">{activeUnit.superficieM2} m² totales</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          PANEL DERECHO DE CONTENIDO & COTIZADOR (56% en desktop)
          ======================================================== */}
      <div className="w-full lg:w-[56%] h-auto lg:h-full overflow-y-auto p-6 sm:p-10 lg:p-12 space-y-10">
        {/* Cabecera y resumen rápido */}
        <header className="border-b border-stone-200/80 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#9a7b45] font-semibold">
              Desarrollador: {BLESS_TOWER_CONFIG.builder}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 border border-stone-300 px-3 py-1.5 rounded-lg transition"
              >
                <Share2 size={13} />
                {shareFeedback ? "Enlace copiado" : "Compartir"}
              </button>
              <a
                href={BLESS_TOWER_CONFIG.brochurePdfUrl}
                download
                className="inline-flex items-center gap-1.5 text-xs text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-lg transition font-medium"
              >
                <Download size={13} /> Brochure PDF
              </a>
            </div>
          </div>

          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-light text-stone-900 leading-tight">
            Bless Tower · 30 Niveles de Lujo y Confort
          </h1>
          <p className="mt-2 text-sm text-stone-600 font-light leading-relaxed">
            Emplazada sobre la emblemática Av. Cristo Redentor entre 2° y 3° anillo interno. Departamentos inteligentes
            con cerradura digital, aires acondicionados instalados, piscina sinfín en rooftop, doble churrasquera, área de
            fogatero y sala gamer de vanguardia.
          </p>

          {/* Badges de avance y disponibilidad en vivo */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="bg-stone-100/90 rounded-lg p-2.5 border border-stone-200">
              <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Entrega Prevista</p>
              <p className="text-sm font-semibold text-stone-900 mt-0.5">{BLESS_TOWER_CONFIG.delivery}</p>
            </div>
            <div className="bg-stone-100/90 rounded-lg p-2.5 border border-stone-200">
              <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Disponibilidad</p>
              <p className="text-sm font-semibold text-emerald-700 mt-0.5">
                {stats.libres} unidades libres ({stats.pctVendido}% colocado)
              </p>
            </div>
            <div className="bg-stone-100/90 rounded-lg p-2.5 border border-stone-200">
              <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Reserva Oficial</p>
              <p className="text-sm font-semibold text-stone-900 mt-0.5">USD {formatBlessUsd(BLESS_TOWER_CONFIG.reservaUsd)}</p>
            </div>
            <div className="bg-stone-100/90 rounded-lg p-2.5 border border-stone-200">
              <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Precios Desde</p>
              <p className="text-sm font-semibold text-stone-900 mt-0.5">USD {formatBlessUsd(BLESS_TOWER_CONFIG.minPriceUsd)}</p>
            </div>
          </div>
        </header>

        {/* ========================================================
            COTIZADOR INTERACTIVO 5 PASOS ESTILO APPLE
            ======================================================== */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200/90 space-y-8">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-amber-700">Cotizador en Vivo</span>
              <h2 className="text-xl font-serif font-light text-stone-900">Personaliza tu Departamento</h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizado con Google Sheets
            </div>
          </div>

          {/* PASO 1: TIPOLOGÍA */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                Paso 1: Elige Tipología
              </label>
              <span className="text-[11px] text-stone-400">Filtrar por ambientes</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TYPOLOGY_FILTERS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedTypology(item.id)}
                  className={`px-3 py-2.5 rounded-xl text-xs text-left transition-all border ${
                    selectedTypology === item.id
                      ? "border-stone-900 bg-stone-900 text-white font-semibold shadow-sm"
                      : "border-stone-200 bg-stone-50/60 hover:bg-stone-100 text-stone-800"
                  }`}
                >
                  <span className="block font-medium truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* PASO 2: NIVEL / PISO */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                Paso 2: Selecciona Nivel / Piso ({availableFloors.length} pisos)
              </label>
              {selectedFloor && <span className="text-xs font-semibold text-stone-900">Piso {selectedFloor}</span>}
            </div>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 border border-stone-100 rounded-xl bg-stone-50/50">
              {availableFloors.map((fl) => {
                const hasLibre = filteredUnits.some((u) => u.pisoNumero === fl && u.estado === "LIBRE");
                const isSelected = selectedFloor === fl;
                return (
                  <button
                    key={fl}
                    onClick={() => setSelectedFloor(fl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border ${
                      isSelected
                        ? "bg-amber-600 border-amber-600 text-white shadow-sm font-bold"
                        : hasLibre
                        ? "bg-white border-stone-200 text-stone-800 hover:border-amber-400"
                        : "bg-stone-100 border-stone-200 text-stone-400 opacity-60"
                    }`}
                  >
                    P{fl} {hasLibre ? "•" : ""}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASO 3: UNIDAD ESPECÍFICA */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                Paso 3: Unidad en Piso {selectedFloor || "—"} ({unitsInFloor.length} unidades)
              </label>
              <span className="text-[11px] text-stone-500">Haz clic para seleccionar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {unitsInFloor.map((u) => {
                const isSelected = u.id === selectedUnitId;
                const isLibre = u.estado === "LIBRE";
                const isReservado = u.estado === "RESERVADO";

                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUnitId(u.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? "border-stone-900 bg-amber-50/50 ring-2 ring-stone-900 shadow-sm"
                        : "border-stone-200 hover:border-stone-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-base font-bold text-stone-900">
                          Depto {u.codigo}
                        </span>
                        <p className="text-xs text-stone-600 mt-0.5">
                          Modelo {u.modelo} · {u.tipologia}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          isLibre
                            ? "bg-emerald-100 text-emerald-800"
                            : isReservado
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {u.estado}
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between border-t border-stone-100 pt-2 text-xs">
                      <span className="text-stone-500 font-mono">{u.superficieM2} m²</span>
                      <span className="font-semibold text-stone-900">
                        USD {formatBlessUsd(u.precioContado || u.precioLista)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASO 4: PARQUEO (Directo sin select confuso) */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="bt-parking-check"
                  checked={includeParking}
                  onChange={(e) => setIncludeParking(e.target.checked)}
                  className="w-4 h-4 text-stone-900 rounded border-stone-300 focus:ring-stone-900"
                />
                <label htmlFor="bt-parking-check" className="text-xs font-semibold text-stone-900 cursor-pointer">
                  Añadir Espacio de Parqueo a la Cotización
                </label>
              </div>
              <Car size={16} className="text-stone-500" />
            </div>

            {includeParking && (
              <div className="mt-3 pl-7 pt-2 border-t border-stone-200/60 grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setParkingType("simple")}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    parkingType === "simple"
                      ? "border-stone-900 bg-white shadow-sm font-semibold text-stone-900"
                      : "border-stone-200 bg-stone-100/70 text-stone-600"
                  }`}
                >
                  <p className="font-medium">Parqueo Simple</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    +USD {formatBlessUsd(paymentPlan === "contado" ? 14720 : 17250)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setParkingType("combo")}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    parkingType === "combo"
                      ? "border-stone-900 bg-white shadow-sm font-semibold text-stone-900"
                      : "border-stone-200 bg-stone-100/70 text-stone-600"
                  }`}
                >
                  <p className="font-medium">Parqueo + Baulera</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    +USD {formatBlessUsd(paymentPlan === "contado" ? 16591 : 21090)}
                  </p>
                </button>
              </div>
            )}
          </div>

          {/* PASO 5: PLAN DE PAGO */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
              Paso 5: Selecciona Modalidad de Pago
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentPlan("contado")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  paymentPlan === "contado"
                    ? "border-emerald-700 bg-emerald-50/50 ring-2 ring-emerald-700 text-stone-900"
                    : "border-stone-200 hover:border-stone-300 bg-white text-stone-700"
                }`}
              >
                <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Mayor Descuento
                </span>
                <p className="font-semibold text-sm mt-1.5">Al Contado</p>
                <p className="text-xs text-stone-500 mt-0.5">100% de contado o reserva + desembolso inmediato</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentPlan("cuotas40")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  paymentPlan === "cuotas40"
                    ? "border-amber-700 bg-amber-50/50 ring-2 ring-amber-700 text-stone-900"
                    : "border-stone-200 hover:border-stone-300 bg-white text-stone-700"
                }`}
              >
                <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Plan en Obra
                </span>
                <p className="font-semibold text-sm mt-1.5">Cuotas 40% Inicial</p>
                <p className="text-xs text-stone-500 mt-0.5">40% en cuotas y 60% contra entrega de llaves</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentPlan("lista")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  paymentPlan === "lista"
                    ? "border-stone-900 bg-stone-50 ring-2 ring-stone-900 text-stone-900"
                    : "border-stone-200 hover:border-stone-300 bg-white text-stone-700"
                }`}
              >
                <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-800">
                  Financiamiento
                </span>
                <p className="font-semibold text-sm mt-1.5">Precio de Lista</p>
                <p className="text-xs text-stone-500 mt-0.5">30% durante construcción + 70% saldo entrega</p>
              </button>
            </div>
          </div>

          {/* ========================================================
              RESUMEN FINANCIERO OFICIAL (Manual NIA Estándar)
              "USD arriba, número abajo"
              ======================================================== */}
          <div className="bg-stone-950 text-white rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-semibold">
                  Resumen de la Cotización
                </p>
                <p className="font-serif text-lg text-white">
                  Depto {activeUnit?.codigo || "—"} · Piso {activeUnit?.pisoNumero || "—"} ({activeUnit?.superficieM2} m²)
                </p>
              </div>
              <span className="text-xs text-stone-400 font-mono">
                USD {formatBlessUsd(financials.pricePerM2)} / m²
              </span>
            </div>

            {/* Grid 4 Columnas con Estándar "USD arriba, número abajo" */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* 1. Inversión Total */}
              <div className="flex flex-col justify-between">
                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold min-h-[24px] flex items-end">
                  Inversión Total
                </p>
                <div className="mt-1">
                  <p className="font-serif text-lg sm:text-2xl font-bold text-white leading-tight">
                    <span className="block text-xs font-mono font-normal text-stone-400">USD</span>
                    <span className="block mt-0.5">{formatBlessUsd(financials.totalPrice)}</span>
                  </p>
                  <p className="text-[10px] text-stone-400 mt-1 truncate">
                    {includeParking ? "Incluye Parqueo" : "Unidad privada"}
                  </p>
                </div>
              </div>

              {/* 2. Reserva Requerida */}
              <div className="flex flex-col justify-between">
                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold min-h-[24px] flex items-end">
                  Reserva Inicial
                </p>
                <div className="mt-1">
                  <p className="font-serif text-lg sm:text-2xl font-bold text-amber-400 leading-tight">
                    <span className="block text-xs font-mono font-normal text-amber-500/80">USD</span>
                    <span className="block mt-0.5">{formatBlessUsd(financials.reserva)}</span>
                  </p>
                  <p className="text-[10px] text-stone-400 mt-1">Para congelar unidad</p>
                </div>
              </div>

              {/* 3. Cuota Inicial */}
              <div className="flex flex-col justify-between">
                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold min-h-[24px] flex items-end">
                  Cuota Inicial ({financials.cuotaInicialPct}%)
                </p>
                <div className="mt-1">
                  <p className="font-serif text-lg sm:text-2xl font-bold text-emerald-400 leading-tight">
                    <span className="block text-xs font-mono font-normal text-emerald-500/80">USD</span>
                    <span className="block mt-0.5">{formatBlessUsd(financials.cuotaInicial)}</span>
                  </p>
                  <p className="text-[10px] text-stone-400 mt-1">
                    {paymentPlan === "contado" ? "A la firma (100%)" : "Durante construcción"}
                  </p>
                </div>
              </div>

              {/* 4. Saldo contra Entrega (Estándar: '-' y 'Sin saldo pendiente' cuando contado) */}
              <div className="flex flex-col justify-between">
                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold min-h-[24px] flex items-end">
                  Saldo contra Entrega
                </p>
                <div className="mt-1">
                  {paymentPlan === "contado" ? (
                    <>
                      <p className="font-serif text-lg sm:text-2xl font-bold text-stone-500 leading-tight">
                        <span className="block text-xs font-mono font-normal text-stone-500">USD</span>
                        <span className="block mt-0.5">—</span>
                      </p>
                      <p className="text-[10px] text-stone-400 mt-1">Sin saldo pendiente</p>
                    </>
                  ) : (
                    <>
                      <p className="font-serif text-lg sm:text-2xl font-bold text-white leading-tight">
                        <span className="block text-xs font-mono font-normal text-stone-400">USD</span>
                        <span className="block mt-0.5">{formatBlessUsd(financials.saldoContraEntrega)}</span>
                      </p>
                      <p className="text-[10px] text-stone-400 mt-1">En {BLESS_TOWER_CONFIG.delivery}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Botón WhatsApp de Acción Inmediata */}
            <button
              onClick={contactWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold uppercase tracking-wider text-xs shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <MessageCircle size={17} />
              Reservar Depto {activeUnit?.codigo || ""} por WhatsApp
            </button>
          </div>
        </section>

        {/* ========================================================
            AMENIDADES Y ESPECIFICACIONES
            ======================================================== */}
        <section className="space-y-6">
          <div className="border-b border-stone-200 pb-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#9a7b45]">
              Equipamiento Premium
            </span>
            <h2 className="text-xl font-serif text-stone-900 mt-1">Amenidades del Edificio</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {BLESS_TOWER_CONFIG.amenities.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-stone-200/80">
                <CheckCircle2 size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <span className="text-stone-700 font-light">{item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
