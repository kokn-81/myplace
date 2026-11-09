"""Extract DOMUS Gold assets from the official 33-page brochure.

Source: Drive file 15oGaN86t2c69OaGZ3qX9ThN5-8kUJD2y.
Images are taken from the PDF; unit prices, areas and bedrooms remain
in the official inventory because some brochure captions contain errors.
"""
import argparse
import json
from pathlib import Path

import pymupdf
from PIL import ImageOps

from extract_domus_black_assets import embedded, render_page, save_jpeg

FAMILIES = [
    ("a", 330, 590), ("b", 338, 585), ("c", 343, 595),
    ("d", 353, 590), ("e", 358, 600), ("f", 363, 600),
    ("g", 371, 600), ("h", 376, 590), ("i", 381, 600),
]
SOCIAL_IMAGES = {
    "piscina-exterior": 269, "piscina-jacuzzi": 277,
    "gimnasio": 280, "cowork": 287, "juegos": 285,
    "churrasquera": 275, "sala-tv": 254, "eventos": 259,
    "cafeteria": 220, "lobby": 214,
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--brochure", required=True, type=Path)
    parser.add_argument("--out", type=Path, default=Path("frontend/public/domus/domus_gold"))
    parser.add_argument("--shared-out", type=Path, default=Path("frontend/public/domus/alborada"))
    args = parser.parse_args()
    doc = pymupdf.open(args.brochure)
    assert len(doc) == 33, "Review a revised brochure before extraction"
    for family, xref, split in FAMILIES:
        complete = embedded(doc, xref)
        # Leave the small plan fragments at the right out of the 3D preview.
        preview_right = {"a": 570, "d": 570, "e": 575, "h": 570}.get(family, split)
        apartment = complete.crop((0, 0, preview_right, complete.height))
        plans = complete.crop((split, 0, complete.width, complete.height))
        save_jpeg(ImageOps.expand(apartment, border=24, fill="white"), args.out / "modelos" / f"familia-{family}.jpg")
        save_jpeg(ImageOps.expand(plans, border=18, fill="white"), args.out / "planos" / f"familia-{family}.jpg")
        save_jpeg(ImageOps.expand(complete, border=24, fill="white"), args.out / "fichas" / f"familia-{family}.jpg")
    for name, xref in SOCIAL_IMAGES.items():
        save_jpeg(embedded(doc, xref), args.out / "amenidades" / f"{name}.jpg")
    for name, page in [
        ("alborada-portafolio", 2), ("ubicacion-oficial", 5),
        ("equipamiento-departamentos", 23), ("equipamiento-condominio", 25),
    ]:
        render_page(doc, page, args.out / f"{name}.jpg")
    save_jpeg(ImageOps.expand(embedded(doc, 188), border=24, fill="white"), args.out / "distribucion-edificio.jpg")
    render_page(doc, 8, args.shared_out / "furnished.jpg")
    print(json.dumps({"families": len(FAMILIES), "social_images": len(SOCIAL_IMAGES), "output": str(args.out)}))


if __name__ == "__main__":
    main()
