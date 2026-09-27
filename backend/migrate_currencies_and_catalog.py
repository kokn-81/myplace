"""
Migración de monedas y catálogo NIA según requerimiento exacto del usuario:
1. Alquileres:
   - Si en Century 21 o en la descripción el monto original viene explícitamente en Bs (moneda_original == 'BOB' o monto explícito en Bs):
     se asigna su precio original exacto en Bolivianos y moneda = 'Bs'.
   - Si el alquiler fue publicado originalmente en Dólares ($ (USD)) y no tiene mención explícita de precio en Bs ni TC en la descripción:
     SE DEJA COMO ESTABA, en dólares ($ (USD)) con su precio original en USD (NO se aplica 6.96 ni 6.97 artificial).
2. Ventas y Anticréticos:
   - Estrictamente en Dólares ($ (USD)).
3. Publicaciones inválidas:
   - Precio 0, garajes o errores tipográficos se mantienen Despublicados.
4. Regeneración automática de catalog-snapshot.json.
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

DESPUBLICAR_IDS = {
    76, 359, 360, 361, 362, 363, 364, 365, 366, 367, 369, 371, 372,  # precio 0.0
    495, 496, 497,  # garajes de 12.5 m2
    1316,  # error tipográfico 260 BOB en anticrético
}

URL_RENTALS_MAP = {
    474: (1670.0, "Bs"),   # Condominio Warnes Centro
    673: (7500.0, "Bs"),   # C21 Alquiler 7500 BOB
    698: (3200.0, "Bs"),   # C21 Alquiler Equipetrol 3200 BOB
    838: (500.0, "$ (USD)"),   # C21 Alquiler 500 USD (sin TC en desc, dejar en USD)
    885: (2600.0, "Bs"),   # C21 Alquiler 2600 BOB
    958: (9000.0, "Bs"),   # C21 Alquiler de lujo 9000 BOB
    1096: (2500.0, "Bs"),  # C21 Alquiler 2500 BOB
    1184: (350.0, "$ (USD)"),  # C21 Alquiler 350 USD (sin TC en desc, dejar en USD)
    1202: (2300.0, "$ (USD)"), # C21 Suant Recidence Alquiler 2300 USD (sin TC en desc, dejar en USD)
    1240: (6000.0, "Bs"),  # C21 Alquiler Equipetrol 6000 BOB
}

REMAX_RENTAL_ORIGIN_BOB = {
    41: 2600.0,   # 1 dorm Los Jazmines Norte
    52: 3500.0,   # 3 dorm Edificio Magnum Equipetrol
    72: 5500.0,   # 2 dorm Condominio Equipetrol
    121: 5600.0,  # 2 dorm Condominio Casa Banzer
    1001: 3200.0, # 1 dorm Av. Roca y Coronado
}

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
    print(" EJECUTANDO NORMALIZACIÓN DE CATÁLOGO NIA (POLÍTICA EXACTA DE DIVISAS)")
    print("================================================================")
    
    remax_by_slug, remax_by_title = load_remax_raw_prices()
    
    with SessionLocal() as db:
        inmuebles = db.query(InmuebleDB).all()
        print(f"Total inmuebles en base de datos: {len(inmuebles)}")
        
        counts = {
            "despublicados": 0,
            "alquileres_bs": 0,
            "alquileres_usd_conservados": 0,
            "ventas_usd": 0,
            "anticreticos_usd": 0,
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
            
            # B. URL rentals correcciones explícitas
            if inm.id in URL_RENTALS_MAP:
                new_price, new_currency = URL_RENTALS_MAP[inm.id]
                inm.operacion = "Alquiler"
                inm.moneda = new_currency
                inm.precio_usd = new_price
                for of in inm.ofertas:
                    of.operacion = "Alquiler"
                    of.moneda = new_currency
                    of.precio = new_price
                inm.search_text = build_property_search_text(inm)
                if new_currency == "Bs":
                    counts["alquileres_bs"] += 1
                else:
                    counts["alquileres_usd_conservados"] += 1
                continue
                
            # C. Correcciones fijadas de ventas (dot thousands)
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
                counts["ventas_usd"] += 1
                continue
                
            norm_op = (inm.operacion or "").strip().lower()
            
            # D. Anticréticos -> ESTRICTAMENTE EN DÓLARES ($ (USD))
            if "anticr" in norm_op:
                inm.operacion = "Anticrético"
                inm.moneda = "$ (USD)"
                inm.precio_usd = round(float(inm.precio_usd or 0), 0)
                for of in inm.ofertas:
                    of.operacion = "Anticrético"
                    of.moneda = "$ (USD)"
                    of.precio = inm.precio_usd
                inm.search_text = build_property_search_text(inm)
                counts["anticreticos_usd"] += 1
                
            # E. Alquileres
            elif "alquil" in norm_op or "rent" in norm_op:
                inm.operacion = "Alquiler"
                
                # Caso 1: Captador ingresó explícitamente en Bolivianos (en C21 BOB o REMAX BOB)
                if inm.id in REMAX_RENTAL_ORIGIN_BOB:
                    inm.moneda = "Bs"
                    inm.precio_usd = float(REMAX_RENTAL_ORIGIN_BOB[inm.id])
                    counts["alquileres_bs"] += 1
                elif c21_id and m_orig == "BOB" and p_orig:
                    # En Century 21 el captador fijó el precio original directamente en Bolivianos
                    inm.moneda = "Bs"
                    inm.precio_usd = round(float(p_orig), 0)
                    counts["alquileres_bs"] += 1
                else:
                    # Caso 2: Publicado en Dólares ($ (USD))
                    # "NO USES EL 6,97... DEBE DECIR EN LAS DESCRIPCIONES, SINO DEJALO COMO ESTAA"
                    # Como no hay TC explícito en la descripción, se conserva en USD con su precio original
                    orig_usd = None
                    if m_orig == "USD" and p_orig:
                        orig_usd = float(p_orig)
                    elif remax_slug and remax_slug in remax_by_slug:
                        orig_usd = remax_by_slug[remax_slug]
                    elif inm.titulo in remax_by_title:
                        orig_usd = remax_by_title[inm.titulo]
                    else:
                        orig_usd = float(inm.precio_usd or 0)
                        
                    inm.moneda = "$ (USD)"
                    inm.precio_usd = orig_usd
                    counts["alquileres_usd_conservados"] += 1
                    
                for of in inm.ofertas:
                    of.operacion = "Alquiler"
                    of.moneda = inm.moneda
                    of.precio = inm.precio_usd
                inm.search_text = build_property_search_text(inm)
                
            # F. Ventas -> ESTRICTAMENTE EN DÓLARES ($ (USD))
            else:
                inm.operacion = "Venta"
                inm.moneda = "$ (USD)"
                inm.precio_usd = round(float(inm.precio_usd or 0), 0)
                for of in inm.ofertas:
                    of.operacion = "Venta"
                    of.moneda = "$ (USD)"
                    of.precio = inm.precio_usd
                inm.search_text = build_property_search_text(inm)
                counts["ventas_usd"] += 1
                
        db.commit()
        print("\n[OK] Base de datos actualizada con éxito:")
        for k, v in counts.items():
            print(f"  - {k}: {v}")
            
        print("\nRegenerando snapshots estáticos para el frontend...")
        export_catalog_snapshot(db)
        print("[DONE] Normalización completada.")

if __name__ == "__main__":
    run_migration()
