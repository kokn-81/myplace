import type { User } from "firebase/auth";

export type AppRole = "admin" | "advisor" | "user";

export interface AuthProfile {
  uid?: string;
  email: string;
  name: string;
  role: AppRole;
}

interface CachedAuthProfile extends AuthProfile {
  cachedAt: number;
}

const AUTH_PROFILE_CACHE_PREFIX = "nia.authProfile.";
const AUTH_PROFILE_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const AUTH_PROFILE_TIMEOUT_MS = 15000;

export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (globalThis as any).VITE_API_BASE_URL ||
  "http://localhost:8000/api";

export const normalizeEmail = (email?: string | null): string => {
  return (email || "").trim().toLowerCase();
};

const buildHeaders = (headers?: HeadersInit): Headers => {
  return new Headers(headers || {});
};

const getProfileCacheKey = (email?: string | null): string | null => {
  const normalized = normalizeEmail(email);
  return normalized ? `${AUTH_PROFILE_CACHE_PREFIX}${normalized}` : null;
};

const isValidRole = (role: unknown): role is AppRole => {
  return role === "admin" || role === "advisor" || role === "user";
};

export const getCachedAuthProfile = (email?: string | null): AuthProfile | null => {
  if (typeof window === "undefined") return null;
  const key = getProfileCacheKey(email);
  if (!key) return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedAuthProfile;
    if (!cached.cachedAt || Date.now() - cached.cachedAt > AUTH_PROFILE_CACHE_TTL_MS) {
      window.localStorage.removeItem(key);
      return null;
    }
    if (!cached.email || !isValidRole(cached.role)) {
      window.localStorage.removeItem(key);
      return null;
    }
    return {
      uid: cached.uid,
      email: cached.email,
      name: cached.name || "",
      role: cached.role,
    };
  } catch (error) {
    console.warn("Auth profile cache read failed:", error);
    window.localStorage.removeItem(key);
    return null;
  }
};

export const cacheAuthProfile = (profile: AuthProfile): void => {
  if (typeof window === "undefined") return;
  const key = getProfileCacheKey(profile.email);
  if (!key || !isValidRole(profile.role)) return;

  const cached: CachedAuthProfile = {
    ...profile,
    email: normalizeEmail(profile.email),
    cachedAt: Date.now(),
  };
  window.localStorage.setItem(key, JSON.stringify(cached));
};

export const clearCachedAuthProfile = (email?: string | null): void => {
  if (typeof window === "undefined") return;
  const key = getProfileCacheKey(email);
  if (key) window.localStorage.removeItem(key);
};

export const authFetch = async (path: string, user: User | null, init: RequestInit = {}) => {
  if (!user) throw new Error("Sesion requerida.");

  const makeRequest = async (forceRefresh = false) => {
    const token = await user.getIdToken(forceRefresh);
    const headers = buildHeaders(init.headers);
    headers.set("Authorization", `Bearer ${token}`);

    return fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
    });
  };

  const response = await makeRequest(false);
  if (response.status !== 401) return response;
  return makeRequest(true);
};

export const fetchAuthProfile = async (user: User): Promise<AuthProfile> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), AUTH_PROFILE_TIMEOUT_MS);

  try {
    const response = await authFetch("/auth/me", user, { signal: controller.signal });
    if (!response.ok) {
      throw new Error("No se pudo validar tu sesion.");
    }
    const profile = (await response.json()) as AuthProfile;
    if (!isValidRole(profile.role)) {
      throw new Error("Rol invalido.");
    }
    return {
      ...profile,
      email: normalizeEmail(profile.email || user.email),
      name: profile.name || user.displayName || "",
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
};
