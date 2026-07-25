import os
import re
from pypdf import PdfReader

SRC_DIR = 'src'
PUBLIC_DIR = 'public'

def is_gujarati(text):
    # Gujarati Unicode block is U+0A80 to U+0AFF
    for char in text:
        if '\u0A80' <= char <= '\u0AFF':
            return True
    return False

def clean_text(text):
    return text.strip()

def process_file(filename):
    if not filename.endswith('.pdf'):
        return None
    
    file_path = os.path.join(SRC_DIR, filename)
    try:
        reader = PdfReader(file_path)
    except Exception as e:
        return f"Error reading {filename}: {e}"

    class_match = re.search(r'Class\s*(\d+)', filename, re.IGNORECASE)
    if not class_match:
        # Fallback: try to find "Class X" in the text later? 
        # For now, let's assume filename has it or we skip/log error as per instructions.
        # But wait, identifying class input is step 2.
        # "Identify class inputs (e.g., SD Class 1 Mukhpath.pdf, Class1.pdf)"
        return f"Skipped {filename}: Could not identify Class number from filename."

    class_num = class_match.group(1)
    
    # Extraction and Categorization
    
    # Store references. Structure:
    # { 'Satsang Diksha Shlok': [], 'Vachanamrut': [], 'Swamini Vato': [] }
    # Current category state
    
    references = {
        'Satsang Diksha Shlok': [], # List of {ref, text}
        'Vachanamrut': [],
        'Swamini Vato': []
    }
    
    full_text = ""
    for page in reader.pages:
        text = page.extract_text()
        if text:
            full_text += text + "\n"
            
    lines = full_text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Ignore Gujarati lines
        if is_gujarati(line):
            continue
            
        # Check for bracket patterns
        # We assume line is like "(Ref) Text" or "Text (Ref)" or just "(Ref)"
        matches = list(re.finditer(r'\(([^)]+)\)', line))
        
        if not matches:
            continue
            
        # Simplistic assumption: One reference per line usually, or we take the first one?
        # If multiple matches, we might process each? 
        # But text assignment is tricky.
        # Let's handle the first match for the line context.
        
        match = matches[0]
        ref_content = match.group(1).strip()
        
        # Extract Text: Remove the reference part from the line
        text_content = line.replace(match.group(0), "").strip()
        
        # If text is empty, check if it's in the reference itself? No.
        # Maybe the line was just the reference and text is on parsing (not handled yet).
        # For now, if text is empty, we keep it empty or try to recover?
        # The user example implies text exists.
        
        item = {'ref': ref_content, 'text': text_content}
        
        # Logic to classify
        # Check for Satsang Diksha (numbers only)
        if re.match(r'^\d+$', ref_content) or re.match(r'^\d+[-,\s]+\d+$', ref_content):
            references['Satsang Diksha Shlok'].append(item)
            
        # Check for Swamini Vato
        elif re.match(r'^\d+/\d+$', ref_content) or 'swamini vato' in ref_content.lower() or 'swā.vāto' in ref_content.lower():
             references['Swamini Vato'].append(item)
             
        # Check for Vachanamrut (Default)
        else:
            references['Vachanamrut'].append(item)

    # Generate Output
    output_lines = []
    output_lines.append(f"Class {class_num}")
    output_lines.append("======") 
    output_lines.append("")
    
    # Helper to clean text (remove extra spaces)
    def clean_t(t):
        return " ".join(t.split())

    # Satsang Diksha Section
    if references['Satsang Diksha Shlok']:
        output_lines.append("Satsang Diksha Shlok")
        output_lines.append("-------------------")
        for i, item in enumerate(references['Satsang Diksha Shlok'], 1):
            # Format: 1. Text
            # Note: Ref (the number) is typically redundant if we number the list.
            # Example: "1. Swaminarayan..." (Ref was likely "1").
            # If Ref was "1-2", maybe we should include it?
            # Example shows just "1. Text". I will use the loop index and the text.
            # If text is missing, I'll put [No text found] or similar for debug, or just the ref?
            # Better to put content.
            txt = clean_t(item['text'])
            if not txt: txt = f"[Text missing, ref: {item['ref']}]"
            output_lines.append(f"{i}. {txt}")
            output_lines.append("") # Blank line between items
        output_lines.append("") # Blank line after section

    # Vachanamrut Section
    if references['Vachanamrut']:
        output_lines.append("Vachanamrut")
        output_lines.append("-----------")
        for item in references['Vachanamrut']:
            # Format:
            # • Ref
            #   Text
            txt = clean_t(item['text'])
            if not txt: txt = "[Text missing]"
            output_lines.append(f"• {item['ref']}")
            output_lines.append(f"  {txt}")
            output_lines.append("")
        output_lines.append("")

    # Swamini Vato Section
    if references['Swamini Vato']:
        output_lines.append("Swamini Vato")
        output_lines.append("------------")
        for item in references['Swamini Vato']:
            # Format:
            # • Ref
            #   Text
            txt = clean_t(item['text'])
            if not txt: txt = "[Text missing]"
            output_lines.append(f"• {item['ref']}")
            output_lines.append(f"  {txt}")
            output_lines.append("")
        output_lines.append("")
    
    output_content = "\n".join(output_lines).strip() + "\n" # Ensure single trailing newline
    
    output_filename = f"Class_{class_num}.txt"
    output_path = os.path.join(PUBLIC_DIR, output_filename)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output_content)
        
    return f"Processed Class {class_num} -> {output_path}"

def main():
    if not os.path.exists(SRC_DIR):
        print(f"Error: {SRC_DIR} directory not found.")
        return

    if not os.path.exists(PUBLIC_DIR):
        os.makedirs(PUBLIC_DIR)
        
    results = {
        'classes_processed': 0,
        'files_written': 0,
        'files_skipped': 0,
        'errors': []
    }

    files = os.listdir(SRC_DIR)
    
    for f in files:
        res = process_file(f)
        if res:
            if res.startswith("Processed"):
                results['classes_processed'] += 1
                results['files_written'] += 1
            elif res.startswith("Skipped"):
                 results['files_skipped'] += 1
            elif res.startswith("Error"):
                 results['errors'].append(res)
    
    # Per user request: Only return a summary object
    print(results)

if __name__ == "__main__":
    main()
