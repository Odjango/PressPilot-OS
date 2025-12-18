
const fs = require('fs');
const path = require('path');

const ROOT = path.join(process.cwd(), 'golden-spec/patterns');
// We will scan ALL PHP/HTML files in patterns, partials, templates to be safe
const DIRS = [
    path.join(process.cwd(), 'golden-spec/patterns'),
    path.join(process.cwd(), 'golden-spec/templates'),
    path.join(process.cwd(), 'golden-spec/parts')
];

function cleanFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    // Normalize newlines
    content = content.replace(/\r\n/g, '\n');
    const lines = content.split('\n');
    let cleaned = [];

    let inHtmlBlock = false;
    let inGarbageTag = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let trim = line.trim();

        // Track wp:html
        if (trim.includes('wp:html')) inHtmlBlock = true;
        if (trim.includes('/wp:html')) inHtmlBlock = false;

        if (inHtmlBlock) {
            cleaned.push(line);
            continue;
        }

        // If we are already stripping a multi-line tag
        if (inGarbageTag) {
            // Check if this line ends the tag
            if (trim.endsWith('>') || line.includes('>')) {
                inGarbageTag = false;
                // If the line has content AFTER the tag close, we might want to keep it?
                // Usually wrappers are on their own "logical" lines.
                // For now, assume entire line is part of the garbage wrapper.
            }
            continue;
        }

        // Detect Start of Garbage
        // 1. Opening Wrappers: <div class="wp-block-...", <main, <header, <footer
        // Note: We want to match <div class="wp-block-group", "columns", "cover", "buttons", "media-text"
        // But NOT "wp-block-heading" or valid content blocks.
        if (trim.match(/^<div\s+class="wp-block-(group|columns|column|cover|buttons|button|media-text|spacer)/) ||
            trim.match(/^<main/) ||
            trim.match(/^<header/) ||
            trim.match(/^<footer/) ||
            trim.match(/^<article/) ||
            trim.match(/^<aside/) ||
            trim.match(/^<nav/)) {

            // Check if it ends on same line
            if (!line.includes('>')) {
                inGarbageTag = true; // Multi-line start
            } else {
                // Single line garbage, drop it.
                // UNLESS it has content after? 
                // <div ...>Content</div> -> we lose Content.
                // But FSE templates usually have nested blocks:
                // <div class="wp-block-group">
                //    <!-- wp:heading -->
                // So the div line is usually purely structural.
            }
            continue;
        }

        // 2. Closing Wrappers
        if (trim.match(/^<\/div>/) ||
            trim.match(/^<\/main>/) ||
            trim.match(/^<\/header>/) ||
            trim.match(/^<\/footer>/) ||
            trim.match(/^<\/article>/) ||
            trim.match(/^<\/aside>/) ||
            trim.match(/^<\/nav>/)) {
            continue;
        }

        // 3. Cover Inner / Background
        if (trim.includes('wp-block-cover__inner-container') ||
            trim.includes('wp-block-cover__background') ||
            trim.includes('wp-block-cover__image-background')) {
            if (!line.includes('>')) inGarbageTag = true;
            continue;
        }

        cleaned.push(line);
    }

    // Check if we changed anything
    const newContent = cleaned.join('\n');
    if (newContent.length !== content.length) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Cleaned ${path.basename(filePath)}`);
    }
}

function run() {
    DIRS.forEach(d => {
        if (fs.existsSync(d)) {
            const files = fs.readdirSync(d);
            files.forEach(f => {
                if (f.endsWith('.php') || f.endsWith('.html')) {
                    if (f !== 'functions.php') cleanFile(path.join(d, f));
                }
            });
        }
    });
}

run();
