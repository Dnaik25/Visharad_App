import Link from 'next/link';
import { RefItem } from '@/lib/types';

// --- Placeholders ---

export function AudioPlaceholder({ label }: { label: string }) {
    return (
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-4 flex flex-col items-center justify-center text-center">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                {label}
            </div>
            <div className="text-sm text-gray-500">Coming soon</div>
        </div>
    );
}

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

export function ReferenceItem({ item, source }: { item: RefItem; source: string }) {
    // Format Kirtan lines: break after "..." if strictly asked
    // The parser now joins with \n, so original file structure is preserved.
    // We add extra logic for specific "..." cases if they are inline.
    const formattedText = item.text.replace(/\.\.\./g, '...\n');

    return (
        <div className="mb-6 pl-4 border-l-2 border-gray-200 reference-block" data-reference={item.ref}>
            <div className="audio-placeholder">
                <AudioPlaceholder label={`Audio for ${item.ref}`} />
            </div>
            <div>
                <span className="inline-block bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded mb-2">
                    {item.ref}
                </span>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {formattedText}
                </p>
            </div>
        </div>
    );
}

export function NavButtons({
    prevHref,
    nextHref
}: {
    prevHref: string | null;
    nextHref: string | null;
}) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-12 pt-6 border-t border-gray-100 sticky bottom-0 bg-white/95 backdrop-blur-sm pb-6 gap-4">
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
                    Next Shlok →
                </Link>
            ) : (
                <span className="w-full sm:w-auto text-center px-6 py-3 sm:py-2 border border-gray-100 rounded-full text-gray-300 text-sm font-medium cursor-not-allowed">
                    Next
                </span>
            )}
        </div>
    );
}
