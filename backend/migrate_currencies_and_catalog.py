"""
Migración masiva de monedas y auditoría integral del catálogo NIA.
- Alquileres -> Moneda Nacional (Bs)
- Ventas y Anticréticos -> Dólares ($ (USD))
- Corrección de separadores de miles y ofertas de garajes / despublicados
- Regeneración de catalog-snapshot.json
"""

import json
import os
import re
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from database import SessionLocal
from models import InmuebleDB, OfertaDB
from nia_search import build_property_search_text
from import_c21_catalog import export_catalog_snapshot

# 1. IDs a despublicar (precio 0, garajes clasificados como deptos, o error tipográfico irrecuperable)
DESPUBLICAR_IDS = {
    76, 359, 360, 361, 362, 363, 364, 365, 366, 367, 369, 371, 372,  # precio 0.0
    495, 496, 497,  # garajes de 12.5 m2 titulados como departamentos
    1316,  # 260 BOB / 37 USD error tipográfico de C21
}

# 2. Correcciones explícitas de alquileres detectados en URLs o errores del captador
URL_RENTALS_MAP = {
    474: 1670.0,   # Condominio Warnes Centro (240 USD * 6.96 = 1670 Bs)
    673: 7500.0,   # C21 Alquiler 7500 BOB
    698: 3200.0,   # C21 Alquiler Equipetrol 3200 BOB
    838: 3480.0,   # C21 Alquiler 500 USD * 6.96
    885: 2600.0,   # C21 Alquiler 2600 BOB
    958: 9000.0,   # C21 Alquiler de lujo 9000 BOB
    1096: 2500.0,  # C21 Alquiler 2500 BOB
    1184: 2436.0,  # C21 Alquiler 350 USD * 6.96
    1202: 16008.0, # C21 Suant Recidence Alquiler 2300 USD * 6.96
    1240: 6000.0,  # C21 Alquiler Equipetrol 6000 BOB
}

# Alquileres de RE/MAX o C21 donde el monto ingresado ya era en Bolivianos (confusión de divisa en origen)
REMAX_RENTAL_ORIGIN_BOB = {
    41: 2600.0,   # 1 dorm Los Jazmines Norte
    52: 3500.0,   # 3 dorm Edificio Magnum Equipetrol
    72: 5500.0,   # 2 dorm Condominio Equipetrol
    121: 5600.0,  # 2 dorm Condominio Casa Banzer
    1001: 3200.0, # 1 dorm Av. Roca y Coronado
}

# 3. Correcciones de punto de miles guardado como decimal en Ventas
SALE_PRICE_FIXES = {
    1818: 93615.0,
    1819: 112101.0,
    1820: 58184.0,
    1821: 66360.0,
    1822: 83661.0,
    1376: 175000.0,
    1777: 45100.0,
    1619: 112000.0,
}


def load_remax_raw_prices():
    remax_path = os.path.join(CURRENT_DIR, "remax_inventario.json")
    if not os.path.exists(remax_path):
        return {}, {}
    with open(remax_path, "r", encoding="utf-8") as f:
        remax_items = json.load(f)

    remax_by_slug = {}
    remax_by_title = {}
    for item in remax_items:
        slug = (item.get("datos_especificos") or {}).get("remax_slug") or (item.get("datos_especificos_json") or {}).get("remax_slug")
        p = float(item.get("precio_usd") or item.get("precio") or 0.0)
        if slug:
            remax_by_slug[slug] = p
        if item.get("titulo"):
            remax_by_title[item.get("titulo")] = p
    return remax_by_slug, remax_by_title


def run_migration():
    print("================================================================")
    print(" INICIANDO MIGRACIÓN INTEGRAL DE MONEDAS Y CATÁLOGO NIA")
    print("================================================================")
    
    remax_by_slug, remax_by_title = load_remax_raw_prices()
    print(f"Cargados {len(remax_by_slug)} slugs de RE/MAX para referencia exacta de precios.")
    
    with SessionLocal() as db:
        inmuebles = db.query(InmuebleDB).all()
        print(f"Total inmuebles en base de datos: {len(inmuebles)}")
        
        counts = {
            "despublicados": 0,
            "alquileres_convertidos": 0,
            "ventas_convertidas": 0,
            "anticreticos_convertidos": 0,
            "fijados_manual": 0,
        }
        
        for inm in inmuebles:
            # A. Despublicar items inválidos
            if inm.id in DESPUBLICAR_IDS:
                inm.estado = "Despublicado"
                inm.ocupacion = "No Disponible"
                for of in inm.ofertas:
                    of.estado = "Despublicado"
                counts["despublicados"] += 1
                continue
                
            # Parse metadata
            meta = {}
            if inm.datos_especificos_json:
                try:
                    meta = json.loads(inm.datos_especificos_json)
                except Exception:
                    pass
            p_orig = meta.get("precio_original")
            m_orig = meta.get("moneda_original")
            remax_slug = meta.get("remax_slug")
            c21_id = meta.get("c21_id")
            
            # B. Corregir casos de alquileres detectados en URL o captadores
            if inm.id in URL_RENTALS_MAP:
                new_price = float(URL_RENTALS_MAP[inm.id])
                inm.operacion = "Alquiler"
                inm.moneda = "Bs"
                inm.precio_usd = new_price
                for of in inm.ofertas:
                    of.operacion = "Alquiler"
                    of.moneda = "Bs"
                    of.precio = new_price
                inm.search_text = build_property_search_text(inm)
                counts["fijados_manual"] += 1
                counts["alquileres_convertidos"] += 1
                continue
                
            # C. Corregir casos de ventas fijadas
            if inm.id in SALE_PRICE_FIXES:
                new_price = float(SALE_PRICE_FIXES[inm.id])
                inm.operacion = "Venta"
                inm.moneda = "$ (USD)"
                inm.precio_usd = new_price
                for of in inm.ofertas:
                    of.operacion = "Venta"
                    of.moneda = "$ (USD)"
                    of.precio = new_price
                inm.search_text = build_property_search_text(inm)
                counts["fijados_manual"] += 1
                counts["ventas_convertidas"] += 1
                continue
                
            norm_op = (inm.operacion or "").strip().lower()
            
            # D. Procesar Anticréticos -> ESTRICTAMENTE EN DÓLARES ($ (USD))
            if "anticr" in norm_op:
                inm.operacion = "Anticrético"
                inm.moneda = "$ (USD)"
                inm.precio_usd = round(float(inm.precio_usd or 0), 0)
                for of in inm.ofertas:
                    of.operacion = "Anticrético"
                    of.moneda = "$ (USD)"
                    of.precio = inm.precio_usd
                inm.search_text = build_property_search_text(inm)
                counts["anticreticos_convertidos"] += 1
                
            # E. Procesar Alquileres -> ESTRICTAMENTE EN MONEDA NACIONAL (Bs)
            elif "alquil" in norm_op or "rent" in norm_op:
                inm.operacion = "Alquiler"
                inm.moneda = "Bs"
                
                if inm.id in REMAX_RENTAL_ORIGIN_BOB:
                    new_price = float(REMAX_RENTAL_ORIGIN_BOB[inm.id])
                elif inm.id == 474:
                    new_price = 1670.0
                elif c21_id:
                    if m_orig == "BOB" and p_orig:
                        # En C21 con moneda BOB, restaurar el monto original en Bs
                        new_price = round(float(p_orig), 0)
                    elif m_orig == "USD" and p_orig:
                        # C21 en USD -> convertir a Bs con TC 6.96
                        new_price = round(float(p_orig) * 6.96, 0)
                    else:
                        new_price = round(float(inm.precio_usd or 0) * 6.96, 0)
                elif remax_slug and remax_slug in remax_by_slug:
                    orig_usd = remax_by_slug[remax_slug]
                    new_price = round(orig_usd * 6.96, 0)
                elif inm.titulo in remax_by_title:
                    orig_usd = remax_by_title[inm.titulo]
                    new_price = round(orig_usd * 6.96, 0)
                else:
                    if float(inm.precio_usd or 0) < 1500:
                        new_price = round(float(inm.precio_usd or 0) * 6.96, 0)
                    else:
                        new_price = round(float(inm.precio_usd or 0), 0)
                        
                inm.precio_usd = new_price
                for of in inm.ofertas:
                    of.operacion = "Alquiler"
                    of.moneda = "Bs"
                    of.precio = new_price
                inm.search_text = build_property_search_text(inm)
                counts["alquileres_convertidos"] += 1
                
            # F. Procesar Ventas -> ESTRICTAMENTE EN DÓLARES ($ (USD))
            else:
                inm.operacion = "Venta"
                inm.moneda = "$ (USD)"
                inm.precio_usd = round(float(inm.precio_usd or 0), 0)
                for of in inm.ofertas:
                    of.operacion = "Venta"
                    of.moneda = "$ (USD)"
                    of.precio = inm.precio_usd
                inm.search_text = build_property_search_text(inm)
                counts["ventas_convertidas"] += 1
                
        db.commit()
        print("\n[OK] Base de datos actualizada con éxito:")
        for k, v in counts.items():
            print(f"  - {k}: {v}")
            
        # Re-export catalog snapshot
        print("\nRegenerando snapshots estáticos para el frontend...")
        export_catalog_snapshot(db)
        print("[DONE] Migración finalizada exitosamente.")

if __name__ == "__main__":
    run_migration()
