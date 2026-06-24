import type { User } from "firebase/auth";

export type AppRole = "admin" | "advisor" | "user";

export interface AuthProfile {
  uid?: string;
  email: string;
  name: string;
  role: AppRole;
}

export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (globalThis as any).VITE_API_BASE_URL ||
  "http://localhost:8000/api";

export const normalizeEmail = (email?: string | null): string => {
  return (email || "").trim().toLowerCase();
};

const buildHeaders = (headers?: HeadersInit): Headers => {
  const result = new Headers(headers || {});
  return result;
};

export const authFetch = async (path: string, user: User | null, init: RequestInit = {}) => {
  if (!user) throw new Error("Sesion requerida.");

  const token = await user.getIdToken();
  const headers = buildHeaders(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
};

export const fetchAuthProfile = async (user: User): Promise<AuthProfile> => {
  const response = await authFetch("/auth/me", user);
  if (!response.ok) {
    throw new Error("No se pudo validar tu sesion.");
  }
  return response.json();
};
