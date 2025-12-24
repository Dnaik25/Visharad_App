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
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return parseClassTxt(fileContent);
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
