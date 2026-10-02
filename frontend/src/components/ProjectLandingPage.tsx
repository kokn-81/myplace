import React from "react";
import { motion } from "motion/react";
import { Property } from "../types";
import { X, MapPin, CheckCircle2, ArrowRight, Download, MessageCircle } from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose: () => void;
}

export default function ProjectLandingPage({ property, onClose }: Props) {
  // Use property details if available, or fallback to ONA Residences hardcoded info for now
  const isOna = property.title?.toLowerCase().includes("ona");
  
  const entrega = isOna ? "Junio 2028" : "Diciembre 2025";
  const constructora = isOna ? "Palacios Antunez" : "Constructora NIA";
  const precioDesde = isOna ? "40.375" : "55.000";

  const images = property.images && property.images.length > 0 ? property.images : [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80"
  ];
  
  const mainImg = images[0];
  const accentColor = "#c2a059";

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
      {/* Global Close Button */}
      <button 
        onClick={onClose}
        className="fixed top-6 right-6 z-[120] p-3 bg-white/80 hover:bg-white backdrop-blur-md rounded-full text-stone-900 shadow-lg border border-stone-200 transition-all hover:scale-105"
        aria-label="Cerrar"
      >
        <X size={24} />
      </button>

      {/* Left Side: Fixed Hero (Desktop) / Normal Hero (Mobile) */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative flex-shrink-0">
        <div className="absolute inset-0">
          <img src={mainImg} alt={property.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        {/* Floating Content on Left Image */}
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-xs tracking-[0.3em] uppercase mb-4 opacity-90 font-semibold" style={{ color: accentColor }}>
            Lanzamiento Preventa
          </p>
          <h1 className="text-4xl md:text-6xl font-serif font-light leading-tight">
            {property.title}
          </h1>
          <p className="mt-2 text-lg opacity-90 font-light flex items-center gap-2">
            <MapPin size={18} /> {property.zone || "Equipetrol"}, {property.city}
          </p>
        </div>
      </div>

      {/* Right Side: Scrollable Content */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-screen overflow-y-auto bg-[#faf9f7]">
        <div className="max-w-2xl mx-auto px-8 py-16 md:px-16 md:py-24">
          
          {/* Intro & Summary */}
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-stone-800 mb-6 leading-snug">
              Una nueva dimensión de lujo y exclusividad.
            </h2>
            <p className="text-stone-600 text-lg leading-relaxed mb-8 font-light">
              Descubre un estilo de vida superior donde el diseño arquitectónico se encuentra con la comodidad absoluta. Espacios pensados para inspirar tus días.
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
          </div>

          {/* Primary CTA */}
          <div className="bg-white p-8 border border-stone-200 shadow-sm mb-16 text-center">
            <h3 className="font-serif text-2xl text-stone-800 mb-2">Registra tu Interés</h3>
            <p className="text-stone-500 mb-8 font-light text-sm">Obtén acceso prioritario a planos, lista de precios y disponibilidad.</p>
            
            <button 
              onClick={() => handleContact("Información General")} 
              className="w-full py-4 text-white uppercase tracking-widest text-sm font-semibold transition-colors duration-300 hover:bg-stone-800 flex items-center justify-center gap-3"
              style={{ backgroundColor: accentColor }}
            >
              <MessageCircle size={18} /> Solicitar Información
            </button>
            <button 
              onClick={() => handleContact("Brochure")} 
              className="w-full mt-4 py-4 text-stone-600 uppercase tracking-widest text-sm font-semibold border border-stone-300 transition-colors duration-300 hover:bg-stone-50 flex items-center justify-center gap-3"
            >
              <Download size={18} /> Descargar Brochure
            </button>
          </div>

          {/* Amenities */}
          <div className="mb-16">
            <p className="text-xs text-stone-400 uppercase tracking-[0.2em] mb-8 text-center" style={{ color: accentColor }}>Amenidades Exclusivas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "Piscina Infinita", desc: "Vistas panorámicas" },
                { label: "Coworking", desc: "Espacio ejecutivo" },
                { label: "Gimnasio", desc: "Equipamiento premium" },
                { label: "Lobby 24/7", desc: "Recepción de lujo" },
                { label: "Churrasqueras", desc: "Áreas sociales" },
                { label: "Seguridad", desc: "Acceso controlado" }
              ].map((amenity, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white border border-stone-100 shadow-sm">
                  <div className="mt-1">
                    <CheckCircle2 size={20} style={{ color: accentColor }} className="opacity-70" />
                  </div>
                  <div>
                    <h4 className="font-serif text-stone-800 text-lg">{amenity.label}</h4>
                    <p className="text-stone-500 text-sm font-light mt-1">{amenity.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography Grid */}
          <div className="mb-16">
            <p className="text-xs text-stone-400 uppercase tracking-[0.2em] mb-8 text-center" style={{ color: accentColor }}>Tipologías</p>
            <div className="space-y-4">
              {[
                { name: "Monoambiente", m2: "35", price: "40.375" },
                { name: "1 Dormitorio", m2: "52", price: "59.500" },
                { name: "2 Dormitorios", m2: "75", price: "85.200" }
              ].map((tipo, i) => (
                <div key={i} className="flex justify-between items-center p-6 bg-white border border-stone-200 hover:border-[#c2a059] transition-colors cursor-pointer" onClick={() => handleContact(`Cotizar ${tipo.name}`)}>
                  <div>
                    <h4 className="font-serif text-lg text-stone-800">{tipo.name}</h4>
                    <p className="text-stone-500 text-sm">{tipo.m2} m² aprox.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Desde</p>
                    <p className="font-serif text-lg text-stone-800">USD {tipo.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Images Grid */}
          {images.length > 1 && (
            <div className="grid grid-cols-2 gap-4 mb-16">
              {images.slice(1, 3).map((img, idx) => (
                <div key={idx} className="aspect-square bg-stone-200">
                  <img src={img} alt={`Vista ${idx + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Footer CTA */}
          <div className="text-center pt-8 border-t border-stone-200 pb-12">
            <h2 className="text-2xl font-serif text-stone-800 mb-6">Asegura tu inversión hoy</h2>
            <button 
              onClick={() => handleContact("Asesoramiento Inversión")} 
              className="inline-flex items-center gap-2 px-8 py-3 text-stone-900 border border-stone-900 hover:bg-stone-900 hover:text-white transition-colors duration-300 font-medium tracking-wide text-sm uppercase"
            >
              Hablar con un Asesor <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
