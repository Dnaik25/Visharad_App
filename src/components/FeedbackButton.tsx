'use client';

import { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';
import { usePathname } from 'next/navigation';

export function FeedbackButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed top-4 right-4 z-[9999] p-2 bg-white/80 hover:bg-white backdrop-blur-md rounded-full shadow-lg border border-gray-200 text-gray-400 hover:text-amber-600 transition-all duration-300 hover:scale-105 group"
                aria-label="Give Feedback"
                title="Give Feedback"
            >
                <MessageSquarePlus size={20} className="group-hover:rotate-12 transition-transform duration-300" />
            </button>

            <FeedbackModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmitSuccess={() => setIsModalOpen(false)}
                pageUrl={pathname}
            />
        </>
    );
}
