import type { LocalSearchCriteria } from "../localSearch";
import { KNOWN_ZONES } from "../localSearch";

export type CatalogSort = "recommended" | "price-asc" | "price-desc" | "delivery";
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
}
export default function CatalogFilters(props: Props) {
  const { criteria, onChange } = props;
  const set = (key: keyof LocalSearchCriteria, value: unknown) => onChange({ ...criteria, [key]: value || undefined });
  const chips: { key: keyof LocalSearchCriteria; label: string }[] = [];
  if (criteria.bedrooms) chips.push({ key: "bedrooms", label: criteria.bedrooms === "0" || criteria.bedrooms === "Monoambiente" ? "Monoambiente" : criteria.bedrooms.replace(/Dorms?/, criteria.bedrooms.startsWith("1") ? "dormitorio" : "dormitorios") });
  if (criteria.zone) chips.push({ key: "zone", label: criteria.zone });
  if (criteria.maxBudget) chips.push({ key: "maxBudget", label: `Hasta ${criteria.budgetCurrency || "USD"} ${criteria.maxBudget.toLocaleString("es-BO")}` });
  if (criteria.minBudget) chips.push({ key: "minBudget", label: `Desde ${criteria.budgetCurrency || "USD"} ${criteria.minBudget.toLocaleString("es-BO")}` });
  if (criteria.deliveryYear) chips.push({ key: "deliveryYear", label: `Entrega ${criteria.deliveryYear}` });
  if (criteria.ring) chips.push({ key: "ring", label: `${criteria.ring}.º anillo` });
  if (criteria.keywords?.length) chips.push({ key: "keywords", label: criteria.keywords.join(" ") });
  if (criteria.amenities?.length) chips.push({ key: "amenities", label: criteria.amenities.join(", ") });
  if (criteria.propertyType) chips.push({ key: "propertyType", label: criteria.propertyType });
  if (criteria.city) chips.push({ key: "city", label: criteria.city });
  if (criteria.operation) chips.push({ key: "operation", label: criteria.operation === "buy" ? "Venta" : criteria.operation === "rent" ? "Alquiler" : "Anticrético" });
  if (criteria.referenceId) chips.push({ key: "referenceId", label: `Ref. ${criteria.referenceId}` });
  const control = "min-w-0 w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface-control)] px-2 py-1.5 text-xs text-[var(--text-main)]";
  return <div className="nia-catalog-filters mt-2 w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)]/95 p-2.5 text-[var(--text-main)] shadow-lg backdrop-blur">
    <div className="mb-2 flex flex-wrap items-center justify-center gap-2 text-xs">
      {[["", "Todos", props.projectCount + props.apartmentCount], ["Proyectos", "Proyectos", props.projectCount], ["Departamentos", "Departamentos", props.apartmentCount]].map(([value, label, count]) => <button key={value} type="button" aria-pressed={props.category === value} onClick={() => props.onCategory(String(value))} className={`rounded-full border px-3 py-1.5 ${props.category === value ? "border-[var(--accent-main)] bg-[var(--accent-main)] text-stone-950" : "border-[var(--border-soft)]"}`}>{label} ({count})</button>)}
    </div>
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
      <label className="text-[10px]">Precio mínimo ({criteria.budgetCurrency || "USD"})<input className={control} type="number" min="0" step="1000" placeholder="Sin mínimo" value={criteria.minBudget ?? ""} onChange={e => set("minBudget", Number(e.target.value))} /></label>
      <label className="text-[10px]">Precio máximo ({criteria.budgetCurrency || "USD"})<input className={control} type="number" min="0" step="1000" placeholder="Sin máximo" value={criteria.maxBudget ?? ""} onChange={e => set("maxBudget", Number(e.target.value))} /></label>
      <label className="text-[10px]">Dormitorios<select className={control} value={criteria.bedrooms || ""} onChange={e => set("bedrooms", e.target.value)}><option value="">Todos</option><option value="Monoambiente">Monoambiente</option><option value="1 Dorm">1 dormitorio</option><option value="2 Dorms">2 dormitorios</option><option value="3+ Dorms">3 o más dormitorios</option></select></label>
      <label className="text-[10px]">Zona<select className={control} value={criteria.zone || ""} onChange={e => set("zone", e.target.value)}><option value="">Todas</option>{KNOWN_ZONES.map(zone => <option key={zone} value={zone}>{zone.charAt(0).toUpperCase() + zone.slice(1)}</option>)}</select></label>
      <label className="text-[10px]">Año de entrega<select className={control} value={criteria.deliveryYear || ""} onChange={e => set("deliveryYear", e.target.value)}><option value="">Cualquier entrega</option>{props.years.map(year => <option key={year}>{year}</option>)}</select></label>
      <label className="text-[10px]">Ordenar<select className={control} value={props.sort} onChange={e => props.onSort(e.target.value as CatalogSort)}><option value="recommended">Recomendados</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option><option value="delivery">Entrega más próxima</option></select></label>
    </div>
    <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5" aria-live="polite" aria-atomic="true">
      <span className="text-xs font-semibold">{props.count} {props.count === 1 ? "resultado" : "resultados"}</span>
      {chips.map(chip => <button key={chip.key} type="button" onClick={() => set(chip.key, undefined)} aria-label={`Quitar filtro ${chip.label}`} className="rounded-full bg-[var(--accent-main)]/15 px-2 py-1 text-[11px]">{chip.label} ×</button>)}
      {chips.length > 0 && <button type="button" className="px-2 py-1 text-[11px] underline" onClick={() => onChange({})}>Limpiar filtros</button>}
    </div>
  </div>;
}
