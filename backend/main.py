# backend/main.py
import os
import time
import json
import hashlib
import requests
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from config import CORS_ORIGINS
from database import SessionLocal, init_db
from auth_security import get_current_profile, get_role_for_email, normalize_email, require_admin, require_advisor_or_admin, upsert_authorized_user
from models import AgenteDB, InmuebleDB
from pydantic import BaseModel
from typing import List, Optional

# --- LIBRERÃA OFICIAL Y ACTUALIZADA ---
from google import genai

app = FastAPI(title="Motor Inmobiliario Bolivia - O.P.A.L.O.")

# --- CONFIGURACIÃ“N DE IA (ESCALABLE Y CON BYPASS DE RED) ---
# ðŸ”´ INYECTA TU LLAVE AQUÃ
LLAVE_REAL = os.getenv("GEMINI_API_KEY", "").strip()
cliente_ia = genai.Client(api_key=LLAVE_REAL, http_options={'api_version': 'v1'}) if LLAVE_REAL else None
MODELO_ACTIVO = 'gemini-2.5-flash'

# --- POLÃTICAS DE SEGURIDAD CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. GESTIÃ“N DE ARCHIVOS MULTIMEDIA ---
CARPETA_UPLOADS = "./uploads"
if not os.path.exists(CARPETA_UPLOADS):
    os.makedirs(CARPETA_UPLOADS)
app.mount("/uploads", StaticFiles(directory=CARPETA_UPLOADS), name="uploads")

# --- 2. MODELOS FISICOS RELACIONALES (SQLAlchemy) ---
init_db()

# 2. EL MOLDE AHORA ESPERA TEXTO
class InmuebleCreate(BaseModel):
    titulo: str
    precio_usd: float
    moneda: Optional[str] = "$ (USD)"
    habitaciones: int
    banos: Optional[int] = 1
    ciudad: str
    lat: float
    lng: float
    operacion: str
    tipo_inmueble: str
    descripcion: str
    agente_id: int
    imagenes: str = ""    # ðŸ”‘ Ahora es texto
    amenidades: str = ""  # ðŸ”‘ Ahora es texto

class AgenteSchema(BaseModel):
    nombre: str
    whatsapp: str
    email: Optional[str] = None

class PeticionChat(BaseModel):
    mensaje: str
    candidate_ids: Optional[List[int]] = None

# --- INYECCIÃ“N DE DEPENDENCIAS ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/api/auth/me")
async def obtener_perfil_actual(profile: dict = Depends(get_current_profile)):
    return profile

# --- 4. ENDPOINT NEURONAL (O.P.A.L.O.) ---
@app.post("/api/chat", status_code=200)
async def chat_inteligente(peticion: PeticionChat, db: Session = Depends(get_db)):
    try:
        # Extraccion y normalizacion del catalogo en tiempo real.
        query = db.query(InmuebleDB)
        if peticion.candidate_ids is not None:
            query = query.filter(InmuebleDB.id.in_(peticion.candidate_ids))
        inmuebles = query.all()
        
        catalogo = "CATALOGO DE INMUEBLES DISPONIBLES PARA ESTE PASO (Motor Inmobiliario Bolivia):\n"
        for inm in inmuebles:
            catalogo += f"- ID:{inm.id} | Ref #{inm.id} | {inm.operacion} | {inm.tipo_inmueble} en {inm.ciudad}. {inm.habitaciones} habitaciones. {getattr(inm, 'banos', 1) or 1} banos. Precio: {inm.precio_usd} {inm.moneda}. Descripcion: {inm.descripcion}.\n"
            
        if not inmuebles:
            catalogo = "Actualmente no hay inmuebles disponibles dentro de los filtros previos."

        # Prompt de IngenierÃ­a Estricta con Inteligencia Financiera Local
        prompt_maestro = f"""
        Actua como un motor de consultas semantico de alta precision para el mercado inmobiliario en Bolivia.
        Tu objetivo es leer el catalogo y devolver los IDs que cumplen estrictamente con la peticion del usuario.
        Si el usuario pregunta por una referencia como "#45", "inmueble 45" o "ID 45", debes devolver ese ID si existe en el catalogo.

        CATALOGO DISPONIBLE:
        {catalogo}

        PETICION DEL USUARIO: "{peticion.mensaje}"

        CONTEXTO ECONOMICO (Bolivia):
        - Revisa si cada precio esta en "$ (USD)" o en "Bs".
        - Si el usuario busca en Bolivianos y la propiedad esta en dolares, usa 1 USD = 6.96 Bs para evaluar.
        - Si el usuario busca en dolares y la propiedad esta en Bolivianos, haz la conversion inversa.

        REGLAS DE FILTRADO:
        1. Filtra por operacion, tipo de inmueble, zona, habitaciones, banos y precio cuando el usuario lo mencione.
        2. Si el usuario pide un limite de precio, la propiedad debe cumplir matematicamente tras la conversion de moneda.

        FORMATO DE RESPUESTA:
        Devuelve unica y exclusivamente un arreglo JSON con numeros de ID, por ejemplo [1, 4].
        Si ninguna propiedad coincide, devuelve [].
        """

        if cliente_ia is None:
            raise HTTPException(status_code=500, detail="Falta GEMINI_API_KEY en el backend.")

        # Invocacion del modelo
        respuesta = cliente_ia.models.generate_content(
            model=MODELO_ACTIVO,
            contents=prompt_maestro
        )
        
        # --- BLINDAJE DE PRODUCCIÃ“N ---
        texto_limpio = respuesta.text.replace('```json', '').replace('```', '').strip()
        
        try:
            # Intentamos leer como JSON estricto
            ids_filtrados = json.loads(texto_limpio)
            # Verificamos que realmente sea una lista
            if not isinstance(ids_filtrados, list):
                ids_filtrados = []
        except json.JSONDecodeError:
            # Si la IA desobedece y devuelve texto, asumimos 0 coincidencias y no rompemos el servidor
            print(f"âš ï¸ Advertencia: La IA no devolviÃ³ JSON puro. Texto recibido: {texto_limpio}")
            ids_filtrados = []
        
        return {"status": "success", "ids": ids_filtrados}
        
    except Exception as e:
        print(f"ðŸ”¥ ERROR INTERNO DE IA: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Fallo en el motor de filtrado: {str(e)}")

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
            raise HTTPException(status_code=502, detail=f"Cloudinary no respondió: {str(exc)}")

        if response.status_code >= 400:
            raise HTTPException(status_code=502, detail=f"Cloudinary rechazó {file.filename}: {response.text}")

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
        # 1. Verificamos que el asesor exista (Mantenemos tu regla de negocio)
        existe_agente = db.query(AgenteDB).filter(AgenteDB.id == inmueble.agente_id).first()
        if not existe_agente:
            raise HTTPException(status_code=400, detail="El asesor designado no existe.")
        if current_profile["role"] == "advisor" and normalize_email(existe_agente.email) != current_profile["email"]:
            raise HTTPException(status_code=403, detail="Solo puedes publicar inmuebles bajo tu propio perfil de asesor.")

        # 2. Guardamos las estructuras JSON directamente en la Base de Datos
        nuevo_inmueble = InmuebleDB(
            titulo=inmueble.titulo, 
            precio_usd=inmueble.precio_usd, 
            moneda=inmueble.moneda, 
            habitaciones=inmueble.habitaciones,
            banos=inmueble.banos or 1,
            ciudad=inmueble.ciudad, 
            lat=inmueble.lat, 
            lng=inmueble.lng, 
            operacion=inmueble.operacion,
            tipo_inmueble=inmueble.tipo_inmueble, 
            descripcion=inmueble.descripcion,
            # Guardamos los arrays directamente en las columnas JSON correspondientes
            amenidades=inmueble.amenidades, 
            imagenes=inmueble.imagenes, 
            agente_id=inmueble.agente_id
        )
        
        db.add(nuevo_inmueble)
        db.commit()
        db.refresh(nuevo_inmueble)
        
        return {"status": "success", "message": "Inmueble publicado en la nube con Ã©xito", "id": nuevo_inmueble.id}
        
    except HTTPException as http_err:
        # Mantenemos los errores controlados (como el del agente inexistente)
        raise http_err
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")

@app.get("/api/inmuebles")
async def obtener_inmuebles(db: Session = Depends(get_db)):
    inmuebles_db = db.query(InmuebleDB).all()
    resultado = []
    
    for inm in inmuebles_db:
        inm_dict = inm.__dict__.copy()
        inm_dict.pop('_sa_instance_state', None)
        
        # ðŸ”‘ SEPARAMOS POR COMAS PARA QUE REACT RECIBA LA LISTA PERFECTA
        texto_imagenes = str(inm.imagenes) if inm.imagenes else ""
        inm_dict["images"] = [url.strip() for url in texto_imagenes.split(",") if url.strip()]
        
        texto_amenidades = str(inm.amenidades) if inm.amenidades else ""
        inm_dict["amenidades"] = [am.strip() for am in texto_amenidades.split(",") if am.strip()]
        
        inm_dict["banos"] = getattr(inm, "banos", 1) or 1
        inm_dict["agente_id"] = str(inm.agente_id) if inm.agente_id else "0"
        resultado.append(inm_dict)
        
    return resultado

@app.delete("/api/inmuebles/{inmueble_id}", status_code=200)
async def eliminar_inmueble(inmueble_id: int, db: Session = Depends(get_db), current_profile: dict = Depends(require_admin)):
    try:
        inmueble = db.query(InmuebleDB).filter(InmuebleDB.id == inmueble_id).first()
        if not inmueble: raise HTTPException(status_code=404, detail="No encontrado")
        db.delete(inmueble)
        db.commit()
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
@app.delete("/api/agentes/{agente_id}", status_code=200)
async def eliminar_agente(agente_id: int, db: Session = Depends(get_db), current_profile: dict = Depends(require_admin)):
    try:
        agente = db.query(AgenteDB).filter(AgenteDB.id == agente_id).first()
        if not agente:
            raise HTTPException(status_code=404, detail="No encontrado")
        db.delete(agente)
        db.commit()
        return {"status": "success"}
    except HTTPException as http_err:
        db.rollback()
        raise http_err
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
