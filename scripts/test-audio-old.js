
const https = require('https');

const SAS_URL = "https://refaudio.blob.core.windows.net/audio?sp=racwdl&st=2025-12-25T15:49:30Z&se=2026-12-01T00:04:30Z&spr=https&sv=2024-11-04&sr=c&sig=CqZo2G%2B02XufoTb5x1Q76TSc32S%2BpLhjRZVV4ip0EXI%3D";
const TEST_FILE = "class 1/V Sar1.m4a";

// Parse SAS URL
const urlObj = new URL(SAS_URL);
const baseUrl = `${urlObj.origin}${urlObj.pathname}`;
const sasToken = urlObj.search;

const fullUrl = `${baseUrl}/${TEST_FILE}${sasToken}`;

console.log("Testing OLD URL:", fullUrl);

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
