
const fs = require('fs');
const path = require('path');

const ROOT = path.join(process.cwd(), 'golden-spec/patterns');
const TARGETS = [
    'page-about.php', 'page-contact.php', 'page-menu.php', 'page-services.php',
    'canonical-hero.html', 'home-hero.html', 'page-hero.html', 'seed-hero.html'
];

function cleanFile(fileName) {
    const filePath = path.join(ROOT, fileName);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    // Normalize spacing
    content = content.replace(/\r\n/g, '\n');
    const lines = content.split('\n');
    const cleaned = [];

    // Pattern to identify wrappers: 
    // <div class="wp-block-columns alignwide">
    // <div class="wp-block-column ...">
    // </div>
    // We want to remove these lines entirely.

    for (const line of lines) {
        const trim = line.trim();
        // Skip wrapper divs
        if (trim.match(/^<div\s+class="wp-block-(columns|column|group|cover|buttons|button|media-text).*?>$/) ||
            trim.match(/^<\/div>$/) ||
            trim.match(/^<main.*?>$/) ||
            trim.match(/^<\/main>$/)) {
            // Drop it
        } else if (trim.match(/^<div\s+class="wp-block-cover__inner-container">$/)) {
            // Drop cover inner
        } else if (trim.match(/^<span.*wp-block-cover__background.*<\/span>/)) {
            // drop background span if on own line
        } else {
            cleaned.push(line);
        }
    }

    fs.writeFileSync(filePath, cleaned.join('\n'));
    console.log(`Cleaned ${fileName}`);
}

TARGETS.forEach(cleanFile);
