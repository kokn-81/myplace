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
    title: "Piscina mirador",
    description: "Piscina en el último nivel, con solárium amoblado: reposeras, sombrillas y mobiliario exterior. Sonorización Bose.",
  },
  {
    src: "/beton_brut/social/churrasquera.jpg",
    category: "Terraza",
    title: "Churrasqueras",
    description: "Dos churrasqueras amobladas, equipadas con refrigeración y sonorización Bose.",
  },
  {
    src: "/beton_brut/social/sauna.jpg",
    category: "Bienestar",
    title: "Sauna",
    description: "Sauna seco equipado, dentro del área social.",
  },
  {
    src: "/beton_brut/social/karaoke.jpg",
    category: "Área social",
    title: "Sala de TV y karaoke",
    description: "Sala amoblada, con pantalla de 65\" y sistema de audio Bose con karaoke.",
  },
  {
    src: "/beton_brut/social/cowork.jpg",
    category: "Área social",
    title: "Cowork",
    description: "Espacio de trabajo amoblado, con 8 estaciones, mesa colaborativa y mesa de diseño.",
  },
  {
    src: "/beton_brut/social/chef.jpg",
    category: "Área social",
    title: "Bar y cocina de chef",
    description: "Isla central con amoblamiento alto y bajo, encimera de inducción Cata de 90 cm, horno Cata de 90 litros, cervecera, vinera y sonido Bose.",
  },
  {
    src: "/beton_brut/lobby.jpg",
    category: "Ingreso",
    title: "Recibidor en doble altura",
    description: "El recibidor del área social entra en doble altura. La luz natural baja por los halls de distribución de todos los niveles.",
  },
];

const EQUIPAMIENTO = [
  {
    id: "cocina",
    room: "Cocina",
    title: "Cocina equipada",
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
    title: "Baños",
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
    title: "El departamento",
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
    title: "Acceso y servicios",
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
  const [zoom, setZoom] = useState<{ src: string; title: string; caption: string } | null>(null);

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
      { root: window.matchMedia("(min-width: 768px)").matches ? root : null, rootMargin: "-12% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] }
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

  const onModelSwipe = (event: TouchEvent) => {
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
    <div className="fixed inset-0 z-[100] flex flex-col overflow-y-auto overscroll-y-contain bg-[#f7f5f0] font-sans text-stone-900 md:flex-row md:overflow-hidden">
      <div className="fixed right-4 top-4 z-[120] flex items-center gap-2 md:right-7 md:top-7">
        <a href={BETON_BRUT_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-[#9a7b45] shadow-xl" aria-label="Descargar Brochure">
          <Download size={18} />
        </a>
        <button type="button" onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-800 shadow-xl" aria-label="Compartir">
          {shareFeedback ? <Check size={18} className="text-emerald-600" /> : <Share2 size={18} />}
        </button>
        {onClose && (
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white/95 text-stone-700 shadow-xl" aria-label="Cerrar">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="relative min-h-[480px] shrink-0 bg-stone-950 md:h-screen md:min-h-0 md:w-[44%]">
        <img src="/beton_brut/fachada.jpg" alt="Fachada de Béton Brut II sobre la calle 8" className="absolute inset-0 h-full w-full object-cover brightness-[0.82]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30" />
        <div className="absolute bottom-6 left-6 right-6 z-10 text-white md:bottom-10 md:left-10 md:right-10">
          <img src="/beton_brut/logo-blanco.png" alt="Béton Brut II" className="mb-3 h-10 w-auto" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8d5a8]/40 bg-[#9a7b45]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#e8d5a8]">
            <Sparkles size={12} />
            Preventa · 40 departamentos · Equipetrol
          </span>
          <h1 className="mt-2.5 font-serif text-4xl font-light tracking-wide text-white sm:text-5xl md:text-6xl">Béton Brut II</h1>
          <p className="mt-1 max-w-sm text-xs text-stone-300 md:text-sm">Calle 8 · Equipetrol, entre 2° y 3° anillo</p>
          <div className="mt-4 grid max-w-sm grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-black/40 p-3 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-wider text-stone-400">Entrega</p>
              <p className="mt-0.5 text-xs font-semibold text-white md:text-sm">{BETON_BRUT_CONFIG.delivery}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-3 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-wider text-stone-400">Lista de precios</p>
              <p className="mt-0.5 text-xs font-semibold text-white md:text-sm">{BETON_BRUT_CONFIG.priceListLabel}</p>
            </div>
          </div>
          <div className="mt-3 max-w-sm rounded-xl border border-white/15 bg-black/55 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[11px] text-stone-300">
              <span className="font-semibold text-[#e8d5a8]">Contado, lista oficial</span>
              <span>{freeCount} libres de {BETON_UNITS.length}</span>
            </div>
            <div className="mt-2.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between"><span className="text-stone-300">1 dormitorio</span><span className="font-serif font-bold">Desde USD {formatBetonUsd(from1 || 0)}</span></div>
              <div className="flex items-center justify-between"><span className="text-stone-300">2 dormitorios</span><span className="font-serif font-bold">Desde USD {formatBetonUsd(from2 || 0)}</span></div>
              <div className="flex items-center justify-between"><span className="text-stone-300">3 dormitorios</span><span className="font-serif font-bold">Desde USD {formatBetonUsd(from3 || 0)}</span></div>
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
                Hormigón, metal y vidrio
              </span>
              <h2 className="font-serif text-3xl font-light leading-tight text-[#1C1917] md:text-5xl">
                Cuarenta departamentos. <span className="font-normal italic">Nada más.</span>
              </h2>
              <p className="pt-2 text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word] md:text-base">
                Béton Brut II está en Equipetrol, sobre la calle 8, entre el 2° y el 3° anillo. El edificio muestra el hormigón, el metal y el vidrio tal como son. Hay departamentos de 1, 2 y 3 dormitorios. La entrega publicada es diciembre de 2028.
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Equipetrol, sobre la calle que ya recorres.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              El mapa del brochure sitúa el proyecto en Equipetrol. Alrededor marca la Av. San Martín, la Av. La Salle, la Parroquia Sagrado Corazón, el Hotel Los Tajibos y el eje comercial de la zona. La dirección publicada es calle 8. El brochure no da un número de puerta.
            </p>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <img src="/beton_brut/ubicacion.jpg" alt="Mapa de Béton Brut II en Equipetrol, entre el 2° y el 3° anillo" className="block h-auto w-full" />
            </div>
            <a href={`https://maps.google.com/?q=${BETON_BRUT_CONFIG.lat},${BETON_BRUT_CONFIG.lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              Abrir Equipetrol en Google Maps <ArrowRight size={14} />
            </a>
          </section>

          <section id="amenidades" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Áreas sociales</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Arriba, la terraza se vive en compañía.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              El área social está amoblada y equipada: piscina mirador, dos churrasqueras, sauna, sala de TV y karaoke, cowork, bar con cocina de chef, y lavado y secado.
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

          <section id="tipologias" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><Layers size={13} /> Tipologías</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Elige el metraje en el que te ves.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Toca la imagen para abrir la ficha: el plano, la superficie y la posición en el piso. Los pisos 1 a 5 repiten seis departamentos. Los pisos 6 y 7 tienen cinco, con otra planta.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ROOM_FILTERS.map((filter) => (
                <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-2xl border p-3 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white shadow-md ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white/80"}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{filter.label}</p>
                  <p className="mt-1 text-[11px] text-stone-500">{roomCount[filter.id]} plantas</p>
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="flex items-start justify-between gap-3 border-b border-stone-100 px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{currentModel.name}</p>
                  <h4 className="font-serif text-xl text-stone-900">{formatBetonM2(currentModel.areaM2)} m²</h4>
                  <p className="text-xs text-stone-500">{currentModel.where}</p>
                </div>
                <p className="pt-1 text-[11px] text-stone-400">{slideIndex + 1}/{slides.length}</p>
              </div>
              <div
                className="relative bg-white"
                onTouchStart={(event) => { touchX.current = event.changedTouches[0].clientX; }}
                onTouchEnd={(event) => {
                  if (touchX.current == null || slides.length < 2) return;
                  const dx = event.changedTouches[0].clientX - touchX.current;
                  if (dx > 40) shiftModel(-1);
                  if (dx < -40) shiftModel(1);
                  touchX.current = null;
                }}
              >
                <button type="button" onClick={() => setZoom({ src: currentModel.full, title: currentModel.name, caption: `${formatBetonM2(currentModel.areaM2)} m² · ${currentModel.detail}` })} className="flex min-h-[320px] w-full cursor-zoom-in items-center justify-center px-6 py-6" aria-label={`Ver ficha de ${currentModel.name}`}>
                  <img src={currentModel.preview} alt={`${currentModel.name}, solo el departamento`} className="mx-auto max-h-[460px] w-auto max-w-full object-contain" />
                </button>
                {slides.length > 1 && (
                  <>
                    <button type="button" onClick={() => shiftModel(-1)} className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo anterior"><ChevronLeft size={22} /></button>
                    <button type="button" onClick={() => shiftModel(1)} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo siguiente"><ChevronRight size={22} /></button>
                  </>
                )}
              </div>
              <div className="space-y-1 border-t border-stone-100 px-4 py-3 text-center">
                <p className="text-xs text-stone-600">{currentModel.detail}</p>
                {currentModel.areaNote ? <p className="text-[11px] text-stone-500">{currentModel.areaNote}</p> : null}
                <p className="text-[11px] text-stone-500">Desliza para el siguiente. Toca la imagen para ver la ficha completa.</p>
              </div>
            </div>
          </section>

          <section id="equipamiento" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]"><CheckCircle2 size={13} /> Equipamiento</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Llegas y la cocina ya está lista.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Cocina, baños, el departamento y el acceso, con los acabados que nombra la especificación técnica. La altura libre es 2,65 m.
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Tres firmas detrás de tu edificio.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Tres marcas firman el proyecto: Beton Fortia S.R.L., Eduardo Roca y Mediterráneo Constructora.
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Contado o en cuotas. Eliges tú.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Contado es la tarifa más baja. El plan 30-60 reparte el saldo hasta la entrega en {BETON_BRUT_CONFIG.delivery}. El monto de tu unidad aparece cuando la eliges.
            </p>
            <article className="rounded-2xl bg-stone-900 p-5 text-white shadow-lg">
              <span className="rounded-full bg-[#C19A6B] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950">Ventaja comercial</span>
              <h4 className="mt-3 font-serif text-2xl">Contado</h4>
              <p className="mt-2 font-serif text-3xl text-[#E8D5A8]">USD {formatBetonUsd(BETON_BRUT_CONFIG.cashPerM2)}/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-300">100% a la firma del contrato. Es la tarifa más baja de la lista del {BETON_BRUT_CONFIG.priceListLabel}.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">Plan 30-60</span>
              <h4 className="mt-3 font-serif text-2xl">30% inicial · 40% contra entrega</h4>
              <p className="mt-2 font-serif text-3xl text-stone-900">USD {formatBetonUsd(BETON_BRUT_CONFIG.planPerM2)}/m²</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">30% a la firma. Cuotas mensuales hasta completar el 60%, en un plazo de hasta 24 meses. El 40% restante se paga contra entrega, en {BETON_BRUT_CONFIG.delivery}.</p>
            </article>
            <div className="space-y-2 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
              <p>Parqueo vehicular: USD {formatBetonUsd(BETON_BRUT_CONFIG.parkingCarUsd)}. Parqueo de moto: USD {formatBetonUsd(BETON_BRUT_CONFIG.parkingMotoUsd)}. Son adicionales y no entran en el precio por metro.</p>
              <p>El subsuelo publica 15 bauleras. La lista no les pone precio, así que no se cotizan acá.</p>
            </div>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
              Elegir mi departamento <ArrowRight size={14} />
            </button>
          </section>

          <section id="disponibilidad" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Disponibilidad</span>
              <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Encuentra la unidad y apártala.</h3>
            </div>
            <p className="text-xs text-stone-500">Precios de la lista oficial del {BETON_BRUT_CONFIG.priceListLabel}. En verde está lo que puedes tomar. En gris ya se vendió y no mostramos un precio que la lista no publicó.</p>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 1 · Tipología</p>
              <div className="grid grid-cols-3 gap-2">
                {ROOM_FILTERS.map((filter) => (
                  <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-xl border p-3 text-left ${rooms === filter.id ? "border-[#9a7b45] bg-white ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white"}`}>
                    <p className="text-sm font-bold">{filter.label}</p>
                    <p className="text-[11px] text-[#9a7b45]">Desde USD {formatBetonUsd(minContadoForRooms(filter.id) || 0)}</p>
                  </button>
                ))}
              </div>
              <div
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
                onTouchStart={(event) => { modelTouch.current = event.changedTouches[0].clientX; }}
                onTouchEnd={onModelSwipe}
              >
                <div className="flex items-center gap-1 border-b border-stone-100 px-2 py-3">
                  <button type="button" onClick={() => shiftModel(-1)} disabled={slides.length < 2} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-800 disabled:opacity-30" aria-label="Modelo anterior">
                    <ChevronLeft size={22} />
                  </button>
                  <div className="min-w-0 flex-1 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{slideIndex + 1} / {slides.length}</p>
                    <p className="font-serif text-lg text-stone-900">{currentModel.name}</p>
                    <p className="text-xs text-stone-500">{formatBetonM2(currentModel.areaM2)} m² · {currentModel.where}</p>
                    <p className="mt-1 text-sm font-semibold text-[#9a7b45]">
                      {(() => {
                        const freeUnits = unitsForModel(currentModel.id).filter((unit) => unit.precioContado != null);
                        if (freeUnits.length === 0) return "Vendido";
                        const price = Math.min(...freeUnits.map((unit) => unit.precioContado as number));
                        return `Desde USD ${formatBetonUsd(price)}`;
                      })()}
                    </p>
                  </div>
                  <button type="button" onClick={() => shiftModel(1)} disabled={slides.length < 2} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-800 disabled:opacity-30" aria-label="Modelo siguiente">
                    <ChevronRight size={22} />
                  </button>
                </div>
                <button type="button" onClick={() => setZoom({ src: currentModel.full, title: currentModel.name, caption: `${formatBetonM2(currentModel.areaM2)} m² · ${currentModel.detail}` })} className="flex w-full cursor-zoom-in items-center justify-center bg-[#f7f5f0] px-4 py-4" aria-label={`Ver ficha de ${currentModel.name}`}>
                  <img src={currentModel.preview} alt={`${currentModel.name}, el departamento`} className="mx-auto max-h-[280px] w-auto max-w-full object-contain" />
                </button>
                <p className="px-4 py-3 text-center text-xs text-stone-600">{currentModel.detail}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold uppercase tracking-wider text-stone-500">Paso 2 · Piso</span>
                <button type="button" onClick={() => setZoom({ src: "/beton_brut/esquema.jpg", title: "Distribución del edificio", caption: "Subsuelo, planta baja, pisos 1 a 7 y área social." })} className="font-semibold text-[#816127]">
                  Ver distribución de pisos
                </button>
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
            <h3 className="font-serif text-3xl font-light text-[#1C1917]">Da el paso y conversemos tu unidad.</h3>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-600 [text-align:justify]">
              {soldCount} de {BETON_UNITS.length} unidades figuran vendidas al {BETON_BRUT_CONFIG.priceListLabel}. Quedan {freeCount}, desde USD {formatBetonUsd(fromAny)} al contado, con entrega en {BETON_BRUT_CONFIG.delivery}. La seña no está publicada: el asesor la confirma en la conversación.
            </p>
            <button type="button" onClick={contactWhatsApp} className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              Escribir y reservar mi unidad <ArrowRight size={14} />
            </button>
          </section>
        </div>
      </div>

      {activeSection !== "cierre" && (
        <div className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-3 border-t border-stone-200 bg-[#f7f5f0]/95 px-5 py-3 backdrop-blur-md md:left-[44%]">
          <div>
            <p className="text-xs text-stone-700">Desde USD {formatBetonUsd(fromAny)} · {BETON_BRUT_CONFIG.delivery}</p>
            <p className="hidden text-[10px] font-medium text-[#9a7b45] sm:block">La lista no publica una seña</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={handleShare} className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wider">
              {shareFeedback ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              Compartir
            </button>
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="rounded-lg bg-[#1C1917] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white">
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
          <div className="fixed inset-0 z-[130] overflow-y-auto bg-black/90 p-4" onClick={() => setZoom(null)}>
            <div className="mx-auto my-4 w-full max-w-3xl rounded-2xl border border-white/10 bg-stone-900 p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2 text-white">
                <div>
                  <h4 className="font-serif text-lg font-bold">{zoom.title}</h4>
                  <p className="text-xs text-stone-400">{zoom.caption}</p>
                </div>
                <button type="button" onClick={() => setZoom(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white" aria-label="Cerrar vista">
                  <X size={16} />
                </button>
              </div>
              <img src={zoom.src} alt={zoom.title} className="mx-auto w-full bg-white" />
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
