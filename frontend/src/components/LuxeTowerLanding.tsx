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
  LUXE_MODELS,
  LUXE_TOWER_CONFIG,
  LUXE_UNITS,
  LuxeModel,
  LuxeRooms,
  areaRangeForRooms,
  formatLuxeM2,
  hasFreeRooms,
  unitsForModel,
} from "../luxeTowerInventory";
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
  { src: "/luxe_tower/social/piscina.jpg", category: "Piso 18", title: "Piscina", description: "Piscina para adultos y piscina para niños, con vista panorámica." },
  { src: "/luxe_tower/social/jacuzzi.jpg", category: "Piso 18", title: "Jacuzzi panorámico", description: "Jacuzzi panorámico, sauna seco, sauna a vapor y sala de masajes." },
  { src: "/luxe_tower/social/gimnasio.jpg", category: "Piso 18", title: "Gimnasio", description: "Gimnasio en el piso de amenidades." },
  { src: "/luxe_tower/social/churrasquera.jpg", category: "Piso 18", title: "Churrasqueras", description: "Una churrasquera semiabierta y dos cerradas." },
  { src: "/luxe_tower/social/cocina.jpg", category: "Piso 18", title: "Cocina gourmet", description: "Cocina gourmet, también llamada cocina del chef." },
  { src: "/luxe_tower/social/cowork.jpg", category: "Piso 18", title: "Cowork y sala de juegos", description: "Cowork y sala de juegos en el piso 18." },
  { src: "/luxe_tower/social/rooftop.jpg", category: "Piso 18", title: "Roof top", description: "Roof top, jardín zen y solárium." },
  { src: "/luxe_tower/social/acceso.jpg", category: "Ingreso", title: "Acceso", description: "Acceso sobre calle Enrique Finot, con lobby de doble altura." },
];

const ROOM_FILTERS: { id: LuxeRooms; label: string }[] = [
  { id: "1", label: "1 dormitorio" },
  { id: "2", label: "2 dormitorios" },
];

type ZoomState = { view: "depto" | "planta" | "ficha"; title: string; caption: string; src: string };

function ModelFrame({
  model,
  index,
  total,
  frameClass,
  onPrev,
  onNext,
  onOpen,
  onTouchStart,
  onTouchEnd,
}: {
  model: LuxeModel;
  index: number;
  total: number;
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
          <p className="truncate text-xs text-stone-600">{formatLuxeM2(model.areaM2)} m² · {model.where}</p>
          <p className="line-clamp-1 text-xs leading-snug text-stone-500">{model.detail}</p>
          <p className={`mt-0.5 text-sm font-semibold ${model.estado === "LIBRE" ? "text-[#9a7b45]" : "text-stone-400"}`}>{model.estado === "LIBRE" ? "Precio a consulta" : "Agotado"}</p>
        </div>
        <p className="min-w-[4.25rem] shrink-0 rounded-full border border-[#9a7b45]/40 bg-[#f7f5f0] px-3 py-1.5 text-center text-base font-bold leading-none tabular-nums text-[#816127] shadow-sm sm:text-lg" title={`Modelo ${index + 1} de ${total}`}>{index + 1}/{total}</p>
      </div>
      <div className="relative min-h-0 flex-1 bg-white">
        <button type="button" onClick={() => onOpen("depto")} className="absolute inset-0 flex items-center justify-center p-2" aria-label={`Ver ${model.name} completo`}>
          <img src={model.preview} alt={`${model.name}, planta del departamento`} className="max-h-full max-w-full object-contain" />
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

function coverAreaLabel(rooms: LuxeRooms) {
  const range = areaRangeForRooms(rooms);
  if (!range) return "";
  return range.low === range.high ? `${formatLuxeM2(range.low)} m²` : `${formatLuxeM2(range.low)} a ${formatLuxeM2(range.high)} m²`;
}

export default function LuxeTowerLanding({ onClose }: Props) {
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const introNavRef = useRef<HTMLDivElement>(null);
  const modelTouch = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState("intro");
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [amenityIndex, setAmenityIndex] = useState(0);
  const [rooms, setRooms] = useState<LuxeRooms>("2");
  const [modelIndex, setModelIndex] = useState(1);
  const [selectedModelId, setSelectedModelId] = useState("a-impar");
  const [selectedCodigo, setSelectedCodigo] = useState("5A");
  const [zoom, setZoom] = useState<ZoomState | null>(null);

  const freeCount = LUXE_UNITS.filter((unit) => unit.estado === "LIBRE").length;
  const goneCount = LUXE_UNITS.length - freeCount;
  const slides = LUXE_MODELS.filter((model) => model.rooms === rooms);
  const slideIndex = ((modelIndex % slides.length) + slides.length) % slides.length;
  const currentModel = slides[slideIndex];
  const activeUnit = LUXE_UNITS.find((unit) => unit.codigo === selectedCodigo && unit.modelId === selectedModelId) || null;
  const floors = unitsForModel(selectedModelId);
  const selectedModel = LUXE_MODELS.find((model) => model.id === selectedModelId) || currentModel;
  const amenity = AMENITY_SLIDES[amenityIndex];

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

  const chooseModel = (model: LuxeModel) => {
    setSelectedModelId(model.id);
    setRooms(model.rooms);
    const group = LUXE_MODELS.filter((item) => item.rooms === model.rooms);
    const index = group.findIndex((item) => item.id === model.id);
    if (index >= 0) setModelIndex(index);
    const nextUnits = unitsForModel(model.id);
    const free = nextUnits.find((unit) => unit.estado === "LIBRE") || nextUnits[0];
    if (free) setSelectedCodigo(free.codigo);
  };

  const chooseRooms = (next: LuxeRooms) => {
    setRooms(next);
    const first = LUXE_MODELS.find((model) => model.rooms === next && model.estado === "LIBRE") || LUXE_MODELS.find((model) => model.rooms === next);
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

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/luxe-tower`;
    const shareTitle = "Luxe Tower · Preventa en el 2.º anillo";
    const shareText = `140 departamentos de 1 y 2 dormitorios en calle Enrique Finot, 2.º anillo. Entrega en noviembre de 2026.`;
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
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "Lead", { content_name: "Luxe Tower" });
    }
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: "luxe-tower",
      operacion: "Preventa",
      zona: LUXE_TOWER_CONFIG.zone,
      extraFilters: activeUnit ? { unidad: activeUnit.codigo, piso: activeUnit.piso, modelo: activeUnit.modelId } : {},
    }).catch(() => {});
    const unitLine = activeUnit
      ? `Unidad ${activeUnit.codigo}, piso ${activeUnit.piso}, ${selectedModel.name} (${formatLuxeM2(activeUnit.superficieM2)} m², ${selectedModel.where})`
      : "Luxe Tower";
    const text = `Hola, vengo de N.I.A y quiero consultar Luxe Tower (calle Enrique Finot, 2.º anillo):\n\n• ${unitLine}\n\n¿Me confirman el precio y la disponibilidad?`;
    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const openModel = (model: LuxeModel, view: "depto" | "planta" | "ficha") => {
    setZoom({
      view,
      title: model.name,
      caption: `${formatLuxeM2(model.areaM2)} m² · ${model.detail}`,
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
        <img src="/luxe_tower/fachada.jpg" alt="Fachada de Luxe Tower en calle Enrique Finot" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
        <div className="relative z-10 w-full min-w-0 px-4 pb-24 pt-16 text-white sm:px-5 lg:px-7 lg:pb-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e8d5a8] backdrop-blur-md">
              <Sparkles size={12} />
              Preventa · 140 departamentos
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
              <MapPin size={12} className="text-[#e8d5a8]" />
              2.º anillo
            </span>
          </div>
          <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 font-serif leading-none drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]">
            <span className="text-4xl font-light tracking-wide md:text-5xl">Luxe</span>
            <span className="text-2xl font-light text-[#e8d5a8] md:text-3xl">Tower</span>
          </h1>
          <p className="mt-2 max-w-md text-sm leading-snug text-white/90">140 departamentos con balcón, en calle Enrique Finot. Entrega en noviembre de 2026.</p>
          <div className="mt-3 flex max-w-lg gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Calendar size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Entrega de obra</p>
                <p className="mt-0.5 text-sm font-medium leading-tight">Noviembre 2026</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Building2 size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Colaborador</p>
                <p className="mt-0.5 text-[11px] font-medium leading-tight sm:text-sm">Luxe Design SRL</p>
              </div>
            </div>
          </div>
          <div className="mt-2 max-w-lg rounded-2xl border border-[#e8d5a8]/30 bg-black/55 px-3.5 py-3 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e8d5a8]">Departamentos</p>
            <div className="mt-2 space-y-2">
              {ROOM_FILTERS.map((row) => (
                <div key={row.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 border-t border-white/10 pt-2 first:border-0 first:pt-0">
                  <div className="min-w-0">
                    <p className="text-sm text-white">{row.label[0].toUpperCase() + row.label.slice(1)}</p>
                    <p className="text-[11px] text-white/70">{coverAreaLabel(row.id)}</p>
                  </div>
                  <p className="text-right font-serif text-sm font-semibold leading-tight">
                    {hasFreeRooms(row.id) ? "Consulta" : "Agotado"}
                  </p>
                </div>
              ))}
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
                Calle Enrique Finot
              </span>
              <h2 className="font-serif text-3xl font-light leading-tight text-[#1C1917] md:text-5xl">
                Vive en Luxe Tower.
                <span className="mt-1 block font-normal italic text-[#9a7b45]">Vive la rutina de lo extraordinario.</span>
              </h2>
              <p className="pt-2 text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word] md:text-base">
                Edificio de 18 pisos en calle Enrique Finot, 2.º anillo, junto al Colegio Alemán. Son 140 departamentos de 1 y 2 dormitorios, del piso 4 al 17, todos con balcón. Las áreas sociales están en los pisos 18 y 19. Entrega en noviembre de 2026.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#E7E5E4] bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Disponibilidad</p>
                <p className="mt-0.5 font-serif text-lg font-bold text-stone-900">{goneCount} de {LUXE_UNITS.length} unidades agotadas</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Quedan {freeCount}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => scrollToSection("disponibilidad")} className="flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md">
                Elegir mi departamento
              </button>
              <a href={LUXE_TOWER_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-800">
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Calle Enrique Finot, en el 2.º anillo.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] md:text-base">
              Luxe Tower está sobre calle Enrique Finot, entre el Colegio Alemán y calle Güemes, en el eje de Av. San Martín. Cerca están el hotel Los Tajibos, el Ambassador, el hotel Yotaú y el 2.º anillo.
            </p>
            <img src="/luxe_tower/ubicacion.jpg" alt="Mapa de ubicación de Luxe Tower en el 2.º anillo" className="w-full rounded-2xl object-cover" />
          </section>

          <section id="amenidades" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Áreas sociales</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">El piso 18 mira a la ciudad.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] md:text-base">
              En el piso 18 hay piscina para adultos, piscina para niños, jacuzzi panorámico, sauna seco y a vapor, sala de masajes, gimnasio, sala de juegos, cowork, tres churrasqueras, cocina gourmet, roof top, jardín zen y solárium. El piso 19 suma otro solárium.
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917]">Diez plantas, de 1 y 2 dormitorios.</h3>
            <p className="text-sm leading-relaxed text-stone-600">El piso 4 de cada modelo sale con terraza. Del 5 al 17 el metraje cambia según la planta. Los muebles del render son referenciales.</p>
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Cocina equipada y acceso controlado.</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <img src="/luxe_tower/equipamiento/departamento.jpg" alt="Interior referencial de un departamento de Luxe Tower" className="aspect-[4/3] w-full rounded-2xl object-cover" />
              <img src="/luxe_tower/social/lobby.jpg" alt="Lobby de doble altura de Luxe Tower" className="aspect-[4/3] w-full rounded-2xl object-cover" />
            </div>
            <ul className="grid grid-cols-1 gap-2 text-sm text-stone-700 sm:grid-cols-2">
              {[
                "Cocina equipada, vestidores, lavandería y baño de visita",
                "Lobby de doble altura",
                "Tres ascensores: uno para 17 personas y dos para 13",
                "Tres pisos de parqueos y bauleras, con acceso automatizado",
                "Iluminación con sensores en circulación y estacionamientos",
                "Circuito de cámaras en todo el condominio",
                "Ingreso con videollamada, reconocimiento facial o tarjeta",
                "Chapa digital en cada departamento, control IR Smart y sensor de humo",
              ].map((item) => (
                <li key={item} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-[#9a7b45]" />{item}</li>
              ))}
            </ul>
          </section>

          <section id="constructora" className="mt-20 scroll-mt-6 space-y-4 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Colaboradores</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Luxe Design SRL.</h3>
            <p className="text-sm leading-relaxed text-stone-600 md:text-base">
              Luxe Design SRL firma el proyecto. En su línea de entregas, Luxe Tower corresponde a noviembre de 2026.
            </p>
          </section>

          <section id="pago" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Formas de pago</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">El precio se confirma con la unidad.</h3>
            <p className="text-sm leading-relaxed text-stone-600 md:text-base">
              El valor de cada departamento se confirma al elegir la unidad. Parqueos y bauleras se consultan aparte.
            </p>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
              Elegir mi departamento <ArrowRight size={14} />
            </button>
          </section>

          <section id="disponibilidad" className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-6">
            <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Disponibilidad</span>
                <h3 className="mt-1 font-serif text-2xl font-light text-[#1C1917]">Haz tuya una de las {freeCount} unidades libres.</h3>
                <p className="text-xs text-stone-500">Según el brochure. Verde: disponible. Gris: agotado.</p>
              </div>
              <div className="flex gap-2">
                {ROOM_FILTERS.map((filter) => (
                  <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-xl border px-3 py-2 text-left text-xs ${rooms === filter.id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-700"}`}>
                    <span className="block font-semibold">{filter.label}</span>
                    <span className={rooms === filter.id ? "text-white/70" : "text-[#9a7b45]"}>{hasFreeRooms(filter.id) ? "Hay unidades libres" : "Agotado"}</span>
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
                onTouchStart={(event) => { modelTouch.current = event.changedTouches[0].clientX; }}
                onTouchEnd={onModelSwipe}
              />
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
                      <span className="block">Unidad {unit.codigo}</span>
                    </button>
                  );
                })}
              </div>
              {activeUnit && activeUnit.estado === "LIBRE" ? (
                <button type="button" onClick={contactWhatsApp} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-900">
                  <MessageCircle size={16} />
                  Quiero la unidad {activeUnit.codigo}
                </button>
              ) : (
                <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-500">Esta planta está agotada.</p>
              )}
            </div>
          </section>

          <section id="cierre" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200 pt-12 pb-16 text-center">
            <h3 className="font-serif text-3xl font-light text-[#1C1917]">Tu próxima dirección empieza aquí.</h3>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-600">
              Cuéntanos qué planta estás mirando. Te confirmamos si sigue libre y el valor de esa unidad en Luxe Tower.
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
            <p className="text-[11px] leading-tight text-stone-700 sm:text-xs">Precio a consulta</p>
            <p className="text-[10px] text-stone-500">{LUXE_TOWER_CONFIG.delivery}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a href={LUXE_TOWER_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" aria-label="Brochure" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2 py-2 text-[10px] font-semibold uppercase text-stone-800 sm:text-[11px] sm:tracking-wider">
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
