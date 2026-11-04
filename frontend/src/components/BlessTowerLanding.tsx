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
  BLESS_TOWER_BASELINE_UNITS,
  BLESS_TOWER_CONFIG,
  BLESS_TOWER_PLANO_MAP,
  BlessTowerUnit,
  fetchBlessTowerLiveUnits,
  formatBlessUsd,
  parseBlessTowerCsv,
} from "../blessTowerInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

const AMENITY_SLIDES = [
  {
    src: "/bless_tower/social_1.jpg",
    category: "Piscina en Rooftop",
    title: "Piscina Panorámica en el Nivel 30",
    description:
      "Piscina sinfín con vista abierta de 360° sobre toda la ciudad de Santa Cruz. Un oasis en las alturas diseñado para desconectar con el atardecer.",
  },
  {
    src: "/bless_tower/social_2.jpg",
    category: "Área Gourmet",
    title: "Doble Churrasquera & Lounge Social",
    description:
      "Espacios de parrilla completamente equipados con mesones de granito, mobiliario de diseño y terrazas semicubiertas para tus celebraciones.",
  },
  {
    src: "/bless_tower/social_3.jpg",
    category: "Fitness & Bienestar",
    title: "Gimnasio Panorámico de Alta Gama",
    description:
      "Área de cardio y fuerza con máquinas profesionales y vista panorámica. Entrena con la mejor iluminación natural sin salir de tu edificio.",
  },
  {
    src: "/bless_tower/interior_1.jpg",
    category: "Productividad",
    title: "Co-Work Climatizado de Alta Productividad",
    description:
      "Ambiente corporativo con estaciones individuales, sala de reuniones y conexión de alta velocidad. Trabaja o atiende clientes con total comodidad.",
  },
  {
    src: "/bless_tower/fachada_2.jpg",
    category: "Acceso & Seguridad",
    title: "Lobby de Doble Altura con Seguridad 24/7",
    description:
      "Ingreso imponente con concierge permanente, cerraduras digitales y circuito cerrado de cámaras para darte total tranquilidad y prestigio.",
  },
];

const TYPOLOGIES_DATA = [
  {
    id: "mono",
    title: "Monoambientes Inteligentes",
    area: "28,5 a 38,4 m²",
    image: "/bless_tower/modelos_pages/page_2.jpg",
    cashPrice: 43026,
    tagline:
      "Distribución ultraeficiente ideal para inversión de alta rotación, renta en Airbnb o primera vivienda independiente.",
    highlights: [
      "Ambiente integrado con excelente entrada de luz natural",
      "Cocina americana con cajonería y mesón de granito",
      "Baño completo con box de vidrio templado",
      "Aires acondicionados instalados y cerradura inteligente",
    ],
  },
  {
    id: "1d",
    title: "1 Dormitorio Ejecutivo",
    area: "41,3 a 63,1 m²",
    image: "/bless_tower/modelos_pages/page_3.jpg",
    cashPrice: 58000,
    tagline:
      "Espacios amplios y suite independiente, pensados para ejecutivos, parejas y nómadas digitales exigentes.",
    highlights: [
      "Dormitorio máster privado con ropero empotrado a medida",
      "Living-comedor social conectado a terraza panorámica",
      "Cocina de concepto abierto con barra desayunadora",
      "Máxima rentabilidad y plusvalía en el eje norte de la ciudad",
    ],
  },
  {
    id: "2d",
    title: "2 Dormitorios Confort & Suite",
    area: "76,2 a 87,4 m²",
    image: "/bless_tower/modelos_pages/page_8.jpg",
    cashPrice: 110000,
    tagline:
      "El equilibrio perfecto entre privacidad familiar y vida urbana premium con 2 habitaciones completas.",
    highlights: [
      "Suite principal con vestidor y baño privado independiente",
      "Segundo dormitorio con ropero empotrado y baño compartido",
      "Living espacioso con vista despejada a la Av. Cristo Redentor",
      "Lavandería y servicios completamente independizados",
    ],
  },
];

const EQUIPAMIENTO_SLIDES = [
  {
    id: "cocina",
    room: "COCINA",
    title: "Cocina Equipada con Acabados Finos",
    tagline: "Mobiliario a medida y equipamiento funcional",
    image: "/bless_tower/interior_3.jpg",
    items: [
      "Muebles superiores e inferiores en melamina de alto tráfico",
      "Mesón de granito chiquitano pulido de gran resistencia",
      "Cocina encimera vitrocerámica y campana extractora instaladas",
      "Bacha de acero inoxidable y grifería monocomando premium",
    ],
  },
  {
    id: "dormitorio",
    room: "DORMITORIO",
    title: "Dormitorio Principal Climatizado",
    tagline: "Confort térmico y almacenamiento optimizado",
    image: "/bless_tower/interior_2.jpg",
    items: [
      "Equipo de aire acondicionado split inverter instalado",
      "Ropero empotrado con divisiones internas y cajonería a medida",
      "Piso de porcelanato esmaltado de alto tránsito",
      "Carpintería de aluminio anodizado con aislamiento acústico",
    ],
  },
  {
    id: "bano",
    room: "BAÑO",
    title: "Baños Contemporáneos Completos",
    tagline: "Grifería alta, box de vidrio y espejo",
    image: "/bless_tower/interior_1.jpg",
    items: [
      "Box de ducha con vidrio templado de piso a techo",
      "Mueble de baño flotante con mesón de granito",
      "Sanitarios y griferías monomando de primera línea",
      "Revestimiento cerámico integral de fácil mantenimiento",
    ],
  },
  {
    id: "seguridad",
    room: "ACCESO & TECNOLOGÍA",
    title: "Cerraduras Inteligentes y Servicios Listos",
    tagline: "Seguridad digital y confort en todo momento",
    image: "/bless_tower/fachada_3.jpg",
    items: [
      "Cerradura digital inteligente (huella, código y tarjeta)",
      "Termotanque / calefón instalado para agua caliente continua",
      "Instalaciones eléctricas listas para internet de fibra óptica",
      "Ascensores de alta velocidad de última generación",
    ],
  },
];

interface AmbienteOption {
  id: string;
  name: string;
  shortName: string;
  tipologia: "Monoambiente" | "1 Dormitorio" | "2 Dormitorios";
  areaRange: string;
  basePrice: number;
  matchUnit: (u: BlessTowerUnit) => boolean;
}

const AMBIENTE_OPTIONS: AmbienteOption[] = [
  {
    id: "mono",
    name: "Monoambiente",
    shortName: "Monoambiente · 28 a 38 m²",
    tipologia: "Monoambiente",
    areaRange: "28,5 a 38,4 m²",
    basePrice: 43026,
    matchUnit: (u) => u.tipologia === "Monoambiente",
  },
  {
    id: "1d",
    name: "1 Dormitorio",
    shortName: "1 Dormitorio · 41 a 63 m²",
    tipologia: "1 Dormitorio",
    areaRange: "41,3 a 63,1 m²",
    basePrice: 58000,
    matchUnit: (u) => u.tipologia === "1 Dormitorio",
  },
  {
    id: "2d",
    name: "2 Dormitorios",
    shortName: "2 Dormitorios · 76 a 87 m²",
    tipologia: "2 Dormitorios",
    areaRange: "76,2 a 87,4 m²",
    basePrice: 110000,
    matchUnit: (u) => u.tipologia === "2 Dormitorios",
  },
];

export default function BlessTowerLanding({ property, onClose }: Props) {
  // Estado de imágenes y secciones
  const [activeSection, setActiveSection] = useState<string>("intro");
  const [amenityIndex, setAmenityIndex] = useState(0);
  const [equipIndex, setEquipIndex] = useState(0);
  const [selectedTypologyId, setSelectedTypologyId] = useState<string>("mono");
  const [showHdPlanModal, setShowHdPlanModal] = useState(false);
  const [showAdvisorInsights, setShowAdvisorInsights] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  // Inventario en vivo
  const [units, setUnits] = useState<BlessTowerUnit[]>(BLESS_TOWER_BASELINE_UNITS);
  const [isRefreshingInv, setIsRefreshingInv] = useState(false);
  const [lastPriceUpdateText, setLastPriceUpdateText] = useState<string>("Sincronizado");

  // Cotizador interactivo (5 pasos)
  const [selectedAmbId, setSelectedAmbId] = useState<string>("mono");
  const [selectedFloor, setSelectedFloor] = useState<number>(2);
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>("");
  const [includeParking, setIncludeParking] = useState(false);
  const [parkingOption, setParkingOption] = useState<"simple" | "combo">("simple");
  const [paymentPlan, setPaymentPlan] = useState<"contado" | "plan40" | "plan30">("contado");

  const editorialScrollRef = useRef<HTMLDivElement>(null);

  // Sincronización en vivo inicial
  useEffect(() => {
    fetchBlessTowerLiveUnits().then((res) => {
      if (res && res.length > 0) {
        setUnits(res);
        setLastPriceUpdateText("Sincronizado en vivo");
      }
    });
  }, []);

  const handleRefreshInventory = async () => {
    setIsRefreshingInv(true);
    try {
      const res = await fetch(BLESS_TOWER_CONFIG.sheetCsvUrl + "&_t=" + Date.now());
      if (res.ok) {
        const text = await res.text();
        const parsed = parseBlessTowerCsv(text);
        if (parsed.length > 0) {
          setUnits(parsed);
          const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setLastPriceUpdateText(`Actualizado ${timeStr}`);
        }
      }
    } catch (err) {
      console.warn("Error refrescando inventario Bless Tower:", err);
    } finally {
      setIsRefreshingInv(false);
    }
  };

  const availableUnits = useMemo(() => units.filter((u) => u.estado === "LIBRE"), [units]);
  const soldUnitsCount = units.filter((u) => u.estado === "VENDIDO" || u.estado === "RESERVADO").length;

  const minPriceMono = useMemo(() => {
    const list = availableUnits.filter((u) => u.tipologia === "Monoambiente" && u.precioContado > 0);
    return list.length > 0 ? Math.min(...list.map((u) => u.precioContado)) : 43026;
  }, [availableUnits]);

  const minPrice1Dorm = useMemo(() => {
    const list = availableUnits.filter((u) => u.tipologia === "1 Dormitorio" && u.precioContado > 0);
    return list.length > 0 ? Math.min(...list.map((u) => u.precioContado)) : 58000;
  }, [availableUnits]);

  const minPrice2Dorms = useMemo(() => {
    const list = availableUnits.filter((u) => u.tipologia === "2 Dormitorios" && u.precioContado > 0);
    return list.length > 0 ? Math.min(...list.map((u) => u.precioContado)) : 110000;
  }, [availableUnits]);

  const minCashPerM2 = useMemo(() => {
    const list = availableUnits.filter((u) => u.precioContado > 0 && u.superficieM2 > 0);
    if (list.length === 0) return 1450;
    return Math.min(...list.map((u) => Math.round(u.precioContado / u.superficieM2)));
  }, [availableUnits]);

  const currentAmbiente = useMemo(() => {
    return AMBIENTE_OPTIONS.find((a) => a.id === selectedAmbId) || AMBIENTE_OPTIONS[0];
  }, [selectedAmbId]);

  // Pisos para el ambiente seleccionado
  const floorsForAmbiente = useMemo(() => {
    const matching = units.filter((u) => currentAmbiente.matchUnit(u));
    const floorNums = Array.from(new Set(matching.map((u) => u.pisoNumero))).sort((a, b) => a - b);

    return floorNums.map((floor) => {
      const unitsOnFloor = matching.filter((u) => u.pisoNumero === floor);
      const availableUnitsOnFloor = unitsOnFloor.filter((u) => u.estado === "LIBRE");
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

  // Selección automática de piso disponible
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

  // Unidades en el piso seleccionado
  const unitsInSelectedFloor = useMemo(() => {
    return units.filter((u) => currentAmbiente.matchUnit(u) && u.pisoNumero === selectedFloor);
  }, [units, currentAmbiente, selectedFloor]);

  // Unidad activa para el cotizador
  const activeUnit = useMemo(() => {
    if (selectedUnitCode) {
      const found = unitsInSelectedFloor.find((u) => u.codigo === selectedUnitCode);
      if (found) return found;
    }
    const firstLibre = unitsInSelectedFloor.find((u) => u.estado === "LIBRE");
    return firstLibre || unitsInSelectedFloor[0] || null;
  }, [unitsInSelectedFloor, selectedUnitCode]);

  // Opcional de Parqueo
  const parkingPrice = useMemo(() => {
    if (!includeParking) return 0;
    return parkingOption === "combo" ? 15000 : 12000;
  }, [includeParking, parkingOption]);

  // Cálculos financieros
  const activeFinancials = useMemo(() => {
    if (!activeUnit) return null;

    let unitTotalPrice = activeUnit.precioContado;
    let cuotaInicialPct = 100;
    let cuotaInicial = unitTotalPrice;
    let saldoContraEntrega = 0;

    if (paymentPlan === "plan40") {
      unitTotalPrice = activeUnit.precioCuotas || Math.round(activeUnit.precioContado * 1.08);
      cuotaInicialPct = 40;
      cuotaInicial = Math.round(unitTotalPrice * 0.4);
      saldoContraEntrega = unitTotalPrice - cuotaInicial;
    } else if (paymentPlan === "plan30") {
      unitTotalPrice = activeUnit.precioLista || Math.round(activeUnit.precioContado * 1.15);
      cuotaInicialPct = 30;
      cuotaInicial = Math.round(unitTotalPrice * 0.3);
      saldoContraEntrega = unitTotalPrice - cuotaInicial;
    }

    const hasParking = includeParking;
    const parkingInitial = !hasParking
      ? 0
      : paymentPlan === "contado"
      ? parkingPrice
      : paymentPlan === "plan40"
      ? Math.round(parkingPrice * 0.4)
      : Math.round(parkingPrice * 0.3);
    const parkingBalance = !hasParking ? 0 : parkingPrice - parkingInitial;

    const totalPrice = unitTotalPrice + parkingPrice;
    const initialPayment = cuotaInicial + parkingInitial;
    const balancePayment = saldoContraEntrega + parkingBalance;

    const pricePerM2 = activeUnit.superficieM2 > 0 ? Math.round(unitTotalPrice / activeUnit.superficieM2) : 1500;
    const marketValueAtDelivery = Math.round(activeUnit.superficieM2 * 2100) + (hasParking ? Math.round(parkingPrice * 1.15) : 0);
    const capitalGain = Math.max(1000, marketValueAtDelivery - totalPrice);
    const gainPercentage = Math.max(1, Math.round((capitalGain / totalPrice) * 100));

    return {
      unitTotalPrice,
      totalPrice,
      cuotaInicialPct,
      initialPayment,
      balancePayment,
      pricePerM2,
      capitalGain,
      gainPercentage,
      reserva: BLESS_TOWER_CONFIG.reservaUsd,
    };
  }, [activeUnit, paymentPlan, includeParking, parkingPrice]);

  // Sincronización visual del panel izquierdo al hacer scroll
  useEffect(() => {
    const el = editorialScrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const sections = ["intro", "lugar", "amenidades", "tipologias", "equipamiento", "constructora", "pago", "disponibilidad", "cierre"];
      for (const s of sections) {
        const secEl = document.getElementById(s);
        if (secEl) {
          const rect = secEl.getBoundingClientRect();
          if (rect.top <= 260 && rect.bottom >= 120) {
            setActiveSection(s);
            break;
          }
        }
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setShowSectionMenu(false);
    const secEl = document.getElementById(id);
    if (secEl) {
      secEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/bless-tower`;
    const shareTitle = "Bless Tower · 30 Niveles de Lujo en Av. Cristo Redentor";
    const shareText = `Torre de 30 niveles con rooftop panorámico y piscina sinfín en Av. Cristo Redentor desde USD ${formatBlessUsd(minPriceMono)}. Conoce Bless Tower:`;

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
      ? ` + ${parkingOption === "combo" ? "Parqueo + Baulera" : "Parqueo Simple"}`
      : " (Sin parqueo)";
    const planInfo =
      paymentPlan === "contado"
        ? "Plan Al Contado (100%)"
        : paymentPlan === "plan40"
        ? "Plan 40% en Cuotas + 60% contra entrega"
        : "Plan 30% Inicial + 70% contra entrega";

    const text = `Hola, vengo de N.I.A y deseo reservar en BLESS TOWER:\n\n• ${unitInfo}${parkingInfo}\n• Modalidad: ${planInfo}\n• Inversión Total: USD ${formatBlessUsd(activeFinancials?.totalPrice || minPriceMono)}\n• Cuota Inicial: USD ${formatBlessUsd(activeFinancials?.initialPayment || minPriceMono)}\n\n¿Me confirman la disponibilidad oficial y los pasos para asegurar la unidad con la reserva de USD ${formatBlessUsd(BLESS_TOWER_CONFIG.reservaUsd)}?`;

    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  // Imagen de fondo dinámica para el panel izquierdo
  const dynamicBackdropImage = useMemo(() => {
    switch (activeSection) {
      case "lugar":
        return "/bless_tower/fachada_2.jpg";
      case "amenidades":
        return "/bless_tower/social_1.jpg";
      case "tipologias":
        return "/bless_tower/interior_1.jpg";
      case "equipamiento":
        return "/bless_tower/interior_3.jpg";
      case "constructora":
        return "/bless_tower/fachada_3.jpg";
      case "pago":
        return "/bless_tower/fachada_2.jpg";
      case "disponibilidad":
      case "cierre":
        return "/bless_tower/social_2.jpg";
      default:
        return "/bless_tower/fachada_principal.jpg";
    }
  }, [activeSection]);

  const currentTypology = TYPOLOGIES_DATA.find((t) => t.id === selectedTypologyId) || TYPOLOGIES_DATA[0];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-[#F8F3E7] text-[#1C1917] overflow-hidden font-sans">
      {/* ========================================================
          1. CONTROLES SUPERIORES FLOTANTES (4 ICONOS LIMPIOS)
          ======================================================== */}
      <div className="fixed right-4 top-4 md:right-7 md:top-7 z-[120] flex items-center gap-2">
        <button
          onClick={() => setShowAdvisorInsights(true)}
          className="h-10 w-10 rounded-full bg-white/95 backdrop-blur border border-stone-200 shadow-xl flex items-center justify-center text-[#9A7B45] hover:bg-stone-50 transition-all hover:scale-105"
          title="Insights de Asesor (Datos Privados)"
          aria-label="Insights Asesor"
        >
          <TrendingUp size={18} />
        </button>

        <a
          href={BLESS_TOWER_CONFIG.brochurePdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 w-10 rounded-full bg-white/95 backdrop-blur border border-stone-200 shadow-xl flex items-center justify-center text-[#9A7B45] hover:bg-stone-50 transition-all hover:scale-105"
          title="Descargar Brochure Oficial en PDF"
          aria-label="Descargar Brochure"
        >
          <Download size={18} />
        </a>

        <button
          onClick={handleShare}
          className="h-10 w-10 rounded-full bg-white/95 backdrop-blur border border-stone-200 shadow-xl flex items-center justify-center text-stone-800 hover:bg-stone-50 transition-all hover:scale-105"
          title="Compartir enlace directo"
          aria-label="Compartir"
        >
          {shareFeedback ? <Check size={18} className="text-emerald-600" /> : <Share2 size={18} />}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-white/95 backdrop-blur border border-stone-200 shadow-xl flex items-center justify-center text-stone-700 hover:bg-stone-50 transition-all hover:scale-105"
            title="Cerrar y volver al mapa"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ========================================================
          2. PANEL IZQUIERDO: ESCENOGRAFÍA DINÁMICA (44% Desktop)
          ======================================================== */}
      <div className="w-full md:w-[44%] h-[42vh] md:h-full relative flex flex-col justify-between bg-stone-950 text-white shrink-0 overflow-hidden select-none">
        <AnimatePresence mode="wait">
          <motion.img
            key={dynamicBackdropImage}
            src={dynamicBackdropImage}
            alt="Bless Tower"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.82]"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 pointer-events-none" />

        {/* Top Info */}
        <div className="relative z-10 p-6 md:p-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#E8D5A8]/20 text-[#E8D5A8] border border-[#E8D5A8]/30 backdrop-blur-md">
            <Sparkles size={12} />
            Preventa Exclusiva · 30 Niveles · {BLESS_TOWER_CONFIG.zone}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-light tracking-tight mt-3 text-white">
            Bless Tower
          </h1>
          <p className="text-stone-300 text-xs md:text-sm mt-1 max-w-sm">
            Av. Cristo Redentor entre 2° y 3° Anillo · Santa Cruz de la Sierra
          </p>
        </div>

        {/* Middle Badge Cards */}
        <div className="relative z-10 p-6 md:p-8 space-y-3">
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <div className="p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
              <p className="text-[10px] text-stone-400 uppercase tracking-wider">Constructora</p>
              <p className="text-xs md:text-sm font-semibold text-white mt-0.5 flex items-center gap-1">
                <Building2 size={13} className="text-[#C19A6B]" />
                {BLESS_TOWER_CONFIG.builder}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
              <p className="text-[10px] text-stone-400 uppercase tracking-wider">Entrega</p>
              <p className="text-xs md:text-sm font-semibold text-white mt-0.5">
                {BLESS_TOWER_CONFIG.delivery}
              </p>
            </div>
          </div>

          {/* Tarjeta inferior de precios dinámicos */}
          <div className="p-4 rounded-xl bg-black/55 backdrop-blur-md border border-white/15 max-w-sm">
            <div className="flex items-center justify-between text-[11px] text-stone-300 pb-2 border-b border-white/10">
              <span className="font-semibold text-[#E8D5A8]">Precios Preventa en Vivo</span>
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Oficial Sheet
              </span>
            </div>
            <div className="mt-2.5 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-stone-300">Monoambiente (28 a 38 m²):</span>
                <span className="font-serif font-bold text-white">Desde USD {formatBlessUsd(minPriceMono)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-300">1 Dormitorio (41 a 63 m²):</span>
                <span className="font-serif font-bold text-white">Desde USD {formatBlessUsd(minPrice1Dorm)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-300">2 Dormitorios (76 a 87 m²):</span>
                <span className="font-serif font-bold text-white">Desde USD {formatBlessUsd(minPrice2Dorms)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. PANEL DERECHO EDITORIAL (56% Desktop)
          ======================================================== */}
      <div
        ref={editorialScrollRef}
        className="w-full md:w-[56%] h-[58vh] md:h-full overflow-y-auto px-5 py-8 md:px-12 md:py-14 space-y-16 lg:space-y-24 scroll-smooth"
      >
        {/* ----------------------------------------------------
            SECCIÓN 1: #intro (Hero, tesis & menú de navegación)
            ---------------------------------------------------- */}
        <section id="intro" className="space-y-6 pt-2">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9A7B45]">
              <Sparkles size={13} />
              Experiencia Residencial & Preventa
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-light text-[#1C1917] leading-tight">
              Vive en <span className="italic font-normal">Bless Tower.</span>
            </h2>
            <p className="text-sm md:text-base text-[#57534E] leading-relaxed [text-align:justify] [text-justify:inter-word] pt-2">
              Una torre icónica de 30 niveles que redefine el horizonte norte de Santa Cruz de la Sierra. Emplazada estratégicamente sobre la Av. Cristo Redentor entre el 2° y 3° Anillo, Bless Tower combina arquitectura vanguardista, comodidades de hotel boutique en su rooftop con piscina sinfín y una ingeniería de acabados pensada para maximizar la plusvalía y la renta ejecutiva.
            </p>
          </div>

          {/* Tarjeta de Tracción */}
          <div className="p-4 rounded-xl bg-white border border-[#E7E5E4] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Tracción de Preventa</p>
              <p className="font-serif text-lg font-bold text-stone-900 mt-0.5">
                {soldUnitsCount} de {units.length} unidades colocadas
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Alta Demanda · Fase 1
            </span>
          </div>

          {/* Botones de acción rápida */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => scrollToSection("disponibilidad")}
              className="px-5 py-3 rounded-xl bg-[#1C1917] text-white text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition-all flex items-center gap-2 shadow-md hover:scale-[1.02]"
            >
              <Calculator size={15} />
              Ver Disponibilidad y Cotizar
            </button>
            <a
              href={BLESS_TOWER_CONFIG.brochurePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-white text-stone-800 border border-stone-200 text-xs font-semibold uppercase tracking-wider hover:bg-stone-50 transition-all flex items-center gap-2"
            >
              <Download size={15} className="text-[#9A7B45]" />
              Descargar Brochure PDF
            </a>
          </div>

          {/* Barra de Secciones Inicial */}
          <div className="pt-4 border-t border-stone-200">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2.5">
              Navegación del Proyecto
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => scrollToSection("intro")}
                className="px-3 py-1.5 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 transition-all flex items-center gap-1.5"
              >
                <Home size={12} />
                Inicio
              </button>
              <button onClick={() => scrollToSection("lugar")} className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition-all">Ubicación</button>
              <button onClick={() => scrollToSection("amenidades")} className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition-all">Áreas Sociales</button>
              <button onClick={() => scrollToSection("tipologias")} className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition-all">Tipologías</button>
              <button onClick={() => scrollToSection("equipamiento")} className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition-all">Equipamiento</button>
              <button onClick={() => scrollToSection("constructora")} className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition-all">Constructora</button>
              <button onClick={() => scrollToSection("pago")} className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition-all">Formas de Pago</button>
              <button onClick={() => scrollToSection("disponibilidad")} className="px-3 py-1.5 rounded-lg bg-[#9A7B45] text-white font-semibold hover:bg-[#816127] transition-all">Disponibilidad en Vivo</button>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------
            SECCIÓN 2: #lugar (Ubicación & Drenaje pluvial)
            ---------------------------------------------------- */}
        <section id="lugar" className="space-y-6 pt-4 border-t border-stone-200/80">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A7B45] flex items-center gap-1.5">
              <MapPin size={13} />
              Ubicación Privilegiada
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-light text-[#1C1917]">
              En el Eje Corporativo y Comercial del Norte
            </h3>
            <p className="text-sm text-[#57534E] leading-relaxed [text-align:justify] [text-justify:inter-word]">
              Ubicado sobre la Av. Cristo Redentor entre 2° y 3° Anillo, Bless Tower ofrece conectividad inmediata con los centros empresariales, universidades y clínicas de mayor prestigio en Santa Cruz de la Sierra. La zona goza de cota topográfica alta con excelente drenaje pluvial pavimentado, garantizando accesibilidad y valorización permanente.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-sm">
              <p className="font-serif text-xl font-bold text-stone-900">3 min</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Av. Cristo Redentor</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-sm">
              <p className="font-serif text-xl font-bold text-stone-900">5 min</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Equipetrol Norte</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-sm">
              <p className="font-serif text-xl font-bold text-stone-900">7 min</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Mall Las Brisas</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-sm">
              <p className="font-serif text-xl font-bold text-stone-900">12 min</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Aeropuerto Viru Viru</p>
            </div>
          </div>

          {/* Botón de Google Maps */}
          <div className="flex justify-end pt-1">
            <a
              href="https://maps.google.com/?q=-17.7665,-63.1785"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9A7B45] hover:text-[#816127] transition-colors"
            >
              <MapPin size={14} />
              Ver Ubicación en Google Maps
              <ExternalLink size={12} />
            </a>
          </div>
        </section>

        {/* ----------------------------------------------------
            SECCIÓN 3: #amenidades (Áreas Sociales con Carrusel)
            ---------------------------------------------------- */}
        <section id="amenidades" className="space-y-6 pt-4 border-t border-stone-200/80">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A7B45] flex items-center gap-1.5">
              <Sparkles size={13} />
              Áreas Sociales & Bienestar
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-light text-[#1C1917]">
              Un Club Residencial en las Alturas
            </h3>
            <p className="text-sm text-[#57534E] leading-relaxed [text-align:justify] [text-justify:inter-word]">
              Diseñadas para ofrecer una experiencia hotelera sin salir de casa. El rooftop del Piso 30 se convierte en el epicentro social de la torre con vistas sin obstáculos hacia el norte y el centro de la ciudad.
            </p>
          </div>

          {/* Carrusel de amenidades */}
          <div className="relative rounded-2xl overflow-hidden bg-stone-900 shadow-lg text-white">
            <div className="aspect-[16/10] w-full relative">
              <img
                src={AMENITY_SLIDES[amenityIndex].src}
                alt={AMENITY_SLIDES[amenityIndex].title}
                className="w-full h-full object-cover brightness-[0.88]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-5 md:p-6 space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#E8D5A8]">
                  {AMENITY_SLIDES[amenityIndex].category}
                </span>
                <h4 className="font-serif text-xl md:text-2xl font-normal text-white">
                  {AMENITY_SLIDES[amenityIndex].title}
                </h4>
                <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
                  {AMENITY_SLIDES[amenityIndex].description}
                </p>
              </div>

              {/* Botones carrusel */}
              <button
                onClick={() => setAmenityIndex((prev) => (prev > 0 ? prev - 1 : AMENITY_SLIDES.length - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-all backdrop-blur-sm"
                aria-label="Anterior amenidad"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setAmenityIndex((prev) => (prev < AMENITY_SLIDES.length - 1 ? prev + 1 : 0))}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-all backdrop-blur-sm"
                aria-label="Siguiente amenidad"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            {/* Dots */}
            <div className="flex justify-center gap-1.5 p-3 bg-stone-950">
              {AMENITY_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setAmenityIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${amenityIndex === i ? "w-6 bg-[#C19A6B]" : "w-1.5 bg-stone-700"}`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------
            SECCIÓN 4: #tipologias (Exploración arquitectónica)
            ---------------------------------------------------- */}
        <section id="tipologias" className="space-y-6 pt-4 border-t border-stone-200/80">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A7B45] flex items-center gap-1.5">
              <Layers size={13} />
              Tipologías Residenciales
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-light text-[#1C1917]">
              Plantas Diseñadas al Milímetro
            </h3>
            <p className="text-sm text-[#57534E] leading-relaxed [text-align:justify] [text-justify:inter-word]">
              Cada metro cuadrado ha sido optimizado para garantizar ventilación cruzada, entrada de luz natural y una circulación fluida. Selecciona una tipología para examinar su plano acotado sin salir de la sección.
            </p>
          </div>

          {/* Tarjetas de tipologías */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {TYPOLOGIES_DATA.map((t) => {
              const isSelected = selectedTypologyId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTypologyId(t.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-white border-[#9A7B45] shadow-md ring-1 ring-[#9A7B45]"
                      : "bg-white/80 border-stone-200 hover:border-stone-300 hover:bg-white"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{t.area}</p>
                  <h4 className="font-serif text-lg font-bold text-stone-900 mt-1">{t.title}</h4>
                  <p className="text-xs text-[#9A7B45] font-semibold mt-1">
                    Desde USD {formatBlessUsd(t.cashPrice)}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-2 line-clamp-2">{t.tagline}</p>
                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] font-semibold">
                    <span className={isSelected ? "text-[#9A7B45]" : "text-stone-400"}>
                      {isSelected ? "Plano activo abajo ✓" : "Ver plano arquitectónico →"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visor de Plano Arquitectónico 2D */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9A7B45]">Plano Arquitectónico Oficial</span>
                <h4 className="font-serif text-xl font-bold text-stone-900">{currentTypology.title}</h4>
                <p className="text-xs text-stone-500">{currentTypology.area} de superficie útil total</p>
              </div>
              <button
                onClick={() => setShowHdPlanModal(true)}
                className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-all flex items-center gap-1.5"
              >
                Ver HD
              </button>
            </div>

            <div className="aspect-[16/11] rounded-xl overflow-hidden bg-stone-50 border border-stone-100 flex items-center justify-center p-3">
              <img
                src={currentTypology.image}
                alt={currentTypology.title}
                className="max-h-full max-w-full object-contain filter drop-shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => setShowHdPlanModal(true)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-stone-100">
              {currentTypology.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-stone-600">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------
            SECCIÓN 5: #equipamiento (Equipamiento 100% incluido)
            ---------------------------------------------------- */}
        <section id="equipamiento" className="space-y-6 pt-4 border-t border-stone-200/80">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A7B45] flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              Equipamiento 100% Incluido
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-light text-[#1C1917]">
              Llave en Mano sin Costos Ocultos
            </h3>
            <p className="text-sm text-[#57534E] leading-relaxed [text-align:justify] [text-justify:inter-word]">
              En Bless Tower no tienes que presupuestar gastos adicionales en carpintería o climatización. Cada departamento se entrega completamente dotado y listo para habitar o poner en renta desde el primer día.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EQUIPAMIENTO_SLIDES.map((eq) => (
              <div key={eq.id} className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm space-y-3">
                <div className="aspect-video rounded-lg overflow-hidden bg-stone-100">
                  <img src={eq.image} alt={eq.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9A7B45]">{eq.room}</span>
                  <h4 className="font-serif text-base font-bold text-stone-900">{eq.title}</h4>
                  <p className="text-[11px] text-stone-500">{eq.tagline}</p>
                </div>
                <ul className="space-y-1.5 pt-1 border-t border-stone-100 text-xs text-stone-600">
                  {eq.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#C19A6B] font-bold">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ----------------------------------------------------
            SECCIÓN 6: #constructora (Respaldo Alta Vida)
            ---------------------------------------------------- */}
        <section id="constructora" className="space-y-6 pt-4 border-t border-stone-200/80">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A7B45] flex items-center gap-1.5">
              <Building2 size={13} />
              Respaldo y Solvencia Constructiva
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-light text-[#1C1917]">
              Alta Vida Santa Cruz
            </h3>
            <p className="text-sm text-[#57534E] leading-relaxed [text-align:justify] [text-justify:inter-word]">
              Alta Vida es una desarrolladora y constructora boliviana reconocida por la entrega de proyectos inmobiliarios de alta envergadura y calidad constructiva. Con un enfoque estricto en el cumplimiento de cronogramas y una ingeniería de obra propia, ofrece certeza jurídica y respaldo patrimonial en cada preventa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm text-center">
              <p className="font-serif text-3xl font-bold text-[#9A7B45]">30</p>
              <p className="text-xs font-semibold text-stone-900 mt-1">Niveles en Construcción</p>
              <p className="text-[11px] text-stone-500 mt-1">Hito arquitectónico en el norte de la ciudad</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm text-center">
              <p className="font-serif text-3xl font-bold text-[#9A7B45]">100%</p>
              <p className="text-xs font-semibold text-stone-900 mt-1">Ingeniería Propia</p>
              <p className="text-[11px] text-stone-500 mt-1">Control directo de obra sin intermediarios</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm text-center">
              <p className="font-serif text-3xl font-bold text-[#9A7B45]">2026</p>
              <p className="text-xs font-semibold text-stone-900 mt-1">Entrega Comprometida</p>
              <p className="text-[11px] text-stone-500 mt-1">Cronograma de avance certificado</p>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------
            SECCIÓN 7: #pago (Formas de Pago Transparentes)
            ---------------------------------------------------- */}
        <section id="pago" className="space-y-6 pt-4 border-t border-stone-200/80">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A7B45] flex items-center gap-1.5">
              <CreditCard size={13} />
              Formas de Pago Transparentes
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-light text-[#1C1917]">
              Modalidades Flexibles de Preventa
            </h3>
            <p className="text-sm text-[#57534E] leading-relaxed [text-align:justify] [text-justify:inter-word]">
              Elige el esquema financiero que mejor se adapte a tu estrategia patrimonial. Todos los planes congelan el precio de preventa desde la reserva formal.
            </p>
          </div>

          {/* Banner de precio base por m2 */}
          <div className="p-3.5 rounded-xl bg-[#FFFDF6] border border-[#E8D5A8] flex items-center justify-between text-xs">
            <span className="text-stone-700">Precio preventa oficial en vivo:</span>
            <span className="font-serif font-bold text-[#9A7B45] text-sm">Desde ${minCashPerM2} USD/m²</span>
          </div>

          {/* 3 Tarjetas apiladas horizontalmente a todo el ancho */}
          <div className="space-y-4">
            {/* Opción 1: Contado */}
            <div className="p-5 rounded-2xl bg-stone-900 text-white shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C19A6B] text-stone-950">
                  Mayor Descuento · 100% Contado
                </span>
                <span className="text-xs text-stone-400">A la firma de contrato</span>
              </div>
              <h4 className="font-serif text-xl font-bold text-white">Pago al Contado (100%)</h4>
              <p className="text-xs text-stone-300">
                Obtén la tarifa de preventa más baja y asegura la mayor plusvalía proyectada a la entrega de obra.
              </p>
              <div className="pt-2 border-t border-white/10 text-xs text-[#E8D5A8]">
                <strong className="text-white">VENTAJA COMERCIAL:</strong> Ahorro neto inmediato de hasta un 15% comparado con el precio de lista.
              </div>
            </div>

            {/* Opción 2: 40% Cuotas / 60% Saldo */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800">
                  Equilibrio Financiero · 40 / 60
                </span>
                <span className="text-xs text-stone-500">40% en obra · 60% entrega</span>
              </div>
              <h4 className="font-serif text-xl font-bold text-stone-900">40% Durante Construcción + 60% Contra Entrega</h4>
              <p className="text-xs text-stone-600">
                Distribuye el 40% durante el avance de obra y cancela el 60% restante al recibir tus llaves (apto para crédito bancario).
              </p>
              <div className="pt-2 border-t border-stone-100 text-xs text-stone-700">
                <strong className="text-stone-900">VENTAJA COMERCIAL:</strong> Excelente balance entre liquidez operativa y precio preferencial.
              </div>
            </div>

            {/* Opción 3: 30% Inicial / 70% Saldo */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800">
                  Entrada Cómoda · 30 / 70
                </span>
                <span className="text-xs text-stone-500">30% firma · 70% entrega</span>
              </div>
              <h4 className="font-serif text-xl font-bold text-stone-900">30% de Entrada + 70% Contra Entrega</h4>
              <p className="text-xs text-stone-600">
                Accede a la preventa con el desembolso inicial más bajo y financia el 70% restante con cualquier entidad bancaria a la entrega.
              </p>
              <div className="pt-2 border-t border-stone-100 text-xs text-stone-700">
                <strong className="text-stone-900">VENTAJA COMERCIAL:</strong> Menor barrera de entrada para asegurar tu unidad en pisos altos.
              </div>
            </div>
          </div>

          {/* Cronograma de hitos */}
          <div className="p-4 rounded-xl bg-white border border-stone-200 text-xs space-y-2">
            <p className="font-semibold text-stone-800 uppercase tracking-wider text-[11px]">Cronograma de Pagos</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-stone-600">
              <div><strong>Hito 1 (Hoy):</strong> Reserva de USD {formatBlessUsd(BLESS_TOWER_CONFIG.reservaUsd)} para congelar unidad y precio.</div>
              <div><strong>Hito 2 (Contrato):</strong> Integración de cuota inicial a la firma (descontando la reserva).</div>
              <div><strong>Hito 3 (Diciembre 2026):</strong> Saldo contra entrega de llaves (apto crédito bancario).</div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------
            SECCIÓN 8: #disponibilidad (Cotizador Interactivo 5 pasos)
            ---------------------------------------------------- */}
        <section id="disponibilidad" className="space-y-6 pt-4 border-t border-stone-200/80">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9A7B45] flex items-center gap-1.5">
                <Calculator size={13} />
                Disponibilidad en Vivo & Cotizador
              </span>
              <button
                onClick={handleRefreshInventory}
                disabled={isRefreshingInv}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-stone-800 transition-colors"
              >
                <RefreshCw size={11} className={isRefreshingInv ? "animate-spin" : ""} />
                {lastPriceUpdateText}
              </button>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl font-light text-[#1C1917]">
              Configura tu Departamento en Tiempo Real
            </h3>
            <p className="text-sm text-[#57534E]">
              Elige tu ambiente, selecciona un piso disponible y calcula tu plan de pagos al instante con precios oficiales.
            </p>
          </div>

          {/* Paso 1: Tipología */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Paso 1 · Elige la Tipología
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {AMBIENTE_OPTIONS.map((amb) => {
                const isSelected = selectedAmbId === amb.id;
                return (
                  <button
                    key={amb.id}
                    onClick={() => setSelectedAmbId(amb.id)}
                    className={`p-3 rounded-xl text-left transition-all border ${
                      isSelected
                        ? "bg-white border-[#9A7B45] shadow-md ring-1 ring-[#9A7B45]"
                        : "bg-white/80 border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <p className="text-xs font-bold text-stone-900">{amb.name}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">{amb.areaRange}</p>
                    <p className="text-xs font-semibold text-[#9A7B45] mt-1">
                      Desde USD {formatBlessUsd(amb.id === "mono" ? minPriceMono : amb.id === "1d" ? minPrice1Dorm : minPrice2Dorms)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paso 2: Selección de Piso */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-stone-500">
                Paso 2 · Selecciona un Piso ({floorsForAmbiente.filter((f) => f.isAvailable).length} pisos con disponibilidad)
              </span>
              <span className="text-stone-400 text-[11px]">Verde = Disponible · Gris = Agotado</span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto p-2 rounded-xl bg-white border border-stone-200">
              {floorsForAmbiente.map((f) => {
                const isCurrent = selectedFloor === f.floor;
                return (
                  <button
                    key={f.floor}
                    disabled={!f.isAvailable}
                    onClick={() => {
                      setSelectedFloor(f.floor);
                      setSelectedUnitCode("");
                    }}
                    className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all flex flex-col items-center ${
                      isCurrent
                        ? "bg-stone-900 text-white shadow-md"
                        : f.isAvailable
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-stone-100 text-stone-400 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <span>P{f.floor}</span>
                    <span className="text-[9px] font-normal">{f.isAvailable ? `${f.availableCount} disp` : "Agotado"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unidades en el piso */}
          {unitsInSelectedFloor.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Unidades en Piso {selectedFloor}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {unitsInSelectedFloor.map((u) => {
                  const isSelected = activeUnit?.codigo === u.codigo;
                  const isLibre = u.estado === "LIBRE";
                  return (
                    <button
                      key={u.id}
                      disabled={!isLibre}
                      onClick={() => setSelectedUnitCode(u.codigo)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                          : isLibre
                          ? "bg-white border-stone-200 hover:border-stone-300 text-stone-900"
                          : "bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{u.codigo}</span>
                        <span className={`text-[10px] font-semibold ${isSelected ? "text-[#E8D5A8]" : isLibre ? "text-emerald-600" : "text-stone-400"}`}>
                          {u.estado}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                        Modelo {u.modelo} · {u.superficieM2} m²
                      </p>
                      <p className={`text-xs font-bold mt-1 ${isSelected ? "text-white" : "text-[#9A7B45]"}`}>
                        USD {formatBlessUsd(u.precioContado)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Paso 3: Selector directo de Parqueo */}
          <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car size={16} className="text-[#9A7B45]" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Paso 3 · Opcional de Parqueo y Baulera
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeParking}
                  onChange={(e) => setIncludeParking(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9A7B45]"></div>
              </label>
            </div>

            {includeParking && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setParkingOption("simple")}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    parkingOption === "simple"
                      ? "border-[#9A7B45] bg-[#FFFDF6] font-semibold text-stone-900"
                      : "border-stone-200 hover:bg-stone-50 text-stone-600"
                  }`}
                >
                  <p className="font-bold">Parqueo Simple (+USD 12.000)</p>
                  <p className="text-[11px] text-stone-500">Parqueo vehicular cubierto</p>
                </button>
                <button
                  type="button"
                  onClick={() => setParkingOption("combo")}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    parkingOption === "combo"
                      ? "border-[#9A7B45] bg-[#FFFDF6] font-semibold text-stone-900"
                      : "border-stone-200 hover:bg-stone-50 text-stone-600"
                  }`}
                >
                  <p className="font-bold">Parqueo + Baulera (+USD 15.000)</p>
                  <p className="text-[11px] text-stone-500">Parqueo vehicular con baulera integrada</p>
                </button>
              </div>
            )}
          </div>

          {/* Paso 4: Modalidad de Pago */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Paso 4 · Modalidad de Pago
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentPlan("contado")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentPlan === "contado"
                    ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                    : "bg-white border-stone-200 hover:border-stone-300 text-stone-800"
                }`}
              >
                <p className="text-xs font-bold">100% Contado</p>
                <p className={`text-[11px] mt-0.5 ${paymentPlan === "contado" ? "text-[#E8D5A8]" : "text-[#9A7B45]"}`}>
                  Tarifa más baja
                </p>
              </button>
              <button
                onClick={() => setPaymentPlan("plan40")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentPlan === "plan40"
                    ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                    : "bg-white border-stone-200 hover:border-stone-300 text-stone-800"
                }`}
              >
                <p className="text-xs font-bold">40% en Obra / 60% Saldo</p>
                <p className={`text-[11px] mt-0.5 ${paymentPlan === "plan40" ? "text-stone-300" : "text-stone-500"}`}>
                  Equilibrio de cuotas
                </p>
              </button>
              <button
                onClick={() => setPaymentPlan("plan30")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentPlan === "plan30"
                    ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                    : "bg-white border-stone-200 hover:border-stone-300 text-stone-800"
                }`}
              >
                <p className="text-xs font-bold">30% Inicial / 70% Saldo</p>
                <p className={`text-[11px] mt-0.5 ${paymentPlan === "plan30" ? "text-stone-300" : "text-stone-500"}`}>
                  Entrada accesible
                </p>
              </button>
            </div>
          </div>

          {/* Tarjeta de Resumen Financiero: 4 Columnas con regla USD arriba, número abajo */}
          {activeFinancials && (
            <div className="p-5 rounded-2xl bg-stone-900 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10">
                <span className="font-semibold text-[#E8D5A8]">
                  Resumen · Unidad {activeUnit?.codigo} (Piso {selectedFloor}, Modelo {activeUnit?.modelo})
                </span>
                <span className="text-stone-400">
                  Reserva con USD {formatBlessUsd(activeFinancials.reserva)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Columna 1: Inversión Total */}
                <div className="flex flex-col justify-between">
                  <div className="min-h-[28px] flex items-end">
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold leading-tight">
                      Inversión Total
                    </p>
                  </div>
                  <div className="mt-1">
                    <p className="font-serif text-lg sm:text-2xl font-bold text-white leading-tight">
                      <span className="block text-xs font-mono font-normal text-stone-400">USD</span>
                      <span className="block mt-0.5">{formatBlessUsd(activeFinancials.totalPrice)}</span>
                    </p>
                    <p className="text-[10px] text-stone-400 mt-1">
                      ${activeFinancials.pricePerM2} USD/m²
                    </p>
                  </div>
                </div>

                {/* Columna 2: Cuota Inicial */}
                <div className="flex flex-col justify-between">
                  <div className="min-h-[28px] flex items-end">
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold leading-tight">
                      Cuota Inicial ({activeFinancials.cuotaInicialPct}%)
                    </p>
                  </div>
                  <div className="mt-1">
                    <p className="font-serif text-lg sm:text-2xl font-bold text-emerald-400 leading-tight">
                      <span className="block text-xs font-mono font-normal text-emerald-500/80">USD</span>
                      <span className="block mt-0.5">{formatBlessUsd(activeFinancials.initialPayment)}</span>
                    </p>
                    <p className="text-[10px] text-stone-400 mt-1">
                      A la firma del contrato
                    </p>
                  </div>
                </div>

                {/* Columna 3: Saldo contra Entrega (Estándar: '-' y 'Sin saldo pendiente' cuando contado) */}
                <div className="flex flex-col justify-between">
                  <div className="min-h-[28px] flex items-end">
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold leading-tight">
                      Saldo contra Entrega
                    </p>
                  </div>
                  <div className="mt-1">
                    {paymentPlan === "contado" ? (
                      <>
                        <p className="font-serif text-lg sm:text-2xl font-bold text-stone-500 leading-tight">
                          <span className="block text-xs font-mono font-normal text-stone-500">USD</span>
                          <span className="block mt-0.5">—</span>
                        </p>
                        <p className="text-[10px] text-stone-400 mt-1">
                          Sin saldo pendiente
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-serif text-lg sm:text-2xl font-bold text-white leading-tight">
                          <span className="block text-xs font-mono font-normal text-stone-400">USD</span>
                          <span className="block mt-0.5">{formatBlessUsd(activeFinancials.balancePayment)}</span>
                        </p>
                        <p className="text-[10px] text-stone-400 mt-1">
                          En {BLESS_TOWER_CONFIG.delivery}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Columna 4: Plusvalía Proyectada */}
                <div className="flex flex-col justify-between">
                  <div className="min-h-[28px] flex items-end">
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold leading-tight">
                      Plusvalía Proyectada
                    </p>
                  </div>
                  <div className="mt-1">
                    <p className="font-serif text-lg sm:text-2xl font-bold text-[#C19A6B] leading-tight">
                      <span className="block text-xs font-mono font-normal text-[#C19A6B]/80">+USD</span>
                      <span className="block mt-0.5">{formatBlessUsd(activeFinancials.capitalGain)}</span>
                    </p>
                    <p className="text-[10px] text-stone-400 mt-1">
                      +{activeFinancials.gainPercentage}% estimado a entrega
                    </p>
                  </div>
                </div>
              </div>

              {/* Paso 5: Botón WhatsApp de Acción Inmediata */}
              <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-stone-400 text-center sm:text-left">
                  Congela la unidad {activeUnit?.codigo} con la reserva formal de USD {formatBlessUsd(BLESS_TOWER_CONFIG.reservaUsd)}.
                </p>
                <button
                  onClick={contactWhatsApp}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <MessageCircle size={16} />
                  Reservar Unidad {activeUnit?.codigo} vía WhatsApp
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ----------------------------------------------------
            SECCIÓN 9: #cierre (Garantía & Cierre)
            ---------------------------------------------------- */}
        <section id="cierre" className="space-y-6 pt-4 border-t border-stone-200/80 pb-16">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-stone-900">
              <ShieldCheck size={20} className="text-emerald-600" />
              <h4 className="font-serif text-lg font-bold">Garantía y Certeza Jurídica</h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed [text-align:justify] [text-justify:inter-word]">
              La reserva inicial de USD 2.000 se acredita en su totalidad al monto de la cuota inicial a la firma del contrato de preventa. Toda la documentación legal, planos aprobados y contratos marco están a disposición para revisión notarial y bancaria.
            </p>
            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
              <span>Desarrollado y Construido por Alta Vida Santa Cruz</span>
              <button
                onClick={contactWhatsApp}
                className="font-semibold text-[#9A7B45] hover:underline flex items-center gap-1"
              >
                Consultar con Asesor Comercial
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================
          4. ELEMENTOS FLOTANTES REACTIVOS
          ======================================================== */}
      {/* 4.1 Barra inferior flotante de conversión rápida */}
      <div className="fixed inset-x-0 bottom-0 z-[110] md:left-[44%] p-3.5 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-2xl flex items-center justify-between">
        <p className="text-xs text-stone-700 font-medium truncate pr-2">
          Reserva con <strong className="text-stone-900 font-bold">USD {formatBlessUsd(BLESS_TOWER_CONFIG.reservaUsd)}</strong> · Congela el precio de preventa hoy
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleShare}
            className="px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            {shareFeedback ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
            <span>Compartir</span>
          </button>
          <button
            onClick={() => scrollToSection("disponibilidad")}
            className="px-4 py-2 rounded-lg bg-[#1C1917] hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
          >
            Cotizar
          </button>
        </div>
      </div>

      {/* 4.2 Burbuja flotante de menú de secciones */}
      <div className="fixed right-5 bottom-18 z-[115]">
        <button
          onClick={() => setShowSectionMenu(!showSectionMenu)}
          className="h-11 w-11 rounded-full bg-stone-900 hover:bg-stone-800 text-[#C19A6B] shadow-2xl flex items-center justify-center transition-all border border-white/20 hover:scale-105"
          title="Menú de Secciones"
          aria-label="Secciones"
        >
          {showSectionMenu ? <X size={20} /> : <Menu size={20} />}
        </button>

        <AnimatePresence>
          {showSectionMenu && (
            <>
              <div
                className="fixed inset-0 bg-black/20 z-[114]"
                onClick={() => setShowSectionMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 bottom-14 w-64 rounded-2xl bg-white/95 backdrop-blur-xl border border-stone-200 shadow-2xl p-2.5 z-[115] space-y-1 text-xs"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                  Secciones de Bless Tower
                </div>
                {[
                  { id: "intro", label: "Inicio & Resumen" },
                  { id: "lugar", label: "Ubicación & Entorno" },
                  { id: "amenidades", label: "Áreas Sociales (Rooftop)" },
                  { id: "tipologias", label: "Tipologías & Planos" },
                  { id: "equipamiento", label: "Equipamiento Incluido" },
                  { id: "constructora", label: "Constructora Alta Vida" },
                  { id: "pago", label: "Formas de Pago" },
                  { id: "disponibilidad", label: "Disponibilidad en Vivo" },
                  { id: "cierre", label: "Garantías & Reserva" },
                ].map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                      activeSection === sec.id
                        ? "bg-[#9A7B45] text-white font-semibold"
                        : "text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* 4.3 Modal Zoom HD de Planos */}
      <AnimatePresence>
        {showHdPlanModal && (
          <div className="fixed inset-0 z-[130] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full bg-stone-900 rounded-2xl p-4 shadow-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-white pb-2 border-b border-white/10">
                <div>
                  <h4 className="font-serif text-lg font-bold">{currentTypology.title}</h4>
                  <p className="text-xs text-stone-400">{currentTypology.area} · Plano Arquitectónico</p>
                </div>
                <button
                  onClick={() => setShowHdPlanModal(false)}
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                  aria-label="Cerrar modal"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="aspect-[16/10] bg-black rounded-xl overflow-hidden flex items-center justify-center p-2">
                <img src={currentTypology.image} alt={currentTypology.title} className="max-h-full max-w-full object-contain" />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 4.4 Drawer Modal Privado de Insights de Asesor */}
      <AnimatePresence>
        {showAdvisorInsights && (
          <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full bg-[#FFFDF6] border-l border-stone-200 shadow-2xl p-6 overflow-y-auto space-y-6 text-stone-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2 text-[#9A7B45]">
                  <TrendingUp size={20} />
                  <h4 className="font-serif text-lg font-bold text-stone-900">Insights Asesor · Bless Tower</h4>
                </div>
                <button
                  onClick={() => setShowAdvisorInsights(false)}
                  className="h-8 w-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center"
                  aria-label="Cerrar modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Bloque 1: Ventajas Comerciales */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Bloque 1 · Ventajas Clave
                </span>
                <ul className="space-y-2 text-xs text-stone-700 pt-1">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Ubicación sobre avenida principal:</strong> Av. Cristo Redentor es la arteria de mayor crecimiento comercial y plusvalía del norte cruceño.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Torre de 30 pisos:</strong> Máxima exclusividad con vistas abiertas sin obstáculos en pisos altos.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>100% equipado:</strong> Climatización, roperos, cajonería y cerraduras inteligentes sin desembolsos extra.</span>
                  </li>
                </ul>
              </div>

              {/* Bloque 2: Desventajas Transparentes & Objeciones */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Bloque 2 · Objeciones & Manejo
                </span>
                <div className="space-y-2 text-xs text-stone-700 pt-1">
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <p className="font-semibold text-stone-900">Objeción: "¿Hay ruido por estar sobre avenida?"</p>
                    <p className="text-stone-600 mt-1">Respuesta: Carpintería de aluminio hermética con cámara de aire y vidrios templados que amortiguan el sonido urbano eficientemente.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <p className="font-semibold text-stone-900">Objeción: "¿Tiempo de entrega?"</p>
                    <p className="text-stone-600 mt-1">Respuesta: Diciembre 2026. Permite planificar el financiamiento bancario con holgura sin presión inmediata de cuotas hipotecarias.</p>
                  </div>
                </div>
              </div>

              {/* Bloque 3: Escenario Financiero Estimado */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A7B45] bg-[#E8D5A8]/20 px-2.5 py-0.5 rounded-full border border-[#9A7B45]/30">
                  Bloque 3 · Estimación de Rentas
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-white border border-stone-200">
                    <p className="text-[10px] text-stone-500 uppercase">Renta Mensual Estimada</p>
                    <p className="font-serif text-sm font-bold text-stone-900 mt-0.5">$450 – $750 USD</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-stone-200">
                    <p className="text-[10px] text-stone-500 uppercase">Plusvalía a Entrega</p>
                    <p className="font-serif text-sm font-bold text-emerald-600 mt-0.5">+20% a +25%</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-stone-100 text-[10px] text-stone-500 leading-relaxed italic mt-2">
                  Los valores de plusvalía y alquiler proyectados son estimaciones analíticas basadas en el comportamiento histórico de la zona y valores de mercado vigentes. No constituyen una promesa o garantía contractual de rentabilidad fija.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
