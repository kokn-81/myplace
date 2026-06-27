import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Save, X, UploadCloud, Loader2, LogOut, ArrowLeft, Sun, Moon, Trash2, ShieldCheck, UserCircle, Pencil } from "lucide-react";
import { CustomSelect } from "../components/CustomSelect";
import { API_BASE, AppRole, authFetch, fetchAuthProfile } from "../roleAccess";

// Seguridad Firebase
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { auth } from "../firebase";

interface LocalAgent {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
}

export default function AdminDashboard() {
  // Estados de seguridad y roles
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [role, setRole] = useState<AppRole>("user");
  const [roleLoading, setRoleLoading] = useState<boolean>(false);
  const isAdmin = role === "admin";
  const [catalog, setCatalog] = useState<any[]>([]);
  const fetchCatalog = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/inmuebles`);
      const data = await res.json();
      setCatalog(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);
  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm("Seguro que deseas eliminar permanentemente este inmueble?")) return;
    try {
      const res = await authFetch(`/inmuebles/${id}`, user, { method: "DELETE" });
      if (res.ok) {
        setCatalog(catalog.filter(p => p.id !== id));
        alert("Inmueble eliminado con éxito.");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // --- ESTADOS DE DATOS ---
  const [agents, setAgents] = useState<LocalAgent[]>([]);
  const [showAgentModal, setShowAgentModal] = useState<boolean>(false);
  const [editingAgent, setEditingAgent] = useState<LocalAgent | null>(null);
  const [editingProperty, setEditingProperty] = useState<any | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    const dark = saved ? saved === 'dark' : document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    return dark;
  });

  const applyTheme = (dark: boolean) => {
    document.documentElement.classList.add('theme-switching');
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    setIsDarkMode(dark);
    window.setTimeout(() => document.documentElement.classList.remove('theme-switching'), 90);
  };

  // Estados del formulario de propiedad
  const [formAgentId, setFormAgentId] = useState<string>("");
  const [formOperation, setFormOperation] = useState<string>("Venta");
  const [formType, setFormType] = useState<string>("Departamento");
  const [formCurrency, setFormCurrency] = useState<string>("$ (USD)");
  const [formExchangeRate, setFormExchangeRate] = useState<string>("Oficial");
  const [formZone, setFormZone] = useState<string>("");
  const [isCustomZone, setIsCustomZone] = useState<boolean>(false);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [imageLinks, setImageLinks] = useState<string>("");
  const [isCloudinaryUploading, setIsCloudinaryUploading] = useState<boolean>(false);
  const [amenityInput, setAmenityInput] = useState<string>("");

  const defaultZones = ["Norte", "Sur", "Este", "Oeste", "Equipetrol", "Urubo", "Centro"];
  const allZones = Array.from(new Set<string>([...defaultZones]));
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setRole("user");
      if (currentUser) {
        setRoleLoading(true);
        try {
          const profile = await fetchAuthProfile(currentUser);
          setRole(profile.role);
        } catch (error) {
          console.error("Error validando rol admin:", error);
          setRole("user");
        } finally {
          setRoleLoading(false);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      alert("Error en protocolos de seguridad: " + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };
  const fetchAgentes = useCallback(async () => {
    try {
      if (!user) return;
      const res = await authFetch("/agentes", user);
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (error) {
      console.error("Error cargando asesores:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user && isAdmin) fetchAgentes();
  }, [user, isAdmin, fetchAgentes]);
// Manejadores de eventos
  const handleAddAgent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const whatsapp = fd.get("whatsapp") as string;
    const email = ((fd.get("email") as string) || "").trim().toLowerCase();
    if (!name || !whatsapp) return;

    try {
      const payload = { nombre: name, whatsapp: whatsapp, email: email || undefined };
      const response = await authFetch("/agentes", user, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Fallo en el motor Python");

      setSuccessMsg("Asesor guardado con éxito.");
      (e.target as HTMLFormElement).reset();
      await fetchAgentes();
    } catch (err: any) {
      setErrorMsg("Error: " + err.message);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!window.confirm("¿Confirmas la eliminación de este asesor y todos sus inmuebles vinculados?")) return;
    try {
      const response = await authFetch(`/agentes/${id}`, user, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar el asesor");
      setSuccessMsg("Registro eliminado con éxito.");
      await fetchAgentes();
    } catch (err: any) {
      setErrorMsg("Error al purgar: " + err.message);
    }
  };
  const getPropertyImageLinks = (inm: any) => Array.isArray(inm.images) ? inm.images.join(", ") : (inm.imagenes || "");
  const getPropertyAmenitiesText = (inm: any) => Array.isArray(inm.amenidades) ? inm.amenidades.join(", ") : (inm.amenidades || "");

  const handleUpdateAgent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAgent) return;
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const whatsapp = String(fd.get("whatsapp") || "").trim();
    const email = String(fd.get("email") || "").trim().toLowerCase();
    if (!name || !whatsapp) return;

    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await authFetch(`/agentes/${editingAgent.id}`, user, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: name, whatsapp, email: email || undefined }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "No se pudo editar el asesor.");
      setSuccessMsg("Asesor actualizado con éxito.");
      setEditingAgent(null);
      await fetchAgentes();
    } catch (err: any) {
      setErrorMsg("Error al editar asesor: " + err.message);
    }
  };

  const handleUpdateProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProperty) return;
    const fd = new FormData(e.currentTarget);
    const coordsParts = String(fd.get("coords") || "").split(",").map((s) => parseFloat(s.trim()));
    const lat = coordsParts.length === 2 && !Number.isNaN(coordsParts[0]) ? coordsParts[0] : Number(editingProperty.lat || 0);
    const lng = coordsParts.length === 2 && !Number.isNaN(coordsParts[1]) ? coordsParts[1] : Number(editingProperty.lng || 0);
    const payload = {
      titulo: String(fd.get("title") || "").trim() || "Propiedad sin titulo",
      precio_usd: Number(fd.get("price")) || 0,
      moneda: String(fd.get("currency") || "$ (USD)"),
      habitaciones: Number(fd.get("rooms")) || 0,
      banos: Number(fd.get("bathrooms")) || 1,
      ciudad: String(fd.get("area") || "").trim() || "Santa Cruz",
      lat,
      lng,
      operacion: String(fd.get("operation") || "Venta"),
      tipo_inmueble: String(fd.get("type") || "Departamento"),
      descripcion: String(fd.get("description") || "").trim() || "Sin descripcion.",
      agente_id: Number(fd.get("agentId")) || 0,
      imagenes: String(fd.get("imageLinks") || "").trim(),
      amenidades: String(fd.get("amenities") || "").trim(),
    };

    if (!payload.agente_id) {
      setErrorMsg("Selecciona un asesor para el inmueble.");
      return;
    }

    setIsSavingEdit(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await authFetch(`/inmuebles/${editingProperty.id}`, user, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "No se pudo editar el inmueble.");
      setSuccessMsg("Inmueble actualizado con éxito.");
      setEditingProperty(null);
      await fetchCatalog();
    } catch (err: any) {
      setErrorMsg("Error al editar inmueble: " + err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };
  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const fd = new FormData(target);

    setIsUploading(true);

    try {
      const rawCoords = fd.get("coords") as string;
      const coordsParts = rawCoords?.split(',').map(s => parseFloat(s.trim())) || [];
      let lat = 0, lng = 0;
      if (coordsParts.length === 2 && !isNaN(coordsParts[0]) && !isNaN(coordsParts[1])) {
        lat = coordsParts[0]; lng = coordsParts[1];
      }

      const parsedAgentId = Number(formAgentId);
      if (isNaN(parsedAgentId) || parsedAgentId === 0) {
        setErrorMsg("Selecciona un asesor antes de publicar el inmueble.");
        setIsUploading(false);
        return;
      }
      const finalAgentId = parsedAgentId;
      const payloadJSON = {
        titulo: fd.get("title") as string || "Propiedad sin titulo",
        precio_usd: Number(fd.get("price")) || 0,
        moneda: formCurrency || "$ (USD)",
        habitaciones: Number(fd.get("rooms")) || 0,
        banos: Number(fd.get("bathrooms")) || 1,
        ciudad: (fd.get("area") as string) || formZone || "Santa Cruz",
        lat: lat,
        lng: lng,
        operacion: formOperation,
        tipo_inmueble: formType,
        descripcion: (fd.get("description") as string) || "Sin descripcion.",
        agente_id: finalAgentId,
        imagenes: imageLinks || (fd.get("imageLinks") as string),
        amenidades: amenities.join(",") // Unimos con comas
      };

      const res = await authFetch("/inmuebles", user, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadJSON),
      });

      if (res.ok) {
        alert("Inmueble publicado con éxito!");
        target.reset();
        setAmenities([]);
        setImageLinks("");

        await fetchCatalog();
      } else {
        alert("El servidor rechazo los datos. Revisa la consola.");
      }
    } catch (err) {
      alert("Hubo un error al procesar el formulario.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDownAmenity = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = amenityInput.trim().replace(/,/g, '');
      if (val && !amenities.includes(val)) setAmenities([...amenities, val]);
      setAmenityInput("");
    }
  };

  const removeAmenity = (am: string) => setAmenities(amenities.filter(a => a !== am));

  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    setIsCloudinaryUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await authFetch("/cloudinary/upload", user, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Cloudinary rechazo la subida.");

      const newUrls = Array.isArray(data.urls) ? data.urls.filter(Boolean) : [];
      if (newUrls.length === 0) throw new Error("Cloudinary no devolvio URLs validas.");

      setImageLinks((current) => {
        const existing = current.split(",").map((url) => url.trim()).filter(Boolean);
        return [...existing, ...newUrls].join(", ");
      });
      setSuccessMsg(`Se subieron ${newUrls.length} archivo(s) a Cloudinary.`);
      e.target.value = "";
    } catch (err: any) {
      setErrorMsg("Error al subir archivos: " + err.message);
    } finally {
      setIsCloudinaryUploading(false);
    }
  };


  // Renderizado condicional

  // Carga de seguridad
  if (authLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--surface-page)] dark:bg-[var(--surface-panel)]"><Loader2 className="animate-spin text-[var(--accent-main)] w-8 h-8" /></div>;
  }

  // Muro de login
  if (!user) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center font-sans p-4">
        <div className="bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] p-8 rounded-xl shadow-[var(--shadow-warm)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] text-center max-w-sm w-full">
          <ShieldCheck className="w-12 h-12 text-[var(--accent-main)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--text-main)] dark:text-[var(--text-main)] mb-2 uppercase tracking-widest">O.P.A.L.O.</h2>
          <p className="text-sm text-[var(--text-muted)] dark:text-[var(--text-muted)] mb-6">Identificacion biometrica digital requerida.</p>
          <button onClick={handleLogin} className="w-full bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-[#2F241D] hover:text-white font-bold py-3 rounded transition-colors uppercase tracking-widest text-xs shadow-md">
            Acceder con Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center font-sans p-4">
        <div className="bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] p-8 rounded-xl shadow-[var(--shadow-warm)] border border-[var(--border-soft)] text-center max-w-md w-full">
          <ShieldCheck className="w-12 h-12 text-[var(--accent-main)] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-main)] mb-2">Acceso admin restringido</h2>
          <p className="text-sm text-[var(--text-muted)] mb-2">Tu correo no tiene permisos de administrador.</p>
          {user?.email && <p className="text-xs text-[var(--accent-main)] mb-6">Sesión actual: {user.email}</p>}
          <div className="flex gap-2 justify-center">
            <Link to="/" className="bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-[#2F241D] hover:text-white font-bold px-4 py-3 rounded transition-colors uppercase tracking-widest text-xs shadow-md">Volver al mapa</Link>
            <button onClick={handleLogout} className="border border-[var(--border-soft)] text-[var(--text-muted)] font-bold px-4 py-3 rounded uppercase tracking-widest text-xs">Salir</button>
          </div>
        </div>
      </div>
    );
  }
  // Pantalla 3: Auto-Registro Obligatorio para Asesores Nuevos
  // Centro de mando principal
  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-main)] dark:bg-[var(--surface-page)] dark:text-[var(--text-main)] p-8 font-sans transition-colors">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h1 className="text-4xl text-[var(--color-chocolate)] dark:text-[var(--text-main)] font-bold tracking-tight uppercase">Centro de Mando</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => applyTheme(!isDarkMode)} className="text-[10px] bg-[var(--color-chocolate)] dark:bg-[var(--surface-control)] hover:bg-[var(--accent-hover)] dark:hover:bg-[var(--accent-hover)] border border-[var(--accent-main)]/50 dark:border-[var(--border-soft)] text-[var(--color-ivory)] dark:text-[var(--text-muted)] px-3 py-2 rounded font-bold uppercase tracking-wider transition-colors flex items-center gap-1">
                {isDarkMode ? <Sun size={12} /> : <Moon size={12} />} {isDarkMode ? 'Claro' : 'Oscuro'}
              </button>
              <Link to="/" className="text-[10px] bg-[var(--color-chocolate)] dark:bg-[var(--surface-control)] hover:bg-[var(--accent-hover)] dark:hover:bg-[var(--accent-hover)] border border-[var(--accent-main)]/50 dark:border-[var(--border-soft)] text-[var(--color-ivory)] dark:text-[var(--text-muted)] px-3 py-2 rounded font-bold uppercase tracking-wider transition-colors flex items-center gap-1">
                <ArrowLeft size={12} /> Mapa
              </Link>
              <button onClick={handleLogout} className="text-[10px] bg-[var(--color-brick)] dark:bg-[var(--surface-panel)] hover:bg-[var(--accent-hover)] dark:hover:bg-[rgba(157,47,37,0.22)] border border-[var(--color-brick)]/60 dark:border-red-900/50 text-[var(--color-ivory)] dark:text-red-400 px-3 py-2 rounded font-bold uppercase tracking-wider transition-colors flex items-center gap-1">
                <LogOut size={12} /> {isAdmin ? 'Cerrar Admin' : 'Cerrar Sesion'}
              </button>
            </div>
          </div>
          <p className="text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-2 text-sm flex items-center gap-2">
            Terminal activa. Operador autenticado: <span className="font-bold text-[var(--accent-main)]">{user.displayName}</span>
          </p>
        </header>

        <form onSubmit={handleAddProperty} className="bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-strong)]/35 dark:border-[var(--border-soft)] shadow-[var(--shadow-warm)] rounded-2xl p-8 space-y-8">
          {errorMsg && <div className="bg-red-50 dark:bg-[rgba(157,47,37,0.16)] text-red-600 dark:text-red-400 p-4 border border-red-200 dark:border-red-800 rounded font-bold">{errorMsg}</div>}
          {successMsg && <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 border border-green-200 dark:border-green-800 rounded font-bold">{successMsg}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase tracking-widest text-[var(--text-muted)] dark:text-[var(--text-muted)] font-bold">Asesor Designado</label>
                {isAdmin && (
                  <button type="button" onClick={() => setShowAgentModal(true)} className="text-[var(--color-chocolate)] dark:text-[var(--accent-main)] text-xs border border-[var(--accent-main)]/60 dark:border-[var(--border-soft)] px-2 py-1 flex items-center gap-1 rounded bg-[var(--accent-main)]/10 hover:bg-[var(--accent-main)] hover:text-white dark:hover:bg-[var(--surface-panel-muted)] font-bold shadow-sm transition-colors">
                    Gestor de Asesores
                  </button>
                )}
              </div>

              {isAdmin ? (
                <CustomSelect
                  name="agentId"
                  value={formAgentId}
                  onChange={setFormAgentId}
                  placeholder="Selecciona un Asesor..."
                  options={agents.map(a => ({ value: a.id, label: a.name }))}
                  wrapperClassName="relative w-full"
                  triggerClassName="bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-4 py-3 text-sm focus-within:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]"
                />
              ) : (
                <div className="w-full bg-[var(--surface-panel-muted)] dark:bg-[rgba(38,28,23,0.82)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-4 py-3 text-sm text-[var(--text-main)] dark:text-[var(--text-main)] flex justify-between items-center opacity-80 cursor-not-allowed">
                  <span className="font-bold flex items-center gap-2"><UserCircle size={16} className="text-[var(--accent-main)]"/> {user.displayName}</span>
                  <span className="text-[10px] uppercase font-bold text-stone-400">Identidad Protegida</span>
                </div>
              )}

            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[var(--text-muted)] dark:text-[var(--text-muted)] font-bold mb-2 block">Título Comercial</label>
              <input name="title" required type="text" placeholder="Ej: Hermosa Casa en Urubo" className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-4 py-3 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
            </div>
          </div>

          <div className="bg-[#F0E6D4] dark:bg-[rgba(38,28,23,0.68)] p-6 rounded-xl border border-[var(--border-soft)] dark:border-[var(--border-soft)] grid grid-cols-1 md:grid-cols-5 gap-4">
            <h3 className="col-span-full text-xs uppercase tracking-widest text-[var(--text-muted)] dark:text-[var(--text-muted)] font-bold mb-2">Caracteristicas Fisicas</h3>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Operación</label>
              <CustomSelect
                name="operation"
                value={formOperation}
                onChange={setFormOperation}
                placeholder="Operación"
                options={[{ value: "Venta", label: "Venta" }, { value: "Alquiler", label: "Alquiler" }, { value: "Inversion", label: "Inversion" }]}
                wrapperClassName="relative w-full"
                triggerClassName="bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus-within:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Tipo</label>
              <CustomSelect
                name="type"
                value={formType}
                onChange={setFormType}
                placeholder="Tipo"
                options={[{ value: "Departamento", label: "Departamento" }, { value: "Casa", label: "Casa" }, { value: "Terreno", label: "Terreno" }]}
                wrapperClassName="relative w-full"
                triggerClassName="bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus-within:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Habitaciones</label>
              <input name="rooms" type="number" required className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Baños</label>
              <input name="bathrooms" type="number" min="0" defaultValue="1" required className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Zona</label>
              {isCustomZone ? (
                <div className="flex relative">
                   <input autoFocus name="area" value={formZone} onChange={(e) => setFormZone(e.target.value)} type="text" placeholder="Ej: Norte" className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
                   <button type="button" onClick={() => { setIsCustomZone(false); setFormZone(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-red-500"><X size={14}/></button>
                </div>
              ) : (
                <CustomSelect
                  name="area"
                  value={formZone}
                  onChange={(val: string) => {
                    if (val === "___NEW___") { setIsCustomZone(true); setFormZone(""); } else { setFormZone(val); }
                  }}
                  placeholder="Zona"
                  options={[...allZones.map(z => ({ value: z, label: z })), { value: "___NEW___", label: "+ Nueva Zona..." }]}
                  wrapperClassName="relative w-full"
                  triggerClassName="bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus-within:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]"
                />
              )}
            </div>
          </div>

          <div className="bg-[#F0E6D4] dark:bg-[rgba(38,28,23,0.68)] p-6 rounded-xl border border-[var(--accent-main)]/50 grid grid-cols-1 md:grid-cols-3 gap-4">
            <h3 className="col-span-full text-xs uppercase tracking-widest text-[var(--accent-main)] font-bold mb-2">Datos Monetarios</h3>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Moneda</label>
              <CustomSelect
                name="currency"
                value={formCurrency}
                onChange={setFormCurrency}
                placeholder="Moneda"
                options={[{ value: "$ (USD)", label: "$ (USD)" }, { value: "Bs", label: "Bs" }]}
                wrapperClassName="relative w-full"
                triggerClassName="bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus-within:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Precio</label>
              <input name="price" type="number" required className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
            </div>
            <div className={`transition-all duration-300 ${formCurrency === 'Bs' ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">
                T/C (Cambio) {formCurrency === 'Bs' && <span className="text-red-500 lowercase ml-1">(no aplica)</span>}
              </label>
              <CustomSelect
                name="exchangeRate"
                value={formExchangeRate}
                onChange={setFormExchangeRate}
                placeholder="T/C"
                options={[{ value: "Oficial", label: "Oficial" }, { value: "Mercado Paralelo", label: "Mercado Paralelo" }]}
                wrapperClassName="relative w-full"
                triggerClassName="bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus-within:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-[var(--accent-main)] dark:text-[var(--text-muted)] flex items-center gap-1 font-bold mb-2">Coordenadas Exactas</label>
            <input name="coords" required type="text" placeholder="Ej: -17.771632, -63.194511" className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-4 py-3 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
            <p className="text-[10px] text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-2 italic">Haz click derecho sobre el pin rojo en Google Maps, copia los numeros y pegalos aqui.</p>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-[var(--text-main)] dark:text-[var(--text-main)] font-bold mb-2 block">Descripción y Amenidades</label>
            <textarea name="description" rows={5} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-4 py-3 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] mb-4" placeholder={"Ej: Hermoso departamento de 1 dormitorio amoblado..."} />

            <div className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-4 py-2 focus-within:border-gold flex flex-wrap gap-2 items-center mb-4 min-h-[46px]">
              {amenities.map(am => (
                <span key={am} className="bg-[var(--accent-main)]/15 text-[var(--accent-main)] text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  {am} <button type="button" onClick={() => removeAmenity(am)} className="hover:text-red-500"><X size={12}/></button>
                </span>
              ))}
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={handleKeyDownAmenity}
                className="bg-transparent outline-none text-[var(--text-main)] dark:text-[var(--text-main)] text-sm flex-1 min-w-[150px] placeholder:text-stone-400 dark:placeholder:text-stone-500"
                placeholder={amenities.length === 0 ? "Añadir amenidades (presiona Enter)" : "Añadir más..."}
              />
            </div>

            <label className="text-xs uppercase tracking-widest text-[var(--text-main)] dark:text-[var(--text-main)] font-bold mb-2 block">
              Multimedia de la Propiedad
            </label>
            <p className="text-[10px] text-stone-500 mb-3 italic">
              Sube imágenes o videos desde tu ordenador, o pega URLs directas de Cloudinary separadas por coma.
            </p>

            <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3 rounded border border-dashed border-[var(--accent-main)]/50 bg-[var(--accent-main)]/10 p-4">
              <label className={`inline-flex items-center justify-center gap-2 rounded bg-[var(--accent-main)] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#2F241D] shadow-md transition-colors ${isCloudinaryUploading ? 'opacity-60 cursor-wait' : 'hover:bg-[var(--accent-hover)] hover:text-white cursor-pointer'}`}>
                {isCloudinaryUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                {isCloudinaryUploading ? 'Subiendo...' : 'Seleccionar archivos'}
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  disabled={isCloudinaryUploading}
                  onChange={handleCloudinaryUpload}
                />
              </label>
              <span className="text-[11px] text-[var(--text-muted)] dark:text-[var(--text-muted)]">
                Puedes seleccionar varias fotos o videos a la vez. Las URLs aparecerán abajo automáticamente.
              </span>
            </div>

            <textarea
              name="imageLinks"
              required
              rows={4}
              value={imageLinks}
              onChange={(e) => setImageLinks(e.target.value)}
              className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-4 py-3 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] mb-4"
              placeholder="Ej: https://res.cloudinary.com/.../foto1.jpg, https://res.cloudinary.com/.../foto2.jpg"
            />
          </div>

          <button disabled={isUploading} type="submit" className="w-full bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-[#2F241D] hover:text-white font-bold py-4 rounded shadow-md transition-colors uppercase tracking-widest text-sm flex justify-center items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isUploading ? <><Loader2 size={18} className="animate-spin" /> Procesando...</> : <><Save size={18} /> Publicar Inmueble</>}
          </button>
        </form>
      </div>


      {isAdmin && editingProperty && (
        <div className="fixed inset-0 bg-[rgba(58,33,25,0.22)] dark:bg-[rgba(16,12,10,0.72)] backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded-xl max-w-3xl w-full shadow-[var(--shadow-warm)] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-soft)]">
              <h3 className="text-[var(--text-main)] uppercase tracking-widest text-sm font-bold flex items-center gap-2"><Pencil className="text-[var(--accent-main)]" size={16}/> Editar Inmueble #{editingProperty.id}</h3>
              <button onClick={() => setEditingProperty(null)} className="text-stone-400 hover:text-primary dark:hover:text-white"><X size={18}/></button>
            </div>

            <form onSubmit={handleUpdateProperty} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Título Comercial</label>
                  <input name="title" required defaultValue={editingProperty.titulo || ""} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Asesor</label>
                  <select name="agentId" required defaultValue={String(editingProperty.agente_id || editingProperty.agentId || "")} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500">
                    <option value="">Selecciona un asesor...</option>
                    {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Operación</label>
                  <select name="operation" defaultValue={editingProperty.operacion || "Venta"} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500">
                    <option>Venta</option>
                    <option>Alquiler</option>
                    <option>Anticrético</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Tipo</label>
                  <select name="type" defaultValue={editingProperty.tipo_inmueble || "Departamento"} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500">
                    <option>Departamento</option>
                    <option>Casa</option>
                    <option>Oficina</option>
                    <option>Terreno</option>
                    <option>Local Comercial</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Moneda</label>
                  <select name="currency" defaultValue={editingProperty.moneda || "$ (USD)"} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500">
                    <option>$ (USD)</option>
                    <option>Bs</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Precio</label>
                  <input name="price" type="number" required defaultValue={editingProperty.precio_usd || 0} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Habitaciones</label>
                  <input name="rooms" type="number" min="0" defaultValue={editingProperty.habitaciones || 0} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Baños</label>
                  <input name="bathrooms" type="number" min="0" defaultValue={editingProperty.banos || 1} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Zona</label>
                  <input name="area" defaultValue={editingProperty.ciudad || ""} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Coordenadas</label>
                  <input name="coords" defaultValue={`${editingProperty.lat || 0}, ${editingProperty.lng || 0}`} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Descripción</label>
                <textarea name="description" rows={5} defaultValue={editingProperty.descripcion || ""} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500 resize-y" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Amenidades</label>
                <textarea name="amenities" rows={3} defaultValue={getPropertyAmenitiesText(editingProperty)} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500 resize-y" placeholder="Piscina, Parqueo, Sauna" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Imágenes / videos</label>
                <textarea name="imageLinks" rows={3} defaultValue={getPropertyImageLinks(editingProperty)} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500 resize-y" placeholder="URLs separadas por coma" />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingProperty(null)} className="border border-[var(--border-soft)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold px-5 py-3 rounded transition-colors">Cancelar</button>
                <button disabled={isSavingEdit} type="submit" className="bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-[#2F241D] hover:text-white font-bold px-5 py-3 rounded shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {isSavingEdit ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : <><Save size={18} /> Guardar Cambios</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL SOLO VISIBLE PARA ADMINISTRADORES */}
      {isAdmin && showAgentModal && (
        <div className="fixed inset-0 bg-[rgba(58,33,25,0.22)] dark:bg-[rgba(16,12,10,0.72)] backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded-xl max-w-md w-full shadow-[var(--shadow-warm)] flex flex-col max-h-[90vh]">

            <div className="flex justify-between items-center p-6 border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] shrink-0">
              <h3 className="text-[var(--text-main)] dark:text-[var(--text-main)] uppercase tracking-widest text-sm font-bold flex items-center gap-2"><ShieldCheck className="text-[var(--accent-main)]" size={16}/> Protocolo Admin: Gestor de Asesores</h3>
              <button onClick={() => setShowAgentModal(false)} className="text-stone-400 hover:text-primary dark:hover:text-white"><X size={18}/></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              <form key={editingAgent?.id || "new-agent"} onSubmit={editingAgent ? handleUpdateAgent : handleAddAgent} className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent-main)] mb-2">{editingAgent ? "Editar Credencial" : "+ Alta de Credencial"}</h4>
                <div>
                  <input name="name" required type="text" placeholder="Nombre Completo" defaultValue={editingAgent?.name || ""} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
                </div>
                <div>
                  <input name="whatsapp" required type="text" placeholder="WhatsApp (Ej: 59170000000)" defaultValue={editingAgent?.whatsapp || ""} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
                </div>
                                <div>
                  <input name="email" type="email" placeholder="Email Google autorizado (opcional)" defaultValue={editingAgent?.email || ""} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
                </div>
                <button type="submit" className="w-full bg-[var(--accent-secondary)] dark:bg-[var(--accent-main)] text-white dark:text-[#1B1411] shadow-md font-bold text-xs py-2 rounded hover:bg-[var(--color-teal-deep)] dark:hover:bg-[var(--accent-main)] transition-colors">{editingAgent ? "Guardar Cambios" : "Crear Asesor"}</button>
                {editingAgent && (
                  <button type="button" onClick={() => setEditingAgent(null)} className="w-full border border-[var(--border-soft)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold text-xs py-2 rounded transition-colors">Cancelar edición</button>
                )}
              </form>

              <hr className="border-[var(--border-soft)] dark:border-[var(--border-soft)]" />

              <div>
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-red-500 mb-4">Módulo de Gestión</h4>
                <div className="space-y-2">
                  {agents.length === 0 ? (
                    <p className="text-xs text-stone-500 italic">Base de datos vacía.</p>
                  ) : (
                    agents.map(a => (
                      <div key={a.id} className="flex justify-between items-center bg-[var(--surface-panel-muted)] dark:bg-[rgba(38,28,23,0.68)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] p-2 rounded">
                        <div>
                          <p className="text-xs font-bold text-[var(--text-main)] dark:text-[var(--text-main)]">{a.name}</p>
                          <p className="text-[10px] text-stone-500">{a.whatsapp}</p>
                          {a.email && <p className="text-[10px] text-stone-500">{a.email}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingAgent(a)} className="text-[var(--color-teal-deep)] dark:text-[var(--accent-main)] hover:bg-[rgba(42,95,96,0.1)] p-2 rounded transition-colors" title="Editar Asesor">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDeleteAgent(a.id)} className="text-red-400 hover:text-red-600 bg-red-50 dark:bg-[rgba(157,47,37,0.16)] p-2 rounded transition-colors" title="Eliminar Asesor">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECCION DE GESTION DE INMUEBLES */}
      <div className="mt-12 bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] rounded-xl shadow-[var(--shadow-warm)] border border-[var(--border-strong)]/35 dark:border-[var(--border-soft)] p-8">
        <h3 className="text-lg font-bold text-[var(--text-main)] dark:text-[var(--text-main)] mb-6 border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] pb-4">
          Gestión de Inmuebles Publicados
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-muted)] dark:text-[var(--text-muted)]">
            <thead className="bg-[var(--surface-control)] dark:bg-[var(--surface-control)] text-xs uppercase font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">ID</th>
                <th className="px-4 py-3">Titulo</th>
                <th className="px-4 py-3">Operación</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {catalog.map(inm => (
                <tr key={inm.id} className="border-b border-[var(--border-soft)] dark:border-[var(--border-soft)] last:border-0 hover:bg-[#F0E6D4] dark:hover:bg-[rgba(38,28,23,0.72)] transition">
                  <td className="px-4 py-3 font-mono font-bold text-[var(--color-chocolate)] dark:text-[var(--accent-main)]">#{inm.id}</td>
                  <td className="px-4 py-3 font-medium text-[var(--text-main)] dark:text-[var(--text-main)]">{inm.titulo}</td>
                  <td className="px-4 py-3">{inm.operacion}</td>
                  <td className="px-4 py-3">{inm.moneda} {inm.precio_usd}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingProperty(inm)}
                        className="text-[var(--color-teal-deep)] dark:text-[var(--accent-main)] hover:bg-[rgba(42,95,96,0.1)] dark:hover:bg-[rgba(201,159,112,0.12)] px-3 py-1.5 rounded transition font-bold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(inm.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded transition font-bold"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {catalog.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 italic text-stone-400">No hay inmuebles publicados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}










