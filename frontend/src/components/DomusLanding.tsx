import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
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
import { useInventory, domusInventories } from "../projectInventory";
import {
  DOMUS_PROJECTS_CONFIG,
  type DomusProjectConfig,
  type DomusUnit,
  fetchDomusLiveUnits,
  formatDomusUsd,
} from "../domusInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";
import { DOMUS_COMMERCIAL_COPY } from "../domusCommercialCopy";

interface Props {
  property: Property;
  onClose?: () => void;
}

type PlanId = "contado" | "inicial60" | "inicial40" | "hastaEntrega";
type AddonId = "none" | "p9000" | "p9500";

interface ModelArt {
  preview?: string;
  plan?: string;
  full?: string;
}

interface DomusModel {
  id: string;
  name: string;
  rooms: number;
  areaM2: number;
  detail: string;
  art: ModelArt;
}

interface AmenitySlide {
  name: string;
  category: string;
  description: string;
  image: string;
}

const ALBORADA_PROJECTS_IMAGE = "/domus/alborada-proyectos-entregas.jpg";

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

const BLACK_SHEETS = [
  "/domus/domus_black/brochure_p02.jpg",
  "/domus/domus_black/brochure_p03.jpg",
  "/domus/domus_black/brochure_p04.jpg",
  "/domus/domus_black/brochure_p05.jpg",
];

const ONIX_MODELS = ["a2", "b1", "c1", "d1", "e1"];

const PROJECT_META: Record<string, {
  sharePath: string;
  hero: string;
  delivery: string | null;
  stage: string;
  listLabel: string | null;
  brochure: string;
  lugarImage?: string;
  nearby?: string[];
  floorPlate?: { href?: string; src?: string; title: string; caption: string };
  amenities: AmenitySlide[];
}> = {
  "domus-black": {
    sharePath: "/domus-black",
    hero: "/domus/domus_black/fachada_principal.jpg",
    delivery: null,
    stage: "Etapa 2",
    listLabel: "8 de noviembre de 2026",
    brochure: "https://drive.google.com/file/d/16OM2mFA5QhqxfxOrFTMIVRWMVLrxWLPt/view",
    floorPlate: {
      href: "https://drive.google.com/file/d/1zkUYsY9fXnwWkUE_giz01tb4xxpEbiZb/view",
      title: "Distribución de plantas",
      caption: "Ubica tu departamento dentro del edificio.",
    },
    amenities: [
      { name: "Una partida entre amigos", category: "Sala de juegos", description: "Haz de una partida de billar el motivo para reunirte y disfrutar el tiempo libre en tu edificio.", image: "/domus/domus_black/social_03.jpg" },
      { name: "Tu entrenamiento, más cerca", category: "Gimnasio", description: "Encuentra un espacio para moverte, entrenar y mantener tu rutina dentro del edificio.", image: "/domus/domus_black/social_01.jpg" },
      { name: "El asado también puede ser en casa", category: "Churrasquera y comedor", description: "Recibe a tus amigos en un ambiente con parrilla, barra y espacio para compartir la mesa.", image: "/domus/domus_black/social_02.jpg" },
      { name: "Una pausa para conversar", category: "Lounge social", description: "Comparte una charla o disfruta un momento de descanso en los livings del área social.", image: "/domus/domus_black/social_04.jpg" },
    ],
  },
  "domus-gold": {
    sharePath: "/domus-gold",
    hero: "/domus/domus_gold/fachada_torre.jpg",
    delivery: null,
    stage: "Etapa 2",
    listLabel: "8 de noviembre de 2026",
    brochure: "https://drive.google.com/file/d/15oGaN86t2c69OaGZ3qX9ThN5-8kUJD2y/view",
    amenities: [
      { name: "Tu plan para las tardes de calor", category: "Piscina", description: "Refresca el día y disfruta del agua en un espacio que amplía la vida de tu hogar.", image: "/domus/domus_gold/social_piscina.jpg" },
      { name: "Una bienvenida que se disfruta", category: "Lobby", description: "Llega a casa o recibe a tus visitas en un lobby que forma parte de la experiencia Gold.", image: "/domus/domus_gold/lobby_real.jpg" },
      { name: "Desconecta junto al agua", category: "Deck de descanso", description: "Haz una pausa, disfruta el aire libre y encuentra tu momento de descanso al lado de la piscina.", image: "/domus/domus_gold/social_deck.jpg" },
      { name: "La mesa lista para tus encuentros", category: "Churrasquera", description: "Reúne a los tuyos alrededor de un asado y disfruta de un espacio para compartir sin salir del edificio.", image: "/domus/domus_gold/social_churrasquera.jpg" },
    ],
  },
  "domus-onix": {
    sharePath: "/domus-onix",
    hero: "/domus/domus_onix/fachada_torre.jpg",
    delivery: null,
    stage: "Etapa 2",
    listLabel: "8 de noviembre de 2026",
    brochure: "https://drive.google.com/file/d/1Xk8zJaFDr-z4VZLd9C-7UX7XWpIeGW-0/view",
    floorPlate: {
      src: "/domus/domus_onix/lobby_cafeteria.jpg",
      title: "Planta baja",
      caption: "Lobby, cafetería, bauleras y parqueos.",
    },
    amenities: [
      { name: "Llegar, encontrarte y seguir tu día", category: "Plano de planta baja", description: "Conoce cómo se distribuyen el lobby, la cafetería y los servicios de acceso del proyecto.", image: "/domus/domus_onix/lobby_cafeteria.jpg" },
      { name: "Más espacio para tus planes", category: "Plano del piso 3", description: "Explora la distribución de las áreas sociales y descubre dónde podrías compartir, entrenar y descansar.", image: "/domus/domus_onix/social_area_clean.jpg" },
      { name: "Tu pausa en el piso 21", category: "Plano de piscina", description: "Conoce la piscina y los espacios de descanso previstos en el nivel superior del proyecto.", image: "/domus/domus_onix/social_piscina_clean.jpg" },
    ],
  },
  "domus-insignia": {
    sharePath: "/domus-insignia",
    hero: "/domus/domus_insignia/fachada_perspectiva.jpg",
    delivery: "Febrero 2026 / Febrero 2027",
    stage: "Preventa",
    listLabel: null,
    brochure: "https://drive.google.com/file/d/1-iHC0tJkWY7guIcr-PwgXGwi3KC-jloa/view",
    lugarImage: "/domus/domus_insignia/brochure_p04.jpg",
    nearby: ["Cafetería Ottimo", "Pizzería Vulcanica", "Casa Çuina", "Supermercado Fidalga", "Mall Ventura", "Universidad Utepsa", "Colegio Alemán", "Hotel Los Tajibos"],
    amenities: [
      { name: "Bienvenido a tu próxima dirección", category: "Lobby", description: "Un ambiente para llegar a casa y recibir a quienes forman parte de tu vida.", image: "/domus/domus_insignia/lobby_insignia.jpg" },
      { name: "Desconecta de la rutina", category: "Piscina", description: "Disfruta un momento junto al agua y suma una pausa a tu día sin salir del edificio.", image: "/domus/domus_insignia/social_piscina.jpg" },
      { name: "Tus reuniones, con su propio espacio", category: "Cowork y reuniones", description: "Separa el trabajo del descanso con un ambiente para reunirte y concentrarte dentro del proyecto.", image: "/domus/domus_insignia/social_cine.jpg" },
      { name: "Un lugar para avanzar con tus ideas", category: "Cowork", description: "Encuentra un espacio compartido para trabajar, conversar y desarrollar tus proyectos.", image: "/domus/domus_insignia/social_cowork.jpg" },
    ],
  },
  "domus-luxury": {
    sharePath: "/domus-lux",
    hero: "/domus/domus_luxury/fachada_principal.jpg",
    delivery: "Noviembre 2026",
    stage: "Preventa",
    listLabel: null,
    brochure: "https://drive.google.com/file/d/1GHxQsjFFDVGW35z-AvQdEOjBgFCHG8nd/view",
    amenities: [
      { name: "La tarde se disfruta junto al agua", category: "Piscina", description: "Encuentra una pausa para refrescarte y descansar en la piscina del edificio.", image: "/domus/domus_luxury/social_piscina.jpg" },
      { name: "El gusto de llegar a casa", category: "Lobby", description: "Un ambiente cálido, con diseño y vegetación, para recibirte y dar la bienvenida a tus visitas.", image: "/domus/domus_luxury/lobby_luxury.jpg" },
      { name: "Hazle lugar a tu bienestar", category: "Gimnasio", description: "Dedica tiempo a tu entrenamiento en un espacio del propio edificio.", image: "/domus/domus_luxury/social_gym.jpg" },
      { name: "Hoy la película puede ser en casa", category: "Cine", description: "Disfruta una función y comparte una nueva forma de pasar el tiempo libre dentro de Domus Luxury.", image: "/domus/domus_luxury/social_cine.jpg" },
    ],
  },
  "domus-tower": {
    sharePath: "/domus-tower",
    hero: "/domus/domus_tower/fachada_principal.jpg",
    delivery: null,
    stage: "Preventa",
    listLabel: null,
    brochure: "https://drive.google.com/file/d/1Bg6B774mAmV-zBkKSkJZ-X-QwLuuGeC1/view",
    amenities: [
      { name: "Tu pausa al aire libre", category: "Terraza social", description: "Comparte una charla o descansa en los livings de la terraza, junto al entorno de la piscina.", image: "/domus/domus_tower/render_01.jpg" },
      { name: "Más planes en el piso 6", category: "Áreas comunes", description: "Conoce la propuesta de cowork, piscina, gimnasio y espacios compartidos que amplían tu hogar.", image: "/domus/domus_tower/social_cowork_pool.jpg" },
      { name: "El agua, a unos pasos de casa", category: "Piscina y descanso", description: "Disfruta la piscina y los espacios de descanso como parte de tu vida en Domus Tower.", image: "/domus/domus_tower/social_amenities_02.jpg" },
    ],
  },
  "domus-infinity": {
    sharePath: "/domus-infinity",
    hero: "/domus/domus_infinity/fachada_principal.jpg",
    delivery: "Febrero 2026",
    stage: "Preventa",
    listLabel: null,
    brochure: "https://drive.google.com/file/d/1x0nw_BXjqEYiyQzY5kwQKbjJDoeuIRk1/view",
    amenities: [
      { name: "Una bienvenida para los tuyos", category: "Lobby", description: "Llega a tu departamento a través de un ambiente pensado para recibirte y recibir a tus visitas.", image: "/domus/domus_infinity/lobby_infinity.jpg" },
      { name: "Que el próximo asado sea en casa", category: "Churrasquera", description: "Reúne a tus amigos y disfruta un espacio para cocinar, conversar y compartir la mesa.", image: "/domus/domus_infinity/social_churrasqueras.jpg" },
      { name: "Tu rutina de bienestar, más cerca", category: "Gimnasio", description: "Entrena dentro del edificio y suma movimiento a tu día sin cambiar de dirección.", image: "/domus/domus_infinity/social_gym.jpg" },
      { name: "Haz espacio para encontrarte con otros", category: "Salón multiuso", description: "Celebra, reúnete o comparte una ocasión especial en un ambiente que complementa tu departamento.", image: "/domus/domus_infinity/social_multiuso.jpg" },
    ],
  },
};

const ROOM_LABEL: Record<number, string> = {
  0: "Monoambiente",
  1: "1 dormitorio",
  2: "2 dormitorios",
  3: "3 dormitorios",
};

function projectIdFromProperty(property: Property): string {
  const raw = `${property.id} ${property.title || ""} ${property.complejoNombre || ""}`.toLowerCase();
  if (raw.includes("black")) return "domus-black";
  if (raw.includes("gold")) return "domus-gold";
  if (raw.includes("onix") || raw.includes("ónix")) return "domus-onix";
  if (raw.includes("insignia")) return "domus-insignia";
  if (raw.includes("luxury") || raw.includes("lux")) return "domus-luxury";
  if (raw.includes("tower")) return "domus-tower";
  if (raw.includes("infinity")) return "domus-infinity";
  return "domus-black";
}

function prettyName(name: string): string {
  return name.replace(/^DOMUS\s+/i, "Domus ").replace(/\s+/g, " ").trim();
}

function splitTitle(name: string): [string, string] {
  const [first, ...rest] = prettyName(name).split(" ");
  return [first || "Domus", rest.join(" ")];
}

function formatM2(value: number): string {
  return value.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function publicLine(text: string): string {
  if (/plusval|airbnb|rentab|alquiler|retorno/i.test(text)) return "";
  return text;
}

function artFor(projectId: string, modelo: string, rooms: number): ModelArt {
  if (projectId === "domus-onix") {
    const slug = modelo.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (ONIX_MODELS.includes(slug)) {
      return {
        preview: `/domus/domus_onix/modelos/${slug}-depto.jpg`,
        full: `/domus/domus_onix/modelos/${slug}.jpg`,
      };
    }
  }
  if (projectId === "domus-black" && rooms >= 0 && rooms <= 3) {
    return {
      preview: `/domus/domus_black/modelos/rooms-${rooms}.jpg`,
      plan: `/domus/domus_black/planos/rooms-${rooms}.jpg`,
      full: BLACK_SHEETS[rooms],
    };
  }
  return {};
}

function listedPrice(unit: DomusUnit): number {
  if (unit.cashTotal > 0) return unit.cashTotal;
  if ((unit.planTotal || 0) > 0) return unit.planTotal || 0;
  if (unit.initial40Total > 0) return unit.initial40Total;
  return unit.initial60Total || 0;
}

function minListed(list: DomusUnit[]): number | null {
  const amounts = list.filter((unit) => unit.status === "disponible" && listedPrice(unit) > 0).map(listedPrice);
  return amounts.length ? Math.min(...amounts) : null;
}

function plansFor(units: DomusUnit[]): PlanId[] {
  const plans: PlanId[] = [];
  if (units.some((unit) => unit.cashTotal > 0)) plans.push("contado");
  if (units.some((unit) => (unit.initial60Total || 0) > 0)) plans.push("inicial60");
  if (units.some((unit) => unit.initial40Total > 0)) plans.push("inicial40");
  else if (units.some((unit) => (unit.planTotal || 0) > 0)) plans.push("hastaEntrega");
  return plans.length ? plans : ["contado"];
}

function planSupported(unit: DomusUnit, plan: PlanId): boolean {
  if (plan === "contado") return unit.cashTotal > 0;
  if (plan === "inicial60") return (unit.initial60Total || 0) > 0;
  if (plan === "inicial40") return unit.initial40Total > 0;
  return (unit.planTotal || 0) > 0;
}

function apartmentOf(unit: DomusUnit, plan: PlanId): number {
  if (plan === "inicial60") return unit.initial60Total || 0;
  if (plan === "inicial40") return unit.initial40Total || 0;
  if (plan === "hastaEntrega") return unit.planTotal || 0;
  return unit.cashTotal || 0;
}

function rateOf(unit: DomusUnit, plan: PlanId): number {
  if (plan === "inicial60") return unit.initial60PerM2 || 0;
  if (plan === "inicial40") return unit.initial40PerM2 || 0;
  if (plan === "hastaEntrega") return unit.planPerM2 || 0;
  return unit.cashPerM2 || 0;
}

function addonAmount(projectId: string, addon: AddonId, plan: PlanId): number {
  if (projectId !== "domus-insignia" || addon === "none") return 0;
  const cash = addon === "p9000" ? 9000 : 9500;
  const planPrice = addon === "p9000" ? 9500 : 10000;
  return plan === "contado" ? cash : planPrice;
}

function quoteUnit(unit: DomusUnit | null, plan: PlanId, addon: number) {
  if (!unit || unit.status !== "disponible") return null;
  const apartment = apartmentOf(unit, plan);
  if (!(apartment > 0)) return null;
  const pct = plan === "inicial60" ? 60 : plan === "inicial40" ? 40 : 100;
  const publishedDown = plan === "inicial60" ? unit.cuotaInicial60 : plan === "inicial40" ? unit.cuotaInicial40 : undefined;
  const initial = pct === 100 ? apartment + addon : (publishedDown ?? Math.round((apartment * pct) / 100));
  const balance = pct === 100 ? null : apartment - initial;
  return {
    total: apartment + addon,
    initial,
    balance,
    rate: rateOf(unit, plan) || (unit.areaM2 > 0 ? Math.round(apartment / unit.areaM2) : 0),
    addon,
    pct,
  };
}

function rateSpan(values: number[]): string {
  const unique = [...new Set(values.filter((value) => value > 0))].sort((a, b) => a - b);
  if (unique.length === 0) return "";
  if (unique.length === 1) return `USD ${formatDomusUsd(unique[0])}/m²`;
  return `USD ${formatDomusUsd(unique[0])} a ${formatDomusUsd(unique[unique.length - 1])}/m²`;
}

function planTitle(plan: PlanId): string {
  if (plan === "contado") return "Contado";
  if (plan === "inicial60") return "Inicial 60%";
  if (plan === "inicial40") return "Inicial 40%";
  return "Pago hasta la entrega";
}

function planHint(plan: PlanId): string {
  if (plan === "contado") return "100% a la firma";
  if (plan === "inicial60") return "60% a la firma · saldo contra entrega";
  if (plan === "inicial40") return "40% a la firma · saldo contra entrega";
  return "Consulta el calendario de pagos de tu unidad";
}

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
  model: DomusModel;
  index: number;
  total: number;
  price?: string;
  frameClass: string;
  onPrev: () => void;
  onNext: () => void;
  onOpen: (view: "depto" | "planta" | "ficha") => void;
  onTouchStart: (event: TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: (event: TouchEvent<HTMLDivElement>) => void;
}) {
  const clickView = model.art.preview ? "depto" : model.art.full ? "ficha" : "depto";
  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm ${frameClass}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-100 px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-[#9a7b45]">{model.name}</p>
          <p className="truncate text-xs text-stone-600">{formatM2(model.areaM2)} m² · {ROOM_LABEL[model.rooms] || "Departamento"}</p>
          <p className="line-clamp-1 text-xs leading-snug text-stone-500">{model.detail}</p>
          {price ? <p className="mt-0.5 text-sm font-semibold text-[#9a7b45]">{price}</p> : null}
        </div>
        <p className="min-w-[4.25rem] shrink-0 rounded-full border border-[#9a7b45]/40 bg-[#f7f5f0] px-3 py-1.5 text-center text-base font-bold leading-none tabular-nums text-[#816127] shadow-sm sm:text-lg" title={`Modelo ${index + 1} de ${total}`}>{index + 1}/{total}</p>
      </div>
      <div className="relative min-h-0 flex-1 bg-white">
        {model.art.preview || model.art.full ? (
          <button type="button" onClick={() => onOpen(clickView)} className="absolute inset-0 flex items-center justify-center p-2" aria-label={`Ver ${model.name}`}>
            <img src={model.art.preview || model.art.full} alt={`Detalle visual de ${model.name}`} className="max-h-full max-w-full object-contain" />
          </button>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-stone-500">Consulta la distribución de este modelo en el brochure o con tu asesor.</div>
        )}
        {total > 1 && (
          <>
            <button type="button" onClick={onPrev} className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo anterior"><ChevronLeft size={22} /></button>
            <button type="button" onClick={onNext} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Modelo siguiente"><ChevronRight size={22} /></button>
          </>
        )}
      </div>
      {model.art.plan ? (
        <button type="button" onClick={() => onOpen("planta")} className="flex h-[4.75rem] shrink-0 items-center gap-3 border-t border-stone-100 bg-[#f7f5f0] px-3 pr-16 text-left">
          <img src={model.art.plan} alt="" className="h-14 w-16 shrink-0 bg-white object-contain" />
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">Distribución</span>
            <span className="block text-xs leading-snug text-stone-600">Amplía el plano y conoce la distribución del departamento.</span>
          </span>
        </button>
      ) : null}
    </div>
  );
}

export default function DomusLanding({ property, onClose }: Props) {
  const projectId = useMemo(() => projectIdFromProperty(property), [property]);
  const project: DomusProjectConfig = DOMUS_PROJECTS_CONFIG[projectId] || DOMUS_PROJECTS_CONFIG["domus-black"];
  const meta = PROJECT_META[projectId] || PROJECT_META["domus-black"];
  const copy = DOMUS_COMMERCIAL_COPY[projectId] || DOMUS_COMMERCIAL_COPY["domus-black"];
  const inventory = domusInventories[projectId] || domusInventories["domus-black"];
  const [units, setUnits] = useInventory(inventory);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const introNavRef = useRef<HTMLDivElement>(null);
  const modelTouch = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState("intro");
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [amenityIndex, setAmenityIndex] = useState(0);
  const [rooms, setRooms] = useState(0);
  const pickedRoom = useRef(false);
  const userPickedModel = useRef(false);
  const [modelIndex, setModelIndex] = useState(0);
  const [selectedUnitNumber, setSelectedUnitNumber] = useState("");
  const [plan, setPlan] = useState<PlanId>("contado");
  const [addon, setAddon] = useState<AddonId>("none");
  const [zoom, setZoom] = useState<
    | { view: "depto" | "planta" | "ficha"; title: string; caption: string; art: ModelArt }
    | { view: "solo"; title: string; caption: string; src: string }
    | null
  >(null);

  useEffect(() => {
    let cancel = false;
    fetchDomusLiveUnits(projectId).then((live) => {
      if (!cancel && live.length > 0) setUnits(live);
    });
    return () => {
      cancel = true;
    };
  }, [projectId, setUnits]);

  const display = prettyName(project.name);
  const [titleFirst, titleRest] = splitTitle(project.name);
  const tagline = publicLine(project.tagline);
  const plans = useMemo(() => plansFor(units), [units]);
  const roomOptions = useMemo(() => [0, 1, 2, 3].filter((room) => units.some((unit) => unit.rooms === room)), [units]);
  const activeRooms = roomOptions.includes(rooms) ? rooms : roomOptions[0] ?? 0;

  const models = useMemo(() => {
    const grouped = new Map<string, DomusUnit[]>();
    units.filter((unit) => unit.rooms === activeRooms && unit.modelo).forEach((unit) => {
      const key = unit.modelo.trim();
      grouped.set(key, [...(grouped.get(key) || []), unit]);
    });
    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b, "es"))
      .map(([id, list]) => {
        const areas = list.map((unit) => unit.areaM2).filter((area) => area > 0);
        const low = areas.length ? Math.min(...areas) : 0;
        const high = areas.length ? Math.max(...areas) : 0;
        return {
          id,
          name: `Modelo ${id}`,
          rooms: activeRooms,
          areaM2: low,
          detail: high > low ? `${formatM2(low)} a ${formatM2(high)} m² en la lista` : ROOM_LABEL[activeRooms] || "",
          art: artFor(projectId, id, activeRooms),
        } satisfies DomusModel;
      });
  }, [units, activeRooms, projectId]);

  const slideIndex = models.length ? ((modelIndex % models.length) + models.length) % models.length : 0;
  const currentModel = models[slideIndex] || null;
  const modelUnits = useMemo(() => {
    if (!currentModel) return [];
    return units
      .filter((unit) => unit.modelo.trim() === currentModel.id && unit.rooms === activeRooms)
      .sort((a, b) => a.floor - b.floor || a.unitNumber.localeCompare(b.unitNumber, "es"));
  }, [units, currentModel, activeRooms]);
  const activeUnit = modelUnits.find((unit) => unit.unitNumber === selectedUnitNumber) || modelUnits.find((unit) => unit.status === "disponible") || modelUnits[0] || null;
  const addonUsd = addonAmount(projectId, addon, plan);
  const quote = quoteUnit(activeUnit, plan, addonUsd);
  const selectedCash = activeUnit && activeUnit.status === "disponible" && listedPrice(activeUnit) > 0 ? listedPrice(activeUnit) : null;
  const fromAny = minListed(units);
  const freeCount = units.filter((unit) => unit.status === "disponible").length;
  const takenCount = units.length - freeCount;
  const amenity = meta.amenities[amenityIndex % Math.max(meta.amenities.length, 1)];

  useEffect(() => {
    pickedRoom.current = false;
    userPickedModel.current = false;
    setRooms(0);
    setModelIndex(0);
    setSelectedUnitNumber("");
    setAddon("none");
    setAmenityIndex(0);
  }, [projectId]);

  useEffect(() => {
    if (pickedRoom.current || !units.length || !roomOptions.length) return;
    const freeRoom = roomOptions.find((room) => units.some((unit) => unit.rooms === room && unit.status === "disponible" && listedPrice(unit) > 0));
    setRooms(freeRoom ?? roomOptions[0]);
    pickedRoom.current = true;
  }, [units, roomOptions]);

  useEffect(() => {
    if (userPickedModel.current || !models.length) return;
    const freeIndex = models.findIndex((model) => units.some((unit) => unit.modelo.trim() === model.id && unit.rooms === model.rooms && unit.status === "disponible" && listedPrice(unit) > 0));
    if (freeIndex >= 0 && freeIndex !== slideIndex) setModelIndex(freeIndex);
  }, [models, units, slideIndex]);

  useEffect(() => {
    if (!plans.includes(plan)) setPlan(plans[0]);
  }, [plans, plan]);

  useEffect(() => {
    if (!activeUnit) return;
    if (!planSupported(activeUnit, plan)) {
      const next = plans.find((item) => planSupported(activeUnit, item));
      if (next) setPlan(next);
    }
  }, [activeUnit, plan, plans]);

  useEffect(() => {
    if (!modelUnits.length) return;
    const current = modelUnits.find((unit) => unit.unitNumber === selectedUnitNumber);
    if (!current || current.status !== "disponible") {
      const free = modelUnits.find((unit) => unit.status === "disponible");
      setSelectedUnitNumber((free || modelUnits[0]).unitNumber);
    }
  }, [modelUnits, selectedUnitNumber]);

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
  }, [projectId]);

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

  const chooseRooms = (next: number) => {
    userPickedModel.current = false;
    setRooms(next);
    setModelIndex(0);
    setSelectedUnitNumber("");
  };

  const shiftModel = (dir: number) => {
    if (models.length < 2) return;
    userPickedModel.current = true;
    setModelIndex((slideIndex + dir + models.length) % models.length);
    setSelectedUnitNumber("");
  };

  const onModelSwipe = (event: TouchEvent<HTMLDivElement>) => {
    if (modelTouch.current == null || models.length < 2) return;
    const dx = event.changedTouches[0].clientX - modelTouch.current;
    if (dx > 40) shiftModel(-1);
    if (dx < -40) shiftModel(1);
    modelTouch.current = null;
  };

  const cardPrice = (model: DomusModel) => {
    const list = units.filter((unit) => unit.modelo.trim() === model.id && unit.rooms === model.rooms);
    const selected = activeUnit && activeUnit.modelo.trim() === model.id && activeUnit.status === "disponible" ? listedPrice(activeUnit) : 0;
    if (selected > 0) return `USD ${formatDomusUsd(selected)}`;
    const from = minListed(list);
    if (from == null) return "Agotado";
    return `Desde USD ${formatDomusUsd(from)}`;
  };

  const openModel = (view: "depto" | "planta" | "ficha") => {
    if (!currentModel) return;
    setZoom({
      view,
      title: currentModel.name,
      caption: `${formatM2(activeUnit?.areaM2 || currentModel.areaM2)} m² · ${ROOM_LABEL[currentModel.rooms] || ""}`,
      art: currentModel.art,
    });
  };

  const handleShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}${meta.sharePath}`;
    const priceLine = fromAny == null ? "Consulta las opciones disponibles." : `Desde USD ${formatDomusUsd(fromAny)}.`;
    const shareText = `${display}, ${project.zone}. ${priceLine}`;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: display, text: shareText, url: shareUrl });
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
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "Lead", { content_name: display });
    }
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: projectId,
      operacion: "Preventa",
      zona: project.zone,
      presupuesto: quote ? String(quote.total) : undefined,
      extraFilters: activeUnit ? { unidad: activeUnit.unitNumber, piso: activeUnit.floor, modelo: activeUnit.modelo, plan, adicional: addon } : { plan },
    }).catch(() => {});
    const unitLine = activeUnit
      ? `Unidad ${activeUnit.unitNumber}, piso ${activeUnit.floor}, modelo ${activeUnit.modelo} (${formatM2(activeUnit.areaM2)} m²)`
      : display;
    const addonLine = addon === "none" || projectId !== "domus-insignia"
      ? ""
      : `\n• Parqueo: USD ${formatDomusUsd(addonUsd)}`;
    const money = quote
      ? `\n• Inversión total: USD ${formatDomusUsd(quote.total)}\n• A la firma: USD ${formatDomusUsd(quote.initial)}\n• Saldo contra entrega: ${quote.balance == null ? (plan === "hastaEntrega" ? "el total se cancela hasta la entrega" : "sin saldo pendiente") : `USD ${formatDomusUsd(quote.balance)}`}`
      : "";
    const text = `Hola, vengo de N.I.A y me interesa comprar en ${display} (${project.address}):\n\n• ${unitLine}\n• Modalidad: ${planTitle(plan)}${addonLine}${money}\n\n¿Me confirman la disponibilidad y las condiciones para reservar?`;
    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const coverRows = roomOptions.map((room) => {
    const list = units.filter((unit) => unit.rooms === room);
    const areas = list.map((unit) => unit.areaM2).filter((area) => area > 0);
    const low = areas.length ? Math.min(...areas) : 0;
    const high = areas.length ? Math.max(...areas) : 0;
    return {
      label: ROOM_LABEL[room] || "Departamento",
      area: low && high ? (low === high ? `${formatM2(low)} m²` : `${formatM2(low)} a ${formatM2(high)} m²`) : "",
      price: minListed(list),
    };
  });
  const barText = selectedCash != null
    ? `USD ${formatDomusUsd(selectedCash)}${meta.delivery ? ` · ${meta.delivery}` : ""}`
    : fromAny != null
      ? `Desde USD ${formatDomusUsd(fromAny)}${meta.delivery ? ` · ${meta.delivery}` : ""}`
      : meta.delivery || "Sin unidades disponibles en la lista";

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
        <img src={meta.hero} alt={`Fachada de ${display}`} className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
        <div className="relative z-10 px-5 pb-24 pt-16 text-white lg:px-7 lg:pb-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e8d5a8] backdrop-blur-md">
              <Sparkles size={12} />
              {meta.stage}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
              <MapPin size={12} className="text-[#e8d5a8]" />
              {project.zone}
            </span>
          </div>
          <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 font-serif leading-none drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]">
            <span className="text-4xl font-light tracking-wide md:text-5xl">{titleFirst}</span>
            {titleRest ? <span className="text-2xl font-light text-[#e8d5a8] md:text-3xl">{titleRest}</span> : null}
          </h1>
          {tagline ? <p className="mt-2 max-w-md text-sm leading-snug text-white/90">{tagline}</p> : null}
          <div className="mt-3 flex max-w-lg gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Calendar size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">{meta.delivery ? "Entrega publicada" : "Dirección"}</p>
                <p className="mt-0.5 text-sm font-medium leading-tight">{meta.delivery || project.address}</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 items-start gap-2 rounded-2xl border border-white/15 bg-black/40 px-3 py-2.5 backdrop-blur-md">
              <Building2 size={15} className="mt-0.5 shrink-0 text-[#e8d5a8]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8d5a8]">Constructora</p>
                <p className="mt-0.5 text-sm font-medium leading-tight">Alborada Group Bolivia SRL</p>
              </div>
            </div>
          </div>
          {coverRows.length > 0 && (
            <div className="mt-2 max-w-lg rounded-2xl border border-[#e8d5a8]/30 bg-black/55 px-3.5 py-3 backdrop-blur-md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e8d5a8]">Departamentos disponibles</p>
              <div className="mt-2 space-y-2">
                {coverRows.map((row) => (
                  <div key={row.label} className="flex items-end justify-between gap-3 border-t border-white/10 pt-2 first:border-0 first:pt-0">
                    <div className="min-w-0">
                      <p className="text-sm text-white">{row.label}</p>
                      {row.area ? <p className="text-[11px] text-white/70">{row.area}</p> : null}
                    </div>
                    <p className="shrink-0 text-right font-serif text-sm font-semibold">{row.price == null ? "Agotado" : `Desde USD ${formatDomusUsd(row.price)}`}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div ref={rightPanelRef} className="relative min-h-0 flex-1 md:h-screen md:overflow-y-auto">
        <div className="mx-auto max-w-xl px-5 py-8 pb-32 md:max-w-3xl md:px-10 md:py-14 md:pb-44 lg:max-w-4xl lg:px-14 xl:max-w-5xl">
          <section id="intro" className="scroll-mt-6 space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">
                <Sparkles size={13} />
                {copy.kicker}
              </span>
              <h2 className="font-serif text-3xl font-light leading-tight text-[#1C1917] md:text-5xl">
                Vive en {display}.
                {tagline ? <span className="mt-1 block font-normal italic text-[#9a7b45]">{copy.subtitle}</span> : null}
              </h2>
              <p className="pt-2 text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word] md:text-base">
                {copy.intro}
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#E7E5E4] bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{meta.listLabel ? `Lista del ${meta.listLabel}` : "Lista publicada"}</p>
                <p className="mt-0.5 font-serif text-lg font-bold text-stone-900">{units.length ? `${takenCount} de ${units.length} unidades vendidas o reservadas` : "Lista del proyecto"}</p>
              </div>
              {units.length > 0 && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Quedan {freeCount}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => scrollToSection("disponibilidad")} className="flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md">
                Encuentra tu departamento
              </button>
              <a href={meta.brochure} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-stone-800">
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
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">{copy.locationTitle}</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">{copy.locationBody} Encuéntralo en {project.address}, {project.city}.</p>
            {meta.lugarImage && (
              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <img src={meta.lugarImage} alt={`Ubicación de ${display}`} className="block h-auto w-full" />
              </div>
            )}
            {meta.nearby && (
              <ul className="grid grid-cols-2 gap-2 text-sm text-stone-700">
                {meta.nearby.map((place) => <li key={place}>{place}</li>)}
              </ul>
            )}
            <a href={`https://maps.google.com/?q=${project.lat},${project.lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              Explorar la ubicación en el mapa <ArrowRight size={14} />
            </a>
          </section>

          <section id="amenidades" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Áreas sociales</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">{copy.amenitiesTitle}</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">{copy.amenitiesIntro} Imágenes referenciales del proyecto.</p>
            {amenity && (
              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <div className="relative">
                  <img src={amenity.image} alt={amenity.name} className="aspect-[16/10] w-full object-cover" />
                  {meta.amenities.length > 1 && (
                    <>
                      <button type="button" onClick={() => setAmenityIndex((index) => (index + meta.amenities.length - 1) % meta.amenities.length)} className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Anterior"><ChevronLeft size={18} /></button>
                      <button type="button" onClick={() => setAmenityIndex((index) => (index + 1) % meta.amenities.length)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-stone-800 shadow-md" aria-label="Siguiente"><ChevronRight size={18} /></button>
                    </>
                  )}
                </div>
                <div className="space-y-1.5 px-5 py-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9a7b45]">{amenity.category}</span>
                  <h4 className="font-serif text-2xl text-stone-900">{amenity.name}</h4>
                  <p className="text-sm leading-relaxed text-stone-600">{amenity.description}</p>
                </div>
              </div>
            )}
          </section>

          <section id="tipologias" className="mt-20 scroll-mt-2 border-t border-stone-200/80 pt-6">
            <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
              <div className="shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Tipologías</span>
                <h3 className="font-serif text-2xl font-light leading-tight text-[#1C1917]">{copy.typologiesTitle}</h3>
              </div>
              {roomOptions.length > 0 && (
                <div className={`grid shrink-0 gap-2 ${roomOptions.length >= 4 ? "grid-cols-2 sm:grid-cols-4" : roomOptions.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                  {roomOptions.map((room) => {
                    const from = minListed(units.filter((unit) => unit.rooms === room));
                    return (
                      <button key={room} type="button" onClick={() => chooseRooms(room)} className={`rounded-xl border p-3 text-left ${activeRooms === room ? "border-[#9a7b45] bg-white ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white"}`}>
                        <p className="text-sm font-bold">{ROOM_LABEL[room]}</p>
                        <p className="text-[11px] text-[#9a7b45]">{from == null ? "Agotado" : `Desde USD ${formatDomusUsd(from)}`}</p>
                      </button>
                    );
                  })}
                </div>
              )}
              {currentModel && (
                <ModelFrame
                  model={currentModel}
                  index={slideIndex}
                  total={models.length}
                  price={cardPrice(currentModel)}
                  frameClass="min-h-0 flex-1"
                  onPrev={() => shiftModel(-1)}
                  onNext={() => shiftModel(1)}
                  onOpen={openModel}
                  onTouchStart={(event) => { modelTouch.current = event.changedTouches[0].clientX; }}
                  onTouchEnd={onModelSwipe}
                />
              )}
            </div>
          </section>

          <section id="equipamiento" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Equipamiento</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">{copy.equipmentTitle}</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">{copy.equipmentBody}</p>
            {currentModel?.art.preview && (
              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <img src={currentModel.art.preview} alt={currentModel.name} className="aspect-[16/10] w-full object-contain bg-white" />
              </div>
            )}
            <a href={meta.brochure} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#816127]">
              <Download size={15} /> {projectId === "domus-onix" ? "Explorar las láminas del proyecto" : "Conocer acabados y detalles"} <ArrowRight size={14} />
            </a>
          </section>

          <section id="constructora" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Constructora</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">{copy.developerTitle}</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              {copy.developerBody}
            </p>
            <button
              type="button"
              onClick={() => setZoom({ view: "solo", src: ALBORADA_PROJECTS_IMAGE, title: "Alborada Group · Proyectos Domus", caption: "Conoce los siete edificios Domus y sus fechas de entrega." })}
              className="block w-full overflow-hidden rounded-2xl border border-stone-200 bg-black shadow-sm"
              aria-label="Ampliar los proyectos Domus de Alborada Group"
            >
              <img
                src={ALBORADA_PROJECTS_IMAGE}
                alt="Alborada Group y RE/MAX Black: los siete proyectos Domus y sus fechas de entrega"
                width={1280}
                height={1600}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
              />
              <span className="flex items-center justify-center gap-2 bg-white px-4 py-3 text-xs font-semibold text-[#816127]">
                Ver proyectos y fechas de entrega <ArrowRight size={14} />
              </span>
            </button>
          </section>

          <section id="pago" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200/80 pt-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Formas de pago</span>
            <h3 className="font-serif text-2xl font-light text-[#1C1917] md:text-3xl">{copy.paymentTitle}</h3>
            <p className="text-sm leading-relaxed text-[#57534E] [text-align:justify] [text-justify:inter-word]">
              {copy.paymentIntro} {plans.includes("inicial40") || plans.includes("inicial60")
                ? "Las modalidades con inicial distribuyen el pago del departamento entre la firma y la entrega. Revisa el porcentaje y el saldo de cada opción; los adicionales se muestran por separado."
                : plans.includes("hastaEntrega")
                  ? "Solicita el calendario de desembolsos de la modalidad de pago hasta la entrega para organizar tu compra."
                  : "Consulta el precio al contado de tu unidad y las condiciones para formalizar la compra."}
            </p>
            {plans.includes("contado") && (
              <article className="rounded-2xl bg-stone-900 p-5 text-white shadow-lg">
                <h4 className="font-serif text-2xl">Tu compra al contado: 100% a la firma</h4>
                <p className="mt-2 font-serif text-3xl text-[#E8D5A8]">{rateSpan(units.filter((unit) => unit.cashTotal > 0).map((unit) => unit.cashPerM2))}</p>
              </article>
            )}
            {plans.includes("inicial60") && (
              <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <h4 className="font-serif text-2xl leading-snug">Empieza con 60% · saldo contra entrega</h4>
                <p className="mt-2 font-serif text-3xl text-stone-900">{rateSpan(units.map((unit) => unit.initial60PerM2 || 0))}</p>
              </article>
            )}
            {plans.includes("inicial40") && (
              <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <h4 className="font-serif text-2xl leading-snug">Empieza con 40% · saldo contra entrega</h4>
                <p className="mt-2 font-serif text-3xl text-stone-900">{rateSpan(units.map((unit) => unit.initial40PerM2 || 0))}</p>
              </article>
            )}
            {plans.includes("hastaEntrega") && (
              <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <h4 className="font-serif text-2xl leading-snug">Organiza tu pago total hasta la entrega</h4>
                <p className="mt-2 font-serif text-3xl text-stone-900">{rateSpan(units.map((unit) => unit.planPerM2 || 0))}</p>
              </article>
            )}
            {projectId === "domus-insignia" && (
              <p className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
                Parqueo interior techado, fuera del metro cuadrado: parqueos 1 a 3 a USD 9.000 contado (USD 9.500 en plan) y parqueo 4 a USD 9.500 contado (USD 10.000 en plan).
              </p>
            )}
            <button type="button" onClick={() => scrollToSection("disponibilidad")} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white">
              Elegir mi departamento <ArrowRight size={14} />
            </button>
          </section>

          <section id="disponibilidad" className="mt-20 scroll-mt-2 space-y-6 border-t border-stone-200/80 pt-6">
            <div className="flex h-[calc(100svh-7.25rem)] flex-col gap-3">
              <div className="shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7b45]">Disponibilidad</span>
                <h3 className="font-serif text-2xl font-light leading-tight text-[#1C1917]">{copy.availabilityTitle}</h3>
                <p className="mt-1 text-xs text-stone-500">{meta.listLabel ? `Lista del ${meta.listLabel}. ` : ""}Verde: disponible · Gris: vendido o reservado.</p>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 1 · Tipología</p>
                <div className={`grid shrink-0 gap-2 ${roomOptions.length >= 4 ? "grid-cols-2 sm:grid-cols-4" : roomOptions.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                  {roomOptions.map((room) => {
                    const from = minListed(units.filter((unit) => unit.rooms === room));
                    return (
                      <button key={room} type="button" onClick={() => chooseRooms(room)} className={`rounded-xl border p-3 text-left ${activeRooms === room ? "border-[#9a7b45] bg-white ring-1 ring-[#9a7b45]" : "border-stone-200 bg-white"}`}>
                        <p className="text-sm font-bold">{ROOM_LABEL[room]}</p>
                        <p className="text-[11px] text-[#9a7b45]">{from == null ? "Agotado" : `Desde USD ${formatDomusUsd(from)}`}</p>
                      </button>
                    );
                  })}
                </div>
                {currentModel && (
                  <ModelFrame
                    model={currentModel}
                    index={slideIndex}
                    total={models.length}
                    price={cardPrice(currentModel)}
                    frameClass="min-h-0 flex-1"
                    onPrev={() => shiftModel(-1)}
                    onNext={() => shiftModel(1)}
                    onOpen={openModel}
                    onTouchStart={(event) => { modelTouch.current = event.changedTouches[0].clientX; }}
                    onTouchEnd={onModelSwipe}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold uppercase tracking-wider text-stone-500">Paso 2 · Piso</span>
                <span className="flex items-center gap-3">
                  {selectedCash != null && <span className="font-semibold text-[#9a7b45]">USD {formatDomusUsd(selectedCash)}</span>}
                  {meta.floorPlate?.href && (
                    <a href={meta.floorPlate.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#816127]">Ver distribución de pisos</a>
                  )}
                  {meta.floorPlate?.src && (
                    <button type="button" onClick={() => setZoom({ view: "solo", src: meta.floorPlate!.src!, title: meta.floorPlate!.title, caption: meta.floorPlate!.caption })} className="font-semibold text-[#816127]">Ver distribución de pisos</button>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-stone-200 bg-white p-2 sm:grid-cols-5">
                {modelUnits.map((unit) => {
                  const current = activeUnit?.unitNumber === unit.unitNumber;
                  const libre = unit.status === "disponible";
                  return (
                    <button key={unit.unitNumber} type="button" disabled={!libre} onClick={() => setSelectedUnitNumber(unit.unitNumber)} className={`rounded-lg px-1 py-2 text-xs font-semibold ${current ? "bg-stone-900 text-white" : libre ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "cursor-not-allowed bg-stone-100 text-stone-400"}`}>
                      <span className="block">Piso {unit.floor}</span>
                      <span className="block text-[10px] font-normal">Unidad {unit.unitNumber}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {projectId === "domus-insignia" && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso 3 · Parqueo</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {([
                    ["none", "Sin parqueo", "Solo el departamento"],
                    ["p9000", "Parqueos 1 a 3", plan === "contado" ? "USD 9.000" : "USD 9.500"],
                    ["p9500", "Parqueo 4", plan === "contado" ? "USD 9.500" : "USD 10.000"],
                  ] as const).map(([id, label, hint]) => (
                    <button key={id} type="button" onClick={() => setAddon(id)} className={`rounded-xl border p-3 text-left ${addon === id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                      <p className="text-sm font-bold">{label}</p>
                      <p className={`text-[11px] ${addon === id ? "text-stone-300" : "text-stone-500"}`}>{hint}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Paso {projectId === "domus-insignia" ? "4" : "3"} · Plan de pago</p>
              <div className={`grid grid-cols-1 gap-2 ${plans.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                {plans.map((item) => (
                  <button key={item} type="button" onClick={() => setPlan(item)} className={`rounded-xl border p-3 text-left ${plan === item ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white"}`}>
                    <p className="text-sm font-bold">{planTitle(item)}</p>
                    <p className={`text-[11px] ${plan === item ? "text-[#E8D5A8]" : "text-stone-500"}`}>{planHint(item)}</p>
                  </button>
                ))}
              </div>
            </div>

            {activeUnit && activeUnit.status !== "disponible" && (
              <p className="rounded-xl border border-stone-200 bg-stone-100 p-4 text-sm text-stone-600">La unidad {activeUnit.unitNumber} no está disponible en la lista. Elige otro piso.</p>
            )}

            {activeUnit && quote && (
              <div className="space-y-4 rounded-2xl bg-stone-900 p-5 text-white shadow-xl">
                <div className="border-b border-white/10 pb-3 text-xs text-[#E8D5A8]">
                  Unidad {activeUnit.unitNumber} · Piso {activeUnit.floor} · Modelo {activeUnit.modelo} · {formatM2(activeUnit.areaM2)} m²
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Inversión total</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatDomusUsd(quote.total)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">{quote.rate ? `USD ${formatDomusUsd(quote.rate)}/m²` : ""}{quote.addon ? ` + adicional USD ${formatDomusUsd(quote.addon)}` : ""}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{plan === "hastaEntrega" ? "Pago hasta la entrega" : `Cuota inicial (${quote.pct}%)`}</p>
                    <p className="mt-1 font-serif text-2xl font-bold leading-tight text-emerald-400"><span className="block font-mono text-xs font-normal text-emerald-500/80">USD</span>{formatDomusUsd(quote.initial)}</p>
                    <p className="mt-1 text-[10px] text-stone-400">{plan === "contado" ? "A la firma del contrato" : plan === "hastaEntrega" ? "Total del plan elegido" : "A la firma del contrato"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Saldo contra entrega</p>
                    {quote.balance == null ? (
                      <>
                        <p className="mt-1 font-serif text-2xl font-bold leading-tight text-stone-500"><span className="block font-mono text-xs font-normal text-stone-500">USD</span>—</p>
                        <p className="mt-1 text-[10px] text-stone-400">{plan === "hastaEntrega" ? "Consulta el calendario de pagos" : "Sin saldo pendiente"}</p>
                      </>
                    ) : (
                      <>
                        <p className="mt-1 font-serif text-2xl font-bold leading-tight"><span className="block font-mono text-xs font-normal text-stone-400">USD</span>{formatDomusUsd(quote.balance)}</p>
                        <p className="mt-1 text-[10px] text-stone-400">{meta.delivery ? `Contra entrega · ${meta.delivery}` : "Contra entrega"}</p>
                      </>
                    )}
                  </div>
                </div>
                <button type="button" onClick={contactWhatsApp} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-900">
                  <MessageCircle size={16} />
                  Quiero la unidad {activeUnit.unitNumber}
                </button>
              </div>
            )}
          </section>

          <section id="cierre" className="mt-20 scroll-mt-6 space-y-6 border-t border-stone-200 pt-12 pb-16 text-center">
            <h3 className="font-serif text-3xl font-light text-[#1C1917]">{copy.closingTitle}</h3>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-600">{copy.closingBody}</p>
            <button type="button" onClick={contactWhatsApp} className="inline-flex items-center gap-1 text-sm font-semibold text-[#816127]">
              {copy.closingCta} <ArrowRight size={14} />
            </button>
          </section>
        </div>
      </div>

      {activeSection !== "cierre" && (
        <div className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-3 border-t border-stone-200 bg-[#f7f5f0]/95 px-5 py-3 backdrop-blur-md md:left-[44%]">
          <div>
            <p className="text-xs text-stone-700">{barText}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a href={meta.brochure} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-stone-800">
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
                {(["depto", "planta", "ficha"] as const).filter((view) => (view === "depto" ? zoom.art.preview : view === "planta" ? zoom.art.plan : zoom.art.full)).map((view) => (
                  <button key={view} type="button" onClick={() => setZoom({ ...zoom, view })} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${zoom.view === view ? "bg-stone-900 text-white" : "border border-stone-200 bg-white text-stone-600"}`}>
                    {view === "depto" ? "Departamento" : view === "planta" ? "Planta" : "Ficha"}
                  </button>
                ))}
              </div>
            )}
            <div className="flex min-h-0 flex-1 items-center justify-center px-3 pb-4 md:px-10">
              <img
                src={zoom.view === "solo" ? zoom.src : zoom.view === "planta" ? zoom.art.plan : zoom.view === "ficha" ? zoom.art.full : zoom.art.preview || zoom.art.full}
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
