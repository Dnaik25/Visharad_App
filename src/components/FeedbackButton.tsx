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
                className="fixed top-4 right-4 z-[9999] flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-white/90 backdrop-blur-sm hover:bg-saffron-50 rounded-full shadow-lg border border-saffron-200 text-saffron-700 font-medium transition-all duration-300 hover:scale-105 group"
                aria-label="Give Feedback"
            >
                <MessageSquarePlus size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                <span className="hidden md:inline">Give us feedback</span>
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
