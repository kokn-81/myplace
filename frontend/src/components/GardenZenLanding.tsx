import { useEffect, useMemo, useRef, useState } from "react";
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
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  Home,
  Layers,
  Leaf,
  MapPin,
  Menu,
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
  GARDEN_ZEN_BASELINE_UNITS,
  GARDEN_ZEN_CONFIG,
  GARDEN_ZEN_PARKINGS,
  GardenZenParking,
  GardenZenUnit,
  fetchGardenZenLiveUnits,
  formatGardenZenUsd,
  parseGardenZenLiveCsv,
} from "../gardenZenInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

interface AmbienteOption {
  id: string;
  name: string;
  shortName: string;
  rooms: number;
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
    name: "Monoambiente",
    shortName: "Monoambiente · 37 a 52 m²",
    rooms: 0,
    areaRange: "37,8 a 52,6 m²",
    basePrice: 56210,
    rentMin: 480,
    rentMax: 550,
    yieldRange: "9,8% – 11,2%",
    matchUnit: (u) => u.rooms === 0,
  },
  {
    id: "1d",
    name: "1 Dormitorio",
    shortName: "1 Dormitorio · 46 a 70 m²",
    rooms: 1,
    areaRange: "46,1 a 70,0 m²",
    basePrice: 64540,
    rentMin: 600,
    rentMax: 700,
    yieldRange: "9,5% – 10,8%",
    matchUnit: (u) => u.rooms === 1,
  },
  {
    id: "2d",
    name: "2 Dormitorios",
    shortName: "2 Dormitorios · 83 a 108 m²",
    rooms: 2,
    areaRange: "83,3 a 107,6 m²",
    basePrice: 115388,
    rentMin: 850,
    rentMax: 980,
    yieldRange: "8,8% – 9,9%",
    matchUnit: (u) => u.rooms === 2,
  },
  {
    id: "3d",
    name: "3 Dormitorios / Penthouse",
    shortName: "3 Dormitorios · 106 a 133 m²",
    rooms: 3,
    areaRange: "106,1 a 133,5 m²",
    basePrice: 148568,
    rentMin: 1150,
    rentMax: 1350,
    yieldRange: "8,5% – 9,6%",
    matchUnit: (u) => u.rooms === 3,
  },
];

const AMENITY_SLIDES = [
  {
    src: "/garden_zen/amenities/amenity_piscina.jpg",
    category: "Rooftop Piso 17",
    title: "Piscina Izumi & Deck Panorámico",
    description:
      "Ubicada en el rooftop del piso 17 con vistas abiertas hacia Equipetrol Norte. Un oasis con solárium, reposeras y horizonte panorámico para relajarte con el atardecer cruceño.",
  },
  {
    src: "/garden_zen/amenities/amenity_sauna.jpg",
    category: "Wellness & Relax",
    title: "Sauna Seco Ki & Sauna Vapor Mizu",
    description:
      "Circuito completo de hidroterapia y relajación con vistas panorámicas, diseñado para renovar energías y promover el bienestar físico y mental sin salir de casa.",
  },
  {
    src: "/garden_zen/amenities/amenity_gimnasio.jpg",
    category: "Fitness & Cardio",
    title: "Gimnasio Tecnológico Kinō",
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
      "Segunda estación de parrilla panorámica con living social climatizado, cava de vinos empotrada y vista privilegiada del horizonte de Santa Cruz.",
  },
  {
    src: "/garden_zen/amenities/amenity_calistenia_petspa.jpg",
    category: "Aire Libre & Mascotas",
    title: "Área de Calistenia & Pet Spa",
    description:
      "Zona de entrenamiento funcional al aire libre y estación dedicada de baño y aseo para mascotas con agua tibia y secador profesional.",
  },
  {
    src: "/garden_zen/amenities/amenity_lobby.jpg",
    category: "Acceso & Seguridad",
    title: "Lobby Zen Automatizado",
    description:
      "Recepción de doble altura con celosías acústicas en madera, control de acceso digital inteligente y monitoreo 24/7.",
  },
];

const EQUIPMENT_SECTIONS = [
  {
    id: "cocina",
    title: "Cocina & Sala de Estar",
    subtitle: "Acabados importados y electrodomésticos instalados",
    image: "/garden_zen/preview_page_42.jpg",
    items: [
      "Mesón importado de cuarzo blanco de alta resistencia",
      "Cocina encimera & campana extractora de acero inoxidable",
      "Bacha de lavaplatos & grifería monocomando níquel cepillada",
      "Revestimiento de cocina & pisos de porcelanato rectificado",
      "Aire acondicionado instalado",
      "Iluminación LED empotrada en cajonería y muebles",
      "Chapa de ingreso digital inteligente con tarjeta y clave",
      "Calefón / termotanque instalado sin costos adicionales",
      "Sector de lavandería integrado con tomas de agua y desagüe",
    ],
  },
  {
    id: "dormitorio",
    title: "Dormitorio Principal & Suites",
    subtitle: "Espacios de calma con diseño Japandi y confort térmico",
    image: "/garden_zen/preview_page_43.jpg",
    items: [
      "Ropero con puertas de melamina con acabado de autor",
      "Walking closet con divisiones completas",
      "Pisos de porcelanato de alto tránsito",
      "Aire acondicionado inverter instalado",
      "Ventanales de piso a techo con vidrio laminado acústico",
      "Puntos de iluminación indirecta cálida y tomas USB",
    ],
  },
  {
    id: "bano",
    title: "Baños Completos",
    subtitle: "Piedra sinterizada y accesorios de alta gama",
    image: "/garden_zen/amenities/amenity_sauna.jpg",
    items: [
      "Mesón importado de piedra sinterizada antibacteriana",
      "Paño fijo de vidrio templado de seguridad en ducha",
      "Ducha de monocomando & grifería níquel cepillada",
      "Inodoro ecológico de doble descarga de bajo consumo",
      "Mueble inferior suspendido con tiradores ocultos",
      "Bacha de baño embutida & espejo panorámico",
      "Extractor de aire eléctrico instalado",
      "Piso y revestimiento completo de porcelanato",
    ],
  },
];

export default function GardenZenLanding({ property, onClose }: Props) {
  const [activeImage, setActiveImage] = useState("/garden_zen/fachada.jpg");
  const [activeLabel, setActiveLabel] = useState("Fachada");
  const [amenityIndex, setAmenityIndex] = useState(0);

  // Estados del cotizador en cascada (estilo Apple Store)
  const [selectedAmbId, setSelectedAmbId] = useState<string>("mono");
  const [selectedFloor, setSelectedFloor] = useState<number>(2);
  const [selectedPlan, setSelectedPlan] = useState<"contado" | "plan70" | "plan30">("contado");
  const [selectedParkingOption, setSelectedParkingOption] = useState<"none" | "techado" | "combo" | "moto">("none");
  const [selectedParkingCode, setSelectedParkingCode] = useState<string>("P01");

  const [showAdvisorInsights, setShowAdvisorInsights] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [units, setUnits] = useState<GardenZenUnit[]>(GARDEN_ZEN_BASELINE_UNITS);
  const [isRefreshingInv, setIsRefreshingInv] = useState(false);
  const [lastPriceUpdateText, setLastPriceUpdateText] = useState<string>("Sincronizado");

  const [activeSectionId, setActiveSectionId] = useState<string>("intro");
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [floatingNavOpen, setFloatingNavOpen] = useState(false);

  const outerContainerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLElement>(null);

  const introRef = useRef<HTMLElement>(null);
  const placeRef = useRef<HTMLElement>(null);
  const amenitiesRef = useRef<HTMLElement>(null);
  const typesRef = useRef<HTMLElement>(null);
  const equipRef = useRef<HTMLElement>(null);
  const builderRef = useRef<HTMLElement>(null);
  const payRef = useRef<HTMLElement>(null);
  const disponibilidadRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLElement>(null);

  const SECTIONS_NAV = [
    { id: "intro", label: "Inicio", icon: Home, hint: "Presentación y portada" },
    { id: "lugar", label: "Ubicación", icon: MapPin, hint: "Equipetrol Norte y accesos" },
    { id: "amenidades", label: "Áreas Sociales", icon: Sparkles, hint: "Piscina Piso 17, Saunas & Cowork" },
    { id: "tipologias", label: "Tipologías", icon: Layers, hint: "Mono, 1D, 2D y 3D Penthouse" },
    { id: "equipamiento", label: "Equipamiento", icon: CheckCircle2, hint: "100% Equipado llave en mano" },
    { id: "constructora", label: "Constructora", icon: ShieldCheck, hint: "Garden Buildings · Sede Platinum" },
    { id: "pago", label: "Formas de Pago", icon: CreditCard, hint: "Planes 30%, 70% y Contado" },
    { id: "disponibilidad", label: "Disponibilidad en Vivo", icon: Building2, hint: "Inventario y cotizador interactivo" },
  ];

  const scrollToSection = (sectionId: string) => {
    setFloatingNavOpen(false);
    if (sectionId === "intro") {
      if (introRef.current) {
        introRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (rightPanelRef.current) {
        rightPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (outerContainerRef.current) {
        outerContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    const targetEl = document.getElementById(sectionId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    fetchGardenZenLiveUnits().then((res) => {
      if (res && res.length > 0) {
        setUnits(res);
        setLastPriceUpdateText("Sincronizado en vivo");
      }
    });
  }, []);

  const handleRefreshInventory = async () => {
    setIsRefreshingInv(true);
    try {
      const res = await fetch(GARDEN_ZEN_CONFIG.sheetCsvUrl + "&_t=" + Date.now());
      if (res.ok) {
        const text = await res.text();
        const parsed = parseGardenZenLiveCsv(text);
        if (parsed.length > 0) {
          setUnits(parsed);
          const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setLastPriceUpdateText(`Actualizado ${timeStr}`);
        }
      }
    } catch (err) {
      console.warn("Error refrescando inventario Garden Zen:", err);
    } finally {
      setIsRefreshingInv(false);
    }
  };

  const availableUnits = useMemo(() => units.filter((u) => u.status === "disponible"), [units]);
  const soldUnitsCount = units.filter((u) => u.status === "vendido" || u.status === "reservado").length;

  const minPriceMono = useMemo(() => {
    const list = availableUnits.filter((u) => u.rooms === 0);
    return list.length > 0 ? Math.min(...list.map((u) => u.cashTotal)) : 56210;
  }, [availableUnits]);

  const minPrice1Dorm = useMemo(() => {
    const list = availableUnits.filter((u) => u.rooms === 1);
    return list.length > 0 ? Math.min(...list.map((u) => u.cashTotal)) : 64540;
  }, [availableUnits]);

  const minPrice2Dorms = useMemo(() => {
    const list = availableUnits.filter((u) => u.rooms === 2);
    return list.length > 0 ? Math.min(...list.map((u) => u.cashTotal)) : 115388;
  }, [availableUnits]);

  const minPrice3Dorms = useMemo(() => {
    const list = availableUnits.filter((u) => u.rooms === 3);
    return list.length > 0 ? Math.min(...list.map((u) => u.cashTotal)) : 148568;
  }, [availableUnits]);

  const currentAmbiente = useMemo(() => {
    return AMBIENTE_OPTIONS.find((a) => a.id === selectedAmbId) || AMBIENTE_OPTIONS[0];
  }, [selectedAmbId]);

  const floorsForAmbiente = useMemo(() => {
    const floorNums = Array.from(
      new Set(units.filter((u) => currentAmbiente.matchUnit(u)).map((u) => u.floor))
    ).sort((a, b) => a - b);

    return floorNums.map((floor) => {
      const unitsOnFloor = units.filter((u) => currentAmbiente.matchUnit(u) && u.floor === floor);
      const availableUnitsOnFloor = unitsOnFloor.filter((u) => u.status === "disponible");
      const isAvailable = availableUnitsOnFloor.length > 0;
      return {
        floor,
        isAvailable,
        availableCount: availableUnitsOnFloor.length,
        totalCount: unitsOnFloor.length,
        unit: isAvailable ? availableUnitsOnFloor[0] : unitsOnFloor[0],
      };
    });
  }, [units, currentAmbiente]);

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

  const activeUnit = useMemo(() => {
    const floorItem = floorsForAmbiente.find((f) => f.floor === selectedFloor);
    return floorItem?.unit || null;
  }, [floorsForAmbiente, selectedFloor]);

  // Precio del parqueo opcional
  const parkingPrice = useMemo(() => {
    if (selectedParkingOption === "techado") return 12000;
    if (selectedParkingOption === "combo") return 15000;
    if (selectedParkingOption === "moto") return 7500;
    return 0;
  }, [selectedParkingOption]);

  // Cálculos financieros completos
  const activeFinancials = useMemo(() => {
    if (!activeUnit) return null;

    let unitTotalPrice = activeUnit.cashTotal;
    let unitInitial = activeUnit.cashTotal;
    let unitBalance = 0;
    let pricePerM2 = activeUnit.cashPerM2;

    if (selectedPlan === "plan30") {
      unitTotalPrice = activeUnit.initial30Total;
      unitInitial = activeUnit.cuotaInicial30;
      unitBalance = unitTotalPrice - unitInitial;
      pricePerM2 = activeUnit.initial30PerM2;
    } else if (selectedPlan === "plan70") {
      unitTotalPrice = activeUnit.initial70Total;
      unitInitial = activeUnit.cuotaInicial70;
      unitBalance = unitTotalPrice - unitInitial;
      pricePerM2 = activeUnit.initial70PerM2;
    }

    const hasParking = selectedParkingOption !== "none";
    const parkingInitial = !hasParking
      ? 0
      : selectedPlan === "contado"
      ? parkingPrice
      : selectedPlan === "plan70"
      ? Math.round(parkingPrice * 0.7)
      : Math.round(parkingPrice * 0.3);
    const parkingBalance = !hasParking ? 0 : parkingPrice - parkingInitial;

    const totalPrice = unitTotalPrice + (hasParking ? parkingPrice : 0);
    const initialPayment = unitInitial + parkingInitial;
    const balancePayment = unitBalance + parkingBalance;

    const marketValueAtDelivery = Math.round(activeUnit.areaM2 * 1800);
    const capitalGain = marketValueAtDelivery - totalPrice;
    const gainPercentage = Math.round((capitalGain / totalPrice) * 100);

    return {
      unitTotalPrice,
      unitInitial,
      unitBalance,
      parkingPrice: hasParking ? parkingPrice : 0,
      parkingInitial,
      parkingBalance,
      totalPrice,
      initialPayment,
      balancePayment,
      pricePerM2,
      marketValueAtDelivery,
      capitalGain,
      gainPercentage,
      rentMonthlyMin: currentAmbiente.rentMin,
      rentMonthlyMax: currentAmbiente.rentMax,
      yieldRange: currentAmbiente.yieldRange,
    };
  }, [activeUnit, selectedPlan, currentAmbiente, selectedParkingOption, parkingPrice]);

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/?proyecto=garden-zen`;
    const shareTitle = "Garden Zen · Preventa Eco-Sostenible en Equipetrol Norte";
    const shareText = `Departamentos eco-sostenibles con paneles solares y 50% menos expensas en Equipetrol Norte desde USD ${formatGardenZenUsd(minPriceMono)}. Conoce Garden Zen:`;

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
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    const checkNavVisibility = () => {
      if (!navBarRef.current) return;
      const rect = navBarRef.current.getBoundingClientRect();
      const isPast = rect.bottom < 50;
      setShowFloatingNav(isPast);
      if (!isPast) {
        setFloatingNavOpen(false);
      }
    };

    const rightEl = rightPanelRef.current;
    const outerEl = outerContainerRef.current;

    rightEl?.addEventListener("scroll", checkNavVisibility, { passive: true });
    outerEl?.addEventListener("scroll", checkNavVisibility, { passive: true });
    window.addEventListener("scroll", checkNavVisibility, { passive: true });

    checkNavVisibility();

    return () => {
      rightEl?.removeEventListener("scroll", checkNavVisibility);
      outerEl?.removeEventListener("scroll", checkNavVisibility);
      window.removeEventListener("scroll", checkNavVisibility);
    };
  }, []);

  useEffect(() => {
    const scenes: Record<string, { src: string; label: string }> = {
      intro: { src: "/garden_zen/fachada.jpg", label: "Fachada Principal" },
      lugar: { src: "/garden_zen/ubicacion.jpg", label: "Ubicación Satelital" },
      amenidades: { src: "/garden_zen/amenities/amenity_piscina.jpg", label: "Piscina Izumi Piso 17" },
      tipologias: { src: "/garden_zen/preview_page_43.jpg", label: "Dormitorio Japandi" },
      equipamiento: { src: "/garden_zen/preview_page_42.jpg", label: "Equipamiento Llave en Mano" },
      constructora: { src: "/garden_zen/terraza.jpg", label: "Garden Buildings" },
      pago: { src: "/garden_zen/fachada.jpg", label: "Formas de Pago" },
      disponibilidad: { src: "/garden_zen/preview_page_42.jpg", label: "Disponibilidad en Vivo" },
      cierre: { src: "/garden_zen/fachada.jpg", label: "Reserva USD 5.000" },
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
        setActiveSectionId(visible.target.id);
      },
      { threshold: [0.22, 0.5] }
    );

    [introRef, placeRef, amenitiesRef, typesRef, equipRef, builderRef, payRef, disponibilidadRef, closeRef].forEach(
      (ref) => {
        if (ref.current) observer.observe(ref.current);
      }
    );

    return () => observer.disconnect();
  }, []);

  const phone =
    (property.agentWhatsapp || CONTACT_WHATSAPP_NUMBER).replace(/\D/g, "") ||
    CONTACT_WHATSAPP_NUMBER;

  const reserve = (messageText: string, budget?: number) => {
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: property.id,
      operacion: "Preventa",
      zona: property.zone || GARDEN_ZEN_CONFIG.zone,
      presupuesto: budget ? `USD ${formatGardenZenUsd(budget)}` : `desde USD 56.210`,
    }).catch(() => {});

    if (typeof window !== "undefined") {
      try {
        if (typeof (window as any).fbq === "function") {
          (window as any).fbq("track", "Lead", { content_name: "Garden Zen" });
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
    setAmenityIndex((prev) => (prev - 1 + AMENITY_SLIDES.length) % AMENITY_SLIDES.length);
  };

  const currentSlide = AMENITY_SLIDES[amenityIndex];

  return (
    <motion.div
      ref={outerContainerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col bg-[#f7f5f0] font-sans text-stone-900 overflow-y-auto overscroll-y-contain md:overflow-hidden md:flex-row"
    >
      {/* Botones Flotantes Superiores: Solo Logos según el Manual de NIA */}
      <div className="fixed right-4 top-4 z-[120] flex items-center gap-2 md:right-7 md:top-7">
        <button
          onClick={() => setShowAdvisorInsights(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-800 shadow-xl backdrop-blur transition-all hover:bg-stone-900 hover:text-white hover:border-stone-900 active:scale-95 cursor-pointer"
          aria-label="Insights Asesor"
          title="Insights Asesor · Argumentario de Venta y Ventajas Comerciales"
        >
          <TrendingUp size={18} className="text-[#9a7b45]" />
        </button>

        <a
          href={GARDEN_ZEN_CONFIG.brochurePdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-900 shadow-xl backdrop-blur transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Descargar Brochure Oficial"
          title="Descargar Brochure Oficial (PDF)"
        >
          <Download size={18} className="text-[#9a7b45]" />
        </a>

        <button
          onClick={handleShare}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-900 shadow-xl backdrop-blur transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Compartir"
          title={shareFeedback ? "¡Enlace copiado!" : "Compartir Garden Zen"}
        >
          {shareFeedback ? (
            <Check size={18} className="text-emerald-600" />
          ) : (
            <Share2 size={18} className="text-stone-800" />
          )}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-700 shadow-xl backdrop-blur transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Cerrar"
            title="Volver al mapa"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* PANEL IZQUIERDO / HERO: Fotografía Inmersiva Dinámica con Datos Clave */}
      <div className="relative min-h-[480px] shrink-0 bg-stone-950 md:h-screen md:min-h-0 md:w-[44%]">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/30" />
        <div className="absolute bottom-6 left-6 right-6 text-white md:bottom-8 md:left-8 md:right-8 lg:bottom-10 lg:left-10 lg:right-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block rounded-full bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e8d5a8] backdrop-blur-md border border-white/10">
              Preventa en Obra Fina · Equipetrol Norte
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300 backdrop-blur-md">
              <Zap size={11} className="text-emerald-400" />
              Paneles Solares ON-GRID
            </span>
          </div>

          <h1 className="mt-3 font-serif text-4xl font-light tracking-wide text-white md:text-5xl lg:text-6xl">
            GARDEN ZEN
          </h1>

          <p className="mt-2 text-xs font-light text-stone-200 md:text-sm max-w-md leading-relaxed [text-align:justify] [text-justify:inter-word]">
            Arquitectura minimalista, tecnología eco-sostenible y expensas 50% menores en el corazón de Equipetrol Norte.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-wider text-[#e8d5a8] font-semibold flex items-center gap-1">
                <ShieldCheck size={12} /> Constructora
              </p>
              <p className="mt-0.5 font-serif text-xs sm:text-sm font-semibold text-white">
                {GARDEN_ZEN_CONFIG.builder}
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-wider text-[#e8d5a8] font-semibold flex items-center gap-1">
                <Calendar size={12} /> Entrega de Obra
              </p>
              <p className="mt-0.5 font-serif text-xs sm:text-sm font-semibold text-white">
                {GARDEN_ZEN_CONFIG.delivery} (Obra Fina)
              </p>
            </div>
          </div>

          {/* Tarjetas de Precios en Vivo por Tipología */}
          <div className="mt-3 rounded-2xl border border-white/20 bg-black/40 p-3 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
              <span className="text-[10px] uppercase tracking-widest text-stone-300 font-semibold">
                Departamentos Disponibles
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                en vivo
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="border-r border-white/10 pr-1">
                <p className="text-[10px] text-stone-400">Monoambiente</p>
                <p className="text-[11px] text-stone-300 font-mono">37 a 52 m²</p>
                <p className="mt-0.5 font-serif text-xs sm:text-sm font-bold text-white">
                  Desde USD {formatGardenZenUsd(minPriceMono)}
                </p>
              </div>
              <div className="border-r border-white/10 pr-1">
                <p className="text-[10px] text-stone-400">1 Dormitorio</p>
                <p className="text-[11px] text-stone-300 font-mono">46 a 70 m²</p>
                <p className="mt-0.5 font-serif text-xs sm:text-sm font-bold text-white">
                  Desde USD {formatGardenZenUsd(minPrice1Dorm)}
                </p>
              </div>
              <div className="border-r border-white/10 pr-1">
                <p className="text-[10px] text-stone-400">2 Dormitorios</p>
                <p className="text-[11px] text-stone-300 font-mono">83 a 108 m²</p>
                <p className="mt-0.5 font-serif text-xs sm:text-sm font-bold text-white">
                  Desde USD {formatGardenZenUsd(minPrice2Dorms)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-stone-400">3 Dorms / PH</p>
                <p className="text-[11px] text-stone-300 font-mono">106 a 133 m²</p>
                <p className="mt-0.5 font-serif text-xs sm:text-sm font-bold text-white">
                  Desde USD {formatGardenZenUsd(minPrice3Dorms)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO: Contenido Editorial y Tesis del Inversor */}
      <div ref={rightPanelRef} className="relative min-h-0 flex-1 md:h-screen md:overflow-y-auto">
        <div className="mx-auto max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl px-5 py-8 pb-32 md:px-10 lg:px-14 md:py-14 md:pb-44">

          {/* 1. HERO / VIVÍ GARDEN ZEN: EXPERIENCIA Y ESTILO DE VIDA */}
          <section id="intro" ref={introRef} className="scroll-mt-6">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Experiencia Residencial & Preventa
              </p>
            </div>

            <h2 className="mt-3 font-serif text-3xl font-light leading-snug text-stone-900 md:text-5xl">
              Garden Zen. <br />
              <span className="italic font-normal text-[#9a7b45]">
                Un proyecto pensado para vivir en calma, confort y consciencia.
              </span>
            </h2>

            <p className="mt-5 text-[15px] font-light leading-relaxed text-stone-600 md:text-base [text-align:justify] [text-justify:inter-word]">
              Garden Zen combina arquitectura contemporánea de vanguardia con soluciones de sostenibilidad activa en la zona de mayor plusvalía de Santa Cruz: <strong>{GARDEN_ZEN_CONFIG.zone}</strong>. Desarrollado por <strong>{GARDEN_ZEN_CONFIG.builder}</strong>, su sistema de paneles solares propios genera un ahorro de hasta el <strong>60% en consumo eléctrico</strong> y un <strong>50% menos en expensas</strong> comunes de por vida, ofreciendo el estándar residencial más inteligente y confortable del mercado.
            </p>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-white/70 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#9a7b45]/10 text-[#9a7b45]">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-[#9a7b45]">
                    Preventa en Marcha · Obra Fina
                  </p>
                  <p className="text-sm font-medium text-stone-800">
                    Más de {soldUnitsCount} unidades ya han sido reservadas en esta torre de 16 niveles.
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-stone-500 font-light border-t border-stone-100 pt-2.5 [text-align:justify] [text-justify:inter-word]">
                La oportunidad de ingresar en etapa de obra fina antes de la entrega en {GARDEN_ZEN_CONFIG.delivery} asegura la máxima plusvalía acumulada frente al valor terminado de Equipetrol Norte.
              </p>
            </div>

            {/* Accesos rápidos y Brochure */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={GARDEN_ZEN_CONFIG.brochurePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#9a7b45]/40 bg-[#9a7b45]/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#9a7b45] transition-all hover:bg-[#9a7b45] hover:text-white"
              >
                <Download size={14} />
                Brochure Oficial (PDF)
              </a>
              <button
                type="button"
                onClick={() => scrollToSection("disponibilidad")}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-700 transition-all hover:border-[#9a7b45] hover:text-stone-950 shadow-xs cursor-pointer"
              >
                <Layers size={14} className="text-[#9a7b45]" />
                Ver Disponibilidad en Vivo
              </button>
            </div>

            {/* Barra de Secciones Inicial */}
            <nav
              ref={navBarRef}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-stone-200 pt-4 text-xs font-medium text-stone-500"
            >
              <button
                type="button"
                onClick={() => scrollToSection("intro")}
                className="inline-flex items-center gap-1.5 font-bold text-stone-900 hover:text-[#9a7b45] transition-colors cursor-pointer bg-stone-100 hover:bg-[#9a7b45]/15 px-2.5 py-1 rounded-full text-xs"
                title="Ir al inicio de la presentación de Garden Zen"
              >
                <Home size={13} className="text-[#9a7b45]" />
                <span>Inicio</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("lugar")}
                className="hover:text-stone-950 transition-colors cursor-pointer"
              >
                Ubicación
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("amenidades")}
                className="hover:text-stone-950 transition-colors cursor-pointer"
              >
                Áreas Sociales
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("tipologias")}
                className="hover:text-stone-950 transition-colors cursor-pointer"
              >
                Tipologías
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("equipamiento")}
                className="hover:text-stone-950 transition-colors font-semibold text-[#9a7b45] cursor-pointer"
              >
                Equipamiento
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("constructora")}
                className="hover:text-stone-950 transition-colors font-semibold text-stone-700 cursor-pointer"
              >
                Constructora
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("pago")}
                className="hover:text-stone-950 transition-colors cursor-pointer"
              >
                Formas de Pago
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("disponibilidad")}
                className="text-[#9a7b45] font-semibold hover:text-stone-950 transition-colors cursor-pointer"
              >
                Disponibilidad en Vivo
              </button>
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
              Equipetrol Norte: Tranquilidad residencial y cota alta protegida.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Ubicado estratégicamente sobre la <strong>{GARDEN_ZEN_CONFIG.address}</strong>, a pasos del Supermercado Tía, la Av. San Martín, Ventura Mall, Manzana 40 y el polo corporativo de la Torre Platinum. La zona goza de una cota topográfica alta con excelente drenaje pluvial, garantizando tranquilidad absoluta sin riesgo de anegamientos.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md">
              <img
                src="/garden_zen/ubicacion.jpg"
                alt="Mapa satelital de ubicación de Garden Zen en Equipetrol Norte"
                className="h-64 sm:h-80 w-full object-cover"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-stone-100 p-4 text-xs">
                <div>
                  <p className="font-semibold text-stone-900">A 2 min · Supermercado Tía</p>
                  <p className="text-stone-500 font-light">Compras cotidianas a pie</p>
                </div>
                <div>
                  <p className="font-semibold text-stone-900">A 4 min · Manzana 40 &amp; Platinum</p>
                  <p className="text-stone-500 font-light">Centro empresarial financiero</p>
                </div>
                <div>
                  <p className="font-semibold text-stone-900">A 5 min · Ventura Mall</p>
                  <p className="text-stone-500 font-light">Gastronomía y entretenimiento</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. ÁREAS SOCIALES & AMENIDADES (ROOFTOP PISO 17) */}
          <section id="amenidades" ref={amenitiesRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Áreas Sociales &amp; Bienestar
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              El rooftop más completo de Equipetrol Norte en el Piso 17.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Más de 800 m² de espacios comunes diseñados para el bienestar integral. Cada área social cuenta con energía solar fotovoltaica propia, reduciendo a la mitad el costo mensual de expensas de por vida.
            </p>

            {/* Carrusel interactivo */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="relative aspect-video w-full overflow-hidden bg-stone-900">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentSlide.src}
                    src={currentSlide.src}
                    alt={currentSlide.title}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="h-full w-full object-cover"
                  />
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                <div className="absolute top-4 left-4">
                  <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#e8d5a8] backdrop-blur-md border border-white/10">
                    {currentSlide.category}
                  </span>
                </div>

                <div className="absolute inset-y-0 left-3 flex items-center">
                  <button
                    type="button"
                    onClick={prevAmenity}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-800 shadow-md backdrop-blur transition-all hover:bg-white hover:scale-105 active:scale-95 cursor-pointer"
                    aria-label="Amenidad anterior"
                  >
                    <ChevronLeft size={18} />
                  </button>
                </div>
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <button
                    type="button"
                    onClick={nextAmenity}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-800 shadow-md backdrop-blur transition-all hover:bg-white hover:scale-105 active:scale-95 cursor-pointer"
                    aria-label="Siguiente amenidad"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="font-serif text-xl sm:text-2xl font-normal drop-shadow-sm">
                    {currentSlide.title}
                  </p>
                  <p className="mt-1 text-xs text-stone-200 font-light drop-shadow line-clamp-2 sm:line-clamp-none [text-align:justify]">
                    {currentSlide.description}
                  </p>
                </div>
              </div>

              {/* Puntos de navegación */}
              <div className="flex items-center justify-center gap-1.5 p-3 bg-stone-50 border-t border-stone-100">
                {AMENITY_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.title}
                    type="button"
                    onClick={() => setAmenityIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      amenityIndex === idx ? "w-6 bg-[#9a7b45]" : "w-2 bg-stone-300 hover:bg-stone-400"
                    }`}
                    aria-label={`Ver ${slide.title}`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* 4. TIPOLOGÍAS RESIDENCIALES */}
          <section id="tipologias" ref={typesRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Distribuciones Inteligentes
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Espacios concebidos para alta rotación y renta en dólares.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Cada planta optimiza el metraje útil eliminando pasillos muertos. Con amplios balcones, iluminación cruzada y orientación estratégica para maximizar el confort y la rentabilidad en Airbnb y alquiler tradicional.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AMBIENTE_OPTIONS.map((amb) => {
                const isSelected = selectedAmbId === amb.id;
                let displayPrice = amb.basePrice;
                if (amb.id === "mono") displayPrice = minPriceMono;
                else if (amb.id === "1d") displayPrice = minPrice1Dorm;
                else if (amb.id === "2d") displayPrice = minPrice2Dorms;
                else if (amb.id === "3d") displayPrice = minPrice3Dorms;

                return (
                  <div
                    key={amb.id}
                    onClick={() => {
                      handleSelectAmbiente(amb.id);
                      scrollToSection("disponibilidad");
                    }}
                    className={`rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-[#9a7b45] bg-[#9a7b45]/5 shadow-md"
                        : "border-stone-200 bg-white hover:border-[#9a7b45]/50 hover:shadow-sm"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#9a7b45]">
                          {amb.name}
                        </span>
                        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-mono text-stone-600">
                          {amb.areaRange}
                        </span>
                      </div>
                      <p className="mt-3 font-serif text-2xl font-bold text-stone-900">
                        Desde USD {formatGardenZenUsd(displayPrice)}
                      </p>
                      <p className="mt-1 text-xs text-stone-500 font-light">
                        Renta estimada: USD {amb.rentMin} – {amb.rentMax}/mes
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-medium">Yield: {amb.yieldRange}</span>
                      <span className="inline-flex items-center gap-1 text-[#9a7b45] font-semibold">
                        Ver pisos <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 5. EQUIPAMIENTO 100% INCLUIDO (LLAVE EN MANO) */}
          <section id="equipamiento" ref={equipRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Equipamiento 100% Incluido
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Entrega llave en mano sin costos ocultos ni adicionales.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              En Garden Zen cada departamento se entrega completamente terminado y equipado con materiales de primera línea internacional: cuarzo blanco, piedra sinterizada, climatización instalada y cerraduras inteligentes de acceso digital.
            </p>

            <div className="mt-8 space-y-6">
              {EQUIPMENT_SECTIONS.map((sec) => (
                <div key={sec.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                  <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-stone-900">
                    <img src={sec.image} alt={sec.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5 text-white">
                      <p className="font-serif text-xl sm:text-2xl">{sec.title}</p>
                      <p className="text-xs text-stone-200 font-light mt-0.5">{sec.subtitle}</p>
                    </div>
                  </div>

                  <div className="p-5">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-700 font-light">
                      {sec.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. CONSTRUCTORA & RESPALDO INSTITUCIONAL */}
          <section id="constructora" ref={builderRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Respaldo &amp; Trayectoria
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              {GARDEN_ZEN_CONFIG.builder}. Desarrollos eco-sostenibles de alta gama.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              {GARDEN_ZEN_CONFIG.builder} lidera la transición hacia edificios eco-eficientes en Santa Cruz. Con sede en Platinum II Business Center (Piso 27), sus obras aplican la normativa nacional de Generación Distribuida para asegurar plusvalía patrimonial y costos de mantenimiento reducidos de por vida.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9a7b45]/10 text-[#9a7b45]">
                    <Zap size={20} />
                  </div>
                  <h3 className="mt-3 font-serif text-lg font-bold text-stone-900">
                    Pioneros ON-GRID (CRE)
                  </h3>
                  <p className="mt-2 text-xs text-stone-600 font-light [text-align:justify]">
                    Primeros proyectos desarrollados en coordinación directa con la CRE bajo la normativa nacional de Generación Distribuida, inyectando energía solar y reduciendo un 60% el consumo eléctrico.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] font-semibold text-[#9a7b45]">
                  60% Menos Energía
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9a7b45]/10 text-[#9a7b45]">
                    <Leaf size={20} />
                  </div>
                  <h3 className="mt-3 font-serif text-lg font-bold text-stone-900">
                    50% Menos Expensas
                  </h3>
                  <p className="mt-2 text-xs text-stone-600 font-light [text-align:justify]">
                    Cosecha de agua de lluvia para riego y áreas comunes, junto a iluminación por cúpulas reflectantes, asegurando el costo de expensa más bajo y competitivo de Equipetrol Norte.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] font-semibold text-[#9a7b45]">
                  Costo-Eficiencia de por Vida
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9a7b45]/10 text-[#9a7b45]">
                    <Building2 size={20} />
                  </div>
                  <h3 className="mt-3 font-serif text-lg font-bold text-stone-900">
                    Sello Garden Buildings
                  </h3>
                  <p className="mt-2 text-xs text-stone-600 font-light [text-align:justify]">
                    Desarrolladores de torres emblemáticas en el eje corporativo, con oficinas centrales en Platinum II Business Center (Piso 27) y obras con estricto control de calidad.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] font-semibold text-[#9a7b45]">
                  Sede Platinum II
                </div>
              </div>
            </div>

            {/* Cita del Desarrollador */}
            <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50/70 p-5">
              <p className="font-serif italic text-sm text-stone-700 leading-relaxed [text-align:justify]">
                &quot;Conceptualizamos un estilo de vida responsable, en armonía con los cambios actuales y la tecnología, logrando una vida bajo la premisa de costo eficiente.&quot;
              </p>
              <p className="mt-2 text-xs font-semibold text-[#9a7b45] uppercase tracking-wider">
                — Filosofía de Desarrollo · Garden Buildings
              </p>
            </div>
          </section>

          {/* 7. FORMAS DE PAGO TRANSPARENTES & CRONOGRAMA */}
          <section id="pago" ref={payRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Estructura de Inversión
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Planes de pago flexibles con saldo contra entrega.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Sin cuotas intermedias complicadas durante la obra fina. Congelas tu unidad hoy con <strong>USD {formatGardenZenUsd(GARDEN_ZEN_CONFIG.reservaUsd)}</strong>, integras tu cuota inicial a la firma del contrato y abonas el saldo total directamente al momento de recibir las llaves en {GARDEN_ZEN_CONFIG.delivery}.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* PLAN 30% ANTICIPO */}
              <div
                onClick={() => setSelectedPlan("plan30")}
                className={`rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedPlan === "plan30"
                    ? "border-[#9a7b45] bg-[#9a7b45]/5 shadow-md ring-1 ring-[#9a7b45]"
                    : "border-stone-200 bg-white hover:border-[#9a7b45]/40"
                }`}
              >
                <div>
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-600">
                    Recomendado Inversor
                  </span>
                  <h3 className="mt-2 font-serif text-lg font-bold text-stone-900">
                    Plan 30% Anticipo
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">PM² $1.500 USD/m²</p>

                  <div className="mt-4 rounded-xl bg-white border border-stone-100 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                      Cuota Inicial (30%)
                    </p>
                    <p className="font-serif text-xl font-bold text-[#816127] mt-0.5">
                      {activeFinancials ? `USD ${formatGardenZenUsd(activeFinancials.unitInitial)}` : "30% a la firma"}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Saldo restante: <strong>70% contra entrega</strong>
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-[11px] text-stone-500 font-light border-t border-stone-100 pt-3">
                  Entrada accesible hoy. El 70% restante se liquida recién en Marzo 2027 (con fondos propios o crédito bancario).
                </p>
              </div>

              {/* PLAN 70% ANTICIPO */}
              <div
                onClick={() => setSelectedPlan("plan70")}
                className={`rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedPlan === "plan70"
                    ? "border-[#9a7b45] bg-[#9a7b45]/5 shadow-md ring-1 ring-[#9a7b45]"
                    : "border-stone-200 bg-white hover:border-[#9a7b45]/40"
                }`}
              >
                <div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Mayor Descuento
                  </span>
                  <h3 className="mt-2 font-serif text-lg font-bold text-stone-900">
                    Plan 70% Anticipo
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">PM² $1.450 USD/m² (-$50/m²)</p>

                  <div className="mt-4 rounded-xl bg-white border border-stone-100 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                      Cuota Inicial (70%)
                    </p>
                    <p className="font-serif text-xl font-bold text-[#816127] mt-0.5">
                      {activeFinancials ? `USD ${formatGardenZenUsd(activeFinancials.unitInitial)}` : "70% a la firma"}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Saldo restante: <strong>30% contra entrega</strong>
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-[11px] text-stone-500 font-light border-t border-stone-100 pt-3">
                  Descuento directo por m² adelantando el 70% a la firma del contrato.
                </p>
              </div>

              {/* PLAN CONTADO */}
              <div
                onClick={() => setSelectedPlan("contado")}
                className={`rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedPlan === "contado"
                    ? "border-[#9a7b45] bg-[#9a7b45]/5 shadow-md ring-1 ring-[#9a7b45]"
                    : "border-stone-200 bg-white hover:border-[#9a7b45]/40"
                }`}
              >
                <div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Precio Piso Mínimo
                  </span>
                  <h3 className="mt-2 font-serif text-lg font-bold text-stone-900">
                    Pago Contado (100%)
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">PM² $1.400 USD/m² (Ahorro Máximo)</p>

                  <div className="mt-4 rounded-xl bg-white border border-stone-100 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                      Desembolso Único (100%)
                    </p>
                    <p className="font-serif text-xl font-bold text-stone-900 mt-0.5">
                      {activeFinancials ? `USD ${formatGardenZenUsd(activeFinancials.unitTotalPrice)}` : "100% Contado"}
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                      Máxima rentabilidad neta anual
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-[11px] text-stone-500 font-light border-t border-stone-100 pt-3">
                  Para inversores con liquidez inmediata que buscan capturar el precio por metro cuadrado más bajo.
                </p>
              </div>
            </div>

            {/* Cronograma de Desembolsos */}
            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
              <h4 className="font-serif text-base font-bold text-stone-900">
                Cronograma de Desembolsos · Garden Zen
              </h4>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="border-l-2 border-[#9a7b45] pl-3">
                  <p className="font-bold text-[#9a7b45] uppercase tracking-wider text-[10px]">
                    Paso 1 · Hoy
                  </p>
                  <p className="font-serif text-lg font-bold text-stone-900 mt-0.5">
                    USD {formatGardenZenUsd(GARDEN_ZEN_CONFIG.reservaUsd)}
                  </p>
                  <p className="text-stone-500 font-light mt-1">
                    Congela la unidad seleccionada y asegura el precio de preventa.
                  </p>
                </div>
                <div className="border-l-2 border-stone-300 pl-3">
                  <p className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                    Paso 2 · A la firma
                  </p>
                  <p className="font-serif text-lg font-bold text-stone-900 mt-0.5">
                    Cuota Inicial
                  </p>
                  <p className="text-stone-500 font-light mt-1">
                    Integración del 30%, 70% o 100% descontando los USD 5.000 de reserva.
                  </p>
                </div>
                <div className="border-l-2 border-stone-300 pl-3">
                  <p className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                    Paso 3 · Marzo 2027
                  </p>
                  <p className="font-serif text-lg font-bold text-stone-900 mt-0.5">
                    Saldo contra entrega
                  </p>
                  <p className="text-stone-500 font-light mt-1">
                    Liquidación final contra entrega de llaves (apto crédito bancario).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 8. DISPONIBILIDAD EN VIVO & COTIZADOR EN CASCADA (ESTILO APPLE) */}
          <section id="disponibilidad" ref={disponibilidadRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-[#9a7b45]" />
                <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                  Cotizador &amp; Disponibilidad en Vivo
                </p>
              </div>
              <button
                type="button"
                onClick={handleRefreshInventory}
                disabled={isRefreshingInv}
                className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                title="Sincronizar datos con Google Sheets"
              >
                <RefreshCw size={12} className={isRefreshingInv ? "animate-spin text-[#9a7b45]" : ""} />
                <span>{lastPriceUpdateText}</span>
              </button>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Selecciona tu unidad y simula tu inversión al instante.
            </h2>

            {/* PASO 1: AMBIENTE */}
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Paso 1: Elige la Tipología
              </p>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AMBIENTE_OPTIONS.map((amb) => {
                  const isSel = selectedAmbId === amb.id;
                  return (
                    <button
                      key={amb.id}
                      type="button"
                      onClick={() => handleSelectAmbiente(amb.id)}
                      className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                        isSel
                          ? "border-[#9a7b45] bg-[#9a7b45]/15 text-[#816127] font-semibold shadow-xs"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                      }`}
                    >
                      <p className="text-xs font-bold">{amb.name}</p>
                      <p className="text-[10px] text-stone-500 font-mono mt-0.5">{amb.areaRange}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PASO 2: PISO Y UNIDAD */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Paso 2: Elige el Piso ({currentAmbiente.name})
                </p>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Disponible
                  </span>
                  <span className="flex items-center gap-1 text-stone-400">
                    <span className="h-2 w-2 rounded-full bg-stone-300" /> Vendido / Reservado
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {floorsForAmbiente.map((item) => {
                  const isSel = selectedFloor === item.floor;
                  if (!item.isAvailable) {
                    return (
                      <div
                        key={item.floor}
                        className="rounded-xl border border-stone-200 bg-stone-100/60 px-3.5 py-2 text-center text-xs text-stone-400 cursor-not-allowed"
                        title={`Piso ${item.floor}: Unidades reservadas o vendidas`}
                      >
                        <span className="font-bold">Piso {item.floor}</span>
                        <span className="block text-[9px] uppercase tracking-wider">Agotado</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.floor}
                      type="button"
                      onClick={() => setSelectedFloor(item.floor)}
                      className={`rounded-xl border px-3.5 py-2 text-center text-xs transition-all cursor-pointer ${
                        isSel
                          ? "border-[#9a7b45] bg-stone-900 text-white shadow-md scale-105"
                          : "border-emerald-300 bg-emerald-50/70 text-emerald-950 hover:bg-emerald-100/70"
                      }`}
                    >
                      <span className="font-bold">Piso {item.floor}</span>
                      <span className="block text-[9px] font-medium opacity-90">
                        {item.availableCount} disp.
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Vista previa de la unidad seleccionada */}
              {activeUnit && (
                <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <span className="rounded-full bg-stone-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#e8d5a8]">
                        Unidad {activeUnit.unitNumber} · Piso {activeUnit.floor}
                      </span>
                      <p className="mt-1 font-serif text-lg font-bold text-stone-900">
                        {activeUnit.roomsLabel} · Modelo {activeUnit.modelo} ({activeUnit.areaM2} m²)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                        Precio Unidad ({selectedPlan === "contado" ? "Contado" : selectedPlan === "plan70" ? "70% Anticipo" : "30% Anticipo"})
                      </p>
                      <p className="font-serif text-xl font-bold text-[#816127]">
                        USD {formatGardenZenUsd(activeFinancials ? activeFinancials.unitTotalPrice : activeUnit.cashTotal)}
                      </p>
                    </div>
                  </div>

                  {/* Plano de la tipología */}
                  {activeUnit.planoUrl && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-stone-100 bg-stone-50 p-2 text-center">
                      <img
                        src={activeUnit.planoUrl}
                        alt={`Plano Modelo ${activeUnit.modelo}`}
                        className="mx-auto max-h-56 object-contain"
                      />
                      <p className="mt-1 text-[11px] text-stone-400">
                        Plano esquemático referencial · Modelo {activeUnit.modelo}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PASO 3: PARQUEO Y BAULERA (OPCIONAL ESTILO APPLE STORE) */}
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Paso 3: Añade tu Parqueo o Baulera (Opcional)
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Sin parqueo */}
                <button
                  type="button"
                  onClick={() => setSelectedParkingOption("none")}
                  className={`rounded-2xl border p-4 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedParkingOption === "none"
                      ? "border-[#9a7b45] bg-[#9a7b45]/15 ring-1 ring-[#9a7b45]"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-stone-900">Sin Parqueo</span>
                    <p className="text-[11px] text-stone-500 font-light mt-1">
                      Solo la unidad residencial.
                    </p>
                  </div>
                  <p className="font-serif text-sm font-bold text-stone-900 mt-3">
                    + USD 0
                  </p>
                </button>

                {/* Parqueo Techado */}
                <button
                  type="button"
                  onClick={() => setSelectedParkingOption("techado")}
                  className={`rounded-2xl border p-4 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedParkingOption === "techado"
                      ? "border-[#9a7b45] bg-[#9a7b45]/15 ring-1 ring-[#9a7b45]"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-stone-900">
                      <Car size={15} className="text-[#9a7b45]" />
                      <span className="text-xs font-bold">Parqueo Techado</span>
                    </div>
                    <p className="text-[11px] text-stone-500 font-light mt-1">
                      12,5 m² en Subsuelo / Piso 1.
                    </p>
                  </div>
                  <p className="font-serif text-sm font-bold text-[#816127] mt-3">
                    + USD 12.000
                  </p>
                </button>

                {/* Combo Parqueo + Baulera */}
                <button
                  type="button"
                  onClick={() => setSelectedParkingOption("combo")}
                  className={`rounded-2xl border p-4 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedParkingOption === "combo"
                      ? "border-[#9a7b45] bg-[#9a7b45]/15 ring-1 ring-[#9a7b45]"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-stone-900">
                      <ShieldCheck size={15} className="text-[#9a7b45]" />
                      <span className="text-xs font-bold">Parqueo + Baulera</span>
                    </div>
                    <p className="text-[11px] text-stone-500 font-light mt-1">
                      Parqueo techado + baulera privada.
                    </p>
                  </div>
                  <p className="font-serif text-sm font-bold text-[#816127] mt-3">
                    + USD 15.000
                  </p>
                </button>

                {/* Parqueo de Moto */}
                <button
                  type="button"
                  onClick={() => setSelectedParkingOption("moto")}
                  className={`rounded-2xl border p-4 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedParkingOption === "moto"
                      ? "border-[#9a7b45] bg-[#9a7b45]/15 ring-1 ring-[#9a7b45]"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-stone-900">Parqueo Moto</span>
                    <p className="text-[11px] text-stone-500 font-light mt-1">
                      3,75 m² techado en Subsuelo.
                    </p>
                  </div>
                  <p className="font-serif text-sm font-bold text-[#816127] mt-3">
                    + USD 7.500
                  </p>
                </button>
              </div>
            </div>

            {/* PASO 4: PLAN FINANCIERO & DESGLOSE UNIFICADO */}
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Paso 4: Modalidad de Pago
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan("contado")}
                  className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    selectedPlan === "contado"
                      ? "border-[#9a7b45] bg-stone-900 text-white shadow-sm"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                  }`}
                >
                  <p className="text-xs font-bold">Pago Contado (100%)</p>
                  <p className="text-[10px] opacity-80 mt-0.5">PM² $1.400 · Máximo Descuento</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlan("plan70")}
                  className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    selectedPlan === "plan70"
                      ? "border-[#9a7b45] bg-stone-900 text-white shadow-sm"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                  }`}
                >
                  <p className="text-xs font-bold">Plan 70% Anticipo</p>
                  <p className="text-[10px] opacity-80 mt-0.5">PM² $1.450 · 30% contra entrega</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlan("plan30")}
                  className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    selectedPlan === "plan30"
                      ? "border-[#9a7b45] bg-stone-900 text-white shadow-sm"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                  }`}
                >
                  <p className="text-xs font-bold">Plan 30% Anticipo</p>
                  <p className="text-[10px] opacity-80 mt-0.5">PM² $1.500 · 70% contra entrega</p>
                </button>
              </div>

              {/* Tarjeta de Resumen Financiero Total */}
              {activeFinancials && activeUnit && (
                <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-stone-100 pb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                        Inversión Total
                      </p>
                      <p className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
                        USD {formatGardenZenUsd(activeFinancials.totalPrice)}
                      </p>
                      <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                        USD {formatGardenZenUsd(activeFinancials.pricePerM2)} / m²
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                        Cuota Inicial ({selectedPlan === "contado" ? "100%" : selectedPlan === "plan70" ? "70%" : "30%"})
                      </p>
                      <p className="font-serif text-xl sm:text-2xl font-bold text-[#816127] mt-0.5">
                        USD {formatGardenZenUsd(activeFinancials.initialPayment)}
                      </p>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        A la firma del contrato
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                        Saldo contra Entrega
                      </p>
                      <p className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
                        USD {formatGardenZenUsd(activeFinancials.balancePayment)}
                      </p>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        En {GARDEN_ZEN_CONFIG.delivery}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">
                        Plusvalía Proyectada
                      </p>
                      <p className="font-serif text-xl sm:text-2xl font-bold text-emerald-600 mt-0.5">
                        +USD {formatGardenZenUsd(activeFinancials.capitalGain)}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                        +{activeFinancials.gainPercentage}% en dólares
                      </p>
                    </div>
                  </div>

                  {/* PASO 5: BOTÓN DE RESERVA WHATSAPP */}
                  <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-stone-500 font-light">
                      Reserva formal con <strong>USD {formatGardenZenUsd(GARDEN_ZEN_CONFIG.reservaUsd)}</strong> para congelar la unidad {activeUnit.unitNumber} en Piso {activeUnit.floor}.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        const planLabel =
                          selectedPlan === "contado"
                            ? "Pago Contado (100%)"
                            : selectedPlan === "plan70"
                            ? "Plan 70% Anticipo"
                            : "Plan 30% Anticipo";
                        const parkingText =
                          selectedParkingOption === "none"
                            ? "Sin parqueo"
                            : selectedParkingOption === "techado"
                            ? "Parqueo Techado (+USD 12.000)"
                            : selectedParkingOption === "combo"
                            ? "Parqueo + Baulera (+USD 15.000)"
                            : "Parqueo Moto (+USD 7.500)";

                        const msg = `Hola, vengo directo de N.I.A para reservar en Garden Zen: Unidad ${activeUnit.unitNumber} en Piso ${activeUnit.floor} (${activeUnit.roomsLabel} - ${activeUnit.areaM2} m²), ${parkingText}, Inversión Total USD ${formatGardenZenUsd(activeFinancials.totalPrice)}, Modalidad ${planLabel}. Cuento con los USD ${formatGardenZenUsd(GARDEN_ZEN_CONFIG.reservaUsd)} para congelar la unidad hoy.`;
                        reserve(msg, activeFinancials.totalPrice);
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-xl transition-all hover:bg-black hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <MessageCircle size={16} className="text-[#e8d5a8]" />
                      <span>Reservar Unidad {activeUnit.unitNumber} vía WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 9. CIERRE / CONDICIONES & DESCARGAS */}
          <section id="cierre" ref={closeRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="rounded-3xl border border-stone-200 bg-gradient-to-br from-stone-900 to-black p-6 sm:p-8 text-white shadow-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#e8d5a8]">
                  Garantía &amp; Respaldo · {GARDEN_ZEN_CONFIG.builder}
                </span>
                <span className="text-xs text-emerald-400 font-medium">
                  Entrega {GARDEN_ZEN_CONFIG.delivery}
                </span>
              </div>

              <h3 className="mt-3 font-serif text-2xl sm:text-3xl text-white">
                Asegura tu departamento en el proyecto eco-sostenible más rentable de Equipetrol Norte.
              </h3>

              <p className="mt-3 text-xs sm:text-sm text-stone-300 font-light leading-relaxed [text-align:justify]">
                Las unidades se asignan por orden de reserva formal de USD {formatGardenZenUsd(GARDEN_ZEN_CONFIG.reservaUsd)}. Al reservar, aseguras el precio preferencial de obra fina y congelas la orientación seleccionada antes del siguiente ajuste tarifario.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const msg = `Hola, quiero coordinar una visita y conocer más detalles de preventa en Garden Zen con el equipo de N.I.A.`;
                    reserve(msg);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-stone-900 shadow-md transition-all hover:bg-[#e8d5a8] cursor-pointer"
                >
                  <MessageCircle size={15} />
                  Coordinar Visita de Obra
                </button>

                <a
                  href={GARDEN_ZEN_CONFIG.brochurePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur transition-all hover:bg-white/20 cursor-pointer"
                >
                  <Download size={14} className="text-[#e8d5a8]" />
                  Brochure Completo (PDF)
                </a>
              </div>

              <p className="mt-8 text-[11px] leading-relaxed text-stone-400">
                Desarrolla {GARDEN_ZEN_CONFIG.builder} · {GARDEN_ZEN_CONFIG.address} · Entrega programada {GARDEN_ZEN_CONFIG.delivery}. Las imágenes y renders son de carácter arquitectónico referencial.
              </p>
            </div>
          </section>

        </div>
      </div>

      {/* BARRA INFERIOR FLOTANTE DE CONVERSIÓN RÁPIDA (se oculta al llegar al cierre) */}
      <AnimatePresence>
        {activeLabel !== "Reserva USD 5.000" && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-3 border-t border-stone-200 bg-[#f7f5f0]/95 px-5 py-3 backdrop-blur-md md:left-[44%]"
          >
            <div>
              <p className="text-xs text-stone-600">
                Reserva con{" "}
                <span className="font-semibold text-stone-900">
                  USD {formatGardenZenUsd(GARDEN_ZEN_CONFIG.reservaUsd)}
                </span>
              </p>
              <p className="text-[10px] text-[#9a7b45] font-medium hidden sm:block">
                Congela el precio de preventa hoy · Saldo contra entrega
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 border border-stone-300 bg-white px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-800 shadow-sm transition-all hover:bg-stone-100 active:scale-95 cursor-pointer"
                title="Compartir Garden Zen"
              >
                {shareFeedback ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-700">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} />
                    <span className="hidden sm:inline">Compartir</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BURBUJA FLOTANTE DE NAVEGACIÓN RÁPIDA DE SECCIONES */}
      <AnimatePresence>
        {showFloatingNav && (
          <div className="fixed bottom-20 right-4 sm:right-6 md:right-8 z-[125] flex flex-col items-end">
            <AnimatePresence>
              {floatingNavOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setFloatingNavOpen(false)}
                    className="fixed inset-0 z-[126] bg-black/25 backdrop-blur-[2px]"
                  />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 14 }}
                    transition={{ type: "spring", stiffness: 420, damping: 28 }}
                    className="relative z-[127] mb-3 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-stone-200/90 bg-white/95 p-2.5 shadow-2xl backdrop-blur-xl text-stone-900"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 px-2.5 pb-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#9a7b45] animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                          Secciones Garden Zen
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFloatingNavOpen(false)}
                        className="rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer"
                        title="Cerrar menú"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <div className="mt-1 space-y-0.5 max-h-[60vh] overflow-y-auto py-1">
                      {SECTIONS_NAV.map((sec) => {
                        const IconComponent = sec.icon;
                        const isActive =
                          activeSectionId === sec.id ||
                          (sec.id === "disponibilidad" && activeSectionId === "cierre");
                        return (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => scrollToSection(sec.id)}
                            className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs transition-all cursor-pointer ${
                              isActive
                                ? "bg-[#9a7b45]/15 text-[#816127] font-semibold shadow-xs"
                                : "text-stone-700 hover:bg-stone-100/90 hover:text-stone-950 font-normal"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                  isActive
                                    ? "bg-[#9a7b45] text-white"
                                    : "bg-stone-100 text-stone-500"
                                }`}
                              >
                                <IconComponent size={14} />
                              </div>
                              <div className="min-w-0 truncate">
                                <p className="truncate text-xs leading-tight">{sec.label}</p>
                                <p className="text-[10px] text-stone-400 font-light truncate">
                                  {sec.hint}
                                </p>
                              </div>
                            </div>
                            {isActive && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a7b45]" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setFloatingNavOpen((prev) => !prev)}
              className="relative z-[128] flex items-center gap-2 rounded-full border border-stone-800/80 bg-stone-900/95 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-2xl backdrop-blur-md transition-all hover:bg-black hover:shadow-black/25 cursor-pointer"
              aria-label="Menú de secciones"
              title="Navegar secciones del proyecto"
            >
              {floatingNavOpen ? (
                <>
                  <X size={15} className="text-[#e8d5a8]" />
                  <span>Cerrar</span>
                </>
              ) : (
                <>
                  <Menu size={15} className="text-[#e8d5a8]" />
                  <span>Secciones</span>
                </>
              )}
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL / DRAWER PRIVADO: INSIGHTS DE ASESOR & ARGUMENTARIO COMERCIAL */}
      <AnimatePresence>
        {showAdvisorInsights && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
            onClick={() => setShowAdvisorInsights(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 text-stone-900 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-stone-900 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#e8d5a8]">
                      Privado Asesor · NIA Insights
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Argumentario de Ventas
                    </span>
                  </div>
                  <h3 className="mt-2 font-serif text-2xl text-stone-900">
                    Insights Comerciales · Garden Zen
                  </h3>
                  <p className="text-xs text-stone-500 font-light mt-0.5">
                    Guía de argumentos clave, manejo de objeciones y retornos para ofrecer con solidez.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdvisorInsights(false)}
                  className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer"
                  title="Cerrar insights"
                >
                  <X size={20} />
                </button>
              </div>

              {/* BLOQUE 1: VENTAJAS COMERCIALES */}
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 size={16} />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Ventajas Comerciales Clave (Qué destacar)
                    </h4>
                  </div>
                  <ul className="mt-2.5 space-y-2 text-xs text-stone-700 font-light">
                    <li>
                      • <strong>50% menos expensas de por vida:</strong> En Equipetrol las expensas suben año tras año. Garden Zen genera su propia energía para ascensores, bombas y áreas comunes, convirtiéndose en el edificio más rentable para un inversor.
                    </li>
                    <li>
                      • <strong>8% más rentable en Airbnb (Estudio Bentall Kennedy):</strong> Los departamentos con certificación eco-sostenible y diseño Japandi logran mayor tasa de ocupación y tarifas superiores por noche.
                    </li>
                    <li>
                      • <strong>Ubicación cota alta protegida:</strong> Situado en Barrio Brígida / Equipetrol Norte con drenaje pluvial superior sin riesgo de anegamiento en días de lluvia intensa.
                    </li>
                    <li>
                      • <strong>Entrega en Marzo 2027 (Obra Fina):</strong> No es pozo cero. La estructura está levantada y en fase de acabados, reduciendo drásticamente el riesgo constructivo.
                    </li>
                    <li>
                      • <strong>100% Equipado llave en mano:</strong> Cuarzo blanco, piedra sinterizada, aire acondicionado, box de vidrio, extractor, calefón y cerradura inteligente sin costos adicionales.
                    </li>
                  </ul>
                </div>

                {/* BLOQUE 2: MANEJO DE OBJECIONES */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertCircle size={16} />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Desventajas Transparentes &amp; Manejo de Objeciones
                    </h4>
                  </div>
                  <div className="mt-2.5 space-y-3 text-xs">
                    <div>
                      <p className="font-semibold text-stone-900">
                        • Objeción: &quot;La reserva es de USD 5.000 (más alta que en otros proyectos)&quot;
                      </p>
                      <p className="text-stone-600 font-light mt-0.5 [text-align:justify]">
                        <strong>Respuesta:</strong> Es porque el proyecto ya está en obra fina (entrega Marzo 2027). Los USD 5.000 se descuentan 100% de la cuota inicial a la firma y garantizan el bloqueo de la unidad en la lista preferencial antes de la actualización de precios de entrega.
                      </p>
                    </div>

                    <div className="border-t border-amber-200/60 pt-2.5">
                      <p className="font-semibold text-stone-900">
                        • Objeción: &quot;¿Cómo se paga el saldo del 70% o 30%?&quot;
                      </p>
                      <p className="text-stone-600 font-light mt-0.5 [text-align:justify]">
                        <strong>Respuesta:</strong> Es la mayor ventaja: el saldo se liquida 100% contra entrega de llaves en Marzo 2027. No hay cuotas mensuales forzadas durante la obra fina, permitiendo usar crédito hipotecario bancario o mantener los fondos rindiendo en el banco.
                      </p>
                    </div>
                  </div>
                </div>

                {/* BLOQUE 3: PLUSVALÍA PROYECTADA ($1.800 USD/m²) */}
                <div className="rounded-2xl border border-stone-200 bg-[#fbf9f4] p-4 text-xs">
                  <p className="font-bold uppercase tracking-wider text-[#816127]">
                    Proyección de Ganancia Bruta a la Entrega ($1.800 USD/m² Equipetrol Norte)
                  </p>
                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-4 gap-2 text-stone-700">
                    <div className="rounded-xl border border-stone-200/80 bg-white p-2 text-center">
                      <p className="text-[10px] text-stone-500 uppercase">Mono (40,5 m²)</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">Entrada: $56.672</p>
                      <p className="font-serif text-sm font-bold text-stone-900 mt-1">+USD 16.228</p>
                    </div>
                    <div className="rounded-xl border border-stone-200/80 bg-white p-2 text-center">
                      <p className="text-[10px] text-stone-500 uppercase">1 Dorm (46,1 m²)</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">Entrada: $64.540</p>
                      <p className="font-serif text-sm font-bold text-stone-900 mt-1">+USD 18.440</p>
                    </div>
                    <div className="rounded-xl border border-stone-200/80 bg-white p-2 text-center">
                      <p className="text-[10px] text-stone-500 uppercase">2 Dorms (83,3 m²)</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">Entrada: $115.388</p>
                      <p className="font-serif text-sm font-bold text-stone-900 mt-1">+USD 34.552</p>
                    </div>
                    <div className="rounded-xl border border-stone-200/80 bg-white p-2 text-center">
                      <p className="text-[10px] text-stone-500 uppercase">3 Dorms (106 m²)</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">Entrada: $148.568</p>
                      <p className="font-serif text-sm font-bold text-stone-900 mt-1">+USD 42.232</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAdvisorInsights(false)}
                  className="rounded-full bg-stone-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-black transition-all cursor-pointer"
                >
                  Entendido, volver a la landing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
