import type { ProjectUnitOption } from "./projectUnits";
export type { ProjectUnitOption };

export interface PropertyAgent {
  id?: string;
  name?: string;
  whatsapp?: string;
  oficina?: string;
}

export interface PropertyOffer {
  id?: string;
  operation: "Venta" | "Alquiler" | "Inversion" | "Inversión";
  price: number;
  currency: string;
  status?: string;
  agentId?: string;
  agentName?: string;
  agentWhatsapp?: string;
  captador?: PropertyAgent | null;
  colocador?: PropertyAgent | null;
  incluyeExpensas?: boolean;
  montoExpensas?: number | null;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  operation: "Venta" | "Alquiler" | "Inversión";
  type: string;
  price: number;
  currency: string;
  exchangeRate?: string;
  rooms: number;
  bathrooms: number;
  area: string;
  city?: string;
  zone?: string;
  lat: number;
  lng: number;
  agentId?: string;
  agentName?: string;
  agentWhatsapp?: string;
  offers?: PropertyOffer[];
  amenities: string[];
  images: string[];
  detailsLoaded?: boolean;
  createdAt?: number;
  complejoId?: string | null;
  complejoNombre?: string | null;
  ocupacion?: string;
  superficieM2?: number | null;
  amoblado?: boolean;
  fechaEntrega?: string | null;
  avanceObra?: number | null;
  faseObra?: string | null;
  subtipoComercial?: string | null;
  dimensiones?: string | null;
  serviciosBasicos?: string | null;
  unidadesProyecto?: ProjectUnitOption[] | null;
  datosEspecificosJson?: string | null;
  piso?: string | null;
  mensajeUrgencia?: string | null;
  totalUnidades?: number | null;
  unidadesDisponibles?: number | null;
  pisos?: number | null;
  reservaUsd?: number | null;
  precioM2Desde?: number | null;
  brochureUrl?: string | null;
  planesPago?: string | null;
  captador?: PropertyAgent | null;
  captadorId?: string | null;
  captadorNombre?: string | null;
  captadorWhatsapp?: string | null;
  captadorOficina?: string | null;
}

export type PropertyType = "Departamento" | "Casa" | "Comercial" | "Terreno" | "Proyecto (preventa)" | "Proyecto";
export const PROPERTY_TYPES: PropertyType[] = [
  "Departamento",
  "Casa",
  "Comercial",
  "Terreno",
  "Proyecto",
];

export const formatPropertyTypeLabel = (type?: string | null): string => {
  if (!type) return "Inmueble";
  if (type === "Proyecto (preventa)" || type === "Proyecto") return "Proyecto";
  return type;
};

export const isProjectType = (type?: string | null): boolean => {
  if (!type) return false;
  const t = type.toLowerCase();
  return t.includes("proyecto") || t.includes("preventa");
};

export interface Agent {
  id: string;
  name: string;
  whatsapp: string;
}

export interface User {
  id: string;
  userId: string;
  email: string;
  name?: string;
  favorites: string[];
  role: "user" | "admin";
}

