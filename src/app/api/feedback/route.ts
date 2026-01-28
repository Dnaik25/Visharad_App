import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Initial structure if file doesn't exist
const INITIAL_DATA: any[] = [];
const FEEDBACK_FILENAME = 'feedback.json';

export async function POST(request: Request) {
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
        console.error("Missing BLOB_READ_WRITE_TOKEN");
        return NextResponse.json({
            error: "Configuration Error: BLOB_READ_WRITE_TOKEN is missing on server.",
            details: "Please ensure .env.local is loaded."
        }, { status: 500 });
    }

    try {
        const body = await request.json();
        const newEntry = {
            timestamp: new Date().toISOString(),
            ...body
        };

        let allFeedback = [...INITIAL_DATA];

        try {
            // 1. Check if feedback.json exists and download it
            // Using 'list' to find the file URL first
            const { blobs } = await list({
                prefix: FEEDBACK_FILENAME,
                token: token
            });
            const existingBlob = blobs.find(b => b.pathname === FEEDBACK_FILENAME);

            if (existingBlob) {
                // Fetch current content
                const response = await fetch(existingBlob.url);
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        allFeedback = data;
                    }
                }
            }
        } catch (readError) {
            console.warn("Could not read existing feedback file, starting fresh", readError);
        }

        // 2. Append new data
        allFeedback.push(newEntry);

        // 3. Overwrite the file in Vercel Blob
        const blob = await put(FEEDBACK_FILENAME, JSON.stringify(allFeedback, null, 2), {
            access: 'public',
            contentType: 'application/json',
            // Allow overwriting explicitly
            addRandomSuffix: false,
            // @ts-ignore - The type definition might be outdated, but the API requires this
            allowOverwrite: true,
            token: token
        });

        return NextResponse.json({ success: true, url: blob.url });
    } catch (error) {
        console.error('Error saving feedback:', error);
        // Be more specific about the error if possible
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, details: error.stack }, { status: 500 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
