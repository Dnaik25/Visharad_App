import fs from 'fs/promises';
import path from 'path';
import { generateAdminQuiz } from '../src/lib/admin-quiz-generator';

// Simple .env.local parser since we can't rely on Next.js env loading in a standalone script easily
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

    const publicDir = path.join(process.cwd(), 'public');
    const quizzesDir = path.join(publicDir, 'quizzes');

    // Ensure directory exists
    try {
        await fs.mkdir(quizzesDir, { recursive: true });
    } catch (e) { }

    // 1. Identify Classes
    const files = await fs.readdir(publicDir);
    const classFiles = files.filter(f => f.startsWith('Class_') && f.endsWith('.txt'));
    const classes = classFiles.map(f => {
        const match = f.match(/Class_(\d+)\.txt/);
        return match ? parseInt(match[1], 10) : null;
    }).filter((c): c is number => c !== null).sort((a, b) => a - b);

    console.log(`Found classes: ${classes.join(', ')}`);

    for (const classId of classes) {
        const strId = classId.toString();

        // A. Generate Class Quiz
        const classQuizPath = path.join(quizzesDir, `class_${strId}.json`);
        // Check if exists to avoid accidental overwrite/cost (Comment out to force regen)
        // For now, we force regen as per user request to "generate double questions"

        const classQuizData = await generateAdminQuiz(apiKey, strId, 'class_quiz');
        if (classQuizData) {
            await fs.writeFile(classQuizPath, JSON.stringify(classQuizData, null, 2));
            console.log(`✅ Generated Class ${strId} Quiz (Pool: 10)`);
        } else {
            console.error(`❌ Failed Class ${strId}`);
        }

        // B. Generate Mini-Review (Every 5)
        if (classId % 5 === 0) {
            const reviewPath = path.join(quizzesDir, `mini_review_${strId}.json`);
            const reviewData = await generateAdminQuiz(apiKey, strId, 'mini_review');
            if (reviewData) {
                await fs.writeFile(reviewPath, JSON.stringify(reviewData, null, 2));
                console.log(`✅ Generated Mini-Review ${strId} (Pool: 20)`);
            } else {
                console.error(`❌ Failed Mini-Review ${strId}`);
            }
        }
    }
}

main();
