import { ProjectContactActions, ProjectContactShortcut } from "./ProjectContactActions";
import { buildProjectContactMessage, projectContactLeadInput, type ProjectContactIntent } from "../projectContact";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Building2, Calendar, Check, ChevronLeft, ChevronRight, Download, Layers, MapPin, Menu, MessageCircle, Share2, Sparkles, X } from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import { trackMetaLead } from "../metaPixel";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";
import {
  WESTGATE_CONFIG, WESTGATE_MODELS, WESTGATE_PLANS, WESTGATE_ROOM_FILTERS, WESTGATE_UNITS,
  formatWestgateM2, formatWestgateUsd, quoteWestgateUnit, westgateAvailableAreaRange,
  westgateContactText, westgateMinCash, westgateUnitsForModel,
  type WestgateModel, type WestgatePlan, type WestgateRooms,
} from "../westgateTower";

interface Props { property: Property; onClose?: () => void; }

const SECTIONS = [
  { id: "intro", label: "Inicio" }, { id: "lugar", label: "Ubicación" },
  { id: "amenidades", label: "Áreas sociales" }, { id: "tipologias", label: "Tipologías" },
  { id: "equipamiento", label: "Equipamiento" }, { id: "constructora", label: "Colaboradores" },
  { id: "pago", label: "Formas de pago" }, { id: "disponibilidad", label: "Disponibilidad" },
  { id: "cierre", label: "Cierre" },
];

const AMENITIES = [
  { src: "piscina", category: "Piso 4", title: "Tu pausa junto a la piscina", text: "Disfruta la piscina panorámica y cambia el ritmo de tu día sin salir de casa." },
  { src: "churrasquera", category: "Para compartir", title: "Dos parrillas, muchos buenos encuentros", text: "Churrasqueras equipadas junto a la piscina para reunir a los tuyos alrededor de la mesa." },
  { src: "wellness", category: "Bienestar", title: "Un espacio para bajar el ritmo", text: "Jacuzzi, sauna seco y sauna a vapor en el wellness center de tu edificio." },
  { src: "cowork", category: "Trabajo", title: "Tu próxima reunión puede ser aquí", text: "Cowork equipado y amoblado para darle un lugar propio a tus proyectos." },
  { src: "juegos", category: "Tiempo libre", title: "Haz de una tarde un buen plan", text: "Área de juegos y descanso con billar, futbolín y espacios para compartir." },
  { src: "terraza", category: "Vida social", title: "Más espacio para disfrutar en compañía", text: "Terraza y salón de usos múltiples para tus encuentros y celebraciones." },
];

const EQUIPMENT = [
  { title: "Una cocina para disfrutar a diario", image: "cocina", items: [
    "Mobiliario de cocina completo y mesones en piedra sinterizada",
    "Extractor con salida al exterior y microondas de empotrar",
    "Cocina eléctrica vitrificada de 4 hornallas en monoambientes y 1 dormitorio",
    "Cocina a gas vitrificada de 4 hornallas y horno de empotrar en 2 dormitorios",
  ] },
  { title: "Detalles que se sienten al llegar", image: "bano", items: [
    "Revestimientos de baño en porcelanato y grifería monocomando",
    "Mueble bajo mesón y box de ducha con vidrio templado",
    "Espejo retroiluminado con sistema touch",
    "Pisos de porcelanato de gran formato 60 × 120 cm",
  ] },
  { title: "Confort en tus propios espacios", image: "interior", items: [
    "Aire acondicionado frío/calor instalado y termotanque en servicios",
    "Carpintería de aluminio y puertas con burlete perimetral de aislación",
    "Cielos decorados e iluminación LED en todos los ambientes",
    "Intercomunicador con videollamada y pantalla touch",
  ] },
  { title: "Comodidad desde el ingreso", image: "edificio", items: [
    "Lobby equipado y decorado; dos ascensores de 13 pasajeros",
    "Acceso al área de ascensores y gradas con reconocimiento facial",
    "Cerradura digital en los departamentos y vigilancia CCTV",
    "Sensores y sistema contra incendios; cuatro niveles de parqueos y bauleras techados",
  ] },
];

type Zoom = { title: string; caption: string; model?: WestgateModel; view: "depto" | "planta" | "ficha" | "solo"; src: string };

function ModelFrame({ model, index, total, price, onPrev, onNext, onOpen, onTouchStart, onTouchEnd }: {
  model: WestgateModel; index: number; total: number; price?: string;
  onPrev: () => void; onNext: () => void; onOpen: (view: "depto" | "planta") => void;
  onTouchStart: (event: TouchEvent<HTMLDivElement>) => void; onTouchEnd: (event: TouchEvent<HTMLDivElement>) => void;
}) {
  return <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
    <div className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-100 px-4 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{model.name}</p>
        <p className="text-xs text-stone-600">{formatWestgateM2(model.areaM2)} m² · {model.floors.length === 1 ? "Piso 4" : "Pisos 5 a 16"}</p>
        <p className="line-clamp-1 text-xs leading-snug text-stone-500">{model.orientation}</p>
        {price && <p className="mt-0.5 text-sm font-semibold text-[#9a7b45]">{price}</p>}
      </div>
      <p className="min-w-[4.25rem] shrink-0 rounded-full border border-[#9a7b45]/40 bg-[#f7f5f0] px-3 py-1.5 text-center text-base font-bold leading-none tabular-nums text-[#816127] shadow-sm sm:text-lg" title={`Modelo ${index + 1} de ${total}`}>{index + 1}/{total}</p>
    </div>
    <div className="relative min-h-0 flex-1 bg-white">
      <button type="button" onClick={() => onOpen("depto")} className="absolute inset-0 flex items-center justify-center p-2" aria-label={`Ver ${model.name} completo`}>
        <img src={model.preview} alt={`${model.name}, departamento completo`} className="max-h-full max-w-full object-contain" loading="lazy" />
      </button>
      {total > 1 && <>
        <button type="button" onClick={onPrev} className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo anterior"><ChevronLeft size={22} /></button>
        <button type="button" onClick={onNext} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo siguiente"><ChevronRight size={22} /></button>
      </>}
    </div>
    <button type="button" onClick={() => onOpen("planta")} className="flex h-[4.75rem] shrink-0 items-center gap-3 border-t border-stone-100 bg-[#f7f5f0] px-3 pr-16 text-left">
      <img src={model.plan} alt="" className="h-14 w-16 shrink-0 bg-white object-contain" loading="lazy" />
      <span className="min-w-0"><span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">En el piso</span><span className="block text-xs leading-snug text-stone-600">Abre la planta y ubica este departamento.</span></span>
    </button>
  </div>;
}

export default function WestgateTowerLanding({ property, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null), navRef = useRef<HTMLDivElement>(null);
  const modelTouch = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState("intro");
  const [showNav, setShowNav] = useState(false), [menuOpen, setMenuOpen] = useState(false);
  const [shared, setShared] = useState(false), [amenityIndex, setAmenityIndex] = useState(0);
  const [rooms, setRooms] = useState<WestgateRooms>(1);
  const [modelId, setModelId] = useState("d411"), [unitCode, setUnitCode] = useState("411");
  const [plan, setPlan] = useState<WestgatePlan>("contado");
  const [zoom, setZoom] = useState<Zoom | null>(null);
  const models = WESTGATE_MODELS.filter(model => model.rooms === rooms);
  const modelIndex = Math.max(0, models.findIndex(model => model.id === modelId));
  const model = models[modelIndex];
  const units = westgateUnitsForModel(model.id);
  const selectedUnit = units.find(unit => unit.code === unitCode) || null;
  const quote = selectedUnit?.status === "LIBRE" ? quoteWestgateUnit(selectedUnit, plan) : null;
  const modelPrice = westgateMinCash(undefined, model.id);
  const fromAny = westgateMinCash()!;
  const freeCount = WESTGATE_UNITS.filter(unit => unit.status === "LIBRE").length;
  const reservedCount = WESTGATE_UNITS.filter(unit => unit.status === "RESERVADO").length;
  const oneBedroomCount = WESTGATE_UNITS.filter(unit => unit.status === "LIBRE" && unit.rooms === 1).length;
  const amenity = AMENITIES[amenityIndex];

  useEffect(() => {
    const root = panelRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { root: window.matchMedia("(min-width: 768px)").matches ? root : null, rootMargin: "-12% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] });
    root.querySelectorAll("section[id]").forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const passed = (navRef.current?.getBoundingClientRect().bottom ?? Infinity) < 80;
      setShowNav(passed);
      if (!passed) setMenuOpen(false);
    };
    const desktop = panelRef.current, mobile = desktop?.parentElement;
    desktop?.addEventListener("scroll", onScroll, { passive: true });
    mobile?.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { desktop?.removeEventListener("scroll", onScroll); mobile?.removeEventListener("scroll", onScroll); };
  }, []);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); setZoom(null); }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [zoom]);

  const scrollTo = (id: string) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const chooseModel = (next: WestgateModel) => {
    setRooms(next.rooms); setModelId(next.id);
    setUnitCode(westgateUnitsForModel(next.id).find(unit => unit.status === "LIBRE")?.code || "");
  };
  const chooseRooms = (next: WestgateRooms) => {
    const group = WESTGATE_MODELS.filter(item => item.rooms === next);
    chooseModel(group.find(item => westgateMinCash(undefined, item.id) != null) || group[0]);
  };
  const shiftModel = (direction: number) => chooseModel(models[(modelIndex + direction + models.length) % models.length]);
  const openModel = (view: "depto" | "planta") => setZoom({ title: model.name, caption: `${formatWestgateM2(model.areaM2)} m² · ${model.orientation}`, model, view, src: view === "planta" ? model.plan : model.preview });
  const onModelSwipe = (event: TouchEvent<HTMLDivElement>) => {
    if (modelTouch.current == null) return;
    const dx = event.changedTouches[0].clientX - modelTouch.current;
    if (dx > 40) shiftModel(-1);
    if (dx < -40) shiftModel(1);
    modelTouch.current = null;
  };

  const canReserve = selectedUnit?.status === "LIBRE";

  const contact = (intent: ProjectContactIntent = "inquiry") => {
    const inquiryText = westgateContactText(model, selectedUnit, plan);

    const text = buildProjectContactMessage({ intent, projectName: "Westgate Tower", inquiryText, canReserve });
    if (!text) { scrollTo("disponibilidad"); return; }
    trackMetaLead(property);
    recordLeadEvent(projectContactLeadInput(intent, { action: "contact_tap", propertyRef: WESTGATE_CONFIG.id, operacion: "Preventa", zona: WESTGATE_CONFIG.zone,
      presupuesto: quote ? String(quote.total) : undefined,
      extraFilters: { modelo: model.id, ...(selectedUnit ? { unidad: selectedUnit.code, piso: selectedUnit.floor } : {}), plan },
    })).catch(() => {});
    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const share = async () => {
    const url = `${window.location.origin}/westgate-tower`;
    const title = "Westgate Tower · Frente a Fexpocruz";
    const text = `Departamentos de 1 y 2 dormitorios sobre Av. Roca y Coronado, desde USD ${formatWestgateUsd(fromAny)} al contado. Entrega prevista: septiembre de 2028.`;
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return; }
      catch (error) { if ((error as DOMException).name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(`${title}\n${text}\n${url}`); setShared(true); window.setTimeout(() => setShared(false), 2200); }
    catch { setShared(false); }
  };

  const frame = (withPrice: boolean) => <ModelFrame model={model} index={modelIndex} total={models.length}
    price={withPrice ? modelPrice == null ? "Sin unidades publicadas en esta lista" : `Desde USD ${formatWestgateUsd(modelPrice)}` : undefined}
    onPrev={() => shiftModel(-1)} onNext={() => shiftModel(1)} onOpen={openModel}
    onTouchStart={event => { modelTouch.current = event.changedTouches[0].clientX; }} onTouchEnd={onModelSwipe} />;
  const roomFilters = () => <div className="grid shrink-0 grid-cols-3 gap-2">{WESTGATE_ROOM_FILTERS.map(filter => <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-xl border p-3 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white"}`}>
    <span className="block text-xs font-bold uppercase text-[#816127] sm:text-sm">{filter.label}</span>
    <span className="text-[11px] text-stone-500">{WESTGATE_MODELS.filter(item => item.rooms === filter.id).length} plantas</span>
  </button>)}</div>;

  return <div className="nia-project-landing fixed inset-0 z-[100] flex flex-col overflow-y-auto overscroll-y-contain bg-[#f7f5f0] font-sans text-stone-900 md:flex-row md:overflow-hidden">
    <div className="fixed right-4 top-4 z-[120] flex gap-2 md:right-7 md:top-7">
      <button type="button" onClick={share} className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-800 shadow-xl" aria-label="Compartir">{shared ? <Check size={18} className="text-emerald-600" /> : <Share2 size={18} />}</button>
      {onClose && <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-800 shadow-xl" aria-label="Cerrar"><X size={18} /></button>}
    </div>

    <div className="relative flex shrink-0 flex-col justify-end overflow-hidden md:h-screen md:w-[44%]" style={{ minHeight: "100svh" }}>
      <img src="/westgate-tower/fachada.jpg" alt="Fachada de Westgate Tower sobre Av. Roca y Coronado" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
      <div className="relative z-10 w-full min-w-0 px-4 pb-24 pt-16 text-white sm:px-5 lg:px-7 lg:pb-7">
        <div className="flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]"><Sparkles size={12} />Preventa</span><span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold text-[#e8d5a8]"><MapPin size={12} />Fexpocruz</span></div>
        <h1 className="mt-3 font-serif text-4xl font-light leading-none tracking-wide drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] md:text-5xl">Westgate <span className="text-[#e8d5a8]">Tower</span></h1>
        <p className="mt-2 max-w-md text-sm leading-snug text-white/90">Donde el futuro encuentra su lugar. Sobre Av. Roca y Coronado, frente a Fexpocruz.</p>
        <div className="mt-3 flex max-w-lg gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md"><Calendar size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" /><div><p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Entrega prevista</p><p className="text-sm">{WESTGATE_CONFIG.delivery}</p></div></div>
          <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md"><Building2 size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" /><div><p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Proyecto</p><p className="text-sm">Westgate · W3</p></div></div>
        </div>
        <div className="mt-2 max-w-lg rounded-2xl border border-[#e8d5a8]/30 bg-black/55 px-3.5 py-3 backdrop-blur-md">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e8d5a8]">Departamentos disponibles</p>
          {[1,2].map(value => {
            const room = value as WestgateRooms, range = westgateAvailableAreaRange(room), price = westgateMinCash(room);
            return <div key={value} className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 border-t border-white/10 pt-2"><div><p className="text-sm">{value} {value === 1 ? "dormitorio" : "dormitorios"}</p><p className="text-[11px] text-white/70">{range && `${formatWestgateM2(range.low)} a ${formatWestgateM2(range.high)} m²`}</p></div><p className="text-right font-serif text-sm font-semibold">{price == null ? "Consultar" : `Desde USD ${formatWestgateUsd(price)}`}</p></div>;
          })}
        </div>
      </div>
    </div>

    <div ref={panelRef} className="min-w-0 flex-1 md:h-screen md:overflow-y-auto">
      <div className="mx-auto max-w-xl px-5 py-8 pb-32 md:max-w-3xl md:px-10 md:py-14 md:pb-44 lg:max-w-4xl lg:px-14 xl:max-w-5xl">
        <section id="intro" className="scroll-mt-6 space-y-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><Sparkles size={13} />Preventa frente a Fexpocruz</span>
          <h2 className="font-serif text-3xl font-light leading-tight text-[#1C1917] md:text-5xl">Vive en Westgate Tower.<span className="mt-1 block font-normal italic text-[#9a7b45]">Dale un lugar a tu próximo paso.</span></h2>
          <p className="text-sm leading-relaxed text-[#57534E] md:text-base">Convierte tu próximo proyecto en un espacio propio sobre Av. Roca y Coronado. Elige entre departamentos de uno y dos dormitorios, con áreas para trabajar, compartir y disfrutar sin salir del edificio. Quedan {oneBedroomCount} unidades de un dormitorio en la lista actual, desde USD {formatWestgateUsd(westgateMinCash(1)!)} al contado. Entrega prevista en septiembre de 2028.</p>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm"><div><p className="text-xs text-stone-500">Lista consultada el 27 de noviembre de 2026</p><p className="mt-1 text-sm text-stone-700">{reservedCount} unidad reservada</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{freeCount} disponibles</span></div>
          <div className="flex flex-wrap gap-3"><button type="button" onClick={() => scrollTo("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">Ver disponibilidad y cotizar<ArrowRight size={14} /></button><a href={WESTGATE_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-800"><Download size={15} className="text-[#9a7b45]" />Brochure</a></div>
          <div ref={navRef} className="space-y-2"><p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Navegación del proyecto</p><div className="flex gap-2 overflow-x-auto pb-1">{SECTIONS.slice(0,8).map(section => <button key={section.id} type="button" onClick={() => scrollTo(section.id)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${section.id === "intro" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-700"}`}>{section.label}</button>)}</div></div>
        </section>

        <section id="lugar" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Ubicación</span>
          <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Roca y Coronado, el punto de partida de tus planes.</h3>
          <p className="text-sm leading-relaxed text-[#57534E] md:text-base">Frente a Fexpocruz y sobre una avenida que conecta tu hogar con comercios, servicios y lugares de encuentro. El entorno reúne referencias como Hipermaxi Roca y Coronado y el centro deportivo Peloteros FC. Explora la ubicación y encuentra cómo encaja con tu rutina.</p>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white"><img src="/westgate-tower/ubicacion.jpg" alt="Ubicación oficial de Westgate Tower frente a Fexpocruz sobre Av. Roca y Coronado" className="block h-auto w-full" loading="lazy" /></div>
          <a href={WESTGATE_CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#816127]"><MapPin size={16} />Abrir ubicación en el mapa<ArrowRight size={14} /></a>
        </section>

        <section id="amenidades" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Áreas sociales</span>
          <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Tus mejores planes también tienen lugar en casa.</h3>
          <p className="text-sm leading-relaxed text-[#57534E] md:text-base">En el piso 4, una piscina panorámica, dos churrasqueras, jacuzzi y saunas seco y a vapor te invitan a bajar el ritmo. El cowork, el área de juegos y el salón de usos múltiples completan los espacios para trabajar, reunirte y disfrutar a tu manera.</p>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="relative"><img src={`/westgate-tower/social/${amenity.src}.jpg`} alt={amenity.title} className="aspect-[16/10] w-full object-cover" loading="lazy" /><button type="button" onClick={() => setAmenityIndex((amenityIndex + AMENITIES.length - 1) % AMENITIES.length)} className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-stone-800 shadow" aria-label="Área social anterior"><ChevronLeft size={18} /></button><button type="button" onClick={() => setAmenityIndex((amenityIndex + 1) % AMENITIES.length)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-stone-800 shadow" aria-label="Área social siguiente"><ChevronRight size={18} /></button></div><div className="space-y-2 p-5"><p className="text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">{amenity.category}</p><h4 className="font-serif text-xl text-[#1C1917]">{amenity.title}</h4><p className="text-sm text-stone-600">{amenity.text}</p></div></div>
          <div className="flex justify-center gap-1.5">{AMENITIES.map((item,index) => <button key={item.src} type="button" onClick={() => setAmenityIndex(index)} className="flex h-6 items-center px-1" aria-label={`Ver ${item.title}`} aria-current={index === amenityIndex ? "true" : undefined}><span className={`block h-1.5 rounded-full ${index === amenityIndex ? "w-6 bg-[#9a7b45]" : "w-1.5 bg-stone-300"}`} /></button>)}</div>
        </section>

        <section id="tipologias" className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-6"><div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3"><div className="shrink-0"><span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><Layers size={13} />Tipologías</span><h3 className="mt-1 font-serif text-2xl font-light text-[#1C1917]">El espacio que acompaña tu próxima etapa.</h3></div>{roomFilters()}{frame(false)}</div></section>

        <section id="equipamiento" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Equipamiento</span><h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Detalles para sentirte en casa desde que llegas.</h3><p className="text-sm leading-relaxed text-[#57534E] md:text-base">Cocinas equipadas, climatización instalada y acabados que acompañan el uso de cada día. Descubre lo que incluye tu departamento y cómo cambia el equipamiento según la tipología.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{EQUIPMENT.map(group => <article key={group.image} className="overflow-hidden rounded-2xl border border-stone-200 bg-white"><img src={group.image === "edificio" ? "/westgate-tower/lobby.jpg" : `/westgate-tower/equipamiento/${group.image}.jpg`} alt={group.title} className="h-[210px] w-full object-cover" loading="lazy" /><div className="space-y-3 p-4"><h4 className="font-serif text-xl text-[#1C1917]">{group.title}</h4><ul className="space-y-2 text-xs leading-relaxed text-stone-600">{group.items.map(item => <li key={item} className="flex gap-2"><Check size={13} className="mt-0.5 shrink-0 text-[#9a7b45]" /><span>{item}</span></li>)}</ul></div></article>)}</div>
          <p className="text-[11px] text-stone-500">Imágenes ilustrativas. El horno está publicado para departamentos de 2 dormitorios.</p>
        </section>

        <section id="constructora" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Proyectos Westgate</span><img src="/westgate-tower/logo.jpg" alt="Westgate Tower" className="h-14 w-auto object-contain mix-blend-multiply" loading="lazy" /><h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Una nueva etapa de la colección Westgate.</h3><p className="text-sm leading-relaxed text-[#57534E] md:text-base">Tower se presenta como W3 dentro de la colección Westgate, junto a W1 Boutique y W2 Los Cusis. Una propuesta sobre Roca y Coronado que combina espacios privados, áreas sociales y una ubicación para conectar con la ciudad.</p><div className="overflow-hidden rounded-2xl border border-stone-200 bg-white"><img src="/westgate-tower/proyectos.jpg" alt="Proyectos Westgate: W1 Boutique, W2 Los Cusis y W3 Tower" className="block h-auto w-full" loading="lazy" /></div><a href={WESTGATE_CONFIG.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">Conocer Westgate<ArrowRight size={14} /></a>
        </section>

        <section id="pago" className="mt-20 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Formas de pago</span><h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Elige cómo empezar a construir tu patrimonio.</h3><p className="text-sm leading-relaxed text-[#57534E] md:text-base">Compara el precio al contado con los planes de 50% o 30% de inicial. Cada modalidad tiene su propio precio total; al elegir una unidad verás la inversión, el aporte inicial y el saldo restante. Consulta el calendario de pagos antes de reservar.</p>
          {WESTGATE_PLANS.map(option => {
            const minRate = Math.min(...WESTGATE_UNITS.filter(unit => unit.status === "LIBRE").map(unit => quoteWestgateUnit(unit, option.id).rate));
            return <article key={option.id} className={`rounded-2xl border p-5 ${option.id === "contado" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-900"}`}><span className="rounded-full bg-[#C19A6B] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950">{option.label}</span><h4 className="mt-3 font-serif text-2xl">{option.id === "contado" ? "100% al contado" : `Inicial ${option.initialPercent}% · saldo ${100-option.initialPercent}%`}</h4><p className={`mt-2 font-serif text-2xl ${option.id === "contado" ? "text-[#E8D5A8]" : "text-[#1C1917]"}`}>Desde USD {formatWestgateUsd(minRate)}/m²</p><p className={`mt-2 text-sm ${option.id === "contado" ? "text-stone-300" : "text-stone-600"}`}>{option.id === "contado" ? "Paga el precio de contado de la unidad elegida, sin saldo pendiente." : "Revisa el saldo en el cotizador y coordina sus condiciones de pago con el asesor."}</p></article>;
          })}
          <div className="rounded-xl border border-stone-200 bg-white p-4 text-xs leading-relaxed text-stone-600">Tipo de cambio oficial / flexible BCB, según las condiciones de la propuesta comercial. Consulta disponibilidad y precio de parqueos y bauleras; el cotizador utiliza solo el precio del departamento publicado en la lista.</div><button type="button" onClick={() => scrollTo("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">Elegir mi departamento<ArrowRight size={14} /></button>
        </section>

        <section id="disponibilidad" className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-6">
          <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3"><div className="shrink-0"><span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Disponibilidad</span><h3 className="mt-1 font-serif text-2xl font-light text-[#1C1917]">Encuentra tu unidad y compara los planes.</h3><p className="mt-1 text-xs text-stone-500">Lista consultada el 27/11/2026 · elige la tipología</p></div>{roomFilters()}{frame(true)}</div>
          <div className="mt-8 space-y-6">
            <div className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 2 · Piso y unidad</p><button type="button" onClick={() => setZoom({ view: "solo", title: model.floors.length === 1 ? "Distribución del piso 4" : "Distribución de pisos 5 a 16", caption: "Planta oficial del brochure", src: model.floors.length === 1 ? "/westgate-tower/planos/piso-4.jpg" : "/westgate-tower/planos/piso-tipo.jpg" })} className="text-xs font-semibold text-[#816127]">Ver distribución de pisos</button></div>
              {units.length ? <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{units.map(unit => <button key={unit.code} type="button" disabled={unit.status !== "LIBRE"} onClick={() => setUnitCode(unit.code)} className={`rounded-xl border px-2 py-3 text-xs ${unit.status !== "LIBRE" ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400" : unit.code === selectedUnit?.code ? "border-stone-900 bg-stone-900 text-white" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}><span className="block font-semibold">Piso {unit.floor}</span><span className="mt-1 block text-[10px]">Unidad {unit.code}</span>{unit.status !== "LIBRE" && <span className="block text-[10px]">Reservado</span>}</button>)}</div> : <div className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600">Este modelo está documentado en el brochure, pero no figura en la lista actual. Consulta otras opciones de esta tipología con un asesor.</div>}
              <a href={WESTGATE_CONFIG.priceListUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#816127]">Ver lista de disponibilidad<ArrowRight size={12} /></a>
            </div>
            <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 3 · Adicional</p><div className="rounded-xl border border-stone-200 bg-white p-4"><p className="text-sm font-semibold">Parqueos y bauleras a consulta</p><p className="mt-1 text-xs text-stone-500">Solicita opciones y precios con el asesor. No se añade un importe sin cotizar.</p></div></div>
            <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 4 · Plan de pago</p><div className="grid grid-cols-3 gap-2">{WESTGATE_PLANS.map(option => <button key={option.id} type="button" onClick={() => setPlan(option.id)} className={`rounded-xl border px-2 py-3 text-left text-xs font-semibold ${plan === option.id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-700"}`}>{option.label}</button>)}</div></div>
            {selectedUnit && quote ? <div className="space-y-4 rounded-2xl bg-stone-900 p-5 text-white shadow-xl"><p className="border-b border-white/10 pb-3 text-xs text-[#E8D5A8]">Unidad {selectedUnit.code} · Piso {selectedUnit.floor} · {formatWestgateM2(selectedUnit.areaM2)} m²</p><div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Inversión total</p><p className="mt-1 font-serif text-2xl font-bold"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatWestgateUsd(quote.total)}</p><p className="mt-1 text-[10px] text-stone-400">USD {formatWestgateUsd(quote.rate)}/m²</p></div><div><p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{quote.percent === 100 ? "Pago al contado" : `Cuota inicial (${quote.percent}%)`}</p><p className="mt-1 font-serif text-2xl font-bold text-emerald-400"><span className="block font-mono text-xs font-normal text-emerald-500/80">USD</span>{formatWestgateUsd(quote.initial)}</p></div><div><p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Saldo restante</p><p className="mt-1 font-serif text-2xl font-bold">{quote.balance == null ? "—" : <><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatWestgateUsd(quote.balance)}</>}</p><p className="mt-1 text-[10px] text-stone-400">{quote.balance == null ? "Sin saldo pendiente" : "Calendario de pago por coordinar"}</p></div></div><button type="button" onClick={() => contact()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-900"><MessageCircle size={16} />Quiero la unidad {selectedUnit.code}</button></div> : <button type="button" onClick={() => contact()} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white"><MessageCircle size={15} />Consultar este modelo</button>}
          </div>
        </section>

        <section id="cierre" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10 pb-16 text-center"><h3 className="font-serif text-3xl font-light text-[#1C1917]">Tu próxima etapa puede empezar en Westgate Tower.</h3><p className="mx-auto max-w-xl text-sm leading-relaxed text-[#57534E]">Elige el espacio que quieres para vivir o invertir y revisemos juntos tu próximo paso. Consulta por {selectedUnit ? `la unidad ${selectedUnit.code}, piso ${selectedUnit.floor}` : model.name}, confirma su disponibilidad y recibe las condiciones de tu plan.</p><ProjectContactActions canReserve={canReserve} selectionLabel={selectedUnit ? `Unidad ${selectedUnit.code} · Piso ${selectedUnit.floor}` : undefined} onReserve={() => contact("reserve")} onAdvice={() => contact("advice")} onChooseUnit={() => scrollTo("disponibilidad")} /></section>
      </div>
    </div>

    {activeSection !== "cierre" && <div className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-2 border-t border-stone-200 bg-[#f7f5f0]/95 px-3 py-2.5 backdrop-blur-md sm:px-5 sm:py-3 md:left-[44%]"><div className="min-w-0"><p className="text-[11px] leading-tight text-stone-700 sm:text-xs">{selectedUnit?.status === "LIBRE" ? `USD ${formatWestgateUsd(selectedUnit.cashCents / 100)}` : `Desde USD ${formatWestgateUsd(fromAny)}`}</p><p className="text-[10px] text-stone-500">{WESTGATE_CONFIG.delivery} · contado</p></div><div className="flex shrink-0 gap-1.5"><a href={WESTGATE_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" aria-label="Brochure" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2 py-2 text-[10px] font-semibold uppercase text-stone-800 sm:text-[11px]"><Download size={14} className="text-[#9a7b45]" /><span className="hidden sm:inline">Brochure</span></a><button type="button" onClick={() => scrollTo("disponibilidad")} className="rounded-lg bg-[#1C1917] px-2 py-2 text-[10px] font-bold uppercase text-white sm:px-2.5 sm:text-[11px]">Elegir unidad</button></div></div>}
    {showNav && <div className="fixed bottom-20 right-4 z-[125] flex flex-col items-end sm:right-6 md:right-8">
          {activeSection !== "cierre" && <ProjectContactShortcut onClick={() => scrollTo("cierre")} />}
<button type="button" onClick={() => setMenuOpen(!menuOpen)} className="relative z-[128] flex h-11 w-11 items-center justify-center rounded-full border border-stone-800/80 bg-stone-900/95 text-[#e8d5a8] shadow-2xl" aria-label="Secciones" aria-expanded={menuOpen}>{menuOpen ? <X size={18} /> : <Menu size={18} />}</button><AnimatePresence>{menuOpen && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute bottom-14 right-0 z-[115] w-56 space-y-1 rounded-2xl border border-stone-200 bg-white/95 p-2.5 text-xs shadow-2xl">{SECTIONS.map(section => <button key={section.id} type="button" onClick={() => scrollTo(section.id)} className={`w-full rounded-lg px-3 py-2 text-left font-medium ${activeSection === section.id ? "bg-[#9a7b45]/15 font-semibold text-[#816127]" : "text-stone-700"}`}>{section.label}</button>)}</motion.div>}</AnimatePresence></div>}
    {zoom && <div className="fixed inset-0 z-[140] flex flex-col bg-[#f7f5f0]" role="dialog" aria-modal="true" aria-label={zoom.title}><div className="flex items-start justify-between gap-3 px-4 py-3"><div><p className="font-serif text-xl text-stone-900">{zoom.title}</p><p className="text-xs text-stone-500">{zoom.caption}</p></div><button type="button" onClick={() => setZoom(null)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow" aria-label="Cerrar vista"><X size={18} /></button></div>{zoom.model && <div className="flex justify-center gap-2 px-4 py-2">{([['depto','Departamento'],['planta','Planta'],['ficha','Ficha']] as const).map(([view,label]) => <button key={view} type="button" onClick={() => setZoom({ ...zoom, view, src: view === "depto" ? zoom.model!.preview : view === "planta" ? zoom.model!.plan : zoom.model!.sheet })} className={`rounded-full px-4 py-2 text-xs font-semibold ${zoom.view === view ? "bg-stone-900 text-white" : "border border-stone-200 bg-white text-stone-700"}`}>{label}</button>)}</div>}<div className="flex min-h-0 flex-1 items-center justify-center p-4"><img src={zoom.src} alt={zoom.title} className="max-h-full max-w-full object-contain" /></div><p className="px-4 pb-3 text-center text-[10px] text-stone-500">Imágenes ilustrativas del proyecto. La ficha puede reunir varias distribuciones del mismo grupo.</p></div>}
  </div>;
}
