const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function testGemini() {
    console.log("Checking API...");
    if (!process.env.GEMINI_API_KEY) {
        console.log("NO KEY"); return;
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Trying the model I just set in the code
    const m = "gemini-1.5-flash-001";

    console.log(`Trying ${m}...`);
    try {
        const model = genAI.getGenerativeModel({ model: m });
        const res = await model.generateContent("Say 'Hello' if you are working.");
        console.log(`SUCCESS: ${m}`);
        console.log(res.response.text());
    } catch (e) {
        console.log(`FAIL ${m}: ${e.status || e.message}`);
        if (e.message) console.log(e.message);
    }
}

testGemini();
