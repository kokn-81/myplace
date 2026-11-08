import type { Property } from "./types";
import { isProjectOrPreventa } from "./projectIdentity";

// Cambiar a true para reactivar el botón y los departamentos listos.
// Las propiedades, sus datos y las rutas se conservan.
export const SHOW_READY_APARTMENTS = false;

export function isCatalogPropertyVisible(property: Property, showReadyApartments: boolean = SHOW_READY_APARTMENTS): boolean {
  return showReadyApartments || isProjectOrPreventa(property);
}
