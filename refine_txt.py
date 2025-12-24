import os
import re

PUBLIC_DIR = "public"

def refine_txt_files():
    files = [f for f in os.listdir(PUBLIC_DIR) if f.startswith("Class_") and f.endswith(".txt")]
    files.sort()
    
    total_modified = 0
    shloks_1_bullet = 0
    shloks_2_bullet = 0
    anomalies = []

    for filename in files:
        filepath = os.path.join(PUBLIC_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        new_lines = []
        i = 0
        modified_file = False
        
        while i < len(lines):
            line = lines[i]
            # Check for Shlok Header
            match = re.match(r'^Satsang Diksha Shlok\s*(\d+(?:-\d+)?)', line.strip(), re.IGNORECASE)
            
            if match:
                shlok_ref = match.group(1)
                new_lines.append(line) # Header
                i += 1
                
                # Expect separator
                if i < len(lines) and re.match(r'^-+$', lines[i].strip()):
                    new_lines.append(lines[i])
                    i += 1
                
                # Now collect content lines until empty line or next section
                content_lines = []
                while i < len(lines):
                    curr = lines[i]
                    stripped = curr.strip()
                    
                    # Stop if next section or next shlok
                    if (re.match(r'^Vachanamrut', stripped, re.IGNORECASE) or 
                        re.match(r'^Swamini Vato', stripped, re.IGNORECASE) or
                        re.match(r'^Satsang Diksha Shlok', stripped, re.IGNORECASE)):
                        break
                    
                    if stripped and not stripped.startswith('Class '):
                         content_lines.append(stripped)
                    
                    # If it's just an empty line, preserve it but don't add to content if we want to be strict?
                    # Actually valid file format has blank lines between sections.
                    # We will re-insert them later.
                    i += 1
                
                # Process content lines
                # Filter out separators if any slipped in (shouldn't if logic is correct)
                # Filter out pure blank lines from content list
                
                cleaned_content = [c for c in content_lines if c and not c.startswith('---') and not c.startswith('===')]
                
                if len(cleaned_content) == 0:
                    anomalies.append(f"{filename} Shlok {shlok_ref}: 0 lines found")
                else:
                    # Apply bullets
                    for c in cleaned_content:
                        # Check if already bulleted to avoid double prefixing in case of re-run
                        if c.startswith('- ') or c.startswith('• '):
                             new_lines.append(c + "\n")
                        else:
                             new_lines.append(f" - {c}\n")
                             modified_file = True
                             
                    if len(cleaned_content) == 1:
                        shloks_1_bullet += 1
                    elif len(cleaned_content) == 2:
                        shloks_2_bullet += 1
                    else:
                        # Unusual case, but we just bullet them all
                        anomalies.append(f"{filename} Shlok {shlok_ref}: {len(cleaned_content)} lines found")
                
                # Add a blank line after shlok block if not present
                new_lines.append("\n")
                
            else:
                new_lines.append(line)
                i += 1
        
        # Write back
        if modified_file:
             total_modified += 1
             with open(filepath, 'w', encoding='utf-8') as f:
                 f.writelines(new_lines)

    print(f"Files Modified: {total_modified}")
    print(f"Shloks with 1 bullet: {shloks_1_bullet}")
    print(f"Shloks with 2 bullets: {shloks_2_bullet}")
    for a in anomalies:
        print(f"Anomaly: {a}")

if __name__ == "__main__":
    refine_txt_files()
