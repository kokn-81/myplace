import { FormEvent, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { FolderOpen, Loader2, HardDrive } from "lucide-react";
import { authFetch } from "../roleAccess";
import {
  DriveFile,
  downloadDriveFile,
  getDriveAccessToken,
  getDriveFile,
  isDriveMedia,
  listDriveChildren,
  parseDriveLink,
} from "../googleDrive";

type DriveMediaPickerProps = {
  user: User | null;
  disabled?: boolean;
  onUploaded: (urls: string[]) => void;
  onError: (message: string) => void;
  onStatus?: (message: string) => void;
};

export default function DriveMediaPicker({ user, disabled, onUploaded, onError, onStatus }: DriveMediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");
  const [token, setToken] = useState("");
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const mediaFiles = useMemo(() => files.filter((file) => isDriveMedia(file.mimeType)), [files]);
  const folders = useMemo(() => files.filter((file) => file.isFolder), [files]);
  const selectedFiles = mediaFiles.filter((file) => selected[file.id]);

  const close = () => {
    if (uploading) return;
    setOpen(false);
  };

  const ensureToken = async () => {
    const access = token || await getDriveAccessToken();
    setToken(access);
    return access;
  };

  const loadTarget = async (rawLink: string, accessToken?: string) => {
    const parsed = parseDriveLink(rawLink);
    if (!parsed) throw new Error("Pega un enlace de carpeta o archivo de Google Drive.");
    const access = accessToken || await ensureToken();
    setLoading(true);
    try {
      if (parsed.kind === "file") {
        const file = await getDriveFile(parsed.id, access);
        if (file.isFolder) {
          const children = await listDriveChildren(file.id, access);
          setFiles(children);
          setSelected({});
          return;
        }
        if (!isDriveMedia(file.mimeType)) throw new Error("Ese archivo no es imagen ni video.");
        setFiles([file]);
        setSelected({ [file.id]: true });
        return;
      }
      const children = await listDriveChildren(parsed.id, access);
      setFiles(children);
      const autoSelect: Record<string, boolean> = {};
      children.filter((file) => isDriveMedia(file.mimeType)).forEach((file) => {
        autoSelect[file.id] = true;
      });
      setSelected(autoSelect);
    } finally {
      setLoading(false);
    }
  };

  const openPicker = async () => {
    if (!user) {
      onError("Inicia sesion para usar Google Drive.");
      return;
    }
    setOpen(true);
    setFiles([]);
    setSelected({});
    try {
      await ensureToken();
    } catch (error: any) {
      onError(error?.message || "No se pudo autorizar Google Drive.");
      setOpen(false);
    }
  };

  const handleList = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await loadTarget(link);
    } catch (error: any) {
      if (String(error?.message) === "drive_unauthorized") {
        try {
          const access = await getDriveAccessToken(true);
          setToken(access);
          await loadTarget(link, access);
          return;
        } catch (retryError: any) {
          onError(retryError?.message || "No se pudo leer Drive.");
          return;
        }
      }
      onError(error?.message || "No se pudo leer Drive.");
    }
  };

  const uploadSelected = async () => {
    if (!user || selectedFiles.length === 0) return;
    setUploading(true);
    onStatus?.(`Bajando ${selectedFiles.length} archivo(s) de Drive...`);
    try {
      const access = await ensureToken();
      const blobs: File[] = [];
      for (const file of selectedFiles) {
        blobs.push(await downloadDriveFile(file, access));
      }
      const formData = new FormData();
      blobs.forEach((file) => formData.append("files", file));
      onStatus?.("Subiendo a Cloudinary...");
      const response = await authFetch("/cloudinary/upload", user, { method: "POST", body: formData });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Cloudinary rechazo la subida.");
      const urls = Array.isArray(data.urls) ? data.urls.filter(Boolean) : [];
      if (urls.length === 0) throw new Error("Drive no devolvio archivos utilizables.");
      onUploaded(urls);
      onStatus?.(`Se subieron ${urls.length} archivo(s) desde Google Drive.`);
      setOpen(false);
    } catch (error: any) {
      onError(error?.message || "No se pudieron subir las fotos de Drive.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled || !user}
        onClick={() => void openPicker()}
        className="inline-flex items-center justify-center gap-2 rounded border border-[var(--accent-main)] bg-[var(--surface-panel)] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[var(--accent-main)] shadow-sm transition-colors hover:bg-[var(--accent-main)] hover:text-[#2F241D] disabled:opacity-60"
      >
        <HardDrive size={16} />
        Desde Google Drive
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5 shadow-[var(--shadow-warm)]">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--accent-main)]">Google Drive</p>
                <h3 className="text-lg font-semibold text-[var(--text-main)]">Elegi fotos o una carpeta</h3>
              </div>
              <button type="button" onClick={close} className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Cerrar</button>
            </div>

            <form onSubmit={handleList} className="mb-4 flex flex-col gap-2 sm:flex-row">
              <input
                value={link}
                onChange={(event) => setLink(event.target.value)}
                placeholder="Pega el enlace de la carpeta o del archivo de Drive"
                className="min-w-0 flex-1 rounded border border-[var(--border-soft)] bg-[var(--surface-control)] px-3 py-2 text-sm outline-none text-[var(--text-main)]"
              />
              <button type="submit" disabled={loading || uploading} className="rounded bg-[var(--accent-main)] px-4 py-2 text-xs font-black uppercase tracking-widest text-[#2F241D]">
                {loading ? "Leyendo..." : "Listar"}
              </button>
            </form>

            {loading ? (
              <div className="flex items-center justify-center py-10 text-[var(--accent-main)]"><Loader2 className="animate-spin" /></div>
            ) : (
              <>
                {folders.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Carpetas</p>
                    <div className="flex flex-wrap gap-2">
                      {folders.map((folder) => (
                        <button
                          key={folder.id}
                          type="button"
                          onClick={() => void loadTarget(folder.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)]"
                        >
                          <FolderOpen size={14} /> {folder.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {mediaFiles.length > 0 ? (
                  <>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{selectedFiles.length}/{mediaFiles.length} seleccionadas</p>
                      <button
                        type="button"
                        className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-main)]"
                        onClick={() => {
                          const next: Record<string, boolean> = {};
                          const allOn = selectedFiles.length !== mediaFiles.length;
                          mediaFiles.forEach((file) => {
                            next[file.id] = allOn;
                          });
                          setSelected(next);
                        }}
                      >
                        {selectedFiles.length === mediaFiles.length ? "Quitar todas" : "Elegir todas"}
                      </button>
                    </div>
                    <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                      {mediaFiles.map((file) => (
                        <label key={file.id} className="flex cursor-pointer items-center gap-2 rounded border border-[var(--border-soft)] px-3 py-2 text-sm">
                          <input
                            type="checkbox"
                            checked={Boolean(selected[file.id])}
                            onChange={(event) => setSelected((current) => ({ ...current, [file.id]: event.target.checked }))}
                          />
                          <span className="truncate">{file.name}</span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : files.length > 0 ? (
                  <p className="py-6 text-center text-sm text-[var(--text-muted)]">Esta carpeta no tiene fotos ni videos. Entra a una subcarpeta.</p>
                ) : (
                  <p className="py-6 text-center text-sm text-[var(--text-muted)]">Pega el link de OPALO o del edificio y pulsa Listar.</p>
                )}
              </>
            )}

            <button
              type="button"
              disabled={uploading || selectedFiles.length === 0}
              onClick={() => void uploadSelected()}
              className="mt-5 w-full rounded bg-[var(--accent-main)] py-3 text-xs font-black uppercase tracking-widest text-[#2F241D] disabled:opacity-50"
            >
              {uploading ? "Subiendo a Cloudinary..." : `Subir ${selectedFiles.length || ""} a NIA`}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
