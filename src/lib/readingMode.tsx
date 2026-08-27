'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'visharad_reading_mode';

type ReadingModeContextValue = {
    readingMode: boolean;
    toggleReadingMode: () => void;
};

const ReadingModeContext = createContext<ReadingModeContextValue | null>(null);

export function ReadingModeProvider({ children }: { children: ReactNode }) {
    // Start false (matches SSR, which has no access to localStorage), then pick up a
    // saved preference post-mount.
    const [readingMode, setReadingMode] = useState(false);

    useEffect(() => {
        if (window.localStorage.getItem(STORAGE_KEY) === '1') {
            setReadingMode(true);
        }
    }, []);

    const toggleReadingMode = () => {
        setReadingMode((prev) => {
            const next = !prev;
            window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
            return next;
        });
    };

    return (
        <ReadingModeContext.Provider value={{ readingMode, toggleReadingMode }}>
            {children}
        </ReadingModeContext.Provider>
    );
}

export function useReadingMode() {
    const ctx = useContext(ReadingModeContext);
    if (!ctx) {
        throw new Error('useReadingMode must be used within a ReadingModeProvider');
    }
    return ctx;
}
