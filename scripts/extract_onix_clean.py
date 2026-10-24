import os
import pdfplumber
from PIL import Image

brochures_dir = r"C:\Users\10\.gemini\antigravity-ide\brain\ccee5865-ff7e-4ef3-a3fa-a721efde7fd4\scratch\domus_assets\real_brochures"
public_base = r"d:\NIA\frontend\public\domus\domus_onix"

onix_pdf = os.path.join(brochures_dir, "Laminas_Domus_Onix.pdf")
if os.path.exists(onix_pdf):
    with pdfplumber.open(onix_pdf) as pdf:
        im_p1 = pdf.pages[0].to_image(resolution=200).original.convert("RGB")
        im_p4 = pdf.pages[3].to_image(resolution=200).original.convert("RGB") # Area Social
        im_p13 = pdf.pages[12].to_image(resolution=200).original.convert("RGB") # Piscina
        
        im_p1.save(os.path.join(public_base, "planta_baja_clean.jpg"), quality=92)
        im_p4.save(os.path.join(public_base, "social_area_clean.jpg"), quality=92)
        im_p13.save(os.path.join(public_base, "social_piscina_clean.jpg"), quality=92)
        print("Domus Onix renders saved.")
