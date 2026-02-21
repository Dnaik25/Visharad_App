
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(__dirname, '../public');

// Regex to match lines ending with (number) or (number-number), possibly with leading/trailing whitespace
// examples: " - Text here. (100)", " - Text here. (102-103)"
const TRANSLITERATION_REGEX = /^\s*-\s.*?\(\d+(?:-\d+)?\)\s*$/;

async function processFiles() {
    try {
        const files = fs.readdirSync(PUBLIC_DIR);

        for (const file of files) {
            if (file.startsWith('Class_') && file.endsWith('.txt')) {
                console.log(`Processing ${file}...`);
                const filePath = path.join(PUBLIC_DIR, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const lines = content.split('\n');

                let modifiedLines: string[] = [];
                let modified = false;

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (file === 'Class_27.txt' && i < 10) {
                        console.log(`DEBUG [${i}]: ${JSON.stringify(line)}`);
                    }
                    // check if line matches the transliteration pattern
                    // Primary pattern: ends with (number)
                    // Secondary pattern: starts with " - " but does NOT generally look like Sanskrit (which has || number || or ॥ number ॥)
                    const isShlokaBullet = /^\s*-\s/.test(line);
                    // Match ASCII pipes || or Devanagari Double Danda ॥ (which is one char usually, but we match 2 just in case they used single danda twice)
                    // Actually, Devanagari Double Danda is U+0965 (॥). Single is U+0964 (।).
                    // Sometimes double danda is written as two single dandas.
                    // We'll match [\|॥] which covers pipe and double danda (if treated as char class).
                    // Wait, inside [], | is literal? No, usually yes. But safer to escape.
                    // Also need to handle "||" (2 chars) vs "॥" (1 char).
                    // The simplest robust regex: ends with digits and some pipe-like chars.
                    const hasSanskritEnd = /([\|॥]{2}|॥)\s*\d+\s*([\|॥]{2}|॥)\s*$/.test(line);
                    const hasTransliterationEnd = /\(\d+(?:-\d+)?\)\s*$/.test(line);

                    if (file === 'Class_27.txt' && line.includes('(100)')) {
                        console.log(`DEBUG: Line: "${line}"`);
                        console.log(`DEBUG: Hex: ${Buffer.from(line).toString('hex')}`);
                        console.log(`DEBUG: isShlokaBullet=${isShlokaBullet}`);
                        console.log(`DEBUG: hasSanskritEnd=${hasSanskritEnd}`);
                        console.log(`DEBUG: hasTransliterationEnd=${hasTransliterationEnd}`);
                    }

                    // Remove if it looks like a transliteration (explicit number at end)
                    // OR if it's a bullet that is NOT Sanskrit (fallback for Class_1)
                    if (hasTransliterationEnd || (isShlokaBullet && !hasSanskritEnd)) {
                        console.log(`Removing from ${file}: ${line.trim()}`);
                        modified = true;
                    } else {
                        modifiedLines.push(line);
                    }
                }

                if (modified) {
                    fs.writeFileSync(filePath, modifiedLines.join('\n'), 'utf-8');
                    console.log(`Updated ${file}`);
                }
            }
        }
        console.log('Finished processing files.');

    } catch (error) {
        console.error('Error processing files:', error);
    }
}

processFiles();
