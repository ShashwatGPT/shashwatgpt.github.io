import subprocess
import sys
try:
    from pypdf import PdfReader
except ImportError:
    try:
        from PyPDF2 import PdfReader
    except ImportError:
        PdfReader = None

def extract_image(path):
    print(f"--- Extracting {path} ---")
    try:
        res = subprocess.run(["tesseract", path, "stdout"], capture_output=True, text=True)
        print(res.stdout)
    except Exception as e:
        print("Tesseract failed:", e)

def extract_pdf(path):
    print(f"--- Extracting {path} ---")
    if PdfReader:
        try:
            reader = PdfReader(path)
            text = ""
            for p in reader.pages:
                text += p.extract_text() or ""
            if text.strip():
                print(text)
                return
        except Exception as e:
            print("PyPDF failed:", e)
    print("Trying pdf to text with tesseract? Actually let's try pdftotext or pdftoppm if available.")
    try:
        # if the pdf is an image, we can just let tesseract read it if ghostscript is there
        # wait, tesseract cannot directly read standard pdfs, let's see what happens.
        res = subprocess.run(["pdftotext", path, "-"], capture_output=True, text=True)
        if res.stdout.strip():
            print(res.stdout)
            return
    except:
        pass
    print("Could not extract PDF text nicely.")

extract_image("20240523_061525.jpg")
extract_image("20240523_061541.jpg")
extract_pdf("HealthPredict Hindi.pdf")

