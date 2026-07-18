# backend/main.py
import os
import time
import json
import hashlib
import requests
import unicodedata
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload
from config import CORS_ORIGINS
from database import SessionLocal, init_db
from auth_security import get_current_profile, get_role_for_email, normalize_email, require_admin, require_advisor_or_admin, upsert_authorized_user
from models import AgenteDB, InmuebleDB, OfertaDB, SearchCacheDB, SearchLogDB
from nia_search import EMBEDDINGS_ENABLED, EMBEDDING_MODEL, build_property_search_text, efficient_property_search, invalidate_search_cache, normalize_amenities_text, update_property_embedding
from pydantic import BaseModel
from typing import List, Optional

# --- LIBRERIA OFICIAL Y ACTUALIZADA ---
from google import genai

app = FastAPI(title="Motor Inmobiliario Bolivia - O.P.A.L.O.")

# --- CONFIGURACION DE IA (ESCALABLE Y CON BYPASS DE RED) ---
# INYECTA TU LLAVE AQUI
LLAVE_REAL = os.getenv("GEMINI_API_KEY", "").strip()
cliente_ia = genai.Client(api_key=LLAVE_REAL, http_options={'api_version': 'v1'}) if LLAVE_REAL else None
MODELO_ACTIVO = 'gemini-2.5-flash'
PUBLIC_CATALOG_CACHE_TTL_SECONDS = int(os.getenv("PUBLIC_CATALOG_CACHE_TTL_SECONDS", "60") or "60")
_public_catalog_summary_cache: dict[str, object] = {"expires_at": 0.0, "data": None}


def get_public_catalog_cache() -> Optional[list[dict]]:
    cached_data = _public_catalog_summary_cache.get("data")
    expires_at = float(_public_catalog_summary_cache.get("expires_at") or 0)
    if cached_data is not None and expires_at > time.time():
        return cached_data  # type: ignore[return-value]
    return None


def set_public_catalog_cache(data: list[dict]) -> None:
    _public_catalog_summary_cache["data"] = data
    _public_catalog_summary_cache["expires_at"] = time.time() + max(PUBLIC_CATALOG_CACHE_TTL_SECONDS, 0)


def invalidate_public_catalog_cache() -> None:
    _public_catalog_summary_cache["data"] = None
    _public_catalog_summary_cache["expires_at"] = 0.0

# --- POLITICAS DE SEGURIDAD CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. GESTION DE ARCHIVOS MULTIMEDIA ---
CARPETA_UPLOADS = "./uploads"
if not os.path.exists(CARPETA_UPLOADS):
    os.makedirs(CARPETA_UPLOADS)
app.mount("/uploads", StaticFiles(directory=CARPETA_UPLOADS), name="uploads")

# --- 2. MODELOS FISICOS RELACIONALES (SQLAlchemy) ---
init_db()

# 2. El inmueble describe la propiedad fisica; las ofertas describen venta/alquiler.
class OfertaSchema(BaseModel):
    operacion: str
    precio: float
    moneda: Optional[str] = "$ (USD)"
    agente_id: Optional[int] = None
    estado: Optional[str] = "Publicado"


class InmuebleCreate(BaseModel):
    titulo: str
    precio_usd: Optional[float] = 0
    moneda: Optional[str] = "$ (USD)"
    habitaciones: int
    banos: Optional[int] = 1
    ciudad: str
    lat: float
    lng: float
    operacion: Optional[str] = "Venta"
    tipo_inmueble: str
    estado: Optional[str] = "Borrador"
    superficie_m2: Optional[float] = None
    zona: Optional[str] = None
    direccion: Optional[str] = None
    piso: Optional[str] = None
    amoblado: Optional[bool] = None
    acepta_mascotas: Optional[bool] = None
    parqueos: Optional[int] = None
    baulera: Optional[bool] = None
    descripcion: str
    agente_id: Optional[int] = None
    imagenes: str = ""
    amenidades: str = ""
    keywords: str = ""
    ofertas: Optional[List[OfertaSchema]] = None
class AgenteSchema(BaseModel):
    nombre: str
    whatsapp: str
    email: Optional[str] = None

class PeticionChat(BaseModel):
    mensaje: str
    candidate_ids: Optional[List[int]] = None


class PeticionExtraccionInmueble(BaseModel):
    texto: str
ESTADOS_INMUEBLE = {"Borrador", "Publicado", "Pausado"}


def normalizar_estado_inmueble(estado: Optional[str]) -> str:
    estado_limpio = (estado or "Borrador").strip().capitalize()
    return estado_limpio if estado_limpio in ESTADOS_INMUEBLE else "Borrador"


def limpiar_respuesta_json(texto: str):
    texto_limpio = (texto or "").replace("```json", "").replace("```", "").strip()
    inicio = texto_limpio.find("{")
    fin = texto_limpio.rfind("}")
    if inicio >= 0 and fin >= inicio:
        texto_limpio = texto_limpio[inicio:fin + 1]
    return json.loads(texto_limpio)


def obtener_valor(data: dict, clave: str):
    valor = data.get(clave)
    if isinstance(valor, str):
        valor = valor.strip()
    return valor


AMENIDADES_DESCARTABLES = {
    "santa cruz",
    "santa cruz de la sierra",
    "bolivia",
    "equipetrol",
    "equipetrol norte",
}


PATRONES_AMENIDAD_DESCARTABLE = (
    "precio",
    "ubicacion",
    "direccion",
    "superficie",
    " m2",
    "metro cuadrado",
    "dormitorio",
    "habitacion",
    "alquiler",
    "venta",
    "dolar",
    "boliviano",
    "calle",
    "avenida",
    "zona",
)


def normalizar_texto_simple(valor) -> str:
    texto = unicodedata.normalize("NFKD", str(valor or ""))
    texto = "".join(caracter for caracter in texto if not unicodedata.combining(caracter))
    return " ".join(texto.lower().strip().split())


def limpiar_amenidades_extraidas(data: dict) -> list[str]:
    amenidades = data.get("amenidades") if isinstance(data.get("amenidades"), list) else []
    descartables = set(AMENIDADES_DESCARTABLES)
    ciudad = normalizar_texto_simple(data.get("ciudad"))
    if ciudad:
        descartables.add(ciudad)

    resultado: list[str] = []
    vistas: set[str] = set()
    for amenidad in amenidades:
        texto = str(amenidad or "").strip()
        clave = normalizar_texto_simple(texto)
        if not clave or clave in vistas or clave in descartables:
            continue
        if any(patron in f" {clave}" for patron in PATRONES_AMENIDAD_DESCARTABLE):
            continue
        vistas.add(clave)
        resultado.append(texto)
    return resultado




def limpiar_keywords_extraidas(data: dict) -> list[str]:
    keywords = data.get("keywords") if isinstance(data.get("keywords"), list) else []
    resultado: list[str] = []
    vistas: set[str] = set()
    for keyword in keywords:
        texto = str(keyword or "").strip()
        clave = normalizar_texto_simple(texto)
        if not clave or clave in vistas:
            continue
        if len(clave) < 3 or len(texto) > 60:
            continue
        if clave.startswith(("http", "www")):
            continue
        vistas.add(clave)
        resultado.append(texto)
    return resultado[:12]


def inferir_bool_por_amenidad(amenidades: str, *terminos: str) -> bool:
    texto = normalizar_texto_simple(amenidades)
    return any(termino in texto for termino in terminos)


def aplicar_campos_busqueda_inmueble(inmueble_db: InmuebleDB, inmueble: InmuebleCreate) -> None:
    amenidades = inmueble.amenidades or ""
    inmueble_db.keywords = (inmueble.keywords or "").strip()
    inmueble_db.superficie_m2 = inmueble.superficie_m2
    inmueble_db.zona = (inmueble.zona or inmueble.ciudad or "").strip() or None
    inmueble_db.direccion = (inmueble.direccion or "").strip() or None
    inmueble_db.piso = (inmueble.piso or "").strip() or None
    inmueble_db.amoblado = bool(inmueble.amoblado) if inmueble.amoblado is not None else inferir_bool_por_amenidad(amenidades, "amoblad", "equipad")
    inmueble_db.acepta_mascotas = bool(inmueble.acepta_mascotas) if inmueble.acepta_mascotas is not None else inferir_bool_por_amenidad(amenidades, "mascota", "pet friendly")
    inmueble_db.parqueos = max(int(inmueble.parqueos or 0), 1 if inferir_bool_por_amenidad(amenidades, "parqueo", "garaje", "garage", "estacionamiento") else 0)
    inmueble_db.baulera = bool(inmueble.baulera) if inmueble.baulera is not None else inferir_bool_por_amenidad(amenidades, "baulera", "deposito")
    inmueble_db.amenidades_normalizadas = normalize_amenities_text(amenidades)
    inmueble_db.search_text = build_property_search_text(inmueble_db)

def construir_faltantes_extraccion(data: dict) -> tuple[list[str], list[str]]:
    faltantes: list[str] = []
    preguntas: list[str] = []

    campos = [
        ("titulo", "titulo comercial"),
        ("operacion", "operacion: venta, alquiler o alquiler y venta"),
        ("tipo_inmueble", "tipo de inmueble"),
        ("moneda", "moneda"),
        ("habitaciones", "cantidad de habitaciones"),
        ("banos", "cantidad de banos"),
        ("ciudad", "zona o ciudad"),
        ("descripcion", "descripcion"),
    ]
    for clave, etiqueta in campos:
        if obtener_valor(data, clave) in {None, ""}:
            faltantes.append(clave)
            preguntas.append(f"Falta {etiqueta}.")

    ofertas = data.get("ofertas") if isinstance(data.get("ofertas"), list) else []
    tiene_precio = obtener_valor(data, "precio") not in {None, ""} or any(oferta.get("precio") for oferta in ofertas if isinstance(oferta, dict))
    if not tiene_precio:
        faltantes.append("precio")
        preguntas.append("Falta precio de la oferta.")

    if obtener_valor(data, "lat") in {None, ""} or obtener_valor(data, "lng") in {None, ""}:
        faltantes.append("coordenadas")
        preguntas.append("Faltan coordenadas exactas del inmueble.")

    return faltantes, preguntas

# --- INYECCION DE DEPENDENCIAS ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



def serializar_oferta(oferta: OfertaDB) -> dict:
    agente = oferta.agente
    return {
        "id": str(oferta.id),
        "operacion": oferta.operacion,
        "precio": oferta.precio,
        "moneda": oferta.moneda or "$ (USD)",
        "estado": oferta.estado or "Publicado",
        "agente_id": str(oferta.agente_id) if oferta.agente_id else "0",
        "agente": {
            "id": str(agente.id),
            "name": agente.nombre,
            "whatsapp": agente.whatsapp,
        } if agente else None,
    }


def obtener_oferta_principal(inmueble: InmuebleDB) -> Optional[OfertaDB]:
    ofertas_publicadas = [oferta for oferta in inmueble.ofertas if (oferta.estado or "Publicado") == "Publicado"]
    if ofertas_publicadas:
        return ofertas_publicadas[0]
    return inmueble.ofertas[0] if inmueble.ofertas else None


def obtener_lista_imagenes(inm: InmuebleDB) -> List[str]:
    texto_imagenes = str(inm.imagenes) if inm.imagenes else ""
    return [url.strip() for url in texto_imagenes.split(",") if url.strip()]


def obtener_lista_amenidades(inm: InmuebleDB) -> List[str]:
    texto_amenidades = str(inm.amenidades) if inm.amenidades else ""
    return [am.strip() for am in texto_amenidades.split(",") if am.strip()]




def obtener_lista_keywords(inm: InmuebleDB) -> List[str]:
    texto_keywords = str(getattr(inm, "keywords", "") or "")
    return [kw.strip() for kw in texto_keywords.split(",") if kw.strip()]


def aplicar_oferta_principal(inm: InmuebleDB, inm_dict: dict) -> dict:
    inm_dict["banos"] = getattr(inm, "banos", 1) or 1
    inm_dict["agente_id"] = str(inm.agente_id) if inm.agente_id else "0"

    ofertas = [serializar_oferta(oferta) for oferta in inm.ofertas]
    inm_dict["ofertas"] = ofertas
    oferta_principal = obtener_oferta_principal(inm)

    if oferta_principal:
        inm_dict["operacion"] = oferta_principal.operacion
        inm_dict["precio_usd"] = oferta_principal.precio
        inm_dict["moneda"] = oferta_principal.moneda or "$ (USD)"
        inm_dict["agente_id"] = str(oferta_principal.agente_id) if oferta_principal.agente_id else inm_dict["agente_id"]
        if oferta_principal.agente:
            inm_dict["agente"] = {
                "id": str(oferta_principal.agente.id),
                "name": oferta_principal.agente.nombre,
                "whatsapp": oferta_principal.agente.whatsapp,
            }
            inm_dict["agente_nombre"] = oferta_principal.agente.nombre
            inm_dict["agente_whatsapp"] = oferta_principal.agente.whatsapp
    elif inm.agente:
        inm_dict["agente"] = {
            "id": str(inm.agente.id),
            "name": inm.agente.nombre,
            "whatsapp": inm.agente.whatsapp,
        }
        inm_dict["agente_nombre"] = inm.agente.nombre
        inm_dict["agente_whatsapp"] = inm.agente.whatsapp
    else:
        inm_dict["agente"] = None
        inm_dict["agente_nombre"] = ""
        inm_dict["agente_whatsapp"] = ""

    return inm_dict


def serializar_inmueble(inm: InmuebleDB, include_search_metadata: bool = False) -> dict:
    inm_dict = inm.__dict__.copy()
    inm_dict.pop("_sa_instance_state", None)
    inm_dict["images"] = obtener_lista_imagenes(inm)
    inm_dict["amenidades"] = obtener_lista_amenidades(inm)
    inm_dict["keywords"] = obtener_lista_keywords(inm)
    inm_dict["detalle_completo"] = True

    if include_search_metadata:
        inm_dict["search_text"] = getattr(inm, "search_text", None) or build_property_search_text(inm)
        inm_dict["embedding_ready"] = bool(getattr(inm, "embedding_json", None))
    else:
        for key in ("search_text", "embedding_json", "embedding_model", "embedding_updated_at", "amenidades_normalizadas"):
            inm_dict.pop(key, None)

    return aplicar_oferta_principal(inm, inm_dict)


def serializar_inmueble_resumen(inm: InmuebleDB) -> dict:
    imagenes = obtener_lista_imagenes(inm)
    inm_dict = {
        "id": inm.id,
        "titulo": inm.titulo,
        "precio_usd": inm.precio_usd,
        "moneda": inm.moneda,
        "habitaciones": inm.habitaciones,
        "banos": getattr(inm, "banos", 1) or 1,
        "ciudad": inm.ciudad,
        "lat": inm.lat,
        "lng": inm.lng,
        "operacion": inm.operacion,
        "tipo_inmueble": inm.tipo_inmueble,
        "amenidades": obtener_lista_amenidades(inm),
        "keywords": obtener_lista_keywords(inm),
        "images": imagenes[:1],
        "detalle_completo": False,
    }
    return aplicar_oferta_principal(inm, inm_dict)



def normalizar_ofertas(inmueble: InmuebleCreate) -> List[OfertaSchema]:
    if inmueble.ofertas:
        ofertas = [oferta for oferta in inmueble.ofertas if oferta.operacion and oferta.precio is not None]
        if ofertas:
            return ofertas

    if not inmueble.agente_id:
        raise HTTPException(status_code=400, detail="Selecciona un asesor para la oferta.")

    return [OfertaSchema(
        operacion=inmueble.operacion or "Venta",
        precio=float(inmueble.precio_usd or 0),
        moneda=inmueble.moneda or "$ (USD)",
        agente_id=inmueble.agente_id,
        estado="Publicado",
    )]


def validar_agentes_de_ofertas(ofertas: List[OfertaSchema], db: Session, current_profile: dict) -> List[tuple[OfertaSchema, AgenteDB]]:
    validadas = []
    for oferta in ofertas:
        if not oferta.agente_id:
            raise HTTPException(status_code=400, detail="Cada oferta debe tener un asesor asignado.")
        agente = db.query(AgenteDB).filter(AgenteDB.id == oferta.agente_id).first()
        if not agente:
            raise HTTPException(status_code=400, detail="El asesor designado no existe.")
        if current_profile["role"] == "advisor" and normalize_email(agente.email) != current_profile["email"]:
            raise HTTPException(status_code=403, detail="Solo puedes publicar ofertas bajo tu propio perfil de asesor.")
        validadas.append((oferta, agente))
    return validadas


@app.get("/api/auth/me")
async def obtener_perfil_actual(profile: dict = Depends(get_current_profile)):
    return profile

# --- 4. ENDPOINT NIA: router eficiente por capas ---
@app.post("/api/chat", status_code=200)
async def chat_inteligente(peticion: PeticionChat, db: Session = Depends(get_db)):
    try:
        resultado = efficient_property_search(
            db=db,
            message=peticion.mensaje,
            candidate_ids=peticion.candidate_ids,
            llm_client=cliente_ia,
            llm_model=MODELO_ACTIVO,
            embedding_client=cliente_ia if EMBEDDINGS_ENABLED else None,
            embedding_model=EMBEDDING_MODEL,
        )
        return {"status": "success", **resultado}
    except Exception as e:
        print(f"NIA search error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Fallo en el motor de busqueda: {str(e)}")


@app.post("/api/inmuebles/extraer-datos", status_code=200)
async def extraer_datos_inmueble(
    peticion: PeticionExtraccionInmueble,
    current_profile: dict = Depends(require_advisor_or_admin),
):
    texto = peticion.texto.strip()
    if not texto:
        raise HTTPException(status_code=400, detail="Pega el texto del asesor para poder extraer los datos.")
    if cliente_ia is None:
        raise HTTPException(status_code=500, detail="Falta GEMINI_API_KEY en el backend.")

    prompt_extraccion = f"""
    Extrae datos para cargar un inmueble en una app inmobiliaria de Bolivia.
    Devuelve solo JSON valido, sin markdown ni explicaciones.

    TEXTO DEL ASESOR:
    {texto}

    Usa esta forma exacta:
    {{
      "data": {{
        "titulo": string | null,
        "operacion": "Venta" | "Alquiler" | "Alquiler y Venta" | "Inversion" | null,
        "tipo_inmueble": "Departamento" | "Casa" | "Terreno" | "Oficina" | "Local Comercial" | null,
        "precio": number | null,
        "moneda": "$ (USD)" | "Bs" | null,
        "habitaciones": number | null,
        "banos": number | null,
        "ciudad": string | null,
        "superficie_m2": number | null,
        "zona": string | null,
        "direccion": string | null,
        "piso": string | null,
        "amoblado": boolean | null,
        "acepta_mascotas": boolean | null,
        "parqueos": number | null,
        "baulera": boolean | null,
        "lat": number | null,
        "lng": number | null,
        "descripcion": string | null,
        "amenidades": string[],
        "keywords": string[],
        "estado": "Borrador",
        "ofertas": [{{"operacion": string, "precio": number, "moneda": string}}]
      }},
      "missing_fields": string[],
      "questions": string[]
    }}

    Reglas:
    - No inventes coordenadas. Si no estan en el texto, usa null.
    - Si dice dolares, USD o $, usa "$ (USD)". Si dice bolivianos o Bs, usa "Bs".
    - Si hay precio de alquiler y venta, usa operacion "Alquiler y Venta" y llena ofertas.
    - El "titulo" debe ser comercial, breve y natural. No uses MAYUSCULAS sostenidas. Combina tipo de inmueble, edificio/zona o publico objetivo solo cuando el texto lo respalde, por ejemplo: "Pixel Loft para Streamer", "Departamento ejecutivo en Equipetrol" o "Casa familiar con jardin".
    - Identifica el publico objetivo cuando el texto lo permita: ejecutivo, pareja, familia, estudiante, creador de contenido, inversionista, nomada digital, profesional remoto, mascotas, renta corta o alta demanda.
    - Redacta "descripcion" como texto comercial natural en 2 o 3 parrafos separados por una linea en blanco. En el string JSON usa \\n\\n para separar parrafos.
    - No uses bullets, emojis, listas, encabezados ni etiquetas dentro de "descripcion".
    - Parrafo 1: tipo de inmueble, operacion, edificio o zona, ubicacion y propuesta principal para el publico objetivo.
    - Parrafo 2: superficie, distribucion, dormitorios, banos, equipamiento y caracteristicas internas relevantes.
    - Parrafo 3: areas comunes, experiencia del edificio o valor para vivir, trabajar, invertir o generar renta solo si el texto lo respalda.
    - Extrae superficie_m2, zona, direccion, piso, amoblado, acepta_mascotas, parqueos y baulera cuando el texto lo diga; si no aparece, usa null.
    - En "amenidades" incluye solo beneficios concretos y visibles de la propiedad o edificio: piscina, parqueo, fibra optica, home studio, gimnasio, churrasquera, seguridad 24 horas, baulera, lavanderia, terraza, aire acondicionado. No incluyas ciudad, zona, edificio, direccion, precio, superficie, habitaciones, banos, operacion ni datos generales.
    - En "keywords" incluye etiquetas de intencion de busqueda, perfil comercial y sinonimos utiles para embeddings. Ejemplos: ideal pareja, ideal familia, inversion, alta demanda de alquiler, zona premium, zona universitaria, pet friendly, ejecutivo, creador de contenido, home office, nomada digital, renta corta, cerca de avenida. No repitas amenidades salvo que funcionen como intencion de busqueda.
    - No devuelvas search_text. El sistema lo genera despues con titulo, ubicacion, amenidades y keywords.
    - Las imagenes no se extraen aqui: ya se suben por Cloudinary en el admin.
    - La propiedad siempre queda como Borrador.
    """

    try:
        respuesta = cliente_ia.models.generate_content(model=MODELO_ACTIVO, contents=prompt_extraccion)
        resultado = limpiar_respuesta_json(respuesta.text or "")
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=502, detail="La IA no devolvio JSON valido para el formulario.") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"No se pudo extraer datos del texto: {str(exc)}") from exc

    data = resultado.get("data", resultado)
    if not isinstance(data, dict):
        raise HTTPException(status_code=502, detail="La IA devolvio una estructura inesperada.")

    data["estado"] = "Borrador"
    data["amenidades"] = limpiar_amenidades_extraidas(data)
    data["keywords"] = limpiar_keywords_extraidas(data)
    if not isinstance(data.get("ofertas"), list):
        data["ofertas"] = []

    faltantes, preguntas = construir_faltantes_extraccion(data)
    preguntas_ia = resultado.get("questions") if isinstance(resultado.get("questions"), list) else []
    preguntas_finales = [pregunta for pregunta in [*preguntas, *preguntas_ia] if isinstance(pregunta, str) and pregunta.strip()]

    return {
        "status": "success",
        "data": data,
        "missing_fields": sorted(set(faltantes)),
        "questions": list(dict.fromkeys(preguntas_finales)),
    }


@app.get("/api/admin/nia/metrics")
async def obtener_metricas_nia(db: Session = Depends(get_db), current_profile: dict = Depends(require_admin)):
    def pct(part: int, whole: int) -> float:
        return round((part / whole) * 100, 2) if whole else 0

    def avg(values: list[float]) -> float:
        return round(sum(values) / len(values), 2) if values else 0

    def percentile(values: list[int], ratio: float) -> int:
        if not values:
            return 0
        ordered = sorted(int(value or 0) for value in values)
        index = min(len(ordered) - 1, max(0, round((len(ordered) - 1) * ratio)))
        return ordered[index]

    total = db.query(func.count(SearchLogDB.id)).scalar() or 0
    llm_count = db.query(func.count(SearchLogDB.id)).filter(SearchLogDB.llm_used == True).scalar() or 0  # noqa: E712
    embedding_count = db.query(func.count(SearchLogDB.id)).filter(SearchLogDB.embedding_used == True).scalar() or 0  # noqa: E712
    cache_hits = db.query(func.count(SearchLogDB.id)).filter(SearchLogDB.cache_hit == True).scalar() or 0  # noqa: E712
    zero_results = db.query(func.count(SearchLogDB.id)).filter(SearchLogDB.result_count == 0).scalar() or 0
    contacted = db.query(func.count(SearchLogDB.id)).filter(SearchLogDB.contacted_agent == True).scalar() or 0  # noqa: E712
    active_cache_entries = db.query(func.count(SearchCacheDB.id)).filter(SearchCacheDB.expires_at > func.now()).scalar() or 0
    total_properties = db.query(func.count(InmuebleDB.id)).scalar() or 0
    embedded_properties = db.query(func.count(InmuebleDB.id)).filter(InmuebleDB.embedding_json.isnot(None), InmuebleDB.embedding_json != "").scalar() or 0

    latency_values = [row[0] or 0 for row in db.query(SearchLogDB.latency_ms).all()]
    token_input_total = db.query(func.coalesce(func.sum(SearchLogDB.tokens_input), 0)).scalar() or 0
    token_output_total = db.query(func.coalesce(func.sum(SearchLogDB.tokens_output), 0)).scalar() or 0
    estimated_cost_total = db.query(func.coalesce(func.sum(SearchLogDB.estimated_cost), 0)).scalar() or 0

    layer_rows = db.query(SearchLogDB.layer_used, func.count(SearchLogDB.id)).group_by(SearchLogDB.layer_used).all()
    by_layer = {layer or "unknown": count for layer, count in layer_rows}
    layer_details = []
    for layer, count in layer_rows:
        layer_name = layer or "unknown"
        rows = db.query(SearchLogDB).filter(SearchLogDB.layer_used == layer).all()
        layer_details.append({
            "layer": layer_name,
            "count": count,
            "percentage": pct(count, total),
            "avg_latency_ms": avg([row.latency_ms or 0 for row in rows]),
            "avg_results": avg([row.result_count or 0 for row in rows]),
            "llm_count": sum(1 for row in rows if row.llm_used),
            "cache_hits": sum(1 for row in rows if row.cache_hit),
            "tokens_input": sum(row.tokens_input or 0 for row in rows),
            "tokens_output": sum(row.tokens_output or 0 for row in rows),
        })
    layer_details.sort(key=lambda item: item["count"], reverse=True)

    top_query_rows = (
        db.query(SearchLogDB.query_normalized, func.count(SearchLogDB.id), func.avg(SearchLogDB.result_count), func.avg(SearchLogDB.latency_ms))
        .group_by(SearchLogDB.query_normalized)
        .order_by(func.count(SearchLogDB.id).desc())
        .limit(8)
        .all()
    )
    zero_query_rows = (
        db.query(SearchLogDB.query_normalized, func.count(SearchLogDB.id))
        .filter(SearchLogDB.result_count == 0)
        .group_by(SearchLogDB.query_normalized)
        .order_by(func.count(SearchLogDB.id).desc())
        .limit(8)
        .all()
    )
    recent_rows = (
        db.query(SearchLogDB)
        .order_by(SearchLogDB.created_at.desc())
        .limit(12)
        .all()
    )

    return {
        "total_searches": total,
        "llm_searches": llm_count,
        "llm_percentage": pct(llm_count, total),
        "embedding_searches": embedding_count,
        "embedding_percentage": pct(embedding_count, total),
        "total_properties": total_properties,
        "embedded_properties": embedded_properties,
        "embedding_coverage_percentage": pct(embedded_properties, total_properties),
        "cache_hits": cache_hits,
        "cache_hit_percentage": pct(cache_hits, total),
        "active_cache_entries": active_cache_entries,
        "zero_result_searches": zero_results,
        "zero_result_percentage": pct(zero_results, total),
        "contacted_agent_searches": contacted,
        "contact_rate_percentage": pct(contacted, total),
        "avg_latency_ms": avg(latency_values),
        "p50_latency_ms": percentile(latency_values, 0.5),
        "p95_latency_ms": percentile(latency_values, 0.95),
        "tokens_input_total": int(token_input_total),
        "tokens_output_total": int(token_output_total),
        "tokens_total": int((token_input_total or 0) + (token_output_total or 0)),
        "estimated_cost_total": round(float(estimated_cost_total or 0), 6),
        "by_layer": by_layer,
        "layer_details": layer_details,
        "top_queries": [
            {"query": query, "count": count, "avg_results": round(float(avg_results or 0), 2), "avg_latency_ms": round(float(avg_latency or 0), 2)}
            for query, count, avg_results, avg_latency in top_query_rows
        ],
        "zero_result_queries": [{"query": query, "count": count} for query, count in zero_query_rows],
        "recent_searches": [
            {
                "query": row.query_normalized,
                "layer": row.layer_used,
                "result_count": row.result_count or 0,
                "latency_ms": row.latency_ms or 0,
                "cache_hit": bool(row.cache_hit),
                "llm_used": bool(row.llm_used),
                "embedding_used": bool(row.embedding_used),
                "tokens": int((row.tokens_input or 0) + (row.tokens_output or 0)),
                "estimated_cost": round(float(row.estimated_cost or 0), 6),
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in recent_rows
        ],
    }
@app.post("/api/admin/nia/embeddings/backfill", status_code=200)
async def regenerar_embeddings_nia(db: Session = Depends(get_db), current_profile: dict = Depends(require_admin)):
    if not EMBEDDINGS_ENABLED:
        raise HTTPException(status_code=400, detail="Activa NIA_EMBEDDINGS_ENABLED=true para generar embeddings.")
    if cliente_ia is None:
        raise HTTPException(status_code=500, detail="Falta GEMINI_API_KEY para generar embeddings.")

    inmuebles = db.query(InmuebleDB).all()
    updated = 0
    skipped = 0
    failed = 0

    try:
        for inmueble in inmuebles:
            next_search_text = build_property_search_text(inmueble)
            needs_embedding = (
                not getattr(inmueble, "embedding_json", None)
                or getattr(inmueble, "embedding_model", None) != EMBEDDING_MODEL
                or getattr(inmueble, "search_text", None) != next_search_text
            )
            if not needs_embedding:
                skipped += 1
                continue

            inmueble.search_text = next_search_text
            if update_property_embedding(inmueble, cliente_ia, EMBEDDING_MODEL):
                updated += 1
            else:
                failed += 1

        invalidate_search_cache(db)
        db.commit()
        return {"status": "success", "updated": updated, "skipped": skipped, "failed": failed, "model": EMBEDDING_MODEL}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"No se pudieron regenerar embeddings: {str(exc)}") from exc


# --- 5. ENDPOINTS DE INMUEBLES CRUD (MODERNO JSON) ---
@app.post("/api/cloudinary/upload")
def subir_archivos_cloudinary(
    files: List[UploadFile] = File(...),
    current_profile: dict = Depends(require_advisor_or_admin),
):
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "").strip()
    api_key = os.getenv("CLOUDINARY_API_KEY", "").strip()
    api_secret = os.getenv("CLOUDINARY_API_SECRET", "").strip()
    upload_preset = os.getenv("CLOUDINARY_UPLOAD_PRESET", "").strip()
    folder = os.getenv("CLOUDINARY_FOLDER", "inmuebles").strip() or "inmuebles"

    if not cloud_name:
        raise HTTPException(status_code=500, detail="Falta CLOUDINARY_CLOUD_NAME en el backend.")

    signed_upload = bool(api_key and api_secret)
    unsigned_upload = bool(upload_preset)
    if not signed_upload and not unsigned_upload:
        raise HTTPException(
            status_code=500,
            detail="Configura CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET o CLOUDINARY_UPLOAD_PRESET.",
        )

    if len(files) > 20:
        raise HTTPException(status_code=400, detail="Puedes subir hasta 20 archivos por propiedad.")

    uploaded = []
    upload_url = f"https://api.cloudinary.com/v1_1/{cloud_name}/auto/upload"

    for file in files:
        content_type = file.content_type or ""
        file_size = getattr(file, "size", 0) or 0
        if file_size > 150 * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"Archivo demasiado grande: {file.filename}")
        if not (content_type.startswith("image/") or content_type.startswith("video/")):
            raise HTTPException(status_code=400, detail=f"Archivo no permitido: {file.filename}")

        timestamp = str(int(time.time()))
        data = {"folder": folder}

        if signed_upload:
            signature_payload = {"folder": folder, "timestamp": timestamp}
            signature_base = "&".join(f"{key}={signature_payload[key]}" for key in sorted(signature_payload))
            signature = hashlib.sha1(f"{signature_base}{api_secret}".encode("utf-8")).hexdigest()
            data.update({
                "api_key": api_key,
                "timestamp": timestamp,
                "signature": signature,
            })
        else:
            data["upload_preset"] = upload_preset

        try:
            response = requests.post(
                upload_url,
                data=data,
                files={"file": (file.filename, file.file, content_type)},
                timeout=90,
            )
        except requests.RequestException as exc:
            raise HTTPException(status_code=502, detail=f"Cloudinary no respondio: {str(exc)}")

        if response.status_code >= 400:
            raise HTTPException(status_code=502, detail=f"Cloudinary rechazo {file.filename}: {response.text}")

        cloudinary_data = response.json()
        uploaded.append({
            "url": cloudinary_data.get("secure_url"),
            "public_id": cloudinary_data.get("public_id"),
            "resource_type": cloudinary_data.get("resource_type"),
            "format": cloudinary_data.get("format"),
        })

    return {"status": "success", "files": uploaded, "urls": [item["url"] for item in uploaded if item.get("url")]}

@app.post("/api/inmuebles", status_code=201)
async def crear_inmueble(
    inmueble: InmuebleCreate,
    db: Session = Depends(get_db),
    current_profile: dict = Depends(require_advisor_or_admin),
):
    try:
        ofertas = normalizar_ofertas(inmueble)
        ofertas_validadas = validar_agentes_de_ofertas(ofertas, db, current_profile)
        oferta_principal, agente_principal = ofertas_validadas[0]
        estado_inmueble = normalizar_estado_inmueble(inmueble.estado)

        nuevo_inmueble = InmuebleDB(
            titulo=inmueble.titulo,
            precio_usd=oferta_principal.precio,
            moneda=oferta_principal.moneda,
            habitaciones=inmueble.habitaciones,
            banos=inmueble.banos or 1,
            ciudad=inmueble.ciudad,
            lat=inmueble.lat,
            lng=inmueble.lng,
            operacion=oferta_principal.operacion,
            tipo_inmueble=inmueble.tipo_inmueble,
            estado=estado_inmueble,
            descripcion=inmueble.descripcion,
            amenidades=inmueble.amenidades,
            keywords=inmueble.keywords,
            imagenes=inmueble.imagenes,
            agente_id=agente_principal.id,
        )

        aplicar_campos_busqueda_inmueble(nuevo_inmueble, inmueble)
        update_property_embedding(nuevo_inmueble, cliente_ia if EMBEDDINGS_ENABLED else None, EMBEDDING_MODEL)
        db.add(nuevo_inmueble)
        db.flush()

        for oferta, agente in ofertas_validadas:
            db.add(OfertaDB(
                inmueble_id=nuevo_inmueble.id,
                operacion=oferta.operacion,
                precio=oferta.precio,
                moneda=oferta.moneda or "$ (USD)",
                estado=oferta.estado or "Publicado",
                agente_id=agente.id,
            ))

        invalidate_search_cache(db)
        db.commit()
        invalidate_public_catalog_cache()
        db.refresh(nuevo_inmueble)

        return {"status": "success", "message": "Inmueble guardado como borrador", "id": nuevo_inmueble.id, "estado": nuevo_inmueble.estado}
    except HTTPException as http_err:
        # Mantenemos los errores controlados (como el del agente inexistente)
        raise http_err
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")

@app.get("/api/inmuebles/resumen")
async def obtener_inmuebles_resumen(db: Session = Depends(get_db)):
    cached_summary = get_public_catalog_cache()
    if cached_summary is not None:
        return cached_summary

    inmuebles_db = db.query(InmuebleDB).options(selectinload(InmuebleDB.agente), selectinload(InmuebleDB.ofertas).selectinload(OfertaDB.agente)).filter(InmuebleDB.estado == "Publicado").all()
    summary = [serializar_inmueble_resumen(inm) for inm in inmuebles_db]
    set_public_catalog_cache(summary)
    return summary


@app.get("/api/inmuebles")
async def obtener_inmuebles(db: Session = Depends(get_db)):
    inmuebles_db = db.query(InmuebleDB).options(selectinload(InmuebleDB.agente), selectinload(InmuebleDB.ofertas).selectinload(OfertaDB.agente)).filter(InmuebleDB.estado == "Publicado").all()
    return [serializar_inmueble(inm) for inm in inmuebles_db]


@app.get("/api/inmuebles/admin")
async def obtener_inmuebles_admin(db: Session = Depends(get_db), current_profile: dict = Depends(require_admin)):
    inmuebles_db = db.query(InmuebleDB).options(selectinload(InmuebleDB.agente), selectinload(InmuebleDB.ofertas).selectinload(OfertaDB.agente)).all()
    return [serializar_inmueble(inm, include_search_metadata=True) for inm in inmuebles_db]


@app.post("/api/admin/inmuebles/{inmueble_id}/regenerar-search-text", status_code=200)
async def regenerar_search_text_inmueble(
    inmueble_id: int,
    db: Session = Depends(get_db),
    current_profile: dict = Depends(require_admin),
):
    inmueble_db = db.query(InmuebleDB).filter(InmuebleDB.id == inmueble_id).first()
    if not inmueble_db:
        raise HTTPException(status_code=404, detail="Inmueble no encontrado")

    inmueble_db.search_text = build_property_search_text(inmueble_db)
    if EMBEDDINGS_ENABLED and cliente_ia is not None:
        update_property_embedding(inmueble_db, cliente_ia, EMBEDDING_MODEL)
    invalidate_search_cache(db)
    db.commit()
    db.refresh(inmueble_db)
    return {"status": "success", "inmueble": serializar_inmueble(inmueble_db, include_search_metadata=True)}


@app.get("/api/inmuebles/{inmueble_id}")
async def obtener_inmueble_detalle(inmueble_id: int, db: Session = Depends(get_db)):
    inmueble_db = db.query(InmuebleDB).options(selectinload(InmuebleDB.agente), selectinload(InmuebleDB.ofertas).selectinload(OfertaDB.agente)).filter(InmuebleDB.id == inmueble_id, InmuebleDB.estado == "Publicado").first()
    if not inmueble_db:
        raise HTTPException(status_code=404, detail="Inmueble no encontrado")
    return serializar_inmueble(inmueble_db)


@app.put("/api/inmuebles/{inmueble_id}", status_code=200)
async def actualizar_inmueble(
    inmueble_id: int,
    inmueble: InmuebleCreate,
    db: Session = Depends(get_db),
    current_profile: dict = Depends(require_admin),
):
    try:
        inmueble_db = db.query(InmuebleDB).filter(InmuebleDB.id == inmueble_id).first()
        if not inmueble_db:
            raise HTTPException(status_code=404, detail="Inmueble no encontrado")

        ofertas = normalizar_ofertas(inmueble)
        ofertas_validadas = validar_agentes_de_ofertas(ofertas, db, current_profile)
        oferta_principal, agente_principal = ofertas_validadas[0]
        estado_inmueble = normalizar_estado_inmueble(inmueble.estado)

        inmueble_db.titulo = inmueble.titulo
        inmueble_db.precio_usd = oferta_principal.precio
        inmueble_db.moneda = oferta_principal.moneda
        inmueble_db.habitaciones = inmueble.habitaciones
        inmueble_db.banos = inmueble.banos or 1
        inmueble_db.ciudad = inmueble.ciudad
        inmueble_db.lat = inmueble.lat
        inmueble_db.lng = inmueble.lng
        inmueble_db.operacion = oferta_principal.operacion
        inmueble_db.tipo_inmueble = inmueble.tipo_inmueble
        inmueble_db.estado = estado_inmueble
        inmueble_db.descripcion = inmueble.descripcion
        inmueble_db.amenidades = inmueble.amenidades
        inmueble_db.keywords = inmueble.keywords
        inmueble_db.imagenes = inmueble.imagenes
        inmueble_db.agente_id = agente_principal.id
        aplicar_campos_busqueda_inmueble(inmueble_db, inmueble)
        update_property_embedding(inmueble_db, cliente_ia if EMBEDDINGS_ENABLED else None, EMBEDDING_MODEL)

        inmueble_db.ofertas.clear()
        db.flush()
        for oferta, agente in ofertas_validadas:
            inmueble_db.ofertas.append(OfertaDB(
                operacion=oferta.operacion,
                precio=oferta.precio,
                moneda=oferta.moneda or "$ (USD)",
                estado=oferta.estado or "Publicado",
                agente_id=agente.id,
            ))

        invalidate_search_cache(db)
        db.commit()
        invalidate_public_catalog_cache()
        db.refresh(inmueble_db)
        return {"status": "success", "id": inmueble_db.id}
    except HTTPException as http_err:
        db.rollback()
        raise http_err
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
@app.delete("/api/inmuebles/{inmueble_id}", status_code=200)
async def eliminar_inmueble(inmueble_id: int, db: Session = Depends(get_db), current_profile: dict = Depends(require_admin)):
    try:
        inmueble = db.query(InmuebleDB).filter(InmuebleDB.id == inmueble_id).first()
        if not inmueble: raise HTTPException(status_code=404, detail="No encontrado")
        db.delete(inmueble)
        invalidate_search_cache(db)
        db.commit()
        invalidate_public_catalog_cache()
        return {"status": "success"}
    except HTTPException as http_err:
        db.rollback()
        raise http_err
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- 6. ENDPOINTS DE AGENTES CRUD ---
@app.post("/api/agentes", status_code=201)
async def crear_agente(agente: AgenteSchema, db: Session = Depends(get_db), current_profile: dict = Depends(require_advisor_or_admin)):
    try:
        email_normalizado = normalize_email(agente.email) or None
        current_role = current_profile["role"]
        if current_role != "admin" and email_normalizado != current_profile["email"]:
            raise HTTPException(status_code=403, detail="Solo puedes activar o editar tu propio perfil de asesor.")
        agente_existente = None
        if email_normalizado:
            agente_existente = db.query(AgenteDB).filter(AgenteDB.email == email_normalizado).first()

        if agente_existente:
            agente_existente.nombre = agente.nombre
            agente_existente.whatsapp = agente.whatsapp
            if email_normalizado:
                upsert_authorized_user(db, email_normalizado, "advisor")
            db.commit()
            db.refresh(agente_existente)
            return {
                "status": "success",
                "id": agente_existente.id,
                "nombre": agente_existente.nombre,
                "email": agente_existente.email,
            }

        nuevo_agente = AgenteDB(nombre=agente.nombre, whatsapp=agente.whatsapp, email=email_normalizado)
        db.add(nuevo_agente)
        if email_normalizado:
            upsert_authorized_user(db, email_normalizado, "advisor")
        db.commit()
        invalidate_public_catalog_cache()
        db.refresh(nuevo_agente)
        return {"status": "success", "id": nuevo_agente.id, "nombre": nuevo_agente.nombre, "email": nuevo_agente.email}
    except HTTPException as http_err:
        db.rollback()
        raise http_err
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/api/agentes")
async def obtener_agentes(db: Session = Depends(get_db), current_profile: dict = Depends(require_advisor_or_admin)):
    query = db.query(AgenteDB)
    if current_profile["role"] == "advisor":
        query = query.filter(AgenteDB.email == current_profile["email"])
    agentes_db = query.all()
    return [{"id": str(a.id), "name": a.nombre, "whatsapp": a.whatsapp, "email": a.email} for a in agentes_db]

@app.get("/api/agentes/by-email/{email}")
async def obtener_agente_por_email(email: str, db: Session = Depends(get_db), current_profile: dict = Depends(require_advisor_or_admin)):
    email_normalizado = normalize_email(email)
    if current_profile["role"] != "admin" and email_normalizado != current_profile["email"]:
        raise HTTPException(status_code=403, detail="No puedes consultar otro perfil de asesor.")
    agente = db.query(AgenteDB).filter(AgenteDB.email == email_normalizado).first()
    if not agente:
        raise HTTPException(status_code=404, detail="Asesor no registrado")
    return {"id": str(agente.id), "name": agente.nombre, "whatsapp": agente.whatsapp, "email": agente.email}

@app.put("/api/agentes/{agente_id}", status_code=200)
async def actualizar_agente(agente_id: int, agente: AgenteSchema, db: Session = Depends(get_db), current_profile: dict = Depends(require_admin)):
    try:
        agente_db = db.query(AgenteDB).filter(AgenteDB.id == agente_id).first()
        if not agente_db:
            raise HTTPException(status_code=404, detail="Asesor no encontrado")

        email_normalizado = normalize_email(agente.email) or None
        if email_normalizado:
            agente_con_email = db.query(AgenteDB).filter(AgenteDB.email == email_normalizado, AgenteDB.id != agente_id).first()
            if agente_con_email:
                raise HTTPException(status_code=400, detail="Ese email ya esta asignado a otro asesor.")

        agente_db.nombre = agente.nombre
        agente_db.whatsapp = agente.whatsapp
        agente_db.email = email_normalizado
        if email_normalizado:
            upsert_authorized_user(db, email_normalizado, "advisor")

        db.commit()
        invalidate_public_catalog_cache()
        db.refresh(agente_db)
        return {"status": "success", "id": agente_db.id, "nombre": agente_db.nombre, "email": agente_db.email}
    except HTTPException as http_err:
        db.rollback()
        raise http_err
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
@app.delete("/api/agentes/{agente_id}", status_code=200)
async def eliminar_agente(agente_id: int, db: Session = Depends(get_db), current_profile: dict = Depends(require_admin)):
    try:
        agente = db.query(AgenteDB).filter(AgenteDB.id == agente_id).first()
        if not agente:
            raise HTTPException(status_code=404, detail="No encontrado")
        db.delete(agente)
        db.commit()
        invalidate_public_catalog_cache()
        return {"status": "success"}
    except HTTPException as http_err:
        db.rollback()
        raise http_err
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
