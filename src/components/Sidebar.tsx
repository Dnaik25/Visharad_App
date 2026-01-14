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
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        [classes[0]?.filename]: true
    });

    const toggle = (fname: string) => {
        setExpanded(prev => ({ ...prev, [fname]: !prev[fname] }));
    };

    return (
        <aside className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10 flex items-center justify-between">
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

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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

                {classes.map((cls) => {
                    const isExpanded = expanded[cls.filename];
                    const classNumMatch = cls.filename.match(/(\d+)/);
                    const classId = classNumMatch ? classNumMatch[0] : '1';
                    const classNumInt = parseInt(classId, 10);

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

                                        return (
                                            <Link
                                                key={shlokNum}
                                                href={href}
                                                onClick={onLinkClick}
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

                                    {/* Quiz Link */}
                                    <Link
                                        href={`/class/${classId}/quiz`}
                                        onClick={onLinkClick}
                                        className={`
                                            block px-3 py-2 text-sm rounded-md transition-all
                                            ${pathname === `/class/${classId}/quiz`
                                                ? 'bg-purple-50 text-purple-700 font-medium border-l-4 border-purple-500'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        📝 Quiz {classId}
                                    </Link>

                                    {/* Mini-Review Link (Every 5 classes) */}
                                    {classNumInt % 5 === 0 && (
                                        <Link
                                            href={`/class/${classId}/mini-review`}
                                            onClick={onLinkClick}
                                            className={`
                                                block px-3 py-2 text-sm rounded-md transition-all
                                                ${pathname === `/class/${classId}/mini-review`
                                                    ? 'bg-orange-50 text-orange-700 font-medium border-l-4 border-orange-500'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            ⭐ Mini-Review
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
