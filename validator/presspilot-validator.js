#!/usr/bin/env node
/**
 * PressPilot Theme Validator (Golden V1.2)
 *
 * Usage:
 *   node validator/presspilot-validator.js /path/to/theme
 *
 * This script validates:
 *   - Required files & structure
 *   - theme.json syntax & required keys
 *   - Templates & parts block markup sanity
 *   - Navigation block presence in header
 *   - Template/templateParts consistency with theme.json
 *   - Patterns header and basic block markup
 */

const fs = require('fs');
const path = require('path');

function logHeader(title) {
    console.log('\n=== ' + title + ' ===');
}

function logOK(msg) {
    console.log('✅ ' + msg);
}

function logWarn(msg) {
    console.log('⚠️  ' + msg);
}

function logError(msg) {
    console.log('❌ ' + msg);
}

function exists(p) {
    try {
        fs.accessSync(p, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

function readJson(filePath) {
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        return { ok: true, data: JSON.parse(raw) };
    } catch (err) {
        return { ok: false, error: err };
    }
}

function readText(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        return null;
    }
}

function listFiles(dir, ext) {
    if (!exists(dir)) return [];
    return fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isFile() && d.name.toLowerCase().endsWith(ext.toLowerCase()))
        .map((d) => d.name);
}

function isBlockTemplateContent(content) {
    // Very lightweight sanity check: must contain block comments
    return content.includes('<!-- wp:');
}

function hasForbiddenMarkup(content) {
    const issues = [];
    if (content.includes('<?php')) {
        issues.push('Contains PHP code (<?php). Templates/parts must be pure block HTML.');
    }
    if (content.toLowerCase().includes('<script')) {
        issues.push('Contains <script> tag. Scripts are not allowed in templates/parts.');
    }
    if (content.toLowerCase().includes('<style')) {
        issues.push('Contains <style> tag. Styles should live in theme.json or stylesheets.');
    }
    return issues;
}

// Basic CLI arg handling
const themePathArg = process.argv[2];
if (!themePathArg) {
    console.error('Usage: node validator/presspilot-validator.js /path/to/theme');
    process.exit(1);
}

const themePath = path.resolve(themePathArg);
if (!exists(themePath)) {
    console.error('Theme path does not exist:', themePath);
    process.exit(1);
}

console.log('PressPilot Theme Validator (Golden V1.2)');
console.log('Theme path:', themePath);

let errorCount = 0;
let warnCount = 0;

// 1. Structure check
logHeader('1. Structure & Required Files');

const requiredFiles = ['style.css', 'theme.json', 'functions.php'];
const requiredDirs = ['templates', 'parts'];

for (const file of requiredFiles) {
    const filePath = path.join(themePath, file);
    if (exists(filePath)) {
        logOK(`Found required file: ${file}`);
    } else {
        logError(`Missing required file: ${file}`);
        errorCount++;
    }
}

for (const dir of requiredDirs) {
    const dirPath = path.join(themePath, dir);
    if (exists(dirPath) && fs.statSync(dirPath).isDirectory()) {
        logOK(`Found required directory: ${dir}/`);
    } else {
        logError(`Missing required directory: ${dir}/`);
        errorCount++;
    }
}

// 2. theme.json validation
logHeader('2. theme.json Validation');

const themeJsonPath = path.join(themePath, 'theme.json');
let themeJson = null;

if (exists(themeJsonPath)) {
    const parsed = readJson(themeJsonPath);
    if (!parsed.ok) {
        logError('theme.json could not be parsed as JSON: ' + parsed.error.message);
        errorCount++;
    } else {
        themeJson = parsed.data;
        logOK('theme.json parsed successfully.');

        // Basic required keys
        if (themeJson.version !== 3) {
            logError('theme.json "version" should be 3 for modern block themes.');
            errorCount++;
        } else {
            logOK('theme.json version is 3.');
        }

        if (!themeJson.$schema) {
            logWarn('theme.json missing "$schema". Recommended for forward-compatibility.');
            warnCount++;
        } else if (!String(themeJson.$schema).includes('schemas.wp.org')) {
            logWarn('theme.json "$schema" does not look like a WP schema URL.');
            warnCount++;
        } else {
            logOK('theme.json has a schema URL.');
        }

        if (!themeJson.settings) {
            logError('theme.json missing "settings" object.');
            errorCount++;
        }

        if (!themeJson.styles) {
            logError('theme.json missing "styles" object.');
            errorCount++;
        }

        if (!Array.isArray(themeJson.templates)) {
            logError('theme.json "templates" should be an array.');
            errorCount++;
        }

        if (!Array.isArray(themeJson.templateParts)) {
            logError('theme.json "templateParts" should be an array.');
            errorCount++;
        }

        // Layout checks
        const layoutSettings = themeJson.settings && themeJson.settings.layout;
        const layoutStyles = themeJson.styles && themeJson.styles.layout;

        if (!layoutSettings) {
            logWarn('theme.json missing settings.layout. Layout tools may not behave as expected.');
            warnCount++;
        } else {
            if (!layoutSettings.contentSize || !layoutSettings.wideSize) {
                logWarn('settings.layout should define both contentSize and wideSize.');
                warnCount++;
            } else {
                logOK('settings.layout defines contentSize and wideSize.');
            }
        }

        if (!layoutStyles) {
            logWarn('theme.json missing styles.layout. Front-end layout may not match editor.');
            warnCount++;
        } else {
            if (!layoutStyles.contentSize || !layoutStyles.wideSize) {
                logWarn('styles.layout should define both contentSize and wideSize.');
                warnCount++;
            } else {
                logOK('styles.layout defines contentSize and wideSize.');
            }
        }
    }
}

// 3. Templates & templateParts consistency
logHeader('3. Templates & Template Parts Consistency');

const templatesDir = path.join(themePath, 'templates');
const partsDir = path.join(themePath, 'parts');

const templateFiles = exists(templatesDir)
    ? listFiles(templatesDir, '.html')
    : [];
const partFiles = exists(partsDir)
    ? listFiles(partsDir, '.html')
    : [];

logOK(`Found ${templateFiles.length} template file(s) in templates/: ${templateFiles.join(', ') || '(none)'}`);
logOK(`Found ${partFiles.length} template part file(s) in parts/: ${partFiles.join(', ') || '(none)'}`);

if (themeJson) {
    // Map available names (without .html)
    const templateFileNames = templateFiles.map((f) => path.basename(f, '.html'));
    const partFileNames = partFiles.map((f) => path.basename(f, '.html'));

    // Check that all theme.json templates exist as files
    if (Array.isArray(themeJson.templates)) {
        themeJson.templates.forEach((tpl) => {
            const name = tpl && tpl.name;
            if (!name) {
                logError('Found template entry in theme.json without a "name" property.');
                errorCount++;
                return;
            }
            if (!templateFileNames.includes(name)) {
                logError(`theme.json template "${name}" has no matching file in templates/${name}.html`);
                errorCount++;
            } else {
                logOK(`Template "${name}" has matching file in templates/.`);
            }
        });
    }

    // Check that all theme.json templateParts exist as files
    if (Array.isArray(themeJson.templateParts)) {
        themeJson.templateParts.forEach((part) => {
            const name = part && part.name;
            if (!name) {
                logError('Found templatePart entry in theme.json without a "name" property.');
                errorCount++;
                return;
            }
            if (!partFileNames.includes(name)) {
                logError(`theme.json templatePart "${name}" has no matching file in parts/${name}.html`);
                errorCount++;
            } else {
                logOK(`Template part "${name}" has matching file in parts/.`);
            }
        });
    }
}

// 4. Block markup & header navigation check
logHeader('4. Templates & Parts Block Markup');

function validateHtmlFiles(dirPath, label) {
    if (!exists(dirPath)) return;

    const files = listFiles(dirPath, '.html');
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const content = readText(fullPath);
        if (content == null) {
            logError(`Could not read ${label} file: ${file}`);
            errorCount++;
            continue;
        }

        const forbiddenIssues = hasForbiddenMarkup(content);
        if (forbiddenIssues.length > 0) {
            forbiddenIssues.forEach((issue) => {
                logError(`${label}/${file}: ${issue}`);
                errorCount++;
            });
        }

        if (!isBlockTemplateContent(content)) {
            logError(`${label}/${file}: Does not appear to contain block markup ("<!-- wp:").`);
            errorCount++;
        } else {
            logOK(`${label}/${file}: Contains block markup.`);
        }
    }
}

validateHtmlFiles(templatesDir, 'templates');
validateHtmlFiles(partsDir, 'parts');

// Specific: header.html must contain a Navigation block
const headerPath = path.join(partsDir, 'header.html');
if (exists(headerPath)) {
    const headerContent = readText(headerPath) || '';
    if (!headerContent.includes('<!-- wp:navigation')) {
        logError('parts/header.html does not include a Navigation block (<!-- wp:navigation ... -->).');
        errorCount++;
    } else {
        logOK('parts/header.html includes a Navigation block.');
        // NEW: recommend page-list inside navigation
        if (!headerContent.includes('<!-- wp:page-list')) {
            logWarn('parts/header.html navigation does not include a Page List block (<!-- wp:page-list /-->). Recommended for Golden V1.2.');
            warnCount++;
        } else {
            logOK('parts/header.html navigation includes a Page List block.');
        }
    }
} else {
    logError('parts/header.html is missing.');
    errorCount++;
}

// 4b. Footer validation
logHeader('4b. Footer Validation');
const footerPath = path.join(partsDir, 'footer.html');
if (exists(footerPath)) {
    logOK('parts/footer.html exists.');
    const footerContent = readText(footerPath) || '';

    // Check root block
    if (!footerContent.includes('<!-- wp:group {"tagName":"footer"')) {
        logError('parts/footer.html root block is not a Group with tagName:"footer".');
        errorCount++;
    } else {
        logOK('parts/footer.html root block is correct.');
    }

    // Check for columns
    if (!footerContent.includes('<!-- wp:columns')) {
        logError('parts/footer.html does not contain a Columns block.');
        errorCount++;
    } else {
        logOK('parts/footer.html contains Columns block.');
    }

    // Check for site title
    if (!footerContent.includes('<!-- wp:site-title')) {
        logError('parts/footer.html does not contain a Site Title block.');
        errorCount++;
    } else {
        logOK('parts/footer.html contains Site Title block.');
    }

    // Check for copyright paragraph (loose check for now, just looking for a paragraph)
    if (!footerContent.includes('<!-- wp:paragraph')) {
        logWarn('parts/footer.html does not contain a Paragraph block (expected for copyright).');
        warnCount++;
    } else {
        logOK('parts/footer.html contains Paragraph block.');
    }

    // Check for page-list (recommended)
    if (!footerContent.includes('<!-- wp:page-list')) {
        logWarn('parts/footer.html does not contain a Page List block. Recommended for navigation.');
        warnCount++;
    } else {
        logOK('parts/footer.html contains Page List block.');
    }

} else {
    logError('parts/footer.html is missing.');
    errorCount++;
}

// 5. Patterns validation (optional but recommended)
logHeader('5. Patterns Validation');

const patternsDir = path.join(themePath, 'patterns');
if (!exists(patternsDir)) {
    logWarn('No patterns/ directory found. This is allowed, but patterns are recommended.');
    warnCount++;
} else {
    const patternFiles = listFiles(patternsDir, '.php');
    if (patternFiles.length === 0) {
        logWarn('patterns/ directory exists but contains no .php pattern files.');
        warnCount++;
    } else {
        logOK(`Found ${patternFiles.length} pattern file(s) in patterns/: ${patternFiles.join(', ')}`);
    }

    for (const file of patternFiles) {
        const fullPath = path.join(patternsDir, file);
        const content = readText(fullPath) || '';

        // Must contain a Slug header and Title
        const hasTitle = /Title:\s*/i.test(content);
        const slugMatch = content.match(/Slug:\s*([^\s]+)/i);

        if (!hasTitle) {
            logError(`patterns/${file}: Missing "Title:" header.`);
            errorCount++;
        } else {
            logOK(`patterns/${file}: Has "Title:" header.`);
        }

        if (!slugMatch) {
            logError(`patterns/${file}: Missing "Slug:" header.`);
            errorCount++;
        } else {
            const slug = slugMatch[1].trim();
            if (!slug.startsWith('presspilot/')) {
                logWarn(`patterns/${file}: Slug "${slug}" does not start with "presspilot/". Recommended for PressPilot patterns.`);
                warnCount++;
            } else {
                logOK(`patterns/${file}: Slug "${slug}" looks good.`);
            }
        }

        // Should contain block markup
        if (!content.includes('<!-- wp:')) {
            logError(`patterns/${file}: Does not contain block markup ("<!-- wp:").`);
            errorCount++;
        } else {
            logOK(`patterns/${file}: Contains block markup.`);
        }
    }
}

// Final summary
logHeader('6. Summary');

if (errorCount === 0 && warnCount === 0) {
    console.log('🎉 All checks passed with no errors or warnings.');
} else {
    console.log(`Completed with ${errorCount} error(s) and ${warnCount} warning(s).`);
}

process.exit(errorCount > 0 ? 1 : 0);
