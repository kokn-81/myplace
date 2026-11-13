import { useSyncExternalStore } from "react";
import { ONA_UNITS, fetchOnaLiveUnits } from "./onaInventory";
import { EURODESIGN_UNITS, fetchEurodesignLiveUnits } from "./eurodesignInventory";
import { GARDEN_ZEN_BASELINE_UNITS, fetchGardenZenLiveUnits } from "./gardenZenInventory";
import { BLESS_TOWER_BASELINE_UNITS, fetchBlessTowerLiveUnits } from "./blessTowerInventory";
import { BLESS_DREI_BASELINE_UNITS, fetchBlessDreiLiveUnits } from "./blessDreiInventory";
import { DOMUS_BASELINE_UNITS, fetchDomusLiveUnits } from "./domusInventory";
import { TRIVENTO_UNITS } from "./triventoInventory";
import { BETON_UNITS } from "./betonBrutInventory";
import { VERTICAL_UNITS } from "./verticalGuemesInventory";
import { LUXE_UNITS } from "./luxeTowerInventory";
import { ALPHA_UNITS } from "./alphaLuxeInventory";

export function createInventoryResource<T>(baseline: T[], load: () => Promise<T[]>) {
  let snapshot = baseline;
  let pending: Promise<T[]> | null = null;
  const listeners = new Set<() => void>();
  const set = (next: T[] | ((current: T[]) => T[])) => {
    snapshot = typeof next === "function" ? next(snapshot) : next;
    listeners.forEach((listener) => listener());
  };
  return {
    get: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    set,
    refresh: () => {
      if (!pending) pending = load().then((units) => { set(units); return units; }).finally(() => { pending = null; });
      return pending;
    },
  };
}

export const onaInventory = createInventoryResource(ONA_UNITS, async () => (await fetchOnaLiveUnits()).units);
export const eurodesignInventory = createInventoryResource(EURODESIGN_UNITS, async () => (await fetchEurodesignLiveUnits()).units);
export const gardenZenInventory = createInventoryResource(GARDEN_ZEN_BASELINE_UNITS, fetchGardenZenLiveUnits);
export const blessTowerInventory = createInventoryResource(BLESS_TOWER_BASELINE_UNITS, fetchBlessTowerLiveUnits);
export const blessDreiInventory = createInventoryResource(BLESS_DREI_BASELINE_UNITS, fetchBlessDreiLiveUnits);
export const domusInventories = Object.fromEntries(Object.entries(DOMUS_BASELINE_UNITS).map(([id, units]) =>
  [id, createInventoryResource(units, () => fetchDomusLiveUnits(id))]));

export function useInventory<T>(resource: ReturnType<typeof createInventoryResource<T>>) {
  return [useSyncExternalStore(resource.subscribe, resource.get, resource.get), resource.set] as const;
}

export interface CatalogUnit { rooms: number; price: number; }
export function getProjectAvailableUnits(id: string): CatalogUnit[] | null {
  if (id === "5" || id === "ona" || id === "ona-residences") return onaInventory.get().filter(u => u.status === "disponible").map(u => ({ rooms: u.rooms, price: u.cash }));
  if (id === "1816" || id === "eurodesign") return eurodesignInventory.get().filter(u => u.status === "disponible" && u.rooms > 0).map(u => ({ rooms: u.rooms, price: u.cashTotal }));
  if (id === "garden-zen") return gardenZenInventory.get().filter(u => u.status === "disponible").map(u => ({ rooms: u.rooms, price: u.cashTotal }));
  if (id === "bless-tower") return blessTowerInventory.get().filter(u => u.estado === "LIBRE").map(u => ({ rooms: u.tipologia === "Monoambiente" ? 0 : parseInt(u.tipologia), price: u.precioContado }));
  if (id === "bless-drei") return blessDreiInventory.get().filter(u => u.estado === "LIBRE").map(u => ({ rooms: u.tipologia === "Monoambiente" ? 0 : 1, price: u.precioContado }));
  if (id === "trivento-iv") return TRIVENTO_UNITS.filter(u => u.estado === "LIBRE").map(u => ({ rooms: u.tipologia === "Monoambiente" ? 0 : 1, price: u.precioContado || 0 }));
  if (id === "beton-brut-ii") return BETON_UNITS.filter(u => u.estado === "LIBRE").map(u => ({ rooms: Number(u.rooms), price: u.precioContado || 0 }));
  if (id === "vertical-guemes" || id === "verticalguemes") return VERTICAL_UNITS.filter(u => u.estado === "LIBRE").map(u => ({ rooms: Number(u.rooms), price: u.cash }));
  if (id === "luxe-tower" || id === "luxetower") return LUXE_UNITS.filter(u => u.estado === "LIBRE").map(u => ({ rooms: Number(u.rooms), price: 0 }));
  if (id === "alpha-luxe" || id === "alpha-by-luxe" || id === "alphabyluxe" || id === "luxe-alpha") return ALPHA_UNITS.map(u => ({ rooms: Number(u.rooms), price: u.cash }));
  if (domusInventories[id]) return domusInventories[id].get().filter(u => u.status === "disponible").map(u => ({ rooms: u.rooms, price: u.cashTotal }));
  return null;
}

const resources = [onaInventory, eurodesignInventory, gardenZenInventory, blessTowerInventory, blessDreiInventory, ...Object.values(domusInventories)];
let revision = 0;
const listeners = new Set<() => void>();
resources.forEach(resource => resource.subscribe(() => { revision++; listeners.forEach(listener => listener()); }));
export function useInventoryRevision() {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => revision, () => 0);
}
export async function refreshProjectInventories() { return Promise.allSettled(resources.map(resource => resource.refresh())); }
