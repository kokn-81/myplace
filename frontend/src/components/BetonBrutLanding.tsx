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
import {
  BETON_BRUT_CONFIG,
  BETON_MODELS,
  BETON_UNITS,
  BetonAddon,
  BetonModel,
  BetonPlan,
  BetonRooms,
  formatBetonM2,
  formatBetonUsd,
  minContado,
  minContadoForRooms,
  quoteBetonUnit,
  unitsForModel,
} from "../betonBrutInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

const AMENITY_SLIDES = [
  {
    src: "/beton_brut/social/piscina.jpg",
    category: "Terraza",
    title: "Piscina con vista, tiempo para ti",
    description: "Date un respiro al aire libre. Piscina mirador en el último nivel, solárium con reposeras y sombrillas, y sonido Bose para acompañar la tarde.",
  },
  {
    src: "/beton_brut/social/churrasquera.jpg",
    category: "Terraza",
    title: "Churrasqueras para compartir",
    description: "Invita, enciende la parrilla y disfruta. Dos churrasqueras con mobiliario, refrigeración y sonido Bose para reunir a los tuyos alrededor de una buena comida.",
  },
  {
    src: "/beton_brut/social/sauna.jpg",
    category: "Bienestar",
    title: "Tu pausa en el sauna",
    description: "Regálate un momento para bajar el ritmo al volver a casa. Sauna seco equipado, integrado al área social de tu edificio.",
  },
  {
    src: "/beton_brut/social/karaoke.jpg",
    category: "Área social",
    title: "Una noche de karaoke en casa",
    description: "La próxima reunión puede ser en tu edificio. Sala amoblada con pantalla de 65 pulgadas y sistema de audio Bose con karaoke para compartir películas, música y buenos momentos.",
  },
  {
    src: "/beton_brut/social/cowork.jpg",
    category: "Área social",
    title: "Tu espacio para trabajar, en casa",
    description: "Concentrarte también tiene su lugar. Cowork amoblado con 8 estaciones, mesa colaborativa y mesa de diseño, sin tener que salir del edificio.",
  },
  {
    src: "/beton_brut/social/chef.jpg",
    category: "Área social",
    title: "Cocina de chef para tus encuentros",
    description: "Haz de una cena un buen plan. Bar con cocina de chef, isla central, encimera y horno Cata, cervecera, vinera y sonido Bose para disfrutar en compañía.",
  },
  {
    src: "/beton_brut/lobby.jpg",
    category: "Ingreso",
    title: "Una bienvenida con luz y amplitud",
    description: "Una llegada que se siente distinta. Recibidor de doble altura en el área social y luz natural que acompaña los halls de distribución de todos los niveles.",
  },
];

const EQUIPAMIENTO = [
  {
    id: "cocina",
    room: "Cocina",
    title: "Cocina para disfrutar cada día",
    image: "/beton_brut/cocina.jpg",
    items: [
      "Módulos altos y bajos, y mesón desayunador amoblado según tipología",
      "Mesones de cocina y desayunador en piedra sinterizada",
      "Encimera de inducción Cata, 4 zonas",
      "Horno eléctrico de convección Cata",
      "Purificador doble turbina Cata en 1 dormitorio; campana de isla Cata en 2 y 3 dormitorios",
      "Heladera panelable Eximbol, integrada al amoblamiento",
      "Grifería en acabado grafito",
    ],
  },
  {
    id: "bano",
    room: "Baño",
    title: "Un baño para bajar el ritmo",
    image: "/beton_brut/bano.jpg",
    items: [
      "Piso y revestimiento en porcelanato Portobello 60 × 120 cm, acabado travertino",
      "Mueble de lavamanos con cajonería baja y bacha de piedra sinterizada",
      "Espejo",
      "Grifería grafito en lavatorios y duchas",
      "Mampara con perfilería de acero inoxidable, acabado mate",
      "Sanitarios Roca de apoyo a piso",
      "Ducha higiénica en todos los baños",
    ],
  },
  {
    id: "depto",
    room: "Departamento",
    title: "Confort en cada ambiente",
    image: "/beton_brut/living.jpg",
    items: [
      "Altura libre de 2,65 m",
      "Muros con pintura lavable Suvinil",
      "Carpintería de aluminio con doble vidriado hermético y vidrio laminado 3+3",
      "Apertura corrediza y plegable según el ambiente",
      "Cortinas en la fachada a la calle y en la fachada hacia la iglesia",
      "Climatización inverter en todos los ambientes",
      "Walking closets y roperos amoblados según tipología",
      "Iluminación LED con spots empotrados y rieles",
      "Piso de balcones en porcelanato tono gris",
    ],
  },
  {
    id: "edificio",
    room: "Edificio",
    title: "Comodidad desde que llegas",
    image: "/beton_brut/social/ascensores.jpg",
    items: [
      "Puertas Línea Infinito con marcos de madera",
      "Cerradura electrónica: tarjeta, huella, clave y llave mecánica",
      "Dos ascensores de 8 pasajeros, del subsuelo al área social",
      "CCTV con monitoreo 24 horas",
      "Agua caliente con termotanque eléctrico",
      "Paneles solares",
      "Lavandería común con lavadoras y secadoras industriales",
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

const ROOM_FILTERS: { id: BetonRooms; label: string }[] = [
  { id: "1", label: "1 dormitorio" },
  { id: "2", label: "2 dormitorios" },
  { id: "3", label: "3 dormitorios" },
];

function betonPlanSrc(preview: string) {
  return preview.replace("/modelos/", "/planos/");
}

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
  model: BetonModel;
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
  const plan = betonPlanSrc(model.preview);
  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm ${frameClass}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-100 px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{model.name}</p>
          <p className="truncate text-xs text-stone-600">{formatBetonM2(model.areaM2)} m² · {model.where}</p>
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
          <span className="block text-xs leading-snug text-stone-600">Toca el departamento para verlo entero, o abre la planta.</span>
        </span>
      </button>
      {model.areaNote ? <p className="shrink-0 px-3 py-1.5 text-center text-[11px] text-stone-500">{model.areaNote}</p> : null}
    </div>
  );
}

function coverAreaLabel(rooms: BetonRooms) {
  const sizes = BETON_UNITS.filter((unit) => unit.rooms === rooms).map((unit) => unit.superficieM2);
  if (sizes.length === 0) return "";
  const low = Math.round(Math.min(...sizes));
  const high = Math.round(Math.max(...sizes));
  return low === high ? `${low} m²` : `${low} a ${high} m²`;
}

export default function BetonBrutLanding({ onClose }: Props) {
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const introNavRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const modelTouch = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState("intro");
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [amenityIndex, setAmenityIndex] = useState(0);
  const [rooms, setRooms] = useState<BetonRooms>("1");
  const [modelIndex, setModelIndex] = useState(0);
  const [selectedModelId, setSelectedModelId] = useState("d-1-5");
  const [selectedCodigo, setSelectedCodigo] = useState("1D");
  const [addon, setAddon] = useState<BetonAddon>("none");
  const [paymentPlan, setPaymentPlan] = useState<BetonPlan>("contado");
  const [zoom, setZoom] = useState<ZoomState | null>(null);

  const from1 = minContadoForRooms("1");
  const from2 = minContadoForRooms("2");
  const from3 = minContadoForRooms("3");
  const fromAny = minContado();
  const soldCount = BETON_UNITS.filter((unit) => unit.estado === "VENDIDO").length;
  const freeCount = BETON_UNITS.length - soldCount;
  const slides = BETON_MODELS.filter((model) => model.rooms === rooms);
  const slideIndex = ((modelIndex % slides.length) + slides.length) % slides.length;
  const currentModel = slides[slideIndex];
  const activeUnit = BETON_UNITS.find((unit) => unit.codigo === selectedCodigo && unit.modelId === selectedModelId) || null;
  const floors = unitsForModel(selectedModelId);
  const selectedModel = BETON_MODELS.find((model) => model.id === selectedModelId) || currentModel;
  const quote = activeUnit && activeUnit.estado === "LIBRE" ? quoteBetonUnit(activeUnit, paymentPlan, addon) : null;
  const selectedCash = activeUnit && activeUnit.estado === "LIBRE" && activeUnit.precioContado != null ? activeUnit.precioContado : null;

  const roomCount = useMemo(() => {
    return {
      "1": BETON_MODELS.filter((model) => model.rooms === "1").length,
      "2": BETON_MODELS.filter((model) => model.rooms === "2").length,
      "3": BETON_MODELS.filter((model) => model.rooms === "3").length,
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

  const chooseRooms = (next: BetonRooms) => {
    setRooms(next);
    setModelIndex(0);
    const first = BETON_MODELS.find((model) => model.rooms === next);
    if (first) chooseModel(first);
  };

  const chooseModel = (model: BetonModel) => {
    setSelectedModelId(model.id);
    setRooms(model.rooms);
    const group = BETON_MODELS.filter((item) => item.rooms === model.rooms);
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
    const shareUrl = `${origin}/beton-brut-ii`;
    const shareTitle = "Béton Brut II · Preventa en Equipetrol";
    const shareText = `Departamentos de 1, 2 y 3 dormitorios en Equipetrol, calle 8, desde USD ${formatBetonUsd(fromAny)}. Entrega en diciembre 2028.`;
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
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "Lead", { content_name: "Béton Brut II" });
    }
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: "beton-brut-ii",
      operacion: "Preventa",
      zona: BETON_BRUT_CONFIG.zone,
      presupuesto: quote ? String(quote.total) : undefined,
      extraFilters: activeUnit
        ? { unidad: activeUnit.codigo, piso: activeUnit.piso, modelo: activeUnit.modelId, plan: paymentPlan, adicional: addon }
        : { plan: paymentPlan },
    }).catch(() => {});

    const planLabel = paymentPlan === "contado" ? "Contado 100% (USD 1.700/m²)" : "Plan 30-60 (USD 1.800/m²)";
    const addonLabel = addon === "auto" ? "Parqueo vehicular USD 13.000" : addon === "moto" ? "Parqueo de moto USD 3.000" : "Sin parqueo";
    const unitLine = activeUnit
      ? `Unidad ${activeUnit.codigo}, piso ${activeUnit.piso}, ${selectedModel.name} (${formatBetonM2(activeUnit.superficieM2)} m², ${activeUnit.ubicacion})`
      : "Béton Brut II";
    const money = quote
      ? `\n• Inversión total: USD ${formatBetonUsd(quote.total)}\n• A la firma: USD ${formatBetonUsd(quote.initial)}\n• Saldo contra entrega: ${quote.balance == null ? "sin saldo pendiente" : `USD ${formatBetonUsd(quote.balance)}`}`
      : "";
    const text = `Hola, vengo de N.I.A y quiero reservar en Béton Brut II (Equipetrol, calle 8):\n\n• ${unitLine}\n• ${addonLabel}\n• Modalidad: ${planLabel}${money}\n\n¿Me confirman la disponibilidad de la lista del ${BETON_BRUT_CONFIG.priceListLabel} y los pasos para reservar?`;
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
        <img src="/beton_brut/fachada-completa.jpg" alt="Fachada completa de Béton Brut II" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-black/75 via-black/40 to-transparent" />
        <div className="relative z-10 px-5 pb-24 pt-16 text-white lg:px-7 lg:pb-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e8d5a8] backdrop-blur-md">
              <Sparkles size={12} />
              Preventa · 40 departamentos
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
              <MapPin size={12} className="text-[#e8d5a8]" />
              Equipetrol
            </span>
          </div>
          <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 font-serif leading-none drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]">
            <span className="text-4xl font-light tracking-wide md:text-5xl">Béton</span>
            <span className="text-2xl font-light text-[#e8d5a8] md:text-3xl">Brut II</span>
          </h1>
          <p className="mt-2 max-w-md text-sm leading-snug text-white/90">Hormigón a la vista, metal y vidrio. 40 departamentos en calle 8, Equipetrol.</p>
          <div className="mt-3 flex max-w-lg gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Calendar size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Entrega de obra</p>
                <p className="mt-0.5 text-sm font-medium leading-tight">{BETON_BRUT_CONFIG.delivery}</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Building2 size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Colaborador</p>
                <p className="mt-0.5 text-sm font-medium leading-tight">Beton Fortia S.R.L.</p>
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
                <div key={row.label} className="flex items-end justify-between gap-3 border-t border-white/10 pt-2 first:border-0 first:pt-0">
                  <div className="min-w-0">
                    <p className="text-sm text-white">{row.label}</p>
                    <p className="text-[11px] text-white/70">{row.area}</p>
                  </div>
                  <p className="shrink-0 text-right font-serif text-sm font-semibold">{row.price == null ? "Agotado" : `Desde USD ${formatBetonUsd(row.price)}`}</p>
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
                Arquitectura con carácter
              </span>
              <h2 className="font-serif text-3xl font-light leading-tight text-[#1C1917] md:text-5xl">
                Vive en Béton Brut II.
                <span className="mt-1 block font-normal italic text-[#9a7b45]">La exclusividad de solo 40 hogares.</span>
              </h2>
              <p className="pt-2 text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word] md:text-base">
                Hormigón a la vista, metal y vidrio en un edificio de solo 40 departamentos. Elige entre 1, 2 o 3 dormitorios y disfruta de Equipetrol desde un hogar con identidad propia, cocina equipada y espacios para compartir. Entrega en diciembre de 2028.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#E7E5E4] bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Lista del {BETON_BRUT_CONFIG.priceListLabel}</p>
                <p className="mt-0.5 font-serif text-lg font-bold text-stone-900">{soldCount} de {BETON_UNITS.length} unidades vendidas</p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Quedan {freeCount}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => scrollToSection("disponibilidad")} className="flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md">
                Ver disponibilidad y cotizar
              </button>
              <a href={BETON_BRUT_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-800">
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Vive donde Equipetrol se disfruta.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Haz de la gastronomía, los servicios y los encuentros de Equipetrol parte de tu día a día. Tu próxima dirección está en calle 8, entre el 2° y el 3° anillo, en el entorno de la Av. San Martín, la Av. La Salle, Los Tajibos y la Parroquia Sagrado Corazón.
            </p>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <img src="/beton_brut/ubicacion.jpg" alt="Mapa de Béton Brut II en Equipetrol, entre el 2° y el 3° anillo" className="block h-auto w-full" />
            </div>
            <a href={`https://maps.google.com/?q=${BETON_BRUT_CONFIG.lat},${BETON_BRUT_CONFIG.lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              Explorar mi próxima ubicación <ArrowRight size={14} />
            </a>
          </section>

          <section id="amenidades" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Áreas sociales</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Tu casa también se vive en la terraza.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Del trabajo al descanso, sin salir del edificio. Un cowork para concentrarte, piscina y sauna para desconectarte, y churrasqueras, karaoke y cocina de chef para reunir a los tuyos. Espacios amoblados y equipados para disfrutar más de estar en casa.
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
              <h3 className="font-serif text-2xl font-light leading-tight text-[#1C1917]">El espacio para vivir a tu manera.</h3>
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
              onOpen={(view) => setZoom({ view, title: currentModel.name, caption: `${formatBetonM2(currentModel.areaM2)} m² · ${currentModel.detail}`, preview: currentModel.preview, plan: betonPlanSrc(currentModel.preview), full: currentModel.full })}
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Abre la puerta. Empieza a disfrutar.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Tu departamento se entrega con cocina amoblada y equipada, climatización inverter en todos los ambientes y acabados que se sienten al vivirlos: piedra sinterizada, porcelanato Portobello y grifería grafito.
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
            <img src="/beton_brut/logo-negro.png" alt="Béton Brut II" className="h-14 w-auto" />
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Conoce a quienes dan forma a tu hogar.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Detrás de Béton Brut II están Beton Fortia S.R.L., Eduardo Roca y Mediterráneo Constructora. Conoce a los colaboradores que forman parte del proyecto que estás eligiendo.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex min-h-36 items-center justify-center rounded-xl border border-stone-200 bg-white p-4">
                <img src="/beton_brut/logos/fortia.png" alt="Beton Fortia S.R.L." className="max-h-24 w-auto" />
              </div>
              <div className="flex min-h-36 items-center justify-center rounded-xl border border-stone-200 bg-white p-4">
                <img src="/beton_brut/logos/roca.png" alt="Eduardo Roca" className="max-h-16 w-auto" />
              </div>
              <div className="flex min-h-36 items-center justify-center rounded-xl border border-stone-200 bg-white p-4">
                <img src="/beton_brut/logos/mediterraneo.png" alt="Mediterráneo Constructora" className="max-h-24 w-auto" />
              </div>
            </div>
            <a href={BETON_BRUT_CONFIG.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              betonbrut.com.bo <ExternalLink size={14} />
            </a>
          </section>

          <section id="pago" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Formas de pago</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Da el paso. Elige cómo pagarlo.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Elige el ahorro del contado o distribuye tu inversión con el plan 30-60. Compara las dos opciones y encuentra la forma de llegar a tu departamento, con entrega en {BETON_BRUT_CONFIG.delivery}.
            </p>
            <article className="rounded-2xl bg-stone-900 p-5 text-white shadow-lg">
              <span className="rounded-full bg-[#C19A6B] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950">Ventaja comercial</span>
              <h4 className="mt-3 font-serif text-2xl">Contado: aprovecha la mejor tarifa</h4>
              <p className="mt-2 font-serif text-3xl text-[#E8D5A8]">USD {formatBetonUsd(BETON_BRUT_CONFIG.cashPerM2)}/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-300">Accede al menor precio por metro del proyecto pagando el 100% a la firma del contrato. Precios de la lista del {BETON_BRUT_CONFIG.priceListLabel}.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">Plan 30-60</span>
              <h4 className="mt-3 font-serif text-2xl leading-snug">30% inicial, cuotas hasta el 60% y 40% al recibir tu hogar</h4>
              <p className="mt-2 font-serif text-3xl text-stone-900">USD {formatBetonUsd(BETON_BRUT_CONFIG.planPerM2)}/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">Empieza con el 30% a la firma y avanza con cuotas mensuales por otro 30%, hasta completar el 60%, en un plazo de hasta 24 meses. Reserva el 40% restante para la entrega de tu departamento, en {BETON_BRUT_CONFIG.delivery}.</p>
            </article>
            <div className="space-y-2 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
              <p>Completa tu compra con parqueo vehicular por USD {formatBetonUsd(BETON_BRUT_CONFIG.parkingCarUsd)} o parqueo de moto por USD {formatBetonUsd(BETON_BRUT_CONFIG.parkingMotoUsd)}. Se cotizan por separado.</p>
              <p>El edificio cuenta con 15 bauleras en subsuelo. Consulta su precio y disponibilidad con el asesor.</p>
            </div>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
              Elegir mi departamento <ArrowRight size={14} />
            </button>
          </section>

          <section id="disponibilidad" className="mt-20 scroll-mt-2 space-y-6 border-t border-stone-200/80 pt-6">
            <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
            <div className="shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Disponibilidad</span>
              <h3 className="font-serif text-2xl font-light leading-tight text-[#1C1917]">Haz tuyo uno de solo 40 hogares.</h3>
              <p className="mt-1 text-xs text-stone-500">Disponibilidad al {BETON_BRUT_CONFIG.priceListLabel}. Verde: disponible · Gris: vendido.</p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2">
              <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 1 · Tipología</p>
              <div className="grid shrink-0 grid-cols-3 gap-2">
                {ROOM_FILTERS.map((filter) => (
                  <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-xl border p-3 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white"}`}>
                    <p className="text-sm font-bold">{filter.label}</p>
                    <p className="text-[11px] text-[#9a7b45]">Desde USD {formatBetonUsd(minContadoForRooms(filter.id) || 0)}</p>
                  </button>
                ))}
              </div>
              <ModelFrame
                model={currentModel}
                index={slideIndex}
                total={slides.length}
                price={selectedCash != null ? `USD ${formatBetonUsd(selectedCash)}` : (() => {
                  const freeUnits = unitsForModel(currentModel.id).filter((unit) => unit.precioContado != null);
                  if (freeUnits.length === 0) return "Vendido";
                  const amount = Math.min(...freeUnits.map((unit) => unit.precioContado as number));
                  return `Desde USD ${formatBetonUsd(amount)}`;
                })()}
                frameClass="min-h-0 flex-1"
                onPrev={() => shiftModel(-1)}
                onNext={() => shiftModel(1)}
                onOpen={(view) => setZoom({ view, title: currentModel.name, caption: `${formatBetonM2(currentModel.areaM2)} m² · ${currentModel.detail}`, preview: currentModel.preview, plan: betonPlanSrc(currentModel.preview), full: currentModel.full })}
                onTouchStart={(event) => { modelTouch.current = event.changedTouches[0].clientX; }}
                onTouchEnd={onModelSwipe}
              />
            </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold uppercase tracking-wider text-stone-500">Paso 2 · Piso</span>
                <span className="flex items-center gap-3">
                  {selectedCash != null && <span className="font-semibold text-[#9a7b45]">USD {formatBetonUsd(selectedCash)}</span>}
                  <button type="button" onClick={() => setZoom({ view: "solo", src: "/beton_brut/esquema.jpg", title: "Distribución del edificio", caption: "Subsuelo, planta baja, pisos 1 a 7 y área social." })} className="font-semibold text-[#816127]">
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
                  ["auto", "Parqueo", `USD ${formatBetonUsd(BETON_BRUT_CONFIG.parkingCarUsd)}`],
                  ["moto", "Parqueo de moto", `USD ${formatBetonUsd(BETON_BRUT_CONFIG.parkingMotoUsd)}`],
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
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => setPaymentPlan("contado")} className={`rounded-xl border p-3 text-left ${paymentPlan === "contado" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                  <p className="text-sm font-bold">Contado</p>
                  <p className={`text-[11px] ${paymentPlan === "contado" ? "text-[#E8D5A8]" : "text-[#9a7b45]"}`}>100% a la firma · USD 1.700/m²</p>
                </button>
                <button type="button" onClick={() => setPaymentPlan("plan")} className={`rounded-xl border p-3 text-left ${paymentPlan === "plan" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                  <p className="text-sm font-bold">Plan 30-60</p>
                  <p className={`text-[11px] ${paymentPlan === "plan" ? "text-stone-300" : "text-stone-500"}`}>30% firma · cuotas hasta el 60% · 40% entrega</p>
                </button>
              </div>
            </div>

            {activeUnit && activeUnit.estado === "VENDIDO" && (
              <p className="rounded-xl border border-stone-200 bg-stone-100 p-4 text-sm text-stone-600">La unidad {activeUnit.codigo} figura vendida en la lista. Elige otro piso.</p>
            )}

            {activeUnit && quote && (
              <div className="space-y-4 rounded-2xl bg-stone-900 p-5 text-white shadow-xl">
                <div className="border-b border-white/10 pb-3 text-xs text-[#E8D5A8]">
                  Unidad {activeUnit.codigo} · Piso {activeUnit.piso} · {selectedModel.name} · {formatBetonM2(activeUnit.superficieM2)} m² · {activeUnit.ubicacion}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Inversión total</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatBetonUsd(quote.total)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">USD {formatBetonUsd(quote.rate)}/m²{quote.parking ? ` + adicional USD ${formatBetonUsd(quote.parking)}` : ""}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Cuota inicial ({paymentPlan === "contado" ? "100" : "30"}%)</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight text-emerald-400"><span className="block font-mono text-xs font-normal text-emerald-500/80">USD</span>{formatBetonUsd(quote.initial)}</p>
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
                        <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatBetonUsd(quote.balance)}</p>
                        <p className="mt-1 text-[10px] text-stone-400">40% en {BETON_BRUT_CONFIG.delivery}</p>
                      </>
                    )}
                  </div>
                </div>
                {paymentPlan === "plan" && (
                  <p className="text-[11px] leading-relaxed text-stone-400">
                    El tramo de cuotas es USD {formatBetonUsd(quote.installments)}, hasta completar el 60% del departamento, en un plazo de hasta 24 meses. El parqueo, si lo sumas, queda fuera de ese porcentaje.
                  </p>
                )}
                <button type="button" onClick={contactWhatsApp} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-900">
                  <MessageCircle size={16} />
                  Quiero la unidad {activeUnit.codigo}
                </button>
              </div>
            )}
          </section>

          <section id="cierre" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200 pt-12 pb-16 text-center">
            <h3 className="font-serif text-3xl font-light text-[#1C1917]">Tu próxima dirección empieza aquí.</h3>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-600">
              Cuéntanos qué estás buscando. Te ayudamos a comparar modelos, confirmar la disponibilidad y conocer los pasos para reservar en Béton Brut II.
            </p>
            <button type="button" onClick={contactWhatsApp} className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              Hablar con un asesor <ArrowRight size={14} />
            </button>
          </section>
        </div>
      </div>

      {activeSection !== "cierre" && (
        <div className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-3 border-t border-stone-200 bg-[#f7f5f0]/95 px-5 py-3 backdrop-blur-md lg:left-[44%]">
          <div>
            <p className="text-xs text-stone-700">{selectedCash != null ? `USD ${formatBetonUsd(selectedCash)} · ${BETON_BRUT_CONFIG.delivery}` : `Desde USD ${formatBetonUsd(fromAny)} · ${BETON_BRUT_CONFIG.delivery}`}</p>
            <p className="hidden text-[10px] font-medium text-[#9a7b45] sm:block">Consulta el monto de reserva</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a href={BETON_BRUT_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-stone-800">
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
