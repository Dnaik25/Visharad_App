import fs from "fs/promises";
import path from "path";
import { unstable_cache } from "next/cache";

// STATIC MODE: No LLM imports here.
// The "generateQuiz" function is preserved but now READS from static files.

export async function generateQuiz(classId: string, type: 'class_quiz' | 'mini_review' = 'class_quiz') {
  try {
    const quizzesDir = path.join(process.cwd(), 'public', 'quizzes');
    let fileName = '';

    if (type === 'class_quiz') {
      fileName = `class_${classId}.json`;
    } else {
      fileName = `mini_review_${classId}.json`;
    }

    const filePath = path.join(quizzesDir, fileName);

    // simple file read, Next.js data cache can be used if needed but FS read is fast enough for small JSONs
    // We stick to the existing signature returning a Promise

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      // Fallback or error? Cost-constraint says "Automatic fallback to static content" -> this IS the static content.
      // If missing, we throw error.
      console.error(`Quiz file not found: ${fileName} in ${quizzesDir}`);
      throw new Error("Quiz content not available yet. Please contact admin to generate.");
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const quizData = JSON.parse(content);

    // We return the FULL POOL here. 
    // The client (QuizRunner) determines which questions to show.
    return quizData;

  } catch (error: any) {
    console.error("Static Quiz Load Error:", error.message);
    throw error;
  }
}
