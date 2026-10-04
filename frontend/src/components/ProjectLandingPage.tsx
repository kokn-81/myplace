import { motion } from "motion/react";
import { X } from "lucide-react";
import OnaLanding from "./OnaLanding";
import { recordLeadEvent } from "../leadTracking";
import type { Property } from "../types";
import { CONTACT_WHATSAPP_NUMBER } from "../whatsappMessage";

interface Props {
  property: Property;
  onClose: () => void;
}

export default function ProjectLandingPage({ property, onClose }: Props) {
  if (property.title?.toLowerCase().includes("ona")) {
    return <OnaLanding property={property} onClose={onClose} />;
  }

  const phone = (property.agentWhatsapp || CONTACT_WHATSAPP_NUMBER).replace(/\D/g, "") || CONTACT_WHATSAPP_NUMBER;
  const contact = () => {
    recordLeadEvent({
      action: "contact_tap",
      propertyRef: property.id,
      operacion: "Preventa",
      zona: property.zone,
    }).catch(() => {});
    const text = `Hola, quiero más información sobre el proyecto ${property.title}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-[#f6f3ee] text-stone-900"
    >
      <button onClick={onClose} className="fixed right-5 top-5 z-[120] rounded-full bg-white p-3 shadow" aria-label="Cerrar">
        <X size={22} />
      </button>
      <div className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#9a7b45]">Preventa</p>
        <h1 className="mt-2 font-serif text-4xl font-light">{property.title}</h1>
        <p className="mt-2 text-sm text-stone-500">{[property.zone, property.city].filter(Boolean).join(", ")}</p>
        {property.images[0] && <img src={property.images[0]} alt={property.title} className="mt-6 aspect-[16/9] w-full object-cover" />}
        <p className="mt-6 whitespace-pre-line text-sm font-light leading-relaxed text-stone-600">{property.description}</p>
        <button onClick={contact} className="mt-8 bg-stone-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">
          Pedir información
        </button>
      </div>
    </motion.div>
  );
}
