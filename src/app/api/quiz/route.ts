import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/quiz-engine";

export async function POST(req: NextRequest) {
    try {
        const { classId, type } = await req.json();

        if (!classId) {
            return NextResponse.json({ error: "classId is required" }, { status: 400 });
        }

        const quizData = await generateQuiz(classId, type || 'class_quiz');

        return NextResponse.json(quizData);
    } catch (error: any) {
        console.error("API Error generating quiz:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate quiz" },
            { status: 500 }
        );
    }
}
