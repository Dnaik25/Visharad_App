import { QuizRunner } from "@/components/QuizRunner";

type Props = {
    params: Promise<{
        classId: string;
    }>;
};

export default async function MiniReviewPage({ params }: Props) {
    const { classId } = await params;

    return (
        <div className="w-full">
            <QuizRunner
                classId={classId}
                type="mini_review"
                title={`Mini-Review (Classes ${Math.max(1, parseInt(classId) - 4)} - ${classId})`}
            />
        </div>
    );
}
