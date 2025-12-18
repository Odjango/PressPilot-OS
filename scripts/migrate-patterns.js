const fs = require('fs');
const path = require('path');

const PATTERNS_DIR = 'tests/fixtures/atlas-spec/patterns';

function toTitleCase(str) {
    return str.split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

const files = fs.readdirSync(PATTERNS_DIR);

files.forEach(file => {
    const ext = path.extname(file);
    const basename = path.basename(file, ext);
    const fullPath = path.join(PATTERNS_DIR, file);

    if (ext === '.html') {
        const content = fs.readFileSync(fullPath, 'utf8');
        const slug = `presspilot/${basename}`;
        const title = toTitleCase(basename);

        const phpContent = `<?php
/**
 * Title: ${title}
 * Slug: ${slug}
 * Categories: presspilot
 */
?>
${content}`;

        const newPath = path.join(PATTERNS_DIR, basename + '.php');
        fs.writeFileSync(newPath, phpContent);
        fs.unlinkSync(fullPath);
        console.log(`Converted ${file} to ${basename}.php`);
    } else if (ext === '.php') {
        // Ensure header exists
        let content = fs.readFileSync(fullPath, 'utf8');
        if (!content.includes('Slug:')) {
            const slug = `presspilot/${basename}`;
            const title = toTitleCase(basename);
            const header = `<?php
/**
 * Title: ${title}
 * Slug: ${slug}
 * Categories: presspilot
 */
?>
`;
            fs.writeFileSync(fullPath, header + content);
            console.log(`Added header to ${file}`);
        }
    }
});
