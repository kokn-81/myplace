import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MapPin, X } from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import {
  ONA_ADDRESS,
  ONA_BROCHURE_URL,
  ONA_BUILDER,
  ONA_DELIVERY,
  ONA_PARKINGS,
  ONA_RESERVE_USD,
  ONA_UNITS,
  formatOnaM2,
  formatOnaUsd,
  type OnaParking,
  type OnaUnit,
} from "../onaInventory";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

type FilterId = "todas" | "32" | "54" | "92";
type ParkingFilter = "todos" | "baja" | "subsuelo" | "simple" | "doble";

const FILTERS: { id: FilterId; label: string; tipos: string[] }[] = [
  { id: "todas", label: "Todas", tipos: ["1", "2", "3", "4", "5"] },
  { id: "32", label: "1 dorm · 32 m²", tipos: ["3", "4"] },
  { id: "54", label: "2 dorm · 54 m²", tipos: ["1"] },
  { id: "92", label: "2 dorm · 92 m²", tipos: ["2", "5"] },
];

const PARKING_FILTERS: { id: ParkingFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "baja", label: "Planta baja" },
  { id: "subsuelo", label: "Subsuelo" },
  { id: "simple", label: "Simple · USD 15.000" },
  { id: "doble", label: "Doble · USD 22.000" },
];

const TYPOLOGIES: {
  id: FilterId;
  tipos: string[];
  title: string;
  area: string;
  image: string;
  text: string;
}[] = [
  {
    id: "32",
    tipos: ["3", "4"],
    title: "1 dormitorio",
    area: "32,30 m²",
    image: "/ona/tipo-32.jpg",
    text: "Para vivir de manera práctica o empezar una inversión. Vista lateral, sin balcón.",
  },
  {
    id: "54",
    tipos: ["1"],
    title: "2 dormitorios",
    area: "54,14 m²",
    image: "/ona/tipo-54.jpg",
    text: "Una planta funcional cuando hace falta un ambiente más. Vista lateral, sin balcón.",
  },
  {
    id: "92",
    tipos: ["2", "5"],
    title: "2 dormitorios con balcón",
    area: "92 m²",
    image: "/ona/tipo-92.jpg",
    text: "86,45 o 86,50 m² interiores más 5,55 m² de balcón. Vista a Av. Los Cusis o vista posterior. Dormitorios en suite.",
  },
];

const AMENITIES = [
  { src: "/ona/piscina.jpg", title: "Piscina tipo playa", text: "Con hidromasaje integrado." },
  { src: "/ona/hidromasaje.jpg", title: "Hidromasaje", text: "Dentro de la piscina." },
  { src: "/ona/reposeras.jpg", title: "Deck", text: "Descanso con reposeras." },
  { src: "/ona/sauna.jpg", title: "Sauna seca", text: "Equipada, para relax." },
  { src: "/ona/gym.jpg", title: "Gimnasio", text: "Equipado." },
  { src: "/ona/lobby.jpg", title: "Lobby", text: "Doble altura, amoblado e iluminado." },
  { src: "/ona/salon.jpg", title: "Salón", text: "Espacio equipado para reuniones." },
  { src: "/ona/churrasquera.jpg", title: "Churrasqueras", text: "Dos, en el área social." },
  { src: "/ona/fogata.jpg", title: "Área social", text: "Espacio al aire libre." },
];

const UNIT_SPECS = [
  { title: "Acceso", items: ["Puerta principal de ingreso", "Cerradura inteligente", "Herrajes de alta calidad"] },
  { title: "Cocina", items: ["Muebles superiores e inferiores", "Mesón de granito", "Bacha de acero inoxidable", "Grifería monocomando", "Encimera empotrada", "Horno microondas"] },
  { title: "Sala y dormitorios", items: ["Piso de porcelanato", "Iluminación funcional instalada", "Roperos empotrados", "Aire acondicionado instalado"] },
  { title: "Baño", items: ["Piso de porcelanato y revestimiento", "Mueble de granito", "Lavamanos con grifería alta", "Espejo con luz LED", "Ducha con box de vidrio"] },
  { title: "Lavandería", items: ["Lavadero instalado", "Calefón", "Espacio y conexiones para lavadora"] },
];

const COMMON_SPECS = [
  "Lobby de doble altura, amoblado e iluminado",
  "Dos ascensores, capacidad 8 personas",
  "Gimnasio equipado",
  "Sauna seca",
  "Piscina tipo playa con hidromasaje",
  "Deck con reposeras y dos churrasqueras",
  "Coworking equipado",
  "Salón de reuniones y baños de damas y caballeros",
  "Seguridad y control de acceso",
];

const cheapestAvailable = (tipos: string[]) =>
  ONA_UNITS.filter((unit) => unit.status === "disponible" && tipos.includes(unit.tipo)).sort((a, b) => a.cash - b.cash)[0];

const roomLabel = (unit: OnaUnit) => (unit.rooms === 1 ? "1 dormitorio" : "2 dormitorios");

export default function OnaLanding({ property, onClose }: { property: Property; onClose: () => void }) {
  const available = ONA_UNITS.filter((unit) => unit.status === "disponible");
  const sold = ONA_UNITS.length - available.length;
  const parkAvailable = ONA_PARKINGS.filter((spot) => spot.status === "disponible");
  const fromCash = Math.min(...available.map((unit) => unit.cash));

  const [filter, setFilter] = useState<FilterId>("todas");
  const [showSold, setShowSold] = useState(false);
  const [parkingFilter, setParkingFilter] = useState<ParkingFilter>("todos");
  const [showSoldParking, setShowSoldParking] = useState(false);
  const [activeImage, setActiveImage] = useState("/ona/fachada-dia.jpg");
  const [activeLabel, setActiveLabel] = useState("Fachada");

  const introRef = useRef<HTMLElement>(null);
  const typesRef = useRef<HTMLElement>(null);
  const unitsRef = useRef<HTMLElement>(null);
  const amenitiesRef = useRef<HTMLElement>(null);
  const specsRef = useRef<HTMLElement>(null);
  const payRef = useRef<HTMLElement>(null);
  const parkRef = useRef<HTMLElement>(null);
  const placeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const scenes: Record<string, { src: string; label: string }> = {
      intro: { src: "/ona/fachada-dia.jpg", label: "Fachada" },
      tipologias: { src: "/ona/dormitorio.jpg", label: "Dormitorio" },
      unidades: { src: "/ona/fachada-atardecer.jpg", label: "Atardecer" },
      amenidades: { src: "/ona/piscina.jpg", label: "Piscina" },
      acabados: { src: "/ona/cocina.jpg", label: "Cocina" },
      pago: { src: "/ona/fachada-noche.jpg", label: "Noche" },
      parqueos: { src: "/ona/lobby.jpg", label: "Parqueos" },
      lugar: { src: "/ona/fachada-noche.jpg", label: "Los Cusis" },
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const scene = visible ? scenes[visible.target.id] : undefined;
        if (!scene) return;
        setActiveImage(scene.src);
        setActiveLabel(scene.label);
      },
      { threshold: [0.35, 0.6] },
    );
    [introRef, typesRef, unitsRef, amenitiesRef, specsRef, payRef, parkRef, placeRef].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, []);

  const listed = useMemo(() => {
    const tipos = FILTERS.find((item) => item.id === filter)?.tipos ?? [];
    return ONA_UNITS.filter((unit) => tipos.includes(unit.tipo) && (showSold || unit.status === "disponible")).sort((a, b) => a.cash - b.cash || a.floor - b.floor);
  }, [filter, showSold]);

  const listedParkings = useMemo(() => {
    return ONA_PARKINGS.filter((spot) => {
      if (!showSoldParking && spot.status !== "disponible") return false;
      if (parkingFilter === "baja") return spot.level === "Planta baja";
      if (parkingFilter === "subsuelo") return spot.level === "Subsuelo";
      if (parkingFilter === "simple") return spot.kind === "simple";
      if (parkingFilter === "doble") return spot.kind === "doble";
      return true;
    });
  }, [parkingFilter, showSoldParking]);

  const phone = (property.agentWhatsapp || CONTACT_WHATSAPP_NUMBER).replace(/\D/g, "") || CONTACT_WHATSAPP_NUMBER;

  const reserve = (detail: string, budget?: number) => {
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: property.id,
      operacion: "Preventa",
      zona: property.zone || ONA_ADDRESS,
      presupuesto: budget ? `USD ${formatOnaUsd(budget)}` : `desde USD ${formatOnaUsd(fromCash)}`,
    }).catch(() => {});
    const text = `Hola, vengo de N.I.A. Quiero reservar en ONA Residences (${ONA_ADDRESS}) con USD ${formatOnaUsd(ONA_RESERVE_USD)}. ${detail}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const consultParking = (spot: OnaParking) => {
    const kind = spot.kind === "doble" ? "doble (A y B)" : "simple";
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: property.id,
      operacion: "Preventa",
      zona: property.zone || ONA_ADDRESS,
      presupuesto: `parqueo USD ${formatOnaUsd(spot.price)}`,
    }).catch(() => {});
    const text = `Hola, vengo de N.I.A. Quiero consultar un parqueo en ONA Residences (${ONA_ADDRESS}). Parqueo ${spot.code}, ${spot.level}, ${kind}, con baulera, USD ${formatOnaUsd(spot.price)}. El parqueo no está incluido en el departamento.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const jumpToUnits = (next: FilterId) => {
    setFilter(next);
    setShowSold(false);
    unitsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col bg-[#f6f3ee] font-sans text-stone-900 md:flex-row"
    >
      <button
        onClick={onClose}
        className="fixed right-4 top-4 z-[120] rounded-full border border-white/40 bg-white/90 p-3 text-stone-900 shadow-lg md:right-6 md:top-6"
        aria-label="Cerrar"
      >
        <X size={22} />
      </button>

      <div className="relative h-[34vh] shrink-0 bg-stone-900 md:h-screen md:w-[44%]">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={activeImage}
            src={activeImage}
            alt={`ONA Residences, ${activeLabel}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/20" />
        <div className="absolute bottom-6 left-6 right-16 text-white md:bottom-10 md:left-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#e4d2a8]">Preventa · 1.ª fase · {activeLabel}</p>
          <h1 className="mt-2 font-serif text-4xl font-light leading-none md:text-6xl">ONA</h1>
          <p className="mt-3 max-w-sm text-sm font-light text-white/90 md:text-base">Eleva tu vida en equilibrio y armonía.</p>
          <p className="mt-2 text-xs text-white/80">Constructora {ONA_BUILDER} · entrega {ONA_DELIVERY}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-white/80">
            <MapPin size={14} /> {ONA_ADDRESS}
          </p>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-xl px-5 py-8 pb-28 md:px-10 md:py-12">
          <section id="intro" ref={introRef}>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#9a7b45]">Viví ONA</p>
            <h2 className="mt-3 font-serif text-3xl font-light leading-snug text-stone-800 md:text-4xl">
              Un departamento en Los Cusis, desde USD {formatOnaUsd(fromCash)}.
            </h2>
            <p className="mt-4 text-[15px] font-light leading-relaxed text-stone-600">
              Arquitectura contemporánea en Av. Los Cusis, entre Banzer y Beni. Lo construye {ONA_BUILDER} y la entrega de esta fase es {ONA_DELIVERY}. Tres plantas —32, 54 y 92 m²— con piscina, gimnasio, sauna y áreas sociales. La reserva de USD {formatOnaUsd(ONA_RESERVE_USD)} congela el precio del departamento. El parqueo se compra aparte.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 border-y border-stone-200 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-400">Desde</p>
                <p className="mt-1 font-serif text-lg">USD {formatOnaUsd(fromCash)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-400">Entrega</p>
                <p className="mt-1 font-serif text-lg">{ONA_DELIVERY}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-400">Disponibles</p>
                <p className="mt-1 font-serif text-lg">{available.length} de {ONA_UNITS.length}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-stone-400">Reserva</p>
                <p className="mt-1 font-serif text-lg">USD {formatOnaUsd(ONA_RESERVE_USD)}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-stone-500">{sold} unidades de esta fase ya figuran como vendidas. El precio por m² sube con el piso.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => reserve("Quiero que me confirmen la unidad de menor precio todavía disponible.", fromCash)} className="bg-stone-900 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#9a7b45]">
                Reservar con USD {formatOnaUsd(ONA_RESERVE_USD)}
              </button>
              <a href={ONA_BROCHURE_URL} download className="border border-stone-300 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700 hover:border-stone-900">
                Brochure
              </a>
            </div>
            <nav className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-500">
              <a href="#tipologias" className="hover:text-stone-900">Tipologías</a>
              <a href="#unidades" className="hover:text-stone-900">Unidades y precios</a>
              <a href="#amenidades" className="hover:text-stone-900">Amenidades</a>
              <a href="#acabados" className="hover:text-stone-900">Qué incluye</a>
              <a href="#pago" className="hover:text-stone-900">Formas de pago</a>
              <a href="#parqueos" className="hover:text-stone-900">Parqueos</a>
              <a href="#lugar" className="hover:text-stone-900">Ubicación</a>
            </nav>
          </section>

          <section id="tipologias" ref={typesRef} className="mt-16 scroll-mt-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#9a7b45]">Tipologías</p>
            <h2 className="mt-2 font-serif text-3xl font-light">Elegí la tipología. Después el piso.</h2>
            <div className="mt-6 space-y-8">
              {TYPOLOGIES.map((tipo) => {
                const low = cheapestAvailable(tipo.tipos);
                const left = ONA_UNITS.filter((unit) => unit.status === "disponible" && tipo.tipos.includes(unit.tipo)).length;
                return (
                  <article key={tipo.id} className="overflow-hidden border border-stone-200 bg-white">
                    <img src={tipo.image} alt={`Planta referencial ${tipo.title} ${tipo.area}`} className="aspect-[4/3] w-full object-cover" />
                    <div className="p-5">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-serif text-2xl">{tipo.title}</h3>
                        <p className="text-sm text-stone-500">{tipo.area}</p>
                      </div>
                      <p className="mt-2 text-sm font-light leading-relaxed text-stone-600">{tipo.text}</p>
                      {low && (
                        <p className="mt-4 text-sm text-stone-800">
                          Desde <strong>USD {formatOnaUsd(low.cash)}</strong> al contado
                          <span className="text-stone-500"> · piso {low.floor}, {low.view.toLowerCase()}. Quedan {left}.</span>
                        </p>
                      )}
                      {low && (
                        <p className="mt-1 text-xs text-stone-500">
                          Con 40% inicial, esa misma unidad pasa a USD {formatOnaUsd(low.plan40.total)}. Al contado ahorrás USD {formatOnaUsd(low.plan40.total - low.cash)}.
                        </p>
                      )}
                      <button onClick={() => jumpToUnits(tipo.id)} className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#9a7b45]">
                        Ver unidades de esta tipología
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="unidades" ref={unitsRef} className="mt-16 scroll-mt-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#9a7b45]">1.ª fase</p>
            <h2 className="mt-2 font-serif text-3xl font-light">Precios por unidad</h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-stone-600">
              Cada unidad tiene tres precios: contado, que es el menor valor por m²; inicial del 60% y saldo contra entrega; inicial del 40% y saldo contra entrega. Esos montos son solo del departamento. El parqueo tiene su propia tabla.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={`border px-3 py-1.5 text-xs ${filter === item.id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 text-stone-600"}`}
                >
                  {item.label}
                </button>
              ))}
              <button onClick={() => setShowSold((value) => !value)} className="px-2 text-xs text-stone-500 underline">
                {showSold ? "Ocultar vendidas" : "Ver vendidas"}
              </button>
            </div>
            <p className="mt-3 text-xs text-stone-500">{listed.length} unidades en esta vista, ordenadas por precio al contado.</p>
            <div className="mt-4 space-y-3">
              {listed.map((unit) => {
                const soldOut = unit.status === "vendido";
                return (
                  <article key={`${unit.floor}-${unit.tipo}`} className={`border bg-white p-4 ${soldOut ? "border-stone-200 opacity-60" : "border-stone-200"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-serif text-lg">Piso {unit.floor} · Tipo {unit.tipo}</h3>
                        <p className="text-xs text-stone-500">
                          {roomLabel(unit)} · {formatOnaM2(unit.totalM2)} m²
                          {unit.balconyM2 ? ` (incluye balcón ${formatOnaM2(unit.balconyM2)} m²)` : ""} · {unit.view}
                        </p>
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest ${soldOut ? "text-stone-400" : "text-[#9a7b45]"}`}>
                        {soldOut ? "Vendido" : "Disponible"}
                      </span>
                    </div>
                    <dl className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt>Contado</dt>
                        <dd className="font-medium">USD {formatOnaUsd(unit.cash)}</dd>
                      </div>
                      <div className="flex justify-between gap-3 text-stone-600">
                        <dt>Inicial 60%</dt>
                        <dd>USD {formatOnaUsd(unit.plan60.initial)} · total {formatOnaUsd(unit.plan60.total)}</dd>
                      </div>
                      <div className="flex justify-between gap-3 text-stone-600">
                        <dt>Inicial 40%</dt>
                        <dd>USD {formatOnaUsd(unit.plan40.initial)} · total {formatOnaUsd(unit.plan40.total)}</dd>
                      </div>
                    </dl>
                    {!soldOut && (
                      <button
                        onClick={() =>
                          reserve(
                            `Unidad: piso ${unit.floor}, tipo ${unit.tipo}, ${roomLabel(unit)}, ${formatOnaM2(unit.totalM2)} m², vista ${unit.view}. Contado USD ${formatOnaUsd(unit.cash)}. Plan 60% inicial USD ${formatOnaUsd(unit.plan60.initial)} (total ${formatOnaUsd(unit.plan60.total)}). Plan 40% inicial USD ${formatOnaUsd(unit.plan40.initial)} (total ${formatOnaUsd(unit.plan40.total)}).`,
                            unit.cash,
                          )
                        }
                        className="mt-4 w-full bg-stone-900 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#9a7b45]"
                      >
                        Reservar esta unidad
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section id="amenidades" ref={amenitiesRef} className="mt-16 scroll-mt-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#9a7b45]">El edificio</p>
            <h2 className="mt-2 font-serif text-3xl font-light">Las áreas que vienen con el edificio.</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {AMENITIES.map((item) => (
                <figure key={item.title} className="bg-white">
                  <img src={item.src} alt={item.title} className="aspect-[4/5] w-full object-cover" />
                  <figcaption className="px-3 py-3">
                    <p className="font-serif text-lg">{item.title}</p>
                    <p className="text-xs text-stone-500">{item.text}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
            <ul className="mt-6 space-y-1 text-sm text-stone-600">
              {COMMON_SPECS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section id="acabados" ref={specsRef} className="mt-16 scroll-mt-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#9a7b45]">La entrega</p>
            <h2 className="mt-2 font-serif text-3xl font-light">Qué entra con el departamento.</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <img src="/ona/cocina.jpg" alt="Cocina de ONA" className="aspect-[4/5] w-full object-cover" />
              <img src="/ona/bano.jpg" alt="Baño de ONA" className="aspect-[4/5] w-full object-cover" />
            </div>
            <div className="mt-6 space-y-5">
              {UNIT_SPECS.map((group) => (
                <div key={group.title}>
                  <h3 className="font-serif text-xl">{group.title}</h3>
                  <ul className="mt-1 space-y-0.5 text-sm text-stone-600">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-stone-500">
              Los renders, los planos y el mobiliario de las fotos son referenciales. Lo que entra en la entrega es esta ficha. El proyecto se reserva el derecho de cambiar un material por otro de igual o superior calidad.
            </p>
            <img src="/ona/especificaciones.jpg" alt="Ficha de especificaciones y equipamiento de ONA Residences" className="mt-4 w-full border border-stone-200" />
          </section>

          <section id="pago" ref={payRef} className="mt-16 scroll-mt-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#9a7b45]">Cómo se compra</p>
            <h2 className="mt-2 font-serif text-3xl font-light">Reserva hoy. El precio queda quieto.</h2>
            <ol className="mt-6 space-y-4">
              <li className="border border-stone-200 bg-white p-5">
                <p className="text-[10px] uppercase tracking-widest text-[#9a7b45]">1 · Reserva</p>
                <p className="mt-1 font-serif text-2xl">USD {formatOnaUsd(ONA_RESERVE_USD)}</p>
                <p className="mt-1 text-sm font-light text-stone-600">Congela el precio de la unidad que elijas.</p>
              </li>
              <li className="border border-stone-200 bg-stone-900 p-5 text-white">
                <p className="text-[10px] uppercase tracking-widest text-[#e4d2a8]">2 · Contado</p>
                <p className="mt-1 font-serif text-2xl">El mayor descuento</p>
                <p className="mt-1 text-sm font-light text-stone-300">Es la columna de menor precio por m². En 32 m², la diferencia contra el plan del 40% pasa de USD 3.000.</p>
              </li>
              <li className="border border-stone-200 bg-white p-5">
                <p className="text-[10px] uppercase tracking-widest text-[#9a7b45]">3 · Inicial 60%</p>
                <p className="mt-1 text-sm font-light text-stone-600">Pagás el 60% y el saldo contra entrega. El total es más alto que al contado.</p>
              </li>
              <li className="border border-stone-200 bg-white p-5">
                <p className="text-[10px] uppercase tracking-widest text-[#9a7b45]">4 · Inicial 40%</p>
                <p className="mt-1 text-sm font-light text-stone-600">La inicial más baja. El precio final de la unidad es el más alto de las tres columnas.</p>
              </li>
            </ol>

          </section>

          <section id="parqueos" ref={parkRef} className="mt-16 scroll-mt-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#9a7b45]">Aparte del departamento</p>
            <h2 className="mt-2 font-serif text-3xl font-light">Parqueos, con su propio precio.</h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-stone-600">
              No están sumados al valor de la unidad. La 1.ª fase tiene {ONA_PARKINGS.length} parqueos y {parkAvailable.length} siguen disponibles. Cada uno incluye baulera. El simple está en USD 15.000. La fila marcada “A y B” es un solo parqueo doble, en USD 22.000.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {PARKING_FILTERS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setParkingFilter(item.id)}
                  className={`border px-3 py-1.5 text-xs ${parkingFilter === item.id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 text-stone-600"}`}
                >
                  {item.label}
                </button>
              ))}
              <button onClick={() => setShowSoldParking((value) => !value)} className="px-2 text-xs text-stone-500 underline">
                {showSoldParking ? "Ocultar vendidos" : "Ver vendidos"}
              </button>
            </div>
            <p className="mt-3 text-xs text-stone-500">{listedParkings.length} parqueos en esta vista.</p>
            <div className="mt-4 space-y-3">
              {listedParkings.map((spot) => {
                const soldOut = spot.status === "vendido";
                const kind = spot.kind === "doble" ? "Doble (A y B)" : "Simple";
                return (
                  <article key={spot.code} className={`border bg-white p-4 ${soldOut ? "border-stone-200 opacity-60" : "border-stone-200"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-serif text-lg">Parqueo {spot.code}</h3>
                        <p className="text-xs text-stone-500">{spot.level} · {kind} · con baulera</p>
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest ${soldOut ? "text-stone-400" : "text-[#9a7b45]"}`}>
                        {soldOut ? "Vendido" : "Disponible"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium">USD {formatOnaUsd(spot.price)}</p>
                    {!soldOut && (
                      <button
                        onClick={() => consultParking(spot)}
                        className="mt-4 w-full border border-stone-900 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-900 hover:bg-stone-900 hover:text-white"
                      >
                        Consultar este parqueo
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section id="lugar" ref={placeRef} className="mt-16 scroll-mt-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#9a7b45]">Ubicación</p>
            <h2 className="mt-2 font-serif text-3xl font-light">Entre Banzer y Beni.</h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-stone-600">
              {ONA_ADDRESS}. El plano del proyecto lo resume así: calma en casa, y conectividad con acceso directo.
            </p>
            <img src="/ona/ubicacion.jpg" alt="Mapa de ONA en Av. Los Cusis, entre Banzer y Beni" className="mt-5 w-full" />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-[#9a7b45]"
            >
              Abrir en el mapa
            </a>
          </section>

          <section className="mt-16 border-t border-stone-200 pt-10 text-center">
            <h2 className="font-serif text-3xl font-light">La unidad no espera a que el precio suba de piso.</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm font-light text-stone-600">
              Reservá con USD {formatOnaUsd(ONA_RESERVE_USD)} y te confirmamos disponibilidad, parqueo y la forma de pago.
            </p>
            <button
              onClick={() => reserve("Quiero que un asesor me confirme unidad, parqueo y forma de pago.", fromCash)}
              className="mt-6 bg-stone-900 px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#9a7b45]"
            >
              Hablar con un asesor
            </button>
            <p className="mt-8 text-[11px] leading-relaxed text-stone-400">
              Precios de preventa de la 1.ª fase. Entrega {ONA_DELIVERY}. Constructora {ONA_BUILDER}. El parqueo y la baulera se compran aparte y no están incluidos en el precio del departamento. Las imágenes son referenciales.
            </p>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-between gap-3 border-t border-stone-200 bg-[#f6f3ee]/95 px-4 py-3 backdrop-blur md:left-[44%]">
        <p className="text-xs text-stone-600">
          Reserva <span className="font-medium text-stone-900">USD {formatOnaUsd(ONA_RESERVE_USD)}</span>
          <span className="hidden sm:inline"> · congela el precio</span>
        </p>
        <button onClick={() => reserve("Quiero reservar y que me indiquen qué unidades siguen disponibles.", fromCash)} className="bg-stone-900 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
          Reservar
        </button>
      </div>
    </motion.div>
  );
}
