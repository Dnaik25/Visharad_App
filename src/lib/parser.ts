import { ShlokBlock, RefItem } from '@/lib/types';

export function parseClassTxt(text: string): ShlokBlock[] {
    const lines = text.split(/\r?\n/);
    const blocks: ShlokBlock[] = [];

    let currentBlock: ShlokBlock | null = null;
    let currentSection: string | null = null;

    // Buffer for current reference being built
    let currentRef: RefItem | null = null;

    // Helper to commit current ref to the current section
    const commitRef = () => {
        if (!currentRef || !currentBlock || !currentSection) return;

        // If generic section doesn't exist, init it
        if (!currentBlock.references[currentSection]) {
            currentBlock.references[currentSection] = [];
        }
        currentBlock.references[currentSection].push(currentRef);
        currentRef = null;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trimEnd();
        const trimmed = line.trim();
        if (!trimmed) continue;

        // 1. Detect Shlok Header
        // "Satsang Diksha Shlok <n>"
        const shlokMatch = trimmed.match(/^Satsang Diksha Shlok\s*(\d+(?:-\d+)?)/i);
        if (shlokMatch) {
            commitRef();

            currentBlock = {
                shlokNumber: parseInt(shlokMatch[1], 10) || 0,
                shlokSanskrit: null,
                shlokTransliteration: null,
                shlokAudioUrl: null,
                shlokExplanation: 'Coming soon',
                references: {}, // Generic Record
                referenceAudioUrlByKey: {}
            };
            blocks.push(currentBlock);
            currentSection = 'SHLOK';
            continue;
        }

        // 2. Detect Section Headers (Generic)
        // Look ahead for underline "---"
        if (i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            if (nextLine.startsWith('-----') || nextLine.startsWith('=====')) {
                // This line is a header
                commitRef();
                currentSection = trimmed; // Capture "Vachanamrut", "Swamini Vato", "Swaminarayan Siddhant Sudha"
                i++; // Skip the underline line
                continue;
            }
        }

        // Ignore separators if encountered alone
        if (trimmed.startsWith('-----') || trimmed.startsWith('=====')) continue;
        if (trimmed.startsWith('Class ')) continue;

        // 3. Handle Content based on section
        if (currentBlock && currentSection) {
            if (currentSection === 'SHLOK') {
                const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ');
                const content = isBullet ? trimmed.substring(2).trim() : trimmed;

                if (currentBlock.shlokTransliteration) {
                    // Second line found -> First becomes Sanskrit, Second is Transliteration
                    currentBlock.shlokSanskrit = currentBlock.shlokTransliteration;
                    currentBlock.shlokTransliteration = content;
                } else {
                    // First line found -> Tentatively Transliteration
                    currentBlock.shlokTransliteration = content;
                }
            }
            else {
                // Generic Reference Section Handling
                // Bullet detection
                if (line.trimStart().startsWith('•') || line.trimStart().startsWith('- ')) {
                    commitRef();

                    // Cleanup bullet char
                    let refText = trimmed;
                    if (refText.startsWith('•')) refText = refText.substring(1).trim();
                    else if (refText.startsWith('-')) refText = refText.substring(1).trim();

                    currentRef = {
                        ref: refText,
                        text: ''
                    };
                } else {
                    // Continuation of current ref text
                    if (currentRef) {
                        currentRef.text = currentRef.text
                            ? currentRef.text + '\n' + trimmed
                            : trimmed;
                    }
                }
            }
        }
    }

    commitRef(); // Final commit

    return blocks;
}
