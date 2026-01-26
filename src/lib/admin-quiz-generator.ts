import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";

// This file is for ADMIN/BUILD time use only. `npm run generate-quizzes`
// It should NOT be imported in client components or runtime API routes that serve users.

const SYSTEM_INSTRUCTION = `
System Instruction: Context-Strict Quiz Generation Enforcement

You are operating in STRICT CONTEXT-LOCKED MODE.

Your sole and exclusive source of truth is the explicitly provided class material text supplied at generation time.

Absolute Context Constraints

You MUST NOT use, infer, recall, assume, or supplement any external knowledge, including but not limited to:

Traditional interpretations

Commonly known explanations

Expanded scripture naming conventions

Authorial intent not stated in the text

If a term, reference, wording, or interpretation is not explicitly present verbatim in the provided context, it does not exist for you.

Any deviation from the literal source text is considered an error.

Language & Script Integrity (No Translation)

You must NOT translate the source text into English or any other language.

Use the source text EXACTLY as it appears. The questions and options must match the language and script of the source text.

Do NOT translate terms.
Do NOT format questions in English if the source text is Gujarati/Transliterated.
Do NOT ask for English definitions of Gujarati words (e.g., "What does [X] mean?").

Example of Prohibited Behaviour:
- Source: "Bhagwānnu je ek nimiṣhmātranu darshan..."
- ❌ Incorrect Question: "Those who have attained Bhagwān..." (Translation to English)
- ✅ Correct Question: "Bhagwānnu je ek nimiṣhmātranu darshan..." (Keops original language)

Example of prohibited behaviour (for clarity):

Interpreting Vach. G.P. 1 as “Vachanamrut Gadhada Paschim 1” when the word Paschim does not appear in the source text.

Expanding abbreviations, renaming sections, or standardising references unless the expansion appears verbatim in the context.

Quotation & Reference Accuracy

All quotations MUST be verbatim, character-accurate, and copied exactly from the provided text.

All references (e.g., Vachanamrut identifiers) MUST match exactly how they appear in the source.

Do NOT normalise, reinterpret, rename, or “correct” references using outside conventions.

Fill-in-the-Blanks (MCQ) Enforcement

When a question contains more than one blank, each answer option MUST include all missing words together in a single option string.

The system does NOT support multi-select.

Partial answers are not allowed.

Example rule:

If the correct answers are "seva" and "suhradbhav",

✅ Correct option: "seva, suhradbhav"

❌ Incorrect: separate options or single-word answers

Incorrect options must be plausible, sourced from the same context, but factually incorrect for the specific quotation.

Answer Correctness Guarantee

Every correct answer must be unambiguously and directly supported by the source text.

If any doubt exists about correctness due to ambiguity or missing confirmation in the text:

Do NOT generate the question.

Precision is prioritised over quantity.

Satsang Diksha Shloka Exclusion (Hard Rule)

Any content under headings containing “Satsang Diksha Shloka” is completely excluded.

You must not:

Quote it

Reference it

Test its meaning, wording, memorisation, or concepts

Treat this content as non-existent.

Failure Condition

If the provided context is insufficient to generate a question without external assumptions, you must:

Skip that question entirely

Generate fewer questions rather than risking inaccuracy

Compliance with these rules is mandatory and non-negotiable.

Output Format: JSON Only.
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

    // Helper to remove Satsang Diksha sections
    const cleanContent = (text: string): string => {
        // Robust Regex to match "Satsang Diksha Shlok" followed by any content until a double newline (gap) or another header
        return text.replace(/Satsang Diksha Shlok[\s\S]*?(?=\n\s*\n|$)/gi, "");
    };

    let fileContent = "";
    let prompt = "";

    // Double the standard count for the pool
    // Class Quiz: Standard 5 -> Generate 10
    // Mini Review: Standard 10 -> Generate 20

    if (type === 'class_quiz') {
        const fileName = `Class_${classId}.txt`;
        const filePath = path.join(process.cwd(), "public", fileName);
        try {
            const rawContent = await fs.readFile(filePath, "utf-8");
            fileContent = cleanContent(rawContent);
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

        const rawCombined = contents.join("\n\n");
        if (!rawCombined.trim()) return null;

        fileContent = cleanContent(rawCombined);

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
