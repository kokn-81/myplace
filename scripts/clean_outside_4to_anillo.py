"""
Script para depurar propiedades fuera del 4to Anillo de Santa Cruz de la Sierra.
Conserva el 100% de los proyectos inmobiliarios registrados (ONA, EuroDesign, Garden Zen, DOMUS)
y todos los alquileres/ventas dentro del 4to anillo.
"""
import sqlite3
import json
import os
import shutil
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "backend", "inmobiliaria.db")
DB_BACKUP_PATH = os.path.join(BASE_DIR, "backend", "inmobiliaria.db.pre-4to-cleanup.bak")
SNAPSHOT_PUBLIC = os.path.join(BASE_DIR, "frontend", "public", "catalog-snapshot.json")
SNAPSHOT_DIST = os.path.join(BASE_DIR, "frontend", "dist", "catalog-snapshot.json")

# Polígono del 4to Anillo en Santa Cruz de la Sierra
POLY_4TO_ANILLO = [
    (-17.7460, -63.1785),  # 4to y Banzer
    (-17.7455, -63.1680),  # 4to y Beni
    (-17.7480, -63.1595),  # 4to y Alemana
    (-17.7535, -63.1500),  # 4to y Mutualista
    (-17.7635, -63.1435),  # 4to y Paraguá
    (-17.7780, -63.1410),  # 4to y Virgen de Cotoca
    (-17.7855, -63.1465),  # 4to y Av. Brasil
    (-17.7945, -63.1460),  # 4to y Tres Pasos al Frente
    (-17.8050, -63.1510),  # 4to y Che Guevara / Radial 10
    (-17.8170, -63.1520),  # 4to y San Aurelio
    (-17.8220, -63.1660),  # 4to y Radial 12 / Nuevo Palmar
    (-17.8245, -63.1830),  # 4to y Santos Dumont
    (-17.8220, -63.1935),  # 4to y Radial 13
    (-17.8140, -63.2065),  # 4to y Doble Vía La Guardia
    (-17.8080, -63.2135),  # 4to y Radial 17 1/2
    (-17.8000, -63.2185),  # 4to y Piraí
    (-17.7845, -63.2205),  # 4to y Roca y Coronado
    (-17.7725, -63.2140),  # 4to y Centenario
    (-17.7635, -63.2070),  # 4to y Busch
    (-17.7590, -63.2095),  # 4to y Las Ramblas / Beauty Plaza
    (-17.7540, -63.2020),  # 4to y Av. San Martín / Ventura Mall
    (-17.7475, -63.1890),  # 4to y Canal Isuto
    (-17.7465, -63.1830),  # 4to y Radial 26
]

CORE_PROJECT_IDS = {
    "5", "1816", "garden-zen", "domus-black", "domus-gold", "domus-onix",
    "domus-insignia", "domus-luxury", "domus-tower", "domus-infinity"
}

DEFINITIVE_OUTSIDE_PATTERNS = [
    r'\b5to\s*anillo\b', r'\bquinto\s*anillo\b', r'\b5[º°]\s*anillo\b',
    r'\b6to\s*anillo\b', r'\bsexto\s*anillo\b', r'\b6[º°]\s*anillo\b',
    r'\b7mo\s*anillo\b', r'\bseptimo\s*anillo\b', r'\bséptimo\s*anillo\b', r'\b7[º°]\s*anillo\b',
    r'\b8vo\s*anillo\b', r'\boctavo\s*anillo\b', r'\b8[º°]\s*anillo\b',
    r'\b9no\s*anillo\b', r'\bnoveno\s*anillo\b', r'\b9[º°]\s*anillo\b',
    r'\b10mo\s*anillo\b', r'\bdecimo\s*anillo\b', r'\bdécimo\s*anillo\b', r'\b10[º°]\s*anillo\b',
    r'\b5to\s*a(?:l|\s)\s*7mo\b',
    r'\burub[oó]\b',
    r'\bporongo\b',
    r'\bcochabamba\b',
    r'\bwarnes\b',
    r'\bmontero\b',
    r'\bcotoca\b',
    r'\bla guardia\b',
    r'\bkm\s*(?:[89]|1[0-9])\b',
    r'entre\s*4to\s*y\s*5to\b',
    r'entre\s*4to\s*al\s*5to\b',
    r'4to\s*y\s*5to\s*anillo\b',
]
outside_re = re.compile('|'.join(DEFINITIVE_OUTSIDE_PATTERNS), re.IGNORECASE)

def point_in_polygon(lat, lng, polygon):
    n = len(polygon)
    inside = False
    p1lat, p1lng = polygon[0]
    for i in range(n + 1):
        p2lat, p2lng = polygon[i % n]
        if lng > min(p1lng, p2lng):
            if lng <= max(p1lng, p2lng):
                if lat <= max(p1lat, p2lat):
                    if p1lng != p2lng:
                        xinters = (lng - p1lng) * (p2lat - p1lat) / (p2lng - p1lng) + p1lat
                    if p1lat == p2lat or lat <= xinters:
                        inside = not inside
        p1lat, p1lng = p2lat, p2lng
    return inside

def classify_property(p):
    iid = str(p.get('id', ''))
    titulo = p.get('titulo') or p.get('title') or ''
    zona = p.get('zona') or ''
    direccion = p.get('direccion') or ''
    ciudad = p.get('ciudad') or p.get('city') or ''
    lat = p.get('lat')
    lng = p.get('lng')

    if iid in CORE_PROJECT_IDS:
        return True, "core_project"

    if ciudad and ciudad.strip().lower() != "santa cruz de la sierra":
        return False, f"ciudad={ciudad}"

    full_text = f"{titulo} {zona} {direccion} {ciudad}"
    if outside_re.search(full_text):
        return False, "text_matches_outside"

    if lat is None or lng is None:
        return False, "no_coords"

    try:
        lat = float(lat)
        lng = float(lng)
    except (ValueError, TypeError):
        return False, "invalid_coords"

    # Beyond bounding limits
    if lat > -17.7450:  # north of 4to
        return False, "lat_north_of_4to"
    if lat < -17.8250:  # south of 4to
        return False, "lat_south_of_4to"
    if lng > -63.1400:  # east of 4to
        return False, "lng_east_of_4to"
    if lng < -63.2220:  # west of 4to
        return False, "lng_west_of_4to"

    # Urubó coordinates across the river (lng < -63.213 and lat > -17.785)
    if lng < -63.213 and lat > -17.785:
        return False, "urubo_river_coords"

    # Point in 4to Anillo polygon
    if point_in_polygon(lat, lng, POLY_4TO_ANILLO):
        return True, "inside_polygon"

    return False, "outside_polygon"

def clean_database():
    print(f"\n[1/3] Respaldando base de datos a {DB_BACKUP_PATH}...")
    shutil.copy2(DB_PATH, DB_BACKUP_PATH)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("SELECT id, titulo, zona, direccion, lat, lng, ciudad FROM inmuebles")
    rows = c.fetchall()
    total_db = len(rows)

    ids_to_delete = []
    for r in rows:
        p = {
            'id': r[0], 'titulo': r[1], 'zona': r[2], 'direccion': r[3],
            'lat': r[4], 'lng': r[5], 'ciudad': r[6]
        }
        inside, reason = classify_property(p)
        if not inside:
            ids_to_delete.append(r[0])

    print(f"Total en DB: {total_db}")
    print(f"A eliminar de DB: {len(ids_to_delete)}")
    print(f"A conservar en DB: {total_db - len(ids_to_delete)}")

    # Delete in batches
    BATCH_SIZE = 500
    total_ofertas_deleted = 0
    total_inmuebles_deleted = 0

    for i in range(0, len(ids_to_delete), BATCH_SIZE):
        batch = ids_to_delete[i:i + BATCH_SIZE]
        placeholders = ','.join('?' for _ in batch)
        
        c.execute(f"DELETE FROM ofertas WHERE inmueble_id IN ({placeholders})", batch)
        total_ofertas_deleted += c.rowcount
        
        c.execute(f"DELETE FROM inmuebles WHERE id IN ({placeholders})", batch)
        total_inmuebles_deleted += c.rowcount

    conn.commit()
    print(f"  [OK] Eliminados {total_inmuebles_deleted} inmuebles y {total_ofertas_deleted} ofertas asociadas.")
    
    print("  Ejecutando VACUUM en base de datos...")
    c.execute("VACUUM")
    conn.commit()
    conn.close()

def clean_snapshots():
    print("\n[2/3] Filtrando y actualizando snapshots de catálogo...")
    with open(SNAPSHOT_PUBLIC, 'r', encoding='utf-8') as f:
        snapshot = json.load(f)

    initial_count = len(snapshot)
    kept_items = []
    removed_items = []

    for item in snapshot:
        inside, reason = classify_property(item)
        if inside:
            kept_items.append(item)
        else:
            removed_items.append((item, reason))

    print(f"Snapshot original: {initial_count} items")
    print(f"Items conservados: {len(kept_items)}")
    print(f"Items eliminados: {len(removed_items)}")

    # Verify all 10 core projects are present
    kept_ids = {str(item.get('id', '')) for item in kept_items}
    for pid in CORE_PROJECT_IDS:
        if pid not in kept_ids:
            raise RuntimeError(f"ALERTA CRÍTICA: Proyecto base {pid} no encontrado en snapshot filtrado!")

    # Write public snapshot
    with open(SNAPSHOT_PUBLIC, 'w', encoding='utf-8') as f:
        json.dump(kept_items, f, ensure_ascii=False, indent=2)
    print(f"  [OK] Guardado {SNAPSHOT_PUBLIC} ({len(kept_items)} propiedades)")

    # Write dist snapshot if exists
    if os.path.exists(SNAPSHOT_DIST):
        with open(SNAPSHOT_DIST, 'w', encoding='utf-8') as f:
            json.dump(kept_items, f, ensure_ascii=False, indent=2)
        print(f"  [OK] Guardado {SNAPSHOT_DIST} ({len(kept_items)} propiedades)")

if __name__ == "__main__":
    clean_database()
    clean_snapshots()
    print("\n[3/3] Limpieza completada exitosamente!")
