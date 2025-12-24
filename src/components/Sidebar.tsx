'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react'; // Placeholder icons, or use text

type SidebarProps = {
    classes: {
        filename: string;
        label: string;
        shloks: number[];
    }[];
};

export function Sidebar({ classes }: SidebarProps) {
    const pathname = usePathname();
    // State for expanded classes. Default to first class expanded or none?
    // User said "Each Class expands (dropdown)".
    // Let's keep state of which are expanded.
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        [classes[0]?.filename]: true // Expand first one by default
    });

    const toggle = (fname: string) => {
        setExpanded(prev => ({ ...prev, [fname]: !prev[fname] }));
    };

    return (
        <aside className="w-64 bg-gray-50 border-r border-gray-200 h-screen flex flex-col overflow-y-auto fixed left-0 top-0">
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <h1 className="text-xl font-semibold text-gray-800 tracking-tight">Visharad Sahayak</h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {classes.map((cls) => {
                    const isExpanded = expanded[cls.filename];
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
                                        // Extract class number for URL
                                        const classNumMatch = cls.filename.match(/(\d+)/);
                                        const classId = classNumMatch ? classNumMatch[0] : '1';

                                        const href = `/class/${classId}/shlok/${shlokNum}`;
                                        const isActive = pathname === href;

                                        return (
                                            <Link
                                                key={shlokNum}
                                                href={href}
                                                className={`
                          block px-3 py-2 text-sm rounded-md transition-all
                          ${isActive
                                                        ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-500'
                                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                    }
                        `}
                                            >
                                                Shlok {shlokNum}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
