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
  HardHat,
  Layers,
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
  EURODESIGN_ADDRESS,
  EURODESIGN_CITY,
  EURODESIGN_CONSTRUCTION_STATUS,
  EURODESIGN_DELIVERY,
  EURODESIGN_NAME,
  EURODESIGN_PARKING_USD,
  EURODESIGN_SHEETS_CSV_URL,
  EURODESIGN_UNITS,
  EURODESIGN_ZONE,
  EurodesignUnit,
  fetchEurodesignLiveUnits,
  formatEurodesignUsd,
  parseEurodesignCsvText,
} from "../eurodesignInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

const HERO_IMAGES = [
  { src: "/eurodesign/fachada-principal.jpg", label: "Fachada Principal" },
  { src: "/eurodesign/amenities/amenity_piscina_skybar.jpg", label: "Piscina Panorámica Piso 18" },
  { src: "/eurodesign/amenities/amenity_lobby_recepcion.jpg", label: "Lobby de Doble Altura" },
  { src: "/eurodesign/arte-ubicacion.jpg", label: "Ubicación Satelital Equipetrol" },
  { src: "/eurodesign/amenities/amenity_sala_lounge.jpg", label: "Sala Lounge Piso 18" },
];

const AMENITY_SLIDES = [
  {
    src: "/eurodesign/amenities/amenity_piscina_dia.jpg",
    category: "Piso 18 Rooftop",
    title: "Piscina Panorámica & Sky Deck 360°",
    description:
      "Ubicada en el piso más alto de la torre con vista infinita sobre todo Santa Cruz y el cielo de Equipetrol. Deck con reposeras, solárium y atardeceres incomparables.",
  },
  {
    src: "/eurodesign/amenities/amenity_piscina_skybar.jpg",
    category: "Rooftop & Coctelería",
    title: "Sky Bar & Piscina Nocturna",
    description:
      "Ambiente exclusivo para eventos y reuniones sociales en las alturas, con barra gourmet, living social climatizado e iluminación ambiental sofisticada.",
  },
  {
    src: "/eurodesign/amenities/amenity_sala_lounge.jpg",
    category: "Social & Eventos",
    title: "Sala Lounge & Club Social",
    description:
      "Espacio de esparcimiento con cómodos sofás seccionales, mesas de banquete, sector de bar y ventanales de piso a techo con vistas despejadas a la ciudad.",
  },
  {
    src: "/eurodesign/amenities/amenity_gimnasio.jpg",
    category: "Fitness & Bienestar",
    title: "Gimnasio Panorámico Climatizado",
    description:
      "Equipamiento de cardio y fuerza de nivel profesional con máquinas de última generación, diseñado para entrenar con vista directa al skyline de Equipetrol.",
  },
  {
    src: "/eurodesign/amenities/amenity_lobby_recepcion.jpg",
    category: "Acceso & Seguridad",
    title: "Lobby de Doble Altura con Seguridad 24/7",
    description:
      "Ingreso imponente revestido en porcelanato de gran formato y celosías de madera noble, mesón de recepción, control de acceso automatizado y doble ascensor.",
  },
  {
    src: "/eurodesign/amenities/amenity_lobby_lounge.jpg",
    category: "Recepción & Espera",
    title: "Salón de Espera & Living Exclusivo",
    description:
      "Espacio de bienvenida amoblado con mobiliario de autor, iluminación cálida indirecta y acabados europeos para confort de residentes y visitantes.",
  },
  {
    src: "/eurodesign/amenities/amenity_living_panoramico.jpg",
    category: "Interiores de Lujo",
    title: "Master Suite & Living Panorámico",
    description:
      "Terminaciones de categoría superior con cocina integrada, cajonería alta y baja de piso a techo, mesones de cuarzo y ventanales de aluminio acústico.",
  },
  {
    src: "/eurodesign/amenities/amenity_rooftop_overview.jpg",
    category: "Piso 18 Rooftop",
    title: "Distribución Panorámica de Áreas Sociales",
    description:
      "Planta completa de amenidades en el piso 18 conectando solárium, piscina infinita, parrillas gourmet, gimnasio y lounge climatizado.",
  },
  {
    src: "/eurodesign/arte-locales.jpg",
    category: "Planta Baja",
    title: "Locales Comerciales & Oficinas en PB",
    description:
      "Espacios de doble altura sobre calle Enrique Finot con vitrinas comerciales de alto tráfico peatonal y vehicular en Equipetrol Norte.",
  },
];

interface TypologyData {
  id: string;
  rooms: number;
  title: string;
  area: string;
  image: string;
  cashPrice: number;
  cuotasPrice: number;
  models: string;
  tagline: string;
  statusBadge: string;
  rentEstimate: string;
  yieldRange: string;
  highlights: string[];
}

const TYPOLOGIES_DATA: TypologyData[] = [
  {
    id: "48m2",
    rooms: 1,
    title: "1 Dormitorio Confort",
    area: "48,30 – 48,50 m²",
    image: "/eurodesign/modelo-04-1d-48m2.jpg",
    cashPrice: 71780,
    cuotasPrice: 76630,
    models: "Modelos 4 y 6",
    tagline:
      "Excelente distribución espacial con cocina americana, living luminoso, balcón hacia Equipetrol y dormitorio máster con vestidor.",
    statusBadge: "Pisos 5 y 6 Disponibles",
    rentEstimate: "USD 550 – 650 / mes",
    yieldRange: "10,2% – 11,0%",
    highlights: [
      "Living-comedor amplio con balcón corrido y ventilación cruzada",
      "Cocina de concepto abierto con mesones de cuarzo/granito",
      "Dormitorio independiente con amplio ropero empotrado",
      "La opción más demandada para renta temporal Airbnb en Equipetrol",
    ],
  },
  {
    id: "57m2",
    rooms: 1,
    title: "1 Dormitorio Suite con Balcón",
    area: "57,00 m²",
    image: "/eurodesign/modelo-03-1d-57m2.jpg",
    cashPrice: 84360,
    cuotasPrice: 90060,
    models: "Modelos 3 y 7",
    tagline:
      "Máximo espacio y confort para 1 dormitorio con terraza privada panorámica corrida y baño en suite.",
    statusBadge: "Pisos 5 al 12 Disponibles",
    rentEstimate: "USD 650 – 780 / mes",
    yieldRange: "10,0% – 11,2%",
    highlights: [
      "57 m² útiles optimizados sin pérdida de metros de circulación",
      "Balcón terraza corrido con vista abierta hacia Equipetrol",
      "Dormitorio principal máster con espacio para escritorio de home office",
      "Alta plusvalía y retorno en dólares proyectado superior al 11% anual",
    ],
  },
  {
    id: "82-84m2",
    rooms: 2,
    title: "2 Dormitorios Master",
    area: "81,20 – 84,60 m²",
    image: "/eurodesign/modelo-01-2d-82m2.jpg",
    cashPrice: 120176,
    cuotasPrice: 128296,
    models: "Modelos 1, 2 y 8",
    tagline:
      "Residencia espaciosa con 2 habitaciones completas, suite máster con vestidor y amplio living panorámico en esquina.",
    statusBadge: "Pisos 5 al 12 y 15 Disponibles",
    rentEstimate: "USD 900 – 1.150 / mes",
    yieldRange: "9,5% – 10,8%",
    highlights: [
      "Suite principal con baño privado y walk-in closet",
      "Segunda habitación amplia para familia, huéspedes o estudio",
      "Cocina semi-integrada con cajonería alta y baja completa",
      "Excelente opción para vivienda familiar y renta corporativa ejecutiva",
    ],
  },
  {
    id: "piso4-terrazas",
    rooms: 1,
    title: "Unidades Piso 4 con Terraza Privada",
    area: "64,00 – 128,50 m²",
    image: "/eurodesign/arte-modelos.jpg",
    cashPrice: 94720,
    cuotasPrice: 101120,
    models: "Unidades Exclusivas Piso 4",
    tagline:
      "Unidades exclusivas del Piso 4 con amplias terrazas al aire libre ideales para jardín privado, deck lounge o mascotas.",
    statusBadge: "Unidades Únicas en Piso 4",
    rentEstimate: "USD 850 – 1.200 / mes",
    yieldRange: "9,2% – 10,5%",
    highlights: [
      "Terrazas exteriores privadas de hasta 45 m² al aire libre",
      "Opciones de 1 y 2 dormitorios con diseño diferenciado",
      "Sensación de vivir en una casa con las amenidades de una torre de lujo",
      "Unidades muy codiciadas por propietarios residentes",
    ],
  },
  {
    id: "locales-pb",
    rooms: 0,
    title: "Locales Comerciales / Oficinas PB",
    area: "123,00 – 129,00 m²",
    image: "/eurodesign/arte-locales.jpg",
    cashPrice: 282900,
    cuotasPrice: 295200,
    models: "Planta Baja Calle Enrique Finot",
    tagline:
      "Locales en esquina estratégica sobre Enrique Finot, con vitrina comercial de alto impacto y doble altura.",
    statusBadge: "2 Locales Disponibles en PB",
    rentEstimate: "USD 2.200 – 2.800 / mes",
    yieldRange: "9,3% – 10,5%",
    highlights: [
      "123 m² y 129 m² en Planta Baja a nivel de calle",
      "Precio preferencial de preventa: $2.300 USD/m² contado",
      "Apto para cafeterías de especialidad, boutiques o sede corporativa",
      "Máxima visibilidad en el epicentro comercial de Equipetrol Norte",
    ],
  },
];

interface AmbienteOption {
  id: string;
  name: string;
  shortName: string;
  rooms: number;
  areaM2: number;
  view: string;
  basePrice: number;
  rentMin: number;
  rentMax: number;
  yieldRange: string;
  matchUnit: (u: EurodesignUnit) => boolean;
}

const AMBIENTE_OPTIONS: AmbienteOption[] = [
  {
    id: "1D-48",
    name: "1 Dormitorio Confort",
    shortName: "1 Dorm · 48,5 m²",
    rooms: 1,
    areaM2: 48.5,
    view: "Equipetrol / Balcón",
    basePrice: 71780,
    rentMin: 550,
    rentMax: 650,
    yieldRange: "10,2% – 11,0%",
    matchUnit: (u) => u.floor >= 5 && u.rooms === 1 && (u.areaM2 === 48.3 || u.areaM2 === 48.5),
  },
  {
    id: "1D-57",
    name: "1 Dormitorio Suite con Balcón",
    shortName: "1 Dorm Suite · 57 m²",
    rooms: 1,
    areaM2: 57.0,
    view: "Vista Panorámica Equipetrol",
    basePrice: 84360,
    rentMin: 650,
    rentMax: 780,
    yieldRange: "10,0% – 11,2%",
    matchUnit: (u) => u.floor >= 5 && u.rooms === 1 && u.areaM2 === 57,
  },
  {
    id: "2D-84",
    name: "2 Dormitorios Master",
    shortName: "2 Dorms Master · 82 - 84,6 m²",
    rooms: 2,
    areaM2: 84.3,
    view: "Esquina Finot / La Plata",
    basePrice: 120176,
    rentMin: 900,
    rentMax: 1150,
    yieldRange: "9,5% – 10,8%",
    matchUnit: (u) => u.floor >= 5 && u.rooms === 2 && (u.areaM2 >= 81.2 && u.areaM2 <= 85),
  },
  {
    id: "piso4-terrazas",
    name: "Piso 4 con Terraza Privada",
    shortName: "Piso 4 · Terrazas 64 - 128 m²",
    rooms: 1,
    areaM2: 92.2,
    view: "Terraza Privada Planta 4",
    basePrice: 94720,
    rentMin: 850,
    rentMax: 1200,
    yieldRange: "9,2% – 10,5%",
    matchUnit: (u) => u.floor === 4,
  },
  {
    id: "locales-pb",
    name: "Locales Comerciales / Oficinas PB",
    shortName: "Planta Baja · 123 - 129 m²",
    rooms: 0,
    areaM2: 123.0,
    view: "Frente a Calle Enrique Finot",
    basePrice: 282900,
    rentMin: 2200,
    rentMax: 2800,
    yieldRange: "9,3% – 10,5%",
    matchUnit: (u) => u.floor === 0,
  },
];

export default function EurodesignLanding({ property, onClose }: Props) {
  const [activeImage, setActiveImage] = useState<string>("/eurodesign/fachada-principal.jpg");
  const [activeLabel, setActiveLabel] = useState<string>("Fachada Principal");
  const [amenityIndex, setAmenityIndex] = useState<number>(0);
  const [zoomPlanImage, setZoomPlanImage] = useState<string | null>(null);

  // Selector interactivo progresivo en 3 pasos
  const [selectedAmbId, setSelectedAmbId] = useState<string>("1D-57");
  const [selectedFloor, setSelectedFloor] = useState<number>(5);
  const [selectedPlan, setSelectedPlan] = useState<"contado" | "cuotas">("contado");

  const [shareFeedback, setShareFeedback] = useState<boolean>(false);
  const [units, setUnits] = useState<EurodesignUnit[]>(EURODESIGN_UNITS);
  const [isRefreshingInv, setIsRefreshingInv] = useState<boolean>(false);

  // Carga inicial de inventario en vivo
  useEffect(() => {
    fetchEurodesignLiveUnits().then((res) => {
      if (res.units && res.units.length > 0) {
        setUnits(res.units);
      }
    });
  }, []);

  const handleRefreshInventory = async () => {
    setIsRefreshingInv(true);
    try {
      const res = await fetch(EURODESIGN_SHEETS_CSV_URL + "&_t=" + Date.now());
      if (res.ok) {
        const text = await res.text();
        const parsed = parseEurodesignCsvText(text);
        if (parsed.length > 0) {
          setUnits(parsed);
          try {
            window.localStorage.setItem(
              "eurodesign.live_inventory_cache.v1",
              JSON.stringify({ time: Date.now(), units: parsed })
            );
          } catch {}
        }
      }
    } catch (err) {
      console.warn("Error refreshing Eurodesign inventory:", err);
    } finally {
      setIsRefreshingInv(false);
    }
  };

  // Referencias para observador de secciones y actualización del hero izquierdo
  const introRef = useRef<HTMLElement>(null);
  const placeRef = useRef<HTMLElement>(null);
  const amenitiesRef = useRef<HTMLElement>(null);
  const typesRef = useRef<HTMLElement>(null);
  const payRef = useRef<HTMLElement>(null);
  const investorRef = useRef<HTMLElement>(null);
  const disponibilidadRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const scenes: Record<string, { src: string; label: string }> = {
      intro: { src: "/eurodesign/fachada-principal.jpg", label: "Fachada Principal" },
      lugar: { src: "/eurodesign/arte-ubicacion.jpg", label: "Ubicación en Equipetrol" },
      amenidades: { src: "/eurodesign/amenities/amenity_piscina_dia.jpg", label: "Piso 18 Rooftop & Piscina" },
      tipologias: { src: "/eurodesign/arte-modelos.jpg", label: "Tipologías Arquitectónicas" },
      pago: { src: "/eurodesign/amenities/amenity_living_panoramico.jpg", label: "Estructura de Precios & Pagos" },
      inversion: { src: "/eurodesign/amenities/amenity_gimnasio.jpg", label: "Rentabilidad en Equipetrol" },
      disponibilidad: { src: "/eurodesign/fachada-principal.jpg", label: "Disponibilidad en Vivo" },
    };

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

    [introRef, placeRef, amenitiesRef, typesRef, payRef, investorRef, disponibilidadRef].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const currentAmbiente = useMemo(() => {
    return AMBIENTE_OPTIONS.find((a) => a.id === selectedAmbId) || AMBIENTE_OPTIONS[1];
  }, [selectedAmbId]);

  // Pisos existentes para este ambiente ordenados
  const floorsForAmbiente = useMemo(() => {
    const floorNums = Array.from(
      new Set(units.filter((u) => currentAmbiente.matchUnit(u)).map((u) => u.floor))
    ).sort((a, b) => a - b);

    return floorNums.map((floor) => {
      const unitsOnFloor = units.filter((u) => currentAmbiente.matchUnit(u) && u.floor === floor);
      const availableUnits = unitsOnFloor.filter((u) => u.status === "disponible");
      const isAvailable = availableUnits.length > 0;
      return {
        floor,
        isAvailable,
        availableCount: availableUnits.length,
        totalCount: unitsOnFloor.length,
        unit: isAvailable ? availableUnits[0] : unitsOnFloor[0],
      };
    });
  }, [units, currentAmbiente]);

  // Si el piso seleccionado no está disponible, seleccionar el primero disponible
  useEffect(() => {
    const currentFloorItem = floorsForAmbiente.find((f) => f.floor === selectedFloor);
    if (!currentFloorItem || !currentFloorItem.isAvailable) {
      const firstAvailable = floorsForAmbiente.find((f) => f.isAvailable);
      if (firstAvailable) {
        setSelectedFloor(firstAvailable.floor);
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
    let cuotaDuranteObra = 0;
    let planLabel = "Al Contado";
    let perM2 = activeUnit.cashPerM2;

    if (selectedPlan === "cuotas") {
      totalPrice = activeUnit.cuotas.total;
      initialPayment = activeUnit.cuotas.initial40;
      cuotaDuranteObra = activeUnit.cuotas.cuota20;
      saldoContraEntrega = activeUnit.cuotas.balance40;
      planLabel = "Plan en Cuotas (40% Inicial / 20% Obra / 40% Entrega)";
      perM2 = activeUnit.cuotas.perM2;
    }

    const marketValueAtDelivery = Math.round(activeUnit.areaM2 * 2100);
    const capitalGain = Math.max(0, marketValueAtDelivery - totalPrice);
    const gainPercentage = Math.round((capitalGain / totalPrice) * 100);

    const rentMonthlyMin = currentAmbiente.rentMin;
    const rentMonthlyMax = currentAmbiente.rentMax;
    const rentMonthlyBsMin = rentMonthlyMin * 12;
    const rentMonthlyBsMax = rentMonthlyMax * 12;

    const ahorroContado = Math.max(0, activeUnit.cuotas.total - activeUnit.cashTotal);

    return {
      totalPrice,
      initialPayment,
      cuotaDuranteObra,
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
  const soldUnitsCount = units.filter((u) => u.status === "vendido").length;
  const reservedUnitsCount = units.filter((u) => u.status === "reservado").length;

  // Manejo de amenidades
  const currentSlide = AMENITY_SLIDES[amenityIndex] || AMENITY_SLIDES[0];
  const nextAmenity = () => setAmenityIndex((prev) => (prev + 1) % AMENITY_SLIDES.length);
  const prevAmenity = () => setAmenityIndex((prev) => (prev - 1 + AMENITY_SLIDES.length) % AMENITY_SLIDES.length);

  // Compartir
  const handleShare = () => {
    recordLeadEvent({
      action: "share_project",
      propertyRef: "eurodesign",
      operacion: "Preventa",
      zona: EURODESIGN_ZONE,
    }).catch(() => {});
    const url = window.location.origin + window.location.pathname + "?proyecto=eurodesign";
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
      propertyRef: "eurodesign",
      operacion: "Preventa",
      zona: EURODESIGN_ZONE,
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
          href="/eurodesign/presentacion_eurodesign_tower.pdf"
          download="Presentacion_Eurodesign_Tower.pdf"
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            recordLeadEvent({
              action: "brochure_download",
              propertyRef: "eurodesign",
              operacion: "Preventa",
              zona: EURODESIGN_ZONE,
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
          title="Compartir Tower Eurodesign"
        >
          {shareFeedback ? (
            <>
              <Check size={18} className="text-[#9a7b45]" />
              <span className="text-[11px] font-semibold text-[#9a7b45]">¡Copiado!</span>
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
            aria-label="Cerrar vista"
            title="Cerrar vista"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* PANEL IZQUIERDO: RENDER HERO FLOTANTE */}
      <div className="relative h-[45vh] min-h-[300px] w-full shrink-0 overflow-hidden bg-stone-900 select-none md:h-screen md:w-[46%] lg:w-[48%] xl:w-[50%]">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={activeImage}
            alt={activeLabel}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />
        <div className="absolute bottom-6 left-6 right-16 text-white md:bottom-10 md:left-10">
          <span className="inline-block rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e8d5a8] backdrop-blur-md border border-white/10">
            Preventa en Obra Gruesa · {activeLabel}
          </span>
          <h1 className="mt-3 font-serif text-4xl font-light tracking-wide leading-none md:text-6xl">
            TOWER EURODESIGN
          </h1>
          <p className="mt-3 max-w-sm text-sm font-light text-white/90 md:text-base leading-relaxed [text-align:justify] [text-justify:inter-word]">
            Arquitectura de vanguardia europea, terminaciones de categoría y rooftop panorámico en {EURODESIGN_ZONE}.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-white/80 font-light">
            <span>Torre de 18 Niveles</span>
            <span>·</span>
            <span>Entrega {EURODESIGN_DELIVERY}</span>
            <span>·</span>
            <span className="text-[#e8d5a8]">Obra gruesa al 100%</span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[#e8d5a8]">
            <MapPin size={13} /> {EURODESIGN_ADDRESS}
          </p>
        </div>
      </div>

      {/* PANEL DERECHO: Contenido Editorial y Tesis del Inversor */}
      <div className="relative min-h-0 flex-1 md:h-screen md:overflow-y-auto">
        <div className="mx-auto max-w-xl px-5 py-8 pb-32 md:px-10 md:py-14">

          {/* 1. HERO / VIVÍ TOWER EURODESIGN: EXPERIENCIA Y ESTILO DE VIDA */}
          <section id="intro" ref={introRef} className="scroll-mt-6">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Arquitectura de Vanguardia Europea
              </p>
            </div>

            <h2 className="mt-3 font-serif text-3xl font-light leading-snug text-stone-900 md:text-5xl">
              Viví Tower Eurodesign. <br />
              <span className="italic font-normal text-[#9a7b45]">
                Un estándar europeo de confort y plusvalía en Equipetrol Norte.
              </span>
            </h2>

            <p className="mt-5 text-[15px] font-light leading-relaxed text-stone-600 md:text-base [text-align:justify] [text-justify:inter-word]">
              Tower Eurodesign eleva el concepto residencial y comercial en la zona más cotizada de Santa Cruz: <strong>{EURODESIGN_ZONE}</strong>. Su diseño bioclimático contemporáneo, lobby de doble altura revestido en porcelanato y madera, y amenidades exclusivas en el <strong>Piso 18 con vista 360°</strong> ofrecen un estándar residencial inigualable para vivir o maximizar la rentabilidad en dólares por alquiler temporal.
            </p>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-white/70 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#9a7b45]/10 text-[#9a7b45]">
                  <HardHat size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-[#9a7b45]">
                    {EURODESIGN_CONSTRUCTION_STATUS}
                  </p>
                  <p className="text-sm font-medium text-stone-800">
                    Más de {soldUnitsCount} unidades ya han sido comercializadas en esta torre de 18 pisos.
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-stone-500 font-light border-t border-stone-100 pt-2.5 [text-align:justify] [text-justify:inter-word]">
                La oportunidad de ingresar en preventa desde <strong>$1.480 USD/m²</strong> con obra gruesa consolidada en loza 18 asegura el máximo margen de plusvalía frente al valor de mercado terminado ($2.100 USD/m²) con entrega formal en {EURODESIGN_DELIVERY}.
              </p>
            </div>

            {/* Accesos rápidos de navegación */}
            <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-stone-200 pt-4 text-xs font-medium text-stone-500">
              <a href="#lugar" className="hover:text-stone-950 transition-colors">Ubicación</a>
              <a href="#amenidades" className="hover:text-stone-950 transition-colors">Áreas Sociales</a>
              <a href="#tipologias" className="hover:text-stone-950 transition-colors">Tipologías</a>
              <a href="#pago" className="hover:text-stone-950 transition-colors">Formas de Pago</a>
              <a href="#inversion" className="hover:text-stone-950 transition-colors">Rentabilidad</a>
              <a href="#disponibilidad" className="text-[#9a7b45] font-semibold hover:text-stone-950 transition-colors">Disponibilidad en Vivo</a>
            </nav>
          </section>


          {/* 2. UBICACIÓN PRIVILEGIADA & CONECTIVIDAD */}
          <section id="lugar" ref={placeRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Ubicación Insuperable
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Equipetrol Norte: Tranquilidad residencial y conectividad total.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Ubicado estratégicamente sobre <strong>{EURODESIGN_ADDRESS}</strong>, a solo pasos de la Av. San Martín, Ventura Mall, Patio Design, Torre Platinum, Supermercados Fidalga e Hipermaxi, y el polo gastronómico más distinguido de Santa Cruz.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md">
              <img
                src="/eurodesign/arte-ubicacion.jpg"
                alt="Mapa comercial de Equipetrol Norte con Tower Eurodesign"
                className="h-64 w-full object-cover sm:h-72"
              />
              <div className="p-4 sm:p-5">
                <p className="text-xs uppercase tracking-wider font-semibold text-stone-700">
                  Todo lo que necesitas a minutos caminando:
                </p>
                <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs text-stone-500 font-light">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#9a7b45]" />
                    <span>Ventura Mall & Cines (3 min)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#9a7b45]" />
                    <span>Patio Design & Boulevard (2 min)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#9a7b45]" />
                    <span>Hoteles Marriott y Los Tajibos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#9a7b45]" />
                    <span>Torre Platinum & Green Tower</span>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* 3. ÁREAS SOCIALES & AMENIDADES EXCLUSIVAS EN PISO 18 */}
          <section id="amenidades" ref={amenitiesRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Áreas Sociales · Piso 18 Rooftop
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Amenities panorámicos concebidos para disfrutar en las alturas.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              En el piso más alto de la torre se despliega un club social panorámico con vista abierta de 360° hacia toda la ciudad y el horizonte de Equipetrol.
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
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-[#9a7b45] hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                    aria-label="Anterior amenidad"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={nextAmenity}
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-[#9a7b45] hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                    aria-label="Siguiente amenidad"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>

                <div className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[#e8d5a8] backdrop-blur-md">
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
                          ? "border-[#9a7b45] scale-105 shadow-md ring-2 ring-[#9a7b45]/30"
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
              <Sparkles size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Distribución Arquitectónica
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Modelos concebidos para optimizar cada metro cuadrado.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Desde departamentos confortables de 1 dormitorio pensados para rentas en Airbnb hasta residencias familiares de 2 dormitorios máster y locales comerciales de doble altura.
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
                      <p className="text-sm font-semibold uppercase tracking-wider text-[#9a7b45]">
                        {tipo.models}
                      </p>
                    </div>

                    <p className="mt-2 text-sm font-light text-stone-600 leading-relaxed [text-align:justify] [text-justify:inter-word]">
                      {tipo.tagline}
                    </p>

                    <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-md bg-[#fbf9f4] px-3 py-1 text-xs font-medium text-[#816127] border border-stone-200">
                      <CheckCircle2 size={13} /> {tipo.statusBadge}
                    </div>

                    <div className="mt-5 border-t border-stone-100 pt-4">
                      <p className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                        Lo que incluye tu departamento:
                      </p>
                      <ul className="mt-2.5 space-y-2 text-xs font-light text-stone-700">
                        {tipo.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a7b45]" />
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
                          Desde USD {formatEurodesignUsd(tipo.cashPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-[#9a7b45] font-semibold">
                          Rendimiento Anual
                        </p>
                        <p className="text-sm font-bold text-[#816127]">
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
              <TrendingUp size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Estructura de Compra
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Modalidades de pago adaptadas a tu perfil inversor.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Elige cómo distribuir tu capital durante la fase final de obra con entrega confirmada para {EURODESIGN_DELIVERY}.
            </p>

            <div className="mt-6 space-y-4">
              {/* Opción 1: Contado */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-stone-900 bg-stone-900 p-6 text-white shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-[#9a7b45]/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#e8d5a8] border border-[#9a7b45]/40">
                      Mayor Descuento
                    </span>
                    <h3 className="mt-2 font-serif text-2xl">1. Pago al Contado (100%)</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-light text-[#e8d5a8]">$1.480 <span className="text-xs font-sans text-stone-300">USD/m²</span></p>
                    <p className="text-[11px] text-stone-400">vs $2.100 en la zona</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="text-xs uppercase tracking-wider text-[#e8d5a8] font-semibold">Ventaja Comercial:</p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-stone-200 [text-align:justify] [text-justify:inter-word]">
                    Aseguras el valor por m² más competitivo de todo Equipetrol Norte ($1.480 USD/m²). Ahorras hasta USD 10.000 frente al plan en cuotas y aseguras el máximo margen de plusvalía con obra gruesa ya terminada en piso 18.
                  </p>
                </div>
              </div>

              {/* Opción 2: Plan en Cuotas */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-stone-100 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-600">
                      Flexibilidad de Flujo
                    </span>
                    <h3 className="mt-2 font-serif text-xl text-stone-900">2. Plan en Cuotas durante Obra</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-light text-stone-900">$1.580 <span className="text-xs font-sans text-stone-500">USD/m²</span></p>
                    <p className="text-[11px] text-stone-400">40% inicial · 20% obra · 40% entrega</p>
                  </div>
                </div>
                <div className="mt-3.5 border-t border-stone-100 pt-3">
                  <p className="text-xs uppercase tracking-wider text-[#9a7b45] font-semibold">Ventaja Comercial:</p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
                    Desembolso inicial cómodo del 40%, 20% distribuido en cuotas programadas durante la fase de obra fina y 40% final al recibir tus llaves en {EURODESIGN_DELIVERY}.
                  </p>
                </div>
              </div>

              {/* Parqueos */}
              <div className="rounded-2xl border border-stone-200 bg-white/70 p-4 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-stone-900">Parqueos Cubiertos en Subsuelo</p>
                  <p className="text-[11px] text-stone-500 font-light">Espacios vehiculares asignados con acceso automatizado</p>
                </div>
                <p className="font-serif text-lg font-bold text-stone-900">
                  USD {formatEurodesignUsd(EURODESIGN_PARKING_USD)}
                </p>
              </div>
            </div>
          </section>


          {/* 6. RENTABILIDAD & PLUSVALÍA EN EQUIPETROL NORTE */}
          <section id="inversion" ref={investorRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Rentabilidad & Plusvalía
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Por qué invertir en Tower Eurodesign es una decisión rentable y segura.
            </h2>
            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Equipetrol Norte concentra la mayor demanda corporativa y turística de Santa Cruz. Comprar a precio de pozo/obra gruesa ($1.480 USD/m²) frente al precio de venta terminado en la zona ($2.100 USD/m²) genera una ganancia inmediata de capital acumulada a la entrega.
            </p>

            <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#9a7b45]/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#816127]">
                  Diferencial Financiero
                </span>
              </div>
              <h3 className="mt-2 font-serif text-2xl text-stone-900">
                Hasta un 41% de plusvalía neta proyectada.
              </h3>
              <p className="mt-2 text-xs text-stone-600 font-light leading-relaxed [text-align:justify] [text-justify:inter-word]">
                La solidez de tener la obra gruesa al 100% en loza piso 18 elimina el riesgo constructivo. El inversor ingresa en el punto óptimo de valorización, permitiendo vender con alta ganancia a la entrega o generar ingresos por alquiler de hasta USD 1.150 mensuales.
              </p>

              <div className="mt-5 rounded-xl border-2 border-[#9a7b45] bg-[#fbf9f4] p-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#9a7b45] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-bl-lg">
                  Plusvalía Tower
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#816127]">
                    Tower Eurodesign · Equipetrol Norte (Obra Gruesa 100%)
                  </p>
                  <p className="font-serif text-2xl text-stone-900 font-medium">
                    $1.480 <span className="text-xs font-sans text-stone-500">USD/m²</span>
                  </p>
                </div>
                <ul className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-800 font-light border-t border-[#9a7b45]/20 pt-3">
                  <li>• Entrada departamento: <strong className="text-stone-900 block mt-0.5">Desde USD 71.780</strong></li>
                  <li>• Retorno anual por renta: <strong className="text-[#816127] block mt-0.5">10,2% – 11,2% en USD</strong></li>
                  <li>• Plusvalía a la entrega: <strong className="text-stone-900 block mt-0.5">+41% ($2.100 USD/m²)</strong></li>
                </ul>
              </div>
            </div>
          </section>


          {/* 7. DISPONIBILIDAD & SIMULADOR EN TIEMPO REAL · UNIDADES TOWER EURODESIGN */}
          <section id="disponibilidad" ref={disponibilidadRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-[#9a7b45]" />
                <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
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
                  <RefreshCw size={12} className={isRefreshingInv ? "animate-spin text-[#9a7b45]" : ""} />
                  <span>{isRefreshingInv ? "Sincronizando..." : "Actualizar"}</span>
                </button>
                <a
                  href={EURODESIGN_SHEETS_CSV_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-[#9a7b45] hover:underline"
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
              Elige la tipología de tu interés y selecciona el piso disponible en la torre para conocer su precio exacto de preventa y la rentabilidad estimada.
            </p>

            {/* Resumen de unidades en vivo */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-[#fbf9f4] px-4 py-3 text-xs">
              <div className="flex items-center gap-3 text-stone-700">
                <span className="font-semibold text-stone-900">{totalUnitsCount} unidades</span>
                <span className="text-stone-300">·</span>
                <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  {availableUnitsCount} disponibles
                </span>
                <span className="text-stone-300">·</span>
                <span className="text-stone-500">{soldUnitsCount} vendidas</span>
                {reservedUnitsCount > 0 && (
                  <>
                    <span className="text-stone-300">·</span>
                    <span className="text-amber-800">{reservedUnitsCount} reservadas</span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-[#816127] font-semibold bg-[#9a7b45]/15 px-2.5 py-0.5 rounded-full">
                Torre de 18 niveles en Equipetrol
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
                          ? "border-stone-900 bg-stone-900 text-white shadow-lg ring-2 ring-[#9a7b45]"
                          : "border-stone-200 bg-white text-stone-800 hover:border-[#9a7b45] hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-serif text-base font-semibold ${isSelected ? "text-[#e8d5a8]" : "text-stone-900"}`}>
                            {amb.name}
                          </p>
                          <p className={`text-xs mt-0.5 ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                            {amb.shortName} · {amb.view}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          availCount > 0
                            ? isSelected ? "bg-[#9a7b45]/40 text-[#e8d5a8] border border-[#9a7b45]/50" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
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
                          USD {formatEurodesignUsd(amb.basePrice)}
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
                  const label = floor === 0 ? "PB" : `Piso ${floor}`;

                  if (!isAvailable) {
                    return (
                      <div
                        key={floor}
                        className="rounded-xl border border-stone-200/60 bg-stone-100/70 px-3 py-2 text-center text-xs text-stone-400 line-through select-none cursor-not-allowed opacity-50"
                        title={`${label}: Agotado para esta tipología`}
                      >
                        {label} · Vendido
                      </div>
                    );
                  }

                  return (
                    <button
                      key={floor}
                      onClick={() => setSelectedFloor(floor)}
                      className={`rounded-xl border px-3.5 py-2 text-center transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#9a7b45] bg-stone-900 text-white font-semibold shadow-md ring-2 ring-[#9a7b45]"
                          : "border-stone-200 bg-white text-stone-800 hover:border-[#9a7b45] hover:bg-stone-50 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-serif text-sm">{label}</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <p className={`text-[10px] mt-0.5 font-light ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                        USD {formatEurodesignUsd(unit.cashTotal)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PASO 3: PRECIO EXACTO, MODALIDAD DE PAGO Y CÁLCULO DE GANANCIA */}
            {activeUnit && activeFinancials && (
              <div className="mt-8 rounded-3xl border-2 border-[#9a7b45] bg-[#fbf9f4] p-5 sm:p-7 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/70 pb-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#816127]">
                      Unidad Seleccionada en {activeUnit.floorLabel}
                    </span>
                    <h4 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                      {activeUnit.unitNumber} · {activeUnit.tipoLabel}
                    </h4>
                    <p className="text-xs text-stone-600 font-light mt-0.5">
                      Superficie propia: <strong>{activeUnit.areaM2} m²</strong> · Equipetrol Norte
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Disponible para Reserva
                  </span>
                </div>

                {/* Selector de Modalidad de Pago */}
                <div className="mt-5">
                  <p className="text-xs uppercase tracking-wider font-semibold text-stone-700 mb-2.5">
                    Elige la modalidad de pago para conocer tu precio:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        key: "contado",
                        label: "Pago al Contado (100%)",
                        perM2: activeUnit.cashPerM2,
                        total: activeUnit.cashTotal,
                        detail: "Precio mínimo garantizado",
                        badge: "Mayor Ahorro",
                      },
                      {
                        key: "cuotas",
                        label: "Plan en Cuotas",
                        perM2: activeUnit.cuotas.perM2,
                        total: activeUnit.cuotas.total,
                        detail: "40% Inicial / 20% Obra / 40% Entrega",
                        badge: "Flexibilidad",
                      },
                    ].map((plan) => {
                      const isSelected = selectedPlan === plan.key;
                      return (
                        <button
                          key={plan.key}
                          onClick={() => setSelectedPlan(plan.key as any)}
                          className={`rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-stone-900 bg-white text-stone-900 shadow-md ring-2 ring-[#9a7b45]"
                              : "border-stone-200 bg-white/70 text-stone-600 hover:border-stone-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-stone-900">{plan.label}</span>
                            <span className="text-[10px] font-semibold text-[#816127]">${plan.perM2} USD/m²</span>
                          </div>
                          <p className="mt-1 font-serif text-lg font-bold text-stone-900">
                            USD {formatEurodesignUsd(plan.total)}
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
                    <TrendingUp size={14} className="text-[#9a7b45]" />
                    Proyección de Ganancia & Rentabilidad (Entrega {EURODESIGN_DELIVERY}):
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="rounded-xl bg-[#fbf9f4] p-3.5 border border-stone-200/80">
                      <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                        Valor Estimado a la Entrega ($2.100 USD/m²)
                      </p>
                      <p className="mt-1 font-serif text-2xl font-bold text-[#816127]">
                        USD {formatEurodesignUsd(activeFinancials.marketValueAtDelivery)}
                      </p>
                      <p className="text-[11px] text-stone-500 font-light mt-0.5">
                        Valor de mercado terminado en Equipetrol Norte
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-200/80">
                      <p className="text-[10px] uppercase tracking-wider text-emerald-800 font-semibold">
                        Ganancia de Capital Neta Proyectada
                      </p>
                      <p className="mt-1 font-serif text-2xl font-bold text-emerald-800">
                        +USD {formatEurodesignUsd(activeFinancials.capitalGain)}
                        <span className="text-sm font-sans font-semibold text-emerald-700 ml-1.5">
                          (+{activeFinancials.gainPercentage}%)
                        </span>
                      </p>
                      <p className="text-[11px] text-emerald-700 font-light mt-0.5">
                        Plusvalía acumulada frente al precio de preventa
                      </p>
                    </div>
                  </div>

                  <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-stone-100 pt-3.5">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                        Renta Mensual Estimada (Alquiler Tradicional / Airbnb):
                      </p>
                      <p className="font-serif text-lg font-bold text-stone-900 mt-0.5">
                        USD {activeFinancials.rentMonthlyMin} – {activeFinancials.rentMonthlyMax} / mes
                      </p>
                      <p className="text-[11px] text-stone-500 font-light">
                        Equivalente a Bs {activeFinancials.rentMonthlyBsMin.toLocaleString("es-BO")} – {activeFinancials.rentMonthlyBsMax.toLocaleString("es-BO")} / mes (TC 12)
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                        Rendimiento Anual en Dólares (Yield):
                      </p>
                      <p className="font-serif text-lg font-bold text-[#816127] mt-0.5">
                        {activeFinancials.yieldRange}
                      </p>
                      <p className="text-[11px] text-stone-500 font-light">
                        Retorno en dólares libre de inflación en Equipetrol
                      </p>
                    </div>
                  </div>
                </div>

                {/* BOTÓN DE RESERVA DIRECTO POR WHATSAPP */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200/70 pt-5">
                  <div className="text-xs text-stone-600 font-light">
                    <p>
                      Reserva esta unidad en {activeUnit.floorLabel} (Unidad {activeUnit.unitNumber}).
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Precio oficial congelado con firma directa de contrato.
                    </p>
                  </div>

                  <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      onClick={() => {
                        const planText = selectedPlan === "contado" ? "Al Contado ($1.480 USD/m²)" : "En Cuotas ($1.580 USD/m²)";
                        reserve(
                          `Hola, vengo directo para reservar en Tower Eurodesign: Unidad ${activeUnit.unitNumber} en ${activeUnit.floorLabel} (${activeUnit.tipoLabel} - ${activeUnit.areaM2} m²), precio USD ${formatEurodesignUsd(activeFinancials.totalPrice)}, modalidad ${planText}. ¿Sigue disponible para coordinar la reserva?`,
                          activeFinancials.totalPrice
                        );
                      }}
                      className="w-full sm:w-auto bg-stone-900 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-xl transition-all hover:bg-[#9a7b45] active:scale-95 text-center shrink-0 cursor-pointer"
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
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white hover:bg-[#9a7b45] transition cursor-pointer"
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
