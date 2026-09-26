import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Save, X, UploadCloud, Loader2, LogOut, ArrowLeft, Sun, Moon, Trash2, ShieldCheck, UserCircle, Pencil, BarChart3, Building2 } from "lucide-react";
import { CustomSelect } from "../components/CustomSelect";
import DriveMediaPicker from "../components/DriveMediaPicker";
import { API_BASE, AppRole, authFetch, cacheAuthProfile, clearCachedAuthProfile, fetchAuthProfile, getCachedAuthProfile } from "../roleAccess";
import { calculateDeliveryCountdown } from "../projectCountdown";
import ProjectUnitsEditor from "../components/ProjectUnitsEditor";
import { ProjectUnitOption, serializeProjectUnitsJson, serializeProjectDetailsJson, getProjectUnitsSummary } from "../projectUnits";
import { PROPERTY_TYPES, isProjectType, formatPropertyTypeLabel } from "../types";

// Seguridad Firebase
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { auth, authPersistenceReady } from "../firebase";

interface LocalAgent {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  oficina?: string;
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
      if (!user || !isAdmin) return;
      const res = await authFetch("/inmuebles/admin", user);
      const data = await res.json();
      setCatalog(data);
    } catch (err) {
      console.error(err);
    }
  }, [user, isAdmin]);


  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);
  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm("Seguro que deseas eliminar permanentemente este inmueble?")) return;
    try {
      const res = await authFetch(`/inmuebles/${id}`, user, { method: "DELETE" });
      if (res.ok) {
        setCatalog(catalog.filter(p => p.id !== id));
        alert("Inmueble eliminado con Ã©xito.");
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
  const [editOperation, setEditOperation] = useState<string>("Venta");
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
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState<string>("");
  const [formStatus, setFormStatus] = useState<string>("Borrador");
  const [formFechaEntrega, setFormFechaEntrega] = useState<string>("");
  const [formAvanceObra, setFormAvanceObra] = useState<number | "">("");
  const [formFaseObra, setFormFaseObra] = useState<string>("Obra gruesa");
  const [formSubtipoComercial, setFormSubtipoComercial] = useState<string>("Oficina");
  const [formDimensiones, setFormDimensiones] = useState<string>("");
  const [formServiciosBasicos, setFormServiciosBasicos] = useState<string>("");
  const [formAmoblado, setFormAmoblado] = useState<boolean>(false);
  const [projectUnits, setProjectUnits] = useState<ProjectUnitOption[]>([]);
  const [projectUrgencyMessage, setProjectUrgencyMessage] = useState("");
  const [projectTotalUnits, setProjectTotalUnits] = useState<number | "">("");
  const [projectAvailableUnits, setProjectAvailableUnits] = useState<number | "">("");
  const [projectFloors, setProjectFloors] = useState<number | "">("");
  const [projectReserveUsd, setProjectReserveUsd] = useState<number | "">("");
  const [projectPriceM2From, setProjectPriceM2From] = useState<number | "">("");
  const [projectBrochureUrl, setProjectBrochureUrl] = useState("");
  const [projectPaymentPlans, setProjectPaymentPlans] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  const defaultZones = ["Norte", "Sur", "Este", "Oeste", "Equipetrol", "Urubo", "Centro"];
  const allZones = Array.from(new Set<string>([...defaultZones]));
  const operationOptions = [
    { value: "Venta", label: "Venta" },
    { value: "Alquiler", label: "Alquiler" },
    { value: "Alquiler y Venta", label: "Alquiler y Venta" },
    { value: "Inversion", label: "Inversion" },
  ];
  const propertyStatusOptions = [
    { value: "Borrador", label: "Borrador" },
    { value: "Publicado", label: "Publicado" },
    { value: "Pausado", label: "Pausado" },
  ];

  const countdownPreview = React.useMemo(() => {
    if (!isProjectType(formType) || !formFechaEntrega) return null;
    return calculateDeliveryCountdown(formFechaEntrega);
  }, [formType, formFechaEntrega]);

  const getOfferMode = (property: any) => {
    const offers = Array.isArray(property?.ofertas) ? property.ofertas : [];
    const hasRent = offers.some((offer: any) => String(offer.operacion).toLowerCase().includes("alquiler"));
    const hasSale = offers.some((offer: any) => String(offer.operacion).toLowerCase().includes("venta"));
    if (hasRent && hasSale) return "Alquiler y Venta";
    return property?.operacion || "Venta";
  };

  const findOffer = (property: any, operation: "Alquiler" | "Venta") => {
    const offers = Array.isArray(property?.ofertas) ? property.ofertas : [];
    return offers.find((offer: any) => String(offer.operacion).toLowerCase().includes(operation.toLowerCase()));
  };

  const buildOffersPayload = (fd: FormData, operation: string, agentId: number | null, fallbackCurrency: string, offerStatus = formStatus, captadorId?: number | null) => {
    if (operation === "Alquiler y Venta") {
      return [
        {
          operacion: "Alquiler",
          precio: Number(fd.get("rentPrice")) || 0,
          moneda: String(fd.get("rentCurrency") || "Bs"),
          agente_id: agentId,
          captador_id: captadorId || null,
          estado: offerStatus,
        },
        {
          operacion: "Venta",
          precio: Number(fd.get("salePrice")) || 0,
          moneda: String(fd.get("saleCurrency") || "$ (USD)"),
          agente_id: agentId,
          captador_id: captadorId || null,
          estado: offerStatus,
        },
      ].filter((offer) => offer.precio > 0);
    }

    return [{
      operacion: operation,
      precio: Number(fd.get("price")) || 0,
      moneda: fallbackCurrency,
      agente_id: agentId,
      captador_id: captadorId || null,
      estado: offerStatus,
    }];
  };

  const formatOfferPrice = (offer: any) => `${offer.moneda || "$ (USD)"} ${Number(offer.precio || 0).toLocaleString("es-BO")}`;
  const formatOffersSummary = (property: any) => {
    const offers = Array.isArray(property?.ofertas) && property.ofertas.length > 0
      ? property.ofertas
      : [{ operacion: property.operacion, precio: property.precio_usd, moneda: property.moneda }];
    return offers.map((offer: any) => `${offer.operacion}: ${formatOfferPrice(offer)}`).join(" Â· ");
  };
  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (cancelled) return;

      setUser(currentUser);
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
        console.error("Error validando rol admin:", error);
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

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await authPersistenceReady;
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      alert("Error en protocolos de seguridad: " + error.message);
    }
  };

  const handleLogout = async () => {
    clearCachedAuthProfile(user?.email);
    await signOut(auth);
    setUser(null);
    setRole("user");
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

      setSuccessMsg("Asesor guardado con Ã©xito.");
      (e.target as HTMLFormElement).reset();
      await fetchAgentes();
    } catch (err: any) {
      setErrorMsg("Error: " + err.message);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!window.confirm("Â¿Confirmas la eliminaciÃ³n de este asesor y todos sus inmuebles vinculados?")) return;
    try {
      const response = await authFetch(`/agentes/${id}`, user, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar el asesor");
      setSuccessMsg("Registro eliminado con Ã©xito.");
      await fetchAgentes();
    } catch (err: any) {
      setErrorMsg("Error al purgar: " + err.message);
    }
  };
  const getPropertyImageLinks = (inm: any) => Array.isArray(inm.images) ? inm.images.join(", ") : (inm.imagenes || "");
  const getPropertyAmenitiesText = (inm: any) => Array.isArray(inm.amenidades) ? inm.amenidades.join(", ") : (inm.amenidades || "");
  const getPropertyKeywordsText = (inm: any) => Array.isArray(inm.keywords) ? inm.keywords.join(", ") : (inm.keywords || "");

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
      setSuccessMsg("Asesor actualizado con Ã©xito.");
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
    const agentId = Number(fd.get("agentId")) || 0;
    const captadorIdRaw = fd.get("captadorId");
    const captadorId = captadorIdRaw && String(captadorIdRaw).trim() !== "" ? Number(captadorIdRaw) : null;
    const operation = String(fd.get("operation") || editOperation || "Venta");
    const propertyType = String(fd.get("type") || editingProperty.tipo_inmueble || "Departamento");
    const propertyStatus = String(editingProperty.estado || fd.get("status") || "Borrador").trim() || "Borrador";
    const offers = buildOffersPayload(fd, operation, agentId, String(fd.get("currency") || "$ (USD)"), propertyStatus, captadorId);
    const primaryOffer = offers[0];
    const isTerreno = propertyType === "Terreno";
    const isComercial = propertyType === "Comercial";
    const isPreventa = isProjectType(propertyType);

    const payload = {
      titulo: String(fd.get("title") || "").trim() || "Propiedad sin titulo",
      precio_usd: primaryOffer?.precio || 0,
      moneda: primaryOffer?.moneda || "$ (USD)",
      habitaciones: isTerreno ? 0 : Number(fd.get("rooms")) || 0,
      banos: isTerreno ? 0 : Number(fd.get("bathrooms")) || 1,
      ciudad: String(fd.get("area") || "").trim() || "Santa Cruz",
      lat,
      lng,
      operacion: primaryOffer?.operacion || operation,
      tipo_inmueble: propertyType,
      estado: propertyStatus,
      descripcion: String(fd.get("description") || "").trim() || "Sin descripcion.",
      agente_id: agentId || null,
      captador_id: captadorId,
      imagenes: fd.get("imageLinks") !== null ? String(fd.get("imageLinks")).trim() : (editingProperty.imagenes || ""),
      amenidades: fd.get("amenities") !== null ? String(fd.get("amenities")).trim() : (editingProperty.amenidades || ""),
      keywords: fd.get("keywords") !== null ? String(fd.get("keywords")).trim() : (editingProperty.keywords || ""),
      ofertas: offers,
      superficie_m2: fd.get("meters") ? Number(fd.get("meters")) : editingProperty.superficie_m2 ?? null,
      amoblado: isTerreno || isComercial ? false : (fd.get("amoblado") ? Boolean(fd.get("amoblado") === "on" || fd.get("amoblado") === "true") : Boolean(editingProperty.amoblado)),
      fecha_entrega: isPreventa ? (fd.get("fechaEntrega") ? String(fd.get("fechaEntrega")).trim() : editingProperty.fecha_entrega || null) : null,
      avance_obra: isPreventa ? (fd.get("avanceObra") ? Number(fd.get("avanceObra")) : editingProperty.avance_obra ?? null) : null,
      fase_obra: isPreventa ? (fd.get("faseObra") ? String(fd.get("faseObra")).trim() : editingProperty.fase_obra || null) : null,
      subtipo_comercial: isComercial ? (fd.get("subtipoComercial") ? String(fd.get("subtipoComercial")).trim() : editingProperty.subtipo_comercial || null) : null,
      dimensiones: isTerreno ? (fd.get("dimensiones") ? String(fd.get("dimensiones")).trim() : editingProperty.dimensiones || null) : null,
      servicios_basicos: isTerreno ? (fd.get("serviciosBasicos") ? String(fd.get("serviciosBasicos")).trim() : editingProperty.servicios_basicos || null) : null,
    };

    if (offers.length === 0) {
      setErrorMsg("Agrega al menos una oferta con precio.");
      return;
    }
    if (propertyStatus !== "Borrador" && !payload.agente_id) {
      setErrorMsg("Selecciona un asesor antes de publicar o pausar el inmueble.");
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
      setSuccessMsg("Inmueble actualizado con exito.");
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
      const finalAgentId = Number.isFinite(parsedAgentId) && parsedAgentId > 0 ? parsedAgentId : null;
      if (formStatus !== "Borrador" && !finalAgentId) {
        setErrorMsg("Selecciona un asesor antes de publicar o pausar el inmueble.");
        setIsUploading(false);
        return;
      }
      const offers = buildOffersPayload(fd, formOperation, finalAgentId, formCurrency || "$ (USD)");
      const primaryOffer = offers[0];
      if (offers.length === 0) {
        setErrorMsg("Agrega al menos una oferta con precio.");
        setIsUploading(false);
        return;
      }
      const isTerreno = formType === "Terreno";
      const isComercial = formType === "Comercial";
      const isPreventa = isProjectType(formType);

      const payloadJSON = {
        titulo: fd.get("title") as string || "Propiedad sin titulo",
        precio_usd: primaryOffer.precio,
        moneda: primaryOffer.moneda,
        habitaciones: isTerreno ? 0 : Number(fd.get("rooms")) || 0,
        banos: isTerreno ? 0 : Number(fd.get("bathrooms")) || 1,
        ciudad: (fd.get("area") as string) || formZone || "Santa Cruz",
        lat: lat,
        lng: lng,
        operacion: primaryOffer.operacion,
        tipo_inmueble: formType,
        estado: formStatus,
        descripcion: (fd.get("description") as string) || "Sin descripcion.",
        agente_id: finalAgentId,
        imagenes: imageLinks || (fd.get("imageLinks") as string),
        amenidades: amenities.join(","),
        keywords: keywords.join(","),
        ofertas: offers,
        superficie_m2: Number(fd.get("meters")) || (isPreventa && projectUnits.length > 0 ? getProjectUnitsSummary(projectUnits).minSurface || null : null),
        amoblado: isTerreno || isComercial ? false : formAmoblado,
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

      const res = await authFetch("/inmuebles", user, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadJSON),
      });

      if (res.ok) {
        alert("Inmueble publicado con éxito!");
        target.reset();
        setAmenities([]);
        setKeywords([]);
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
        setFormFaseObra("Obra gruesa");
        setFormSubtipoComercial("Oficina");
        setFormDimensiones("");
        setFormServiciosBasicos("");
        setFormAmoblado(false);

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

  const handleKeyDownKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = keywordInput.trim().replace(/,/g, '');
      if (val && !keywords.includes(val)) setKeywords([...keywords, val]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (kw: string) => setKeywords(keywords.filter(k => k !== kw));

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
  if (authLoading || (roleLoading && role === "user")) {
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
          {user?.email && <p className="text-xs text-[var(--accent-main)] mb-6">SesiÃ³n actual: {user.email}</p>}
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
              <Link to="/admin/nia-metrics" className="text-[10px] bg-[var(--color-chocolate)] dark:bg-[var(--surface-control)] hover:bg-[var(--accent-hover)] dark:hover:bg-[var(--accent-hover)] border border-[var(--accent-main)]/50 dark:border-[var(--border-soft)] text-[var(--color-ivory)] dark:text-[var(--text-muted)] px-3 py-2 rounded font-bold uppercase tracking-wider transition-colors flex items-center gap-1">
                <BarChart3 size={12} /> Metricas NIA
              </Link>
              <Link to="/admin/catalogo" className="text-[10px] bg-[var(--color-chocolate)] dark:bg-[var(--surface-control)] hover:bg-[var(--accent-hover)] dark:hover:bg-[var(--accent-hover)] border border-[var(--accent-main)]/50 dark:border-[var(--border-soft)] text-[var(--color-ivory)] dark:text-[var(--text-muted)] px-3 py-2 rounded font-bold uppercase tracking-wider transition-colors flex items-center gap-1">
                <Building2 size={12} /> Catalogo
              </Link>
              <Link to="/asesor" className="text-[10px] bg-[var(--color-chocolate)] dark:bg-[var(--surface-control)] hover:bg-[var(--accent-hover)] dark:hover:bg-[var(--accent-hover)] border border-[var(--accent-main)]/50 dark:border-[var(--border-soft)] text-[var(--color-ivory)] dark:text-[var(--text-muted)] px-3 py-2 rounded font-bold uppercase tracking-wider transition-colors flex items-center gap-1">
                <UserCircle size={12} /> Panel asesor
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

        <form ref={formRef} onSubmit={handleAddProperty} className="bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-strong)]/35 dark:border-[var(--border-soft)] shadow-[var(--shadow-warm)] rounded-2xl p-8 space-y-8">
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
              <label className="text-xs uppercase tracking-widest text-[var(--text-muted)] dark:text-[var(--text-muted)] font-bold mb-2 block">TÃ­tulo Comercial</label>
              <input name="title" required type="text" placeholder="Ej: Hermosa Casa en Urubo" className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-4 py-3 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
            </div>
          </div>

          <div className="bg-[#F0E6D4] dark:bg-[rgba(38,28,23,0.68)] p-6 rounded-xl border border-[var(--border-soft)] dark:border-[var(--border-soft)] grid grid-cols-1 md:grid-cols-3 gap-4">
            <h3 className="col-span-full text-xs uppercase tracking-widest text-[var(--text-muted)] dark:text-[var(--text-muted)] font-bold mb-2">Publicacion</h3>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Estado inicial</label>
              <CustomSelect name="status" value={formStatus} onChange={setFormStatus} placeholder="Estado" options={propertyStatusOptions} wrapperClassName="relative w-full" triggerClassName="bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus-within:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
            </div>
          </div>
          <div className="bg-[#F0E6D4] dark:bg-[rgba(38,28,23,0.68)] p-6 rounded-xl border border-[var(--border-soft)] dark:border-[var(--border-soft)] grid grid-cols-1 md:grid-cols-3 gap-4">
            <h3 className="col-span-full text-xs uppercase tracking-widest text-[var(--text-muted)] dark:text-[var(--text-muted)] font-bold mb-2">Clasificacion Principal</h3>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Tipo de Inmueble</label>
              <CustomSelect
                name="type"
                value={formType}
                onChange={setFormType}
                placeholder="Tipo"
                options={PROPERTY_TYPES.map((t) => ({ value: t, label: t }))}
                wrapperClassName="relative w-full"
                triggerClassName="bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus-within:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Operacion</label>
              <CustomSelect
                name="operation"
                value={formOperation}
                onChange={setFormOperation}
                placeholder="Operacion"
                options={operationOptions}
                wrapperClassName="relative w-full"
                triggerClassName="bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus-within:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Zona</label>
              {isCustomZone ? (
                <div className="flex relative">
                   <input autoFocus name="area" value={formZone} onChange={(e) => setFormZone(e.target.value)} type="text" placeholder="Ej: Norte, Equipetrol, Urubo..." className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
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

          {/* CAMPOS ESPECIFICOS SEGUN EL TIPO DE INMUEBLE */}
          {formType === "Terreno" ? (
            <div className="bg-[#F0E6D4] dark:bg-[rgba(38,28,23,0.68)] p-6 rounded-xl border border-emerald-500/40 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-full flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">Caracteristicas del Terreno</h3>
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">No requiere dormitorios ni banos</span>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Superficie Total (m²)</label>
                <input name="meters" required type="number" min="0" step="0.1" placeholder="Ej: 450" className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Dimensiones (Frente x Fondo)</label>
                <input value={formDimensiones} onChange={(e) => setFormDimensiones(e.target.value)} placeholder="Ej: 15m x 30m" className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Servicios Basicos</label>
                <input value={formServiciosBasicos} onChange={(e) => setFormServiciosBasicos(e.target.value)} placeholder="Ej: Agua, Luz, Pavimento, Gas" className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
              </div>
            </div>
          ) : formType === "Comercial" ? (
            <div className="bg-[#F0E6D4] dark:bg-[rgba(38,28,23,0.68)] p-6 rounded-xl border border-blue-500/40 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-full flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">Inmueble Comercial</h3>
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Oficina, local o galpon</span>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Subtipo Comercial</label>
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
                  triggerClassName="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)] dark:text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Superficie Util (m²)</label>
                <input name="meters" required type="number" min="0" step="0.1" placeholder="Ej: 120" className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Banos (opcional)</label>
                <input name="bathrooms" type="number" min="0" defaultValue="1" placeholder="Ej: 2" className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Piso / Nro (opcional)</label>
                <input name="floor" type="text" placeholder="Ej: Piso 4, Of. 402" className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
              </div>
            </div>
          ) : isProjectType(formType) ? (
            <div className="bg-[#F0E6D4] dark:bg-[rgba(38,28,23,0.68)] p-6 rounded-xl border border-[var(--border-soft)] space-y-4">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Fecha Estimada de Entrega</label>
                  <input
                    type="text"
                    value={formFechaEntrega}
                    onChange={(e) => setFormFechaEntrega(e.target.value)}
                    placeholder="Ej: Diciembre 2026 o 2026-12"
                    className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)] dark:text-[var(--text-main)] font-semibold"
                  />
                  <span className="text-[10px] text-[var(--text-muted)]">Ej: 2026-12 o &quot;Diciembre 2026&quot;</span>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Avance de Obra (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formAvanceObra}
                    onChange={(e) => setFormAvanceObra(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Ej: 65"
                    className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)] dark:text-[var(--text-main)] font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Fase de la Obra</label>
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
                    triggerClassName="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)] dark:text-[var(--text-main)]"
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
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">
                    Superficie base o desde (m²)
                  </label>
                  <input name="meters" type="number" min="0" step="0.1" placeholder="Ej: 32 o calculado arriba" className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
                  <span className="text-[10px] text-[var(--text-muted)]">Si agregaste opciones arriba, se autocompleta con la mínima.</span>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">
                    Dormitorios referenciales (opcional)
                  </label>
                  <input name="rooms" type="number" min="0" placeholder="Ej: 1" className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
                </div>
              </div>
            </div>
          ) : (
            /* DEPARTAMENTO o CASA */
            <div className="bg-[#F0E6D4] dark:bg-[rgba(38,28,23,0.68)] p-6 rounded-xl border border-[var(--border-soft)] dark:border-[var(--border-soft)] grid grid-cols-1 md:grid-cols-5 gap-4">
              <h3 className="col-span-full text-xs uppercase tracking-widest text-[var(--text-muted)] dark:text-[var(--text-muted)] font-bold mb-2">
                {formType === "Casa" ? "Detalles de la Casa" : "Detalles del Departamento"}
              </h3>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Habitaciones</label>
                <input name="rooms" type="number" required defaultValue="1" min="0" placeholder="Ej: 2" className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Banos</label>
                <input name="bathrooms" type="number" min="0" defaultValue="1" required placeholder="Ej: 1" className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Superficie (m²)</label>
                <input name="meters" type="number" min="0" step="0.1" placeholder="Ej: 65" className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">
                  {formType === "Casa" ? "Plantas / Niveles" : "Piso / Unidad"}
                </label>
                <input name="floor" type="text" placeholder={formType === "Casa" ? "Ej: 2 plantas" : "Ej: Piso 6, Dpto 6B"} className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer text-[var(--text-main)] dark:text-[var(--text-main)]">
                  <input type="checkbox" checked={formAmoblado} onChange={(e) => setFormAmoblado(e.target.checked)} className="rounded text-[var(--accent-main)]" />
                  Amoblado
                </label>
              </div>
            </div>
          )}

          <div className="bg-[#F0E6D4] dark:bg-[rgba(38,28,23,0.68)] p-6 rounded-xl border border-[var(--accent-main)]/50 grid grid-cols-1 md:grid-cols-5 gap-4">
            <h3 className="col-span-full text-xs uppercase tracking-widest text-[var(--accent-main)] font-bold mb-2">Ofertas Comerciales</h3>
            {formOperation === "Alquiler y Venta" ? (
              <>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Moneda Alquiler</label>
                  <select name="rentCurrency" defaultValue="Bs" className="h-10 w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]"><option>Bs</option><option>$ (USD)</option></select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Precio Alquiler</label>
                  <input name="rentPrice" type="number" min="0" required className="h-10 w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Moneda Venta</label>
                  <select name="saleCurrency" defaultValue="$ (USD)" className="h-10 w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]"><option>$ (USD)</option><option>Bs</option></select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Precio Venta</label>
                  <input name="salePrice" type="number" min="0" required className="h-10 w-full bg-[var(--surface-panel)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">T/C (Cambio)</label>
                  <CustomSelect name="exchangeRate" value={formExchangeRate} onChange={setFormExchangeRate} placeholder="T/C" options={[{ value: "Oficial", label: "Oficial" }, { value: "Mercado Paralelo", label: "Mercado Paralelo" }]} wrapperClassName="relative w-full" triggerClassName="h-10 bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus-within:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Moneda</label>
                  <CustomSelect name="currency" value={formCurrency} onChange={setFormCurrency} placeholder="Moneda" options={[{ value: "$ (USD)", label: "$ (USD)" }, { value: "Bs", label: "Bs" }]} wrapperClassName="relative w-full" triggerClassName="bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus-within:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Precio</label>
                  <input name="price" type="number" required className="w-full bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
                </div>
                <div className={`transition-all duration-300 ${formCurrency === 'Bs' ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">T/C (Cambio) {formCurrency === 'Bs' && <span className="text-red-500 lowercase ml-1">(no aplica)</span>}</label>
                  <CustomSelect name="exchangeRate" value={formExchangeRate} onChange={setFormExchangeRate} placeholder="T/C" options={[{ value: "Oficial", label: "Oficial" }, { value: "Mercado Paralelo", label: "Mercado Paralelo" }]} wrapperClassName="relative w-full" triggerClassName="bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus-within:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-[var(--accent-main)] dark:text-[var(--text-muted)] flex items-center gap-1 font-bold mb-2">Coordenadas Exactas</label>
            <input name="coords" required type="text" placeholder="Ej: -17.771632, -63.194511" className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-4 py-3 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
            <p className="text-[10px] text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-2 italic">Haz click derecho sobre el pin rojo en Google Maps, copia los numeros y pegalos aqui.</p>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-[var(--text-main)] dark:text-[var(--text-main)] font-bold mb-2 block">DescripciÃ³n y Amenidades</label>
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
                placeholder={amenities.length === 0 ? "AÃ±adir amenidades (presiona Enter)" : "AÃ±adir mÃ¡s..."}
              />
            </div>

            <label className="text-xs uppercase tracking-widest text-[var(--text-main)] dark:text-[var(--text-main)] font-bold mb-2 block">Keywords de busqueda</label>
            <div className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-4 py-2 focus-within:border-gold flex flex-wrap gap-2 items-center mb-4 min-h-[46px]">
              {keywords.map(kw => (
                <span key={kw} className="bg-[var(--text-main)]/10 text-[var(--text-main)] text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  {kw} <button type="button" onClick={() => removeKeyword(kw)} className="hover:text-red-500"><X size={12}/></button>
                </span>
              ))}
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeyDownKeyword}
                className="bg-transparent outline-none text-[var(--text-main)] dark:text-[var(--text-main)] text-sm flex-1 min-w-[190px] placeholder:text-stone-400 dark:placeholder:text-stone-500"
                placeholder={keywords.length === 0 ? "Ej: ideal pareja, inversion, zona premium" : "Anadir keyword..."}
              />
            </div>

            <label className="text-xs uppercase tracking-widest text-[var(--text-main)] dark:text-[var(--text-main)] font-bold mb-2 block">
              Multimedia de la Propiedad
            </label>
            <p className="text-[10px] text-stone-500 mb-3 italic">
              Sube imÃ¡genes o videos desde tu ordenador, o pega URLs directas de Cloudinary separadas por coma.
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
              <span className="text-[11px] text-[var(--text-muted)] dark:text-[var(--text-muted)]">
                Computadora o Google Drive. Las URLs aparecen abajo.
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
            {isUploading ? <><Loader2 size={18} className="animate-spin" /> Procesando...</> : <><Save size={18} /> {formStatus === "Publicado" ? "Publicar Inmueble" : "Guardar Borrador"}</>}
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
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">TÃ­tulo Comercial</label>
                  <input name="title" required defaultValue={editingProperty.titulo || ""} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Asesor (Contacto público)</label>
                  <select name="agentId" defaultValue={String(editingProperty.agente_id || editingProperty.agentId || "")} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500">
                    <option value="">Selecciona un asesor...</option>
                    {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent-main)] dark:text-[var(--accent-main)] block mb-1">Asesor Captador (Confidencial)</label>
                  <select name="captadorId" defaultValue={String(editingProperty.captador_id || editingProperty.captador?.id || editingProperty.ofertas?.[0]?.captador_id || editingProperty.ofertas?.[0]?.captador?.id || "")} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500">
                    <option value="">Sin captador / Directo...</option>
                    {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name} {agent.oficina ? `(${agent.oficina})` : ""}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">OperaciÃ³n</label>
                  <select name="operation" value={editOperation} onChange={(e) => setEditOperation(e.target.value)} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500">
                    <option>Venta</option>
                    <option>Alquiler</option>
                    <option>Alquiler y Venta</option>
                    <option>Inversion</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Tipo</label>
                  <select name="type" defaultValue={editingProperty.tipo_inmueble || "Departamento"} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500">
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Estado del inmueble</label>
                  <select name="status" value={editingProperty.estado || "Borrador"} onChange={(e) => setEditingProperty({ ...editingProperty, estado: e.target.value })} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500">
                    <option>Borrador</option>
                    <option>Publicado</option>
                    <option>Pausado</option>
                  </select>
                </div>
                {editOperation === "Alquiler y Venta" ? (
                  <>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Moneda Alquiler</label>
                      <select name="rentCurrency" defaultValue={findOffer(editingProperty, "Alquiler")?.moneda || "Bs"} className="h-10 w-full bg-[var(--surface-control)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]"><option>Bs</option><option>$ (USD)</option></select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Precio Alquiler</label>
                      <input name="rentPrice" type="number" min="0" defaultValue={findOffer(editingProperty, "Alquiler")?.precio || 0} className="h-10 w-full bg-[var(--surface-control)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Moneda Venta</label>
                      <select name="saleCurrency" defaultValue={findOffer(editingProperty, "Venta")?.moneda || "$ (USD)"} className="h-10 w-full bg-[var(--surface-control)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]"><option>$ (USD)</option><option>Bs</option></select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Precio Venta</label>
                      <input name="salePrice" type="number" min="0" defaultValue={findOffer(editingProperty, "Venta")?.precio || 0} className="h-10 w-full bg-[var(--surface-control)] border border-[var(--border-soft)] rounded px-3 py-2 text-sm text-[var(--text-main)]" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Moneda</label>
                      <select name="currency" defaultValue={findOffer(editingProperty, editOperation as "Alquiler" | "Venta")?.moneda || editingProperty.moneda || "$ (USD)"} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500"><option>$ (USD)</option><option>Bs</option></select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Precio</label>
                      <input name="price" type="number" required defaultValue={findOffer(editingProperty, editOperation as "Alquiler" | "Venta")?.precio || editingProperty.precio_usd || 0} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
                    </div>
                  </>
                )}
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Habitaciones</label>
                  <input name="rooms" type="number" min="0" defaultValue={editingProperty.habitaciones || 0} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Banos</label>
                  <input name="bathrooms" type="number" min="0" defaultValue={editingProperty.banos || 1} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Superficie (m²)</label>
                  <input name="meters" type="number" min="0" step="0.1" defaultValue={editingProperty.superficie_m2 || ""} placeholder="Ej: 120" className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer text-[var(--text-main)] dark:text-[var(--text-main)]">
                    <input name="amoblado" type="checkbox" defaultChecked={Boolean(editingProperty.amoblado)} className="rounded text-[var(--accent-main)]" />
                    Amoblado
                  </label>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Zona</label>
                  <input name="area" defaultValue={editingProperty.ciudad || ""} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Coordenadas</label>
                  <input name="coords" defaultValue={`${editingProperty.lat || 0}, ${editingProperty.lng || 0}`} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500" />
                </div>
                {/* Campos especificos por tipo */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Fecha Entrega (Preventa)</label>
                  <input name="fechaEntrega" defaultValue={editingProperty.fecha_entrega || ""} placeholder="Ej: 2026-12" className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Avance de Obra % (Preventa)</label>
                  <input name="avanceObra" type="number" min="0" max="100" defaultValue={editingProperty.avance_obra ?? ""} placeholder="Ej: 65" className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Fase de Obra (Preventa)</label>
                  <input name="faseObra" defaultValue={editingProperty.fase_obra || ""} placeholder="Ej: Obra gruesa" className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Subtipo Comercial</label>
                  <input name="subtipoComercial" defaultValue={editingProperty.subtipo_comercial || ""} placeholder="Ej: Oficina corporativa" className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Dimensiones (Terreno)</label>
                  <input name="dimensiones" defaultValue={editingProperty.dimensiones || ""} placeholder="Ej: 15m x 30m" className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Servicios Basicos (Terreno)</label>
                  <input name="serviciosBasicos" defaultValue={editingProperty.servicios_basicos || ""} placeholder="Ej: Agua, Luz, Gas" className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)]" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">DescripciÃ³n</label>
                <textarea name="description" rows={5} defaultValue={editingProperty.descripcion || ""} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500 resize-y" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Amenidades</label>
                <textarea name="amenities" rows={3} defaultValue={getPropertyAmenitiesText(editingProperty)} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500 resize-y" placeholder="Piscina, Parqueo, Sauna" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Keywords de busqueda</label>
                <textarea name="keywords" rows={2} defaultValue={getPropertyKeywordsText(editingProperty)} className="w-full bg-[var(--surface-control)] dark:bg-[var(--surface-control)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded px-3 py-2 text-sm focus:border-gold outline-none text-[var(--text-main)] dark:text-[var(--text-main)] placeholder:text-stone-400 dark:placeholder:text-stone-500 resize-y" placeholder="ideal pareja, inversion, zona premium" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">ImÃ¡genes / videos</label>
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
                  <button type="button" onClick={() => setEditingAgent(null)} className="w-full border border-[var(--border-soft)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold text-xs py-2 rounded transition-colors">Cancelar ediciÃ³n</button>
                )}
              </form>

              <hr className="border-[var(--border-soft)] dark:border-[var(--border-soft)]" />

              <div>
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-red-500 mb-4">MÃ³dulo de GestiÃ³n</h4>
                <div className="space-y-2">
                  {agents.length === 0 ? (
                    <p className="text-xs text-stone-500 italic">Base de datos vacÃ­a.</p>
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



    </div>
  );
}
