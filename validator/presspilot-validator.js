const fs = require('fs');
const path = require('path');

const THEME_PATH = process.argv[2];

if (!THEME_PATH) {
    console.error("Usage: node presspilot-validator.js <theme-path>");
    process.exit(1);
}

console.log(`PressPilot Theme Validator (Structural Integrity V2.0)\nTheme path: ${THEME_PATH}\n`);

let ERROR_COUNT = 0;
let WARNING_COUNT = 0;
const REPORT_LINES = [];

function logPass(msg) {
    console.log(`✅ ${msg}`);
}
function logFail(msg) {
    console.error(`❌ ${msg}`);
    REPORT_LINES.push(`- [FAIL] ${msg}`);
    ERROR_COUNT++;
}
function logWarn(msg) {
    console.warn(`⚠️  ${msg}`);
    REPORT_LINES.push(`- [WARN] ${msg}`);
    WARNING_COUNT++;
}

// 1. Structure & Required Files
console.log("=== 1. Structure & Required Files ===");
REPORT_LINES.push('## Structure');
const requiredFiles = ['style.css', 'theme.json', 'functions.php'];
requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(THEME_PATH, file))) {
        logPass(`Found required file: ${file}`);
    } else {
        logFail(`Missing required file: ${file}`);
    }
});

const requiredDirs = ['templates/', 'parts/'];
requiredDirs.forEach(dir => {
    if (fs.existsSync(path.join(THEME_PATH, dir))) {
        logPass(`Found required directory: ${dir}`);
    } else {
        logFail(`Missing required directory: ${dir}`);
    }
});

// 2. theme.json Validation
console.log("\n=== 2. theme.json Validation ===");
REPORT_LINES.push('\n## Theme JSON');
const themeJsonPath = path.join(THEME_PATH, 'theme.json');
let themeJson = null;
if (fs.existsSync(themeJsonPath)) {
    try {
        themeJson = JSON.parse(fs.readFileSync(themeJsonPath, 'utf8'));
        logPass("theme.json parsed successfully.");

        if (themeJson.version === 3) logPass("theme.json version is 3.");
        else logWarn(`theme.json version is ${themeJson.version}, expected 2 or 3.`);

        if (themeJson.settings?.layout?.contentSize && themeJson.settings?.layout?.wideSize) {
            logPass("settings.layout defines contentSize and wideSize.");
        } else {
            logFail("settings.layout missing contentSize or wideSize (Clamp Violation).");
        }

    } catch (e) {
        logFail(`Invalid JSON in theme.json: ${e.message}`);
    }
} else {
    logFail("theme.json not found.");
}

// 3. Capability Checks
console.log("\n=== 3. Capability Checks ===");
REPORT_LINES.push('\n## Capabilities');

// RTL Check
const staticPreview = path.join(THEME_PATH, 'static-preview.html');
if (fs.existsSync(staticPreview)) {
    const staticContent = fs.readFileSync(staticPreview, 'utf8');
    if (staticContent.includes('dir="rtl"')) logPass("Static Preview: RTL detected.");
    if (staticContent.includes('data-theme="dark"')) {
        logPass("Static Preview: Dark Mode Parity token detected.");
    } else if (fs.existsSync(path.join(THEME_PATH, 'styles/dark.json'))) {
        logWarn("Dark Mode: WP style variation found, but Static Preview missing 'data-theme=dark' parity token.");
    }
}

// Dark Mode
if (fs.existsSync(path.join(THEME_PATH, 'styles/dark.json'))) {
    logPass("Dark Mode: styles/dark.json found.");
}

// Ecom
if (themeJson && themeJson.settings?.custom?.woocommerce) {
    if (fs.existsSync(path.join(THEME_PATH, 'patterns/shop-grid.php'))) {
        logPass("Ecom: Shop Grid pattern found.");
    } else {
        logFail("Ecom: WooCommerce claimed in theme.json but shop-grid pattern missing.");
    }
}

// 4. Integrity content scanning (Strict Block Balance & Nav Ref)
console.log("\n=== 4. Integrity Scanning ===");
REPORT_LINES.push('\n## Integrity Scan');

function scanDir(dir) {
    const fullDir = path.join(THEME_PATH, dir);
    if (!fs.existsSync(fullDir)) return;

    fs.readdirSync(fullDir).forEach(file => {
        if (!file.endsWith('.html') && !file.endsWith('.php')) return;
        const subPath = path.join(dir, file);
        const content = fs.readFileSync(path.join(fullDir, file), 'utf8');
        const lines = content.split('\n');

        let blockStack = [];

        // NAV REF Check (Start with this as it's a specific hard fail)
        if (content.includes('"ref":')) {
            if (/<!-- wp:navigation.*?"ref":\d+/s.test(content) || /"ref":\s*\d/.test(content)) {
                logFail(`${subPath}: Forbidden 'ref' attribute in Navigation block.`);
            }
        }

        // DELIMITER CHECK (Agent 5 Hard Gate)
        if (content.includes('{{') && content.includes('}}')) {
            // Exclude some legitimate cases if any? No, FSE HTML should generally be resolved.
            // Pattern tokens like {{HERO_}} should be gone.
            logFail(`${subPath}: Forbidden Mustache Delimiters {{…}} detected (Tokens not resolved).`);
        }
        if (content.includes('${') && content.includes('}')) {
            // JS Template Literal Check
            logFail(`${subPath}: Forbidden JS Template Literal \${…} detected.`);
        }

        // PRESET VAR LEAKAGE CHECK (Agent 5 Hard Gate)
        // Browsers invalidate 'style="... var:preset|..."' automatically, so we must detect this.
        // However, var:preset IS required in the JSON block attributes.
        // So we strip block comments and check only the HTML content.
        const htmlOnly = content.replace(/<!--[\s\S]*?-->/g, '');
        if (htmlOnly.includes('var:preset|')) {
            logFail(`${subPath}: Forbidden Unresolved Preset Variable 'var:preset|…' detected in HTML output.`);
        }

        // Block Syntax & Balance Check
        lines.forEach((line, i) => {
            const lineNum = i + 1;
            const trim = line.trim();
            if (!trim) return;

            // Simple regex loop for block comments
            const blockRegex = /<!--\s*(\/)?wp:([a-zA-Z0-9\/-]+)(?:\s+({.*?}))?(\s*\/)?\s*-->/g;
            let match;

            while ((match = blockRegex.exec(line)) !== null) {
                const fullMatch = match[0];
                const isClosing = match[1] === '/';
                const blockName = match[2];
                // Support spaces in self-closing tag " /-->"
                const isSelfClosing = !!match[4] && match[4].includes('/');

                if (isSelfClosing) {
                    // It opens and closes immediately. No stack op.
                } else if (isClosing) {
                    if (blockStack.length > 0) {
                        const last = blockStack.pop();
                        if (last !== blockName) {
                            logFail(`${subPath}:${lineNum}: Mismatched closing block. Expected /${last}, got /${blockName}`);
                        }
                    } else {
                        logFail(`${subPath}:${lineNum}: Unexpected closing block /${blockName} (Extra Close)`);
                    }
                } else {
                    blockStack.push(blockName);
                }
            }
        });

        if (blockStack.length > 0) {
            logFail(`${subPath}: Unclosed blocks at EOF: ${blockStack.join(', ')} (Missing Close)`);
        }

        // Agent D: Orphaned Wrapper Heuristic + Strict Wrapper Enforcement
        // Fail if file contains <div class="wp-block-..." but NO block comments at all.
        const hasBlockComments = /<!--\s*(\/)?wp:/.test(content);
        if (!hasBlockComments && /class=["']wp-block-/.test(content)) {
            logFail(`${subPath}: Orphaned Block Wrapper detected (wp-block- class without proper block serialization).`);
        }

        // Strict Wrapper Enforcement (Agent A Logic)
        const STRICT_CONTAINERS = ['group', 'columns', 'column', 'cover', 'buttons', 'navigation', 'social-links', 'list'];
        const LEAF_WRAPPERS = { // Map block name to expected tag
            'list-item': 'li',
            'paragraph': 'p'
        };
        const strictBlockRegex = /<!--\s*wp:([a-zA-Z0-9\/-]+)(?:\s+({.*?}))?\s*-->/g;
        let sMatch;
        while ((sMatch = strictBlockRegex.exec(content)) !== null) {
            const fullMatch = sMatch[0];
            const blockName = sMatch[1];
            const attrsJson = sMatch[2];

            // 1. Malformed JSON Check (Agent 5 "Bulletproof" Gate)
            if (attrsJson) {
                try {
                    const attrs = JSON.parse(attrsJson);
                    // 2. Scope "level": 0 check
                    // Only for heading-like blocks (core/heading, core/site-title)
                    if ((blockName === 'heading' || blockName === 'site-title') && attrs.level === 0) {
                        logFail(`${subPath}: Invalid "level": 0 found in ${blockName}. Must be 1-6.`);
                    }
                } catch (e) {
                    logFail(`${subPath}: Malformed JSON in block attributes for ${blockName}. Error: ${e.message}`);
                }
            }

            // Strict Wrapper Enforcement (Agent A Logic)
            if (STRICT_CONTAINERS.includes(blockName)) {
                if (fullMatch.endsWith('/-->')) continue; // Skip self-closing

                const endOfBlockComment = sMatch.index + fullMatch.length;
                const remaining = content.slice(endOfBlockComment);
                const firstNonWhitespace = remaining.search(/\S/);

                if (firstNonWhitespace === -1) {
                    logFail(`${subPath}: Block ${blockName} ends file or only whitespace follows (missing wrapper).`);
                    continue;
                }

                const nextContent = remaining.slice(firstNonWhitespace);
                let validStarts = [];
                if (blockName === 'group') {
                    let tagName = 'div';
                    if (attrsJson) {
                        try { const a = JSON.parse(attrsJson); if (a.tagName) tagName = a.tagName; } catch (e) { }
                    }
                    validStarts.push(`<${tagName}`);
                } else if (blockName === 'navigation') {
                    validStarts.push('<nav');
                    validStarts.push('<div');
                } else if (blockName === 'social-links') {
                    validStarts.push('<ul');
                } else if (blockName === 'list') {
                    validStarts.push('<ul');
                    validStarts.push('<ol');
                } else {
                    validStarts.push(`<div`);
                }

                const hasWrapper = validStarts.some(s => nextContent.startsWith(s));
                if (!hasWrapper) {
                    logFail(`${subPath}: SERIALIZATION_WRAPPER_MISSING: Block ${blockName} missing wrapper. Expected ${validStarts.join(' or ')}. Found: ${nextContent.substring(0, 20)}...`);
                }
            } else if (LEAF_WRAPPERS[blockName]) {
                // Check leaf wrappers (list-item, paragraph)
                // NOTE: Paragraphs might be self-closing or empty, but if they have content, they must wrap.
                if (fullMatch.endsWith('/-->')) continue;

                const endOfBlockComment = sMatch.index + fullMatch.length;
                const remaining = content.slice(endOfBlockComment);
                const firstNonWhitespace = remaining.search(/\S/);

                if (firstNonWhitespace === -1) {
                    // Empty content might be allowed for paragraph? But usually renders <p></p>
                    continue;
                }

                const nextContent = remaining.slice(firstNonWhitespace);
                const expectedTag = LEAF_WRAPPERS[blockName];

                if (!nextContent.startsWith(`<${expectedTag}`)) {
                    logFail(`${subPath}: LEAF_WRAPPER_MISSING: Block ${blockName} missing <${expectedTag}> wrapper. Found: ${nextContent.substring(0, 20)}...`);
                }
            }
        }
    });
}

scanDir('templates');
scanDir('parts');
scanDir('patterns');

console.log("\n=== Summary ===");
console.log(`Errors: ${ERROR_COUNT}`);
console.log(`Warnings: ${WARNING_COUNT}`);

// Generate Report
const reportPath = path.join(process.cwd(), 'reports', 'BLOCK_MARKUP_INTEGRITY_REPORT.md');
const reportContent = `# Block Markup Integrity Report\n\nRun Date: ${new Date().toISOString()}\nTheme: ${path.basename(THEME_PATH)}\n\n` + REPORT_LINES.join('\n');
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, reportContent);
console.log(`Report saved to: ${reportPath}`);

if (ERROR_COUNT > 0) {
    console.log("Validation FAILED.");
    process.exit(1);
} else {
    console.log("Validation PASSED.");
    process.exit(0);
}
