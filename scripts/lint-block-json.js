const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Use glob to find files, if glob is not available we can use a simple recursive walk or just list specific dirs
// The user environment might not have 'glob' installed as a dependency in package.json?
// Checking package.json from previous turn... it doesn't list 'glob'.
// I'll implement a simple file walker or just read the specific directories mentioned.
// User said: "Scan golden-spec/parts/*.html and golden-spec/templates/*.html"

const DIRS_TO_SCAN = [
    'golden-spec/parts',
    'golden-spec/templates'
];

let hasError = false;

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Regex to match <!-- wp:namespace/blockname { ... } -->
    // We care about the JSON part.
    // Handle self-closing tags with \/? before -->
    const regex = /<!--\s*wp:([a-z0-9\/-]+)\s+(\{.*?\})\s*\/?-->/gs;

    let match;
    while ((match = regex.exec(content)) !== null) {
        const blockName = match[1];
        const jsonString = match[2];

        try {
            JSON.parse(jsonString);
        } catch (e) {
            console.error(`❌ Invalid JSON in ${filePath}`);
            console.error(`   Block: ${blockName}`);
            console.error(`   Error: ${e.message}`);
            // Show a snippet of the bad JSON
            const snippet = jsonString.length > 50 ? jsonString.substring(0, 50) + '...' : jsonString;
            console.error(`   Content: ${snippet}`);
            hasError = true;
        }
    }
}

function scanDirectory(dir) {
    if (!fs.existsSync(dir)) {
        console.warn(`Directory not found: ${dir}`);
        return;
    }

    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.endsWith('.html')) {
            scanFile(path.join(dir, file));
        }
    }
}

console.log('🔍 Linting Block JSON...');
const rootDir = process.cwd(); // Should be root of repo

for (const dir of DIRS_TO_SCAN) {
    const fullPath = path.join(rootDir, dir);
    scanDirectory(fullPath);
}

if (hasError) {
    console.error('FAILED: Invalid JSON found in block comments.');
    process.exit(1);
} else {
    console.log('✅ All Block JSON is valid.');
    process.exit(0);
}
