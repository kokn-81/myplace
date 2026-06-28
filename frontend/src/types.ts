export interface PropertyOffer {
  id?: string;
  operation: "Venta" | "Alquiler" | "Inversion" | "Inversión";
  price: number;
  currency: string;
  status?: string;
  agentId?: string;
  agentName?: string;
  agentWhatsapp?: string;
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
}

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

