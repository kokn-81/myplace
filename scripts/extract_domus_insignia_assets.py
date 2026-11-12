"""Extract official Insignia renders without old surface captions or cropped rooms.

Source: Drive brochure 1-iHC0tJkWY7guIcr-PwgXGwi3KC-jloa (35 pages).
The linked renders folder contains only an empty subfolder as of 2026-11-12.
"""
import argparse
from pathlib import Path

import pymupdf
from PIL import Image, ImageOps

from extract_domus_black_assets import render_page, save_jpeg
from extract_domus_onix_assets import embedded, paste_contained

# Family, complete isometric, interior photo, interior strip.
FAMILIES = [
    ("a", 4814, 4811, 4812), ("b", 4823, 4820, 4821),
    ("c", 4831, 4827, 4829), ("d", 4842, 4839, 4840),
    ("e", 4850, 4847, 4848), ("f", 4859, 4856, 4857),
    ("g", 4868, 4865, 4866), ("h", 4875, 4872, 4873),
    ("i", 4882, 4879, 4880), ("j", 4890, 4887, 4888),
    ("k", 4897, 4894, 4895),
]
SOCIAL = {
    "piscina": 234, "gimnasio": 248, "sala-tv": 221,
    "cowork": 230, "reuniones": 225, "churrasquera": 239,
    "salon-multifuncional": 244, "galeria-piscina": 235, "lobby": 122,
}


def rendered_crop(doc, page, box):
    pix = doc[page - 1].get_pixmap(matrix=pymupdf.Matrix(2.4, 2.4), clip=pymupdf.Rect(box), alpha=False)
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--brochure", required=True, type=Path)
    parser.add_argument("--out", type=Path, default=Path("frontend/public/domus/domus_insignia"))
    args = parser.parse_args()
    doc = pymupdf.open(args.brochure)
    assert len(doc) == 35, "Review a changed source before extraction"
    floors = {
        "a-g": rendered_crop(doc, 22, (175, 40, 835, 565)),
        "h-k": rendered_crop(doc, 23, (120, 35, 740, 545)),
    }
    for name, floor in floors.items():
        save_jpeg(ImageOps.expand(floor, border=24, fill="white"), args.out / "planos" / f"planta-{name}.jpg")
    overview = Image.new("RGB", (1400, 2100), "white")
    paste_contained(overview, floors["a-g"], (40, 35, 1360, 1035))
    paste_contained(overview, floors["h-k"], (40, 1070, 1360, 2070))
    save_jpeg(overview, args.out / "distribucion-modelos.jpg")
    for family, xref, interior, strip in FAMILIES:
        apartment = embedded(doc, xref)
        save_jpeg(ImageOps.expand(apartment, border=36, fill="white"), args.out / "modelos" / f"familia-{family}.jpg")
        sheet = Image.new("RGB", (1400, 1500), "white")
        paste_contained(sheet, apartment, (35, 25, 820, 760))
        paste_contained(sheet, embedded(doc, interior), (850, 45, 1360, 395))
        paste_contained(sheet, embedded(doc, strip), (850, 425, 1360, 735))
        paste_contained(sheet, floors["a-g" if family <= "g" else "h-k"], (40, 790, 1360, 1465))
        save_jpeg(sheet, args.out / "fichas" / f"familia-{family}.jpg")
    for name, xref in SOCIAL.items():
        save_jpeg(embedded(doc, xref), args.out / "amenidades" / f"{name}.jpg")
    save_jpeg(embedded(doc, 86), args.out / "fachada-oficial.jpg")
    # Keep the actual portfolio grid, omitting the old investment-promise copy.
    save_jpeg(rendered_crop(doc, 2, (15, 140, 920, 575)), args.out / "alborada-portafolio.jpg")
    for name, page in [("ubicacion-oficial", 4), ("equipamiento-domotico", 10), ("equipamiento-condominio", 9)]:
        render_page(doc, page, args.out / f"{name}.jpg")
    print(f"Extracted {len(FAMILIES)} apartment families, two floor diagrams, and {len(SOCIAL)} social renders")


if __name__ == "__main__":
    main()
