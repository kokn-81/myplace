import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Building2,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import {
  ONA_ADDRESS,
  ONA_BROCHURE_URL,
  ONA_BUILDER,
  ONA_DELIVERY,
  ONA_RESERVE_USD,
  formatOnaUsd,
} from "../onaInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose: () => void;
}

const AMENITY_SLIDES = [
  {
    src: "/ona/piscina.jpg",
    category: "Relax & Bienestar",
    title: "Piscina Tipo Playa con Solarium",
    description:
      "Un espejo de agua cristalina concebido como una playa privada. Aguas templadas, solarium perimetral y palmeras para transformar tus fines de semana en una experiencia de resort sin salir de tu hogar.",
  },
  {
    src: "/ona/hidromasaje.jpg",
    category: "Hidroterapia",
    title: "Hidromasaje Integrado",
    description:
      "Sector de hidroterapia con hidrojets integrados dentro de la piscina principal. El rincón predilecto para desconectar de la rutina al atardecer bajo el cielo abierto de Santa Cruz.",
  },
  {
    src: "/ona/reposeras.jpg",
    category: "Exteriores",
    title: "Deck & Reposeras Tropicales",
    description:
      "Espacios de contemplación y descanso diseñados con calidez de madera tratada y vegetación biofílica, ideales para la lectura, el bronceado o un café matutino.",
  },
  {
    src: "/ona/sauna.jpg",
    category: "Spa Privado",
    title: "Sauna Seco & Circuito Wellness",
    description:
      "Un sauna completamente equipado con revestimiento en madera noble. Diseñado para purificar el cuerpo, relajar la musculatura y reactivar la energía al finalizar cada jornada.",
  },
  {
    src: "/ona/gym.jpg",
    category: "Fitness",
    title: "Gimnasio Panorámico de Alto Rendimiento",
    description:
      "Área fitness luminosa con máquinas cardiovasculares y musculación de primera línea. Entrena a tu propio ritmo con vista abierta y climatización integral.",
  },
  {
    src: "/ona/churrasquera.jpg",
    category: "Gastronomía",
    title: "Sky Churrasqueras Gourmet",
    description:
      "Dos estaciones parrilleras profesionales con mesones de apoyo, mobiliario para comensales y el equipamiento necesario para ser el mejor anfitrión de asados y eventos familiares.",
  },
  {
    src: "/ona/fogata.jpg",
    category: "Social Lounge",
    title: "Lounge con Fogata al Aire Libre",
    description:
      "Atmósfera íntima al aire libre con fogonero central. El escenario ideal para disfrutar de buenas conversaciones, vino y veladas inolvidables bajo las estrellas.",
  },
  {
    src: "/ona/salon.jpg",
    category: "Trabajo & Eventos",
    title: "Salón Social & Coworking Ejecutivo",
    description:
      "Ambiente polivalente climatizado con wifi de alta velocidad, mobiliario ergonómico y baño propio para reuniones de negocios, home office de alto nivel o celebraciones privadas.",
  },
  {
    src: "/ona/lobby.jpg",
    category: "Acceso & Seguridad",
    title: "Lobby Monumental de Doble Altura",
    description:
      "Una imponente recepción con diseño de autor, iluminación escénica, control de acceso digital inteligente y seguridad 24/7 que proyecta prestigio y distinción a tus invitados.",
  },
];

const TYPOLOGIES_DATA = [
  {
    id: "32",
    title: "1 Dormitorio Master",
    area: "32,30 m²",
    image: "/ona/tipo-32.jpg",
    cashPrice: 40375,
    tagline: "Máxima rentabilidad para inversores o vivienda práctica.",
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
    tagline: "Distribución funcional para parejas o un ambiente extra de trabajo.",
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
    tagline: "La tipología insignia: amplitud total, balcón terraza y suites.",
    reservedCopy: "Unidades exclusivas con reservas activas de 1.ª fase",
    highlights: [
      "86,5 m² propios interiores + 5,55 m² de terraza balcón panorámica",
      "Vista frontal privilegiada hacia Av. Los Cusis",
      "Dormitorios máster en suite con vestidor privado",
      "El estándar residencial más exclusivo de ONA Residences",
    ],
  },
];

export default function OnaLanding({ property, onClose }: Props) {
  const [activeImage, setActiveImage] = useState("/ona/fachada-dia.jpg");
  const [activeLabel, setActiveLabel] = useState("Fachada");
  const [amenityIndex, setAmenityIndex] = useState(0);

  const introRef = useRef<HTMLElement>(null);
  const placeRef = useRef<HTMLElement>(null);
  const amenitiesRef = useRef<HTMLElement>(null);
  const typesRef = useRef<HTMLElement>(null);
  const payRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const scenes: Record<string, { src: string; label: string }> = {
      intro: { src: "/ona/fachada-dia.jpg", label: "Fachada" },
      lugar: { src: "/ona/ubicacion.jpg", label: "Ubicación" },
      amenidades: { src: "/ona/piscina.jpg", label: "Amenidades" },
      tipologias: { src: "/ona/dormitorio.jpg", label: "Tipologías" },
      pago: { src: "/ona/fachada-atardecer.jpg", label: "Inversión" },
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
      { threshold: [0.25, 0.55] }
    );

    [introRef, placeRef, amenitiesRef, typesRef, payRef].forEach((ref) => {
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
      zona: property.zone || ONA_ADDRESS,
      presupuesto: budget ? `USD ${formatOnaUsd(budget)}` : `desde USD 40.375`,
    }).catch(() => {});

    const text = `Hola, vengo de N.I.A. Quiero información para reservar en ONA Residences (${ONA_ADDRESS}) con USD ${formatOnaUsd(
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col bg-[#f7f5f0] font-sans text-stone-900 md:flex-row"
    >
      {/* Boton Cerrar Flotante */}
      <button
        onClick={onClose}
        className="fixed right-4 top-4 z-[120] rounded-full border border-stone-200 bg-white/95 p-3 text-stone-900 shadow-xl backdrop-blur transition-transform hover:scale-105 active:scale-95 md:right-7 md:top-7"
        aria-label="Cerrar"
        title="Volver a NIA"
      >
        <X size={22} />
      </button>

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
          <p className="mt-3 max-w-sm text-sm font-light text-white/90 md:text-base leading-relaxed">
            Eleva tu vida en equilibrio y armonía. Un santuario urbano en Los Cusis.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-white/80 font-light">
            <span>Constructora {ONA_BUILDER}</span>
            <span>·</span>
            <span>Entrega {ONA_DELIVERY}</span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[#e8d5a8]">
            <MapPin size={13} /> {ONA_ADDRESS}
          </p>
        </div>
      </div>

      {/* PANEL DERECHO: Contenido de Alto Impacto Editorial y Persuasivo */}
      <div className="relative min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-xl px-5 py-8 pb-32 md:px-10 md:py-14">

          {/* 1. HERO / VIVÍ ONA: EXPERIENCIA Y ESTILO DE VIDA */}
          <section id="intro" ref={introRef} className="scroll-mt-6">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Experiencia Residencial
              </p>
            </div>

            <h2 className="mt-3 font-serif text-3xl font-light leading-snug text-stone-900 md:text-5xl">
              Hay lugares donde vives. <br />
              <span className="italic font-normal text-[#9a7b45]">
                ONA te da una nueva forma de vivir.
              </span>
            </h2>

            <p className="mt-5 text-[15px] font-light leading-relaxed text-stone-600 md:text-base">
              ONA Residences nace como un refugio de arquitectura contemporánea que combina biofilia,
              líneas orgánicas y luz natural en una de las zonas más serenas y cotizadas de Santa Cruz.
              Un proyecto concebido por <strong>{ONA_BUILDER}</strong> para quienes entienden que el verdadero
              lujo cotidiano reside en despertar con calma, respirar bienestar y tener todo al alcance.
            </p>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-white/70 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#9a7b45]/10 text-[#9a7b45]">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-[#9a7b45]">
                    Preventa en Marcha
                  </p>
                  <p className="text-sm font-medium text-stone-800">
                    Más de 16 unidades de esta primera fase ya han sido reservadas.
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-stone-500 font-light border-t border-stone-100 pt-2.5">
                La oportunidad de ingresar en 1.ª fase asegura la máxima plusvalía acumulada antes de cada actualización de listas de precios.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  placeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="bg-stone-900 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-md transition-all hover:bg-[#9a7b45] active:scale-95"
              >
                Explorar el Proyecto
              </button>
              <a
                href={ONA_BROCHURE_URL}
                download
                className="inline-flex items-center border border-stone-300 bg-white px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-stone-800 transition-all hover:border-stone-900 hover:bg-stone-50"
              >
                Descargar Brochure
              </a>
            </div>

            {/* Accesos rápidos de navegación */}
            <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-stone-200 pt-4 text-xs font-medium text-stone-500">
              <a href="#lugar" className="hover:text-stone-950 transition-colors">Ubicación</a>
              <a href="#amenidades" className="hover:text-stone-950 transition-colors">Áreas Sociales</a>
              <a href="#tipologias" className="hover:text-stone-950 transition-colors">Tipologías</a>
              <a href="#pago" className="hover:text-stone-950 transition-colors">Plusvalía & Formas de Pago</a>
            </nav>
          </section>


          {/* 2. UBICACIÓN PRIVILEGIADA & CONECTIVIDAD (ARRIBA COMO FUE SOLICITADO) */}
          <section id="lugar" ref={placeRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Ubicación Insuperable
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Av. Los Cusis: Calma residencial y conectividad total.
            </h2>

            <p className="mt-3 text-[15px] font-light leading-relaxed text-stone-600">
              Ubicado estratégicamente sobre <strong>Av. Los Cusis, entre Banzer y Beni</strong>.
              Este cuadrante combina el encanto de un vecindario consolidado, arbolado y tranquilo, con un acceso inmediato a las principales arterias de Santa Cruz.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md">
              <img
                src="/ona/ubicacion.jpg"
                alt="Mapa de ubicación de ONA Residences en Av. Los Cusis"
                className="w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
              />
              <div className="p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="border-l-2 border-[#9a7b45] pl-3">
                    <p className="text-xs font-semibold text-stone-900">Conectividad 360°</p>
                    <p className="text-[12px] text-stone-500 font-light mt-0.5">
                      Acceso rápido hacia el 2.º y 3.er Anillo, Equipetrol y el centro financiero.
                    </p>
                  </div>
                  <div className="border-l-2 border-[#9a7b45] pl-3">
                    <p className="text-xs font-semibold text-stone-900">Entorno Gastronómico</p>
                    <p className="text-[12px] text-stone-500 font-light mt-0.5">
                      A minutos de los mejores restaurantes, cafés de especialidad y supermercados.
                    </p>
                  </div>
                  <div className="border-l-2 border-[#9a7b45] pl-3">
                    <p className="text-xs font-semibold text-stone-900">Plusvalía en Alza</p>
                    <p className="text-[12px] text-stone-500 font-light mt-0.5">
                      Zona consolidada con alta demanda sostenida de alquiler residencial y temporal.
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


          {/* 3. AMENIDADES & ÁREAS SOCIALES EN FORMATO CARRUSEL PERSUASIVO */}
          <section id="amenidades" ref={amenitiesRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Áreas Sociales & Bienestar
              </p>
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-3xl font-light text-stone-900 md:text-4xl">
                Un resort privado dentro de tu propio edificio.
              </h2>
            </div>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600">
              Espacios pensados para que cada día se sienta como una pausa de vacaciones.
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

              {/* Texto persuasivo de la amenidad activa */}
              <div className="p-6">
                <h3 className="font-serif text-2xl text-stone-900">
                  {currentSlide.title}
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-stone-600">
                  {currentSlide.description}
                </p>

                {/* Miniaturas interactivas para saltar directo a cualquier amenidad */}
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


          {/* 4. TIPOLOGÍAS RESIDENCIALES: CONCEPTO, INCLUSIONES Y PRECIO INICIAL */}
          <section id="tipologias" ref={typesRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Distribución Arquitectónica
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Diseño de autor a la medida de tu momento.
            </h2>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-stone-600">
              Espacios concebidos para maximizar la superficie útil, la luminosidad y el confort sensorial.
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

                    <p className="mt-2 text-sm font-light text-stone-600 leading-relaxed">
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
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Precio inicial y CTA */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-5">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">
                          Precio inicial de preventa
                        </p>
                        <p className="font-serif text-2xl font-medium text-stone-900">
                          Desde USD {formatOnaUsd(tipo.cashPrice)}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          reserve(
                            `Me interesa consultar disponibilidad para la tipología ${tipo.title} (${tipo.area}) con precio desde USD ${formatOnaUsd(
                              tipo.cashPrice
                            )}.`,
                            tipo.cashPrice
                          )
                        }
                        className="bg-stone-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm transition-all hover:bg-[#9a7b45] active:scale-95"
                      >
                        Consultar Disponibilidad
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>


          {/* 5. FORMAS DE PAGO & PLUSVALÍA (AL FINAL, CONCISO Y DE ALTO IMPACTO) */}
          <section id="pago" ref={payRef} className="mt-20 scroll-mt-6 border-t border-stone-200/80 pt-10">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#9a7b45]" />
              <p className="text-[11px] uppercase tracking-[0.24em] font-semibold text-[#9a7b45]">
                Estructura Financiera & Plusvalía
              </p>
            </div>

            <h2 className="mt-2 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Plusvalía asegurada desde el primer metro cuadrado.
            </h2>

            {/* BANNER DE PLUSVALÍA COMPARATIVA CON EL MERCADO */}
            <div className="mt-6 rounded-2xl border-2 border-[#9a7b45]/40 bg-gradient-to-br from-[#f8f5ee] to-white p-6 shadow-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-block rounded-full bg-[#9a7b45]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#816127]">
                    Comparativa de Mercado Real
                  </span>
                  <p className="mt-2 font-serif text-xl font-normal text-stone-900">
                    Av. Los Cusis hoy cotiza a <strong className="text-[#816127]">$1.600 USD / m²</strong>
                  </p>
                  <p className="mt-1 text-xs text-stone-600 font-light leading-relaxed">
                    Al ingresar en preventa en ONA desde <strong>$1.250 USD / m²</strong>, capturas de forma directa hasta un <strong>28% de plusvalía y ganancia de capital</strong> proyectada antes de la entrega.
                  </p>
                </div>
              </div>
            </div>

            {/* LAS 3 FORMAS DE PAGO EXPLICADAS CON SU M² Y VENTAJA */}
            <div className="mt-6 space-y-4">
              {/* Opción 1: Contado */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-stone-900 bg-stone-900 p-6 text-white shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-[#e8d5a8]/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#e8d5a8] border border-[#e8d5a8]/30">
                      Máxima Rentabilidad
                    </span>
                    <h3 className="mt-2 font-serif text-2xl">1. Pago al Contado (100%)</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-light text-[#e8d5a8]">$1.250 <span className="text-xs font-sans text-stone-300">USD/m²</span></p>
                    <p className="text-[11px] text-stone-400">vs $1.600 en la zona</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="text-xs uppercase tracking-wider text-[#e8d5a8] font-semibold">Ventaja Exclusiva:</p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-stone-200">
                    Accedes al valor por m² más bajo de todo el proyecto. Ahorras miles de dólares respecto a planes diferidos y aseguras la mayor tasa de retorno y plusvalía neta al recibir tu llave en 2028.
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
                  <p className="text-xs uppercase tracking-wider text-[#9a7b45] font-semibold">Ventaja Exclusiva:</p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-stone-600">
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
                  <p className="text-xs uppercase tracking-wider text-[#9a7b45] font-semibold">Ventaja Exclusiva:</p>
                  <p className="mt-1 text-xs font-light leading-relaxed text-stone-600">
                    El menor desembolso de entrada para ingresar a un edificio de categoría en Los Cusis. Te permite asegurar y congelar tu propiedad hoy, mientras cancelas el 60% en Junio 2028.
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN PARQUEOS: CONCISA Y BREVE (SOLO PRECIO INICIAL) */}
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
              <p className="mt-2.5 text-xs font-light text-stone-500 leading-relaxed border-t border-stone-100 pt-2.5">
                Disponibilidad en Planta Baja y Subsuelo con opciones de estacionamiento simple y doble. Cada parqueo incluye su propia baulera privada independiente.
              </p>
            </div>
          </section>


          {/* 6. CIERRE DE CONVERSIÓN & LLAMADO A LA ACCIÓN FINAL */}
          <section className="mt-20 border-t border-stone-200 pt-12 text-center">
            <ShieldCheck size={28} className="mx-auto text-[#9a7b45]" />
            <h2 className="mt-3 font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Asegura tu unidad al valor de 1.ª fase.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm font-light text-stone-600 leading-relaxed">
              Reserva hoy tu departamento con <strong>USD {formatOnaUsd(ONA_RESERVE_USD)}</strong> y congela el precio
              antes de la siguiente escala de preventa.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() =>
                  reserve("Quiero que un asesor me presente las unidades disponibles de 1.ª fase y me ayude a elegir.")
                }
                className="bg-stone-900 px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-xl transition-all hover:bg-[#9a7b45] active:scale-95"
              >
                Reservar con USD {formatOnaUsd(ONA_RESERVE_USD)}
              </button>
            </div>

            <p className="mt-8 text-[11px] leading-relaxed text-stone-400">
              Constructora {ONA_BUILDER} · Entrega programada {ONA_DELIVERY} · Av. Los Cusis, entre Banzer y Beni. Las imágenes y renders son de carácter arquitectónico referencial.
            </p>
          </section>

        </div>
      </div>

      {/* BARRA INFERIOR FLOTANTE DE CONVERSIÓN RÁPIDA */}
      <div className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-3 border-t border-stone-200 bg-[#f7f5f0]/95 px-5 py-3 backdrop-blur-md md:left-[44%]">
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

        <button
          onClick={() =>
            reserve("Quiero reservar una unidad en ONA Residences con USD " + formatOnaUsd(ONA_RESERVE_USD))
          }
          className="bg-stone-900 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-md transition-all hover:bg-[#9a7b45] active:scale-95"
        >
          Reservar Ahora
        </button>
      </div>
    </motion.div>
  );
}
