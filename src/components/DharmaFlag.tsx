type DharmaFlagProps = {
    className?: string;
    animate?: boolean;
};

/**
 * Decorative saffron pennant motif used as a brand accent in corners of
 * hero/panel surfaces. Purely ornamental — not a reproduction of any
 * organization's emblem.
 */
export function DharmaFlag({ className = '', animate = true }: DharmaFlagProps) {
    return (
        <svg
            viewBox="0 0 64 96"
            className={`${animate ? 'animate-flag-sway' : ''} ${className}`}
            style={{ transformOrigin: '6px 4px' }}
            aria-hidden="true"
        >
            <line x1="6" y1="2" x2="6" y2="94" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-charcoal-300" />
            <circle cx="6" cy="4" r="3.5" fill="currentColor" className="text-saffron-400" />
            <path
                d="M9 8 L54 20 Q60 22 54 25 L9 38 Z"
                fill="url(#flagGradient)"
            />
            <defs>
                <linearGradient id="flagGradient" x1="9" y1="8" x2="58" y2="22" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="var(--color-saffron-400)" />
                    <stop offset="100%" stopColor="var(--color-saffron-600)" />
                </linearGradient>
            </defs>
        </svg>
    );
}
