import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Building2,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  FileText,
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
  ONA_ADDRESS,
  ONA_BROCHURE_URL,
  ONA_BUILDER,
  ONA_DELIVERY,
  ONA_RESERVE_USD,
  ONA_UNITS,
  ONA_ZONE,
  OnaUnit,
  fetchOnaLiveUnits,
  formatOnaUsd,
} from "../onaInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

const HERO_IMAGES = [
  { src: "/ona/fachada-dia.jpg", label: "Fachada de Día" },
  { src: "/ona/fachada-atardecer.jpg", label: "Fachada Atardecer" },
  { src: "/ona/fachada-noche.jpg", label: "Fachada Nocturna" },
  { src: "/ona/lobby.jpg", label: "Lobby de Ingreso" },
  { src: "/ona/piscina.jpg", label: "Piscina & Deck" },
];

const AMENITY_ITEMS = [
  {
    src: "/ona/piscina.jpg",
    category: "Piscina",
    title: "Piscina con Área de Playa",
    description:
      "Piscina amplia con ingreso suave y palmeras en el entorno. Un espacio relajante para refrescarte y disfrutar los días de sol con total comodidad dentro de tu propio edificio.",
  },
  {
    src: "/ona/hidromasaje.jpg",
    category: "Wellness",
    title: "Hidromasaje en Piscina",
    description:
      "Sector de hidromasaje integrado dentro de la piscina principal. El rincón pensado para desconectar de la rutina y relajarte al aire libre al terminar la jornada.",
  },
  {
    src: "/ona/reposeras.jpg",
    category: "Solarium",
    title: "Deck con Reposeras",
    description:
      "Área de descanso al aire libre junto a la piscina con deck y reposeras, ideal para tomar sol, leer o compartir una tarde tranquila.",
  },
  {
    src: "/ona/sauna.jpg",
    category: "Relax",
    title: "Sauna Seco",
    description:
      "Sauna seco completamente equipado con revestimiento en madera natural. Diseñado para descontracturar el cuerpo y renovar energías sin salir de casa.",
  },
  {
    src: "/ona/gym.jpg",
    category: "Fitness",
    title: "Gimnasio Equipado",
    description:
      "Área de entrenamiento climatizada con máquinas de cardio y fuerza de primera línea. Todo lo necesario para mantener tu rutina activa de forma cómoda y segura.",
  },
  {
    src: "/ona/churrasquera.jpg",
    category: "Gastronomía",
    title: "Churrasqueras Equipadas",
    description:
      "Dos churrasqueras en el área social con mesón de apoyo y espacio para mesas, preparadas para ser el punto de encuentro en almuerzos y asados familiares.",
  },
  {
    src: "/ona/fogata.jpg",
    category: "Área Social",
    title: "Área Social con Fogata",
    description:
      "Espacio exterior al aire libre con fogonero central y asientos integrados, ideal para disfrutar de conversaciones y veladas agradables por la noche.",
  },
  {
    src: "/ona/salon.jpg",
    category: "Coworking & Eventos",
    title: "Salón de Reuniones y Coworking",
    description:
      "Ambiente polivalente climatizado y equipado para trabajar concentrado, coordinar reuniones de negocios o festejar ocasiones especiales.",
  },
  {
    src: "/ona/lobby.jpg",
    category: "Acceso & Seguridad",
    title: "Lobby de Doble Altura con Seguridad 24/7",
    description:
      "Recepción amoblada e iluminada con control de acceso y seguridad permanente para brindarte tranquilidad y una bienvenida de primer nivel.",
  },
];

interface TypologyConfig {
  id: string;
  name: string;
  shortName: string;
  rooms: number;
  areaM2: number;
  balconyM2: number | null;
  planImage: string;
  view: string;
  rentMin: number;
  rentMax: number;
  yieldRange: string;
  matchUnit: (u: OnaUnit) => boolean;
  highlights: string[];
}

const TYPOLOGY_CONFIGS: TypologyConfig[] = [
  {
    id: "1D-32",
    name: "1 Dormitorio Master",
    shortName: "1 Dorm · 32,3 m²",
    rooms: 1,
    areaM2: 32.3,
    balconyM2: null,
    planImage: "/ona/tipo-32.jpg",
    view: "Vista Lateral (Este / Oeste)",
    rentMin: 350,
    rentMax: 375,
    yieldRange: "10,4% – 11,1%",
    matchUnit: (u) => u.rooms === 1 && (u.tipo === "3" || u.tipo === "4"),
    highlights: [
      "Living-comedor integrado con excelente iluminación natural",
      "Cocina de diseño con cajonería y mesón de granito",
      "Dormitorio independiente con ropero empotrado a medida",
      "Alta demanda de alquiler en Santa Cruz con excelente rentabilidad",
    ],
  },
  {
    id: "2D-54",
    name: "2 Dormitorios Confort",
    shortName: "2 Dorms · 54,1 m²",
    rooms: 2,
    areaM2: 54.14,
    balconyM2: null,
    planImage: "/ona/tipo-54.jpg",
    view: "Vista Lateral (Tipo 1)",
    rentMin: 520,
    rentMax: 560,
    yieldRange: "9,2% – 9,9%",
    matchUnit: (u) => u.rooms === 2 && u.tipo === "1",
    highlights: [
      "2 habitaciones independientes con amplios closets empotrados",
      "Living social amplio con circulación optimizada",
      "Cocina americana moderna con barra desayunadora",
      "Ideal para familias jóvenes o alquiler ejecutivo corporativo",
    ],
  },
  {
    id: "2D-92-cusis",
    name: "2 Dorms Suite Frontal (Av. Los Cusis)",
    shortName: "2 Dorms Suite · 92 m² (Frontal)",
    rooms: 2,
    areaM2: 92.0,
    balconyM2: 5.55,
    planImage: "/ona/tipo-92.jpg",
    view: "Vista Frontal Av. Los Cusis (Tipo 2)",
    rentMin: 750,
    rentMax: 830,
    yieldRange: "7,8% – 8,7%",
    matchUnit: (u) => u.rooms === 2 && u.tipo === "2",
    highlights: [
      "86,5 m² interiores + 5,55 m² de terraza balcón panorámica",
      "Vista frontal privilegiada hacia Av. Los Cusis",
      "Dormitorio máster en suite con vestidor privado",
      "El estándar residencial más exclusivo de ONA Residences",
    ],
  },
  {
    id: "2D-92-post",
    name: "2 Dorms Suite Posterior",
    shortName: "2 Dorms Suite · 92 m² (Posterior)",
    rooms: 2,
    areaM2: 92.05,
    balconyM2: 5.55,
    planImage: "/ona/tipo-92.jpg",
    view: "Vista Posterior Tranquila (Tipo 5)",
    rentMin: 750,
    rentMax: 830,
    yieldRange: "7,8% – 8,7%",
    matchUnit: (u) => u.rooms === 2 && u.tipo === "5",
    highlights: [
      "86,5 m² interiores + balcón terraza privado hacia patio interior",
      "Orientación silenciosa protegida de ruidos viales",
      "Habitaciones amplias con baño en suite y baño de visitas",
      "Excelente relación precio/metro cuadrado en suite",
    ],
  },
];

type PaymentPlan = "cash" | "plan60" | "plan40";

export default function OnaLanding({ property, onClose }: Props) {
  const [units, setUnits] = useState<OnaUnit[]>(ONA_UNITS);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [activeTab, setActiveTab] = useState<"selector" | "amenities" | "planos" | "ubicacion">("selector");
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // Selector Step State
  const [selectedTypologyId, setSelectedTypologyId] = useState<string>("1D-32");
  const [selectedFloor, setSelectedFloor] = useState<number | null>(2);
  const [selectedUnit, setSelectedUnit] = useState<OnaUnit | null>(null);
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("cash");

  // Modal Plan Viewer
  const [zoomPlanImage, setZoomPlanImage] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState(false);

  // Load live units on mount
  useEffect(() => {
    let cancelled = false;
    async function loadLive() {
      setLoadingUnits(true);
      try {
        const live = await fetchOnaLiveUnits();
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

  // Active Typology Config
  const activeTypology = useMemo(() => {
    return TYPOLOGY_CONFIGS.find((t) => t.id === selectedTypologyId) || TYPOLOGY_CONFIGS[0];
  }, [selectedTypologyId]);

  // Units matching active typology
  const unitsOfTypology = useMemo(() => {
    return units.filter(activeTypology.matchUnit);
  }, [units, activeTypology]);

  // Available floors for active typology
  const availableFloors = useMemo(() => {
    const floorSet = new Set<number>();
    unitsOfTypology.forEach((u) => floorSet.add(u.floor));
    return Array.from(floorSet).sort((a, b) => a - b);
  }, [unitsOfTypology]);

  // Ensure selected floor is valid when typology changes
  useEffect(() => {
    if (selectedFloor === null || !availableFloors.includes(selectedFloor)) {
      const firstAvailableFloor = availableFloors.find((f) =>
        unitsOfTypology.some((u) => u.floor === f && u.status === "disponible")
      );
      setSelectedFloor(firstAvailableFloor ?? availableFloors[0] ?? 2);
    }
  }, [availableFloors, unitsOfTypology, selectedFloor]);

  // Units on current floor
  const unitsOnFloor = useMemo(() => {
    if (selectedFloor === null) return [];
    return unitsOfTypology.filter((u) => u.floor === selectedFloor);
  }, [unitsOfTypology, selectedFloor]);

  // Auto-select first available unit on floor or fallback
  useEffect(() => {
    if (unitsOnFloor.length === 0) {
      setSelectedUnit(null);
      return;
    }
    const currentUnitStillValid = unitsOnFloor.find(
      (u) => selectedUnit && u.floor === selectedUnit.floor && u.tipo === selectedUnit.tipo
    );
    if (currentUnitStillValid) {
      setSelectedUnit(currentUnitStillValid);
    } else {
      const disp = unitsOnFloor.find((u) => u.status === "disponible");
      setSelectedUnit(disp || unitsOnFloor[0]);
    }
  }, [unitsOnFloor]);

  // Financial calculations
  const financialSummary = useMemo(() => {
    if (!selectedUnit) return null;

    let price = selectedUnit.cash;
    let initialPayment = selectedUnit.cash;
    let planLabel = "100% Contado (Máximo Descuento)";
    let saldoContraEntrega = 0;

    if (paymentPlan === "plan60") {
      price = selectedUnit.plan60.total;
      initialPayment = selectedUnit.plan60.initial;
      saldoContraEntrega = Math.max(0, price - initialPayment);
      planLabel = "Plan 60% Inicial / 40% Contra Entrega";
    } else if (paymentPlan === "plan40") {
      price = selectedUnit.plan40.total;
      initialPayment = selectedUnit.plan40.initial;
      saldoContraEntrega = Math.max(0, price - initialPayment);
      planLabel = "Plan 40% Inicial / 60% Contra Entrega";
    }

    const maxPlanTotal = selectedUnit.plan40.total;
    const ahorroContado = Math.max(0, maxPlanTotal - selectedUnit.cash);

    return {
      price,
      initialPayment,
      saldoContraEntrega,
      planLabel,
      ahorroContado,
      reserveUsd: ONA_RESERVE_USD,
      cashPrice: selectedUnit.cash,
    };
  }, [selectedUnit, paymentPlan]);

  // WhatsApp reservation link
  const whatsappUrl = useMemo(() => {
    const phone = CONTACT_WHATSAPP_NUMBER || "59157015854";
    if (!selectedUnit || !financialSummary) {
      const text = `Hola, quiero consultar sobre disponibilidad en ONA Residences (${ONA_ZONE}).`;
      return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    }
    const text = `Hola, vengo directo para reservar en ONA Residences la Unidad Piso ${selectedUnit.floor} - Tipo ${selectedUnit.tipo} (${activeTypology.name}) de ${selectedUnit.totalM2} m² (${selectedUnit.view}) con modalidad ${financialSummary.planLabel} (Precio: $${formatOnaUsd(financialSummary.price)} USD - Reserva: $${formatOnaUsd(ONA_RESERVE_USD)} USD). ¿Con quién puedo coordinar la reserva formal?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }, [selectedUnit, activeTypology, financialSummary]);

  const handleShare = () => {
    recordLeadEvent({
      action: "share_project",
      propertyRef: "ona",
      operacion: "Preventa",
      zona: ONA_ZONE,
    }).catch(() => {});
    const url = window.location.origin + window.location.pathname + "?proyecto=ona";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setShareFeedback(true);
        setTimeout(() => setShareFeedback(false), 2500);
      });
    }
  };

  const handleTrackLead = (source: string) => {
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: "ona",
      operacion: "Preventa",
      zona: ONA_ZONE,
      detalles: `source:${source}|unit:${selectedUnit ? `P${selectedUnit.floor}-T${selectedUnit.tipo}` : "general"}`,
    }).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0c0e12] text-stone-100 font-sans antialiased selection:bg-[#D4AF37] selection:text-black">
      {/* 1. HEADER BAR ESTANDAR */}
      <header className="sticky top-0 z-40 border-b border-stone-800/80 bg-[#0c0e12]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-800 bg-stone-900 text-stone-300 transition hover:bg-stone-800 hover:text-white"
                title="Volver al mapa"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#E8C872]">
                  <Sparkles size={11} /> Preventa 1.ª Fase
                </span>
                <span className="text-[11px] font-semibold text-stone-400">
                  Entrega {ONA_DELIVERY}
                </span>
              </div>
              <h1 className="text-lg font-black tracking-tight text-white sm:text-xl">
                ONA Residences · {ONA_ZONE}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-stone-800 bg-stone-900/90 px-3 py-2 text-xs font-semibold text-stone-300 transition hover:bg-stone-800 hover:text-white"
              title="Compartir enlace de ONA"
            >
              {shareFeedback ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} className="text-[#E8C872]" />
                  <span>Compartir</span>
                </>
              )}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleTrackLead("header_cta")}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8942A] px-4 py-2 text-xs font-bold text-black shadow-lg shadow-amber-500/15 transition hover:brightness-110 active:scale-95"
            >
              <MessageCircle size={15} />
              <span className="hidden sm:inline">Reservar Unidad</span>
              <span className="sm:hidden">Reservar</span>
            </a>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-800 bg-stone-900 text-stone-300 transition hover:bg-stone-800 hover:text-white"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION CON SELECTOR DE FOTOGRAFÍA EDITORIAL */}
      <section className="relative border-b border-stone-800/80 bg-gradient-to-b from-[#13161c] to-[#0c0e12] py-8 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Columna Izquierda: Mensaje y Métricas */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#E8C872]">
                <ShieldCheck size={14} />
                <span>Desarrollado por {ONA_BUILDER}</span>
              </div>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl sm:leading-tight">
                Eleva tu vida en <span className="text-[#E8C872]">equilibrio</span> y armonía.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-300 sm:text-base">
                ONA Residences reúne arquitectura contemporánea, diseño biofílico y ambientes pensados para combinar
                confort, serenidad y plusvalía en una de las zonas residenciales más cotizadas de Santa Cruz:{" "}
                <strong className="text-white">{ONA_ZONE}</strong>, sobre la tradicional {ONA_ADDRESS}.
              </p>

              {/* Grid de 4 Métricas Clave */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-3.5 backdrop-blur">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Calendar size={14} className="text-[#E8C872]" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Entrega</span>
                  </div>
                  <p className="mt-1 text-base font-black text-white sm:text-lg">{ONA_DELIVERY}</p>
                  <p className="text-[10px] text-stone-400">1.ª Fase Preventa</p>
                </div>

                <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-3.5 backdrop-blur">
                  <div className="flex items-center gap-2 text-stone-400">
                    <TrendingUp size={14} className="text-[#E8C872]" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Desde</span>
                  </div>
                  <p className="mt-1 text-base font-black text-emerald-400 sm:text-lg">$40.375 USD</p>
                  <p className="text-[10px] text-stone-400">Contado 32 m²</p>
                </div>

                <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-3.5 backdrop-blur">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Building2 size={14} className="text-[#E8C872]" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Reserva</span>
                  </div>
                  <p className="mt-1 text-base font-black text-[#E8C872] sm:text-lg">
                    ${formatOnaUsd(ONA_RESERVE_USD)} USD
                  </p>
                  <p className="text-[10px] text-stone-400">Congela precio oficial</p>
                </div>

                <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-3.5 backdrop-blur">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Layers size={14} className="text-[#E8C872]" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Unidades</span>
                  </div>
                  <p className="mt-1 text-base font-black text-white sm:text-lg">
                    {units.filter((u) => u.status === "disponible").length} / {units.length}
                  </p>
                  <p className="text-[10px] text-stone-400">Disponibilidad en vivo</p>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Render Principal y Switcher */}
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-950 shadow-2xl">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-900">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={HERO_IMAGES[activeHeroIndex].src}
                      src={HERO_IMAGES[activeHeroIndex].src}
                      alt={HERO_IMAGES[activeHeroIndex].label}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="h-full w-full object-cover"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="rounded-full bg-black/60 px-3 py-1 font-semibold backdrop-blur border border-white/10">
                      {HERO_IMAGES[activeHeroIndex].label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomPlanImage(HERO_IMAGES[activeHeroIndex].src)}
                      className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-stone-200 backdrop-blur hover:text-white border border-white/10"
                    >
                      <Maximize2 size={12} /> Ampliar
                    </button>
                  </div>
                </div>

                {/* Miniaturas */}
                <div className="flex gap-2 p-3 overflow-x-auto scrollbar-none bg-[#101217]">
                  {HERO_IMAGES.map((img, idx) => (
                    <button
                      key={img.src}
                      type="button"
                      onClick={() => setActiveHeroIndex(idx)}
                      className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border transition-all ${
                        activeHeroIndex === idx
                          ? "border-[#E8C872] ring-2 ring-[#E8C872]/40"
                          : "border-stone-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img.src} alt={img.label} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TABS DE NAVEGACION ESTANDAR */}
      <div className="sticky top-[57px] z-30 border-b border-stone-800 bg-[#0c0e12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2.5 sm:px-6 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("selector")}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "selector"
                ? "bg-[#D4AF37] text-black shadow-lg shadow-amber-500/20"
                : "bg-stone-900/90 text-stone-300 hover:bg-stone-800 hover:text-white"
            }`}
          >
            <Layers size={14} />
            <span>Selector de Unidades</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                activeTab === "selector" ? "bg-black/20 text-black" : "bg-stone-800 text-[#E8C872]"
              }`}
            >
              {units.filter((u) => u.status === "disponible").length} disp.
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("amenities")}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "amenities"
                ? "bg-[#D4AF37] text-black shadow-lg shadow-amber-500/20"
                : "bg-stone-900/90 text-stone-300 hover:bg-stone-800 hover:text-white"
            }`}
          >
            <Sparkles size={14} />
            <span>Amenidades & Wellness ({AMENITY_ITEMS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("planos")}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "planos"
                ? "bg-[#D4AF37] text-black shadow-lg shadow-amber-500/20"
                : "bg-stone-900/90 text-stone-300 hover:bg-stone-800 hover:text-white"
            }`}
          >
            <FileText size={14} />
            <span>Planos & Modelos ({TYPOLOGY_CONFIGS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ubicacion")}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "ubicacion"
                ? "bg-[#D4AF37] text-black shadow-lg shadow-amber-500/20"
                : "bg-stone-900/90 text-stone-300 hover:bg-stone-800 hover:text-white"
            }`}
          >
            <MapPin size={14} />
            <span>Ubicación Estratégica</span>
          </button>
        </div>
      </div>

      {/* 4. CONTENIDO DE LAS SECCIONES */}
      <main className="mx-auto max-w-7xl px-4 py-8 pb-36 sm:px-6">
        {/* TAB 1: SELECTOR PROGRESIVO DE 4 PASOS */}
        {activeTab === "selector" && (
          <div className="space-y-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-black text-white sm:text-2xl">
                  Disponibilidad en Vivo · Preventa ONA
                </h3>
                <p className="text-xs text-stone-400">
                  Selecciona la tipología, el piso y la unidad para calcular planes de pago y reservar.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                <span>Disponible</span>
                <span className="ml-2 flex h-2 w-2 rounded-full bg-rose-500" />
                <span>Vendido / Reservado</span>
                {loadingUnits && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-[#E8C872]">
                    <RefreshCw size={11} className="animate-spin" /> Actualizando
                  </span>
                )}
              </div>
            </div>

            {/* PASO 1: TIPOLOGÍAS */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#E8C872]">
                Paso 1: Selecciona la Tipología
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {TYPOLOGY_CONFIGS.map((t) => {
                  const matching = units.filter(t.matchUnit);
                  const available = matching.filter((u) => u.status === "disponible");
                  const minCash = available.length > 0
                    ? Math.min(...available.map((u) => u.cash))
                    : matching.length > 0
                    ? Math.min(...matching.map((u) => u.cash))
                    : 0;
                  const isSelected = selectedTypologyId === t.id;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTypologyId(t.id);
                      }}
                      className={`relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-[#E8C872] bg-gradient-to-br from-amber-500/15 to-transparent shadow-lg shadow-amber-500/10 ring-1 ring-[#E8C872]"
                          : "border-stone-800 bg-stone-900/60 hover:border-stone-700 hover:bg-stone-900"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                            {t.rooms} Dormitorio{t.rooms > 1 ? "s" : ""}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              available.length > 0
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-stone-800 text-stone-500"
                            }`}
                          >
                            {available.length} disp.
                          </span>
                        </div>
                        <h4 className="mt-1 text-sm font-black text-white">{t.name}</h4>
                        <p className="text-xs text-stone-400">{t.areaM2} m² propios</p>
                        <p className="mt-2 text-[11px] text-stone-400 line-clamp-1">{t.view}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-end justify-between">
                        <div>
                          <span className="text-[10px] uppercase text-stone-400">Desde</span>
                          <p className="text-sm font-black text-emerald-400">
                            ${formatOnaUsd(minCash)} USD
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-[#E8C872]">
                          Rend. {t.yieldRange}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PASO 2: PISOS DISPONIBLES */}
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#E8C872]">
                  Paso 2: Selecciona el Piso ({activeTypology.name})
                </p>
                <span className="text-xs text-stone-400">
                  {availableFloors.length} pisos con esta tipología
                </span>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {availableFloors.map((floorNum) => {
                  const floorUnits = unitsOfTypology.filter((u) => u.floor === floorNum);
                  const hasDisp = floorUnits.some((u) => u.status === "disponible");
                  const isSelected = selectedFloor === floorNum;

                  return (
                    <button
                      key={floorNum}
                      type="button"
                      onClick={() => setSelectedFloor(floorNum)}
                      className={`flex h-14 min-w-[70px] flex-col items-center justify-center rounded-xl border px-3 text-xs font-bold transition-all ${
                        isSelected
                          ? "border-[#E8C872] bg-[#D4AF37] text-black shadow-md shadow-amber-500/20"
                          : hasDisp
                          ? "border-stone-800 bg-stone-900 text-stone-200 hover:border-stone-700"
                          : "border-stone-900 bg-stone-950/70 text-stone-600"
                      }`}
                    >
                      <span className="text-sm">Piso {floorNum}</span>
                      <span className={`text-[10px] ${isSelected ? "text-stone-900" : hasDisp ? "text-emerald-400" : "text-rose-500"}`}>
                        {hasDisp ? "Disponible" : "Agotado"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PASO 3: UNIDADES DEL PISO SELECCIONADO */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#E8C872]">
                Paso 3: Selecciona la Unidad en Piso {selectedFloor}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {unitsOnFloor.map((u) => {
                  const isDisp = u.status === "disponible";
                  const isSelected = selectedUnit && selectedUnit.floor === u.floor && selectedUnit.tipo === u.tipo;

                  return (
                    <button
                      key={`${u.floor}-${u.tipo}`}
                      type="button"
                      disabled={!isDisp}
                      onClick={() => setSelectedUnit(u)}
                      className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-[#E8C872] bg-gradient-to-br from-amber-500/20 to-stone-900 shadow-xl ring-2 ring-[#E8C872]"
                          : isDisp
                          ? "border-stone-800 bg-stone-900/80 hover:border-stone-700 hover:bg-stone-900"
                          : "border-stone-900/60 bg-stone-950/50 opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wide text-white">
                            Piso {u.floor} · Tipo {u.tipo}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isDisp ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {isDisp ? "Disponible" : "Vendido"}
                          </span>
                        </div>

                        <div className="mt-2 flex items-baseline gap-2">
                          <p className="text-xl font-black text-white">
                            ${formatOnaUsd(u.cash)} USD
                          </p>
                          <span className="text-[11px] text-stone-400">Contado</span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-300">
                          <div className="rounded-lg bg-black/40 p-2">
                            <span className="text-[10px] text-stone-400">Superficie Total</span>
                            <p className="font-bold text-white">{u.totalM2} m²</p>
                          </div>
                          <div className="rounded-lg bg-black/40 p-2">
                            <span className="text-[10px] text-stone-400">Balcón</span>
                            <p className="font-bold text-white">
                              {u.balconyM2 ? `${u.balconyM2} m²` : "Sin balcón"}
                            </p>
                          </div>
                        </div>

                        <p className="mt-2 text-[11px] text-stone-400 flex items-center gap-1">
                          <MapPin size={11} className="text-[#E8C872]" /> {u.view}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
                        <span className="text-stone-400">Reserva oficial</span>
                        <span className="font-bold text-[#E8C872]">
                          ${formatOnaUsd(ONA_RESERVE_USD)} USD
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PASO 4: MODALIDAD DE PAGO & RESUMEN FINANCIERO */}
            {selectedUnit && financialSummary && (
              <div className="rounded-3xl border border-stone-800 bg-gradient-to-b from-stone-900 to-[#101217] p-5 sm:p-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-stone-800 pb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E8C872]">
                      Paso 4: Modalidad de Pago & Resumen de Inversión
                    </span>
                    <h4 className="mt-1 text-lg font-black text-white sm:text-2xl">
                      Unidad Piso {selectedUnit.floor} - Tipo {selectedUnit.tipo} ({activeTypology.name})
                    </h4>
                    <p className="text-xs text-stone-400">
                      Superficie: {selectedUnit.totalM2} m² · {selectedUnit.view}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setZoomPlanImage(activeTypology.planImage)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-700 bg-stone-800 px-3.5 py-1.5 text-xs font-semibold text-stone-200 transition hover:bg-stone-700 hover:text-white"
                  >
                    <Eye size={13} />
                    <span>Ver Plano Arquitectónico</span>
                  </button>
                </div>

                {/* Opciones de Modalidad */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setPaymentPlan("cash")}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      paymentPlan === "cash"
                        ? "border-[#E8C872] bg-amber-500/15 shadow-lg ring-1 ring-[#E8C872]"
                        : "border-stone-800 bg-stone-950/60 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">100% Contado</span>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        Mejor Precio
                      </span>
                    </div>
                    <p className="mt-2 text-xl font-black text-emerald-400">
                      ${formatOnaUsd(selectedUnit.cash)} USD
                    </p>
                    <p className="mt-1 text-[11px] text-stone-400">
                      Ahorras ${formatOnaUsd(financialSummary.ahorroContado)} USD vs plan financiado
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentPlan("plan60")}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      paymentPlan === "plan60"
                        ? "border-[#E8C872] bg-amber-500/15 shadow-lg ring-1 ring-[#E8C872]"
                        : "border-stone-800 bg-stone-950/60 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Plan 60 / 40</span>
                      <span className="text-[10px] text-stone-400">Cuotas obra</span>
                    </div>
                    <p className="mt-2 text-xl font-black text-white">
                      ${formatOnaUsd(selectedUnit.plan60.total)} USD
                    </p>
                    <p className="mt-1 text-[11px] text-stone-400">
                      Inicial 60%: ${formatOnaUsd(selectedUnit.plan60.initial)} USD
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentPlan("plan40")}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      paymentPlan === "plan40"
                        ? "border-[#E8C872] bg-amber-500/15 shadow-lg ring-1 ring-[#E8C872]"
                        : "border-stone-800 bg-stone-950/60 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Plan 40 / 60</span>
                      <span className="text-[10px] text-stone-400">Mínima inicial</span>
                    </div>
                    <p className="mt-2 text-xl font-black text-white">
                      ${formatOnaUsd(selectedUnit.plan40.total)} USD
                    </p>
                    <p className="mt-1 text-[11px] text-stone-400">
                      Inicial 40%: ${formatOnaUsd(selectedUnit.plan40.initial)} USD
                    </p>
                  </button>
                </div>

                {/* Desglose Numérico Completo */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl bg-black/40 p-3.5 border border-stone-800">
                    <span className="text-[10px] font-semibold uppercase text-stone-400">Precio Total</span>
                    <p className="mt-1 text-lg font-black text-white">
                      ${formatOnaUsd(financialSummary.price)} USD
                    </p>
                    <p className="text-[10px] text-stone-400">
                      ${Math.round(financialSummary.price / selectedUnit.totalM2)} USD / m²
                    </p>
                  </div>

                  <div className="rounded-xl bg-black/40 p-3.5 border border-stone-800">
                    <span className="text-[10px] font-semibold uppercase text-[#E8C872]">Monto de Reserva</span>
                    <p className="mt-1 text-lg font-black text-[#E8C872]">
                      ${formatOnaUsd(financialSummary.reserveUsd)} USD
                    </p>
                    <p className="text-[10px] text-stone-400">A cuenta de la cuota inicial</p>
                  </div>

                  <div className="rounded-xl bg-black/40 p-3.5 border border-stone-800">
                    <span className="text-[10px] font-semibold uppercase text-stone-400">Cuota Inicial</span>
                    <p className="mt-1 text-lg font-black text-white">
                      ${formatOnaUsd(financialSummary.initialPayment)} USD
                    </p>
                    <p className="text-[10px] text-stone-400">Durante el proceso de firma</p>
                  </div>

                  <div className="rounded-xl bg-black/40 p-3.5 border border-stone-800">
                    <span className="text-[10px] font-semibold uppercase text-stone-400">Saldo Entrega</span>
                    <p className="mt-1 text-lg font-black text-white">
                      ${formatOnaUsd(financialSummary.saldoContraEntrega)} USD
                    </p>
                    <p className="text-[10px] text-stone-400">Al recibir llaves ({ONA_DELIVERY})</p>
                  </div>
                </div>

                {/* CTA de Reserva directa WhatsApp */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent p-4 border border-amber-500/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-black">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">
                        ¿Listo para reservar esta unidad en ONA?
                      </p>
                      <p className="text-xs text-stone-300">
                        Congela el valor de lista y tu piso preferido con $2.000 USD de reserva formal.
                      </p>
                    </div>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleTrackLead("reservation_box")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8942A] px-6 py-3 text-sm font-bold text-black shadow-xl shadow-amber-500/20 transition hover:brightness-110 active:scale-95"
                  >
                    <MessageCircle size={18} />
                    <span>Reservar por WhatsApp</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AMENIDADES & WELLNESS */}
        {activeTab === "amenities" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-black text-white sm:text-2xl">
                Amenidades & Áreas Sociales
              </h3>
              <p className="text-xs text-stone-400">
                Diseñadas para integrar vida activa, momentos de relajación y espacios de encuentro social de primer nivel.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {AMENITY_ITEMS.map((item) => (
                <div
                  key={item.title}
                  className="group overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg transition hover:border-stone-700"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-950">
                    <img
                      src={item.src}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E8C872] backdrop-blur border border-white/10">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <h4 className="text-base font-bold text-white">{item.title}</h4>
                    <p className="mt-2 text-xs leading-relaxed text-stone-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PLANOS & MODELOS ARQUITECTÓNICOS */}
        {activeTab === "planos" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-black text-white sm:text-2xl">
                Planos Arquitectónicos y Distribución
              </h3>
              <p className="text-xs text-stone-400">
                Fichas técnicas de las tipologías de 1 y 2 dormitorios con medidas interiores y terrazas.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {TYPOLOGY_CONFIGS.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-900/60 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {/* Imagen del plano con botón de zoom */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950 p-4 flex items-center justify-center border-b border-stone-800">
                      <img
                        src={t.planImage}
                        alt={`Plano ${t.name}`}
                        className="max-h-full max-w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setZoomPlanImage(t.planImage)}
                        className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur border border-white/15 hover:bg-black transition"
                      >
                        <Maximize2 size={13} />
                        <span>Ver Plano Completo</span>
                      </button>
                    </div>

                    <div className="p-5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8C872]">
                        {t.rooms} Dormitorio{t.rooms > 1 ? "s" : ""}
                      </span>
                      <h4 className="mt-1 text-lg font-black text-white">{t.name}</h4>
                      <p className="text-xs text-stone-400 font-semibold">{t.areaM2} m² Propios</p>
                      <p className="mt-2 text-xs text-stone-300">{t.view}</p>

                      <ul className="mt-4 space-y-2 border-t border-stone-800 pt-4">
                        {t.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-stone-300">
                            <Check size={14} className="text-[#E8C872] shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTypologyId(t.id);
                        setActiveTab("selector");
                      }}
                      className="w-full rounded-xl bg-stone-800 py-2.5 text-xs font-bold text-white transition hover:bg-[#D4AF37] hover:text-black"
                    >
                      Ver Disponibilidad y Precios
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: UBICACIÓN ESTRATÉGICA & BROCHURE */}
        {activeTab === "ubicacion" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-black text-white sm:text-2xl">
                Ubicación & Entorno · {ONA_ZONE}
              </h3>
              <p className="text-xs text-stone-400">
                Ubicación privilegiada en {ONA_ADDRESS}, entre el 2.do y 3.er anillo de Santa Cruz de la Sierra.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-950 shadow-2xl">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                    <img
                      src="/ona/ubicacion.jpg"
                      alt="Ubicación ONA Residences"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                      <span className="rounded-full bg-black/70 px-3 py-1 font-semibold backdrop-blur border border-white/10">
                        📍 {ONA_ADDRESS} · {ONA_ZONE}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="rounded-3xl border border-stone-800 bg-stone-900/60 p-6">
                  <h4 className="text-base font-bold text-white">Conectividad & Calidad de Vida</h4>
                  <ul className="mt-4 space-y-3 text-xs text-stone-300">
                    <li className="flex items-start gap-2.5">
                      <MapPin size={16} className="text-[#E8C872] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Av. Los Cusis:</strong> Corredor residencial sereno y arbolado con acceso ágil hacia la Av. Banzer y Av. Beni.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Building2 size={16} className="text-[#E8C872] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Cercanía a todo:</strong> A minutos del Ventura Mall, supermercados, colegios y polos empresariales de Equipetrol.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <TrendingUp size={16} className="text-[#E8C872] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Plusvalía asegurada:</strong> Inversión en preventa con respaldo de la constructora {ONA_BUILDER}.
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Tarjeta de Descarga de Brochure */}
                <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-stone-900 to-stone-900 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37] text-black shadow-lg">
                      <Download size={22} />
                    </div>
                    <div>
                      <h5 className="text-base font-black text-white">Brochure Oficial de ONA</h5>
                      <p className="text-xs text-stone-300">
                        Descarga la presentación comercial completa con renders y especificaciones.
                      </p>
                    </div>
                  </div>

                  <a
                    href={ONA_BROCHURE_URL}
                    download="Brochure_ONA_Residences.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-black transition hover:bg-stone-200"
                  >
                    <Download size={15} />
                    <span>Descargar Brochure PDF (2.4 MB)</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. MODAL DE ZOOM DE PLANO EN ALTA RESOLUCIÓN */}
      <AnimatePresence>
        {zoomPlanImage && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="relative max-h-[92vh] max-w-5xl w-full overflow-hidden rounded-3xl border border-stone-700 bg-stone-950 p-4">
              <button
                type="button"
                onClick={() => setZoomPlanImage(null)}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 text-white hover:bg-[#D4AF37] hover:text-black transition"
              >
                <X size={20} />
              </button>
              <div className="max-h-[82vh] overflow-auto flex items-center justify-center p-2">
                <img
                  src={zoomPlanImage}
                  alt="Plano en alta resolución"
                  className="max-h-[78vh] w-auto object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. BARRA FIJA INFERIOR EN MÓVIL AL SELECCIONAR UNIDAD */}
      {selectedUnit && financialSummary && activeTab === "selector" && (
        <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden border-t border-stone-800 bg-[#0c0e12]/95 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#E8C872]">
                Piso {selectedUnit.floor} · Tipo {selectedUnit.tipo}
              </p>
              <p className="text-base font-black text-white">
                ${formatOnaUsd(financialSummary.price)} USD
              </p>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleTrackLead("mobile_bottom_bar")}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8942A] px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <MessageCircle size={15} />
              <span>Reservar</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
