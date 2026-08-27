export function PulsingBars({ active }: { active: boolean }) {
    const bars = [0, 1, 2, 3];

    return (
        <div className="flex items-end gap-[3px] h-4 shrink-0" aria-hidden="true">
            {bars.map((i) => (
                <span
                    key={i}
                    className={`w-[3px] h-full rounded-full origin-bottom ${active ? 'bg-saffron-500 animate-pulse-bar' : 'bg-charcoal-300'
                        }`}
                    style={active ? { animationDelay: `${i * 0.15}s` } : { transform: 'scaleY(0.35)' }}
                />
            ))}
        </div>
    );
}
