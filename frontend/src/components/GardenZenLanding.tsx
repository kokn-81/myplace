import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Layers,
  Leaf,
  MapPin,
  Maximize2,
  MessageCircle,
  RefreshCw,
  Share2,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import {
  GARDEN_ZEN_BASELINE_UNITS,
  GARDEN_ZEN_CONFIG,
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

const HERO_IMAGES = [
  { src: "/garden_zen/fachada.jpg", label: "Fachada Principal" },
  { src: "/garden_zen/amenities/amenity_piscina.jpg", label: "Piscina Infinita Piso 16" },
  { src: "/garden_zen/amenities/amenity_lobby.jpg", label: "Lobby Zen" },
  { src: "/garden_zen/ubicacion.jpg", label: "Ubicación Satelital" },
  { src: "/garden_zen/amenities/amenity_cowork.jpg", label: "Co-Work Nōka" },
];

const AMENITY_SLIDES = [
  {
    src: "/garden_zen/amenities/amenity_piscina.jpg",
    category: "Rooftop Piso 16",
    title: "Piscina Infinita & Deck Panorámico",
    description:
      "Ubicada en el rooftop del piso 16 con vista abierta hacia Equipetrol Norte. Un oasis de descanso con solárium, reposeras y horizonte panorámico para desconectar de la rutina diaria.",
  },
  {
    src: "/garden_zen/amenities/amenity_sauna.jpg",
    category: "Wellness & Relax",
    title: "Sauna Seco & Sauna Vapor",
    description:
      "Circuito completo de relajación con vistas panorámicas hacia la ciudad, diseñado para renovar energías y promover el bienestar físico y mental sin salir del edificio.",
  },
  {
    src: "/garden_zen/amenities/amenity_gimnasio.jpg",
    category: "Fitness & Cardio",
    title: "Gimnasio Tecnológico",
    description:
      "Área de fitness climatizada equipada con máquinas de cardio y fuerza de última generación, acompañada de ventanales de piso a techo con vistas despejadas.",
  },
  {
    src: "/garden_zen/amenities/amenity_cowork.jpg",
    category: "Business & Networking",
    title: "Co-Work Nōka",
    description:
      "Espacio de trabajo colaborativo y business lounge climatizado con conectividad de fibra óptica de alta velocidad, iluminación natural y puestos ergonómicos.",
  },
  {
    src: "/garden_zen/amenities/amenity_salon.jpg",
    category: "Social & Eventos",
    title: "Salón Haku (Uso Múltiple)",
    description:
      "Ambiente social climatizado con barra gourmet, cocina de apoyo, celosías de madera natural y mobiliario para eventos y celebraciones privadas.",
  },
  {
    src: "/garden_zen/amenities/amenity_churrasquera_enso.jpg",
    category: "Gastronomía Rooftop",
    title: "Churrasquera Ensō",
    description:
      "Estación de parrilla gourmet techada con mesón de granito blanco, leñero integrado y área de comedor al aire libre con vista a los jardines flotantes.",
  },
  {
    src: "/garden_zen/amenities/amenity_churrasquera_koen.jpg",
    category: "Gastronomía & Lounge",
    title: "Churrasquera Kōen & Lounge",
    description:
      "Segunda estación de parrilla panorámica con living social climatizado, cava de vinos empotrada y vista privilegiada del atardecer de Santa Cruz.",
  },
  {
    src: "/garden_zen/amenities/amenity_calistenia_petspa.jpg",
    category: "Aire Libre & Mascotas",
    title: "Calistenia & Pet Spa",
    description:
      "Sector de entrenamiento funcional y calistenia al aire libre rodeado de vegetación, junto a una estación dedicada para el baño y cuidado de mascotas.",
  },
  {
    src: "/garden_zen/amenities/amenity_lobby.jpg",
    category: "Acceso & Seguridad",
    title: "Lobby Zen con Seguridad 24/7",
    description:
      "Imponente recepción de ingreso con jardín zen interior, muro curvo de madera natural, control de acceso automatizado y doble ascensor de alta velocidad.",
  },
];

interface TypologyData {
  id: string;
  rooms: number;
  title: string;
  area: string;
  image: string;
  cashPrice: number;
  models: string;
  tagline: string;
  reservedCopy: string;
  rentEstimate: string;
  yieldRange: string;
  highlights: string[];
}

const TYPOLOGIES_DATA: TypologyData[] = [
  {
    id: "mono",
    rooms: 0,
    title: "Monoambiente Zen (Studio)",
    area: "32,12 m² – 37,11 m²",
    image: "/garden_zen/plano_mono_mp.jpg",
    cashPrice: 56210,
    models: "Modelos MP, M1, ML",
    tagline:
      "Distribución abierta con excelente iluminación natural, ideal para renta corta en Airbnb o primera vivienda independiente.",
    reservedCopy: "Alta demanda de inversión: varias unidades ya reservadas",
    rentEstimate: "USD 450 – 520 / mes",
    yieldRange: "10,2% – 11,4%",
    highlights: [
      "Ambiente integrado con cocina americana y mesón desayunador",
      "Espacio para cama queen y clóset empotrado de piso a techo",
      "Baño de primera línea con box de vidrio templado",
      "Expensas mínimas aseguradas por energía solar común",
    ],
  },
  {
    id: "1dorm",
    rooms: 1,
    title: "1 Dormitorio Confort",
    area: "42,45 m² – 52,88 m²",
    image: "/garden_zen/plano_1dorm_b1.jpg",
    cashPrice: 74288,
    models: "Modelos B1, I1",
    tagline:
      "Dormitorio independiente en suite, living comedor integrado y terraza balcón para disfrutar la brisa de Equipetrol.",
    reservedCopy: "Tipología más solicitada para alquiler corporativo",
    rentEstimate: "USD 600 – 680 / mes",
    yieldRange: "9,7% – 10,8%",
    highlights: [
      "Dormitorio máster privado con ropero empotrado a medida",
      "Living social amplio con ventanales de piso a techo",
      "Cocina de diseño equipada con cajonería y extractor",
      "Balcón terraza propio con vista abierta hacia la vegetación",
    ],
  },
  {
    id: "2dorm",
    rooms: 2,
    title: "2 Dormitorios Familiar",
    area: "62,15 m² – 72,84 m²",
    image: "/garden_zen/plano_2dorm_d2.jpg",
    cashPrice: 108763,
    models: "Modelos D2, E2",
    tagline:
      "Amplitud y confort para familias jóvenes o profesionales que requieren espacio de oficina privada en casa.",
    reservedCopy: "Excelente ubicación en pisos intermedios y altos",
    rentEstimate: "USD 850 – 950 / mes",
    yieldRange: "9,1% – 9,9%",
    highlights: [
      "Suite principal con vestidor y baño privado + 2.° dormitorio amplio",
      "Segundo baño completo para visitas y segundo dormitorio",
      "Cocina semi-integrada con mesones de granito y lavandería",
      "Espacio de living-comedor para mesa de 6 comensales",
    ],
  },
  {
    id: "3dorm",
    rooms: 3,
    title: "3 Dormitorios Penthouse Style",
    area: "95,83 m²",
    image: "/garden_zen/plano_3dorm_b3.jpg",
    cashPrice: 167703,
    models: "Modelo B3",
    tagline:
      "La tipología más exclusiva del edificio, con amplias terrazas, dormitorios en suite y vistas panorámicas de Equipetrol Norte.",
    reservedCopy: "Unidades limitadas con acabados superiores",
    rentEstimate: "USD 1.200 – 1.400 / mes",
    yieldRange: "8,5% – 9,3%",
    highlights: [
      "Máster suite con vestidor de gran capacidad y terraza privada",
      "2 dormitorios secundarios con clósets completos y baño compartido",
      "Área de lavandería independiente y baño de visitas",
      "Living comedor de grandes proporciones con vista panorámica",
    ],
  },
];

interface AmbienteOption {
  id: string;
  name: string;
  shortName: string;
  rooms: number;
  models: string;
  areaRange: string;
  basePrice: number;
  rentMin: number;
  rentMax: number;
  yieldRange: string;
  matchUnit: (u: GardenZenUnit) => boolean;
}

const AMBIENTE_OPTIONS: AmbienteOption[] = [
  {
    id: "mono",
    name: "Monoambiente Zen (Studio)",
    shortName: "Monoambiente · 32 a 37 m²",
    rooms: 0,
    models: "Modelos MP, M1, ML",
    areaRange: "32,12 – 37,11 m²",
    basePrice: 56210,
    rentMin: 450,
    rentMax: 520,
    yieldRange: "10,2% – 11,4%",
    matchUnit: (u) => u.rooms === 0,
  },
  {
    id: "1dorm",
    name: "1 Dormitorio Confort",
    shortName: "1 Dormitorio · 42 a 53 m²",
    rooms: 1,
    models: "Modelos B1, I1",
    areaRange: "42,45 – 52,88 m²",
    basePrice: 74288,
    rentMin: 600,
    rentMax: 680,
    yieldRange: "9,7% – 10,8%",
    matchUnit: (u) => u.rooms === 1,
  },
  {
    id: "2dorm",
    name: "2 Dormitorios Familiar",
    shortName: "2 Dormitorios · 62 a 73 m²",
    rooms: 2,
    models: "Modelos D2, E2",
    areaRange: "62,15 – 72,84 m²",
    basePrice: 108763,
    rentMin: 850,
    rentMax: 950,
    yieldRange: "9,1% – 9,9%",
    matchUnit: (u) => u.rooms === 2,
  },
  {
    id: "3dorm",
    name: "3 Dormitorios Exclusivo",
    shortName: "3 Dormitorios · 95,8 m²",
    rooms: 3,
    models: "Modelo B3",
    areaRange: "95,83 m²",
    basePrice: 167703,
    rentMin: 1200,
    rentMax: 1400,
    yieldRange: "8,5% – 9,3%",
    matchUnit: (u) => u.rooms === 3,
  },
];

export default function GardenZenLanding({ property, onClose }: Props) {
  const [activeImage, setActiveImage] = useState(HERO_IMAGES[0].src);
  const [activeLabel, setActiveLabel] = useState(HERO_IMAGES[0].label);
  const [amenityIndex, setAmenityIndex] = useState(0);

  // Estados del Flujo Paso a Paso
  const [selectedAmbId, setSelectedAmbId] = useState<string>("mono");
  const [selectedFloor, setSelectedFloor] = useState<number>(2);
  const [selectedPlan, setSelectedPlan] = useState<"contado" | "plan70" | "plan30">("contado");

  const [shareFeedback, setShareFeedback] = useState(false);
  const [units, setUnits] = useState<GardenZenUnit[]>(GARDEN_ZEN_BASELINE_UNITS);
  const [isRefreshingInv, setIsRefreshingInv] = useState(false);
  const [zoomPlanImage, setZoomPlanImage] = useState<string | null>(null);

  // Referencias para navegación interna
  const introRef = useRef<HTMLElement>(null);
  const placeRef = useRef<HTMLElement>(null);
  const amenitiesRef = useRef<HTMLElement>(null);
  const typesRef = useRef<HTMLElement>(null);
  const payRef = useRef<HTMLElement>(null);
  const investorRef = useRef<HTMLElement>(null);
  const disponibilidadRef = useRef<HTMLElement>(null);

  // Carga de inventario en vivo
  useEffect(() => {
    let cancelled = false;
    async function loadLive() {
      try {
        const live = await fetchGardenZenLiveUnits();
        if (!cancelled && live.length > 0) {
          setUnits(live);
        }
      } catch (err) {
        console.warn("Error cargando inventario en vivo de Garden Zen:", err);
      }
    }
    loadLive();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRefreshInventory = async () => {
    setIsRefreshingInv(true);
    try {
      const live = await fetchGardenZenLiveUnits();
      if (live.length > 0) {
        setUnits(live);
      }
    } finally {
      setTimeout(() => setIsRefreshingInv(false), 500);
    }
  };

  // Ambiente activo
  const currentAmbiente = useMemo(() => {
    return AMBIENTE_OPTIONS.find((a) => a.id === selectedAmbId) || AMBIENTE_OPTIONS[0];
  }, [selectedAmbId]);

  // Pisos para el ambiente seleccionado
  const floorsForAmbiente = useMemo(() => {
    const matching = units.filter(currentAmbiente.matchUnit);
    const floorMap = new Map<number, GardenZenUnit[]>();
    matching.forEach((u) => {
      if (!floorMap.has(u.floor)) floorMap.set(u.floor, []);
      floorMap.get(u.floor)!.push(u);
    });

    const list: { floor: number; isAvailable: boolean; unit: GardenZenUnit }[] = [];
    Array.from(floorMap.keys())
      .sort((a, b) => a - b)
      .forEach((floor) => {
        const floorUnits = floorMap.get(floor)!;
        const availableUnit = floorUnits.find((u) => u.status === "disponible");
        if (availableUnit) {
          list.push({ floor, isAvailable: true, unit: availableUnit });
        } else {
          list.push({ floor, isAvailable: false, unit: floorUnits[0] });
        }
      });
    return list;
  }, [units, currentAmbiente]);

  // Asegurar piso válido
  useEffect(() => {
    const currentStillAvailable = floorsForAmbiente.some(
      (f) => f.floor === selectedFloor && f.isAvailable
    );
    if (!currentStillAvailable) {
      const firstAvail = floorsForAmbiente.find((f) => f.isAvailable);
      if (firstAvail) {
        setSelectedFloor(firstAvail.floor);
      } else if (floorsForAmbiente.length > 0) {
        setSelectedFloor(floorsForAmbiente[0].floor);
      }
    }
  }, [floorsForAmbiente, selectedFloor]);

  // Unidad activa
  const activeUnit = useMemo(() => {
    const matching = units.filter(currentAmbiente.matchUnit);
    const onFloor = matching.filter((u) => u.floor === selectedFloor);
    const disp = onFloor.find((u) => u.status === "disponible");
    return disp || onFloor[0] || null;
  }, [units, currentAmbiente, selectedFloor]);

  // Cálculos financieros
  const activeFinancials = useMemo(() => {
    if (!activeUnit) return null;

    let totalPrice = activeUnit.cashTotal;
    let initialPayment = activeUnit.cashTotal;
    let saldoContraEntrega = 0;
    let planLabel = "Al Contado";
    let perM2 = activeUnit.cashPerM2;

    if (selectedPlan === "plan70") {
      totalPrice = activeUnit.initial70Total;
      initialPayment = activeUnit.cuotaInicial70;
      saldoContraEntrega = Math.max(0, totalPrice - initialPayment);
      planLabel = "Plan 70% Inicial / 30% Entrega";
      perM2 = activeUnit.initial70PerM2;
    } else if (selectedPlan === "plan30") {
      totalPrice = activeUnit.initial30Total;
      initialPayment = activeUnit.cuotaInicial30;
      saldoContraEntrega = Math.max(0, totalPrice - initialPayment);
      planLabel = "Plan 30% Inicial / 70% Entrega";
      perM2 = activeUnit.initial30PerM2;
    }

    const marketValueAtDelivery = Math.round(activeUnit.areaM2 * 2050);
    const capitalGain = Math.max(0, marketValueAtDelivery - totalPrice);
    const gainPercentage = Math.round((capitalGain / totalPrice) * 100);

    const rentMonthlyMin = currentAmbiente.rentMin;
    const rentMonthlyMax = currentAmbiente.rentMax;
    const rentMonthlyBsMin = rentMonthlyMin * 12;
    const rentMonthlyBsMax = rentMonthlyMax * 12;

    const ahorroContado = Math.max(0, activeUnit.initial30Total - activeUnit.cashTotal);

    return {
      totalPrice,
      initialPayment,
      saldoContraEntrega,
      planLabel,
      perM2,
      ahorroContado,
      marketValueAtDelivery,
      capitalGain,
      gainPercentage,
      rentMonthlyMin,
      rentMonthlyMax,
      rentMonthlyBsMin,
      rentMonthlyBsMax,
      yieldRange: currentAmbiente.yieldRange,
    };
  }, [activeUnit, selectedPlan, currentAmbiente]);

  // Contadores generales
  const totalUnitsCount = units.length;
  const availableUnitsCount = units.filter((u) => u.status === "disponible").length;
  const soldUnitsCount = totalUnitsCount - availableUnitsCount;

  // Manejo de amenidades
  const currentSlide = AMENITY_SLIDES[amenityIndex] || AMENITY_SLIDES[0];
  const nextAmenity = () => setAmenityIndex((prev) => (prev + 1) % AMENITY_SLIDES.length);
  const prevAmenity = () => setAmenityIndex((prev) => (prev - 1 + AMENITY_SLIDES.length) % AMENITY_SLIDES.length);

  // Compartir
  const handleShare = () => {
    recordLeadEvent({
      action: "share_project",
      propertyRef: "garden-zen",
      operacion: "Preventa",
      zona: GARDEN_ZEN_CONFIG.zone,
    }).catch(() => {});
    const url = window.location.origin + window.location.pathname + "?proyecto=garden-zen";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setShareFeedback(true);
        setTimeout(() => setShareFeedback(false), 2500);
      });
    }
  };

  // Reserva WhatsApp
  const reserve = (msg: string, price?: number) => {
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: "garden-zen",
      operacion: "Preventa",
      zona: GARDEN_ZEN_CONFIG.zone,
      precio: price,
      detalles: `msg:${msg.substring(0, 100)}`,
    }).catch(() => {});
    const phone = CONTACT_WHATSAPP_NUMBER || "59157015854";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col bg-[#f7f5f0] font-sans text-stone-900 overflow-y-auto overscroll-y-contain md:overflow-hidden md:flex-row"
    >
      {/* Botones Flotantes Superiores: Brochure, Compartir y Cerrar */}
      <div className="fixed right-4 top-4 z-[120] flex items-center gap-2 md:right-7 md:top-7">
        <a
          href="/garden_zen/presentacion_garden_zen.pdf"
          download="Presentacion_Garden_Zen.pdf"
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            recordLeadEvent({
              action: "brochure_download",
              propertyRef: "garden-zen",
              operacion: "Preventa",
              zona: GARDEN_ZEN_CONFIG.zone,
            }).catch(() => {});
          }}
          className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/95 px-3.5 py-2.5 text-stone-900 shadow-xl backdrop-blur transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Descargar Brochure Oficial en PDF"
          aria-label="Descargar Brochure"
        >
          <Download size={18} className="text-stone-700" />
          <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-wider">Brochure</span>
        </a>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/95 px-3.5 py-2.5 text-stone-900 shadow-xl backdrop-blur transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Compartir"
          title="Compartir Garden Zen"
        >
          {shareFeedback ? (
            <>
              <Check size={18} className="text-[#235C43]" />
              <span className="text-[11px] font-semibold text-[#235C43]">¡Copiado!</span>
            </>
          ) : (
            <>
              <Share2 size={18} className="text-stone-700" />
              <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-wider">Compartir</span>
            </>
          )}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-900 shadow-xl backdrop-blur transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Cerrar"
            title="Volver al mapa"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* PANEL IZQUIERDO / HERO: Fotografía Inmersiva Dinámica con verde botánico */}
      <div className="relative h-[40vh] min-h-[290px] shrink-0 bg-stone-950 md:h-screen md:w-[44%]">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={activeImage}
            src={activeImage}
            alt={`Garden Zen - ${activeLabel}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />
        <div className="absolute bottom-6 left-6 right-16 text-white md:bottom-10 md:left-10">
          <span className="inline-block rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9FE1C3] backdrop-blur-md border border-white/10">
            Preventa en Obra Fina · {activeLabel}
          </span>
          <h1 className="mt-3 font-serif text-4xl font-light tracking-wide leading-none md:text-6xl">
            GARDEN ZEN
          </h1>
          <p className="mt-3 max-w-sm text-sm font-light text-white/90 md:text-base leading-relaxed [text-align:justify] [text-justify:inter-word]">
            Vivir bien es vivir consciente. Arquitectura minimalista, bienestar y sostenibilidad en {GARDEN_ZEN_CONFIG.zone}.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-white/80 font-light">
            <span>Edificio de 16 Niveles</span>
            <span>·</span>
            <span>Entrega {GARDEN_ZEN_CONFIG.delivery}</span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[#9FE1C3]">
            <MapPin size={13} /> {GARDEN_ZEN_CONFIG.address}
          </p>
        </div>
      </div>

      {/* PANEL DERECHO: Contenido Editorial y Tesis del Inversor */}
      <div className="relative min-h-0 flex-1 md:h-screen md:overflow-y-auto">
        <div className="mx-auto max-w-xl px-5 py-8 pb-32 md:px-10 md:py-14">

          {/* 1. HERO / VIVÍ GARDEN ZEN: EXPERIENCIA Y ESTILO DE VIDA */}
          <section id="intro" ref={introRef} className="scroll-mt-6">
            <div className="flex items-center gap-2">
              <Leaf size={14} className="text-[#235C43]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#235C43]">
                Experiencia Residencial Eco-Lujo
              </p>
            </div>

            <h2 className="mt-3 font-serif text-3xl font-light leading-snug text-stone-900 md:text-5xl">
              Viví Garden Zen. <br />
              <span className="italic font-normal text-[#235C43]">
                Un proyecto pensado para vivir en calma y consciencia.
              </span>
            </h2>

            <p className="mt-5 text-[15px] font-light leading-relaxed text-stone-600 md:text-base [text-align:justify] [text-justify:inter-word]">
              Garden Zen combina arquitectura contemporánea de vanguardia con soluciones de sostenibilidad activa en la zona de mayor plusvalía de Santa Cruz: <strong>{GARDEN_ZEN_CONFIG.zone}</strong>. Su sistema de paneles solares propios genera un ahorro de hasta el <strong>60% en consumo eléctrico</strong> y un <strong>50% menos en expensas</strong> comunes de por vida, ofreciendo el estándar residencial más inteligente y confortable del mercado.
            </p>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-white/70 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#235C43]/10 text-[#235C43]">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-[#235C43]">
                    Preventa en Marcha · Obra Fina
                  </p>
                  <p className="text-sm font-medium text-stone-800">
                    Más de {soldUnitsCount} unidades ya han sido reservadas en esta torre de 13 pisos de vivienda.
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-stone-500 font-light border-t border-stone-100 pt-2.5 [text-align:justify] [text-justify:inter-word]">
                La oportunidad de ingresar en etapa de obra fina antes de la entrega formal en {GARDEN_ZEN_CONFIG.delivery} asegura la máxima plusvalía acumulada frente al valor terminado de Equipetrol Norte.
              </p>
            </div>

            {/* Accesos rápidos de navegación */}
            <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-stone-200 pt-4 text-xs font-medium text-stone-500">
              <a href="#lugar" className="hover:text-stone-950 transition-colors">Ubicación</a>
              <a href="#amenidades" className="hover:text-stone-950 transition-colors">Áreas Sociales</a>
              <a href="#tipologias" className="hover:text-stone-950 transition-colors">Tipologías</a>
              <a href="#pago" className="hover:text-stone-950 transition-colors">Formas de Pago</a>
              <a href="#inversion" className="hover:text-stone-950 transition-colors">Rentabilidad</a>
              <a href="#disponibilidad" className="text-[#235C43] font-semibold hover:text-stone-950 transition-colors">Disponibilidad en Vivo</a>
            </nav>
          </section>


          {/* 2. UBICACIÓN PRIVILEGIADA & CONECTIVIDAD */}
          <section id="lugar" ref={placeRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#235C43]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#235C43]">
                Ubicación Insuperable
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Equipetrol Norte: Tranquilidad residencial y plusvalía garantizada.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Ubicado estratégicamente sobre la <strong>{GARDEN_ZEN_CONFIG.address}</strong> (Barrio Brígida), a solo metros del Supermercado Tía, la Av. San Martín, Ventura Mall y el polo empresarial de la Torre Platinum.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md">
              <img
                src="/garden_zen/ubicacion.jpg"
                alt="Mapa satelital de ubicación de Garden Zen en Equipetrol Norte"
                className="w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
              />
              <div className="p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="border-l-2 border-[#235C43] pl-3">
                    <p className="text-xs font-semibold text-stone-900">Polo Corporativo</p>
                    <p className="text-[12px] text-stone-500 font-light mt-0.5 [text-align:justify] [text-justify:inter-word]">
                      A 3 minutos de Torre Platinum, Green Tower y los principales bancos del país.
                    </p>
                  </div>
                  <div className="border-l-2 border-[#235C43] pl-3">
                    <p className="text-xs font-semibold text-stone-900">Ventura Mall & Gastronomía</p>
                    <p className="text-[12px] text-stone-500 font-light mt-0.5 [text-align:justify] [text-justify:inter-word]">
                      A pasos del boulevard de restaurantes, cafés de autor, cines y servicios esenciales.
                    </p>
                  </div>
                  <div className="border-l-2 border-[#235C43] pl-3">
                    <p className="text-xs font-semibold text-stone-900">Entorno Arbolado</p>
                    <p className="text-[12px] text-stone-500 font-light mt-0.5 [text-align:justify] [text-justify:inter-word]">
                      Calle serena y residencial fuera del congestionamiento vehicular de las avenidas troncales.
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-stone-100 pt-3 text-right">
                  <a
                    href="https://maps.google.com/?q=-17.7615,-63.1972"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#235C43] hover:underline"
                  >
                    <MapPin size={13} /> Ver ubicación en Google Maps
                  </a>
                </div>
              </div>
            </div>
          </section>


          {/* 3. AMENIDADES & ÁREAS SOCIALES (FOTOS REALES EXTRAÍDAS DEL BROCHURE) */}
          <section id="amenidades" ref={amenitiesRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-[#235C43]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#235C43]">
                Áreas Sociales & Bienestar
              </p>
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-3xl font-light text-stone-900 md:text-4xl">
                Rooftop en Piso 16: El cielo de Equipetrol a tus pies.
              </h2>
            </div>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Diseñadas para maximizar el relax, la convivencia y la desconexión total dentro de tu propio edificio con vistas panorámicas de 360°.
            </p>

            {/* CARRUSEL INTERACTIVO CON FOTOS OFICIALES */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900 sm:aspect-[16/9]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentSlide.src + currentSlide.title}
                    src={currentSlide.src}
                    alt={currentSlide.title}
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
                    onClick={prevAmenity}
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-[#235C43] hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                    aria-label="Anterior amenidad"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={nextAmenity}
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-[#235C43] hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                    aria-label="Siguiente amenidad"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>

                <div className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[#9FE1C3] backdrop-blur-md">
                  {currentSlide.category}
                </div>

                <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-mono text-white backdrop-blur-md">
                  {amenityIndex + 1} / {AMENITY_SLIDES.length}
                </div>
              </div>

              {/* Texto de la amenidad activa */}
              <div className="p-6">
                <h3 className="font-serif text-2xl text-stone-900">
                  {currentSlide.title}
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
                  {currentSlide.description}
                </p>

                {/* Miniaturas interactivas */}
                <div className="mt-6 flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 scrollbar-none">
                  {AMENITY_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.title}
                      onClick={() => setAmenityIndex(idx)}
                      className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all cursor-pointer ${
                        idx === amenityIndex
                          ? "border-[#235C43] scale-105 shadow-md ring-2 ring-[#235C43]/30"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                      title={slide.title}
                    >
                      <img src={slide.src} alt={slide.title} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>


          {/* 4. TIPOLOGÍAS RESIDENCIALES: PLANOS REALES, METRAJES Y DETALLES */}
          <section id="tipologias" ref={typesRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#235C43]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#235C43]">
                Distribución Arquitectónica
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Modelos concebidos para optimizar cada metro cuadrado.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Desde monoambientes tipo studio de alta rentabilidad hasta residencias familiares de 3 dormitorios con vistas despejadas en Equipetrol Norte.
            </p>

            <div className="mt-8 space-y-10">
              {TYPOLOGIES_DATA.map((tipo) => (
                <article
                  key={tipo.id}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md transition-shadow hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 sm:aspect-[16/10] p-4 flex items-center justify-center">
                    <img
                      src={tipo.image}
                      alt={`Plano renderizado de tipología ${tipo.title}`}
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="absolute top-4 left-4 rounded-full bg-stone-900/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      {tipo.area}
                    </div>
                    <button
                      type="button"
                      onClick={() => setZoomPlanImage(tipo.image)}
                      className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur border border-white/15 hover:bg-black transition cursor-pointer"
                    >
                      <Maximize2 size={13} />
                      <span>Ver Plano en HD</span>
                    </button>
                  </div>

                  <div className="p-6 md:p-7">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-serif text-2xl font-normal text-stone-900">
                        {tipo.title}
                      </h3>
                      <p className="text-sm font-semibold uppercase tracking-wider text-[#235C43]">
                        {tipo.models}
                      </p>
                    </div>

                    <p className="mt-2 text-sm font-light text-stone-600 leading-relaxed [text-align:justify] [text-justify:inter-word]">
                      {tipo.tagline}
                    </p>

                    <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-md bg-[#EAF4EF] px-3 py-1 text-xs font-medium text-[#1A4D36]">
                      <CheckCircle2 size={13} /> {tipo.reservedCopy}
                    </div>

                    <div className="mt-5 border-t border-stone-100 pt-4">
                      <p className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                        Lo que incluye tu departamento:
                      </p>
                      <ul className="mt-2.5 space-y-2 text-xs font-light text-stone-700">
                        {tipo.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#235C43]" />
                            <span className="[text-align:justify] [text-justify:inter-word]">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 border-t border-stone-100 pt-5 flex items-baseline justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">
                          Precio inicial al contado
                        </p>
                        <p className="font-serif text-2xl font-medium text-stone-900">
                          Desde USD {formatGardenZenUsd(tipo.cashPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-[#235C43] font-semibold">
                          Rendimiento Anual
                        </p>
                        <p className="text-sm font-bold text-[#1A4D36]">
                          {tipo.yieldRange}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>


          {/* 5. FORMAS DE PAGO & ESTRUCTURA DE COMPRA */}
          <section id="pago" ref={payRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#235C43]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#235C43]">
                Estructura de Compra
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Modalidades de pago adaptadas a tu perfil inversor.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Elige cómo distribuir tu capital durante la fase final de obra fina con entrega confirmada para {GARDEN_ZEN_CONFIG.delivery}.
            </p>

            <div className="mt-6 space-y-4">
              {/* Opción 1: Contado */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-stone-900 bg-stone-900 p-6 text-white shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-[#9FE1C3]/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#9FE1C3] border border-[#9FE1C3]/30">
                      Mayor Descuento
                    </span>
                    <h3 className="mt-2 font-serif text-2xl">1. Pago al Contado (100%)</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-light text-[#9FE1C3]">$1.750 <span className="text-xs font-sans text-stone-300">USD/m²</span></p>
                    <p className="text-[11px] text-stone-400">vs $2.050 en la zona</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="text-xs uppercase tracking-wider text-[#9FE1C3] font-semibold">Ventaja Comercial:</p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-stone-200 [text-align:justify] [text-justify:inter-word]">
                    Aseguras el valor por m² más competitivo de todo Equipetrol Norte. Ahorras miles de dólares en comparación con planes diferidos y capitalizas la máxima plusvalía neta al recibir llaves en {GARDEN_ZEN_CONFIG.delivery}.
                  </p>
                </div>
              </div>

              {/* Opción 2: Plan 70/30 */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-stone-100 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-600">
                      Equilibrio Financiero
                    </span>
                    <h3 className="mt-2 font-serif text-xl text-stone-900">2. Plan 70% Inicial + 30% contra Entrega</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-light text-stone-900">$1.800 <span className="text-xs font-sans text-stone-500">USD/m²</span></p>
                    <p className="text-[11px] text-stone-400">Excelente relación liquidez</p>
                  </div>
                </div>
                <div className="mt-3.5 border-t border-stone-100 pt-3">
                  <p className="text-xs uppercase tracking-wider text-[#235C43] font-semibold">Ventaja Comercial:</p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
                    Desembolso inicial que congela el precio con descuento sobre lista, cancelando el 30% final recién al recibir el departamento terminado.
                  </p>
                </div>
              </div>

              {/* Opción 3: Plan 30/70 */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-stone-100 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-600">
                      Entrada Cómoda
                    </span>
                    <h3 className="mt-2 font-serif text-xl text-stone-900">3. Plan 30% Inicial + 70% contra Entrega</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-light text-stone-900">$1.850 <span className="text-xs font-sans text-stone-500">USD/m²</span></p>
                    <p className="text-[11px] text-stone-400">Mínima inversión inicial</p>
                  </div>
                </div>
                <div className="mt-3.5 border-t border-stone-100 pt-3">
                  <p className="text-xs uppercase tracking-wider text-[#235C43] font-semibold">Ventaja Comercial:</p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
                    El desembolso de entrada más accesible para asegurar tu unidad en Equipetrol Norte con solo el 30% de cuota inicial, pagando el 70% contra entrega.
                  </p>
                </div>
              </div>
            </div>
          </section>


          {/* 6. RENTABILIDAD & PLUSVALÍA EN EQUIPETROL NORTE */}
          <section id="inversion" ref={investorRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#235C43]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#235C43]">
                Rentabilidad & Sostenibilidad
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Por qué invertir en Garden Zen es una decisión rentable y segura.
            </h2>
            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              La combinación de ubicación en Equipetrol Norte con paneles solares activos reduce las expensas a la mitad de forma permanente, aumentando directamente tu rendimiento neto de alquiler.
            </p>

            <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#235C43]/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#1A4D36]">
                  Diferencial Energético Único
                </span>
              </div>
              <h3 className="mt-2 font-serif text-2xl text-stone-900">
                50% menos en expensas comunes de por vida.
              </h3>
              <p className="mt-2 text-xs text-stone-600 font-light leading-relaxed [text-align:justify] [text-justify:inter-word]">
                Mientras los edificios convencionales sufren constantes incrementos de tarifas de luz comunal y expensas elevadas, Garden Zen utiliza energía solar fotovoltaica para iluminar áreas comunes, ascensores y bombas, convirtiéndose en el edificio más competitivo para inquilinos y propietarios.
              </p>

              <div className="mt-5 rounded-xl border-2 border-[#235C43] bg-[#F4F8F5] p-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#235C43] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-bl-lg">
                  Plusvalía Zen
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#1A4D36]">
                    Garden Zen · Equipetrol Norte (Obra Fina)
                  </p>
                  <p className="font-serif text-2xl text-stone-900 font-medium">
                    $1.750 <span className="text-xs font-sans text-stone-500">USD/m²</span>
                  </p>
                </div>
                <ul className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-800 font-light border-t border-[#235C43]/20 pt-3">
                  <li>• Entrada monoambiente: <strong className="text-stone-900 block mt-0.5">Desde USD 56.210</strong></li>
                  <li>• Retorno anual por renta: <strong className="text-[#1A4D36] block mt-0.5">10,2% – 11,4% en USD</strong></li>
                  <li>• Plusvalía a la entrega: <strong className="text-stone-900 block mt-0.5">+17% ($2.050 USD/m²)</strong></li>
                </ul>
              </div>
            </div>
          </section>


          {/* 7. DISPONIBILIDAD & SIMULADOR EN TIEMPO REAL · UNIDADES DE GARDEN ZEN */}
          <section id="disponibilidad" ref={disponibilidadRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-[#235C43]" />
                <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#235C43]">
                  Inventario & Disponibilidad Oficial
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshInventory}
                  disabled={isRefreshingInv}
                  title="Actualizar disponibilidad desde Google Sheets"
                  className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-stone-700 transition-all hover:bg-stone-50 active:scale-95 disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  <RefreshCw size={12} className={isRefreshingInv ? "animate-spin text-[#235C43]" : ""} />
                  <span>{isRefreshingInv ? "Sincronizando..." : "Actualizar"}</span>
                </button>
                <a
                  href={GARDEN_ZEN_CONFIG.sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-[#235C43] hover:underline"
                  title="Ver planilla oficial en Google Sheets"
                >
                  <span>Google Sheets</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Disponibilidad y Proyección de Ganancia.
            </h2>
            <p className="mt-2 text-sm font-light text-stone-600 leading-relaxed [text-align:justify] [text-justify:inter-word]">
              Elige el ambiente de tu interés y selecciona el piso disponible en la torre para conocer su precio exacto de preventa y la rentabilidad estimada.
            </p>

            {/* Resumen de unidades en vivo */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-[#F4F8F5] px-4 py-3 text-xs">
              <div className="flex items-center gap-3 text-stone-700">
                <span className="font-semibold text-stone-900">{totalUnitsCount} departamentos</span>
                <span className="text-stone-300">·</span>
                <span className="font-semibold text-[#235C43] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#235C43] animate-pulse" />
                  {availableUnitsCount} disponibles
                </span>
                <span className="text-stone-300">·</span>
                <span className="text-stone-500">{soldUnitsCount} vendidos</span>
              </div>
              <span className="text-[11px] text-[#1A4D36] font-semibold bg-[#235C43]/10 px-2.5 py-0.5 rounded-full">
                Torre de 13 pisos de vivienda
              </span>
            </div>

            {/* PASO 1: SELECCIONA EL TIPO DE AMBIENTE */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white">1</span>
                <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-900">
                  Elige tu tipo de ambiente:
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AMBIENTE_OPTIONS.map((amb) => {
                  const isSelected = selectedAmbId === amb.id;
                  const matchingUnits = units.filter(amb.matchUnit);
                  const availCount = matchingUnits.filter((u) => u.status === "disponible").length;

                  return (
                    <button
                      key={amb.id}
                      onClick={() => setSelectedAmbId(amb.id)}
                      className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-stone-900 bg-stone-900 text-white shadow-lg ring-2 ring-[#235C43]"
                          : "border-stone-200 bg-white text-stone-800 hover:border-[#235C43] hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-serif text-base font-semibold ${isSelected ? "text-[#9FE1C3]" : "text-stone-900"}`}>
                            {amb.name}
                          </p>
                          <p className={`text-xs mt-0.5 ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                            {amb.areaRange} · {amb.models}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          availCount > 0
                            ? isSelected ? "bg-[#235C43]/40 text-[#9FE1C3] border border-[#235C43]/50" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isSelected ? "bg-stone-800 text-stone-400" : "bg-stone-100 text-stone-400"
                        }`}>
                          {availCount > 0 ? `${availCount} disponibles` : "Agotado"}
                        </span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className={isSelected ? "text-stone-400 font-light" : "text-stone-500 font-light"}>
                          Preventa desde:
                        </span>
                        <span className={`font-serif text-sm font-semibold ${isSelected ? "text-white" : "text-stone-900"}`}>
                          USD {formatGardenZenUsd(amb.basePrice)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PASO 2: SELECCIONA EL PISO DISPONIBLE */}
            <div className="mt-8">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white">2</span>
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-900">
                    Pisos disponibles para {currentAmbiente.shortName}:
                  </h3>
                </div>
                <span className="text-[11px] text-stone-400 font-light">
                  Toca un piso disponible
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {floorsForAmbiente.map(({ floor, isAvailable, unit }) => {
                  const isSelected = selectedFloor === floor;

                  if (!isAvailable) {
                    return (
                      <div
                        key={floor}
                        className="rounded-xl border border-stone-200/60 bg-stone-100/70 px-3 py-2 text-center text-xs text-stone-400 line-through select-none cursor-not-allowed opacity-50"
                        title={`Piso ${floor}: Agotado para esta tipología`}
                      >
                        Piso {floor} · Vendido
                      </div>
                    );
                  }

                  return (
                    <button
                      key={floor}
                      onClick={() => setSelectedFloor(floor)}
                      className={`rounded-xl border px-3.5 py-2 text-center transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#235C43] bg-stone-900 text-white font-semibold shadow-md ring-2 ring-[#235C43]"
                          : "border-stone-200 bg-white text-stone-800 hover:border-[#235C43] hover:bg-stone-50 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-serif text-sm">Piso {floor}</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#235C43] animate-pulse" />
                      </div>
                      <p className={`text-[10px] mt-0.5 font-light ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                        USD {formatGardenZenUsd(unit.cashTotal)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PASO 3: PRECIO EXACTO, MODALIDAD DE PAGO Y CÁLCULO DE GANANCIA */}
            {activeUnit && activeFinancials && (
              <div className="mt-8 rounded-3xl border-2 border-[#235C43] bg-[#F4F8F5] p-5 sm:p-7 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#235C43] text-[10px] font-bold text-white">3</span>
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-[#1A4D36]">
                    Precio oficial y proyección de ganancia:
                  </h3>
                </div>

                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#235C43]/20 pb-4">
                  <div>
                    <span className="rounded-full bg-stone-900 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#9FE1C3]">
                      Unidad {activeUnit.unitNumber} · Piso {activeUnit.floor}
                    </span>
                    <h4 className="mt-2 font-serif text-2xl font-semibold text-stone-900">
                      {activeUnit.roomsLabel} ({activeUnit.modelo})
                    </h4>
                    <p className="text-xs text-stone-600 font-light mt-0.5">
                      Superficie propia: <strong>{activeUnit.areaM2} m²</strong> · Equipetrol Norte
                    </p>
                  </div>

                  <span className="rounded-full bg-[#EAF4EF] px-3 py-1 text-xs font-semibold text-[#1A4D36] border border-[#235C43]/30 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#235C43] animate-pulse" />
                    Disponible para Reserva
                  </span>
                </div>

                {/* Selector de Modalidad de Pago */}
                <div className="mt-5">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-2">
                    Elige la modalidad de pago para esta unidad:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        key: "contado",
                        label: "Al Contado",
                        total: activeUnit.cashTotal,
                        perM2: activeUnit.cashPerM2,
                        detail: "100% al inicio · Máximo ahorro",
                      },
                      {
                        key: "plan70",
                        label: "Plan 70 / 30",
                        total: activeUnit.initial70Total,
                        perM2: activeUnit.initial70PerM2,
                        detail: `Inicial USD ${formatGardenZenUsd(activeUnit.cuotaInicial70)}`,
                      },
                      {
                        key: "plan30",
                        label: "Plan 30 / 70",
                        total: activeUnit.initial30Total,
                        perM2: activeUnit.initial30PerM2,
                        detail: `Inicial USD ${formatGardenZenUsd(activeUnit.cuotaInicial30)}`,
                      },
                    ].map((plan) => {
                      const isSelected = selectedPlan === plan.key;
                      return (
                        <button
                          key={plan.key}
                          onClick={() => setSelectedPlan(plan.key as any)}
                          className={`rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-stone-900 bg-white text-stone-900 shadow-md ring-2 ring-[#235C43]"
                              : "border-stone-200 bg-white/70 text-stone-600 hover:border-stone-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-stone-900">{plan.label}</span>
                            <span className="text-[10px] font-semibold text-[#235C43]">${plan.perM2} USD/m²</span>
                          </div>
                          <p className="mt-1 font-serif text-lg font-bold text-stone-900">
                            USD {formatGardenZenUsd(plan.total)}
                          </p>
                          <p className="text-[11px] text-stone-500 font-light mt-0.5">{plan.detail}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* TABLERO DE RENDIMIENTO FINANCIERO */}
                <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
                  <p className="text-[11px] uppercase tracking-widest font-bold text-stone-500 mb-3 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-[#235C43]" />
                    Proyección de Ganancia & Rentabilidad (Entrega {GARDEN_ZEN_CONFIG.delivery}):
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="rounded-xl bg-[#F4F8F5] p-3.5 border border-stone-200/80">
                      <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                        Valor Estimado a la Entrega ($2.050 USD/m²)
                      </p>
                      <p className="mt-1 font-serif text-2xl font-bold text-[#1A4D36]">
                        USD {formatGardenZenUsd(activeFinancials.marketValueAtDelivery)}
                      </p>
                      <p className="text-[11px] text-stone-500 font-light mt-0.5">
                        Valor referencial terminado en Equipetrol Norte
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-200">
                      <p className="text-[10px] uppercase tracking-wider text-emerald-800 font-semibold">
                        Ganancia Estimada de Preventa (Plusvalía)
                      </p>
                      <p className="mt-1 font-serif text-2xl font-bold text-emerald-700">
                        +USD {formatGardenZenUsd(activeFinancials.capitalGain)}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                        +{activeFinancials.gainPercentage}% de plusvalía acumulada sobre tu compra
                      </p>
                    </div>

                    <div className="rounded-xl bg-stone-50 p-3.5 border border-stone-200/80">
                      <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                        Alquiler Mensual Estimado
                      </p>
                      <p className="mt-1 font-serif text-2xl font-bold text-stone-900">
                        ${activeFinancials.rentMonthlyMin} – ${activeFinancials.rentMonthlyMax} <span className="text-xs font-sans text-stone-500">USD</span>
                      </p>
                      <p className="text-[11px] text-stone-600 font-light mt-0.5">
                        Bs {activeFinancials.rentMonthlyBsMin.toLocaleString("es-BO")} – {activeFinancials.rentMonthlyBsMax.toLocaleString("es-BO")}/mes (TC 12)
                      </p>
                    </div>

                    <div className="rounded-xl bg-stone-50 p-3.5 border border-stone-200/80">
                      <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                        Rentabilidad Anual Estimada
                      </p>
                      <p className="mt-1 font-serif text-2xl font-bold text-emerald-700">
                        {activeFinancials.yieldRange}
                      </p>
                      <p className="text-[11px] text-stone-500 font-light mt-0.5">
                        Retorno en dólares libre de inflación + 50% ahorro en expensas
                      </p>
                    </div>
                  </div>

                  {/* BOTÓN DIRECTO DE RESERVA WHATSAPP */}
                  <div className="mt-5 border-t border-stone-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-stone-700 font-medium text-center sm:text-left">
                        Reserva esta unidad en <strong>Piso {activeUnit.floor} (Unidad {activeUnit.unitNumber})</strong> con <strong>USD {formatGardenZenUsd(GARDEN_ZEN_CONFIG.reservaUsd)}</strong>.
                      </p>
                      <p className="text-[11px] text-stone-400 font-light text-center sm:text-left">
                        Precio oficial congelado con firma directa de contrato.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const planText = selectedPlan === "contado" ? "Al Contado" : selectedPlan === "plan70" ? "Plan 70/30" : "Plan 30/70";
                        reserve(
                          `Hola, vengo directo para reservar en Garden Zen: Unidad ${activeUnit.unitNumber} en Piso ${activeUnit.floor} (${activeUnit.roomsLabel} - ${activeUnit.areaM2} m²), precio USD ${formatGardenZenUsd(activeFinancials.totalPrice)}, modalidad ${planText}. ¿Sigue disponible para coordinar la reserva con USD ${formatGardenZenUsd(GARDEN_ZEN_CONFIG.reservaUsd)}?`,
                          activeFinancials.totalPrice
                        );
                      }}
                      className="w-full sm:w-auto bg-stone-900 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-xl transition-all hover:bg-[#235C43] active:scale-95 text-center shrink-0 cursor-pointer"
                    >
                      Reservar Unidad por WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white hover:bg-[#235C43] transition cursor-pointer"
              >
                <X size={20} />
              </button>
              <div className="max-h-[82vh] overflow-auto flex items-center justify-center p-2">
                <img
                  src={zoomPlanImage}
                  alt="Plano arquitectónico en alta resolución"
                  className="max-h-[78vh] w-auto object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
