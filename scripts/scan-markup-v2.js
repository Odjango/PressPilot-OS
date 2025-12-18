
const fs = require('fs');
const path = require('path');

const ROOT = path.join(process.cwd(), 'golden-spec');
const TARGETS = ['templates', 'parts', 'patterns'];

// Classes that imply a block wrapper
const WRAPPER_CLASSES = [
    'wp-block-group', 'wp-block-columns', 'wp-block-column',
    'wp-block-cover', 'wp-block-buttons', 'wp-block-button',
    'wp-block-media-text', 'wp-block-spacer'
];

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const errors = [];
    let blockStack = [];

    lines.forEach((line, i) => {
        const lineNum = i + 1;
        const trim = line.trim();
        if (!trim) return;

        // 1. Block Stack Logic (Simplified for Audit)
        const blockRegex = /<!--\s*(\/)?wp:([a-zA-Z0-9\/-]+)(?:\s+({.*?}))?(\s*\/)?\s*-->/g;
        let match;
        let hasBlockComment = false;

        while ((match = blockRegex.exec(line)) !== null) {
            hasBlockComment = true;
            const isClosing = match[1] === '/';
            const blockName = match[2];
            const isSelfClosing = !!match[4] && match[4].includes('/');

            if (!isSelfClosing) {
                if (isClosing) {
                    if (blockStack.length > 0) blockStack.pop();
                } else {
                    blockStack.push(blockName);
                }
            }
        }

        // 2. Orphaned Wrapper Check
        // If line contains a wrapper class BUT NO block comment, it's likely orphaned raw HTML
        // (Unless it's inside an HTML block, which we are banning for wrappers anyway per user intent)
        // User Rule: "Wrapper HTML ... allowed only when paired with the correct <!-- wp:* --> open"

        let isWrapper = false;
        WRAPPER_CLASSES.forEach(cls => {
            if (line.includes(cls)) isWrapper = true;
        });

        // Special checks for Cover block internals that were stripped
        if (line.includes('wp-block-cover__inner-container') ||
            line.includes('wp-block-cover__background') ||
            line.includes('wp-block-cover__image-background')) {
            isWrapper = true;
        }

        if (isWrapper && !hasBlockComment) {
            // Check context: are we deep inside a block?
            // Actually, for things like Group, the div usually sits immediately after the comment.
            // If the comment is on previous line, this line has no comment.
            // But strict serialization usually puts them together or adjacent.
            // Let's flag it if it looks suspicious.
            // Wait, standard WP output often puts <div ...> on next line.
            // But our previous "Cleaner" might have stripped the div and left the content, OR stripped the comment?
            // No, cleaner stripped the DIVs.
            // We want to find files where we *shouldn't* have stripped them (like Cover) or where we stripped too much.

            // Actually, the User Request says:
            // "Flag any file that contains <div class="wp-block- but is missing an adjacent <!-- wp: open/close"
            // This is hard to check line-by-line.
            // Let's simpler check: If we see `wp-block-cover` in HTML but NOT inside a `wp:cover` block in stack?
            // Or if we see orphaned artifacts like `src="..."` starting a line.

            errors.push({ line: lineNum, type: 'ORPHAN_WRAPPER', msg: `Potential orphaned wrapper class or artifact: ${trim.substring(0, 40)}...` });
        }

        // 3. Orphaned Fragments (Specific to broken covers)
        if (trim.startsWith('src="/assets/') || trim.startsWith('/>')) {
            errors.push({ line: lineNum, type: 'BROKEN_FRAGMENT', msg: `Broken HTML fragment detected: ${trim}` });
        }

    });

    return errors;
}

function run() {
    console.log('Auditing Block Markup...');
    let output = '# Markup Violation Report\n\n';
    let totalErrors = 0;

    function walk(dir) {
        if (!fs.existsSync(dir)) return;
        fs.readdirSync(dir).forEach(f => {
            const full = path.join(dir, f);
            if (fs.statSync(full).isDirectory()) walk(full);
            else if (f.endsWith('.html') || (f.endsWith('.php') && !f.includes('functions.php'))) {
                const errs = scanFile(full);
                if (errs.length > 0) {
                    output += `## File: ${path.relative(ROOT, full)}\n`;
                    errs.forEach(e => output += `- ${e.type} (L${e.line}): ${e.msg}\n`);
                    totalErrors += errs.length;
                }
            }
        });
    }

    TARGETS.forEach(t => walk(path.join(ROOT, t)));

    fs.writeFileSync(path.join(process.cwd(), 'reports', 'MARKUP_VIOLATIONS.md'), output);
    console.log(`Audit complete. Found ${totalErrors} potential violations.`);
}

run();
