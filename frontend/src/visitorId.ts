export const VISITOR_STORAGE_KEY = "nia.visitor_id";
export const SESSION_STORAGE_KEY = "nia.session_id";

const readStorage = (storage: Storage | null, key: string) => {
  if (!storage) return "";
  try {
    return String(storage.getItem(key) || "").trim();
  } catch {
    return "";
  }
};

const writeStorage = (storage: Storage | null, key: string, value: string) => {
  if (!storage) return;
  try {
    storage.setItem(key, value);
  } catch {
    // ignore quota / private mode
  }
};

export const getDefaultVisitorStorage = (): Storage | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const getNiaVisitorId = (storage: Storage | null = getDefaultVisitorStorage()) => {
  const existing = readStorage(storage, VISITOR_STORAGE_KEY);
  if (existing) return existing;
  const created = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now()}`;
  writeStorage(storage, VISITOR_STORAGE_KEY, created);
  return created;
};

export const resolveNiaUserId = (
  firebaseUid?: string | null,
  storage: Storage | null = getDefaultVisitorStorage(),
) => {
  const uid = String(firebaseUid || "").trim();
  if (uid) return uid;
  return getNiaVisitorId(storage);
};

export const getNiaSessionId = () => {
  if (typeof window === "undefined") return "";
  try {
    const existing = String(window.sessionStorage.getItem(SESSION_STORAGE_KEY) || "").trim();
    if (existing) return existing;
    const created = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}`;
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    return getNiaVisitorId();
  }
};
