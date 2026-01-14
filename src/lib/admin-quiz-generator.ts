import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";

// This file is for ADMIN/BUILD time use only. `npm run generate-quizzes`
// It should NOT be imported in client components or runtime API routes that serve users.

const SYSTEM_INSTRUCTION = `
You are the "Visharad Sahãyak Quiz Engine" (Admin Mode).
Goal: Pre-generate a robust pool of quiz questions for validation and static hosting.

STRICT GENERATION RULES:
1. Context Scope:
   - "class_quiz": Use ONLY content from the provided Class text.
   - "mini_review": Use ONLY content from the provided set of Classes.

2. Question Types (Generate a mix of these TWO types ONLY):
   Type A: "fill_in_the_blanks_mcq"
   - Description: Remove 1-3 words from a VERBATIM quotation in the source.
   - Constraint: Use exact text. No paraphrasing. Options must be from the context.

   Type B: "quotation_reference_mcq"
   - Description: Show a VERBATIM quotation. Ask for the specific reference (e.g. "Vachanamrut Gadhada I-1").
   - Constraint: The reference options must exist in the context scope.

3. Output Format: JSON Only.
`;

export async function generateAdminQuiz(
    apiKey: string,
    classId: string,
    type: 'class_quiz' | 'mini_review' = 'class_quiz'
) {
    const genAI = new GoogleGenerativeAI(apiKey);
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

    let fileContent = "";
    let prompt = "";

    // Double the standard count for the pool
    // Class Quiz: Standard 5 -> Generate 10
    // Mini Review: Standard 10 -> Generate 20

    if (type === 'class_quiz') {
        const fileName = `Class_${classId}.txt`;
        const filePath = path.join(process.cwd(), "public", fileName);
        try {
            fileContent = await fs.readFile(filePath, "utf-8");
        } catch (e) {
            console.warn(`Content for Class ${classId} not found, skipping.`);
            return null;
        }

        prompt = `
      ${SYSTEM_INSTRUCTION}
      
      SOURCE CONTENT:
      """
      ${fileContent}
      """
      
      TASK: Generate a pool of 10 HIGH-QUALITY questions based on Class ${classId}.
      - Ensure questions cover different shloks if possible.
      - Unique questions only.
    `;

    } else if (type === 'mini_review') {
        const currentClass = parseInt(classId);
        const startClass = Math.max(1, currentClass - 4);
        const classesToLoad = [];
        for (let i = startClass; i <= currentClass; i++) {
            classesToLoad.push(i);
        }

        const contents = await Promise.all(classesToLoad.map(async (c) => {
            try {
                const p = path.join(process.cwd(), "public", `Class_${c}.txt`);
                const text = await fs.readFile(p, "utf-8");
                return `--- Class ${c} Content ---\n${text}\n----------------`;
            } catch (e) {
                return "";
            }
        }));

        fileContent = contents.join("\n\n");
        if (!fileContent.trim()) return null;

        prompt = `
      ${SYSTEM_INSTRUCTION}
      
      SOURCE CONTENT:
      """
      ${fileContent}
      """
      
      TASK: Generate a pool of 20 HIGH-QUALITY questions for a Mini-Review.
      - Range: Class ${startClass} to Class ${currentClass}.
      - Distributed evenly.
    `;
    }

    try {
        console.log(`[AdminGenerator] Generating ${type} for ${classId} (Pool Generation)...`);
        // Using simple generateContent since we don't need history
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(text);
    } catch (error) {
        console.error("Generative Error:", error);
        return null;
    }
}
