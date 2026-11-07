import { useInventory, blessDreiInventory } from "../projectInventory";
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
  X,
  Zap,
} from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import {
  BLESS_DREI_BASELINE_UNITS,
  BLESS_DREI_CONFIG,
  BLESS_DREI_PARKINGS,
  BLESS_DREI_PLANO_MAP,
  BlessDreiUnit,
  fetchBlessDreiLiveUnits,
  formatBlessUsd,
  parseBlessDreiCsv,
} from "../blessDreiInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

const AMENITY_SLIDES = [
  {
    src: "/bless_drei/social/piscina.jpg",
    category: "Piso 6",
    title: "Piscina",
    description: "Piscina en el nivel de áreas sociales, con solárium y vista abierta.",
  },
  {
    src: "/bless_drei/social/gimnasio.jpg",
    category: "Piso 6",
    title: "Gimnasio al aire libre",
    description: "Gimnasio exterior en la terraza de áreas sociales.",
  },
  {
    src: "/bless_drei/social/cowork.jpg",
    category: "Piso 6",
    title: "Co-work",
    description: "Sala de trabajo compartido con mesas y escritorio.",
  },
  {
    src: "/bless_drei/social/reuniones.jpg",
    category: "Piso 6",
    title: "Sala de reuniones",
    description: "Sala cerrada para reuniones, con mesa y vista a la ciudad.",
  },
  {
    src: "/bless_drei/social/churrasquera.jpg",
    category: "Piso 6",
    title: "Churrasquera",
    description: "Churrasquera con barra y mesón para el uso de los residentes.",
  },
  {
    src: "/bless_drei/social/eventos.jpg",
    category: "Piso 6",
    title: "Salón de eventos",
    description: "Salón de eventos con comedor y estar.",
  },
];

type ModeloRoom = "mono" | "1d";

const BLESS_MODELOS: {
  id: string;
  rooms: ModeloRoom;
  name: string;
  area: string;
  where: string;
  preview: string;
  full: string;
}[] = [
  { id: "a", rooms: "mono", name: "Modelo A", area: "30,94 m²", where: "Basamento · pisos 1 a 5 · fachada posterior", preview: "/bless_drei/modelos/a.jpg", full: "/bless_drei/fichas/a.jpg" },
  { id: "b", rooms: "mono", name: "Modelo B", area: "33,18 m²", where: "Basamento · pisos 1 a 5 · fachada posterior", preview: "/bless_drei/modelos/b.jpg", full: "/bless_drei/fichas/b.jpg" },
  { id: "c", rooms: "mono", name: "Modelo C", area: "37,47 m²", where: "Torre · pisos 13 y 14 · fachada posterior", preview: "/bless_drei/modelos/c.jpg", full: "/bless_drei/fichas/c.jpg" },
  { id: "d", rooms: "mono", name: "Modelo D", area: "37,85 m²", where: "Torre · pisos 13 y 14 · fachada frontal", preview: "/bless_drei/modelos/d.jpg", full: "/bless_drei/fichas/d.jpg" },
  { id: "e", rooms: "mono", name: "Modelo E", area: "41,66 m²", where: "Torre · pisos 7 a 12 · fachada frontal", preview: "/bless_drei/modelos/e.jpg", full: "/bless_drei/fichas/e.jpg" },
  { id: "f", rooms: "mono", name: "Modelo F", area: "41,80 m²", where: "Torre · pisos 7 a 12 · fachada posterior", preview: "/bless_drei/modelos/f.jpg", full: "/bless_drei/fichas/f.jpg" },
  { id: "h", rooms: "mono", name: "Modelo H", area: "45,07 m²", where: "Basamento · pisos 1 a 5 · fachada frontal", preview: "/bless_drei/modelos/h.jpg", full: "/bless_drei/fichas/h.jpg" },
  { id: "g", rooms: "1d", name: "Modelo G", area: "42,35 m²", where: "Basamento · pisos 1 a 5 · fachada posterior", preview: "/bless_drei/modelos/g.jpg", full: "/bless_drei/fichas/g.jpg" },
  { id: "i", rooms: "1d", name: "Modelo I", area: "46,17 m²", where: "Basamento · pisos 1 a 5 · fachada frontal", preview: "/bless_drei/modelos/i.jpg", full: "/bless_drei/fichas/i.jpg" },
];

const EQUIPAMIENTO_SLIDES = [
  {
    id: "cocina",
    room: "COCINA",
    title: "Cocina",
    image: "/bless_drei/interior_3.jpg",
    items: ["Cocina encimera", "Extractor eléctrico de cocina"],
  },
  {
    id: "sala",
    room: "SALA",
    title: "Sala y dormitorios",
    image: "/bless_drei/interior_1.jpg",
    items: ["Aires acondicionados en dormitorios y salas", "Luminaria LED"],
  },
  {
    id: "cuarto",
    room: "DEPARTAMENTO",
    title: "Baño y agua caliente",
    image: "/bless_drei/bano.jpg",
    items: [
      "Espejo con iluminación LED en baños",
      "Box de baños con vidrio templado",
      "Grifería y accesorios sanitarios importados",
      "Extractor mecánico en baños",
      "Calefón eléctrico/gas",
    ],
  },
  {
    id: "acceso",
    room: "EDIFICIO",
    title: "Acceso y vigilancia",
    image: "/bless_drei/fachada_principal.jpg",
    items: [
      "Cerradura inteligente en la puerta de ingreso",
      "Intercomunicador en cada departamento",
      "Vigilancia en el edificio 24/7",
    ],
  },
];

interface AmbienteOption {
  id: string;
  name: string;
  shortName: string;
  tipologia: "Monoambiente" | "1 Dormitorio";
  areaRange: string;
  basePrice: number;
  matchUnit: (u: BlessDreiUnit) => boolean;
}

const AMBIENTE_OPTIONS: AmbienteOption[] = [
  {
    id: "mono",
    name: "Monoambiente",
    shortName: "Monoambiente · 30,94 a 45,07 m²",
    tipologia: "Monoambiente",
    areaRange: "30,94 a 45,07 m²",
    basePrice: 38168,
    matchUnit: (u) => u.tipologia === "Monoambiente",
  },
  {
    id: "1d",
    name: "1 Dormitorio",
    shortName: "1 Dormitorio · 42,35 a 46,17 m²",
    tipologia: "1 Dormitorio",
    areaRange: "42,35 a 46,17 m²",
    basePrice: 59000,
    matchUnit: (u) => u.tipologia === "1 Dormitorio",
  },
];

export default function BlessDreiLanding({ property, onClose }: Props) {
  const [activeSection, setActiveSection] = useState<string>("intro");
  const [amenityIndex, setAmenityIndex] = useState(0);
  const [modeloRooms, setModeloRooms] = useState<ModeloRoom>("mono");
  const [modeloIndex, setModeloIndex] = useState(0);
  const modeloTouchX = useRef<number | null>(null);
  const [zoom, setZoom] = useState<{ src: string; title: string; caption: string } | null>(null);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  // Inventario en vivo
  const [units, setUnits] = useInventory(blessDreiInventory);
  const [isRefreshingInv, setIsRefreshingInv] = useState(false);
  const [lastPriceUpdateText, setLastPriceUpdateText] = useState<string>("Sincronizado");

  // Cotizador interactivo (5 pasos)
  const [selectedAmbId, setSelectedAmbId] = useState<string>("mono");
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>("");
  const [includeParking, setIncludeParking] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<"contado" | "plan40" | "plan30">("contado");

  const editorialScrollRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLDivElement>(null);

  // Sincronización en vivo
  useEffect(() => {
    fetchBlessDreiLiveUnits().then((res) => {
      if (res && res.length > 0) {
        setUnits(res);
        setLastPriceUpdateText("Sincronizado en vivo");
      }
    });
  }, []);

  const handleRefreshInventory = async () => {
    setIsRefreshingInv(true);
    try {
      const res = await fetch(BLESS_DREI_CONFIG.sheetCsvUrl + "&_t=" + Date.now());
      if (res.ok) {
        const text = await res.text();
        const parsed = parseBlessDreiCsv(text);
        if (parsed.length > 0) {
          setUnits(parsed);
          const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setLastPriceUpdateText(`Actualizado ${timeStr}`);
        }
      }
    } catch (err) {
      console.warn("Error refrescando inventario Bless Drei:", err);
    } finally {
      setIsRefreshingInv(false);
    }
  };

  const availableUnits = useMemo(() => units.filter((u) => u.estado === "LIBRE"), [units]);
  const soldUnitsCount = units.filter((u) => u.estado === "VENDIDO" || u.estado === "RESERVADO").length;

  const minPriceMono = useMemo(() => {
    const list = availableUnits.filter((u) => u.tipologia === "Monoambiente" && u.precioContado > 0);
    return list.length > 0 ? Math.min(...list.map((u) => u.precioContado)) : 38168;
  }, [availableUnits]);

  const minPrice1Dorm = useMemo(() => {
    const list = availableUnits.filter((u) => u.tipologia === "1 Dormitorio" && u.precioContado > 0);
    return list.length > 0 ? Math.min(...list.map((u) => u.precioContado)) : 59000;
  }, [availableUnits]);

  const minCashPerM2 = useMemo(() => {
    const list = availableUnits.filter((u) => u.precioContado > 0 && u.superficieM2 > 0);
    if (list.length === 0) return 1480;
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

  // Asegurar selección de piso disponible
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

  // Costo parqueo en Bless Drei
  const parkingPrice = includeParking ? 12000 : 0;

  // Cálculos financieros
  const activeFinancials = useMemo(() => {
    if (!activeUnit || activeUnit.estado !== "LIBRE") return null;

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
      unitTotalPrice = activeUnit.precioCuotas || Math.round(activeUnit.precioContado * 1.15);
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

    return {
      unitTotalPrice,
      totalPrice,
      cuotaInicialPct,
      initialPayment,
      balancePayment,
      pricePerM2,
      reserva: BLESS_DREI_CONFIG.reservaUsd,
    };
  }, [activeUnit, paymentPlan, includeParking, parkingPrice]);

  // Sincronización visual del panel izquierdo al scroll
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

  useEffect(() => {
    const checkNavVisibility = () => {
      const nav = navBarRef.current;
      if (!nav) return;
      const past = nav.getBoundingClientRect().bottom < 80;
      setShowFloatingNav(past);
      if (!past) setShowSectionMenu(false);
    };

    const desktop = editorialScrollRef.current;
    const mobile = desktop?.parentElement;
    desktop?.addEventListener("scroll", checkNavVisibility, { passive: true });
    mobile?.addEventListener("scroll", checkNavVisibility, { passive: true });
    window.addEventListener("scroll", checkNavVisibility, { passive: true });
    checkNavVisibility();

    return () => {
      desktop?.removeEventListener("scroll", checkNavVisibility);
      mobile?.removeEventListener("scroll", checkNavVisibility);
      window.removeEventListener("scroll", checkNavVisibility);
    };
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
    const shareUrl = `${origin}/bless-drei`;
    const shareTitle = "Bless Drei · Preventa Exclusiva en Equipetrol";
    const shareText = `Departamentos inteligentes en Equipetrol (a metros de Av. San Martín) desde USD ${formatBlessUsd(minPriceMono)}. Conoce Bless Drei:`;

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
      propertyRef: "bless-drei",
      operacion: "Preventa",
      zona: BLESS_DREI_CONFIG.zone,
    }).catch(() => {});

    const unitInfo = activeUnit
      ? `Unidad ${activeUnit.codigo} (Piso ${activeUnit.pisoNumero}, Modelo ${activeUnit.modelo} - ${activeUnit.tipologia} de ${activeUnit.superficieM2} m²)`
      : "Bless Drei";
    const parkingInfo = includeParking ? " + Parqueo Vehicular" : " (Sin parqueo)";
    const planInfo =
      paymentPlan === "contado"
        ? "Plan Al Contado (100%)"
        : paymentPlan === "plan40"
        ? "Plan 40% en Cuotas + 60% contra entrega"
        : "Plan 30% Inicial + 70% contra entrega";

    const text = `Hola, vengo de N.I.A y deseo reservar en BLESS DREI (Equipetrol):\n\n• ${unitInfo}${parkingInfo}\n• Modalidad: ${planInfo}\n• Inversión Total: USD ${formatBlessUsd(activeFinancials?.totalPrice || minPriceMono)}\n• Cuota Inicial: USD ${formatBlessUsd(activeFinancials?.initialPayment || minPriceMono)}\n\n¿Me confirman la disponibilidad oficial y los pasos para asegurar la unidad con la reserva de USD ${formatBlessUsd(BLESS_DREI_CONFIG.reservaUsd)}?`;

    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const dynamicBackdropImage = useMemo(() => {
    switch (activeSection) {
      case "lugar":
        return "/bless_drei/ingreso_boutique.jpg";
      case "amenidades":
        return "/bless_drei/social_3.jpg";
      case "tipologias":
        return "/bless_drei/interior_2.jpg";
      case "equipamiento":
        return "/bless_drei/interior_3.jpg";
      case "constructora":
        return "/bless_drei/fachada_2.jpg";
      case "pago":
        return "/bless_drei/formas_de_pago.jpg";
      case "disponibilidad":
      case "cierre":
        return "/bless_drei/interior_1.jpg";
      default:
        return "/bless_drei/fachada_principal.jpg";
    }
  }, [activeSection]);


  return (
    <div className="nia-project-landing fixed inset-0 z-[100] flex flex-col bg-[#f7f5f0] font-sans text-stone-900 overflow-y-auto overscroll-y-contain md:overflow-hidden md:flex-row">
      {/* ========================================================
          1. CONTROLES SUPERIORES FLOTANTES (4 ICONOS LIMPIOS)
          ======================================================== */}
      <div className="fixed right-4 top-4 md:right-7 md:top-7 z-[120] flex items-center gap-2">

        <a
          href={BLESS_DREI_CONFIG.brochurePdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 w-10 rounded-full bg-white/95 backdrop-blur border border-stone-200 shadow-xl flex items-center justify-center text-[#9a7b45] hover:bg-stone-50 transition-all hover:scale-105"
          title="Descargar Brochure Oficial"
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
      <div className="relative min-h-[480px] shrink-0 bg-stone-950 md:h-screen md:min-h-0 md:w-[44%]">
        <AnimatePresence mode="wait">
          <motion.img
            key="/bless_drei/fachada_principal.jpg"
            src="/bless_drei/fachada_principal.jpg"
            alt="Bless Drei"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.82]"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 pointer-events-none" />

        <div className="absolute bottom-6 left-6 right-6 z-10 text-white md:bottom-8 md:left-8 md:right-8 lg:bottom-10 lg:left-10 lg:right-10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#9a7b45]/15 text-[#e8d5a8] border border-[#e8d5a8]/40 backdrop-blur-md">
            <Sparkles size={12} />
            Preventa Exclusiva · 16 Niveles · {BLESS_DREI_CONFIG.zone}
          </span>
          <h1 className="mt-2.5 font-serif text-4xl font-light tracking-wide text-white sm:text-5xl md:text-6xl">
            Bless Drei
          </h1>
          <p className="text-stone-300 text-xs md:text-sm mt-1 max-w-sm">
            Calle Alejandro Ramírez (a metros de Av. San Martín) · Equipetrol
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <div className="p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
              <p className="text-[10px] text-stone-400 uppercase tracking-wider">Constructora</p>
              <p className="text-xs md:text-sm font-semibold text-white mt-0.5 flex items-center gap-1">
                <Building2 size={13} className="text-[#9a7b45]" />
                {BLESS_DREI_CONFIG.builder}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
              <p className="text-[10px] text-stone-400 uppercase tracking-wider">Entrega</p>
              <p className="text-xs md:text-sm font-semibold text-white mt-0.5">
                {BLESS_DREI_CONFIG.delivery}
              </p>
            </div>
          </div>

          {/* Tarjeta de precios dinámicos */}
          <div className="p-4 rounded-xl bg-black/55 backdrop-blur-md border border-white/15 max-w-sm">
            <div className="flex items-center justify-between text-[11px] text-stone-300 pb-2 border-b border-white/10">
              <span className="font-semibold text-[#e8d5a8]">Precios Preventa en Vivo</span>
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Oficial Sheet
              </span>
            </div>
            <div className="mt-2.5 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-stone-300">Monoambiente (30,94 a 45,07 m²):</span>
                <span className="font-serif font-bold text-white">Desde USD {formatBlessUsd(minPriceMono)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-300">1 Dormitorio (42,35 a 46,17 m²):</span>
                <span className="font-serif font-bold text-white">Desde USD {formatBlessUsd(minPrice1Dorm)}</span>
              </div>
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
        className="relative min-h-0 flex-1 md:h-screen md:overflow-y-auto"
      >
        <div className="mx-auto max-w-xl px-5 py-8 pb-32 md:max-w-3xl md:px-10 md:py-14 md:pb-44 lg:max-w-4xl lg:px-14 xl:max-w-5xl">
        {/* ----------------------------------------------------
            SECCIÓN 1: #intro (Hero, tesis & menú de navegación)
            ---------------------------------------------------- */}
        <section id="intro" className="scroll-mt-6 space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">
              <Sparkles size={13} />
              Experiencia Residencial & Preventa
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-light text-[#1C1917] leading-tight">
              Vive en <span className="italic font-normal">Bless Drei.</span>
            </h2>
            <p className="text-sm md:text-base text-[#57534E] leading-relaxed [text-align:justify] [text-justify:inter-word] pt-2">
              Un desarrollo boutique de 16 niveles diseñado para quienes buscan habitar o invertir en el epicentro gastronómico y empresarial de Equipetrol. Con una fachada contemporánea que combina sobriedad y elegancia, Bless Drei ofrece amenidades en rooftop, equipamiento de primera línea y una tasa de rentabilidad respaldada por la altísima demanda de alquiler de la zona.
            </p>
          </div>

          {/* Tarjeta de Tracción */}
          <div className="p-4 rounded-xl bg-white border border-[#E7E5E4] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Tracción de Preventa · Entrega Febrero 2028</p>
              <p className="font-serif text-lg font-bold text-stone-900 mt-0.5">
                {soldUnitsCount} de {units.length} unidades colocadas
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Fase Exclusiva · Equipetrol
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
              href={BLESS_DREI_CONFIG.brochurePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-white text-stone-800 border border-stone-200 text-xs font-semibold uppercase tracking-wider hover:bg-stone-50 transition-all flex items-center gap-2"
            >
              <Download size={15} className="text-[#9a7b45]" />
              Brochure en Drive
            </a>
          </div>

          {/* Barra de Secciones Inicial */}
          <div ref={navBarRef} className="pt-4 border-t border-stone-200">
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
              <button onClick={() => scrollToSection("disponibilidad")} className="px-3 py-1.5 rounded-lg bg-[#9a7b45] text-white font-semibold hover:bg-[#816127] transition-all">Disponibilidad en Vivo</button>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------
            SECCIÓN 2: #lugar (Ubicación en Equipetrol)
            ---------------------------------------------------- */}
        <section id="lugar" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45] flex items-center gap-1.5">
              <MapPin size={13} />
              Ubicación Privilegiada
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-light text-[#1C1917]">
              En el Corazón de Equipetrol
            </h3>
            <p className="text-sm text-[#57534E] leading-relaxed [text-align:justify] [text-justify:inter-word]">
              Situado en la Calle Alejandro Ramírez entre 3° y 4° Anillo, a escasos metros de la Av. San Martín. El barrio es Equipetrol.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <img
              src="/bless_drei/ubicacion.jpg"
              alt="Mapa de Bless Drei en la calle Alejandro Ramírez, Equipetrol"
              className="block h-auto w-full"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-sm">
              <p className="font-serif text-xl font-bold text-stone-900">1 min</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Av. San Martín</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-sm">
              <p className="font-serif text-xl font-bold text-stone-900">3 min</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Hotel Marriott</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-sm">
              <p className="font-serif text-xl font-bold text-stone-900">4 min</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Mall Ventura</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-sm">
              <p className="font-serif text-xl font-bold text-stone-900">5 min</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Puente Urubó</p>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <a
              href="https://maps.google.com/?q=-17.7612,-63.1970"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9a7b45] hover:text-[#816127] transition-colors"
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
        <section id="amenidades" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45] flex items-center gap-1.5">
              <Sparkles size={13} />
              Áreas Sociales & Bienestar
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-light text-[#1C1917]">
              Vida Social y Relax en Rooftop
            </h3>
            <p className="text-sm text-[#57534E] leading-relaxed [text-align:justify] [text-justify:inter-word]">
              Diseñadas bajo el concepto de hotel boutique para ofrecer espacios funcionales que eleven la calidad de vida de sus residentes e incrementen la satisfacción de huéspedes temporales.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="relative">
              <img
                src={AMENITY_SLIDES[amenityIndex].src}
                alt={AMENITY_SLIDES[amenityIndex].title}
                className="aspect-[16/10] w-full object-cover"
              />
              <button
                onClick={() => setAmenityIndex((prev) => (prev > 0 ? prev - 1 : AMENITY_SLIDES.length - 1))}
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md"
                aria-label="Anterior amenidad"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setAmenityIndex((prev) => (prev < AMENITY_SLIDES.length - 1 ? prev + 1 : 0))}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md"
                aria-label="Siguiente amenidad"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="space-y-1.5 px-5 py-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">
                {AMENITY_SLIDES[amenityIndex].category}
              </span>
              <h4 className="font-serif text-xl font-normal text-stone-900 md:text-2xl">
                {AMENITY_SLIDES[amenityIndex].title}
              </h4>
              <p className="max-w-xl text-xs leading-relaxed text-stone-600">
                {AMENITY_SLIDES[amenityIndex].description}
              </p>
            </div>
            <div className="flex justify-center gap-1.5 px-3 pb-3">
              {AMENITY_SLIDES.map((slide, i) => (
                <button
                  key={slide.title}
                  onClick={() => setAmenityIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${amenityIndex === i ? "w-6 bg-[#9a7b45]" : "w-1.5 bg-stone-300"}`}
                  aria-label={slide.title}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------
            SECCIÓN 4: #tipologias (Exploración de planos 2D)
            ---------------------------------------------------- */}
        <section id="tipologias" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45] flex items-center gap-1.5">
              <Layers size={13} />
              Tipologías Residenciales
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-light text-[#1C1917]">
              Plantas Arquitectónicas en Equipetrol
            </h3>
            <p className="text-sm text-[#57534E] leading-relaxed [text-align:justify] [text-justify:inter-word]">
              La foto muestra solo el departamento. Toca la imagen para ver la ficha con medidas, plano y en qué parte del piso queda.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([
              ["mono", "Monoambiente"],
              ["1d", "1 Dormitorio"],
            ] as const).map(([id, label]) => {
              const isSelected = modeloRooms === id;
              const count = BLESS_MODELOS.filter((m) => m.rooms === id).length;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setModeloRooms(id);
                    setModeloIndex(0);
                    setSelectedAmbId(id);
                  }}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-[#9a7b45] bg-white shadow-md ring-1 ring-[#9a7b45]"
                      : "border-stone-200 bg-white/80 hover:border-stone-300"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{label}</p>
                  <p className="mt-1 text-[11px] text-stone-500">{count} modelos · desliza</p>
                </button>
              );
            })}
          </div>

          {(() => {
            const slides = BLESS_MODELOS.filter((m) => m.rooms === modeloRooms);
            const index = ((modeloIndex % slides.length) + slides.length) % slides.length;
            const current = slides[index];
            const go = (dir: number) => setModeloIndex((index + dir + slides.length) % slides.length);
            return (
              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <div className="flex items-start justify-between gap-3 border-b border-stone-100 px-4 py-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{current.name}</p>
                    <h4 className="font-serif text-xl font-medium text-stone-900">{current.area}</h4>
                    <p className="text-xs text-stone-500">{current.where}</p>
                  </div>
                  <p className="pt-1 text-[11px] text-stone-400">{index + 1}/{slides.length}</p>
                </div>
                <div
                  className="relative bg-white"
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
                  <button
                    type="button"
                    onClick={() => setZoom({ src: current.full, title: current.name, caption: `${current.area} · ${current.where}` })}
                    className="flex min-h-[320px] w-full cursor-zoom-in items-center justify-center px-6 py-6"
                    aria-label={`Ver ficha de ${current.name}`}
                  >
                    <img
                      src={current.preview}
                      alt={`${current.name}, ${current.area}, solo el departamento`}
                      className="mx-auto max-h-[460px] w-auto max-w-full object-contain"
                    />
                  </button>
                  {slides.length > 1 && (
                    <>
                      <button type="button" onClick={() => go(-1)} className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo anterior">
                        <ChevronLeft size={22} />
                      </button>
                      <button type="button" onClick={() => go(1)} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo siguiente">
                        <ChevronRight size={22} />
                      </button>
                    </>
                  )}
                </div>
                <p className="border-t border-stone-100 px-4 py-3 text-center text-[11px] text-stone-500">
                  Desliza para el siguiente. Toca la imagen para ver la ficha completa.
                </p>
              </div>
            );
          })()}
        </section>

        {/* ----------------------------------------------------
            SECCIÓN 5: #equipamiento (Equipamiento 100% incluido)
            ---------------------------------------------------- */}
        <section id="equipamiento" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45] flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              Equipamiento 100% Incluido
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-light text-[#1C1917]">
              Entrega Completa Llave en Mano
            </h3>
            <p className="text-sm text-[#57534E] leading-relaxed [text-align:justify] [text-justify:inter-word]">
              Cada unidad se entrega con el equipamiento que publica el brochure.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {EQUIPAMIENTO_SLIDES.map((eq) => (
              <div key={eq.id} className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                <div className="flex min-h-[220px] items-center justify-center bg-white">
                  <img src={eq.image} alt={eq.title} className={eq.id === "cuarto" ? "max-h-[280px] w-full object-contain" : "h-[210px] w-full object-cover"} />
                </div>
                <div className="space-y-2 px-4 py-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">{eq.room}</span>
                  <h4 className="font-serif text-base font-bold text-stone-900">{eq.title}</h4>
                  <ul className="grid grid-cols-1 gap-1.5 border-t border-stone-100 pt-2 text-xs text-stone-600 sm:grid-cols-2">
                    {eq.items.map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <span className="font-bold text-[#9a7b45]">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ----------------------------------------------------
            SECCIÓN 6: #constructora (Respaldo Alta Vida SRL)
            ---------------------------------------------------- */}
        <section id="constructora" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45] flex items-center gap-1.5">
              <Building2 size={13} />
              Respaldo y Trayectoria Constructiva
            </span>
            <img
              src="/bless_drei/logo-altavida.jpg"
              alt="Alta Vida Desarrollos Inmobiliarios"
              className="h-28 w-auto rounded-xl"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-serif text-2xl md:text-3xl font-light text-[#1C1917]">
                Alta Vida SRL · Desarrolladora Inmobiliaria
              </h3>
              <a
                href="https://web.altavidasrl.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#9a7b45] font-semibold hover:underline"
              >
                <span>web.altavidasrl.com</span>
                <ExternalLink size={13} />
              </a>
            </div>
            <p className="text-sm text-[#57534E] leading-relaxed [text-align:justify] [text-justify:inter-word]">
              Fundada en 2014, <strong>Alta Vida SRL</strong> cuenta con más de 10 años de experiencia transformando el desarrollo urbano y habitacional en Bolivia. Con presencia corporativa consolidada en <strong>5 ciudades</strong> (Santa Cruz, Tarija, Potosí, Oruro y Cochabamba), su modelo integral abarca desde la planificación arquitectónica y cálculo estructural hasta la ejecución directa con equipo multidisciplinario propio y comercialización sin intermediarios.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm text-center">
              <p className="font-serif text-3xl font-bold text-[#9a7b45]">+10 Años</p>
              <p className="text-xs font-semibold text-stone-900 mt-1">Trayectoria Nacional</p>
              <p className="text-[11px] text-stone-500 mt-1">Fundada en 2014 en 5 ciudades de Bolivia</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm text-center">
              <p className="font-serif text-3xl font-bold text-[#9a7b45]">16 Niveles</p>
              <p className="text-xs font-semibold text-stone-900 mt-1">Torre Boutique en Equipetrol</p>
              <p className="text-[11px] text-stone-500 mt-1">Áreas sociales en el piso 6, según el esquema del brochure</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm text-center">
              <p className="font-serif text-3xl font-bold text-[#9a7b45]">100%</p>
              <p className="text-xs font-semibold text-stone-900 mt-1">Solvencia &amp; Seguridad Jurídica</p>
              <p className="text-[11px] text-stone-500 mt-1">Equipo propio de ingeniería y contratos registrados</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#fbf9f4] border border-[#e8d5a8]/80 text-xs text-stone-700 space-y-1.5">
            <p className="font-semibold text-stone-900 uppercase tracking-wider text-[11px] text-[#9a7b45]">
              Compromiso Alta Vida SRL
            </p>
            <p className="font-light leading-relaxed [text-align:justify]">
              &quot;Más que una desarrolladora, somos creadores de valor. Asesoramos, construimos y entregamos el mejor inmueble a nuestros clientes, garantizando calidad en cada terminación y cumplimiento estricto de cronogramas.&quot;
            </p>
          </div>
        </section>

        {/* ----------------------------------------------------
            SECCIÓN 7: #pago (Formas de Pago Transparentes)
            ---------------------------------------------------- */}
        <section id="pago" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45] flex items-center gap-1.5">
              <CreditCard size={13} />
              Formas de Pago Transparentes
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-light text-[#1C1917]">
              Modalidades Flexibles de Preventa
            </h3>
            <p className="text-sm text-[#57534E] leading-relaxed [text-align:justify] [text-justify:inter-word]">
              Planes estructurados para asegurar tu unidad en Equipetrol con el mejor descuento o con cuotas adaptadas a tu liquidez durante la construcción.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#fbf9f4] border border-[#e8d5a8] flex items-center justify-between text-xs">
            <span className="text-stone-700">Precio preventa oficial en vivo:</span>
            <span className="font-serif font-bold text-[#9a7b45] text-sm">Desde ${minCashPerM2} USD/m²</span>
          </div>

          <div className="space-y-4">
            {/* Opción 1: Contado */}
            <div className="p-5 rounded-2xl bg-stone-900 text-white shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#9a7b45] text-stone-950">
                  Mayor Descuento · 100% Contado
                </span>
                <span className="text-xs text-stone-400">A la firma de contrato</span>
              </div>
              <h4 className="font-serif text-xl font-bold text-white">Pago al Contado (100%)</h4>
              <p className="text-xs text-stone-300">
                Asegura el precio por metro cuadrado más competitivo de Equipetrol.
              </p>
              <div className="pt-2 border-t border-white/10 text-xs text-[#e8d5a8]">
                <strong className="text-white">VENTAJA COMERCIAL:</strong> Ahorro financiero directo de hasta un 15% sobre la lista oficial.
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
                Paga el 40% en cuotas flexibles hasta la conclusión de obra y cancela el 60% al recibir la llave (apto crédito bancario).
              </p>
              <div className="pt-2 border-t border-stone-100 text-xs text-stone-700">
                <strong className="text-stone-900">VENTAJA COMERCIAL:</strong> Permite planificar el financiamiento con holgura mientras la obra avanza.
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
              <h4 className="font-serif text-xl font-bold text-stone-900">30% de Anticipo + 70% Contra Entrega</h4>
              <p className="text-xs text-stone-600">
                Ingresa a la preventa con solo el 30% inicial y deja el 70% para la entrega de llaves o crédito hipotecario.
              </p>
              <div className="pt-2 border-t border-stone-100 text-xs text-stone-700">
                <strong className="text-stone-900">VENTAJA COMERCIAL:</strong> Menor desembolso de entrada para congelar tu departamento en Equipetrol.
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200 text-xs space-y-2">
            <p className="font-semibold text-stone-800 uppercase tracking-wider text-[11px]">Cronograma de Pagos</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-stone-600">
              <div><strong>Hito 1 (Hoy):</strong> Reserva de USD {formatBlessUsd(BLESS_DREI_CONFIG.reservaUsd)} para asegurar la unidad.</div>
              <div><strong>Hito 2 (Contrato):</strong> Integración de cuota inicial a la firma (descontando la reserva).</div>
              <div><strong>Hito 3 (Febrero 2028):</strong> Saldo contra entrega de llaves (apto crédito bancario).</div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------
            SECCIÓN 8: #disponibilidad (Cotizador Interactivo 5 pasos)
            ---------------------------------------------------- */}
        <section id="disponibilidad" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45] flex items-center gap-1.5">
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
              Cotiza tu Unidad en Equipetrol
            </h3>
            <p className="text-sm text-[#57534E]">
              Elige tu ambiente, revisa pisos disponibles y visualiza tu inversión unificada en segundos.
            </p>
          </div>

          {/* Paso 1: Tipología */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Paso 1 · Elige la Tipología
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {AMBIENTE_OPTIONS.map((amb) => {
                const isSelected = selectedAmbId === amb.id;
                return (
                  <button
                    key={amb.id}
                    onClick={() => setSelectedAmbId(amb.id)}
                    className={`p-3 rounded-xl text-left transition-all border ${
                      isSelected
                        ? "bg-white border-[#9a7b45] shadow-md ring-1 ring-[#9a7b45]"
                        : "bg-white/80 border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <p className="text-xs font-bold text-stone-900">{amb.name}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">{amb.areaRange}</p>
                    <p className="text-xs font-semibold text-[#9a7b45] mt-1">
                      Desde USD {formatBlessUsd(amb.id === "mono" ? minPriceMono : minPrice1Dorm)}
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
              <button
                type="button"
                onClick={() => setZoom({
                  src: "/bless_drei/esquema-pisos.jpg",
                  title: "Distribución de pisos",
                  caption: "Pisos 7 a 14: monoambientes. Piso 6: áreas sociales. Pisos 1 a 5: monoambientes y 1 dormitorio. Planta baja y subsuelo: parqueos.",
                })}
                className="text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45] hover:text-[#816127]"
              >
                Ver distribución de pisos
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-2 rounded-xl bg-white border border-stone-200">
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
                        <span className={`text-[10px] font-semibold ${isSelected ? "text-[#e8d5a8]" : isLibre ? "text-emerald-600" : "text-stone-400"}`}>
                          {u.estado}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                        Modelo {u.modelo} · {u.superficieM2} m²
                      </p>
                      <p className={`text-xs font-bold mt-1 ${isSelected ? "text-white" : "text-[#9a7b45]"}`}>
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
                <Car size={16} className="text-[#9a7b45]" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Paso 3 · Opcional de Parqueo Vehicular (+USD 12.000)
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeParking}
                  onChange={(e) => setIncludeParking(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9a7b45]"></div>
              </label>
            </div>
            {includeParking && (
              <p className="text-xs text-stone-600 pt-1 border-t border-stone-100">
                Parqueo vehicular cubierto en planta baja/subsuelo añadido a la cotización unificada.
              </p>
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
                <p className={`text-[11px] mt-0.5 ${paymentPlan === "contado" ? "text-[#e8d5a8]" : "text-[#9a7b45]"}`}>
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

          {/* Tarjeta de resumen: inversión, cuota inicial y saldo. Sin plusvalía. */}
          {activeFinancials && (
            <div className="p-5 rounded-2xl bg-stone-900 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10">
                <span className="font-semibold text-[#e8d5a8]">
                  Resumen · Unidad {activeUnit?.codigo} (Piso {selectedFloor}, Modelo {activeUnit?.modelo})
                </span>
                <span className="text-stone-400">
                  Reserva con USD {formatBlessUsd(activeFinancials.reserva)}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                          En {BLESS_DREI_CONFIG.delivery}
                        </p>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* Paso 5: Botón WhatsApp de Acción Inmediata */}
              <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-stone-400 text-center sm:text-left">
                  Congela la unidad {activeUnit?.codigo} en Equipetrol con USD {formatBlessUsd(BLESS_DREI_CONFIG.reservaUsd)}.
                </p>
                <button
                  onClick={contactWhatsApp}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#9a7b45] active:scale-95"
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
        <section id="cierre" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200 pt-12 pb-16 text-center">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-stone-900">
              <ShieldCheck size={20} className="text-emerald-600" />
              <h4 className="font-serif text-lg font-bold">Garantía y Certeza Jurídica en Equipetrol</h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed [text-align:justify] [text-justify:inter-word]">
              La reserva formal de USD 2.000 se acredita íntegramente a tu cuota inicial. Contratos de preventa notariados con hitos claros de construcción respaldados por Alta Vida Santa Cruz.
            </p>
            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
              <span>Desarrollado y Construido por Alta Vida Santa Cruz</span>
              <button
                onClick={contactWhatsApp}
                className="font-semibold text-[#9a7b45] hover:underline flex items-center gap-1"
              >
                Hablar con Asesor de Bless Drei
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </section>
        </div>
      </div>

      {/* ========================================================
          4. ELEMENTOS FLOTANTES REACTIVOS
          ======================================================== */}
      {/* 4.1 Barra inferior flotante de conversión rápida */}
      {activeSection !== "cierre" && (
      <div className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-3 border-t border-stone-200 bg-[#f7f5f0]/95 px-5 py-3 backdrop-blur-md lg:left-[44%]">
        <div>
          <p className="text-xs text-stone-600">
            Reserva con <span className="font-semibold text-stone-900">USD {formatBlessUsd(BLESS_DREI_CONFIG.reservaUsd)}</span>
          </p>
          <p className="hidden text-[10px] font-medium text-[#9a7b45] sm:block">Congela precio en Equipetrol</p>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 border border-stone-300 bg-white px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-800 shadow-sm transition-all hover:bg-stone-100 active:scale-95"
        >
          {shareFeedback ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
          <span className="hidden sm:inline">Compartir</span>
        </button>
      </div>
      )}

      {/* 4.2 Burbuja flotante de menú de secciones. Solo después de pasar la barra. */}
      {showFloatingNav && (
      <div className="fixed bottom-20 right-4 z-[125] flex flex-col items-end sm:right-6 md:right-8">
        <button
          onClick={() => setShowSectionMenu(!showSectionMenu)}
          className="relative z-[128] flex h-11 w-11 items-center justify-center rounded-full border border-stone-800/80 bg-stone-900/95 text-white shadow-2xl"
          title="Menú de Secciones"
          aria-label="Secciones"
        >
          {showSectionMenu ? <X size={18} className="text-[#e8d5a8]" /> : <Menu size={18} className="text-[#e8d5a8]" />}
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
                  Secciones de Bless Drei
                </div>
                {[
                  { id: "intro", label: "Inicio & Resumen" },
                  { id: "lugar", label: "Ubicación en Equipetrol" },
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
                        ? "bg-[#9a7b45] text-white font-semibold"
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
      )}

      {/* 4.3 Modal Zoom HD de Planos */}
      <AnimatePresence>
        {zoom && (
          <div className="fixed inset-0 z-[130] overflow-y-auto bg-black/90 p-4" onClick={() => setZoom(null)}>
            <div className="mx-auto my-4 w-full max-w-3xl rounded-2xl border border-white/10 bg-stone-900 p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2 text-white">
                <div>
                  <h4 className="font-serif text-lg font-bold">{zoom.title}</h4>
                  <p className="text-xs text-stone-400">{zoom.caption}</p>
                </div>
                <button
                  onClick={() => setZoom(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white"
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>
              <img src={zoom.src} alt={zoom.title} className="mx-auto w-full bg-white" />
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
