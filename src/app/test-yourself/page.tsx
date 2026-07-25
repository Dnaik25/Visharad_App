import Link from "next/link";
import fs from "fs/promises";
import path from "path";
import { ArrowRight, BookOpen } from "lucide-react";

async function getMiniReviews() {
  const quizzesDir = path.join(process.cwd(), "public", "quizzes");
  try {
    const files = await fs.readdir(quizzesDir);
    const miniReviews = files
      .filter((file) => file.startsWith("mini_review_") && file.endsWith(".json"))
      .map((file) => {
        const match = file.match(/mini_review_(\d+)\.json/);
        return match ? parseInt(match[1]) : 0;
      })
      .sort((a, b) => a - b);
    return miniReviews;
  } catch (error) {
    console.error("Error reading quizzes directory:", error);
    return [];
  }
}

export default async function TestYourselfPage() {
  const miniReviews = await getMiniReviews();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          Test Yourself
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Challenge yourself with mini-reviews covering multiple classes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {miniReviews.map((id) => {
          const startClass = Math.max(1, id - 4);
          const endClass = id;
          return (
            <Link
              key={id}
              href={`/test-yourself/${id}`}
              className="group relative bg-white dark:bg-neutral-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-neutral-700 hover:border-orange-500/50 dark:hover:border-orange-500/50"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen size={32} />
                  </div>
                  <div className="p-2 rounded-full bg-gray-50 dark:bg-neutral-700 text-gray-400 group-hover:text-orange-500 transition-colors">
                    <ArrowRight size={20} />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-orange-600 transition-colors">
                  Mini-Review {startClass}-{endClass}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Comprehensive review covering material from classes {startClass} to{" "}
                  {endClass}.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
          );
        })}

        {miniReviews.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-neutral-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700">
            <p className="text-gray-500 dark:text-gray-400">
              No mini-reviews available yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
