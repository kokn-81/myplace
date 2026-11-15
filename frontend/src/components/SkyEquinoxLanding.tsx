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
  SKY_EQUINOX_CONFIG,
  SKY_EQUINOX_MODELS,
  SKY_EQUINOX_UNITS,
  SkyEquinoxModel,
  SkyEquinoxPlan,
  SkyEquinoxRooms,
  areaRangeForRooms,
  formatSkyEquinoxM2,
  formatSkyEquinoxUsd,
  minCash,
  minCashForRooms,
  minRate,
  quoteSkyEquinoxUnit,
  unitsForModel,
} from "../skyEquinoxInventory";
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
  { src: "/sky_equinox/social/piscina.jpg", category: "Piso 3", title: "Piscina infinita", description: "Piscina infinita con vista al Urubó." },
  { src: "/sky_equinox/social/wellness.jpg", category: "Piso 3", title: "Hidromasaje y saunas", description: "Hidromasaje, sauna seco y sauna a vapor." },
  { src: "/sky_equinox/social/gimnasio.jpg", category: "Piso 3", title: "Gimnasio", description: "Gimnasio en el piso de amenidades." },
  { src: "/sky_equinox/social/juegos.jpg", category: "Piso 3", title: "Salón de usos múltiples", description: "Billar y futbolín, con vista al Urubó." },
  { src: "/sky_equinox/social/eventos.jpg", category: "Piso 3", title: "Salón de eventos", description: "Salón de eventos para los copropietarios." },
  { src: "/sky_equinox/social/churrasquera.jpg", category: "Piso 3", title: "Churrasqueras", description: "Cuatro churrasqueras para los copropietarios." },
  { src: "/sky_equinox/lobby.jpg", category: "Planta baja", title: "Lobby", description: "Lobby, cowork y sala de reuniones, de uso exclusivo para los copropietarios." },
];

const ROOM_FILTERS: { id: SkyEquinoxRooms; label: string }[] = [
  { id: "0", label: "Studio" },
  { id: "1", label: "1 dormitorio" },
];

const PLAN_OPTIONS: { id: SkyEquinoxPlan; label: string; hint: string }[] = [
  { id: "contado", label: "Al contado", hint: "100% del departamento" },
  { id: "aporte20", label: "Inicial 20%", hint: "20% inicial y saldo" },
];

const PLAN_NAME: Record<SkyEquinoxPlan, string> = {
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
  model: SkyEquinoxModel;
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
          <p className="truncate text-xs text-stone-600">{model.where}</p>
          <p className="line-clamp-2 text-xs leading-snug text-stone-500">{model.detail}</p>
          <p className="mt-0.5 text-sm font-semibold text-[#9a7b45]">{price}</p>
        </div>
        <p className="min-w-[4.25rem] shrink-0 rounded-full border border-[#9a7b45]/40 bg-[#f7f5f0] px-3 py-1.5 text-center text-base font-bold leading-none tabular-nums text-[#816127] shadow-sm sm:text-lg" title={`Modelo ${index + 1} de ${total}`}>{index + 1}/{total}</p>
      </div>
      <div className="relative min-h-0 flex-1 bg-white">
        <button type="button" onClick={() => onOpen("depto")} className="absolute inset-0 flex items-center justify-center p-2" aria-label={`Ver ${model.name} completo`}>
          <img src={model.preview} alt={`${model.name}`} className="max-h-full max-w-full object-contain" />
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
          <span className="block text-xs leading-snug text-stone-600">Planta tipo. Toca para verla entera.</span>
        </span>
      </button>
    </div>
  );
}

function coverAreaLabel(rooms: SkyEquinoxRooms) {
  const range = areaRangeForRooms(rooms);
  if (!range) return "";
  return range.low === range.high ? `${formatSkyEquinoxM2(range.low)} m²` : `${formatSkyEquinoxM2(range.low)} a ${formatSkyEquinoxM2(range.high)} m²`;
}

export default function SkyEquinoxLanding({ onClose }: Props) {
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const introNavRef = useRef<HTMLDivElement>(null);
  const modelTouch = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState("intro");
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [amenityIndex, setAmenityIndex] = useState(0);
  const [rooms, setRooms] = useState<SkyEquinoxRooms>("1");
  const [modelIndex, setModelIndex] = useState(0);
  const [selectedModelId, setSelectedModelId] = useState("b");
  const [selectedCodigo, setSelectedCodigo] = useState("b-4-16");
  const [paymentPlan, setPaymentPlan] = useState<SkyEquinoxPlan>("contado");
  const [zoom, setZoom] = useState<ZoomState | null>(null);

  const slides = SKY_EQUINOX_MODELS.filter((model) => model.rooms === rooms);
  const slideIndex = slides.length ? ((modelIndex % slides.length) + slides.length) % slides.length : 0;
  const currentModel = slides[slideIndex];
  const bands = unitsForModel(selectedModelId);
  const selectedUnit = SKY_EQUINOX_UNITS.find((unit) => unit.codigo === selectedCodigo && unit.modelId === selectedModelId) || bands[0] || null;
  const selectedModel = SKY_EQUINOX_MODELS.find((model) => model.id === selectedModelId) || currentModel;
  const amenity = AMENITY_SLIDES[amenityIndex];
  const quote = selectedUnit ? quoteSkyEquinoxUnit(selectedUnit, paymentPlan) : null;
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

  const chooseModel = (model: SkyEquinoxModel) => {
    setSelectedModelId(model.id);
    setRooms(model.rooms);
    const group = SKY_EQUINOX_MODELS.filter((item) => item.rooms === model.rooms);
    const index = group.findIndex((item) => item.id === model.id);
    if (index >= 0) setModelIndex(index);
    const next = unitsForModel(model.id)[0];
    if (next) setSelectedCodigo(next.codigo);
  };

  const chooseRooms = (next: SkyEquinoxRooms) => {
    const first = SKY_EQUINOX_MODELS.find((model) => model.rooms === next);
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
    if (!currentModel) return "Consultar disponibilidad";
    const listed = unitsForModel(currentModel.id);
    if (listed.length === 0) return "Consultar disponibilidad";
    return `USD ${formatSkyEquinoxUsd(Math.min(...listed.map((item) => item.cashCents)) / 100)}`;
  };

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/sky-equinox`;
    const shareTitle = "Sky Equinox · Sirari";
    const shareText = "Sky Equinox, en Sirari, sobre el 4.º anillo. Studio y departamentos de 1 dormitorio. Entrega en junio de 2027.";
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
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "Lead", { content_name: "Sky Equinox" });
    }
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: "sky-equinox",
      operacion: "Preventa",
      zona: SKY_EQUINOX_CONFIG.zone,
      extraFilters: selectedUnit ? { unidad: selectedUnit.codigo, banda: selectedUnit.band, plan: paymentPlan } : {},
    }).catch(() => {});
    const lines = selectedUnit && quote && selectedModel
      ? [
        `${selectedModel.name}, ${selectedUnit.band}, ${formatSkyEquinoxM2(selectedUnit.superficieM2)} m²`,
        `Plan: ${PLAN_NAME[paymentPlan]}`,
        `Departamento: USD ${formatSkyEquinoxUsd(quote.department)}`,
        "Parqueo y baulera incluidos",
        `Total: USD ${formatSkyEquinoxUsd(quote.total)}`,
        `Inicial: USD ${formatSkyEquinoxUsd(quote.initial)}`,
        `Saldo: ${quote.balance == null ? "sin saldo pendiente" : `USD ${formatSkyEquinoxUsd(quote.balance)}`}`,
      ]
      : ["Sky Equinox"];
    const text = `Hola, vengo de N.I.A y quiero consultar Sky Equinox (Sirari):\n\n${lines.map((line) => `• ${line}`).join("\n")}`;
    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const openModel = (model: SkyEquinoxModel, view: "depto" | "planta" | "ficha") => {
    setZoom({
      view,
      title: model.name,
      caption: model.detail,
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
        <img src="/sky_equinox/fachada.jpg" alt="Fachada de Sky Equinox" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
        <div className="relative z-10 w-full min-w-0 px-4 pb-24 pt-16 text-white sm:px-5 lg:px-7 lg:pb-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e8d5a8] backdrop-blur-md">
              <Sparkles size={12} />
              Preventa · 22 pisos
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
              <MapPin size={12} className="text-[#e8d5a8]" />
              Sirari
            </span>
          </div>
          <h1 className="mt-3 font-serif text-4xl font-light leading-none tracking-wide drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] md:text-5xl">Sky Equinox</h1>
          <p className="mt-2 max-w-md text-sm leading-snug text-white/90">Sirari, Calle Los Jazmines, sobre el 4.º anillo. Entrega en junio de 2027.</p>
          <div className="mt-3 flex max-w-lg gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Calendar size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Entrega de obra</p>
                <p className="mt-0.5 text-sm font-medium leading-tight">Junio 2027</p>
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
                      {from == null ? "Consultar" : `Desde USD ${formatSkyEquinoxUsd(from)}`}
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
                Sirari
              </span>
              <h2 className="font-serif text-3xl font-light leading-tight text-[#1C1917] md:text-5xl">
                Vive en Sky Equinox.
                <span className="mt-1 block font-normal italic text-[#9a7b45]">Vistas al Urubó.</span>
              </h2>
              <p className="pt-2 text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word] md:text-base">
                Edificio de 22 pisos, 100% residencial, en Sirari, sobre Calle Los Jazmines y el 4.º anillo. Studio y departamentos de 1 dormitorio, del nivel 4 al 20. En planta baja están el lobby, el cowork y la sala de reuniones. Las áreas sociales ocupan el piso 3. Entrega en junio de 2027.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#E7E5E4] bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Disponibilidad</p>
                <p className="mt-0.5 font-serif text-lg font-bold text-stone-900">Desde USD {formatSkyEquinoxUsd(fromAny)} al contado.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Con precio</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => scrollToSection("disponibilidad")} className="flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md">
                Elegir mi departamento
              </button>
              <a href={SKY_EQUINOX_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-800">
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Sirari, sobre el 4.º anillo.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] md:text-base">
              Sky Equinox está en Sirari, sobre Calle Los Jazmines y el 4.º anillo, con vistas hacia el Urubó.
            </p>
            <img src="/sky_equinox/ubicacion.jpg" alt="Sky Equinox en Sirari, sobre el 4.º anillo" className="w-full rounded-2xl object-cover" />
          </section>

          <section id="amenidades" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Áreas sociales</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Piscina infinita en el piso 3.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] md:text-base">
              En el piso 3: piscina infinita, hidromasaje, sauna seco, sauna a vapor, gimnasio, salón de usos múltiples, salón de eventos y cuatro churrasqueras. En planta baja, lobby, cowork y sala de reuniones.
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917]">Studio y un dormitorio.</h3>
            <p className="text-sm leading-relaxed text-stone-600">El modelo A y el studio tienen balcón. El modelo B es un dormitorio en suite con baño de visitas. El precio de cada modelo se mantiene entre las dos bandas de pisos; cambia la superficie.</p>
            <div className="flex gap-2">
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Cocina de inducción y acceso digital.</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <img src="/sky_equinox/interiores/a.jpg" alt="Dormitorio de Sky Equinox" className="aspect-[4/3] w-full rounded-2xl object-cover" />
              <img src="/sky_equinox/interiores/c.jpg" alt="Estar de un studio de Sky Equinox" className="aspect-[4/3] w-full rounded-2xl object-cover" />
            </div>
            <ul className="grid grid-cols-1 gap-2 text-sm text-stone-700 sm:grid-cols-2">
              {[
                "Porcelanato de alto tráfico en gran formato",
                "Mesones de granito o piedra sinterizada",
                "Cocina de inducción de 4 hornallas, microondas y campana",
                "Mobiliario de cocina y box de vidrio templado",
                "Ropero en el studio y rack de TV en el de 1 dormitorio",
                "Termotanque y aire acondicionado inverter",
                "Espejo retroiluminado y spots LED",
                "Chapa digital, sensores de incendio y CCTV",
                "Dos ascensores BTL",
                "Tres niveles de parqueo y bauleras",
              ].map((item) => (
                <li key={item} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-[#9a7b45]" />{item}</li>
              ))}
            </ul>
          </section>

          <section id="constructora" className="mt-20 scroll-mt-6 space-y-4 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Colaboradores</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Sky Properties.</h3>
            <p className="text-sm leading-relaxed text-stone-600 md:text-base">
              Sky Properties lleva 24 años, con 38 proyectos concluidos y 2.718 unidades entregadas. Entrega de Sky Equinox en junio de 2027.
            </p>
          </section>

          <section id="pago" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Formas de pago</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Al contado, o con una inicial del 20%.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] md:text-base">
              El contado parte de USD 1.500/m². La modalidad al 20% publica un precio total mayor: la inicial es el 20% de ese total y el saldo es el 80%. Parqueo y baulera van incluidos.
            </p>
            <article className="rounded-2xl bg-stone-900 p-5 text-white shadow-lg">
              <span className="rounded-full bg-[#C19A6B] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950">Contado</span>
              <h4 className="mt-3 font-serif text-2xl">Paga el departamento completo.</h4>
              <p className="mt-2 font-serif text-3xl text-[#E8D5A8]">Desde USD {formatSkyEquinoxUsd(minRate("contado"))}/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-300">El 100% del departamento, al menor precio por m² de la lista.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">Inicial 20%</span>
              <h4 className="mt-3 font-serif text-2xl leading-snug">Empieza con el 20%.</h4>
              <p className="mt-2 font-serif text-3xl text-stone-900">Desde USD {formatSkyEquinoxUsd(minRate("aporte20"))}/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">La inicial es el 20% del precio de esta modalidad. El 80% restante queda como saldo. Las condiciones se consultan con el asesor comercial.</p>
            </article>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
              Elegir mi departamento <ArrowRight size={14} />
            </button>
          </section>

          <section id="disponibilidad" className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-6">
            <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
              <div className="shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Disponibilidad</span>
                <h3 className="mt-1 font-serif text-2xl font-light text-[#1C1917]">Elige el modelo y la banda de pisos.</h3>
                <p className="text-xs text-stone-500">Verde: con precio. El valor no cambia dentro del mismo modelo.</p>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 1 · Tipología</p>
                <div className="grid shrink-0 grid-cols-2 gap-2">
                  {ROOM_FILTERS.map((filter) => {
                    const from = minCashForRooms(filter.id);
                    return (
                      <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-xl border p-3 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white"}`}>
                        <span className="block text-sm font-bold">{filter.label}</span>
                        <span className="text-[11px] text-[#9a7b45]">{from == null ? "Consultar disponibilidad" : `Desde USD ${formatSkyEquinoxUsd(from)}`}</span>
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
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 2 · Pisos</p>
              <div className="grid grid-cols-1 gap-1.5 rounded-xl border border-stone-200 bg-white p-2 sm:grid-cols-2">
                {bands.map((unit) => {
                  const selected = unit.codigo === selectedCodigo;
                  return (
                    <button
                      key={unit.codigo}
                      type="button"
                      onClick={() => setSelectedCodigo(unit.codigo)}
                      className={`rounded-lg px-2 py-2 text-xs font-semibold ${selected ? "bg-stone-900 text-white" : "border border-emerald-200 bg-emerald-50 text-emerald-800"}`}
                    >
                      <span className="block">{unit.band}</span>
                      <span className="block text-[10px] font-normal">{formatSkyEquinoxM2(unit.superficieM2)} m² · USD {formatSkyEquinoxUsd(unit.cash)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 3 · Parqueo</p>
              <div className="rounded-xl border border-stone-900 bg-stone-900 p-3 text-white">
                <p className="text-sm font-bold">Parqueo y baulera incluidos</p>
                <p className="text-[11px] text-stone-300">No se suman al precio publicado. El edificio tiene tres niveles de parqueo y bauleras.</p>
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

            {selectedUnit && quote && selectedModel && (
              <div className="mt-6 space-y-4 rounded-2xl bg-stone-900 p-5 text-white shadow-xl">
                <div className="border-b border-white/10 pb-3 text-xs text-[#E8D5A8]">
                  {selectedModel.name} · {selectedUnit.band} · {formatSkyEquinoxM2(selectedUnit.superficieM2)} m² · {selectedModel.where}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Inversión total</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatSkyEquinoxUsd(quote.total)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">{quote.rate ? `USD ${formatSkyEquinoxUsd(quote.rate)}/m²` : "Precio publicado"} · parqueo y baulera incluidos</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Cuota inicial ({quote.percent}%)</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight text-emerald-400"><span className="block font-mono text-xs font-normal text-emerald-500/80">USD</span>{formatSkyEquinoxUsd(quote.initial)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">{quote.percent === 100 ? "El total del departamento" : "20% del precio de esta modalidad"}</p>
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
                        <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatSkyEquinoxUsd(quote.balance)}</p>
                        <p className="mt-1 text-[10px] text-stone-400">{100 - quote.percent}% del departamento</p>
                      </>
                    )}
                  </div>
                </div>
                <button type="button" onClick={contactWhatsApp} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-900">
                  <MessageCircle size={16} />
                  Quiero {selectedModel.name}
                </button>
              </div>
            )}
          </section>

          <section id="cierre" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200 pt-12 pb-16 text-center">
            <h3 className="font-serif text-3xl font-light text-[#1C1917]">Tu próxima dirección está en Sirari.</h3>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-600">
              Elige el modelo y el plan. Te confirmamos {selectedModel ? `${selectedModel.name}, ${selectedUnit?.band || ""}`.trim() : "el departamento que estás mirando"} en Sky Equinox.
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
            <p className="text-[11px] leading-tight text-stone-700 sm:text-xs">{selectedUnit ? `USD ${formatSkyEquinoxUsd(selectedUnit.cash)}` : `Desde USD ${formatSkyEquinoxUsd(fromAny)}`}</p>
            <p className="text-[10px] text-stone-500">{SKY_EQUINOX_CONFIG.delivery}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a href={SKY_EQUINOX_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" aria-label="Brochure" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2 py-2 text-[10px] font-semibold uppercase text-stone-800 sm:text-[11px] sm:tracking-wider">
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
