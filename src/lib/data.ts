import fs from 'fs';
import path from 'path';
import { parseClassTxt } from './parser';
import { ShlokBlock } from './types';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

export async function getClasses(): Promise<any[]> {
    const filePath = path.join(PUBLIC_DIR, 'classes.json');
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error reading classes.json', error);
        return [];
    }
}

export async function getClassContent(filename: string): Promise<ShlokBlock[]> {
    const filePath = path.join(PUBLIC_DIR, filename);
    const translationsPath = path.join(PUBLIC_DIR, 'reference_translations_v2.json');

    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const blocks = parseClassTxt(fileContent);

        // Load translations to inject IDs
        let translations: any[] = [];
        try {
            const transContent = fs.readFileSync(translationsPath, 'utf-8');
            translations = JSON.parse(transContent);
            if (!Array.isArray(translations)) translations = [translations];
        } catch (e) {
            console.warn('Failed to load reference_translations_v2.json for ID injection', e);
        }

        // Inject IDs
        const normalize = (s: string) => s ? s.replace(/[\s\.]/g, '').toLowerCase() : '';

        blocks.forEach(block => {
            const shlokTrans = translations.find((t: any) => String(t.shlok) === String(block.shlokNumber));
            if (!shlokTrans || !shlokTrans.references) return;

            // Clone references to consume them as we match (handling duplicates sequentially)
            const jsonRefs = [...shlokTrans.references];

            // Iterate through all parsed references in the block
            Object.values(block.references).forEach(sectionRefs => {
                sectionRefs.forEach(refItem => {
                    const targetSource = normalize(refItem.displayRef || refItem.ref);

                    // Find the first matching JSON reference
                    const matchIndex = jsonRefs.findIndex((r: any) => normalize(r.source) === targetSource);

                    if (matchIndex !== -1) {
                        // Assign ID
                        refItem.id = jsonRefs[matchIndex].id;
                        // Remove from pool to ensure 1:1 mapping for duplicates
                        jsonRefs.splice(matchIndex, 1);
                    }
                });
            });
        });

        return blocks;
    } catch (error) {
        console.error(`Error reading class file: ${filename}`, error);
        return [];
    }
}

export async function getAllClassesMetadata() {
    const classes = await getClasses();
    const metadata = await Promise.all(classes.map(async (cls) => {
        const blocks = await getClassContent(cls.file);
        return {
            filename: cls.file,
            label: cls.title, // Object now has .title
            shloks: blocks.map(b => b.shlokNumber)
        };
    }));

    return metadata.sort((a, b) => {
        const numA = parseInt(a.filename.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.filename.match(/\d+/)?.[0] || '0');
        return numA - numB;
    });
}
