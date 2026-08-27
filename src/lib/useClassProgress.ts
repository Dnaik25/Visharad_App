'use client';

import { useCallback, useEffect, useState } from 'react';
import { getClassProgress, PROGRESS_EVENT } from './progress';

// Fraction (0..1) of a class completed: each shlok in `shlokNumbers` counts as one unit,
// plus one more unit for the class quiz.
export function useClassProgress(classId: string, shlokNumbers: number[]) {
    const compute = useCallback(() => {
        const { shloks, quizDone } = getClassProgress(classId);
        const readSet = new Set(shloks);
        const readCount = shlokNumbers.filter((n) => readSet.has(n)).length;
        const totalUnits = shlokNumbers.length + 1;
        const doneUnits = readCount + (quizDone ? 1 : 0);
        return totalUnits > 0 ? doneUnits / totalUnits : 0;
    }, [classId, shlokNumbers]);

    // Always start at 0 (matches SSR, which has no access to localStorage) and let the
    // effect below set the real value post-mount — reading localStorage synchronously as
    // the useState initializer computes the right number but isn't guaranteed to force a
    // DOM update coming out of hydration.
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setProgress(compute());
        const handler = () => setProgress(compute());
        window.addEventListener(PROGRESS_EVENT, handler);
        window.addEventListener('storage', handler);
        return () => {
            window.removeEventListener(PROGRESS_EVENT, handler);
            window.removeEventListener('storage', handler);
        };
    }, [compute]);

    return progress;
}
