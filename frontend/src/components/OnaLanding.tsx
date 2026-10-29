import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calculator,
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
  ONA_ADDRESS,
  ONA_BUILDER,
  ONA_DELIVERY,
  ONA_PARKINGS,
  ONA_PARKINGS_PDF_URL,
  ONA_RESERVE_USD,
  ONA_SHEETS_CSV_URL,
  ONA_UNITS,
  ONA_ZONE,
  OnaParking,
  OnaUnit,
  fetchOnaLiveUnits,
  formatOnaUsd,
  parseOnaCsvText,
} from "../onaInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

const AMENITY_SLIDES = [
  {
    src: "/ona/piscina.jpg",
    category: "Piscina",
    title: "Piscina",
    description:
      "Piscina amplia con ingreso suave y palmeras en el entorno. Un espacio relajante para refrescarte y disfrutar los días de sol con total comodidad dentro de tu propio edificio.",
  },
  {
    src: "/ona/hidromasaje.jpg",
    category: "Hidromasaje",
    title: "Hidromasaje en Piscina",
    description:
      "Sector de hidromasaje integrado dentro de la piscina principal. El rincón pensado para desconectar de la rutina y relajarte al aire libre al terminar la jornada.",
  },
  {
    src: "/ona/reposeras.jpg",
    category: "Exteriores",
    title: "Deck con Reposeras",
    description:
      "Área de descanso al aire libre junto a la piscina con deck y reposeras, ideal para tomar sol, leer o compartir una tarde tranquila.",
  },
  {
    src: "/ona/sauna.jpg",
    category: "Sauna",
    title: "Sauna Seco",
    description:
      "Sauna seco completamente equipado con revestimiento en madera natural. Diseñado para relajarte, descontracturar el cuerpo y renovar energías sin salir de casa.",
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
    category: "Churrasqueras",
    title: "Churrasqueras Equipadas",
    description:
      "Dos churrasqueras en el área social con mesón de apoyo y espacio para mesas, preparadas para ser el punto de encuentro en almuerzos y asados familiares de fin de semana.",
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
      "Ambiente polivalente climatizado y equipado para trabajar concentrado, coordinar reuniones de negocios o festejar ocasiones especiales con comodidad.",
  },
  {
    src: "/ona/lobby.jpg",
    category: "Acceso",
    title: "Lobby de Doble Altura con Seguridad",
    description:
      "Recepción amoblada e iluminada con control de acceso y seguridad permanente para brindarte tranquilidad a ti y una bienvenida de primer nivel a tus visitas.",
  },
];

const TYPOLOGIES_DATA = [
  {
    id: "32",
    title: "1 Dormitorio Master",
    area: "32,30 m²",
    image: "/ona/tipo-32.jpg",
    cashPrice: 40375,
    tagline:
      "Excelente distribución para vivienda práctica o inversión de alta demanda de alquiler en Santa Cruz.",
    reservedCopy: "Más de 8 unidades de esta tipología ya reservadas",
    highlights: [
      "Living-comedor integrado con excelente entrada de luz",
      "Cocina de diseño con cajonería y mesón de granito",
      "Dormitorio independiente con ropero empotrado a medida",
      "Baño completo con box de vidrio y grifería monocomando",
    ],
  },
  {
    id: "54",
    title: "2 Dormitorios Confort",
    area: "54,14 m²",
    image: "/ona/tipo-54.jpg",
    cashPrice: 67675,
    tagline:
      "Espacios versátiles para familias jóvenes, parejas o profesionales que requieren un ambiente extra de trabajo.",
    reservedCopy: "Gran demanda: unidades en pisos intermedios ya asignadas",
    highlights: [
      "2 habitaciones independientes con amplios closets empotrados",
      "Living social amplio con circulación optimizada",
      "Cocina americana moderna con barra desayunadora",
      "Ideal para familias jóvenes o alquiler ejecutivo corporativo",
    ],
  },
  {
    id: "92",
    title: "2 Dormitorios con Balcón Suite",
    area: "92,00 m²",
    image: "/ona/tipo-92.jpg",
    cashPrice: 115000,
    tagline:
      "La tipología más amplia de ONA Residences, con balcón terraza y habitaciones diseñadas en suite.",
    reservedCopy: "Unidades exclusivas con reservas activas de 1.ª fase",
    highlights: [
      "86,5 m² propios interiores + 5,55 m² de terraza balcón panorámica",
      "Vista frontal privilegiada hacia Av. Los Cusis",
      "Dormitorios máster en suite con vestidor privado",
      "El estándar residencial más exclusivo de ONA Residences",
    ],
  },
];

const EQUIPAMIENTO_SLIDES = [
  {
    id: "cocina",
    room: "COCINA",
    title: "Cocina Equipada",
    tagline: "Mobiliario a medida y equipamiento funcional",
    image: "/ona/cocina.jpg",
    items: [
      "Muebles superiores e inferiores a medida",
      "Mesón de granito de alta resistencia",
      "Bacha de acero inoxidable y grifería monomando",
      "Cocina empotrada con campana extractora",
      "Horno microondas empotrado",
    ],
  },
  {
    id: "dormitorio",
    room: "DORMITORIO",
    title: "Dormitorio Principal",
    tagline: "Confort térmico y almacenamiento optimizado",
    image: "/ona/dormitorio.jpg",
    items: [
      "Aire acondicionado instalado y listo para usar",
      "Ropero empotrado con divisiones internas completas",
      "Piso de porcelanato de alto tráfico",
      "Iluminación funcional cálida integrada",
    ],
  },
  {
    id: "bano",
    room: "BAÑO",
    title: "Baño Contemporáneo",
    tagline: "Grifería alta, box de vidrio y espejo LED",
    image: "/ona/bano.jpg",
    items: [
      "Ducha con box de vidrio templado instalado",
      "Espejo con iluminación LED perimetral",
      "Mueble de baño flotante con mesón de granito",
      "Grifería alta y accesorios sanitarios de calidad",
      "Piso y revestimiento de paredes en porcelanato",
    ],
  },
  {
    id: "sala-acceso",
    room: "SALA & SERVICIOS",
    title: "Acceso Seguro & Conectividad",
    tagline: "Seguridad digital y servicios listos",
    image: "/ona/living.jpg",
    items: [
      "Puerta principal con cerradura inteligente digital",
      "Herrajes y accesorios de alta seguridad",
      "Calefón instalado para agua caliente continua",
      "Lavadero con grifería e instalaciones para lavadora",
      "Iluminación funcional instalada en todos los ambientes",
    ],
  },
];

interface AmbienteOption {
  id: string;
  name: string;
  shortName: string;
  rooms: number;
  areaM2: number;
  balconyM2: number | null;
  view: string;
  basePrice: number;
  rentMin: number;
  rentMax: number;
  yieldRange: string;
  matchUnit: (u: OnaUnit) => boolean;
}

const AMBIENTE_OPTIONS: AmbienteOption[] = [
  {
    id: "1D-32",
    name: "1 Dormitorio Master",
    shortName: "1 Dorm · 32,3 m²",
    rooms: 1,
    areaM2: 32.3,
    balconyM2: null,
    view: "Vista Lateral (Este / Oeste)",
    basePrice: 40375,
    rentMin: 350,
    rentMax: 375,
    yieldRange: "10,4% – 11,1%",
    matchUnit: (u) => u.rooms === 1 && (u.tipo === "3" || u.tipo === "4"),
  },
  {
    id: "2D-54",
    name: "2 Dormitorios Confort",
    shortName: "2 Dorms · 54,1 m²",
    rooms: 2,
    areaM2: 54.14,
    balconyM2: null,
    view: "Vista Lateral (Tipo 1)",
    basePrice: 67675,
    rentMin: 520,
    rentMax: 560,
    yieldRange: "9,2% – 9,9%",
    matchUnit: (u) => u.rooms === 2 && u.tipo === "1",
  },
  {
    id: "2D-92-cusis",
    name: "2 Dorms Suite Frontal",
    shortName: "2 Dorms Suite · 92 m² (Frontal)",
    rooms: 2,
    areaM2: 92.0,
    balconyM2: 5.55,
    view: "Vista Av. Los Cusis (Tipo 2)",
    basePrice: 115000,
    rentMin: 750,
    rentMax: 830,
    yieldRange: "7,8% – 8,7%",
    matchUnit: (u) => u.rooms === 2 && u.tipo === "2",
  },
  {
    id: "2D-92-post",
    name: "2 Dorms Suite Posterior",
    shortName: "2 Dorms Suite · 92 m² (Posterior)",
    rooms: 2,
    areaM2: 92.05,
    balconyM2: 5.55,
    view: "Vista Posterior (Tipo 5)",
    basePrice: 114142,
    rentMin: 750,
    rentMax: 830,
    yieldRange: "7,8% – 8,7%",
    matchUnit: (u) => u.rooms === 2 && u.tipo === "5",
  },
];

export default function OnaLanding({ property, onClose }: Props) {
  const [activeImage, setActiveImage] = useState("/ona/fachada-dia.jpg");
  const [activeLabel, setActiveLabel] = useState("Fachada");
  const [amenityIndex, setAmenityIndex] = useState(0);

  // Estados del Flujo Paso a Paso (Ambiente -> Piso disponible -> Precio & Ganancia):
  const [selectedAmbId, setSelectedAmbId] = useState<string>("1D-32");
  const [selectedFloor, setSelectedFloor] = useState<number>(2);
  const [selectedPlan, setSelectedPlan] = useState<"contado" | "plan60" | "plan40">("contado");

  const [showAdvisorInsights, setShowAdvisorInsights] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [units, setUnits] = useState<OnaUnit[]>(ONA_UNITS);
  const [isRefreshingInv, setIsRefreshingInv] = useState(false);
  const [lastPriceUpdateText, setLastPriceUpdateText] = useState<string>("Sincronizado");

  useEffect(() => {
    fetchOnaLiveUnits().then((res) => {
      if (res.units && res.units.length > 0) {
        setUnits(res.units);
        setLastPriceUpdateText("Sincronizado en vivo");
      }
    });
  }, []);

  const handleRefreshInventory = async () => {
    setIsRefreshingInv(true);
    try {
      const res = await fetch(ONA_SHEETS_CSV_URL + "&_t=" + Date.now());
      if (res.ok) {
        const text = await res.text();
        const parsed = parseOnaCsvText(text);
        if (parsed.length > 0) {
          setUnits(parsed);
          const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setLastPriceUpdateText(`Actualizado ${timeStr}`);
          try {
            window.localStorage.setItem("ona.live_inventory_cache.v1", JSON.stringify({ time: Date.now(), units: parsed }));
          } catch {}
        }
      }
    } catch (err) {
      console.warn("Error refreshing ONA inventory:", err);
    } finally {
      setIsRefreshingInv(false);
    }
  };

  const availableUnits = useMemo(() => units.filter((u) => u.status === "disponible"), [units]);

  const minCashPerM2 = useMemo(() => {
    if (availableUnits.length === 0) return 1250;
    return Math.min(...availableUnits.map((u) => u.cashPerM2));
  }, [availableUnits]);

  const minPlan60PerM2 = useMemo(() => {
    if (availableUnits.length === 0) return 1300;
    return Math.min(...availableUnits.map((u) => u.plan60.perM2));
  }, [availableUnits]);

  const minPlan40PerM2 = useMemo(() => {
    if (availableUnits.length === 0) return 1350;
    return Math.min(...availableUnits.map((u) => u.plan40.perM2));
  }, [availableUnits]);

  const minUnitCashPrice = useMemo(() => {
    if (availableUnits.length === 0) return 40375;
    return Math.min(...availableUnits.map((u) => u.cash));
  }, [availableUnits]);

  // Precios mínimos en vivo por tipología (1 Dorm y 2 Dorms) según disponibilidad
  const minPrice1Dorm = useMemo(() => {
    const avail1D = availableUnits.filter((u) => u.rooms === 1);
    if (avail1D.length === 0) return 40375;
    return Math.min(...avail1D.map((u) => u.cash));
  }, [availableUnits]);

  const minPrice2Dorms = useMemo(() => {
    const avail2D = availableUnits.filter((u) => u.rooms === 2);
    if (avail2D.length === 0) return 67675;
    return Math.min(...avail2D.map((u) => u.cash));
  }, [availableUnits]);

  const totalUnitsCount = units.length;
  const availableUnitsCount = availableUnits.length;
  const soldUnitsCount = units.filter((u) => u.status === "vendido").length;

  // Selector de Parqueos Opcional (Estilo Apple Store: Sin parqueo / Simple 15k / Doble 22k)
  const [selectedParkingOption, setSelectedParkingOption] = useState<"none" | "simple" | "doble">("none");
  const [selectedParkingCode, setSelectedParkingCode] = useState<string>("5");

  const selectedParkingKind = selectedParkingOption === "doble" ? "doble" : "simple";

  const availableParkingsForKind = useMemo(() => {
    if (selectedParkingOption === "none") return [];
    return ONA_PARKINGS.filter((p) => p.kind === selectedParkingKind && p.status === "disponible");
  }, [selectedParkingOption, selectedParkingKind]);

  const soldParkingsCountForKind = useMemo(() => {
    if (selectedParkingOption === "none") return 0;
    return ONA_PARKINGS.filter((p) => p.kind === selectedParkingKind && p.status === "vendido").length;
  }, [selectedParkingOption, selectedParkingKind]);

  useEffect(() => {
    if (selectedParkingOption === "none") return;
    if (!availableParkingsForKind.some((p) => p.code === selectedParkingCode)) {
      if (availableParkingsForKind.length > 0) {
        setSelectedParkingCode(availableParkingsForKind[0].code);
      }
    }
  }, [selectedParkingOption, availableParkingsForKind, selectedParkingCode]);

  const activeParking = useMemo(() => {
    if (selectedParkingOption === "none") return null;
    return ONA_PARKINGS.find((p) => p.code === selectedParkingCode) || availableParkingsForKind[0] || null;
  }, [selectedParkingOption, selectedParkingCode, availableParkingsForKind]);

  const parkingPrice = useMemo(() => {
    if (selectedParkingOption === "none") return 0;
    return selectedParkingOption === "simple" ? 15000 : 22000;
  }, [selectedParkingOption]);

  // Tipologías con precios mínimos y USD/m² actualizados en vivo según unidades disponibles
  const liveAmbienteOptions = useMemo(() => {
    return AMBIENTE_OPTIONS.map((amb) => {
      const matching = units.filter((u) => amb.matchUnit(u));
      const avail = matching.filter((u) => u.status === "disponible");
      const sold = matching.filter((u) => u.status === "vendido");
      const availCount = avail.length;
      const soldCount = sold.length;
      const minCash = availCount > 0 ? Math.min(...avail.map((u) => u.cash)) : amb.basePrice;
      const minPerM2 = availCount > 0 ? Math.min(...avail.map((u) => u.cashPerM2)) : 1250;
      return {
        ...amb,
        availCount,
        soldCount,
        matchingUnits: matching,
        minCash,
        minPerM2,
      };
    });
  }, [units]);

  const currentAmbiente = useMemo(() => {
    return AMBIENTE_OPTIONS.find((a) => a.id === selectedAmbId) || AMBIENTE_OPTIONS[0];
  }, [selectedAmbId]);

  // Pisos existentes para este ambiente ordenados de menor a mayor
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

  // Si el piso seleccionado actual no está disponible para este ambiente, auto-seleccionar el primer piso disponible
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

  // Unidad activa para el piso seleccionado
  const activeUnit = useMemo(() => {
    const floorItem = floorsForAmbiente.find((f) => f.floor === selectedFloor);
    return floorItem?.unit || null;
  }, [floorsForAmbiente, selectedFloor]);

  // Cálculos financieros para la unidad activa (con desglose transparente de cuota inicial y saldo)
  const activeFinancials = useMemo(() => {
    if (!activeUnit) return null;

    let unitTotalPrice = activeUnit.cash;
    let unitInitial = activeUnit.cash;
    let unitBalance = 0;
    let pricePerM2 = activeUnit.cashPerM2;

    if (selectedPlan === "plan60") {
      unitTotalPrice = activeUnit.plan60.total;
      unitInitial = activeUnit.plan60.initial;
      unitBalance = activeUnit.plan60.total - activeUnit.plan60.initial;
      pricePerM2 = activeUnit.plan60.perM2;
    } else if (selectedPlan === "plan40") {
      unitTotalPrice = activeUnit.plan40.total;
      unitInitial = activeUnit.plan40.initial;
      unitBalance = activeUnit.plan40.total - activeUnit.plan40.initial;
      pricePerM2 = activeUnit.plan40.perM2;
    }

    const hasParking = selectedParkingOption !== "none";
    const parkingInitial = !hasParking
      ? 0
      : selectedPlan === "contado"
      ? parkingPrice
      : selectedPlan === "plan60"
      ? Math.round(parkingPrice * 0.6)
      : Math.round(parkingPrice * 0.4);
    const parkingBalance = !hasParking ? 0 : parkingPrice - parkingInitial;

    const totalPrice = unitTotalPrice + (hasParking ? parkingPrice : 0);
    const initialPayment = unitInitial + parkingInitial;
    const balancePayment = unitBalance + parkingBalance;

    const marketValueAtDelivery = Math.round(activeUnit.totalM2 * 1600);
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
      rentMonthlyBsMin: currentAmbiente.rentMin * 12,
      rentMonthlyBsMax: currentAmbiente.rentMax * 12,
      yieldRange: currentAmbiente.yieldRange,
    };
  }, [activeUnit, selectedPlan, currentAmbiente, selectedParkingOption, parkingPrice]);

  const handleShareOna = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/?proyecto=ona`;
    const shareTitle = "ONA Residences · Preventa en Los Cusis";
    const shareText = `Departamentos de 1 y 2 dormitorios en Los Cusis desde USD ${formatOnaUsd(minUnitCashPrice)}. Conoce ONA Residences:`;

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

  const handleGoHome = () => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("proyecto");
      url.searchParams.delete("project");
      url.searchParams.delete("p");
      const cleanSearch = url.searchParams.toString();
      const cleanUrl = url.pathname + (cleanSearch ? `?${cleanSearch}` : "") + url.hash;
      window.history.replaceState(null, "", cleanUrl || "/");
    }

    if (onClose) {
      onClose();
    } else if (typeof window !== "undefined") {
      window.location.href = "/";
    }

    if (typeof window !== "undefined") {
      setTimeout(() => {
        const searchInput = document.querySelector<HTMLInputElement>(
          ".nia-mobile-search-form input, input[placeholder*='buscar'], input[placeholder*='Encuentra']"
        );
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  };

  const introRef = useRef<HTMLElement>(null);
  const placeRef = useRef<HTMLElement>(null);
  const amenitiesRef = useRef<HTMLElement>(null);
  const typesRef = useRef<HTMLElement>(null);
  const equipRef = useRef<HTMLElement>(null);
  const equipCarouselRef = useRef<HTMLDivElement>(null);
  const payRef = useRef<HTMLElement>(null);
  const builderRef = useRef<HTMLElement>(null);
  const disponibilidadRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLElement>(null);

  const scrollEquip = (direction: "left" | "right") => {
    if (!equipCarouselRef.current) return;
    const offset = direction === "left" ? -330 : 330;
    equipCarouselRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  useEffect(() => {
    const scenes: Record<string, { src: string; label: string }> = {
      intro: { src: "/ona/fachada-dia.jpg", label: "Fachada" },
      lugar: { src: "/ona/ubicacion.jpg", label: "Ubicación" },
      amenidades: { src: "/ona/piscina.jpg", label: "Amenidades" },
      tipologias: { src: "/ona/dormitorio.jpg", label: "Tipologías" },
      equipamiento: { src: "/ona/cocina.jpg", label: "Equipamiento" },
      constructora: { src: "/ona/fachada-atardecer.jpg", label: "Constructora" },
      pago: { src: "/ona/fachada-atardecer.jpg", label: "Formas de Pago" },
      disponibilidad: { src: "/ona/living.jpg", label: "Disponibilidad" },
      cierre: { src: "/ona/fachada-dia.jpg", label: "Reserva 1.ª Fase" },
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

    [introRef, placeRef, amenitiesRef, typesRef, equipRef, builderRef, payRef, disponibilidadRef, closeRef].forEach((ref) => {
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
      propertyRef: property.id,
      operacion: "Preventa",
      zona: property.zone || ONA_ZONE,
      presupuesto: budget ? `USD ${formatOnaUsd(budget)}` : `desde USD 40.375`,
    }).catch(() => {});

    // Meta Pixel: disparar evento Lead antes de abrir WhatsApp
    if (typeof window !== "undefined") {
      try {
        if (typeof (window as any).trackOnaLead === "function") {
          (window as any).trackOnaLead();
        } else if (typeof (window as any).fbq === "function") {
          (window as any).fbq("track", "Lead", { content_name: "Ona Residences" });
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
      className="fixed inset-0 z-[100] flex flex-col bg-[#f7f5f0] font-sans text-stone-900 overflow-y-auto overscroll-y-contain md:overflow-hidden md:flex-row"
    >
      {/* Botones Flotantes: Insights Asesor, Brochure, Compartir y Cerrar */}
      <div className="fixed right-4 top-4 z-[120] flex items-center gap-2 md:right-7 md:top-7">
        <button
          onClick={() => setShowAdvisorInsights(true)}
          className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/95 px-3.5 py-2.5 text-stone-800 shadow-xl backdrop-blur transition-all hover:bg-stone-900 hover:text-white hover:border-stone-900 active:scale-95 cursor-pointer"
          aria-label="Insights Asesor"
          title="Abrir Argumentario de Venta y Ventajas Comerciales (Privado Asesor)"
        >
          <TrendingUp size={16} className="text-[#9a7b45]" />
          <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-wider">Insights Asesor</span>
        </button>

        <a
          href="/ona/brochure.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/95 px-3.5 py-2.5 text-stone-900 shadow-xl backdrop-blur transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Descargar Brochure"
          title="Descargar Brochure Oficial en PDF"
        >
          <Download size={16} className="text-[#9a7b45]" />
          <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-wider">Brochure PDF</span>
        </a>

        <button
          onClick={handleShareOna}
          className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/95 px-3.5 py-2.5 text-stone-900 shadow-xl backdrop-blur transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Compartir"
          title="Compartir ONA Residences"
        >
          {shareFeedback ? (
            <>
              <Check size={18} className="text-emerald-600" />
              <span className="text-[11px] font-semibold text-emerald-700">¡Copiado!</span>
            </>
          ) : (
            <>
              <Share2 size={16} />
              <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-wider">Compartir</span>
            </>
          )}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-700 shadow-xl backdrop-blur transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Cerrar"
            title="Cerrar vista"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* PANEL IZQUIERDO / HERO: Fotografía Inmersiva Dinámica con Datos Clave Destacados */}
      <div className="relative min-h-[480px] shrink-0 bg-stone-950 md:h-screen md:min-h-0 md:w-[44%]">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={activeImage}
            src={activeImage}
            alt={`ONA Residences - ${activeLabel}`}
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
              Preventa Exclusiva · 1.ª Fase
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-md border border-white/10">
              <MapPin size={11} className="text-[#e8d5a8]" /> {ONA_ZONE}
            </span>
          </div>

          <h1 className="mt-2.5 font-serif text-4xl sm:text-5xl md:text-6xl font-light tracking-wide leading-none text-white">
            ONA <span className="font-sans text-xl sm:text-2xl font-light tracking-normal text-[#e8d5a8] ml-1">Residences</span>
          </h1>

          <p className="mt-2 max-w-md text-xs sm:text-sm font-light text-white/90 leading-relaxed [text-align:justify] [text-justify:inter-word]">
            Eleva tu vida en equilibrio y armonía. Un proyecto contemporáneo en {ONA_ZONE}.
          </p>

          {/* Constructora & Entrega (Destacadas y Más Grandes) */}
          <div className="mt-3.5 grid grid-cols-2 gap-2.5 max-w-md">
            <div className="rounded-xl border border-white/15 bg-black/45 p-2.5 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-1.5 text-[#e8d5a8]">
                <ShieldCheck size={14} />
                <p className="text-[10px] font-bold uppercase tracking-wider">Constructora</p>
              </div>
              <p className="mt-1 text-sm sm:text-base font-serif font-medium text-white leading-tight">
                {ONA_BUILDER}
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-black/45 p-2.5 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-1.5 text-[#e8d5a8]">
                <Building2 size={14} />
                <p className="text-[10px] font-bold uppercase tracking-wider">Entrega de Obra</p>
              </div>
              <p className="mt-1 text-sm sm:text-base font-serif font-medium text-white leading-tight">
                {ONA_DELIVERY}
              </p>
            </div>
          </div>

          {/* Opciones de Departamentos & Precios Desde (Actualizándose en tiempo real con Sheets) */}
          <div className="mt-2.5 rounded-xl border border-[#9a7b45]/40 bg-stone-900/80 p-3 backdrop-blur-md max-w-md shadow-lg">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">
              <span>Departamentos Disponibles</span>
              <span className="flex items-center gap-1 text-emerald-400 font-sans font-medium text-[9px] lowercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                en vivo
              </span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-left">
              {/* 1 Dormitorio */}
              <div className="border-r border-white/10 pr-2">
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-xs font-medium text-stone-200">1 Dormitorio</span>
                  <span className="text-[10px] text-stone-400">32 m²</span>
                </div>
                <p className="mt-0.5 font-serif text-sm sm:text-base font-bold text-white">
                  Desde USD {formatOnaUsd(minPrice1Dorm)}
                </p>
              </div>

              {/* 2 Dormitorios */}
              <div className="pl-1">
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-xs font-medium text-stone-200">2 Dormitorios</span>
                  <span className="text-[10px] text-stone-400">54 a 92 m²</span>
                </div>
                <p className="mt-0.5 font-serif text-sm sm:text-base font-bold text-white">
                  Desde USD {formatOnaUsd(minPrice2Dorms)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO: Contenido Editorial y Tesis del Inversor */}
      <div className="relative min-h-0 flex-1 md:h-screen md:overflow-y-auto">
        <div className="mx-auto max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl px-5 py-8 pb-32 md:px-10 lg:px-14 md:py-14 md:pb-44">

          {/* 1. HERO / ONA RESIDENCES: EXPERIENCIA Y ESTILO DE VIDA */}
          <section id="intro" ref={introRef} className="scroll-mt-6">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Experiencia Residencial & Preventa
              </p>
            </div>

            <h2 className="mt-3 font-serif text-3xl font-light leading-snug text-stone-900 md:text-5xl">
              ONA Residences. <br />
              <span className="italic font-normal text-[#9a7b45]">
                Un proyecto pensado para elevar tu forma de vivir.
              </span>
            </h2>

            <p className="mt-5 text-[15px] font-light leading-relaxed text-stone-600 md:text-base [text-align:justify] [text-justify:inter-word]">
              ONA Residences reúne arquitectura contemporánea, diseño biofílico y ambientes pensados para combinar comodidad, bienestar y estilo en una de las zonas más serenas y cotizadas de Santa Cruz: <strong>{ONA_ZONE}</strong>. Un proyecto concebido por <strong>{ONA_BUILDER}</strong> para quienes entienden que el verdadero confort reside en despertar con calma, disfrutar áreas sociales completas y asegurar una sólida inversión patrimonial.
            </p>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-white/70 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#9a7b45]/10 text-[#9a7b45]">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-[#9a7b45]">
                    Preventa en Marcha · 1.ª Fase
                  </p>
                  <p className="text-sm font-medium text-stone-800">
                    Más de {soldUnitsCount} unidades de esta primera fase ya han sido reservadas.
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-stone-500 font-light border-t border-stone-100 pt-2.5 [text-align:justify] [text-justify:inter-word]">
                La oportunidad de ingresar en 1.ª fase asegura la máxima plusvalía acumulada antes de cada actualización de listas de precios del proyecto.
              </p>
            </div>

            {/* Accesos rápidos y Brochure */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="/ona/brochure.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#9a7b45]/40 bg-[#9a7b45]/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#9a7b45] transition-all hover:bg-[#9a7b45] hover:text-white"
              >
                <Download size={14} />
                Brochure Oficial (PDF)
              </a>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("disponibilidad");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-700 transition-all hover:border-[#9a7b45] hover:text-stone-950 shadow-xs cursor-pointer"
              >
                <Layers size={14} className="text-[#9a7b45]" />
                Ver Disponibilidad en Vivo
              </button>
            </div>



            {/* Accesos rápidos de navegación */}
            <nav className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-stone-200 pt-4 text-xs font-medium text-stone-500">
              <button
                type="button"
                onClick={handleGoHome}
                className="inline-flex items-center gap-1.5 font-bold text-stone-900 hover:text-[#9a7b45] transition-colors cursor-pointer bg-stone-100 hover:bg-[#9a7b45]/15 px-2.5 py-1 rounded-full text-xs"
                title="Ir a la barra de búsqueda e inicio de N.I.A"
              >
                <Home size={13} className="text-[#9a7b45]" />
                <span>Inicio</span>
              </button>
              <a href="#lugar" className="hover:text-stone-950 transition-colors">Ubicación</a>
              <a href="#amenidades" className="hover:text-stone-950 transition-colors">Áreas Sociales</a>
              <a href="#tipologias" className="hover:text-stone-950 transition-colors">Tipologías</a>
              <a href="#equipamiento" className="hover:text-stone-950 transition-colors font-semibold text-[#9a7b45]">Equipamiento</a>
              <a href="#constructora" className="hover:text-stone-950 transition-colors font-semibold text-stone-700">Constructora</a>
              <a href="#pago" className="hover:text-stone-950 transition-colors">Formas de Pago</a>
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
              Los Cusis: Calma residencial y conectividad total.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Ubicado estratégicamente sobre <strong>{ONA_ADDRESS}</strong>, en el tradicional cuadrante residencial de <strong>{ONA_ZONE}</strong> (entre Banzer y Beni).
              Combina el encanto de un vecindario arbolado y tranquilo con un acceso inmediato a las principales arterias comerciales y empresariales de Santa Cruz.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md">
              <img
                src="/ona/ubicacion.jpg"
                alt="Mapa de ubicación de ONA Residences en Los Cusis"
                className="w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
              />
              <div className="p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="border-l-2 border-[#9a7b45] pl-3">
                    <p className="text-xs font-semibold text-stone-900">Conectividad 360°</p>
                    <p className="text-[12px] text-stone-500 font-light mt-0.5 [text-align:justify] [text-justify:inter-word]">
                      Acceso directo hacia el 2.º y 3.er Anillo, Equipetrol y los distritos empresariales.
                    </p>
                  </div>
                  <div className="border-l-2 border-[#9a7b45] pl-3">
                    <p className="text-xs font-semibold text-stone-900">Entorno Gastronómico</p>
                    <p className="text-[12px] text-stone-500 font-light mt-0.5 [text-align:justify] [text-justify:inter-word]">
                      A minutos de restaurantes de autor, cafés de especialidad, colegios y supermercados.
                    </p>
                  </div>
                  <div className="border-l-2 border-[#9a7b45] pl-3">
                    <p className="text-xs font-semibold text-stone-900">Plusvalía en Alza</p>
                    <p className="text-[12px] text-stone-500 font-light mt-0.5 [text-align:justify] [text-justify:inter-word]">
                      Zona residencial consolidada con alta demanda permanente de alquiler y valorización.
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-stone-100 pt-3 text-right">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${property.lat || -17.763513},${property.lng || -63.177111}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#9a7b45] hover:underline"
                  >
                    <MapPin size={13} /> Ver ubicación en Google Maps
                  </a>
                </div>
              </div>
            </div>
          </section>


          {/* 3. AMENIDADES & ÁREAS SOCIALES */}
          <section id="amenidades" ref={amenitiesRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Áreas Sociales & Comodidades
              </p>
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-3xl font-light text-stone-900 md:text-4xl">
                Espacios pensados para disfrutar cada día.
              </h2>
            </div>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Áreas comunes diseñadas para brindar comodidad, descanso y encuentros agradables con amigos y familia dentro del propio edificio.
            </p>

            {/* CARRUSEL INTERACTIVO */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900 sm:aspect-[16/9]">
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

                {/* Controles de Navegación del Carrusel */}
                <div className="absolute inset-0 flex items-center justify-between p-3 pointer-events-none">
                  <button
                    onClick={prevAmenity}
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-[#9a7b45] hover:scale-105 active:scale-95 shadow-md"
                    aria-label="Anterior amenidad"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={nextAmenity}
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-[#9a7b45] hover:scale-105 active:scale-95 shadow-md"
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

              {/* Texto persuasivo y justificado de la amenidad activa */}
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
                      className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
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

            {/* EQUIPAMIENTO DETALLADO DE ÁREAS SOCIALES */}
            <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#9a7b45]/15 text-[#816127]">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-900">
                    Equipamiento entregado en áreas comunes:
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  100% Amoblado &amp; Equipado
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Lobby & Ascensores */}
                <div className="rounded-xl border border-stone-100 bg-[#fbf9f4] p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#9a7b45]" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                      Lobby &amp; Circulación Vertical
                    </h4>
                  </div>
                  <ul className="mt-2.5 space-y-1.5 text-xs text-stone-600 font-light">
                    <li>• <strong>Lobby de doble altura:</strong> Amoblado, decorado e iluminado con control de acceso.</li>
                    <li>• <strong>2 Ascensores de alta velocidad:</strong> Con capacidad para 8 personas cada uno.</li>
                  </ul>
                </div>

                {/* 2. Piscina & Deck */}
                <div className="rounded-xl border border-stone-100 bg-[#fbf9f4] p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#9a7b45]" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                      Piscina, Hidromasaje &amp; Deck
                    </h4>
                  </div>
                  <ul className="mt-2.5 space-y-1.5 text-xs text-stone-600 font-light">
                    <li>• <strong>Piscina tipo playa:</strong> Con hidromasaje integrado para descanso al aire libre.</li>
                    <li>• <strong>Deck solarium:</strong> Equipado con reposeras de descanso y vegetación biofílica.</li>
                  </ul>
                </div>

                {/* 3. Churrasqueras & Fogata */}
                <div className="rounded-xl border border-stone-100 bg-[#fbf9f4] p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#9a7b45]" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                      Churrasqueras &amp; Fogonero
                    </h4>
                  </div>
                  <ul className="mt-2.5 space-y-1.5 text-xs text-stone-600 font-light">
                    <li>• <strong>2 Churrasqueras equipadas:</strong> Con mesones de apoyo y parrillas funcionales.</li>
                    <li>• <strong>Espacio al aire libre con fogata:</strong> Diseñado para convivencia y encuentros nocturnos.</li>
                  </ul>
                </div>

                {/* 4. Gimnasio & Baños */}
                <div className="rounded-xl border border-stone-100 bg-[#fbf9f4] p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#9a7b45]" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                      Gimnasio &amp; Bienestar
                    </h4>
                  </div>
                  <ul className="mt-2.5 space-y-1.5 text-xs text-stone-600 font-light">
                    <li>• <strong>Gimnasio equipado:</strong> Máquinas cardiovasculares y de musculación instaladas.</li>
                    <li>• <strong>Baños independientes:</strong> Baños exclusivos para damas y caballeros en el área social.</li>
                  </ul>
                </div>

                {/* 5. Sauna Seca */}
                <div className="rounded-xl border border-stone-100 bg-[#fbf9f4] p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#9a7b45]" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                      Sauna Seca
                    </h4>
                  </div>
                  <ul className="mt-2.5 space-y-1.5 text-xs text-stone-600 font-light">
                    <li>• <strong>Sauna seca equipada:</strong> Revestimiento en madera natural para relajación y salud.</li>
                    <li>• <strong>Instalaciones completas:</strong> Ducha y vestidor adyacente para confort continuo.</li>
                  </ul>
                </div>

                {/* 6. Salón & Coworking */}
                <div className="rounded-xl border border-stone-100 bg-[#fbf9f4] p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#9a7b45]" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                      Salón de Reuniones &amp; Eventos
                    </h4>
                  </div>
                  <ul className="mt-2.5 space-y-1.5 text-xs text-stone-600 font-light">
                    <li>• <strong>Espacio polivalente equipado:</strong> Mobiliario para reuniones corporativas y celebraciones.</li>
                    <li>• <strong>Climatización e iluminación funcional:</strong> Listo para uso de los propietarios.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>


          {/* 4. TIPOLOGÍAS RESIDENCIALES: PLANOS, INCLUSIONES Y PRECIO INICIAL */}
          <section id="tipologias" ref={typesRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Distribución Arquitectónica
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Un proyecto, distintas formas de vivirlo.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              En ONA Residences podés elegir el departamento según el espacio que realmente necesitás: opciones de 1 y 2 dormitorios concebidas para optimizar cada metro cuadrado y terminaciones de primera.
            </p>

            <div className="mt-8 space-y-10">
              {TYPOLOGIES_DATA.map((tipo) => (
                <article
                  key={tipo.id}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md transition-shadow hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 sm:aspect-[16/10]">
                    <img
                      src={tipo.image}
                      alt={`Plano renderizado de tipología ${tipo.title}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-4 left-4 rounded-full bg-stone-900/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      {tipo.area}
                    </div>
                  </div>

                  <div className="p-6 md:p-7">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-serif text-2xl font-normal text-stone-900">
                        {tipo.title}
                      </h3>
                      <p className="text-sm font-semibold uppercase tracking-wider text-[#9a7b45]">
                        {tipo.area}
                      </p>
                    </div>

                    <p className="mt-2 text-sm font-light text-stone-600 leading-relaxed [text-align:justify] [text-justify:inter-word]">
                      {tipo.tagline}
                    </p>

                    {/* Prueba social positiva */}
                    <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-md bg-[#f6f2ea] px-3 py-1 text-xs font-medium text-[#87652c]">
                      <CheckCircle2 size={13} /> {tipo.reservedCopy}
                    </div>

                    {/* Qué incluye este departamento */}
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

                    {/* Precio inicial */}
                    <div className="mt-6 border-t border-stone-100 pt-5">
                      <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">
                        Precio inicial de preventa
                      </p>
                      <p className="font-serif text-2xl font-medium text-stone-900">
                        Desde USD {formatOnaUsd(tipo.cashPrice)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>


          {/* 5. EQUIPAMIENTO E INCLUSIONES: LLAVE EN MANO */}
          <section id="equipamiento" ref={equipRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Especificaciones &amp; Equipamiento
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Lo que incluye tu departamento.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              En ONA Residences cada departamento se entrega con equipamiento completo de primera calidad, listo para habitar o poner en alquiler de inmediato sin gastos imprevistos de habilitación.
            </p>

            {/* Carrusel / Tarjetas con Controles */}
            <div className="mt-8 relative">
              {/* Controles de navegación del carrusel */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs text-stone-400 font-light">
                  Desliza para ver todos los ambientes
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollEquip("left")}
                    aria-label="Ver ambiente anterior"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-xs transition-all hover:bg-stone-900 hover:text-white hover:border-stone-900 active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollEquip("right")}
                    aria-label="Ver ambiente siguiente"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-xs transition-all hover:bg-stone-900 hover:text-white hover:border-stone-900 active:scale-95 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Contenedor del carrusel con scroll-snap */}
              <div
                ref={equipCarouselRef}
                className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {EQUIPAMIENTO_SLIDES.map((slide) => (
                  <article
                    key={slide.id}
                    className="w-[280px] sm:w-[310px] shrink-0 snap-start overflow-hidden rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[#9a7b45]/60 flex flex-col justify-between"
                  >
                    <div>
                      {/* Imagen con badge */}
                      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-stone-100">
                        <img
                          src={slide.image}
                          alt={`Equipamiento de ${slide.room} en ONA Residences`}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 right-2.5 rounded-full bg-stone-900/85 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#e8d5a8] backdrop-blur">
                          Incluido
                        </div>
                      </div>

                      {/* Título y etiqueta de ambiente (formato editorial del diseño de referencia) */}
                      <div className="mt-4 text-center">
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7b45]">
                          {slide.room}
                        </p>
                        <h3 className="font-serif text-lg font-medium text-stone-900 mt-0.5">
                          {slide.title}
                        </h3>
                        <p className="text-[11px] text-stone-500 font-light mt-0.5">
                          {slide.tagline}
                        </p>
                      </div>

                      {/* Lista de equipamiento incluido */}
                      <ul className="mt-3.5 space-y-2 border-t border-stone-100 pt-3 text-xs text-stone-700">
                        {slide.items.map((it, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#fbf9f4] border border-[#9a7b45]/40 text-[#816127]">
                              <Check size={10} strokeWidth={3} />
                            </span>
                            <span className="leading-snug [text-align:justify] [text-justify:inter-word]">
                              {it}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Banner resumen Llave en Mano */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-[#fbf9f4] p-4 text-xs text-stone-700">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-[#e8d5a8]">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="font-semibold text-stone-900 text-sm">
                    Entrega Llave en Mano · Sin Inversión Extra
                  </p>
                  <p className="text-stone-600 font-light text-xs mt-0.5">
                    Tu unidad incluye mobiliario a medida, granito, luminarias, aire acondicionado, roperos y calefón.
                  </p>
                </div>
              </div>
              <a
                href="/ona/especificaciones-equipamiento.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-[#e8d5a8] shadow-xs hover:bg-black transition-all cursor-pointer"
              >
                <Download size={13} />
                <span>Ver Planilla Completa (PDF)</span>
              </a>
            </div>
          </section>


          {/* 5. RESPALDO CONSTRUCTIVO: PALACIOS ANTÚNEZ */}
          <section id="constructora" ref={builderRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Respaldo Técnico &amp; Trayectoria
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Constructora Palacios Antúnez
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Más de cuatro décadas de solidez técnica, arquitectura y rigor en la ejecución. Conoce a los profesionales y la trayectoria familiar detrás de ONA Residences.
            </p>

            {/* Reproductor de Video Testimonial */}
            <div className="mt-7 overflow-hidden rounded-2xl border border-stone-200 bg-stone-950 shadow-xl">
              <div className="relative mx-auto aspect-[9/16] w-full max-h-[500px] bg-black">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster="/ona/ona-emblem.jpg"
                  className="h-full w-full object-contain"
                >
                  <source src="/ona/video-desarrollador.mp4" type="video/mp4" />
                  Tu navegador no soporta la reproducción de video.
                </video>
              </div>
              <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between gap-3 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full border border-white/20 bg-black p-1 flex items-center justify-center">
                    <img src="/ona/ona-emblem.jpg" alt="Logo Ona" className="h-full w-full object-contain rounded-full" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Arq. Palacios · Director Técnico</p>
                    <p className="text-[10px] text-stone-400">Palacios Antúnez &amp; Archilabs Design</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#e8d5a8] bg-white/10 px-3 py-1 rounded-full border border-white/10">
                  Testimonio Oficial
                </span>
              </div>
            </div>

            {/* Métricas de Respaldo */}
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6 shadow-sm text-left flex flex-col justify-between transition-all hover:border-[#9a7b45]/60 hover:shadow-md">
                <div>
                  <p className="font-serif text-2xl md:text-3xl font-light text-stone-900 tracking-tight">+42 Años</p>
                  <p className="text-[11px] md:text-xs uppercase tracking-wider font-bold text-[#9a7b45] mt-1">Trayectoria Profesional</p>
                </div>
                <p className="text-xs md:text-sm text-stone-600 font-light mt-3 leading-relaxed [text-align:justify] [text-justify:inter-word]">
                  Arquitectura e ingeniería con formación académica en Brasil y ejercicio continuo en Bolivia desde 1984.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6 shadow-sm text-left flex flex-col justify-between transition-all hover:border-[#9a7b45]/60 hover:shadow-md">
                <div>
                  <p className="font-serif text-2xl md:text-3xl font-light text-stone-900 tracking-tight">Diversidad Técnica</p>
                  <p className="text-[11px] md:text-xs uppercase tracking-wider font-bold text-[#9a7b45] mt-1">Alcance Constructivo</p>
                </div>
                <p className="text-xs md:text-sm text-stone-600 font-light mt-3 leading-relaxed [text-align:justify] [text-justify:inter-word]">
                  Edificios residenciales, hospitales, clínicas de salud, naves industriales y desarrollos corporativos.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6 shadow-sm text-left flex flex-col justify-between transition-all hover:border-[#9a7b45]/60 hover:shadow-md">
                <div>
                  <p className="font-serif text-2xl md:text-3xl font-light text-stone-900 tracking-tight">Dirección Propia</p>
                  <p className="text-[11px] md:text-xs uppercase tracking-wider font-bold text-[#9a7b45] mt-1">Garantía de Obra</p>
                </div>
                <p className="text-xs md:text-sm text-stone-600 font-light mt-3 leading-relaxed [text-align:justify] [text-justify:inter-word]">
                  Supervisión técnica directa de los arquitectos fundadores en obra, garantizando precisión de cálculo y entrega en plazo.
                </p>
              </div>
            </div>

            {/* Testimonio / Cita del Fundador */}
            <div className="mt-8 rounded-2xl border border-[#9a7b45]/30 bg-[#fbf9f4] p-6 md:p-8 shadow-xs">
              <p className="font-serif italic text-base md:text-xl text-stone-800 leading-relaxed [text-align:justify] [text-justify:inter-word]">
                “Cada edificio entregado representa una promesa cumplida. El esfuerzo de un gran equipo y la confianza de cientos de familias que creyeron en nosotros. La experiencia nos enseña que la confianza no se pide, se gana: y eso es lo que honramos en ONA.”
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between border-t border-[#9a7b45]/20 pt-3.5 text-xs text-stone-500 gap-2">
                <span className="font-semibold text-stone-800">Constructora Palacios Antúnez</span>
                <span className="text-[#9a7b45] font-semibold tracking-wide">Garantía &amp; Seguridad de Obra</span>
              </div>
            </div>
          </section>


          {/* 6. FORMAS DE PAGO & ESTRUCTURA DE COMPRA (ANTES DEL SIMULADOR) */}
          <section id="pago" ref={payRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-[#9a7b45]" />
                <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                  Estructura de Compra
                </p>
              </div>

              {/* Botón interactivo para actualizar el m² mínimo */}
              <button
                type="button"
                onClick={handleRefreshInventory}
                disabled={isRefreshingInv}
                title="Actualizar precio mínimo por m² e inventario desde planilla"
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-semibold text-stone-700 shadow-xs transition-all hover:border-[#9a7b45] hover:bg-stone-50 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={12} className={isRefreshingInv ? "animate-spin text-[#9a7b45]" : "text-[#9a7b45]"} />
                <span>{isRefreshingInv ? "Actualizando..." : "Actualizar precio m²"}</span>
              </button>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Planes de pago flexibles adaptados a tu estrategia.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Elige cómo distribuir tu capital durante el proceso constructivo con entrega programada para {ONA_DELIVERY}.
            </p>

            {/* Banner de Precio Mínimo en Vivo */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#9a7b45]/30 bg-[#fbf9f4] p-3.5 sm:px-4.5 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#9a7b45]/15 text-[#9a7b45]">
                  <DollarSign size={16} />
                </span>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-light text-stone-600">Precio base preventa:</span>
                    <strong className="font-serif text-lg font-medium text-stone-900">
                      Desde ${formatOnaUsd(minCashPerM2)} USD/m²
                    </strong>
                  </div>
                  <p className="text-[11px] text-stone-500 font-light">
                    Calculado en vivo sobre {availableUnitsCount} unidades disponibles · {lastPriceUpdateText}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRefreshInventory}
                disabled={isRefreshingInv}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#9a7b45] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#816127] active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={12} className={isRefreshingInv ? "animate-spin" : ""} />
                <span>{isRefreshingInv ? "Sincronizando..." : "Actualizar ahora"}</span>
              </button>
            </div>

            {/* LAS 3 FORMAS DE PAGO EXPLICADAS CON SU M² Y VENTAJA */}
            <div className="mt-6 space-y-4">
              {/* Opción 1: Contado */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-stone-900 bg-stone-900 p-6 text-white shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-[#e8d5a8]/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#e8d5a8] border border-[#e8d5a8]/30">
                      Mayor Descuento
                    </span>
                    <h3 className="mt-2 font-serif text-2xl">1. Pago al Contado (100%)</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-light text-[#e8d5a8]">${formatOnaUsd(minCashPerM2)} <span className="text-xs font-sans text-stone-300">USD/m²</span></p>
                    <p className="text-[11px] text-stone-400">vs $1.600 en la zona</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="text-xs uppercase tracking-wider text-[#e8d5a8] font-semibold">Ventaja Comercial:</p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-stone-200 [text-align:justify] [text-justify:inter-word]">
                    Accedes al valor por m² más bajo de todo el proyecto. Ahorras miles de dólares respecto a planes diferidos y aseguras la mayor tasa de retorno y plusvalía neta al recibir tu llave en {ONA_DELIVERY}.
                  </p>
                </div>
              </div>

              {/* Opción 2: 60% inicial */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-stone-100 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-600">
                      Equilibrio Financiero
                    </span>
                    <h3 className="mt-2 font-serif text-xl text-stone-900">2. Inicial 60% + Saldo contra Entrega (40%)</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-light text-stone-900">${formatOnaUsd(minPlan60PerM2)} <span className="text-xs font-sans text-stone-500">USD/m²</span></p>
                    <p className="text-[11px] text-stone-400">vs $1.600 en la zona</p>
                  </div>
                </div>
                <div className="mt-3.5 border-t border-stone-100 pt-3">
                  <p className="text-xs uppercase tracking-wider text-[#9a7b45] font-semibold">Ventaja Comercial:</p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
                    El balance perfecto entre liquidez y rendimiento. Congelas tu unidad con un precio por metro cuadrado muy por debajo del promedio del mercado y pagas el 40% restante recién cuando la obra esté 100% finalizada.
                  </p>
                </div>
              </div>

              {/* Opción 3: 40% inicial */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-stone-100 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-600">
                      Entrada Cómoda
                    </span>
                    <h3 className="mt-2 font-serif text-xl text-stone-900">3. Inicial 40% + Saldo contra Entrega (60%)</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-light text-stone-900">${formatOnaUsd(minPlan40PerM2)} <span className="text-xs font-sans text-stone-500">USD/m²</span></p>
                    <p className="text-[11px] text-stone-400">vs $1.600 en la zona</p>
                  </div>
                </div>
                <div className="mt-3.5 border-t border-stone-100 pt-3">
                  <p className="text-xs uppercase tracking-wider text-[#9a7b45] font-semibold">Ventaja Comercial:</p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
                    El menor desembolso de entrada para ingresar a un edificio de categoría en {ONA_ZONE}. Te permite asegurar y congelar tu propiedad hoy, mientras cancelas el 60% en {ONA_DELIVERY}.
                  </p>
                </div>
              </div>
            </div>
          </section>


          {/* 7. DISPONIBILIDAD & SIMULADOR EN TIEMPO REAL · UNIDADES DE 1.ª FASE */}
          <section id="disponibilidad" ref={disponibilidadRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            {/* Cabecera con sincronización en vivo y link a Google Sheets */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-[#9a7b45]" />
                <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                  Inventario & Disponibilidad Oficial
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefreshInventory}
                  disabled={isRefreshingInv}
                  title="Actualizar disponibilidad y precios por m² desde planilla oficial"
                  className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-stone-700 transition-all hover:bg-stone-50 hover:border-[#9a7b45] active:scale-95 disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  <RefreshCw size={12} className={isRefreshingInv ? "animate-spin text-[#9a7b45]" : "text-[#9a7b45]"} />
                  <span>{isRefreshingInv ? "Sincronizando..." : "Actualizar precios y m²"}</span>
                </button>
                <a
                  href="https://docs.google.com/spreadsheets/d/14-g7f0tzOYfTX9KejkPa4enDf7pi1Kl2ytZaxB-qH6U/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-[#9a7b45] hover:underline"
                  title="Ver planilla en Google Sheets"
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

            {/* Resumen compacto de unidades de 1.ª fase */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-[#fbf9f4] px-4 py-3 text-xs">
              <div className="flex items-center gap-3 text-stone-700">
                <span className="font-semibold text-stone-900">{totalUnitsCount} departamentos</span>
                <span className="text-stone-300">·</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {availableUnitsCount} disponibles
                </span>
                <span className="text-stone-300">·</span>
                <span className="text-stone-500">{soldUnitsCount} vendidos</span>
              </div>
              <span className="text-[11px] text-[#816127] font-semibold bg-[#9a7b45]/10 px-2.5 py-0.5 rounded-full">
                Torre de 12 pisos
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
                {liveAmbienteOptions.map((amb) => {
                  const isSelected = selectedAmbId === amb.id;
                  const availCount = amb.availCount;
                  const soldCount = amb.soldCount;

                  return (
                    <button
                      key={amb.id}
                      onClick={() => handleSelectAmbiente(amb.id)}
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
                            {amb.areaM2} m² {amb.balconyM2 ? `(Balcón ${amb.balconyM2} m²)` : ""} · {amb.view}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            availCount > 0
                              ? isSelected ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-stone-100 text-stone-400"
                          }`}>
                            {availCount} disponibles
                          </span>
                          {soldCount > 0 && (
                            <span className={`block text-[10px] mt-1 ${isSelected ? "text-amber-200/80" : "text-stone-500 font-light"}`}>
                              {soldCount} ya vendidos
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className={isSelected ? "text-stone-400 font-light" : "text-stone-500 font-light"}>
                          Preventa desde:
                        </span>
                        <div className="text-right">
                          <span className={`font-serif text-sm font-semibold ${isSelected ? "text-white" : "text-stone-900"}`}>
                            USD {formatOnaUsd(amb.minCash)}
                          </span>
                          <span className={`block text-[10px] font-medium ${isSelected ? "text-[#e8d5a8]" : "text-[#816127]"}`}>
                            ${formatOnaUsd(amb.minPerM2)} USD/m²
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PASO 2: SELECCIONA EL PISO DISPONIBLE */}
            <div className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white">2</span>
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-900">
                    Pisos disponibles para {currentAmbiente.shortName}:
                  </h3>
                </div>
                {floorsForAmbiente.filter((f) => !f.isAvailable).length > 0 && (
                  <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full">
                    {floorsForAmbiente.filter((f) => !f.isAvailable).length} departamentos de este tipo ya se vendieron
                  </span>
                )}
              </div>

              {/* SOLO RENDERIZA PISOS DISPONIBLES (SIN MOSTRAR OPCIONES NO DISPONIBLES) */}
              <div className="flex flex-wrap gap-2">
                {floorsForAmbiente
                  .filter(({ isAvailable }) => isAvailable)
                  .map(({ floor, unit }) => {
                    const isSelected = selectedFloor === floor;

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
                          <span className="font-serif text-sm">Piso {floor}</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className={`text-[11px] mt-0.5 font-medium ${isSelected ? "text-white" : "text-stone-900"}`}>
                          USD {formatOnaUsd(unit.cash)}
                        </p>
                        <p className={`text-[10px] font-light ${isSelected ? "text-[#e8d5a8]" : "text-[#816127]"}`}>
                          ${formatOnaUsd(unit.cashPerM2)} USD/m²
                        </p>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* PASO 3: ¿DESEAS AÑADIR PARQUEO + BAULERA? (OPCIONAL · ESTILO APPLE) */}
            <div className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white">3</span>
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-900">
                    ¿Deseas añadir estacionamiento con baulera? (Opcional):
                  </h3>
                </div>
                <a
                  href={ONA_PARKINGS_PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#9a7b45] hover:underline"
                  title="Ver planilla oficial de parqueos"
                >
                  <Download size={11} />
                  <span>Planilla de Parqueos PDF</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Opción A: Sin Parqueo */}
                <button
                  type="button"
                  onClick={() => setSelectedParkingOption("none")}
                  className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    selectedParkingOption === "none"
                      ? "border-stone-900 bg-stone-900 text-white shadow-md ring-2 ring-[#9a7b45]"
                      : "border-stone-200 bg-white text-stone-800 hover:border-[#9a7b45]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider">Sin Parqueo</span>
                    <span className={`text-xs font-serif ${selectedParkingOption === "none" ? "text-stone-300" : "text-stone-400"}`}>USD 0</span>
                  </div>
                  <p className={`text-xs mt-1 font-light ${selectedParkingOption === "none" ? "text-stone-300" : "text-stone-500"}`}>
                    Solo departamento seleccionado
                  </p>
                </button>

                {/* Opción B: Simple 15k */}
                <button
                  type="button"
                  onClick={() => setSelectedParkingOption("simple")}
                  className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    selectedParkingOption === "simple"
                      ? "border-stone-900 bg-stone-900 text-white shadow-md ring-2 ring-[#9a7b45]"
                      : "border-stone-200 bg-white text-stone-800 hover:border-[#9a7b45]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider">Parqueo Simple</span>
                    <span className={`text-xs font-serif font-bold ${selectedParkingOption === "simple" ? "text-[#e8d5a8]" : "text-stone-900"}`}>
                      +USD 15.000
                    </span>
                  </div>
                  <p className={`text-xs mt-1 font-light ${selectedParkingOption === "simple" ? "text-stone-300" : "text-stone-500"}`}>
                    1 vehículo cubierto · Baulera privada
                  </p>
                  <span className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    selectedParkingOption === "simple"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}>
                    12 disponibles · 4 vendidos
                  </span>
                </button>

                {/* Opción C: Doble 22k */}
                <button
                  type="button"
                  onClick={() => setSelectedParkingOption("doble")}
                  className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    selectedParkingOption === "doble"
                      ? "border-stone-900 bg-stone-900 text-white shadow-md ring-2 ring-[#9a7b45]"
                      : "border-stone-200 bg-white text-stone-800 hover:border-[#9a7b45]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider">Parqueo Doble (A y B)</span>
                    <span className={`text-xs font-serif font-bold ${selectedParkingOption === "doble" ? "text-[#e8d5a8]" : "text-stone-900"}`}>
                      +USD 22.000
                    </span>
                  </div>
                  <p className={`text-xs mt-1 font-light ${selectedParkingOption === "doble" ? "text-stone-300" : "text-stone-500"}`}>
                    2 vehículos continuos · Baulera privada
                  </p>
                  <span className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    selectedParkingOption === "doble"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}>
                    10 disponibles
                  </span>
                </button>
              </div>

              {/* Selector de nivel y número si se seleccionó Simple o Doble */}
              {selectedParkingOption !== "none" && (
                <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm animate-fadeIn">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                      Selecciona tu parqueo ({selectedParkingOption === "simple" ? "Simple · USD 15.000" : "Doble A y B · USD 22.000"} con baulera):
                    </p>
                    {activeParking && (
                      <span className="text-xs font-bold text-[#816127]">
                        Parqueo {activeParking.code} ({activeParking.level}) asignado
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {availableParkingsForKind.filter((p) => p.level === "Planta baja").length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#9a7b45]" />
                          Planta Baja:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {availableParkingsForKind
                            .filter((p) => p.level === "Planta baja")
                            .map((spot) => {
                              const isSelected = selectedParkingCode === spot.code;
                              return (
                                <button
                                  key={`pb-${spot.code}`}
                                  type="button"
                                  onClick={() => setSelectedParkingCode(spot.code)}
                                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                                    isSelected
                                      ? "border-[#9a7b45] bg-stone-900 text-white font-semibold shadow-sm ring-2 ring-[#9a7b45]"
                                      : "border-stone-200 bg-white text-stone-700 hover:border-[#9a7b45] hover:bg-stone-50"
                                  }`}
                                >
                                  <span className="flex items-center gap-1">
                                    <span>Parqueo {spot.code}</span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  </span>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {availableParkingsForKind.filter((p) => p.level === "Subsuelo").length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#9a7b45]" />
                          Subsuelo:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {availableParkingsForKind
                            .filter((p) => p.level === "Subsuelo")
                            .map((spot) => {
                              const isSelected = selectedParkingCode === spot.code;
                              return (
                                <button
                                  key={`sub-${spot.code}`}
                                  type="button"
                                  onClick={() => setSelectedParkingCode(spot.code)}
                                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                                    isSelected
                                      ? "border-[#9a7b45] bg-stone-900 text-white font-semibold shadow-sm ring-2 ring-[#9a7b45]"
                                      : "border-stone-200 bg-white text-stone-700 hover:border-[#9a7b45] hover:bg-stone-50"
                                  }`}
                                >
                                  <span className="flex items-center gap-1">
                                    <span>Parqueo {spot.code}</span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  </span>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PASO 4: PRECIO TOTAL, MODALIDAD DE PAGO Y RESERVA UNIFICADA */}
            {activeUnit && activeFinancials && (
              <div className="mt-10 rounded-3xl border-2 border-[#9a7b45] bg-[#fbf9f4] p-5 sm:p-7 md:p-8 lg:p-9 shadow-xl scroll-mt-24">
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#9a7b45] text-[10px] font-bold text-white">4</span>
                  <h3 className="text-xs md:text-sm uppercase tracking-wider font-semibold text-[#816127]">
                    Resumen de inversión y modalidad de pago:
                  </h3>
                </div>

                {/* Encabezado de la Configuración Seleccionada */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#9a7b45]/20 pb-5">
                  <div className="space-y-1">
                    <span className="rounded-full bg-stone-900 px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#e8d5a8]">
                      Piso {activeUnit.floor} · TIPO {activeUnit.tipo}
                    </span>
                    <h4 className="mt-2 font-serif text-2xl md:text-3xl font-semibold text-stone-900">
                      {currentAmbiente.name}
                    </h4>
                    <p className="text-xs md:text-sm text-stone-600 font-light mt-1">
                      Superficie depto: <strong>{activeUnit.totalM2} m²</strong> {activeUnit.balconyM2 ? `(Balcón ${activeUnit.balconyM2} m²)` : ""} ·{" "}
                      <strong className="text-[#816127]">${formatOnaUsd(activeFinancials.pricePerM2)} USD/m²</strong> · {activeUnit.view}
                    </p>
                    {selectedParkingOption !== "none" && activeParking && (
                      <p className="text-xs md:text-sm text-emerald-800 font-medium mt-2 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg w-fit">
                        <Car size={14} className="text-[#9a7b45]" />
                        <span>+ Parqueo {activeParking.code} en {activeParking.level} ({activeParking.kind === "simple" ? "Simple" : "Doble"}, USD {formatOnaUsd(activeParking.price)} con baulera)</span>
                      </p>
                    )}
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-300 inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Disponible para Reserva
                    </span>
                    <div className="mt-3">
                      <p className="text-[10px] md:text-xs uppercase tracking-wider text-stone-500 font-semibold">Inversión Total Preventa:</p>
                      <p className="font-serif text-2xl md:text-3xl font-bold text-stone-900">
                        USD {formatOnaUsd(activeFinancials.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selector de Modalidad de Pago con Cuota Inicial Destacada */}
                <div className="mt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <p className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-stone-500">
                      Elige la modalidad de pago para este departamento:
                    </p>
                    <span className="text-[11px] md:text-xs font-medium text-stone-500">
                      Entrega programada: <strong className="text-stone-800">{ONA_DELIVERY}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 lg:gap-5">
                    {[
                      {
                        key: "contado",
                        label: "Al Contado",
                        badge: "100%",
                        perM2: activeUnit.cashPerM2,
                        initial: activeUnit.cash + (selectedParkingOption !== "none" ? parkingPrice : 0),
                        balance: 0,
                        total: activeUnit.cash + (selectedParkingOption !== "none" ? parkingPrice : 0),
                        tag: "Mayor Ahorro",
                      },
                      {
                        key: "plan60",
                        label: "60% Inicial",
                        badge: "60 / 40",
                        perM2: activeUnit.plan60.perM2,
                        initial: activeUnit.plan60.initial + (selectedParkingOption !== "none" ? Math.round(parkingPrice * 0.6) : 0),
                        balance: (activeUnit.plan60.total - activeUnit.plan60.initial) + (selectedParkingOption !== "none" ? Math.round(parkingPrice * 0.4) : 0),
                        total: activeUnit.plan60.total + (selectedParkingOption !== "none" ? parkingPrice : 0),
                        tag: "Equilibrio",
                      },
                      {
                        key: "plan40",
                        label: "40% Inicial",
                        badge: "40 / 60",
                        perM2: activeUnit.plan40.perM2,
                        initial: activeUnit.plan40.initial + (selectedParkingOption !== "none" ? Math.round(parkingPrice * 0.4) : 0),
                        balance: (activeUnit.plan40.total - activeUnit.plan40.initial) + (selectedParkingOption !== "none" ? Math.round(parkingPrice * 0.6) : 0),
                        total: activeUnit.plan40.total + (selectedParkingOption !== "none" ? parkingPrice : 0),
                        tag: "Menor Entrada",
                      },
                    ].map((plan) => {
                      const isSelected = selectedPlan === plan.key;
                      return (
                        <button
                          key={plan.key}
                          type="button"
                          onClick={() => setSelectedPlan(plan.key as any)}
                          className={`rounded-2xl border p-4 md:p-5 text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "border-stone-900 bg-white text-stone-900 shadow-md ring-2 ring-[#9a7b45]"
                              : "border-stone-200 bg-white/70 text-stone-600 hover:border-[#9a7b45] hover:bg-white"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                                <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? "bg-[#9a7b45]" : "bg-stone-300"}`} />
                                {plan.label}
                              </span>
                              <span className="text-[10px] md:text-xs font-semibold text-[#816127] bg-[#9a7b45]/10 px-2.5 py-0.5 rounded-full shrink-0">
                                ${formatOnaUsd(plan.perM2)} USD/m²
                              </span>
                            </div>

                            {/* Cuota Inicial Destacada en la Tarjeta */}
                            <div className={`mt-3.5 rounded-xl p-3 border ${
                              isSelected ? "bg-emerald-50 border-emerald-300 shadow-xs" : "bg-stone-50 border-stone-200/70"
                            }`}>
                              <p className="text-[10px] md:text-xs uppercase tracking-wider font-bold text-emerald-800">
                                {plan.key === "contado" ? "Pago Único (100%):" : `Cuota Inicial (${plan.badge.split(" ")[0]}%):`}
                              </p>
                              <p className="mt-0.5 font-serif text-xl md:text-2xl font-bold text-emerald-950">
                                USD {formatOnaUsd(plan.initial)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3.5 pt-3 border-t border-stone-100 space-y-1.5">
                            <div className="flex items-center justify-between text-xs gap-1">
                              <span className="text-stone-500 font-light">Total Inversión:</span>
                              <strong className="text-stone-900 font-bold md:text-sm">USD {formatOnaUsd(plan.total)}</strong>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-stone-500 gap-1">
                              <span className="font-light">
                                {plan.key === "contado" ? "Saldo contra entrega:" : `Saldo entrega (${plan.key === "plan60" ? "40%" : "60%"}):`}
                              </span>
                              <span className="font-semibold text-stone-700">
                                {plan.key === "contado" ? "USD 0" : `USD ${formatOnaUsd(plan.balance)}`}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Desglose de Desembolsos del Plan Activo */}
                <div className="mt-5 rounded-2xl border border-[#9a7b45]/30 bg-white p-4 sm:p-5 md:p-6 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard size={15} className="text-[#9a7b45]" />
                      <p className="text-xs font-bold uppercase tracking-wider text-stone-900">
                        Estructura de Desembolsos · {selectedPlan === "contado" ? "Pago al Contado (100%)" : selectedPlan === "plan60" ? "Plan 60% Inicial / 40% Contra Entrega" : "Plan 40% Inicial / 60% Contra Entrega"}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#816127] bg-[#9a7b45]/10 px-2.5 py-0.5 rounded-full">
                      ${formatOnaUsd(activeFinancials.pricePerM2)} USD/m²
                    </span>
                  </div>

                  <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Reserva Inmediata */}
                    <div className="rounded-xl bg-[#fbf9f4] p-3.5 border border-stone-200/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500">1. Reserva hoy</span>
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <p className="mt-1 font-serif text-xl font-bold text-stone-900">USD {formatOnaUsd(ONA_RESERVE_USD)}</p>
                      <p className="text-[11px] text-stone-600 font-light mt-1">
                        Congela el piso {activeUnit.floor} hoy y se descuenta íntegramente de tu cuota inicial.
                      </p>
                    </div>

                    {/* 2. Cuota Inicial Neta */}
                    <div className="rounded-xl bg-emerald-50/80 p-3.5 border border-emerald-200">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-800">
                        2. Cuota Inicial ({selectedPlan === "contado" ? "100%" : selectedPlan === "plan60" ? "60%" : "40%"})
                      </p>
                      <p className="mt-1 font-serif text-xl font-bold text-emerald-900">
                        USD {formatOnaUsd(activeFinancials.initialPayment)}
                      </p>
                      <p className="text-[11px] text-emerald-800 font-medium mt-1">
                        {selectedPlan === "contado"
                          ? "Pago total al suscribir contrato de preventa."
                          : `Saldo inicial a la firma: USD ${formatOnaUsd(Math.max(0, activeFinancials.initialPayment - ONA_RESERVE_USD))} (descontando reserva de USD 1.000).`}
                      </p>
                    </div>

                    {/* 3. Saldo contra Entrega */}
                    <div className="rounded-xl bg-stone-50 p-3.5 border border-stone-200/80">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-stone-500">
                        3. Saldo contra Entrega ({selectedPlan === "contado" ? "0%" : selectedPlan === "plan60" ? "40%" : "60%"})
                      </p>
                      <p className="mt-1 font-serif text-xl font-bold text-stone-900">
                        USD {formatOnaUsd(activeFinancials.balancePayment)}
                      </p>
                      <p className="text-[11px] text-stone-600 font-light mt-1">
                        {selectedPlan === "contado"
                          ? "Sin cuotas pendientes ni saldo posterior."
                          : `Se cancela recién al recibir tus llaves y posesión en ${ONA_DELIVERY}.`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CÁLCULO DE GANANCIA / TABLERO DE RENDIMIENTO FINANCIERO */}
                <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
                  <p className="text-[11px] uppercase tracking-widest font-bold text-stone-500 mb-3 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-[#9a7b45]" />
                    Proyección de Ganancia & Rentabilidad (Entrega {ONA_DELIVERY}):
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Tarjeta 1: Valor a la Entrega */}
                    <div className="rounded-xl bg-[#fbf9f4] p-3.5 border border-stone-200/80">
                      <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                        Valor Estimado a la Entrega ($1.600 USD/m²)
                      </p>
                      <p className="mt-1 font-serif text-2xl font-bold text-[#816127]">
                        USD {formatOnaUsd(activeFinancials.marketValueAtDelivery)}
                      </p>
                      <p className="text-[11px] text-stone-500 font-light mt-0.5">
                        Valor de mercado terminado para departamentos en {ONA_ZONE}
                      </p>
                    </div>

                    {/* Tarjeta 2: Ganancia Neta (Plusvalía) */}
                    <div className="rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-200">
                      <p className="text-[10px] uppercase tracking-wider text-emerald-800 font-semibold">
                        Ganancia Estimada de Preventa (Plusvalía)
                      </p>
                      <p className="mt-1 font-serif text-2xl font-bold text-emerald-700">
                        +USD {formatOnaUsd(activeFinancials.capitalGain)}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                        +{activeFinancials.gainPercentage}% de valorización sobre tu precio de compra
                      </p>
                    </div>

                    {/* Tarjeta 3: Alquiler Mensual */}
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

                    {/* Tarjeta 4: Rentabilidad Anual */}
                    <div className="rounded-xl bg-stone-50 p-3.5 border border-stone-200/80">
                      <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                        Rentabilidad Anual Estimada
                      </p>
                      <p className="mt-1 font-serif text-2xl font-bold text-emerald-700">
                        {activeFinancials.yieldRange}
                      </p>
                      <p className="text-[11px] text-stone-500 font-light mt-0.5">
                        Retorno en dólares libre de inflación por alquiler tradicional o corporativo
                      </p>
                    </div>
                  </div>

                  {/* BOTÓN DIRECTO DE RESERVA UNIFICADA */}
                  <div className="mt-5 border-t border-stone-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-stone-700 font-medium text-center sm:text-left">
                        Congela esta configuración en <strong>Piso {activeUnit.floor}</strong> {selectedParkingOption !== "none" && activeParking ? `+ Parqueo ${activeParking.code}` : ""} con <strong>USD {formatOnaUsd(ONA_RESERVE_USD)}</strong>.
                      </p>
                      <p className="text-[11px] text-stone-400 font-light text-center sm:text-left">
                        Firma de preventa y desembolso coordinado directamente con la constructora.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
                          (window as any).fbq("track", "Lead", { content_name: "Ona Residences" });
                        }
                        const planLabel = selectedPlan === "contado" ? "Al Contado" : selectedPlan === "plan60" ? "60% Inicial" : "40% Inicial";
                        const parkingDetail = selectedParkingOption !== "none" && activeParking
                          ? ` + Parqueo ${activeParking.code} en ${activeParking.level} (${activeParking.kind === "simple" ? "Simple" : "Doble"}, USD ${formatOnaUsd(activeParking.price)} con baulera)`
                          : "";
                        const totalContract = activeFinancials.totalPrice;
                        const initialText = selectedPlan === "contado" ? "" : `, Cuota Inicial: USD ${formatOnaUsd(activeFinancials.initialPayment)}`;
                        reserve(
                          `Hola, vengo directo para reservar en ONA: Piso ${activeUnit.floor} - Tipo ${activeUnit.tipo} (${activeUnit.rooms} dorm, ${activeUnit.totalM2} m²)${parkingDetail}, Inversión Total USD ${formatOnaUsd(totalContract)}, modalidad ${planLabel}${initialText}. ¿Sigue disponible para reservar con USD ${formatOnaUsd(ONA_RESERVE_USD)}?`,
                          totalContract
                        );
                      }}
                      className="w-full sm:w-auto bg-stone-900 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-xl transition-all hover:bg-[#9a7b45] active:scale-95 text-center shrink-0 cursor-pointer"
                    >
                      Reservar Piso {activeUnit.floor} {selectedParkingOption !== "none" && activeParking ? `+ Parqueo ${activeParking.code}` : ""} con USD {formatOnaUsd(ONA_RESERVE_USD)}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>


          {/* 8. CIERRE DE CONVERSIÓN & LLAMADO A LA ACCIÓN FINAL */}
          <section id="cierre" ref={closeRef} className="scroll-mt-6 mt-20 border-t border-stone-200 pt-12 text-center">
            <ShieldCheck size={28} className="mx-auto text-[#9a7b45]" />
            <h2 className="mt-3 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Asegura tu unidad al valor de 1.ª fase.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm font-light text-stone-600 leading-relaxed [text-align:justify] [text-justify:inter-word]">
              Reserva hoy tu departamento con <strong>USD {formatOnaUsd(ONA_RESERVE_USD)}</strong> y congela el precio
              antes de la siguiente escala de preventa.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
                    (window as any).fbq("track", "Lead", { content_name: "Ona Residences" });
                  }
                  reserve(
                    `Hola, vengo directo para reservar en ONA con USD ${formatOnaUsd(ONA_RESERVE_USD)}. ¿Qué pisos tienen disponibles?`,
                    ONA_RESERVE_USD
                  );
                }}
                className="bg-stone-900 px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-xl transition-all hover:bg-[#9a7b45] active:scale-95"
              >
                Reservar con USD {formatOnaUsd(ONA_RESERVE_USD)}
              </button>

              <a
                href="/ona/brochure.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-stone-300 bg-white px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-stone-800 shadow-sm transition-all hover:bg-stone-100 hover:border-stone-400 active:scale-95"
              >
                <Download size={15} className="text-[#9a7b45]" />
                Descargar Brochure (PDF)
              </a>
            </div>

            <p className="mt-8 text-[11px] leading-relaxed text-stone-400">
              Constructora {ONA_BUILDER} · Entrega programada {ONA_DELIVERY} · {ONA_ZONE}. Las imágenes y renders son de carácter arquitectónico referencial.
            </p>
          </section>

        </div>
      </div>

      {/* BARRA INFERIOR FLOTANTE DE CONVERSIÓN RÁPIDA (se oculta al llegar al bloque de cierre para no duplicar botones) */}
      <AnimatePresence>
        {activeLabel !== "Reserva 1.ª Fase" && (
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
                  USD {formatOnaUsd(ONA_RESERVE_USD)}
                </span>
              </p>
              <p className="text-[10px] text-[#9a7b45] font-medium hidden sm:block">
                Congela el precio de preventa hoy
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareOna}
                className="flex items-center gap-1.5 border border-stone-300 bg-white px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-800 shadow-sm transition-all hover:bg-stone-100 active:scale-95 cursor-pointer"
                title="Compartir ONA Residences"
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
                    Insights Comerciales · ONA Residences
                  </h3>
                  <p className="text-xs text-stone-500 font-light mt-0.5">
                    Guía de argumentos, ventajas y manejo de objeciones para ofrecer con solidez.
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

              {/* BLOQUE 1: VENTAJAS FUERTES PARA OFRECER AL CLIENTE */}
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
                      • <strong>Anclaje de precio en 1.ª fase:</strong> Desde ${formatOnaUsd(minCashPerM2)} USD/m² vs $1.600 USD/m² que se proyecta al momento de entrega en {ONA_DELIVERY} (+28% de plusvalía en dólares).
                    </li>
                    <li>
                      • <strong>Retorno de alquiler del 10,4% – 11,1% anual en USD:</strong> Debido a que el precio de entrada es muy competitivo para una zona de alta demanda como Los Cusis.
                    </li>
                    <li>
                      • <strong>Ubicación y menor riesgo de inundación:</strong> A 8 minutos de Equipetrol, rodeado de supermercados, cafeterías y servicios, pero en cota alta con drenaje pluvial superior.
                    </li>
                    <li>
                      • <strong>100% Equipado llave en mano:</strong> Granito, cajonería completa, roperos con divisiones, aire acondicionado instalado, box de vidrio y calefón sin cobros sorpresa.
                    </li>
                    <li>
                      • <strong>Parqueos con baulera privada:</strong> Todas las opciones de parqueo ($15k simple / $22k doble) incluyen su propia baulera.
                    </li>
                  </ul>
                </div>

                {/* BLOQUE 2: DESVENTAJAS / OBJECIONES Y CÓMO REBATIRLAS */}
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
                        • Objeción: &quot;La entrega es en Junio 2028 (faltan casi 2 años y medio)&quot;
                      </p>
                      <p className="text-stone-600 font-light mt-0.5 [text-align:justify]">
                        <strong>Respuesta:</strong> Es precisamente la ventaja de entrar en 1.ª fase al precio piso. Con el Plan 60/40 o 40/60 no te descapitalizas hoy: congelas el valor mínimo histórico con USD 1.000 y pagas el saldo recién cuando la torre esté terminada y revalorizada.
                      </p>
                    </div>

                    <div className="border-t border-amber-200/60 pt-2.5">
                      <p className="font-semibold text-stone-900">
                        • Objeción: &quot;Pocas opciones de 1 dormitorio disponibles&quot;
                      </p>
                      <p className="text-stone-600 font-light mt-0.5 [text-align:justify]">
                        <strong>Respuesta:</strong> Las unidades de 32 m² son las de mayor rotación por su ticket accesible (desde USD {formatOnaUsd(minPrice1Dorm)}). Quedan contadas unidades de 1D en 1.ª fase; esto demuestra la tracción real del proyecto y premia la decisión rápida.
                      </p>
                    </div>

                    <div className="border-t border-amber-200/60 pt-2.5">
                      <p className="font-semibold text-stone-900">
                        • Objeción: &quot;¿Por qué Los Cusis y no directamente Equipetrol centro?&quot;
                      </p>
                      <p className="text-stone-600 font-light mt-0.5 [text-align:justify]">
                        <strong>Respuesta:</strong> En Equipetrol central el m² en preventa arranca en $1.500–$1.700. Los Cusis está a solo 8 minutos, con la misma clientela de alquiler de alto nivel, pero con un costo de entrada 25% más bajo, generando mayor rendimiento porcentual neto.
                      </p>
                    </div>
                  </div>
                </div>

                {/* BLOQUE 3: CÁLCULO DE PLUSVALÍA POR TIPOLOGÍA */}
                <div className="rounded-2xl border border-stone-200 bg-[#fbf9f4] p-4 text-xs">
                  <p className="font-bold uppercase tracking-wider text-[#816127]">
                    Proyección de Ganancia Bruta a la Entrega ($1.600 USD/m²)
                  </p>
                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-stone-700">
                    <div className="rounded-xl border border-stone-200/80 bg-white p-2.5 text-center">
                      <p className="text-[11px] text-stone-500 uppercase">1 Dorm (32,3 m²)</p>
                      <p className="text-xs text-stone-400 mt-0.5">Entrada: USD 40.375</p>
                      <p className="font-serif text-base font-bold text-stone-900 mt-1">+USD 11.305</p>
                    </div>
                    <div className="rounded-xl border border-stone-200/80 bg-white p-2.5 text-center">
                      <p className="text-[11px] text-stone-500 uppercase">2 Dorms (54,1 m²)</p>
                      <p className="text-xs text-stone-400 mt-0.5">Entrada: USD 67.675</p>
                      <p className="font-serif text-base font-bold text-stone-900 mt-1">+USD 18.949</p>
                    </div>
                    <div className="rounded-xl border border-stone-200/80 bg-white p-2.5 text-center">
                      <p className="text-[11px] text-stone-500 uppercase">2 Dorms Suite (92 m²)</p>
                      <p className="text-xs text-stone-400 mt-0.5">Entrada: USD 115.000</p>
                      <p className="font-serif text-base font-bold text-stone-900 mt-1">+USD 32.200</p>
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
