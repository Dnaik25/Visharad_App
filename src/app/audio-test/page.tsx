"use client";

import { useEffect } from 'react';
import { injectAudioPlayers } from '@/lib/audioUtils';

export default function AudioTestPage() {

    useEffect(() => {
        // Run the injection logic after component mounts
        injectAudioPlayers();
    }, []);

    return (
        <div className="p-8 max-w-2xl mx-auto font-sans">
            <h1 className="text-2xl font-bold mb-6">Audio Integration Test</h1>

            <p className="mb-4">
                This page demonstrates the dynamic injection of audio players based on data-reference attributes.
            </p>

            {/* Example 1: Functioning Reference */}
            <div className="border p-4 mb-4 rounded bg-gray-50 reference-block" data-reference="Vach.Sā.1">
                <div className="font-semibold text-blue-700">Reference: Vach.Sā.1</div>
                <div className="audio-placeholder my-2 bg-gray-200 h-10 flex items-center justify-center text-xs text-gray-500 rounded">
                    {/* Audio player will be injected here */}
                    [Placeholder]
                </div>
                <p className="text-gray-700">
                    Lorem ipsum dolor sit amet, referencing Vachanamrut Sarangpur 1.
                </p>
            </div>

            {/* Example 2: Functioning Reference (Swamini Vato) */}
            <div className="border p-4 mb-4 rounded bg-gray-50 reference-block" data-reference="Swā.Vāto: 1/26">
                <div className="font-semibold text-blue-700">Reference: Swā.Vāto: 1/26</div>
                <div className="audio-placeholder my-2 bg-gray-200 h-10 flex items-center justify-center text-xs text-gray-500 rounded">
                    {/* Audio player will be injected here */}
                    [Placeholder]
                </div>
                <p className="text-gray-700">
                    More text referencing Swamini Vato 1/26.
                </p>
            </div>

            {/* Example 3: Missing Mapping (Should handle gracefully) */}
            <div className="border p-4 mb-4 rounded bg-red-50 reference-block" data-reference="Unknown.Ref">
                <div className="font-semibold text-red-700">Reference: Unknown.Ref (Missing)</div>
                <div className="audio-placeholder my-2 bg-gray-200 h-10 flex items-center justify-center text-xs text-gray-500 rounded">
                    {/* Audio player will NOT be injected here */}
                    [Placeholder]
                </div>
                <p className="text-gray-700">
                    This reference has no mapping, so no player should appear (check console for warning).
                </p>
            </div>

        </div>
    );
}
