'use client';

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";

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

type QuizRunnerProps = {
    classId: string;
    type: 'class_quiz' | 'mini_review';
    title: string;
    nextClassPath?: string;
};

// Helper to shuffle array
function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

export function QuizRunner({ classId, type, title, nextClassPath }: QuizRunnerProps) {
    const [loading, setLoading] = useState(false);
    // quizData holds the ACTIVE set of questions for the current run
    const [quizData, setQuizData] = useState<QuizData | null>(null);
    // fullPool holds ALL available questions from the static file
    const [fullPool, setFullPool] = useState<QuizData | null>(null);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

    // New State for "Immediate Feedback" mode
    const [submittedQuestionIds, setSubmittedQuestionIds] = useState<Set<string>>(new Set());

    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State to track incorrect IDs from previous runs in this session for adaptive re-test
    const [incorrectHistory, setIncorrectHistory] = useState<Set<string>>(new Set());

    // Initial fetch on mount
    useEffect(() => {
        fetchQuizPool();
    }, [classId, type]);

    const fetchQuizPool = async () => {
        setLoading(true);
        setError(null);
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
            setFullPool(data);
            startNewRun(data, new Set()); // First run, no priority constraints
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const startNewRun = (poolData: QuizData, priorityIds: Set<string>) => {
        // Selection Logic
        const LIMIT = type === 'mini_review' ? 10 : 5;
        const allQuestions = poolData.questions;

        let selectedQuestions: Question[] = [];

        // 1. Prioritize Incorrect
        const priorityQuestions = allQuestions.filter(q => priorityIds.has(q.id));

        // 2. Remove priority from pool to pick potential new/other ones
        const remainingPool = allQuestions.filter(q => !priorityIds.has(q.id));

        // 3. Shuffle remaining
        const shuffledRemaining = shuffleArray(remainingPool);

        // 4. Fill slots
        const slotsNeeded = Math.max(0, LIMIT - priorityQuestions.length);
        const fillers = shuffledRemaining.slice(0, slotsNeeded);

        // 5. Combine and Shuffle Final Set
        const finalSelection = shuffleArray([...priorityQuestions, ...fillers]);

        // 6. Shuffle Options for each question (Rules: shuffle_option_order: true)
        const questionsWithOptionsShuffled = finalSelection.map(q => ({
            ...q,
            options: shuffleArray(q.options)
        }));

        // If total < LIMIT (e.g. small pool), we just take what we have

        setQuizData({
            ...poolData,
            questions: questionsWithOptionsShuffled
        });

        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setSubmittedQuestionIds(new Set());
        setShowResults(false);
    };

    const handleTakeAgain = () => {
        if (!fullPool || !quizData) return;

        // Identify incorrect answers from THIS run
        const currentIncorrectIds = quizData.questions
            .filter(q => userAnswers[q.id] !== q.correct_answer)
            .map(q => q.id);

        // Start new run treating these as priority
        const newPriority = new Set(currentIncorrectIds);
        startNewRun(fullPool, newPriority);
    };

    const handleOptionSelect = (option: string) => {
        if (showResults || !quizData) return;

        const currentQ = quizData.questions[currentQuestionIndex];
        // Prevent changing answer after submission
        if (submittedQuestionIds.has(currentQ.id)) return;

        setUserAnswers((prev) => ({
            ...prev,
            [currentQ.id]: option,
        }));
    };

    const handleSubmitAnswer = () => {
        if (!quizData) return;
        const currentQ = quizData.questions[currentQuestionIndex];

        if (!userAnswers[currentQ.id]) return; // Cannot submit empty

        setSubmittedQuestionIds(prev => new Set(prev).add(currentQ.id));
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
                <p className="text-lg text-gray-600 dark:text-gray-300">Generating grounded questions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-8 rounded-xl relative mb-6">
                    <AlertCircle size={48} className="mx-auto mb-4 text-red-600" />
                    <h3 className="text-lg font-bold">Failed to load quiz</h3>
                    <p className="mt-2">{error}</p>
                </div>
                <button onClick={fetchQuizPool} className="px-6 py-2 bg-red-600 text-white rounded-full">Try Again</button>
            </div>
        );
    }

    if (showResults && quizData) {
        const score = calculateScore();
        const percentage = Math.round((score / quizData.questions.length) * 100);
        const incorrectQuestions = quizData.questions.filter(q => userAnswers[q.id] !== q.correct_answer);

        return (
            <div className="max-w-3xl mx-auto p-6">
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="p-8 text-center border-b border-gray-100 dark:border-neutral-700">
                        <h2 className="text-3xl font-bold mb-2 dark:text-white">Quiz Completed!</h2>
                        <div className="text-5xl font-extrabold text-red-600 mb-2">{score} / {quizData.questions.length}</div>
                        <p className="text-gray-500 dark:text-gray-400">{percentage}% Accuracy</p>
                    </div>

                    <div className="p-8 space-y-6">
                        <h3 className="text-xl font-bold border-b pb-2">Incorrect Answers Review</h3>
                        {incorrectQuestions.length === 0 ? (
                            <div className="text-center text-green-600 py-4">
                                <CheckCircle size={48} className="mx-auto mb-2" />
                                <p className="font-bold">Perfect Score! No incorrect answers.</p>
                            </div>
                        ) : (
                            incorrectQuestions.map((q, idx) => (
                                <div key={q.id} className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
                                    <div className="flex gap-3 mb-2">
                                        <h3 className="font-medium text-lg dark:text-gray-200">{q.question_text}</h3>
                                    </div>
                                    <div className="ml-0 text-sm space-y-2 mt-3">
                                        <div className="flex items-center gap-2">
                                            <XCircle size={16} className="text-red-600" />
                                            <span className="font-semibold dark:text-gray-300">You selected:</span>
                                            <span className="text-red-700 font-medium">{userAnswers[q.id] || "Skipped"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={16} className="text-green-600" />
                                            <span className="font-semibold dark:text-gray-300">Correct:</span>
                                            <span className="text-green-700 font-medium dark:text-green-400">{q.correct_answer}</span>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-red-200/50">
                                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                                                <span className="font-bold">Reason:</span> {q.explanation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-neutral-900 flex justify-center gap-4">
                        <button
                            onClick={handleTakeAgain}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition"
                        >
                            <RefreshCw size={20} /> Take Another Quiz
                        </button>

                        {nextClassPath && (
                            <a
                                href={nextClassPath}
                                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition"
                            >
                                Next Class <ArrowRight size={20} />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (quizData) {
        const question = quizData.questions[currentQuestionIndex];
        const isSubmitted = submittedQuestionIds.has(question.id);
        const isCorrect = userAnswers[question.id] === question.correct_answer;

        return (
            <div className="max-w-2xl mx-auto p-4 sm:p-6 min-h-[60vh] flex flex-col justify-center">
                <div className="mb-6 flex justify-between items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    <span className="bg-gray-100 px-3 py-1 rounded-full">{title}</span>
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
                        {question.options.map((opt, i) => {
                            let optionClass = `flex items-center p-4 rounded-xl border-2 transition-all `;

                            if (isSubmitted) {
                                if (opt === question.correct_answer) {
                                    // Correct answer always green
                                    optionClass += 'border-green-500 bg-green-50 dark:bg-green-900/20 ';
                                } else if (userAnswers[question.id] === opt && opt !== question.correct_answer) {
                                    // Wrong user selection red
                                    optionClass += 'border-red-500 bg-red-50 dark:bg-red-900/20 ';
                                } else {
                                    // Others gray
                                    optionClass += 'border-gray-200 dark:border-neutral-700 opacity-50 ';
                                }
                            } else {
                                // Not submitted yet
                                if (userAnswers[question.id] === opt) {
                                    optionClass += 'border-red-500 bg-red-50 dark:bg-red-900/20 cursor-pointer ';
                                } else {
                                    optionClass += 'border-gray-200 dark:border-neutral-700 hover:border-red-200 dark:hover:border-neutral-600 cursor-pointer ';
                                }
                            }

                            return (
                                <label
                                    key={i}
                                    className={optionClass}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={opt}
                                        checked={userAnswers[question.id] === opt}
                                        onChange={() => handleOptionSelect(opt)}
                                        disabled={isSubmitted}
                                        className="w-5 h-5 text-red-600 border-gray-300 focus:ring-red-500 disabled:opacity-50"
                                    />
                                    <span className="ml-3 text-lg text-gray-700 dark:text-gray-200">{opt}</span>
                                </label>
                            );
                        })}
                    </div>

                    {/* Immediate Feedback Section */}
                    {isSubmitted && (
                        <div className={`mt-6 p-4 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} animate-in fade-in slide-in-from-top-2`}>
                            <div className="flex items-center gap-2 mb-2">
                                {isCorrect ? (
                                    <>
                                        <CheckCircle className="text-green-600" size={24} />
                                        <h3 className="font-bold text-green-800">Correct!</h3>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="text-red-600" size={24} />
                                        <h3 className="font-bold text-red-800">Incorrect</h3>
                                    </>
                                )}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                                {question.explanation}
                            </p>
                            {!isCorrect && (
                                <p className="mt-2 text-sm text-gray-500">
                                    Correct Answer: <span className="font-semibold">{question.correct_answer}</span>
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    {!isSubmitted ? (
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={!userAnswers[question.id]}
                            className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all ${!userAnswers[question.id]
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-500'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/30 hover:scale-105'
                                }`}
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/30 hover:scale-105"
                        >
                            {currentQuestionIndex === quizData.questions.length - 1 ? 'View Results' : 'Next Question'}
                            <ArrowRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return null;
}
