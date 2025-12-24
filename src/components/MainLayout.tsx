'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

type MainLayoutProps = {
    classes: {
        filename: string;
        label: string;
        shloks: number[];
    }[];
    children: React.ReactNode;
};

export function MainLayout({ classes, children }: MainLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col md:flex-row">

            {/* Mobile Header - Visible only on mobile */}
            <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-20">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>

                <h1 className="text-lg font-semibold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
                    Visharad Sahayak
                </h1>

                <div className="w-8" />{/* Spacer to center title */}
            </header>

            {/* Sidebar - Desktop: Fixed, Mobile: Overlay */}
            {/* Mobile Overlay Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={closeMenu}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Container */}
            <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:shadow-none md:static md:z-0 md:h-screen md:sticky md:top-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <Sidebar
                    classes={classes}
                    onLinkClick={closeMenu}
                    onClose={closeMenu}
                />
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-5xl mx-auto md:px-8 px-4 py-8">
                {children}
            </main>

        </div>
    );
}
