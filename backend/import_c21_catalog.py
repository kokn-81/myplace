"""
Script de importación y carga masiva de departamentos para Century 21 Bolivia (Santa Cruz).
Aprovecha el endpoint nativo JSON (?json=true) de c21.com.bo para extraer el inventario
completo de departamentos (alquiler y venta) con coordenadas exactas, fotos CDN y datos del captador.

Uso:
    backend\\venv\\Scripts\\python backend/import_c21_catalog.py --limit 200
    backend\\venv\\Scripts\\python backend/import_c21_catalog.py --operacion all
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.request
from typing import Any, Dict, List, Optional, Tuple

if sys.stdout:
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass
if sys.stderr:
    try:
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from sqlalchemy.orm import selectinload
from database import SessionLocal
from models import InmuebleDB, OfertaDB, AgenteDB, ComplejoDB, OficinaDB
from catalog import find_or_create_oficina, find_or_create_captador, find_or_create_complejo, es_publicable
from nia_search import (
    build_property_search_text,
    update_property_embedding,
    invalidate_search_cache,
    EMBEDDING_MODEL,
)

EMBEDDINGS_ENABLED = False
cliente_ia = None

# Bounding box metropolitano de Santa Cruz de la Sierra
LAT_MIN, LAT_MAX = -18.15, -17.40
LNG_MIN, LNG_MAX = -63.45, -62.90

DEFAULT_CITY = "Santa Cruz de la Sierra"
DEFAULT_LAT = -17.7833
DEFAULT_LNG = -63.1821

# Coordenadas de referencia para Santa Cruz
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
    "remedios": (-17.770, -63.180),
    "santa cruz": (-17.7833, -63.1821),
}


def is_in_santa_cruz(lat: float, lng: float) -> bool:
    return LAT_MIN <= lat <= LAT_MAX and LNG_MIN <= lng <= LNG_MAX


def resolve_coordinates(zona: Optional[str], lat_raw: Any, lng_raw: Any) -> Tuple[float, float]:
    try:
        lat = float(lat_raw)
        lng = float(lng_raw)
        if is_in_santa_cruz(lat, lng):
            return lat, lng
    except (ValueError, TypeError):
        pass

    if zona:
        z_norm = zona.strip().lower()
        for key, coords in ZONE_COORDINATES.items():
            if key in z_norm:
                return coords

    return DEFAULT_LAT, DEFAULT_LNG


def clean_phone_number(raw_phone: Any) -> Optional[str]:
    if not raw_phone:
        return None
    cleaned = re.sub(r"[^\d]", "", str(raw_phone))
    if not cleaned:
        return None
    if cleaned.startswith("591") and len(cleaned) >= 10:
        return cleaned
    if len(cleaned) == 8:
        return f"591{cleaned}"
    return cleaned


def parse_bedrooms(raw_recamaras: Any, title: str, desc: str = "") -> int:
    if raw_recamaras is not None:
        try:
            val = int(raw_recamaras)
            if val > 0:
                return val
        except (ValueError, TypeError):
            pass

    text = f"{title} {desc}".lower()
    if any(k in text for k in ["monoambiente", "mono ambiente", "studio", "estudio", "garzonier"]):
        return 1

    m = re.search(r"(\d+)\s*(?:dormitorio|dormitoro|dorm|habitaci[oó]n|hab|rec[aá]mara|suite)", text)
    if m:
        try:
            return max(1, int(m.group(1)))
        except ValueError:
            pass

    words = {"un ": 1, "uno ": 1, "dos ": 2, "tres ": 3, "cuatro ": 4, "cinco ": 5}
    for w, n in words.items():
        if f"{w}dorm" in text or f"{w}hab" in text or f"{w}rec" in text:
            return n

    return 2


def parse_bathrooms(raw_banos: Any, title: str, desc: str = "") -> int:
    if raw_banos is not None:
        try:
            val = int(raw_banos)
            if val > 0:
                return val
        except (ValueError, TypeError):
            pass

    text = f"{title} {desc}".lower()
    m = re.search(r"(\d+)\s*(?:baño|bano)", text)
    if m:
        try:
            return max(1, int(m.group(1)))
        except ValueError:
            pass

    return 1


def fetch_c21_page(operacion: str, page: int, bounds_str: str) -> Dict[str, Any]:
    """
    Consume la API nativa de Century 21 con el flag ?json=true
    """
    page_part = f"pagina_{page}/" if page > 1 else ""
    url = f"https://c21.com.bo/v/resultados/tipo_departamento-o-penthouse/operacion_{operacion}/{page_part}{bounds_str}?json=true"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "X-Requested-With": "XMLHttpRequest",
    }
    
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=25) as resp:
        content = resp.read().decode("utf-8", errors="ignore")
        return json.loads(content)


def import_c21_property(db, item: Dict[str, Any], default_office_id: int) -> Optional[InmuebleDB]:
    c21_id = item.get("id")
    if not c21_id:
        return None

    titulo = (item.get("encabezado") or "").strip()
    if not titulo or len(titulo) < 3:
        titulo = f"Departamento Century 21 #{c21_id}"

    # Ubicación y zona
    municipio = (item.get("municipio") or "").strip()
    colonia = (item.get("colonia") or "").strip()
    zona = colonia if colonia else (municipio if municipio else "Santa Cruz de la Sierra")
    lat, lng = resolve_coordinates(zona, item.get("lat"), item.get("lon"))

    # Operación y Precios
    raw_op = str(item.get("tipoOperacion") or "").strip().lower()
    operacion = "Alquilar" if ("renta" in raw_op or "alquiler" in raw_op) else "Venta"

    precio_raw = float(item.get("precio") or 0.0)
    moneda_raw = str(item.get("moneda") or "").upper().strip()
    precio_format = str(item.get("precioFormat") or "").upper()

    if "BOB" in moneda_raw or "BOB" in precio_format or "BS" in precio_format:
        precio_usd = round(precio_raw / 6.96, 2) if precio_raw > 0 else 0.0
        moneda_display = "Bs"
    else:
        precio_usd = precio_raw
        moneda_display = "$ (USD)"

    # Características físicas
    habitaciones = parse_bedrooms(item.get("recamaras"), titulo)
    banos = parse_bathrooms(item.get("banos"), titulo)
    
    superficie_m2 = None
    try:
        m2_val = item.get("m2C") or item.get("m2T")
        if m2_val:
            superficie_m2 = float(m2_val)
    except (ValueError, TypeError):
        pass

    parqueos = 0
    try:
        p_val = item.get("estacionamientos")
        if p_val:
            parqueos = int(p_val)
    except (ValueError, TypeError):
        pass

    # Tipo de inmueble
    tipo_propiedad = str(item.get("tipoPropiedad") or "").lower()
    tipo_inmueble = "Penthouse" if "penthouse" in tipo_propiedad else "Departamento"

    # Captador y Franquicia de Century 21
    oficina_nombre = (item.get("nombreAfiliado") or "").strip() or "Century 21 Bolivia"
    oficina_obj = find_or_create_oficina(db, oficina_nombre, DEFAULT_CITY)
    oficina_id = oficina_obj.id if oficina_obj else default_office_id

    captador_nombre = (item.get("asesorNombre") or "").strip() or "Asesor Century 21"
    captador_wa = clean_phone_number(item.get("whatsapp"))
    captador_tel = clean_phone_number(item.get("telefono"))

    captador_obj = find_or_create_captador(db, captador_nombre, captador_wa or captador_tel, oficina_id)
    if captador_obj and oficina_id:
        captador_obj.oficina_id = oficina_id

    # Colocador / Contacto público NIA (Alejandro Coca)
    colocador_wa = "59157015854"
    colocador_nombre = "Alejandro Coca"
    colocador_obj = find_or_create_captador(db, colocador_nombre, colocador_wa)
    if colocador_obj and not colocador_obj.oficina_id:
        colocador_obj.oficina_id = default_office_id

    # Imágenes desde CDN
    fotos_data = item.get("fotos") or {}
    img_list = fotos_data.get("propiedadThumbnail") or []
    if isinstance(img_list, list):
        imagenes_str = ", ".join(str(u).strip() for u in img_list if str(u).strip())
    else:
        imagenes_str = ""

    # Amenidades y palabras clave
    amenidades_list = []
    if item.get("alberca") or "piscina" in titulo.lower():
        amenidades_list.append("piscina")
    if parqueos > 0:
        amenidades_list.append(f"{parqueos} parqueo(s)")
    if "amoblado" in titulo.lower():
        amenidades_list.append("amoblado")
    if "balc" in titulo.lower():
        amenidades_list.append("balcón")
    if "suite" in titulo.lower():
        amenidades_list.append("suite")
    if not amenidades_list:
        amenidades_list = ["ascensor", "seguridad 24/7"]
    amenidades_str = ", ".join(amenidades_list)

    keywords_list = [
        f"departamento en {operacion.lower()}",
        zona.lower(),
        "century 21",
        oficina_nombre.lower(),
        f"{habitaciones} dormitorios",
    ]
    keywords_str = ", ".join(keywords_list)

    # URL canónica y datos específicos
    c21_url = "https://c21.com.bo" + str(item.get("urlCorrectaPropiedad") or f"/propiedad/{c21_id}")
    datos_especificos = {
        "c21_id": c21_id,
        "c21_url": c21_url,
        "inmobiliaria": "Century 21",
        "oficina": oficina_nombre,
        "asesor_nombre": captador_nombre,
        "asesor_telefono": item.get("telefono"),
        "asesor_whatsapp": item.get("whatsapp"),
        "parqueos": parqueos,
        "precio_original": item.get("precio"),
        "moneda_original": item.get("moneda"),
    }
    datos_especificos_str = json.dumps(datos_especificos, ensure_ascii=False)

    # Descripción informativa
    descripcion = (
        f"{titulo}.\n\n"
        f"Ubicado en {zona}, Santa Cruz de la Sierra.\n"
        f"Cuenta con {habitaciones} dormitorio(s), {banos} baño(s)"
        f"{f' y {superficie_m2} m² construidos' if superficie_m2 else ''}.\n"
        f"Comercializado a través de {oficina_nombre} (Century 21 Bolivia)."
    )

    # Búsqueda o actualización de registro existente
    inmueble = db.query(InmuebleDB).filter(
        InmuebleDB.datos_especificos_json.contains(f'"c21_id": {c21_id}') |
        InmuebleDB.datos_especificos_json.contains(f'"c21_id": "{c21_id}"')
    ).first()

    if not inmueble:
        inmueble = db.query(InmuebleDB).filter(InmuebleDB.titulo == titulo).first()

    if inmueble:
        inmueble.titulo = titulo
        inmueble.precio_usd = precio_usd
        inmueble.moneda = moneda_display
        inmueble.habitaciones = habitaciones
        inmueble.banos = banos
        inmueble.ciudad = DEFAULT_CITY
        inmueble.zona = zona
        inmueble.lat = lat
        inmueble.lng = lng
        inmueble.operacion = operacion
        inmueble.tipo_inmueble = tipo_inmueble
        inmueble.estado = "Publicado"
        inmueble.ocupacion = "Disponible"
        inmueble.superficie_m2 = superficie_m2
        inmueble.parqueos = parqueos
        inmueble.amoblado = "amoblado" in titulo.lower()
        inmueble.datos_especificos_json = datos_especificos_str
        inmueble.descripcion = descripcion
        if imagenes_str:
            inmueble.imagenes = imagenes_str
        inmueble.amenidades = amenidades_str
        inmueble.keywords = keywords_str
        inmueble.agente_id = colocador_obj.id if colocador_obj else None
        
        db.query(OfertaDB).filter(OfertaDB.inmueble_id == inmueble.id).delete()
    else:
        inmueble = InmuebleDB(
            titulo=titulo,
            precio_usd=precio_usd,
            moneda=moneda_display,
            habitaciones=habitaciones,
            banos=banos,
            ciudad=DEFAULT_CITY,
            zona=zona,
            direccion=zona,
            lat=lat,
            lng=lng,
            operacion=operacion,
            tipo_inmueble=tipo_inmueble,
            estado="Publicado",
            ocupacion="Disponible",
            superficie_m2=superficie_m2,
            parqueos=parqueos,
            amoblado="amoblado" in titulo.lower(),
            datos_especificos_json=datos_especificos_str,
            descripcion=descripcion,
            imagenes=imagenes_str,
            amenidades=amenidades_str,
            keywords=keywords_str,
            agente_id=colocador_obj.id if colocador_obj else None,
        )
        db.add(inmueble)

    inmueble.search_text = build_property_search_text(inmueble)
    db.flush()

    # Inserción de Oferta
    db.add(OfertaDB(
        inmueble_id=inmueble.id,
        operacion=operacion,
        precio=precio_usd,
        moneda=moneda_display,
        estado="Publicado",
        agente_id=colocador_obj.id if colocador_obj else None,
        captador_id=captador_obj.id if captador_obj else None,
        colocador_id=colocador_obj.id if colocador_obj else None,
    ))

    return inmueble


def export_catalog_snapshot(db) -> int:
    """
    Regenera el snapshot estático frontend/public/catalog-snapshot.json
    para que la app y el mapa carguen instantáneamente.
    """
    print("\n--- Exportando catalog-snapshot.json para el Frontend ---")
    from main import serializar_inmueble, invalidate_public_catalog_cache
    
    inmuebles_db = db.query(InmuebleDB).options(
        selectinload(InmuebleDB.agente),
        selectinload(InmuebleDB.complejo),
        selectinload(InmuebleDB.ofertas).selectinload(OfertaDB.agente),
        selectinload(InmuebleDB.ofertas).selectinload(OfertaDB.captador).selectinload(AgenteDB.oficina),
        selectinload(InmuebleDB.ofertas).selectinload(OfertaDB.colocador),
    ).filter(InmuebleDB.estado == "Publicado").all()
    
    serialized = []
    for inm in inmuebles_db:
        if es_publicable(inm.ocupacion, inm.estado):
            item_dict = serializar_inmueble(inm)
            item_dict.pop("complejo", None)
            serialized.append(item_dict)
    
    base_dir = os.path.dirname(CURRENT_DIR)
    targets = [
        os.path.join(base_dir, "frontend", "public", "catalog-snapshot.json"),
        os.path.join(base_dir, "frontend", "dist", "catalog-snapshot.json"),
    ]
    
    count_saved = 0
    for target in targets:
        try:
            target_dir = os.path.dirname(target)
            if os.path.exists(target_dir):
                with open(target, "w", encoding="utf-8") as f:
                    json.dump(serialized, f, ensure_ascii=False, indent=2)
                print(f"  [OK] Snapshot actualizado en: {target} ({len(serialized)} propiedades)")
                count_saved += 1
        except Exception as e:
            print(f"  [WARN] No se pudo guardar snapshot en {target}: {e}")
            
    invalidate_public_catalog_cache()
    return len(serialized)


def run_c21_ingestion(
    operaciones: List[str],
    max_pages: Optional[int] = None,
    limit: Optional[int] = None,
    limit_per_op: Optional[int] = None,
    bounds_str: str = "coordenadas_-17.53864183136249,-62.9722950322132,-17.96828290799978,-63.34720347947882,11",
    skip_snapshot: bool = False,
) -> List[int]:
    imported_ids = []
    
    with SessionLocal() as db:
        oficina = find_or_create_oficina(db, "Century 21 Bolivia", DEFAULT_CITY)
        default_office_id = oficina.id
        
        for op in operaciones:
            print(f"\n=======================================================")
            print(f"  INICIANDO EXTRACCIÓN CENTURY 21: OPERACIÓN {op.upper()}")
            print(f"=======================================================")
            
            page = 1
            op_imported = 0
            
            while True:
                if max_pages and page > max_pages:
                    print(f"Límite de páginas alcanzado ({max_pages}).")
                    break
                    
                if limit and len(imported_ids) >= limit:
                    print(f"Límite total de propiedades alcanzado ({limit}).")
                    break

                if limit_per_op and op_imported >= limit_per_op:
                    print(f"Límite de {limit_per_op} propiedades para operación '{op}' alcanzado.")
                    break
                    
                print(f"Extrayendo página {page} para operacion_{op}...", end=" ", flush=True)
                try:
                    data = fetch_c21_page(op, page, bounds_str)
                    results = data.get("results", [])
                    total_hits = data.get("totalHits")
                    
                    if not results:
                        print("Sin más resultados en esta página.")
                        break
                        
                    print(f"OK ({len(results)} items obtenidos | totalHits: {total_hits})")
                    
                    page_imported = 0
                    for item in results:
                        if limit and len(imported_ids) >= limit:
                            break
                        if limit_per_op and op_imported >= limit_per_op:
                            break
                        try:
                            inm = import_c21_property(db, item, default_office_id)
                            if inm:
                                imported_ids.append(inm.id)
                                page_imported += 1
                                op_imported += 1
                        except Exception as item_err:
                            db.rollback()
                            print(f"  [ERROR] item #{item.get('id')}: {item_err}", file=sys.stderr)
                            
                    db.commit()
                    print(f"  -> Guardados {page_imported} departamentos de la página {page} (Operación {op}: {op_imported} | Total acumulado: {len(imported_ids)})")
                    
                    if len(results) < 100:
                        print("Última página procesada.")
                        break
                        
                    page += 1
                    time.sleep(0.4)
                    
                except Exception as page_err:
                    print(f"[ERROR] al consultar página {page}: {page_err}", file=sys.stderr)
                    break
                    
        invalidate_search_cache(db)
        db.commit()
        
        if not skip_snapshot:
            export_catalog_snapshot(db)
            
        print(f"\n=======================================================")
        print(f"  PROCESO COMPLETADO EXITOSAMENTE")
        print(f"  Total departamentos Century 21 procesados: {len(imported_ids)}")
        print(f"=======================================================")
        return imported_ids


def main():
    parser = argparse.ArgumentParser(description="Ingesta masiva de departamentos de Century 21 Bolivia")
    parser.add_argument("--operacion", choices=["renta", "venta", "all"], default="all", help="Operación a extraer")
    parser.add_argument("--pages", type=int, default=None, help="Límite de páginas por operación")
    parser.add_argument("--limit", type=int, default=None, help="Límite total de propiedades a importar")
    parser.add_argument("--limit-per-op", type=int, default=None, help="Límite de propiedades por operación")
    parser.add_argument("--no-snapshot", action="store_true", help="Omitir regeneración de catalog-snapshot.json")
    
    args = parser.parse_args()
    
    ops = ["renta", "venta"] if args.operacion == "all" else [args.operacion]
    run_c21_ingestion(
        operaciones=ops,
        max_pages=args.pages,
        limit=args.limit,
        limit_per_op=args.limit_per_op,
        skip_snapshot=args.no_snapshot,
    )


if __name__ == "__main__":
    main()
