import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Download,
  ExternalLink,
  HardHat,
  Home,
  Layers,
  MapPin,
  Maximize2,
  Menu,
  MessageCircle,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import {
  EURODESIGN_CONFIG,
  EURODESIGN_ADDRESS,
  EURODESIGN_CITY,
  EURODESIGN_CONSTRUCTION_STATUS,
  EURODESIGN_DELIVERY,
  EURODESIGN_NAME,
  EURODESIGN_PARKING_USD,
  EURODESIGN_BAULERA_USD,
  EURODESIGN_SHEETS_CSV_URL,
  EURODESIGN_UNITS,
  EURODESIGN_ZONE,
  EurodesignUnit,
  fetchEurodesignLiveUnits,
  formatEurodesignUsd,
  parseEurodesignCsvText,
} from "../eurodesignInventory";
import type { Property } from "../types";
import { EURODESIGN_MODELOS, availableEurodesignModelUnits, matchesEurodesignModel, type EurodesignModel } from "../eurodesignModels";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

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
      "Cocina integrada, mobiliario alto y bajo, y mesón de piedra sinterizada o granito.",
  },
  {
    src: "/eurodesign/amenities/amenity_rooftop_overview.jpg",
    category: "Piso 18 Rooftop",
    title: "Distribución Panorámica de Áreas Sociales",
    description:
      "Planta completa de amenidades en el piso 18 conectando solárium, piscina infinita, parrillas gourmet, gimnasio y lounge climatizado.",
  },
  {
    src: "/eurodesign/amenities/amenity_locales_comerciales.jpg",
    category: "Planta Baja",
    title: "Locales Comerciales & Oficinas en PB",
    description:
      "Espacios de doble altura sobre calle Enrique Finot con vitrinas comerciales de alto tráfico peatonal y vehicular en Equipetrol Norte.",
  },
];

interface AmbienteOption {
  id: string;
  name: string;
  shortName: string;
  areaRange: string;
  view: string;
  basePrice: number;
  rentMin: number;
  rentMax: number;
  yieldRange: string;
  image: string;
  code: string;
  description: string;
  pills: string[];
  matchUnit: (u: EurodesignUnit) => boolean;
}

const AMBIENTE_OPTIONS: AmbienteOption[] = [
  {
    id: "1dorm",
    name: "1 Dormitorio Confort",
    shortName: "1 Dormitorio",
    areaRange: "35 a 57 m²",
    view: "Vista a Equipetrol Norte",
    basePrice: 71780,
    rentMin: 550,
    rentMax: 700,
    yieldRange: "10,2% – 11,4% anual",
    image: "/eurodesign/modelos/1d-03-57.jpg",
    code: "M04",
    description:
      "Distribución espacial optimizada con cocina americana, living luminoso, balcón hacia Equipetrol y dormitorio máster con vestidor.",
    pills: ["Balcón", "Mesón de piedra o granito", "Aire split frío-calor", "Box de ducha"],
    matchUnit: (u) => u.rooms === 1,
  },
  {
    id: "2dorm",
    name: "2 Dormitorios Master Suite",
    shortName: "2 Dormitorios",
    areaRange: "81 a 128 m²",
    view: "Frente panorámico esq. Enrique Finot",
    basePrice: 120176,
    rentMin: 900,
    rentMax: 1200,
    yieldRange: "10,5% – 11,8% anual",
    image: "/eurodesign/modelos/2d-01-82.jpg",
    code: "M01",
    description:
      "Semipiso de gran categoría con amplia master suite con vestidor, segundo dormitorio completo, dos baños, cocina con isla y terraza panorámica.",
    pills: ["Master Suite con vestidor", "2 Baños completos", "Terraza panorámica", "Concepto abierto"],
    matchUnit: (u) => u.rooms === 2,
  },
  {
    id: "locales",
    name: "Locales Comerciales & Oficinas PB",
    shortName: "Locales PB",
    areaRange: "Doble Altura",
    view: "Frente a calle Enrique Finot",
    basePrice: 120000,
    rentMin: 1200,
    rentMax: 2000,
    yieldRange: "11,5% – 13,0% anual",
    image: "/eurodesign/amenities/amenity_locales_comerciales.jpg",
    code: "PB-COM",
    description:
      "Vitrinas comerciales de alto impacto peatonal y vehicular en planta baja. Ideal para cafeterías de especialidad, boutiques o firmas corporativas.",
    pills: ["Doble altura", "Vitrina vidriada", "Acceso directo", "Alto tráfico Equipetrol"],
    matchUnit: (u) => u.floor === 0 || u.unitNumber.toLowerCase().includes("local") || u.unitNumber.toLowerCase().includes("pb"),
  },
];

const EQUIPMENT_SLIDES = [
  {
    id: "cocina",
    title: "Una cocina lista para tu día a día",
    image: "/eurodesign/amenities/amenity_living_panoramico.jpg",
    alt: "Cocina integrada y sala de Tower Eurodesign",
    items: [
      "Cocina a gas, extractor y horno eléctrico",
      "Microondas de empotrar en mueble",
      "Mesones de piedra sinterizada o granito",
      "Mobiliario alto y bajo en cocina",
    ],
  },
  {
    id: "bano",
    title: "Tu espacio para empezar y cerrar el día",
    image: "/eurodesign/bano.jpg",
    alt: "Baño con espejo iluminado, mueble bajo mesón y box de ducha",
    items: [
      "Espejos con iluminación LED",
      "Box de ducha",
      "Accesorios de baño y mueble bajo mesón",
      "Termotanque eléctrico",
    ],
  },
  {
    id: "confort",
    title: "El confort se siente en cada ambiente",
    image: "/eurodesign/modelos/2d-01-82.jpg",
    alt: "Distribución interior con dormitorios, sala y lavandería de Tower Eurodesign",
    items: [
      "Aires acondicionados tipo split, frío-calor, en dormitorios y sala",
      "Lavandería de porcelanato, según el modelo de departamento",
    ],
  },
  {
    id: "accesos",
    title: "Detalles que te acompañan al llegar",
    image: "/eurodesign/amenities/amenity_lobby_recepcion.jpg",
    alt: "Acceso y recepción de Tower Eurodesign",
    items: [
      "Intercomunicador en cada departamento",
      "Sistema contra incendios",
      "Luminaria decorativa en áreas de circulación exterior",
    ],
  },
];

type SwipeStart = { current: { x: number; y: number } | null };

function finishCarouselSwipe(event: React.TouchEvent, start: SwipeStart, move: (direction: number) => void) {
  if (!start.current) return;
  const { clientX, clientY } = event.changedTouches[0];
  const dx = clientX - start.current.x;
  const dy = clientY - start.current.y;
  start.current = null;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
}

interface QuoteModel {
  id: string;
  name: string;
  area: string;
  preview: string;
  full: string;
  model?: EurodesignModel;
  unitNumber?: string;
}

export default function EurodesignLanding({ property, onClose }: Props) {
  const [activeImage, setActiveImage] = useState("/eurodesign/fachada-dia.jpg");
  const [activeLabel, setActiveLabel] = useState("Fachada Principal");
  const [amenityIndex, setAmenityIndex] = useState(0);
  const [equipmentIndex, setEquipmentIndex] = useState(0);
  const equipmentTouch = useRef<{ x: number; y: number } | null>(null);
  const quoteTouch = useRef<{ x: number; y: number } | null>(null);

  // Estados del cotizador en cascada (estilo Apple Store)
  const [selectedAmbId, setSelectedAmbId] = useState<string>("1dorm");
  const [selectedQuoteModelId, setSelectedQuoteModelId] = useState("d03");
  const [tipologiaRooms, setTipologiaRooms] = useState<1 | 2>(1);
  const [modeloIndex, setModeloIndex] = useState(0);
  const modeloTouchX = useRef<number | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number>(4);
  const [selectedPlan, setSelectedPlan] = useState<"contado" | "cuotas">("contado");
  const [parkingOption, setParkingOption] = useState<"none" | "parking" | "baulera" | "parking_baulera">("none");

  const [shareFeedback, setShareFeedback] = useState(false);
  const [units, setUnits] = useState<EurodesignUnit[]>(EURODESIGN_UNITS);
  const [isRefreshingInv, setIsRefreshingInv] = useState(false);
  const [lastPriceUpdateText, setLastPriceUpdateText] = useState<string>("Sincronizado");
  const availableUnitsCount = useMemo(() => units.filter((u) => u.status === "disponible").length, [units]);

  const [activeSectionId, setActiveSectionId] = useState<string>("intro");
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [floatingNavOpen, setFloatingNavOpen] = useState(false);
  const [zoomPlanImage, setZoomPlanImage] = useState<string | null>(null);

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
    { id: "amenidades", label: "Áreas Sociales", icon: Sparkles, hint: "Piscina Piso 18 & Sky Bar" },
    { id: "tipologias", label: "Tipologías", icon: Layers, hint: "1D, 2D y Locales Comerciales" },
    { id: "equipamiento", label: "Equipamiento", icon: CheckCircle2, hint: "Detalle del brochure" },
    { id: "constructora", label: "Constructora", icon: ShieldCheck, hint: "Nuestro legado · Entrega junio 2027" },
    { id: "pago", label: "Formas de Pago", icon: TrendingUp, hint: "Contado $1.480/m² y Cuotas Preventa" },
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
      setActiveSectionId("intro");
      return;
    }

    const map: Record<string, React.RefObject<HTMLElement | null>> = {
      lugar: placeRef,
      amenidades: amenitiesRef,
      tipologias: typesRef,
      equipamiento: equipRef,
      constructora: builderRef,
      pago: payRef,
      disponibilidad: disponibilidadRef,
      cierre: closeRef,
    };
    const target = map[sectionId]?.current;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSectionId(sectionId);
    }
  };

  // Carga inicial y sincronización en vivo
  useEffect(() => {
    let isMounted = true;
    fetchEurodesignLiveUnits().then((res) => {
      if (!isMounted) return;
      if (res && res.units && res.units.length > 0) {
        setUnits(res.units);
        if (res.source === "live_sheet") {
          const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setLastPriceUpdateText(`Actualizado ${timeStr}`);
        }
      }
    });
    return () => {
      isMounted = false;
    };
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
          const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setLastPriceUpdateText(`Actualizado ${timeStr}`);
        }
      }
    } catch (err) {
      console.warn("Error refrescando inventario Eurodesign:", err);
    } finally {
      setIsRefreshingInv(false);
    }
  };

  // Precios mínimos dinámicos
  const minPrice1Dorm = useMemo(() => {
    const list = units.filter((u) => u.rooms === 1 && u.status === "disponible");
    return list.length ? Math.min(...list.map((u) => u.cashTotal)) : 71780;
  }, [units]);

  const minPrice2Dorms = useMemo(() => {
    const list = units.filter((u) => u.rooms === 2 && u.status === "disponible");
    return list.length ? Math.min(...list.map((u) => u.cashTotal)) : 120176;
  }, [units]);

  const currentAmbiente = useMemo(
    () => AMBIENTE_OPTIONS.find((a) => a.id === selectedAmbId) || AMBIENTE_OPTIONS[0],
    [selectedAmbId]
  );

  const quoteModels = useMemo<QuoteModel[]>(() => {
    if (selectedAmbId === "locales") {
      return units.filter((unit) => unit.floor === 0).map((unit) => ({
        id: unit.unitNumber,
        name: unit.unitNumber,
        area: `${unit.areaM2.toLocaleString("es-BO")} m² · Planta baja`,
        preview: "/eurodesign/amenities/amenity_locales_comerciales.jpg",
        full: "/eurodesign/page-32-locales-comerciales.jpg",
        unitNumber: unit.unitNumber,
      }));
    }
    const rooms = selectedAmbId === "2dorm" ? 2 : 1;
    return EURODESIGN_MODELOS.filter((model) => model.rooms === rooms).map((model) => ({
      ...model,
      area: `${model.area} · ${model.id.endsWith("p4") ? "Piso 4" : "Pisos 5 a 17"}`,
      model,
    }));
  }, [selectedAmbId, units]);
  const quoteModelIndex = Math.max(0, quoteModels.findIndex((model) => model.id === selectedQuoteModelId));
  const quoteModel = quoteModels[quoteModelIndex];
  const moveQuoteModel = (direction: number) => {
    if (quoteModels.length < 2) return;
    setSelectedQuoteModelId(quoteModels[(quoteModelIndex + direction + quoteModels.length) % quoteModels.length].id);
  };

  const unitsInAmbiente = useMemo(
    () => units.filter((unit) => quoteModel?.model
      ? matchesEurodesignModel(quoteModel.model, unit)
      : quoteModel?.unitNumber === unit.unitNumber),
    [units, quoteModel]
  );
  const quoteAvailableUnits = quoteModel?.model
    ? availableEurodesignModelUnits(quoteModel.model, units)
    : unitsInAmbiente.filter((unit) => unit.status === "disponible");

  const floorsForAmbiente = useMemo(() => {
    const floorsMap = new Map<number, { isAvailable: boolean; availableCount: number; unit?: EurodesignUnit }>();
    unitsInAmbiente.forEach((u) => {
      const existing = floorsMap.get(u.floor) || { isAvailable: false, availableCount: 0 };
      if (u.status === "disponible") {
        existing.isAvailable = true;
        existing.availableCount += 1;
        if (!existing.unit) existing.unit = u;
      }
      floorsMap.set(u.floor, existing);
    });

    return Array.from(floorsMap.entries())
      .map(([floor, data]) => ({ floor, ...data }))
      .sort((a, b) => a.floor - b.floor);
  }, [unitsInAmbiente]);

  // Selección automática de piso disponible al cambiar tipología
  useEffect(() => {
    const firstAvail = floorsForAmbiente.find((f) => f.isAvailable);
    if (firstAvail) {
      setSelectedFloor(firstAvail.floor);
    } else if (floorsForAmbiente.length > 0) {
      setSelectedFloor(floorsForAmbiente[0].floor);
    }
  }, [floorsForAmbiente]);

  const activeUnit = useMemo(() => {
    return (
      unitsInAmbiente.find((u) => u.floor === selectedFloor && u.status === "disponible") ||
      unitsInAmbiente.find((u) => u.status === "disponible")
    );
  }, [unitsInAmbiente, selectedFloor]);

  // Cálculos financieros
  const activeFinancials = useMemo(() => {
    if (!activeUnit) return null;
    const baseTotal = selectedPlan === "contado" ? activeUnit.cashTotal : activeUnit.cuotas.total;
    const extraPrice =
      parkingOption === "parking"
        ? EURODESIGN_PARKING_USD
        : parkingOption === "baulera"
        ? EURODESIGN_BAULERA_USD
        : parkingOption === "parking_baulera"
        ? EURODESIGN_PARKING_USD + EURODESIGN_BAULERA_USD
        : 0;
    const totalPrice = baseTotal + extraPrice;
    const pricePerM2 = selectedPlan === "contado" ? activeUnit.cashPerM2 : activeUnit.cuotas.perM2;

    const initialPayment =
      selectedPlan === "contado"
        ? totalPrice
        : Math.round(activeUnit.cuotas.initial40 + extraPrice * 0.4);

    const balancePayment =
      selectedPlan === "contado"
        ? 0
        : Math.round(activeUnit.cuotas.balance40 + extraPrice * 0.4);

    return {
      totalPrice,
      baseTotal,
      extraPrice,
      parkingExtra: extraPrice,
      pricePerM2,
      initialPayment,
      balancePayment,
    };
  }, [activeUnit, selectedPlan, parkingOption]);

  const handleShare = async () => {
    recordLeadEvent({
      action: "share",
      propertyRef: "eurodesign",
      operacion: "Preventa",
      zona: EURODESIGN_ZONE,
    }).catch(() => {});

    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/eurodesign`;
    const shareTitle = "Tower Eurodesign · Preventa Exclusiva en Equipetrol Norte";
    const shareText = `Departamentos premium en Equipetrol Norte desde USD ${formatEurodesignUsd(minPrice1Dorm)}. Torre de 18 niveles con obra gruesa al 100%:`;

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
      intro: { src: "/eurodesign/fachada-dia.jpg", label: "Fachada Principal" },
      lugar: { src: "/eurodesign/ubicacion-entorno.jpg", label: "Ubicación Equipetrol Norte" },
      amenidades: { src: "/eurodesign/amenities/amenity_piscina_skybar.jpg", label: "Piscina Panorámica Piso 18" },
      tipologias: { src: "/eurodesign/amenities/amenity_living_panoramico.jpg", label: "Master Suite & Living" },
      equipamiento: { src: "/eurodesign/amenities/amenity_living_panoramico.jpg", label: "Terminaciones Europeas" },
      constructora: { src: "/eurodesign/legado.jpg", label: "Nuestro legado" },
      pago: { src: "/eurodesign/fachada-dia.jpg", label: "Estructura de Compra" },
      disponibilidad: { src: "/eurodesign/amenities/amenity_piscina_dia.jpg", label: "Disponibilidad en Vivo" },
      cierre: { src: "/eurodesign/amenities/amenity_rooftop_overview.jpg", label: "Vista 360° Equipetrol" },
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
      zona: property.zone || EURODESIGN_ZONE,
      presupuesto: budget ? `USD ${formatEurodesignUsd(budget)}` : `desde USD ${formatEurodesignUsd(minPrice1Dorm)}`,
    }).catch(() => {});

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
    setAmenityIndex((prev) => (prev - 1 + AMENITY_SLIDES.length) % AMENITY_SLIDES.length);
  };

  const currentSlide = AMENITY_SLIDES[amenityIndex];
  const equipmentSlide = EQUIPMENT_SLIDES[equipmentIndex];
  const moveEquipment = (direction: number) => {
    setEquipmentIndex((index) => (index + direction + EQUIPMENT_SLIDES.length) % EQUIPMENT_SLIDES.length);
  };

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

        <a
          href={EURODESIGN_CONFIG.brochurePdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          download="Brochure_Tower_Eurodesign.pdf"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-900 shadow-xl backdrop-blur transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Descargar Brochure Oficial en PDF"
          aria-label="Descargar Brochure"
        >
          <Download size={18} className="text-stone-700" />
        </a>

        <button
          type="button"
          onClick={handleShare}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-900 shadow-xl backdrop-blur transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Compartir enlace oficial del proyecto"
          aria-label="Compartir"
        >
          {shareFeedback ? (
            <Check size={18} className="text-[#9a7b45]" />
          ) : (
            <Share2 size={18} className="text-stone-700" />
          )}
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-900 shadow-xl backdrop-blur transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Cerrar vista"
            aria-label="Cerrar"
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
            src="/eurodesign/fachada-dia.jpg"
            alt={`Tower Eurodesign - ${activeLabel}`}
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
              Preventa Exclusiva · Equipetrol Norte
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-md">
              <HardHat size={11} className="text-[#e8d5a8]" />
              Obra Gruesa 100% · Losa Piso 18
            </span>
          </div>

          <h1 className="mt-3 font-serif text-4xl font-light tracking-wide text-white md:text-5xl lg:text-6xl">
            TOWER EURODESIGN
          </h1>

          <p className="mt-2 text-xs font-light text-stone-200 md:text-sm max-w-md leading-relaxed [text-align:justify] [text-justify:inter-word]">
            Arquitectura de vanguardia europea, terminaciones de categoría y rooftop panorámico en la zona más cotizada de Equipetrol Norte.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-wider text-[#e8d5a8] font-semibold flex items-center gap-1">
                <ShieldCheck size={12} /> Constructora
              </p>
              <p className="mt-0.5 font-serif text-xs sm:text-sm font-semibold text-white">
                {EURODESIGN_CONFIG.builder}
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-wider text-[#e8d5a8] font-semibold flex items-center gap-1">
                <Calendar size={12} /> Entrega de Obra
              </p>
              <p className="mt-0.5 font-serif text-xs sm:text-sm font-semibold text-white">
                {EURODESIGN_DELIVERY}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="border-r border-white/10 pr-1">
                <p className="text-[10px] text-stone-400">1 Dormitorio</p>
                <p className="text-[11px] text-stone-300 font-mono">35 a 57 m²</p>
                <p className="mt-0.5 font-serif text-xs sm:text-sm font-bold text-white">
                  Desde USD {formatEurodesignUsd(minPrice1Dorm)}
                </p>
              </div>
              <div className="border-r border-white/10 pr-1">
                <p className="text-[10px] text-stone-400">2 Dormitorios</p>
                <p className="text-[11px] text-stone-300 font-mono">81 a 128 m²</p>
                <p className="mt-0.5 font-serif text-xs sm:text-sm font-bold text-white">
                  Desde USD {formatEurodesignUsd(minPrice2Dorms)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-stone-400">Locales PB</p>
                <p className="text-[11px] text-stone-300 font-mono">Doble Altura</p>
                <p className="mt-0.5 font-serif text-xs sm:text-sm font-bold text-white">
                  Desde USD 120.000
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO / EDITORIAL (Formato ancho del Manual de NIA) */}
      <div ref={rightPanelRef} className="relative min-h-0 flex-1 md:h-screen md:overflow-y-auto">
        <div className="mx-auto max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl px-5 py-8 pb-32 md:px-10 lg:px-14 md:py-14 md:pb-44">

          {/* 1. HERO / VIVE EN TOWER EURODESIGN */}
          <section id="intro" ref={introRef} className="scroll-mt-6">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Experiencia Residencial & Preventa
              </p>
            </div>

            <h2 className="mt-3 font-serif text-3xl font-light leading-snug text-stone-900 md:text-5xl">
              Vive en Tower Eurodesign. <br />
              <span className="italic font-normal text-[#9a7b45]">
                El nuevo estándar de confort y plusvalía en Equipetrol Norte.
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
                    Más de 50 unidades ya han sido comercializadas en esta torre de 18 niveles.
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-stone-500 font-light border-t border-stone-100 pt-2.5 [text-align:justify] [text-justify:inter-word]">
                La preventa arranca desde <strong>$1.480 USD/m²</strong>, con obra gruesa consolidada en losa 18 y entrega formal en {EURODESIGN_DELIVERY}.
              </p>
            </div>

            {/* Accesos rápidos */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={EURODESIGN_CONFIG.brochurePdfUrl}
                target="_blank"
                rel="noreferrer"
                download="Brochure_Tower_Eurodesign.pdf"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-800 shadow-sm transition-all hover:bg-stone-50 active:scale-95 cursor-pointer"
              >
                <Download size={14} className="text-[#9a7b45]" />
                <span>Descargar Brochure PDF</span>
              </a>
              <button
                type="button"
                onClick={() => scrollToSection("disponibilidad")}
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-all hover:bg-black active:scale-95 cursor-pointer"
              >
                <Building2 size={14} className="text-[#e8d5a8]" />
                <span>Ver Disponibilidad</span>
              </button>
            </div>

            {/* Barra de Secciones Inicial con Botón de Inicio */}
            <nav
              ref={navBarRef}
              className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-stone-200 pt-4 text-xs font-medium text-stone-500"
            >
              <button
                type="button"
                onClick={() => scrollToSection("intro")}
                className="inline-flex items-center gap-1.5 text-stone-900 font-semibold hover:text-[#9a7b45] transition-colors cursor-pointer"
              >
                <Home size={13} className="text-[#9a7b45]" />
                Inicio
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
                className="hover:text-stone-950 transition-colors cursor-pointer"
              >
                Equipamiento
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("constructora")}
                className="hover:text-stone-950 transition-colors cursor-pointer"
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
              Equipetrol Norte: Tranquilidad residencial y conectividad total.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Ubicado estratégicamente sobre <strong>{EURODESIGN_ADDRESS}</strong>, a solo pasos de la Av. San Martín, Ventura Mall, Patio Design, Torre Platinum, Supermercados Fidalga e Hipermaxi, y el polo gastronómico más distinguido de Santa Cruz. La zona goza de cota alta con drenaje pluvial superior garantizando tranquilidad absoluta.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md">
              <button
                type="button"
                onClick={() => setZoomPlanImage("/eurodesign/ubicacion-entorno.jpg")}
                className="block w-full cursor-zoom-in bg-[#f4f1ea]"
                aria-label="Ampliar el mapa de entorno de Tower Eurodesign"
              >
                <img
                  src="/eurodesign/ubicacion-entorno.jpg"
                  alt="Mapa de entorno de Tower Eurodesign en Equipetrol Norte"
                  className="mx-auto w-full"
                />
              </button>
              <p className="border-t border-stone-100 px-4 py-2 text-center text-[11px] font-light text-stone-500">
                Mapa del brochure. Toca la imagen para verla completa.
              </p>

              <div className="border-t border-stone-100 p-4 pt-3 text-right">
                <a
                  href={EURODESIGN_CONFIG.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#9a7b45] hover:underline cursor-pointer"
                >
                  <MapPin size={13} /> Ver ubicación en Google Maps
                </a>
              </div>
            </div>
          </section>

          {/* 3. ÁREAS SOCIALES & AMENIDADES (PISO 18 ROOFTOP) */}
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

            {/* CARRUSEL INTERACTIVO */}
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
              <Layers size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Distribución Arquitectónica
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Encuentra el espacio que va contigo.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Uno o dos dormitorios, distintas distribuciones y espacio para tu forma de vivir. Recorre los modelos y descubre en cuál te ves.
            </p>

            <button
              type="button"
              onClick={() => setZoomPlanImage("/eurodesign/plano-distribucion.jpg")}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-[#9a7b45] hover:text-[#816127]"
              aria-label="Ver plano de distribución del edificio"
            >
              <Layers size={16} className="text-[#9a7b45]" />
              Ver plano de distribución
              <Maximize2 size={14} />
            </button>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {([1, 2] as const).map((rooms) => {
                const isSelected = tipologiaRooms === rooms;
                const displayPrice = rooms === 1 ? minPrice1Dorm : minPrice2Dorms;
                const count = EURODESIGN_MODELOS.filter((m) => m.rooms === rooms).length;
                return (
                  <button
                    key={rooms}
                    type="button"
                    onClick={() => {
                      setTipologiaRooms(rooms);
                      setModeloIndex(0);
                      setSelectedAmbId(rooms === 1 ? "1dorm" : "2dorm");
                    }}
                    className={`cursor-pointer rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-[#9a7b45] bg-[#9a7b45]/5 shadow-md ring-1 ring-[#9a7b45]"
                        : "border-stone-200 bg-white hover:border-[#9a7b45]/50 hover:shadow-sm"
                    }`}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">
                      {rooms === 1 ? "1 Dormitorio" : "2 Dormitorios"}
                    </span>
                    <p className="mt-2 font-serif text-xl font-bold text-stone-900">
                      Desde USD {formatEurodesignUsd(displayPrice)}
                    </p>
                    <p className="mt-1 text-[11px] font-light leading-snug text-stone-500">
                      {count} modelos · desliza
                    </p>
                  </button>
                );
              })}
            </div>

            {(() => {
              const slides = EURODESIGN_MODELOS.filter((m) => m.rooms === tipologiaRooms);
              const index = ((modeloIndex % slides.length) + slides.length) % slides.length;
              const current = slides[index];
              const go = (dir: number) => setModeloIndex((index + dir + slides.length) % slides.length);
              return (
                <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-3 border-b border-stone-100 px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-[#9a7b45] px-2 py-0.5 text-[11px] font-bold tracking-wider text-white">
                          {current.name.toUpperCase()}
                        </span>
                        {current.note ? (
                          <span className="rounded border border-stone-300 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                            {current.note}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 font-serif text-lg font-medium leading-tight text-stone-900">
                        {tipologiaRooms === 1 ? "1 dormitorio" : "2 dormitorios"} · {current.area}
                      </p>
                      <p className="mt-0.5 text-xs font-light text-stone-500">Unidades {current.units}</p>
                    </div>
                    {slides.length > 1 && (
                      <p className="shrink-0 pt-1 text-[11px] font-medium text-stone-400">
                        {index + 1}/{slides.length}
                      </p>
                    )}
                  </div>

                  <div
                    className="relative w-full overflow-hidden bg-white"
                    onTouchStart={(event) => {
                      modeloTouchX.current = event.changedTouches[0].clientX;
                    }}
                    onTouchEnd={(event) => {
                      if (modeloTouchX.current == null || slides.length < 2) return;
                      const dx = event.changedTouches[0].clientX - modeloTouchX.current;
                      if (dx > 40) go(-1);
                      if (dx < -40) go(1);
                      modeloTouchX.current = null;
                    }}
                  >
                    <div
                      className="flex items-start transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${index * 100}%)` }}
                    >
                      {slides.map((slide) => (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => setZoomPlanImage(slide.full)}
                          className="min-w-full cursor-zoom-in"
                          aria-label={`Ver ${slide.name} completo`}
                        >
                          <img
                            src={slide.preview}
                            alt={`${slide.name}, ${slide.area}, solo el departamento`}
                            className="mx-auto w-full max-w-lg"
                          />
                        </button>
                      ))}
                    </div>
                    {slides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => go(-1)}
                          className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md"
                          aria-label="Modelo anterior"
                        >
                          <ChevronLeft size={22} />
                        </button>
                        <button
                          type="button"
                          onClick={() => go(1)}
                          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md"
                          aria-label="Modelo siguiente"
                        >
                          <ChevronRight size={22} />
                        </button>
                      </>
                    )}
                  </div>
                  {slides.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 px-4 py-3">
                      {slides.map((slide, dot) => (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => setModeloIndex(dot)}
                          className={`h-2 cursor-pointer rounded-full ${dot === index ? "w-5 bg-[#9a7b45]" : "w-2 bg-stone-300"}`}
                          aria-label={slide.name}
                        />
                      ))}
                    </div>
                  )}
                  <p className="border-t border-stone-100 px-4 py-3 text-center text-[11px] font-light text-stone-500">
                    Desliza para el siguiente. Toca la imagen para ver la ficha completa.
                  </p>
                </div>
              );
            })()}
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
              Llegas a casa. Lo esencial ya está resuelto.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Cocina equipada, climatización en sala y dormitorios y baños con detalles que se disfrutan todos los días. Descubre lo que incluye tu departamento, ambiente por ambiente.
            </p>

            <div
              role="region"
              aria-roledescription="carrusel"
              aria-label="Equipamiento incluido"
              tabIndex={0}
              className="mt-6 touch-pan-y overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm focus-visible:outline-2 focus-visible:outline-[#9a7b45]"
              onTouchStart={(event) => { equipmentTouch.current = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }; }}
              onTouchEnd={(event) => finishCarouselSwipe(event, equipmentTouch, moveEquipment)}
              onTouchCancel={() => { equipmentTouch.current = null; }}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                  event.preventDefault();
                  moveEquipment(event.key === "ArrowRight" ? 1 : -1);
                }
              }}
            >
              <div className="aspect-[16/10] overflow-hidden bg-[#f7f5f0] sm:aspect-[16/9]">
                <motion.img
                  key={equipmentSlide.id}
                  src={equipmentSlide.image}
                  alt={equipmentSlide.alt}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  loading="lazy"
                  className={`h-full w-full ${equipmentSlide.id === "confort" ? "object-contain" : "object-cover"}`}
                />
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div aria-live="polite" aria-atomic="true" className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#816127]">{equipmentIndex + 1} / {EQUIPMENT_SLIDES.length}</p>
                    <h3 className="mt-1 font-serif text-xl text-stone-900 sm:text-2xl">{equipmentSlide.title}</h3>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => moveEquipment(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 text-stone-800 hover:bg-stone-50" aria-label="Equipamiento anterior"><ChevronLeft size={22} /></button>
                    <button type="button" onClick={() => moveEquipment(1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 text-stone-800 hover:bg-stone-50" aria-label="Equipamiento siguiente"><ChevronRight size={22} /></button>
                  </div>
                </div>
                <ul className="mt-4 grid gap-2 text-sm font-light leading-relaxed text-stone-600 sm:grid-cols-2">
                  {equipmentSlide.items.map((item) => (
                    <li key={item} className="flex items-start gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#9a7b45]" /><span>{item}</span></li>
                  ))}
                </ul>
                <div className="mt-5 flex justify-center gap-1.5">
                  {EQUIPMENT_SLIDES.map((slide, index) => (
                    <button key={slide.id} type="button" onClick={() => setEquipmentIndex(index)} aria-label={`Ver equipamiento: ${slide.title}`} aria-current={index === equipmentIndex ? "true" : undefined} className="flex h-8 w-8 items-center justify-center">
                      <span className={`h-2 rounded-full ${index === equipmentIndex ? "w-5 bg-[#9a7b45]" : "w-2 bg-stone-300"}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setZoomPlanImage("/eurodesign/equipamiento.jpg")}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-[#9a7b45] hover:text-[#816127]"
            >
              <Maximize2 size={15} className="text-[#9a7b45]" /> Ver equipamiento completo
            </button>
          </section>

          {/* 6. CONSTRUCTORA — NUESTRO LEGADO (brochure) */}
          <section id="constructora" ref={builderRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Nuestro legado
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Elige conociendo quién está detrás.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Conoce el portafolio de {EURODESIGN_CONFIG.builder} y el sello que acompaña a Tower Eurodesign. Una decisión importante merece que puedas mirar más allá del departamento.
            </p>

            <button
              type="button"
              onClick={() => setZoomPlanImage("/eurodesign/legado.jpg")}
              className="mt-6 block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-stone-200 bg-[#f4f1ea] shadow-md"
              aria-label="Ampliar el portafolio Nuestro legado de Eurodesign"
            >
              <img
                src="/eurodesign/legado.jpg"
                alt="Nuestro legado: portafolio de proyectos de Desarrollo Eurodesign"
                className="mx-auto w-full"
              />
            </button>
            <p className="mt-2 text-center text-[11px] font-light text-stone-500">
              Conoce su portafolio. Toca para ampliar.
            </p>

          </section>

          {/* 7. ESTRUCTURA DE COMPRA & FORMAS DE PAGO */}
          <section id="pago" ref={payRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Elige cómo hacerlo tuyo
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Da el paso a vivir en Equipetrol Norte.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Elige el ahorro del contado o distribuye tu inversión durante la obra. Encuentra el plan que se acomoda a ti y empieza a hacer tuyo un departamento con entrega en {EURODESIGN_DELIVERY}.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#9a7b45]/30 bg-[#fbf9f4] p-3.5 sm:px-4.5 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#9a7b45]/15 text-[#9a7b45]">
                  <DollarSign size={16} />
                </span>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-light text-stone-600">Precio base preventa:</span>
                    <strong className="font-serif text-lg font-medium text-stone-900">
                      Desde $1.480 USD/m²
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

            {/* LAS 3 FORMAS DE PAGO EXPLICADAS CON SU M² Y VENTAJA (ESTÁNDAR ONA) */}
            <div className="mt-6 space-y-4">
              {/* Opción 1: Contado */}
              <div
                onClick={() => setSelectedPlan("contado")}
                className="relative overflow-hidden rounded-2xl border-2 border-stone-900 bg-stone-900 p-6 text-white shadow-lg cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-[#e8d5a8]/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#e8d5a8] border border-[#e8d5a8]/30">
                      Mayor Descuento
                    </span>
                    <h3 className="mt-2 font-serif text-2xl">1. Pago al Contado (100%)</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-light text-[#e8d5a8]">$1.480 <span className="text-xs font-sans text-stone-300">USD/m²</span></p>

                  </div>
                </div>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="text-xs uppercase tracking-wider text-[#e8d5a8] font-semibold">Ventaja Comercial:</p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-stone-200 [text-align:justify] [text-justify:inter-word]">
                    Aseguras el valor por m² más bajo del proyecto ($1.480 USD/m²). Ahorras hasta USD 10.000 respecto al plan diferido, con la estructura y la obra gruesa ya consolidadas en piso 18.
                  </p>
                </div>
              </div>

              {/* Opción 2: 60% Inicial */}
              <div
                onClick={() => setSelectedPlan("cuotas")}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm hover:border-[#9a7b45]/40 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-stone-100 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-600">
                      Equilibrio Financiero
                    </span>
                    <h3 className="mt-2 font-serif text-xl text-stone-900">2. Inicial 60% + Saldo contra Entrega (40%)</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-light text-stone-900">$1.530 <span className="text-xs font-sans text-stone-500">USD/m²</span></p>

                  </div>
                </div>
                <div className="mt-3.5 border-t border-stone-100 pt-3">
                  <p className="text-xs uppercase tracking-wider text-[#9a7b45] font-semibold">Ventaja Comercial:</p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
                    Balance óptimo entre liquidez y descuento. Congelas tu unidad en piso alto con bonificación preferencial y abonas el 40% restante contra entrega formal de llaves en {EURODESIGN_DELIVERY}.
                  </p>
                </div>
              </div>

              {/* Opción 3: 40% Inicial / 20% Obra / 40% Saldo */}
              <div
                onClick={() => setSelectedPlan("cuotas")}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm hover:border-[#9a7b45]/40 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-stone-100 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-600">
                      Entrada Cómoda
                    </span>
                    <h3 className="mt-2 font-serif text-xl text-stone-900">3. Inicial 40% + 20% Obra + 40% Entrega</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-light text-stone-900">$1.580 <span className="text-xs font-sans text-stone-500">USD/m²</span></p>

                  </div>
                </div>
                <div className="mt-3.5 border-t border-stone-100 pt-3">
                  <p className="text-xs uppercase tracking-wider text-[#9a7b45] font-semibold">Ventaja Comercial:</p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
                    El menor desembolso de entrada para asegurar tu departamento en Equipetrol Norte. Desembolso inicial del 40% a la firma del contrato (menos los USD {formatEurodesignUsd(EURODESIGN_CONFIG.reservaUsd)} de reserva), 20% en cuotas durante obra fina y 40% contra entrega de llaves (apto crédito bancario).
                  </p>
                </div>
              </div>
            </div>

            {/* Caja de transición a Disponibilidad */}
            <div className="mt-8 rounded-2xl border border-stone-200 bg-[#fbf9f4] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-serif text-lg font-medium text-stone-900">
                  ¿Quieres ver el monto exacto de tu departamento?
                </p>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  Selecciona tu tipología y piso en el cotizador interactivo en tiempo real.
                </p>
              </div>
              <button
                type="button"
                onClick={() => scrollToSection("disponibilidad")}
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-[#816127] transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Elegir departamento y cotizar</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Cronograma de hitos */}
            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 text-xs space-y-3">
              <p className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] text-[#9a7b45]">
                Cronograma de Desembolsos
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-stone-600">
                <div>
                  <strong className="text-stone-900 block font-semibold">Hito 1 · Hoy:</strong>
                  Reserva formal con USD {formatEurodesignUsd(EURODESIGN_CONFIG.reservaUsd)} para congelar unidad y precio de preventa.
                </div>
                <div>
                  <strong className="text-stone-900 block font-semibold">Hito 2 · A la firma:</strong>
                  Integración de la cuota inicial a la firma del contrato de preventa (descontando los USD 1.000).
                </div>
                <div>
                  <strong className="text-stone-900 block font-semibold">Hito 3 · {EURODESIGN_DELIVERY}:</strong>
                  Saldo contra entrega definitiva de llaves (apto para crédito bancario o fondos propios).
                </div>
              </div>
            </div>
          </section>

          {/* 8. DISPONIBILIDAD EN TIEMPO REAL & COTIZADOR CASCADA (APPLE STORE STYLE) */}
          <section id="disponibilidad" ref={disponibilidadRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-[#9a7b45]" />
                <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                  Disponibilidad en Vivo
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-400 font-light">
                  {lastPriceUpdateText}
                </span>
                <button
                  type="button"
                  onClick={handleRefreshInventory}
                  disabled={isRefreshingInv}
                  className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] font-medium text-stone-700 shadow-2xs hover:bg-stone-50 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={11} className={isRefreshingInv ? "animate-spin text-[#9a7b45]" : ""} />
                  Actualizar
                </button>
              </div>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Cotiza y reserva tu departamento en tiempo real.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Selecciona tu tipología y el piso disponible. Las unidades se reservan formalmente con <strong>USD {formatEurodesignUsd(EURODESIGN_CONFIG.reservaUsd)}</strong> congelando el precio de preventa.
            </p>

            {/* PASO 1: MODELO Y VISTA PREVIA */}
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Paso 1: Encuentra tu modelo
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {AMBIENTE_OPTIONS.map((amb) => {
                  const isSel = selectedAmbId === amb.id;
                  return (
                    <button
                      key={amb.id}
                      type="button"
                      onClick={() => { setSelectedAmbId(amb.id); setSelectedQuoteModelId(""); }}
                      aria-pressed={isSel}
                      className={`min-h-11 rounded-full border px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        isSel
                          ? "border-[#9a7b45] bg-[#9a7b45]/10 shadow-sm ring-1 ring-[#9a7b45]"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                      }`}
                    >
                      {amb.shortName}
                    </button>
                  );
                })}
              </div>
              {quoteModel ? (
                <div
                  role="region"
                  aria-roledescription="carrusel"
                  aria-label="Modelos para cotizar"
                  tabIndex={0}
                  className="mt-4 touch-pan-y overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm focus-visible:outline-2 focus-visible:outline-[#9a7b45]"
                  onTouchStart={(event) => { quoteTouch.current = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }; }}
                  onTouchEnd={(event) => finishCarouselSwipe(event, quoteTouch, moveQuoteModel)}
                  onTouchCancel={() => { quoteTouch.current = null; }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                      event.preventDefault();
                      moveQuoteModel(event.key === "ArrowRight" ? 1 : -1);
                    }
                  }}
                >
                  <div className="flex items-center gap-1 border-b border-stone-100 px-2 py-3">
                    <button type="button" onClick={() => moveQuoteModel(-1)} disabled={quoteModels.length < 2} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-800 hover:bg-stone-50 disabled:opacity-30" aria-label="Tipología anterior"><ChevronLeft size={22} /></button>
                    <div className="min-w-0 flex-1 text-center" aria-live="polite" aria-atomic="true">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#816127]">{quoteModelIndex + 1} / {quoteModels.length} · {currentAmbiente.shortName}</p>
                      <h3 className="mt-1 font-serif text-xl text-stone-900">{quoteModel.name}</h3>
                      <p className="mt-0.5 text-xs text-stone-500">{quoteModel.area}</p>
                      <p className="mt-1 text-sm font-semibold text-[#816127]">
                        {quoteAvailableUnits.length
                          ? `Desde USD ${formatEurodesignUsd(Math.min(...quoteAvailableUnits.map((unit) => unit.cashTotal)))}`
                          : "Sin unidades disponibles"}
                      </p>
                    </div>
                    <button type="button" onClick={() => moveQuoteModel(1)} disabled={quoteModels.length < 2} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-800 hover:bg-stone-50 disabled:opacity-30" aria-label="Tipología siguiente"><ChevronRight size={22} /></button>
                  </div>
                  <div className="flex h-[240px] items-center justify-center bg-white px-4 py-3 sm:h-[280px]">
                    <motion.img key={quoteModel.id} src={quoteModel.preview} alt={`${quoteModel.name} · ${quoteModel.area}, vista del interior`} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} loading="lazy" className="h-full w-full object-contain" />
                  </div>
                  <div className="border-t border-stone-100 px-4 py-2 text-center">
                    <button type="button" onClick={() => setZoomPlanImage(quoteModel.full)} className="inline-flex min-h-11 items-center justify-center gap-2 text-xs font-semibold text-[#816127] hover:text-stone-900">
                      <Maximize2 size={14} /> Ver ficha completa
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-500">No hay modelos disponibles para esta categoría.</p>
              )}
            </div>

            {/* PASO 2: PISO Y UNIDAD */}
            <div className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Paso 2: Elige el piso de {quoteModel?.name || "tu modelo"}
                </p>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Disponible
                  </span>
                  <span className="flex items-center gap-1 text-stone-400">
                    <span className="h-2 w-2 rounded-full bg-stone-300" /> Vendido
                  </span>
                </div>
              </div>

              <button type="button" onClick={() => setZoomPlanImage("/eurodesign/plano-distribucion.jpg")} className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-[#816127] hover:text-stone-900"><Layers size={14} /> Ver distribución del edificio</button>

              <div className="mt-3 flex flex-wrap gap-2">
                {floorsForAmbiente.map((item) => {
                  const isSel = selectedFloor === item.floor;
                  const label = item.floor === 0 ? "PB" : `Piso ${item.floor}`;

                  if (!item.isAvailable) {
                    return (
                      <div
                        key={item.floor}
                        className="rounded-xl border border-stone-200 bg-stone-100/60 px-3.5 py-2 text-center text-xs text-stone-400 cursor-not-allowed"
                        title={`${label}: Unidades reservadas o vendidas`}
                      >
                        <span className="font-bold">{label}</span>
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
                      <span className="font-bold">{label}</span>
                      <span className="block text-[9px] font-medium opacity-90">
                        {item.unit?.unitNumber ? `Unidad ${item.unit.unitNumber}` : `${item.availableCount} disp.`}
                      </span>
                    </button>
                  );
                })}
              </div>
              {quoteModel && !quoteAvailableUnits.length && (
                <p className="mt-3 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600">Este modelo no tiene unidades disponibles. Desliza a otro modelo para encontrar tu departamento.</p>
              )}
            </div>

            {/* PASO 3: PARQUEO O BAULERA OPCIONAL (PRECIOS OFICIALES AUDITADOS) */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Paso 3: ¿Deseas incluir Parqueo o Baulera? (Opcional)
                </p>
                <span className="text-[11px] text-stone-400 font-light">Subsuelo privado</span>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setParkingOption("none")}
                  className={`rounded-2xl border p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    parkingOption === "none"
                      ? "border-[#9a7b45] bg-[#9a7b45]/15 ring-1 ring-[#9a7b45]"
                      : "border-stone-200 bg-white hover:border-stone-300 text-stone-800"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-stone-900">Sin Adicionales</span>
                    <p className="text-[11px] text-stone-500 font-light mt-0.5">Solo departamento</p>
                  </div>
                  <p className="font-serif text-sm font-bold text-stone-900 mt-2">+ USD 0</p>
                </button>

                <button
                  type="button"
                  onClick={() => setParkingOption("parking")}
                  className={`rounded-2xl border p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    parkingOption === "parking"
                      ? "border-[#9a7b45] bg-[#9a7b45]/15 ring-1 ring-[#9a7b45]"
                      : "border-stone-200 bg-white hover:border-stone-300 text-stone-800"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-stone-900">Parqueo Subsuelo</span>
                    <p className="text-[11px] text-stone-500 font-light mt-0.5">1 vehículo cubierto</p>
                  </div>
                  <p className="font-serif text-sm font-bold text-[#816127] mt-2">+ USD {formatEurodesignUsd(EURODESIGN_PARKING_USD)}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setParkingOption("baulera")}
                  className={`rounded-2xl border p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    parkingOption === "baulera"
                      ? "border-[#9a7b45] bg-[#9a7b45]/15 ring-1 ring-[#9a7b45]"
                      : "border-stone-200 bg-white hover:border-stone-300 text-stone-800"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-stone-900">Baulera Privada</span>
                    <p className="text-[11px] text-stone-500 font-light mt-0.5">Depósito individual</p>
                  </div>
                  <p className="font-serif text-sm font-bold text-[#816127] mt-2">+ USD {formatEurodesignUsd(EURODESIGN_BAULERA_USD)}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setParkingOption("parking_baulera")}
                  className={`rounded-2xl border p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    parkingOption === "parking_baulera"
                      ? "border-[#9a7b45] bg-[#9a7b45]/15 ring-1 ring-[#9a7b45]"
                      : "border-stone-200 bg-white hover:border-stone-300 text-stone-800"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-stone-900">Parqueo + Baulera</span>
                    <p className="text-[11px] text-stone-500 font-light mt-0.5">Vehicular + depósito</p>
                  </div>
                  <p className="font-serif text-sm font-bold text-[#816127] mt-2">+ USD {formatEurodesignUsd(EURODESIGN_PARKING_USD + EURODESIGN_BAULERA_USD)}</p>
                </button>
              </div>
            </div>

            {/* PASO 4: MODALIDAD FINANCIERA */}
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Paso 4: Modalidad Financiera
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlan("contado")}
                  className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                    selectedPlan === "contado"
                      ? "border-[#9a7b45] bg-stone-900 text-white shadow-sm"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                  }`}
                >
                  <p className="text-xs font-bold">Pago al Contado (100%)</p>
                  <p className="text-[10px] opacity-80 mt-0.5">{activeUnit ? `USD ${formatEurodesignUsd(activeUnit.cashPerM2)}/m² · Mayor descuento` : "Selecciona un modelo disponible"}</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlan("cuotas")}
                  className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                    selectedPlan === "cuotas"
                      ? "border-[#9a7b45] bg-stone-900 text-white shadow-sm"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                  }`}
                >
                  <p className="text-xs font-bold">Plan en Cuotas Preventa</p>
                  <p className="text-[10px] opacity-80 mt-0.5">{activeUnit ? `USD ${formatEurodesignUsd(activeUnit.cuotas.perM2)}/m² · 40% inicial / 20% obra / 40% entrega` : "Selecciona un modelo disponible"}</p>
                </button>
              </div>

              {/* Tarjeta de Resumen Financiero Total */}
              {activeFinancials && activeUnit && (
                <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="grid grid-cols-1 gap-3 border-b border-stone-100 pb-4 sm:grid-cols-3">
                    <div className="flex flex-col justify-between">
                      <div className="min-h-[28px] flex items-end">
                        <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold leading-tight">
                          Inversión Total
                        </p>
                      </div>
                      <div className="mt-1">
                        <p className="font-serif text-lg sm:text-2xl font-bold text-stone-900 leading-tight">
                          <span className="block">USD</span>
                          <span className="block mt-0.5">{formatEurodesignUsd(activeFinancials.totalPrice)}</span>
                        </p>
                        <p className="text-[10px] text-stone-500 font-mono mt-1">
                          USD {formatEurodesignUsd(activeFinancials.pricePerM2)} / m²
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div className="min-h-[28px] flex items-end">
                        <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold leading-tight">
                          Cuota Inicial ({selectedPlan === "contado" ? "100%" : "40%"})
                        </p>
                      </div>
                      <div className="mt-1">
                        <p className="font-serif text-lg sm:text-2xl font-bold text-[#816127] leading-tight">
                          <span className="block">USD</span>
                          <span className="block mt-0.5">{formatEurodesignUsd(activeFinancials.initialPayment)}</span>
                        </p>
                        <p className="text-[10px] text-stone-500 mt-1">
                          A la firma del contrato
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div className="min-h-[28px] flex items-end">
                        <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold leading-tight">
                          Saldo contra Entrega
                        </p>
                      </div>
                      <div className="mt-1">
                        {activeFinancials.balancePayment > 0 ? (
                          <>
                            <p className="font-serif text-lg sm:text-2xl font-bold text-stone-900 leading-tight">
                              <span className="block">USD</span>
                              <span className="block mt-0.5">{formatEurodesignUsd(activeFinancials.balancePayment)}</span>
                            </p>
                            <p className="text-[10px] text-stone-500 mt-1">
                              En {EURODESIGN_DELIVERY}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-serif text-lg sm:text-2xl font-bold text-stone-400 leading-tight">
                              <span className="block">USD</span>
                              <span className="block mt-0.5">—</span>
                            </p>
                            <p className="text-[10px] text-stone-400 mt-1">
                              Sin saldo pendiente
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* PASO 5: BOTÓN DE RESERVA WHATSAPP */}
                  <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-stone-500 font-light">
                      Reserva formal con <strong>USD {formatEurodesignUsd(EURODESIGN_CONFIG.reservaUsd)}</strong> para congelar la unidad {activeUnit.unitNumber} en {activeUnit.floorLabel}.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        const planLabel = `${selectedPlan === "contado" ? "Pago al Contado" : "Plan en Cuotas"} (USD ${formatEurodesignUsd(activeFinancials.pricePerM2)}/m²)`;
                        const parkingText =
                          parkingOption === "parking"
                            ? "Con Parqueo Cubierto (+USD 12.500)"
                            : parkingOption === "baulera"
                            ? "Con Baulera Privada (+USD 2.500)"
                            : parkingOption === "parking_baulera"
                            ? "Con Parqueo + Baulera (+USD 15.000)"
                            : "Sin adicionales";
                        const msg = `Hola, vengo directo de N.I.A para reservar en Tower Eurodesign: Unidad ${activeUnit.unitNumber} en ${activeUnit.floorLabel} (${activeUnit.tipoLabel} - ${activeUnit.areaM2} m²), ${parkingText}, Inversión Total USD ${formatEurodesignUsd(activeFinancials.totalPrice)}, Modalidad ${planLabel}. Cuento con los USD ${formatEurodesignUsd(EURODESIGN_CONFIG.reservaUsd)} para congelar la unidad hoy.`;
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
          <section id="cierre" ref={closeRef} className="mt-20 scroll-mt-6 border-t border-stone-200 pt-12 text-center">
            <ShieldCheck size={28} className="mx-auto text-[#9a7b45]" />
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a7b45]">
              Nuestro legado · {EURODESIGN_CONFIG.builder} · Entrega {EURODESIGN_DELIVERY}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Asegura tu departamento con obra gruesa al 100% en Equipetrol Norte.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm font-light leading-relaxed text-stone-600">
              Ingresa al valor de preventa más competitivo ($1.480 USD/m²) con visitas a obra habilitadas los martes y viernes. Asesoramiento directo sin comisiones extras.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  const msg = `Hola, quiero coordinar una visita a obra para conocer Tower Eurodesign en Equipetrol Norte. ¿Qué días y horarios tienen disponibles?`;
                  reserve(msg);
                }}
                className="bg-stone-900 px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-xl transition-all hover:bg-[#9a7b45] active:scale-95"
              >
                <span className="inline-flex items-center gap-2"><Calendar size={15} /> Agendar Visita a Obra</span>
              </button>
              <a
                href={EURODESIGN_CONFIG.brochurePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download="Brochure_Tower_Eurodesign.pdf"
                className="inline-flex items-center gap-2 border border-stone-300 bg-white px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-stone-800 shadow-sm transition-all hover:bg-stone-100"
              >
                <Download size={15} className="text-[#9a7b45]" />
                Descargar Brochure
              </a>
            </div>
          </section>

        </div>
      </div>

      {activeSectionId !== "cierre" && (
      <div className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-3 border-t border-stone-200 bg-[#f7f5f0]/95 px-5 py-3 backdrop-blur-md md:left-[44%]">
        <div>
          <p className="text-xs text-stone-600">
            Reserva con <span className="font-semibold text-stone-900">USD {formatEurodesignUsd(EURODESIGN_CONFIG.reservaUsd)}</span>
          </p>
          <p className="hidden text-[10px] font-medium text-[#9a7b45] sm:block">Congela el precio de preventa hoy</p>
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 border border-stone-300 bg-white px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-800 shadow-sm transition-all hover:bg-stone-100 active:scale-95"
        >
          {shareFeedback ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
          <span className="hidden sm:inline">Compartir</span>
        </button>
      </div>
      )}

      {/* BURBUJA FLOTANTE DE NAVEGACIÓN RÁPIDA ENTRE SECCIONES */}
      <AnimatePresence>
        {showFloatingNav && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 z-[125] sm:right-6 md:right-8"
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => setFloatingNavOpen((prev) => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-900/95 text-white shadow-2xl backdrop-blur-md border border-white/15 transition-all hover:bg-black hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Menú de Secciones"
                title="Navegar secciones del proyecto"
              >
                {floatingNavOpen ? (
                  <X size={18} className="text-[#e8d5a8]" />
                ) : (
                  <Menu size={18} className="text-[#e8d5a8]" />
                )}
              </button>

              <AnimatePresence>
                {floatingNavOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute bottom-12 right-0 w-64 rounded-2xl border border-stone-200 bg-white/95 p-2 shadow-2xl backdrop-blur-md"
                  >
                    <div className="px-3 py-2 border-b border-stone-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#9a7b45]">
                        Navegación Rápida
                      </span>
                      <button
                        type="button"
                        onClick={() => setFloatingNavOpen(false)}
                        className="text-stone-400 hover:text-stone-700"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="mt-1 space-y-0.5">
                      {SECTIONS_NAV.map((sec) => {
                        const Icon = sec.icon;
                        const isCurrent = activeSectionId === sec.id;
                        return (
                          <button
                            key={sec.id}
                            type="button"
                            onClick={() => scrollToSection(sec.id)}
                            className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                              isCurrent
                                ? "bg-stone-900 text-white font-semibold"
                                : "text-stone-700 hover:bg-stone-100"
                            }`}
                          >
                            <Icon size={14} className={isCurrent ? "text-[#e8d5a8]" : "text-[#9a7b45]"} />
                            <div className="flex-1 truncate">
                              <p className="truncate">{sec.label}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* MODAL DE ZOOM DE PLANO EN ALTA RESOLUCIÓN */}
      <AnimatePresence>
        {zoomPlanImage && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="relative max-h-[92vh] max-w-5xl w-full overflow-hidden rounded-3xl border border-stone-700 bg-white p-4">
              <button
                type="button"
                onClick={() => setZoomPlanImage(null)}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white hover:bg-[#9a7b45] transition cursor-pointer"
                aria-label="Cerrar imagen"
              >
                <X size={20} />
              </button>
              <div className="flex max-h-[82vh] items-start justify-center overflow-auto p-1 sm:p-2">
                <img
                  src={zoomPlanImage}
                  alt="Imagen ampliada"
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
