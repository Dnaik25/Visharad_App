import re

INPUT_FILE = "temp_class6.txt"
OUTPUT_FILE = "public/Class_6.txt"

def is_roman_text(text):
    """
    Returns True if the text contains mostly Latin characters.
    Returns False if it contains Gujarati or Devangari script characters logic.
    Simple heuristic: Check for Gujarati unicode block (0A80-0AFF) or Devanagari (0900-097F).
    If found, return False.
    """
    # Gujarati Block
    if re.search(r'[\u0A80-\u0AFF]', text):
        return False
    # Devanagari Block (optional, user said "English only", typically excluding Sanskrit script too if requested English text)
    # The Prompt said: "English/roman-script text (A–Z, a–z... diacritics like ā/ī/ū are OK)."
    # "Do NOT output Gujarati script..."
    # "Sanskrit line if present" -> The Shlok section explicitly asks for Sanskrit line.
    # But usually Shlok Sanskrit is Romanized in previous files? 
    # Class 1 example: "Swāminārāyaṇah..." (Roman).
    # Current Class 6 has "सत्सङ्गा..." (Devanagari) AND Roman.
    # The user instruction said:
    # "Satsang Diksha Shlok <k>
    #  -----------------------
    #  - <Sanskrit line if present>
    #  - <Transliteration line if present>"
    # And "extract and keep ONLY the English/roman-script... Do NOT include any Gujarati-script text."
    # It implies we should keep the Romanized Sanskrit and Romanized Transliteration.
    # Exclude Devanagari? 
    # Let's be safe and exclude lines with Devanagari if they are distinct lines?
    # BUT wait, the prompt specifically said "Do NOT include any Gujarati-script text."
    # Let's strictly block Gujarati.
    # I will also block Devanagari to be safe for "English-only" requirement for references.
    
    if re.search(r'[\u0A80-\u0AFF]', text): # Gujarati
        return False
    if re.search(r'[\u0900-\u097F]', text): # Devanagari
        return False
        
    return True

def parse_and_generate():
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    clean_lines = [l.strip() for l in lines if l.strip()]
    return parse_with_buffer(clean_lines)

def parse_with_buffer(lines):
    output = []
    output.append("Class 6\n======\n")
    
    text_buffer = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # 1. SHLOK DETECTION
        # The raw text has Devanagari lines ending in || num ||
        # And Roman text afterwards.
        # We want to SKIP the Devanagari line but capture the numbering?
        # OR: Does the Roman line have numbering?
        # Line 8: "Satsangā’dhik ṛ utah... ॥ 12 ॥" -> Wait, does Roman line have danda?
        # In `temp_class6.txt` (viewed earlier):
        # Line 8: "Satsangā’dhik ṛ utah... ॥ 12 ॥" -> Yes!
        
        # So we can just detect the Roman Shlok line directly?
        # Regex for Roman line with Shlok number at end:
        # Ends with "॥ <digits> ॥" OR "(<digits>)"?
        # Let's look at `temp_class6.txt` again.
        # Line 8: "... ॥ 12 ॥"
        # Line 10: "... (12)"
        
        # Strategy:
        # If line ends in "॥ <d> ॥" AND is_roman(line) -> This is Sanskrit Shlok Line.
        # If line ends in "(<d>)" AND is_roman(line) -> This is Translit Shlok Line.
        
        sanskrit_rom_match = re.search(r'॥\s*(\d+(?:-\d+)?)\s*॥$', line)
        
        if sanskrit_rom_match and is_roman_text(line):
            text_buffer = [] # Flush buffer on shlok boundary
            shlok_num = sanskrit_rom_match.group(1)
            output.append(f"\nSatsang Diksha Shlok {shlok_num}\n")
            output.append("---------------------\n")
            output.append(f" - {line}\n")
            
            # Check next line for translit
            if i + 1 < len(lines):
                next_line = lines[i+1]
                if re.search(r'\(\d+(?:-\d+)?\)$', next_line) and is_roman_text(next_line):
                     output.append(f" - {next_line}\n")
                     i += 1
            output.append("\n")
            i += 1
            continue
            
        # 2. REFERENCE DETECTION
        # A) Vachanamrut
        vach_match = re.search(r'\((Vach\.[^)]+)\)$', line)
        if vach_match and is_roman_text(line):
            ref_label = vach_match.group(1)
            content = line.replace(vach_match.group(0), "").strip().strip('"')
            # Check buffer for preceding content
            if not content and text_buffer:
                # Filter buffer for English only!
                valid_buffer = [b for b in text_buffer if is_roman_text(b)]
                content = " ".join(valid_buffer)
                text_buffer = []

            if content: # Only add if content exists
                output.append("Vachanamrut\n-----------\n")
                output.append(f"• {ref_label}\n")
                output.append(f"  {content}\n\n")
            i += 1
            continue

        # B) Swamini Vato
        sv_match = re.search(r'\((Swā\.Vāto:[^)]+)\)$', line)
        if sv_match and is_roman_text(line):
            ref_label = sv_match.group(1)
            content = line.replace(sv_match.group(0), "").strip().strip('"')
            if not content and text_buffer:
                valid_buffer = [b for b in text_buffer if is_roman_text(b)]
                content = " ".join(valid_buffer)
                text_buffer = []

            if content:
                output.append("Swamini Vato\n------------\n")
                output.append(f"• {ref_label}\n")
                output.append(f"  {content}\n\n")
            i += 1
            continue

        # C) Siddhant Sudha
        if ("- Swaminarayan Siddhant Sudha -" in line or "Swaminarayan Siddhant Sudha" in line) and is_roman_text(line):
            if text_buffer:
                valid_buffer = [b for b in text_buffer if is_roman_text(b)]
                content = "\n  ".join(valid_buffer)
                text_buffer = []
            else:
                content = ""
            
            num_match = re.search(r'-\s*(\d+)$', line)
            num = num_match.group(1) if num_match else "Ref"
            
            if content: 
                 output.append("Swaminarayan Siddhant Sudha\n---------------------------\n")
                 output.append(f"• {num}\n")
                 output.append(f"  {content}\n\n")
            i += 1
            continue
            
        # D) Kirtan Authors
        if ("Sadguru Premanand Swami" in line or "Sadguru Nishkulanand Swami" in line) and is_roman_text(line):
            source = line.strip()
            # Content is in buffer
            valid_buffer = [b for b in text_buffer if is_roman_text(b)]
            content = "\n  ".join(valid_buffer)
            text_buffer = []
            
            if content:
                output.append(f"{source}\n" + "-"*len(source) + "\n")
                output.append(f"• Kirtan\n")
                output.append(f"  {content}\n\n")
            i += 1
            continue
            
        # BUFFER
        text_buffer.append(line)
        i += 1
        
    return output

if __name__ == "__main__":
    final_lines = parse_and_generate()
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.writelines(final_lines)
    print(f"Generated {OUTPUT_FILE}")
