import { AUDIO_MAPPING } from './audioMapping';

// The CONTAINER-LEVEL SAS URL provided by the user
const CONTAINER_SAS_URL = "https://refaudio.blob.core.windows.net/audio?sp=racwdl&st=2025-12-25T15:49:30Z&se=2026-12-01T00:04:30Z&spr=https&sv=2024-11-04&sr=c&sig=CqZo2G%2B02XufoTb5x1Q76TSc32S%2BpLhjRZVV4ip0EXI%3D";

interface ParsedSas {
    baseUrl: string;
    sasToken: string;
}

/**
 * 1️⃣ Parse the SAS container URL
 * Splits it into the base container URL and the SAS query string.
 */
export function parseSasUrl(fullUrl: string): ParsedSas {
    try {
        const urlObj = new URL(fullUrl);
        // baseUrl should be "https://account.blob.core.windows.net/container"
        // urlObj.origin gives "https://account.blob.core.windows.net"
        // urlObj.pathname gives "/container"
        const baseUrl = `${urlObj.origin}${urlObj.pathname}`;
        // sasToken is everything after '?'
        const sasToken = urlObj.search;

        return { baseUrl, sasToken };
    } catch (error) {
        console.error("Invalid SAS URL provided:", fullUrl, error);
        return { baseUrl: '', sasToken: '' };
    }
}

/**
 * 3️⃣ Build FULL audio URLs
 * @param reference The text reference (e.g., "Vach.Sā.1")
 * @returns The full signed URL or null if not found
 */
export function getAudioUrl(reference: string): string | null {
    const blobPath = AUDIO_MAPPING[reference];

    if (!blobPath) {
        console.warn(`Audio mapping not found for reference: "${reference}"`);
        return null;
    }

    const { baseUrl, sasToken } = parseSasUrl(CONTAINER_SAS_URL);

    if (!baseUrl || !sasToken) {
        console.error("Failed to parse container SAS URL.");
        return null;
    }

    // Handle slashes carefully. blobPath shouldn't start with / if we append it directly
    const cleanPath = blobPath.startsWith('/') ? blobPath.substring(1) : blobPath;

    // Construct final URL: Base + / + Path + ? + SAS
    // Note: If baseUrl already ends in /, don't add another.
    // URL constructor is safer but pure string concat is fine if we're careful.

    // Using URL constructor to handle encoding of spaces in "Class 1" keys automatically
    const finalUrl = new URL(`${baseUrl}/${cleanPath}${sasToken}`);

    return finalUrl.toString();
}

/**
 * Helper to bind audio players to UI placeholders
 * Can be called in useEffect or on hydration.
 */
export function injectAudioPlayers() {
    // 1. Find every reference block
    const blocks = document.querySelectorAll('.reference-block');

    blocks.forEach((block) => {
        // 2. Read reference value
        const reference = block.getAttribute('data-reference');
        const placeholder = block.querySelector('.audio-placeholder');

        if (reference && placeholder) {
            // Check if we already injected
            if (placeholder.querySelector('audio')) {
                return;
            }

            // 3. Look up audio mapping
            const audioUrl = getAudioUrl(reference);

            if (audioUrl) {
                // Clear placeholder text first if it exists
                placeholder.innerHTML = '';

                // 4. Insert <audio> player
                const audioEl = document.createElement('audio');
                audioEl.controls = true;
                audioEl.src = audioUrl;
                audioEl.style.width = '100%';
                audioEl.style.marginTop = '8px';
                audioEl.style.marginBottom = '8px';

                placeholder.appendChild(audioEl);
            } else {
                console.warn(`No audio mapping found for reference: "${reference}"`);
            }
        }
    });
}
