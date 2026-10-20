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
  ExternalLink,
  Eye,
  FileText,
  HardHat,
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

const AMENITY_SLIDES = [
  {
    src: "/eurodesign/page-07.jpg",
    category: "Piso 18 Rooftop",
    title: "Piscina Panorámica & Sky Deck 360°",
    description:
      "Ubicada en el piso más alto de la torre con vista infinita de 360° sobre toda Santa Cruz y el cielo de Equipetrol. Deck con reposeras, hidromasaje y atardeceres incomparables.",
  },
  {
    src: "/eurodesign/page-08.jpg",
    category: "Social & Eventos",
    title: "Sky Bar & Lounge Social en Piso 18",
    description:
      "Espacio exclusivo para eventos y reuniones sociales en las alturas, con barra de tragos, living climatizado y ambientación biofílica europea.",
  },
  {
    src: "/eurodesign/page-09.jpg",
    category: "Gastronomía",
    title: "Churrasqueras Panorámicas Equipadas",
    description:
      "Sector de parrillas de acero inoxidable con mesón de apoyo, pérgola y mobiliario de banquete para disfrutar asados con una vista ininterrumpida de la ciudad.",
  },
  {
    src: "/eurodesign/page-10.jpg",
    category: "Negocios & Cowork",
    title: "Coworking Ejecutivo & Business Center",
    description:
      "Sala de reuniones privada y puestos de trabajo climatizados con internet de fibra óptica de alta velocidad, pensado para profesionales y residentes nómadas digitales.",
  },
  {
    src: "/eurodesign/page-11.jpg",
    category: "Fitness & Bienestar",
    title: "Gimnasio Panorámico Climatizado",
    description:
      "Equipamiento de cardio y fuerza de nivel profesional con ventanales de piso a techo, permitiendo entrenar con la mejor panorámica de Equipetrol.",
  },
  {
    src: "/eurodesign/page-06.jpg",
    category: "Acceso & Seguridad",
    title: "Lobby de Doble Altura con Seguridad 24/7",
    description:
      "Ingreso imponente revestido en porcelanatos de gran formato, recepción amoblada, control de acceso biométrico y seguridad física permanente las 24 horas.",
  },
  {
    src: "/eurodesign/arte-locales.jpg",
    category: "Planta Baja",
    title: "Locales Comerciales & Oficinas en PB",
    description:
      "Espacios de doble altura sobre calle Enrique Finot con vitrinas comerciales de alto tráfico peatonal y vehicular en Equipetrol Norte.",
  },
];

const TYPOLOGIES_GALLERY = [
  {
    id: "48m2",
    title: "1 Dormitorio Confort",
    area: "48,30 – 48,50 m²",
    image: "/eurodesign/modelo-04-1d-48m2.jpg",
    cashPrice: 71780,
    cuotasPrice: 76630,
    cuotaInicial: 30652,
    tagline:
      "Excelente distribución espacial con cocina americana, living luminoso y dormitorio con vestidor en suite.",
    statusBadge: "Pisos 5 y 6 Disponibles",
    highlights: [
      "Living-comedor amplio con ventilación cruzada y balcón",
      "Cocina de concepto abierto con mesones de cuarzo/granito",
      "Dormitorio independiente con amplio ropero empotrado",
      "La opción más demandada para renta temporal Airbnb en Equipetrol",
    ],
  },
  {
    id: "57m2",
    title: "1 Dormitorio Suite con Balcón",
    area: "57,00 m²",
    image: "/eurodesign/modelo-03-1d-57m2.jpg",
    cashPrice: 84360,
    cuotasPrice: 90060,
    cuotaInicial: 36024,
    tagline:
      "Máximo espacio y confort para 1 dormitorio con terraza privada panorámica y baño con suite.",
    statusBadge: "Pisos 5 al 12 Disponibles",
    highlights: [
      "57 m² útiles optimizados sin pérdida de metros de circulación",
      "Balcón terraza corrido con vista abierta hacia Equipetrol",
      "Dormitorio principal máster con espacio para escritorio de home office",
      "Alta plusvalía y retorno en dólares proyectado superior al 11% anual",
    ],
  },
  {
    id: "82-84m2",
    title: "2 Dormitorios Master",
    area: "81,20 – 84,60 m²",
    image: "/eurodesign/modelo-01-2d-82m2.jpg",
    cashPrice: 121360,
    cuotasPrice: 129568,
    cuotaInicial: 51827,
    tagline:
      "Residencia espaciosa con 2 habitaciones completas, suite máster con vestidor y amplio living panorámico.",
    statusBadge: "Pisos 5 al 12 y 15 Disponibles",
    highlights: [
      "Suite principal con baño privado y walk-in closet",
      "Segunda habitación amplia para hijos, huéspedes o estudio",
      "Cocina independiente o semi-integrada con cajonería alta y baja",
      "Excelente opción tanto para vivienda familiar como renta corporativa ejecutiva",
    ],
  },
  {
    id: "piso4-terrazas",
    title: "Unidades Piso 4 con Terraza Privada",
    area: "64,00 – 128,50 m²",
    image: "/eurodesign/arte-modelos.jpg",
    cashPrice: 94720,
    cuotasPrice: 101120,
    cuotaInicial: 40448,
    tagline:
      "Unidades exclusivas del Piso 4 con amplias terrazas al aire libre ideales para jardín privado, lounge o mascotas.",
    statusBadge: "Unidades Únicas en Piso 4",
    highlights: [
      "Terrazas exteriores de hasta 45 m² privados adicionales",
      "Opciones de 1 y 2 dormitorios con diseño diferenciado",
      "Sensación de vivir en una casa con la seguridad y amenidades de una torre de lujo",
      "Unidades muy codiciadas por propietarios residentes",
    ],
  },
  {
    id: "locales-pb",
    title: "Locales Comerciales / Oficinas PB",
    area: "123,00 – 129,00 m²",
    image: "/eurodesign/arte-locales.jpg",
    cashPrice: 282900,
    cuotasPrice: 295200,
    cuotaInicial: 118080,
    tagline:
      "Locales en esquina estratégica sobre Enrique Finot, con vitrina comercial de alto impacto y doble altura.",
    statusBadge: "2 Locales Disponibles en PB",
    highlights: [
      "123 m² y 129 m² en Planta Baja a nivel de calle",
      "Precio preferencial de preventa: $2.300/m² contado ($2.400 cuotas)",
      "Apto para cafeterías de especialidad, boutiques, consultorios o sede corporativa",
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
    basePrice: 124764,
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
    basePrice: 136456,
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
  const [activeImage, setActiveImage] = useState("/eurodesign/fachada-principal.jpg");
  const [activeLabel, setActiveLabel] = useState("Fachada Principal");
  const [amenityIndex, setAmenityIndex] = useState(0);

  // Flujo Progresivo en 3 Pasos
  const [selectedAmbId, setSelectedAmbId] = useState<string>("1D-57");
  const [selectedFloor, setSelectedFloor] = useState<number>(5);
  const [selectedPlan, setSelectedPlan] = useState<"contado" | "cuotas">("contado");

  const [shareFeedback, setShareFeedback] = useState(false);
  const [units, setUnits] = useState<EurodesignUnit[]>(EURODESIGN_UNITS);
  const [isRefreshingInv, setIsRefreshingInv] = useState(false);

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

  const totalUnitsCount = units.length;
  const availableUnitsCount = units.filter((u) => u.status === "disponible").length;
  const soldUnitsCount = units.filter((u) => u.status === "vendido").length;
  const reservedUnitsCount = units.filter((u) => u.status === "reservado").length;

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

  const handleSelectAmbiente = (ambId: string) => {
    setSelectedAmbId(ambId);
    const amb = AMBIENTE_OPTIONS.find((a) => a.id === ambId);
    if (amb) {
      const matchingUnitsOnFloor = units.filter(
        (u) => amb.matchUnit(u) && u.floor === selectedFloor && u.status === "disponible"
      );
      if (matchingUnitsOnFloor.length === 0) {
        const firstAvail = units.find((u) => amb.matchUnit(u) && u.status === "disponible");
        if (firstAvail) {
          setSelectedFloor(firstAvail.floor);
        }
      }
    }
  };

  // Unidad activa
  const activeUnit = useMemo(() => {
    const floorItem = floorsForAmbiente.find((f) => f.floor === selectedFloor);
    return floorItem?.unit || null;
  }, [floorsForAmbiente, selectedFloor]);

  // Cálculos financieros
  const activeFinancials = useMemo(() => {
    if (!activeUnit) return null;

    const isCommercial = activeUnit.rooms === 0;
    const isCuotas = selectedPlan === "cuotas";

    const totalPrice = isCuotas ? activeUnit.cuotas.total : activeUnit.cashTotal;
    const pricePerM2 = isCuotas ? activeUnit.cuotas.perM2 : activeUnit.cashPerM2;
    const initialPayment = isCuotas ? activeUnit.cuotas.initial40 : activeUnit.cashTotal;
    const intermediateCuota = isCuotas ? activeUnit.cuotas.cuota20 : 0;
    const deliveryBalance = isCuotas ? activeUnit.cuotas.balance40 : 0;

    // Valor terminado en Equipetrol: ~$1.850 USD/m² para depas, ~$2.800 USD/m² para locales en esquina
    const marketM2AtDelivery = isCommercial ? 2800 : 1850;
    const marketValueAtDelivery = Math.round(activeUnit.areaM2 * marketM2AtDelivery);
    const capitalGain = marketValueAtDelivery - totalPrice;
    const gainPercentage = Math.round((capitalGain / totalPrice) * 100);

    return {
      totalPrice,
      pricePerM2,
      initialPayment,
      intermediateCuota,
      deliveryBalance,
      marketValueAtDelivery,
      capitalGain,
      gainPercentage,
      rentMonthlyMin: currentAmbiente.rentMin,
      rentMonthlyMax: currentAmbiente.rentMax,
      rentMonthlyBsMin: currentAmbiente.rentMin * 12,
      rentMonthlyBsMax: currentAmbiente.rentMax * 12,
      yieldRange: currentAmbiente.yieldRange,
    };
  }, [activeUnit, selectedPlan, currentAmbiente]);

  const handleShareEurodesign = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/?proyecto=eurodesign`;
    const shareTitle = "Tower Eurodesign · Preventa en Equipetrol";
    const shareText = "Departamentos y locales comerciales en Preventa en Equipetrol Norte desde $1.480 USD/m². Conoce Tower Eurodesign:";

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2500);
    } catch {
      // fallback
    }
  };

  const introRef = useRef<HTMLElement>(null);
  const placeRef = useRef<HTMLElement>(null);
  const amenitiesRef = useRef<HTMLElement>(null);
  const typesRef = useRef<HTMLElement>(null);
  const payRef = useRef<HTMLElement>(null);
  const investorRef = useRef<HTMLElement>(null);
  const disponibilidadRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const scenes: Record<string, { src: string; label: string }> = {
      intro: { src: "/eurodesign/fachada-principal.jpg", label: "Fachada Principal" },
      lugar: { src: "/eurodesign/arte-ubicacion.jpg", label: "Ubicación en Equipetrol" },
      amenidades: { src: "/eurodesign/page-07.jpg", label: "Piso 18 Rooftop & Piscina" },
      tipologias: { src: "/eurodesign/arte-modelos.jpg", label: "Tipologías Arquitectónicas" },
      pago: { src: "/eurodesign/page-02.jpg", label: "Estructura de Precios & Pagos" },
      inversion: { src: "/eurodesign/page-05.jpg", label: "Rentabilidad en Equipetrol" },
      disponibilidad: { src: "/eurodesign/fachada-principal.jpg", label: "Disponibilidad en Vivo" },
      cierre: { src: "/eurodesign/page-01-portada.jpg", label: "Visita a Obra en Piso 18" },
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

    [introRef, placeRef, amenitiesRef, typesRef, payRef, investorRef, disponibilidadRef, closeRef].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const phone =
    (property.agentWhatsapp || CONTACT_WHATSAPP_NUMBER).replace(/\D/g, "") ||
    CONTACT_WHATSAPP_NUMBER;

  const reserve = (messageText: string, budget?: number) => {
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: property.id || "eurodesign",
      operacion: "Preventa",
      zona: property.zone || EURODESIGN_ZONE,
      presupuesto: budget ? `USD ${formatEurodesignUsd(budget)}` : `desde $1.480 USD/m²`,
    }).catch(() => {});

    // Meta Pixel Lead tracking
    if (typeof window !== "undefined") {
      try {
        if (typeof (window as any).fbq === "function") {
          (window as any).fbq("track", "Lead", { content_name: "Tower Eurodesign" });
        }
      } catch (err) {
        console.warn("Meta Pixel Lead error:", err);
      }
    }

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const nextAmenity = () => {
    setAmenityIndex((prev) => (prev + 1) % AMENITY_SLIDES.length);
  };

  const prevAmenity = () => {
    setAmenityIndex(
      (prev) => (prev - 1 + AMENITY_SLIDES.length) % AMENITY_SLIDES.length
    );
  };

  const currentSlide = AMENITY_SLIDES[amenityIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col bg-[#0f1115] font-sans text-stone-100 overflow-y-auto overscroll-y-contain md:overflow-hidden md:flex-row"
    >
      {/* Botón Flotante: Compartir */}
      <div className="fixed right-4 top-4 z-[120] flex items-center gap-2 md:right-7 md:top-7">
        <button
          onClick={handleShareEurodesign}
          className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-stone-900/90 px-3.5 py-2.5 text-stone-200 shadow-2xl backdrop-blur transition-transform hover:scale-105 active:scale-95"
          aria-label="Compartir"
          title="Compartir Tower Eurodesign"
        >
          {shareFeedback ? (
            <>
              <Check size={18} className="text-emerald-400" />
              <span className="text-[11px] font-semibold text-emerald-400">¡Copiado!</span>
            </>
          ) : (
            <>
              <Share2 size={18} className="text-[#d4af37]" />
              <span className="text-[11px] font-medium tracking-wide">Compartir</span>
            </>
          )}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-stone-200 backdrop-blur transition-all hover:bg-stone-800 hover:text-white"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* PANEL IZQUIERDO: RENDER HERO FLOTANTE (DESKTOP) */}
      <div className="relative hidden w-full md:block md:w-[46%] lg:w-[48%] xl:w-[50%] h-full shrink-0 overflow-hidden bg-black select-none">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={activeImage}
            alt={activeLabel}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full object-cover object-center"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />

        {/* Badge Flotante con Logo & Etiqueta de la Torre */}
        <div className="absolute left-7 top-7 flex items-center gap-3">
          <img src="/eurodesign/logo.png" alt="Eurodesign" className="h-10 w-auto object-contain filter drop-shadow-md brightness-110" />
          <div className="rounded-full border border-amber-400/40 bg-black/75 px-4 py-1.5 backdrop-blur-md shadow-lg">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#e6ca65]">
              {activeLabel}
            </span>
          </div>
        </div>

        {/* Badge de Obra Piso 18 y Entrega */}
        <div className="absolute bottom-8 left-7 right-7 flex items-end justify-between">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Obra gruesa loza Piso 18 finalizada
            </span>
            <h2 className="mt-2 font-serif text-3xl font-light text-white tracking-wide">
              TOWER EURODESIGN
            </h2>
            <p className="mt-1 text-xs text-stone-300 font-light flex items-center gap-1.5">
              <MapPin size={13} className="text-[#d4af37]" />
              Calle Enrique Finot esq. La Plata · Equipetrol Norte
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/70 px-4 py-3 backdrop-blur text-right">
            <p className="text-[10px] uppercase tracking-widest text-stone-400">Entrega de Llaves</p>
            <p className="font-serif text-lg font-bold text-[#e6ca65]">{EURODESIGN_DELIVERY}</p>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO: CONTENIDO SCROLLABLE */}
      <div className="relative flex-1 overflow-y-auto bg-[#0f1115] text-stone-100 scroll-smooth">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14 md:px-10 lg:px-14">

          {/* SECCIÓN 1: HERO & PREVENTA EXCLUSIVA */}
          <section id="intro" ref={introRef} className="pt-2 pb-14 border-b border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e6ca65]">
                Preventa Exclusiva · Equipetrol Norte
              </span>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-950/40 px-3 py-1 text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Obra en Piso 18
              </span>
            </div>

            <h1 className="mt-5 font-serif text-4xl sm:text-5xl font-light text-white tracking-tight leading-tight">
              TOWER <span className="font-medium text-[#d4af37]">EURODESIGN</span>
            </h1>

            <p className="mt-3 text-lg font-light text-stone-300 leading-relaxed">
              Departamentos y locales comerciales de categoría superior a pasos de la Av. San Martín. Arquitectura bioclimática europea, terminaciones de primer nivel y amenities panorámicos en el Piso 18 con vista 360°.
            </p>

            {/* TABLERO DE DISPONIBILIDAD REAL EN VIVO */}
            <div className="mt-7 rounded-2xl border border-white/10 bg-stone-900/80 p-5 backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                    Disponibilidad Verificada en Vivo
                  </span>
                </div>
                <button
                  onClick={handleRefreshInventory}
                  disabled={isRefreshingInv}
                  className="flex items-center gap-1.5 text-[11px] text-[#d4af37] hover:text-[#f3db83] transition-colors cursor-pointer"
                  title="Sincronizar disponibilidad con Google Sheets"
                >
                  <RefreshCw size={12} className={isRefreshingInv ? "animate-spin" : ""} />
                  <span>{isRefreshingInv ? "Actualizando..." : "Actualizar"}</span>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-black/40 p-3 border border-emerald-500/30">
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-400">
                    {availableUnitsCount}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-stone-400 mt-0.5">
                    Disponibles
                  </p>
                </div>

                <div className="rounded-xl bg-black/40 p-3 border border-white/5">
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-400 line-through">
                    {soldUnitsCount}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-stone-500 mt-0.5">
                    Vendidos (70%+)
                  </p>
                </div>

                <div className="rounded-xl bg-black/40 p-3 border border-amber-500/20">
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-[#e6ca65]">
                    {reservedUnitsCount}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-stone-400 mt-0.5">
                    Reservados
                  </p>
                </div>
              </div>

              <p className="mt-3 text-center text-xs text-stone-400 font-light">
                ⚡ Unidades disponibles de <strong>Piso 12 para abajo</strong> y Locales en Planta Baja. Pisos altos (13 a 17) 100% agotados.
              </p>
            </div>

            {/* PRECIOS Y PARÁMETROS CLAVE */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <p className="text-[10px] uppercase tracking-wider text-stone-400">Al Contado</p>
                <p className="font-serif text-xl font-bold text-[#e6ca65] mt-1">$1.480 <span className="text-xs font-sans text-stone-400">USD/m²</span></p>
                <p className="text-[10px] text-stone-400 mt-0.5">Mayor ahorro</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <p className="text-[10px] uppercase tracking-wider text-stone-400">En Cuotas</p>
                <p className="font-serif text-xl font-bold text-white mt-1">$1.580 <span className="text-xs font-sans text-stone-400">USD/m²</span></p>
                <p className="text-[10px] text-stone-400 mt-0.5">40% inicial</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <p className="text-[10px] uppercase tracking-wider text-stone-400">Parqueos</p>
                <p className="font-serif text-xl font-bold text-white mt-1">USD {formatEurodesignUsd(EURODESIGN_PARKING_USD)}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">Cubiertos</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <p className="text-[10px] uppercase tracking-wider text-stone-400">Entrega</p>
                <p className="font-serif text-xl font-bold text-emerald-400 mt-1">{EURODESIGN_DELIVERY}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">En obra piso 18</p>
              </div>
            </div>

            {/* BOTONES DIRECTOS HERO */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <a
                href="#disponibilidad"
                className="w-full sm:w-auto flex-1 rounded-xl bg-[#d4af37] px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.15em] text-stone-950 shadow-xl transition-all hover:bg-[#ebd57d] active:scale-95 cursor-pointer"
              >
                Elegir Unidad & Proyectar Ganancia
              </a>
              <button
                onClick={() => {
                  reserve(
                    "Hola, vengo directo para consultar por Tower Eurodesign en Equipetrol. ¿Me pueden enviar la disponibilidad actualizada de preventa?",
                    71780
                  );
                }}
                className="w-full sm:w-auto rounded-xl border border-white/20 bg-stone-900/80 px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-stone-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle size={16} className="text-emerald-400" />
                <span>Consultar por WhatsApp</span>
              </button>
            </div>
          </section>

          {/* SECCIÓN 2: UBICACIÓN INSUPERABLE EN EQUIPETROL */}
          <section id="lugar" ref={placeRef} className="py-14 border-b border-white/10">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
              Ubicación Privilegiada
            </span>
            <h2 className="mt-2 font-serif text-3xl font-light text-white">
              El corazón de Equipetrol Norte
            </h2>
            <p className="mt-3 text-sm text-stone-300 font-light leading-relaxed">
              Emplazado en la <strong>Calle Enrique Finot esquina La Plata (9 Oeste)</strong>, a pocos metros de la Avenida San Martín. La zona de mayor prestigio, seguridad y retorno de Santa Cruz de la Sierra.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <img
                src="/eurodesign/arte-ubicacion.jpg"
                alt="Ubicación Tower Eurodesign Equipetrol"
                className="w-full object-cover aspect-[16/9]"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold text-[#e6ca65]">A pasos de Av. San Martín</p>
                <p className="text-xs text-stone-400 mt-1">
                  Acceso directo a cafés de especialidad, restaurantes de alta cocina y vida ejecutiva.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold text-[#e6ca65]">Hotelería 5 Estrellas</p>
                <p className="text-xs text-stone-400 mt-1">
                  A minutos del Hotel Marriott, Los Tajibos y centros corporativos internacionales.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold text-[#e6ca65]">Renta Airbnb Asegurada</p>
                <p className="text-xs text-stone-400 mt-1">
                  La zona con la tasa de ocupación temporal más alta de toda Bolivia (+80%).
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: ÁREAS SOCIALES EN PISO 18 */}
          <section id="amenidades" ref={amenitiesRef} className="py-14 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                  Piso 18 Rooftop
                </span>
                <h2 className="mt-2 font-serif text-3xl font-light text-white">
                  Amenities de Lujo con Vista 360°
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevAmenity}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-stone-900 text-white hover:border-[#d4af37] transition-all cursor-pointer"
                  aria-label="Anterior amenidad"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextAmenity}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-stone-900 text-white hover:border-[#d4af37] transition-all cursor-pointer"
                  aria-label="Siguiente amenidad"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <p className="mt-3 text-sm text-stone-300 font-light">
              Desliza para conocer los espacios comunes de la torre diseñados para el bienestar y la recreación.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-black">
                <img
                  src={currentSlide.src}
                  alt={currentSlide.title}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="rounded-full bg-[#d4af37] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950">
                    {currentSlide.category}
                  </span>
                  <h3 className="mt-2 font-serif text-2xl font-semibold text-white">
                    {currentSlide.title}
                  </h3>
                  <p className="mt-1 text-xs text-stone-300 font-light leading-relaxed max-w-xl">
                    {currentSlide.description}
                  </p>
                </div>
              </div>

              {/* Indicadores de Amenidades */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-stone-900/60">
                <span className="text-[11px] text-stone-400">
                  {amenityIndex + 1} de {AMENITY_SLIDES.length} amenidades
                </span>
                <div className="flex gap-1.5">
                  {AMENITY_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAmenityIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === amenityIndex ? "w-6 bg-[#d4af37]" : "w-1.5 bg-white/20"
                      }`}
                      aria-label={`Ir a amenidad ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 4: TIPOLOGÍAS & PLANOS ARQUITECTÓNICOS */}
          <section id="tipologias" ref={typesRef} className="py-14 border-b border-white/10">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
              Tipologías Arquitectónicas
            </span>
            <h2 className="mt-2 font-serif text-3xl font-light text-white">
              Modelos diseñados con estándar europeo
            </h2>
            <p className="mt-3 text-sm text-stone-300 font-light">
              Plantas optimizadas sin pasillos muertos, ventanas de piso a techo y terminaciones de lujo.
            </p>

            <div className="mt-8 space-y-6">
              {TYPOLOGIES_GALLERY.map((tipo) => (
                <div
                  key={tipo.id}
                  className="rounded-2xl border border-white/10 bg-stone-900/70 p-5 sm:p-6 backdrop-blur shadow-xl transition-all hover:border-[#d4af37]/50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                        {tipo.statusBadge}
                      </span>
                      <h3 className="mt-2.5 font-serif text-2xl font-semibold text-white">
                        {tipo.title}
                      </h3>
                      <p className="text-sm text-[#e6ca65] font-medium mt-0.5">
                        Superficie: {tipo.area}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-stone-400">Contado</p>
                      <p className="font-serif text-xl sm:text-2xl font-bold text-[#e6ca65]">
                        USD {formatEurodesignUsd(tipo.cashPrice)}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Cuotas desde 40%: USD {formatEurodesignUsd(tipo.cuotaInicial)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-stone-300 font-light leading-relaxed">
                    {tipo.tagline}
                  </p>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/60">
                      <img
                        src={tipo.image}
                        alt={tipo.title}
                        className="w-full object-cover aspect-[4/3] hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                        Características Destacadas:
                      </p>
                      {tipo.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-stone-300 font-light">
                          <CheckCircle2 size={14} className="text-[#d4af37] shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}

                      <a
                        href="#disponibilidad"
                        onClick={() => {
                          const matchingAmb = AMBIENTE_OPTIONS.find((a) => a.id.includes(tipo.id.split("-")[0]));
                          if (matchingAmb) handleSelectAmbiente(matchingAmb.id);
                        }}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#d4af37] hover:text-[#ebd57d] cursor-pointer"
                      >
                        <span>Ver pisos disponibles de esta tipología</span>
                        <ArrowRight size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECCIÓN 5: ESTRUCTURA DE COMPRA & FORMAS DE PAGO */}
          <section id="pago" ref={payRef} className="py-14 border-b border-white/10">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
              Estructura Financiera
            </span>
            <h2 className="mt-2 font-serif text-3xl font-light text-white">
              Modalidades de Pago Flexibles
            </h2>
            <p className="mt-3 text-sm text-stone-300 font-light">
              Precios oficiales de preventa directa con la constructora sin intermediarios ni comisiones extras.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Modalidad Contado */}
              <div className="rounded-2xl border-2 border-[#d4af37] bg-stone-900/90 p-6 shadow-2xl relative">
                <span className="absolute -top-3 right-6 rounded-full bg-[#d4af37] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-950">
                  Mayor Descuento
                </span>
                <p className="text-xs uppercase tracking-widest font-semibold text-stone-400">Modalidad 1</p>
                <h3 className="mt-1 font-serif text-2xl font-bold text-white">Al Contado</h3>
                <p className="mt-2 font-serif text-3xl font-bold text-[#e6ca65]">
                  $1.480 <span className="text-sm font-sans text-stone-300">USD/m²</span>
                </p>
                <p className="text-xs text-stone-400 mt-1">100% al momento de la firma</p>

                <ul className="mt-5 space-y-2.5 text-xs text-stone-300 border-t border-white/10 pt-4">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>Ahorro directo de $100 USD/m² sobre precio en cuotas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>Mayor rentabilidad y plusvalía inmediata asegurada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>Locales Comerciales PB: $2.300 USD/m²</span>
                  </li>
                </ul>
              </div>

              {/* Modalidad en Cuotas */}
              <div className="rounded-2xl border border-white/20 bg-stone-900/70 p-6 shadow-xl">
                <p className="text-xs uppercase tracking-widest font-semibold text-stone-400">Modalidad 2</p>
                <h3 className="mt-1 font-serif text-2xl font-bold text-white">En Cuotas Flexibles</h3>
                <p className="mt-2 font-serif text-3xl font-bold text-white">
                  $1.580 <span className="text-sm font-sans text-stone-300">USD/m²</span>
                </p>
                <p className="text-xs text-stone-400 mt-1">Plan estructurado durante la construcción</p>

                <div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-xs text-stone-300">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-white">40% Cuota Inicial</p>
                      <p className="text-[11px] text-stone-400">A la firma del contrato de preventa</p>
                    </div>
                    <span className="font-bold text-[#e6ca65]">40%</span>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-white">20% En Cuotas Intermedias</p>
                      <p className="text-[11px] text-stone-400">Dividido entre Diciembre y Febrero</p>
                    </div>
                    <span className="font-bold text-white">20%</span>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-white">40% Contra Entrega</p>
                      <p className="text-[11px] text-stone-400">En Junio 2027 a la entrega de llaves</p>
                    </div>
                    <span className="font-bold text-emerald-400">40%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Parqueos y Locales */}
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-500/20 p-2.5 text-[#e6ca65]">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="font-semibold text-white">Parqueos Cubiertos Disponibles</p>
                  <p className="text-stone-400">Espacios de estacionamiento cubiertos a <strong>USD 12.500</strong></p>
                </div>
              </div>
              <a
                href="#disponibilidad"
                className="text-[#d4af37] hover:underline font-semibold text-xs tracking-wider uppercase shrink-0"
              >
                Ver calculadora con cuotas
              </a>
            </div>
          </section>

          {/* SECCIÓN 6: PLUSVALÍA & RENTABILIDAD EN EQUIPETROL */}
          <section id="inversion" ref={investorRef} className="py-14 border-b border-white/10">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
              Análisis para Inversionistas
            </span>
            <h2 className="mt-2 font-serif text-3xl font-light text-white">
              Rentabilidad en dólares y blindaje de capital
            </h2>
            <p className="mt-3 text-sm text-stone-300 font-light leading-relaxed">
              Equipetrol es la zona más demandada de Santa Cruz para renta temporal ejecutiva. Comprar en preventa a $1.480 USD/m² genera una valorización inmediata contra el valor de entrega terminado ($1.850 USD/m²).
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-stone-900/80 p-4">
                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                  Valor Terminado Estimado
                </p>
                <p className="mt-1 font-serif text-2xl font-bold text-[#e6ca65]">$1.850 USD/m²</p>
                <p className="text-[11px] text-stone-400 mt-1">Precio promedio terminado en Equipetrol Norte</p>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
                  Plusvalía de Preventa
                </p>
                <p className="mt-1 font-serif text-2xl font-bold text-emerald-400">+25% Plusvalía</p>
                <p className="text-[11px] text-emerald-300/80 mt-1">Ganancia neta sobre el precio de compra en pozo</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-stone-900/80 p-4">
                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                  Retorno Anual en Dólares
                </p>
                <p className="mt-1 font-serif text-2xl font-bold text-white">10% – 12% Anual</p>
                <p className="text-[11px] text-stone-400 mt-1">Combinación de alquiler temporal Airbnb y ejecutivo</p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 7: DISPONIBILIDAD DINÁMICA & CALCULADORA EN 3 PASOS */}
          <section id="disponibilidad" ref={disponibilidadRef} className="py-14 border-b border-white/10">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
              Flujo Interactivo en 3 Pasos
            </span>
            <h2 className="mt-2 font-serif text-3xl font-light text-white">
              Disponibilidad oficial & Proyección de Ganancia
            </h2>
            <p className="mt-3 text-sm text-stone-300 font-light">
              Elige el ambiente que te interesa, revisa los pisos disponibles en tiempo real y calcula tu rentabilidad exacta.
            </p>

            {/* PASO 1: SELECCIÓN DE AMBIENTE / TIPOLOGÍA */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d4af37] text-xs font-bold text-stone-950">
                  1
                </span>
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[#e6ca65]">
                  Paso 1: Elige el tipo de ambiente
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {AMBIENTE_OPTIONS.map((amb) => {
                  const isSelected = selectedAmbId === amb.id;
                  const availableCount = units.filter((u) => amb.matchUnit(u) && u.status === "disponible").length;

                  return (
                    <button
                      key={amb.id}
                      onClick={() => handleSelectAmbiente(amb.id)}
                      className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#d4af37] bg-stone-900 shadow-xl ring-2 ring-[#d4af37]"
                          : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{amb.shortName}</span>
                        {availableCount > 0 ? (
                          <span className="rounded-full bg-emerald-950 border border-emerald-500/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            {availableCount} disp.
                          </span>
                        ) : (
                          <span className="rounded-full bg-stone-800 px-2 py-0.5 text-[10px] text-stone-500 line-through">
                            Agotado
                          </span>
                        )}
                      </div>
                      <p className="font-serif text-lg font-bold text-[#e6ca65] mt-2">
                        desde USD {formatEurodesignUsd(amb.basePrice)}
                      </p>
                      <p className="text-[11px] text-stone-400 font-light mt-0.5">
                        Alquiler est: ${amb.rentMin} – ${amb.rentMax} USD/mes
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PASO 2: SELECCIÓN DE PISO DISPONIBLE */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d4af37] text-xs font-bold text-stone-950">
                    2
                  </span>
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-[#e6ca65]">
                    Paso 2: Selecciona un piso disponible para {currentAmbiente.name}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {floorsForAmbiente.map(({ floor, isAvailable, unit }) => {
                  const isSelected = selectedFloor === floor;
                  const floorTitle = floor === 0 ? "Planta Baja" : `Piso ${floor}`;

                  if (!isAvailable) {
                    return (
                      <div
                        key={floor}
                        className="rounded-xl border border-white/5 bg-stone-900/40 p-2.5 text-center text-xs text-stone-500 line-through select-none cursor-not-allowed opacity-40"
                        title={`${floorTitle}: Agotado para esta tipología`}
                      >
                        {floorTitle} · Vendido
                      </div>
                    );
                  }

                  return (
                    <button
                      key={floor}
                      onClick={() => setSelectedFloor(floor)}
                      className={`rounded-xl border p-2.5 text-center transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#d4af37] bg-stone-900 text-white font-semibold shadow-lg ring-2 ring-[#d4af37]"
                          : "border-white/10 bg-white/5 text-stone-300 hover:border-[#d4af37]/60 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-serif text-sm">{floorTitle}</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <p className={`text-[10px] mt-0.5 font-light ${isSelected ? "text-[#e6ca65]" : "text-stone-400"}`}>
                        USD {formatEurodesignUsd(unit.cashTotal)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PASO 3: PRECIO EXACTO, MODALIDAD & CÁLCULO DE GANANCIA */}
            {activeUnit && activeFinancials && (
              <div className="mt-8 rounded-3xl border-2 border-[#d4af37] bg-stone-900/90 p-5 sm:p-7 shadow-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d4af37] text-xs font-bold text-stone-950">
                    3
                  </span>
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-[#e6ca65]">
                    Paso 3: Precio oficial y cálculo de rentabilidad
                  </h3>
                </div>

                {/* Encabezado de la Unidad */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#e6ca65] border border-amber-500/30">
                      {activeUnit.floorLabel} · UNIDAD {activeUnit.unitNumber}
                    </span>
                    <h4 className="mt-2 font-serif text-2xl font-semibold text-white">
                      {currentAmbiente.name}
                    </h4>
                    <p className="text-xs text-stone-300 font-light mt-0.5">
                      Superficie: <strong>{activeUnit.areaM2} m²</strong> · {activeUnit.tipoLabel}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-950 border border-emerald-500/50 px-3 py-1 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Disponible para Reserva
                  </span>
                </div>

                {/* Selector de Modalidad */}
                <div className="mt-5">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">
                    Elige la modalidad de pago para este piso:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedPlan("contado")}
                      className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                        selectedPlan === "contado"
                          ? "border-[#d4af37] bg-black text-white shadow-lg ring-2 ring-[#d4af37]"
                          : "border-white/10 bg-white/5 text-stone-400 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-white">Al Contado</span>
                        <span className="text-[10px] font-semibold text-[#e6ca65]">${activeUnit.cashPerM2} USD/m²</span>
                      </div>
                      <p className="mt-1 font-serif text-xl font-bold text-[#e6ca65]">
                        USD {formatEurodesignUsd(activeUnit.cashTotal)}
                      </p>
                      <p className="text-[11px] text-stone-400 font-light mt-0.5">100% al inicio · Máximo ahorro</p>
                    </button>

                    <button
                      onClick={() => setSelectedPlan("cuotas")}
                      className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                        selectedPlan === "cuotas"
                          ? "border-[#d4af37] bg-black text-white shadow-lg ring-2 ring-[#d4af37]"
                          : "border-white/10 bg-white/5 text-stone-400 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-white">En Cuotas</span>
                        <span className="text-[10px] font-semibold text-[#e6ca65]">${activeUnit.cuotas.perM2} USD/m²</span>
                      </div>
                      <p className="mt-1 font-serif text-xl font-bold text-white">
                        USD {formatEurodesignUsd(activeUnit.cuotas.total)}
                      </p>
                      <p className="text-[11px] text-stone-400 font-light mt-0.5">
                        Inicial 40%: USD {formatEurodesignUsd(activeUnit.cuotas.initial40)}
                      </p>
                    </button>
                  </div>
                </div>

                {/* DETALLE DEL PLAN EN CUOTAS SI ESTÁ SELECCIONADO */}
                {selectedPlan === "cuotas" && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center text-xs">
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase">40% Cuota Inicial</p>
                      <p className="font-serif text-base font-bold text-[#e6ca65] mt-0.5">
                        USD {formatEurodesignUsd(activeFinancials.initialPayment)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase">20% Cuotas (Dic - Feb)</p>
                      <p className="font-serif text-base font-bold text-white mt-0.5">
                        USD {formatEurodesignUsd(activeFinancials.intermediateCuota)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase">40% Contra Entrega (Jun 2027)</p>
                      <p className="font-serif text-base font-bold text-emerald-400 mt-0.5">
                        USD {formatEurodesignUsd(activeFinancials.deliveryBalance)}
                      </p>
                    </div>
                  </div>
                )}

                {/* CÁLCULO DE GANANCIA Y PLUSVALÍA */}
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/60 p-5">
                  <p className="text-[11px] uppercase tracking-widest font-bold text-stone-400 mb-3 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-[#d4af37]" />
                    Proyección de Ganancia & Rentabilidad (Entrega {EURODESIGN_DELIVERY}):
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="rounded-xl bg-white/5 p-3.5 border border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                        Valor Estimado a la Entrega
                      </p>
                      <p className="mt-1 font-serif text-2xl font-bold text-[#e6ca65]">
                        USD {formatEurodesignUsd(activeFinancials.marketValueAtDelivery)}
                      </p>
                      <p className="text-[11px] text-stone-400 font-light mt-0.5">
                        Valor proyectado a la entrega de llaves en Equipetrol Norte
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-950/40 p-3.5 border border-emerald-500/40">
                      <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
                        Plusvalía Estimada de Preventa
                      </p>
                      <p className="mt-1 font-serif text-2xl font-bold text-emerald-400">
                        +USD {formatEurodesignUsd(activeFinancials.capitalGain)}
                      </p>
                      <p className="text-[11px] text-emerald-300 font-medium mt-0.5">
                        +{activeFinancials.gainPercentage}% de ganancia sobre el precio de preventa
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/5 p-3.5 border border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                        Alquiler Mensual Estimado
                      </p>
                      <p className="mt-1 font-serif text-2xl font-bold text-white">
                        ${activeFinancials.rentMonthlyMin} – ${activeFinancials.rentMonthlyMax} <span className="text-xs font-sans text-stone-400">USD</span>
                      </p>
                      <p className="text-[11px] text-stone-400 font-light mt-0.5">
                        Bs {activeFinancials.rentMonthlyBsMin.toLocaleString("es-BO")} – {activeFinancials.rentMonthlyBsMax.toLocaleString("es-BO")}/mes (TC 12)
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/5 p-3.5 border border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                        Retorno Anual Estimado
                      </p>
                      <p className="mt-1 font-serif text-2xl font-bold text-emerald-400">
                        {activeFinancials.yieldRange}
                      </p>
                      <p className="text-[11px] text-stone-400 font-light mt-0.5">
                        Retorno neto en dólares libre de riesgo de devaluación
                      </p>
                    </div>
                  </div>

                  {/* BOTÓN DIRECTO DE RESERVA POR WHATSAPP */}
                  <div className="mt-5 border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-stone-200 font-medium text-center sm:text-left">
                        Reserva esta unidad en <strong>{activeUnit.floorLabel}</strong> con el <strong>40% de cuota inicial</strong>.
                      </p>
                      <p className="text-[11px] text-stone-400 font-light text-center sm:text-left">
                        Firma de contrato de preventa coordinada directamente con constructora Eurodesign.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const planLabel = selectedPlan === "contado" ? "Al Contado" : "En Cuotas (40% inicial)";
                        reserve(
                          `Hola, vengo directo para reservar en Tower Eurodesign: ${activeUnit.floorLabel} - ${activeUnit.unitNumber} (${activeUnit.rooms} dorm, ${activeUnit.areaM2} m²), precio USD ${formatEurodesignUsd(activeFinancials.totalPrice)}, modalidad ${planLabel}. ¿Sigue disponible para reservar con el 40% de cuota inicial?`,
                          activeFinancials.totalPrice
                        );
                      }}
                      className="w-full sm:w-auto rounded-xl bg-[#d4af37] px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-stone-950 shadow-xl transition-all hover:bg-[#ebd57d] active:scale-95 text-center shrink-0 cursor-pointer"
                    >
                      Reservar Unidad en {activeUnit.floorLabel} por WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* SECCIÓN 8: CIERRE & AGENDAR VISITA A OBRA EN PISO 18 */}
          <section id="cierre" ref={closeRef} className="py-14 text-center">
            <span className="rounded-full border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 inline-flex items-center gap-1.5">
              <HardHat size={14} />
              Visitas a Obra los Martes y Viernes
            </span>

            <h2 className="mt-4 font-serif text-3xl sm:text-4xl font-light text-white">
              Sube a la loza del Piso 18 y conoce tu próxima inversión
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm font-light text-stone-300 leading-relaxed">
              La obra gruesa ya está terminada al 100%. Te acompañamos a recorrer el edificio, comprobar la calidad constructiva y apreciar la vista panorámica en vivo antes de definir tu unidad.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  reserve(
                    "Hola, quiero agendar una visita técnica a la obra de Tower Eurodesign (martes o viernes) para subir a la loza del Piso 18 y conocer los departamentos disponibles.",
                    71780
                  );
                }}
                className="w-full sm:w-auto rounded-xl bg-[#d4af37] px-8 py-4 text-xs font-bold uppercase tracking-[0.15em] text-stone-950 shadow-2xl transition-all hover:bg-[#ebd57d] active:scale-95 cursor-pointer"
              >
                Agendar Visita a la Obra (Martes o Viernes)
              </button>
              <button
                onClick={() => {
                  reserve(
                    "Hola, deseo recibir el brochure completo de Tower Eurodesign con especificaciones técnicas y lista de acabados.",
                    71780
                  );
                }}
                className="w-full sm:w-auto rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                Solicitar Brochure PDF por WhatsApp
              </button>
            </div>

            <p className="mt-8 text-xs text-stone-500 font-light">
              Tower Eurodesign · Calle Enrique Finot esq. La Plata (9 Oeste), Equipetrol Norte · Santa Cruz, Bolivia · Gestión Inmobiliaria N.I.A
            </p>
          </section>

        </div>
      </div>
    </motion.div>
  );
}
