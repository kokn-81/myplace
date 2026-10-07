import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calculator,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  MapPin,
  MessageCircle,
  Percent,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import {
  ONA_ADDRESS,
  ONA_BUILDER,
  ONA_DELIVERY,
  ONA_RESERVE_USD,
  ONA_ZONE,
  formatOnaUsd,
} from "../onaInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose?: () => void;
}

const AMENITY_SLIDES = [
  {
    src: "/ona/piscina.jpg",
    category: "Piscina",
    title: "Piscina",
    description:
      "Piscina amplia con ingreso suave y palmeras en el entorno. Un espacio relajante para refrescarte y disfrutar los días de sol con total comodidad dentro de tu propio edificio.",
  },
  {
    src: "/ona/hidromasaje.jpg",
    category: "Hidromasaje",
    title: "Hidromasaje en Piscina",
    description:
      "Sector de hidromasaje integrado dentro de la piscina principal. El rincón pensado para desconectar de la rutina y relajarte al aire libre al terminar la jornada.",
  },
  {
    src: "/ona/reposeras.jpg",
    category: "Exteriores",
    title: "Deck con Reposeras",
    description:
      "Área de descanso al aire libre junto a la piscina con deck y reposeras, ideal para tomar sol, leer o compartir una tarde tranquila.",
  },
  {
    src: "/ona/sauna.jpg",
    category: "Sauna",
    title: "Sauna Seco",
    description:
      "Sauna seco completamente equipado con revestimiento en madera natural. Diseñado para relajarte, descontracturar el cuerpo y renovar energías sin salir de casa.",
  },
  {
    src: "/ona/gym.jpg",
    category: "Fitness",
    title: "Gimnasio Equipado",
    description:
      "Área de entrenamiento climatizada con máquinas de cardio y fuerza de primera línea. Todo lo necesario para mantener tu rutina activa de forma cómoda y segura.",
  },
  {
    src: "/ona/churrasquera.jpg",
    category: "Churrasqueras",
    title: "Churrasqueras Equipadas",
    description:
      "Dos churrasqueras en el área social con mesón de apoyo y espacio para mesas, preparadas para ser el punto de encuentro en almuerzos y asados familiares de fin de semana.",
  },
  {
    src: "/ona/fogata.jpg",
    category: "Área Social",
    title: "Área Social con Fogata",
    description:
      "Espacio exterior al aire libre con fogonero central y asientos integrados, ideal para disfrutar de conversaciones y veladas agradables por la noche.",
  },
  {
    src: "/ona/salon.jpg",
    category: "Coworking & Eventos",
    title: "Salón de Reuniones y Coworking",
    description:
      "Ambiente polivalente climatizado y equipado para trabajar concentrado, coordinar reuniones de negocios o festejar ocasiones especiales con comodidad.",
  },
  {
    src: "/ona/lobby.jpg",
    category: "Acceso",
    title: "Lobby de Doble Altura con Seguridad",
    description:
      "Recepción amoblada e iluminada con control de acceso y seguridad permanente para brindarte tranquilidad a ti y una bienvenida de primer nivel a tus visitas.",
  },
];

const TYPOLOGIES_DATA = [
  {
    id: "32",
    title: "1 Dormitorio Master",
    area: "32,30 m²",
    image: "/ona/tipo-32.jpg",
    cashPrice: 40375,
    tagline:
      "Excelente distribución para vivienda práctica o inversión de alta demanda de alquiler en Santa Cruz.",
    reservedCopy: "Más de 8 unidades de esta tipología ya reservadas",
    highlights: [
      "Living-comedor integrado con excelente entrada de luz",
      "Cocina de diseño con cajonería y mesón de granito",
      "Dormitorio independiente con ropero empotrado a medida",
      "Baño completo con box de vidrio y grifería monocomando",
    ],
  },
  {
    id: "54",
    title: "2 Dormitorios Confort",
    area: "54,14 m²",
    image: "/ona/tipo-54.jpg",
    cashPrice: 67675,
    tagline:
      "Espacios versátiles para familias jóvenes, parejas o profesionales que requieren un ambiente extra de trabajo.",
    reservedCopy: "Gran demanda: unidades en pisos intermedios ya asignadas",
    highlights: [
      "2 habitaciones independientes con amplios closets empotrados",
      "Living social amplio con circulación optimizada",
      "Cocina americana moderna con barra desayunadora",
      "Ideal para familias jóvenes o alquiler ejecutivo corporativo",
    ],
  },
  {
    id: "92",
    title: "2 Dormitorios con Balcón Suite",
    area: "92,00 m²",
    image: "/ona/tipo-92.jpg",
    cashPrice: 115000,
    tagline:
      "La tipología más amplia de ONA Residences, con balcón terraza y habitaciones diseñadas en suite.",
    reservedCopy: "Unidades exclusivas con reservas activas de 1.ª fase",
    highlights: [
      "86,5 m² propios interiores + 5,55 m² de terraza balcón panorámica",
      "Vista frontal privilegiada hacia Av. Los Cusis",
      "Dormitorios máster en suite con vestidor privado",
      "El estándar residencial más exclusivo de ONA Residences",
    ],
  },
];

type SimTypologyKey = "32" | "54" | "92";
type SimPlanKey = "contado" | "plan60" | "plan40";

interface SimulationConfig {
  title: string;
  shortName: string;
  areaM2: number;
  contado: { initial: number; total: number };
  plan60: { initial: number; total: number };
  plan40: { initial: number; total: number };
  marketValueAtDelivery: number; // calculated at $1,600 USD/m2
  gainAtDelivery: number;        // calculated vs contado
  rentMonthlyMin: number;
  rentMonthlyMax: number;
  rentMonthlyBsMin: number;
  rentMonthlyBsMax: number;
  yieldRange: string;
}

const SIMULATION_CONFIG: Record<SimTypologyKey, SimulationConfig> = {
  "32": {
    title: "1 Dormitorio Master",
    shortName: "1 Dorm (32,3 m²)",
    areaM2: 32.3,
    contado: { initial: 40375, total: 40375 },
    plan60: { initial: 25194, total: 41990 },
    plan40: { initial: 17442, total: 43605 },
    marketValueAtDelivery: 51680,
    gainAtDelivery: 11305,
    rentMonthlyMin: 350,
    rentMonthlyMax: 375,
    rentMonthlyBsMin: 4200,
    rentMonthlyBsMax: 4500,
    yieldRange: "10,4% – 11,1%",
  },
  "54": {
    title: "2 Dormitorios Confort",
    shortName: "2 Dorm (54,1 m²)",
    areaM2: 54.14,
    contado: { initial: 67675, total: 67675 },
    plan60: { initial: 42229, total: 70382 },
    plan40: { initial: 29235, total: 73089 },
    marketValueAtDelivery: 86624,
    gainAtDelivery: 18949,
    rentMonthlyMin: 520,
    rentMonthlyMax: 560,
    rentMonthlyBsMin: 6240,
    rentMonthlyBsMax: 6720,
    yieldRange: "9,2% – 9,9%",
  },
  "92": {
    title: "2 Dormitorios con Balcón Suite",
    shortName: "2 Dorm Suite (92 m²)",
    areaM2: 92.0,
    contado: { initial: 115000, total: 115000 },
    plan60: { initial: 71760, total: 119600 },
    plan40: { initial: 49680, total: 124200 },
    marketValueAtDelivery: 147200,
    gainAtDelivery: 32200,
    rentMonthlyMin: 750,
    rentMonthlyMax: 830,
    rentMonthlyBsMin: 9000,
    rentMonthlyBsMax: 9960,
    yieldRange: "7,8% – 8,7%",
  },
};

export default function OnaLanding({ property, onClose }: Props) {
  const [activeImage, setActiveImage] = useState("/ona/fachada-dia.jpg");
  const [activeLabel, setActiveLabel] = useState("Fachada");
  const [amenityIndex, setAmenityIndex] = useState(0);

  // Estados del Simulador de Inversión en Tiempo Real
  const [simTypology, setSimTypology] = useState<SimTypologyKey>("32");
  const [simPlan, setSimPlan] = useState<SimPlanKey>("contado");
  const [shareFeedback, setShareFeedback] = useState(false);

  const handleShareOna = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://nia-web.com";
    const shareUrl = `${origin}/?proyecto=ona`;
    const shareTitle = "ONA Residences · Preventa en Los Cusis";
    const shareText = "Departamentos de 1 y 2 dormitorios en Los Cusis desde USD 40.375. Conoce ONA Residences:";

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2500);
    } catch {
      // fallback
    }
  };

  const introRef = useRef<HTMLElement>(null);
  const placeRef = useRef<HTMLElement>(null);
  const amenitiesRef = useRef<HTMLElement>(null);
  const typesRef = useRef<HTMLElement>(null);
  const payRef = useRef<HTMLElement>(null);
  const investorRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const scenes: Record<string, { src: string; label: string }> = {
      intro: { src: "/ona/fachada-dia.jpg", label: "Fachada" },
      lugar: { src: "/ona/ubicacion.jpg", label: "Ubicación" },
      amenidades: { src: "/ona/piscina.jpg", label: "Amenidades" },
      tipologias: { src: "/ona/dormitorio.jpg", label: "Tipologías" },
      pago: { src: "/ona/fachada-atardecer.jpg", label: "Formas de Pago" },
      inversion: { src: "/ona/living.jpg", label: "Rentabilidad" },
      cierre: { src: "/ona/fachada-dia.jpg", label: "Reserva 1.ª Fase" },
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const scene = visible ? scenes[visible.target.id] : undefined;
        if (!scene) return;
        setActiveImage(scene.src);
        setActiveLabel(scene.label);
      },
      { threshold: [0.22, 0.5] }
    );

    [introRef, placeRef, amenitiesRef, typesRef, payRef, investorRef, closeRef].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const phone =
    (property.agentWhatsapp || CONTACT_WHATSAPP_NUMBER).replace(/\D/g, "") ||
    CONTACT_WHATSAPP_NUMBER;

  const reserve = (detail: string, budget?: number) => {
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: property.id,
      operacion: "Preventa",
      zona: property.zone || ONA_ZONE,
      presupuesto: budget ? `USD ${formatOnaUsd(budget)}` : `desde USD 40.375`,
    }).catch(() => {});

    // Meta Pixel: disparar evento Lead antes de abrir WhatsApp
    if (typeof window !== "undefined") {
      try {
        if (typeof (window as any).trackOnaLead === "function") {
          (window as any).trackOnaLead();
        } else if (typeof (window as any).fbq === "function") {
          (window as any).fbq("track", "Lead", { content_name: "Ona Residences" });
        }
      } catch (err) {
        console.warn("Meta Pixel Lead error:", err);
      }
    }

    const text = `Hola, vengo de N.I.A. Quiero información para reservar en ONA Residences (${ONA_ZONE}) con USD ${formatOnaUsd(
      ONA_RESERVE_USD
    )}. ${detail}`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const nextAmenity = () => {
    setAmenityIndex((prev) => (prev + 1) % AMENITY_SLIDES.length);
  };

  const prevAmenity = () => {
    setAmenityIndex(
      (prev) => (prev - 1 + AMENITY_SLIDES.length) % AMENITY_SLIDES.length
    );
  };

  const currentSlide = AMENITY_SLIDES[amenityIndex];

  // Métricas del simulador interactivo
  const activeSim = SIMULATION_CONFIG[simTypology];
  const activeSimPlanData = activeSim[simPlan];
  const simNetCapitalGain = activeSim.marketValueAtDelivery - activeSimPlanData.total;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col bg-[#f7f5f0] font-sans text-stone-900 md:flex-row"
    >
      {/* Botón Flotante: Compartir */}
      <div className="fixed right-4 top-4 z-[120] flex items-center gap-2 md:right-7 md:top-7">
        <button
          onClick={handleShareOna}
          className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/95 px-3.5 py-2.5 text-stone-900 shadow-xl backdrop-blur transition-transform hover:scale-105 active:scale-95"
          aria-label="Compartir"
          title="Compartir ONA Residences"
        >
          {shareFeedback ? (
            <>
              <Check size={18} className="text-emerald-600" />
              <span className="text-[11px] font-semibold text-emerald-700">¡Copiado!</span>
            </>
          ) : (
            <>
              <Share2 size={18} />
              <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-wider">Compartir</span>
            </>
          )}
        </button>
      </div>

      {/* PANEL IZQUIERDO: Fotografía Inmersiva Dinámica */}
      <div className="relative h-[32vh] shrink-0 bg-stone-950 md:h-screen md:w-[44%]">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={activeImage}
            src={activeImage}
            alt={`ONA Residences - ${activeLabel}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />
        <div className="absolute bottom-6 left-6 right-16 text-white md:bottom-10 md:left-10">
          <span className="inline-block rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e8d5a8] backdrop-blur-md border border-white/10">
            Preventa Exclusiva · 1.ª Fase · {activeLabel}
          </span>
          <h1 className="mt-3 font-serif text-4xl font-light tracking-wide leading-none md:text-6xl">
            ONA
          </h1>
          <p className="mt-3 max-w-sm text-sm font-light text-white/90 md:text-base leading-relaxed [text-align:justify] [text-justify:inter-word]">
            Eleva tu vida en equilibrio y armonía. Un proyecto contemporáneo en {ONA_ZONE}.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-white/80 font-light">
            <span>Constructora {ONA_BUILDER}</span>
            <span>·</span>
            <span>Entrega {ONA_DELIVERY}</span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[#e8d5a8]">
            <MapPin size={13} /> {ONA_ZONE}
          </p>
        </div>
      </div>

      {/* PANEL DERECHO: Contenido Editorial y Tesis del Inversor */}
      <div className="relative min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-xl px-5 py-8 pb-32 md:px-10 md:py-14">

          {/* 1. HERO / VIVÍ ONA: EXPERIENCIA Y ESTILO DE VIDA */}
          <section id="intro" ref={introRef} className="scroll-mt-6">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Experiencia Residencial & Preventa
              </p>
            </div>

            <h2 className="mt-3 font-serif text-3xl font-light leading-snug text-stone-900 md:text-5xl">
              Viví ONA. <br />
              <span className="italic font-normal text-[#9a7b45]">
                Un proyecto pensado para elevar tu forma de vivir.
              </span>
            </h2>

            <p className="mt-5 text-[15px] font-light leading-relaxed text-stone-600 md:text-base [text-align:justify] [text-justify:inter-word]">
              ONA Residences reúne arquitectura contemporánea, diseño biofílico y ambientes pensados para combinar comodidad, bienestar y estilo en una de las zonas más serenas y cotizadas de Santa Cruz: <strong>{ONA_ZONE}</strong>. Un proyecto concebido por <strong>{ONA_BUILDER}</strong> para quienes entienden que el verdadero confort reside en despertar con calma, disfrutar áreas sociales completas y asegurar una sólida inversión patrimonial.
            </p>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-white/70 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#9a7b45]/10 text-[#9a7b45]">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-[#9a7b45]">
                    Preventa en Marcha · 1.ª Fase
                  </p>
                  <p className="text-sm font-medium text-stone-800">
                    Más de 16 unidades de esta primera fase ya han sido reservadas.
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-stone-500 font-light border-t border-stone-100 pt-2.5 [text-align:justify] [text-justify:inter-word]">
                La oportunidad de ingresar en 1.ª fase asegura la máxima plusvalía acumulada antes de cada actualización de listas de precios del proyecto.
              </p>
            </div>



            {/* Accesos rápidos de navegación */}
            <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-stone-200 pt-4 text-xs font-medium text-stone-500">
              <a href="#lugar" className="hover:text-stone-950 transition-colors">Ubicación</a>
              <a href="#amenidades" className="hover:text-stone-950 transition-colors">Áreas Sociales</a>
              <a href="#tipologias" className="hover:text-stone-950 transition-colors">Tipologías</a>
              <a href="#pago" className="hover:text-stone-950 transition-colors">Formas de Pago</a>
              <a href="#inversion" className="text-[#9a7b45] font-semibold hover:text-stone-950 transition-colors">Rentabilidad & Simulador</a>
            </nav>
          </section>


          {/* 2. UBICACIÓN PRIVILEGIADA & CONECTIVIDAD */}
          <section id="lugar" ref={placeRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Ubicación Insuperable
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Los Cusis: Calma residencial y conectividad total.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Ubicado estratégicamente sobre <strong>{ONA_ADDRESS}</strong>, en el tradicional cuadrante residencial de <strong>{ONA_ZONE}</strong> (entre Banzer y Beni).
              Combina el encanto de un vecindario arbolado y tranquilo con un acceso inmediato a las principales arterias comerciales y empresariales de Santa Cruz.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md">
              <img
                src="/ona/ubicacion.jpg"
                alt="Mapa de ubicación de ONA Residences en Los Cusis"
                className="w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
              />
              <div className="p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="border-l-2 border-[#9a7b45] pl-3">
                    <p className="text-xs font-semibold text-stone-900">Conectividad 360°</p>
                    <p className="text-[12px] text-stone-500 font-light mt-0.5 [text-align:justify] [text-justify:inter-word]">
                      Acceso directo hacia el 2.º y 3.er Anillo, Equipetrol y los distritos empresariales.
                    </p>
                  </div>
                  <div className="border-l-2 border-[#9a7b45] pl-3">
                    <p className="text-xs font-semibold text-stone-900">Entorno Gastronómico</p>
                    <p className="text-[12px] text-stone-500 font-light mt-0.5 [text-align:justify] [text-justify:inter-word]">
                      A minutos de restaurantes de autor, cafés de especialidad, colegios y supermercados.
                    </p>
                  </div>
                  <div className="border-l-2 border-[#9a7b45] pl-3">
                    <p className="text-xs font-semibold text-stone-900">Plusvalía en Alza</p>
                    <p className="text-[12px] text-stone-500 font-light mt-0.5 [text-align:justify] [text-justify:inter-word]">
                      Zona residencial consolidada con alta demanda permanente de alquiler y valorización.
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-stone-100 pt-3 text-right">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${property.lat || -17.763513},${property.lng || -63.177111}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#9a7b45] hover:underline"
                  >
                    <MapPin size={13} /> Ver ubicación en Google Maps
                  </a>
                </div>
              </div>
            </div>
          </section>


          {/* 3. AMENIDADES & ÁREAS SOCIALES */}
          <section id="amenidades" ref={amenitiesRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Áreas Sociales & Comodidades
              </p>
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-3xl font-light text-stone-900 md:text-4xl">
                Espacios pensados para disfrutar cada día.
              </h2>
            </div>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Áreas comunes diseñadas para brindar comodidad, descanso y encuentros agradables con amigos y familia dentro del propio edificio.
            </p>

            {/* CARRUSEL INTERACTIVO */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900 sm:aspect-[16/9]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentSlide.src}
                    src={currentSlide.src}
                    alt={currentSlide.title}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="h-full w-full object-cover"
                  />
                </AnimatePresence>

                {/* Controles de Navegación del Carrusel */}
                <div className="absolute inset-0 flex items-center justify-between p-3 pointer-events-none">
                  <button
                    onClick={prevAmenity}
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-[#9a7b45] hover:scale-105 active:scale-95 shadow-md"
                    aria-label="Anterior amenidad"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={nextAmenity}
                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-[#9a7b45] hover:scale-105 active:scale-95 shadow-md"
                    aria-label="Siguiente amenidad"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>

                <div className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[#e8d5a8] backdrop-blur-md">
                  {currentSlide.category}
                </div>

                <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-mono text-white backdrop-blur-md">
                  {amenityIndex + 1} / {AMENITY_SLIDES.length}
                </div>
              </div>

              {/* Texto persuasivo y justificado de la amenidad activa */}
              <div className="p-6">
                <h3 className="font-serif text-2xl text-stone-900">
                  {currentSlide.title}
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
                  {currentSlide.description}
                </p>

                {/* Miniaturas interactivas */}
                <div className="mt-6 flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 scrollbar-none">
                  {AMENITY_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.title}
                      onClick={() => setAmenityIndex(idx)}
                      className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                        idx === amenityIndex
                          ? "border-[#9a7b45] scale-105 shadow-md ring-2 ring-[#9a7b45]/30"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                      title={slide.title}
                    >
                      <img src={slide.src} alt={slide.title} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>


          {/* 4. TIPOLOGÍAS RESIDENCIALES: PLANOS, INCLUSIONES Y PRECIO INICIAL */}
          <section id="tipologias" ref={typesRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Distribución Arquitectónica
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Un proyecto, distintas formas de vivirlo.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              En ONA Residences podés elegir el departamento según el espacio que realmente necesitás: opciones de 1 y 2 dormitorios concebidas para optimizar cada metro cuadrado y terminaciones de primera.
            </p>

            <div className="mt-8 space-y-10">
              {TYPOLOGIES_DATA.map((tipo) => (
                <article
                  key={tipo.id}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md transition-shadow hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 sm:aspect-[16/10]">
                    <img
                      src={tipo.image}
                      alt={`Plano renderizado de tipología ${tipo.title}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-4 left-4 rounded-full bg-stone-900/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      {tipo.area}
                    </div>
                  </div>

                  <div className="p-6 md:p-7">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-serif text-2xl font-normal text-stone-900">
                        {tipo.title}
                      </h3>
                      <p className="text-sm font-semibold uppercase tracking-wider text-[#9a7b45]">
                        {tipo.area}
                      </p>
                    </div>

                    <p className="mt-2 text-sm font-light text-stone-600 leading-relaxed [text-align:justify] [text-justify:inter-word]">
                      {tipo.tagline}
                    </p>

                    {/* Prueba social positiva */}
                    <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-md bg-[#f6f2ea] px-3 py-1 text-xs font-medium text-[#87652c]">
                      <CheckCircle2 size={13} /> {tipo.reservedCopy}
                    </div>

                    {/* Qué incluye este departamento */}
                    <div className="mt-5 border-t border-stone-100 pt-4">
                      <p className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                        Lo que incluye tu departamento:
                      </p>
                      <ul className="mt-2.5 space-y-2 text-xs font-light text-stone-700">
                        {tipo.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a7b45]" />
                            <span className="[text-align:justify] [text-justify:inter-word]">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Precio inicial */}
                    <div className="mt-6 border-t border-stone-100 pt-5">
                      <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">
                        Precio inicial de preventa
                      </p>
                      <p className="font-serif text-2xl font-medium text-stone-900">
                        Desde USD {formatOnaUsd(tipo.cashPrice)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>


          {/* 5. FORMAS DE PAGO & ESTRUCTURA DE COMPRA (ANTES DEL SIMULADOR) */}
          <section id="pago" ref={payRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Estructura de Compra
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Planes de pago flexibles adaptados a tu estrategia.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Elige cómo distribuir tu capital durante el proceso constructivo con entrega programada para {ONA_DELIVERY}.
            </p>

            {/* LAS 3 FORMAS DE PAGO EXPLICADAS CON SU M² Y VENTAJA */}
            <div className="mt-6 space-y-4">
              {/* Opción 1: Contado */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-stone-900 bg-stone-900 p-6 text-white shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-[#e8d5a8]/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#e8d5a8] border border-[#e8d5a8]/30">
                      Mayor Descuento
                    </span>
                    <h3 className="mt-2 font-serif text-2xl">1. Pago al Contado (100%)</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-light text-[#e8d5a8]">$1.250 <span className="text-xs font-sans text-stone-300">USD/m²</span></p>
                    <p className="text-[11px] text-stone-400">vs $1.600 en la zona</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="text-xs uppercase tracking-wider text-[#e8d5a8] font-semibold">Ventaja Comercial:</p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-stone-200 [text-align:justify] [text-justify:inter-word]">
                    Accedes al valor por m² más bajo de todo el proyecto. Ahorras miles de dólares respecto a planes diferidos y aseguras la mayor tasa de retorno y plusvalía neta al recibir tu llave en {ONA_DELIVERY}.
                  </p>
                </div>
              </div>

              {/* Opción 2: 60% inicial */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-stone-100 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-600">
                      Equilibrio Financiero
                    </span>
                    <h3 className="mt-2 font-serif text-xl text-stone-900">2. Inicial 60% + Saldo contra Entrega (40%)</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-light text-stone-900">$1.300 <span className="text-xs font-sans text-stone-500">USD/m²</span></p>
                    <p className="text-[11px] text-stone-400">vs $1.600 en la zona</p>
                  </div>
                </div>
                <div className="mt-3.5 border-t border-stone-100 pt-3">
                  <p className="text-xs uppercase tracking-wider text-[#9a7b45] font-semibold">Ventaja Comercial:</p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
                    El balance perfecto entre liquidez y rendimiento. Congelas tu unidad con un precio por metro cuadrado muy por debajo del promedio del mercado y pagas el 40% restante recién cuando la obra esté 100% finalizada.
                  </p>
                </div>
              </div>

              {/* Opción 3: 40% inicial */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-stone-100 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-600">
                      Entrada Cómoda
                    </span>
                    <h3 className="mt-2 font-serif text-xl text-stone-900">3. Inicial 40% + Saldo contra Entrega (60%)</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-light text-stone-900">$1.350 <span className="text-xs font-sans text-stone-500">USD/m²</span></p>
                    <p className="text-[11px] text-stone-400">vs $1.600 en la zona</p>
                  </div>
                </div>
                <div className="mt-3.5 border-t border-stone-100 pt-3">
                  <p className="text-xs uppercase tracking-wider text-[#9a7b45] font-semibold">Ventaja Comercial:</p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
                    El menor desembolso de entrada para ingresar a un edificio de categoría en {ONA_ZONE}. Te permite asegurar y congelar tu propiedad hoy, mientras cancelas el 60% en {ONA_DELIVERY}.
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN PARQUEOS: CONCISA Y BREVE */}
            <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-700">
                  <Car size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Estacionamiento & Almacenamiento
                  </p>
                  <p className="font-serif text-lg text-stone-900">
                    Parqueos cubiertos con baulera individual desde{" "}
                    <strong className="text-[#9a7b45]">USD 15.000</strong>
                  </p>
                </div>
              </div>
              <p className="mt-2.5 text-xs font-light text-stone-500 leading-relaxed border-t border-stone-100 pt-2.5 [text-align:justify] [text-justify:inter-word]">
                Disponibilidad en Planta Baja y Subsuelo con opciones de estacionamiento simple y doble. Cada parqueo incluye su propia baulera privada independiente.
              </p>
            </div>
          </section>


          {/* 6. RENTABILIDAD & PLUSVALÍA (CON SIMULADOR EN TIEMPO REAL) */}
          <section id="inversion" ref={investorRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Rentabilidad & Plusvalía
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Por qué invertir en ONA Residences es tu mejor decisión.
            </h2>
            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600 [text-align:justify] [text-justify:inter-word]">
              Una inversión inteligente combina precio de entrada en 1.ª fase, ubicación residencial de alta demanda de alquiler y una sólida tasa de revalorización en dólares.
            </p>

            {/* BLOQUE A: VALOR COMPARATIVO */}
            <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#9a7b45]/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#816127]">
                  Anclaje de Valor
                </span>
              </div>
              <h3 className="mt-2 font-serif text-2xl text-stone-900">
                A 4 minutos de Equipetrol, con todos los beneficios de {ONA_ZONE}.
              </h3>
              <p className="mt-2 text-xs text-stone-600 font-light leading-relaxed [text-align:justify] [text-justify:inter-word]">
                Disfruta de la cercanía inmediata a los centros gastronómicos, comerciales y empresariales más vibrantes de Santa Cruz, con la serenidad, arboledas y conectividad de un entorno residencial consolidado. ONA Residences te permite asegurar un valor de preventa preferencial en 1.ª fase con un alto potencial de plusvalía y retorno.
              </p>

              <div className="mt-5">
                {/* ONA en Los Cusis */}
                <div className="rounded-xl border-2 border-[#9a7b45] bg-[#fbf9f4] p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#9a7b45] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-bl-lg">
                    Ventaja Preventa
                  </div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#816127]">
                      ONA Residences · {ONA_ZONE} (1.ª Fase)
                    </p>
                    <p className="font-serif text-2xl text-stone-900 font-medium">
                      $1.250 <span className="text-xs font-sans text-stone-500">USD/m²</span>
                    </p>
                  </div>
                  <ul className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-800 font-light border-t border-[#9a7b45]/20 pt-3">
                    <li>• Entrada mínima 1 dorm: <strong className="text-stone-900 block mt-0.5">Desde USD 40.375</strong></li>
                    <li>• Retorno anual por alquiler: <strong className="text-[#816127] block mt-0.5">10,4% – 11,1% en USD</strong></li>
                    <li>• Plusvalía a la entrega: <strong className="text-stone-900 block mt-0.5">+28% ($1.600 USD/m²)</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* BLOQUE B: OPORTUNIDAD DE PREVENTA - PISO HISTÓRICO */}
            <div className="mt-8 rounded-2xl border-2 border-stone-900 bg-stone-900 p-6 text-white shadow-xl">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-[#e8d5a8]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#e8d5a8]">
                  Oportunidad de Preventa · 1.ª Fase
                </span>
              </div>
              <h3 className="mt-2 font-serif text-2xl text-white">
                Asegura el piso de preventa antes de futuras actualizaciones de valor.
              </h3>
              <p className="mt-2 text-xs text-stone-300 font-light leading-relaxed [text-align:justify] [text-justify:inter-word]">
                Los desarrollos inmobiliarios serios escalonan sus listas de precios conforme avanza la obra. Ingresar hoy al valor base de <strong>$1.250 USD/m²</strong> asegura la máxima plusvalía acumulada frente al valor referencial de entrega de <strong>$1.600 USD/m²</strong> en {ONA_DELIVERY}.
              </p>

              <div className="mt-5 rounded-xl border border-white/15 bg-white/5 p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-center sm:text-left">
                  <div className="border-b sm:border-b-0 sm:border-r border-white/10 pb-2 sm:pb-0 sm:pr-2">
                    <p className="text-[11px] uppercase tracking-wider text-stone-400">1 Dormitorio (32,3 m²)</p>
                    <p className="mt-1 text-xs text-stone-300 font-light">Plusvalía a la entrega:</p>
                    <p className="mt-0.5 font-serif text-lg text-[#e8d5a8] font-semibold">+USD 11.305</p>
                  </div>
                  <div className="border-b sm:border-b-0 sm:border-r border-white/10 pb-2 sm:pb-0 sm:pr-2">
                    <p className="text-[11px] uppercase tracking-wider text-stone-400">2 Dormitorios (54,1 m²)</p>
                    <p className="mt-1 text-xs text-stone-300 font-light">Plusvalía a la entrega:</p>
                    <p className="mt-0.5 font-serif text-lg text-[#e8d5a8] font-semibold">+USD 18.949</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-stone-400">2 Dormitorios Suite (92 m²)</p>
                    <p className="mt-1 text-xs text-stone-300 font-light">Plusvalía a la entrega:</p>
                    <p className="mt-0.5 font-serif text-lg text-[#e8d5a8] font-semibold">+USD 32.200</p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-[#e8d5a8] font-light [text-align:justify] [text-justify:inter-word]">
                Reserva hoy con <strong>USD {formatOnaUsd(ONA_RESERVE_USD)}</strong> y congela el precio de 1.ª fase antes de la primera actualización de lista del proyecto.
              </p>
            </div>

            {/* BLOQUE C: SIMULADOR INTERACTIVO DE INVERSIÓN Y CASHFLOW */}
            <div className="mt-8 rounded-2xl border-2 border-[#9a7b45]/60 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Calculator size={18} className="text-[#9a7b45]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#816127]">
                    Simulador Financiero en Tiempo Real
                  </span>
                </div>
                <span className="rounded-full bg-[#f6f2ea] px-3 py-0.5 text-[10px] font-semibold text-[#816127]">
                  Fase 1
                </span>
              </div>

              <h3 className="mt-2 font-serif text-2xl text-stone-900">
                Calcula tu ganancia neta y retorno de alquiler.
              </h3>
              <p className="mt-1.5 text-xs text-stone-600 font-light [text-align:justify] [text-justify:inter-word]">
                Elige la tipología y tu plan de pago para visualizar la plusvalía estimada antes de la entrega y el flujo de caja proyectado mensual.
              </p>

              {/* Selector de Tipología */}
              <div className="mt-5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 block mb-2">
                  1. Selecciona la Tipología:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(["32", "54", "92"] as SimTypologyKey[]).map((key) => {
                    const item = SIMULATION_CONFIG[key];
                    const isSelected = simTypology === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setSimTypology(key)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? "border-stone-900 bg-stone-900 text-white shadow-md"
                            : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400"
                        }`}
                      >
                        <p className={`text-xs font-semibold ${isSelected ? "text-[#e8d5a8]" : "text-stone-900"}`}>
                          {item.shortName}
                        </p>
                        <p className="mt-1 text-[11px] font-light opacity-80">
                          Desde USD {formatOnaUsd(item.contado.total)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selector de Plan de Pago */}
              <div className="mt-5">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 block mb-2">
                  2. Selecciona la Modalidad de Pago:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { key: "contado", label: "Al Contado", desc: "$1.250 USD/m²" },
                    { key: "plan60", label: "60% Inicial / 40%", desc: "$1.300 USD/m²" },
                    { key: "plan40", label: "40% Inicial / 60%", desc: "$1.350 USD/m²" },
                  ].map((p) => {
                    const isSelected = simPlan === p.key;
                    return (
                      <button
                        key={p.key}
                        onClick={() => setSimPlan(p.key as SimPlanKey)}
                        className={`rounded-xl border p-2.5 text-center transition-all ${
                          isSelected
                            ? "border-[#9a7b45] bg-[#fbf9f4] text-[#816127] ring-1 ring-[#9a7b45]"
                            : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                        }`}
                      >
                        <p className="text-xs font-semibold">{p.label}</p>
                        <p className="text-[10px] text-stone-500 mt-0.5">{p.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TABLERO DE RESULTADOS EN VIVO */}
              <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-[11px] uppercase tracking-widest font-bold text-stone-500 mb-3">
                  Resultados Proyectados para {activeSim.title}:
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-white p-3.5 border border-stone-200/80">
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                      Desembolso Inicial Requerido
                    </p>
                    <p className="mt-1 font-serif text-2xl font-bold text-stone-900">
                      USD {formatOnaUsd(activeSimPlanData.initial)}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5 font-light">
                      Costo total unidad: USD {formatOnaUsd(activeSimPlanData.total)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3.5 border border-stone-200/80">
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                      Valor a la Entrega ($1.600/m²)
                    </p>
                    <p className="mt-1 font-serif text-2xl font-bold text-[#816127]">
                      USD {formatOnaUsd(activeSim.marketValueAtDelivery)}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      Plusvalía neta: +USD {formatOnaUsd(simNetCapitalGain)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3.5 border border-stone-200/80">
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                      Alquiler Mensual Estimado
                    </p>
                    <p className="mt-1 font-serif text-2xl font-bold text-stone-900">
                      ${activeSim.rentMonthlyMin} – ${activeSim.rentMonthlyMax} <span className="text-xs font-sans text-stone-500">USD</span>
                    </p>
                    <p className="text-[11px] font-medium text-stone-700 mt-0.5">
                      Bs {activeSim.rentMonthlyBsMin.toLocaleString("es-BO")} – {activeSim.rentMonthlyBsMax.toLocaleString("es-BO")}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5 font-light">
                      TC referencial: 12 Bs/USD
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3.5 border border-stone-200/80">
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                      Rentabilidad Anual Estimada
                    </p>
                    <p className="mt-1 font-serif text-2xl font-bold text-emerald-700">
                      {activeSim.yieldRange}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5 font-light">
                      Retorno en dólares libre de inflación
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-stone-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-stone-600 font-light text-center sm:text-left">
                    Congela estos números de 1.ª fase con tu reserva de <strong>USD {formatOnaUsd(ONA_RESERVE_USD)}</strong>.
                  </p>
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
                        (window as any).fbq("track", "Lead", { content_name: "Ona Residences" });
                      }
                      reserve(
                        `Hola, utilicé el simulador de ONA. Quiero reservar la tipología ${activeSim.title} (${activeSim.areaM2} m²) en modalidad ${simPlan === "contado" ? "Al Contado" : simPlan === "plan60" ? "60% Inicial" : "40% Inicial"} con ganancia de capital estimada de USD ${formatOnaUsd(simNetCapitalGain)}. Por favor indíquenme qué pisos siguen disponibles.`
                      );
                    }}
                    className="w-full sm:w-auto bg-stone-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-[#9a7b45] active:scale-95 shadow-md shrink-0"
                  >
                    Congelar Esta Unidad
                  </button>
                </div>
              </div>
            </div>
          </section>


          {/* 7. CIERRE DE CONVERSIÓN & LLAMADO A LA ACCIÓN FINAL */}
          <section id="cierre" ref={closeRef} className="scroll-mt-6 mt-20 border-t border-stone-200 pt-12 text-center">
            <ShieldCheck size={28} className="mx-auto text-[#9a7b45]" />
            <h2 className="mt-3 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Asegura tu unidad al valor de 1.ª fase.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm font-light text-stone-600 leading-relaxed [text-align:justify] [text-justify:inter-word]">
              Reserva hoy tu departamento con <strong>USD {formatOnaUsd(ONA_RESERVE_USD)}</strong> y congela el precio
              antes de la siguiente escala de preventa.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
                    (window as any).fbq("track", "Lead", { content_name: "Ona Residences" });
                  }
                  reserve("Quiero que un asesor me presente las unidades disponibles de 1.ª fase y me ayude a elegir.");
                }}
                className="bg-stone-900 px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-xl transition-all hover:bg-[#9a7b45] active:scale-95"
              >
                Reservar con USD {formatOnaUsd(ONA_RESERVE_USD)}
              </button>
            </div>

            <p className="mt-8 text-[11px] leading-relaxed text-stone-400">
              Constructora {ONA_BUILDER} · Entrega programada {ONA_DELIVERY} · {ONA_ZONE}. Las imágenes y renders son de carácter arquitectónico referencial.
            </p>
          </section>

        </div>
      </div>

      {/* BARRA INFERIOR FLOTANTE DE CONVERSIÓN RÁPIDA (se oculta al llegar al bloque de cierre para no duplicar botones) */}
      <AnimatePresence>
        {activeLabel !== "Reserva 1.ª Fase" && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-3 border-t border-stone-200 bg-[#f7f5f0]/95 px-5 py-3 backdrop-blur-md md:left-[44%]"
          >
            <div>
              <p className="text-xs text-stone-600">
                Reserva con{" "}
                <span className="font-semibold text-stone-900">
                  USD {formatOnaUsd(ONA_RESERVE_USD)}
                </span>
              </p>
              <p className="text-[10px] text-[#9a7b45] font-medium hidden sm:block">
                Congela el precio de preventa hoy
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareOna}
                className="flex items-center gap-1.5 border border-stone-300 bg-white px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-800 shadow-sm transition-all hover:bg-stone-100 active:scale-95"
                title="Compartir ONA Residences"
              >
                {shareFeedback ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-700">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} />
                    <span className="hidden sm:inline">Compartir</span>
                  </>
                )}
              </button>

              <button
                onClick={() =>
                  closeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="bg-stone-900 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-md transition-all hover:bg-[#9a7b45] active:scale-95"
              >
                Reservar Ahora
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
