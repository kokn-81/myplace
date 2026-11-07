import { useEffect, useRef, useState } from "react";
import { ArrowDownUp, ChevronLeft, SlidersHorizontal, X } from "lucide-react";
import type { LocalSearchCriteria } from "../localSearch";
import { KNOWN_ZONES } from "../localSearch";

export type CatalogSort = "recommended" | "price-asc" | "price-desc" | "delivery";
export type CatalogGuideStep = "category" | "bedrooms" | "zone" | "budget" | "delivery" | "results" | "sort";
interface Props {
  criteria: LocalSearchCriteria;
  onChange: (criteria: LocalSearchCriteria) => void;
  sort: CatalogSort;
  onSort: (sort: CatalogSort) => void;
  years: string[];
  count: number;
  category: string;
  onCategory: (category: string) => void;
  projectCount: number;
  apartmentCount: number;
  step: CatalogGuideStep;
  onStep: (step: CatalogGuideStep) => void;
}

const QUESTIONS: Record<CatalogGuideStep, string> = {
  category: "¿Qué estás buscando?", bedrooms: "¿Cuántos dormitorios?",
  zone: "¿Qué zona prefieres?", budget: "¿Cuál es tu presupuesto?",
  delivery: "¿Para cuándo la entrega?", results: "", sort: "¿Cómo quieres ordenar?",
};

export default function CatalogFilters(props: Props) {
  const { criteria, onChange, step, onStep } = props;
  const [customBudget, setCustomBudget] = useState(false);
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");
  const headingRef = useRef<HTMLParagraphElement>(null);
  const previousStep = useRef(step);
  const set = (key: keyof LocalSearchCriteria, value: unknown) => onChange({ ...criteria, [key]: value || undefined });
  const currency = criteria.budgetCurrency || "USD";
  const afterBudget: CatalogGuideStep = props.category === "Departamentos" || props.years.length === 0 ? "results" : "delivery";

  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    setCustomBudget(false);
    if (headingRef.current?.getClientRects().length) headingRef.current.focus({ preventScroll: true });
  }, [step]);

  const back = () => {
    const previous: Record<CatalogGuideStep, CatalogGuideStep> = {
      category: "category", bedrooms: "category", zone: "bedrooms", budget: "zone",
      delivery: "budget", results: "category", sort: "results",
    };
    if (customBudget) setCustomBudget(false);
    else onStep(previous[step]);
  };
  const chooseBudget = (maxBudget?: number) => {
    onChange({ ...criteria, minBudget: undefined, maxBudget, budgetCurrency: currency });
    onStep(afterBudget);
  };

  const chips: { key: keyof LocalSearchCriteria; label: string }[] = [];
  if (criteria.bedrooms) chips.push({ key: "bedrooms", label: criteria.bedrooms === "0" || criteria.bedrooms === "Monoambiente" ? "Monoambiente" : criteria.bedrooms.replace(/Dorms?/, criteria.bedrooms.startsWith("1") ? "dormitorio" : "dormitorios") });
  if (criteria.zone) chips.push({ key: "zone", label: criteria.zone });
  if (criteria.maxBudget) chips.push({ key: "maxBudget", label: `Hasta ${currency} ${criteria.maxBudget.toLocaleString("es-BO")}` });
  if (criteria.minBudget) chips.push({ key: "minBudget", label: `Desde ${currency} ${criteria.minBudget.toLocaleString("es-BO")}` });
  if (criteria.deliveryYear) chips.push({ key: "deliveryYear", label: `Entrega ${criteria.deliveryYear}` });
  if (criteria.ring) chips.push({ key: "ring", label: `${criteria.ring}.º anillo` });
  if (criteria.keywords?.length) chips.push({ key: "keywords", label: criteria.keywords.join(" ") });
  if (criteria.amenities?.length) chips.push({ key: "amenities", label: criteria.amenities.join(", ") });
  if (criteria.propertyType) chips.push({ key: "propertyType", label: criteria.propertyType });
  if (criteria.city) chips.push({ key: "city", label: criteria.city });
  if (criteria.operation) chips.push({ key: "operation", label: criteria.operation === "buy" ? "Venta" : criteria.operation === "rent" ? "Alquiler" : "Anticrético" });
  if (criteria.referenceId) chips.push({ key: "referenceId", label: `Ref. ${criteria.referenceId}` });
  const hasFilters = chips.length > 0 || Boolean(props.category);
  const pill = (selected = false) => `shrink-0 min-h-11 rounded-full border px-4 py-2 text-xs font-semibold shadow-md backdrop-blur transition-colors ${selected ? "border-[var(--accent-main)] bg-[var(--accent-main)] text-stone-950" : "border-[var(--border-soft)] bg-[var(--surface-panel)]/95 text-[var(--text-main)] hover:border-[var(--accent-main)]"}`;
  const reset = () => { onChange({}); props.onCategory(""); props.onSort("recommended"); onStep("category"); };
  const smallButton = "inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--border-soft)] bg-[var(--surface-panel)]/95 px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-main)] shadow-sm backdrop-blur";

  return <section className="nia-catalog-guide mt-2 w-full min-w-0" aria-label="Búsqueda guiada">
    <div className="mb-1.5 flex min-w-0 items-center gap-1.5">
      {step !== "category" && step !== "results" && <button type="button" onClick={back} className={`${smallButton} !px-1.5`} aria-label="Volver a la pregunta anterior"><ChevronLeft size={16} /></button>}
      <p ref={headingRef} tabIndex={-1} aria-live="polite" aria-atomic="true" className="min-w-0 flex-1 truncate rounded-full bg-[var(--surface-panel)]/95 px-3 py-1.5 text-[11px] font-semibold text-[var(--text-main)] shadow-sm outline-none backdrop-blur">
        {step === "results" ? `${props.count} ${props.count === 1 ? "resultado" : "resultados"}` : QUESTIONS[step]}
      </p>
      {step === "results" ? <>
        <button type="button" onClick={() => onStep("category")} className={smallButton}><SlidersHorizontal size={13} /> Ajustar</button>
        <button type="button" onClick={() => onStep("sort")} className={smallButton}><ArrowDownUp size={13} /> Ordenar</button>
      </> : <button type="button" onClick={() => onStep("results")} className={smallButton}>Ver mapa · {props.count}</button>}
    </div>

    {step !== "results" && !(step === "budget" && customBudget) && <div key={step} className="nia-catalog-options flex w-full items-center gap-2 overflow-x-auto pb-1 no-scrollbar" role="group" aria-label={QUESTIONS[step]}>
      {step === "category" && [["Proyectos", "Proyectos", props.projectCount], ["Departamentos", "Departamentos", props.apartmentCount], ["", "Todos", props.projectCount + props.apartmentCount]].map(([value, label, count]) => <button key={value} type="button" aria-pressed={props.category === value} className={pill(props.category === value)} onClick={() => {
        props.onCategory(String(value));
        if (value === "Departamentos" && criteria.deliveryYear) onChange({ ...criteria, deliveryYear: undefined });
        onStep("bedrooms");
      }}>{label} ({count})</button>)}

      {step === "bedrooms" && [["Monoambiente", "Monoambiente"], ["1 Dorm", "1 dormitorio"], ["2 Dorms", "2 dormitorios"], ["3+ Dorms", "3 o más"], ["", "Cualquiera"]].map(([value, label]) => <button key={value} type="button" className={pill((criteria.bedrooms || "") === value)} aria-pressed={(criteria.bedrooms || "") === value} onClick={() => { set("bedrooms", value); onStep("zone"); }}>{label}</button>)}

      {step === "zone" && ["", ...KNOWN_ZONES].map(zone => <button key={zone} type="button" className={pill((criteria.zone || "") === zone)} aria-pressed={(criteria.zone || "") === zone} onClick={() => { set("zone", zone); onStep("budget"); }}>{zone ? zone.charAt(0).toUpperCase() + zone.slice(1) : "Cualquier zona"}</button>)}

      {step === "budget" && <>
        {(currency === "Bs" ? [5000, 8000, 12000] : [75000, 100000, 150000, 200000, 300000]).map(amount => <button key={amount} type="button" className={pill(criteria.maxBudget === amount)} aria-pressed={criteria.maxBudget === amount} onClick={() => chooseBudget(amount)}>Hasta {currency} {amount.toLocaleString("es-BO")}</button>)}
        <button type="button" className={pill(!criteria.maxBudget && !criteria.minBudget)} onClick={() => chooseBudget()}>Sin límite</button>
        <button type="button" className={pill()} onClick={() => { setMinimum(criteria.minBudget ? String(criteria.minBudget) : ""); setMaximum(criteria.maxBudget ? String(criteria.maxBudget) : ""); setCustomBudget(true); }}>Otro monto</button>
      </>}

      {step === "delivery" && ["", ...props.years].map(year => <button key={year} type="button" className={pill((criteria.deliveryYear || "") === year)} aria-pressed={(criteria.deliveryYear || "") === year} onClick={() => { set("deliveryYear", year); onStep("results"); }}>{year ? `Entrega ${year}` : "Cualquier fecha"}</button>)}

      {step === "sort" && ([["recommended", "Recomendados"], ["price-asc", "Menor precio"], ["price-desc", "Mayor precio"], ["delivery", "Entrega más próxima"]] as [CatalogSort, string][]).map(([value, label]) => <button key={value} type="button" className={pill(props.sort === value)} aria-pressed={props.sort === value} onClick={() => { props.onSort(value); onStep("results"); }}>{label}</button>)}
    </div>}

    {step === "budget" && customBudget && <form className="flex min-w-0 items-end gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)]/95 p-2 text-[var(--text-main)] shadow-md backdrop-blur" onSubmit={event => {
      event.preventDefault();
      onChange({ ...criteria, minBudget: Number(minimum) || undefined, maxBudget: Number(maximum) || undefined, budgetCurrency: currency });
      onStep(afterBudget);
    }}>
      <label className="min-w-0 flex-1 text-[10px]">Desde {currency}<input className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-control)] px-2 text-base" type="number" min="0" placeholder="Sin mínimo" value={minimum} onChange={event => setMinimum(event.target.value)} /></label>
      <label className="min-w-0 flex-1 text-[10px]">Hasta {currency}<input className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-control)] px-2 text-base" type="number" min={Number(minimum) || 0} placeholder="Sin máximo" value={maximum} onChange={event => setMaximum(event.target.value)} /></label>
      <button type="submit" className={pill(true)}>Aplicar</button>
    </form>}

    {step === "results" && hasFilters && <div className="nia-catalog-options flex w-full items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar" aria-label="Filtros aplicados">
      {props.category && <button type="button" className={smallButton} aria-label={`Quitar filtro ${props.category}`} onClick={() => props.onCategory("")}>{props.category}<X size={11} /></button>}
      {chips.map(chip => <button key={chip.key} type="button" className={smallButton} aria-label={`Quitar filtro ${chip.label}`} onClick={() => set(chip.key, undefined)}>{chip.label}<X size={11} /></button>)}
      <button type="button" className={smallButton} onClick={reset}>Limpiar</button>
    </div>}
  </section>;
}
