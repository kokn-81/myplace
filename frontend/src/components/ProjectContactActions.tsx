import { ArrowRight } from "lucide-react";

interface Props {
  canReserve: boolean;
  selectionLabel?: string;
  onReserve: () => void;
  onAdvice: () => void;
  onChooseUnit: () => void;
  tone?: "gold" | "chocolate";
}

export function ProjectContactActions({ canReserve, selectionLabel, onReserve, onAdvice, onChooseUnit, tone = "gold" }: Props) {
  return <>
    <div role="group" aria-label="Reserva y asesoría" className="mx-auto grid max-w-xl gap-3 sm:grid-cols-2">
      <button type="button" disabled={!canReserve} onClick={onReserve} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white disabled:cursor-not-allowed disabled:opacity-50 ${tone === "chocolate" ? "bg-[#5c2414]" : "bg-[#1C1917]"}`}>
        <span>Reservar unidad elegida</span>
        {canReserve && selectionLabel && <span className={`text-[10px] font-normal normal-case tracking-normal ${tone === "chocolate" ? "text-[#e6cdb8]" : "text-[#e8d5a8]"}`}>{selectionLabel}</span>}
      </button>
      <button type="button" onClick={onAdvice} className="inline-flex min-h-16 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
        <img src="/whatsapp.svg" alt="" aria-hidden="true" className="h-5 w-5 shrink-0" />Agendar asesoría por WhatsApp
      </button>
    </div>
    {!canReserve && <button type="button" onClick={onChooseUnit} className={`inline-flex items-center gap-1 text-sm font-semibold ${tone === "chocolate" ? "text-[#5c2414]" : "text-[#816127]"}`}>Elige una unidad disponible para reservar<ArrowRight size={14} /></button>}
  </>;
}

export function ProjectContactShortcut({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-label="Ver opciones de reserva y asesoría" aria-controls="cierre" title="Reserva y asesoría" className="absolute right-14 top-0 flex h-11 w-11 items-center justify-center rounded-full border border-stone-800/80 bg-stone-900/95 text-white shadow-2xl transition-colors hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a7b45]">
    <img src="/whatsapp.svg" alt="" aria-hidden="true" className="h-6 w-6 brightness-0 invert" />
  </button>;
}
