import os
import pdfplumber
from PIL import Image

brochures_dir = r"C:\Users\10\.gemini\antigravity-ide\brain\ccee5865-ff7e-4ef3-a3fa-a721efde7fd4\scratch\domus_assets\real_brochures"
public_base = r"d:\NIA\frontend\public\domus"

# 1. DOMUS TOWER
# Page 2 has the full building render, Page 8 has the tower façade, Page 9-14 have amenities
tower_pdf = os.path.join(brochures_dir, "Brochure_Tower.pdf")
if os.path.exists(tower_pdf):
    with pdfplumber.open(tower_pdf) as pdf:
        # Full tower render: Page 2 or Page 8
        im_page2 = pdf.pages[1].to_image(resolution=200).original.convert("RGB")
        im_page8 = pdf.pages[7].to_image(resolution=200).original.convert("RGB")
        im_page9 = pdf.pages[8].to_image(resolution=200).original.convert("RGB") # amenities cowork/sauna/pool
        im_page10 = pdf.pages[9].to_image(resolution=200).original.convert("RGB")
        im_page11 = pdf.pages[10].to_image(resolution=200).original.convert("RGB")
        
        # Save clean pages
        im_page2.save(os.path.join(public_base, "domus_tower", "fachada_torre_clean.jpg"), quality=92)
        im_page8.save(os.path.join(public_base, "domus_tower", "fachada_perspectiva_clean.jpg"), quality=92)
        im_page9.save(os.path.join(public_base, "domus_tower", "social_cowork_pool.jpg"), quality=92)
        im_page10.save(os.path.join(public_base, "domus_tower", "social_amenities_02.jpg"), quality=92)
        im_page11.save(os.path.join(public_base, "domus_tower", "social_amenities_03.jpg"), quality=92)
        print("Domus Tower renders saved.")

# 2. DOMUS LUXURY
luxury_pdf = os.path.join(brochures_dir, "Brochure_Luxury.pdf")
if os.path.exists(luxury_pdf):
    with pdfplumber.open(luxury_pdf) as pdf:
        im_page5 = pdf.pages[4].to_image(resolution=200).original.convert("RGB") # Façade
        im_page6 = pdf.pages[5].to_image(resolution=200).original.convert("RGB") # Lobby
        im_page12 = pdf.pages[11].to_image(resolution=200).original.convert("RGB") # Áreas sociales
        im_page13 = pdf.pages[12].to_image(resolution=200).original.convert("RGB") # Sala TV
        im_page14 = pdf.pages[13].to_image(resolution=200).original.convert("RGB") # Cowork & Juegos
        im_page15 = pdf.pages[14].to_image(resolution=200).original.convert("RGB") # Cine
        im_page16 = pdf.pages[15].to_image(resolution=200).original.convert("RGB") # Gym
        
        im_page5.save(os.path.join(public_base, "domus_luxury", "fachada_luxury_clean.jpg"), quality=92)
        im_page6.save(os.path.join(public_base, "domus_luxury", "lobby_luxury.jpg"), quality=92)
        im_page12.save(os.path.join(public_base, "domus_luxury", "social_areas.jpg"), quality=92)
        im_page13.save(os.path.join(public_base, "domus_luxury", "social_tv.jpg"), quality=92)
        im_page14.save(os.path.join(public_base, "domus_luxury", "social_cowork.jpg"), quality=92)
        im_page15.save(os.path.join(public_base, "domus_luxury", "social_cine.jpg"), quality=92)
        im_page16.save(os.path.join(public_base, "domus_luxury", "social_gym.jpg"), quality=92)
        print("Domus Luxury renders saved.")

# 3. DOMUS INFINITY
infinity_pdf = os.path.join(brochures_dir, "Brochure_Infinity.pdf")
if os.path.exists(infinity_pdf):
    with pdfplumber.open(infinity_pdf) as pdf:
        im_page5 = pdf.pages[4].to_image(resolution=200).original.convert("RGB") # Façade
        im_page6 = pdf.pages[5].to_image(resolution=200).original.convert("RGB") # Lobby
        im_page12 = pdf.pages[11].to_image(resolution=200).original.convert("RGB") # Sala de uso múltiple
        im_page13 = pdf.pages[12].to_image(resolution=200).original.convert("RGB") # Lounge
        im_page14 = pdf.pages[13].to_image(resolution=200).original.convert("RGB") # Gym
        im_page16 = pdf.pages[15].to_image(resolution=200).original.convert("RGB") # Churrasqueras
        
        im_page5.save(os.path.join(public_base, "domus_infinity", "fachada_infinity_clean.jpg"), quality=92)
        im_page6.save(os.path.join(public_base, "domus_infinity", "lobby_infinity.jpg"), quality=92)
        im_page12.save(os.path.join(public_base, "domus_infinity", "social_multiuso.jpg"), quality=92)
        im_page13.save(os.path.join(public_base, "domus_infinity", "social_lounge.jpg"), quality=92)
        im_page14.save(os.path.join(public_base, "domus_infinity", "social_gym.jpg"), quality=92)
        im_page16.save(os.path.join(public_base, "domus_infinity", "social_churrasqueras.jpg"), quality=92)
        print("Domus Infinity renders saved.")

# 4. DOMUS INSIGNIA
insignia_pdf = os.path.join(brochures_dir, "Brochure_Insignia.pdf")
if os.path.exists(insignia_pdf):
    with pdfplumber.open(insignia_pdf) as pdf:
        im_page5 = pdf.pages[4].to_image(resolution=200).original.convert("RGB") # Façade render
        im_page6 = pdf.pages[5].to_image(resolution=200).original.convert("RGB") # Lobby
        im_page8 = pdf.pages[7].to_image(resolution=200).original.convert("RGB") # Façade 2
        im_page13 = pdf.pages[12].to_image(resolution=200).original.convert("RGB") # Sala TV
        im_page14 = pdf.pages[13].to_image(resolution=200).original.convert("RGB") # Cowork
        im_page15 = pdf.pages[14].to_image(resolution=200).original.convert("RGB") # Cine
        im_page16 = pdf.pages[15].to_image(resolution=200).original.convert("RGB") # Piscina
        
        im_page5.save(os.path.join(public_base, "domus_insignia", "fachada_insignia_clean.jpg"), quality=92)
        im_page6.save(os.path.join(public_base, "domus_insignia", "lobby_insignia.jpg"), quality=92)
        im_page8.save(os.path.join(public_base, "domus_insignia", "fachada_perspectiva.jpg"), quality=92)
        im_page13.save(os.path.join(public_base, "domus_insignia", "social_tv.jpg"), quality=92)
        im_page14.save(os.path.join(public_base, "domus_insignia", "social_cowork.jpg"), quality=92)
        im_page15.save(os.path.join(public_base, "domus_insignia", "social_cine.jpg"), quality=92)
        im_page16.save(os.path.join(public_base, "domus_insignia", "social_piscina.jpg"), quality=92)
        print("Domus Insignia renders saved.")
