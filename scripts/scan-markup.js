
const fs = require('fs');
const path = require('path');

const ROOT = path.join(process.cwd(), 'golden-spec');
const THEME_JSON_PATH = path.join(ROOT, 'theme.json');
const TARGETS = ['templates', 'parts', 'patterns'];

// Load Theme JSON for Preset Validation
let ALLOWED_PRESETS = new Set();
// ... (Preset loading same as before) 
// Redefining for conciseness in this tool call
if (fs.existsSync(THEME_JSON_PATH)) {
    try {
        const themeJson = JSON.parse(fs.readFileSync(THEME_JSON_PATH, 'utf8'));
        if (themeJson.settings?.color?.palette) {
            themeJson.settings.color.palette.forEach(p => ALLOWED_PRESETS.add(`var:preset|color|${p.slug}`));
        }
        [10, 20, 30, 40, 50, 60, 70, 80].forEach(s => ALLOWED_PRESETS.add(`var:preset|spacing|${s}`));
    } catch (e) { }
}

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = [];
    const lines = content.split('\n');
    let blockStack = [];
    let inHtmlBlock = false;

    // NAV REF Check
    if (/"ref":\s*\d/.test(content) || /"ref":\s*"/.test(content)) {
        errors.push({ line: 1, type: 'NAV_REF', msg: 'Navigation Reference found', snippet: 'ref: ...' });
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lineNum = i + 1;
        if (!line) continue;

        const blockRegex = /<!--\s*(\/)?wp:([a-zA-Z0-9\/-]+)(?:\s+({.*?}))?(\s*\/)?\s*-->/g;
        let match;
        let lineWithoutBlocks = line;

        while ((match = blockRegex.exec(line)) !== null) {
            const fullMatch = match[0];
            const isClosing = match[1] === '/';
            const blockName = match[2];
            const isSelfClosing = match[4] === '/';

            lineWithoutBlocks = lineWithoutBlocks.replace(fullMatch, '');

            if (isSelfClosing) {
                // noop
            } else if (isClosing) {
                if (blockStack.length > 0) {
                    const last = blockStack.pop();
                    if (last === 'html') inHtmlBlock = false;
                }
            } else {
                blockStack.push(blockName);
                if (blockName === 'html') inHtmlBlock = true;
            }
        }

        // RAW HTML Check
        if (!inHtmlBlock && lineWithoutBlocks.trim().length > 0) {
            // Check for tags
            const tagMatch = lineWithoutBlocks.match(/<([a-z0-9]+)/i);
            if (tagMatch) {
                const tagName = tagMatch[1].toLowerCase();

                // Allowed Leaf Content Tags
                const ALLOWED_CONTENT_TAGS = [
                    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption', 'blockquote', 'cite', 'em', 'strong', 'code', 'pre', 'br', 'hr', 'span'
                ];

                // BANNED Wrappers (Structural)
                const BANNED_WRAPPERS = ['div', 'main', 'section', 'header', 'footer', 'article', 'aside', 'nav'];

                if (BANNED_WRAPPERS.includes(tagName)) {
                    errors.push({ line: lineNum, type: 'RAW_HTML_OUTSIDE_WPHTML', msg: `Banned Structural Tag <${tagName}> detected`, snippet: lineWithoutBlocks.substring(0, 40) });
                }
                // If it's a content tag, we assume it's valid content for the current block (e.g. p in wp:paragraph).
                // If it's something else not in allowed list, potential issue?
            }

            // Also check confusing </div> closing tags
            if (lineWithoutBlocks.includes('</div>')) {
                errors.push({ line: lineNum, type: 'RAW_HTML_OUTSIDE_WPHTML', msg: `Closing </div> detected`, snippet: '</div>' });
            }
        }
    }

    return errors;
}

function run() {
    console.log('Strict Scan (Smart)...');
    let output = '# Markup Violation Report (Strict/Smart)\n\n';
    let totalErrors = 0;

    // ... file walking logic ...
    const filesToScan = [];
    function walk(dir) {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const f of files) {
            const full = path.join(dir, f);
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
                walk(full);
            } else if (f.endsWith('.html') || (f.endsWith('.php') && !f.includes('functions.php'))) {
                filesToScan.push(full);
            }
        }
    }
    TARGETS.forEach(t => walk(path.join(ROOT, t)));

    filesToScan.forEach(f => {
        const errs = scanFile(f);
        if (errs.length > 0) {
            output += `## File: ${path.relative(ROOT, f)}\n`;
            errs.forEach(e => output += `- ${e.type}: ${e.msg}\n`);
            totalErrors += errs.length;
        }
    });

    fs.writeFileSync(path.join(process.cwd(), 'reports', 'MARKUP_VIOLATIONS.md'), output);
    console.log(`Found ${totalErrors} violations.`);
}

run();
