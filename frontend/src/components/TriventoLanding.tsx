import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  MapPin,
  Menu,
  MessageCircle,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";
import {
  TRIVENTO_CONFIG,
  TRIVENTO_INVENTORY_DATE,
  TRIVENTO_MODELS,
  TRIVENTO_UNITS,
  TriventoPlan,
  TriventoUnit,
  availableUnits,
  cheapestAvailable,
  formatTriventoM2,
  formatTriventoUsd,
  minRate,
} from "../triventoInventory";

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
  { id: "constructora", label: "Entrega" },
  { id: "pago", label: "Formas de pago" },
  { id: "disponibilidad", label: "Disponibilidad" },
];

const AMENITY_SLIDES = [
  {
    src: "/trivento/piscina.jpg",
    category: "Piscina",
    title: "Tu piscina en el edificio",
    description: "El día de calor se resuelve sin salir de Equipetrol. Bajas a la piscina del proyecto y te quedas.",
  },
  {
    src: "/trivento/cowork.jpg",
    category: "Cowork",
    title: "Trabaja sin ocupar tu dormitorio",
    description: "El cowork está para una llamada, una entrega o una tarde de estudio. Tu departamento sigue siendo para vivir.",
  },
  {
    src: "/trivento/churrasquera.jpg",
    category: "Churrasquera",
    title: "El asado queda en casa",
    description: "Invitas y el lugar ya está. La churrasquera es parte de las áreas sociales del proyecto.",
  },
  {
    src: "/trivento/reunion.jpg",
    category: "Reunión",
    title: "Un lugar para recibir a los tuyos",
    description: "El área de reunión abierta sirve para el domingo en familia o para mostrar el edificio a quien va a alquilar.",
  },
  {
    src: "/trivento/lobby.jpg",
    category: "Lobby",
    title: "La primera impresión ya está resuelta",
    description: "Quien llega a visitarte, o a ver el departamento, entra por un lobby. Eso también se alquila.",
  },
  {
    src: "/trivento/ingreso.jpg",
    category: "Ingreso",
    title: "Llegas a Equipetrol",
    description: "El ingreso principal da a Av. San Martín y Calle A. Ramírez. La dirección se entiende sola.",
  },
];

const EQUIPMENT = [
  {
    id: "clima",
    room: "CLIMATIZACIÓN",
    title: "Llegas y el clima ya está",
    image: "/trivento/vista_01.jpg",
    items: [
      "Aire de 12.000 BTU incluido en el departamento de 1 dormitorio.",
      "Aire de 18.000 BTU incluido en el departamento de 1 dormitorio.",
    ],
  },
  {
    id: "cocina",
    room: "COCINA",
    title: "La cocina entra en uso",
    image: "/trivento/vista_03.jpg",
    items: ["1 horno o microondas incluido, para que la unidad no te espere vacía."],
  },
  {
    id: "vidrio",
    room: "CERRAMIENTOS",
    title: "El cerramiento ya viene definido",
    image: "/trivento/fachada.jpg",
    items: ["Vidrio laminado y perfilería ALVI 60 en la fachada de tu departamento."],
  },
];

const inventoryLabel = new Date(`${TRIVENTO_INVENTORY_DATE}T12:00:00`).toLocaleDateString("es-BO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function TriventoLanding({ onClose }: Props) {
  const cheapest = cheapestAvailable();
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const introNavRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("intro");
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [amenityIndex, setAmenityIndex] = useState(0);
  const [equipmentIndex, setEquipmentIndex] = useState(0);
  const [selectedModelId, setSelectedModelId] = useState("04");
  const [planView, setPlanView] = useState<"2d" | "3d">("2d");
  const [showHd, setShowHd] = useState(false);
  const [units, setUnits] = useState<TriventoUnit[]>(TRIVENTO_UNITS);
  const [selectedCodigo, setSelectedCodigo] = useState(cheapest.codigo);
  const [paymentPlan, setPaymentPlan] = useState<TriventoPlan>("contado");
  const [refreshing, setRefreshing] = useState(false);

  const libres = availableUnits(units);
  const placed = units.length - libres.length;
  const minContado = minRate("contado", units);
  const minCredito = minRate("credito", units);
  const minTicket = Math.min(...libres.map((unit) => unit.precioContado || Infinity));
  const selectedModel = TRIVENTO_MODELS.find((model) => model.id === selectedModelId) || TRIVENTO_MODELS[3];
  const activeUnit = units.find((unit) => unit.codigo === selectedCodigo && unit.estado === "LIBRE") || null;

  const floorsForModel = useMemo(() => {
    return [1, 2, 3, 4, 5].map((piso) => {
      const unit = units.find((item) => item.piso === piso && item.modelo === selectedModelId);
      return { piso, unit, libre: unit?.estado === "LIBRE" };
    });
  }, [selectedModelId, units]);

  const financials = useMemo(() => {
    if (!activeUnit || activeUnit.precioContado == null || activeUnit.precioCredito == null) return null;
    const total = paymentPlan === "contado" ? activeUnit.precioContado : activeUnit.precioCredito;
    const initial = paymentPlan === "contado" ? total : Math.round(total * 50) / 100;
    const balance = paymentPlan === "contado" ? 0 : Math.round((total - initial) * 100) / 100;
    const rate = paymentPlan === "contado" ? activeUnit.puContado : activeUnit.puCredito;
    return { total, initial, balance, rate: rate || 0 };
  }, [activeUnit, paymentPlan]);

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
      { rootMargin: "-12% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] }
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
    onScroll();
    return () => {
      desktop?.removeEventListener("scroll", onScroll);
      mobile?.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    setShowSectionMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const chooseModel = (modelId: string) => {
    setSelectedModelId(modelId);
    const next = units.find((unit) => unit.modelo === modelId && unit.estado === "LIBRE");
    setSelectedCodigo(next?.codigo || "");
  };

  const refreshInventory = () => {
    setRefreshing(true);
    setUnits(TRIVENTO_UNITS);
    window.setTimeout(() => setRefreshing(false), 400);
  };

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/trivento`;
    const shareTitle = "Trivento IV · Preventa en Equipetrol";
    const shareText = `Departamentos en preventa sobre Av. San Martín, Equipetrol, desde USD ${formatTriventoUsd(minTicket)}.`;
    if (typeof navigator.share === "function") {
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
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "Lead", { content_name: "Trivento IV" });
    }
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: "trivento-iv",
      operacion: "Preventa",
      zona: TRIVENTO_CONFIG.zone,
      presupuesto: financials ? String(Math.round(financials.total)) : undefined,
      extraFilters: activeUnit
        ? { unidad: activeUnit.codigo, piso: activeUnit.piso, modelo: activeUnit.modelo, plan: paymentPlan }
        : { plan: paymentPlan },
    }).catch(() => {});

    const planLabel = paymentPlan === "contado" ? "Contado 100%" : "Crédito 50% inicial y 50% contra entrega";
    const unitLine = activeUnit
      ? `Unidad ${activeUnit.codigo}, piso ${activeUnit.piso}, Modelo ${Number(activeUnit.modelo)} (${activeUnit.tipologia}, ${activeUnit.posicion}, ${formatTriventoM2(activeUnit.m2Total)} m²)`
      : "Trivento IV";
    const money = financials
      ? `\n• Inversión total: USD ${formatTriventoUsd(financials.total)}\n• A la firma: USD ${formatTriventoUsd(financials.initial)}\n• Saldo contra entrega: ${paymentPlan === "contado" ? "sin saldo pendiente" : `USD ${formatTriventoUsd(financials.balance)}`}`
      : "";
    const text = `Hola, vengo de N.I.A y quiero reservar en Trivento IV (Equipetrol):\n\n• ${unitLine}\n• Modalidad: ${planLabel}${money}\n\n¿Me confirman la disponibilidad del cuadro y los pasos para reservar?`;
    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const scene = {
    intro: "/trivento/fachada.jpg",
    lugar: "/trivento/drone.jpg",
    amenidades: AMENITY_SLIDES[amenityIndex]?.src || "/trivento/piscina.jpg",
    tipologias: planView === "3d" ? selectedModel.render : selectedModel.iso,
    equipamiento: EQUIPMENT[equipmentIndex]?.image || "/trivento/vista_01.jpg",
    constructora: "/trivento/fachada_noche.jpg",
    pago: "/trivento/ingreso.jpg",
    disponibilidad: "/trivento/fachada.jpg",
    cierre: "/trivento/lobby.jpg",
  }[activeSection] || "/trivento/fachada.jpg";

  const planImage = planView === "2d" ? selectedModel.plan : selectedModel.render;
  const slide = AMENITY_SLIDES[amenityIndex];
  const equipment = EQUIPMENT[equipmentIndex];
  const modelMin = (modelId: string) => {
    const prices = libres.filter((unit) => unit.modelo === modelId).map((unit) => unit.precioContado || 0);
    return prices.length ? Math.min(...prices) : null;
  };

  return (
    <div className="nia-project-landing fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-[#F8F3E7] font-sans text-[#1C1917] md:flex-row md:overflow-hidden">
      <div className="fixed right-4 top-4 z-[120] flex items-center gap-2 md:right-7 md:top-7">
        <a href={TRIVENTO_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-[#9A7B45] shadow-xl" aria-label="Descargar brochure" title="Descargar brochure">
          <Download size={18} />
        </a>
        <button type="button" onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-800 shadow-xl" aria-label="Compartir" title="Compartir">
          {shareFeedback ? <Check size={18} className="text-emerald-600" /> : <Share2 size={18} />}
        </button>
        {onClose && (
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-700 shadow-xl" aria-label="Cerrar" title="Cerrar">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="relative min-h-[480px] shrink-0 bg-stone-950 md:h-screen md:w-[44%]">
        <AnimatePresence mode="wait">
          <motion.img
            key={scene}
            src={scene}
            alt="Trivento IV"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30" />
        <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
          <div className="pr-28 md:pr-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8D5A8]/40 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#E8D5A8]">
              <Sparkles size={12} />
              Preventa · Equipetrol
            </span>
            <h1 className="mt-3 font-serif text-4xl font-light text-white md:text-5xl">Trivento IV</h1>
            <p className="mt-2 max-w-sm text-sm font-light leading-relaxed text-white/90">
              Tu departamento en el Equipetrol que no para. Para vivir o para alquilar, con entrega en {TRIVENTO_CONFIG.delivery}.
            </p>
            <p className="mt-1 max-w-sm text-xs text-stone-300">{TRIVENTO_CONFIG.address}</p>
          </div>
          <div className="max-w-sm space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/45 p-3 backdrop-blur">
                <p className="text-[10px] uppercase tracking-wider text-stone-300">Entrega</p>
                <p className="mt-1 text-sm font-semibold text-white">{TRIVENTO_CONFIG.delivery}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/45 p-3 backdrop-blur">
                <p className="text-[10px] uppercase tracking-wider text-stone-300">Precio</p>
                <p className="mt-1 text-sm font-semibold text-white">{TRIVENTO_CONFIG.exchange}</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/15 bg-black/55 p-4 backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[11px]">
                <span className="font-semibold text-[#E8D5A8]">Tu precio de entrada · {inventoryLabel}</span>
                <span className="text-emerald-300">{libres.length} para elegir</span>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-300">Desde, al contado</p>
                  <p className="font-serif text-2xl text-white">USD {formatTriventoUsd(minTicket)}</p>
                </div>
                <p className="text-right text-xs text-stone-300">
                  Desde USD {formatTriventoUsd(minContado)}/m²
                  <span className="mt-1 block">Crédito desde USD {formatTriventoUsd(minCredito)}/m²</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={rightPanelRef} className="relative min-h-0 flex-1 md:h-screen md:overflow-y-auto">
        <div className="mx-auto max-w-xl px-5 py-8 pb-32 md:max-w-3xl md:px-10 md:py-14 md:pb-44 lg:max-w-4xl lg:px-14 xl:max-w-5xl">
          <section id="intro" className="scroll-mt-6 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9A7B45]">Experiencia residencial y preventa</span>
              <h2 className="font-serif text-4xl font-light leading-tight md:text-5xl">
                Vive en Trivento IV.
                <span className="mt-1 block italic text-[#9A7B45]">El lugar donde Equipetrol te queda a la puerta.</span>
              </h2>
              <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] md:text-base">
                Si buscas tu primer departamento, o una unidad para alquilar en la zona que el propio proyecto llama la más dinámica de la ciudad, Trivento IV está pensado para ti. Estudiantes, jóvenes profesionales, parejas que empiezan e inversionistas de renta tradicional o Airbnb entran por la misma puerta: <strong>{TRIVENTO_CONFIG.address}</strong>, Equipetrol, con llaves en <strong>{TRIVENTO_CONFIG.delivery}</strong>.
              </p>
              <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify]">
                Hoy eliges entre los pisos 1 a 5, cinco departamentos por piso. El precio que ves es el del cuadro del {inventoryLabel}, en dólares al tipo de cambio del BCB. Lo que ya se vendió o se reservó sale del mapa: no te mostramos un número que el proyecto no publicó.
              </p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#9A7B45]">Preventa en marcha</p>
                  <p className="mt-1 font-serif text-lg font-bold">{placed} de {units.length} unidades ya están colocadas</p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {libres.length} para ti
                </span>
              </div>
              <p className="mt-3 border-t border-stone-100 pt-3 text-xs leading-relaxed text-stone-500 [text-align:justify]">
                Entrar ahora es elegir entre lo que todavía tiene precio. Cuando esas {libres.length} se coloquen, el ticket de hoy deja de existir.
              </p>
            </div>
            <div ref={introNavRef} className="flex flex-wrap gap-2">
              <button type="button" onClick={() => scrollToSection("intro")} className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700">Inicio</button>
              <button type="button" onClick={() => scrollToSection("lugar")} className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700">Ubicación</button>
              <button type="button" onClick={() => scrollToSection("amenidades")} className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700">Áreas sociales</button>
              <button type="button" onClick={() => scrollToSection("tipologias")} className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700">Tipologías</button>
              <button type="button" onClick={() => scrollToSection("equipamiento")} className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700">Equipamiento</button>
              <button type="button" onClick={() => scrollToSection("pago")} className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700">Formas de pago</button>
              <button type="button" onClick={() => scrollToSection("disponibilidad")} className="rounded-lg bg-[#9A7B45] px-3 py-1.5 text-xs font-semibold text-white">Disponibilidad</button>
            </div>
          </section>

          <section id="lugar" className="mt-16 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-8">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9A7B45]"><MapPin size={13} /> Ubicación</span>
            <h3 className="font-serif text-3xl font-light">Equipetrol, donde tu departamento se vive y se alquila.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify]">
              Tu unidad queda sobre <strong>{TRIVENTO_CONFIG.address}</strong>. Es la pieza de la ciudad que el proyecto presenta como la más dinámica: movimiento, servicios y gente que busca alquiler. Recibes las llaves en <strong>{TRIVENTO_CONFIG.delivery}</strong>.
            </p>
            <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
              <img
                src="/trivento/drone.jpg"
                alt="Trivento IV en Av. San Martín y Calle A. Ramírez, Equipetrol"
                className="h-72 w-full object-cover"
              />
            </div>
            <a
              href={`https://maps.google.com/?q=${TRIVENTO_CONFIG.lat},${TRIVENTO_CONFIG.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]"
            >
              Abrir en Google Maps <ArrowRight size={14} />
            </a>
          </section>

          <section id="amenidades" className="mt-16 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A7B45]">Áreas sociales</span>
            <h3 className="font-serif text-3xl font-light">El edificio también se vive fuera de tu puerta.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify]">
              Además de tu departamento, el proyecto incluye dos niveles de áreas sociales: vista panorámica, área de reunión, churrasquera, cowork, piscina y lobby. Son los espacios para recibir, trabajar un rato o bajar a la pileta sin salir de Equipetrol. Las fotos son los renders del proyecto.
            </p>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="relative aspect-[16/10]">
                <img src={slide.src} alt={slide.title} className="h-full w-full object-cover" />
                <button type="button" onClick={() => setAmenityIndex((index) => (index + AMENITY_SLIDES.length - 1) % AMENITY_SLIDES.length)} className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white" aria-label="Anterior">
                  <ChevronLeft size={18} />
                </button>
                <button type="button" onClick={() => setAmenityIndex((index) => (index + 1) % AMENITY_SLIDES.length)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white" aria-label="Siguiente">
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="space-y-1 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9A7B45]">{slide.category}</p>
                <h4 className="font-serif text-xl">{slide.title}</h4>
                <p className="text-sm text-stone-600">{slide.description}</p>
              </div>
            </div>
          </section>

          <section id="tipologias" className="mt-16 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A7B45]">Tu departamento</span>
            <h3 className="font-serif text-3xl font-light">Cinco maneras de entrar. Elige la tuya.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify]">
              Cada piso repite la misma planta: tres departamentos a la fachada y dos atrás. Mira el isométrico o el render, compara los metros y baja a disponibilidad para ver el precio de la unidad que sigue libre.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TRIVENTO_MODELS.map((model) => {
                const price = modelMin(model.id);
                const selected = model.id === selectedModelId;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setSelectedModelId(model.id)}
                    className={`rounded-xl border p-4 text-left ${selected ? "border-[#9A7B45] bg-white shadow-md ring-1 ring-[#9A7B45]" : "border-stone-200 bg-white/80"}`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{formatTriventoM2(model.m2Total)} m² · {model.posicion}</p>
                    <h4 className="mt-1 font-serif text-lg">{model.titulo}</h4>
                    <p className="mt-1 text-xs text-stone-500">Depto {formatTriventoM2(model.m2Depto)} m² + balcón {formatTriventoM2(model.m2Balcon)} m²</p>
                    <p className="mt-2 text-sm font-semibold text-[#9A7B45]">
                      {price ? `Desde USD ${formatTriventoUsd(price)}` : "Este modelo ya se colocó"}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9A7B45]">{formatTriventoM2(selectedModel.m2Total)} m² · {selectedModel.posicion}</p>
                  <h4 className="font-serif text-xl">{selectedModel.titulo}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPlanView("2d")} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${planView === "2d" ? "bg-stone-900 text-white" : "border border-stone-200 text-stone-700"}`}>Iso</button>
                  <button type="button" onClick={() => setPlanView("3d")} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${planView === "3d" ? "bg-stone-900 text-white" : "border border-stone-200 text-stone-700"}`}>Render</button>
                  <button type="button" onClick={() => setShowHd(true)} className="rounded-lg bg-[#9A7B45] px-3 py-1.5 text-xs font-semibold text-white">Ver HD</button>
                </div>
              </div>
              <button type="button" onClick={() => setShowHd(true)} className="flex aspect-[16/11] w-full items-center justify-center overflow-hidden rounded-xl border border-stone-100 bg-stone-50 p-3">
                <img src={planImage} alt={`Plano modelo ${selectedModel.codigo}`} className="max-h-full max-w-full object-contain" />
              </button>
              <p className="text-xs text-stone-500">
                {planView === "2d" ? "Así se distribuye tu unidad." : "Así se ve por dentro."} Superficie total {formatTriventoM2(selectedModel.m2Total)} m².
              </p>
            </div>
          </section>

          <section id="equipamiento" className="mt-16 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A7B45]">Equipamiento</span>
            <h3 className="font-serif text-3xl font-light">Tu unidad no llega vacía.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify]">
              Tu departamento incluye climatización, un horno o microondas, y cerramientos de vidrio laminado con perfilería ALVI 60. Llegas a una unidad que ya se puede vivir.
            </p>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="grid md:grid-cols-2">
                <img src={equipment.image} alt={equipment.title} className="h-64 w-full object-cover md:h-full" />
                <div className="space-y-3 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9A7B45]">{equipment.room}</p>
                  <h4 className="font-serif text-2xl">{equipment.title}</h4>
                  <ul className="space-y-2">
                    {equipment.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-stone-600">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setEquipmentIndex((index) => (index + EQUIPMENT.length - 1) % EQUIPMENT.length)} className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs" aria-label="Equipamiento anterior">Anterior</button>
                    <button type="button" onClick={() => setEquipmentIndex((index) => (index + 1) % EQUIPMENT.length)} className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs" aria-label="Equipamiento siguiente">Siguiente</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="constructora" className="mt-16 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-8">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9A7B45]"><Building2 size={13} /> Tu entrega</span>
            <h3 className="font-serif text-3xl font-light">Sabes cuándo entras y en qué dólar se cobra.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify]">
              La decisión se apoya en tres datos publicados: la fecha en que recibes las llaves, las unidades que puedes elegir hoy y la moneda en la que está tu precio.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="font-serif text-xl">Noviembre 2027</p>
                <p className="mt-1 text-xs text-stone-500">La fecha en la que el proyecto entrega tu departamento.</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="font-serif text-xl">25 unidades</p>
                <p className="mt-1 text-xs text-stone-500">Pisos 1 a 5, cinco departamentos por piso. Eliges entre las que siguen libres.</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="font-serif text-xl">T/C BCB</p>
                <p className="mt-1 text-xs text-stone-500">Tu cotización está en dólares, al tipo de cambio del Banco Central.</p>
              </div>
            </div>
          </section>

          <section id="pago" className="mt-16 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A7B45]">Formas de pago</span>
            <h3 className="font-serif text-3xl font-light">Elige cómo asegurar tu unidad.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify]">
              El proyecto publica dos caminos. Al contado congelas la tarifa más baja. A crédito dejas la mitad ahora y la otra mitad cuando recibes la llave en {TRIVENTO_CONFIG.delivery}.
            </p>
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
              <span>Tu metro al contado parte de USD {formatTriventoUsd(minContado)}, en las unidades que siguen libres.</span>
              <button type="button" onClick={refreshInventory} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800" aria-label="Actualizar cuadro">
                <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                {inventoryLabel}
              </button>
            </div>
            <div className="space-y-4">
              <article className="rounded-2xl bg-stone-900 p-5 text-white shadow-lg">
                <span className="rounded-full bg-[#C19A6B] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950">Mayor descuento</span>
                <h4 className="mt-3 font-serif text-2xl">Contado · 100%</h4>
                <p className="mt-2 font-serif text-3xl text-[#E8D5A8]">USD {formatTriventoUsd(minContado)}/m²</p>
                <p className="mt-3 text-sm leading-relaxed text-stone-300">
                  Es la forma de pagar menos por metro. En lo que queda libre va de USD {formatTriventoUsd(minContado)} a USD 1.450 por m². El monto de tu unidad aparece cuando la eliges.
                </p>
              </article>
              <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">Crédito 50 / 50</span>
                <h4 className="mt-3 font-serif text-2xl">50% a la firma · 50% contra entrega</h4>
                <p className="mt-2 font-serif text-3xl text-stone-900">USD {formatTriventoUsd(minCredito)}/m²</p>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  Entras con la mitad a la firma y cancelas la otra mitad al recibir las llaves en {TRIVENTO_CONFIG.delivery}. En las unidades libres va de USD {formatTriventoUsd(minCredito)} a USD 1.650 por m².
                </p>
              </article>
            </div>
            <div className="space-y-2 rounded-xl border border-stone-200 bg-[#FFFDF6] p-4 text-sm text-stone-700">
              <p><strong>Hoy.</strong> Eliges la unidad que sigue libre. El proyecto no publica una seña aparte: ese monto te lo confirma el asesor.</p>
              <p><strong>A la firma.</strong> Si vas al contado, cancelas el 100%. Si vas a crédito, dejas el 50% y aseguras el precio.</p>
              <p><strong>{TRIVENTO_CONFIG.delivery}.</strong> Recibes el departamento. Con crédito pagas el saldo. Al contado ya no te queda nada pendiente.</p>
            </div>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
              Elegir mi departamento <ArrowRight size={14} />
            </button>
          </section>

          <section id="disponibilidad" className="mt-16 scroll-mt-6 space-y-5 border-t border-stone-200/80 pt-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9A7B45]">Disponibilidad</span>
                <h3 className="font-serif text-3xl font-light">Elige la unidad que todavía puedes tomar.</h3>
              </div>
              <button type="button" onClick={refreshInventory} className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold" aria-label="Recargar inventario">
                <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                Actualizar
              </button>
            </div>
            <p className="text-xs text-stone-500">Precios del cuadro oficial del {inventoryLabel}. En verde está lo que puedes reservar. En gris ya se fue, y no mostramos un precio que el proyecto no publicó.</p>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 1 · Modelo</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {TRIVENTO_MODELS.map((model) => {
                  const price = modelMin(model.id);
                  const selected = selectedModelId === model.id;
                  return (
                    <button key={model.id} type="button" onClick={() => chooseModel(model.id)} className={`rounded-xl border p-3 text-left ${selected ? "border-[#9A7B45] bg-white ring-1 ring-[#9A7B45]" : "border-stone-200 bg-white/80"}`}>
                      <p className="text-sm font-bold">{model.titulo}</p>
                      <p className="text-[11px] text-stone-500">{formatTriventoM2(model.m2Total)} m² · {model.posicion}</p>
                      <p className="mt-1 text-xs font-semibold text-[#9A7B45]">{price ? `Desde USD ${formatTriventoUsd(price)}` : "Agotado"}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-stone-500">Paso 2 · Piso</span>
                <span className="text-stone-400">Verde = disponible · Gris = agotado</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 rounded-xl border border-stone-200 bg-white p-2">
                {floorsForModel.map((floor) => {
                  const current = activeUnit?.piso === floor.piso && activeUnit.modelo === selectedModelId;
                  return (
                    <button
                      key={floor.piso}
                      type="button"
                      disabled={!floor.libre}
                      onClick={() => floor.unit && setSelectedCodigo(floor.unit.codigo)}
                      className={`rounded-lg px-1 py-2 text-xs font-semibold ${current ? "bg-stone-900 text-white" : floor.libre ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "cursor-not-allowed bg-stone-100 text-stone-400"}`}
                    >
                      <span className="block">P{floor.piso}</span>
                      <span className="block text-[9px] font-normal">{floor.unit?.codigo}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-900">Paso 3 · Parqueo</p>
              <p className="mt-2">El número de abajo es solo tu departamento. Parqueo y baulera no tienen precio publicado: tu asesor te los confirma aparte, si los quieres sumar.</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 4 · Plan de pago</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => setPaymentPlan("contado")} className={`rounded-xl border p-3 text-left ${paymentPlan === "contado" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                  <p className="text-sm font-bold">100% contado</p>
                  <p className={`text-[11px] ${paymentPlan === "contado" ? "text-[#E8D5A8]" : "text-[#9A7B45]"}`}>La tarifa más baja para entrar</p>
                </button>
                <button type="button" onClick={() => setPaymentPlan("credito")} className={`rounded-xl border p-3 text-left ${paymentPlan === "credito" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                  <p className="text-sm font-bold">Crédito 50 / 50</p>
                  <p className={`text-[11px] ${paymentPlan === "credito" ? "text-stone-300" : "text-stone-500"}`}>50% firma · 50% entrega</p>
                </button>
              </div>
            </div>

            {activeUnit && financials && (
              <div className="space-y-4 rounded-2xl bg-stone-900 p-5 text-white shadow-xl">
                <div className="border-b border-white/10 pb-3 text-xs text-[#E8D5A8]">
                  Unidad {activeUnit.codigo} · Piso {activeUnit.piso} · Modelo {Number(activeUnit.modelo)} · {activeUnit.posicion} · {formatTriventoM2(activeUnit.m2Total)} m²
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <div className="flex min-h-[28px] items-end"><p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Inversión total</p></div>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span><span className="mt-0.5 block">{formatTriventoUsd(financials.total)}</span></p>
                    <p className="mt-1 text-[10px] text-stone-400">USD {formatTriventoUsd(financials.rate)}/m²</p>
                  </div>
                  <div>
                    <div className="flex min-h-[28px] items-end"><p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Cuota inicial ({paymentPlan === "contado" ? "100" : "50"}%)</p></div>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight text-emerald-400"><span className="block font-mono text-xs font-normal text-emerald-500/80">USD</span><span className="mt-0.5 block">{formatTriventoUsd(financials.initial)}</span></p>
                    <p className="mt-1 text-[10px] text-stone-400">A la firma del contrato</p>
                  </div>
                  <div>
                    <div className="flex min-h-[28px] items-end"><p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Saldo contra entrega</p></div>
                    {paymentPlan === "contado" ? (
                      <>
                        <p className="mt-1 font-serif text-2xl font-bold leading-tight text-stone-500"><span className="block font-mono text-xs font-normal text-stone-500">USD</span><span className="mt-0.5 block">—</span></p>
                        <p className="mt-1 text-[10px] text-stone-400">Sin saldo pendiente</p>
                      </>
                    ) : (
                      <>
                        <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span><span className="mt-0.5 block">{formatTriventoUsd(financials.balance)}</span></p>
                        <p className="mt-1 text-[10px] text-stone-400">En {TRIVENTO_CONFIG.delivery}</p>
                      </>
                    )}
                  </div>
                </div>
                <button type="button" onClick={contactWhatsApp} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
                  <MessageCircle size={16} />
                  Quiero la unidad {activeUnit.codigo} del piso {activeUnit.piso}
                </button>
              </div>
            )}
          </section>

          <section id="cierre" className="mt-16 scroll-mt-6 space-y-4 border-t border-stone-200/80 pb-16 pt-8">
            <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-600" />
                <h3 className="font-serif text-2xl">Asegura tu lugar en Equipetrol.</h3>
              </div>
              <p className="text-sm leading-relaxed text-stone-600 [text-align:justify]">
                {placed} de {units.length} unidades ya tienen dueño. Quedan {libres.length}, desde USD {formatTriventoUsd(minTicket)} al contado, con entrega en {TRIVENTO_CONFIG.delivery}. Los renders te muestran el proyecto. El número que reservas es el del cuadro del {inventoryLabel}. La seña te la confirma el asesor, en la misma conversación.
              </p>
              <button type="button" onClick={contactWhatsApp} className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
                Escribir y reservar mi unidad <ArrowRight size={14} />
              </button>
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {activeSection !== "cierre" && (
          <motion.div
            initial={{ y: 72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 72, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-3 border-t border-stone-200 bg-[#F7F5F0]/95 px-4 py-3 backdrop-blur lg:left-[44%]"
          >
            <p className="truncate text-xs text-stone-700">
              Desde USD {formatTriventoUsd(minTicket)} · Entrega {TRIVENTO_CONFIG.delivery}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={handleShare} className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wider">
                {shareFeedback ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                Compartir
              </button>
              <button type="button" onClick={() => scrollToSection("disponibilidad")} className="rounded-lg bg-[#1C1917] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white">
                Elegir unidad
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showFloatingNav && (
        <div className="fixed bottom-24 left-4 z-[115] lg:left-[calc(44%+1rem)]">
          <button type="button" onClick={() => setShowSectionMenu((open) => !open)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-stone-900 text-[#C19A6B] shadow-2xl" aria-label="Secciones">
            {showSectionMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
          <AnimatePresence>
            {showSectionMenu && (
              <>
                <button type="button" className="fixed inset-0 z-[114] bg-black/20" aria-label="Cerrar menú" onClick={() => setShowSectionMenu(false)} />
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute bottom-14 left-0 z-[115] w-64 space-y-1 rounded-2xl border border-stone-200 bg-white/95 p-2.5 text-xs shadow-2xl backdrop-blur">
                  {SECTIONS.map((section) => (
                    <button key={section.id} type="button" onClick={() => scrollToSection(section.id)} className={`w-full rounded-lg px-3 py-2 text-left font-medium ${activeSection === section.id ? "bg-[#9A7B45] text-white" : "text-stone-700"}`}>
                      {section.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showHd && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 p-4">
            <div className="w-full max-w-4xl space-y-3 rounded-2xl border border-white/10 bg-stone-900 p-4">
              <div className="flex items-center justify-between text-white">
                <h4 className="font-serif text-lg">{selectedModel.titulo} · {planView === "2d" ? "Isométrico" : "Render"}</h4>
                <button type="button" onClick={() => setShowHd(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10" aria-label="Cerrar plano">
                  <X size={16} />
                </button>
              </div>
              <img src={planImage} alt="" className="max-h-[75vh] w-full object-contain" />
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
