import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  DollarSign,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Flame,
  HardHat,
  Leaf,
  Layers,
  MapPin,
  MessageCircle,
  Percent,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
  X,
  Droplets,
  Zap,
} from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import {
  GARDEN_ZEN_CONFIG,
  GARDEN_ZEN_BASELINE_UNITS,
  GardenZenUnit,
  fetchGardenZenLiveUnits,
  formatGardenZenUsd,
} from "../gardenZenInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

type PaymentModality = "contado" | "initial70" | "initial30";

const GALLERY_SLIDES = [
  {
    src: "/garden_zen/fachada.jpg",
    title: "Fachada Principal Bioclimática",
    category: "Arquitectura",
    desc: "16 niveles con jardines verticales flotantes y orientación solar optimizada.",
  },
  {
    src: "/garden_zen/terraza.jpg",
    title: "Rooftop & Amenities Piso 16",
    category: "Planta Amenidades",
    desc: "Piscina sinfín, sauna seco/vapor, doble churrasquera, co-work y gimnasio.",
  },
  {
    src: "/garden_zen/info_adicional.jpg",
    title: "Diseño Sostenible & Bienestar",
    category: "Eco-Friendly",
    desc: "Paneles solares, recolección de lluvia, 50% menos expensas y Pet Spa.",
  },
  {
    src: "/garden_zen/ubicacion.jpg",
    title: "Ubicación en Equipetrol Norte",
    category: "Emplazamiento",
    desc: "A pasos de Ventura Mall, Supermercado Tía, Manzana 40 y centros empresariales.",
  },
];

export default function GardenZenLanding({ property, onClose }: Props) {
  const [units, setUnits] = useState<GardenZenUnit[]>(GARDEN_ZEN_BASELINE_UNITS);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [activeTab, setActiveTab] = useState<"selector" | "amenities" | "planos" | "ubicacion">("selector");
  const [selectedRoomCount, setSelectedRoomCount] = useState<number>(0); // 0 = Mono, 1 = 1D, 2 = 2D, 3 = 3D
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<GardenZenUnit | null>(null);
  const [paymentModality, setPaymentModality] = useState<PaymentModality>("initial30");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  // Load live units on mount
  useEffect(() => {
    let cancelled = false;
    async function loadLive() {
      setLoadingUnits(true);
      try {
        const live = await fetchGardenZenLiveUnits();
        if (!cancelled && live.length > 0) {
          setUnits(live);
        }
      } finally {
        if (!cancelled) setLoadingUnits(false);
      }
    }
    loadLive();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter available typologies
  const typologies = useMemo(() => {
    const list = [
      { rooms: 0, label: "Monoambiente", icon: "Studio" },
      { rooms: 1, label: "1 Dormitorio", icon: "1D" },
      { rooms: 2, label: "2 Dormitorios", icon: "2D" },
      { rooms: 3, label: "3 Dormitorios", icon: "3D" },
    ];
    return list.map((t) => {
      const matching = units.filter((u) => u.rooms === t.rooms);
      const available = matching.filter((u) => u.status === "disponible");
      const minPrice = available.length > 0
        ? Math.min(...available.map((u) => u.cashTotal))
        : matching.length > 0
        ? Math.min(...matching.map((u) => u.cashTotal))
        : 0;
      return {
        ...t,
        totalCount: matching.length,
        availableCount: available.length,
        minPrice,
      };
    });
  }, [units]);

  // Filter units by typology
  const unitsOfTypology = useMemo(() => {
    return units.filter((u) => u.rooms === selectedRoomCount);
  }, [units, selectedRoomCount]);

  // Distinct floors for this typology
  const availableFloors = useMemo(() => {
    const floorMap = new Map<number, { floor: number; total: number; available: number }>();
    unitsOfTypology.forEach((u) => {
      const existing = floorMap.get(u.floor) || { floor: u.floor, total: 0, available: 0 };
      existing.total += 1;
      if (u.status === "disponible") existing.available += 1;
      floorMap.set(u.floor, existing);
    });
    return Array.from(floorMap.values()).sort((a, b) => a.floor - b.floor);
  }, [unitsOfTypology]);

  // Auto-select first floor when typology changes
  useEffect(() => {
    if (availableFloors.length > 0) {
      const floorWithAvail = availableFloors.find((f) => f.available > 0) || availableFloors[0];
      setSelectedFloor(floorWithAvail.floor);
    } else {
      setSelectedFloor(null);
    }
  }, [selectedRoomCount, availableFloors]);

  // Units in the selected floor
  const floorUnits = useMemo(() => {
    if (selectedFloor === null) return [];
    return unitsOfTypology.filter((u) => u.floor === selectedFloor);
  }, [unitsOfTypology, selectedFloor]);

  // Auto-select unit when floor units change
  useEffect(() => {
    if (floorUnits.length > 0) {
      const available = floorUnits.find((u) => u.status === "disponible") || floorUnits[0];
      setSelectedUnit(available);
    } else {
      setSelectedUnit(null);
    }
  }, [floorUnits]);

  // Financial summary calculations
  const financialSummary = useMemo(() => {
    if (!selectedUnit) return null;
    let price = selectedUnit.cashTotal;
    let pricePerM2 = selectedUnit.cashPerM2;
    let initialPayment = 0;
    let planLabel = "100% Contado";

    if (paymentModality === "initial70") {
      price = selectedUnit.initial70Total;
      pricePerM2 = selectedUnit.initial70PerM2;
      initialPayment = selectedUnit.cuotaInicial70;
      planLabel = "70% Anticipo / 30% Contra Entrega";
    } else if (paymentModality === "initial30") {
      price = selectedUnit.initial30Total;
      pricePerM2 = selectedUnit.initial30PerM2;
      initialPayment = selectedUnit.cuotaInicial30;
      planLabel = "30% Anticipo / 70% Contra Entrega (Marzo 2027)";
    }

    const ahorroContado = selectedUnit.initial30Total > selectedUnit.cashTotal
      ? selectedUnit.initial30Total - selectedUnit.cashTotal
      : 0;

    return {
      price,
      pricePerM2,
      initialPayment,
      planLabel,
      ahorroContado,
      saldoContraEntrega: Math.max(0, price - initialPayment),
    };
  }, [selectedUnit, paymentModality]);

  // Build WhatsApp reservation link
  const whatsappUrl = useMemo(() => {
    if (!selectedUnit || !financialSummary) return "";
    const phone = CONTACT_WHATSAPP_NUMBER || "59157015854";
    const text = `Hola, vengo directo para reservar en Garden Zen la Unidad ${selectedUnit.unitNumber} (${selectedUnit.roomsLabel} - ${selectedUnit.floorLabel}) de ${selectedUnit.areaM2} m² en Equipetrol Norte con modalidad de pago ${financialSummary.planLabel} (Precio: $${formatGardenZenUsd(financialSummary.price)} USD). ¿Con quién puedo coordinar la reserva?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }, [selectedUnit, financialSummary]);

  return (
    <div className="relative min-h-screen bg-[#0A1310] text-[#E4EBE7] font-sans antialiased selection:bg-[#10B981] selection:text-black">
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 border-b border-[#1A2D25] bg-[#0A1310]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#223B30] bg-[#10201A] text-[#93B8A8] transition hover:bg-[#162D24] hover:text-white"
                title="Volver al mapa"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#34D399]">
                  <Leaf size={11} /> Eco-Sostenible
                </span>
                <span className="text-[11px] font-semibold text-[#86A89A]">
                  Entrega Marzo 2027
                </span>
              </div>
              <h1 className="text-lg font-black tracking-tight text-white sm:text-xl">
                Garden Zen · Equipetrol Norte
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                recordLeadEvent({
                  eventType: "lead_generation",
                  propertyRef: "garden-zen",
                  source: "garden_zen_header_cta",
                  contactChannel: "whatsapp",
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#10B981]/20 transition hover:brightness-110 active:scale-95"
            >
              <MessageCircle size={15} />
              <span className="hidden sm:inline">Reservar Unidad</span>
              <span className="sm:hidden">Reservar</span>
            </a>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#223B30] bg-[#10201A] text-[#93B8A8] transition hover:bg-[#162D24] hover:text-white"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[#1A2D25] bg-gradient-to-b from-[#0F1E19] via-[#0A1310] to-[#0A1310] py-8 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Title & Metrics */}
            <div className="space-y-5 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-3.5 py-1 text-xs font-bold tracking-wide text-[#34D399]">
                <Sparkles size={14} />
                <span>PREVENTA EN OBRA FINA · EQUIPETROL NORTE</span>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
                Vivir bien es{" "}
                <span className="bg-gradient-to-r from-[#34D399] via-[#10B981] to-[#6EE7B7] bg-clip-text text-transparent">
                  vivir consciente.
                </span>
              </h2>

              <p className="max-w-2xl text-sm leading-relaxed text-[#9BB7AB] sm:text-base">
                Un proyecto que combina arquitectura minimalista contemporánea, bienestar y sostenibilidad. 
                Paneles solares, recolección de agua pluvial y áreas de relax en la zona con mayor plusvalía de Santa Cruz.
              </p>

              {/* Eco Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
                <div className="rounded-xl border border-[#1A3328] bg-[#0E1A15]/80 p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#82A898]">
                    <Zap size={14} className="text-[#34D399]" /> Expensas
                  </div>
                  <div className="mt-1 text-xl font-black text-white sm:text-2xl">-50%</div>
                  <div className="text-[10px] text-[#6E8F81]">Energía solar común</div>
                </div>

                <div className="rounded-xl border border-[#1A3328] bg-[#0E1A15]/80 p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#82A898]">
                    <Droplets size={14} className="text-[#34D399]" /> Agua
                  </div>
                  <div className="mt-1 text-xl font-black text-white sm:text-2xl">-30%</div>
                  <div className="text-[10px] text-[#6E8F81]">Riego pluvial inteligente</div>
                </div>

                <div className="rounded-xl border border-[#1A3328] bg-[#0E1A15]/80 p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#82A898]">
                    <TrendingUp size={14} className="text-[#34D399]" /> Renta
                  </div>
                  <div className="mt-1 text-xl font-black text-white sm:text-2xl">+8%</div>
                  <div className="text-[10px] text-[#6E8F81]">Plusvalía & Airbnb</div>
                </div>

                <div className="rounded-xl border border-[#1A3328] bg-[#0E1A15]/80 p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#82A898]">
                    <ShieldCheck size={14} className="text-[#34D399]" /> Reserva
                  </div>
                  <div className="mt-1 text-xl font-black text-white sm:text-2xl">30%</div>
                  <div className="text-[10px] text-[#6E8F81]">Saldo Marzo 2027</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Image with Overlay */}
            <div className="relative lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border border-[#1D3B2E] shadow-2xl shadow-[#10B981]/5">
                <img
                  src="/garden_zen/fachada.jpg"
                  alt="Torre Garden Zen Equipetrol"
                  className="h-80 w-full object-cover sm:h-96"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1310] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-[#1E3A2D] bg-[#0C1813]/90 p-3 backdrop-blur-md">
                  <div>
                    <div className="text-[11px] font-semibold text-[#85A898]">Desde Contado</div>
                    <div className="text-xl font-black text-white">$56.210 USD</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("selector-section");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#10B981] px-3.5 py-1.5 text-xs font-bold text-black transition hover:bg-[#34D399]"
                  >
                    Ver Disponibles <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE NAVIGATION TABS */}
      <nav className="sticky top-[61px] z-30 border-b border-[#1A2D25] bg-[#0A1310]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6">
          <button
            type="button"
            onClick={() => setActiveTab("selector")}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition ${
              activeTab === "selector"
                ? "bg-[#10B981] text-black shadow-md shadow-[#10B981]/20"
                : "text-[#8CAEA0] hover:bg-[#12231C] hover:text-white"
            }`}
          >
            🎯 Selector de Unidades
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("amenities")}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition ${
              activeTab === "amenities"
                ? "bg-[#10B981] text-black shadow-md shadow-[#10B981]/20"
                : "text-[#8CAEA0] hover:bg-[#12231C] hover:text-white"
            }`}
          >
            🌿 Amenidades & Bienestar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("planos")}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition ${
              activeTab === "planos"
                ? "bg-[#10B981] text-black shadow-md shadow-[#10B981]/20"
                : "text-[#8CAEA0] hover:bg-[#12231C] hover:text-white"
            }`}
          >
            📐 Planos & Modelos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ubicacion")}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition ${
              activeTab === "ubicacion"
                ? "bg-[#10B981] text-black shadow-md shadow-[#10B981]/20"
                : "text-[#8CAEA0] hover:bg-[#12231C] hover:text-white"
            }`}
          >
            📍 Ubicación Estratégica
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {/* TAB 1: SELECTOR DE UNIDADES */}
        {activeTab === "selector" && (
          <div id="selector-section" className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10B981]">
                <Sparkles size={14} /> Flujo de Reserva en 4 Pasos
              </div>
              <h3 className="text-2xl font-black text-white sm:text-3xl">
                Elige tu unidad ideal en Garden Zen
              </h3>
              <p className="text-xs text-[#8BAEA0] sm:text-sm">
                Selecciona la tipología, el piso y la modalidad de pago que mejor se adapte a tu plan de inversión.
              </p>
            </div>

            {/* STEP 1: TYPOLOGY SELECTOR */}
            <div className="space-y-3 rounded-2xl border border-[#193327] bg-[#0C1713] p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#34D399]">
                  Paso 1: Tipología de Departamento
                </span>
                <span className="text-xs text-[#709586]">
                  {units.filter((u) => u.status === "disponible").length} unidades libres
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {typologies.map((t) => {
                  const isSelected = selectedRoomCount === t.rooms;
                  return (
                    <button
                      key={t.rooms}
                      type="button"
                      onClick={() => setSelectedRoomCount(t.rooms)}
                      className={`relative flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
                        isSelected
                          ? "border-[#10B981] bg-[#12261E] shadow-lg shadow-[#10B981]/15"
                          : "border-[#1A3328] bg-[#0E1A15] hover:border-[#254638] hover:bg-[#11211A]"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className={`text-xs font-black uppercase ${isSelected ? "text-[#34D399]" : "text-white"}`}>
                          {t.label}
                        </span>
                        {isSelected && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#10B981] text-black">
                            <Check size={11} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm font-black text-white">
                        {t.availableCount > 0 ? (
                          <>Desde ${formatGardenZenUsd(t.minPrice)}</>
                        ) : (
                          <span className="text-[#E11D48]">Agotado</span>
                        )}
                      </div>
                      <div className="mt-1 text-[11px] text-[#719586]">
                        {t.availableCount} disponibles ({t.totalCount} tot.)
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: FLOOR SELECTOR */}
            <div className="space-y-3 rounded-2xl border border-[#193327] bg-[#0C1713] p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#34D399]">
                  Paso 2: Selección de Piso
                </span>
                <span className="text-xs text-[#709586]">
                  {availableFloors.length} pisos con esta tipología
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableFloors.map((f) => {
                  const isSelected = selectedFloor === f.floor;
                  const hasAvailable = f.available > 0;
                  return (
                    <button
                      key={f.floor}
                      type="button"
                      onClick={() => setSelectedFloor(f.floor)}
                      className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                        isSelected
                          ? "bg-[#10B981] text-black shadow-md shadow-[#10B981]/25"
                          : hasAvailable
                          ? "border border-[#1D3B2E] bg-[#0F1E19] text-[#CFE2D8] hover:border-[#2D5A47] hover:bg-[#142B23]"
                          : "border border-[#1E2923] bg-[#0A120E] text-[#556D62] opacity-60"
                      }`}
                    >
                      <span>Piso {f.floor}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[9px] font-black ${
                          isSelected
                            ? "bg-black/30 text-white"
                            : hasAvailable
                            ? "bg-[#10B981]/20 text-[#34D399]"
                            : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {f.available > 0 ? `${f.available} libre` : "0"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: UNIT SELECTOR */}
            <div className="space-y-3 rounded-2xl border border-[#193327] bg-[#0C1713] p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#34D399]">
                  Paso 3: Unidades en Piso {selectedFloor}
                </span>
                <span className="text-xs text-[#709586]">
                  {floorUnits.length} departamentos en este piso
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {floorUnits.map((u) => {
                  const isSelected = selectedUnit?.unitNumber === u.unitNumber;
                  const isAvailable = u.status === "disponible";
                  return (
                    <button
                      key={u.unitNumber}
                      type="button"
                      onClick={() => isAvailable && setSelectedUnit(u)}
                      disabled={!isAvailable}
                      className={`relative flex flex-col rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-[#10B981] bg-[#12281F] shadow-lg shadow-[#10B981]/15"
                          : isAvailable
                          ? "border-[#1B362A] bg-[#0E1B16] hover:border-[#295240] hover:bg-[#12241D]"
                          : "border-[#182620] bg-[#0A130F] opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-white">
                            Unidad {u.unitNumber}
                          </span>
                          <span className="rounded bg-[#1A3328] px-1.5 py-0.5 text-[10px] font-bold text-[#89AEA0]">
                            Mod. {u.modelo}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            isAvailable
                              ? "bg-[#10B981]/15 text-[#34D399]"
                              : "bg-red-900/20 text-red-400"
                          }`}
                        >
                          {isAvailable ? "Disponible" : "Vendido"}
                        </span>
                      </div>

                      <div className="mt-3 flex items-baseline justify-between">
                        <div className="text-xs text-[#7E9E91]">{u.areaM2} m² totales</div>
                        <div className="text-base font-black text-white">
                          ${formatGardenZenUsd(u.cashTotal)} USD
                        </div>
                      </div>

                      <div className="mt-1 text-[11px] text-[#5D8072]">
                        ${formatGardenZenUsd(u.cashPerM2)}/m² al contado
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 4 & FINANCIAL SUMMARY */}
            {selectedUnit && financialSummary && (
              <div className="overflow-hidden rounded-2xl border border-[#10B981]/40 bg-gradient-to-b from-[#11241C] to-[#0B1612] p-5 shadow-2xl shadow-[#10B981]/10 sm:p-8">
                <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
                  {/* Left Column: Modality picker */}
                  <div className="space-y-4 lg:col-span-6">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#10B981] text-xs font-black text-black">
                        4
                      </span>
                      <h4 className="text-lg font-black text-white">
                        Modalidad de Pago para Unidad {selectedUnit.unitNumber}
                      </h4>
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setPaymentModality("initial30")}
                        className={`w-full rounded-xl border p-3.5 text-left transition ${
                          paymentModality === "initial30"
                            ? "border-[#10B981] bg-[#142B21] shadow-md shadow-[#10B981]/10"
                            : "border-[#1B3629] bg-[#0E1A15] hover:bg-[#12221B]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">
                            30% Anticipo + Saldo Contra Entrega (Marzo 2027)
                          </span>
                          <span className="rounded bg-[#10B981]/20 px-2 py-0.5 text-[10px] font-bold text-[#34D399]">
                            Más Popular
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-[#7F9E92]">
                          Reserva con solo ${formatGardenZenUsd(selectedUnit.cuotaInicial30)} USD (30%)
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentModality("contado")}
                        className={`w-full rounded-xl border p-3.5 text-left transition ${
                          paymentModality === "contado"
                            ? "border-[#10B981] bg-[#142B21] shadow-md shadow-[#10B981]/10"
                            : "border-[#1B3629] bg-[#0E1A15] hover:bg-[#12221B]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">
                            100% Contado (Mayor Descuento)
                          </span>
                          {financialSummary.ahorroContado > 0 && (
                            <span className="rounded bg-[#E0A96D]/20 px-2 py-0.5 text-[10px] font-bold text-[#E0A96D]">
                              Ahorro: ${formatGardenZenUsd(financialSummary.ahorroContado)} USD
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-[#7F9E92]">
                          ${formatGardenZenUsd(selectedUnit.cashPerM2)} USD/m²
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentModality("initial70")}
                        className={`w-full rounded-xl border p-3.5 text-left transition ${
                          paymentModality === "initial70"
                            ? "border-[#10B981] bg-[#142B21] shadow-md shadow-[#10B981]/10"
                            : "border-[#1B3629] bg-[#0E1A15] hover:bg-[#12221B]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">
                            70% Anticipo + 30% Contra Entrega
                          </span>
                          <span className="text-xs text-[#34D399]">
                            ${formatGardenZenUsd(selectedUnit.initial70PerM2)}/m²
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-[#7F9E92]">
                          Pago inicial de ${formatGardenZenUsd(selectedUnit.cuotaInicial70)} USD
                        </div>
                      </button>
                    </div>

                    {/* Floor Plan Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowPlanModal(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#234536] bg-[#12241D] px-3.5 py-2 text-xs font-bold text-[#B0D1C4] transition hover:bg-[#183127] hover:text-white"
                      >
                        <FileText size={14} className="text-[#10B981]" />
                        <span>Ver Plano Arquitectónico (Mod. {selectedUnit.modelo})</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Pricing breakdown card & WhatsApp Action */}
                  <div className="rounded-2xl border border-[#1E3B2E] bg-[#09130F] p-5 lg:col-span-6">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#799D8F]">
                      Resumen Financiero · Unidad {selectedUnit.unitNumber}
                    </div>

                    <div className="mt-3 flex items-baseline justify-between border-b border-[#182C23] pb-3">
                      <div className="text-sm text-[#A0C0B3]">Precio Total:</div>
                      <div className="text-3xl font-black text-white">
                        ${formatGardenZenUsd(financialSummary.price)}{" "}
                        <span className="text-sm font-semibold text-[#6E9082]">USD</span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between text-[#8DAEA1]">
                        <span>Superficie:</span>
                        <span className="font-bold text-white">{selectedUnit.areaM2} m²</span>
                      </div>
                      <div className="flex justify-between text-[#8DAEA1]">
                        <span>Valor por m²:</span>
                        <span className="font-bold text-white">
                          ${formatGardenZenUsd(financialSummary.pricePerM2)} USD/m²
                        </span>
                      </div>
                      <div className="flex justify-between text-[#8DAEA1]">
                        <span>Cuota Inicial:</span>
                        <span className="font-bold text-[#34D399]">
                          ${formatGardenZenUsd(financialSummary.initialPayment)} USD
                        </span>
                      </div>
                      <div className="flex justify-between text-[#8DAEA1]">
                        <span>Saldo contra entrega:</span>
                        <span className="font-bold text-white">
                          ${formatGardenZenUsd(financialSummary.saldoContraEntrega)} USD
                        </span>
                      </div>
                      <div className="flex justify-between text-[#8DAEA1]">
                        <span>Fecha de Entrega:</span>
                        <span className="font-bold text-[#34D399]">Marzo 2027</span>
                      </div>
                    </div>

                    {/* Direct WhatsApp Action Button */}
                    <div className="mt-6">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          recordLeadEvent({
                            eventType: "lead_generation",
                            propertyRef: "garden-zen",
                            source: "garden_zen_unit_selector",
                            contactChannel: "whatsapp",
                          });
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] py-3.5 text-center text-sm font-black text-white shadow-xl shadow-[#10B981]/25 transition hover:brightness-110 active:scale-[0.98]"
                      >
                        <MessageCircle size={18} />
                        <span>Reservar Unidad {selectedUnit.unitNumber} por WhatsApp</span>
                      </a>
                      <p className="mt-2 text-center text-[10px] text-[#6E8F82]">
                        Reserva directa con Alejandro Coca · Sin comisiones ni intermediarios
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AMENIDADES & BIENESTAR */}
        {activeTab === "amenities" && (
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10B981]">
                <Leaf size={14} /> Espacios de Conexión & Relax
              </div>
              <h3 className="text-2xl font-black text-white sm:text-3xl">
                Amenidades diseñadas para vivir y trabajar en calma
              </h3>
              <p className="max-w-2xl text-xs text-[#8BAEA0] sm:text-sm">
                Rooftop en Piso 16 con vista panorámica, piscina sinfín y áreas comunes sostenibles alimentadas por energía solar.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {GARDEN_ZEN_CONFIG.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#1A3327] bg-[#0E1A15] p-5 transition hover:border-[#274D3B] hover:bg-[#11231D]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10B981]/15 text-[#34D399]">
                    <CheckCircle2 size={20} />
                  </div>
                  <h4 className="mt-3 text-base font-bold text-white">{amenity}</h4>
                  <p className="mt-1 text-xs text-[#7F9E92]">
                    Materiales de alta durabilidad, bajo consumo y mantenimiento eficiente.
                  </p>
                </div>
              ))}
            </div>

            {/* Gallery Image */}
            <div className="overflow-hidden rounded-2xl border border-[#1A3327]">
              <img
                src="/garden_zen/terraza.jpg"
                alt="Planta de Terraza Garden Zen"
                className="w-full bg-[#070E0B] object-contain p-4"
              />
            </div>
          </div>
        )}

        {/* TAB 3: PLANOS & MODELOS */}
        {activeTab === "planos" && (
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10B981]">
                <Layers size={14} /> Arquitectura Inteligente
              </div>
              <h3 className="text-2xl font-black text-white sm:text-3xl">
                Modelos y Distribución de Plantas
              </h3>
              <p className="text-xs text-[#8BAEA0] sm:text-sm">
                Diseñados para maximizar la ventilación cruzada y la luz natural en cada ambiente.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { modelo: "MP", title: "Monoambiente MP", area: "40.15 - 52.58 m²", img: "/garden_zen/plano_mono_mp.jpg" },
                { modelo: "M1", title: "Monoambiente M1", area: "40.48 - 40.49 m²", img: "/garden_zen/plano_mono_m1.jpg" },
                { modelo: "ML", title: "Monoambiente ML", area: "37.84 m²", img: "/garden_zen/plano_mono_ml.jpg" },
                { modelo: "B1", title: "1 Dormitorio B1", area: "46.10 - 58.95 m²", img: "/garden_zen/plano_1dorm_b1.jpg" },
                { modelo: "I1", title: "1 Dormitorio I1", area: "56.21 - 69.96 m²", img: "/garden_zen/plano_1dorm_i1.jpg" },
                { modelo: "D2", title: "2 Dormitorios D2", area: "81.20 - 85.00 m²", img: "/garden_zen/plano_2dorm_d2.jpg" },
                { modelo: "E2", title: "2 Dormitorios E2", area: "107.61 m²", img: "/garden_zen/plano_2dorm_e2.jpg" },
                { modelo: "B3", title: "3 Dormitorios B3", area: "106.12 - 133.49 m²", img: "/garden_zen/plano_3dorm_b3.jpg" },
              ].map((item) => (
                <div
                  key={item.modelo}
                  className="overflow-hidden rounded-xl border border-[#1A3327] bg-[#0E1A15]"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-white">{item.title}</span>
                      <span className="text-xs font-semibold text-[#10B981]">{item.area}</span>
                    </div>
                  </div>
                  <div className="relative border-t border-[#162B21] bg-[#070D0A] p-2">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="h-60 w-full object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: UBICACION ESTRATEGICA */}
        {activeTab === "ubicacion" && (
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10B981]">
                <MapPin size={14} /> Equipetrol Norte
              </div>
              <h3 className="text-2xl font-black text-white sm:text-3xl">
                En el epicentro corporativo y residencial de Santa Cruz
              </h3>
              <p className="max-w-2xl text-xs text-[#8BAEA0] sm:text-sm">
                Calle Dra. María de Oliveira, a pasos de Ventura Mall, Supermercado Tía, Manzana 40 y centros de salud y negocios.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#1A3327] bg-[#0E1A15]">
              <img
                src="/garden_zen/ubicacion.jpg"
                alt="Mapa de Ubicación Garden Zen Equipetrol"
                className="w-full object-cover"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#1A3328] bg-[#0E1B16] p-4">
                <div className="text-sm font-bold text-white">Comercio & Entretenimiento</div>
                <div className="mt-1 text-xs text-[#85A898]">
                  Ventura Mall, Cines, Restaurantes de autor y Supermercado Tía a pasos.
                </div>
              </div>
              <div className="rounded-xl border border-[#1A3328] bg-[#0E1B16] p-4">
                <div className="text-sm font-bold text-white">Distrito Corporativo</div>
                <div className="mt-1 text-xs text-[#85A898]">
                  Manzana 40, Green Tower, Torre Platinum, Banco Mercantil y centros financieros.
                </div>
              </div>
              <div className="rounded-xl border border-[#1A3328] bg-[#0E1B16] p-4">
                <div className="text-sm font-bold text-white">Conectividad Total</div>
                <div className="mt-1 text-xs text-[#85A898]">
                  Acceso directo a Av. San Martín, 3er y 4to Anillo y puentes a Urubó.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL PLANO ARQUITECTONICO */}
      <AnimatePresence>
        {showPlanModal && selectedUnit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#1D3B2E] bg-[#0C1713] p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#1A3328] pb-4">
                <div>
                  <h4 className="text-lg font-black text-white">
                    Plano Modelo {selectedUnit.modelo} · Unidad {selectedUnit.unitNumber}
                  </h4>
                  <div className="text-xs text-[#85A898]">
                    {selectedUnit.roomsLabel} · {selectedUnit.areaM2} m² · {selectedUnit.floorLabel}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#162D24] text-white hover:bg-[#203F32]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center rounded-xl bg-black/50 p-4">
                <img
                  src={selectedUnit.planoUrl}
                  alt={`Plano Modelo ${selectedUnit.modelo}`}
                  className="max-h-[60vh] w-full object-contain"
                />
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="text-xs text-[#85A898]">
                  Precio Contado: <span className="font-bold text-white">${formatGardenZenUsd(selectedUnit.cashTotal)} USD</span>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#10B981] px-4 py-2 text-xs font-bold text-black transition hover:bg-[#34D399]"
                >
                  <MessageCircle size={14} /> Reservar Ahora
                </a>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
