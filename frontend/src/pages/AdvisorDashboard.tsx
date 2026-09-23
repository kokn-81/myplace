import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, LogOut, Moon, Save, ShieldCheck, Sun, UploadCloud, UserCircle, X } from "lucide-react";
import { GoogleAuthProvider, User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, authPersistenceReady } from "../firebase";
import { CustomSelect } from "../components/CustomSelect";
import DriveMediaPicker from "../components/DriveMediaPicker";
import { API_BASE, AppRole, authFetch, cacheAuthProfile, clearCachedAuthProfile, fetchAuthProfile, getCachedAuthProfile, normalizeEmail } from "../roleAccess";
import { calculateDeliveryCountdown } from "../projectCountdown";
import ProjectUnitsEditor from "../components/ProjectUnitsEditor";
import { ProjectUnitOption, serializeProjectUnitsJson, serializeProjectDetailsJson, getProjectUnitsSummary } from "../projectUnits";
import { PROPERTY_TYPES, PropertyType, isProjectType } from "../types";

interface LocalAgent {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
}

const normalizeBoliviaPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  const withoutPrefix = digits.startsWith("591") ? digits.slice(3) : digits;
  return `591${withoutPrefix}`;
};

export default function AdvisorDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [role, setRole] = useState<AppRole>("user");
  const [roleLoading, setRoleLoading] = useState(false);
  const [agents, setAgents] = useState<LocalAgent[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [formComplejo, setFormComplejo] = useState("");
  const [formOcupacion, setFormOcupacion] = useState("Disponible");
  const [formAmoblado, setFormAmoblado] = useState(false);
  const [formExpensas, setFormExpensas] = useState(false);
  const [formFechaEntrega, setFormFechaEntrega] = useState("");
  const [formAvanceObra, setFormAvanceObra] = useState<number | "">("");
  const [formFaseObra, setFormFaseObra] = useState("Obra gruesa");
  const [formSubtipoComercial, setFormSubtipoComercial] = useState("Oficina");
  const [formDimensiones, setFormDimensiones] = useState("");
  const [formServiciosBasicos, setFormServiciosBasicos] = useState("");
  const [officeName, setOfficeName] = useState("REMAX Patrimonio");
  const [isUploading, setIsUploading] = useState(false);
  const [isCloudinaryUploading, setIsCloudinaryUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [formOperation, setFormOperation] = useState("Venta");
  const [formType, setFormType] = useState<string>("Departamento");
  const [formCurrency, setFormCurrency] = useState("$ (USD)");
  const [formExchangeRate, setFormExchangeRate] = useState("Oficial");
  const [formZone, setFormZone] = useState("");
  const [isCustomZone, setIsCustomZone] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [imageLinks, setImageLinks] = useState("");
  const [projectUnits, setProjectUnits] = useState<ProjectUnitOption[]>([]);
  const [projectUrgencyMessage, setProjectUrgencyMessage] = useState("");
  const [projectTotalUnits, setProjectTotalUnits] = useState<number | "">("");
  const [projectAvailableUnits, setProjectAvailableUnits] = useState<number | "">("");
  const [projectFloors, setProjectFloors] = useState<number | "">("");
  const [projectReserveUsd, setProjectReserveUsd] = useState<number | "">("");
  const [projectPriceM2From, setProjectPriceM2From] = useState<number | "">("");
  const [projectBrochureUrl, setProjectBrochureUrl] = useState("");
  const [projectPaymentPlans, setProjectPaymentPlans] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    const dark = saved ? saved === "dark" : document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
    return dark;
  });

  const applyTheme = (dark: boolean) => {
    document.documentElement.classList.add("theme-switching");
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
    setIsDarkMode(dark);
    window.setTimeout(() => document.documentElement.classList.remove("theme-switching"), 90);
  };

  const email = normalizeEmail(user?.email);
  const currentAgent = agents.find((agent) => normalizeEmail(agent.email) === email);
  const advisorCatalog = useMemo(
    () => catalog.filter((inm) => String(inm.agente_id) === String(currentAgent?.id)),
    [catalog, currentAgent?.id]
  );
  const countdownPreview = useMemo(() => {
    if (!isProjectType(formType) || !formFechaEntrega) return null;
    return calculateDeliveryCountdown(formFechaEntrega);
  }, [formType, formFechaEntrega]);
  const defaultZones = ["Norte", "Sur", "Este", "Oeste", "Equipetrol", "Urubo", "Centro"];
  const operationOptions = [
    { value: "Venta", label: "Venta" },
    { value: "Alquiler", label: "Alquiler" },
    { value: "Alquiler y Venta", label: "Alquiler y Venta" },
    { value: "Inversion", label: "Inversion" },
  ];

  const buildOffersPayload = (fd: FormData, operation: string, agentId: number, fallbackCurrency: string) => {
    if (operation === "Alquiler y Venta") {
      return [
        { operacion: "Alquiler", precio: Number(fd.get("rentPrice")) || 0, moneda: String(fd.get("rentCurrency") || "Bs"), agente_id: agentId, estado: "Publicado" },
        { operacion: "Venta", precio: Number(fd.get("salePrice")) || 0, moneda: String(fd.get("saleCurrency") || "$ (USD)"), agente_id: agentId, estado: "Publicado" },
      ].filter((offer) => offer.precio > 0);
    }
    return [{ operacion: operation, precio: Number(fd.get("price")) || 0, moneda: fallbackCurrency, agente_id: agentId, estado: "Publicado" }];
  };

  const formatOffersSummary = (property: any) => {
    const offers = Array.isArray(property?.ofertas) && property.ofertas.length > 0
      ? property.ofertas
      : [{ operacion: property.operacion, precio: property.precio_usd, moneda: property.moneda }];
    return offers.map((offer: any) => `${offer.operacion}: ${offer.moneda || "$ (USD)"} ${Number(offer.precio || 0).toLocaleString("es-BO")}`).join(" Â· ");
  };

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (cancelled) return;

      setUser(currentUser);
      setDisplayName(currentUser?.displayName || "");
      if (!currentUser) {
        setRole("user");
        setRoleLoading(false);
        setAuthLoading(false);
        return;
      }

      const cachedProfile = getCachedAuthProfile(currentUser.email);
      setRole(cachedProfile?.role || "user");
      setRoleLoading(true);
      setAuthLoading(false);

      try {
        const profile = await fetchAuthProfile(currentUser);
        if (cancelled) return;
        cacheAuthProfile(profile);
        setRole(profile.role);
      } catch (error) {
        console.error("Error validando rol asesor:", error);
        if (!cachedProfile) setRole("user");
      } finally {
        if (!cancelled) setRoleLoading(false);
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const fetchAgents = async () => {
    if (!user) return;
    const res = await authFetch("/agentes", user);
    if (res.ok) setAgents(await res.json());
  };

  const fetchCatalog = async () => {
    const res = await fetch(`${API_BASE}/inmuebles`);
    if (res.ok) setCatalog(await res.json());
  };

  const fetchDashboard = async () => {
    if (!user) return;
    const res = await authFetch("/asesor/dashboard", user);
    if (res.ok) setDashboard(await res.json());
  };

  useEffect(() => {
    if (user) {
      fetchAgents().catch(console.error);
      fetchCatalog().catch(console.error);
      fetchDashboard().catch(console.error);
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await authPersistenceReady;
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      setErrorMsg(error.message || "No se pudo iniciar sesion.");
    }
  };

  const handleLogout = async () => {
    clearCachedAuthProfile(user?.email);
    await signOut(auth);
    setUser(null);
    setRole("user");
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.email) return;
    const whatsapp = normalizeBoliviaPhone(phoneLocal);
    if (whatsapp.length < 10) {
      setErrorMsg("Ingresa un numero de WhatsApp valido.");
      return;
    }

    setErrorMsg("");
    const response = await authFetch("/agentes", user, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: displayName.trim(), whatsapp, email, oficina_nombre: officeName.trim() || "REMAX Patrimonio" }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setErrorMsg(data.detail || "No se pudo activar el perfil.");
      return;
    }

    setSuccessMsg("Perfil de asesor activado.");
    await fetchAgents();
  };

  const handleKeyDownAmenity = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = amenityInput.trim().replace(/,/g, "");
      if (val && !amenities.includes(val)) setAmenities([...amenities, val]);
      setAmenityInput("");
    }
  };

  const removeAmenity = (am: string) => setAmenities(amenities.filter((a) => a !== am));

  const handleKeyDownKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = keywordInput.trim().replace(/,/g, "");
      if (val && !keywords.includes(val)) setKeywords([...keywords, val]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (kw: string) => setKeywords(keywords.filter((item) => item !== kw));

  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    setIsCloudinaryUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await authFetch("/cloudinary/upload", user, { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Cloudinary rechazo la subida.");
      const newUrls = Array.isArray(data.urls) ? data.urls.filter(Boolean) : [];
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

  const handleAddProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentAgent) return;
    const target = e.currentTarget;
    const fd = new FormData(target);
    const coordsParts = String(fd.get("coords") || "").split(",").map((s) => parseFloat(s.trim()));
    const lat = coordsParts.length === 2 && !Number.isNaN(coordsParts[0]) ? coordsParts[0] : 0;
    const lng = coordsParts.length === 2 && !Number.isNaN(coordsParts[1]) ? coordsParts[1] : 0;

    setIsUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const agentId = Number(currentAgent.id);
    const offers = buildOffersPayload(fd, formOperation, agentId, formCurrency).map((offer) => ({
      ...offer,
      colocador_id: agentId,
      incluye_expensas: formExpensas,
      monto_expensas: formExpensas ? Number(fd.get("expensasAmount")) || null : null,
      expensas_moneda: formExpensas ? String(fd.get("expensasCurrency") || (offer.operacion === "Alquiler" ? "Bs" : formCurrency)) : null,
    }));
    const primaryOffer = offers[0];
    if (offers.length === 0) {
      setErrorMsg("Agrega al menos una oferta con precio.");
      setIsUploading(false);
      return;
    }

    const isTerreno = formType === "Terreno";
    const isComercial = formType === "Comercial";
    const isPreventa = isProjectType(formType);

    const payload = {
      titulo: (fd.get("title") as string) || "Propiedad sin titulo",
      precio_usd: primaryOffer.precio,
      moneda: primaryOffer.moneda,
      habitaciones: isTerreno ? 0 : Number(fd.get("rooms")) || 0,
      banos: isTerreno ? 0 : Number(fd.get("bathrooms")) || 1,
      ciudad: (fd.get("area") as string) || formZone || "Santa Cruz",
      lat,
      lng,
      operacion: primaryOffer.operacion,
      tipo_inmueble: formType,
      estado: "Publicado",
      descripcion: (fd.get("description") as string) || "Sin descripcion.",
      agente_id: agentId,
      imagenes: imageLinks || (fd.get("imageLinks") as string),
      amenidades: amenities.join(","),
      keywords: keywords.join(","),
      ofertas: offers,
      superficie_m2: Number(fd.get("meters")) || (isPreventa && projectUnits.length > 0 ? getProjectUnitsSummary(projectUnits).minSurface || null : null),
      amoblado: isTerreno || isComercial ? false : formAmoblado,
      ocupacion: formOcupacion,
      complejo_nombre: formComplejo.trim() || null,
      piso: String(fd.get("floor") || "").trim() || null,
      colocador_id: agentId,
      fecha_entrega: isPreventa ? formFechaEntrega.trim() || null : null,
      avance_obra: isPreventa && formAvanceObra !== "" ? Number(formAvanceObra) : null,
      fase_obra: isPreventa ? formFaseObra.trim() || null : null,
      subtipo_comercial: isComercial ? formSubtipoComercial.trim() || null : null,
      dimensiones: isTerreno ? formDimensiones.trim() || null : null,
      datos_especificos_json: isPreventa
        ? serializeProjectDetailsJson({
            unidades: projectUnits,
            mensajeUrgencia: projectUrgencyMessage,
            totalUnidades: Number(projectTotalUnits) || null,
            unidadesDisponibles: Number(projectAvailableUnits) || null,
            pisos: Number(projectFloors) || null,
            reservaUsd: Number(projectReserveUsd) || null,
            precioM2Desde: Number(projectPriceM2From) || null,
            brochureUrl: projectBrochureUrl,
            planesPago: projectPaymentPlans,
          })
        : null,
    };

    try {
      const res = await authFetch("/inmuebles", user, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "El servidor rechazo los datos.");
      }
      target.reset();
      setAmenities([]);
      setImageLinks("");
      setProjectUnits([]);
      setProjectUrgencyMessage("");
      setProjectTotalUnits("");
      setProjectAvailableUnits("");
      setProjectFloors("");
      setProjectReserveUsd("");
      setProjectPriceM2From("");
      setProjectBrochureUrl("");
      setProjectPaymentPlans("");
      setFormFechaEntrega("");
      setFormAvanceObra("");
      setFormDimensiones("");
      setFormServiciosBasicos("");
      setFormComplejo("");
      setFormAmoblado(false);
      setFormExpensas(false);
      setSuccessMsg("Inmueble publicado con exito.");
      await fetchCatalog();
      await fetchDashboard();
    } catch (err: any) {
      setErrorMsg(err.message || "Hubo un error al publicar.");
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading || (roleLoading && role === "user")) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--surface-page)]"><Loader2 className="animate-spin text-[var(--accent-main)] w-8 h-8" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center font-sans p-4">
        <div className="bg-[var(--surface-panel)] p-8 rounded-xl shadow-[var(--shadow-warm)] border border-[var(--border-soft)] text-center max-w-sm w-full">
          <ShieldCheck className="w-12 h-12 text-[var(--accent-main)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--text-main)] mb-2 uppercase tracking-widest">Acceso Asesor</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">Inicia sesion con tu correo Google autorizado.</p>
          <button onClick={handleLogin} className="w-full bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-[#2F241D] hover:text-white font-bold py-3 rounded transition-colors uppercase tracking-widest text-xs shadow-md">Acceder con Google</button>
          {errorMsg && <p className="text-red-500 text-xs mt-4">{errorMsg}</p>}
        </div>
      </div>
    );
  }

  if (role !== "advisor" && role !== "admin") {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center font-sans p-4">
        <div className="bg-[var(--surface-panel)] p-8 rounded-xl shadow-[var(--shadow-warm)] border border-[var(--border-soft)] text-center max-w-md w-full">
          <ShieldCheck className="w-12 h-12 text-[var(--accent-main)] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-main)] mb-2">Acceso de asesor restringido</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">Tu correo no esta en la lista de asesores autorizados.</p>
          <div className="flex gap-2 justify-center">
            <Link to="/" className="bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-[#2F241D] hover:text-white font-bold px-4 py-3 rounded uppercase tracking-widest text-xs">Volver al mapa</Link>
            <button onClick={handleLogout} className="border border-[var(--border-soft)] text-[var(--text-muted)] font-bold px-4 py-3 rounded uppercase tracking-widest text-xs">Salir</button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentAgent) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center font-sans p-4">
        <div className="bg-[var(--surface-panel)] p-8 rounded-xl shadow-[var(--shadow-warm)] border border-[var(--accent-main)]/40 max-w-md w-full">
          <UserCircle className="w-12 h-12 text-[var(--accent-main)] mx-auto mb-4" />
          <h2 className="text-xl text-center font-bold text-[var(--text-main)] mb-2">Activa tu perfil de asesor</h2>
          <p className="text-sm text-center text-[var(--text-muted)] mb-6">Este perfil quedara ligado a {email}.</p>
          {errorMsg && <div className="bg-red-50 text-red-600 p-3 border border-red-200 rounded font-bold text-sm mb-4">{errorMsg}</div>}
          {successMsg && <div className="bg-green-50 text-green-600 p-3 border border-green-200 rounded font-bold text-sm mb-4">{successMsg}</div>}
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Nombre a mostrar</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="w-full bg-[var(--surface-control)] border border-[var(--border-soft)] rounded px-4 py-3 text-sm outline-none text-[var(--text-main)]" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Oficina</label>
              <input value={officeName} onChange={(e) => setOfficeName(e.target.value)} placeholder="REMAX Patrimonio" className="w-full bg-[var(--surface-control)] border border-[var(--border-soft)] rounded px-4 py-3 text-sm outline-none text-[var(--text-main)]" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">WhatsApp</label>
              <div className="flex rounded border border-[var(--border-soft)] bg-[var(--surface-control)] overflow-hidden">
                <span className="px-4 py-3 bg-[var(--surface-panel-muted)] text-[var(--text-muted)] text-sm font-bold">+591</span>
                <input value={phoneLocal} onChange={(e) => setPhoneLocal(e.target.value.replace(/\D/g, ""))} required placeholder="70000000" className="flex-1 bg-transparent px-4 py-3 text-sm outline-none text-[var(--text-main)]" />
              </div>
            </div>
            <button type="submit" className="w-full bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-[#2F241D] hover:text-white font-bold py-3 rounded uppercase tracking-widest text-xs shadow-md">Guardar perfil</button>
          </form>
          <button onClick={handleLogout} className="mt-6 w-full text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors uppercase font-bold tracking-wider">Cancelar y salir</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-main)] p-8 font-sans transition-colors">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 border-b border-[var(--border-soft)] pb-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-4xl text-[var(--color-chocolate)] dark:text-[var(--text-main)] font-bold tracking-tight uppercase">Panel de Asesor</h1>
              <p className="text-[var(--text-muted)] mt-2 text-sm">Sesion activa: <span className="font-bold text-[var(--accent-main)]">{currentAgent.name}</span></p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => applyTheme(!isDarkMode)} className="text-[10px] bg-[var(--color-chocolate)] dark:bg-[var(--surface-control)] hover:bg-[var(--accent-hover)] border border-[var(--accent-main)]/50 text-[var(--color-ivory)] px-3 py-2 rounded font-bold uppercase tracking-wider transition-colors flex items-center gap-1">{isDarkMode ? <Sun size={12} /> : <Moon size={12} />} {isDarkMode ? "Claro" : "Oscuro"}</button>
              {role === "admin" ? (
                <Link to="/admin" className="text-[10px] bg-[var(--color-chocolate)] dark:bg-[var(--surface-control)] hover:bg-[var(--accent-hover)] border border-[var(--accent-main)]/50 text-[var(--color-ivory)] px-3 py-2 rounded font-bold uppercase tracking-wider transition-colors flex items-center gap-1"><ShieldCheck size={12} /> Admin</Link>
              ) : null}
              <Link to="/" className="text-[10px] bg-[var(--color-chocolate)] dark:bg-[var(--surface-control)] hover:bg-[var(--accent-hover)] border border-[var(--accent-main)]/50 text-[var(--color-ivory)] px-3 py-2 rounded font-bold uppercase tracking-wider transition-colors flex items-center gap-1"><ArrowLeft size={12} /> Mapa</Link>
              <button onClick={handleLogout} className="text-[10px] bg-[var(--color-brick)] dark:bg-[var(--surface-panel)] hover:bg-[var(--accent-hover)] border border-[var(--color-brick)]/60 text-[var(--color-ivory)] dark:text-red-400 px-3 py-2 rounded font-bold uppercase tracking-wider transition-colors flex items-center gap-1"><LogOut size={12} /> Salir</button>
            </div>
          </div>
        </header>

        {dashboard && (
          <div className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">Oficina</p>
              <p className="mt-2 text-lg font-bold">{dashboard.oficina || "REMAX Patrimonio"}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">Disponibles</p>
              <p className="mt-2 text-3xl font-bold text-[var(--accent-main)]">{dashboard.inventario?.Disponible || 0}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">Leads NIA</p>
              <p className="mt-2 text-3xl font-bold">{(dashboard.leads?.contactos || 0) + (dashboard.leads?.shares || 0)}</p>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{dashboard.leads?.contactos || 0} contactos · {dashboard.leads?.shares || 0} shares</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">Ocupados / vendidos</p>
              <p className="mt-2 text-lg font-bold">{(dashboard.inventario?.Alquilado || 0) + (dashboard.inventario?.Vendido || 0)}</p>
            </div>
          </div>
        )}
        <form ref={formRef} onSubmit={handleAddProperty} className="bg-[var(--surface-panel)] border border-[var(--border-strong)]/35 shadow-[var(--shadow-warm)] rounded-2xl p-8 space-y-8">
          {errorMsg && <div className="bg-red-50 dark:bg-[rgba(157,47,37,0.16)] text-red-600 dark:text-red-400 p-4 border border-red-200 rounded font-bold">{errorMsg}</div>}
          {successMsg && <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 border border-green-200 rounded font-bold">{successMsg}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-2 block">Asesor</label>
              <div className="w-full bg-[var(--surface-panel-muted)] border border-[var(--border-soft)] rounded px-4 py-3 text-sm text-[var(--text-main)] flex justify-between items-center cursor-not-allowed">
                <span className="font-bold flex items-center gap-2"><UserCircle size={16} className="text-[var(--accent-main)]" /> {currentAgent.name}</span>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">{currentAgent.whatsapp}</span>
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-2 block">Titulo Comercial</label>
              <input name="title" required type="text" placeholder="Ej: Hermosa Casa en Urubo" className="w-full bg-[var(--surface-control)] border border-[var(--border-soft)] rounded px-4 py-3 text-sm outline-none text-[var(--text-main)]" />
            </div>
          </div>

          {/* CLASIFICACION DEL INMUEBLE */}
          <div className="bg-[var(--surface-panel-muted)] p-6 rounded-xl border border-[var(--border-soft)] grid grid-cols-1 md:grid-cols-4 gap-4">
            <h3 className="col-span-full text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-2">Clasificacion del Inmueble</h3>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Tipo de Inmueble</label>
              <CustomSelect
                value={formType}
                onChange={(val) => setFormType(val)}
                placeholder="Tipo"
                options={PROPERTY_TYPES.map((t) => ({ value: t, label: t }))}
                triggerClassName="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)] font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Operacion</label>
              <CustomSelect
                value={formOperation}
                onChange={setFormOperation}
                placeholder="Operacion"
                options={operationOptions}
                triggerClassName="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Zona</label>
              {isCustomZone ? (
                <div className="flex relative">
                  <input autoFocus name="area" value={formZone} onChange={(e) => setFormZone(e.target.value)} type="text" placeholder="Ej: Equipetrol, Urubo, Norte..." className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
                  <button type="button" onClick={() => { setIsCustomZone(false); setFormZone(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-red-500"><X size={14} /></button>
                </div>
              ) : (
                <CustomSelect name="area" value={formZone} onChange={(val) => { if (val === "___NEW___") { setIsCustomZone(true); setFormZone(""); } else { setFormZone(val); } }} placeholder="Zona" options={[...defaultZones.map((z) => ({ value: z, label: z })), { value: "___NEW___", label: "+ Nueva Zona..." }]} triggerClassName="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]" />
              )}
            </div>
          </div>

          {/* CAMPOS ESPECIFICOS SEGUN EL TIPO DE INMUEBLE */}
          {formType === "Terreno" ? (
            <div className="bg-[var(--surface-panel-muted)] p-6 rounded-xl border border-emerald-500/40 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-full flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">Caracteristicas del Terreno</h3>
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">No requiere dormitorios ni baños</span>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Superficie Total (m²)</label>
                <input name="meters" required type="number" min="0" step="0.1" placeholder="Ej: 450" className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Dimensiones (Frente x Fondo)</label>
                <input value={formDimensiones} onChange={(e) => setFormDimensiones(e.target.value)} placeholder="Ej: 15m x 30m" className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Servicios Basicos</label>
                <input value={formServiciosBasicos} onChange={(e) => setFormServiciosBasicos(e.target.value)} placeholder="Ej: Agua, Luz, Pavimento, Gas" className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
              </div>
            </div>
          ) : formType === "Comercial" ? (
            <div className="bg-[var(--surface-panel-muted)] p-6 rounded-xl border border-blue-500/40 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-full flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">Inmueble Comercial</h3>
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Oficina, local o galpon</span>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Subtipo Comercial</label>
                <CustomSelect
                  value={formSubtipoComercial}
                  onChange={setFormSubtipoComercial}
                  placeholder="Subtipo"
                  options={[
                    { value: "Oficina", label: "Oficina corporativa" },
                    { value: "Local Comercial", label: "Local / Tienda" },
                    { value: "Galpón / Depósito", label: "Galpon / Deposito" },
                    { value: "Edificio Comercial", label: "Edificio completo" },
                  ]}
                  triggerClassName="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Superficie Util (m²)</label>
                <input name="meters" required type="number" min="0" step="0.1" placeholder="Ej: 120" className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Baños (opcional)</label>
                <input name="bathrooms" type="number" min="0" defaultValue="1" placeholder="Ej: 2" className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Piso / Nro (opcional)</label>
                <input name="floor" type="text" placeholder="Ej: Piso 4, Of. 402" className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
              </div>
            </div>
          ) : isProjectType(formType) ? (
            <div className="bg-[var(--surface-panel-muted)] p-6 rounded-xl border border-[var(--border-soft)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[var(--accent-main)] font-bold">Proyecto</h3>
                  <p className="text-xs text-[var(--text-muted)]">Configura la fecha de entrega y avance de obra para la cuenta regresiva pública.</p>
                </div>
                {countdownPreview && (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-main)]/15 border border-[var(--accent-main)]/30 px-3 py-1.5 text-xs font-bold text-[var(--accent-main)]">
                    <span>⏳ {countdownPreview.label}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Fecha Estimada de Entrega</label>
                  <input
                    type="text"
                    value={formFechaEntrega}
                    onChange={(e) => setFormFechaEntrega(e.target.value)}
                    placeholder="Ej: Diciembre 2026 o 2026-12"
                    className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)] font-semibold"
                  />
                  <span className="text-[10px] text-[var(--text-muted)]">Ej: 2026-12 o "Diciembre 2026"</span>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Avance de Obra (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formAvanceObra}
                    onChange={(e) => setFormAvanceObra(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Ej: 65"
                    className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)] font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Fase de la Obra</label>
                  <CustomSelect
                    value={formFaseObra}
                    onChange={setFormFaseObra}
                    placeholder="Fase"
                    options={[
                      { value: "En planos / Pozo", label: "En planos / Pozo" },
                      { value: "Excavacion y cimientos", label: "Excavacion y cimientos" },
                      { value: "Obra gruesa", label: "Obra gruesa" },
                      { value: "Obra fina y acabados", label: "Obra fina y acabados" },
                      { value: "Entrega inmediata", label: "Entrega inmediata" },
                    ]}
                    triggerClassName="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Edificio / Nombre Proyecto</label>
                  <input
                    value={formComplejo}
                    onChange={(e) => setFormComplejo(e.target.value)}
                    placeholder="Ej: Sky Eclipse"
                    className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)] font-semibold"
                  />
                </div>
              </div>
              <ProjectUnitsEditor
                units={projectUnits}
                onChange={setProjectUnits}
                defaultCurrency={formCurrency}
                mensajeUrgencia={projectUrgencyMessage}
                onMensajeUrgenciaChange={setProjectUrgencyMessage}
                totalUnidades={projectTotalUnits}
                onTotalUnidadesChange={setProjectTotalUnits}
                unidadesDisponibles={projectAvailableUnits}
                onUnidadesDisponiblesChange={setProjectAvailableUnits}
                pisos={projectFloors}
                onPisosChange={setProjectFloors}
                reservaUsd={projectReserveUsd}
                onReservaUsdChange={setProjectReserveUsd}
                precioM2Desde={projectPriceM2From}
                onPrecioM2DesdeChange={setProjectPriceM2From}
                brochureUrl={projectBrochureUrl}
                onBrochureUrlChange={setProjectBrochureUrl}
                planesPago={projectPaymentPlans}
                onPlanesPagoChange={setProjectPaymentPlans}
                onSyncBaseValues={(minSurface, minPrice) => {
                  const metersField = formRef.current?.elements.namedItem("meters") as HTMLInputElement | null;
                  if (metersField && minSurface > 0) {
                    metersField.value = String(minSurface);
                  }
                  const priceField = formRef.current?.elements.namedItem("price") as HTMLInputElement | null;
                  if (priceField && minPrice > 0) {
                    priceField.value = String(minPrice);
                  }
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-soft)]">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">
                    Superficie base o desde (m²)
                  </label>
                  <input name="meters" type="number" min="0" step="0.1" placeholder="Ej: 32 o calculado arriba" className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
                  <span className="text-[10px] text-[var(--text-muted)]">Si agregaste opciones arriba, se autocompleta con la mínima.</span>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">
                    Dormitorios referenciales (opcional)
                  </label>
                  <input name="rooms" type="number" min="0" placeholder="Ej: 1" className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
                </div>
              </div>
            </div>
          ) : (
            /* DEPARTAMENTO o CASA */
            <div className="space-y-4">
              <div className="bg-[var(--surface-panel-muted)] p-6 rounded-xl border border-[var(--border-soft)] grid grid-cols-1 md:grid-cols-4 gap-4">
                <h3 className="col-span-full text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-2">
                  {formType === "Casa" ? "Detalles de la Casa" : "Detalles del Departamento"}
                </h3>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Habitaciones</label>
                  <input name="rooms" type="number" required defaultValue="1" min="0" placeholder="Ej: 2" className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Baños</label>
                  <input name="bathrooms" type="number" min="0" defaultValue="1" required placeholder="Ej: 1" className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Superficie (m²)</label>
                  <input name="meters" type="number" min="0" step="0.1" placeholder="Ej: 65" className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">
                    {formType === "Casa" ? "Plantas / Niveles" : "Piso / Nro de Unidad"}
                  </label>
                  <input name="floor" type="text" placeholder={formType === "Casa" ? "Ej: 2 plantas" : "Ej: Piso 6, Dpto 6B"} className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
                </div>
              </div>

              <div className="bg-[var(--surface-panel-muted)] p-6 rounded-xl border border-[var(--border-soft)] grid grid-cols-1 md:grid-cols-2 gap-4">
                <h3 className="col-span-full text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold mb-2">
                  {formType === "Casa" ? "Condominio y Ocupacion" : "Edificio y Expensas"}
                </h3>
                <input value={formComplejo} onChange={(e) => setFormComplejo(e.target.value)} placeholder={formType === "Casa" ? "Condominio / Complejo cerrado (opcional)" : "Ej: Torre Sky (un pin para varias unidades)"} className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
                <CustomSelect value={formOcupacion} onChange={setFormOcupacion} placeholder="Ocupacion" options={[{ value: "Disponible", label: "Disponible" }, { value: "Reservado", label: "Reservado" }, { value: "Alquilado", label: "Alquilado / ocupado" }, { value: "Vendido", label: "Vendido" }]} triggerClassName="bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]" />

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input type="checkbox" checked={formAmoblado} onChange={(e) => setFormAmoblado(e.target.checked)} className="rounded text-[var(--accent-main)]" />
                    Amoblado
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input type="checkbox" checked={formExpensas} onChange={(e) => setFormExpensas(e.target.checked)} className="rounded text-[var(--accent-main)]" />
                    {formType === "Casa" ? "Paga expensas de condominio" : "Precio incluye expensas"}
                  </label>
                  {formExpensas && (
                    <div className="flex gap-2">
                      <input name="expensasAmount" type="number" min="0" placeholder="Monto expensas" className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
                      <select name="expensasCurrency" defaultValue="Bs" className="bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]"><option>Bs</option><option>$ (USD)</option></select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-[var(--surface-panel-muted)] p-6 rounded-xl border border-[var(--accent-main)]/50 grid grid-cols-1 md:grid-cols-5 gap-4">
            <h3 className="col-span-full text-xs uppercase tracking-widest text-[var(--accent-main)] font-bold mb-2">Ofertas Comerciales</h3>
            {formOperation === "Alquiler y Venta" ? (
              <>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Moneda Alquiler</label>
                  <select name="rentCurrency" defaultValue="Bs" className="h-10 w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]"><option>Bs</option><option>$ (USD)</option></select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Precio Alquiler</label>
                  <input name="rentPrice" type="number" required placeholder="Precio alquiler" className="h-10 w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Moneda Venta</label>
                  <select name="saleCurrency" defaultValue="$ (USD)" className="h-10 w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]"><option>$ (USD)</option><option>Bs</option></select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">Precio Venta</label>
                  <input name="salePrice" type="number" required placeholder="Precio venta" className="h-10 w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1">T/C (Cambio)</label>
                  <CustomSelect value={formExchangeRate} onChange={setFormExchangeRate} placeholder="T/C" options={[{ value: "Oficial", label: "Oficial" }, { value: "Mercado Paralelo", label: "Mercado Paralelo" }]} triggerClassName="h-10 bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]" />
                </div>
              </>
            ) : (
              <>
                <CustomSelect value={formCurrency} onChange={setFormCurrency} placeholder="Moneda" options={[{ value: "$ (USD)", label: "$ (USD)" }, { value: "Bs", label: "Bs" }]} triggerClassName="bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]" />
                <input name="price" type="number" required placeholder="Precio" className="w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)]" />
                <CustomSelect value={formExchangeRate} onChange={setFormExchangeRate} placeholder="T/C" options={[{ value: "Oficial", label: "Oficial" }, { value: "Mercado Paralelo", label: "Mercado Paralelo" }]} triggerClassName="bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]" />
              </>
            )}
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-[var(--accent-main)] font-bold mb-2 block">Coordenadas Exactas</label>
            <input name="coords" required type="text" placeholder="Ej: -17.771632, -63.194511" className="w-full bg-[var(--surface-control)] border border-[var(--border-soft)] rounded px-4 py-3 text-sm outline-none text-[var(--text-main)]" />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-[var(--text-main)] font-bold mb-2 block">Descripcion y Amenidades</label>
            <textarea name="description" rows={5} className="w-full bg-[var(--surface-control)] border border-[var(--border-soft)] rounded px-4 py-3 text-sm outline-none text-[var(--text-main)] mb-4" placeholder="Ej: Hermoso departamento de 1 dormitorio amoblado..." />
            <div className="w-full bg-[var(--surface-control)] border border-[var(--border-soft)] rounded px-4 py-2 flex flex-wrap gap-2 items-center mb-4 min-h-[46px]">
              {amenities.map((am) => <span key={am} className="bg-[var(--accent-main)]/15 text-[var(--accent-main)] text-xs font-bold px-2 py-1 rounded flex items-center gap-1">{am} <button type="button" onClick={() => removeAmenity(am)} className="hover:text-red-500"><X size={12} /></button></span>)}
              <input value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)} onKeyDown={handleKeyDownAmenity} className="bg-transparent outline-none text-[var(--text-main)] text-sm flex-1 min-w-[150px]" placeholder={amenities.length === 0 ? "Anadir amenidades (presiona Enter)" : "Anadir mas..."} />
            </div>
            <label className="text-xs uppercase tracking-widest text-[var(--text-main)] font-bold mb-2 block">Keywords</label>
            <div className="w-full bg-[var(--surface-control)] border border-[var(--border-soft)] rounded px-4 py-2 flex flex-wrap gap-2 items-center mb-4 min-h-[46px]">
              {keywords.map((kw) => <span key={kw} className="bg-[var(--color-chocolate)]/10 text-[var(--text-main)] text-xs font-bold px-2 py-1 rounded flex items-center gap-1">{kw} <button type="button" onClick={() => removeKeyword(kw)} className="hover:text-red-500"><X size={12} /></button></span>)}
              <input value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={handleKeyDownKeyword} className="bg-transparent outline-none text-[var(--text-main)] text-sm flex-1 min-w-[150px]" placeholder={keywords.length === 0 ? "Ej: ideal pareja, inversion, zona premium" : "Anadir keyword..."} />
            </div>
            <label className="text-xs uppercase tracking-widest text-[var(--text-main)] font-bold mb-2 block">Multimedia de la Propiedad</label>
            <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3 rounded border border-dashed border-[var(--accent-main)]/50 bg-[var(--accent-main)]/10 p-4">
              <label className={`inline-flex items-center justify-center gap-2 rounded bg-[var(--accent-main)] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#2F241D] shadow-md transition-colors ${isCloudinaryUploading ? "opacity-60 cursor-wait" : "hover:bg-[var(--accent-hover)] hover:text-white cursor-pointer"}`}>
                {isCloudinaryUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                {isCloudinaryUploading ? "Subiendo..." : "Seleccionar archivos"}
                <input type="file" multiple accept="image/*,video/*" className="hidden" disabled={isCloudinaryUploading} onChange={handleCloudinaryUpload} />
              </label>
              <DriveMediaPicker
                user={user}
                disabled={isCloudinaryUploading}
                onUploaded={(urls) => {
                  setImageLinks((current) => {
                    const existing = current.split(",").map((url) => url.trim()).filter(Boolean);
                    return [...existing, ...urls].join(", ");
                  });
                }}
                onError={setErrorMsg}
                onStatus={setSuccessMsg}
              />
              <span className="text-[11px] text-[var(--text-muted)]">Computadora o Google Drive. Las URLs aparecen abajo.</span>
            </div>
            <textarea name="imageLinks" required rows={4} value={imageLinks} onChange={(e) => setImageLinks(e.target.value)} className="w-full bg-[var(--surface-control)] border border-[var(--border-soft)] rounded px-4 py-3 text-sm outline-none text-[var(--text-main)] mb-4" placeholder="Ej: https://res.cloudinary.com/.../foto1.jpg" />
          </div>

          <button disabled={isUploading} type="submit" className="w-full bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-[#2F241D] hover:text-white font-bold py-4 rounded shadow-md transition-colors uppercase tracking-widest text-sm flex justify-center items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isUploading ? <><Loader2 size={18} className="animate-spin" /> Publicando...</> : <><Save size={18} /> Publicar Inmueble</>}
          </button>
        </form>

        <div className="mt-12 bg-[var(--surface-panel)] rounded-xl shadow-[var(--shadow-warm)] border border-[var(--border-strong)]/35 p-8">
          <h3 className="text-lg font-bold text-[var(--text-main)] mb-6 border-b border-[var(--border-soft)] pb-4">Mis Inmuebles Publicados</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-muted)]">
              <thead className="bg-[var(--surface-control)] text-xs uppercase font-bold text-[var(--text-muted)]">
                <tr><th className="px-4 py-3 rounded-l-lg">ID</th><th className="px-4 py-3">Titulo</th><th className="px-4 py-3">Operacion</th><th className="px-4 py-3 rounded-r-lg">Precio</th></tr>
              </thead>
              <tbody>
                {advisorCatalog.map((inm) => (
                  <tr key={inm.id} className="border-b border-[var(--border-soft)] last:border-0">
                    <td className="px-4 py-3 font-mono font-bold text-[var(--color-chocolate)] dark:text-[var(--accent-main)]">#{inm.id}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text-main)]">{inm.titulo}</td>
                    <td className="px-4 py-3">{inm.ofertas?.length > 1 ? "Alquiler y Venta" : inm.operacion}</td>
                    <td className="px-4 py-3">{formatOffersSummary(inm)}</td>
                  </tr>
                ))}
                {advisorCatalog.length === 0 && <tr><td colSpan={4} className="text-center py-6 italic text-stone-400">Todavia no publicaste inmuebles.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


