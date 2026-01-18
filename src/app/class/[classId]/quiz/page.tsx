import { QuizRunner } from "@/components/QuizRunner";
import { getAllClassesMetadata } from "@/lib/data";

type Props = {
    params: Promise<{
        classId: string;
    }>;
};

export default async function ClassQuizPage({ params }: Props) {
    const { classId } = await params;

    // Calculate next class path
    const classes = await getAllClassesMetadata();
    const currentClassIndex = classes.findIndex(c => c.filename.includes(`Class_${classId}.txt`));
    let nextClassPath = undefined;

    if (currentClassIndex !== -1 && currentClassIndex < classes.length - 1) {
        const nextClass = classes[currentClassIndex + 1];
        const nextClassId = nextClass.filename.match(/\d+/)?.[0];
        if (nextClassId && nextClass.shloks.length > 0) {
            nextClassPath = `/class/${nextClassId}/shlok/${nextClass.shloks[0]}`;
        }
    }

    return (
        <div className="w-full">
            <QuizRunner
                classId={classId}
                type="class_quiz"
                title={`Class ${classId} Quiz`}
                nextClassPath={nextClassPath}
            />
        </div>
    );
}
