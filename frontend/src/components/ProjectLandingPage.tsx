import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Property } from "../types";
import { X, MapPin, CheckCircle2, ArrowRight, Download, MessageCircle, TrendingUp, DollarSign, Clock, FileText } from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose: () => void;
}

export default function ProjectLandingPage({ property, onClose }: Props) {
  const isOna = property.title?.toLowerCase().includes("ona");
  
  const entrega = isOna ? "Junio 2028" : "Diciembre 2025";
  const constructora = isOna ? "Palacios Antunez" : "Constructora NIA";
  const precioDesde = isOna ? "40.375" : "55.000";

  // Expand fallback images to cover different sections of the landing page
  const defaultImages = isOna ? [
    "/ona/fachada.jpg", // 0: Fachada / Intro
    "/ona/living.jpg", // 1: Inversión / Detalles
    "/ona/piscina.jpg", // 2: Amenidades
    "/ona/gym.jpg", // 3: Tipologías
    "/ona/churrasquera.jpg", // 4: Plan de Pagos
  ] : [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80", // 0: Fachada / Intro
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80", // 1: Inversión / Detalles
    "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&q=80", // 2: Amenidades
    "https://images.unsplash.com/photo-1502672260266-1c1f562479dc?w=1200&q=80", // 3: Tipologías
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80", // 4: Plan de Pagos
  ];

  const images = (isOna || (property.images && property.images.length >= 5))
    ? (isOna ? defaultImages : property.images)
    : [...(property.images || []), ...defaultImages].slice(0, 5);
  
  const [activeImage, setActiveImage] = useState(images[0]);
  const accentColor = "#c2a059";

  // Refs for scroll tracking
  const introRef = useRef<HTMLDivElement>(null);
  const investmentRef = useRef<HTMLDivElement>(null);
  const amenitiesRef = useRef<HTMLDivElement>(null);
  const typologiesRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const options = { root: null, rootMargin: '0px', threshold: 0.5 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          switch (entry.target.id) {
            case 'intro': setActiveImage(images[0]); break;
            case 'investment': setActiveImage(images[1] || images[0]); break;
            case 'amenities': setActiveImage(images[2] || images[0]); break;
            case 'typologies': setActiveImage(images[3] || images[0]); break;
            case 'payment': setActiveImage(images[4] || images[0]); break;
          }
        }
      });
    }, options);

    if (introRef.current) observer.observe(introRef.current);
    if (investmentRef.current) observer.observe(investmentRef.current);
    if (amenitiesRef.current) observer.observe(amenitiesRef.current);
    if (typologiesRef.current) observer.observe(typologiesRef.current);
    if (paymentRef.current) observer.observe(paymentRef.current);

    return () => observer.disconnect();
  }, [images]);

  const handleContact = (tipo: string) => {
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: property.id,
      operacion: "Preventa",
      zona: property.zone,
    }).catch(() => {});
    
    const text = `Hola, quiero más información sobre el proyecto ${property.title} (Interés: ${tipo})`;
    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] bg-white overflow-hidden flex flex-col md:flex-row font-sans text-stone-900"
    >
      <button 
        onClick={onClose}
        className="fixed top-6 right-6 z-[120] p-3 bg-white/80 hover:bg-white backdrop-blur-md rounded-full text-stone-900 shadow-lg border border-stone-200 transition-all hover:scale-105"
        aria-label="Cerrar"
      >
        <X size={24} />
      </button>

      {/* Left Side: Fixed Hero with AnimatePresence for smooth crossfades */}
      <div className="w-full md:w-1/2 h-[40vh] md:h-screen relative flex-shrink-0 bg-stone-900 overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.img 
            key={activeImage}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            src={activeImage} 
            alt={property.title} 
            className="absolute inset-0 w-full h-full object-cover" 
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/40 transition-opacity duration-500" />
        
        <div className="absolute bottom-10 left-10 right-10 text-white z-10 pointer-events-none">
          <p className="text-xs tracking-[0.3em] uppercase mb-4 opacity-90 font-semibold drop-shadow-md" style={{ color: accentColor }}>
            Lanzamiento Preventa
          </p>
          <h1 className="text-4xl md:text-6xl font-serif font-light leading-tight drop-shadow-lg">
            {property.title}
          </h1>
          <p className="mt-2 text-lg opacity-90 font-light flex items-center gap-2 drop-shadow-md">
            <MapPin size={18} /> {property.zone || "Equipetrol"}, {property.city}
          </p>
        </div>
      </div>

      {/* Right Side: Scrollable Content */}
      <div className="w-full md:w-1/2 h-[60vh] md:h-screen overflow-y-auto bg-[#faf9f7] scroll-smooth">
        <div className="max-w-2xl mx-auto px-6 py-12 md:px-16 md:py-24">
          
          {/* Section 1: Intro */}
          <div id="intro" ref={introRef} className="mb-24 scroll-mt-24">
            <h2 className="text-3xl md:text-4xl font-serif text-stone-800 mb-6 leading-snug">
              Una nueva dimensión de lujo y exclusividad.
            </h2>
            <p className="text-stone-600 text-lg leading-relaxed mb-8 font-light">
              Descubre un estilo de vida superior donde el diseño arquitectónico se encuentra con la comodidad absoluta. Espacios pensados para inspirar tus días y asegurar tu patrimonio.
            </p>

            <div className="grid grid-cols-2 gap-y-8 gap-x-4 py-8 border-y border-stone-200">
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Precio Desde</p>
                <p className="text-xl font-serif text-stone-800">USD {precioDesde}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Entrega</p>
                <p className="text-xl font-serif text-stone-800">{entrega}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Constructora</p>
                <p className="text-xl font-serif text-stone-800">{constructora}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Ubicación</p>
                <p className="text-xl font-serif text-stone-800">{property.zone || "Equipetrol"}</p>
              </div>
            </div>
            
            <div className="mt-10 bg-white p-8 border border-stone-200 shadow-sm text-center">
              <h3 className="font-serif text-xl text-stone-800 mb-2">Acceso Prioritario a Inversionistas</h3>
              <p className="text-stone-500 mb-6 font-light text-sm">Obtén la lista de precios completa y planos en alta resolución.</p>
              <button 
                onClick={() => handleContact("Dossier Inversionista")} 
                className="w-full py-4 text-white uppercase tracking-widest text-sm font-semibold transition-colors duration-300 hover:bg-stone-800 flex items-center justify-center gap-3"
                style={{ backgroundColor: accentColor }}
              >
                <Download size={18} /> Descargar Dossier
              </button>
            </div>
          </div>

          {/* Section 2: Investment Case */}
          <div id="investment" ref={investmentRef} className="mb-24 scroll-mt-24">
            <p className="text-xs text-stone-400 uppercase tracking-[0.2em] mb-4" style={{ color: accentColor }}>Por qué invertir aquí</p>
            <h2 className="text-3xl font-serif text-stone-800 mb-8">El Caso de Inversión</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start p-6 bg-white border border-stone-100 shadow-sm">
                <TrendingUp size={24} style={{ color: accentColor }} className="mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-serif text-stone-800 text-lg mb-2">Alta Plusvalía</h4>
                  <p className="text-stone-500 text-sm font-light">Ubicado en {property.zone || "Equipetrol"}, la zona de mayor crecimiento y demanda inmobiliaria de la ciudad. Compra en preventa y capitaliza desde el día 1.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start p-6 bg-white border border-stone-100 shadow-sm">
                <DollarSign size={24} style={{ color: accentColor }} className="mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-serif text-stone-800 text-lg mb-2">Rendimiento para Alquiler</h4>
                  <p className="text-stone-500 text-sm font-light">Tipologías optimizadas para plataformas de renta corta (Airbnb) y alquiler tradicional. Alta liquidez garantizada.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Amenities */}
          <div id="amenities" ref={amenitiesRef} className="mb-24 scroll-mt-24">
            <p className="text-xs text-stone-400 uppercase tracking-[0.2em] mb-4" style={{ color: accentColor }}>Estilo de vida</p>
            <h2 className="text-3xl font-serif text-stone-800 mb-8">Amenidades Nivel Resort</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Piscina Panorámica", desc: "Rooftop con vista a la ciudad" },
                { label: "Coworking", desc: "Espacios insonorizados y red WiFi de alta velocidad" },
                { label: "Gimnasio Equipado", desc: "Máquinas de última generación" },
                { label: "Lobby de Lujo", desc: "Recepción 24/7 y circuito cerrado" },
                { label: "Salón de Eventos", desc: "Espacio climatizado para reuniones" },
                { label: "Churrasqueras", desc: "Áreas sociales al aire libre" }
              ].map((amenity, i) => (
                <div key={i} className="p-5 bg-white border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                  <CheckCircle2 size={18} style={{ color: accentColor }} className="mb-3" />
                  <h4 className="font-serif text-stone-800 text-md mb-1">{amenity.label}</h4>
                  <p className="text-stone-500 text-xs font-light">{amenity.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Typologies */}
          <div id="typologies" ref={typologiesRef} className="mb-24 scroll-mt-24">
            <p className="text-xs text-stone-400 uppercase tracking-[0.2em] mb-4" style={{ color: accentColor }}>Espacios</p>
            <h2 className="text-3xl font-serif text-stone-800 mb-8">Tipologías Disponibles</h2>
            
            <div className="space-y-4">
              {[
                { name: "Monoambiente", m2: "35", price: "40.375", info: "Ideal para Airbnb. Incluye cocina equipada, baño completo y área de dormitorio integrada." },
                { name: "1 Dormitorio", m2: "52", price: "59.500", info: "Perfecto para ejecutivos. Sala, comedor, cocina abierta, área de lavado y suite independiente." },
                { name: "2 Dormitorios", m2: "75", price: "85.200", info: "Máximo confort. Master suite, segundo dormitorio, baño de visitas, y amplio balcón." }
              ].map((tipo, i) => (
                <div key={i} className="group bg-white border border-stone-200 transition-all hover:border-[#c2a059] hover:shadow-lg">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-serif text-xl text-stone-800">{tipo.name}</h4>
                        <p className="text-stone-500 text-sm mt-1">{tipo.m2} m² de superficie</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Desde</p>
                        <p className="font-serif text-xl text-stone-800">USD {tipo.price}</p>
                      </div>
                    </div>
                    <p className="text-sm text-stone-600 font-light mb-6 leading-relaxed border-t border-stone-100 pt-4">
                      {tipo.info}
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleContact(`Cotizar ${tipo.name}`)}
                        className="flex-1 py-3 bg-stone-900 text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#c2a059] transition-colors"
                      >
                        Cotizar
                      </button>
                      <button 
                        onClick={() => handleContact(`Ver Planos ${tipo.name}`)}
                        className="px-4 py-3 border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                        title="Solicitar Planos"
                      >
                        <FileText size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-stone-400 text-center mt-6">Consultar por disponibilidad de parqueos y bauleras.</p>
          </div>

          {/* Section 5: Payment Plans */}
          <div id="payment" ref={paymentRef} className="mb-24 scroll-mt-24">
            <p className="text-xs text-stone-400 uppercase tracking-[0.2em] mb-4" style={{ color: accentColor }}>Facilidades</p>
            <h2 className="text-3xl font-serif text-stone-800 mb-8">Planes de Financiamiento</h2>
            
            <div className="bg-stone-900 text-white p-8 mb-6">
              <h4 className="font-serif text-xl text-[#c2a059] mb-4">Pago al Contado</h4>
              <p className="text-sm font-light text-stone-300 mb-4">La opción con mayor rentabilidad. Obtén un descuento especial sobre el precio de lista al pagar el 100% a la firma del contrato.</p>
              <button onClick={() => handleContact("Descuento al Contado")} className="text-xs uppercase tracking-wider font-semibold flex items-center gap-2 hover:text-[#c2a059] transition-colors">
                Consultar Descuento <ArrowRight size={14} />
              </button>
            </div>

            <div className="border border-stone-200 p-8 bg-white">
              <h4 className="font-serif text-xl text-stone-800 mb-4">Financiamiento Directo (Durante Construcción)</h4>
              <ul className="space-y-4 mb-6">
                <li className="flex items-center gap-3 text-sm text-stone-600">
                  <span className="w-12 text-center py-1 bg-stone-100 text-stone-800 font-bold rounded">20%</span>
                  Cuota inicial a la firma del contrato
                </li>
                <li className="flex items-center gap-3 text-sm text-stone-600">
                  <span className="w-12 text-center py-1 bg-stone-100 text-stone-800 font-bold rounded">30%</span>
                  En cuotas mensuales sin intereses hasta la entrega
                </li>
                <li className="flex items-center gap-3 text-sm text-stone-600">
                  <span className="w-12 text-center py-1 bg-[#c2a059]/20 text-[#c2a059] font-bold rounded">50%</span>
                  Contra entrega (Posible financiamiento bancario)
                </li>
              </ul>
              <button onClick={() => handleContact("Simulación de Pagos")} className="text-xs uppercase tracking-wider font-semibold text-stone-800 flex items-center gap-2 hover:text-[#c2a059] transition-colors">
                Simular Plan de Pagos <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="text-center pt-12 border-t border-stone-200 pb-12">
            <h2 className="text-2xl font-serif text-stone-800 mb-4">¿Listo para dar el siguiente paso?</h2>
            <p className="text-stone-500 text-sm mb-8">Un asesor te guiará en todo el proceso de selección y compra.</p>
            <button 
              onClick={() => handleContact("Asesoramiento General")} 
              className="inline-flex items-center gap-3 px-10 py-4 bg-stone-900 text-white hover:bg-[#c2a059] transition-colors duration-300 font-semibold tracking-widest text-sm uppercase"
            >
              <MessageCircle size={18} /> Contactar Asesor
            </button>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
