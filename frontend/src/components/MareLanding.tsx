import { useEffect, useRef, useState, type TouchEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Building2, Check, ChevronLeft, ChevronRight, Download, MapPin, Menu, MessageCircle, Share2, Sparkles, X } from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import { trackMetaLead } from "../metaPixel";
import {
  MARE_CONFIG,
  MARE_MODELS,
  MARE_UNITS,
  type MareModel,
  type MareRooms,
  areaRangeForRooms,
  formatMareM2,
  formatMareUsd,
  minCash,
  minCashForRooms,
  quoteMareUnit,
  unitsForModel,
} from "../mareInventory";
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

const ROOM_FILTERS: { id: MareRooms; label: string }[] = [
  { id: "1", label: "1 habitación" },
  { id: "2", label: "2 habitaciones" },
  { id: "3", label: "3 habitaciones" },
];

const AMENITIES = [
  { src: "/mare/social/marea.jpg", title: "Playa Mare", description: "Tu pausa junto al agua, en las áreas sociales Marea." },
  { src: "/mare/social/churrasquera.jpg", title: "Churrasqueras", description: "Reúne a los tuyos alrededor de la parrilla y la barra." },
  { src: "/mare/social/spa.jpg", title: "Spa santuario", description: "Un espacio para bajar el ritmo en La Perla, de acceso exclusivo." },
  { src: "/mare/social/terrazzo.jpg", title: "Terrazzo", description: "Haz una pausa y disfruta Santa Cruz desde las alturas." },
  { src: "/mare/social/perla.jpg", title: "La Perla", description: "Piscina en altura, cine, karaoke y spa en un sector de acceso exclusivo." },
];

type ZoomState = { title: string; caption: string; src: string };

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
  model: MareModel;
  index: number;
  total: number;
  price: string;
  onPrev: () => void;
  onNext: () => void;
  onOpen: () => void;
  onTouchStart: (event: TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: (event: TouchEvent<HTMLDivElement>) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-100 px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{model.name}</p>
          <p className="truncate text-xs text-stone-600">{model.beds}</p>
          <p className="line-clamp-2 text-xs leading-snug text-stone-500">{model.detail}</p>
          <p className="mt-0.5 text-sm font-semibold text-[#9a7b45]">{price}</p>
        </div>
        <p className="min-w-[4.25rem] shrink-0 rounded-full border border-[#9a7b45]/40 bg-[#f7f5f0] px-3 py-1.5 text-center text-base font-bold leading-none tabular-nums text-[#816127] shadow-sm sm:text-lg" title={`Modelo ${index + 1} de ${total}`}>{index + 1}/{total}</p>
      </div>
      <div className="relative min-h-0 flex-1 bg-white">
        <button type="button" onClick={onOpen} className="absolute inset-0 flex items-center justify-center p-2" aria-label={`Ver ${model.name} completo`}>
          <img src={model.preview} alt={model.name} className="max-h-full max-w-full object-contain" />
        </button>
        {total > 1 && (
          <>
            <button type="button" onClick={onPrev} className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo anterior"><ChevronLeft size={22} /></button>
            <button type="button" onClick={onNext} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo siguiente"><ChevronRight size={22} /></button>
          </>
        )}
      </div>
      <button type="button" onClick={onOpen} className="flex h-[4.75rem] shrink-0 items-center gap-3 border-t border-stone-100 bg-[#f7f5f0] px-3 pr-16 text-left">
        <img src={model.preview} alt="" className="h-14 w-16 shrink-0 bg-white object-contain" />
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">Planta</span>
          <span className="block text-xs leading-snug text-stone-600">Toca para ver la planta entera.</span>
        </span>
      </button>
    </div>
  );
}

function coverAreaLabel(rooms: MareRooms) {
  const range = areaRangeForRooms(rooms);
  if (!range) return "";
  return range.low === range.high ? `${formatMareM2(range.low)} m²` : `${formatMareM2(range.low)} a ${formatMareM2(range.high)} m²`;
}

export default function MareLanding({ property, onClose }: Props) {
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const introNavRef = useRef<HTMLDivElement>(null);
  const modelTouch = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState("intro");
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [amenityIndex, setAmenityIndex] = useState(0);
  const [rooms, setRooms] = useState<MareRooms>("1");
  const [modelIndex, setModelIndex] = useState(0);
  const [selectedModelId, setSelectedModelId] = useState("16");
  const [selectedCodigo, setSelectedCodigo] = useState("16-10");
  const [zoom, setZoom] = useState<ZoomState | null>(null);

  const slides = MARE_MODELS.filter((model) => model.rooms === rooms);
  const safeIndex = slides.length ? ((modelIndex % slides.length) + slides.length) % slides.length : 0;
  const currentModel = slides[safeIndex];
  const floors = unitsForModel(selectedModelId);
  const selectedUnit = MARE_UNITS.find((unit) => unit.codigo === selectedCodigo && unit.modelId === selectedModelId) || floors[0] || null;
  const selectedModel = MARE_MODELS.find((model) => model.id === selectedModelId) || currentModel;
  const quote = selectedUnit ? quoteMareUnit(selectedUnit) : null;
  const fromAny = minCash();
  const amenity = AMENITIES[amenityIndex];

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

  const chooseModel = (model: MareModel) => {
    setSelectedModelId(model.id);
    setRooms(model.rooms);
    const group = MARE_MODELS.filter((item) => item.rooms === model.rooms);
    const index = group.findIndex((item) => item.id === model.id);
    if (index >= 0) setModelIndex(index);
    const listed = unitsForModel(model.id);
    const cheapest = listed.reduce((best, unit) => (unit.cashCents < best.cashCents ? unit : best), listed[0]);
    if (cheapest) setSelectedCodigo(cheapest.codigo);
  };

  const chooseRooms = (next: MareRooms) => {
    const first = MARE_MODELS.find((model) => model.rooms === next);
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
    const amount = Math.min(...listed.map((item) => item.cashCents)) / 100;
    return listed.length === 1 ? `USD ${formatMareUsd(amount)}` : `Desde USD ${formatMareUsd(amount)}`;
  };

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/mare`;
    const shareTitle = "Mare · Vive y disfruta en Equipetrol";
    const shareText = "Departamentos de 1, 2 y 3 habitaciones en Equipetrol, con espacios para relajarte, entrenar y compartir. Descubre Mare, en el 3.er anillo externo y Los Nogales.";
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
      propertyRef: "mare",
      operacion: "Preventa",
      zona: MARE_CONFIG.zone,
      extraFilters: selectedUnit ? { unidad: selectedUnit.codigo, piso: selectedUnit.piso } : {},
    }).catch(() => {});
    const note = selectedUnit?.note ? `. ${selectedUnit.note}` : "";
    const text = selectedUnit && selectedModel
      ? `Hola, vengo de N.I.A. Quiero ${selectedModel.name}, piso ${selectedUnit.piso}, ${formatMareM2(selectedUnit.superficieM2)} m² en Mare.\nPlan: al contado${note}.\n¿Sigue disponible y cuáles son los pasos para reservar?`
      : "Hola, vengo de N.I.A. Quiero consultar Mare.\nAún no elegí una unidad.\n¿Me ayudan a ver qué hay disponible?";
    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
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
        <img src="/mare/fachada.jpg" alt="Fachada de Mare" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
        <div className="relative z-10 w-full min-w-0 px-4 pb-24 pt-16 text-white sm:px-5 lg:px-7 lg:pb-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e8d5a8] backdrop-blur-md">
              <Sparkles size={12} />
              Preventa · 3.er anillo
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
              <MapPin size={12} className="text-[#e8d5a8]" />
              Los Nogales
            </span>
          </div>
          <h1 className="mt-3 font-serif text-4xl font-light leading-none tracking-wide drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] md:text-5xl">Mare.</h1>
          <p className="mt-2 max-w-md text-sm leading-snug text-white/90">Departamentos de 1, 2 y 3 habitaciones con espacios para relajarte, entrenar y compartir, en Equipetrol.</p>
          <div className="mt-3 flex max-w-lg gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Building2 size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Constructora</p>
                <p className="mt-0.5 text-sm font-medium leading-tight">Mariscal Construcciones</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <MapPin size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Al lado de</p>
                <p className="mt-0.5 text-[11px] font-medium leading-tight sm:text-sm">Chaplin Show</p>
              </div>
            </div>
          </div>
          <div className="mt-2 max-w-lg rounded-2xl border border-[#e8d5a8]/30 bg-black/55 px-3.5 py-3 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e8d5a8]">Departamentos disponibles</p>
            <div className="mt-2 space-y-2">
              {ROOM_FILTERS.map((row) => {
                const from = minCashForRooms(row.id);
                return (
                  <div key={row.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 border-t border-white/10 pt-2 first:border-0 first:pt-0">
                    <div className="min-w-0">
                      <p className="text-sm text-white">{row.label}</p>
                      <p className="text-[11px] text-white/70">{coverAreaLabel(row.id)}</p>
                    </div>
                    <p className="text-right font-serif text-sm font-semibold leading-tight">{from == null ? "Consultar" : `Desde USD ${formatMareUsd(from)}`}</p>
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
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><Sparkles size={13} /> 3.er anillo externo</span>
              <h2 className="font-serif text-3xl font-light leading-tight text-[#1C1917] md:text-4xl">Vive en Mare. Haz espacio para disfrutar.</h2>
              <p className="text-sm leading-relaxed text-stone-600 [text-align:justify] md:text-base">
                Un departamento para ti y espacios para todo lo que disfrutas. Mare reúne Residenza, con 2 y 3 habitaciones para la vida en familia; Sole, con opciones de 1 habitación; y Altezza, con propuestas de doble altura. Explora los modelos disponibles y encuentra tu forma de vivir en Equipetrol.
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Tu hogar, conectado con Equipetrol.</h3>
            <p className="text-sm leading-relaxed text-stone-600 [text-align:justify] md:text-base">
              Sobre el 3.er anillo externo, esquina Calle Los Nogales y al lado de Chaplin Show. Con Av. San Martín, UTEPSA y hoteles como referencias del entorno, Mare te sitúa en Equipetrol. Abre el mapa y descubre cómo se conecta con tus recorridos habituales.
            </p>
            <img src="/mare/social/estar.jpg" alt="Estar de un departamento Mare" className="aspect-[16/10] w-full rounded-2xl object-cover" />
            <a href={MARE_CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#816127]">
              <MapPin size={16} /> Abrir la ubicación <ArrowRight size={14} />
            </a>
          </section>

          <section id="amenidades" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Áreas sociales</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Del entrenamiento al descanso, sin salir de Mare.</h3>
            <p className="text-sm leading-relaxed text-stone-600 md:text-base">
              Entrena en el gimnasio o practica yoga, trabaja en el centro empresarial y comparte en la cocina de verano, las churrasqueras o la terraza y lounge de Marea. También tienes Playa Mare, paseo forestal y juegos infantiles. La Perla, de acceso exclusivo, reúne piscina en altura y jacuzzi, dos salas de cine, karaoke, sport bar, cocina del chef, spa santuario, sala de juegos y Terrazzo.
            </p>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <img src={amenity.src} alt={amenity.title} className="aspect-[16/10] w-full object-cover" />
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{amenity.title}</p>
                  <p className="text-xs text-stone-500">{amenity.description}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setAmenityIndex((index) => (index + AMENITIES.length - 1) % AMENITIES.length)} className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200" aria-label="Anterior"><ChevronLeft size={16} /></button>
                  <button type="button" onClick={() => setAmenityIndex((index) => (index + 1) % AMENITIES.length)} className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200" aria-label="Siguiente"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          </section>

          <section id="tipologias" className="mt-20 scroll-mt-6 space-y-4 border-t border-stone-200/80 pt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Tipologías</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917]">Un espacio para cada forma de vivir.</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {MARE_MODELS.map((model) => {
                const listed = unitsForModel(model.id);
                const from = Math.min(...listed.map((unit) => unit.cashCents)) / 100;
                return (
                  <button key={model.id} type="button" onClick={() => { chooseModel(model); scrollToSection("disponibilidad"); }} className="rounded-2xl border border-stone-200 bg-white p-4 text-left">
                    <p className="text-sm font-semibold">{model.name}</p>
                    <p className="mt-1 text-xs text-stone-500">{model.detail}</p>
                    <p className="mt-2 text-sm font-semibold text-[#9a7b45]">{listed.length === 1 ? "USD" : "Desde USD"} {formatMareUsd(from)}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section id="equipamiento" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Equipamiento</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Dúplex con extras que ya están incluidos.</h3>
            <p className="text-sm leading-relaxed text-stone-600 [text-align:justify] md:text-base">
              Aprovecha el dúplex tipo 20, en los pisos 25 y 26, con parqueo XL, baulera Mz-108 y muebles fijos incluidos: rack de TV en sala y dormitorio, espaldar, escritorio y vestidor amoblado. Si prefieres 1 habitación, el tipo 16 del piso 12 incluye vestidor. El precio de cada una de estas unidades ya contempla esos ítems.
            </p>
            <img src="/mare/social/dormitorio.jpg" alt="Dormitorio de Mare" className="aspect-[16/9] w-full rounded-2xl object-cover" />
          </section>

          <section id="constructora" className="mt-20 scroll-mt-6 space-y-4 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Colaboradores</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Diseño de autor, experiencia de Mariscal.</h3>
            <p className="text-sm leading-relaxed text-stone-600 md:text-base">
              Detrás de Mare está Mariscal Construcciones, fundada por el Ing. Walter Mariscal hace más de 20 años. El proyecto combina la arquitectura de Henry Gonzales y Cristian Miranda, de AZERO STUDIO, con interiores de Roberto Franco, de Franco Arquitectura. Lifestyle Group S.C. acompaña el desarrollo conceptual y comercial. Conoce quiénes dan forma a tu próximo hogar.
            </p>
          </section>

          <section id="pago" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Formas de pago</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Conoce tu inversión antes de decidir.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] md:text-base">
              Compara modelos y pisos con el precio al contado de cada unidad. En el cotizador puedes ver el total y revisar lo que incluye el departamento que elijas.
            </p>
            <article className="rounded-2xl bg-stone-900 p-5 text-white shadow-lg">
              <span className="rounded-full bg-[#C19A6B] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950">Contado</span>
              <h4 className="mt-3 font-serif text-2xl">Una compra al contado, con el total a la vista.</h4>
              <p className="mt-3 text-sm leading-relaxed text-stone-300">Pago del 100% del precio del departamento, sin saldo pendiente. En el dúplex tipo 20, el parqueo XL y la baulera ya están incluidos.</p>
            </article>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
              Elegir mi departamento <ArrowRight size={14} />
            </button>
          </section>

          <section id="disponibilidad" className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-6">
            <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
              <div className="shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Disponibilidad</span>
                <h3 className="mt-1 font-serif text-2xl font-light text-[#1C1917]">Elige el departamento que va contigo.</h3>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 1 · Tipología</p>
                <div className="grid shrink-0 grid-cols-3 gap-2">
                  {ROOM_FILTERS.map((filter) => {
                    const from = minCashForRooms(filter.id);
                    return (
                      <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-xl border p-3 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white"}`}>
                        <span className="block text-sm font-bold">{filter.label}</span>
                        <span className="text-[11px] text-[#9a7b45]">{from == null ? "Consultar disponibilidad" : `Desde USD ${formatMareUsd(from)}`}</span>
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
                    onOpen={() => setZoom({ title: currentModel.name, caption: currentModel.detail, src: currentModel.preview })}
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
              <div className="grid grid-cols-1 gap-1.5 rounded-xl border border-stone-200 bg-white p-2 sm:grid-cols-2">
                {floors.map((unit) => {
                  const selected = unit.codigo === selectedCodigo;
                  return (
                    <button key={unit.codigo} type="button" onClick={() => setSelectedCodigo(unit.codigo)} className={`rounded-lg px-2 py-2 text-xs font-semibold ${selected ? "bg-stone-900 text-white" : "border border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
                      <span className="block">Piso {unit.piso}</span>
                      <span className="block text-[10px] font-normal">{formatMareM2(unit.superficieM2)} m² · USD {formatMareUsd(unit.cash)}{unit.note ? ` · ${unit.note}` : ""}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 3 · Parqueo</p>
              <div className={`rounded-xl border p-3 ${selectedUnit?.parkingIncluded ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                <p className="text-sm font-bold">{selectedUnit?.parkingIncluded ? "Parqueo XL y baulera incluidos" : "Sin parqueo en el precio de este tipo"}</p>
                <p className={`text-[11px] ${selectedUnit?.parkingIncluded ? "text-stone-300" : "text-stone-500"}`}>
                  {selectedUnit?.parkingIncluded ? "Baulera Mz-108 y parqueo XL dentro del precio de tu dúplex." : "Consulta opciones y precios con el asesor. El dúplex tipo 20 ya incluye parqueo XL y baulera."}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 4 · Plan de pago</p>
              <div className="rounded-xl border border-stone-900 bg-stone-900 p-3 text-white">
                <p className="text-sm font-bold">Al contado</p>
                <p className="text-[11px] text-[#E8D5A8]">100% del precio publicado. Sin saldo pendiente.</p>
              </div>
            </div>

            {selectedUnit && quote && selectedModel && (
              <div className="mt-6 space-y-4 rounded-2xl bg-stone-900 p-5 text-white shadow-xl">
                <div className="border-b border-white/10 pb-3 text-xs text-[#E8D5A8]">
                  {selectedModel.name} · piso {selectedUnit.piso} · {formatMareM2(selectedUnit.superficieM2)} m²
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Inversión total</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatMareUsd(quote.total)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">Precio publicado{selectedUnit.note ? ` · ${selectedUnit.note}` : ""}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Al contado (100%)</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight text-emerald-400"><span className="block font-mono text-xs font-normal text-emerald-500/80">USD</span>{formatMareUsd(quote.initial)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">El total del departamento</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Saldo</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight text-stone-500"><span className="block font-mono text-xs font-normal text-stone-500">USD</span>—</p>
                    <p className="mt-1 text-[10px] text-stone-400">Sin saldo pendiente</p>
                  </div>
                </div>
                <button type="button" onClick={contactWhatsApp} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-900">
                  <MessageCircle size={16} />
                  Quiero la unidad {selectedModel.name}
                </button>
              </div>
            )}
          </section>

          <section id="cierre" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200 pt-12 pb-16 text-center">
            <h3 className="font-serif text-3xl font-light text-[#1C1917]">Tu próximo hogar puede ser Mare.</h3>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-600">
              Consulta por {selectedModel ? `${selectedModel.name}, piso ${selectedUnit?.piso || ""}`.trim() : "el departamento que estás mirando"}. Te ayudamos a revisar disponibilidad, inclusiones y los pasos para avanzar con tu compra.
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
            <p className="text-[11px] leading-tight text-stone-700 sm:text-xs">{selectedUnit ? `USD ${formatMareUsd(selectedUnit.cash)}` : `Desde USD ${formatMareUsd(fromAny)}`}</p>
            <p className="text-[10px] text-stone-500">3.er anillo, Los Nogales</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a href={MARE_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" aria-label="Brochure" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2 py-2 text-[10px] font-semibold uppercase text-stone-800 sm:text-[11px] sm:tracking-wider">
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
            <div className="flex min-h-0 flex-1 items-center justify-center p-4">
              <img src={zoom.src} alt={zoom.title} className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
