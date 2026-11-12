"""Extract the official Onix brochure (Drive 1x7DKcHymwGKUx9dVC4T-72a1HjKVuFm3).

Keep transparent apartment silhouettes on white and preserve full balconies.
Family sheets omit printed surface captions: the current unit list is the source
for areas, including the floor-4 slabs and the penthouse surface correction.
"""
import argparse
import io
from pathlib import Path

import pymupdf
from PIL import Image, ImageDraw, ImageOps

from extract_domus_black_assets import render_page, save_jpeg

# Family, full apartment, floor position, interior render.
FAMILIES = [
    ("a", 149, 275, 147), ("b", 158, 156, 153),
    ("c", 164, 167, 162), ("d", 176, 174, 171),
    ("e", 183, 186, 181), ("f", 195, 193, 190),
    ("g", 202, 205, 200), ("h", 214, 212, 209),
]
SOCIAL = {
    "piscina-panoramica": 109, "jacuzzi": 83, "saunas": 82,
    "gimnasio": 99, "cowork": 104, "juegos": 105,
    "churrasquera": 120, "cocina-gourmet": 88,
    "eventos": 89, "terraza-zen": 93, "cafeteria": 52, "lobby": 46,
}


def embedded(doc, xref):
    data = doc.extract_image(xref)
    rgba = Image.open(io.BytesIO(data["image"])).convert("RGBA")
    if data.get("smask"):
        mask = Image.open(io.BytesIO(doc.extract_image(data["smask"])["image"])).convert("L")
        rgba.putalpha(mask.resize(rgba.size, Image.Resampling.LANCZOS))
    background = Image.new("RGBA", rgba.size, "white")
    return Image.alpha_composite(background, rgba).convert("RGB")


def paste_contained(canvas, image, box):
    left, top, right, bottom = box
    image = ImageOps.contain(image, (right - left, bottom - top))
    canvas.paste(image, (left + (right - left - image.width) // 2,
                         top + (bottom - top - image.height) // 2))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--brochure", required=True, type=Path)
    parser.add_argument("--out", type=Path, default=Path("frontend/public/domus/domus_onix"))
    args = parser.parse_args()
    doc = pymupdf.open(args.brochure)
    assert len(doc) == 34, "Review a changed source before extraction"
    overview = Image.new("RGB", (860, 1480), "white")
    draw = ImageDraw.Draw(overview)
    for index, (family, iso_ref, floor_ref, interior_ref) in enumerate(FAMILIES):
        apartment, floor = embedded(doc, iso_ref), embedded(doc, floor_ref)
        save_jpeg(ImageOps.expand(apartment, border=32, fill="white"), args.out / "modelos" / f"familia-{family}.jpg")
        save_jpeg(ImageOps.expand(floor, border=24, fill="white"), args.out / "planos" / f"familia-{family}.jpg")
        sheet = Image.new("RGB", (1000, 1250), "white")
        paste_contained(sheet, apartment, (40, 30, 960, 740))
        paste_contained(sheet, floor, (40, 780, 420, 1090))
        paste_contained(sheet, embedded(doc, interior_ref), (450, 780, 960, 1090))
        save_jpeg(sheet, args.out / "fichas" / f"familia-{family}.jpg")
        left, top = index % 2 * 430, index // 2 * 370
        draw.text((left + 25, top + 15), f"Familia {family.upper()}", fill="#816127", font_size=22)
        paste_contained(overview, floor, (left + 25, top + 55, left + 405, top + 350))
    save_jpeg(overview, args.out / "distribucion-modelos.jpg")
    for name, xref in SOCIAL.items():
        save_jpeg(embedded(doc, xref), args.out / "amenidades" / f"{name}.jpg")
    # The clean daytime facade is the same across hero, map card and OG preview.
    save_jpeg(embedded(doc, 56), args.out / "fachada-oficial.jpg")
    for name, page in [("alborada-portafolio", 2), ("ubicacion-oficial", 4),
                       ("equipamiento-departamentos", 22), ("equipamiento-condominio", 23)]:
        render_page(doc, page, args.out / f"{name}.jpg")
    print(f"Extracted {len(FAMILIES)} model families and {len(SOCIAL)} social renders")


if __name__ == "__main__":
    main()
