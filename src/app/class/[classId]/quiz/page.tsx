import { QuizRunner } from "@/components/QuizRunner";

type Props = {
    params: Promise<{
        classId: string;
    }>;
};

export default async function ClassQuizPage({ params }: Props) {
    const { classId } = await params;

    return (
        <div className="w-full">
            <QuizRunner
                classId={classId}
                type="class_quiz"
                title={`Class ${classId} Quiz`}
            />
        </div>
    );
}
