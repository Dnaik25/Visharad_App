'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Search, ChevronRight, FileQuestion, Home } from 'lucide-react';
import { DharmaFlag } from './DharmaFlag';

type SidebarProps = {
    classes: {
        filename: string;
        label: string;
        shloks: number[];
    }[];
    onLinkClick?: () => void;
    onClose?: () => void; // For the close button
};

export function Sidebar({ classes, onLinkClick, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [searchTerm, setSearchTerm] = useState('');
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        [classes[0]?.filename]: true
    });

    const toggle = (fname: string) => {
        setExpanded(prev => ({ ...prev, [fname]: !prev[fname] }));
    };

    // Filter classes based on search term
    const filteredClasses = classes.filter(cls => {
        if (!searchTerm.trim()) return true;

        const term = searchTerm.toLowerCase();
        const classNumMatch = cls.filename.match(/(\d+)/);
        const classId = classNumMatch ? classNumMatch[0] : '';

        // 1. Text match on Label
        if (cls.label.toLowerCase().includes(term)) return true;

        // 2. Check for "Quiz <Number>" or just "Quiz" match
        if (term.includes('quiz')) {
            if (term.includes(classId)) return true; // e.g. "Quiz 5" matches Class 5
            // If just "quiz", maybe show all? Let's be specific for now or show all if plain "quiz"
            if (term.trim() === 'quiz') return true;
        }

        // 3. Check for Shlok Number match
        // Extract all numbers from search term
        const numbers = term.match(/\d+/g);
        if (numbers) {
            // Check if any number from search matches a shlok in this class
            const searchNum = parseInt(numbers[0], 10);
            if (cls.shloks.includes(searchNum)) return true;

            // Allow searching "Class 5" via number
            if (classId === numbers[0]) return true;
        }

        return false;
    });

    // Auto-expand if searching
    const displayClasses = searchTerm.trim() ? filteredClasses : classes;
    const isSearching = !!searchTerm.trim();

    return (
        <aside className="h-full flex flex-col bg-charcoal-900 text-charcoal-200">
            {/* Header */}
            <div className="p-4 border-b border-white/10 space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        onClick={onLinkClick}
                        className="flex items-center gap-2.5 group"
                    >
                        <DharmaFlag className="w-4 h-6 shrink-0" />
                        <span className="text-lg font-display font-bold text-white tracking-tight group-hover:text-saffron-300 transition-colors">
                            Visharad Sahayak
                        </span>
                    </Link>
                    {/* Mobile Close Button */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md text-charcoal-400 hover:text-white hover:bg-white/10 md:hidden transition-colors"
                            aria-label="Close sidebar"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search Shlok, Class, Quiz..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 focus:bg-white/10 focus:border-saffron-500/50 rounded-lg text-sm text-white placeholder-charcoal-400 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
                {!isSearching && (
                    <Link
                        href="/"
                        onClick={onLinkClick}
                        className={`
                            flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all mb-3
                            ${pathname === '/'
                                ? 'bg-saffron-500/15 text-saffron-300'
                                : 'text-charcoal-300 hover:bg-white/5 hover:text-white'
                            }
                        `}
                    >
                        <Home size={15} />
                        Home
                    </Link>
                )}

                {displayClasses.length === 0 && (
                    <div className="text-center text-charcoal-500 text-sm py-4">
                        No results found
                    </div>
                )}

                {displayClasses.map((cls) => {
                    const isExpanded = isSearching || expanded[cls.filename];
                    const classNumMatch = cls.filename.match(/(\d+)/);
                    const classId = classNumMatch ? classNumMatch[0] : '1';

                    return (
                        <div key={cls.filename} className="group">
                            <button
                                onClick={() => toggle(cls.filename)}
                                className="w-full flex items-center justify-between px-2.5 py-2 text-left text-charcoal-100 text-sm font-semibold hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <span>{cls.label}</span>
                                <ChevronRight
                                    size={14}
                                    className={`text-charcoal-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                />
                            </button>

                            <AnimatePresence initial={false}>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: 'easeOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-1 mb-2 ml-4 space-y-0.5 border-l border-white/10 pl-3">
                                            {cls.shloks.map((shlokNum) => {
                                                const href = `/class/${classId}/shlok/${shlokNum}`;
                                                const isActive = pathname === href;

                                                // Simple highlight logic if searching for specific number
                                                const isMatch = searchTerm.match(/\d+/)
                                                    && parseInt(searchTerm.match(/\d+/)![0]) === shlokNum;

                                                return (
                                                    <Link
                                                        key={shlokNum}
                                                        href={href}
                                                        onClick={onLinkClick}
                                                        className={`
                                                          block px-2.5 py-1.5 text-sm rounded-md transition-all
                                                          ${isActive
                                                                ? 'bg-saffron-500/15 text-saffron-300 font-medium'
                                                                : isMatch
                                                                    ? 'bg-saffron-500/10 text-saffron-200'
                                                                    : 'text-charcoal-400 hover:text-white hover:bg-white/5'
                                                            }
                                                        `}
                                                    >
                                                        Shlok {shlokNum}
                                                    </Link>
                                                );
                                            })}

                                            {/* Quiz Link */}
                                            <Link
                                                href={`/class/${classId}/quiz`}
                                                onClick={onLinkClick}
                                                className={`
                                                    flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-md transition-all
                                                    ${pathname === `/class/${classId}/quiz`
                                                        ? 'bg-saffron-500/15 text-saffron-300 font-medium'
                                                        : searchTerm.toLowerCase().includes('quiz')
                                                            ? 'bg-saffron-500/10 text-saffron-200'
                                                            : 'text-charcoal-400 hover:text-white hover:bg-white/5'
                                                    }
                                                `}
                                            >
                                                <FileQuestion size={13} />
                                                Quiz {classId}
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
