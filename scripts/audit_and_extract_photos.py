import os
import pdfplumber

brochures_dir = r"C:\Users\10\.gemini\antigravity-ide\brain\ccee5865-ff7e-4ef3-a3fa-a721efde7fd4\scratch\domus_assets\real_brochures"

brochures = [
    "Brochure_Infinity.pdf",
    "Brochure_Insignia.pdf",
    "Brochure_Luxury.pdf",
    "Brochure_Tower.pdf",
    "Laminas_Domus_Onix.pdf",
]

for pdf_name in brochures:
    pdf_path = os.path.join(brochures_dir, pdf_name)
    if not os.path.exists(pdf_path):
        continue
    with pdfplumber.open(pdf_path) as pdf:
        print(f"\n=================== {pdf_name} (Total: {len(pdf.pages)} pages) ===================")
        for i in range(min(16, len(pdf.pages))):
            page = pdf.pages[i]
            text = (page.extract_text() or "").strip().replace('\n', ' ')
            first_words = text[:90] if text else "[NO TEXT / FULL IMAGE]"
            print(f"  Page {i+1}: {len(page.images)} imgs | {first_words}")
