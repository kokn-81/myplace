import { Bed, Calendar, MapPin } from "lucide-react";
import { formatBedroomOptions } from "../projectCardSummary";
import type { ProjectCardSummary as Summary } from "../projectCardSummary";

interface Props {
  reference: string;
  summary: Summary;
  price: number | null;
}

export default function ProjectCardSummary({ reference, summary, price }: Props) {
  return (
    <div className="flex h-full min-w-0 flex-col gap-0.5 text-center xl:gap-1">
      <div className="flex flex-wrap items-center justify-center gap-1">
        <span className="text-[9px] font-bold uppercase leading-none tracking-[0.1em] text-[var(--accent-main)] md:text-[10px] xl:text-[11px]">
          Ref. #{reference}
        </span>
        <span className="rounded-full bg-[var(--accent-main)]/15 px-2 py-0.5 text-[9px] font-medium uppercase leading-none tracking-wider text-[var(--text-main)] xl:text-[10px]">
          Proyecto
        </span>
      </div>

      <h3 className="text-[15px] font-bold leading-tight text-[var(--text-main)] md:text-base xl:text-lg">
        {summary.name}
      </h3>

      <p className="text-[11px] leading-tight text-[var(--text-main)] md:text-xs xl:text-sm">
        <span className="mr-1 text-[9px] font-medium uppercase tracking-wider text-[var(--text-muted)] xl:text-[10px]">Constructora:{" "}</span>
        {summary.builder || "Por confirmar"}
      </p>

      <div className="flex min-w-0 items-start justify-center gap-1.5 text-[11px] font-medium leading-tight text-[var(--text-main)] md:text-xs xl:text-sm">
        <Bed size={14} className="mt-0.5 shrink-0 text-[var(--accent-secondary)]" />
        <p>{formatBedroomOptions(summary.bedrooms)}</p>
      </div>

      <div className="flex min-w-0 items-start justify-center gap-1.5 text-[11px] leading-tight text-[var(--text-muted)] md:text-xs xl:text-sm">
        <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--accent-secondary)]" />
        <p>{summary.address}</p>
      </div>

      <p className="text-[12px] font-bold leading-tight text-[var(--accent-main)] md:text-sm xl:text-base">
        {price ? `Desde USD ${Math.round(price).toLocaleString("es-BO")}` : "Consultar disponibilidad"}
      </p>
      <div className="mt-auto flex items-start justify-center gap-1.5 border-t border-[var(--border-soft)] pt-1 text-[11px] font-semibold leading-tight text-[var(--text-main)] md:text-xs xl:text-sm">
        <Calendar size={14} className="mt-0.5 shrink-0 text-[var(--accent-secondary)]" />
        <p>Entrega {summary.delivery || "por confirmar"}</p>
      </div>
    </div>
  );
}
