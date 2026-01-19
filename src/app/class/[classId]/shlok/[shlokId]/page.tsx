import { notFound } from 'next/navigation';
import { getClassContent } from '@/lib/data';
import {
    ShlokCard,
    ExplanationPlaceholder,
    ReferenceItem,
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
            {/* 4. References (Dynamic) */}
            <div className="space-y-8">
                {(() => {
                    // 1. Flatten all references into a single list with source
                    const allRefs: { source: string; item: typeof shlok.references[string][0] }[] = [];
                    Object.entries(shlok.references).forEach(([source, items]) => {
                        items.forEach(item => allRefs.push({ source, item }));
                    });

                    // 2. Group by Title (preserving order)
                    // We use a Map<Title | 'Untitled', GroupObject> to preserve insertion order
                    type GroupObj = { title?: string; itemsBySource: Record<string, typeof shlok.references[string]> };
                    const groups = new Map<string, GroupObj>();

                    allRefs.forEach(({ source, item }) => {
                        const key = item.title || 'Untitled';
                        if (!groups.has(key)) {
                            groups.set(key, { title: item.title, itemsBySource: {} });
                        }
                        const group = groups.get(key)!;
                        if (!group.itemsBySource[source]) {
                            group.itemsBySource[source] = [];
                        }
                        group.itemsBySource[source].push(item);
                    });

                    // 3. Render Groups
                    return Array.from(groups.values()).map((group, groupIdx) => (
                        <div key={`group-${groupIdx}`} className="mb-10">
                            {/* Title (Topic) Header */}
                            {group.title && (
                                <h3 className="text-xl font-serif font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                                    {group.title}
                                </h3>
                            )}

                            {/* Render Sources within this Group */}
                            {Object.entries(group.itemsBySource).map(([source, items], sourceIdx) => (
                                <div key={`source-${sourceIdx}`} className="mb-6 last:mb-0">
                                    {/* Source Sub-header */}
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                                        {source}
                                    </h4>

                                    {items.map((ref, refIdx) => (
                                        <ReferenceItem
                                            key={`${source}-${refIdx}`}
                                            item={ref}
                                            classId={classId}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    ));
                })()}
            </div>

            {/* 5. Navigation */}
            <NavButtons
                prevHref={prevHref}
                nextHref={nextHref}
                nextLabel={nextHref?.includes('/quiz') ? "Take Quiz →" : undefined}
            />
        </div>
    );
}
