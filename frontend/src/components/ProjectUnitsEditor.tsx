import React, { useState } from "react";
import { Plus, Trash2, CheckCircle2, Layers, Flame, FileText, Sparkles, Building2 } from "lucide-react";
import {
  ProjectUnitOption,
  TYPOLOGY_PRESETS,
  URGENCY_PRESETS,
  getProjectUnitsSummary,
} from "../projectUnits";

interface ProjectUnitsEditorProps {
  units: ProjectUnitOption[];
  onChange: (units: ProjectUnitOption[]) => void;
  defaultCurrency?: string;
  onSyncBaseValues?: (minSurface: number, minPrice: number) => void;

  mensajeUrgencia?: string;
  onMensajeUrgenciaChange?: (val: string) => void;
  totalUnidades?: number | "";
  onTotalUnidadesChange?: (val: number | "") => void;
  unidadesDisponibles?: number | "";
  onUnidadesDisponiblesChange?: (val: number | "") => void;
  pisos?: number | "";
  onPisosChange?: (val: number | "") => void;
  reservaUsd?: number | "";
  onReservaUsdChange?: (val: number | "") => void;
  precioM2Desde?: number | "";
  onPrecioM2DesdeChange?: (val: number | "") => void;
  brochureUrl?: string;
  onBrochureUrlChange?: (val: string) => void;
  planesPago?: string;
  onPlanesPagoChange?: (val: string) => void;
}

export default function ProjectUnitsEditor({
  units,
  onChange,
  defaultCurrency = "$ (USD)",
  onSyncBaseValues,
  mensajeUrgencia = "",
  onMensajeUrgenciaChange,
  totalUnidades = "",
  onTotalUnidadesChange,
  unidadesDisponibles = "",
  onUnidadesDisponiblesChange,
  pisos = "",
  onPisosChange,
  reservaUsd = "",
  onReservaUsdChange,
  precioM2Desde = "",
  onPrecioM2DesdeChange,
  brochureUrl = "",
  onBrochureUrlChange,
  planesPago = "",
  onPlanesPagoChange,
}: ProjectUnitsEditorProps) {
  const [tipologia, setTipologia] = useState("Monoambiente");
  const [superficie, setSuperficie] = useState<number | "">("");
  const [precio, setPrecio] = useState<number | "">("");
  const [moneda, setMoneda] = useState(defaultCurrency);

  const summary = getProjectUnitsSummary(units);

  const handleAddUnit = () => {
    const cleanTipo = tipologia.trim();
    const cleanSup = Number(superficie) || 0;
    const cleanPrecio = Number(precio) || 0;

    if (!cleanTipo && cleanSup <= 0) return;

    const newUnit: ProjectUnitOption = {
      id: `unit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tipologia: cleanTipo || "Unidad",
      superficieM2: cleanSup,
      precio: cleanPrecio,
      moneda: moneda || defaultCurrency,
    };

    const nextUnits = [...units, newUnit];
    onChange(nextUnits);

    // Limpiar campos para la siguiente unidad
    setSuperficie("");
    setPrecio("");

    // Opcional: sincronizar valores base en el formulario padre
    if (onSyncBaseValues) {
      const nextSummary = getProjectUnitsSummary(nextUnits);
      onSyncBaseValues(nextSummary.minSurface, nextSummary.minPrice);
    }
  };

  const handleRemoveUnit = (indexToRemove: number) => {
    const nextUnits = units.filter((_, i) => i !== indexToRemove);
    onChange(nextUnits);
    if (onSyncBaseValues && nextUnits.length > 0) {
      const nextSummary = getProjectUnitsSummary(nextUnits);
      onSyncBaseValues(nextSummary.minSurface, nextSummary.minPrice);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-control)]/30 p-4 space-y-4">
      {/* Sección 1: Estado Comercial y Disponibilidad */}
      <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-panel)] p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase tracking-wider font-bold text-[var(--accent-main)] flex items-center gap-1.5">
            <Sparkles size={14} className="text-[var(--accent-main)]" />
            Estado Comercial / Disponibilidad (Personalizado)
          </label>
          <span className="text-[10px] text-[var(--text-muted)] font-medium">
            Visible en la ficha del proyecto
          </span>
        </div>

        <input
          type="text"
          value={mensajeUrgencia}
          onChange={(e) => onMensajeUrgenciaChange?.(e.target.value)}
          placeholder="Ej: 🔥 ¡Últimas 8 unidades disponibles en Lista Cero!"
          className="w-full bg-[var(--surface-control)] border border-[var(--border-soft)] rounded-md px-3 py-2 text-xs font-semibold text-[var(--text-main)] outline-none focus:border-[var(--accent-main)]"
        />

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[9px] uppercase tracking-wider font-bold text-[var(--text-muted)] mr-1">
            Plantillas:
          </span>
          {URGENCY_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onMensajeUrgenciaChange?.(preset)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors border ${
                mensajeUrgencia === preset
                  ? "bg-[var(--accent-main)] text-[#2F241D] border-[var(--accent-main)] font-bold"
                  : "bg-[var(--surface-control)] border-[var(--border-soft)] text-[var(--text-main)] hover:border-[var(--accent-main)]/60"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Métricas del Edificio e Inversión */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-amber-500/20">
          <div>
            <label className="text-[9px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">
              Pisos del Edificio
            </label>
            <input
              type="number"
              min="1"
              value={pisos}
              onChange={(e) => onPisosChange?.(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Ej: 14"
              className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-2.5 py-1.5 text-xs text-[var(--text-main)] font-semibold"
            />
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">
              Total Departamentos
            </label>
            <input
              type="number"
              min="1"
              value={totalUnidades}
              onChange={(e) => onTotalUnidadesChange?.(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Ej: 52"
              className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-2.5 py-1.5 text-xs text-[var(--text-main)] font-semibold"
            />
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">
              Unidades Restantes
            </label>
            <input
              type="number"
              min="0"
              value={unidadesDisponibles}
              onChange={(e) => onUnidadesDisponiblesChange?.(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Ej: 8"
              className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-2.5 py-1.5 text-xs text-[var(--text-main)] font-semibold"
            />
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">
              Reserva Mínima (USD)
            </label>
            <input
              type="number"
              min="0"
              value={reservaUsd}
              onChange={(e) => onReservaUsdChange?.(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Ej: 2000"
              className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-2.5 py-1.5 text-xs text-[var(--text-main)] font-semibold"
            />
          </div>
        </div>

        {/* Planes de Pago y Brochure PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div>
            <label className="text-[9px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">
              Planes de Inversión / Pago
            </label>
            <input
              type="text"
              value={planesPago}
              onChange={(e) => onPlanesPagoChange?.(e.target.value)}
              placeholder="Ej: 100% Contado ($1.250/m²) / 60% Inicial / 40% Inicial"
              className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-2.5 py-1.5 text-xs text-[var(--text-main)] font-medium"
            />
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1 flex items-center gap-1">
              <FileText size={11} className="text-amber-600" /> URL del Dossier / Brochure (PDF o Drive)
            </label>
            <input
              type="url"
              value={brochureUrl}
              onChange={(e) => onBrochureUrlChange?.(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-2.5 py-1.5 text-xs text-[var(--text-main)] font-medium"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-[var(--accent-main)] shrink-0" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--accent-main)]">
              Tipologías del Proyecto
            </h4>
            <p className="text-[11px] text-[var(--text-muted)]">
              Registra cada opción disponible (ej. Monoambiente, 1D, 2D) con su superficie y precio.
            </p>
          </div>
        </div>
        {units.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-main)]/15 border border-[var(--accent-main)]/30 px-2.5 py-0.5 text-[11px] font-bold text-[var(--accent-main)]">
            <CheckCircle2 size={12} /> {units.length} {units.length === 1 ? "opción" : "opciones"}
          </span>
        )}
      </div>

      {/* Sugerencias Rápidas de Tipologías */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] mr-1">
          Sugerencias:
        </span>
        {TYPOLOGY_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setTipologia(preset)}
            className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
              tipologia === preset
                ? "bg-[var(--accent-main)] text-[#2F241D] font-bold"
                : "bg-[var(--surface-panel)] border border-[var(--border-soft)] text-[var(--text-main)] hover:border-[var(--accent-main)]/50"
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Fila de Entradas para Agregar Unidad */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1 items-end">
        <div className="sm:col-span-4">
          <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">
            Tipología / Nombre
          </label>
          <input
            type="text"
            value={tipologia}
            onChange={(e) => setTipologia(e.target.value)}
            placeholder="Ej: Monoambiente o 2 Dormitorios"
            className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)] font-medium"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">
            Superficie (m²)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={superficie}
            onChange={(e) => setSuperficie(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Ej: 34.5"
            className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)] font-semibold"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">
            Precio
          </label>
          <div className="flex gap-1">
            <input
              type="number"
              min="0"
              value={precio}
              onChange={(e) => setPrecio(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Ej: 42000"
              className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)] font-semibold"
            />
            <select
              value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
              className="bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-2 py-2 text-xs font-bold text-[var(--text-main)]"
            >
              <option value="$ (USD)">$ USD</option>
              <option value="Bs">Bs</option>
            </select>
          </div>
        </div>

        <div className="sm:col-span-3">
          <button
            type="button"
            onClick={handleAddUnit}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent-main)] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#2F241D] hover:bg-[var(--accent-hover)] hover:text-white transition-colors shadow-sm"
          >
            <Plus size={14} /> Agregar opción
          </button>
        </div>
      </div>

      {/* Lista de Unidades Agregadas */}
      {units.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-amber-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-semibold text-amber-900 dark:text-amber-200">
            <span>
              Resumen del proyecto: <strong>{summary.surfaceLabel || "Superficie N/D"}</strong> · <strong>{summary.priceLabel || "Precio N/D"}</strong>
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              Se autocompleta como valor base para filtros y mapa.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {units.map((unit, idx) => {
              const precioM2 = unit.superficieM2 > 0 && unit.precio > 0
                ? Math.round(unit.precio / unit.superficieM2)
                : null;

              return (
                <div
                  key={unit.id || `${unit.tipologia}-${idx}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-panel)] p-2.5 shadow-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-[var(--accent-main)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent-main)] truncate">
                        {unit.tipologia}
                      </span>
                      {unit.superficieM2 > 0 && (
                        <span className="text-xs font-semibold text-[var(--text-main)]">
                          {unit.superficieM2} m²
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs font-bold text-[var(--accent-main)]">
                      {unit.precio > 0 ? (
                        <>
                          {unit.moneda === "Bs" ? "Bs" : "$"} {unit.precio.toLocaleString("en-US")} {unit.moneda === "$ (USD)" ? "USD" : ""}
                          {precioM2 && (
                            <span className="ml-1 text-[10px] font-normal text-[var(--text-muted)]">
                              (~{precioM2}/m²)
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-stone-400 font-normal">Precio a consultar</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveUnit(idx)}
                    title="Eliminar tipología"
                    className="shrink-0 p-1.5 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
