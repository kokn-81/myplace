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
  Zap,
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
    image: "/eurodesign/modelo-04-1d-48m2.jpg",
    code: "M04",
    description:
      "Distribución espacial optimizada con cocina americana, living luminoso, balcón hacia Equipetrol y dormitorio máster con vestidor.",
    pills: ["Balcón aterrazado", "Cocina con cuarzo", "Vestidor máster", "Aire acondicionado"],
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
    image: "/eurodesign/modelo-01-2d-82m2.jpg",
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
    image: "/eurodesign/page-32-locales-comerciales.jpg",
    code: "PB-COM",
    description:
      "Vitrinas comerciales de alto impacto peatonal y vehicular en planta baja. Ideal para cafeterías de especialidad, boutiques o firmas corporativas.",
    pills: ["Doble altura", "Vitrina vidriada", "Acceso directo", "Alto tráfico Equipetrol"],
    matchUnit: (u) => u.floor === 0 || u.unitNumber.toLowerCase().includes("local") || u.unitNumber.toLowerCase().includes("pb"),
  },
];

const EQUIPMENT_SECTIONS = [
  {
    id: "cocina",
    title: "Cocina & Sala de Estar",
    subtitle: "Diseño europeo de concepto abierto y equipamiento empotrado",
    image: "/eurodesign/amenities/amenity_living_panoramico.jpg",
    items: [
      "Mesón importado de cuarzo blanco de alta densidad",
      "Cocina encimera & campana extractora de acero inoxidable instaladas",
      "Bacha de lavaplatos & grifería monocomando níquel cepillada",
      "Cajonería alta y baja en melamina europea con cantos de PVC",
      "Pisos de porcelanato rectificado de gran formato",
      "Aire acondicionado inverter instalado sin costo adicional",
      "Cerradura digital inteligente de acceso biométrico",
    ],
  },
  {
    id: "dormitorio",
    title: "Dormitorio Máster & Suites",
    subtitle: "Confort térmico y vestidores completos de piso a techo",
    image: "/eurodesign/page-10.jpg",
    items: [
      "Ropero empotrado de melamina europea con cajonería y divisiones internas",
      "Walking closet en master suites",
      "Pisos de porcelanato de alta resistencia",
      "Equipo de aire acondicionado inverter instalado",
      "Ventanales de piso a techo con perfiles de aluminio acústico",
      "Puntos de iluminación cálida indirecta y tomas USB integradas",
    ],
  },
  {
    id: "bano",
    title: "Baños Completos",
    subtitle: "Box de vidrio templado y grifería monocomando",
    image: "/eurodesign/amenities/amenity_lobby_lounge.jpg",
    items: [
      "Box de baño con paño fijo y puerta de vidrio templado de seguridad",
      "Mesón importado de cuarzo con bacha embutida",
      "Ducha y grifería monocomando de níquel cepillado",
      "Inodoro ecológico de doble descarga de bajo consumo",
      "Mueble inferior suspendido con cajonería oculta",
      "Espejo panorámico iluminado y extractor de aire instalado",
      "Revestimiento cerámico completo de piso a techo",
    ],
  },
];

export default function EurodesignLanding({ property, onClose }: Props) {
  const [activeImage, setActiveImage] = useState("/eurodesign/fachada-principal.jpg");
  const [activeLabel, setActiveLabel] = useState("Fachada Principal");
  const [amenityIndex, setAmenityIndex] = useState(0);

  // Estados del cotizador en cascada (estilo Apple Store)
  const [selectedAmbId, setSelectedAmbId] = useState<string>("1dorm");
  const [selectedFloor, setSelectedFloor] = useState<number>(4);
  const [selectedPlan, setSelectedPlan] = useState<"contado" | "cuotas">("contado");
  const [includeParking, setIncludeParking] = useState<boolean>(false);

  const [showAdvisorInsights, setShowAdvisorInsights] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [units, setUnits] = useState<EurodesignUnit[]>(EURODESIGN_UNITS);
  const [isRefreshingInv, setIsRefreshingInv] = useState(false);
  const [lastPriceUpdateText, setLastPriceUpdateText] = useState<string>("Sincronizado");

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
    { id: "equipamiento", label: "Equipamiento", icon: CheckCircle2, hint: "100% Equipado llave en mano" },
    { id: "constructora", label: "Constructora", icon: ShieldCheck, hint: "Desarrollo Eurodesign · Sede Platinum" },
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

  const unitsInAmbiente = useMemo(
    () => units.filter(currentAmbiente.matchUnit),
    [units, currentAmbiente]
  );

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
  }, [selectedAmbId, floorsForAmbiente]);

  const activeUnit = useMemo(() => {
    return (
      unitsInAmbiente.find((u) => u.floor === selectedFloor && u.status === "disponible") ||
      unitsInAmbiente.find((u) => u.floor === selectedFloor) ||
      unitsInAmbiente[0]
    );
  }, [unitsInAmbiente, selectedFloor]);

  // Cálculos financieros
  const activeFinancials = useMemo(() => {
    if (!activeUnit) return null;
    const baseTotal = selectedPlan === "contado" ? activeUnit.cashTotal : activeUnit.cuotas.total;
    const parkingExtra = includeParking ? EURODESIGN_PARKING_USD : 0;
    const totalPrice = baseTotal + parkingExtra;
    const pricePerM2 = selectedPlan === "contado" ? activeUnit.cashPerM2 : activeUnit.cuotas.perM2;

    const initialPayment =
      selectedPlan === "contado"
        ? totalPrice
        : Math.round(activeUnit.cuotas.initial40 + (includeParking ? EURODESIGN_PARKING_USD * 0.4 : 0));

    const balancePayment =
      selectedPlan === "contado"
        ? 0
        : Math.round(activeUnit.cuotas.balance40 + (includeParking ? EURODESIGN_PARKING_USD * 0.4 : 0));

    const marketValueAtDelivery = Math.round(activeUnit.areaM2 * 2100) + (includeParking ? 15000 : 0);
    const capitalGain = Math.max(0, marketValueAtDelivery - totalPrice);
    const gainPercentage = Math.round((capitalGain / totalPrice) * 100);

    return {
      totalPrice,
      baseTotal,
      parkingExtra,
      pricePerM2,
      initialPayment,
      balancePayment,
      marketValueAtDelivery,
      capitalGain,
      gainPercentage,
    };
  }, [activeUnit, selectedPlan, includeParking]);

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
      intro: { src: "/eurodesign/fachada-principal.jpg", label: "Fachada Principal" },
      lugar: { src: "/eurodesign/ubicacion.jpg", label: "Ubicación Equipetrol Norte" },
      amenidades: { src: "/eurodesign/amenities/amenity_piscina_skybar.jpg", label: "Piscina Panorámica Piso 18" },
      tipologias: { src: "/eurodesign/amenities/amenity_living_panoramico.jpg", label: "Master Suite & Living" },
      equipamiento: { src: "/eurodesign/page-10.jpg", label: "Terminaciones Europeas" },
      constructora: { src: "/eurodesign/amenities/amenity_lobby_recepcion.jpg", label: "Lobby Doble Altura" },
      pago: { src: "/eurodesign/fachada-principal.jpg", label: "Estructura de Compra" },
      disponibilidad: { src: "/eurodesign/page-01-portada.jpg", label: "Disponibilidad en Vivo" },
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
          type="button"
          onClick={() => setShowAdvisorInsights(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-900 shadow-xl backdrop-blur transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Modo Asesor (Insights Privados)"
          aria-label="Insights Asesor"
        >
          <TrendingUp size={18} className="text-[#9a7b45]" />
        </button>

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
            src={activeImage}
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
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300 backdrop-blur-md">
              <HardHat size={11} className="text-emerald-400" />
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
                {EURODESIGN_DELIVERY} (Fase Final)
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
                La oportunidad de ingresar en preventa desde <strong>$1.480 USD/m²</strong> con obra gruesa consolidada en losa 18 asegura el máximo margen de plusvalía frente al valor de mercado terminado ($2.100 USD/m²) con entrega formal en {EURODESIGN_DELIVERY}.
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
              <img
                src="/eurodesign/page-05.jpg"
                alt="Mapa satelital de ubicación de Tower Eurodesign en Equipetrol Norte"
                className="h-64 sm:h-80 w-full object-cover"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-stone-100 p-4 text-xs">
                <div>
                  <p className="font-semibold text-stone-900">A 2 min · Patio Design</p>
                  <p className="text-stone-500 font-light">Gastronomía y boulevard</p>
                </div>
                <div>
                  <p className="font-semibold text-stone-900">A 3 min · Ventura Mall</p>
                  <p className="text-stone-500 font-light">Cines y retail financiero</p>
                </div>
                <div>
                  <p className="font-semibold text-stone-900">A 4 min · Manzana 40 & Hoteles</p>
                  <p className="text-stone-500 font-light">Marriott y Los Tajibos</p>
                </div>
              </div>

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
              Espacios concebidos para alta rotación y confort superior.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Desde departamentos confortables de 1 dormitorio pensados para rentas en Airbnb hasta residencias familiares de 2 dormitorios máster y locales comerciales de doble altura.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {AMBIENTE_OPTIONS.map((amb) => {
                const isSelected = selectedAmbId === amb.id;
                let displayPrice = amb.basePrice;
                if (amb.id === "1dorm") displayPrice = minPrice1Dorm;
                else if (amb.id === "2dorm") displayPrice = minPrice2Dorms;

                return (
                  <div
                    key={amb.id}
                    onClick={() => {
                      setSelectedAmbId(amb.id);
                    }}
                    className={`rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-[#9a7b45] bg-[#9a7b45]/5 shadow-md ring-1 ring-[#9a7b45]"
                        : "border-stone-200 bg-white hover:border-[#9a7b45]/50 hover:shadow-sm"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#9a7b45]">
                          {amb.name}
                        </span>
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-mono text-stone-600">
                          {amb.areaRange}
                        </span>
                      </div>
                      <p className="mt-3 font-serif text-2xl font-bold text-stone-900">
                        Desde USD {formatEurodesignUsd(displayPrice)}
                      </p>
                      <p className="mt-1 text-xs text-stone-500 font-light">
                        {amb.id === "1dorm"
                          ? "Suite privada · Walking closet · Balcón terraza"
                          : amb.id === "2dorm"
                          ? "Master suite + dormitorio · 2 Baños · Living espacioso"
                          : "Vitrinas comerciales · Doble altura · Alto tráfico"}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-stone-500 font-normal">Planta oficial {amb.name}</span>
                      <span className={`inline-flex items-center gap-1 font-semibold ${isSelected ? "text-stone-900" : "text-[#9a7b45]"}`}>
                        {isSelected ? "Plano activo abajo ✓" : "Ver plano arquitectónico →"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Visualización interactiva del Plano Arquitectónico */}
            {currentAmbiente && (() => {
              const ambKeys = AMBIENTE_OPTIONS.map((a) => a.id);
              const currentIdx = ambKeys.indexOf(selectedAmbId);
              const prevAmbKey = ambKeys[(currentIdx - 1 + ambKeys.length) % ambKeys.length];
              const nextAmbKey = ambKeys[(currentIdx + 1) % ambKeys.length];

              return (
                <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm transition-all">
                  <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[#9a7b45] px-2 py-0.5 text-[11px] font-bold text-white tracking-wider">
                          PLANTA {currentAmbiente.code}
                        </span>
                        <span className="font-serif text-lg font-medium text-stone-900">
                          {currentAmbiente.name}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-stone-500 font-light">
                        Superficie: <strong className="font-semibold text-stone-800">{currentAmbiente.areaRange}</strong> · Plano oficial Tower Eurodesign
                      </p>
                    </div>
                    {/* Botones para pasar de una imagen a otra sin mover de sección */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAmbId(prevAmbKey)}
                        className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50 active:scale-95 cursor-pointer shadow-2xs"
                        title="Ver plano anterior"
                      >
                        <ChevronLeft size={14} />
                        Anterior
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedAmbId(nextAmbKey)}
                        className="inline-flex items-center gap-1 rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#9a7b45] active:scale-95 cursor-pointer shadow-2xs"
                        title="Ver siguiente plano"
                      >
                        Siguiente
                        <ChevronRight size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoomPlanImage(currentAmbiente.image)}
                        className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 active:scale-95 cursor-pointer"
                        title="Ver en pantalla completa"
                      >
                        <Maximize2 size={13} /> Ver HD
                      </button>
                    </div>
                  </div>

                  <div className="relative aspect-[16/9] w-full bg-stone-50 flex items-center justify-center overflow-hidden p-4 group">
                    <img
                      src={currentAmbiente.image}
                      alt={`Plano arquitectónico tipología ${currentAmbiente.name}`}
                      className="max-h-full max-w-full object-contain"
                    />

                    {/* Flechas superpuestas para pasar de imagen */}
                    <button
                      type="button"
                      onClick={() => setSelectedAmbId(prevAmbKey)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-stone-700 shadow-md backdrop-blur-xs transition opacity-80 hover:opacity-100 hover:bg-white active:scale-95 cursor-pointer"
                      aria-label="Plano anterior"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAmbId(nextAmbKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-stone-700 shadow-md backdrop-blur-xs transition opacity-80 hover:opacity-100 hover:bg-white active:scale-95 cursor-pointer"
                      aria-label="Plano siguiente"
                    >
                      <ChevronRight size={18} />
                    </button>

                    {/* Indicadores de plano / puntos */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-stone-900/40 backdrop-blur-xs px-2.5 py-1 rounded-full">
                      {AMBIENTE_OPTIONS.map((amb) => (
                        <button
                          key={amb.id}
                          type="button"
                          onClick={() => setSelectedAmbId(amb.id)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            selectedAmbId === amb.id ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                          }`}
                          title={amb.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 bg-stone-50/60 border-t border-stone-100">
                    <p className="text-xs text-stone-600 font-light leading-relaxed">
                      {currentAmbiente.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {currentAmbiente.pills.map((pill, idx) => (
                        <span key={idx} className="rounded-md bg-white border border-stone-200/80 px-2 py-0.5 text-[11px] font-light text-stone-700">
                          ✓ {pill}
                        </span>
                      ))}
                    </div>
                  </div>
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
              Entrega llave en mano con materiales de estándar europeo.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              En Tower Eurodesign cada departamento se entrega completamente terminado y equipado: cajonería completa en melamina europea con cantos de PVC, mesones de cuarzo blanco, climatización instalada y cerraduras biométricas de acceso digital.
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {EQUIPMENT_SECTIONS.map((sec) => (
                <div
                  key={sec.id}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 w-full overflow-hidden bg-stone-100">
                      <img
                        src={sec.image}
                        alt={sec.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-lg font-semibold text-stone-900">{sec.title}</h3>
                      <p className="mt-0.5 text-xs text-stone-500 font-light">{sec.subtitle}</p>

                      <ul className="mt-4 space-y-2 border-t border-stone-100 pt-3 text-xs text-stone-700 font-light">
                        {sec.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a7b45]" />
                            <span className="[text-align:justify] [text-justify:inter-word]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
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
                Garantía &amp; Respaldo Institucional
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Desarrollado con rigor técnico y supervisión de ingeniería sismorresistente.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              {EURODESIGN_CONFIG.builder} se distingue por la precisión estructural y la estética contemporánea en Santa Cruz. Con sede en Equipetrol, cada desarrollo se construye bajo estrictos controles de calidad de hormigón armado, estudios de mecánica de suelos y doble certificación hidrosanitaria y eléctrica.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9a7b45]/10 text-[#9a7b45]">
                  <HardHat size={20} />
                </div>
                <h3 className="mt-3 font-serif text-lg font-semibold text-stone-900">
                  Obra Gruesa Consolidada
                </h3>
                <p className="mt-1.5 text-xs font-light text-stone-600 leading-relaxed [text-align:justify] [text-justify:inter-word]">
                  Hormigonado estructural al 100% en losa piso 18. Cero riesgo de ejecución en cimientos o fundaciones.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9a7b45]/10 text-[#9a7b45]">
                  <Zap size={20} />
                </div>
                <h3 className="mt-3 font-serif text-lg font-semibold text-stone-900">
                  Diseño Bioclimático
                </h3>
                <p className="mt-1.5 text-xs font-light text-stone-600 leading-relaxed [text-align:justify] [text-justify:inter-word]">
                  Fachadas con celosías acústicas y ventanales térmicos que reducen la radiación solar y el gasto en aire acondicionado.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9a7b45]/10 text-[#9a7b45]">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="mt-3 font-serif text-lg font-semibold text-stone-900">
                  Garantía Post-Venta
                </h3>
                <p className="mt-1.5 text-xs font-light text-stone-600 leading-relaxed [text-align:justify] [text-justify:inter-word]">
                  Póliza de garantía quinquenal en estructura portante y servicio de acompañamiento técnico post-entrega.
                </p>
              </div>
            </div>
          </section>

          {/* 7. ESTRUCTURA DE COMPRA & FORMAS DE PAGO */}
          <section id="pago" ref={payRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Estructura de Compra &amp; Financiación
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Planes claros: $1.480 USD/m² al contado o cuotas durante obra.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              En Tower Eurodesign tu dinero rinde más asegurando una plusvalía de hasta el 41% frente al precio terminado ($2.100 USD/m²) con entrega formal en {EURODESIGN_DELIVERY}.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Plan Contado */}
              <div className="rounded-3xl border border-stone-900 bg-stone-900 p-6 text-white shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#9a7b45] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Máxima Rentabilidad
                    </span>
                    <span className="font-serif text-xl font-bold text-[#e8d5a8]">$1.480 USD/m²</span>
                  </div>
                  <h3 className="mt-3 font-serif text-2xl text-white">Pago al Contado (100%)</h3>
                  <p className="mt-2 text-xs font-light text-stone-300 leading-relaxed [text-align:justify] [text-justify:inter-word]">
                    Aseguras el valor por m² más competitivo de todo Equipetrol Norte. Ahorras hasta USD 10.000 frente al plan en cuotas y aseguras el máximo margen de plusvalía con obra gruesa ya terminada en piso 18.
                  </p>
                </div>
                <div className="mt-6 border-t border-white/10 pt-4">
                  <p className="text-xs text-stone-400 font-light">
                    Reserva formal con <strong>USD 1.000</strong> para congelar precio.
                  </p>
                </div>
              </div>

              {/* Plan Cuotas */}
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">
                      Flexibilidad de Flujo
                    </span>
                    <span className="font-serif text-xl font-bold text-stone-900">$1.580 USD/m²</span>
                  </div>
                  <h3 className="mt-3 font-serif text-2xl text-stone-900">Plan Preventa en Cuotas</h3>
                  <p className="mt-2 text-xs font-light text-stone-600 leading-relaxed [text-align:justify] [text-justify:inter-word]">
                    Desembolso inicial del 40% a la firma del contrato (menos los $1.000 de reserva), 20% distribuido en cuotas programadas durante la fase de obra fina y 40% saldo contra entrega en {EURODESIGN_DELIVERY} (apto crédito bancario).
                  </p>
                </div>
                <div className="mt-6 border-t border-stone-100 pt-4">
                  <p className="text-xs text-stone-500 font-light">
                    Apto crédito hipotecario bancario para el saldo final.
                  </p>
                </div>
              </div>
            </div>

            {/* Tarjeta de Parqueos */}
            <div className="mt-6 rounded-2xl border border-stone-200 bg-white/70 p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-stone-900">Parqueos Cubiertos en Subsuelo</p>
                <p className="text-[11px] text-stone-500 font-light">Espacios vehiculares asignados con acceso automatizado</p>
              </div>
              <p className="font-serif text-xl font-bold text-stone-900">
                USD {formatEurodesignUsd(EURODESIGN_PARKING_USD)}
              </p>
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

            {/* PASO 1: AMBIENTE */}
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Paso 1: Elige el Tipo de Inmueble
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {AMBIENTE_OPTIONS.map((amb) => {
                  const isSel = selectedAmbId === amb.id;
                  return (
                    <button
                      key={amb.id}
                      type="button"
                      onClick={() => setSelectedAmbId(amb.id)}
                      className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                        isSel
                          ? "border-[#9a7b45] bg-[#9a7b45]/10 shadow-sm ring-1 ring-[#9a7b45]"
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
                    <span className="h-2 w-2 rounded-full bg-stone-300" /> Vendido
                  </span>
                </div>
              </div>

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
                        {item.availableCount} disp.
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PASO 3: PARQUEO OPCIONAL */}
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Paso 3: ¿Deseas incluir Parqueo en Subsuelo?
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIncludeParking(false)}
                  className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                    !includeParking
                      ? "border-[#9a7b45] bg-stone-900 text-white shadow-sm"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                  }`}
                >
                  <p className="text-xs font-bold">Sin Parqueo</p>
                  <p className="text-[10px] opacity-80 mt-0.5">Solo departamento</p>
                </button>
                <button
                  type="button"
                  onClick={() => setIncludeParking(true)}
                  className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                    includeParking
                      ? "border-[#9a7b45] bg-stone-900 text-white shadow-sm"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                  }`}
                >
                  <p className="text-xs font-bold">Parqueo Cubierto Subsuelo (+USD {formatEurodesignUsd(EURODESIGN_PARKING_USD)})</p>
                  <p className="text-[10px] opacity-80 mt-0.5">Espacio asignado con acceso automatizado</p>
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
                  <p className="text-[10px] opacity-80 mt-0.5">$1.480 USD/m² · Mayor descuento</p>
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
                  <p className="text-[10px] opacity-80 mt-0.5">$1.580 USD/m² · 40% inicial / 20% obra / 40% entrega</p>
                </button>
              </div>

              {/* Tarjeta de Resumen Financiero Total */}
              {activeFinancials && activeUnit && (
                <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-stone-100 pb-4">
                    <div className="flex flex-col justify-between">
                      <div className="min-h-[28px] flex items-end">
                        <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold leading-tight">
                          Inversión Total
                        </p>
                      </div>
                      <div className="mt-1">
                        <p className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                          USD {formatEurodesignUsd(activeFinancials.totalPrice)}
                        </p>
                        <p className="text-[10px] text-stone-500 font-mono mt-0.5">
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
                        <p className="font-serif text-xl sm:text-2xl font-bold text-[#816127]">
                          USD {formatEurodesignUsd(activeFinancials.initialPayment)}
                        </p>
                        <p className="text-[10px] text-stone-500 mt-0.5">
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
                            <p className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                              USD {formatEurodesignUsd(activeFinancials.balancePayment)}
                            </p>
                            <p className="text-[10px] text-stone-500 mt-0.5">
                              En {EURODESIGN_DELIVERY}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-serif text-xl sm:text-2xl font-bold text-stone-400">
                              —
                            </p>
                            <p className="text-[10px] text-stone-400 mt-0.5">
                              Sin saldo pendiente
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div className="min-h-[28px] flex items-end">
                        <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold leading-tight">
                          Plusvalía Proyectada
                        </p>
                      </div>
                      <div className="mt-1">
                        <p className="font-serif text-xl sm:text-2xl font-bold text-emerald-600">
                          +USD {formatEurodesignUsd(activeFinancials.capitalGain)}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                          +{activeFinancials.gainPercentage}% en dólares
                        </p>
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
                        const planLabel = selectedPlan === "contado" ? "Pago al Contado ($1.480 USD/m²)" : "Plan en Cuotas ($1.580 USD/m²)";
                        const parkingText = includeParking ? "Con Parqueo Cubierto (+USD 12.500)" : "Sin parqueo";
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
          <section id="cierre" ref={closeRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="rounded-3xl border border-stone-200 bg-gradient-to-br from-stone-900 to-black p-6 sm:p-8 text-white shadow-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#e8d5a8]">
                  Garantía &amp; Respaldo · {EURODESIGN_CONFIG.builder}
                </span>
                <span className="text-xs text-emerald-400 font-medium">
                  Entrega {EURODESIGN_DELIVERY}
                </span>
              </div>

              <h3 className="mt-3 font-serif text-2xl sm:text-3xl text-white">
                Asegura tu departamento con obra gruesa al 100% en Equipetrol Norte.
              </h3>

              <p className="mt-3 text-sm text-stone-300 font-light leading-relaxed [text-align:justify] [text-justify:inter-word]">
                Ingresa al valor de preventa más competitivo ($1.480 USD/m²) con visitas a obra habilitadas los martes y viernes. Asesoramiento directo sin comisiones extras.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const msg = `Hola, quiero coordinar una visita a obra para conocer Tower Eurodesign en Equipetrol Norte. ¿Qué días y horarios tienen disponibles?`;
                    reserve(msg);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#9a7b45] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[#816127] active:scale-95 cursor-pointer"
                >
                  <Calendar size={15} />
                  <span>Agendar Visita a Obra</span>
                </button>

                <a
                  href={EURODESIGN_CONFIG.brochurePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="Brochure_Tower_Eurodesign.pdf"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur transition-all hover:bg-white/20 active:scale-95 cursor-pointer"
                >
                  <Download size={15} />
                  <span>Descargar Brochure</span>
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* BURBUJA FLOTANTE DE NAVEGACIÓN RÁPIDA ENTRE SECCIONES */}
      <AnimatePresence>
        {showFloatingNav && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[125]"
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

      {/* DRAWER / MODAL DEL MODO ASESOR (INSIGHTS PRIVADOS) */}
      <AnimatePresence>
        {showAdvisorInsights && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-h-[90vh] max-w-2xl w-full overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setShowAdvisorInsights(false)}
                className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition"
                aria-label="Cerrar modal de asesor"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#9a7b45]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#9a7b45]">
                  Uso Exclusivo Asesores NIA
                </span>
                <span className="text-xs text-stone-500 font-light">Confidencial</span>
              </div>

              <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-light text-stone-900">
                Insights &amp; Argumentario Comercial · Tower Eurodesign
              </h2>

              <div className="mt-6 space-y-4 text-xs text-stone-700">
                {/* 1. VENTAJAS COMERCIALES CLAVE */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <p className="font-semibold text-emerald-900 uppercase tracking-wider text-[11px]">
                    1. Ventajas Comerciales Clave (Qué destacar)
                  </p>
                  <ul className="mt-2 space-y-1.5 font-light leading-relaxed text-stone-700">
                    <li>• <strong>Obra gruesa 100% finalizada (losa 18):</strong> Cero riesgo de excavación o fundaciones. Estructura portante concluida en su totalidad.</li>
                    <li>• <strong>Ubicación AAA en calle Enrique Finot:</strong> A 3 cuadras de Ventura Mall y Manzana 40, en el eje corporativo y comercial más cotizado de Santa Cruz.</li>
                    <li>• <strong>Equipamiento de estándar europeo:</strong> Porcelanato importado, grifería empotrada y carpintería de aluminio hermética.</li>
                  </ul>
                </div>

                {/* 2. DESVENTAJAS TRANSPARENTES Y MANEJO DE OBJECIONES */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                  <p className="font-semibold text-amber-900 uppercase tracking-wider text-[11px]">
                    2. Desventajas Transparentes &amp; Manejo de Objeciones
                  </p>
                  <div className="mt-2 space-y-2 font-light leading-relaxed text-stone-700">
                    <div>
                      <strong className="text-stone-900">• Objeción: &quot;¿Qué pasa si se demora la entrega?&quot;</strong>
                      <p className="mt-0.5 text-stone-600 [text-align:justify]">
                        <strong>Respuesta:</strong> Toda la estructura ya está erigida. Los trabajos actuales se concentran en tabiquería interna e instalaciones. Las visitas a obra están habilitadas martes y viernes con cita previa para verificar el avance.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. ESCENARIO FINANCIERO ESTIMADO (DESPUÉS DE PROS Y CONTRAS) */}
                <div className="rounded-2xl border border-stone-200 bg-[#fbf9f4] p-4">
                  <div className="flex items-center justify-between border-b border-stone-200/80 pb-2 mb-3">
                    <p className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                      3. Escenario Financiero Estimado · Plusvalía &amp; Alquileres de Referencia
                    </p>
                    <span className="text-[10px] bg-stone-200/80 text-stone-700 px-2 py-0.5 rounded-full font-medium">
                      Proyección orientativa
                    </span>
                  </div>

                  <p className="font-light leading-relaxed [text-align:justify]">
                    El valor de preventa arranca en <strong>$1.480 USD/m² al contado</strong> frente a un precio de mercado terminado en Equipetrol Norte de <strong>$2.100 USD/m²</strong>, lo que proyecta hasta un <strong>41% de plusvalía bruta</strong> al momento de entrega en {EURODESIGN_DELIVERY}.
                  </p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="rounded-xl border border-stone-200/80 bg-white p-2.5 text-center">
                      <span className="text-[10px] text-stone-500 uppercase block">1 Dormitorio</span>
                      <strong className="text-xs text-stone-900 font-mono mt-0.5 block">USD 550 – 700/mes</strong>
                      <span className="text-[10px] text-emerald-700">Retorno est.: ~10,2%–11,4%</span>
                    </div>
                    <div className="rounded-xl border border-stone-200/80 bg-white p-2.5 text-center">
                      <span className="text-[10px] text-stone-500 uppercase block">2 Dormitorios</span>
                      <strong className="text-xs text-stone-900 font-mono mt-0.5 block">USD 900 – 1.200/mes</strong>
                      <span className="text-[10px] text-emerald-700">Retorno est.: ~10,5%–11,8%</span>
                    </div>
                    <div className="rounded-xl border border-stone-200/80 bg-white p-2.5 text-center">
                      <span className="text-[10px] text-stone-500 uppercase block">3 Dormitorios / PH</span>
                      <strong className="text-xs text-stone-900 font-mono mt-0.5 block">USD 1.400 – 1.700/mes</strong>
                      <span className="text-[10px] text-emerald-700">Retorno est.: ~11,5%–13%</span>
                    </div>
                  </div>

                  {/* Disclaimer de Transparencia NIA */}
                  <div className="mt-3 rounded-xl border border-stone-300/80 bg-white/80 p-3 text-[11px] text-stone-600 font-light leading-relaxed">
                    <strong className="font-semibold text-stone-800">Nota de Cumplimiento &amp; Transparencia NIA:</strong> Los valores de plusvalía y alquiler proyectados son estimaciones analíticas basadas en el comportamiento histórico de la zona y valores de mercado vigentes. <strong>No constituyen una promesa o garantía contractual de rentabilidad fija</strong>. El rendimiento real dependerá de la tasa de ocupación, calidad de amoblado, régimen de expensas y gestión operativa del propietario.
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAdvisorInsights(false)}
                  className="rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-black transition"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
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
                aria-label="Cerrar plano"
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
