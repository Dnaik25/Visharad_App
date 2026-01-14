"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ArrowRight, RefreshCw, BookOpen, AlertCircle } from "lucide-react";

type Question = {
    id: string;
    type: string;
    question_text: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    source_reference: string;
};

type QuizData = {
    quiz_title: string;
    questions: Question[];
};

export default function QuizPage() {
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Generate class list 1-20
    const classes = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

    const startQuiz = async (classId: string, type: 'class_quiz' | 'mini_review' = 'class_quiz') => {
        setLoading(true);
        setSelectedClass(classId);
        setError(null);
        setQuizData(null);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setShowResults(false);

        try {
            const res = await fetch("/api/quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ classId, type }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to load quiz");
            }

            const data = await res.json();
            setQuizData(data);
        } catch (err: any) {
            setError(err.message);
            setSelectedClass(null);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (option: string) => {
        if (showResults || !quizData) return;
        setUserAnswers((prev) => ({
            ...prev,
            [quizData.questions[currentQuestionIndex].id]: option,
        }));
    };

    const handleNext = () => {
        if (!quizData) return;
        if (currentQuestionIndex < quizData.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            setShowResults(true);
        }
    };

    const calculateScore = () => {
        if (!quizData) return 0;
        let score = 0;
        quizData.questions.forEach((q) => {
            if (userAnswers[q.id] === q.correct_answer) {
                score++;
            }
        });
        return score;
    };

    if (!selectedClass && !loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-4xl font-bold mb-2 text-center text-gray-800 dark:text-white">Visharad Sahãyak Quiz</h1>
                <p className="text-center text-gray-500 mb-8">Select a class to generate grounded practice questions.</p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {classes.map((cls) => (
                        <button
                            key={cls}
                            onClick={() => startQuiz(cls)}
                            className="p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-neutral-700 transition-all hover:border-red-500 dark:hover:border-red-500 group"
                        >
                            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 group-hover:text-red-500">Class {cls}</h3>
                        </button>
                    ))}
                </div>

                <div className="mt-12 text-center pb-12">
                    <h2 className="text-2xl font-bold mb-4 dark:text-white">Review</h2>
                    <p className="text-gray-500 mb-6">Test your knowledge across multiple classes.</p>
                    <button
                        onClick={() => startQuiz("5", "mini_review")}
                        className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold hover:opacity-90 transition shadow-xl"
                    >
                        Start Mini Review (Classes 1-5)
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
                <p className="text-lg text-gray-600 dark:text-gray-300">Generating grounded questions from strict source...</p>
            </div>
        );
    }

    if (showResults && quizData) {
        const score = calculateScore();
        const percentage = Math.round((score / quizData.questions.length) * 100);

        return (
            <div className="max-w-3xl mx-auto p-6">
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="p-8 text-center border-b border-gray-100 dark:border-neutral-700">
                        <h2 className="text-3xl font-bold mb-2 dark:text-white">Quiz Results</h2>
                        <div className="text-5xl font-extrabold text-red-600 mb-2">{score} / {quizData.questions.length}</div>
                        <p className="text-gray-500 dark:text-gray-400">{percentage}% Accuracy</p>
                    </div>

                    <div className="p-8 space-y-8">
                        {quizData.questions.map((q, idx) => {
                            const isCorrect = userAnswers[q.id] === q.correct_answer;
                            return (
                                <div key={q.id} className={`p-4 rounded-xl border ${isCorrect ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800' : 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800'}`}>
                                    <div className="flex gap-3 mb-2">
                                        <span className="font-bold text-gray-500">Q{idx + 1}.</span>
                                        <h3 className="font-medium text-lg dark:text-gray-200">{q.question_text}</h3>
                                    </div>

                                    <div className="ml-8 text-sm space-y-2">
                                        <div className="flex items-center gap-2">
                                            {isCorrect ? <CheckCircle size={16} className="text-green-600" /> : <XCircle size={16} className="text-red-600" />}
                                            <span className="font-semibold dark:text-gray-300">Your Answer:</span>
                                            <span className={isCorrect ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                                                {userAnswers[q.id] || "Skipped"}
                                            </span>
                                        </div>

                                        {!isCorrect && (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle size={16} className="text-green-600" />
                                                <span className="font-semibold dark:text-gray-300">Correct Answer:</span>
                                                <span className="text-green-700 font-medium dark:text-green-400">{q.correct_answer}</span>
                                            </div>
                                        )}

                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                <span className="font-bold text-gray-700 dark:text-gray-300">Explanation:</span> {q.explanation}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">Source: {q.source_reference}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-neutral-900 flex justify-center">
                        <button
                            onClick={() => setSelectedClass(null)}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition"
                        >
                            <RefreshCw size={20} /> Take Another Quiz
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (quizData) {
        const question = quizData.questions[currentQuestionIndex];
        return (
            <div className="max-w-2xl mx-auto p-4 sm:p-6 min-h-[60vh] flex flex-col justify-center">
                <div className="mb-6 flex justify-between items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    <span>{quizData.quiz_title}</span>
                    <span>Question {currentQuestionIndex + 1} of {quizData.questions.length}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-8">
                    <div
                        className="bg-red-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
                    ></div>
                </div>

                <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-neutral-700 mb-8">
                    <h2 className="text-xl md:text-2xl font-bold mb-8 leading-relaxed text-gray-800 dark:text-white">
                        {question.question_text}
                    </h2>

                    <div className="space-y-4">
                        {question.options.map((opt, i) => (
                            <label
                                key={i}
                                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${userAnswers[question.id] === opt
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-200 dark:border-neutral-700 hover:border-red-200 dark:hover:border-neutral-600'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={opt}
                                    checked={userAnswers[question.id] === opt}
                                    onChange={() => handleOptionSelect(opt)}
                                    className="w-5 h-5 text-red-600 border-gray-300 focus:ring-red-500"
                                />
                                <span className="ml-3 text-lg text-gray-700 dark:text-gray-200">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleNext}
                        disabled={!userAnswers[question.id]}
                        className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all ${!userAnswers[question.id]
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-500'
                            : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/30 hover:scale-105'
                            }`}
                    >
                        {currentQuestionIndex === quizData.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
