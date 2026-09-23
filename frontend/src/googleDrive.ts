import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, authPersistenceReady } from "./firebase";

export const DRIVE_READONLY_SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const TOKEN_KEY = "nia.google.drive.token";
const TOKEN_AT_KEY = "nia.google.drive.tokenAt";
const TOKEN_TTL_MS = 45 * 60 * 1000;

export type DriveLinkKind = "folder" | "file" | "unknown";

export type ParsedDriveLink = {
  kind: DriveLinkKind;
  id: string;
};

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  isFolder: boolean;
};

export const parseDriveLink = (value: string): ParsedDriveLink | null => {
  const raw = value.trim();
  if (!raw) return null;
  const folder = raw.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folder) return { kind: "folder", id: folder[1] };
  const file = raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (file) return { kind: "file", id: file[1] };
  const openId = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openId) return { kind: "folder", id: openId[1] };
  if (/^[a-zA-Z0-9_-]{20,}$/.test(raw)) return { kind: "folder", id: raw };
  return null;
};

export const isDriveMedia = (mimeType: string) =>
  mimeType.startsWith("image/") || mimeType.startsWith("video/");

const readStoredToken = () => {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY) || "";
    const at = Number(sessionStorage.getItem(TOKEN_AT_KEY) || 0);
    if (token && Date.now() - at < TOKEN_TTL_MS) return token;
  } catch {
    return "";
  }
  return "";
};

const storeToken = (token: string) => {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(TOKEN_AT_KEY, String(Date.now()));
  } catch {
    // ignore
  }
};

export const getDriveAccessToken = async (force = false) => {
  if (!force) {
    const existing = readStoredToken();
    if (existing) return existing;
  }
  await authPersistenceReady;
  const provider = new GoogleAuthProvider();
  provider.addScope(DRIVE_READONLY_SCOPE);
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken || "";
  if (!token) {
    throw new Error("Google no dio permiso de Drive. Activa Drive API en el proyecto y vuelve a autorizar.");
  }
  storeToken(token);
  return token;
};

const driveFetch = async (url: string, token: string) => {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 401) {
    throw new Error("drive_unauthorized");
  }
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail.slice(0, 180) || `Drive error ${response.status}`);
  }
  return response;
};

export const listDriveChildren = async (folderId: string, token: string): Promise<DriveFile[]> => {
  const files: DriveFile[] = [];
  let pageToken = "";
  const query = `'${folderId.replace(/'/g, "\\'")}' in parents and trashed = false`;
  do {
    const params = new URLSearchParams({
      q: query,
      pageSize: "100",
      fields: "nextPageToken,files(id,name,mimeType,size)",
      orderBy: "folder,name",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const response = await driveFetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, token);
    const data = await response.json();
    for (const file of data.files || []) {
      files.push({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: Number(file.size || 0),
        isFolder: file.mimeType === "application/vnd.google-apps.folder",
      });
    }
    pageToken = data.nextPageToken || "";
  } while (pageToken);
  return files;
};

export const getDriveFile = async (fileId: string, token: string): Promise<DriveFile> => {
  const params = new URLSearchParams({
    fields: "id,name,mimeType,size",
    supportsAllDrives: "true",
  });
  const response = await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?${params}`, token);
  const file = await response.json();
  return {
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    size: Number(file.size || 0),
    isFolder: file.mimeType === "application/vnd.google-apps.folder",
  };
};

export const downloadDriveFile = async (file: DriveFile, token: string): Promise<File> => {
  const response = await driveFetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media&supportsAllDrives=true`,
    token,
  );
  const blob = await response.blob();
  return new File([blob], file.name, { type: file.mimeType || blob.type || "application/octet-stream" });
};
