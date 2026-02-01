import { ShlokBlock, RefItem } from '@/lib/types';

export function parseClassTxt(text: string): ShlokBlock[] {
    const lines = text.split(/\r?\n/);
    const blocks: ShlokBlock[] = [];

    let currentBlock: ShlokBlock | null = null;
    let currentSection: string | null = null;

    // Track reference counts for deduplication within the file
    const seenRefCounts: Record<string, number> = {};

    // Buffer for current reference being built
    let currentRef: RefItem | null = null;

    // Topic/Title tracking
    let currentTitle: string | null = null;

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
            currentTitle = null; // Reset title for new shlok
            continue;
        }

        // 1.5 Detect Title (Reference Topic)
        if (trimmed.startsWith('Title:')) {
            currentTitle = trimmed.substring(6).trim();
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
                if (!isBullet) continue; // Ignore non-bullet lines in Shlok section

                let content = trimmed.substring(2).trim();
                // Replace single danda '।' or single pipe '|' with newline to break the shlok lines
                // Ensure we don't break on double danda '॥' or double pipe '||'
                content = content.replace(/(?<![|])\|(?![|])/g, '\n').replace(/।/g, '\n');

                // Prevent line breaks inside shlok markers like "|| 8 ||" or "॥ 8 ॥"
                // Wrap them in a span with white-space: nowrap to guarantee they stay together
                content = content.replace(/([|॥]+\s+\d+(?:-\d+)?\s+[|॥]+)/g, '<span class="whitespace-nowrap">$1</span>');

                // Ignore empty bullets acting as separators
                if (!content) continue;

                if (currentBlock.shlokTransliteration) {
                    // We already have a transliteration (which was the last line seen so far).
                    // Move it to Sanskrit (append if needed), and make the new content the Transliteration.

                    if (currentBlock.shlokSanskrit) {
                        currentBlock.shlokSanskrit += '\n' + currentBlock.shlokTransliteration;
                    } else {
                        currentBlock.shlokSanskrit = currentBlock.shlokTransliteration;
                    }
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

                    // Handle duplicates: "Ref" -> "Ref (2)" -> "Ref (3)"
                    const baseRef = refText;
                    const count = seenRefCounts[baseRef] || 0;
                    seenRefCounts[baseRef] = count + 1;

                    let storedRef = baseRef;
                    if (count > 0) {
                        storedRef = `${baseRef} (${count + 1})`;
                    }

                    currentRef = {
                        ref: storedRef,
                        displayRef: baseRef,
                        text: '',
                        title: currentTitle || undefined
                    };
                } else {
                    // Continuation of current ref text
                    // Default to newlines for most references (Aarti, Asthak, Kirtan, etc.)
                    // Only use spaces for prose-heavy texts like Vachanamrut and Swamini Vato
                    const isProse = currentSection?.includes('Vachanamrut') || currentSection?.includes('Swamini Vato');
                    const joinChar = isProse ? ' ' : '\n';

                    // Strict WYSIWYG: Use the content exactly as it is in the file line
                    if (currentRef) {
                        currentRef.text = currentRef.text
                            ? currentRef.text + joinChar + trimmed
                            : trimmed;
                    }
                }
            }
        }
    }

    commitRef(); // Final commit

    return blocks;
}
