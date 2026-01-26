'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

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
        <aside className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 space-y-3">
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        onClick={onLinkClick}
                        className="text-xl font-semibold text-gray-800 tracking-tight hover:text-blue-600 transition-colors"
                    >
                        Visharad Sahayak
                    </Link>
                    {/* Mobile Close Button */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 md:hidden"
                            aria-label="Close sidebar"
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search Shlok, Class, Quiz..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-100 border border-transparent focus:bg-white focus:border-blue-500 rounded-md text-sm outline-none transition-all"
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {!isSearching && (
                    <Link
                        href="/"
                        onClick={onLinkClick}
                        className={`
                            block px-3 py-2 text-sm font-medium rounded-md transition-all mb-4
                            ${pathname === '/'
                                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            }
                        `}
                    >
                        Home
                    </Link>
                )}

                {displayClasses.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-4">
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
                                className="w-full flex items-center justify-between p-2 text-left text-gray-700 font-medium hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <span>{cls.label}</span>
                                <span className="text-gray-400 text-sm">
                                    {isExpanded ? '▼' : '▶'}
                                </span>
                            </button>

                            {isExpanded && (
                                <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-100 pl-2">
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
                                                  block px-3 py-2 text-sm rounded-md transition-all
                                                  ${isActive
                                                        ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-500'
                                                        : isMatch
                                                            ? 'bg-yellow-50 text-yellow-800' // Highlight match
                                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
                                            block px-3 py-2 text-sm rounded-md transition-all
                                            ${pathname === `/class/${classId}/quiz`
                                                ? 'bg-purple-50 text-purple-700 font-medium border-l-4 border-purple-500'
                                                : searchTerm.toLowerCase().includes('quiz')
                                                    ? 'bg-yellow-50 text-yellow-800'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        📝 Quiz {classId}
                                    </Link>
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
