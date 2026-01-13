'use client';

import { useState, useRef, useEffect } from 'react';
import { getAudioUrl } from '@/lib/audioUtils';
import { Repeat } from 'lucide-react';

interface AudioPlayerProps {
    reference: string;
    displayRef?: string;
    classId?: string | number;
}

export function AudioPlayer({ reference, displayRef, classId }: AudioPlayerProps) {
    const [isLooping, setIsLooping] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Resolve audio URL - we can do this directly in render since getAudioUrl is synchronous-ish enough 
    // (just dictionary lookup + string ops), or use memo if needed. 
    // Given the component re-renders might occur, let's keep it simple.
    const audioUrl = getAudioUrl(reference, classId);

    const toggleLoop = () => {
        setIsLooping(!isLooping);
        if (audioRef.current) {
            audioRef.current.loop = !isLooping;
        }
    };

    const handlePlay = () => {
        // Pause all other audio elements on the page
        const allAudios = document.querySelectorAll('audio');
        allAudios.forEach((audio) => {
            if (audio !== audioRef.current) {
                audio.pause();
            }
        });
    };

    if (!audioUrl) {
        return (
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-4 flex flex-col items-center justify-center text-center">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    {`Audio for ${displayRef || reference}`}
                </div>
                <div className="text-sm text-gray-500">Coming soon</div>
            </div>
        );
    }

    return (
        <div className="w-full mt-2 mb-2 flex flex-col items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
            <div className="w-full flex items-center gap-2">
                <audio
                    ref={audioRef}
                    controls
                    src={audioUrl}
                    loop={isLooping}
                    onPlay={handlePlay}
                    className="w-full h-10"
                />
                <button
                    onClick={toggleLoop}
                    className={`p-2 rounded-full transition-colors ${isLooping
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                        }`}
                    title={isLooping ? "Disable Loop" : "Enable Loop"}
                    aria-label={isLooping ? "Disable Loop" : "Enable Loop"}
                >
                    <Repeat size={18} />
                </button>
            </div>
            {/* Optional: label confirming what is playing */}
            <div className="text-[10px] text-gray-400 mt-1 self-start ml-1">
                {displayRef || reference}
            </div>
        </div>
    );
}
