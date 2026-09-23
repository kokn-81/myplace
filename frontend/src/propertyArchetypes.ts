export interface DepartamentoDetails {
  arquetipo: "Departamento";
  piso?: string | null;
  vista?: string | null;
  precioAnteriorUsd?: number | null;
  descuentoUsd?: number | null;
  tipoCambioNota?: string | null;
  precioM2?: number | null;
  equipamiento: string[];
  amenidadesEdificio: string[];
  aptoAirbnb: boolean;
  demandaZona?: string | null;
  plusvalia?: string | null;
}

export interface CasaDetails {
  arquetipo: "Casa";
  vocacion?: string | null;
  superficieTerrenoM2?: number | null;
  superficieConstruidaM2?: number | null;
  tiendaCalleM2?: number | null;
  tiendaIndependiente: boolean;
  ambientesTotales?: number | null;
  patiosInternos?: number | null;
  cocinasIndependientes?: number | null;
  banosTotales?: number | null;
  dependenciaDeposito: boolean;
  tipoCambioNota?: string | null;
  usosRecomendados: { titulo: string; detalle: string }[];
  ventajasComerciales: string[];
}

export interface TerrenoDetails {
  arquetipo: "Terreno";
  vocacion?: string | null;
  superficieTotalM2?: number | null;
  precioM2?: number | null;
  radioUrbano?: string | null;
  tipoCambioNota?: string | null;
  coordenadasGps?: string | null;
  mapsUrl?: string | null;
  serviciosDisponibles: string[];
  atributosNaturales: string[];
  vocacionesDesarrollo: { titulo: string; detalle: string }[];
}

export interface ComercialDetails {
  arquetipo: "Comercial";
  vocacion?: string | null;
  subtipo?: string | null;
  superficieTerrenoM2?: number | null;
  superficieConstruidaM2?: number | null;
  niveles?: number | null;
  flujoVehicular?: string | null;
  plantaBaja?: { titulo: string; ambientes: string[] } | null;
  plantaAlta?: { titulo: string; ambientes: string[] } | null;
  nivelSuperior?: { titulo: string; ambientes: string[] } | null;
  serviciosInstalados: string[];
  usosRecomendados: { titulo: string; detalle: string }[];
}

function parseJsonSafe(raw: unknown): Record<string, any> | null {
  if (!raw) return null;
  if (typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, any>;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return null;
    }
  }
  return null;
}

export function parseDepartamentoDetails(raw: unknown, fallback?: { rooms?: number; bathrooms?: number; surfaceM2?: number | null }): DepartamentoDetails | null {
  const data = parseJsonSafe(raw);
  if (!data && !fallback) return null;

  const obj = data || {};
  const isDepto = obj.arquetipo === "Departamento" || (!obj.arquetipo && (fallback?.surfaceM2 || fallback?.rooms));
  if (!isDepto && !data) return null;

  return {
    arquetipo: "Departamento",
    piso: obj.piso ? String(obj.piso) : null,
    vista: obj.vista ? String(obj.vista) : null,
    precioAnteriorUsd: Number(obj.precio_anterior_usd ?? obj.precioAnteriorUsd) || null,
    descuentoUsd: Number(obj.descuento_usd ?? obj.descuentoUsd) || null,
    tipoCambioNota: obj.tipo_cambio_nota ? String(obj.tipo_cambio_nota) : null,
    precioM2: Number(obj.precio_m2 ?? obj.precioM2) || null,
    equipamiento: Array.isArray(obj.equipamiento) ? obj.equipamiento.map(String) : [],
    amenidadesEdificio: Array.isArray(obj.amenidades_edificio) ? obj.amenidades_edificio.map(String) : [],
    aptoAirbnb: Boolean(obj.perfil_inversion?.apto_airbnb ?? obj.aptoAirbnb),
    demandaZona: obj.perfil_inversion?.demanda_zona ? String(obj.perfil_inversion.demanda_zona) : (obj.demandaZona ? String(obj.demandaZona) : null),
    plusvalia: obj.perfil_inversion?.plusvalia ? String(obj.perfil_inversion.plusvalia) : null,
  };
}

export function parseCasaDetails(raw: unknown): CasaDetails | null {
  const data = parseJsonSafe(raw);
  if (!data) return null;
  if (data.arquetipo !== "Casa" && !data.tienda_calle_m2 && !data.usos_recomendados) return null;

  return {
    arquetipo: "Casa",
    vocacion: data.vocacion ? String(data.vocacion) : null,
    superficieTerrenoM2: Number(data.superficie_terreno_m2 ?? data.superficieTerrenoM2) || null,
    superficieConstruidaM2: Number(data.superficie_construida_m2 ?? data.superficieConstruidaM2) || null,
    tiendaCalleM2: Number(data.tienda_calle_m2 ?? data.tiendaCalleM2) || null,
    tiendaIndependiente: Boolean(data.tienda_independiente ?? data.tiendaIndependiente),
    ambientesTotales: Number(data.ambientes_totales ?? data.ambientesTotales) || null,
    patiosInternos: Number(data.patios_internos ?? data.patiosInternos) || null,
    cocinasIndependientes: Number(data.cocinas_independientes ?? data.cocinasIndependientes) || null,
    banosTotales: Number(data.banos_totales ?? data.banosTotales) || null,
    dependenciaDeposito: Boolean(data.dependencia_deposito ?? data.dependenciaDeposito),
    tipoCambioNota: data.tipo_cambio_nota ? String(data.tipo_cambio_nota) : null,
    usosRecomendados: Array.isArray(data.usos_recomendados)
      ? data.usos_recomendados.map((u: any) => ({
          titulo: String(u.titulo || u.title || "Uso"),
          detalle: String(u.detalle || u.detail || ""),
        }))
      : [],
    ventajasComerciales: Array.isArray(data.ventajas_comerciales) ? data.ventajas_comerciales.map(String) : [],
  };
}

export function parseTerrenoDetails(raw: unknown): TerrenoDetails | null {
  const data = parseJsonSafe(raw);
  if (!data) return null;
  if (data.arquetipo !== "Terreno" && !data.radio_urbano && !data.arboles_frutales && !data.vocaciones_desarrollo) return null;

  return {
    arquetipo: "Terreno",
    vocacion: data.vocacion ? String(data.vocacion) : null,
    superficieTotalM2: Number(data.superficie_total_m2 ?? data.superficieTotalM2) || null,
    precioM2: Number(data.precio_m2 ?? data.precioM2) || null,
    radioUrbano: data.radio_urbano ? String(data.radio_urbano) : null,
    tipoCambioNota: data.tipo_cambio_nota ? String(data.tipo_cambio_nota) : null,
    coordenadasGps: data.coordenadas_gps ? String(data.coordenadas_gps) : null,
    mapsUrl: data.maps_url ? String(data.maps_url) : null,
    serviciosDisponibles: Array.isArray(data.servicios_disponibles) ? data.servicios_disponibles.map(String) : [],
    atributosNaturales: Array.isArray(data.atributos_naturales) ? data.atributos_naturales.map(String) : [],
    vocacionesDesarrollo: Array.isArray(data.vocaciones_desarrollo)
      ? data.vocaciones_desarrollo.map((v: any) => ({
          titulo: String(v.titulo || v.title || "Vocación"),
          detalle: String(v.detalle || v.detail || ""),
        }))
      : [],
  };
}

export function parseComercialDetails(raw: unknown): ComercialDetails | null {
  const data = parseJsonSafe(raw);
  if (!data) return null;
  if (data.arquetipo !== "Comercial" && !data.planta_baja && !data.flujo_vehicular) return null;

  return {
    arquetipo: "Comercial",
    vocacion: data.vocacion ? String(data.vocacion) : null,
    subtipo: data.subtipo ? String(data.subtipo) : null,
    superficieTerrenoM2: Number(data.superficie_terreno_m2 ?? data.superficieTerrenoM2) || null,
    superficieConstruidaM2: Number(data.superficie_construida_m2 ?? data.superficieConstruidaM2) || null,
    niveles: Number(data.niveles) || null,
    flujoVehicular: data.flujo_vehicular ? String(data.flujo_vehicular) : null,
    plantaBaja: data.planta_baja
      ? {
          titulo: String(data.planta_baja.titulo || "Planta Baja"),
          ambientes: Array.isArray(data.planta_baja.ambientes) ? data.planta_baja.ambientes.map(String) : [],
        }
      : null,
    plantaAlta: data.planta_alta
      ? {
          titulo: String(data.planta_alta.titulo || "Planta Alta"),
          ambientes: Array.isArray(data.planta_alta.ambientes) ? data.planta_alta.ambientes.map(String) : [],
        }
      : null,
    nivelSuperior: data.nivel_superior
      ? {
          titulo: String(data.nivel_superior.titulo || "Nivel Superior"),
          ambientes: Array.isArray(data.nivel_superior.ambientes) ? data.nivel_superior.ambientes.map(String) : [],
        }
      : null,
    serviciosInstalados: Array.isArray(data.servicios_instalados) ? data.servicios_instalados.map(String) : [],
    usosRecomendados: Array.isArray(data.usos_recomendados)
      ? data.usos_recomendados.map((u: any) => ({
          titulo: String(u.titulo || u.title || "Uso"),
          detalle: String(u.detalle || u.detail || ""),
        }))
      : [],
  };
}
