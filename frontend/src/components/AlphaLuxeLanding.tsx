import { useEffect, useRef, useState, type TouchEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Building2,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Home,
  MapPin,
  Menu,
  MessageCircle,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import {
  ALPHA_LUXE_CONFIG,
  ALPHA_MODELS,
  ALPHA_UNITS,
  AlphaAddon,
  AlphaModel,
  AlphaPlan,
  AlphaRooms,
  areaRangeForRooms,
  formatAlphaM2,
  formatAlphaUsd,
  minCash,
  minCashForRooms,
  minRate,
  quoteAlphaUnit,
  unitsForModel,
} from "../alphaLuxeInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

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

const AMENITY_SLIDES = [
  { src: "/alpha_luxe/social/piscina.jpg", category: "Amenidad", title: "Piscina", description: "Piscina del edificio." },
  { src: "/alpha_luxe/social/gimnasio.jpg", category: "Amenidad", title: "Gimnasio", description: "Gimnasio." },
  { src: "/alpha_luxe/social/calistenia.jpg", category: "Amenidad", title: "Área de calistenia", description: "Área de calistenia." },
  { src: "/alpha_luxe/social/juegos.jpg", category: "Amenidad", title: "Sala de juegos", description: "Sala de juegos." },
  { src: "/alpha_luxe/social/churrasquera.jpg", category: "Amenidad", title: "Churrasqueras", description: "Tres churrasqueras." },
  { src: "/alpha_luxe/social/cowork.jpg", category: "Amenidad", title: "CoWork", description: "Espacio de cowork." },
  { src: "/alpha_luxe/fachada-acceso.jpg", category: "Ingreso", title: "Acceso", description: "Acceso con control de ingreso y lobby." },
];

const ROOM_FILTERS: { id: AlphaRooms; label: string }[] = [
  { id: "1", label: "1 dormitorio" },
  { id: "2", label: "2 dormitorios" },
];

const PLAN_OPTIONS: { id: AlphaPlan; label: string; hint: string }[] = [
  { id: "contado", label: "Al contado", hint: "100% del departamento" },
  { id: "aporte50", label: "Aporte 50%", hint: "50% inicial y saldo" },
  { id: "aporte40", label: "Aporte 40%", hint: "40% inicial y saldo" },
];

const ADDON_OPTIONS: { id: AlphaAddon; label: string; hint: string }[] = [
  { id: "none", label: "Sin adicional", hint: "Solo el departamento" },
  { id: "parking", label: "Parqueo", hint: `USD ${formatAlphaUsd(ALPHA_LUXE_CONFIG.parkingUsd)}` },
  { id: "parkingStorage", label: "Parqueo y baulera", hint: `USD ${formatAlphaUsd(ALPHA_LUXE_CONFIG.parkingStorageUsd)}` },
  { id: "storage", label: "Baulera", hint: `USD ${formatAlphaUsd(ALPHA_LUXE_CONFIG.storageUsd)}` },
];

const PLAN_NAME: Record<AlphaPlan, string> = {
  contado: "Al contado",
  aporte50: "Aporte 50%",
  aporte40: "Aporte 40%",
};

type ZoomState = { view: "depto" | "planta" | "ficha"; title: string; caption: string; src: string };

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
  model: AlphaModel;
  index: number;
  total: number;
  price: string;
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
          <p className="truncate text-xs text-stone-600">{formatAlphaM2(model.areaM2)} m² · {model.where}</p>
          <p className="line-clamp-1 text-xs leading-snug text-stone-500">{model.detail}</p>
          <p className="mt-0.5 text-sm font-semibold text-[#9a7b45]">{price}</p>
        </div>
        <p className="min-w-[4.25rem] shrink-0 rounded-full border border-[#9a7b45]/40 bg-[#f7f5f0] px-3 py-1.5 text-center text-base font-bold leading-none tabular-nums text-[#816127] shadow-sm sm:text-lg" title={`Modelo ${index + 1} de ${total}`}>{index + 1}/{total}</p>
      </div>
      <div className="relative min-h-0 flex-1 bg-white">
        <button type="button" onClick={() => onOpen("depto")} className="absolute inset-0 flex items-center justify-center p-2" aria-label={`Ver ${model.name} completo`}>
          <img src={model.preview} alt={`${model.name}, departamento`} className="max-h-full max-w-full object-contain" />
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

function coverAreaLabel(rooms: AlphaRooms) {
  const range = areaRangeForRooms(rooms);
  if (!range) return "";
  return range.low === range.high ? `${formatAlphaM2(range.low)} m²` : `${formatAlphaM2(range.low)} a ${formatAlphaM2(range.high)} m²`;
}

export default function AlphaLuxeLanding({ onClose }: Props) {
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const introNavRef = useRef<HTMLDivElement>(null);
  const modelTouch = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState("intro");
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [amenityIndex, setAmenityIndex] = useState(0);
  const [rooms, setRooms] = useState<AlphaRooms>("2");
  const [modelIndex, setModelIndex] = useState(0);
  const [selectedModelId, setSelectedModelId] = useState("1");
  const [selectedCodigo, setSelectedCodigo] = useState("4-1");
  const [paymentPlan, setPaymentPlan] = useState<AlphaPlan>("contado");
  const [addon, setAddon] = useState<AlphaAddon>("none");
  const [zoom, setZoom] = useState<ZoomState | null>(null);

  const slides = ALPHA_MODELS.filter((model) => model.rooms === rooms);
  const slideIndex = ((modelIndex % slides.length) + slides.length) % slides.length;
  const currentModel = slides[slideIndex];
  const activeUnit = ALPHA_UNITS.find((unit) => unit.codigo === selectedCodigo && unit.modelId === selectedModelId) || null;
  const floors = unitsForModel(selectedModelId);
  const selectedModel = ALPHA_MODELS.find((model) => model.id === selectedModelId) || currentModel;
  const amenity = AMENITY_SLIDES[amenityIndex];
  const quote = activeUnit ? quoteAlphaUnit(activeUnit, paymentPlan, addon) : null;
  const selectedCash = activeUnit?.cash ?? null;
  const fromAny = minCash();

  useEffect(() => {
    const root = rightPanelRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll("section[id]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      { root: window.matchMedia("(min-width: 768px)").matches ? root : null, rootMargin: "-12% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] },
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

  const chooseModel = (model: AlphaModel) => {
    setSelectedModelId(model.id);
    setRooms(model.rooms);
    const group = ALPHA_MODELS.filter((item) => item.rooms === model.rooms);
    const index = group.findIndex((item) => item.id === model.id);
    if (index >= 0) setModelIndex(index);
    const next = unitsForModel(model.id)[0];
    if (next) setSelectedCodigo(next.codigo);
  };

  const chooseRooms = (next: AlphaRooms) => {
    setRooms(next);
    const first = ALPHA_MODELS.find((model) => model.rooms === next);
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

  const cardPrice = () => {
    if (activeUnit && activeUnit.modelId === currentModel.id) return `USD ${formatAlphaUsd(activeUnit.cash)}`;
    const listed = unitsForModel(currentModel.id);
    if (listed.length === 0) return "Consultar disponibilidad";
    return `USD ${formatAlphaUsd(Math.min(...listed.map((item) => item.cashCents)) / 100)}`;
  };

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/alpha-luxe`;
    const shareTitle = "Alpha by Luxe Design · Av. Beni";
    const shareText = `Alpha by Luxe Design, en Avenida Beni. Departamentos de 1 y 2 dormitorios. Entrega en febrero de 2028.`;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareTitle}\n${shareText}\n${shareUrl}`);
      setShareFeedback(true);
      window.setTimeout(() => setShareFeedback(false), 2200);
    } catch {
      setShareFeedback(false);
    }
  };

  const contactWhatsApp = () => {
    if (typeof window !== "undefined" && typeof (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq === "function") {
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "Lead", { content_name: "Alpha by Luxe Design" });
    }
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: "alpha-luxe",
      operacion: "Preventa",
      zona: ALPHA_LUXE_CONFIG.zone,
      extraFilters: activeUnit ? { unidad: activeUnit.codigo, piso: activeUnit.piso, plan: paymentPlan, adicional: addon } : {},
    }).catch(() => {});
    const addonLabel = ADDON_OPTIONS.find((item) => item.id === addon);
    const lines = activeUnit && quote
      ? [
        `Unidad ${activeUnit.codigo}, piso ${activeUnit.piso}, ${selectedModel.name} (${formatAlphaM2(activeUnit.superficieM2)} m²)`,
        `Plan: ${PLAN_NAME[paymentPlan]}`,
        `Departamento: USD ${formatAlphaUsd(quote.department)}`,
        `Adicional: ${addonLabel?.label || "Sin adicional"}${quote.parking ? ` USD ${formatAlphaUsd(quote.parking)}` : ""}`,
        `Total: USD ${formatAlphaUsd(quote.total)}`,
        `Inicial: USD ${formatAlphaUsd(quote.initial)}`,
        `Saldo: ${quote.balance == null ? "sin saldo pendiente" : `USD ${formatAlphaUsd(quote.balance)}`}`,
      ]
      : ["Alpha by Luxe Design"];
    const text = `Hola, vengo de N.I.A y quiero consultar Alpha by Luxe Design (Avenida Beni):\n\n${lines.map((line) => `• ${line}`).join("\n")}`;
    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const openModel = (model: AlphaModel, view: "depto" | "planta" | "ficha") => {
    setZoom({
      view,
      title: model.name,
      caption: `${formatAlphaM2(model.areaM2)} m² · ${model.detail}`,
      src: view === "planta" ? model.plan : model.preview,
    });
  };

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
        <img src="/alpha_luxe/fachada.jpg" alt="Fachada de Alpha by Luxe Design" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
        <div className="relative z-10 w-full min-w-0 px-4 pb-24 pt-16 text-white sm:px-5 lg:px-7 lg:pb-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e8d5a8] backdrop-blur-md">
              <Sparkles size={12} />
              Preventa · 102 departamentos
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
              <MapPin size={12} className="text-[#e8d5a8]" />
              Av. Beni
            </span>
          </div>
          <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 font-serif leading-none drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]">
            <span className="text-4xl font-light tracking-wide md:text-5xl">Alpha</span>
            <span className="text-2xl font-light text-[#e8d5a8] md:text-3xl">by Luxe Design</span>
          </h1>
          <p className="mt-2 max-w-md text-sm leading-snug text-white/90">Avenida Beni, a pasos del 2.º anillo. Entrega en febrero de 2028.</p>
          <div className="mt-3 flex max-w-lg gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Calendar size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Entrega de obra</p>
                <p className="mt-0.5 text-sm font-medium leading-tight">Febrero 2028</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Building2 size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Colaborador</p>
                <p className="mt-0.5 text-[11px] font-medium leading-tight sm:text-sm">Luxe Design</p>
              </div>
            </div>
          </div>
          <div className="mt-2 max-w-lg rounded-2xl border border-[#e8d5a8]/30 bg-black/55 px-3.5 py-3 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e8d5a8]">Departamentos</p>
            <div className="mt-2 space-y-2">
              {ROOM_FILTERS.map((row) => {
                const from = minCashForRooms(row.id);
                return (
                  <div key={row.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 border-t border-white/10 pt-2 first:border-0 first:pt-0">
                    <div className="min-w-0">
                      <p className="text-sm text-white">{row.label[0].toUpperCase() + row.label.slice(1)}</p>
                      <p className="text-[11px] text-white/70">{coverAreaLabel(row.id)}</p>
                    </div>
                    <p className="text-right font-serif text-sm font-semibold leading-tight">
                      {from == null ? "Consultar" : `Desde USD ${formatAlphaUsd(from)}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div ref={rightPanelRef} className="min-w-0 flex-1 md:h-screen md:overflow-y-auto">
        <div className="mx-auto max-w-xl px-5 py-8 pb-32 md:max-w-3xl md:px-10 md:py-14 md:pb-44 lg:max-w-4xl lg:px-14 xl:max-w-5xl">
          <section id="intro" className="scroll-mt-6 space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">
                <Sparkles size={13} />
                Avenida Beni
              </span>
              <h2 className="font-serif text-3xl font-light leading-tight text-[#1C1917] md:text-5xl">
                Vive en Alpha.
                <span className="mt-1 block font-normal italic text-[#9a7b45]">El lujo llegó al norte.</span>
              </h2>
              <p className="pt-2 text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word] md:text-base">
                Edificio de 21 pisos más planta baja, en el norte de Santa Cruz. Son 102 departamentos de 1 y 2 dormitorios. La lista del {ALPHA_LUXE_CONFIG.priceListLabel} publica 62, en los pisos 4 al 18. En planta baja hay oficinas comerciales. Tres pisos de parqueos. Entrega en febrero de 2028.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#E7E5E4] bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Disponibilidad</p>
                <p className="mt-0.5 font-serif text-lg font-bold text-stone-900">102 departamentos. La lista publica 62.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Lista {ALPHA_LUXE_CONFIG.priceListLabel}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => scrollToSection("disponibilidad")} className="flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md">
                Elegir mi departamento
              </button>
              <a href={ALPHA_LUXE_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-800">
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

          <section id="lugar" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><MapPin size={13} /> Ubicación</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Avenida Beni, a pasos del 2.º anillo.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] md:text-base">
              Alpha está sobre Avenida Beni, a pasos del 2.º anillo, entre Av. Cristo Redentor y Av. Cristóbal de Mendoza. En el entorno están el Colegio La Salle, la Universidad NUR, Hipermaxi y la Universidad Domingo Savio.
            </p>
            <img src="/alpha_luxe/ubicacion.jpg" alt="Mapa de Alpha sobre Avenida Beni" className="w-full rounded-2xl object-cover" />
          </section>

          <section id="amenidades" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Áreas sociales</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Piscina, gimnasio y tres churrasqueras.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] md:text-base">
              El edificio incluye piscina, gimnasio, área de calistenia, sala de juegos, tres churrasqueras y cowork.
            </p>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <img src={amenity.src} alt={amenity.title} className="aspect-[16/10] w-full object-cover" />
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">{amenity.category}</p>
                  <p className="font-serif text-lg text-stone-900">{amenity.title}</p>
                  <p className="text-xs text-stone-500">{amenity.description}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => setAmenityIndex((index) => (index + AMENITY_SLIDES.length - 1) % AMENITY_SLIDES.length)} className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200" aria-label="Área anterior"><ChevronLeft size={18} /></button>
                  <button type="button" onClick={() => setAmenityIndex((index) => (index + 1) % AMENITY_SLIDES.length)} className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200" aria-label="Área siguiente"><ChevronRight size={18} /></button>
                </div>
              </div>
            </div>
          </section>

          <section id="tipologias" className="mt-20 scroll-mt-6 space-y-4 border-t border-stone-200/80 pt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Tipologías</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917]">Nueve plantas, de 1 y 2 dormitorios.</h3>
            <p className="text-sm leading-relaxed text-stone-600">Los tipos 1 al 6 salen con balcón. El horno está en los departamentos de dos dormitorios. Los muebles del render son referenciales.</p>
            <div className="flex gap-2">
              {ROOM_FILTERS.map((filter) => (
                <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${rooms === filter.id ? "bg-stone-900 text-white" : "border border-stone-200 bg-white text-stone-700"}`}>
                  {filter.label}
                </button>
              ))}
            </div>
            <ModelFrame
              model={currentModel}
              index={slideIndex}
              total={slides.length}
              price={cardPrice()}
              frameClass="h-[calc(100svh-7.25rem)]"
              onPrev={() => shiftModel(-1)}
              onNext={() => shiftModel(1)}
              onOpen={(view) => openModel(currentModel, view)}
              onTouchStart={(event) => { modelTouch.current = event.changedTouches[0].clientX; }}
              onTouchEnd={onModelSwipe}
            />
          </section>

          <section id="equipamiento" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Equipamiento</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Cocina lista y acceso controlado.</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <img src="/alpha_luxe/equipamiento/living.jpg" alt="Living referencial de un departamento de Alpha" className="aspect-[4/3] w-full rounded-2xl object-cover" />
              <img src="/alpha_luxe/equipamiento/cocina.jpg" alt="Cocina referencial de un departamento de Alpha" className="aspect-[4/3] w-full rounded-2xl object-cover" />
            </div>
            <ul className="grid grid-cols-1 gap-2 text-sm text-stone-700 sm:grid-cols-2">
              {[
                "Muebles fijos en cocina y baños",
                "Placa extractora, microondas, horno y cocina encimera",
                "Aire acondicionado frío y calor en living comedor y dormitorios",
                "Termotanque eléctrico y pisos de 61×122 cm",
                "Box de baño de vidrio templado y espejo retroiluminado",
                "Chapas digitales e intercomunicador con videollamada",
                "Dos ascensores para 13 personas",
                "CCTV, control de ingreso y acceso automático a estacionamientos",
                "Iluminación con sensores en circulación y estacionamientos",
                "Lobby con mobiliario",
              ].map((item) => (
                <li key={item} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-[#9a7b45]" />{item}</li>
              ))}
            </ul>
          </section>

          <section id="constructora" className="mt-20 scroll-mt-6 space-y-4 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Colaboradores</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Luxe Design.</h3>
            <p className="text-sm leading-relaxed text-stone-600 md:text-base">
              Luxe Design firma Alpha. Entrega en febrero de 2028.
            </p>
          </section>

          <section id="pago" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Formas de pago</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Aporte del 40%, del 50% o el total al contado.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] md:text-base">
              Cada modalidad publica su propio precio por m². El contado es el menor. El departamento que elijas muestra el monto en dólares. Lista del {ALPHA_LUXE_CONFIG.priceListLabel}.
            </p>
            <article className="rounded-2xl bg-stone-900 p-5 text-white shadow-lg">
              <span className="rounded-full bg-[#C19A6B] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950">Contado</span>
              <h4 className="mt-3 font-serif text-2xl">Paga el departamento completo.</h4>
              <p className="mt-2 font-serif text-3xl text-[#E8D5A8]">Desde USD {formatAlphaUsd(minRate("contado"))}/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-300">El 100% del departamento, al menor precio por m² de las tres columnas. Al elegir la unidad ves el monto.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">Aporte 50%</span>
              <h4 className="mt-3 font-serif text-2xl leading-snug">Adelanta la mitad.</h4>
              <p className="mt-2 font-serif text-3xl text-stone-900">Desde USD {formatAlphaUsd(minRate("aporte50"))}/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">La inicial es el 50% del precio de esta modalidad. El otro 50% queda como saldo del departamento.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">Aporte 40%</span>
              <h4 className="mt-3 font-serif text-2xl leading-snug">Empieza con el 40%.</h4>
              <p className="mt-2 font-serif text-3xl text-stone-900">Desde USD {formatAlphaUsd(minRate("aporte40"))}/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">La inicial es el 40% del precio de esta modalidad. El 60% restante queda como saldo del departamento.</p>
            </article>
            <div className="space-y-2 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
              <p>Parqueo USD {formatAlphaUsd(ALPHA_LUXE_CONFIG.parkingUsd)}. Parqueo con baulera USD {formatAlphaUsd(ALPHA_LUXE_CONFIG.parkingStorageUsd)}. Baulera USD {formatAlphaUsd(ALPHA_LUXE_CONFIG.storageUsd)}. El adicional se suma a la cuota inicial.</p>
            </div>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
              Elegir mi departamento <ArrowRight size={14} />
            </button>
          </section>

          <section id="disponibilidad" className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-6">
            <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
              <div className="shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Disponibilidad</span>
                <h3 className="mt-1 font-serif text-2xl font-light text-[#1C1917]">Elige tu unidad y mira la inversión.</h3>
                <p className="text-xs text-stone-500">Lista del {ALPHA_LUXE_CONFIG.priceListLabel}. Verde: disponible.</p>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 1 · Tipología</p>
                <div className="grid shrink-0 grid-cols-2 gap-2">
                  {ROOM_FILTERS.map((filter) => {
                    const from = minCashForRooms(filter.id);
                    return (
                      <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-xl border p-3 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white"}`}>
                        <span className="block text-sm font-bold">{filter.label}</span>
                        <span className="text-[11px] text-[#9a7b45]">{from == null ? "Consultar disponibilidad" : `Desde USD ${formatAlphaUsd(from)}`}</span>
                      </button>
                    );
                  })}
                </div>
                <ModelFrame
                  model={currentModel}
                  index={slideIndex}
                  total={slides.length}
                  price={cardPrice()}
                  frameClass="min-h-0 flex-1"
                  onPrev={() => shiftModel(-1)}
                  onNext={() => shiftModel(1)}
                  onOpen={(view) => openModel(currentModel, view)}
                  onTouchStart={(event) => { modelTouch.current = event.changedTouches[0].clientX; }}
                  onTouchEnd={onModelSwipe}
                />
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 2 · Piso</p>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-stone-200 bg-white p-2 sm:grid-cols-5">
                {floors.map((unit) => {
                  const selected = unit.codigo === selectedCodigo;
                  const free = unit.estado === "LIBRE";
                  return (
                    <button
                      key={unit.codigo}
                      type="button"
                      disabled={!free}
                      onClick={() => setSelectedCodigo(unit.codigo)}
                      className={`rounded-lg px-1 py-2 text-xs font-semibold ${free ? (selected ? "bg-stone-900 text-white" : "border border-emerald-200 bg-emerald-50 text-emerald-800") : "cursor-not-allowed bg-stone-100 text-stone-400"}`}
                    >
                      <span className="block">Piso {unit.piso}</span>
                      <span className="block text-[10px] font-normal">Unidad {unit.codigo}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 3 · Adicional</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ADDON_OPTIONS.map((item) => (
                  <button key={item.id} type="button" onClick={() => setAddon(item.id)} className={`rounded-xl border p-3 text-left ${addon === item.id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className={`text-[11px] ${addon === item.id ? "text-stone-300" : "text-stone-500"}`}>{item.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 4 · Plan de pago</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {PLAN_OPTIONS.map((item) => (
                  <button key={item.id} type="button" onClick={() => setPaymentPlan(item.id)} className={`rounded-xl border p-3 text-left ${paymentPlan === item.id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className={`text-[11px] ${paymentPlan === item.id ? "text-[#E8D5A8]" : "text-stone-500"}`}>{item.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            {activeUnit && quote && (
              <div className="mt-6 space-y-4 rounded-2xl bg-stone-900 p-5 text-white shadow-xl">
                <div className="border-b border-white/10 pb-3 text-xs text-[#E8D5A8]">
                  Unidad {activeUnit.codigo} · Piso {activeUnit.piso} · {selectedModel.name} · {formatAlphaM2(activeUnit.superficieM2)} m² · {selectedModel.where}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Inversión total</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatAlphaUsd(quote.total)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">USD {formatAlphaUsd(quote.rate)}/m²{quote.parking ? ` + adicional USD ${formatAlphaUsd(quote.parking)}` : ""}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Cuota inicial ({quote.percent}%)</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight text-emerald-400"><span className="block font-mono text-xs font-normal text-emerald-500/80">USD</span>{formatAlphaUsd(quote.initial)}</p>
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
                        <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatAlphaUsd(quote.balance)}</p>
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
            <h3 className="font-serif text-3xl font-light text-[#1C1917]">Tu próxima dirección está sobre Av. Beni.</h3>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-600">
              Elige el departamento y el plan. Te confirmamos la unidad {activeUnit ? activeUnit.codigo : "que estás mirando"} en Alpha.
            </p>
            <button type="button" onClick={contactWhatsApp} className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              Hablar con un asesor <ArrowRight size={14} />
            </button>
          </section>
        </div>
      </div>

      {activeSection !== "cierre" && (
        <div className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-2 border-t border-stone-200 bg-[#f7f5f0]/95 px-3 py-2.5 backdrop-blur-md sm:px-5 sm:py-3 md:left-[44%]">
          <div className="min-w-0">
            <p className="text-[11px] leading-tight text-stone-700 sm:text-xs">{selectedCash != null ? `USD ${formatAlphaUsd(selectedCash)}` : `Desde USD ${formatAlphaUsd(fromAny)}`}</p>
            <p className="text-[10px] text-stone-500">{ALPHA_LUXE_CONFIG.delivery}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a href={ALPHA_LUXE_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" aria-label="Brochure" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2 py-2 text-[10px] font-semibold uppercase text-stone-800 sm:text-[11px] sm:tracking-wider">
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
            <div className="flex items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-serif text-xl text-stone-900">{zoom.title}</p>
                <p className="text-xs text-stone-500">{zoom.caption}</p>
              </div>
              <button type="button" onClick={() => setZoom(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow" aria-label="Cerrar visor"><X size={18} /></button>
            </div>
            <div className="flex gap-2 px-4">
              {(["depto", "planta", "ficha"] as const).map((view) => (
                <button key={view} type="button" onClick={() => openModel(selectedModel, view)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${zoom.view === view ? "bg-stone-900 text-white" : "bg-white text-stone-700"}`}>
                  {view === "depto" ? "Departamento" : view === "planta" ? "Planta" : "Ficha"}
                </button>
              ))}
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center p-4">
              <img src={zoom.src} alt={zoom.title} className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
