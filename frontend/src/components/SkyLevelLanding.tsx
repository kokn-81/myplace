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
import { trackMetaLead } from "../metaPixel";
import {
  SKY_LEVEL_CONFIG,
  SKY_LEVEL_MODELS,
  SKY_LEVEL_UNITS,
  SkyLevelAddon,
  SkyLevelModel,
  SkyLevelPlan,
  SkyLevelRooms,
  areaRangeForRooms,
  formatSkyLevelM2,
  formatSkyLevelUsd,
  minApartmentCash,
  minCashForRooms,
  minRate,
  quoteSkyLevelUnit,
} from "../skyLevelInventory";
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
  { src: "/sky_level/social/piscina.jpg", category: "Piso 18", title: "Piscina cubierta", description: "Piscina panorámica cubierta, de 40 m de largo." },
  { src: "/sky_level/social/gimnasio.jpg", category: "Piso 18", title: "Fitness center", description: "Gimnasio equipado." },
  { src: "/sky_level/social/wellness.jpg", category: "Piso 18", title: "Wellness center", description: "Jacuzzi, sauna seco y sauna a vapor." },
  { src: "/sky_level/social/juegos.jpg", category: "Piso 18", title: "Entretenimiento", description: "Sala de juegos, TV, cine, billar y futbolín." },
  { src: "/sky_level/social/churrasquera.jpg", category: "Piso 18", title: "Churrasqueras", description: "Ocho churrasqueras equipadas." },
  { src: "/sky_level/social/eventos.jpg", category: "Piso 18", title: "Área de eventos", description: "Dos salones para eventos." },
  { src: "/sky_level/social/cowork.jpg", category: "Piso 18", title: "Cowork", description: "Cowork y sala de reuniones." },
  { src: "/sky_level/lobby.jpg", category: "Ingreso", title: "Lobby", description: "Lobby de ingreso con control de acceso." },
];

const ROOM_FILTERS: { id: SkyLevelRooms; label: string }[] = [
  { id: "1", label: "1 dormitorio" },
  { id: "2", label: "2 dormitorios" },
  { id: "local", label: "Local" },
];

const PLAN_OPTIONS: { id: SkyLevelPlan; label: string; hint: string }[] = [
  { id: "contado", label: "Al contado", hint: "100% del inmueble" },
  { id: "aporte20", label: "Inicial 20%", hint: "20% inicial y saldo" },
];

const ADDON_OPTIONS: { id: SkyLevelAddon; label: string; hint: string }[] = [
  { id: "none", label: "Sin adicional", hint: "Solo el inmueble" },
  { id: "parkingStorage", label: "Parqueo y baulera", hint: `USD ${formatSkyLevelUsd(SKY_LEVEL_CONFIG.parkingStorageUsd)}` },
];

const PLAN_NAME: Record<SkyLevelPlan, string> = {
  contado: "Al contado",
  aporte20: "Inicial 20%",
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
  model: SkyLevelModel;
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
          <p className="truncate text-xs text-stone-600">{formatSkyLevelM2(model.areaM2)} m² · {model.where}</p>
          <p className="line-clamp-1 text-xs leading-snug text-stone-500">{model.detail}</p>
          <p className={`mt-0.5 text-sm font-semibold ${model.estado === "LIBRE" ? "text-[#9a7b45]" : "text-stone-400"}`}>{price}</p>
        </div>
        <p className="min-w-[4.25rem] shrink-0 rounded-full border border-[#9a7b45]/40 bg-[#f7f5f0] px-3 py-1.5 text-center text-base font-bold leading-none tabular-nums text-[#816127] shadow-sm sm:text-lg" title={`Modelo ${index + 1} de ${total}`}>{index + 1}/{total}</p>
      </div>
      <div className="relative min-h-0 flex-1 bg-white">
        <button type="button" onClick={() => onOpen("depto")} className="absolute inset-0 flex items-center justify-center p-2" aria-label={`Ver ${model.name} completo`}>
          <img src={model.estado === "LIBRE" ? model.interior : model.preview} alt={`${model.name}`} className="max-h-full max-w-full object-contain" />
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
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">{model.rooms === "local" ? "Planta baja" : "En el piso"}</span>
          <span className="block text-xs leading-snug text-stone-600">{model.rooms === "local" ? "Locales en planta baja." : "Planta tipo, pisos 4 al 17."}</span>
        </span>
      </button>
    </div>
  );
}

function coverAreaLabel(rooms: SkyLevelRooms) {
  const range = areaRangeForRooms(rooms, SKY_LEVEL_UNITS.filter((unit) => unit.estado === "LIBRE"));
  if (!range) return "";
  return range.low === range.high ? `${formatSkyLevelM2(range.low)} m²` : `${formatSkyLevelM2(range.low)} a ${formatSkyLevelM2(range.high)} m²`;
}

export default function SkyLevelLanding({ property, onClose }: Props) {
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const introNavRef = useRef<HTMLDivElement>(null);
  const modelTouch = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState("intro");
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [amenityIndex, setAmenityIndex] = useState(0);
  const [rooms, setRooms] = useState<SkyLevelRooms>("2");
  const [modelIndex, setModelIndex] = useState(0);
  const [selectedId, setSelectedId] = useState("m2");
  const [paymentPlan, setPaymentPlan] = useState<SkyLevelPlan>("contado");
  const [addon, setAddon] = useState<SkyLevelAddon>("none");
  const [zoom, setZoom] = useState<ZoomState | null>(null);

  const slides = SKY_LEVEL_MODELS.filter((model) => model.rooms === rooms);
  const slideIndex = slides.length ? ((modelIndex % slides.length) + slides.length) % slides.length : 0;
  const currentModel = slides[slideIndex];
  const selectedUnit = SKY_LEVEL_UNITS.find((unit) => unit.codigo === selectedId && unit.estado === "LIBRE") || null;
  const selectedModel = SKY_LEVEL_MODELS.find((model) => model.id === selectedId) || currentModel;
  const amenity = AMENITY_SLIDES[amenityIndex];
  const quote = selectedUnit ? quoteSkyLevelUnit(selectedUnit, paymentPlan, addon) : null;
  const fromAny = minApartmentCash();

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

  const focusModel = (model: SkyLevelModel, select: boolean) => {
    setRooms(model.rooms);
    const group = SKY_LEVEL_MODELS.filter((item) => item.rooms === model.rooms);
    const index = group.findIndex((item) => item.id === model.id);
    if (index >= 0) setModelIndex(index);
    if (select && model.estado === "LIBRE") setSelectedId(model.id);
  };

  const chooseRooms = (next: SkyLevelRooms) => {
    const group = SKY_LEVEL_MODELS.filter((model) => model.rooms === next);
    const first = group.find((model) => model.estado === "LIBRE") || group[0];
    if (first) focusModel(first, true);
  };

  const shiftModel = (dir: number) => {
    if (slides.length < 2) return;
    const next = (slideIndex + dir + slides.length) % slides.length;
    setModelIndex(next);
    if (slides[next].estado === "LIBRE") setSelectedId(slides[next].id);
  };

  const onModelSwipe = (event: TouchEvent<HTMLDivElement>) => {
    if (modelTouch.current == null || slides.length < 2) return;
    const dx = event.changedTouches[0].clientX - modelTouch.current;
    if (dx > 40) shiftModel(-1);
    if (dx < -40) shiftModel(1);
    modelTouch.current = null;
  };

  const cardPrice = () => {
    if (!currentModel || currentModel.estado !== "LIBRE") return "Vendido";
    const unit = SKY_LEVEL_UNITS.find((item) => item.codigo === currentModel.id);
    return unit ? `USD ${formatSkyLevelUsd(unit.cash)}` : "Consultar disponibilidad";
  };

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/sky-level`;
    const shareTitle = "Sky Level · Equipetrol";
    const shareText = "Sky Level, en Equipetrol, entre el 2.º y el 3.er anillo. Departamentos de 1 y 2 dormitorios. Entrega en marzo de 2027.";
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
    trackMetaLead(property);
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: "sky-level",
      operacion: "Preventa",
      zona: SKY_LEVEL_CONFIG.zone,
      extraFilters: selectedUnit ? { unidad: selectedUnit.codigo, plan: paymentPlan, adicional: addon } : {},
    }).catch(() => {});
    const addonLabel = ADDON_OPTIONS.find((item) => item.id === addon);
    const lines = selectedUnit && quote && selectedModel
      ? [
        `${selectedModel.name}, ${formatSkyLevelM2(selectedUnit.superficieM2)} m², ${selectedModel.where}`,
        `Plan: ${PLAN_NAME[paymentPlan]}`,
        `Inmueble: USD ${formatSkyLevelUsd(quote.department)}`,
        `Adicional: ${addonLabel?.label || "Sin adicional"}${quote.parking ? ` USD ${formatSkyLevelUsd(quote.parking)}` : ""}`,
        `Total: USD ${formatSkyLevelUsd(quote.total)}`,
        `Inicial: USD ${formatSkyLevelUsd(quote.initial)}`,
        `Saldo: ${quote.balance == null ? "sin saldo pendiente" : `USD ${formatSkyLevelUsd(quote.balance)}`}`,
      ]
      : ["Sky Level"];
    const text = `Hola, vengo de N.I.A y quiero consultar Sky Level (Equipetrol):\n\n${lines.map((line) => `• ${line}`).join("\n")}`;
    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const openModel = (model: SkyLevelModel, view: "depto" | "planta" | "ficha") => {
    setZoom({
      view,
      title: model.name,
      caption: `${formatSkyLevelM2(model.areaM2)} m² · ${model.detail}`,
      src: view === "planta" ? model.plan : view === "ficha" ? model.preview : model.interior,
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
        <img src="/sky_level/fachada.jpg" alt="Fachada de Sky Level" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
        <div className="relative z-10 w-full min-w-0 px-4 pb-24 pt-16 text-white sm:px-5 lg:px-7 lg:pb-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e8d5a8] backdrop-blur-md">
              <Sparkles size={12} />
              Preventa · 18 pisos
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
              <MapPin size={12} className="text-[#e8d5a8]" />
              Equipetrol
            </span>
          </div>
          <h1 className="mt-3 font-serif text-4xl font-light leading-none tracking-wide drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] md:text-5xl">Sky Level</h1>
          <p className="mt-2 max-w-md text-sm leading-snug text-white/90">Equipetrol, entre el 2.º y el 3.er anillo. Entrega en marzo de 2027.</p>
          <div className="mt-3 flex max-w-lg gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Calendar size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Entrega de obra</p>
                <p className="mt-0.5 text-sm font-medium leading-tight">Marzo 2027</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Building2 size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Colaborador</p>
                <p className="mt-0.5 text-[11px] font-medium leading-tight sm:text-sm">Sky Properties</p>
              </div>
            </div>
          </div>
          <div className="mt-2 max-w-lg rounded-2xl border border-[#e8d5a8]/30 bg-black/55 px-3.5 py-3 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e8d5a8]">Preventa</p>
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
                      {from == null ? "Consultar" : `Desde USD ${formatSkyLevelUsd(from)}`}
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
                Equipetrol
              </span>
              <h2 className="font-serif text-3xl font-light leading-tight text-[#1C1917] md:text-5xl">
                Vive en Sky Level.
                <span className="mt-1 block font-normal italic text-[#9a7b45]">Exclusividad, confort y bienestar.</span>
              </h2>
              <p className="pt-2 text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word] md:text-base">
                Torre de 18 pisos en Equipetrol, entre el 2.º y el 3.er anillo, sobre {SKY_LEVEL_CONFIG.streets}, {SKY_LEVEL_CONFIG.near}. Departamentos de 1 y 2 dormitorios en la planta tipo, del piso 4 al 17, y locales en planta baja. Las áreas sociales están en el piso 18. Entrega en marzo de 2027.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#E7E5E4] bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Disponibilidad</p>
                <p className="mt-0.5 font-serif text-lg font-bold text-stone-900">Desde USD {formatSkyLevelUsd(fromAny)} al contado.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Con precio</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => scrollToSection("disponibilidad")} className="flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md">
                Elegir mi unidad
              </button>
              <a href={SKY_LEVEL_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-800">
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Entre el 2.º y el 3.er anillo.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] md:text-base">
              Sky Level está en Equipetrol, sobre {SKY_LEVEL_CONFIG.streets}, {SKY_LEVEL_CONFIG.near}.
            </p>
            <img src="/sky_level/ubicacion.jpg" alt="Sky Level entre Calle 5, Enrique Finot y Calle 6 Oeste" className="w-full rounded-2xl object-cover" />
          </section>

          <section id="amenidades" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Áreas sociales</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">El piso 18 mira la ciudad.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] md:text-base">
              En el piso 18: piscina cubierta de 40 m, gimnasio, wellness con jacuzzi y dos saunas, dos salones de eventos, cowork, sala de reuniones, juegos, cine y ocho churrasqueras. El lobby recibe en el ingreso.
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917]">De un dormitorio a dos, y un local.</h3>
            <p className="text-sm leading-relaxed text-stone-600">Los de dos dormitorios salen con balcón, baño de visitas y horno. En un dormitorio, la placa es de inducción. El modelo 5 también tiene balcón.</p>
            <div className="flex flex-wrap gap-2">
              {ROOM_FILTERS.map((filter) => (
                <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${rooms === filter.id ? "bg-stone-900 text-white" : "border border-stone-200 bg-white text-stone-700"}`}>
                  {filter.label}
                </button>
              ))}
            </div>
            {currentModel && (
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
            )}
          </section>

          <section id="equipamiento" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Equipamiento</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Cocina lista y acceso digital.</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <img src="/sky_level/interiores/m2.jpg" alt="Interior de un departamento de Sky Level" className="aspect-[4/3] w-full rounded-2xl object-cover" />
              <img src="/sky_level/interiores/m1.jpg" alt="Cocina de un departamento de Sky Level" className="aspect-[4/3] w-full rounded-2xl object-cover" />
            </div>
            <ul className="grid grid-cols-1 gap-2 text-sm text-stone-700 sm:grid-cols-2">
              {[
                "Porcelanato 60×120 cm, línea Carrara",
                "Mesones de granito o piedra sinterizada",
                "1 dormitorio: inducción de 4 hornallas y microondas",
                "2 dormitorios: cocina a gas de 4 hornallas, horno y microondas",
                "Campana, termotanque y aire acondicionado inverter",
                "Box de vidrio templado y espejo retroiluminado",
                "Spots LED y carpintería de aluminio con doble vidriado",
                "Chapa digital, sensores de incendio y CCTV",
                "Cuatro ascensores BTL",
                "Control de ingreso al lobby y tres niveles de parqueo",
              ].map((item) => (
                <li key={item} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-[#9a7b45]" />{item}</li>
              ))}
            </ul>
          </section>

          <section id="constructora" className="mt-20 scroll-mt-6 space-y-4 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Colaboradores</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Sky Properties.</h3>
            <p className="text-sm leading-relaxed text-stone-600 md:text-base">
              Sky Properties lleva 24 años, con 37 proyectos concluidos y 2.518 unidades entregadas. Entrega de Sky Level en marzo de 2027.
            </p>
          </section>

          <section id="pago" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Formas de pago</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Al contado, o con una inicial del 20%.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] md:text-base">
              El contado es el menor precio por m². La modalidad al 20% publica un precio total mayor: la inicial es el 20% de ese total y el saldo es el 80%. El monto en dólares aparece al elegir la tipología.
            </p>
            <article className="rounded-2xl bg-stone-900 p-5 text-white shadow-lg">
              <span className="rounded-full bg-[#C19A6B] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950">Contado</span>
              <h4 className="mt-3 font-serif text-2xl">Paga el inmueble completo.</h4>
              <p className="mt-2 font-serif text-3xl text-[#E8D5A8]">Desde USD {formatSkyLevelUsd(minRate("contado"))}/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-300">El 100% del departamento o del local, al menor precio por m².</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">Inicial 20%</span>
              <h4 className="mt-3 font-serif text-2xl leading-snug">Empieza con el 20%.</h4>
              <p className="mt-2 font-serif text-3xl text-stone-900">Desde USD {formatSkyLevelUsd(minRate("aporte20"))}/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">La inicial es el 20% del precio de esta modalidad. El 80% restante queda como saldo. Las condiciones se consultan con el asesor comercial.</p>
            </article>
            <div className="space-y-2 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
              <p>Parqueo y baulera, juntos, USD {formatSkyLevelUsd(SKY_LEVEL_CONFIG.parkingStorageUsd)}. El adicional se suma solo a la cuota inicial.</p>
            </div>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
              Elegir mi unidad <ArrowRight size={14} />
            </button>
          </section>

          <section id="disponibilidad" className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-6">
            <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
              <div className="shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Disponibilidad</span>
                <h3 className="mt-1 font-serif text-2xl font-light text-[#1C1917]">Elige la tipología y mira la inversión.</h3>
                <p className="text-xs text-stone-500">Verde: con precio. Gris: vendido.</p>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 1 · Tipología</p>
                <div className="grid shrink-0 grid-cols-3 gap-2">
                  {ROOM_FILTERS.map((filter) => {
                    const from = minCashForRooms(filter.id);
                    return (
                      <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-xl border p-3 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white"}`}>
                        <span className="block text-sm font-bold">{filter.label}</span>
                        <span className="text-[11px] text-[#9a7b45]">{from == null ? "Consultar disponibilidad" : `Desde USD ${formatSkyLevelUsd(from)}`}</span>
                      </button>
                    );
                  })}
                </div>
                {currentModel && (
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
                )}
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 2 · Superficie</p>
              <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-stone-200 bg-white p-2 sm:grid-cols-3">
                {slides.map((model) => {
                  const free = model.estado === "LIBRE";
                  const selected = free && model.id === selectedId;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      disabled={!free}
                      onClick={() => focusModel(model, true)}
                      className={`rounded-lg px-1 py-2 text-xs font-semibold ${free ? (selected ? "bg-stone-900 text-white" : "border border-emerald-200 bg-emerald-50 text-emerald-800") : "cursor-not-allowed bg-stone-100 text-stone-400"}`}
                    >
                      <span className="block">{formatSkyLevelM2(model.areaM2)} m²</span>
                      <span className="block text-[10px] font-normal">{free ? model.name : "Vendido"}</span>
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
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PLAN_OPTIONS.map((item) => (
                  <button key={item.id} type="button" onClick={() => setPaymentPlan(item.id)} className={`rounded-xl border p-3 text-left ${paymentPlan === item.id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className={`text-[11px] ${paymentPlan === item.id ? "text-[#E8D5A8]" : "text-stone-500"}`}>{item.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedUnit && quote && selectedModel && currentModel?.estado === "LIBRE" && (
              <div className="mt-6 space-y-4 rounded-2xl bg-stone-900 p-5 text-white shadow-xl">
                <div className="border-b border-white/10 pb-3 text-xs text-[#E8D5A8]">
                  {selectedModel.name} · {formatSkyLevelM2(selectedUnit.superficieM2)} m² · {selectedModel.where}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Inversión total</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatSkyLevelUsd(quote.total)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">{quote.rate ? `USD ${formatSkyLevelUsd(quote.rate)}/m²` : "Precio publicado"}{quote.parking ? ` + adicional USD ${formatSkyLevelUsd(quote.parking)}` : ""}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Cuota inicial ({quote.percent}%)</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight text-emerald-400"><span className="block font-mono text-xs font-normal text-emerald-500/80">USD</span>{formatSkyLevelUsd(quote.initial)}</p>
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
                        <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatSkyLevelUsd(quote.balance)}</p>
                        <p className="mt-1 text-[10px] text-stone-400">{100 - quote.percent}% del inmueble</p>
                      </>
                    )}
                  </div>
                </div>
                <button type="button" onClick={contactWhatsApp} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-900">
                  <MessageCircle size={16} />
                  Quiero la unidad {selectedModel.name}
                </button>
              </div>
            )}
            {currentModel?.estado === "VENDIDO" && (
              <p className="mt-6 rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-500">Esta superficie está vendida.</p>
            )}
          </section>

          <section id="cierre" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200 pt-12 pb-16 text-center">
            <h3 className="font-serif text-3xl font-light text-[#1C1917]">Tu próxima dirección está en Equipetrol.</h3>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-600">
              Elige la tipología y el plan. Te confirmamos {selectedModel ? selectedModel.name : "la unidad que estás mirando"} en Sky Level.
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
            <p className="text-[11px] leading-tight text-stone-700 sm:text-xs">{selectedUnit ? `USD ${formatSkyLevelUsd(selectedUnit.cash)}` : `Desde USD ${formatSkyLevelUsd(fromAny)}`}</p>
            <p className="text-[10px] text-stone-500">{SKY_LEVEL_CONFIG.delivery}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a href={SKY_LEVEL_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" aria-label="Brochure" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2 py-2 text-[10px] font-semibold uppercase text-stone-800 sm:text-[11px] sm:tracking-wider">
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
                <button key={view} type="button" onClick={() => currentModel && openModel(currentModel, view)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${zoom.view === view ? "bg-stone-900 text-white" : "bg-white text-stone-700"}`}>
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
