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

export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (globalThis as any).VITE_API_BASE_URL ||
  "http://localhost:8000/api";

const AUTH_PROFILE_CACHE_PREFIX = "nia.authProfile.";
const LAST_AUTH_PROFILE_EMAIL_KEY = "nia.lastAuthProfileEmail";
const AUTH_PROFILE_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const AUTH_PROFILE_TIMEOUT_MS = 15000;
const pendingProfileRequests = new Map<string, Promise<AuthProfile>>();

export const normalizeEmail = (email?: string | null): string => {
  return (email || "").trim().toLowerCase();
};

const canUseLocalStorage = (): boolean => {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
};

const authProfileCacheKey = (email?: string | null) => `${AUTH_PROFILE_CACHE_PREFIX}${normalizeEmail(email)}`;

const isAppRole = (value: unknown): value is AppRole => {
  return value === "admin" || value === "advisor" || value === "user";
};

const normalizeProfile = (rawProfile: any, fallbackUser?: User): AuthProfile => {
  const role = isAppRole(rawProfile?.role) ? rawProfile.role : "user";
  return {
    uid: rawProfile?.uid || fallbackUser?.uid,
    email: normalizeEmail(rawProfile?.email || fallbackUser?.email),
    name: rawProfile?.name || fallbackUser?.displayName || "",
    role,
  };
};

export const getCachedAuthProfile = (email?: string | null): CachedAuthProfile | null => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !canUseLocalStorage()) return null;

  try {
    const raw = window.localStorage.getItem(authProfileCacheKey(normalizedEmail));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedAuthProfile;
    if (normalizeEmail(parsed.email) !== normalizedEmail || !isAppRole(parsed.role)) {
      window.localStorage.removeItem(authProfileCacheKey(normalizedEmail));
      return null;
    }

    if (!parsed.cachedAt || Date.now() - parsed.cachedAt > AUTH_PROFILE_CACHE_TTL_MS) {
      window.localStorage.removeItem(authProfileCacheKey(normalizedEmail));
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(authProfileCacheKey(normalizedEmail));
    return null;
  }
};

export const getLastCachedAuthProfile = (): CachedAuthProfile | null => {
  if (!canUseLocalStorage()) return null;

  try {
    const lastEmail = window.localStorage.getItem(LAST_AUTH_PROFILE_EMAIL_KEY);
    const profile = getCachedAuthProfile(lastEmail);
    if (!profile && lastEmail) window.localStorage.removeItem(LAST_AUTH_PROFILE_EMAIL_KEY);
    return profile;
  } catch {
    window.localStorage.removeItem(LAST_AUTH_PROFILE_EMAIL_KEY);
    return null;
  }
};

export const cacheAuthProfile = (profile: AuthProfile): void => {
  const normalizedEmail = normalizeEmail(profile.email);
  if (!normalizedEmail || !isAppRole(profile.role) || !canUseLocalStorage()) return;

  const cachedProfile: CachedAuthProfile = {
    ...profile,
    email: normalizedEmail,
    cachedAt: Date.now(),
  };
  window.localStorage.setItem(authProfileCacheKey(normalizedEmail), JSON.stringify(cachedProfile));
  window.localStorage.setItem(LAST_AUTH_PROFILE_EMAIL_KEY, normalizedEmail);
};

export const clearCachedAuthProfile = (email?: string | null): void => {
  if (!canUseLocalStorage()) return;
  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail) {
    window.localStorage.removeItem(authProfileCacheKey(normalizedEmail));
    if (window.localStorage.getItem(LAST_AUTH_PROFILE_EMAIL_KEY) === normalizedEmail) {
      window.localStorage.removeItem(LAST_AUTH_PROFILE_EMAIL_KEY);
    }
    return;
  }

  Object.keys(window.localStorage)
    .filter((key) => key.startsWith(AUTH_PROFILE_CACHE_PREFIX))
    .forEach((key) => window.localStorage.removeItem(key));
  window.localStorage.removeItem(LAST_AUTH_PROFILE_EMAIL_KEY);
};

const buildHeaders = (headers?: HeadersInit): Headers => {
  const result = new Headers(headers || {});
  return result;
};

export const authFetch = async (path: string, user: User | null, init: RequestInit = {}) => {
  if (!user) throw new Error("Sesion requerida.");

  const request = async (forceRefresh: boolean) => {
    const token = await user.getIdToken(forceRefresh);
    const headers = buildHeaders(init.headers);
    headers.set("Authorization", `Bearer ${token}`);

    return fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
    });
  };

  const response = await request(false);
  if (response.status === 401) {
    return request(true);
  }
  return response;
};

export const fetchAuthProfile = async (user: User, options: { forceRefresh?: boolean } = {}): Promise<AuthProfile> => {
  const normalizedEmail = normalizeEmail(user.email || user.uid);
  const pendingRequest = options.forceRefresh ? null : pendingProfileRequests.get(normalizedEmail);
  if (pendingRequest) return pendingRequest;

  const request = (async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), AUTH_PROFILE_TIMEOUT_MS);

    try {
      const response = await authFetch("/auth/me", user, { signal: controller.signal });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || "No se pudo validar tu sesion.");
      }
      const profile = normalizeProfile(await response.json(), user);
      if (!isAppRole(profile.role)) {
        throw new Error("El backend devolvio un rol invalido.");
      }
      cacheAuthProfile(profile);
      return profile;
    } finally {
      window.clearTimeout(timeoutId);
    }
  })();

  pendingProfileRequests.set(normalizedEmail, request);
  try {
    return await request;
  } finally {
    pendingProfileRequests.delete(normalizedEmail);
  }
};