
const fs = require('fs');
const path = require('path');

const ROOT = path.join(process.cwd(), 'golden-spec');
const TARGETS = ['templates', 'parts', 'patterns'];

// Strips lines that contain raw HTML tags if they are NOT inside wp:html blocks
function cleanFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Normalize line endings
    content = content.replace(/\r\n/g, '\n');
    const lines = content.split('\n');
    let cleanedLines = [];
    let inHtmlBlock = false;
    let changed = false;

    for (const line of lines) {
        let keepLine = true;
        const trim = line.trim();

        if (trim.includes('wp:html')) inHtmlBlock = true;
        if (trim.includes('/wp:html')) inHtmlBlock = false;

        if (!inHtmlBlock) {
            // Aggressive Wrapper Stripping
            // Detect common block wrappers that should be dynamic in FSE

            // Group, Columns, Column
            if (/^<div\s+class="wp-block-(group|columns|column|buttons|button|cover|media-text)[ "].*?>$/.test(trim) ||
                /^<div\s+class="wp-block-(group|columns|column|buttons|button|cover|media-text)">$/.test(trim) ||
                /^<main\s+class=".*?>$/.test(trim) ||
                /^<header\s+class=".*?>$/.test(trim) ||
                /^<footer\s+class=".*?>$/.test(trim) ||
                /^<\/main>$/.test(trim) ||
                /^<\/header>$/.test(trim) ||
                /^<\/footer>$/.test(trim) ||
                /^<\/div>$/.test(trim)) {

                // Special Case: wp:cover often has span/img for background on same line or next
                // logic here only deletes start/end tags on their own lines or start tags with attributes.
                // If content is mixed on same line, this regex might miss or be too safe.
                // But our files seem pretty pretty-printed.
                keepLine = false;
                changed = true;
            }

            // Cover inner container
            if (trim.includes('wp-block-cover__inner-container')) {
                keepLine = false;
                changed = true;
            }
            // Cover background span/img (simplified: if line starts with span/img and is inside cover context? Hard to know context here)
            // But usually these are part of the cover block logic.
            // If we strip the cover div, we probably should strip the background helpers too, assuming the block dictating them recycles them?
            // Actually, for wp:cover, creating it "sourceless" (just json) works if attributes are set.
            if (trim.startsWith('<span aria-hidden="true" class="wp-block-cover__background')) {
                keepLine = false;
                changed = true;
            }
            // Image background often on its own line
            if (trim.startsWith('<img class="wp-block-cover__image-background"')) {
                keepLine = false;
                changed = true;
            }

            // Link wrappers in buttons
            if (trim.startsWith('<a class="wp-block-button__link"')) {
                // Wait, the link IS the content of the button block?
                // `wp:button` wraps an `a` tag. 
                // Unlike `wp:group`, `wp:button` DOES expect the `a` tag in its save content usually.
                // But "Attempt Recovery" often happens if classes mismatch.
                // Let's TRY keeping the `a` tag but ensuring no `div` wrapper around it (handled above).
            }
        }

        if (keepLine) {
            cleanedLines.push(line);
        } else {
            // console.log(`[Stripped] ${path.basename(filePath)}: ${trim}`);
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, cleanedLines.join('\n'));
        return true;
    }
    return false;
}

function run() {
    console.log('Cleaning Wrappers (Aggressive)...');
    let totalChanged = 0;

    function walk(dir) {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const f of files) {
            const full = path.join(dir, f);
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
                walk(full);
            } else if (f.endsWith('.html') || (f.endsWith('.php') && !f.includes('functions.php'))) {
                if (cleanFile(full)) totalChanged++;
            }
        }
    }

    TARGETS.forEach(t => walk(path.join(ROOT, t)));
    console.log(`Cleaned ${totalChanged} files.`);
}

run();
