import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Building2,
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
import { blessDreiInventory, useInventory } from "../projectInventory";
import { recordLeadEvent } from "../leadTracking";
import {
  BLESS_DREI_CONFIG,
  BlessDreiUnit,
  fetchBlessDreiLiveUnits,
  formatBlessUsd,
} from "../blessDreiInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

type RoomId = "mono" | "1d";
type PlanId = "contado" | "plan40" | "plan30";
type AddonId = "none" | "parking";
type ZoomView = "depto" | "planta" | "ficha" | "solo";

type Slide = {
  id: string;
  name: string;
  areaLabel: string;
  where: string;
  detail: string;
  preview: string;
  plan: string;
};

const ROOM_FILTERS: { id: RoomId; label: string; tipologia: BlessDreiUnit["tipologia"] }[] = [
  { id: "mono", label: "Monoambiente", tipologia: "Monoambiente" },
  { id: "1d", label: "1 dormitorio", tipologia: "1 Dormitorio" },
];

const PLANS: { id: PlanId; label: string; hint: string }[] = [
  { id: "contado", label: "100% contado", hint: "La tarifa de contado" },
  { id: "plan40", label: "40% + 60%", hint: "40% en obra · 60% entrega" },
  { id: "plan30", label: "30% + 70%", hint: "30% a la firma · 70% entrega" },
];

const ADDONS: { id: AddonId; label: string; hint: string; amount: number }[] = [
  { id: "none", label: "Sin adicional", hint: "Solo el departamento", amount: 0 },
  { id: "parking", label: "Parqueo", hint: "USD 12.000", amount: 12000 },
];

const AMENITY_SLIDES = [
  {
    src: "/bless_drei/social/piscina.jpg",
    category: "Piso 6",
    title: "Tu pausa junto a la piscina",
    description: "Refréscate, disfruta del solárium y encuentra un momento para ti con vista abierta, sin salir de tu edificio.",
  },
  {
    src: "/bless_drei/social/gimnasio.jpg",
    category: "Piso 6",
    title: "Entrena al aire libre",
    description: "Dale un lugar al movimiento en tu día con el gimnasio exterior de la terraza de áreas sociales.",
  },
  {
    src: "/bless_drei/social/cowork.jpg",
    category: "Piso 6",
    title: "Un cowork para tus proyectos",
    description: "Cambia de ambiente para concentrarte. Una sala de trabajo compartido cerca de tu departamento.",
  },
  {
    src: "/bless_drei/social/reuniones.jpg",
    category: "Piso 6",
    title: "Reúnete sin salir de casa",
    description: "Recibe a tu equipo en una sala de reuniones con mesa y vista a la ciudad, y separa el trabajo de tu espacio personal.",
  },
  {
    src: "/bless_drei/social/churrasquera.jpg",
    category: "Piso 6",
    title: "Comparte alrededor de la parrilla",
    description: "Invita a los tuyos a un asado. La churrasquera cuenta con barra y mesón para disfrutar tus encuentros.",
  },
  {
    src: "/bless_drei/social/eventos.jpg",
    category: "Piso 6",
    title: "Un salón para tus celebraciones",
    description: "Reúne a tu familia y amigos en un salón con comedor y estar para compartir tus ocasiones especiales.",
  },
];

const BLESS_MODELOS: {
  id: string;
  rooms: RoomId;
  name: string;
  area: string;
  where: string;
  preview: string;
  full: string;
}[] = [
  { id: "a", rooms: "mono", name: "Modelo A", area: "30,94 m²", where: "Basamento · pisos 1 a 5 · fachada posterior", preview: "/bless_drei/modelos/a.jpg", full: "/bless_drei/fichas/a.jpg" },
  { id: "b", rooms: "mono", name: "Modelo B", area: "33,18 m²", where: "Basamento · pisos 1 a 5 · fachada posterior", preview: "/bless_drei/modelos/b.jpg", full: "/bless_drei/fichas/b.jpg" },
  { id: "c", rooms: "mono", name: "Modelo C", area: "37,47 m²", where: "Torre · pisos 13 y 14 · fachada posterior", preview: "/bless_drei/modelos/c.jpg", full: "/bless_drei/fichas/c.jpg" },
  { id: "d", rooms: "mono", name: "Modelo D", area: "37,85 m²", where: "Torre · pisos 13 y 14 · fachada frontal", preview: "/bless_drei/modelos/d.jpg", full: "/bless_drei/fichas/d.jpg" },
  { id: "e", rooms: "mono", name: "Modelo E", area: "41,66 m²", where: "Torre · pisos 7 a 12 · fachada frontal", preview: "/bless_drei/modelos/e.jpg", full: "/bless_drei/fichas/e.jpg" },
  { id: "f", rooms: "mono", name: "Modelo F", area: "41,80 m²", where: "Torre · pisos 7 a 12 · fachada posterior", preview: "/bless_drei/modelos/f.jpg", full: "/bless_drei/fichas/f.jpg" },
  { id: "h", rooms: "mono", name: "Modelo H", area: "45,07 m²", where: "Basamento · pisos 1 a 5 · fachada frontal", preview: "/bless_drei/modelos/h.jpg", full: "/bless_drei/fichas/h.jpg" },
  { id: "g", rooms: "1d", name: "Modelo G", area: "42,35 m²", where: "Basamento · pisos 1 a 5 · fachada posterior", preview: "/bless_drei/modelos/g.jpg", full: "/bless_drei/fichas/g.jpg" },
  { id: "i", rooms: "1d", name: "Modelo I", area: "46,17 m²", where: "Basamento · pisos 1 a 5 · fachada frontal", preview: "/bless_drei/modelos/i.jpg", full: "/bless_drei/fichas/i.jpg" },
];

const EQUIPAMIENTO = [
  {
    id: "cocina",
    room: "Cocina",
    title: "Cocina",
    image: "/bless_drei/interior_3.jpg",
    contain: false,
    items: ["Cocina encimera", "Extractor eléctrico de cocina"],
  },
  {
    id: "sala",
    room: "Sala",
    title: "Sala y dormitorios",
    image: "/bless_drei/interior_1.jpg",
    contain: false,
    items: ["Aires acondicionados en dormitorios y salas", "Luminaria LED"],
  },
  {
    id: "cuarto",
    room: "Departamento",
    title: "Baño y agua caliente",
    image: "/bless_drei/bano.jpg",
    contain: true,
    items: [
      "Espejo con iluminación LED en baños",
      "Box de baños con vidrio templado",
      "Grifería y accesorios sanitarios importados",
      "Extractor mecánico en baños",
      "Calefón eléctrico/gas",
    ],
  },
  {
    id: "acceso",
    room: "Edificio",
    title: "Acceso y vigilancia",
    image: "/bless_drei/fachada_principal.jpg",
    contain: false,
    items: [
      "Cerradura inteligente en la puerta de ingreso",
      "Intercomunicador en cada departamento",
      "Vigilancia en el edificio 24/7",
    ],
  },
];

const SECTIONS = [
  { id: "intro", label: "Inicio" },
  { id: "lugar", label: "Ubicación" },
  { id: "amenidades", label: "Áreas sociales" },
  { id: "tipologias", label: "Tipologías" },
  { id: "equipamiento", label: "Equipamiento" },
  { id: "constructora", label: "Constructora" },
  { id: "pago", label: "Formas de pago" },
  { id: "disponibilidad", label: "Disponibilidad" },
  { id: "cierre", label: "Cierre" },
];

const MAPS_URL = "https://maps.app.goo.gl/S9snbQg9CiKbUkY59?g_st=ic";
const FLOOR_PLAN = "/bless_drei/esquema-pisos.jpg";

function tipologiaOf(room: RoomId) {
  return ROOM_FILTERS.find((item) => item.id === room)?.tipologia || "Monoambiente";
}

function slidesFor(room: RoomId): Slide[] {
  return BLESS_MODELOS.filter((model) => model.rooms === room).map((model) => ({
    id: model.id,
    name: model.name,
    areaLabel: model.area,
    where: model.where,
    detail: "Plano del modelo publicado",
    preview: model.preview,
    plan: model.full,
  }));
}

function matchesSlide(unit: BlessDreiUnit, slide: Slide, room: RoomId) {
  return unit.modelo.toUpperCase() === slide.id.toUpperCase() && unit.tipologia === tipologiaOf(room);
}

function minCash(list: BlessDreiUnit[]) {
  const free = list.filter((unit) => unit.estado === "LIBRE" && unit.precioContado > 0);
  return free.length ? Math.min(...free.map((unit) => unit.precioContado)) : null;
}

function apartmentTotal(unit: BlessDreiUnit, plan: PlanId) {
  if (plan === "plan40") return unit.precioCuotas || Math.round(unit.precioContado * 1.08);
  if (plan === "plan30") return unit.precioCuotas || Math.round(unit.precioContado * 1.15);
  return unit.precioContado;
}

function quoteUnit(unit: BlessDreiUnit | null, plan: PlanId, addon: number) {
  if (!unit || unit.estado !== "LIBRE" || !(unit.precioContado > 0)) return null;
  const apartment = apartmentTotal(unit, plan);
  const pct = plan === "contado" ? 100 : plan === "plan40" ? 40 : 30;
  const initial = plan === "contado" ? apartment + addon : Math.round((apartment * pct) / 100);
  const balance = plan === "contado" ? null : apartment - initial;
  return {
    total: apartment + addon,
    initial,
    balance,
    rate: unit.superficieM2 > 0 ? Math.round(apartment / unit.superficieM2) : 0,
    addon,
  };
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
          <span className="block text-xs leading-snug text-stone-600">Toca el departamento para verlo entero, o abre la ficha.</span>
        </span>
      </button>
    </div>
  );
}

export default function BlessDreiLanding({ property, onClose }: Props) {
  const [units, setUnits] = useInventory(blessDreiInventory);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const introNavRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const modelTouch = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState("intro");
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [amenityIndex, setAmenityIndex] = useState(0);
  const [rooms, setRooms] = useState<RoomId>("mono");
  const [modelIndex, setModelIndex] = useState(0);
  const [selectedCodigo, setSelectedCodigo] = useState("");
  const [addon, setAddon] = useState<AddonId>("none");
  const [paymentPlan, setPaymentPlan] = useState<PlanId>("contado");
  const [zoom, setZoom] = useState<{ view: ZoomView; title: string; caption: string; preview: string; plan: string } | null>(null);
  const picked = useRef(false);

  useEffect(() => {
    fetchBlessDreiLiveUnits().then((next) => {
      if (next && next.length > 0) setUnits(next);
    });
  }, [setUnits]);

  const libres = units.filter((unit) => unit.estado === "LIBRE" && unit.precioContado > 0);
  const placed = units.length - libres.length;
  const fromMono = minCash(units.filter((unit) => unit.tipologia === "Monoambiente"));
  const from1 = minCash(units.filter((unit) => unit.tipologia === "1 Dormitorio"));
  const fromAny = minCash(units);
  const slides = useMemo(() => slidesFor(rooms), [rooms]);
  const slideIndex = slides.length ? ((modelIndex % slides.length) + slides.length) % slides.length : 0;
  const slide = slides[slideIndex];
  const floors = useMemo(() => {
    if (!slide) return [];
    return units.filter((unit) => matchesSlide(unit, slide, rooms)).slice().sort((a, b) => a.pisoNumero - b.pisoNumero || a.codigo.localeCompare(b.codigo));
  }, [slide, units, rooms]);
  const activeUnit = floors.find((unit) => unit.codigo === selectedCodigo && unit.estado === "LIBRE")
    || floors.find((unit) => unit.estado === "LIBRE")
    || null;
  const extra = ADDONS.find((item) => item.id === addon)?.amount || 0;
  const quote = quoteUnit(activeUnit, paymentPlan, extra);
  const amenity = AMENITY_SLIDES[amenityIndex];

  const priceLabel = (current: Slide) => {
    const matching = units.filter((unit) => matchesSlide(unit, current, rooms));
    const amount = minCash(matching);
    if (amount) return `Desde USD ${formatBlessUsd(amount)}`;
    if (matching.some((unit) => unit.estado === "RESERVADO")) return "Reservado";
    return "Vendido";
  };

  useEffect(() => {
    const root = rightPanelRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll("section[id]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
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

  const chooseRooms = (next: RoomId) => {
    setRooms(next);
    const list = slidesFor(next);
    const index = Math.max(0, list.findIndex((item) => units.some((unit) => matchesSlide(unit, item, next) && unit.estado === "LIBRE" && unit.precioContado > 0)));
    setModelIndex(index);
    const current = list[index];
    const free = current ? units.find((unit) => matchesSlide(unit, current, next) && unit.estado === "LIBRE" && unit.precioContado > 0) : undefined;
    setSelectedCodigo(free?.codigo || "");
    picked.current = true;
  };

  useEffect(() => {
    if (picked.current || !units.length) return;
    const list = slidesFor(rooms);
    const index = list.findIndex((item) => units.some((unit) => matchesSlide(unit, item, rooms) && unit.estado === "LIBRE" && unit.precioContado > 0));
    if (index < 0) return;
    picked.current = true;
    setModelIndex(index);
    const free = units.find((unit) => matchesSlide(unit, list[index], rooms) && unit.estado === "LIBRE" && unit.precioContado > 0);
    if (free) setSelectedCodigo(free.codigo);
  }, [units, rooms]);

  const shiftModel = (dir: number) => {
    if (slides.length < 2) return;
    const next = (slideIndex + dir + slides.length) % slides.length;
    setModelIndex(next);
    const free = units.find((unit) => matchesSlide(unit, slides[next], rooms) && unit.estado === "LIBRE");
    setSelectedCodigo(free?.codigo || "");
  };

  const openSlide = (current: Slide, view: "depto" | "planta") => {
    setZoom({
      view,
      title: current.name,
      caption: `${current.areaLabel} · ${current.where}`,
      preview: current.preview,
      plan: current.plan,
    });
  };

  const openFloorPlan = () => {
    setZoom({
      view: "solo",
      title: "Distribución de pisos",
      caption: "Pisos 7 a 14: monoambientes. Piso 6: áreas sociales. Pisos 1 a 5: monoambientes y 1 dormitorio. Planta baja y subsuelo: parqueos.",
      preview: FLOOR_PLAN,
      plan: FLOOR_PLAN,
    });
  };

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/bless-drei`;
    const shareText = `Bless Drei, en Equipetrol, desde USD ${formatBlessUsd(fromAny || BLESS_DREI_CONFIG.minPriceUsd)}. Entrega en febrero 2028.`;
    recordLeadEvent({ action: "share", propertyRef: String(property.id || "bless-drei"), operacion: "Preventa", zona: BLESS_DREI_CONFIG.zone }).catch(() => {});
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Bless Drei · Equipetrol", text: shareText, url: shareUrl });
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
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "Lead", { content_name: "Bless Drei" });
    }
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: String(property.id || "bless-drei"),
      operacion: "Preventa",
      zona: property.zone || BLESS_DREI_CONFIG.zone,
      presupuesto: quote ? String(quote.total) : undefined,
      extraFilters: activeUnit ? { unidad: activeUnit.codigo, piso: activeUnit.piso, modelo: activeUnit.modelo, plan: paymentPlan, adicional: addon } : { plan: paymentPlan },
    }).catch(() => {});
    const planLabel = paymentPlan === "contado" ? "Contado 100%" : paymentPlan === "plan40" ? "40% en obra y 60% contra entrega" : "30% a la firma y 70% contra entrega";
    const addonLabel = addon === "parking" ? "Parqueo USD 12.000" : "Sin adicional";
    const unitLine = activeUnit
      ? `Unidad ${activeUnit.codigo}, piso ${activeUnit.pisoNumero}, Modelo ${activeUnit.modelo} (${activeUnit.tipologia}, ${activeUnit.superficieM2.toLocaleString("es-BO")} m²)`
      : "Bless Drei";
    const money = quote
      ? `\n• Inversión total: USD ${formatBlessUsd(quote.total)}\n• A la firma: USD ${formatBlessUsd(quote.initial)}\n• Saldo contra entrega: ${quote.balance == null ? "sin saldo pendiente" : `USD ${formatBlessUsd(quote.balance)}`}`
      : "";
    const text = `Hola, vengo de N.I.A y quiero reservar en Bless Drei (Equipetrol):\n\n• ${unitLine}\n• ${addonLabel}\n• Modalidad: ${planLabel}${money}\n\nCuento con los USD ${formatBlessUsd(BLESS_DREI_CONFIG.reservaUsd)} de reserva. ¿Me confirman la disponibilidad y los pasos?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const fromRooms = (room: RoomId) => (room === "mono" ? fromMono : from1);

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

      <div className="relative flex min-h-[560px] shrink-0 flex-col bg-[#e8e6e3] md:h-screen md:min-h-0 md:w-[44%]">
        <div className="relative min-h-[240px] flex-1 md:min-h-0">
          <div className="h-16 shrink-0 md:hidden" aria-hidden="true" />
          <div className="relative h-[300px] w-full md:absolute md:inset-0 md:h-auto">
            <img src="/bless_drei/fachada_principal.jpg" alt="Fachada de Bless Drei" className="absolute inset-0 h-full w-full object-contain object-center" />
          </div>
        </div>
        <div className="relative z-10 bg-stone-950 px-6 pb-6 pt-5 text-white md:px-8 md:pb-5 md:pt-4">
          <img src="/bless_drei/logo-altavida.jpg" alt="Alta Vida" className="mb-3 h-12 w-auto rounded-md md:mb-2 md:h-10" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8d5a8]/40 bg-[#9a7b45]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#e8d5a8]">
            <Sparkles size={12} />
            Preventa · {BLESS_DREI_CONFIG.zone}
          </span>
          <h1 className="mt-2.5 font-serif text-4xl font-light tracking-wide text-white md:mt-2">Bless Drei</h1>
          <p className="mt-1 max-w-sm text-xs text-stone-300 md:text-sm">{BLESS_DREI_CONFIG.address}</p>
          <div className="mt-4 grid max-w-sm grid-cols-2 gap-3 md:mt-3">
            <div className="rounded-xl border border-white/10 bg-black/40 p-3">
              <p className="text-[10px] uppercase tracking-wider text-stone-400">Entrega</p>
              <p className="mt-0.5 text-xs font-semibold text-white md:text-sm">{BLESS_DREI_CONFIG.delivery}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-3">
              <p className="text-[10px] uppercase tracking-wider text-stone-400">Constructora</p>
              <p className="mt-0.5 text-xs font-semibold text-white md:text-sm">{BLESS_DREI_CONFIG.builder}</p>
            </div>
          </div>
          <div className="mt-3 max-w-sm rounded-xl border border-white/15 bg-black/55 p-4 md:hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[11px] text-stone-300">
              <span className="font-semibold text-[#e8d5a8]">Lista oficial</span>
              <span>{libres.length} libres de {units.length}</span>
            </div>
            <div className="mt-2.5 space-y-1.5 text-xs">
              {ROOM_FILTERS.map((filter) => (
                <div key={filter.id} className="flex items-center justify-between">
                  <span className="text-stone-300">{filter.label}</span>
                  <span className="font-serif font-bold">{fromRooms(filter.id) ? `Desde USD ${formatBlessUsd(fromRooms(filter.id) as number)}` : "Agotado"}</span>
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
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><Sparkles size={13} /> Experiencia residencial y preventa</span>
              <h2 className="font-serif text-3xl font-light leading-tight text-[#1C1917] md:text-5xl">
                Vive en Bless Drei.
                <span className="mt-1 block font-normal italic text-[#9a7b45]">Tu vida, en el corazón de Equipetrol.</span>
              </h2>
              <p className="pt-2 text-sm leading-relaxed text-[#57534E] [text-align:justify] md:text-base">
                Sal a disfrutar Equipetrol y vuelve a un espacio que se sienta tuyo. Bless Drei reúne monoambientes y departamentos de 1 dormitorio en la calle Alejandro Ramírez, cerca de la Av. San Martín. Piscina, cowork, gimnasio al aire libre y espacios para compartir en el piso 6 completan una vida con más opciones cerca de casa.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#E7E5E4] bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Lista oficial</p>
                <p className="mt-0.5 font-serif text-lg font-bold text-stone-900">{placed} colocadas</p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Quedan {libres.length}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => scrollToSection("disponibilidad")} className="rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md">Ver disponibilidad y cotizar</button>
              <a href={BLESS_DREI_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-800">
                <Download size={15} className="text-[#9a7b45]" /> Brochure
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Sal a disfrutar Equipetrol.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify]">
              Tu dirección está en la calle Alejandro Ramírez, entre el 3° y el 4° anillo, cerca de la Av. San Martín. Restaurantes, comercios y oficinas forman parte del entorno para conectar tu hogar con los planes de cada día.
            </p>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <img src="/bless_drei/ubicacion.jpg" alt="Mapa de Bless Drei en la calle Alejandro Ramírez, Equipetrol" className="block h-auto w-full" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm"><p className="font-serif text-xl font-bold">1 min</p><p className="mt-0.5 text-[11px] text-stone-500">Av. San Martín</p></div>
              <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm"><p className="font-serif text-xl font-bold">3 min</p><p className="mt-0.5 text-[11px] text-stone-500">Hotel Marriott</p></div>
              <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm"><p className="font-serif text-xl font-bold">4 min</p><p className="mt-0.5 text-[11px] text-stone-500">Mall Ventura</p></div>
              <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm"><p className="font-serif text-xl font-bold">5 min</p><p className="mt-0.5 text-[11px] text-stone-500">Puente Urubó</p></div>
            </div>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              Ver ubicación en Google Maps <ExternalLink size={14} />
            </a>
          </section>

          <section id="amenidades" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Áreas sociales</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Trabaja, entrena y desconecta cerca de casa.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify]">
              Empieza el día entrenando al aire libre, encuentra tu lugar en el cowork y termina junto a la piscina. Las áreas sociales del piso 6 también te esperan con sala de reuniones, churrasquera y salón de eventos.
            </p>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="relative">
                <img src={amenity.src} alt={amenity.title} className="aspect-[16/10] w-full object-cover" />
                <button type="button" onClick={() => setAmenityIndex((index) => (index + AMENITY_SLIDES.length - 1) % AMENITY_SLIDES.length)} className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Anterior amenidad"><ChevronLeft size={18} /></button>
                <button type="button" onClick={() => setAmenityIndex((index) => (index + 1) % AMENITY_SLIDES.length)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Siguiente amenidad"><ChevronRight size={18} /></button>
              </div>
              <div className="space-y-1.5 px-5 py-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">{amenity.category}</span>
                <h4 className="font-serif text-xl text-stone-900">{amenity.title}</h4>
                <p className="text-xs leading-relaxed text-stone-600">{amenity.description}</p>
              </div>
            </div>
          </section>

          <section id="tipologias" className="mt-20 scroll-mt-2 border-t border-stone-200/80 pt-6">
            {slide && (
              <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
                <div className="shrink-0">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><Layers size={13} /> Tipologías</span>
                  <h3 className="font-serif text-2xl font-light leading-tight text-[#1C1917]">Un espacio propio para vivir Equipetrol.</h3>
                </div>
                <div className="grid shrink-0 grid-cols-2 gap-2">
                  {ROOM_FILTERS.map((filter) => (
                    <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-2xl border px-3 py-2 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white shadow-md ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white/80"}`}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{filter.label}</p>
                      <p className="text-[11px] text-stone-500">{slidesFor(filter.id).length} plantas</p>
                    </button>
                  ))}
                </div>
                <ModelFrame slide={slide} index={slideIndex} total={slides.length} frameClass="min-h-0 flex-1" onPrev={() => shiftModel(-1)} onNext={() => shiftModel(1)} onOpen={(view) => openSlide(slide, view)} onTouchStart={(event) => { touchX.current = event.changedTouches[0].clientX; }} onTouchEnd={(event) => { if (touchX.current == null) return; const dx = event.changedTouches[0].clientX - touchX.current; if (dx > 40) shiftModel(-1); if (dx < -40) shiftModel(1); touchX.current = null; }} />
              </div>
            )}
          </section>

          <section id="equipamiento" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><CheckCircle2 size={13} /> Equipamiento</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Abre la puerta a un hogar bien equipado.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify]">Cocina encimera, climatización y cerradura inteligente. Esto es lo que el proyecto publica como incluido.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {EQUIPAMIENTO.map((group) => (
                <div key={group.id} className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                  <img src={group.image} alt={group.title} className={group.contain ? "max-h-[320px] w-full object-contain" : "h-[210px] w-full object-cover"} />
                  <div className="space-y-2 px-4 py-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">{group.room}</span>
                    <h4 className="font-serif text-base font-bold text-stone-900">{group.title}</h4>
                    <ul className="space-y-1.5 border-t border-stone-100 pt-2 text-xs text-stone-600">
                      {group.items.map((item) => <li key={item} className="flex items-start gap-1.5"><span className="font-bold text-[#9a7b45]">·</span><span>{item}</span></li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="constructora" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><Building2 size={13} /> Constructora</span>
            <div className="inline-flex rounded-xl bg-stone-950 px-4 py-3">
              <img src="/bless_drei/logo-altavida.jpg" alt="Alta Vida Desarrollos Inmobiliarios" className="h-16 w-auto rounded-md" />
            </div>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Alta Vida, detrás de tu próximo hogar.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify]">
              Detrás de Bless Drei está Alta Vida SRL, fundada en 2014 y con presencia en 5 ciudades de Bolivia. Entrega en {BLESS_DREI_CONFIG.delivery}.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-stone-200 bg-white p-4"><p className="font-serif text-xl">Desde 2014</p><p className="mt-1 text-xs text-stone-500">Experiencia publicada de la desarrolladora.</p></div>
              <div className="rounded-xl border border-stone-200 bg-white p-4"><p className="font-serif text-xl">16 niveles</p><p className="mt-1 text-xs text-stone-500">La torre en Equipetrol, con áreas sociales en el piso 6.</p></div>
              <div className="rounded-xl border border-stone-200 bg-white p-4"><p className="font-serif text-xl">5 ciudades</p><p className="mt-1 text-xs text-stone-500">Santa Cruz, Tarija, Potosí, Oruro y Cochabamba.</p></div>
            </div>
            <a href="https://web.altavidasrl.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">web.altavidasrl.com <ExternalLink size={14} /></a>
          </section>

          <section id="pago" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Formas de pago</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Tu lugar en Equipetrol empieza con un plan.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify]">
              El proyecto publica tres caminos. Al contado usas la tarifa más baja. También puedes dejar el 40% durante la obra y el 60% contra entrega, o entrar con el 30% y dejar el 70% para {BLESS_DREI_CONFIG.delivery}. La reserva publicada es USD {formatBlessUsd(BLESS_DREI_CONFIG.reservaUsd)} y se acredita a la cuota inicial.
            </p>
            <article className="rounded-2xl bg-stone-900 p-5 text-white shadow-lg">
              <span className="rounded-full bg-[#C19A6B] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950">Contado</span>
              <h4 className="mt-3 font-serif text-2xl">Pago al contado, el 100% a la firma</h4>
              <p className="mt-3 text-sm leading-relaxed text-stone-300">Aseguras la tarifa de contado del departamento. El monto aparece al elegir la unidad.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">40 / 60</span>
              <h4 className="mt-3 font-serif text-2xl">40% durante la obra y 60% al recibir las llaves</h4>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">El 40% se integra durante la construcción, descontando los USD {formatBlessUsd(BLESS_DREI_CONFIG.reservaUsd)} de reserva. El 60% queda contra entrega.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">30 / 70</span>
              <h4 className="mt-3 font-serif text-2xl">30% a la firma y 70% contra entrega</h4>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">Empiezas con el 30% y dejas el 70% para la entrega en {BLESS_DREI_CONFIG.delivery}.</p>
            </article>
            <p className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700">Parqueo vehicular por USD 12.000. Se cotiza aparte, fuera del precio por metro.</p>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">Elegir mi departamento <ArrowRight size={14} /></button>
          </section>

          <section id="disponibilidad" className="mt-20 scroll-mt-2 space-y-6 border-t border-stone-200/80 pt-6">
            {slide && (
              <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
                <div className="shrink-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Disponibilidad</span>
                  <h3 className="font-serif text-2xl font-light leading-tight text-[#1C1917]">Elige el tuyo y empieza a hacerlo realidad.</h3>
                  <p className="mt-1 text-xs text-stone-500">Lista oficial. Verde: disponible · Gris: vendido o reservado. Reserva USD {formatBlessUsd(BLESS_DREI_CONFIG.reservaUsd)}.</p>
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-2">
                  <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 1 · Tipología</p>
                  <div className="grid shrink-0 grid-cols-2 gap-2">
                    {ROOM_FILTERS.map((filter) => (
                      <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-xl border p-3 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white"}`}>
                        <p className="text-sm font-bold">{filter.label}</p>
                        <p className="text-[11px] text-[#9a7b45]">{fromRooms(filter.id) ? `Desde USD ${formatBlessUsd(fromRooms(filter.id) as number)}` : "Sin unidades"}</p>
                      </button>
                    ))}
                  </div>
                  <ModelFrame slide={slide} index={slideIndex} total={slides.length} price={priceLabel(slide)} frameClass="min-h-0 flex-1" onPrev={() => shiftModel(-1)} onNext={() => shiftModel(1)} onOpen={(view) => openSlide(slide, view)} onTouchStart={(event) => { modelTouch.current = event.changedTouches[0].clientX; }} onTouchEnd={(event) => { if (modelTouch.current == null) return; const dx = event.changedTouches[0].clientX - modelTouch.current; if (dx > 40) shiftModel(-1); if (dx < -40) shiftModel(1); modelTouch.current = null; }} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 2 · Piso</p>
                <button type="button" onClick={openFloorPlan} className="text-[11px] font-semibold uppercase tracking-wider text-[#816127]">Ver distribución de pisos</button>
              </div>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-stone-200 bg-white p-2 sm:grid-cols-5">
                {floors.map((floor) => {
                  const libre = floor.estado === "LIBRE";
                  const current = activeUnit?.codigo === floor.codigo;
                  return (
                    <button key={floor.codigo} type="button" disabled={!libre} onClick={() => setSelectedCodigo(floor.codigo)} className={`rounded-lg px-1 py-2 text-xs font-semibold ${current && libre ? "bg-stone-900 text-white" : libre ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "cursor-not-allowed bg-stone-100 text-stone-400"}`}>
                      <span className="block">Piso {floor.pisoNumero}</span>
                      <span className="block text-[10px] font-normal">Unidad {floor.codigo}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 3 · Adicional</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ADDONS.map((item) => (
                  <button key={item.id} type="button" onClick={() => setAddon(item.id)} className={`rounded-xl border p-3 text-left ${addon === item.id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className={`text-[11px] ${addon === item.id ? "text-stone-300" : "text-stone-500"}`}>{item.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 4 · Plan de pago</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {PLANS.map((plan) => (
                  <button key={plan.id} type="button" onClick={() => setPaymentPlan(plan.id)} className={`rounded-xl border p-3 text-left ${paymentPlan === plan.id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                    <p className="text-sm font-bold">{plan.label}</p>
                    <p className={`text-[11px] ${paymentPlan === plan.id ? "text-[#E8D5A8]" : "text-stone-500"}`}>{plan.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            {activeUnit && quote && (
              <div className="space-y-4 rounded-2xl bg-stone-900 p-5 text-white shadow-xl">
                <div className="border-b border-white/10 pb-3 text-xs text-[#E8D5A8]">
                  Unidad {activeUnit.codigo} · Piso {activeUnit.pisoNumero} · Modelo {activeUnit.modelo} · {activeUnit.superficieM2.toLocaleString("es-BO")} m²
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Inversión total</p>
                    <p className="mt-1 font-serif text-2xl font-bold"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatBlessUsd(quote.total)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">USD {formatBlessUsd(quote.rate)}/m²{extra ? ` + adicional USD ${formatBlessUsd(extra)}` : ""}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Cuota inicial ({paymentPlan === "contado" ? "100" : paymentPlan === "plan40" ? "40" : "30"}%)</p>
                    <p className="mt-1 font-serif text-2xl font-bold text-emerald-400"><span className="block font-mono text-xs font-normal text-emerald-500/80">USD</span>{formatBlessUsd(quote.initial)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">A la firma del contrato</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Saldo contra entrega</p>
                    {quote.balance == null ? (
                      <>
                        <p className="mt-1 font-serif text-2xl font-bold text-stone-500"><span className="block font-mono text-xs font-normal text-stone-500">USD</span>—</p>
                        <p className="mt-1 text-[10px] text-stone-400">Sin saldo pendiente</p>
                      </>
                    ) : (
                      <>
                        <p className="mt-1 font-serif text-2xl font-bold"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatBlessUsd(quote.balance)}</p>
                        <p className="mt-1 text-[10px] text-stone-400">En {BLESS_DREI_CONFIG.delivery}</p>
                      </>
                    )}
                  </div>
                </div>
                {extra > 0 && paymentPlan !== "contado" && (
                  <p className="text-[11px] leading-relaxed text-stone-400">El parqueo queda fuera de ese porcentaje y se suma a la inversión total.</p>
                )}
                <button type="button" onClick={contactWhatsApp} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-900">
                  <MessageCircle size={16} /> Quiero la unidad {activeUnit.codigo}
                </button>
              </div>
            )}
          </section>

          <section id="cierre" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200 pt-12 pb-[48vh] text-center">
            <h3 className="font-serif text-3xl font-light text-[#1C1917]">Tu próximo comienzo tiene lugar en Equipetrol.</h3>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-600">
              Cuéntanos cómo imaginas tu nuevo espacio. Te ayudamos a comparar modelos, confirmar la lista y reservar con USD {formatBlessUsd(BLESS_DREI_CONFIG.reservaUsd)}. Entrega en {BLESS_DREI_CONFIG.delivery}.
            </p>
            <button type="button" onClick={contactWhatsApp} className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">Quiero conocer mis opciones <ArrowRight size={14} /></button>
          </section>
        </div>
      </div>

      {activeSection !== "cierre" && (
        <div className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-3 border-t border-stone-200 bg-[#f7f5f0]/95 px-5 py-3 backdrop-blur-md md:left-[44%]">
          <div>
            <p className="text-xs text-stone-700">Desde USD {formatBlessUsd(fromAny || BLESS_DREI_CONFIG.minPriceUsd)} · {BLESS_DREI_CONFIG.delivery}</p>
            <p className="hidden text-[10px] font-medium text-[#9a7b45] sm:block">Reserva con USD {formatBlessUsd(BLESS_DREI_CONFIG.reservaUsd)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a href={BLESS_DREI_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-stone-800">
              <Download size={14} className="text-[#9a7b45]" /> Brochure
            </a>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="rounded-lg bg-[#1C1917] px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white">Elegir unidad</button>
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
                  <button key={section.id} type="button" onClick={() => scrollToSection(section.id)} className={`w-full rounded-lg px-3 py-2 text-left font-medium ${activeSection === section.id ? "bg-[#9a7b45]/15 font-semibold text-[#816127]" : "text-stone-700"}`}>{section.label}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {zoom && (
        <div className="fixed inset-0 z-[140] flex flex-col bg-[#f7f5f0]" role="dialog" aria-modal="true" aria-label={zoom.title}>
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-8">
            <div className="min-w-0">
              <h4 className="font-serif text-xl text-stone-900">{zoom.title}</h4>
              <p className="text-xs text-stone-500">{zoom.caption}</p>
            </div>
            <button type="button" onClick={() => setZoom(null)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800" aria-label="Cerrar vista"><X size={18} /></button>
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
            <img src={zoom.view === "depto" ? zoom.preview : zoom.plan} alt={zoom.title} className="max-h-full max-w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
