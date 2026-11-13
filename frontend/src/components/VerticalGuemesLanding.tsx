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
  VERTICAL_GUEMES_CONFIG,
  VERTICAL_MODELS,
  VERTICAL_UNITS,
  VerticalAddon,
  VerticalModel,
  VerticalPlan,
  VerticalRooms,
  formatVerticalM2,
  formatVerticalUsd,
  minCash,
  minCashForRooms,
  minRate,
  quoteVerticalUnit,
  unitsForModel,
} from "../verticalGuemesInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

const DELIVERY_TEXT = VERTICAL_GUEMES_CONFIG.delivery.toLowerCase().replace(" ", " de ");

const AMENITY_SLIDES = [
  {
    src: "/vertical_guemes/social/piscina.jpg?v=orientation-2",
    category: "Nivel 20",
    title: "Piscina panorámica",
    description: "Desconecta en la piscina del nivel 20 y disfruta de un momento para ti con la ciudad de fondo.",
  },
  {
    src: "/vertical_guemes/social/churrasquera.jpg?v=orientation-2",
    category: "Nivel 20",
    title: "Churrasquera en la terraza",
    description: "Reúne a los tuyos junto a la piscina: dos parrillas y una terraza en el nivel 20 para compartir.",
  },
  {
    src: "/vertical_guemes/social/gimnasio.jpg?v=orientation-2",
    category: "Nivel 3",
    title: "Tu gimnasio, a unos pasos",
    description: "Haz del entrenamiento parte de tu día, con un gimnasio equipado en el nivel 3 de tu edificio.",
  },
  {
    src: "/vertical_guemes/social/cowork.jpg?v=orientation-2",
    category: "Nivel 3",
    title: "Co-work para enfocarte",
    description: "Dale su propio lugar a tus ideas: un espacio de trabajo en el nivel 3, sin salir de casa.",
  },
  {
    src: "/vertical_guemes/social/lobby.jpg?v=orientation-2",
    category: "Nivel 1",
    title: "Una bienvenida de doble altura",
    description: "Llega a casa y recibe a tus visitas en un lobby que expresa el carácter de Vertical Güemes desde el primer paso.",
  },
];

const EQUIPAMIENTO = [
  {
    id: "depto",
    room: "Departamento",
    title: "Luz natural y diseño con carácter",
    image: "/vertical_guemes/equipamiento/departamento.jpg",
    items: [
      "Losa casetonada de hormigón, con opción de cielo falso",
      "Vidriado DVH y perfilería española",
      "Climatización inverter y domótica",
      "Piso de porcelanato de gran formato",
      "Balcón o terraza en todas las unidades",
    ],
  },
  {
    id: "cocina",
    room: "Cocina",
    title: "Una cocina para tu día a día",
    image: "/vertical_guemes/equipamiento/cocina.jpg",
    items: [
      "Mesones en cocina",
      "Muebles de cocina MDF o similar",
      "Revestimiento MDF o similar",
    ],
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

const ROOM_FILTERS: { id: VerticalRooms; label: string }[] = [
  { id: "1", label: "1 dormitorio" },
  { id: "2", label: "2 dormitorios" },
  { id: "3", label: "3 dormitorios" },
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
  model: VerticalModel;
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
  const plan = model.plan;
  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm ${frameClass}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-100 px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{model.name}</p>
          <p className="truncate text-xs text-stone-600">{formatVerticalM2(model.areaM2)} m² · {model.where}</p>
          <p className="line-clamp-1 text-xs leading-snug text-stone-500">{model.detail}</p>
          {price ? <p className="mt-0.5 text-sm font-semibold text-[#9a7b45]">{price}</p> : null}
        </div>
        <p className="min-w-[4.25rem] shrink-0 rounded-full border border-[#9a7b45]/40 bg-[#f7f5f0] px-3 py-1.5 text-center text-base font-bold leading-none tabular-nums text-[#816127] shadow-sm sm:text-lg" title={`Modelo ${index + 1} de ${total}`}>{index + 1}/{total}</p>
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
        <img src={plan} alt="" className="h-14 w-16 shrink-0 bg-white object-contain" />
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">En el piso</span>
          <span className="block text-xs leading-snug text-stone-600">Explora el departamento completo y descubre dónde está en el piso.</span>
        </span>
      </button>
    </div>
  );
}

function coverAreaLabel(rooms: VerticalRooms) {
  const sizes = VERTICAL_UNITS.filter((unit) => unit.rooms === rooms).map((unit) => unit.superficieM2);
  if (sizes.length === 0) return "";
  const low = Math.min(...sizes);
  const high = Math.max(...sizes);
  return low === high ? `${formatVerticalM2(low)} m²` : `${formatVerticalM2(low)} a ${formatVerticalM2(high)} m²`;
}

export default function VerticalGuemesLanding({ onClose }: Props) {
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const introNavRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const modelTouch = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState("intro");
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [amenityIndex, setAmenityIndex] = useState(0);
  const [rooms, setRooms] = useState<VerticalRooms>("1");
  const [modelIndex, setModelIndex] = useState(0);
  const [selectedModelId, setSelectedModelId] = useState("1-49");
  const [selectedCodigo, setSelectedCodigo] = useState("4B");
  const [addon, setAddon] = useState<VerticalAddon>("none");
  const [paymentPlan, setPaymentPlan] = useState<VerticalPlan>("contado");
  const [zoom, setZoom] = useState<ZoomState | null>(null);

  const from1 = minCashForRooms("1");
  const from2 = minCashForRooms("2");
  const from3 = minCashForRooms("3");
  const fromAny = minCash();
  const soldCount = VERTICAL_UNITS.filter((unit) => unit.estado === "NO_DISPONIBLE").length;
  const freeCount = VERTICAL_UNITS.length - soldCount;
  const slides = VERTICAL_MODELS.filter((model) => model.rooms === rooms);
  const slideIndex = ((modelIndex % slides.length) + slides.length) % slides.length;
  const currentModel = slides[slideIndex];
  const activeUnit = VERTICAL_UNITS.find((unit) => unit.codigo === selectedCodigo && unit.modelId === selectedModelId) || null;
  const floors = unitsForModel(selectedModelId);
  const selectedModel = VERTICAL_MODELS.find((model) => model.id === selectedModelId) || currentModel;
  const quote = activeUnit && activeUnit.estado === "LIBRE" ? quoteVerticalUnit(activeUnit, paymentPlan, addon) : null;
  const selectedCash = activeUnit && activeUnit.estado === "LIBRE" && activeUnit.cash != null ? activeUnit.cash : null;

  const roomCount = useMemo(() => {
    return {
      "1": VERTICAL_MODELS.filter((model) => model.rooms === "1").length,
      "2": VERTICAL_MODELS.filter((model) => model.rooms === "2").length,
      "3": VERTICAL_MODELS.filter((model) => model.rooms === "3").length,
    };
  }, []);

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

  const chooseRooms = (next: VerticalRooms) => {
    setRooms(next);
    setModelIndex(0);
    const first = VERTICAL_MODELS.find((model) => model.rooms === next);
    if (first) chooseModel(first);
  };

  const chooseModel = (model: VerticalModel) => {
    setSelectedModelId(model.id);
    setRooms(model.rooms);
    const group = VERTICAL_MODELS.filter((item) => item.rooms === model.rooms);
    const index = group.findIndex((item) => item.id === model.id);
    if (index >= 0) setModelIndex(index);
    const nextUnits = unitsForModel(model.id);
    const free = nextUnits.find((unit) => unit.estado === "LIBRE") || nextUnits[0];
    if (free) setSelectedCodigo(free.codigo);
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

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/vertical-guemes`;
    const shareTitle = "Vertical Güemes · Preventa en Equipetrol";
    const shareText = `Tu próximo espacio en Equipetrol: Vertical Güemes, departamentos de 1, 2 y 3 dormitorios con balcón o terraza en calle Manuel Güemes, desde USD ${formatVerticalUsd(fromAny)}. Entrega en ${DELIVERY_TEXT}.`;
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
    if (typeof window !== "undefined" && typeof (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq === "function") {
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "Lead", { content_name: "Vertical Güemes" });
    }
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: "vertical-guemes",
      operacion: "Preventa",
      zona: VERTICAL_GUEMES_CONFIG.zone,
      presupuesto: quote ? String(quote.total) : undefined,
      extraFilters: activeUnit
        ? { unidad: activeUnit.codigo, piso: activeUnit.piso, modelo: activeUnit.modelId, plan: paymentPlan, adicional: addon }
        : { plan: paymentPlan },
    }).catch(() => {});

    const planLabel = paymentPlan === "contado" ? "Contado 100%" : paymentPlan === "aporte75" ? "Aporte 75%" : "Aporte 50%";
    const addonLabel = addon === "parking"
      ? `Parqueo USD ${formatVerticalUsd(VERTICAL_GUEMES_CONFIG.parkingUsd)}`
      : addon === "parkingStorage"
        ? `Parqueo y baulera USD ${formatVerticalUsd(VERTICAL_GUEMES_CONFIG.parkingStorageUsd)}`
        : "Sin adicional";
    const unitLine = activeUnit
      ? `Unidad ${activeUnit.codigo}, piso ${activeUnit.piso}, ${selectedModel.name} (${formatVerticalM2(activeUnit.superficieM2)} m², ${selectedModel.where})`
      : "Vertical Güemes";
    const money = quote
      ? `\n• Inversión total: USD ${formatVerticalUsd(quote.total)}\n• Cuota inicial: USD ${formatVerticalUsd(quote.initial)}\n• Saldo: ${quote.balance == null ? "sin saldo pendiente" : `USD ${formatVerticalUsd(quote.balance)}`}`
      : "";
    const text = `Hola, vengo de N.I.A y quiero conocer las opciones de compra en Vertical Güemes (calle Manuel Güemes, Equipetrol):\n\n• ${unitLine}\n• ${addonLabel}\n• Modalidad: ${planLabel}${money}\n• Entrega: ${VERTICAL_GUEMES_CONFIG.delivery}\n\n¿Me confirman la disponibilidad actual de esta unidad y los pasos para comprar? Vi la lista del ${VERTICAL_GUEMES_CONFIG.priceListLabel}.`;
    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const amenity = AMENITY_SLIDES[amenityIndex];

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
        <img src="/vertical_guemes/fachada.jpg" alt="Fachada de Vertical Güemes en Equipetrol" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
        <div className="relative z-10 w-full min-w-0 px-4 pb-24 pt-16 text-white sm:px-5 lg:px-7 lg:pb-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e8d5a8] backdrop-blur-md">
              <Sparkles size={12} />
              Preventa · 59 departamentos
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
              <MapPin size={12} className="text-[#e8d5a8]" />
              Equipetrol
            </span>
          </div>
          <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 font-serif leading-none drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]">
            <span className="text-4xl font-light tracking-wide md:text-5xl">Vertical</span>
            <span className="text-2xl font-light text-[#e8d5a8] md:text-3xl">Güemes</span>
          </h1>
          <p className="mt-2 max-w-md text-sm leading-snug text-white/90">Tu espacio en Equipetrol, con balcón o terraza y una piscina para disfrutar la ciudad desde lo alto.</p>
          <div className="mt-3 flex max-w-lg gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Calendar size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Entrega de obra</p>
                <p className="mt-0.5 text-sm font-medium leading-tight">{VERTICAL_GUEMES_CONFIG.delivery}</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Building2 size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Colaborador</p>
                <p className="mt-0.5 text-[11px] font-medium leading-tight sm:text-sm">Constructora Mediterráneo</p>
              </div>
            </div>
          </div>
          <div className="mt-2 max-w-lg rounded-2xl border border-[#e8d5a8]/30 bg-black/55 px-3.5 py-3 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e8d5a8]">Departamentos disponibles</p>
            <div className="mt-2 space-y-2">
              {([
                { label: "1 Dormitorio", area: coverAreaLabel("1"), price: from1 },
                { label: "2 Dormitorios", area: coverAreaLabel("2"), price: from2 },
                { label: "3 Dormitorios", area: coverAreaLabel("3"), price: from3 },
              ] as const).map((row) => (
                <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 border-t border-white/10 pt-2 first:border-0 first:pt-0">
                  <div className="min-w-0">
                    <p className="text-sm text-white">{row.label}</p>
                    <p className="text-[11px] text-white/70">{row.area}</p>
                  </div>
                  <p className="text-right leading-tight">
                    {row.price == null ? (
                      <span className="font-serif text-sm font-semibold">Agotado</span>
                    ) : (
                      <>
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/70">Desde</span>
                        <span className="block font-serif text-[11px] font-semibold leading-none text-white/80">USD</span>
                        <span className="mt-0.5 block font-serif text-[13px] font-semibold leading-none tabular-nums sm:text-sm">{formatVerticalUsd(row.price)}</span>
                      </>
                    )}
                  </p>
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
                Tu próxima dirección en Equipetrol
              </span>
              <h2 className="font-serif text-3xl font-light leading-tight text-[#1C1917] md:text-5xl">
                Vive en Vertical Güemes.
                <span className="mt-1 block font-normal italic text-[#9a7b45]">Un lugar con tu propio carácter.</span>
              </h2>
              <p className="pt-2 text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word] md:text-base">
                Abre la puerta a una nueva etapa en Equipetrol: tu propio balcón o terraza, espacios con luz natural y una arquitectura de hormigón visto que se distingue. Elige entre 1, 2 y 3 dormitorios en un proyecto de 59 departamentos y 20 niveles, con piscina, gimnasio y co-work para disfrutar más de cada día. Entrega en {DELIVERY_TEXT}.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#E7E5E4] bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Lista del {VERTICAL_GUEMES_CONFIG.priceListLabel}</p>
                <p className="mt-0.5 font-serif text-lg font-bold text-stone-900">{soldCount} de {VERTICAL_UNITS.length} unidades no disponibles</p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Quedan {freeCount}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => scrollToSection("disponibilidad")} className="flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md">
                Encontrar mi departamento
              </button>
              <a href={VERTICAL_GUEMES_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-800">
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Vive cerca de lo que mueve tu día.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Haz de Equipetrol el punto de partida de tu rutina. En calle Manuel Güemes, Santa Cruz de la Sierra, tienes un entorno consolidado con restaurantes, comercios, salud y educación. Los Tajibos, el Marriott, Ventura Mall y el colegio La Salle son algunos de sus referentes: una ubicación para conectar tu hogar con lo que necesitas.
            </p>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <img src="/vertical_guemes/ubicacion.jpg" alt="Mapa de Vertical Güemes en calle Manuel Güemes, Equipetrol" className="block h-auto w-full" />
            </div>
            <a href={VERTICAL_GUEMES_CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              Conocer mi próximo entorno <ArrowRight size={14} />
            </a>
          </section>

          <section id="amenidades" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Áreas sociales</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Más planes para disfrutar sin salir de casa.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Sube al nivel 20 para desconectar en la piscina panorámica o reunir a los tuyos en la terraza social con dos parrillas. En el nivel 3, combina tu rutina con gimnasio equipado, co-work, lavandería con máquinas industriales y un salón cerrado con churrasquera tipo isla. Y al llegar, un lobby de doble altura te recibe en el nivel 1.
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
              <h3 className="font-serif text-2xl font-light leading-tight text-[#1C1917]">Un espacio que se adapta a tu vida.</h3>
            </div>
            <div className="grid shrink-0 grid-cols-3 gap-2">
              {ROOM_FILTERS.map((filter) => (
                <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-2xl border px-3 py-2 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white shadow-md ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white/80"}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{filter.label}</p>
                  <p className="text-[11px] text-stone-500">{roomCount[filter.id]} plantas</p>
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
              onOpen={(view) => setZoom({ view, title: currentModel.name, caption: `${formatVerticalM2(currentModel.areaM2)} m² · ${currentModel.detail}`, preview: currentModel.preview, plan: currentModel.plan, full: currentModel.full })}
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Comodidad que se nota cada día.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Dale forma a tu hogar sobre una base que ya incluye cocina con mesones y muebles, porcelanato de gran formato, vidriado DVH y perfilería española. La losa casetonada de hormigón aporta identidad a los ambientes, mientras la climatización inverter y la domótica acompañan tu comodidad. El mobiliario de las imágenes es referencial y no está incluido.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {EQUIPAMIENTO.map((group) => (
                <div key={group.id} className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                  <img src={group.image} alt={group.title} className={group.id === "bano" ? "max-h-[320px] w-full object-contain" : "h-[210px] w-full object-cover"} />
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
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><Building2 size={13} /> Colaboradores</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Tu próximo hogar, con experiencia detrás.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Elige con el respaldo de una trayectoria que puedes conocer. Constructora Mediterráneo aporta más de 35 años de experiencia en Santa Cruz, con proyectos como Vertical Isuto, Vertical 60 y Vertical Terra. El estudio Sommet, fundado en 2008 por Sebastián Fernández de Córdova y Erika Peinado, firma una arquitectura sobria, con espacios fluidos y una conexión entre interior y exterior pensada para vivirla.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex min-h-36 flex-col justify-center rounded-xl border border-stone-200 bg-white p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">Constructora</p>
                <p className="mt-2 font-serif text-xl text-stone-900">Constructora Mediterráneo</p>
              </div>
              <div className="flex min-h-36 flex-col justify-center rounded-xl border border-stone-200 bg-white p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">Arquitectura</p>
                <p className="mt-2 font-serif text-xl text-stone-900">Estudio Sommet</p>
                <p className="mt-1 text-xs text-stone-500">Sebastián Fernández de Córdova y Erika Peinado</p>
              </div>
            </div>
          </section>

          <section id="pago" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Formas de pago</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Da el primer paso hacia tu próximo hogar.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Elige cómo iniciar tu compra: accede al menor precio por m² con pago al contado o empieza con un aporte del 75% o del 50%. Cada modalidad tiene su propio precio. Compara la inversión, la inicial y el saldo de tu unidad para planificar tu llegada en {DELIVERY_TEXT}. Precios según la lista del {VERTICAL_GUEMES_CONFIG.priceListLabel}; parqueo por separado.
            </p>
            <article className="rounded-2xl bg-stone-900 p-5 text-white shadow-lg">
              <span className="rounded-full bg-[#C19A6B] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950">Contado</span>
              <h4 className="mt-3 font-serif text-2xl">Aprovecha el precio al contado.</h4>
              <p className="mt-2 font-serif text-3xl text-[#E8D5A8]">Desde USD {formatVerticalUsd(minRate("contado"))}/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-300">Paga el 100% del departamento y accede al menor precio por m² de las tres modalidades publicadas. Elige tu unidad y conoce su valor exacto antes de dar el siguiente paso.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">Aporte 75%</span>
              <h4 className="mt-3 font-serif text-2xl leading-snug">Aporta el 75% y deja un saldo menor.</h4>
              <p className="mt-2 font-serif text-3xl text-stone-900">Desde USD {formatVerticalUsd(minRate("aporte75"))}/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">Adelanta una mayor parte de tu inversión y deja el 25% del departamento como saldo. El aporte se calcula sobre el precio de esta modalidad; consulta con un asesor el calendario de pago.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">Aporte 50%</span>
              <h4 className="mt-3 font-serif text-2xl leading-snug">Empieza con el 50% de tu departamento.</h4>
              <p className="mt-2 font-serif text-3xl text-stone-900">Desde USD {formatVerticalUsd(minRate("aporte50"))}/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">Inicia la compra con la mitad del valor del departamento y conserva mayor liquidez al comenzar. El 50% restante queda como saldo. Confirma con un asesor las condiciones y fechas de pago de esta modalidad.</p>
            </article>
            <div className="space-y-2 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
              <p>Suma la comodidad de tu propio parqueo o añade una baulera para guardar lo que no usas a diario. Parqueo desde USD {formatVerticalUsd(VERTICAL_GUEMES_CONFIG.parkingUsd)}; parqueo con baulera desde USD {formatVerticalUsd(VERTICAL_GUEMES_CONFIG.parkingStorageUsd)}. El precio depende del puesto: la cotización usa el menor que figura disponible en la lista.</p>
            </div>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
              Elegir mi departamento <ArrowRight size={14} />
            </button>
          </section>

          <section id="disponibilidad" className="mt-20 scroll-mt-2 space-y-6 border-t border-stone-200/80 pt-6">
            <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
            <div className="shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Disponibilidad</span>
              <h3 className="font-serif text-2xl font-light leading-tight text-[#1C1917]">Elige tu unidad y conoce tu inversión.</h3>
              <p className="mt-1 text-xs text-stone-500">{freeCount} unidades disponibles según la lista del {VERTICAL_GUEMES_CONFIG.priceListLabel}. Verde: disponible · Gris: no disponible.</p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2">
              <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 1 · Tipología</p>
              <div className="grid shrink-0 grid-cols-3 gap-2">
                {ROOM_FILTERS.map((filter) => (
                  <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-xl border p-3 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white"}`}>
                    <p className="text-sm font-bold">{filter.label}</p>
                    <p className="text-[11px] text-[#9a7b45]">{minCashForRooms(filter.id) == null ? "Sin unidades libres" : `Desde USD ${formatVerticalUsd(minCashForRooms(filter.id) as number)}`}</p>
                  </button>
                ))}
              </div>
              <ModelFrame
                model={currentModel}
                index={slideIndex}
                total={slides.length}
                price={selectedCash != null ? `USD ${formatVerticalUsd(selectedCash)}` : (() => {
                  const freeUnits = unitsForModel(currentModel.id).filter((unit) => unit.estado === "LIBRE");
                  if (freeUnits.length === 0) return "No disponible";
                  const amount = Math.min(...freeUnits.map((unit) => unit.cash));
                  return `Desde USD ${formatVerticalUsd(amount)}`;
                })()}
                frameClass="min-h-0 flex-1"
                onPrev={() => shiftModel(-1)}
                onNext={() => shiftModel(1)}
                onOpen={(view) => setZoom({ view, title: currentModel.name, caption: `${formatVerticalM2(currentModel.areaM2)} m² · ${currentModel.detail}`, preview: currentModel.preview, plan: currentModel.plan, full: currentModel.full })}
                onTouchStart={(event) => { modelTouch.current = event.changedTouches[0].clientX; }}
                onTouchEnd={onModelSwipe}
              />
            </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold uppercase tracking-wider text-stone-500">Paso 2 · Piso</span>
                <span className="flex items-center gap-3">
                  {selectedCash != null && <span className="font-semibold text-[#9a7b45]">USD {formatVerticalUsd(selectedCash)}</span>}
                  <button type="button" onClick={() => setZoom({ view: "solo", src: "/vertical_guemes/esquema.jpg", title: "Distribución del edificio", caption: "Niveles 1 y 2 de estacionamientos, departamentos desde el nivel 3 y áreas sociales en los niveles 3 y 20." })} className="font-semibold text-[#816127]">
                    Ver distribución de pisos
                  </button>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-stone-200 bg-white p-2 sm:grid-cols-5">
                {floors.map((floor) => {
                  const current = activeUnit?.codigo === floor.codigo;
                  const libre = floor.estado === "LIBRE";
                  return (
                    <button key={floor.codigo} type="button" disabled={!libre} onClick={() => setSelectedCodigo(floor.codigo)} className={`rounded-lg px-1 py-2 text-xs font-semibold ${current ? "bg-stone-900 text-white" : libre ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "cursor-not-allowed bg-stone-100 text-stone-400"}`}>
                      <span className="block">Piso {floor.piso}</span>
                      <span className="block text-[10px] font-normal">Unidad {floor.codigo}</span>
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
                  ["parking", "Parqueo", `USD ${formatVerticalUsd(VERTICAL_GUEMES_CONFIG.parkingUsd)}`],
                  ["parkingStorage", "Parqueo y baulera", `USD ${formatVerticalUsd(VERTICAL_GUEMES_CONFIG.parkingStorageUsd)}`],
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
                {([
                  ["contado", "Contado", "100% del departamento"],
                  ["aporte75", "Aporte 75%", "75% inicial y saldo"],
                  ["aporte50", "Aporte 50%", "50% inicial y saldo"],
                ] as const).map(([id, label, hint]) => (
                  <button key={id} type="button" onClick={() => setPaymentPlan(id)} className={`rounded-xl border p-3 text-left ${paymentPlan === id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                    <p className="text-sm font-bold">{label}</p>
                    <p className={`text-[11px] ${paymentPlan === id ? "text-[#E8D5A8]" : "text-stone-500"}`}>{hint}</p>
                  </button>
                ))}
              </div>
            </div>

            {activeUnit && activeUnit.estado === "NO_DISPONIBLE" && (
              <p className="rounded-xl border border-stone-200 bg-stone-100 p-4 text-sm text-stone-600">La unidad {activeUnit.codigo} figura como no disponible en la lista. Elige otro piso.</p>
            )}

            {activeUnit && quote && (
              <div className="space-y-4 rounded-2xl bg-stone-900 p-5 text-white shadow-xl">
                <div className="border-b border-white/10 pb-3 text-xs text-[#E8D5A8]">
                  Unidad {activeUnit.codigo} · Piso {activeUnit.piso} · {selectedModel.name} · {formatVerticalM2(activeUnit.superficieM2)} m² · {selectedModel.where}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Inversión total</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatVerticalUsd(quote.total)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">USD {formatVerticalUsd(quote.rate)}/m²{quote.parking ? ` + adicional USD ${formatVerticalUsd(quote.parking)}` : ""}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Cuota inicial ({quote.percent}%)</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight text-emerald-400"><span className="block font-mono text-xs font-normal text-emerald-500/80">USD</span>{formatVerticalUsd(quote.initial)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">Incluye el adicional, si lo sumas</p>
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
                        <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatVerticalUsd(quote.balance)}</p>
                        <p className="mt-1 text-[10px] text-stone-400">{100 - quote.percent}% del departamento</p>
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
            <h3 className="font-serif text-3xl font-light text-[#1C1917]">Tu próxima etapa tiene dirección en Equipetrol.</h3>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-600">
              Elige el departamento que acompaña tu forma de vivir y planifica tu llegada para {DELIVERY_TEXT}. Conversemos sobre la unidad que te interesa y confirmemos su disponibilidad y condiciones de compra.
            </p>
            <button type="button" onClick={contactWhatsApp} className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              Quiero conocer Vertical Güemes <ArrowRight size={14} />
            </button>
          </section>
        </div>
      </div>

      {activeSection !== "cierre" && (
        <div className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-2 border-t border-stone-200 bg-[#f7f5f0]/95 px-3 py-2.5 backdrop-blur-md sm:px-5 sm:py-3 md:left-[44%]">
          <div className="min-w-0">
            <p className="text-[11px] leading-tight text-stone-700 sm:text-xs">{selectedCash != null ? `USD ${formatVerticalUsd(selectedCash)}` : `Desde USD ${formatVerticalUsd(fromAny)}`}</p>
            <p className="text-[10px] text-stone-500">{VERTICAL_GUEMES_CONFIG.delivery}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a href={VERTICAL_GUEMES_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" aria-label="Brochure" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2 py-2 text-[10px] font-semibold uppercase text-stone-800 sm:text-[11px] sm:tracking-wider">
              <Download size={14} className="text-[#9a7b45]" />
              <span className="hidden sm:inline">Brochure</span>
            </a>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="rounded-lg bg-[#1C1917] px-2 py-2 text-[10px] font-bold uppercase text-white sm:px-2.5 sm:text-[11px] sm:tracking-wider">
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
