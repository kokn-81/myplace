import { useInventory, onaInventory } from "../projectInventory";
import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Home,
  Layers,
  MapPin,
  Menu,
  MessageCircle,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import {
  ONA_ADDRESS,
  ONA_BROCHURE_URL,
  ONA_BUILDER,
  ONA_DELIVERY,
  ONA_PARKINGS,
  ONA_PARKINGS_PDF_URL,
  ONA_RESERVE_USD,
  ONA_UNITS,
  ONA_ZONE,
  OnaUnit,
  fetchOnaLiveUnits,
  formatOnaM2,
  formatOnaUsd,
} from "../onaInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

const PARKING_SIMPLE_USD = Math.min(...ONA_PARKINGS.filter((item) => item.kind === "simple").map((item) => item.price));
const PARKING_DOBLE_USD = Math.min(...ONA_PARKINGS.filter((item) => item.kind === "doble").map((item) => item.price));

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

const EQUIPAMIENTO = [
  {
    id: "cocina",
    room: "Cocina",
    title: "Cocina Equipada",
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
    room: "Dormitorio",
    title: "Dormitorio Principal",
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
    room: "Baño",
    title: "Baño Contemporáneo",
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
    id: "sala",
    room: "Sala y servicios",
    title: "Acceso Seguro y Conectividad",
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

type OnaRooms = "1" | "2" | "suite";
type OnaAddon = "none" | "simple" | "doble";
type OnaPlan = "contado" | "plan60" | "plan40";

type OnaModel = {
  id: string;
  rooms: OnaRooms;
  name: string;
  areaM2: number;
  where: string;
  detail: string;
  preview: string;
  plan: string;
  full: string;
  match: (unit: OnaUnit) => boolean;
};

const ONA_MODELS: OnaModel[] = [
  {
    id: "32",
    rooms: "1",
    name: "1 Dormitorio Master",
    areaM2: 32.3,
    where: "Vista lateral",
    detail: "Excelente distribución para vivienda práctica o inversión de alta demanda de alquiler en Santa Cruz.",
    preview: "/ona/tipo-32.jpg",
    plan: "/ona/planos/32.jpg",
    full: "/ona/fichas/32.jpg",
    match: (unit) => unit.rooms === 1,
  },
  {
    id: "54",
    rooms: "2",
    name: "2 Dormitorios Confort",
    areaM2: 54.14,
    where: "Vista lateral",
    detail: "Espacios versátiles para familias jóvenes, parejas o profesionales que requieren un ambiente extra de trabajo.",
    preview: "/ona/tipo-54.jpg",
    plan: "/ona/planos/54.jpg",
    full: "/ona/fichas/54.jpg",
    match: (unit) => unit.tipo === "1",
  },
  {
    id: "92-frente",
    rooms: "suite",
    name: "2 Dormitorios con Balcón Suite",
    areaM2: 92,
    where: "Vista Av. Los Cusis",
    detail: "La tipología más amplia de ONA Residences, con balcón terraza y vista hacia Av. Los Cusis.",
    preview: "/ona/tipo-92.jpg",
    plan: "/ona/planos/92.jpg",
    full: "/ona/fichas/92.jpg",
    match: (unit) => unit.tipo === "2",
  },
  {
    id: "92-posterior",
    rooms: "suite",
    name: "2 Dormitorios Suite Posterior",
    areaM2: 92.05,
    where: "Vista posterior",
    detail: "Suite de 2 dormitorios con balcón, en la fachada posterior.",
    preview: "/ona/tipo-92.jpg",
    plan: "/ona/planos/92.jpg",
    full: "/ona/fichas/92.jpg",
    match: (unit) => unit.tipo === "5",
  },
];

const SECTIONS = [
  { id: "intro", label: "Inicio" },
  { id: "lugar", label: "Ubicación" },
  { id: "amenidades", label: "Áreas sociales" },
  { id: "tipologias", label: "Tipologías" },
  { id: "equipamiento", label: "Equipamiento" },
  { id: "constructora", label: "Colaboradores" },
  { id: "pago", label: "Formas de pago" },
  { id: "disponibilidad", label: "Disponibilidad" },
  { id: "cierre", label: "Cierre" },
];

const ROOM_FILTERS: { id: OnaRooms; label: string }[] = [
  { id: "1", label: "1 dormitorio" },
  { id: "2", label: "2 dormitorios" },
  { id: "suite", label: "Suite 92 m²" },
];

type ModelZoom = {
  view: "depto" | "planta" | "ficha";
  title: string;
  caption: string;
  preview: string;
  plan: string;
  full: string;
};

type SheetZoom = {
  view: "solo";
  title: string;
  caption: string;
  src: string;
};

type ZoomState = ModelZoom | SheetZoom;

function unitCode(unit: OnaUnit) {
  return `T${unit.tipo}`;
}

function unitKey(unit: OnaUnit) {
  return `${unit.floor}-${unit.tipo}`;
}

function unitsForModel(list: OnaUnit[], model: OnaModel) {
  return list
    .filter(model.match)
    .slice()
    .sort((a, b) => a.floor - b.floor || a.tipo.localeCompare(b.tipo, "es", { numeric: true }));
}

function firstFreeKey(modelId: string, list: OnaUnit[]) {
  const model = ONA_MODELS.find((item) => item.id === modelId) || ONA_MODELS[0];
  const group = unitsForModel(list, model);
  const free = group.find((unit) => unit.status === "disponible") || group[0];
  return free ? unitKey(free) : "";
}

function minCash(list: OnaUnit[], match: (unit: OnaUnit) => boolean) {
  const free = list.filter((unit) => unit.status === "disponible" && match(unit));
  if (free.length === 0) return null;
  return Math.min(...free.map((unit) => unit.cash));
}

function ModelFrame({
  model,
  index,
  total,
  price,
  frameClass,
  onPrev,
  onNext,
  onOpen,
  onTouchStart,
  onTouchEnd,
}: {
  model: OnaModel;
  index: number;
  total: number;
  price?: string;
  frameClass: string;
  onPrev: () => void;
  onNext: () => void;
  onOpen: (view: "depto" | "planta") => void;
  onTouchStart: (event: TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: (event: TouchEvent<HTMLDivElement>) => void;
}) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm ${frameClass}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-100 px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{model.name}</p>
          <p className="truncate text-xs text-stone-600">{formatOnaM2(model.areaM2)} m² · {model.where}</p>
          <p className="line-clamp-1 text-xs leading-snug text-stone-500">{model.detail}</p>
          {price ? <p className="mt-0.5 text-sm font-semibold text-[#9a7b45]">{price}</p> : null}
        </div>
        <p className="shrink-0 pt-0.5 text-[11px] text-stone-400">{index + 1}/{total}</p>
      </div>
      <div className="relative min-h-0 flex-1 bg-white">
        <button type="button" onClick={() => onOpen("depto")} className="absolute inset-0 flex items-center justify-center p-2" aria-label={`Ver ${model.name} completo`}>
          <img src={model.preview} alt={`${model.name}, el departamento completo`} className="max-h-full max-w-full object-contain" />
        </button>
        {total > 1 && (
          <>
            <button type="button" onClick={onPrev} className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo anterior"><ChevronLeft size={22} /></button>
            <button type="button" onClick={onNext} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo siguiente"><ChevronRight size={22} /></button>
          </>
        )}
      </div>
      <button type="button" onClick={() => onOpen("planta")} className="flex h-[4.75rem] shrink-0 items-center gap-3 border-t border-stone-100 bg-[#f7f5f0] px-3 pr-16 text-left">
        <img src={model.plan} alt="" className="h-14 w-16 shrink-0 bg-white object-contain" />
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">En el piso</span>
          <span className="block text-xs leading-snug text-stone-600">Toca el departamento para verlo entero, o abre la planta.</span>
        </span>
      </button>
    </div>
  );
}

export default function OnaLanding({ property, onClose }: Props) {
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const introNavRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const modelTouch = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState("intro");
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [amenityIndex, setAmenityIndex] = useState(0);
  const [units, setUnits] = useInventory(onaInventory);
  const [rooms, setRooms] = useState<OnaRooms>("1");
  const [modelIndex, setModelIndex] = useState(0);
  const [selectedModelId, setSelectedModelId] = useState(ONA_MODELS[0].id);
  const [selectedKey, setSelectedKey] = useState(() => firstFreeKey(ONA_MODELS[0].id, ONA_UNITS));
  const [addon, setAddon] = useState<OnaAddon>("none");
  const [paymentPlan, setPaymentPlan] = useState<OnaPlan>("contado");
  const [zoom, setZoom] = useState<ZoomState | null>(null);

  useEffect(() => {
    fetchOnaLiveUnits().then((res) => {
      if (res.units && res.units.length > 0) setUnits(res.units);
    });
  }, []);

  const availableUnits = useMemo(() => units.filter((unit) => unit.status === "disponible"), [units]);
  const soldCount = units.filter((unit) => unit.status === "vendido").length;
  const reservedCount = units.filter((unit) => unit.status === "reservado").length;
  const freeCount = availableUnits.length;
  const ratePool = availableUnits;
  const minCashPerM2 = ratePool.length ? Math.min(...ratePool.map((unit) => unit.cashPerM2)) : null;
  const minPlan60PerM2 = ratePool.length ? Math.min(...ratePool.map((unit) => unit.plan60.perM2)) : null;
  const minPlan40PerM2 = ratePool.length ? Math.min(...ratePool.map((unit) => unit.plan40.perM2)) : null;
  const fromAny = minCash(units, () => true);
  const from1 = minCash(units, (unit) => unit.rooms === 1);
  const from2 = minCash(units, (unit) => unit.tipo === "1");
  const fromSuite = minCash(units, (unit) => unit.tipo === "2" || unit.tipo === "5");

  const slides = ONA_MODELS.filter((model) => model.rooms === rooms);
  const slideIndex = slides.length ? ((modelIndex % slides.length) + slides.length) % slides.length : 0;
  const currentModel = slides[slideIndex] || ONA_MODELS[0];
  const selectedModel = ONA_MODELS.find((model) => model.id === selectedModelId) || currentModel;
  const floors = unitsForModel(units, selectedModel);
  const activeUnit = floors.find((unit) => unitKey(unit) === selectedKey) || null;
  const quote = activeUnit && activeUnit.status === "disponible" ? quoteOnaUnit(activeUnit, paymentPlan, addon) : null;

  const roomCount = useMemo(() => {
    return {
      "1": ONA_MODELS.filter((model) => model.rooms === "1").length,
      "2": ONA_MODELS.filter((model) => model.rooms === "2").length,
      suite: ONA_MODELS.filter((model) => model.rooms === "suite").length,
    };
  }, []);

  useEffect(() => {
    const model = ONA_MODELS.find((item) => item.id === selectedModelId);
    if (!model) return;
    const group = unitsForModel(units, model);
    if (group.some((unit) => unitKey(unit) === selectedKey)) return;
    const free = group.find((unit) => unit.status === "disponible") || group[0];
    if (free) setSelectedKey(unitKey(free));
  }, [units, selectedModelId, selectedKey]);

  useEffect(() => {
    const root = rightPanelRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll("section[id]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      { root: window.matchMedia("(min-width: 1024px)").matches ? root : null, rootMargin: "-12% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const nav = introNavRef.current;
      if (!nav) return;
      const past = nav.getBoundingClientRect().bottom < 80;
      setShowFloatingNav(past);
      if (!past) setShowSectionMenu(false);
    };
    const desktop = rightPanelRef.current;
    const mobile = desktop?.parentElement;
    desktop?.addEventListener("scroll", onScroll, { passive: true });
    mobile?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      desktop?.removeEventListener("scroll", onScroll);
      mobile?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    setShowSectionMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const chooseModel = (model: OnaModel, list: OnaUnit[] = units) => {
    setSelectedModelId(model.id);
    setRooms(model.rooms);
    const group = ONA_MODELS.filter((item) => item.rooms === model.rooms);
    const index = group.findIndex((item) => item.id === model.id);
    if (index >= 0) setModelIndex(index);
    const nextUnits = unitsForModel(list, model);
    const free = nextUnits.find((unit) => unit.status === "disponible") || nextUnits[0];
    if (free) setSelectedKey(unitKey(free));
  };

  const chooseRooms = (next: OnaRooms) => {
    setRooms(next);
    setModelIndex(0);
    const first = ONA_MODELS.find((model) => model.rooms === next);
    if (first) chooseModel(first);
  };

  const shiftModel = (dir: number) => {
    if (slides.length < 2) return;
    const next = (slideIndex + dir + slides.length) % slides.length;
    setModelIndex(next);
    chooseModel(slides[next]);
  };

  const onModelSwipe = (event: TouchEvent<HTMLDivElement>) => {
    if (modelTouch.current == null || slides.length < 2) return;
    const dx = event.changedTouches[0].clientX - modelTouch.current;
    if (dx > 40) shiftModel(-1);
    if (dx < -40) shiftModel(1);
    modelTouch.current = null;
  };

  const openModel = (model: OnaModel, view: "depto" | "planta") => {
    setZoom({
      view,
      title: model.name,
      caption: `${formatOnaM2(model.areaM2)} m² · ${model.detail}`,
      preview: model.preview,
      plan: model.plan,
      full: model.full,
    });
  };

  const priceForModel = (model: OnaModel) => {
    const amount = minCash(units, model.match);
    return amount == null ? "Vendido" : `Desde USD ${formatOnaUsd(amount)}`;
  };

  const fromForRooms = (id: OnaRooms) => {
    if (id === "1") return from1;
    if (id === "2") return from2;
    return fromSuite;
  };

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/ona`;
    const shareTitle = "ONA Residences · Preventa en Los Cusis";
    const shareText = `Departamentos de 1 y 2 dormitorios en Los Cusis${fromAny ? ` desde USD ${formatOnaUsd(fromAny)}` : ""}. Entrega en ${ONA_DELIVERY}.`;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShareFeedback(true);
      window.setTimeout(() => setShareFeedback(false), 2200);
    } catch {
      setShareFeedback(false);
    }
  };

  const contactWhatsApp = () => {
    const phone = (property.agentWhatsapp || CONTACT_WHATSAPP_NUMBER).replace(/\D/g, "") || CONTACT_WHATSAPP_NUMBER;
    const planLabel = paymentPlan === "contado"
      ? "Contado 100%"
      : paymentPlan === "plan60"
        ? "Inicial 60% y saldo 40% contra entrega"
        : "Inicial 40% y saldo 60% contra entrega";
    const addonLabel = addon === "simple"
      ? `Parqueo simple USD ${formatOnaUsd(PARKING_SIMPLE_USD)} con baulera`
      : addon === "doble"
        ? `Parqueo doble USD ${formatOnaUsd(PARKING_DOBLE_USD)} con baulera`
        : "Sin parqueo";
    const unitLine = activeUnit
      ? `Unidad ${unitCode(activeUnit)}, piso ${activeUnit.floor}, ${selectedModel.name} (${formatOnaM2(activeUnit.totalM2)} m², ${activeUnit.view})`
      : "ONA Residences";
    const money = quote
      ? `\n• Inversión total: USD ${formatOnaUsd(quote.total)}\n• Cuota inicial: USD ${formatOnaUsd(quote.initial)}\n• Saldo contra entrega: ${paymentPlan === "contado" ? "sin saldo pendiente" : `USD ${formatOnaUsd(quote.balance)}`}`
      : "";
    const text = `Hola, vengo de N.I.A y quiero la unidad en ONA Residences (${ONA_ADDRESS}, ${ONA_ZONE}):\n\n• ${unitLine}\n• ${addonLabel}\n• Modalidad: ${planLabel}${money}\n• Reserva: USD ${formatOnaUsd(ONA_RESERVE_USD)}\n\n¿Sigue disponible y cuáles son los pasos para reservar?`;

    recordLeadEvent({
      action: "contact_tap",
      propertyRef: property.id,
      operacion: "Preventa",
      zona: property.zone || ONA_ZONE,
      presupuesto: quote ? `USD ${formatOnaUsd(quote.total)}` : undefined,
      extraFilters: activeUnit
        ? { unidad: unitCode(activeUnit), piso: activeUnit.floor, tipo: activeUnit.tipo, plan: paymentPlan, adicional: addon }
        : { plan: paymentPlan },
    }).catch(() => {});

    if (typeof window !== "undefined") {
      const browser = window as unknown as { trackOnaLead?: () => void; fbq?: (...args: unknown[]) => void };
      try {
        if (typeof browser.trackOnaLead === "function") browser.trackOnaLead();
        else if (typeof browser.fbq === "function") browser.fbq("track", "Lead", { content_name: "Ona Residences" });
      } catch {
        // El aviso de WhatsApp sigue aunque el pixel falle.
      }
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const amenity = AMENITY_SLIDES[amenityIndex];
  const mapsQuery = `${property.lat || -17.763513},${property.lng || -63.177111}`;

  return (
    <div className="nia-project-landing fixed inset-0 z-[100] flex flex-col overflow-y-auto overscroll-y-contain bg-[#f7f5f0] font-sans text-stone-900 md:flex-row md:overflow-hidden">
      <div className="fixed right-4 top-4 z-[120] flex items-center gap-2 md:right-7 md:top-7">
        <button type="button" onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-800 shadow-xl" aria-label="Compartir">
          {shareFeedback ? <Check size={18} className="text-emerald-600" /> : <Share2 size={18} />}
        </button>
        {onClose && (
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-700 shadow-xl" aria-label="Cerrar">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="relative flex h-[calc(100svh-3.75rem)] shrink-0 flex-col bg-[#f6edd9] md:h-screen md:w-[44%]">
        <div className="relative min-h-0 flex-1">
          <img src="/ona/fachada-atardecer.jpg" alt="Fachada completa de ONA Residences" className="absolute inset-0 h-full w-full object-contain object-center" />
        </div>
        <div className="relative z-10 shrink-0 bg-[#f6edd9] px-5 pb-3.5 pt-3 text-stone-900 md:px-8 md:pb-5 md:pt-4">
          <img src="/ona/ona-emblem.jpg" alt="ONA Residences" className="mb-2 h-8 w-8 rounded-full object-cover" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#9a7b45]/35 bg-white/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#816127] md:px-3 md:py-1 md:text-[11px]">
            <Sparkles size={12} />
            Preventa · 1.ª fase · {ONA_ZONE}
          </span>
          <h1 className="mt-1.5 font-serif text-[1.7rem] font-light leading-none tracking-wide text-[#1C1917] md:mt-2 md:text-4xl">ONA Residences</h1>
          <p className="mt-1 max-w-sm text-[11px] leading-snug text-stone-600 md:text-sm">{ONA_ADDRESS} entre Banzer y Beni</p>
          <div className="mt-2.5 grid max-w-sm grid-cols-2 gap-2 md:mt-3 md:gap-3">
            <div className="rounded-xl border border-[#e6dcc4] bg-white/80 p-2 md:p-3">
              <p className="text-[10px] uppercase tracking-wider text-stone-500">Entrega</p>
              <p className="mt-0.5 text-xs font-semibold text-stone-900 md:text-sm">{ONA_DELIVERY}</p>
            </div>
            <div className="rounded-xl border border-[#e6dcc4] bg-white/80 p-2 md:p-3">
              <p className="text-[10px] uppercase tracking-wider text-stone-500">Constructora</p>
              <p className="mt-0.5 text-xs font-semibold text-stone-900 md:text-sm">{ONA_BUILDER}</p>
            </div>
          </div>
          <div className="mt-2 max-w-sm rounded-xl border border-[#e6dcc4] bg-white/80 p-2.5 md:hidden">
            <div className="flex items-center justify-between border-b border-[#e6dcc4] pb-1.5 text-[10px] text-stone-500">
              <span className="font-semibold text-[#816127]">Precios al contado</span>
              <span>{freeCount} libres de {units.length}</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
              <div>
                <p className="text-[10px] text-stone-500">1 dormitorio</p>
                <p className="mt-0.5 font-serif text-[11px] font-bold leading-tight text-stone-900">{from1 == null ? "Agotado" : `USD ${formatOnaUsd(from1)}`}</p>
              </div>
              <div>
                <p className="text-[10px] text-stone-500">2 dormitorios</p>
                <p className="mt-0.5 font-serif text-[11px] font-bold leading-tight text-stone-900">{from2 == null ? "Agotado" : `USD ${formatOnaUsd(from2)}`}</p>
              </div>
              <div>
                <p className="text-[10px] text-stone-500">Suite 92 m²</p>
                <p className="mt-0.5 font-serif text-[11px] font-bold leading-tight text-stone-900">{fromSuite == null ? "Agotado" : `USD ${formatOnaUsd(fromSuite)}`}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={rightPanelRef} className="relative min-h-0 flex-1 md:h-screen md:overflow-y-auto">
        <div className="mx-auto max-w-xl px-5 py-8 pb-32 md:max-w-3xl md:px-10 md:py-14 md:pb-44 lg:max-w-4xl lg:px-14 xl:max-w-5xl">
          <section id="intro" className="scroll-mt-6 space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">
                <Sparkles size={13} />
                Experiencia residencial
              </span>
              <h2 className="font-serif text-3xl font-light leading-tight text-[#1C1917] md:text-5xl">
                Vive en ONA Residences.
                <span className="mt-1 block font-normal italic text-[#9a7b45]">Un proyecto pensado para elevar tu forma de vivir.</span>
              </h2>
              <p className="pt-2 text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word] md:text-base">
                ONA Residences reúne arquitectura contemporánea, diseño biofílico y ambientes pensados para combinar comodidad, bienestar y estilo en una de las zonas más serenas y cotizadas de Santa Cruz: {ONA_ZONE}. Un proyecto concebido por {ONA_BUILDER} para quienes entienden que el verdadero confort reside en despertar con calma, disfrutar áreas sociales completas y asegurar una sólida inversión patrimonial.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#E7E5E4] bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Lista de la 1.ª fase</p>
                <p className="mt-0.5 font-serif text-lg font-bold text-stone-900">
                  {soldCount} de {units.length} unidades vendidas{reservedCount > 0 ? ` · ${reservedCount} reservadas` : ""}
                </p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Quedan {freeCount}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => scrollToSection("disponibilidad")} className="flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md">
                Ver disponibilidad y cotizar
              </button>
              <a href={ONA_BROCHURE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-800">
                <Download size={15} className="text-[#9a7b45]" />
                Brochure
              </a>
            </div>
            <div ref={introNavRef} className="border-t border-stone-200 pt-4">
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400">Navegación del proyecto</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <button type="button" onClick={() => scrollToSection("intro")} className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 font-medium text-white"><Home size={12} /> Inicio</button>
                {SECTIONS.slice(1, 8).map((section) => (
                  <button key={section.id} type="button" onClick={() => scrollToSection(section.id)} className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-stone-700">{section.label}</button>
                ))}
              </div>
            </div>
          </section>

          <section id="lugar" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><MapPin size={13} /> Ubicación</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Los Cusis: calma residencial y conectividad total.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Ubicado estratégicamente sobre {ONA_ADDRESS}, en el tradicional cuadrante residencial de {ONA_ZONE} (entre Banzer y Beni). Combina el encanto de un vecindario arbolado y tranquilo con un acceso inmediato a las principales arterias comerciales y empresariales de Santa Cruz.
            </p>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <img src="/ona/ubicacion.jpg" alt="Mapa de ONA Residences en Los Cusis, entre Banzer y Beni" className="block h-auto w-full" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="border-l-2 border-[#9a7b45] pl-3">
                <p className="text-xs font-semibold text-stone-900">Conectividad 360°</p>
                <p className="mt-0.5 text-xs font-light text-stone-500">Acceso directo hacia el 2.º y 3.er Anillo, Equipetrol y los distritos empresariales.</p>
              </div>
              <div className="border-l-2 border-[#9a7b45] pl-3">
                <p className="text-xs font-semibold text-stone-900">Entorno gastronómico</p>
                <p className="mt-0.5 text-xs font-light text-stone-500">A minutos de restaurantes de autor, cafés de especialidad, colegios y supermercados.</p>
              </div>
              <div className="border-l-2 border-[#9a7b45] pl-3">
                <p className="text-xs font-semibold text-stone-900">Zona consolidada</p>
                <p className="mt-0.5 text-xs font-light text-stone-500">Zona residencial consolidada con demanda permanente de alquiler.</p>
              </div>
            </div>
            <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              Ver ubicación en Google Maps <ArrowRight size={14} />
            </a>
          </section>

          <section id="amenidades" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Áreas sociales</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Espacios pensados para disfrutar cada día.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Áreas comunes diseñadas para brindar comodidad, descanso y encuentros agradables con amigos y familia dentro del propio edificio.
            </p>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="relative">
                <img src={amenity.src} alt={amenity.title} className="aspect-[16/10] w-full object-cover" />
                <button type="button" onClick={() => setAmenityIndex((index) => (index + AMENITY_SLIDES.length - 1) % AMENITY_SLIDES.length)} className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Anterior amenidad"><ChevronLeft size={18} /></button>
                <button type="button" onClick={() => setAmenityIndex((index) => (index + 1) % AMENITY_SLIDES.length)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Siguiente amenidad"><ChevronRight size={18} /></button>
              </div>
              <div className="space-y-1.5 px-5 py-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">{amenity.category}</span>
                <h4 className="font-serif text-xl text-stone-900 md:text-2xl">{amenity.title}</h4>
                <p className="max-w-xl text-xs leading-relaxed text-stone-600">{amenity.description}</p>
              </div>
              <div className="flex justify-center gap-1.5 px-3 pb-3">
                {AMENITY_SLIDES.map((slide, index) => (
                  <button key={slide.title} type="button" onClick={() => setAmenityIndex(index)} className={`h-1.5 rounded-full ${amenityIndex === index ? "w-6 bg-[#9a7b45]" : "w-1.5 bg-stone-300"}`} aria-label={slide.title} />
                ))}
              </div>
            </div>
          </section>

          <section id="tipologias" className="mt-20 scroll-mt-2 border-t border-stone-200/80 pt-6">
            <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
              <div className="shrink-0">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><Layers size={13} /> Tipologías</span>
                <h3 className="font-serif text-2xl font-light leading-tight text-[#1C1917]">Un proyecto, distintas formas de vivirlo.</h3>
              </div>
              <div className="grid shrink-0 grid-cols-3 gap-2">
                {ROOM_FILTERS.map((filter) => (
                  <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-2xl border px-3 py-2 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white shadow-md ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white/80"}`}>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{filter.label}</p>
                    <p className="text-[11px] text-stone-500">{roomCount[filter.id]} {roomCount[filter.id] === 1 ? "planta" : "plantas"}</p>
                  </button>
                ))}
              </div>
              <ModelFrame
                model={currentModel}
                index={slideIndex}
                total={slides.length}
                frameClass="min-h-0 flex-1"
                onPrev={() => shiftModel(-1)}
                onNext={() => shiftModel(1)}
                onOpen={(view) => openModel(currentModel, view)}
                onTouchStart={(event) => { touchX.current = event.changedTouches[0].clientX; }}
                onTouchEnd={(event) => {
                  if (touchX.current == null || slides.length < 2) return;
                  const dx = event.changedTouches[0].clientX - touchX.current;
                  if (dx > 40) shiftModel(-1);
                  if (dx < -40) shiftModel(1);
                  touchX.current = null;
                }}
              />
            </div>
          </section>

          <section id="equipamiento" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><CheckCircle2 size={13} /> Equipamiento</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Lo que incluye tu departamento.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              En ONA Residences cada departamento se entrega con equipamiento completo de primera calidad, listo para habitar o poner en alquiler de inmediato sin gastos imprevistos de habilitación.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {EQUIPAMIENTO.map((group) => (
                <div key={group.id} className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                  <img src={group.image} alt={group.title} className="max-h-[320px] w-full bg-stone-100 object-contain" />
                  <div className="space-y-2 px-4 py-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">{group.room}</span>
                    <h4 className="font-serif text-base font-bold text-stone-900">{group.title}</h4>
                    <ul className="space-y-1.5 border-t border-stone-100 pt-2 text-xs text-stone-600">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-start gap-1.5"><span className="font-bold text-[#9a7b45]">·</span><span>{item}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <a href="/ona/especificaciones-equipamiento.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              Ver planilla de equipamiento <ExternalLink size={14} />
            </a>
          </section>

          <section id="constructora" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><Building2 size={13} /> Constructora</span>
            <img src="/ona/ona-emblem.jpg" alt="ONA Residences" className="h-14 w-auto" />
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Constructora Palacios Antúnez</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Más de cuatro décadas de solidez técnica, arquitectura y rigor en la ejecución. Conoce a los profesionales y la trayectoria familiar detrás de ONA Residences.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-stone-200 bg-white p-4 text-center">
                <p className="font-serif text-2xl font-light text-stone-900">+42 años</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">Trayectoria profesional</p>
                <p className="mt-2 text-xs text-stone-600">Arquitectura e ingeniería con formación académica en Brasil y ejercicio continuo en Bolivia desde 1984.</p>
              </div>
              <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-stone-200 bg-white p-4 text-center">
                <p className="font-serif text-2xl font-light text-stone-900">Diversidad técnica</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">Alcance constructivo</p>
                <p className="mt-2 text-xs text-stone-600">Edificios residenciales, hospitales, clínicas de salud, naves industriales y desarrollos corporativos.</p>
              </div>
              <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-stone-200 bg-white p-4 text-center">
                <p className="font-serif text-2xl font-light text-stone-900">Dirección propia</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">Garantía de obra</p>
                <p className="mt-2 text-xs text-stone-600">Supervisión técnica directa de los arquitectos fundadores en obra, garantizando precisión de cálculo y entrega en plazo.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#9a7b45]/30 bg-[#fbf9f4] p-6">
              <p className="font-serif text-base italic leading-relaxed text-stone-800 md:text-xl">
                “Cada edificio entregado representa una promesa cumplida. El esfuerzo de un gran equipo y la confianza de cientos de familias que creyeron en nosotros. La experiencia nos enseña que la confianza no se pide, se gana: y eso es lo que honramos en ONA.”
              </p>
              <p className="mt-4 border-t border-[#9a7b45]/20 pt-3 text-xs font-semibold text-stone-800">Constructora Palacios Antúnez</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-950">
              <video controls playsInline preload="metadata" poster="/ona/ona-emblem.jpg" className="mx-auto max-h-[420px] w-full object-contain">
                <source src="/ona/video-desarrollador.mp4" type="video/mp4" />
              </video>
              <p className="px-4 py-3 text-xs text-stone-300">Arq. Palacios · Palacios Antúnez</p>
            </div>
          </section>

          <section id="pago" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Formas de pago</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Planes de pago flexibles adaptados a tu estrategia.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Elige cómo distribuir tu capital durante el proceso constructivo con entrega programada para {ONA_DELIVERY}.
            </p>
            <article className="rounded-2xl bg-stone-900 p-5 text-white shadow-lg">
              <span className="rounded-full bg-[#C19A6B] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950">Mayor descuento</span>
              <h4 className="mt-3 font-serif text-2xl">Pago al contado (100%)</h4>
              {minCashPerM2 != null && <p className="mt-2 font-serif text-3xl text-[#E8D5A8]">Desde USD {formatOnaUsd(minCashPerM2)}/m²</p>}
              <p className="mt-3 text-sm leading-relaxed text-stone-300">El valor varía según la unidad y la vista. Elige tu departamento en el cotizador para conocer su tarifa exacta y comparar las modalidades de pago.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">Equilibrio financiero</span>
              <h4 className="mt-3 font-serif text-2xl leading-snug">Inicial 60% y saldo 40% contra entrega</h4>
              {minPlan60PerM2 != null && <p className="mt-2 font-serif text-3xl text-stone-900">Desde USD {formatOnaUsd(minPlan60PerM2)}/m²</p>}
              <p className="mt-3 text-sm leading-relaxed text-stone-600">Congelas tu unidad con un precio por metro cuadrado muy por debajo del promedio del mercado y pagas el 40% restante recién cuando la obra esté 100% finalizada.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">Entrada cómoda</span>
              <h4 className="mt-3 font-serif text-2xl leading-snug">Inicial 40% y saldo 60% contra entrega</h4>
              {minPlan40PerM2 != null && <p className="mt-2 font-serif text-3xl text-stone-900">Desde USD {formatOnaUsd(minPlan40PerM2)}/m²</p>}
              <p className="mt-3 text-sm leading-relaxed text-stone-600">El menor desembolso de entrada para ingresar a un edificio de categoría en {ONA_ZONE}. Aseguras la propiedad hoy y cancelas el 60% en {ONA_DELIVERY}.</p>
            </article>
            <div className="space-y-2 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
              <p>Parqueo simple por USD {formatOnaUsd(PARKING_SIMPLE_USD)} o parqueo doble por USD {formatOnaUsd(PARKING_DOBLE_USD)}. Cada parqueo incluye una baulera y se cotiza aparte del metro cuadrado.</p>
              <a href={ONA_PARKINGS_PDF_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#816127]">
                Ver parqueos <ExternalLink size={14} />
              </a>
            </div>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
              Elegir mi departamento <ArrowRight size={14} />
            </button>
          </section>

          <section id="disponibilidad" className="mt-20 scroll-mt-2 space-y-6 border-t border-stone-200/80 pt-6">
            <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
              <div className="shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Disponibilidad</span>
                <h3 className="font-serif text-2xl font-light leading-tight text-[#1C1917]">Selecciona tu unidad y simula tu inversión al instante.</h3>
                <p className="mt-1 text-xs text-stone-500">Lista de la 1.ª fase. Verde: disponible · Gris: vendido o reservado.</p>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 1 · Tipología</p>
                <div className="grid shrink-0 grid-cols-3 gap-2">
                  {ROOM_FILTERS.map((filter) => {
                    const from = fromForRooms(filter.id);
                    return (
                      <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-xl border p-3 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white"}`}>
                        <p className="text-sm font-bold">{filter.label}</p>
                        <p className="text-[11px] text-[#9a7b45]">{from == null ? "Sin unidades libres" : `Desde USD ${formatOnaUsd(from)}`}</p>
                      </button>
                    );
                  })}
                </div>
                <ModelFrame
                  model={currentModel}
                  index={slideIndex}
                  total={slides.length}
                  price={priceForModel(currentModel)}
                  frameClass="min-h-0 flex-1"
                  onPrev={() => shiftModel(-1)}
                  onNext={() => shiftModel(1)}
                  onOpen={(view) => openModel(currentModel, view)}
                  onTouchStart={(event) => { modelTouch.current = event.changedTouches[0].clientX; }}
                  onTouchEnd={onModelSwipe}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold uppercase tracking-wider text-stone-500">Paso 2 · Piso</span>
                <button type="button" onClick={() => setZoom({ view: "solo", src: "/ona/esquema.jpg", title: "Distribución de pisos", caption: "Planta tipo, área social, primer piso, planta baja y subsuelo." })} className="font-semibold text-[#816127]">
                  Ver distribución de pisos
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-stone-200 bg-white p-2 sm:grid-cols-5">
                {floors.map((floor) => {
                  const current = activeUnit ? unitKey(activeUnit) === unitKey(floor) : false;
                  const libre = floor.status === "disponible";
                  return (
                    <button key={unitKey(floor)} type="button" disabled={!libre} onClick={() => setSelectedKey(unitKey(floor))} className={`rounded-lg px-1 py-2 text-xs font-semibold ${current ? "bg-stone-900 text-white" : libre ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "cursor-not-allowed bg-stone-100 text-stone-400"}`}>
                      <span className="block">Piso {floor.floor}</span>
                      <span className="block text-[10px] font-normal">Unidad {unitCode(floor)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 3 · Adicional</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {([
                  ["none", "Sin adicional", "Solo el departamento"],
                  ["simple", "Parqueo simple", `USD ${formatOnaUsd(PARKING_SIMPLE_USD)}`],
                  ["doble", "Parqueo doble", `USD ${formatOnaUsd(PARKING_DOBLE_USD)}`],
                ] as const).map(([id, label, hint]) => (
                  <button key={id} type="button" onClick={() => setAddon(id)} className={`rounded-xl border p-3 text-left ${addon === id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                    <p className="text-sm font-bold">{label}</p>
                    <p className={`text-[11px] ${addon === id ? "text-stone-300" : "text-stone-500"}`}>{hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 4 · Plan de pago</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button type="button" onClick={() => setPaymentPlan("contado")} className={`rounded-xl border p-3 text-left ${paymentPlan === "contado" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                  <p className="text-sm font-bold">Contado</p>
                  <p className={`text-[11px] ${paymentPlan === "contado" ? "text-[#E8D5A8]" : "text-[#9a7b45]"}`}>100% a la firma{minCashPerM2 != null ? ` · desde USD ${formatOnaUsd(minCashPerM2)}/m²` : ""}</p>
                </button>
                <button type="button" onClick={() => setPaymentPlan("plan60")} className={`rounded-xl border p-3 text-left ${paymentPlan === "plan60" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                  <p className="text-sm font-bold">Inicial 60%</p>
                  <p className={`text-[11px] ${paymentPlan === "plan60" ? "text-stone-300" : "text-stone-500"}`}>60% a la firma · 40% contra entrega</p>
                </button>
                <button type="button" onClick={() => setPaymentPlan("plan40")} className={`rounded-xl border p-3 text-left ${paymentPlan === "plan40" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                  <p className="text-sm font-bold">Inicial 40%</p>
                  <p className={`text-[11px] ${paymentPlan === "plan40" ? "text-stone-300" : "text-stone-500"}`}>40% a la firma · 60% contra entrega</p>
                </button>
              </div>
            </div>

            {activeUnit && activeUnit.status !== "disponible" && (
              <p className="rounded-xl border border-stone-200 bg-stone-100 p-4 text-sm text-stone-600">
                La unidad {unitCode(activeUnit)} del piso {activeUnit.floor} figura {activeUnit.status === "reservado" ? "reservada" : "vendida"}. Elige otro piso.
              </p>
            )}

            {activeUnit && quote && (
              <div className="space-y-4 rounded-2xl bg-stone-900 p-5 text-white shadow-xl">
                <div className="border-b border-white/10 pb-3 text-xs text-[#E8D5A8]">
                  Unidad {unitCode(activeUnit)} · Piso {activeUnit.floor} · {selectedModel.name} · {formatOnaM2(activeUnit.totalM2)} m² · {activeUnit.view}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Inversión total</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatOnaUsd(quote.total)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">USD {formatOnaUsd(quote.rate)}/m²{quote.parking ? ` + adicional USD ${formatOnaUsd(quote.parking)}` : ""}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Cuota inicial ({paymentPlan === "contado" ? "100" : paymentPlan === "plan60" ? "60" : "40"}%)</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight text-emerald-400"><span className="block font-mono text-xs font-normal text-emerald-500/80">USD</span>{formatOnaUsd(quote.initial)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">A la firma del contrato</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Saldo contra entrega</p>
                    {paymentPlan === "contado" ? (
                      <>
                        <p className="mt-1 font-serif text-2xl font-bold leading-tight text-stone-500"><span className="block font-mono text-xs font-normal text-stone-500">USD</span>—</p>
                        <p className="mt-1 text-[10px] text-stone-400">Sin saldo pendiente</p>
                      </>
                    ) : (
                      <>
                        <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatOnaUsd(quote.balance)}</p>
                        <p className="mt-1 text-[10px] text-stone-400">{paymentPlan === "plan60" ? "40%" : "60%"} en {ONA_DELIVERY}</p>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-400">La reserva de USD {formatOnaUsd(ONA_RESERVE_USD)} se descuenta de la cuota inicial.</p>
                <button type="button" onClick={contactWhatsApp} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-900">
                  <MessageCircle size={16} />
                  Quiero la unidad {unitCode(activeUnit)}
                </button>
              </div>
            )}
          </section>

          <section id="cierre" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200 pt-12 pb-16 text-center">
            <h3 className="font-serif text-3xl font-light text-[#1C1917]">Asegura tu unidad al valor de 1.ª fase.</h3>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-600">
              Reserva hoy tu departamento con USD {formatOnaUsd(ONA_RESERVE_USD)} y congela el precio antes de la siguiente escala de preventa. Si tienes dudas, escribe y te ayudamos a elegir la unidad.
            </p>
            <button type="button" onClick={contactWhatsApp} className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              Hablar con un asesor <ArrowRight size={14} />
            </button>
          </section>
        </div>
      </div>

      {activeSection !== "cierre" && (
        <div className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-3 border-t border-stone-200 bg-[#f7f5f0]/95 px-5 py-3 backdrop-blur-md lg:left-[44%]">
          <div>
            <p className="text-xs text-stone-700">{fromAny == null ? ONA_DELIVERY : `Desde USD ${formatOnaUsd(fromAny)} · ${ONA_DELIVERY}`}</p>
            <p className="hidden text-[10px] font-medium text-[#9a7b45] sm:block">Reserva USD {formatOnaUsd(ONA_RESERVE_USD)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a href={ONA_BROCHURE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-stone-800">
              <Download size={14} className="text-[#9a7b45]" />
              Brochure
            </a>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="rounded-lg bg-[#1C1917] px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white">
              Elegir unidad
            </button>
          </div>
        </div>
      )}

      {showFloatingNav && (
        <div className="fixed bottom-20 right-4 z-[125] flex flex-col items-end sm:right-6 md:right-8">
          <button type="button" onClick={() => setShowSectionMenu((open) => !open)} className="relative z-[128] flex h-11 w-11 items-center justify-center rounded-full border border-stone-800/80 bg-stone-900/95 text-white shadow-2xl" aria-label="Secciones">
            {showSectionMenu ? <X size={18} className="text-[#e8d5a8]" /> : <Menu size={18} className="text-[#e8d5a8]" />}
          </button>
          <AnimatePresence>
            {showSectionMenu && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute bottom-14 right-0 z-[115] w-56 space-y-1 rounded-2xl border border-stone-200 bg-white/95 p-2.5 text-xs shadow-2xl">
                {SECTIONS.map((section) => (
                  <button key={section.id} type="button" onClick={() => scrollToSection(section.id)} className={`w-full rounded-lg px-3 py-2 text-left font-medium ${activeSection === section.id ? "bg-[#9a7b45]/15 font-semibold text-[#816127]" : "text-stone-700"}`}>
                    {section.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {zoom && (
          <div className="fixed inset-0 z-[140] flex flex-col bg-[#f7f5f0]" role="dialog" aria-modal="true" aria-label={zoom.title}>
            <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-8">
              <div className="min-w-0">
                <h4 className="font-serif text-xl text-stone-900">{zoom.title}</h4>
                <p className="line-clamp-2 text-xs text-stone-500">{zoom.caption}</p>
              </div>
              <button type="button" onClick={() => setZoom(null)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 shadow-sm" aria-label="Cerrar vista">
                <X size={18} />
              </button>
            </div>
            {zoom.view !== "solo" && (
              <div className="flex justify-center gap-1.5 px-4 pb-2">
                {(["depto", "planta", "ficha"] as const).map((view) => (
                  <button key={view} type="button" onClick={() => setZoom({ ...zoom, view })} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${zoom.view === view ? "bg-stone-900 text-white" : "border border-stone-200 bg-white text-stone-600"}`}>
                    {view === "depto" ? "Departamento" : view === "planta" ? "Planta" : "Ficha"}
                  </button>
                ))}
              </div>
            )}
            <div className="flex min-h-0 flex-1 items-center justify-center px-3 pb-4 md:px-10">
              <img
                src={zoom.view === "solo" ? zoom.src : zoom.view === "planta" ? zoom.plan : zoom.view === "ficha" ? zoom.full : zoom.preview}
                alt={zoom.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function quoteOnaUnit(unit: OnaUnit, plan: OnaPlan, addon: OnaAddon) {
  let total = unit.cash;
  let initial = unit.cash;
  let balance = 0;
  let rate = unit.cashPerM2;
  if (plan === "plan60") {
    total = unit.plan60.total;
    initial = unit.plan60.initial;
    balance = unit.plan60.total - unit.plan60.initial;
    rate = unit.plan60.perM2;
  } else if (plan === "plan40") {
    total = unit.plan40.total;
    initial = unit.plan40.initial;
    balance = unit.plan40.total - unit.plan40.initial;
    rate = unit.plan40.perM2;
  }
  const parking = addon === "simple" ? PARKING_SIMPLE_USD : addon === "doble" ? PARKING_DOBLE_USD : 0;
  const parkingInitial = plan === "contado" ? parking : plan === "plan60" ? Math.round(parking * 0.6) : Math.round(parking * 0.4);
  return {
    total: total + parking,
    initial: initial + parkingInitial,
    balance: balance + (parking - parkingInitial),
    rate,
    parking,
  };
}
