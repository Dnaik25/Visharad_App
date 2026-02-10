const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        console.log("--- API RESPONSE ---");
        if (data.error) {
            console.log("ERROR:", JSON.stringify(data.error, null, 2));
        } else if (data.models) {
            console.log("Models found:", data.models.length);
            data.models.forEach(m => {
                if (m.name.includes("gemini")) console.log(m.name);
            });
        }
        console.log("--------------------");
    } catch (e) {
        console.log("Fetch Error:", e);
    }
}
listModels();
