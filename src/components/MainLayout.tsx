'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { DharmaFlag } from './DharmaFlag';

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

    // Close the mobile drawer automatically on route changes
    useEffect(() => {
        closeMenu();
    }, [pathname]);

    return (
        <div className="min-h-screen bg-background text-charcoal-900 font-sans flex flex-col md:flex-row">

            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between px-4 py-3 bg-charcoal-900 sticky top-0 z-20 shadow-lg shadow-black/10">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 -ml-2 text-charcoal-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>

                <h1 className="text-base font-display font-bold text-white absolute left-1/2 -translate-x-1/2 tracking-tight">
                    Visharad Sahayak
                </h1>

                <DharmaFlag className="w-4 h-6 text-charcoal-500" animate={false} />
            </header>

            {/* Mobile Overlay Backdrop */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                        onClick={closeMenu}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <div className={`
        fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-out md:translate-x-0 md:static md:z-0 md:h-screen md:sticky md:top-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <Sidebar
                    classes={classes}
                    onLinkClick={closeMenu}
                    onClose={closeMenu}
                />
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-5xl mx-auto md:px-8 px-4 py-6 md:py-10">
                {children}
            </main>

        </div>
    );
}
