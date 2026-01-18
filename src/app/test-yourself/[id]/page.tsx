import { QuizRunner } from "@/components/QuizRunner";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function MiniReviewQuizPage({ params }: Props) {
    const { id } = await params;

    return (
        <div className="w-full">
            <QuizRunner
                classId={id}
                type="mini_review"
                title={`Mini-Review (Classes ${Math.max(1, parseInt(id) - 4)} - ${id})`}
            />
        </div>
    );
}
