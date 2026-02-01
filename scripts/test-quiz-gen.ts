import fs from 'fs/promises';
import path from 'path';
import { generateAdminQuiz } from '../src/lib/admin-quiz-generator';

async function loadEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        const envContent = await fs.readFile(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                // Remove quotes if present
                if (value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                } else if (value.length > 1 && value.startsWith("'") && value.endsWith("'")) {
                    value = value.slice(1, -1);
                }
                process.env[key] = value;
            }
        });
    } catch (e) {
        console.log("No .env.local found or error reading it.");
    }
}

async function main() {
    await loadEnv();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("ERROR: GEMINI_API_KEY not found.");
        process.exit(1);
    }

    console.log("Generating quiz for Class 2...");
    const data = await generateAdminQuiz(apiKey, "2", 'class_quiz');

    if (data) {
        console.log("Successfully generated quiz data.");
        await fs.writeFile('test_class_2_quiz.json', JSON.stringify(data, null, 2));
        console.log("Saved to test_class_2_quiz.json");
    } else {
        console.log("Failed to generate quiz data.");
    }
}

main();
