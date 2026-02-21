
const https = require('https');

const SAS_URL = "https://refaudio.blob.core.windows.net/audioandmukhpathref?sp=rl&st=2025-12-28T16:39:55Z&se=2026-02-02T00:54:55Z&spr=https&sv=2024-11-04&sr=c&sig=uAS77uiZDk1pp7QcO3%2BTJ5nL6YeCI3CASbZTGna5SJg%3D";
const TEST_FILE = "class 1/V Sar1.m4a";

// Parse SAS URL
const urlObj = new URL(SAS_URL);
const baseUrl = `${urlObj.origin}${urlObj.pathname}`;
const sasToken = urlObj.search;

const fullUrl = `${baseUrl}/${TEST_FILE}${sasToken}`;

console.log("Testing URL:", fullUrl);

https.get(fullUrl, (res) => {
    console.log("Status Code:", res.statusCode);
    console.log("Status Message:", res.statusMessage);

    if (res.statusCode !== 200) {
        console.log("Error: Request failed.");
    } else {
        console.log("Success: File is accessible.");
    }
}).on('error', (e) => {
    console.error("Error:", e);
});
