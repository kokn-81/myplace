import { Bed, Calendar, MapPin } from "lucide-react";
import { formatBedroomOptions } from "../projectCardSummary";
import type { ProjectCardSummary as Summary } from "../projectCardSummary";

interface Props {
  reference: string;
  summary: Summary;
}

export default function ProjectCardSummary({ reference, summary }: Props) {
  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--accent-main)] md:text-[10px]">
          Ref. #{reference}
        </span>
        <span className="rounded-full bg-[var(--accent-main)]/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-[var(--text-main)]">
          Proyecto
        </span>
      </div>

      <h3 className="mt-1 text-[15px] font-bold leading-tight text-[var(--text-main)] md:text-base">
        {summary.name}
      </h3>

      <p className="mt-0.5 text-[11px] leading-snug text-[var(--text-main)] md:text-xs">
        <span className="block text-[9px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Constructora</span>
        {summary.builder || "Por confirmar"}
      </p>

      <div className="mt-1 flex min-w-0 items-start gap-1.5 text-[11px] font-medium leading-snug text-[var(--text-main)] md:text-xs">
        <Bed size={14} className="mt-0.5 shrink-0 text-[var(--accent-secondary)]" />
        <p>{formatBedroomOptions(summary.bedrooms)}</p>
      </div>

      <div className="mt-1 flex min-w-0 items-start gap-1.5 text-[11px] leading-snug text-[var(--text-muted)] md:text-xs">
        <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--accent-secondary)]" />
        <p>{summary.address}</p>
      </div>

      <div className="mt-auto flex items-start gap-1.5 border-t border-[var(--border-soft)] pt-1.5 text-[11px] font-semibold leading-snug text-[var(--text-main)] md:text-xs">
        <Calendar size={14} className="mt-0.5 shrink-0 text-[var(--accent-secondary)]" />
        <p>Entrega {summary.delivery || "por confirmar"}</p>
      </div>
    </div>
  );
}
