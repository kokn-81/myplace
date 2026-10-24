import json
import os
import sqlite3

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    snap_path = os.path.join(root_dir, 'frontend', 'public', 'catalog-snapshot.json')
    remax_path = os.path.join(root_dir, 'backend', 'remax_inventario.json')
    db_path = os.path.join(root_dir, 'backend', 'inmobiliaria.db')

    with open(snap_path, 'r', encoding='utf-8') as f:
        snap = json.load(f)
    with open(remax_path, 'r', encoding='utf-8') as f:
        remax = json.load(f)

    # 10 official projects:
    project_ids = [
        '5',                # ONA Residences
        '1816',             # Tower Eurodesign
        'garden-zen',       # Garden Zen
        'domus-black',      # DOMUS Black
        'domus-gold',       # DOMUS Gold
        'domus-onix',       # DOMUS Onix
        'domus-insignia',   # DOMUS Insignia
        'domus-luxury',     # DOMUS Luxury
        'domus-tower',      # DOMUS Tower
        'domus-infinity',   # DOMUS Infinity
    ]

    # 2 exclusive single apartments:
    apartment_ids = [
        '4',                # Depto 3 Dorm. · La Riviera Equipetrol
        '3',                # Depto 1 Dorm. · Swissôtel Santa Cruz
    ]

    all_ids = project_ids + apartment_ids
    curated = []

    # Map snapshot items by string id
    snap_by_id = {str(item.get('id')): item for item in snap}
    remax_by_id = {str(item.get('id')): item for item in remax}

    for cid in all_ids:
        item = snap_by_id.get(cid)
        if not item:
            item = remax_by_id.get(cid)
        if not item:
            print(f"ERROR: Item {cid} not found in snap or remax!")
            continue

        # Standardize title and fields
        if cid == '5':
            item['titulo'] = "ONA Residences · Av. Los Cusis"
            item['title'] = "ONA Residences · Av. Los Cusis"
            item['complejo_nombre'] = "ONA Residences"
            item['tipo_inmueble'] = "Proyecto (preventa)"
            item['type'] = "Proyecto (preventa)"
            item['operacion'] = "Venta"
            item['ciudad'] = "Santa Cruz de la Sierra"
            item['reserva_usd'] = 1000
        elif cid == 'garden-zen':
            item['titulo'] = "GARDEN ZEN · Equipetrol Norte"
            item['title'] = "GARDEN ZEN · Equipetrol Norte"
            item['complejo_nombre'] = "Garden Zen"
            item['tipo_inmueble'] = "Proyecto (preventa)"
            item['type'] = "Proyecto (preventa)"
            item['operacion'] = "Venta"
            item['ciudad'] = "Santa Cruz de la Sierra"
        elif cid == '3':
            item['titulo'] = "Depto 1 Dorm. · Swissôtel Santa Cruz"
            item['title'] = "Depto 1 Dorm. · Swissôtel Santa Cruz"
            item['complejo_nombre'] = "Swissôtel Santa Cruz"
            item['tipo_inmueble'] = "Departamento"
            item['type'] = "Departamento"
            item['operacion'] = "Venta"
            item['ciudad'] = "Santa Cruz de la Sierra"
            item['zona'] = "Canal Isuto / Equipetrol (Swissôtel)"
            item['lat'] = -17.745744
            item['lng'] = -63.195316
        elif cid == '4':
            item['titulo'] = "Depto 3 Dorm. · La Riviera Equipetrol"
            item['title'] = "Depto 3 Dorm. · La Riviera Equipetrol"
            item['complejo_nombre'] = "La Riviera & Beauty Plaza"
            item['tipo_inmueble'] = "Departamento"
            item['type'] = "Departamento"
            item['operacion'] = "Venta"
            item['ciudad'] = "Santa Cruz de la Sierra"
            item['zona'] = "Equipetrol Norte"

        curated.append(item)

    print(f"Total curated properties assembled: {len(curated)}")
    for p in curated:
        tid = p.get('id')
        name = p.get('titulo') or p.get('title')
        tipo = p.get('tipo_inmueble')
        op = p.get('operacion')
        print(f"[{tid}] {name} | {tipo} | {op}")

    # Write backup of old catalog snapshot
    backup_snap = os.path.join(root_dir, 'frontend', 'public', 'catalog-snapshot.full-backup.json')
    if not os.path.exists(backup_snap):
        with open(backup_snap, 'w', encoding='utf-8') as f:
            json.dump(snap, f, ensure_ascii=False, indent=2)
        print("Backed up full snapshot to catalog-snapshot.full-backup.json")

    # Overwrite catalog-snapshot.json with the 12 curated items
    with open(snap_path, 'w', encoding='utf-8') as f:
        json.dump(curated, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(curated)} items to {snap_path}")

    # Update backend SQLite database
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Archive/hide all properties except the curated ones
        cursor.execute("UPDATE inmuebles SET estado = 'Archivado' WHERE id NOT IN (3, 4, 5, 1816)")
        cursor.execute("UPDATE inmuebles SET estado = 'Publicado' WHERE id IN (3, 4, 5, 1816)")
        
        # Ensure ID 3 (Swissotel) is present in inmuebles table
        cursor.execute("SELECT id FROM inmuebles WHERE id = 3")
        row3 = cursor.fetchone()
        if not row3:
            p3 = remax_by_id.get('3')
            if p3:
                cols = [
                    'id', 'titulo', 'precio_usd', 'moneda', 'habitaciones', 'ciudad', 'lat', 'lng',
                    'operacion', 'tipo_inmueble', 'descripcion', 'amenidades', 'imagenes',
                    'agente_id', 'banos', 'estado', 'superficie_m2', 'zona', 'direccion', 'piso',
                    'amoblado', 'acepta_mascotas', 'parqueos', 'baulera', 'complejo_id', 'ocupacion'
                ]
                # Filter p3 to matching cols
                vals = [
                    3,
                    p3.get('titulo') or 'Depto 1 Dorm. · Swissôtel Santa Cruz',
                    p3.get('precio_usd') or 195000,
                    p3.get('moneda') or '$ (USD)',
                    p3.get('habitaciones') or 1,
                    p3.get('ciudad') or 'Santa Cruz de la Sierra',
                    -17.745744,
                    -63.195316,
                    'Venta',
                    'Departamento',
                    p3.get('descripcion') or '',
                    json.dumps(p3.get('amenidades') or []),
                    p3.get('imagenes') or '',
                    5,
                    p3.get('banos') or 2,
                    'Publicado',
                    p3.get('superficie_m2') or 52.0,
                    'Canal Isuto / Equipetrol (Swissôtel)',
                    'Swissôtel Santa Cruz',
                    8,
                    1,
                    0,
                    1,
                    0,
                    None,
                    'Disponible'
                ]
                placeholders = ', '.join(['?'] * len(cols))
                col_names = ', '.join(cols)
                cursor.execute(f"INSERT INTO inmuebles ({col_names}) VALUES ({placeholders})", vals)
                print("Inserted Swissôtel (id 3) into backend/inmobiliaria.db")
        else:
            cursor.execute("UPDATE inmuebles SET estado = 'Publicado', titulo = 'Depto 1 Dorm. · Swissôtel Santa Cruz' WHERE id = 3")

        # Ensure ID 5 (ONA) is Publicado and has updated title
        cursor.execute("UPDATE inmuebles SET estado = 'Publicado', titulo = 'ONA Residences · Av. Los Cusis' WHERE id = 5")
        
        # Ensure ID 4 (La Riviera) is Publicado
        cursor.execute("UPDATE inmuebles SET estado = 'Publicado' WHERE id = 4")

        # Ensure ID 1816 (Tower Eurodesign) is Publicado
        cursor.execute("UPDATE inmuebles SET estado = 'Publicado' WHERE id = 1816")

        conn.commit()
        active_count = cursor.execute("SELECT count(*) FROM inmuebles WHERE estado = 'Publicado'").fetchone()[0]
        total_count = cursor.execute("SELECT count(*) FROM inmuebles").fetchone()[0]
        conn.close()
        print(f"Backend DB updated: {active_count} published, {total_count} total")

if __name__ == '__main__':
    main()
