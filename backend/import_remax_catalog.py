"""
Script de importación y carga masiva de inmuebles para REMAX Patrimonio.
Diseñado para que bots automatizados (como Grok bot) o scripts puedan cargar
propiedades directamente en la base de datos de NIA.

Uso:
    python backend/import_remax_catalog.py ruta/a/propiedades.json
"""

import argparse
import json
import os
import sys
from typing import Any, Dict, List, Optional

# Asegurar path de backend
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from database import SessionLocal
from models import InmuebleDB, OfertaDB, AgenteDB, ComplejoDB
from catalog import find_or_create_oficina, find_or_create_captador, find_or_create_complejo
from nia_search import (
    build_property_search_text,
    update_property_embedding,
    invalidate_search_cache,
    EMBEDDINGS_ENABLED,
    EMBEDDING_MODEL,
)

try:
    from google import genai
    api_key = os.getenv("GEMINI_API_KEY")
    cliente_ia = genai.Client(api_key=api_key) if api_key else None
except Exception:
    cliente_ia = None

# Coordenadas por defecto para Santa Cruz de la Sierra y sus zonas
ZONE_COORDINATES = {
    "equipetrol": (-17.766, -63.195),
    "norte": (-17.745, -63.170),
    "banzer": (-17.745, -63.170),
    "urubo": (-17.760, -63.220),
    "urubó": (-17.760, -63.220),
    "centro": (-17.783, -63.182),
    "las palmas": (-17.805, -63.200),
    "sirari": (-17.762, -63.190),
    "canal isuto": (-17.760, -63.185),
    "sur": (-17.820, -63.185),
    "san carlos": (-17.335, -63.725),
    "ichilo": (-17.335, -63.725),
    "santa cruz": (-17.7833, -63.1821),
    "santa cruz de la sierra": (-17.7833, -63.1821),
}

DEFAULT_CITY = "Santa Cruz de la Sierra"
DEFAULT_LAT = -17.7833
DEFAULT_LNG = -63.1821


def resolve_coordinates(zona: Optional[str], ciudad: Optional[str], lat: Optional[float], lng: Optional[float]) -> tuple[float, float]:
    if lat and lng and (lat != 0.0 or lng != 0.0):
        return float(lat), float(lng)
    
    if zona:
        z_norm = zona.strip().lower()
        for key, coords in ZONE_COORDINATES.items():
            if key in z_norm:
                return coords
                
    if ciudad:
        c_norm = ciudad.strip().lower()
        for key, coords in ZONE_COORDINATES.items():
            if key in c_norm:
                return coords
                
    return DEFAULT_LAT, DEFAULT_LNG


def import_property(db, item: Dict[str, Any], default_office_id: int) -> InmuebleDB:
    titulo = item.get("titulo") or "Inmueble sin título"
    tipo = item.get("tipo_inmueble") or item.get("tipo") or "Departamento"
    operacion = item.get("operacion") or "Venta"
    ciudad = item.get("ciudad") or DEFAULT_CITY
    zona = item.get("zona") or ciudad
    lat, lng = resolve_coordinates(zona, ciudad, item.get("lat"), item.get("lng"))
    
    # Manejo de Captador (Drive agent) vs colocador/contacto (Alejandro Coca)
    # Never invent WhatsApp: do NOT default phone when only a captador name is known
    # (defaulting to Alejandro's number would merge distinct captadores into him).
    captador_nombre = item.get("captador_nombre") or item.get("agente_nombre")
    captador_whatsapp = item.get("captador_whatsapp") or item.get("agente_whatsapp")
    if not captador_nombre and not captador_whatsapp and not item.get("agente_id") and not item.get("captador_id"):
        captador_whatsapp = "59157015854"  # fallback only when no captador identity at all

    captador_obj = None
    if item.get("captador_id"):
        captador_obj = db.query(AgenteDB).filter(AgenteDB.id == int(item["captador_id"])).first()
    elif captador_nombre or captador_whatsapp:
        captador_obj = find_or_create_captador(db, captador_nombre, captador_whatsapp)
        if captador_obj and not captador_obj.oficina_id:
            captador_obj.oficina_id = default_office_id
    elif item.get("agente_id"):
        captador_obj = db.query(AgenteDB).filter(AgenteDB.id == int(item["agente_id"])).first()

    # Public contact / colocador: Alejandro Coca (override via colocador_id / colocador_whatsapp)
    colocador_id = item.get("colocador_id")
    colocador_obj = None
    if colocador_id:
        colocador_obj = db.query(AgenteDB).filter(AgenteDB.id == int(colocador_id)).first()
    else:
        colocador_wa = item.get("colocador_whatsapp") or "59157015854"
        colocador_nombre = item.get("colocador_nombre") or "Alejandro Coca"
        colocador_obj = find_or_create_captador(db, colocador_nombre, colocador_wa)
        if colocador_obj and not colocador_obj.oficina_id:
            colocador_obj.oficina_id = default_office_id

    # Legacy alias used below for inmueble.agente_id / oferta fields
    agente_obj = captador_obj

    # Complejo / Condominio
    complejo_nombre = item.get("complejo_nombre")
    complejo_id = item.get("complejo_id")
    complejo_obj = None
    if complejo_nombre or complejo_id:
        complejo_obj = find_or_create_complejo(
            db,
            complejo_id=complejo_id,
            nombre=complejo_nombre,
            ciudad=ciudad,
            zona=zona,
            direccion=item.get("direccion"),
            lat=lat,
            lng=lng,
        )

    # Imágenes
    imgs = item.get("imagenes") or item.get("images") or []
    if isinstance(imgs, list):
        imagenes_str = ", ".join(str(u).strip() for u in imgs if str(u).strip())
    else:
        imagenes_str = str(imgs)

    # Amenidades
    amen = item.get("amenidades") or []
    if isinstance(amen, list):
        amenidades_str = ", ".join(str(a).strip() for a in amen if str(a).strip())
    else:
        amenidades_str = str(amen)

    # Keywords
    kw = item.get("keywords") or []
    if isinstance(kw, list):
        keywords_str = ", ".join(str(k).strip() for k in kw if str(k).strip())
    else:
        keywords_str = str(kw)

    # Datos específicos JSON
    datos_especificos = item.get("datos_especificos_json") or item.get("datos_especificos")
    if isinstance(datos_especificos, (dict, list)):
        datos_especificos_str = json.dumps(datos_especificos, ensure_ascii=False)
    else:
        datos_especificos_str = str(datos_especificos) if datos_especificos else None

    precio_usd = float(item.get("precio_usd") or item.get("precio") or 0.0)
    moneda = item.get("moneda") or ("Bs" if operacion == "Alquilar" and precio_usd < 20000 else "$ (USD)")

    inmueble = db.query(InmuebleDB).filter(InmuebleDB.titulo == titulo).first()
    if inmueble:
        inmueble.precio_usd = precio_usd
        inmueble.moneda = moneda
        inmueble.habitaciones = int(item.get("habitaciones") or item.get("dormitorios") or 0)
        inmueble.banos = int(item.get("banos") or item.get("baños") or 1)
        inmueble.ciudad = ciudad
        inmueble.zona = zona
        inmueble.direccion = item.get("direccion")
        inmueble.lat = lat
        inmueble.lng = lng
        inmueble.operacion = operacion
        inmueble.tipo_inmueble = tipo
        inmueble.estado = item.get("estado") or "Publicado"
        inmueble.ocupacion = item.get("ocupacion") or "Disponible"
        inmueble.superficie_m2 = float(item.get("superficie_m2") or item.get("superficie") or 0.0) or None
        inmueble.piso = str(item.get("piso")) if item.get("piso") is not None else None
        inmueble.amoblado = bool(item.get("amoblado", False))
        inmueble.acepta_mascotas = bool(item.get("acepta_mascotas", False))
        inmueble.parqueos = int(item.get("parqueos") or 0)
        inmueble.baulera = bool(item.get("baulera", False))
        inmueble.fecha_entrega = item.get("fecha_entrega")
        inmueble.avance_obra = int(item.get("avance_obra")) if item.get("avance_obra") is not None else None
        inmueble.fase_obra = item.get("fase_obra")
        inmueble.subtipo_comercial = item.get("subtipo_comercial")
        inmueble.dimensiones = item.get("dimensiones")
        inmueble.servicios_basicos = item.get("servicios_basicos")
        inmueble.datos_especificos_json = datos_especificos_str
        inmueble.descripcion = item.get("descripcion") or ""
        inmueble.imagenes = imagenes_str
        inmueble.amenidades = amenidades_str
        inmueble.keywords = keywords_str
        inmueble.agente_id = (colocador_obj.id if colocador_obj else (agente_obj.id if agente_obj else None))
        inmueble.complejo_id = complejo_obj.id if complejo_obj else None
        db.query(OfertaDB).filter(OfertaDB.inmueble_id == inmueble.id).delete()
    else:
        inmueble = InmuebleDB(
            titulo=titulo,
            precio_usd=precio_usd,
            moneda=moneda,
            habitaciones=int(item.get("habitaciones") or item.get("dormitorios") or 0),
            banos=int(item.get("banos") or item.get("baños") or 1),
            ciudad=ciudad,
            zona=zona,
            direccion=item.get("direccion"),
            lat=lat,
            lng=lng,
            operacion=operacion,
            tipo_inmueble=tipo,
            estado=item.get("estado") or "Publicado",
            ocupacion=item.get("ocupacion") or "Disponible",
            superficie_m2=float(item.get("superficie_m2") or item.get("superficie") or 0.0) or None,
            piso=str(item.get("piso")) if item.get("piso") is not None else None,
            amoblado=bool(item.get("amoblado", False)),
            acepta_mascotas=bool(item.get("acepta_mascotas", False)),
            parqueos=int(item.get("parqueos") or 0),
            baulera=bool(item.get("baulera", False)),
            fecha_entrega=item.get("fecha_entrega"),
            avance_obra=int(item.get("avance_obra")) if item.get("avance_obra") is not None else None,
            fase_obra=item.get("fase_obra"),
            subtipo_comercial=item.get("subtipo_comercial"),
            dimensiones=item.get("dimensiones"),
            servicios_basicos=item.get("servicios_basicos"),
            datos_especificos_json=datos_especificos_str,
            descripcion=item.get("descripcion") or "",
            imagenes=imagenes_str,
            amenidades=amenidades_str,
            keywords=keywords_str,
            agente_id=(colocador_obj.id if colocador_obj else (agente_obj.id if agente_obj else None)),
            complejo_id=complejo_obj.id if complejo_obj else None,
        )
        db.add(inmueble)

    inmueble.search_text = build_property_search_text(inmueble)
    if EMBEDDINGS_ENABLED and cliente_ia:
        update_property_embedding(inmueble, cliente_ia, EMBEDDING_MODEL)

    db.flush()

    # Manejo de Ofertas
    ofertas_data = item.get("ofertas")
    if ofertas_data and isinstance(ofertas_data, list):
        for o in ofertas_data:
            o_op = o.get("operacion") or operacion
            o_precio = float(o.get("precio") or precio_usd)
            o_moneda = o.get("moneda") or moneda
            db.add(OfertaDB(
                inmueble_id=inmueble.id,
                operacion=o_op,
                precio=o_precio,
                moneda=o_moneda,
                estado=o.get("estado") or "Publicado",
                agente_id=agente_obj.id if agente_obj else None,
                captador_id=agente_obj.id if agente_obj else None,
                colocador_id=colocador_obj.id if colocador_obj else None,
                incluye_expensas=bool(o.get("incluye_expensas", False)),
                monto_expensas=float(o["monto_expensas"]) if o.get("monto_expensas") else None,
                expensas_moneda=o.get("expensas_moneda") or "Bs",
            ))
    else:
        # Oferta primaria por defecto
        if operacion == "Alquiler y Venta":
            # Crear ambas ofertas
            db.add(OfertaDB(
                inmueble_id=inmueble.id,
                operacion="Venta",
                precio=float(item.get("precio_venta") or precio_usd),
                moneda=item.get("moneda_venta") or "$ (USD)",
                estado="Publicado",
                agente_id=agente_obj.id if agente_obj else None,
                captador_id=agente_obj.id if agente_obj else None,
                colocador_id=colocador_obj.id if colocador_obj else None,
            ))
            db.add(OfertaDB(
                inmueble_id=inmueble.id,
                operacion="Alquiler",
                precio=float(item.get("precio_alquiler") or item.get("precio_renta") or (precio_usd / 200)),
                moneda=item.get("moneda_alquiler") or "Bs",
                estado="Publicado",
                agente_id=agente_obj.id if agente_obj else None,
                captador_id=agente_obj.id if agente_obj else None,
                incluye_expensas=bool(item.get("incluye_expensas", False)),
                monto_expensas=float(item["monto_expensas"]) if item.get("monto_expensas") else None,
                expensas_moneda=item.get("expensas_moneda") or "Bs",
            ))
        else:
            db.add(OfertaDB(
                inmueble_id=inmueble.id,
                operacion=operacion,
                precio=precio_usd,
                moneda=moneda,
                estado="Publicado",
                agente_id=agente_obj.id if agente_obj else None,
                captador_id=agente_obj.id if agente_obj else None,
                colocador_id=colocador_obj.id if colocador_obj else None,
                incluye_expensas=bool(item.get("incluye_expensas", False)),
                monto_expensas=float(item["monto_expensas"]) if item.get("monto_expensas") else None,
                expensas_moneda=item.get("expensas_moneda") or "Bs",
            ))

    return inmueble


def run_batch_import(data: List[Dict[str, Any]]) -> List[int]:
    with SessionLocal() as db:
        oficina = find_or_create_oficina(db, "REMAX Patrimonio", "Santa Cruz")
        imported_ids = []
        for index, item in enumerate(data, 1):
            try:
                inm = import_property(db, item, oficina.id)
                imported_ids.append(inm.id)
                print(f"[{index}/{len(data)}] OK: #{inm.id} - {inm.titulo} ({inm.tipo_inmueble} en {inm.zona})")
            except Exception as e:
                print(f"[{index}/{len(data)}] ERROR importando '{item.get('titulo')}': {e}", file=sys.stderr)
        
        invalidate_search_cache(db)
        db.commit()
        print(f"\nImportación finalizada. Total importados con éxito: {len(imported_ids)}")
        return imported_ids


def main():
    parser = argparse.ArgumentParser(description="Importador masivo para REMAX Patrimonio")
    parser.add_argument("file", help="Ruta al archivo JSON con propiedades (o '-' para stdin)")
    args = parser.parse_args()

    if args.file == "-":
        content = sys.stdin.read()
    else:
        with open(args.file, "r", encoding="utf-8") as f:
            content = f.read()

    data = json.loads(content)
    if isinstance(data, dict):
        data = [data]

    if not isinstance(data, list):
        print("El archivo debe contener un array JSON de propiedades.", file=sys.stderr)
        sys.exit(1)

    run_batch_import(data)


if __name__ == "__main__":
    main()
