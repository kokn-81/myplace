import { Calendar, MapPin } from "lucide-react";
import type { ProjectCardSummary as Summary } from "../projectCardSummary";

interface Props {
  reference: string;
  summary: Summary;
}

export default function ProjectCardSummary({ reference, summary }: Props) {
  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent-main)]">
          Ref. #{reference}
        </span>
        <span className="rounded-full bg-[var(--accent-main)]/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-[var(--text-main)]">
          Proyecto
        </span>
      </div>

      <h3 className="mt-2 text-[13px] font-bold leading-snug text-[var(--text-main)] md:text-sm">
        {summary.name}
      </h3>

      <p className="mt-1 text-[11px] leading-snug text-[var(--text-main)]">
        <span className="block text-[8px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Constructora</span>
        {summary.builder}
      </p>

      <div className="mt-2 flex min-w-0 items-start gap-1.5 text-[10px] leading-snug text-[var(--text-muted)]">
        <MapPin size={12} className="mt-0.5 shrink-0 text-[var(--accent-secondary)]" />
        <p>{summary.address}</p>
      </div>

      <div className="mt-auto flex items-start gap-1.5 border-t border-[var(--border-soft)] pt-2 text-[10px] font-semibold leading-snug text-[var(--text-main)]">
        <Calendar size={12} className="mt-0.5 shrink-0 text-[var(--accent-secondary)]" />
        <p>Entrega {summary.delivery}</p>
      </div>
    </div>
  );
}
