const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const inputFile = path.join(__dirname, '../public/reference_translations.json');
const outputFile = path.join(__dirname, '../public/reference_translations_v2.json');

// Helper to generate UUID v4
function generateUUID() {
  return crypto.randomUUID();
}

try {
  const rawData = fs.readFileSync(inputFile, 'utf8');
  const data = JSON.parse(rawData);

  let processedCount = 0;

  // Handle both array and single object structure (just in case, though file seems to be an array)
  const items = Array.isArray(data) ? data : [data];

  items.forEach(item => {
    if (item.references && Array.isArray(item.references)) {
      item.references.forEach(ref => {
        // 1. Generate new ID
        if (!ref.id) {
            ref.id = generateUUID();
        }

        // 2. Remove match_text
        if (ref.match_text) {
          delete ref.match_text;
        }
        
        processedCount++;
      });
    }
  });

  // Write to new file
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 4), 'utf8');
  
  console.log(`Successfully processed ${processedCount} references.`);
  console.log(`Migration complete. Output saved to: ${outputFile}`);

} catch (error) {
  console.error('Error during migration:', error);
  process.exit(1);
}
