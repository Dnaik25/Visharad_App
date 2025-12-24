import sys
from pypdf import PdfReader

def extract_text(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        full_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"
        print(full_text)
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python extract_raw_text.py <pdf_path> <output_path>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    out_path = sys.argv[2]
    
    print(f"Extracting from {pdf_path} to {out_path}...")
    
    try:
        reader = PdfReader(pdf_path)
        full_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"
        
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(full_text)
            
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")
