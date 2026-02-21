'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { RefItem } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';



export function ExplanationPlaceholder() {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-8 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Explanation
            </h3>
            <p className="text-gray-500 italic">Coming soon</p>
        </div>
    );
}

// --- Content Components ---

export function ShlokCard({
    shlokSanskrit,
    shlokTransliteration,
    shlokNumber
}: {
    shlokSanskrit: string | null;
    shlokTransliteration: string | null;
    shlokNumber: number;
}) {
    // Helper to format shlok text: separate multiple shloks by line
    // Look for "॥ <digits> ॥" or "(<digits>)" and append newline
    const formatShlokText = (text: string | null) => {
        if (!text) return null;
        return text
            .replace(/(॥\s*\d+(?:-\d+)?\s*॥)/g, '$1\n')
            .replace(/(\(\d+(?:-\d+)?\))/g, '$1\n');
    };

    return (
        <div className="mb-8 text-center py-8 px-4 md:px-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            {shlokSanskrit && (
                <h2
                    className="text-2xl font-serif text-gray-800 leading-relaxed mb-4 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatShlokText(shlokSanskrit) || '' }}
                />
            )}

            {shlokTransliteration && (
                <p
                    className={`font-serif leading-relaxed whitespace-pre-wrap ${shlokSanskrit ? 'text-lg text-gray-600' : 'text-2xl text-gray-800'}`}
                    dangerouslySetInnerHTML={{ __html: formatShlokText(shlokTransliteration) || '' }}
                />
            )}
        </div>
    );
}

import { AudioPlayer } from './AudioPlayer';

// Type for the JSON structure provided by user
type TranslationData = {
    shlok?: number;
    references: {
        id: string;
        text: string;
        source: string;
    }[];
};

export function ReferenceItem({
    item,
    classId,
    source,
    shlokNumber,
    indexInSource,
    expandSignal
}: {
    item: RefItem;
    source?: string;
    classId?: string;
    shlokNumber: number;
    indexInSource: number;
    expandSignal?: { expand: boolean; timestamp: number } | null;
}) {

    const formattedText = item.text;
    const [translation, setTranslation] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRefClick = async () => {
        setIsExpanded(prev => !prev);
    };

    // React to master toggle signal
    useEffect(() => {
        if (expandSignal) {
            setIsExpanded(expandSignal.expand);
        }
    }, [expandSignal]);

    // Fetch translation when expanded
    useEffect(() => {
        if (isExpanded && !translation && !isLoading) {
            (async () => {
                setIsLoading(true);
                try {
                    const res = await fetch('/reference_translations_v2.json');
                    if (!res.ok) throw new Error('Failed to load translations');

                    const data = await res.json();

                    // 1. Find the shlok data
                    let shlokData;
                    if (Array.isArray(data)) {
                        shlokData = data.find((d: any) => String(d.shlok) === String(shlokNumber));
                    } else if (String(data.shlok) === String(shlokNumber)) {
                        // Single object case (legacy support for simple structure if needed)
                        shlokData = data;
                    }

                    if (!shlokData || !shlokData.references) {
                        setTranslation("Translation not found for this Shlok.");
                        return;
                    }

                    // 2. Find the reference by ID
                    let match;
                    if (item.id) {
                        match = shlokData.references.find((r: any) => r.id === item.id);
                    }

                    // Fallback to source-based matching ONLY if ID is missing (legacy compat)
                    if (!match && !item.id) {
                        // Normalize strings for comparison (remove spaces, punctuation, lowercase)
                        const normalize = (s: string) => s.replace(/[\s\.]/g, '').toLowerCase();
                        const targetRef = normalize(item.displayRef || item.ref);

                        const matchingRefs = shlokData.references.filter((r: any) =>
                            normalize(r.source) === targetRef
                        );
                        // Fallback to index-based matching
                        match = matchingRefs[indexInSource];
                    }

                    if (match) {
                        setTranslation(match.text);
                    } else {
                        setTranslation("Translation not available.");
                    }
                } catch (error) {
                    console.error(error);
                    setTranslation("Error loading translation.");
                } finally {
                    setIsLoading(false);
                }
            })();
        }
    }, [isExpanded, translation, isLoading, item, shlokNumber, indexInSource]); // Dependencies for fetching


    return (
        <div className="mb-6 pl-4 border-l-2 border-gray-200 reference-block">
            <div className="mb-2">
                <AudioPlayer
                    reference={item.ref}
                    displayRef={item.displayRef || item.ref}
                    classId={classId}
                />
            </div>
            <div>
                <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                    <span className="text-gray-700 text-sm font-bold">
                        {item.displayRef || item.ref}
                    </span>
                    <button
                        onClick={handleRefClick}
                        className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-semibold rounded-full transition-colors ${isExpanded
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        title={isExpanded ? "Hide English Translation" : "Show English Translation"}
                    >
                        <span>{isExpanded ? "Hide Translation" : "English Translation"}</span>
                        {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                        ) : (
                            <ChevronDown className="w-3 h-3" />
                        )}
                    </button>

                </div>

                {/* Gujarati Text */}
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {formattedText}
                </p>

                {/* Inline English Translation */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                        {isLoading ? (
                            <div className="flex items-center gap-2 text-gray-400 text-xs italic">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                                Loading translation...
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-3 text-gray-800 text-sm leading-relaxed border border-gray-100">
                                <p className="whitespace-pre-wrap">{translation}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}





export function ReferenceSection({
    shlokReferences,
    classId,
    shlokNumber
}: {
    shlokReferences: Record<string, RefItem[]>;
    classId: string;
    shlokNumber: number;
}) {
    // 1. Flatten and Group Logic (moved from page.tsx)
    const allRefs: { source: string; item: RefItem }[] = [];
    Object.entries(shlokReferences).forEach(([source, items]) => {
        items.forEach(item => allRefs.push({ source, item }));
    });

    type GroupObj = { title?: string; itemsBySource: Record<string, RefItem[]> };
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

    // Expand/Collapse All State using a signal object
    // We use an object { expand: boolean, timestamp: number } to ensure even if we click same button twice (e.g. ensure all expanded), it triggers.
    const [expandSignal, setExpandSignal] = useState<{ expand: boolean; timestamp: number } | null>(null);

    return (
        <div className="space-y-8">
            {/* Master Controls */}
            <div className="flex justify-end gap-3 mb-4">
                <button
                    onClick={() => setExpandSignal({ expand: true, timestamp: Date.now() })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <ChevronDown className="w-3 h-3" />
                    Expand All
                </button>
                <button
                    onClick={() => setExpandSignal({ expand: false, timestamp: Date.now() })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <ChevronUp className="w-3 h-3" />
                    Collapse All
                </button>
            </div>

            {Array.from(groups.values()).map((group, groupIdx) => (
                <div key={`group-${groupIdx}`} className="mb-10">
                    {/* Title (Topic) Header */}
                    {group.title && (
                        <h3 className={`text-xl font-serif font-bold mb-6 pb-2 border-b border-gray-200 ${group.title === 'Memorize all the details of any TWO incidents from this letter. Understand the other incidents for further reinforcement.'
                            ? 'text-red-600'
                            : 'text-gray-800'
                            }`}>
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
                                    source={source}
                                    shlokNumber={shlokNumber}
                                    indexInSource={refIdx}
                                    expandSignal={expandSignal}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export function NavButtons({

    prevHref,
    nextHref,
    nextLabel = "Next Shlok →"
}: {
    prevHref: string | null;
    nextHref: string | null;
    nextLabel?: string;
}) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-12 pt-6 border-t border-gray-100 sticky bottom-0 bg-white/95 backdrop-blur-sm pb-6 gap-4 z-10">
            {prevHref ? (
                <Link
                    href={prevHref}
                    className="w-full sm:w-auto text-center px-6 py-3 sm:py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm font-medium"
                >
                    ← Previous Shlok
                </Link>
            ) : (
                <span className="w-full sm:w-auto text-center px-6 py-3 sm:py-2 border border-gray-100 rounded-full text-gray-300 text-sm font-medium cursor-not-allowed">
                    Previous
                </span>
            )}

            {nextHref ? (
                <Link
                    href={nextHref}
                    className="w-full sm:w-auto text-center px-6 py-3 sm:py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm font-medium"
                >
                    {nextLabel}
                </Link>
            ) : (
                <span className="w-full sm:w-auto text-center px-6 py-3 sm:py-2 border border-gray-100 rounded-full text-gray-300 text-sm font-medium cursor-not-allowed">
                    Next
                </span>
            )}
        </div>
    );
}
