import { notFound } from 'next/navigation';
import { getClassContent } from '@/lib/data';
import {
    ShlokCard,
    ExplanationPlaceholder,
    ReferenceSection,
    NavButtons
} from '@/components/ShlokView';

type Props = {
    params: Promise<{
        classId: string;
        shlokId: string;
    }>;
};

export default async function ShlokPage({ params }: Props) {
    const { classId, shlokId } = await params;
    const filename = `Class_${classId}.txt`;

    // Fetch content
    const blocks = await getClassContent(filename);

    if (!blocks || blocks.length === 0) {
        notFound();
    }

    const currentShlokNum = parseInt(shlokId, 10);
    const currentIndex = blocks.findIndex(b => b.shlokNumber === currentShlokNum);

    if (currentIndex === -1) {
        notFound();
    }

    const shlok = blocks[currentIndex];

    // Navigation logic
    let prevHref: string | null = null;
    let nextHref: string | null = null;

    if (currentIndex > 0) {
        const prevShlokNum = blocks[currentIndex - 1].shlokNumber;
        prevHref = `/class/${classId}/shlok/${prevShlokNum}`;
    }

    if (currentIndex < blocks.length - 1) {
        const nextShlokNum = blocks[currentIndex + 1].shlokNumber;
        nextHref = `/class/${classId}/shlok/${nextShlokNum}`;
    } else {
        // Last shloka, link to quiz
        nextHref = `/class/${classId}/quiz`;
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-12 pb-24">
            {/* 2. Shlok Text */}
            <ShlokCard
                shlokSanskrit={shlok.shlokSanskrit}
                shlokTransliteration={shlok.shlokTransliteration}
                shlokNumber={shlok.shlokNumber}
            />


            {/* 4. References (Dynamic) */}
            <ReferenceSection
                shlokReferences={shlok.references}
                classId={classId}
                shlokNumber={shlok.shlokNumber}
            />

            {/* 5. Navigation */}
            <NavButtons
                prevHref={prevHref}
                nextHref={nextHref}
                nextLabel={nextHref?.includes('/quiz') ? "Take Quiz →" : undefined}
            />
        </div>
    );
}
