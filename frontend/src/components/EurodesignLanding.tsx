import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
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
import { eurodesignInventory, useInventory } from "../projectInventory";
import {
  EURODESIGN_ADDRESS,
  EURODESIGN_BAULERA_USD,
  EURODESIGN_CONFIG,
  EURODESIGN_DELIVERY,
  EURODESIGN_PARKING_USD,
  EURODESIGN_ZONE,
  EurodesignUnit,
  formatEurodesignUsd,
} from "../eurodesignInventory";
import { EURODESIGN_MODELOS, matchesEurodesignModel, type EurodesignModel } from "../eurodesignModels";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

type RoomFilter = "1" | "2" | "0";
type PlanId = "contado" | "cuotas";
type AddonId = "none" | "parking" | "baulera";

type Slide = {
  id: string;
  name: string;
  areaLabel: string;
  where: string;
  detail: string;
  preview: string;
  full: string;
  areaNote?: string;
  model?: EurodesignModel;
  unitNumber?: string;
};

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

const AMENITY_SLIDES = [
  {
    src: "/eurodesign/amenities/amenity_piscina_dia.jpg",
    category: "Piso 18 Rooftop",
    title: "Tu pausa en la piscina, con otra vista",
    description: "Refréscate, descansa en las reposeras y disfruta del solárium con vistas abiertas desde el rooftop del piso 18.",
  },
  {
    src: "/eurodesign/amenities/amenity_piscina_skybar.jpg",
    category: "Rooftop & Coctelería",
    title: "Tus encuentros, en las alturas",
    description: "Comparte una conversación y disfruta la vista de la ciudad en el ambiente social del sky bar junto a la piscina.",
  },
  {
    src: "/eurodesign/amenities/amenity_sala_lounge.jpg",
    category: "Social & Eventos",
    title: "Un lounge para compartir a gusto",
    description: "Recibe a tus visitas en un espacio con sofás, mesas y vistas a la ciudad. Tus encuentros también tienen lugar fuera del departamento.",
  },
  {
    src: "/eurodesign/amenities/amenity_gimnasio.jpg",
    category: "Fitness & Bienestar",
    title: "Entrena con Equipetrol a la vista",
    description: "Mantén tu rutina de cardio y fuerza en un gimnasio climatizado, cerca de casa y con vista a Equipetrol.",
  },
  {
    src: "/eurodesign/amenities/amenity_lobby_recepcion.jpg",
    category: "Acceso & Seguridad",
    title: "Lobby de Doble Altura con Seguridad 24/7",
    description: "Ingreso imponente revestido en porcelanato de gran formato y celosías de madera noble, mesón de recepción, control de acceso automatizado y doble ascensor.",
  },
  {
    src: "/eurodesign/amenities/amenity_lobby_lounge.jpg",
    category: "Recepción & Espera",
    title: "Una bienvenida para ti y tus visitas",
    description: "Un estar amoblado en el ingreso para esperar, recibir y empezar a sentirte en casa.",
  },
  {
    src: "/eurodesign/amenities/amenity_living_panoramico.jpg",
    category: "Interiores",
    title: "Master Suite & Living Panorámico",
    description: "Cocina integrada, mobiliario alto y bajo, y mesón de piedra sinterizada o granito.",
  },
  {
    src: "/eurodesign/amenities/amenity_rooftop_overview.jpg",
    category: "Piso 18 Rooftop",
    title: "Distribución Panorámica de Áreas Sociales",
    description: "Planta completa de amenidades en el piso 18 conectando solárium, piscina infinita, parrillas gourmet, gimnasio y lounge climatizado.",
  },
  {
    src: "/eurodesign/amenities/amenity_locales_comerciales.jpg",
    category: "Planta Baja",
    title: "Locales Comerciales & Oficinas en PB",
    description: "Espacios de doble altura sobre calle Enrique Finot con vitrinas comerciales de alto tráfico peatonal y vehicular en Equipetrol Norte.",
  },
];

const EQUIPAMIENTO = [
  {
    id: "cocina",
    room: "Cocina",
    title: "Una cocina lista para tu día a día",
    image: "/eurodesign/amenities/amenity_living_panoramico.jpg",
    contain: false,
    items: [
      "Cocina a gas, extractor y horno eléctrico",
      "Microondas de empotrar en mueble",
      "Mesones de piedra sinterizada o granito",
      "Mobiliario alto y bajo en cocina",
    ],
  },
  {
    id: "bano",
    room: "Baño",
    title: "Tu espacio para empezar y cerrar el día",
    image: "/eurodesign/bano.jpg",
    contain: true,
    items: [
      "Espejos con iluminación LED",
      "Box de ducha",
      "Accesorios de baño y mueble bajo mesón",
      "Termotanque eléctrico",
    ],
  },
  {
    id: "confort",
    room: "Departamento",
    title: "El confort se siente en cada ambiente",
    image: "/eurodesign/modelos/2d-01-82.jpg",
    contain: true,
    items: [
      "Aires acondicionados tipo split, frío-calor, en dormitorios y sala",
      "Lavandería de porcelanato, según el modelo de departamento",
    ],
  },
  {
    id: "accesos",
    room: "Edificio",
    title: "Detalles que te acompañan al llegar",
    image: "/eurodesign/amenities/amenity_lobby_recepcion.jpg",
    contain: false,
    items: [
      "Intercomunicador en cada departamento",
      "Sistema contra incendios",
      "Luminaria decorativa en áreas de circulación exterior",
    ],
  },
];

const SECTIONS = [
  { id: "intro", label: "Inicio" },
  { id: "lugar", label: "Ubicación" },
  { id: "amenidades", label: "Áreas sociales" },
  { id: "tipologias", label: "Tipologías" },
  { id: "equipamiento", label: "Equipamiento" },
  { id: "constructora", label: "Constructora" },
  { id: "pago", label: "Formas de pago" },
  { id: "disponibilidad", label: "Disponibilidad" },
  { id: "cierre", label: "Cierre" },
];

const ROOM_FILTERS: { id: RoomFilter; label: string }[] = [
  { id: "1", label: "1 dormitorio" },
  { id: "2", label: "2 dormitorios" },
  { id: "0", label: "Locales" },
];

const ADDONS: { id: AddonId; label: string; hint: string }[] = [
  { id: "none", label: "Sin adicional", hint: "Solo el departamento" },
  { id: "parking", label: "Parqueo", hint: `USD ${formatEurodesignUsd(EURODESIGN_PARKING_USD)}` },
  { id: "baulera", label: "Baulera", hint: `USD ${formatEurodesignUsd(EURODESIGN_BAULERA_USD)}` },
];

function addonAmount(addon: AddonId) {
  if (addon === "parking") return EURODESIGN_PARKING_USD;
  if (addon === "baulera") return EURODESIGN_BAULERA_USD;
  return 0;
}

function minCash(list: EurodesignUnit[]) {
  const free = list.filter((unit) => unit.status === "disponible" && unit.cashTotal > 0);
  return free.length ? Math.min(...free.map((unit) => unit.cashTotal)) : null;
}

function coverSpan(values: number[]) {
  const sizes = values.filter((value) => value > 0);
  if (sizes.length === 0) return "";
  const low = Math.round(Math.min(...sizes));
  const high = Math.round(Math.max(...sizes));
  return low === high ? `${low} m²` : `${low} a ${high} m²`;
}

function slidesFor(filter: RoomFilter, units: EurodesignUnit[]): Slide[] {
  if (filter === "0") {
    return units
      .filter((unit) => unit.floor === 0)
      .map((unit) => ({
        id: unit.unitNumber,
        name: unit.unitNumber,
        areaLabel: `${unit.areaM2.toLocaleString("es-BO")} m²`,
        where: "Planta baja",
        detail: unit.tipoLabel,
        preview: "/eurodesign/amenities/amenity_locales_comerciales.jpg",
        full: "/eurodesign/page-32-locales-comerciales.jpg",
        unitNumber: unit.unitNumber,
      }));
  }
  const rooms = filter === "1" ? 1 : 2;
  return EURODESIGN_MODELOS.filter((model) => model.rooms === rooms).map((model) => ({
    id: model.id,
    name: model.name,
    areaLabel: model.area,
    where: model.units,
    detail: model.note || (model.id.endsWith("p4") ? "Piso 4" : "Pisos 5 a 17"),
    preview: model.preview,
    full: model.full,
    areaNote: model.note,
    model,
  }));
}

function unitsForSlide(slide: Slide, units: EurodesignUnit[]) {
  if (slide.unitNumber) return units.filter((unit) => unit.unitNumber === slide.unitNumber);
  if (!slide.model) return [];
  return units.filter((unit) => matchesEurodesignModel(slide.model as EurodesignModel, unit));
}

function priceLabel(slide: Slide, units: EurodesignUnit[]) {
  const matching = unitsForSlide(slide, units);
  const free = matching.filter((unit) => unit.status === "disponible");
  if (free.length) return `Desde USD ${formatEurodesignUsd(Math.min(...free.map((unit) => unit.cashTotal)))}`;
  if (matching.some((unit) => unit.status === "reservado")) return "Reservado";
  return "Vendido";
}

function ModelFrame({
  slide,
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
  slide: Slide;
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
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{slide.name}</p>
          <p className="truncate text-xs text-stone-600">{slide.areaLabel} · {slide.where}</p>
          <p className="line-clamp-1 text-xs leading-snug text-stone-500">{slide.detail}</p>
          {price ? <p className="mt-0.5 text-sm font-semibold text-[#9a7b45]">{price}</p> : null}
        </div>
        <p className="min-w-[4.25rem] shrink-0 rounded-full border border-[#9a7b45]/40 bg-[#f7f5f0] px-3 py-1.5 text-center text-base font-bold leading-none tabular-nums text-[#816127] shadow-sm sm:text-lg" title={`Modelo ${index + 1} de ${total}`}>{index + 1}/{total}</p>
      </div>
      <div className="relative min-h-0 flex-1 bg-white">
        <button type="button" onClick={() => onOpen("depto")} className="absolute inset-0 flex items-center justify-center p-2" aria-label={`Ver ${slide.name} completo`}>
          <img src={slide.preview} alt={`${slide.name}, el departamento completo`} className="max-h-full max-w-full object-contain" />
        </button>
        {total > 1 && (
          <>
            <button type="button" onClick={onPrev} className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo anterior"><ChevronLeft size={22} /></button>
            <button type="button" onClick={onNext} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo siguiente"><ChevronRight size={22} /></button>
          </>
        )}
      </div>
      <button type="button" onClick={() => onOpen("planta")} className="flex h-[4.75rem] shrink-0 items-center gap-3 border-t border-stone-100 bg-[#f7f5f0] px-3 pr-16 text-left">
        <img src={slide.full} alt="" className="h-14 w-16 shrink-0 bg-white object-contain" />
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">En el piso</span>
          <span className="block text-xs leading-snug text-stone-600">Toca el departamento para verlo entero, o abre la planta.</span>
        </span>
      </button>
      {slide.areaNote ? <p className="shrink-0 px-3 py-1.5 text-center text-[11px] text-stone-500">{slide.areaNote}</p> : null}
    </div>
  );
}

export default function EurodesignLanding({ property, onClose }: Props) {
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const introNavRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const modelTouch = useRef<number | null>(null);
  const [units] = useInventory(eurodesignInventory);
  const [activeSection, setActiveSection] = useState("intro");
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [amenityIndex, setAmenityIndex] = useState(0);
  const [rooms, setRooms] = useState<RoomFilter>("1");
  const [modelIndex, setModelIndex] = useState(0);
  const [selectedSlideId, setSelectedSlideId] = useState("d03");
  const [selectedUnitNumber, setSelectedUnitNumber] = useState("");
  const [addon, setAddon] = useState<AddonId>("none");
  const [paymentPlan, setPaymentPlan] = useState<PlanId>("contado");
  const [zoom, setZoom] = useState<ZoomState | null>(null);

  useEffect(() => {
    void eurodesignInventory.refresh();
  }, []);

  const slides = useMemo(() => slidesFor(rooms, units), [rooms, units]);
  const slideIndex = slides.length ? ((modelIndex % slides.length) + slides.length) % slides.length : 0;
  const currentSlide = slides[slideIndex];
  const selectedSlide = slides.find((slide) => slide.id === selectedSlideId) || currentSlide;
  const floors = selectedSlide ? unitsForSlide(selectedSlide, units).slice().sort((a, b) => a.floor - b.floor || a.unitNumber.localeCompare(b.unitNumber)) : [];
  const activeUnit = floors.find((unit) => unit.unitNumber === selectedUnitNumber) || floors.find((unit) => unit.status === "disponible") || floors[0] || null;
  const freeUnits = units.filter((unit) => unit.status === "disponible");
  const soldCount = units.filter((unit) => unit.status === "vendido").length;
  const reservedCount = units.filter((unit) => unit.status === "reservado").length;
  const from1 = minCash(units.filter((unit) => unit.rooms === 1));
  const from2 = minCash(units.filter((unit) => unit.rooms === 2));
  const fromLocal = minCash(units.filter((unit) => unit.floor === 0));
  const fromAny = minCash(units);
  const extra = addonAmount(addon);
  const quote = activeUnit && activeUnit.status === "disponible"
    ? paymentPlan === "contado"
      ? {
          total: activeUnit.cashTotal + extra,
          initial: activeUnit.cashTotal + extra,
          balance: null as number | null,
          installments: 0,
          rate: activeUnit.cashPerM2,
        }
      : {
          total: activeUnit.cuotas.total + extra,
          initial: activeUnit.cuotas.initial40,
          balance: activeUnit.cuotas.balance40,
          installments: activeUnit.cuotas.cuota20,
          rate: activeUnit.cuotas.perM2,
        }
    : null;
  const selectedCash = activeUnit && activeUnit.status === "disponible" && activeUnit.cashTotal > 0 ? activeUnit.cashTotal : null;

  const roomCount = useMemo(() => ({
    "1": EURODESIGN_MODELOS.filter((model) => model.rooms === 1).length,
    "2": EURODESIGN_MODELOS.filter((model) => model.rooms === 2).length,
    "0": units.filter((unit) => unit.floor === 0).length,
  }), [units]);

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

  const chooseSlide = (slide: Slide, source: EurodesignUnit[]) => {
    setSelectedSlideId(slide.id);
    const nextRooms: RoomFilter = slide.unitNumber ? "0" : slide.model?.rooms === 2 ? "2" : "1";
    setRooms(nextRooms);
    const group = slidesFor(nextRooms, source);
    const index = group.findIndex((item) => item.id === slide.id);
    if (index >= 0) setModelIndex(index);
    const nextUnits = unitsForSlide(slide, source);
    const free = nextUnits.find((unit) => unit.status === "disponible") || nextUnits[0];
    if (free) setSelectedUnitNumber(free.unitNumber);
  };

  const chooseRooms = (next: RoomFilter) => {
    setRooms(next);
    setModelIndex(0);
    const first = slidesFor(next, units)[0];
    if (first) chooseSlide(first, units);
  };

  const shiftModel = (dir: number) => {
    if (!currentSlide || slides.length < 2) return;
    const next = (slideIndex + dir + slides.length) % slides.length;
    setModelIndex(next);
    chooseSlide(slides[next], units);
  };

  const openSlide = (slide: Slide, view: "depto" | "planta") => {
    setZoom({
      view,
      title: slide.name,
      caption: `${slide.areaLabel} · ${slide.where}`,
      preview: slide.preview,
      plan: slide.full,
      full: slide.full,
    });
  };

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/eurodesign`;
    const shareTitle = "Tower Eurodesign · Preventa en Equipetrol Norte";
    const shareText = `Departamentos en Equipetrol Norte desde USD ${formatEurodesignUsd(fromAny || EURODESIGN_CONFIG.minPriceUsd)}. Entrega en junio 2027.`;
    recordLeadEvent({ action: "share", propertyRef: String(property.id || "eurodesign"), operacion: "Preventa", zona: EURODESIGN_ZONE }).catch(() => {});
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
    if (typeof window !== "undefined" && typeof (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq === "function") {
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "Lead", { content_name: "Tower Eurodesign" });
    }
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: String(property.id || "eurodesign"),
      operacion: "Preventa",
      zona: property.zone || EURODESIGN_ZONE,
      presupuesto: quote ? String(quote.total) : undefined,
      extraFilters: activeUnit
        ? { unidad: activeUnit.unitNumber, piso: activeUnit.floorLabel, plan: paymentPlan, adicional: addon }
        : { plan: paymentPlan },
    }).catch(() => {});

    const planLabel = paymentPlan === "contado" ? `Contado 100% (USD ${formatEurodesignUsd(activeUnit?.cashPerM2 || 1480)}/m²)` : `Inicial 40% + 20% en obra + 40% contra entrega (USD ${formatEurodesignUsd(activeUnit?.cuotas.perM2 || 1580)}/m²)`;
    const addonLabel = addon === "parking" ? `Parqueo USD ${formatEurodesignUsd(EURODESIGN_PARKING_USD)}` : addon === "baulera" ? `Baulera USD ${formatEurodesignUsd(EURODESIGN_BAULERA_USD)}` : "Sin adicional";
    const unitLine = activeUnit
      ? `Unidad ${activeUnit.unitNumber}, ${activeUnit.floorLabel}, ${selectedSlide?.name || activeUnit.tipoLabel} (${activeUnit.areaM2.toLocaleString("es-BO")} m²)`
      : "Tower Eurodesign";
    const money = quote
      ? `\n• Inversión total: USD ${formatEurodesignUsd(quote.total)}\n• A la firma: USD ${formatEurodesignUsd(quote.initial)}\n• Saldo contra entrega: ${quote.balance == null ? "sin saldo pendiente" : `USD ${formatEurodesignUsd(quote.balance)}`}`
      : "";
    const text = `Hola, vengo de N.I.A y quiero reservar en Tower Eurodesign (${EURODESIGN_ADDRESS}):\n\n• ${unitLine}\n• ${addonLabel}\n• Modalidad: ${planLabel}${money}\n\nCuento con los USD ${formatEurodesignUsd(EURODESIGN_CONFIG.reservaUsd)} de reserva. ¿Me confirman la disponibilidad y los pasos?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const amenity = AMENITY_SLIDES[amenityIndex];
  const fromRooms = (filter: RoomFilter) => filter === "1" ? from1 : filter === "2" ? from2 : fromLocal;

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

      <div className="relative flex shrink-0 flex-col justify-end overflow-hidden md:h-screen md:w-[44%]" style={{ minHeight: "100svh" }}>
        <img src="/eurodesign/fachada-dia.jpg" alt="Fachada de Tower Eurodesign" className="absolute inset-0 h-full w-full object-cover object-[center_22%]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-black/75 via-black/40 to-transparent" />
        <div className="relative z-10 px-5 pb-24 pt-16 text-white lg:px-7 lg:pb-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e8d5a8] backdrop-blur-md">
              <Sparkles size={12} />
              Preventa · {EURODESIGN_CONFIG.floorsCount} niveles
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
              <MapPin size={12} className="text-[#e8d5a8]" />
              {EURODESIGN_CONFIG.zone}
            </span>
          </div>
          <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 font-serif leading-none drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]">
            <span className="text-4xl font-light tracking-wide md:text-5xl">Tower</span>
            <span className="text-2xl font-light text-[#e8d5a8] md:text-3xl">Eurodesign</span>
          </h1>
          <p className="mt-2 max-w-md text-sm leading-snug text-white/90">Vive en {EURODESIGN_ZONE} y termina el día con la ciudad a tus pies.</p>
          <div className="mt-3 flex max-w-lg gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Calendar size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Entrega de obra</p>
                <p className="mt-0.5 text-sm font-medium leading-tight">{EURODESIGN_DELIVERY}</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Building2 size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Constructora</p>
                <p className="mt-0.5 text-sm font-medium leading-tight">{EURODESIGN_CONFIG.builder}</p>
              </div>
            </div>
          </div>
          <div className="mt-2 max-w-lg rounded-2xl border border-[#e8d5a8]/30 bg-black/55 px-3.5 py-3 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e8d5a8]">Departamentos disponibles</p>
            <div className="mt-2 space-y-2">
              {([
                { label: "1 Dormitorio", area: coverSpan(units.filter((unit) => unit.rooms === 1).map((unit) => unit.areaM2)), price: from1 },
                { label: "2 Dormitorios", area: coverSpan(units.filter((unit) => unit.rooms === 2).map((unit) => unit.areaM2)), price: from2 },
                { label: "Locales", area: coverSpan(units.filter((unit) => unit.floor === 0).map((unit) => unit.areaM2)), price: fromLocal },
              ] as const).map((row) => (
                <div key={row.label} className="flex items-end justify-between gap-3 border-t border-white/10 pt-2 first:border-0 first:pt-0">
                  <div className="min-w-0">
                    <p className="text-sm text-white">{row.label}</p>
                    <p className="text-[11px] text-white/70">{row.area}</p>
                  </div>
                  <p className="shrink-0 text-right font-serif text-sm font-semibold">{row.price == null ? "Agotado" : `Desde USD ${formatEurodesignUsd(row.price)}`}</p>
                </div>
              ))}
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
                Tu vida en Equipetrol Norte
              </span>
              <h2 className="font-serif text-3xl font-light leading-tight text-[#1C1917] md:text-5xl">
                Vive en Tower Eurodesign.
                <span className="mt-1 block font-normal italic text-[#9a7b45]">Tu día a día, con otra vista.</span>
              </h2>
              <p className="pt-2 text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word] md:text-base">
                Vive en {EURODESIGN_ZONE} y termina el día con la ciudad a tus pies. Tower Eurodesign reúne departamentos de 1 y 2 dormitorios, equipamiento incluido y áreas sociales en el piso 18 con piscina, gimnasio y lounge. Elige el espacio que va contigo, con entrega programada para {EURODESIGN_DELIVERY}.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#E7E5E4] bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Lista oficial</p>
                <p className="mt-0.5 font-serif text-lg font-bold text-stone-900">{soldCount} vendidas{reservedCount ? ` · ${reservedCount} reservadas` : ""}</p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Quedan {freeUnits.length}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => scrollToSection("disponibilidad")} className="flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md">
                Ver disponibilidad y cotizar
              </button>
              <a href={EURODESIGN_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-800">
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Equipetrol Norte, a pasos de San Martín.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Tu nueva dirección está en {EURODESIGN_ADDRESS}. Conecta con la Av. San Martín y disfruta de un entorno con Ventura Mall, Patio Design, Torre Platinum, Fidalga, Hipermaxi y opciones para salir a comer. Trabajo, compras y encuentros cerca de tu hogar.
            </p>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <img src="/eurodesign/ubicacion-entorno.jpg" alt="Mapa de entorno de Tower Eurodesign en Equipetrol Norte" className="block h-auto w-full" />
            </div>
            <a href={EURODESIGN_CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              Ver ubicación en Google Maps <ExternalLink size={14} />
            </a>
          </section>

          <section id="amenidades" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Áreas sociales · Piso 18</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Tu tiempo libre, en lo más alto.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Sube al piso 18 para entrenar, refrescarte en la piscina o reunirte en el lounge. Las vistas abiertas hacia la ciudad acompañan esos momentos que hacen más agradable volver a casa.
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
            {currentSlide && (
              <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
                <div className="shrink-0">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><Layers size={13} /> Tipologías</span>
                  <h3 className="font-serif text-2xl font-light leading-tight text-[#1C1917]">Un espacio para tu próxima etapa.</h3>
                </div>
                <div className="grid shrink-0 grid-cols-3 gap-2">
                  {ROOM_FILTERS.map((filter) => (
                    <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-2xl border px-3 py-2 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white shadow-md ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white/80"}`}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{filter.label}</p>
                      <p className="text-[11px] text-stone-500">{roomCount[filter.id]} {filter.id === "0" ? "locales" : "plantas"}</p>
                    </button>
                  ))}
                </div>
                <ModelFrame
                  slide={currentSlide}
                  index={slideIndex}
                  total={slides.length}
                  frameClass="min-h-0 flex-1"
                  onPrev={() => shiftModel(-1)}
                  onNext={() => shiftModel(1)}
                  onOpen={(view) => openSlide(currentSlide, view)}
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
            )}
          </section>

          <section id="equipamiento" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><CheckCircle2 size={13} /> Equipamiento</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Llegas a casa. Lo esencial ya está resuelto.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Cocina equipada, climatización en sala y dormitorios, y baños con espejo LED y box de ducha. Conoce los detalles incluidos, ambiente por ambiente, e imagina tu llegada a Tower Eurodesign.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {EQUIPAMIENTO.map((group) => (
                <div key={group.id} className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                  <img src={group.image} alt={group.title} className={group.contain ? "max-h-[320px] w-full object-contain" : "h-[210px] w-full object-cover"} />
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
          </section>

          <section id="constructora" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><Building2 size={13} /> Constructora</span>
            <div className="inline-flex rounded-xl bg-stone-950 px-4 py-3">
              <img src="/eurodesign/logo.png" alt="Tower Eurodesign" className="h-14 w-auto" />
            </div>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Conoce el sello Eurodesign.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Explora el portafolio de {EURODESIGN_CONFIG.builder} y conoce su propuesta de arquitectura y espacios residenciales. Una mirada a quienes están detrás del lugar que puedes llamar hogar.
            </p>
            <button type="button" onClick={() => setZoom({ view: "solo", src: "/eurodesign/legado.jpg", title: "Nuestro legado", caption: EURODESIGN_CONFIG.builder })} className="block w-full overflow-hidden rounded-xl border border-stone-200 bg-white">
              <img src="/eurodesign/legado.jpg" alt="Portafolio de Desarrollo Eurodesign" className="block h-auto w-full" />
            </button>
          </section>

          <section id="pago" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Formas de pago</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Da el paso a vivir en Equipetrol Norte.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Compara la tarifa de contado con el plan que distribuye tu pago entre la firma, la obra y la entrega en {EURODESIGN_DELIVERY}. Revisa los montos de tu unidad y consulta cómo reservarla con USD {formatEurodesignUsd(EURODESIGN_CONFIG.reservaUsd)}.
            </p>
            <article className="rounded-2xl bg-stone-900 p-5 text-white shadow-lg">
              <span className="rounded-full bg-[#C19A6B] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950">Contado</span>
              <h4 className="mt-3 font-serif text-2xl">Contado: mejor tarifa, 100% a la firma</h4>
              <p className="mt-2 font-serif text-3xl text-[#E8D5A8]">USD 1.480/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-300">Aseguras el valor por metro más bajo del departamento. Los locales de planta baja se cotizan a USD 2.300/m². El monto en dólares aparece al elegir la unidad.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">Durante la obra</span>
              <h4 className="mt-3 font-serif text-2xl leading-snug">40% a la firma, 20% en cuotas y 40% al recibir las llaves</h4>
              <p className="mt-2 font-serif text-3xl text-stone-900">USD 1.580/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">El 40% se integra a la firma, descontando los USD {formatEurodesignUsd(EURODESIGN_CONFIG.reservaUsd)} de reserva. El 20% se paga en cuotas durante la obra y el 40% restante contra entrega en {EURODESIGN_DELIVERY}. Los locales van a USD 2.400/m².</p>
            </article>
            <div className="space-y-2 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
              <p>Parqueo en subsuelo por USD {formatEurodesignUsd(EURODESIGN_PARKING_USD)}. Baulera por USD {formatEurodesignUsd(EURODESIGN_BAULERA_USD)}. Se cotizan por separado, fuera del precio por metro.</p>
            </div>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
              Elegir mi departamento <ArrowRight size={14} />
            </button>
          </section>

          <section id="disponibilidad" className="mt-20 scroll-mt-2 space-y-6 border-t border-stone-200/80 pt-6">
            {currentSlide && (
              <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
                <div className="shrink-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Disponibilidad</span>
                  <h3 className="font-serif text-2xl font-light leading-tight text-[#1C1917]">Elige el tuyo y conoce cuánto pagarías.</h3>
                  <p className="mt-1 text-xs text-stone-500">Lista oficial. Verde: disponible · Gris: vendido o reservado. Reserva USD {formatEurodesignUsd(EURODESIGN_CONFIG.reservaUsd)}.</p>
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-2">
                  <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 1 · Tipología</p>
                  <div className="grid shrink-0 grid-cols-3 gap-2">
                    {ROOM_FILTERS.map((filter) => (
                      <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-xl border p-3 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white"}`}>
                        <p className="text-sm font-bold">{filter.label}</p>
                        <p className="text-[11px] text-[#9a7b45]">{fromRooms(filter.id) ? `Desde USD ${formatEurodesignUsd(fromRooms(filter.id) as number)}` : "Sin unidades"}</p>
                      </button>
                    ))}
                  </div>
                  <ModelFrame
                    slide={currentSlide}
                    index={slideIndex}
                    total={slides.length}
                    price={selectedCash != null ? `USD ${formatEurodesignUsd(selectedCash)}` : priceLabel(currentSlide, units)}
                    frameClass="min-h-0 flex-1"
                    onPrev={() => shiftModel(-1)}
                    onNext={() => shiftModel(1)}
                    onOpen={(view) => openSlide(currentSlide, view)}
                    onTouchStart={(event) => { modelTouch.current = event.changedTouches[0].clientX; }}
                    onTouchEnd={(event) => {
                      if (modelTouch.current == null || slides.length < 2) return;
                      const dx = event.changedTouches[0].clientX - modelTouch.current;
                      if (dx > 40) shiftModel(-1);
                      if (dx < -40) shiftModel(1);
                      modelTouch.current = null;
                    }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold uppercase tracking-wider text-stone-500">Paso 2 · Piso</span>
                <span className="flex items-center gap-3">
                  {selectedCash != null && <span className="font-semibold text-[#9a7b45]">USD {formatEurodesignUsd(selectedCash)}</span>}
                  <button type="button" onClick={() => setZoom({ view: "solo", src: "/eurodesign/plano-distribucion.jpg", title: "Distribución del edificio", caption: "Planta de pisos de Tower Eurodesign." })} className="font-semibold text-[#816127]">
                    Ver distribución de pisos
                  </button>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-stone-200 bg-white p-2 sm:grid-cols-5">
                {floors.map((floor) => {
                  const current = activeUnit?.unitNumber === floor.unitNumber;
                  const libre = floor.status === "disponible";
                  return (
                    <button key={floor.unitNumber} type="button" disabled={!libre} onClick={() => setSelectedUnitNumber(floor.unitNumber)} className={`rounded-lg px-1 py-2 text-xs font-semibold ${current && libre ? "bg-stone-900 text-white" : libre ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "cursor-not-allowed bg-stone-100 text-stone-400"}`}>
                      <span className="block">{floor.floor === 0 ? "Planta baja" : `Piso ${floor.floor}`}</span>
                      <span className="block text-[10px] font-normal">Unidad {floor.unitNumber}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 3 · Adicional</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {ADDONS.map((item) => (
                  <button key={item.id} type="button" onClick={() => setAddon(item.id)} className={`rounded-xl border p-3 text-left ${addon === item.id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className={`text-[11px] ${addon === item.id ? "text-stone-300" : "text-stone-500"}`}>{item.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 4 · Plan de pago</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => setPaymentPlan("contado")} className={`rounded-xl border p-3 text-left ${paymentPlan === "contado" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                  <p className="text-sm font-bold">Contado</p>
                  <p className={`text-[11px] ${paymentPlan === "contado" ? "text-[#E8D5A8]" : "text-[#9a7b45]"}`}>100% a la firma · USD {formatEurodesignUsd(activeUnit?.cashPerM2 || 1480)}/m²</p>
                </button>
                <button type="button" onClick={() => setPaymentPlan("cuotas")} className={`rounded-xl border p-3 text-left ${paymentPlan === "cuotas" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                  <p className="text-sm font-bold">40% + 20% + 40%</p>
                  <p className={`text-[11px] ${paymentPlan === "cuotas" ? "text-stone-300" : "text-stone-500"}`}>40% firma · 20% en obra · 40% entrega</p>
                </button>
              </div>
            </div>

            {activeUnit && activeUnit.status !== "disponible" && (
              <p className="rounded-xl border border-stone-200 bg-stone-100 p-4 text-sm text-stone-600">La unidad {activeUnit.unitNumber} figura {activeUnit.status === "reservado" ? "reservada" : "vendida"} en la lista. Elige otro piso.</p>
            )}

            {activeUnit && quote && (
              <div className="space-y-4 rounded-2xl bg-stone-900 p-5 text-white shadow-xl">
                <div className="border-b border-white/10 pb-3 text-xs text-[#E8D5A8]">
                  Unidad {activeUnit.unitNumber} · {activeUnit.floorLabel} · {selectedSlide?.name} · {activeUnit.areaM2.toLocaleString("es-BO")} m²
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Inversión total</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatEurodesignUsd(quote.total)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">USD {formatEurodesignUsd(quote.rate)}/m²{extra ? ` + adicional USD ${formatEurodesignUsd(extra)}` : ""}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Cuota inicial ({paymentPlan === "contado" ? "100" : "40"}%)</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight text-emerald-400"><span className="block font-mono text-xs font-normal text-emerald-500/80">USD</span>{formatEurodesignUsd(quote.initial)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">A la firma del contrato</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Saldo contra entrega</p>
                    {quote.balance == null ? (
                      <>
                        <p className="mt-1 font-serif text-2xl font-bold leading-tight text-stone-500"><span className="block font-mono text-xs font-normal text-stone-500">USD</span>—</p>
                        <p className="mt-1 text-[10px] text-stone-400">Sin saldo pendiente</p>
                      </>
                    ) : (
                      <>
                        <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatEurodesignUsd(quote.balance)}</p>
                        <p className="mt-1 text-[10px] text-stone-400">40% en {EURODESIGN_DELIVERY}</p>
                      </>
                    )}
                  </div>
                </div>
                {paymentPlan === "cuotas" && (
                  <p className="text-[11px] leading-relaxed text-stone-400">
                    El tramo de cuotas es USD {formatEurodesignUsd(quote.installments)}, el 20% del departamento durante la obra. El parqueo o la baulera, si los sumas, quedan fuera de ese porcentaje.
                  </p>
                )}
                <button type="button" onClick={contactWhatsApp} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-900">
                  <MessageCircle size={16} />
                  Quiero la unidad {activeUnit.unitNumber}
                </button>
              </div>
            )}
          </section>

          <section id="cierre" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200 pt-12 pb-[48vh] text-center">
            <h3 className="font-serif text-3xl font-light text-[#1C1917]">Ven a conocer tu próxima dirección.</h3>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-600">
              Cuéntanos qué departamento te gustó. Te ayudamos a comparar modelos y planes de pago, confirmar disponibilidad y coordinar una visita a obra. Conoce Tower Eurodesign y da el siguiente paso hacia tu hogar en Equipetrol Norte.
            </p>
            <button type="button" onClick={contactWhatsApp} className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              Hablar con un asesor <ArrowRight size={14} />
            </button>
          </section>
        </div>
      </div>

      {activeSection !== "cierre" && (
        <div className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-3 border-t border-stone-200 bg-[#f7f5f0]/95 px-5 py-3 backdrop-blur-md md:left-[44%]">
          <div>
            <p className="text-xs text-stone-700">{selectedCash != null ? `USD ${formatEurodesignUsd(selectedCash)} · ${EURODESIGN_DELIVERY}` : `Desde USD ${formatEurodesignUsd(fromAny || EURODESIGN_CONFIG.minPriceUsd)} · ${EURODESIGN_DELIVERY}`}</p>
            <p className="hidden text-[10px] font-medium text-[#9a7b45] sm:block">Reserva con USD {formatEurodesignUsd(EURODESIGN_CONFIG.reservaUsd)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a href={EURODESIGN_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-stone-800">
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
                src={zoom.view === "solo" ? zoom.src : zoom.view === "planta" || zoom.view === "ficha" ? zoom.full : zoom.preview}
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
