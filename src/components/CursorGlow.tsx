'use client';

import { useEffect, useRef, useState } from 'react';

// Soft saffron glow that trails the cursor. Only enabled for fine-pointer
// devices that haven't asked for reduced motion — on touch devices there is
// no cursor to react to, and rAF-driven motion should respect that preference.
export function CursorGlow() {
    const glowRef = useRef<HTMLDivElement>(null);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setEnabled(canHover && !reduceMotion);
    }, []);

    useEffect(() => {
        if (!enabled) return;

        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;
        let targetX = x;
        let targetY = y;
        let frame = 0;

        const onMove = (e: PointerEvent) => {
            targetX = e.clientX;
            targetY = e.clientY;
        };

        const tick = () => {
            // Ease toward the pointer so the glow trails rather than snaps.
            x += (targetX - x) * 0.1;
            y += (targetY - y) * 0.1;
            if (glowRef.current) {
                glowRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            }
            frame = requestAnimationFrame(tick);
        };

        window.addEventListener('pointermove', onMove);
        frame = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('pointermove', onMove);
            cancelAnimationFrame(frame);
        };
    }, [enabled]);

    if (!enabled) return null;

    return (
        <div
            ref={glowRef}
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-0 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform"
            style={{
                background:
                    'radial-gradient(circle, var(--color-saffron-300) 0%, var(--color-saffron-400) 25%, transparent 70%)',
                filter: 'blur(70px)',
                opacity: 0.25,
            }}
        />
    );
}
