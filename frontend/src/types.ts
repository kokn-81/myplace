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
  area: string;
  lat: number;
  lng: number;
  agentId?: string;
  amenities: string[];
  images: string[];
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

