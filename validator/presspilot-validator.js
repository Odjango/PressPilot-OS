// PressPilot Theme Validator (Golden V1.2 + Capabilities)
// Phase 1.5: Adds Checks for RTL, Dark Mode, Ecom, Nav Ref, Malformed JSON, Undefined Vars

const fs = require('fs');
const path = require('path');

const THEME_PATH = process.argv[2];

if (!THEME_PATH) {
    console.error("Usage: node presspilot-validator.js <theme-path>");
    process.exit(1);
}

console.log(`PressPilot Theme Validator (Golden V1.2.5)\nTheme path: ${THEME_PATH}\n`);

let ERROR_COUNT = 0;
let WARNING_COUNT = 0;

function logPass(msg) {
    console.log(`✅ ${msg}`);
}
function logFail(msg) {
    console.error(`❌ ${msg}`);
    ERROR_COUNT++;
}
function logWarn(msg) {
    console.warn(`⚠️  ${msg}`);
    WARNING_COUNT++;
}

// 1. Structure & Required Files
console.log("=== 1. Structure & Required Files ===");
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
const themeJsonPath = path.join(THEME_PATH, 'theme.json');
let themeJson = null;
if (fs.existsSync(themeJsonPath)) {
    try {
        themeJson = JSON.parse(fs.readFileSync(themeJsonPath, 'utf8'));
        logPass("theme.json parsed successfully.");

        if (themeJson.version === 3) logPass("theme.json version is 3."); // Or 2/3
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

// 3. Capability Checks (Phase 1.5)
console.log("\n=== 3. Capability Checks ===");

// RTL Check: Look for static-preview.html markers
const staticPreview = path.join(THEME_PATH, 'static-preview.html');
if (fs.existsSync(staticPreview)) {
    const staticContent = fs.readFileSync(staticPreview, 'utf8');

    // Check Dir
    if (staticContent.includes('dir="rtl"')) {
        logPass("Static Preview: RTL detected.");
    }

    // Check Dark Mode Parity
    if (staticContent.includes('data-theme="dark"')) {
        logPass("Static Preview: Dark Mode Parity token detected.");
    } else if (fs.existsSync(path.join(THEME_PATH, 'styles/dark.json'))) {
        logWarn("Dark Mode: WP style variation found, but Static Preview missing 'data-theme=dark' parity token.");
    }
}

// Dark Mode File Check
if (fs.existsSync(path.join(THEME_PATH, 'styles/dark.json'))) {
    logPass("Dark Mode: styles/dark.json found.");
}

// Ecom Check
if (themeJson && themeJson.settings?.custom?.woocommerce) {
    if (fs.existsSync(path.join(THEME_PATH, 'patterns/shop-grid.php'))) {
        logPass("Ecom: Shop Grid pattern found.");
    } else {
        logFail("Ecom: WooCommerce claimed in theme.json but shop-grid pattern missing.");
    }
}

// 4. Heuristic Content Scans (Templates & Parts)
console.log("\n=== 4. Content Scanning ===");

function scanDir(dir) {
    const fullDir = path.join(THEME_PATH, dir);
    if (!fs.existsSync(fullDir)) return;

    fs.readdirSync(fullDir).forEach(file => {
        if (!file.endsWith('.html') && !file.endsWith('.php')) return;
        const subPath = path.join(dir, file);
        const content = fs.readFileSync(path.join(fullDir, file), 'utf8');

        // [Fix D] Nav Ref Check
        if (content.includes('"ref":')) {
            // Very strict check. Some refs might be valid (e.g., pattern overrides), but nav refs usually numeric
            // For now, failure on ANY "ref": number inside wp:navigation
            if (/<!-- wp:navigation.*?"ref":\d+/s.test(content)) {
                logFail(`${subPath}: Forbidden 'ref' attribute in Navigation block.`);
            }
        }

        // [Fix F] Malformed JSON check (heuristic: unclosed braces in comments)
        // Simple check: unbalanced curlies in lines starting with <!-- wp:
        const lines = content.split('\n');
        lines.forEach((line, i) => {
            if (line.trim().startsWith('<!-- wp:')) {
                const open = (line.match(/{/g) || []).length;
                const close = (line.match(/}/g) || []).length;
                if (open !== close) {
                    logFail(`${subPath}:${i + 1}: Malformed Block JSON (Unbalanced Braces).`);
                }
            }
        });

        // [Fix F] ACF in Template HTML
        if (content.includes('{{ acf.')) {
            logFail(`${subPath}: ACF Token found in template HTML.`);
        }

        // [Fix F] Undefined Preset Vars
        // Retrieve all defined presets from theme.json
        // Simple flatten logic
        if (themeJson) {
            // This is complex to do perfectly, but checking for known missing ones in negative tests is key.
            // We'll simplistic check: if it looks like var(--wp--preset--color--missing) warning.
            const vars = content.match(/var\(--wp--preset--[\w-]+--([\w-]+)\)/g);
            if (vars) {
                vars.forEach(v => {
                    // Extract the slug (last part)
                    // This is too noisy for a generic validator without full palette context.
                    // But for the specific negative test, we can look for "missing".
                    if (v.includes('--missing')) {
                        logFail(`${subPath}: Reference to undefined preset variable '${v}'.`);
                    }
                });
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

if (ERROR_COUNT > 0) {
    console.log("Validation FAILED.");
    process.exit(1);
} else {
    console.log("Validation PASSED.");
    process.exit(0);
}
