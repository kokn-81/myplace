import { useInventory, gardenZenInventory } from "../projectInventory";
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
  Leaf,
  MapPin,
  Menu,
  MessageCircle,
  Share2,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import {
  GARDEN_ZEN_BASELINE_UNITS,
  GARDEN_ZEN_CONFIG,
  GARDEN_ZEN_PARKINGS,
  GardenZenParking,
  GardenZenUnit,
  PLANO_MODELO_MAP,
  fetchGardenZenLiveUnits,
  formatGardenZenUsd,
} from "../gardenZenInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

function minParking(kind: GardenZenParking["kind"]) {
  const prices = GARDEN_ZEN_PARKINGS.filter((item) => item.kind === kind && item.status === "disponible").map((item) => item.price);
  return prices.length ? Math.min(...prices) : null;
}

const PARKING_TECHADO = minParking("techado");
const PARKING_MOTO = minParking("moto");
const PARKING_BAULERA = minParking("baulera");

const AMENITY_SLIDES = [
  {
    src: "/garden_zen/amenities/amenity_piscina.jpg",
    category: "Rooftop Piso 17",
    title: "Piscina Izumi y deck panorámico",
    description: "Ubicada en el rooftop del piso 17 con vistas abiertas hacia Equipetrol Norte. Un espacio con solárium y reposeras.",
  },
  {
    src: "/garden_zen/amenities/amenity_sauna.jpg",
    category: "Wellness",
    title: "Sauna seco Ki y sauna vapor Mizu",
    description: "Circuito de sauna seco y sauna de vapor para relajarte sin salir del edificio.",
  },
  {
    src: "/garden_zen/amenities/amenity_gimnasio.jpg",
    category: "Fitness",
    title: "Gimnasio tecnológico Kinō",
    description: "Área de fitness climatizada con máquinas de cardio y fuerza, y ventanales de piso a techo.",
  },
  {
    src: "/garden_zen/amenities/amenity_cowork.jpg",
    category: "Trabajo",
    title: "Co-Work Nōka",
    description: "Espacio de trabajo climatizado con fibra óptica, luz natural y puestos para trabajar.",
  },
  {
    src: "/garden_zen/amenities/amenity_salon.jpg",
    category: "Eventos",
    title: "Salón Haku",
    description: "Ambiente social climatizado con barra, cocina de apoyo y lugar para celebraciones privadas.",
  },
  {
    src: "/garden_zen/amenities/amenity_churrasquera_enso.jpg",
    category: "Parrilla",
    title: "Churrasquera Ensō",
    description: "Parrilla techada con mesón y comedor al aire libre.",
  },
  {
    src: "/garden_zen/amenities/amenity_churrasquera_koen.jpg",
    category: "Parrilla",
    title: "Churrasquera Kōen y lounge",
    description: "Segunda parrilla con living y vista al horizonte de Santa Cruz.",
  },
  {
    src: "/garden_zen/amenities/amenity_calistenia_petspa.jpg",
    category: "Aire libre",
    title: "Calistenia y pet spa",
    description: "Zona de entrenamiento al aire libre y estación de baño para mascotas.",
  },
  {
    src: "/garden_zen/amenities/amenity_lobby.jpg",
    category: "Acceso",
    title: "Lobby Zen",
    description: "Recepción de doble altura con control de acceso digital.",
  },
];

const EQUIPMENT_SECTIONS = [
  {
    id: "cocina",
    room: "Cocina y estar",
    title: "Cocina y sala de estar",
    image: "/garden_zen/preview_page_42.jpg",
    items: [
      "Mesón importado de cuarzo blanco",
      "Cocina encimera y campana extractora de acero inoxidable",
      "Bacha y grifería monocomando",
      "Porcelanato rectificado",
      "Aire acondicionado instalado",
      "Iluminación LED en muebles",
      "Chapa de ingreso digital",
      "Calefón instalado",
      "Lavandería con tomas de agua y desagüe",
    ],
  },
  {
    id: "dormitorio",
    room: "Dormitorio",
    title: "Dormitorio principal",
    image: "/garden_zen/preview_page_43.jpg",
    items: [
      "Ropero de melamina",
      "Walking closet con divisiones",
      "Porcelanato de alto tránsito",
      "Aire acondicionado instalado",
      "Ventanales con vidrio laminado",
      "Iluminación y tomas USB",
    ],
  },
  {
    id: "bano",
    room: "Baño",
    title: "Baños completos",
    image: "/garden_zen/amenities/amenity_sauna.jpg",
    items: [
      "Mesón de piedra sinterizada",
      "Paño fijo de vidrio templado en la ducha",
      "Grifería monocomando",
      "Inodoro de doble descarga",
      "Mueble suspendido",
      "Bacha embutida y espejo",
      "Extractor de aire",
      "Porcelanato en piso y paredes",
    ],
  },
];

type GardenRooms = "mono" | "1" | "2" | "3";
type GardenAddon = "none" | "techado" | "moto";
type GardenPlan = "contado" | "plan70" | "plan30";

type GardenModel = {
  id: string;
  rooms: GardenRooms;
  name: string;
  plan: string;
  match: (unit: GardenZenUnit) => boolean;
};

const GARDEN_MODELS: GardenModel[] = [
  { id: "MP", rooms: "mono", name: "Monoambiente MP", plan: PLANO_MODELO_MAP.MP, match: (unit) => unit.modelo === "MP" },
  { id: "M1", rooms: "mono", name: "Monoambiente M1", plan: PLANO_MODELO_MAP.M1, match: (unit) => unit.modelo === "M1" },
  { id: "ML", rooms: "mono", name: "Monoambiente ML", plan: PLANO_MODELO_MAP.ML, match: (unit) => unit.modelo === "ML" },
  { id: "B1", rooms: "1", name: "1 dormitorio B1", plan: PLANO_MODELO_MAP.B1, match: (unit) => unit.modelo === "B1" },
  { id: "I1", rooms: "1", name: "1 dormitorio I1", plan: PLANO_MODELO_MAP.I1, match: (unit) => unit.modelo === "I1" },
  { id: "D2", rooms: "2", name: "2 dormitorios D2", plan: PLANO_MODELO_MAP.D2, match: (unit) => unit.modelo === "D2" },
  { id: "E2", rooms: "2", name: "2 dormitorios E2", plan: PLANO_MODELO_MAP.E2, match: (unit) => unit.modelo === "E2" },
  { id: "B3", rooms: "3", name: "3 dormitorios B3", plan: PLANO_MODELO_MAP.B3, match: (unit) => unit.modelo === "B3" },
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

const ROOM_FILTERS: { id: GardenRooms; label: string }[] = [
  { id: "mono", label: "Monoambiente" },
  { id: "1", label: "1 dormitorio" },
  { id: "2", label: "2 dormitorios" },
  { id: "3", label: "3 dormitorios" },
];

type ModelZoom = {
  view: "depto" | "planta";
  title: string;
  caption: string;
  src: string;
};

function formatM2(value: number) {
  return value.toLocaleString("es-BO", { maximumFractionDigits: 1 });
}

function unitKey(unit: GardenZenUnit) {
  return `${unit.floor}-${unit.unitNumber}`;
}

function unitsForModel(list: GardenZenUnit[], model: GardenModel) {
  return list
    .filter(model.match)
    .slice()
    .sort((a, b) => a.floor - b.floor || a.unitNumber.localeCompare(b.unitNumber, "es", { numeric: true }));
}

function firstFreeKey(modelId: string, list: GardenZenUnit[]) {
  const model = GARDEN_MODELS.find((item) => item.id === modelId) || GARDEN_MODELS[0];
  const group = unitsForModel(list, model);
  const free = group.find((unit) => unit.status === "disponible") || group[0];
  return free ? unitKey(free) : "";
}

function minCash(list: GardenZenUnit[], match: (unit: GardenZenUnit) => boolean) {
  const free = list.filter((unit) => unit.status === "disponible" && unit.cashTotal > 0 && match(unit));
  if (free.length === 0) return null;
  return Math.min(...free.map((unit) => unit.cashTotal));
}

function coverSpan(values: number[]) {
  const sizes = values.filter((value) => value > 0);
  if (sizes.length === 0) return "";
  const low = Math.round(Math.min(...sizes));
  const high = Math.round(Math.max(...sizes));
  return low === high ? `${low} m²` : `${low} a ${high} m²`;
}

function areaLabel(list: GardenZenUnit[], model: GardenModel) {
  const areas = unitsForModel(list, model).map((unit) => unit.areaM2).filter((area) => area > 0);
  if (areas.length === 0) return "";
  const min = Math.min(...areas);
  const max = Math.max(...areas);
  return min === max ? `${formatM2(min)} m²` : `${formatM2(min)} a ${formatM2(max)} m²`;
}

function ModelFrame({
  model,
  area,
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
  model: GardenModel;
  area: string;
  index: number;
  total: number;
  price?: string;
  frameClass: string;
  onPrev: () => void;
  onNext: () => void;
  onOpen: () => void;
  onTouchStart: (event: TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: (event: TouchEvent<HTMLDivElement>) => void;
}) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm ${frameClass}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-100 px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-[#7a3218]">{model.name}</p>
          <p className="truncate text-xs text-stone-600">{area}</p>
          {price ? <p className="mt-0.5 text-sm font-semibold text-[#7a3218]">{price}</p> : null}
        </div>
        <p className="min-w-[4.25rem] shrink-0 rounded-full border border-[#7a3218]/40 bg-[#f8f1e7] px-3 py-1.5 text-center text-base font-bold leading-none tabular-nums text-[#5c2414] shadow-sm sm:text-lg" title={`Modelo ${index + 1} de ${total}`}>{index + 1}/{total}</p>
      </div>
      <div className="relative min-h-0 flex-1 bg-white">
        <button type="button" onClick={onOpen} className="absolute inset-0 flex items-center justify-center p-2" aria-label={`Ver planta ${model.name}`}>
          <img src={model.plan} alt={`Planta ${model.name}`} className="max-h-full max-w-full object-contain" />
        </button>
        {total > 1 && (
          <>
            <button type="button" onClick={onPrev} className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo anterior"><ChevronLeft size={22} /></button>
            <button type="button" onClick={onNext} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo siguiente"><ChevronRight size={22} /></button>
          </>
        )}
      </div>
      <button type="button" onClick={onOpen} className="flex h-14 shrink-0 items-center gap-3 border-t border-stone-100 bg-[#f8f1e7] px-3 text-left">
        <img src={model.plan} alt="" className="h-10 w-14 shrink-0 bg-white object-contain" />
        <span className="min-w-0 text-xs leading-snug text-stone-600">Toca la planta para verla completa.</span>
      </button>
    </div>
  );
}

function quoteGardenUnit(unit: GardenZenUnit, plan: GardenPlan, addon: GardenAddon) {
  let total = unit.cashTotal;
  let initial = unit.cashTotal;
  let balance = 0;
  let rate = unit.cashPerM2;
  if (plan === "plan70") {
    total = unit.initial70Total;
    initial = unit.cuotaInicial70;
    balance = unit.initial70Total - unit.cuotaInicial70;
    rate = unit.initial70PerM2;
  } else if (plan === "plan30") {
    total = unit.initial30Total;
    initial = unit.cuotaInicial30;
    balance = unit.initial30Total - unit.cuotaInicial30;
    rate = unit.initial30PerM2;
  }
  const parking = addon === "techado" ? PARKING_TECHADO || 0 : addon === "moto" ? PARKING_MOTO || 0 : 0;
  const parkingInitial = plan === "contado" ? parking : plan === "plan70" ? Math.round(parking * 0.7) : Math.round(parking * 0.3);
  return {
    total: total + parking,
    initial: initial + parkingInitial,
    balance: balance + (parking - parkingInitial),
    rate,
    parking,
  };
}

export default function GardenZenLanding({ property, onClose }: Props) {
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const introNavRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const modelTouch = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState("intro");
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [amenityIndex, setAmenityIndex] = useState(0);
  const [units, setUnits] = useInventory(gardenZenInventory);
  const [rooms, setRooms] = useState<GardenRooms>("mono");
  const [modelIndex, setModelIndex] = useState(0);
  const [selectedModelId, setSelectedModelId] = useState(GARDEN_MODELS[0].id);
  const [selectedKey, setSelectedKey] = useState(() => firstFreeKey(GARDEN_MODELS[0].id, GARDEN_ZEN_BASELINE_UNITS));
  const [addon, setAddon] = useState<GardenAddon>("none");
  const [paymentPlan, setPaymentPlan] = useState<GardenPlan>("contado");
  const [zoom, setZoom] = useState<ModelZoom | null>(null);

  useEffect(() => {
    fetchGardenZenLiveUnits().then((res) => {
      if (res && res.length > 0) setUnits(res);
    });
  }, []);

  const availableUnits = useMemo(() => units.filter((unit) => unit.status === "disponible"), [units]);
  const soldCount = units.filter((unit) => unit.status === "vendido").length;
  const reservedCount = units.filter((unit) => unit.status === "reservado").length;
  const freeCount = availableUnits.length;
  const ratePool = availableUnits;
  const cashRates = ratePool.map((unit) => unit.cashPerM2).filter((rate) => rate > 0);
  const plan70Rates = ratePool.map((unit) => unit.initial70PerM2).filter((rate) => rate > 0);
  const plan30Rates = ratePool.map((unit) => unit.initial30PerM2).filter((rate) => rate > 0);
  const minCashPerM2 = cashRates.length ? Math.min(...cashRates) : null;
  const minPlan70PerM2 = plan70Rates.length ? Math.min(...plan70Rates) : null;
  const minPlan30PerM2 = plan30Rates.length ? Math.min(...plan30Rates) : null;
  const fromAny = minCash(units, () => true);
  const fromMono = minCash(units, (unit) => unit.rooms === 0);
  const from1 = minCash(units, (unit) => unit.rooms === 1);
  const from2 = minCash(units, (unit) => unit.rooms === 2);
  const from3 = minCash(units, (unit) => unit.rooms === 3);

  const slides = GARDEN_MODELS.filter((model) => model.rooms === rooms);
  const slideIndex = slides.length ? ((modelIndex % slides.length) + slides.length) % slides.length : 0;
  const currentModel = slides[slideIndex] || GARDEN_MODELS[0];
  const selectedModel = GARDEN_MODELS.find((model) => model.id === selectedModelId) || currentModel;
  const floors = unitsForModel(units, selectedModel);
  const activeUnit = floors.find((unit) => unitKey(unit) === selectedKey) || null;
  const quote = activeUnit && activeUnit.status === "disponible" && activeUnit.cashTotal > 0 ? quoteGardenUnit(activeUnit, paymentPlan, addon) : null;
  const selectedCash = activeUnit && activeUnit.status === "disponible" && activeUnit.cashTotal > 0 ? activeUnit.cashTotal : null;
  const amenity = AMENITY_SLIDES[amenityIndex];

  const roomCount = useMemo(() => {
    return {
      mono: GARDEN_MODELS.filter((model) => model.rooms === "mono").length,
      "1": GARDEN_MODELS.filter((model) => model.rooms === "1").length,
      "2": GARDEN_MODELS.filter((model) => model.rooms === "2").length,
      "3": GARDEN_MODELS.filter((model) => model.rooms === "3").length,
    };
  }, []);

  useEffect(() => {
    const model = GARDEN_MODELS.find((item) => item.id === selectedModelId);
    if (!model) return;
    const group = unitsForModel(units, model);
    if (group.some((unit) => unitKey(unit) === selectedKey)) return;
    const free = group.find((unit) => unit.status === "disponible") || group[0];
    if (free) setSelectedKey(unitKey(free));
  }, [units, selectedModelId, selectedKey]);

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

  const chooseModel = (model: GardenModel, list: GardenZenUnit[] = units) => {
    setSelectedModelId(model.id);
    setRooms(model.rooms);
    const group = GARDEN_MODELS.filter((item) => item.rooms === model.rooms);
    const index = group.findIndex((item) => item.id === model.id);
    if (index >= 0) setModelIndex(index);
    const nextUnits = unitsForModel(list, model);
    const free = nextUnits.find((unit) => unit.status === "disponible") || nextUnits[0];
    if (free) setSelectedKey(unitKey(free));
  };

  const chooseRooms = (next: GardenRooms) => {
    setRooms(next);
    setModelIndex(0);
    const first = GARDEN_MODELS.find((model) => model.rooms === next);
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

  const priceForModel = (model: GardenModel) => {
    const amount = minCash(units, model.match);
    return amount == null ? "Vendido" : `Desde USD ${formatGardenZenUsd(amount)}`;
  };

  const fromForRooms = (id: GardenRooms) => {
    if (id === "mono") return fromMono;
    if (id === "1") return from1;
    if (id === "2") return from2;
    return from3;
  };

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/gardenzen`;
    const shareTitle = "Garden Zen · Preventa en Equipetrol Norte";
    const shareText = `Departamentos en Equipetrol Norte${fromAny ? ` desde USD ${formatGardenZenUsd(fromAny)}` : ""}. Entrega en ${GARDEN_ZEN_CONFIG.delivery}.`;
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
    const phone = (property.agentWhatsapp || CONTACT_WHATSAPP_NUMBER).replace(/\D/g, "") || CONTACT_WHATSAPP_NUMBER;
    const planLabel = paymentPlan === "contado"
      ? "Contado 100%"
      : paymentPlan === "plan70"
        ? "Inicial 70% y saldo 30% contra entrega"
        : "Inicial 30% y saldo 70% contra entrega";
    const addonLabel = addon === "techado"
      ? `Parqueo techado USD ${formatGardenZenUsd(PARKING_TECHADO || 0)}`
      : addon === "moto"
        ? `Parqueo de moto USD ${formatGardenZenUsd(PARKING_MOTO || 0)}`
        : "Sin parqueo";
    const unitLine = activeUnit
      ? `Unidad ${activeUnit.unitNumber}, piso ${activeUnit.floor}, ${selectedModel.name} (${formatM2(activeUnit.areaM2)} m²)`
      : "Garden Zen";
    const money = quote
      ? `\n• Inversión total: USD ${formatGardenZenUsd(quote.total)}\n• Cuota inicial: USD ${formatGardenZenUsd(quote.initial)}\n• Saldo contra entrega: ${paymentPlan === "contado" ? "sin saldo pendiente" : `USD ${formatGardenZenUsd(quote.balance)}`}`
      : "";
    const text = `Hola, vengo de N.I.A y quiero la unidad en Garden Zen (${GARDEN_ZEN_CONFIG.address}):\n\n• ${unitLine}\n• ${addonLabel}\n• Modalidad: ${planLabel}${money}\n• Reserva: USD ${formatGardenZenUsd(GARDEN_ZEN_CONFIG.reservaUsd)}\n\n¿Sigue disponible y cuáles son los pasos para reservar?`;

    recordLeadEvent({
      action: "contact_tap",
      propertyRef: property.id,
      operacion: "Preventa",
      zona: property.zone || GARDEN_ZEN_CONFIG.zone,
      presupuesto: quote ? `USD ${formatGardenZenUsd(quote.total)}` : undefined,
      extraFilters: activeUnit
        ? { unidad: activeUnit.unitNumber, piso: activeUnit.floor, modelo: activeUnit.modelo, plan: paymentPlan, adicional: addon }
        : { plan: paymentPlan },
    }).catch(() => {});

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const parkingLine = [
    PARKING_TECHADO != null ? `parqueo techado desde USD ${formatGardenZenUsd(PARKING_TECHADO)}` : "",
    PARKING_MOTO != null ? `moto desde USD ${formatGardenZenUsd(PARKING_MOTO)}` : "",
    PARKING_BAULERA != null ? `baulera desde USD ${formatGardenZenUsd(PARKING_BAULERA)}` : "",
  ].filter(Boolean).join(", ");

  const coverPrices: { label: string; amount: number | null; area: string }[] = [
    { label: "Monoambiente", amount: fromMono, area: coverSpan(units.filter((unit) => unit.rooms === 0).map((unit) => unit.areaM2)) },
    { label: "1 dormitorio", amount: from1, area: coverSpan(units.filter((unit) => unit.rooms === 1).map((unit) => unit.areaM2)) },
    { label: "2 dormitorios", amount: from2, area: coverSpan(units.filter((unit) => unit.rooms === 2).map((unit) => unit.areaM2)) },
    { label: "3 dormitorios", amount: from3, area: coverSpan(units.filter((unit) => unit.rooms === 3).map((unit) => unit.areaM2)) },
  ];

  return (
    <div className="nia-project-landing fixed inset-0 z-[100] flex flex-col overflow-y-auto overscroll-y-contain bg-[#f8f1e7] font-sans text-stone-900 md:flex-row md:overflow-hidden">
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
        <img src="/garden_zen/fachada.jpg" alt="Fachada completa de Garden Zen" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-black/75 via-black/40 to-transparent" />
        <div className="relative z-10 px-5 pb-24 pt-16 text-white lg:px-7 lg:pb-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e8d5a8] backdrop-blur-md">
              <Sparkles size={12} />
              Preventa · obra fina
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
              <MapPin size={12} className="text-[#e8d5a8]" />
              {GARDEN_ZEN_CONFIG.zone}
            </span>
          </div>
          <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 font-serif leading-none drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]">
            <span className="text-4xl font-light tracking-wide md:text-5xl">Garden</span>
            <span className="text-2xl font-light text-[#e8d5a8] md:text-3xl">Zen</span>
          </h1>
          <p className="mt-2 max-w-md text-sm leading-snug text-white/90">Imagina volver a casa y elegir entre un rato de piscina, una sesión de sauna o la vista desde el rooftop.</p>
          <div className="mt-3 flex max-w-lg gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Calendar size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Entrega de obra</p>
                <p className="mt-0.5 text-sm font-medium leading-tight">{GARDEN_ZEN_CONFIG.delivery}</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Building2 size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Constructora</p>
                <p className="mt-0.5 text-sm font-medium leading-tight">{GARDEN_ZEN_CONFIG.builder}</p>
              </div>
            </div>
          </div>
          <div className="mt-2 max-w-lg rounded-2xl border border-[#e8d5a8]/30 bg-black/55 px-3.5 py-3 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e8d5a8]">Departamentos disponibles</p>
            <div className="mt-2 space-y-2">
              {coverPrices.map((row) => (
                <div key={row.label} className="flex items-end justify-between gap-3 border-t border-white/10 pt-2 first:border-0 first:pt-0">
                  <div className="min-w-0">
                    <p className="text-sm text-white">{row.label}</p>
                    <p className="text-[11px] text-white/70">{row.area}</p>
                  </div>
                  <p className="shrink-0 text-right font-serif text-sm font-semibold">{row.amount == null ? "Agotado" : `Desde USD ${formatGardenZenUsd(row.amount)}`}</p>
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
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#7a3218]">
                <Sparkles size={13} />
                Experiencia residencial
              </span>
              <h2 className="font-serif text-3xl font-light leading-tight text-[#1C1917] md:text-5xl">
                Vive en Garden Zen.
                <span className="mt-1 block font-normal italic text-[#7a3218]">Tu calma en Equipetrol Norte.</span>
              </h2>
              <p className="pt-2 text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word] md:text-base">
                Imagina volver a casa y elegir entre un rato de piscina, una sesión de sauna o la vista desde el rooftop. En {GARDEN_ZEN_CONFIG.zone}, Garden Zen combina esos momentos con paneles solares y aprovechamiento de agua de lluvia para una vida más eficiente. Un proyecto de {GARDEN_ZEN_CONFIG.builder} con espacios para distintas etapas de tu vida.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#E7E5E4] bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Lista de obra fina</p>
                <p className="mt-0.5 font-serif text-lg font-bold text-stone-900">
                  {soldCount} de {units.length} unidades vendidas{reservedCount > 0 ? ` · ${reservedCount} reservadas` : ""}
                </p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Quedan {freeCount}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => scrollToSection("disponibilidad")} className="flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md">
                Ver disponibilidad y cotizar
              </button>
              <a href={GARDEN_ZEN_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-800">
                <Download size={15} className="text-[#7a3218]" />
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
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#7a3218]"><MapPin size={13} /> Ubicación</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Equipetrol Norte, a pasos de lo que usas cada día.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Haz tus compras, sal a comer o conecta con tu oficina desde una dirección en {GARDEN_ZEN_CONFIG.address}. El entorno reúne el supermercado Tía, la Av. San Martín, Ventura Mall, Manzana 40 y Torre Platinum para que tus compras y tus planes queden cerca.
            </p>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <img src="/garden_zen/ubicacion.jpg" alt="Mapa de Garden Zen en Equipetrol Norte" className="block h-auto w-full" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="border-l-2 border-[#7a3218] pl-3">
                <p className="text-xs font-semibold text-stone-900">Supermercado Tía</p>
                <p className="mt-0.5 text-xs font-light text-stone-500">Compras cotidianas a pocos minutos.</p>
              </div>
              <div className="border-l-2 border-[#7a3218] pl-3">
                <p className="text-xs font-semibold text-stone-900">Manzana 40 y Platinum</p>
                <p className="mt-0.5 text-xs font-light text-stone-500">Centro empresarial y financiero.</p>
              </div>
              <div className="border-l-2 border-[#7a3218] pl-3">
                <p className="text-xs font-semibold text-stone-900">Ventura Mall</p>
                <p className="mt-0.5 text-xs font-light text-stone-500">Gastronomía y entretenimiento.</p>
              </div>
            </div>
            <a href={GARDEN_ZEN_CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#5c2414]">
              Ver ubicación en Google Maps <ArrowRight size={14} />
            </a>
          </section>

          <section id="amenidades" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7a3218]">Áreas sociales</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Sube al piso 17. Baja el ritmo.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Disfruta la piscina y las vistas del rooftop, encuentra tu pausa en los saunas y mantén cerca el gimnasio y el cowork. Para compartir, tienes salón y churrasqueras. Cada plan encuentra su lugar dentro de Garden Zen.
            </p>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="relative">
                <img src={amenity.src} alt={amenity.title} className="aspect-[16/10] w-full object-cover" />
                <button type="button" onClick={() => setAmenityIndex((index) => (index + AMENITY_SLIDES.length - 1) % AMENITY_SLIDES.length)} className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Anterior amenidad"><ChevronLeft size={18} /></button>
                <button type="button" onClick={() => setAmenityIndex((index) => (index + 1) % AMENITY_SLIDES.length)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Siguiente amenidad"><ChevronRight size={18} /></button>
              </div>
              <div className="space-y-1.5 px-5 py-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7a3218]">{amenity.category}</span>
                <h4 className="font-serif text-xl text-stone-900 md:text-2xl">{amenity.title}</h4>
                <p className="max-w-xl text-xs leading-relaxed text-stone-600">{amenity.description}</p>
              </div>
              <div className="flex justify-center gap-1.5 px-3 pb-3">
                {AMENITY_SLIDES.map((slide, index) => (
                  <button key={slide.title} type="button" onClick={() => setAmenityIndex(index)} className={`h-1.5 rounded-full ${amenityIndex === index ? "w-6 bg-[#7a3218]" : "w-1.5 bg-stone-300"}`} aria-label={slide.title} />
                ))}
              </div>
            </div>
          </section>

          <section id="tipologias" className="mt-20 scroll-mt-2 border-t border-stone-200/80 pt-6">
            <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
              <div className="shrink-0">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#7a3218]"><Layers size={13} /> Tipologías</span>
                <h3 className="font-serif text-2xl font-light leading-tight text-[#1C1917]">El espacio para tu próxima etapa.</h3>
              </div>
              <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4">
                {ROOM_FILTERS.map((filter) => (
                  <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-2xl border px-3 py-2 text-left ${rooms === filter.id ? "border-[#7a3218] bg-white shadow-md ring-1 ring-[#7a3218]" : "border-stone-200 bg-white/80"}`}>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a3218]">{filter.label}</p>
                    <p className="text-[11px] text-stone-500">{roomCount[filter.id]} {roomCount[filter.id] === 1 ? "planta" : "plantas"}</p>
                  </button>
                ))}
              </div>
              <ModelFrame
                model={currentModel}
                area={areaLabel(units, currentModel)}
                index={slideIndex}
                total={slides.length}
                frameClass="min-h-0 flex-1"
                onPrev={() => shiftModel(-1)}
                onNext={() => shiftModel(1)}
                onOpen={() => setZoom({ view: "planta", title: currentModel.name, caption: areaLabel(units, currentModel), src: currentModel.plan })}
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
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#7a3218]"><CheckCircle2 size={13} /> Equipamiento</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Detalles incluidos para vivir más cómodo.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Mesones, muebles, climatización y acabados que hacen más cómodo tu día. Revisa lo que incluye la cocina, el dormitorio y el baño, y empieza a imaginar tu llegada a Garden Zen.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {EQUIPMENT_SECTIONS.map((group) => (
                <div key={group.id} className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                  <img src={group.image} alt={group.title} className="max-h-[320px] w-full bg-stone-100 object-contain" />
                  <div className="space-y-2 px-4 py-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7a3218]">{group.room}</span>
                    <h4 className="font-serif text-base font-bold text-stone-900">{group.title}</h4>
                    <ul className="space-y-1.5 border-t border-stone-100 pt-2 text-xs text-stone-600">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-start gap-1.5"><span className="font-bold text-[#7a3218]">·</span><span>{item}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="constructora" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#7a3218]"><Building2 size={13} /> Constructora</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">{GARDEN_ZEN_CONFIG.builder}</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Conoce la propuesta de {GARDEN_ZEN_CONFIG.builder}: integrar energía solar, aprovechamiento del agua e iluminación eficiente a la vida en un edificio. Una forma de pensar tu hogar que también toma en cuenta el uso de los recursos.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <Zap size={18} className="text-[#7a3218]" />
                <p className="mt-2 font-serif text-lg text-stone-900">Paneles ON-GRID</p>
                <p className="mt-1 text-xs text-stone-600">Coordinación con la CRE para inyectar energía solar y reducir el consumo eléctrico.</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <Leaf size={18} className="text-[#7a3218]" />
                <p className="mt-2 font-serif text-lg text-stone-900">Uso eficiente del agua</p>
                <p className="mt-1 text-xs text-stone-600">Cosecha de agua de lluvia para riego y áreas comunes, más iluminación eficiente.</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <Building2 size={18} className="text-[#7a3218]" />
                <p className="mt-2 font-serif text-lg text-stone-900">Sede Platinum II</p>
                <p className="mt-1 text-xs text-stone-600">Oficinas en el piso 27 del Platinum II Business Center.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#7a3218]/30 bg-[#fbf7f1] p-6">
              <p className="font-serif text-base italic leading-relaxed text-stone-800 md:text-xl">
                “Conceptualizamos un estilo de vida responsable, en armonía con los cambios actuales y la tecnología, logrando una vida bajo la premisa de costo eficiente.”
              </p>
              <p className="mt-4 border-t border-[#7a3218]/20 pt-3 text-xs font-semibold text-stone-800">Garden Buildings</p>
            </div>
            <a href={GARDEN_ZEN_CONFIG.builderUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#5c2414]">
              Conocer Garden Buildings <ExternalLink size={14} />
            </a>
          </section>

          <section id="pago" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7a3218]">Formas de pago</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">Elige cómo dar el paso a Garden Zen.</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              Aprovecha la tarifa de contado o elige cuánto pagar al inicio y cuánto dejar para la entrega en {GARDEN_ZEN_CONFIG.delivery}. Compara los montos de tu departamento y piso. La reserva de USD {formatGardenZenUsd(GARDEN_ZEN_CONFIG.reservaUsd)} se descuenta de la cuota inicial.
            </p>
            <article className="rounded-2xl bg-stone-900 p-5 text-white shadow-lg">
              <span className="rounded-full bg-[#c4896a] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950">Mayor descuento</span>
              <h4 className="mt-3 font-serif text-2xl">Pago al contado (100%)</h4>
              {minCashPerM2 != null && <p className="mt-2 font-serif text-3xl text-[#e6cdb8]">Desde USD {formatGardenZenUsd(minCashPerM2)}/m²</p>}
              <p className="mt-3 text-sm leading-relaxed text-stone-300">Accede a la tarifa de contado de la unidad que elijas y define el pago de tu departamento desde el inicio. Entrega programada para {GARDEN_ZEN_CONFIG.delivery}.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">Equilibrio financiero</span>
              <h4 className="mt-3 font-serif text-2xl leading-snug">Inicial 70% y saldo 30% contra entrega</h4>
              {minPlan70PerM2 != null && <p className="mt-2 font-serif text-3xl text-stone-900">Desde USD {formatGardenZenUsd(minPlan70PerM2)}/m²</p>}
              <p className="mt-3 text-sm leading-relaxed text-stone-600">Pagas el 70% a la firma y el 30% restante cuando la obra fina esté concluida en {GARDEN_ZEN_CONFIG.delivery}.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700">Entrada cómoda</span>
              <h4 className="mt-3 font-serif text-2xl leading-snug">Inicial 30% y saldo 70% contra entrega</h4>
              {minPlan30PerM2 != null && <p className="mt-2 font-serif text-3xl text-stone-900">Desde USD {formatGardenZenUsd(minPlan30PerM2)}/m²</p>}
              <p className="mt-3 text-sm leading-relaxed text-stone-600">Empieza con el 30% y deja el 70% para {GARDEN_ZEN_CONFIG.delivery}. Una opción para organizar con más tiempo el pago de la mayor parte de tu departamento.</p>
            </article>
            {parkingLine && (
              <p className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
                {parkingLine.charAt(0).toUpperCase() + parkingLine.slice(1)}. Se cotizan aparte del metro cuadrado.
              </p>
            )}
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
              Elegir mi departamento <ArrowRight size={14} />
            </button>
          </section>

          <section id="disponibilidad" className="mt-20 scroll-mt-2 space-y-6 border-t border-stone-200/80 pt-6">
            <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
              <div className="shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#7a3218]">Disponibilidad</span>
                <h3 className="font-serif text-2xl font-light leading-tight text-[#1C1917]">Encuentra tu lugar en Garden Zen.</h3>
                <p className="mt-1 text-xs text-stone-500">Lista de obra fina. Verde: disponible · Gris: vendido o reservado.</p>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 1 · Tipología</p>
                <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4">
                  {ROOM_FILTERS.map((filter) => {
                    const from = fromForRooms(filter.id);
                    return (
                      <button key={filter.id} type="button" onClick={() => chooseRooms(filter.id)} className={`rounded-xl border p-3 text-left ${rooms === filter.id ? "border-[#7a3218] bg-white ring-1 ring-[#7a3218]" : "border-stone-200 bg-white"}`}>
                        <p className="text-sm font-bold">{filter.label}</p>
                        <p className="text-[11px] text-[#7a3218]">{from == null ? "Sin unidades libres" : `Desde USD ${formatGardenZenUsd(from)}`}</p>
                      </button>
                    );
                  })}
                </div>
                <ModelFrame
                  model={currentModel}
                  area={areaLabel(units, currentModel)}
                  index={slideIndex}
                  total={slides.length}
                  price={selectedCash != null ? `USD ${formatGardenZenUsd(selectedCash)}` : priceForModel(currentModel)}
                  frameClass="min-h-0 flex-1"
                  onPrev={() => shiftModel(-1)}
                  onNext={() => shiftModel(1)}
                  onOpen={() => setZoom({ view: "planta", title: currentModel.name, caption: areaLabel(units, currentModel), src: currentModel.plan })}
                  onTouchStart={(event) => { modelTouch.current = event.changedTouches[0].clientX; }}
                  onTouchEnd={onModelSwipe}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <p className="font-semibold uppercase tracking-wider text-stone-500">Paso 2 · Unidad</p>
                {selectedCash != null && <span className="font-semibold text-[#7a3218]">USD {formatGardenZenUsd(selectedCash)}</span>}
              </div>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-stone-200 bg-white p-2 sm:grid-cols-5">
                {floors.map((floor) => {
                  const current = activeUnit ? unitKey(activeUnit) === unitKey(floor) : false;
                  const libre = floor.status === "disponible";
                  return (
                    <button key={unitKey(floor)} type="button" disabled={!libre} onClick={() => setSelectedKey(unitKey(floor))} className={`rounded-lg px-1 py-2 text-xs font-semibold ${current ? "bg-stone-900 text-white" : libre ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "cursor-not-allowed bg-stone-100 text-stone-400"}`}>
                      <span className="block">Piso {floor.floor}</span>
                      <span className="block text-[10px] font-normal">Unidad {floor.unitNumber}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 3 · Adicional</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button type="button" onClick={() => setAddon("none")} className={`rounded-xl border p-3 text-left ${addon === "none" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                  <p className="text-sm font-bold">Sin adicional</p>
                  <p className={`text-[11px] ${addon === "none" ? "text-stone-300" : "text-stone-500"}`}>Solo el departamento</p>
                </button>
                {PARKING_TECHADO != null && (
                  <button type="button" onClick={() => setAddon("techado")} className={`rounded-xl border p-3 text-left ${addon === "techado" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                    <p className="text-sm font-bold">Parqueo techado</p>
                    <p className={`text-[11px] ${addon === "techado" ? "text-stone-300" : "text-stone-500"}`}>USD {formatGardenZenUsd(PARKING_TECHADO)}</p>
                  </button>
                )}
                {PARKING_MOTO != null && (
                  <button type="button" onClick={() => setAddon("moto")} className={`rounded-xl border p-3 text-left ${addon === "moto" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                    <p className="text-sm font-bold">Moto</p>
                    <p className={`text-[11px] ${addon === "moto" ? "text-stone-300" : "text-stone-500"}`}>USD {formatGardenZenUsd(PARKING_MOTO)}</p>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 4 · Plan de pago</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button type="button" onClick={() => setPaymentPlan("contado")} className={`rounded-xl border p-3 text-left ${paymentPlan === "contado" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                  <p className="text-sm font-bold">Contado</p>
                  <p className={`text-[11px] ${paymentPlan === "contado" ? "text-[#e6cdb8]" : "text-[#7a3218]"}`}>100% a la firma{minCashPerM2 != null ? ` · USD ${formatGardenZenUsd(activeUnit?.cashPerM2 || minCashPerM2)}/m²` : ""}</p>
                </button>
                <button type="button" onClick={() => setPaymentPlan("plan70")} className={`rounded-xl border p-3 text-left ${paymentPlan === "plan70" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                  <p className="text-sm font-bold">Inicial 70%</p>
                  <p className={`text-[11px] ${paymentPlan === "plan70" ? "text-stone-300" : "text-stone-500"}`}>70% a la firma · 30% contra entrega</p>
                </button>
                <button type="button" onClick={() => setPaymentPlan("plan30")} className={`rounded-xl border p-3 text-left ${paymentPlan === "plan30" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                  <p className="text-sm font-bold">Inicial 30%</p>
                  <p className={`text-[11px] ${paymentPlan === "plan30" ? "text-stone-300" : "text-stone-500"}`}>30% a la firma · 70% contra entrega</p>
                </button>
              </div>
            </div>

            {activeUnit && activeUnit.status !== "disponible" && (
              <p className="rounded-xl border border-stone-200 bg-stone-100 p-4 text-sm text-stone-600">
                La unidad {activeUnit.unitNumber} del piso {activeUnit.floor} figura {activeUnit.status === "reservado" ? "reservada" : "vendida"}. Elige otra.
              </p>
            )}

            {activeUnit && quote && (
              <div className="space-y-4 rounded-2xl bg-stone-900 p-5 text-white shadow-xl">
                <div className="border-b border-white/10 pb-3 text-xs text-[#e6cdb8]">
                  Unidad {activeUnit.unitNumber} · Piso {activeUnit.floor} · {selectedModel.name} · {formatM2(activeUnit.areaM2)} m²
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Inversión total</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatGardenZenUsd(quote.total)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">USD {formatGardenZenUsd(quote.rate)}/m²{quote.parking ? ` + adicional USD ${formatGardenZenUsd(quote.parking)}` : ""}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Cuota inicial ({paymentPlan === "contado" ? "100" : paymentPlan === "plan70" ? "70" : "30"}%)</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight text-emerald-400"><span className="block font-mono text-xs font-normal text-emerald-500/80">USD</span>{formatGardenZenUsd(quote.initial)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">A la firma del contrato</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Saldo contra entrega</p>
                    {paymentPlan === "contado" ? (
                      <>
                        <p className="mt-1 font-serif text-2xl font-bold leading-tight text-stone-500"><span className="block font-mono text-xs font-normal text-stone-500">USD</span>—</p>
                        <p className="mt-1 text-[10px] text-stone-400">Sin saldo pendiente</p>
                      </>
                    ) : (
                      <>
                        <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatGardenZenUsd(quote.balance)}</p>
                        <p className="mt-1 text-[10px] text-stone-400">{paymentPlan === "plan70" ? "30%" : "70%"} en {GARDEN_ZEN_CONFIG.delivery}</p>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-400">La reserva de USD {formatGardenZenUsd(GARDEN_ZEN_CONFIG.reservaUsd)} se descuenta de la cuota inicial.</p>
                <button type="button" onClick={contactWhatsApp} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-900">
                  <MessageCircle size={16} />
                  Quiero la unidad {activeUnit.unitNumber}
                </button>
              </div>
            )}
          </section>

          <section id="cierre" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200 pt-12 pb-16 text-center">
            <h3 className="font-serif text-3xl font-light text-[#1C1917]">Empieza a imaginar tu vida en Garden Zen.</h3>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-600">
              Cuéntanos qué modelo te gustó. Te ayudamos a comparar pisos, confirmar el equipamiento y elegir la forma de pago. Consulta cómo reservar tu unidad con USD {formatGardenZenUsd(GARDEN_ZEN_CONFIG.reservaUsd)} y da el siguiente paso.
            </p>
            <button type="button" onClick={contactWhatsApp} className="inline-flex items-center gap-1 text-sm font-semibold text-[#5c2414]">
              Hablar con un asesor <ArrowRight size={14} />
            </button>
          </section>
        </div>
      </div>

      {activeSection !== "cierre" && (
        <div className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-3 border-t border-stone-200 bg-[#f8f1e7]/95 px-5 py-3 backdrop-blur-md lg:left-[44%]">
          <div>
            <p className="text-xs text-stone-700">{selectedCash != null ? `USD ${formatGardenZenUsd(selectedCash)} · ${GARDEN_ZEN_CONFIG.delivery}` : fromAny == null ? GARDEN_ZEN_CONFIG.delivery : `Desde USD ${formatGardenZenUsd(fromAny)} · ${GARDEN_ZEN_CONFIG.delivery}`}</p>
            <p className="hidden text-[10px] font-medium text-[#7a3218] sm:block">Reserva USD {formatGardenZenUsd(GARDEN_ZEN_CONFIG.reservaUsd)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a href={GARDEN_ZEN_CONFIG.brochurePdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-stone-800">
              <Download size={14} className="text-[#7a3218]" />
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
            {showSectionMenu ? <X size={18} className="text-[#e6cdb8]" /> : <Menu size={18} className="text-[#e6cdb8]" />}
          </button>
          <AnimatePresence>
            {showSectionMenu && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute bottom-14 right-0 z-[115] w-56 space-y-1 rounded-2xl border border-stone-200 bg-white/95 p-2.5 text-xs shadow-2xl">
                {SECTIONS.map((section) => (
                  <button key={section.id} type="button" onClick={() => scrollToSection(section.id)} className={`w-full rounded-lg px-3 py-2 text-left font-medium ${activeSection === section.id ? "bg-[#7a3218]/15 font-semibold text-[#5c2414]" : "text-stone-700"}`}>
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
          <div className="fixed inset-0 z-[140] flex flex-col bg-[#f8f1e7]" role="dialog" aria-modal="true" aria-label={zoom.title}>
            <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-8">
              <div className="min-w-0">
                <h4 className="font-serif text-xl text-stone-900">{zoom.title}</h4>
                <p className="line-clamp-2 text-xs text-stone-500">{zoom.caption}</p>
              </div>
              <button type="button" onClick={() => setZoom(null)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 shadow-sm" aria-label="Cerrar vista">
                <X size={18} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center px-3 pb-4 md:px-10">
              <img src={zoom.src} alt={zoom.title} className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
