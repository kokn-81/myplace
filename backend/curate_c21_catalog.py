"""
Script de curaduría editorial para inmuebles de Century 21 Bolivia (Santa Cruz).
Aplica el mismo estándar de calidad y formato ejecutivo de REMAX Patrimonio:
1. Títulos en formato ejecutivo: [Tipo] [Amoblado/A Estrenar] [Dormitorios] · [Edificio o Zona]
2. Descripciones estructuradas y persuasivas (Hook, Distribución, Acabados, Áreas Comunes, Asesor)
3. Priorización y limpieza de imágenes
4. Regeneración automática de catalog-snapshot.json
"""

import os
import sys
import re
import json
import sqlite3

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from database import SessionLocal
from models import InmuebleDB, OfertaDB, AgenteDB, ComplejoDB
from catalog import es_publicable
from import_c21_catalog import export_catalog_snapshot


def clean_c21_title(raw_title: str, tipo_inmueble: str, habitaciones: int, zona: str, amoblado: bool = False, a_estrenar: bool = False) -> str:
    t = (raw_title or "").strip()
    
    is_amoblado = amoblado or bool(re.search(r'\bamoblado\b|\bequipado\b|\bmuebles\b', t, re.IGNORECASE))
    is_estrenar = a_estrenar or bool(re.search(r'\ba estrenar\b|\bnuevo\b', t, re.IGNORECASE))
    is_lujo = bool(re.search(r'\bde lujo\b|\bluxury\b|\bexclusivo\b', t, re.IGNORECASE))
    is_penthouse = 'penthouse' in tipo_inmueble.lower() or bool(re.search(r'\bpenthouse\b', t, re.IGNORECASE))
    is_monoambiente = habitaciones == 0 or bool(re.search(r'\bmonoambiente\b|\bmono ambiente\b|\bgarzonier\b|\bstudio\b|\bestudio\b', t, re.IGNORECASE))

    # Regex para extraer nombre de edificio o complejo
    bld_match = re.search(
        r'(?:edificio|condominio|torre|residence|sky|smart|macoror[oó]|onix|ares|magnum|porto|stanza|swiss[oô]tel|domus|luxe|eurodesign|itaguazu|in tower|mythos|berchatti|soho|green|mare|olden tower|golden tower|duo|palmetto)\s+([^·\-,|–\(\)]+)',
        t,
        re.IGNORECASE
    )
    building_name = None
    if bld_match:
        b = bld_match.group(0).strip()
        b = re.sub(r'\s*[-–|,/]\s*$', '', b)
        b = re.sub(r'\b(?:dpto|depto|departamento|unidad|oficina|of|suite)\.?\s*#?\s*\w+\b', '', b, flags=re.IGNORECASE)
        b = re.sub(r'\bpiso\s*#?\s*\d+\b', '', b, flags=re.IGNORECASE)
        b = re.sub(r'\b(?:1|2|3|4)\s*dorms?\b', '', b, flags=re.IGNORECASE)
        b = re.sub(r'\s+', ' ', b).strip()
        if len(b) > 4:
            building_name = b.title()

    # Si no hubo match regex, probar separadores comunes (- | –)
    if not building_name:
        parts = re.split(r'[-–|]', t)
        if len(parts) > 1:
            candidate = parts[-1].strip()
            c_clean = re.sub(r'\b(?:alquiler|venta|anticretico|departamento|dpto|depto)\b', '', candidate, flags=re.IGNORECASE).strip()
            if len(c_clean) > 3 and not re.match(r'^(?:equipetrol|norte|sur|este|oeste|centro|urubo|santa cruz)$', c_clean, re.IGNORECASE):
                building_name = c_clean.title()

    # Caso especial: edificios reconocidos directamente
    if not building_name:
        for kw in ["Sky Design", "Vista Verde", "Portobello II", "Portobello", "Olden Tower", "Golden Tower", "Centro Calleja", "Eurodesign Soho", "Edificio Mare", "Condominio Mythos"]:
            if kw.lower() in t.lower():
                building_name = kw
                break

    # Prefijo principal
    if is_penthouse:
        prefix = 'Penthouse'
    elif is_monoambiente:
        prefix = 'Monoambiente'
    else:
        prefix = 'Depto'

    adj = []
    if is_amoblado:
        adj.append('Amoblado')
    elif is_estrenar:
        adj.append('A Estrenar')
    elif is_lujo:
        adj.append('de Lujo')

    adj_str = (' ' + ' '.join(adj)) if adj else ''

    dorms_str = ''
    if not is_monoambiente:
        dorms_str = f' {habitaciones} Dorm.' if habitaciones > 0 else ' 2 Dorm.'

    anchor = building_name if building_name else (zona if zona and zona.lower() != 'santa cruz de la sierra' else 'Santa Cruz')
    anchor = anchor.replace('Zona ', '').strip()
    if anchor.lower() in ['norte', 'sur', 'este', 'oeste']:
        anchor = f'Zona {anchor.title()}'
    else:
        anchor = anchor.title()

    return f'{prefix}{adj_str}{dorms_str} · {anchor}'


def generate_executive_description(
    titulo_curado: str,
    operacion: str,
    tipo: str,
    habitaciones: int,
    banos: int,
    superficie_m2: float,
    zona: str,
    parqueos: int,
    amenidades_list: list,
    oficina_c21: str
) -> str:
    op_label = "en alquiler" if operacion.lower().startswith("alquil") else ("en anticrético" if "anticr" in operacion.lower() else "en venta")
    zona_label = zona if zona and zona.lower() != "santa cruz de la sierra" else "Santa Cruz de la Sierra"

    # Hook inicial de estilo de vida
    hook = (
        f"Exclusivo {tipo.lower()} {op_label} en {zona_label}, diseñado para brindar máxima comodidad, "
        f"iluminación natural y una experiencia residencial superior en una de las zonas con mayor demanda de Santa Cruz."
    )

    # Distribución y espacios
    distribucion_items = []
    if superficie_m2 and superficie_m2 > 10:
        distribucion_items.append(f"Superficie propia: {superficie_m2:g} m² con distribución eficiente")
    if habitaciones == 0 or "monoambiente" in titulo_curado.lower():
        distribucion_items.append("Ambiente integrado y funcional con excelente aprovechamiento de espacios")
    elif habitaciones == 1:
        distribucion_items.append("1 dormitorio confortable (suite privada)")
    else:
        distribucion_items.append(f"{habitaciones} dormitorios confortables (incluye suite principal con baño privado)")
    
    distribucion_items.append(f"{banos} baño(s) con grifería y sanitarios de calidad")
    distribucion_items.append("Living-comedor luminoso con ventanales amplios y ventilación cruzada")
    distribucion_items.append("Cocina equipada con cajonería alta/baja y mesones funcionales")

    # Equipamiento y acabados
    equipamiento_items = []
    if "amoblado" in titulo_curado.lower():
        equipamiento_items.append("Completamente amoblado y equipado con mobiliario contemporáneo")
    else:
        equipamiento_items.append("Cajonería empotrada y roperos terminados")
    if parqueos > 0:
        equipamiento_items.append(f"{parqueos} parqueo(s) privado(s) asignado(s)")
    else:
        equipamiento_items.append("Opción a garaje o estacionamiento para visitas en el entorno")

    # Áreas comunes y amenidades
    amenidades_validas = [a.strip().capitalize() for a in amenidades_list if a.strip() and len(a.strip()) > 2]
    if not amenidades_validas:
        amenidades_validas = ["Seguridad 24/7 y control de acceso", "Ascensores de alta velocidad"]

    areas_items = [
        f"Amenidades y servicios: {', '.join(amenidades_validas[:5])}",
        f"Ubicación estratégica en {zona_label}, con acceso inmediato a cafeterías, centros comerciales y transporte",
    ]

    # Construir texto final estructurado
    distribucion_txt = "\n".join(f"• {item}" for item in distribucion_items)
    equipamiento_txt = "\n".join(f"• {item}" for item in equipamiento_items)
    areas_txt = "\n".join(f"• {item}" for item in areas_items)

    c21_ref = f"Gestión en alianza con {oficina_c21} (Red Century 21 Bolivia)" if oficina_c21 else "Red Century 21 Bolivia"

    descripcion = (
        f"{hook}\n\n"
        f"Distribución & Espacios:\n"
        f"{distribucion_txt}\n\n"
        f"Equipamiento & Confort:\n"
        f"{equipamiento_txt}\n\n"
        f"Áreas Comunes & Entorno:\n"
        f"{areas_txt}\n\n"
        f"Contacto & Asesoría:\n"
        f"• Asesor comercial exclusivo: Alejandro Coca (+591 57015854) · Gestión Inmobiliaria N.I.A.\n"
        f"• {c21_ref}"
    )

    return descripcion


def curate_all_c21_properties():
    print("Iniciando curaduría editorial de inmuebles Century 21...")
    with SessionLocal() as db:
        c21_inmuebles = db.query(InmuebleDB).filter(
            InmuebleDB.datos_especificos_json.contains('"inmobiliaria": "Century 21"') |
            InmuebleDB.datos_especificos_json.contains('c21_id') |
            InmuebleDB.datos_especificos_json.contains('Century 21')
        ).all()

        total = len(c21_inmuebles)
        print(f"Total inmuebles C21 a curar: {total}")

        updated_count = 0
        for inm in c21_inmuebles:
            datos_esp = {}
            if inm.datos_especificos_json:
                try:
                    datos_esp = json.loads(inm.datos_especificos_json)
                except Exception:
                    pass

            oficina_nombre = datos_esp.get("oficina") or "Century 21 Bolivia"
            parqueos = datos_esp.get("parqueos") or inm.parqueos or 0

            amenidades_list = []
            if inm.amenidades:
                amenidades_list = [a.strip() for a in inm.amenidades.split(",") if a.strip()]

            # 1. Título editorial limpio
            raw_title = inm.titulo or ""
            # Guardamos el título original en datos_especificos_json si no existía
            if "titulo_original_c21" not in datos_esp:
                datos_esp["titulo_original_c21"] = raw_title

            new_title = clean_c21_title(
                raw_title=raw_title,
                tipo_inmueble=inm.tipo_inmueble or "Departamento",
                habitaciones=inm.habitaciones or 2,
                zona=inm.zona or "Santa Cruz",
                amoblado=bool(inm.amoblado),
            )
            inm.titulo = new_title

            # 2. Descripción editorial estructurada
            new_desc = generate_executive_description(
                titulo_curado=new_title,
                operacion=inm.operacion or "Alquilar",
                tipo=inm.tipo_inmueble or "Departamento",
                habitaciones=inm.habitaciones or 2,
                banos=inm.banos or 1,
                superficie_m2=float(inm.superficie_m2 or 0.0),
                zona=inm.zona or "Santa Cruz",
                parqueos=parqueos,
                amenidades_list=amenidades_list,
                oficina_c21=oficina_nombre,
            )
            inm.descripcion = new_desc

            # 3. Priorización y limpieza de imágenes
            if inm.imagenes:
                img_urls = [u.strip() for u in inm.imagenes.split(",") if u.strip()]
                # Deduplicar preservando orden
                dedup_imgs = []
                seen = set()
                for u in img_urls:
                    if u not in seen:
                        seen.add(u)
                        dedup_imgs.append(u)
                inm.imagenes = ", ".join(dedup_imgs)

            # 4. Actualizar search_text para búsquedas con IA
            search_parts = [
                new_title.lower(),
                (inm.tipo_inmueble or "").lower(),
                (inm.operacion or "").lower(),
                (inm.zona or "").lower(),
                (inm.ciudad or "").lower(),
                (inm.amenidades or "").lower(),
                "century 21",
                oficina_nombre.lower(),
            ]
            inm.search_text = " ".join(p for p in search_parts if p)

            inm.datos_especificos_json = json.dumps(datos_esp, ensure_ascii=False)
            updated_count += 1

        db.commit()
        print(f"Curaduría completada: {updated_count} inmuebles actualizados en la base de datos.")

        # 5. Exportar snapshot actualizado
        print("Regenerando catalog-snapshot.json...")
        export_catalog_snapshot(db)
        print("¡Proceso finalizado con éxito!")


if __name__ == "__main__":
    curate_all_c21_properties()
