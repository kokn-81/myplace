import { useEffect, useRef, useState, type TouchEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Building2, Check, ChevronLeft, ChevronRight, Download, MapPin, Menu, MessageCircle, Share2, Sparkles, X } from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import { trackMetaLead } from "../metaPixel";
import {
  GIARDINO_CONFIG,
  GIARDINO_MODELS,
  GIARDINO_RESERVED_FLOORS,
  GIARDINO_UNITS,
  type GiardinoModel,
  type GiardinoRooms,
  areaRangeForRooms,
  formatGiardinoM2,
  formatGiardinoUsd,
  minCash,
  minCashForRooms,
  quoteGiardinoUnit,
  unitsForModel,
} from "../giardinoInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

const SECTIONS = [
  { id: "intro", label: "Inicio" },
  { id: "lugar", label: "Ubicación" },
  { id: "amenidades", label: "El edificio" },
  { id: "tipologias", label: "Tipologías" },
  { id: "equipamiento", label: "Equipamiento" },
  { id: "constructora", label: "Colaboradores" },
  { id: "pago", label: "Formas de pago" },
  { id: "disponibilidad", label: "Disponibilidad" },
  { id: "cierre", label: "Cierre" },
];

const ROOM_FILTERS: { id: GiardinoRooms; label: string }[] = [
  { id: "1", label: "1 habitación" },
  { id: "2", label: "2 habitaciones" },
  { id: "3", label: "3 habitaciones" },
];

const SLIDES = [
  { src: "/giardino/jardin.jpg", title: "Jardín de ingreso", description: "El acceso del edificio se abre a un jardín." },
  { src: "/giardino/hall.jpg", title: "Hall", description: "Hall con el nombre del proyecto." },
  { src: "/giardino/interiores/3hab.jpg", title: "Tres habitaciones", description: "Departamento de 3 habitaciones, sector Residenza." },
];

type ZoomState = { view: "depto" | "planta" | "ficha"; title: string; caption: string; src: string };

function ModelFrame({
  model,
  index,
  total,
  price,
  onPrev,
  onNext,
  onOpen,
  onTouchStart,
  onTouchEnd,
}: {
  model: GiardinoModel;
  index: number;
  total: number;
  price: string;
  onPrev: () => void;
  onNext: () => void;
  onOpen: (view: "depto" | "planta") => void;
  onTouchStart: (event: TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: (event: TouchEvent<HTMLDivElement>) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-100 px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{model.name} · {model.sector}</p>
          <p className="truncate text-xs text-stone-600">{model.beds} · {formatGiardinoM2(model.internalM2)} m² internos</p>
          <p className="line-clamp-2 text-xs leading-snug text-stone-500">Vista hacia {model.view}. Terraza variable según el piso.</p>
          <p className="mt-0.5 text-sm font-semibold text-[#9a7b45]">{price}</p>
        </div>
        <p className="min-w-[4.25rem] shrink-0 rounded-full border border-[#9a7b45]/40 bg-[#f7f5f0] px-3 py-1.5 text-center text-base font-bold leading-none tabular-nums text-[#816127] shadow-sm sm:text-lg" title={`Modelo ${index + 1} de ${total}`}>{index + 1}/{total}</p>
      </div>
      <div className="relative min-h-0 flex-1 bg-[#1c1917]">
        <button type="button" onClick={() => onOpen("depto")} className="absolute inset-0 flex items-center justify-center p-2" aria-label={`Ver ${model.name} completo`}>
          <img src={model.preview} alt={model.name} className="max-h-full max-w-full object-contain" />
        </button>
        {total > 1 && (
          <>
            <button type="button" onClick={onPrev} className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo anterior"><ChevronLeft size={22} /></button>
            <button type="button" onClick={onNext} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo siguiente"><ChevronRight size={22} /></button>
          </>
        )}
      </div>
      <button type="button" onClick={() => onOpen("planta")} className="flex h-[4.75rem] shrink-0 items-center gap-3 border-t border-stone-100 bg-[#f7f5f0] px-3 pr-16 text-left">
        <img src={model.preview} alt="" className="h-14 w-16 shrink-0 bg-[#1c1917] object-contain" />
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">Axonometría</span>
          <span className="block text-xs leading-snug text-stone-600">Toca para ver el departamento entero.</span>
        </span>
      </button>
    </div>
  );
}

function coverAreaLabel(rooms: GiardinoRooms) {
  const range = areaRangeForRooms(rooms);
  if (!range) return "";
  return range.low === range.high ? `${formatGiardinoM2(range.low)} m²` : `${formatGiardinoM2(range.low)} a ${formatGiardinoM2(range.high)} m²`;
}

export default function GiardinoLanding({ property, onClose }: Props) {
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const introNavRef = useRef<HTMLDivElement>(null);
  const modelTouch = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState("intro");
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [rooms, setRooms] = useState<GiardinoRooms>("1");
  const [modelIndex, setModelIndex] = useState(1);
  const [selectedModelId, setSelectedModelId] = useState("06");
  const [selectedCodigo, setSelectedCodigo] = useState("06-8");
  const [zoom, setZoom] = useState<ZoomState | null>(null);

  const slides = GIARDINO_MODELS.filter((model) => model.rooms === rooms);
  const safeIndex = slides.length ? ((modelIndex % slides.length) + slides.length) % slides.length : 0;
  const currentModel = slides[safeIndex];
  const floors = unitsForModel(selectedModelId);
  const selectedUnit = GIARDINO_UNITS.find((unit) => unit.codigo === selectedCodigo && unit.modelId === selectedModelId) || floors[0] || null;
  const selectedModel = GIARDINO_MODELS.find((model) => model.id === selectedModelId) || currentModel;
  const quote = selectedUnit ? quoteGiardinoUnit(selectedUnit) : null;
  const fromAny = minCash();
  const amenity = SLIDES[slideIndex];
  const reserved = new Set(GIARDINO_RESERVED_FLOORS[selectedModelId] || []);
  const floorNumbers = Array.from({ length: 25 }, (_, index) => 30 - index);

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

  const chooseModel = (model: GiardinoModel) => {
    setSelectedModelId(model.id);
    setRooms(model.rooms);
    const group = GIARDINO_MODELS.filter((item) => item.rooms === model.rooms);
    const index = group.findIndex((item) => item.id === model.id);
    if (index >= 0) setModelIndex(index);
    const listed = unitsForModel(model.id);
    const cheapest = listed.reduce((best, unit) => (unit.cashCents < best.cashCents ? unit : best), listed[0]);
    if (cheapest) setSelectedCodigo(cheapest.codigo);
  };

  const chooseRooms = (next: GiardinoRooms) => {
    const first = GIARDINO_MODELS.find((model) => model.rooms === next);
    if (first) chooseModel(first);
  };

  const shiftModel = (dir: number) => {
    if (slides.length < 2) return;
    const next = (safeIndex + dir + slides.length) % slides.length;
    setModelIndex(next);
    chooseModel(slides[next]);
  };

  const cardPrice = () => {
    if (!currentModel) return "Consultar disponibilidad";
    const listed = unitsForModel(currentModel.id);
    if (listed.length === 0) return "Consultar disponibilidad";
    return `Desde USD ${formatGiardinoUsd(Math.min(...listed.map((item) => item.cashCents)) / 100)}`;
  };

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/giardino`;
    const shareTitle = "Giardino · Av. San Martín";
    const shareText = "Giardino, sobre Av. San Martín y el 3.er anillo. Departamentos de 1, 2 y 3 habitaciones en los sectores Residenza y Vita.";
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
      propertyRef: "giardino",
      operacion: "Preventa",
      zona: GIARDINO_CONFIG.zone,
      extraFilters: selectedUnit ? { unidad: selectedUnit.codigo, piso: selectedUnit.piso } : {},
    }).catch(() => {});
    const lines = selectedUnit && quote && selectedModel
      ? [
        `${selectedModel.name}, piso ${selectedUnit.piso}, sector ${selectedModel.sector}`,
        `${formatGiardinoM2(selectedUnit.totalM2)} m² totales · terraza ${formatGiardinoM2(selectedUnit.terraceM2)} m²`,
        `Vista hacia ${selectedModel.view}`,
        `Precio: USD ${formatGiardinoUsd(quote.department)}`,
        `Reserva 15%: USD ${formatGiardinoUsd(quote.reserve)}`,
        `Saldo: USD ${formatGiardinoUsd(quote.balance)}`,
      ]
      : ["Giardino"];
    const text = `Hola, vengo de N.I.A y quiero consultar Giardino:\n\n${lines.map((line) => `• ${line}`).join("\n")}`;
    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const openModel = (model: GiardinoModel, view: "depto" | "planta" | "ficha") => {
    setZoom({
      view,
      title: model.name,
      caption: `${model.beds}. Vista hacia ${model.view}.`,
      src: view === "ficha" ? model.interior : model.preview,
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
        <img src="/giardino/fachada.jpg" alt="Fachada de Giardino" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
        <div className="relative z-10 w-full min-w-0 px-4 pb-24 pt-16 text-white sm:px-5 lg:px-7 lg:pb-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e8d5a8] backdrop-blur-md">
              <Sparkles size={12} />
              Preventa · Residenza y Vita
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
              <MapPin size={12} className="text-[#e8d5a8]" />
              Av. San Martín
            </span>
          </div>
          <h1 className="mt-3 font-serif text-4xl font-light leading-none tracking-wide drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] md:text-5xl">Vive en Giardino.</h1>
          <p className="mt-2 max-w-md text-sm leading-snug text-white/90">Departamentos de 1, 2 y 3 habitaciones, con terraza, entre Av. San Martín y el 3.er anillo.</p>
          <div className="mt-3 flex max-w-lg gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Building2 size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Sectores</p>
                <p className="mt-0.5 text-sm font-medium leading-tight">Residenza y Vita</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Building2 size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Colaborador</p>
                <p className="mt-0.5 text-[11px] font-medium leading-tight sm:text-sm">RE/MAX Fortaleza</p>
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
                      <p className="text-sm text-white">{row.label}</p>
                      <p className="text-[11px] text-white/70">{coverAreaLabel(row.id)}</p>
                    </div>
                    <p className="text-right font-serif text-sm font-semibold leading-tight">{from == null ? "Consultar" : `Desde USD ${formatGiardinoUsd(from)}`}</p>
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
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><Sparkles size={13} /> Av. San Martín</span>
              <h2 className="font-serif text-3xl font-light leading-tight text-[#1C1917] md:text-4xl">Vive en Giardino.</h2>
              <p className="text-sm leading-relaxed text-stone-600 [text-align:justify] md:text-base">
                Dos sectores en la misma torre. Residenza reúne los departamentos de 2 y 3 habitaciones. Vita, los de 1 habitación. Cada tipo publica su terraza, que cambia de piso a piso, y una vista hacia San Martín, Los Tajibos, el 3.er anillo o el Urubó.
              </p>
            </div>
            <div ref={introNavRef} className="flex gap-2 overflow-x-auto pb-1">
              {SECTIONS.slice(1, 8).map((section) => (
                <button key={section.id} type="button" onClick={() => scrollToSection(section.id)} className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700">{section.label}</button>
              ))}
            </div>
          </section>

          <section id="lugar" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Ubicación</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Entre San Martín y el 3.er anillo.</h3>
            <p className="text-sm leading-relaxed text-stone-600 [text-align:justify] md:text-base">
              Las plantas miran hacia el Hotel Los Tajibos, Av. San Martín, el 3.er anillo externo, UTEPSA y el Urubó, según el tipo. El punto del mapa es el del enlace oficial.
            </p>
            <img src="/giardino/jardin.jpg" alt="Jardín de ingreso de Giardino" className="aspect-[16/10] w-full rounded-2xl object-cover" />
            <a href={GIARDINO_CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#816127]">
              <MapPin size={16} /> Abrir la ubicación <ArrowRight size={14} />
            </a>
          </section>

          <section id="amenidades" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">El edificio</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Terrazas en cada departamento.</h3>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <img src={amenity.src} alt={amenity.title} className="aspect-[16/10] w-full object-cover" />
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{amenity.title}</p>
                  <p className="text-xs text-stone-500">{amenity.description}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSlideIndex((index) => (index + SLIDES.length - 1) % SLIDES.length)} className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200" aria-label="Anterior"><ChevronLeft size={16} /></button>
                  <button type="button" onClick={() => setSlideIndex((index) => (index + 1) % SLIDES.length)} className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200" aria-label="Siguiente"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          </section>

          <section id="tipologias" className="mt-20 scroll-mt-6 space-y-4 border-t border-stone-200/80 pt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Tipologías</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917]">Ocho tipos, del piso 6 al 30.</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {GIARDINO_MODELS.map((model) => {
                const from = Math.min(...unitsForModel(model.id).map((unit) => unit.cashCents)) / 100;
                return (
                  <button key={model.id} type="button" onClick={() => { chooseModel(model); scrollToSection("disponibilidad"); }} className="rounded-2xl border border-stone-200 bg-white p-4 text-left">
                    <p className="text-sm font-semibold">{model.name} · {model.sector}</p>
                    <p className="mt-1 text-xs text-stone-500">{model.beds} · {formatGiardinoM2(model.internalM2)} m² internos · vista hacia {model.view}</p>
                    <p className="mt-2 text-sm font-semibold text-[#9a7b45]">Desde USD {formatGiardinoUsd(from)}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section id="equipamiento" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Equipamiento</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">La terraza forma parte del metraje.</h3>
            <p className="text-sm leading-relaxed text-stone-600 [text-align:justify] md:text-base">
              Cada piso publica superficie interna, terraza y total. La interna se mantiene en el tipo. La terraza cambia. El precio de la lista es el del departamento, con reserva del 15%.
            </p>
            <img src="/giardino/interiores/2hab.jpg" alt="Departamento de 2 habitaciones" className="aspect-[16/10] w-full rounded-2xl object-cover" />
          </section>

          <section id="constructora" className="mt-20 scroll-mt-6 space-y-4 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Colaboradores</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">RE/MAX Fortaleza.</h3>
            <p className="text-sm leading-relaxed text-stone-600 md:text-base">La comercialización publicada del proyecto es RE/MAX Fortaleza.</p>
          </section>

          <section id="pago" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Formas de pago</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Reserva del 15%. El saldo es el 85%.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] md:text-base">
              La lista publica un precio por piso y una reserva del 15% de ese precio. El 85% restante queda como saldo. El monto en dólares aparece cuando eliges el piso.
            </p>
            <article className="rounded-2xl bg-stone-900 p-5 text-white shadow-lg">
              <span className="rounded-full bg-[#C19A6B] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950">Reserva 15%</span>
              <h4 className="mt-3 font-serif text-2xl">Reservas con el 15% del precio.</h4>
              <p className="mt-3 text-sm leading-relaxed text-stone-300">El saldo es el 85% del mismo precio. No hay otra modalidad en la lista.</p>
            </article>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
              Elegir mi departamento <ArrowRight size={14} />
            </button>
          </section>

          <section id="disponibilidad" className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-6">
            <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
              <div className="shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Disponibilidad</span>
                <h3 className="mt-1 font-serif text-2xl font-light text-[#1C1917]">Elige el tipo y el piso.</h3>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 1 · Tipología</p>
                <div className="grid shrink-0 grid-cols-3 gap-2">
                  {ROOM_FILTERS.map((filter) => {
                    const from = minCashForRooms(filter.id);
                    return (
                      <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-xl border p-3 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white"}`}>
                        <span className="block text-sm font-bold">{filter.label}</span>
                        <span className="text-[11px] text-[#9a7b45]">{from == null ? "Consultar disponibilidad" : `Desde USD ${formatGiardinoUsd(from)}`}</span>
                      </button>
                    );
                  })}
                </div>
                {currentModel && (
                  <ModelFrame
                    model={currentModel}
                    index={safeIndex}
                    total={slides.length}
                    price={cardPrice()}
                    onPrev={() => shiftModel(-1)}
                    onNext={() => shiftModel(1)}
                    onOpen={(view) => openModel(currentModel, view)}
                    onTouchStart={(event) => { modelTouch.current = event.changedTouches[0].clientX; }}
                    onTouchEnd={(event) => {
                      if (modelTouch.current == null) return;
                      const dx = event.changedTouches[0].clientX - modelTouch.current;
                      if (dx > 40) shiftModel(-1);
                      if (dx < -40) shiftModel(1);
                      modelTouch.current = null;
                    }}
                  />
                )}
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 2 · Piso</p>
              <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-stone-200 bg-white p-2 sm:grid-cols-3">
                {floorNumbers.map((piso) => {
                  const unit = floors.find((item) => item.piso === piso);
                  if (!unit && !reserved.has(piso)) return null;
                  const selected = unit?.codigo === selectedCodigo;
                  if (!unit) {
                    return (
                      <div key={piso} className="rounded-lg border border-stone-200 bg-stone-100 px-2 py-2 text-xs text-stone-500">
                        <span className="block font-semibold">Piso {piso}</span>
                        <span className="block text-[10px]">En reserva</span>
                      </div>
                    );
                  }
                  return (
                    <button key={unit.codigo} type="button" onClick={() => setSelectedCodigo(unit.codigo)} className={`rounded-lg px-2 py-2 text-xs font-semibold ${selected ? "bg-stone-900 text-white" : "border border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
                      <span className="block">Piso {piso}</span>
                      <span className="block text-[10px] font-normal">{formatGiardinoM2(unit.totalM2)} m² · USD {formatGiardinoUsd(unit.cash)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 3 · Parqueo</p>
              <div className="rounded-xl border border-stone-200 bg-white p-3">
                <p className="text-sm font-bold">Sin precio de parqueo en la lista</p>
                <p className="text-[11px] text-stone-500">El precio de cada piso es el del departamento. No se suma un parqueo.</p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 4 · Plan de pago</p>
              <div className="rounded-xl border border-stone-900 bg-stone-900 p-3 text-white">
                <p className="text-sm font-bold">Reserva 15%</p>
                <p className="text-[11px] text-[#E8D5A8]">El saldo es el 85% del precio publicado.</p>
              </div>
            </div>

            {selectedUnit && quote && selectedModel && (
              <div className="mt-6 space-y-4 rounded-2xl bg-stone-900 p-5 text-white shadow-xl">
                <div className="border-b border-white/10 pb-3 text-xs text-[#E8D5A8]">
                  {selectedModel.name} · piso {selectedUnit.piso} · {formatGiardinoM2(selectedUnit.totalM2)} m² · {selectedModel.sector}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Inversión total</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatGiardinoUsd(quote.total)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">Precio publicado · terraza {formatGiardinoM2(selectedUnit.terraceM2)} m²</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Reserva (15%)</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight text-emerald-400"><span className="block font-mono text-xs font-normal text-emerald-500/80">USD</span>{formatGiardinoUsd(quote.reserve)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">15% del precio del piso</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Saldo</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatGiardinoUsd(quote.balance)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">85% del precio publicado</p>
                  </div>
                </div>
                <button type="button" onClick={contactWhatsApp} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-900">
                  <MessageCircle size={16} />
                  Quiero {selectedModel.name}, piso {selectedUnit.piso}
                </button>
              </div>
            )}
          </section>

          <section id="cierre" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200 pt-12 pb-16 text-center">
            <h3 className="font-serif text-3xl font-light text-[#1C1917]">Tu terraza puede mirar a San Martín.</h3>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-600">
              Elige el tipo y el piso. Te confirmamos {selectedModel ? `${selectedModel.name}, piso ${selectedUnit?.piso ?? ""}`.trim() : "el departamento que estás mirando"}.
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
            <p className="text-[11px] leading-tight text-stone-700 sm:text-xs">{selectedUnit ? `USD ${formatGiardinoUsd(selectedUnit.cash)}` : `Desde USD ${formatGiardinoUsd(fromAny)}`}</p>
            <p className="text-[10px] text-stone-500">Reserva 15%</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a href={GIARDINO_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" aria-label="Brochure" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2 py-2 text-[10px] font-semibold uppercase text-stone-800 sm:text-[11px] sm:tracking-wider">
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
                <button key={view} type="button" onClick={() => selectedModel && openModel(selectedModel, view)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${zoom.view === view ? "bg-stone-900 text-white" : "bg-white text-stone-700"}`}>
                  {view === "depto" ? "Departamento" : view === "planta" ? "Axonometría" : "Interior"}
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
