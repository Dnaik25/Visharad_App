import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";
import { unstable_cache } from "next/cache";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        quiz_title: { type: SchemaType.STRING },
        questions: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.STRING },
              type: { type: SchemaType.STRING },
              question_text: { type: SchemaType.STRING },
              options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              correct_answer: { type: SchemaType.STRING },
              explanation: { type: SchemaType.STRING },
              source_reference: { type: SchemaType.STRING }
            },
            required: ["id", "type", "question_text", "options", "correct_answer", "explanation", "source_reference"]
          }
        }
      },
      required: ["quiz_title", "questions"]
    }
  }
});

const SYSTEM_INSTRUCTION = `
You are the "Visharad Sahãyak Quiz & Review Engine".
Role: Closed-book educational assessment engine.
Evaluation Standard: NotebookLM-aligned rigor.
Goal: Generate quizzes grounded strictly in the provided "Satsang Diksha" class content.

Policy:
1. Closed Book: Use ONLY the provided source text. Do not use external knowledge.
2. Language: Strict language preservation (Sanskrit/Gujarati). NO translation.
3. Formats:
   - "fill_in_the_blanks_mcq": 1-3 blanks. Verbatim text ONLY.
   - "quotation_to_reference_mcq": Quote a line, ask for the reference (e.g., "Gadhada I-1").
4. Distractors: Plausible but incorrect. Must not be true for other shlokas in the context if possible.
5. Content: If the source text is insufficient or empty, return an empty quiz or refusal.
`;

export async function generateQuiz(classId: string, type: 'class_quiz' | 'mini_review' = 'class_quiz') {
  try {
    let fileContent = "";
    let systemPromptSuffix = "";

    if (type === 'class_quiz') {
      const fileName = `Class_${classId}.txt`;
      const filePath = path.join(process.cwd(), "public", fileName);
      try {
        fileContent = await fs.readFile(filePath, "utf-8");
      } catch (e) {
        throw new Error(`Content for Class ${classId} not found.`);
      }
      systemPromptSuffix = `TASK: Generate a "class_quiz" with 5 questions based on the content above. Focus on Class ${classId}.`;

    } else if (type === 'mini_review') {
      const currentClass = parseInt(classId);
      if (isNaN(currentClass)) throw new Error("Invalid Class ID for review");

      const startClass = Math.max(1, currentClass - 4);
      const classesToLoad = [];
      for (let i = startClass; i <= currentClass; i++) {
        classesToLoad.push(i);
      }

      const contents = await Promise.all(classesToLoad.map(async (c) => {
        try {
          const p = path.join(process.cwd(), "public", `Class_${c}.txt`);
          return `--- Class ${c} ---\n` + await fs.readFile(p, "utf-8");
        } catch {
          return `--- Class ${c} (Missing) ---\n`;
        }
      }));

      fileContent = contents.join("\n\n");
      systemPromptSuffix = `TASK: Generate a "mini_review" quiz with 10 questions. Scope: Classes ${startClass} to ${currentClass}. Distribute questions across these classes if possible.`;
    }

    if (!fileContent.trim()) {
      throw new Error("Content appears to be empty.");
    }

    // 4. Implement Caching using unstable_cache
    // Key components: classId, type, and the file content hash (implicitly via revalidation if file changes, but here we cache by ID)
    // The spec asks for "class_range", "question_type".
    // We use Next.js `unstable_cache` to cache the RESULT of the generation.
    // This makes repeat requests for the same class instant.

    const getCachedQuiz = unstable_cache(
      async () => {
        const prompt = `
${SYSTEM_INSTRUCTION}

SOURCE CONTENT:
"""
${fileContent}
"""

${systemPromptSuffix}
`;
        console.log(`Generating quiz for ${classId} (${type})...`);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(text);
      },
      [`quiz-${classId}-${type}`], // Cache Key
      {
        revalidate: 3600, // Cache for 1 hour (or until manual revalidation)
        tags: [`quiz-${classId}`]
      }
    );

    return await getCachedQuiz();

  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw error;
  }
}
