import React from "react";
import { motion } from "motion/react";
import { Property } from "../types";
import { X, MapPin, Building2, Calendar, ShieldCheck, CheckCircle2, TrendingUp, ArrowRight, Download, MessageCircle } from "lucide-react";
import { recordLeadEvent } from "../leadTracking";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose: () => void;
}

export default function ProjectLandingPage({ property, onClose }: Props) {
  // Use property details if available, or fallback to ONA Residences hardcoded info for now as requested
  const isOna = property.title?.toLowerCase().includes("ona");
  
  const entrega = isOna ? "Junio 2028" : "Diciembre 2025";
  const constructora = isOna ? "Palacios Antunez" : "Constructora NIA";
  const precioDesde = isOna ? "40.375" : "55.000";

  const images = property.images && property.images.length > 0 ? property.images : [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80"
  ];
  
  const mainImg = images[0];

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
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-[#1a1311] overflow-y-auto font-sans text-[#f4efe8]"
    >
        {/* Sticky Header / Close */}
        <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-[110] bg-gradient-to-b from-[#1a1311]/80 to-transparent backdrop-blur-sm pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
             <span className="font-black text-xl tracking-widest text-[#d4af37] uppercase">{property.title}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full text-white pointer-events-auto transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 1. Hero Section (Atención) */}
        <section className="relative h-[85vh] w-full flex items-end pb-24 px-6 md:px-12 bg-black">
          <div className="absolute inset-0">
             <img src={mainImg} alt={property.title} className="w-full h-full object-cover opacity-60" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#1a1311] via-[#1a1311]/40 to-transparent" />
          </div>
          <div className="relative z-10 max-w-4xl w-full">
            <span className="inline-block px-3 py-1 mb-4 border border-[#d4af37] text-[#d4af37] text-xs font-black tracking-[0.2em] uppercase rounded-full bg-black/40 backdrop-blur">
              Lanzamiento Preventa
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6">
              Tu nuevo estilo de vida en <br/><span className="text-[#d4af37]">{property.zone || "Equipetrol"}</span>.
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium text-stone-300 mb-8">
               <div className="flex items-center gap-2">
                 <Building2 className="text-[#d4af37]" size={20}/>
                 <span>{constructora}</span>
               </div>
               <div className="flex items-center gap-2">
                 <Calendar className="text-[#d4af37]" size={20}/>
                 <span>Entrega: {entrega}</span>
               </div>
               <div className="flex items-center gap-2">
                 <MapPin className="text-[#d4af37]" size={20}/>
                 <span>{property.city}</span>
               </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
               <button onClick={() => handleContact("Precios")} className="bg-[#d4af37] text-[#1a1311] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#e0bc4b] transition-colors flex items-center justify-center gap-2">
                 Ver Precios y Disponibilidad <ArrowRight size={20} />
               </button>
               <button onClick={() => handleContact("Brochure")} className="bg-white/10 text-white backdrop-blur px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-colors border border-white/20 flex items-center justify-center gap-2">
                 <Download size={20} /> Descargar Brochure
               </button>
            </div>
          </div>
        </section>

        {/* 2. Barra de Urgencia (Interés) */}
        <div className="bg-[#b45309] text-white py-4 px-6 relative z-20 shadow-xl flex items-center justify-center">
           <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 max-w-6xl w-full text-sm md:text-base font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-amber-200"/> Excelente Oportunidad de Inversión</span>
              <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/40" />
              <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-amber-200"/> Unidades desde USD {precioDesde}</span>
              <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/40" />
              <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-amber-200"/> Alta Plusvalía Asegurada</span>
           </div>
        </div>

        {/* 3. Beneficios y Amenidades (Deseo) */}
        <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Amenidades de Primer Nivel</h2>
            <p className="text-stone-400 max-w-2xl mx-auto text-lg">Diseñado para brindarte confort, seguridad y experiencias únicas sin salir de casa.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Piscina Infinita", icon: "🏊‍♂️" },
              { label: "Coworking", icon: "💻" },
              { label: "Gimnasio Equipado", icon: "🏋️‍♂️" },
              { label: "Churrasqueras", icon: "🥩" },
              { label: "Salón de Eventos", icon: "🎉" },
              { label: "Seguridad 24/7", icon: "🛡️" },
              { label: "Parqueo Subterráneo", icon: "🚗" },
              { label: "Lobby de Lujo", icon: "✨" }
            ].map((amenity, i) => (
              <div key={i} className="bg-[#241b18] p-6 rounded-2xl border border-white/5 text-center hover:border-[#d4af37]/30 transition-colors">
                <div className="text-4xl mb-4 opacity-80">{amenity.icon}</div>
                <h3 className="font-bold text-stone-200">{amenity.label}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Tipologías y Precios */}
        <section className="py-24 px-6 md:px-12 bg-[#0c0908]">
           <div className="max-w-6xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div>
                  <h2 className="text-3xl md:text-5xl font-black mb-4">Unidades Disponibles</h2>
                  <p className="text-stone-400 max-w-2xl text-lg">Elige el espacio perfecto para ti o tu próxima inversión.</p>
                </div>
             </div>

             <div className="grid md:grid-cols-3 gap-8">
                {/* Mock Tipologias */}
                {[
                  { name: "Monoambiente", m2: "35", price: "40.375" },
                  { name: "1 Dormitorio", m2: "52", price: "59.500" },
                  { name: "2 Dormitorios", m2: "75", price: "85.200" }
                ].map((tipo, i) => (
                  <div key={i} className="bg-[#1a1311] rounded-3xl overflow-hidden border border-white/10 flex flex-col">
                    <div className="h-48 bg-stone-800 relative">
                       <img src={images[i % images.length]} className="w-full h-full object-cover opacity-80" alt={tipo.name} />
                       <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                         {tipo.name}
                       </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-end mb-6">
                        <div>
                          <p className="text-stone-400 text-sm mb-1">Superficie aprox.</p>
                          <p className="text-2xl font-bold text-white">{tipo.m2} m²</p>
                        </div>
                        <div className="text-right">
                          <p className="text-stone-400 text-sm mb-1">Desde</p>
                          <p className="text-2xl font-black text-[#d4af37]">USD {tipo.price}</p>
                        </div>
                      </div>
                      <button onClick={() => handleContact(`Cotizar ${tipo.name}`)} className="mt-auto w-full py-3 rounded-xl border border-[#d4af37] text-[#d4af37] font-bold hover:bg-[#d4af37] hover:text-[#1a1311] transition-colors">
                        Cotizar esta unidad
                      </button>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </section>

        {/* 5. Inversión (Lógica) & Cierre */}
        <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto text-center">
           <h2 className="text-3xl md:text-5xl font-black mb-8">¿Por qué invertir en {property.title}?</h2>
           <div className="grid md:grid-cols-3 gap-6 mb-16">
              <div className="p-8 bg-[#241b18] rounded-3xl border border-white/5">
                 <TrendingUp className="text-[#d4af37] mx-auto mb-4" size={40} />
                 <h3 className="text-xl font-bold mb-2">Alta Rentabilidad</h3>
                 <p className="text-stone-400 text-sm">Ubicación estratégica ideal para alquileres tradicionales o Airbnb, asegurando un flujo constante.</p>
              </div>
              <div className="p-8 bg-[#241b18] rounded-3xl border border-white/5">
                 <ShieldCheck className="text-[#d4af37] mx-auto mb-4" size={40} />
                 <h3 className="text-xl font-bold mb-2">Respaldo Seguro</h3>
                 <p className="text-stone-400 text-sm">Proyecto desarrollado por {constructora}, con trayectoria y entregas garantizadas.</p>
              </div>
              <div className="p-8 bg-[#241b18] rounded-3xl border border-white/5">
                 <MapPin className="text-[#d4af37] mx-auto mb-4" size={40} />
                 <h3 className="text-xl font-bold mb-2">Plusvalía</h3>
                 <p className="text-stone-400 text-sm">Zona en constante crecimiento comercial y residencial, aumentando el valor de tu inmueble.</p>
              </div>
           </div>

           <div className="bg-gradient-to-br from-[#d4af37] to-[#b45309] rounded-3xl p-8 md:p-12 text-[#1a1311] relative overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-2xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-black mb-4">¿Listo para asegurar tu unidad?</h2>
                <p className="text-[#1a1311]/80 font-medium mb-8 text-lg">Contáctanos hoy mismo y descubre los planes de financiamiento directo que tenemos para ti.</p>
                <button 
                  onClick={() => handleContact("Cierre CTA")}
                  className="bg-[#1a1311] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-black transition-colors flex items-center justify-center gap-2 w-full md:w-auto mx-auto shadow-xl"
                >
                  <MessageCircle size={20} /> Hablar con un Asesor
                </button>
                <p className="text-sm font-bold opacity-60 mt-4 text-center">Sin compromiso, atención inmediata.</p>
              </div>
           </div>
        </section>

    </motion.div>
  );
}
