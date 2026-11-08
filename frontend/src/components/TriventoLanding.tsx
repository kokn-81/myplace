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
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";
import {
  TRIVENTO_CONFIG,
  TRIVENTO_INVENTORY_DATE,
  TRIVENTO_MODELS,
  TRIVENTO_UNITS,
  TriventoPlan,
  TriventoUnit,
  availableUnits,
  cheapestAvailable,
  formatTriventoM2,
  formatTriventoUsd,
} from "../triventoInventory";
import {
  firstAvailableTriventoSelection,
  quoteTriventoUnit,
  triventoSlidesForRooms,
  type TriventoRooms,
  type TriventoSlide as Slide,
} from "../triventoPresentation";

interface Props {
  property: Property;
  onClose?: () => void;
}

type ZoomView = "depto" | "planta" | "ficha" | "solo";

const AMENITY_SLIDES = [
  {
    src: "/trivento/piscina.jpg",
    category: "Piscina",
    title: "Tu piscina en el edificio",
    description: "El día de calor se resuelve sin salir de Equipetrol. Bajas a la piscina del proyecto y te quedas.",
  },
  {
    src: "/trivento/cowork.jpg",
    category: "Cowork",
    title: "Trabaja sin ocupar tu dormitorio",
    description: "El cowork está para una llamada, una entrega o una tarde de estudio. Tu departamento sigue siendo para vivir.",
  },
  {
    src: "/trivento/churrasquera.jpg",
    category: "Churrasquera",
    title: "El asado queda en casa",
    description: "Invitas y el lugar ya está. La churrasquera es parte de las áreas sociales del proyecto.",
  },
  {
    src: "/trivento/reunion.jpg",
    category: "Reunión",
    title: "Un lugar para recibir a los tuyos",
    description: "El área de reunión abierta sirve para el domingo en familia o para mostrar el edificio a quien va a alquilar.",
  },
  {
    src: "/trivento/lobby.jpg",
    category: "Lobby",
    title: "La primera impresión ya está resuelta",
    description: "Quien llega a visitarte entra por un lobby. La dirección se entiende desde la puerta.",
  },
  {
    src: "/trivento/ingreso.jpg",
    category: "Ingreso",
    title: "Llegas a Equipetrol",
    description: "El ingreso principal da a Av. San Martín y Calle A. Ramírez.",
  },
];

const EQUIPMENT = [
  {
    id: "clima",
    room: "Climatización",
    title: "Llegas y el clima ya está",
    image: "/trivento/vista_04.jpg",
    contain: false,
    items: [
      "2 aires acondicionados de 12.000 BTU en el departamento de 1 dormitorio.",
      "1 aire acondicionado de 18.000 BTU en el departamento de 1 dormitorio.",
    ],
  },
  {
    id: "cocina",
    room: "Cocina",
    title: "La cocina entra en uso",
    image: "/trivento/vista_05.jpg",
    contain: false,
    items: ["1 horno o microondas incluido, para que la unidad no te espere vacía."],
  },
  {
    id: "vidrio",
    room: "Cerramientos",
    title: "El cerramiento ya viene definido",
    image: "/trivento/fachada.jpg",
    contain: true,
    items: ["Vidrio laminado y perfilería ALVI 60 en la fachada de tu departamento."],
  },
];

const SECTIONS = [
  { id: "intro", label: "Inicio" },
  { id: "lugar", label: "Ubicación" },
  { id: "amenidades", label: "Áreas sociales" },
  { id: "tipologias", label: "Tipologías" },
  { id: "equipamiento", label: "Equipamiento" },
  { id: "constructora", label: "Proyecto" },
  { id: "pago", label: "Formas de pago" },
  { id: "disponibilidad", label: "Disponibilidad" },
  { id: "cierre", label: "Cierre" },
];

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function listLabel(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

const INVENTORY_LABEL = listLabel(TRIVENTO_INVENTORY_DATE);

const ROOM_FILTERS: { id: TriventoRooms; label: string }[] = [
  { id: "0", label: "Monoambiente" },
  { id: "1", label: "1 dormitorio" },
];

function coverSpan(values: number[]) {
  const sizes = values.filter((value) => value > 0);
  if (sizes.length === 0) return "";
  const low = Math.round(Math.min(...sizes));
  const high = Math.round(Math.max(...sizes));
  return low === high ? `${low} m²` : `${low} a ${high} m²`;
}

function RoomFilters({ rooms, onChange }: { rooms: TriventoRooms; onChange: (rooms: TriventoRooms) => void }) {
  return <div className="flex shrink-0 gap-2" role="group" aria-label="Dormitorios">
    {ROOM_FILTERS.map((filter) => {
      const count = TRIVENTO_MODELS.filter((model) => model.dormitorios === Number(filter.id)).length;
      return <button key={filter.id} type="button" aria-pressed={rooms === filter.id} onClick={() => onChange(filter.id)} className={`min-w-0 flex-1 rounded-2xl border px-3 py-2 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white shadow-md ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white/80"}`}>
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{filter.label}</span>
        <span className="block text-[11px] text-stone-500">{count} {count === 1 ? "modelo" : "modelos"}</span>
      </button>;
    })}
  </div>;
}

function rateBounds(plan: TriventoPlan, units: TriventoUnit[]) {
  const rates = availableUnits(units)
    .map((unit) => (plan === "contado" ? unit.puContado : unit.puCredito))
    .filter((rate): rate is number => rate != null);
  return { min: Math.min(...rates), max: Math.max(...rates) };
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
        <p className="shrink-0 pt-0.5 text-[11px] text-stone-400">{index + 1}/{total}</p>
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
        <img src={slide.plan} alt="" className="h-14 w-16 shrink-0 bg-white object-contain" />
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">En el piso</span>
          <span className="block text-xs leading-snug text-stone-600">Toca el departamento para verlo entero, o abre la planta.</span>
        </span>
      </button>
    </div>
  );
}

export default function TriventoLanding({ property, onClose }: Props) {
  const cheapest = cheapestAvailable();
  const initialRooms: TriventoRooms = cheapest.tipologia === "Monoambiente" ? "0" : "1";
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const introNavRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const modelTouch = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState("intro");
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [amenityIndex, setAmenityIndex] = useState(0);
  const [rooms, setRooms] = useState<TriventoRooms>(initialRooms);
  const [modelIndex, setModelIndex] = useState(Math.max(0, triventoSlidesForRooms(initialRooms).findIndex((item) => item.id === cheapest.modelo)));
  const [selectedCodigo, setSelectedCodigo] = useState(cheapest.codigo);
  const [paymentPlan, setPaymentPlan] = useState<TriventoPlan>("contado");
  const [zoom, setZoom] = useState<{ view: ZoomView; title: string; caption: string; preview: string; plan: string; ficha: string } | null>(null);

  const units = TRIVENTO_UNITS;
  const libres = availableUnits(units);
  const soldCount = units.filter((unit) => unit.estado === "VENDIDO").length;
  const reservedCount = units.filter((unit) => unit.estado === "RESERVADO").length;
  const cashRates = rateBounds("contado", units);
  const creditRates = rateBounds("credito", units);
  const minTicket = Math.min(...libres.map((unit) => unit.precioContado || Infinity));
  const dormFrom = Math.min(...libres.filter((unit) => unit.tipologia === "1 Dormitorio").map((unit) => unit.precioContado || Infinity));
  const monoFree = libres.some((unit) => unit.tipologia === "Monoambiente");
  const slides = useMemo(() => triventoSlidesForRooms(rooms), [rooms]);
  const slideIndex = ((modelIndex % slides.length) + slides.length) % slides.length;
  const slide = slides[slideIndex];
  const floors = useMemo(
    () => units.filter((unit) => unit.modelo === slide.model.codigo).slice().sort((a, b) => a.piso - b.piso),
    [slide.model.codigo, units]
  );
  const activeUnit = floors.find((unit) => unit.codigo === selectedCodigo && unit.estado === "LIBRE")
    || floors.find((unit) => unit.estado === "LIBRE")
    || null;
  const quote = quoteTriventoUnit(activeUnit, paymentPlan);
  const selectedCash = activeUnit && (activeUnit.precioContado || 0) > 0 ? activeUnit.precioContado : null;
  const amenity = AMENITY_SLIDES[amenityIndex];

  const modelPrice = (modelId: string) => {
    const prices = libres.filter((unit) => unit.modelo === modelId).map((unit) => unit.precioContado || 0);
    return prices.length ? `Desde USD ${formatTriventoUsd(Math.min(...prices))}` : "Agotado";
  };

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

  useEffect(() => {
    if (!zoom && !showSectionMenu) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (zoom) setZoom(null);
      else setShowSectionMenu(false);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [zoom, showSectionMenu]);

  const chooseRooms = (next: TriventoRooms) => {
    const selection = firstAvailableTriventoSelection(triventoSlidesForRooms(next), units);
    setRooms(next);
    setModelIndex(selection.index);
    setSelectedCodigo(selection.unit?.codigo || "");
  };

  const shiftModel = (dir: number) => {
    const next = (slideIndex + dir + slides.length) % slides.length;
    setModelIndex(next);
    const free = units.find((unit) => unit.modelo === slides[next].model.codigo && unit.estado === "LIBRE");
    setSelectedCodigo(free?.codigo || "");
  };

  const openSlide = (current: Slide, view: "depto" | "planta") => {
    setZoom({
      view,
      title: current.name,
      caption: `${current.areaLabel} · ${current.where} · ${current.detail}`,
      preview: current.preview,
      plan: current.plan,
      ficha: current.ficha,
    });
  };

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/trivento`;
    const shareTitle = "Trivento IV · Preventa en Equipetrol";
    const shareText = `Departamentos en preventa sobre Av. San Martín, Equipetrol, desde USD ${formatTriventoUsd(minTicket)}.`;
    recordLeadEvent({ action: "share", propertyRef: String(property.id || "trivento-iv"), operacion: "Preventa", zona: TRIVENTO_CONFIG.zone }).catch(() => {});
    if (typeof navigator.share === "function") {
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
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "Lead", { content_name: "Trivento IV" });
    }
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: String(property.id || "trivento-iv"),
      operacion: "Preventa",
      zona: property.zone || TRIVENTO_CONFIG.zone,
      presupuesto: quote ? String(Math.round(quote.total)) : undefined,
      extraFilters: activeUnit
        ? { unidad: activeUnit.codigo, piso: activeUnit.piso, modelo: activeUnit.modelo, plan: paymentPlan }
        : { plan: paymentPlan },
    }).catch(() => {});

    const planLabel = paymentPlan === "contado" ? "Contado 100%" : "Crédito 50% inicial y 50% contra entrega";
    const unitLine = activeUnit
      ? `Unidad ${activeUnit.codigo}, piso ${activeUnit.piso}, Modelo ${Number(activeUnit.modelo)} (${activeUnit.tipologia}, ${activeUnit.posicion}, ${formatTriventoM2(activeUnit.m2Total)} m²)`
      : "Trivento IV";
    const money = quote
      ? `\n• Inversión total: USD ${formatTriventoUsd(quote.total)}\n• A la firma: USD ${formatTriventoUsd(quote.initial)}\n• Saldo contra entrega: ${quote.balance == null ? "sin saldo pendiente" : `USD ${formatTriventoUsd(quote.balance)}`}`
      : "";
    const text = `Hola, vengo de N.I.A y quiero reservar en Trivento IV (Equipetrol):\n\n• ${unitLine}\n• Modalidad: ${planLabel}${money}\n\n¿Me confirman la disponibilidad del cuadro y los pasos para reservar?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="nia-project-landing nia-trivento-landing fixed inset-0 z-[100] flex flex-col overflow-y-auto overscroll-y-contain bg-[#f7f5f0] font-sans text-stone-900 md:flex-row md:overflow-hidden">
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
        <img src="/trivento/fachada.jpg" alt="Fachada de Trivento IV" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
        <div className="relative z-10 px-5 pb-24 pt-16 text-white lg:px-7 lg:pb-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e8d5a8] backdrop-blur-md">
              <Sparkles size={12} />
              Preventa · {TRIVENTO_CONFIG.floorsPublished}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
              <MapPin size={12} className="text-[#e8d5a8]" />
              {TRIVENTO_CONFIG.zone}
            </span>
          </div>
          <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 font-serif leading-none drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]">
            <span className="text-4xl font-light tracking-wide md:text-5xl">Trivento</span>
            <span className="text-2xl font-light text-[#e8d5a8] md:text-3xl">IV</span>
          </h1>
          <p className="mt-2 max-w-md text-sm leading-snug text-white/90">Si buscas tu primer departamento, o una unidad para alquilar en Equipetrol, Trivento IV está pensado para ti.</p>
          <div className="mt-3 flex max-w-lg gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Calendar size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Entrega de obra</p>
                <p className="mt-0.5 text-sm font-medium leading-tight">{TRIVENTO_CONFIG.delivery}</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Building2 size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Constructora</p>
                <p className="mt-0.5 text-sm font-medium leading-tight">Trivento IV</p>
              </div>
            </div>
          </div>
          <div className="mt-2 max-w-lg rounded-2xl border border-[#e8d5a8]/30 bg-black/55 px-3.5 py-3 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e8d5a8]">Departamentos disponibles</p>
            <div className="mt-2 flex">
              <div className="min-w-0 flex-1 pr-3">
                <p className="text-sm text-white">1 Dormitorio</p>
                <p className="text-[11px] text-white/70">{coverSpan(units.filter((unit) => unit.tipologia === "1 Dormitorio").map((unit) => unit.m2Total))}</p>
                <p className="mt-1 font-serif text-sm font-semibold leading-tight">{Number.isFinite(dormFrom) ? `Desde USD ${formatTriventoUsd(dormFrom)}` : "Agotado"}</p>
              </div>
              <div className="w-px bg-white/15" />
              <div className="min-w-0 flex-1 pl-3">
                <p className="text-sm text-white">Monoambiente</p>
                <p className="text-[11px] text-white/70">{coverSpan(units.filter((unit) => unit.tipologia === "Monoambiente").map((unit) => unit.m2Total))}</p>
                <p className="mt-1 font-serif text-sm font-semibold leading-tight">{monoFree ? "Disponible" : "Agotado"}</p>
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
                Experiencia residencial y preventa
              </span>
              <h2 className="font-serif text-3xl font-light leading-tight text-[#1C1917] md:text-5xl">
                Vive en Trivento IV.
                <span className="mt-1 block font-normal italic text-[#9a7b45]">El lugar donde Equipetrol te queda a la puerta.</span>
              </h2>
              <p className="pt-2 text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word] md:text-base">
                Si buscas tu primer departamento, o una unidad para alquilar en Equipetrol, Trivento IV está pensado para ti. Estudiantes, jóvenes profesionales, parejas que empiezan e inversionistas entran por la misma puerta: <strong>{TRIVENTO_CONFIG.address}</strong>, con llaves en <strong>{TRIVENTO_CONFIG.delivery}</strong>.
              </p>
              <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
                Hoy eliges entre los pisos 1 a 5, cinco departamentos por piso. El precio que ves es el del cuadro del {INVENTORY_LABEL}, en dólares al tipo de cambio del BCB. Lo que ya se vendió o se reservó sale de la cotización.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#E7E5E4] bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Lista del {INVENTORY_LABEL}</p>
                <p className="mt-0.5 font-serif text-lg font-bold text-stone-900">{soldCount} vendidas · {reservedCount} reservadas</p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Quedan {libres.length}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => scrollToSection("disponibilidad")} className="flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md">
                Ver disponibilidad y cotizar
              </button>
              <a href={TRIVENTO_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-800">
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Equipetrol, donde tu departamento se vive y se alquila.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Tu unidad queda sobre <strong>{TRIVENTO_CONFIG.address}</strong>. Es la pieza de la ciudad que el proyecto presenta como la más dinámica: movimiento, servicios y gente que busca alquiler. Recibes las llaves en <strong>{TRIVENTO_CONFIG.delivery}</strong>.
            </p>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <img src="/trivento/drone.jpg" alt="Trivento IV en Av. San Martín y Calle A. Ramírez, Equipetrol" className="block h-auto w-full" />
            </div>
            <a href={TRIVENTO_CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              Ver ubicación en Google Maps <ExternalLink size={14} />
            </a>
          </section>

          <section id="amenidades" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Áreas sociales</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">El edificio también se vive fuera de tu puerta.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Además de tu departamento, el proyecto incluye dos niveles de áreas sociales: vista panorámica, área de reunión, churrasquera, cowork, piscina y lobby. Las fotos son los renders del proyecto.
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
                {AMENITY_SLIDES.map((item, index) => (
                  <button key={item.title} type="button" onClick={() => setAmenityIndex(index)} className={`h-1.5 rounded-full ${amenityIndex === index ? "w-6 bg-[#9a7b45]" : "w-1.5 bg-stone-300"}`} aria-label={item.title} />
                ))}
              </div>
            </div>
          </section>

          <section id="tipologias" className="mt-20 scroll-mt-2 border-t border-stone-200/80 pt-6">
            <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
              <div className="shrink-0">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><Layers size={13} /> Tipologías</span>
                <h3 className="font-serif text-2xl font-light leading-tight text-[#1C1917]">Cinco maneras de entrar. Elige la tuya.</h3>
                <p className="mt-1 text-xs text-stone-500">Cada piso repite la misma planta: tres departamentos a la fachada y dos atrás.</p>
              </div>
              <RoomFilters rooms={rooms} onChange={chooseRooms} />
              <ModelFrame
                slide={slide}
                index={slideIndex}
                total={slides.length}
                frameClass="min-h-0 flex-1"
                onPrev={() => shiftModel(-1)}
                onNext={() => shiftModel(1)}
                onOpen={(view) => openSlide(slide, view)}
                onTouchStart={(event) => { touchX.current = event.changedTouches[0].clientX; }}
                onTouchEnd={(event) => {
                  if (touchX.current == null) return;
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Tu unidad no llega vacía.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Tu departamento incluye climatización, un horno o microondas, y cerramientos de vidrio laminado con perfilería ALVI 60. Llegas a una unidad que ya se puede vivir.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {EQUIPMENT.map((group) => (
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
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><Building2 size={13} /> Proyecto</span>
            <div className="inline-flex">
              <img src="/trivento/logo.png" alt="Trivento IV" className="h-14 w-auto" />
            </div>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Sabes cuándo entras y en qué dólar se cobra.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              La decisión se apoya en tres datos publicados: la fecha en que recibes las llaves, las unidades que puedes elegir hoy y la moneda en la que está tu precio.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="font-serif text-xl">Noviembre 2027</p>
                <p className="mt-1 text-xs text-stone-500">La fecha en la que el proyecto entrega tu departamento.</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="font-serif text-xl">25 unidades</p>
                <p className="mt-1 text-xs text-stone-500">Pisos 1 a 5, cinco departamentos por piso. Eliges entre las que siguen libres.</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="font-serif text-xl">T/C BCB</p>
                <p className="mt-1 text-xs text-stone-500">Tu cotización está en dólares, al tipo de cambio del Banco Central.</p>
              </div>
            </div>
          </section>

          <section id="pago" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Formas de pago</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Elige cómo asegurar tu unidad.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              El proyecto publica dos caminos. Al contado congelas la tarifa más baja. A crédito dejas la mitad ahora y la otra mitad cuando recibes la llave en {TRIVENTO_CONFIG.delivery}.
            </p>
            <p className="text-xs text-stone-500">Lista del {INVENTORY_LABEL}. El metro que ves es el de las unidades que siguen libres.</p>
            <article className="rounded-2xl bg-stone-900 p-5 text-white shadow-lg">
              <span className="rounded-full bg-[#C19A6B] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950">Contado</span>
              <h4 className="mt-3 font-serif text-2xl">Pago al contado, el 100% a la firma</h4>
              <p className="mt-2 font-serif text-3xl text-[#E8D5A8]">Desde USD {formatTriventoUsd(cashRates.min)}/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-300">Es la forma de pagar menos por metro. En lo que queda libre va de USD {formatTriventoUsd(cashRates.min)} a USD {formatTriventoUsd(cashRates.max)} por m². El monto de tu unidad aparece cuando la eliges.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">Crédito 50 / 50</span>
              <h4 className="mt-3 font-serif text-2xl">50% a la firma · 50% contra entrega</h4>
              <p className="mt-2 font-serif text-3xl text-stone-900">Desde USD {formatTriventoUsd(creditRates.min)}/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">Entras con la mitad a la firma y cancelas la otra mitad al recibir las llaves en {TRIVENTO_CONFIG.delivery}. En las unidades libres va de USD {formatTriventoUsd(creditRates.min)} a USD {formatTriventoUsd(creditRates.max)} por m².</p>
            </article>
            <div className="space-y-2 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
              <p><strong>Hoy.</strong> Eliges la unidad que sigue libre. El proyecto no publica una seña aparte: ese monto te lo confirma el asesor.</p>
              <p><strong>A la firma.</strong> Si vas al contado, cancelas el 100%. Si vas a crédito, dejas el 50% y aseguras el precio.</p>
              <p><strong>{TRIVENTO_CONFIG.delivery}.</strong> Recibes el departamento. Con crédito pagas el saldo. Al contado ya no te queda nada pendiente.</p>
            </div>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
              Elegir mi departamento <ArrowRight size={14} />
            </button>
          </section>

          <section id="disponibilidad" className="mt-20 scroll-mt-2 space-y-6 border-t border-stone-200/80 pt-6">
            <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
              <div className="shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Disponibilidad</span>
                <h3 className="font-serif text-2xl font-light leading-tight text-[#1C1917]">Elige la unidad que todavía puedes tomar.</h3>
                <p className="mt-1 text-xs text-stone-500">Lista del {INVENTORY_LABEL}. Verde: disponible · Gris: vendido o reservado.</p>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 1 · Modelo</p>
                <RoomFilters rooms={rooms} onChange={chooseRooms} />
                <ModelFrame
                  slide={slide}
                  index={slideIndex}
                  total={slides.length}
                  price={selectedCash != null ? `USD ${formatTriventoUsd(selectedCash)}` : modelPrice(slide.model.id)}
                  frameClass="min-h-0 flex-1"
                  onPrev={() => shiftModel(-1)}
                  onNext={() => shiftModel(1)}
                  onOpen={(view) => openSlide(slide, view)}
                  onTouchStart={(event) => { modelTouch.current = event.changedTouches[0].clientX; }}
                  onTouchEnd={(event) => {
                    if (modelTouch.current == null) return;
                    const dx = event.changedTouches[0].clientX - modelTouch.current;
                    if (dx > 40) shiftModel(-1);
                    if (dx < -40) shiftModel(1);
                    modelTouch.current = null;
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold uppercase tracking-wider text-stone-500">Paso 2 · Piso</span>
                <span className="flex items-center gap-3">
                  {selectedCash != null && <span className="font-semibold text-[#9a7b45]">USD {formatTriventoUsd(selectedCash)}</span>}
                  <button type="button" className="text-right font-semibold text-[#816127]" onClick={() => setZoom({ view: "solo", title: "Distribución de pisos", caption: `${slide.name} resaltado en la planta tipo · ${TRIVENTO_CONFIG.floorsPublished}`, preview: slide.plan, plan: slide.plan, ficha: slide.ficha })}>Ver distribución de pisos</button>
                </span>
              </div>
              <div className="nia-trivento-floor-grid grid grid-cols-3 gap-1.5 rounded-xl border border-stone-200 bg-white p-2 sm:grid-cols-5">
                {floors.map((floor) => {
                  const libre = floor.estado === "LIBRE";
                  const current = activeUnit?.codigo === floor.codigo;
                  return (
                    <button key={floor.codigo} type="button" disabled={!libre} onClick={() => setSelectedCodigo(floor.codigo)} className={`rounded-lg px-1 py-2 text-xs font-semibold ${current && libre ? "bg-stone-900 text-white" : libre ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "cursor-not-allowed bg-stone-100 text-stone-400"}`}>
                      <span className="block">Piso {floor.piso}</span>
                      <span className="block text-[10px] font-normal">Unidad {floor.codigo}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 3 · Adicional</p>
              <div className="rounded-xl border border-stone-900 bg-stone-900 p-3 text-white">
                <p className="text-sm font-bold">Solo el departamento</p>
                <p className="mt-1 text-xs text-stone-300">Parqueo y baulera se consultan por separado y no están incluidos en esta cotización.</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 4 · Plan de pago</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => setPaymentPlan("contado")} className={`rounded-xl border p-3 text-left ${paymentPlan === "contado" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                  <p className="text-sm font-bold">100% contado</p>
                  <p className={`text-[11px] ${paymentPlan === "contado" ? "text-[#E8D5A8]" : "text-[#9a7b45]"}`}>USD {formatTriventoUsd(activeUnit?.puContado || cashRates.min)}/m²</p>
                </button>
                <button type="button" onClick={() => setPaymentPlan("credito")} className={`rounded-xl border p-3 text-left ${paymentPlan === "credito" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                  <p className="text-sm font-bold">Crédito 50 / 50</p>
                  <p className={`text-[11px] ${paymentPlan === "credito" ? "text-stone-300" : "text-stone-500"}`}>50% firma · 50% entrega</p>
                </button>
              </div>
            </div>

            {!activeUnit && <p className="rounded-xl border border-stone-200 bg-stone-100 p-4 text-sm text-stone-600">Este modelo no tiene unidades disponibles. Elige otra tipología para conocer sus pisos y precios.</p>}

            {activeUnit && quote && (
              <div className="space-y-4 rounded-2xl bg-stone-900 p-5 text-white shadow-xl">
                <div className="border-b border-white/10 pb-3 text-xs text-[#E8D5A8]">
                  Unidad {activeUnit.codigo} · Piso {activeUnit.piso} · Modelo {Number(activeUnit.modelo)} · {activeUnit.posicion} · {formatTriventoM2(activeUnit.m2Total)} m²
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Inversión total</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatTriventoUsd(quote.total)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">USD {formatTriventoUsd(quote.rate)}/m²</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Cuota inicial ({paymentPlan === "contado" ? "100" : "50"}%)</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight text-emerald-400"><span className="block font-mono text-xs font-normal text-emerald-500/80">USD</span>{formatTriventoUsd(quote.initial)}</p>
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
                        <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatTriventoUsd(quote.balance)}</p>
                        <p className="mt-1 text-[10px] text-stone-400">En {TRIVENTO_CONFIG.delivery}</p>
                      </>
                    )}
                  </div>
                </div>
                <button type="button" onClick={contactWhatsApp} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-900">
                  <MessageCircle size={16} />
                  Quiero la unidad {activeUnit.codigo}
                </button>
              </div>
            )}
          </section>

          <section id="cierre" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200 pt-12 pb-16 text-center">
            <h3 className="font-serif text-3xl font-light text-[#1C1917]">Asegura tu lugar en Equipetrol.</h3>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-600">
              Si tienes dudas, escríbenos. Te ayudamos a comparar modelos, confirmar la lista del {INVENTORY_LABEL} y reservar el departamento. Quedan {libres.length} unidades, desde USD {formatTriventoUsd(minTicket)} al contado, con entrega en {TRIVENTO_CONFIG.delivery}.
            </p>
            <button type="button" onClick={contactWhatsApp} className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              Hablar con un asesor <ArrowRight size={14} />
            </button>
          </section>
        </div>
      </div>

      {activeSection !== "cierre" && (
        <div className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-3 border-t border-stone-200 bg-[#f7f5f0]/95 px-5 py-3 backdrop-blur-md md:left-[44%]">
          <p className="truncate text-xs text-stone-700">{selectedCash != null ? `USD ${formatTriventoUsd(selectedCash)} · ${TRIVENTO_CONFIG.delivery}` : `Desde USD ${formatTriventoUsd(minTicket)} · ${TRIVENTO_CONFIG.delivery}`}</p>
          <div className="flex shrink-0 items-center gap-1.5">
            <a href={TRIVENTO_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-stone-800">
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
            {zoom.view !== "solo" && <div className="flex justify-center gap-1.5 px-4 pb-2">
              {(["depto", "planta", "ficha"] as const).map((view) => (
                <button key={view} type="button" onClick={() => setZoom({ ...zoom, view })} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${zoom.view === view ? "bg-stone-900 text-white" : "border border-stone-200 bg-white text-stone-600"}`}>
                  {view === "depto" ? "Departamento" : view === "planta" ? "Planta" : "Ficha"}
                </button>
              ))}
            </div>}
            <div className="flex min-h-0 flex-1 items-center justify-center px-3 pb-4 md:px-10">
              <img
                src={zoom.view === "planta" ? zoom.plan : zoom.view === "ficha" ? zoom.ficha : zoom.preview}
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
