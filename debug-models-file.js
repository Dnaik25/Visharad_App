const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        let output = "";
        if (data.models) {
            data.models.forEach(m => {
                if (m.name.includes("gemini")) output += m.name + "\n";
            });
        } else {
            output = JSON.stringify(data);
        }
        fs.writeFileSync('models_list.txt', output);
        console.log("Wrote models_list.txt");
    } catch (e) {
        console.log("Error:", e);
    }
}
listModels();
