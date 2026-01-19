export type RefItem = {
    ref: string;
    displayRef?: string;
    text: string;
    title?: string;
};

export type ShlokBlock = {
    shlokNumber: number;
    shlokSanskrit: string | null;
    shlokTransliteration: string | null;

    // placeholders
    shlokAudioUrl: string | null;
    shlokExplanation: string;

    references: Record<string, RefItem[]>;

    // key = source + ":" + ref
    referenceAudioUrlByKey: Record<string, string | null>;
};
