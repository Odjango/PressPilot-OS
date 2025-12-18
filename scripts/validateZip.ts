import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const zipPath = process.argv[2];

if (!zipPath || !fs.existsSync(zipPath)) {
    console.error("Usage: npx tsx scripts/validateZip.ts <path-to-zip>");
    process.exit(1);
}

console.log(`📦 Validating Zip Structure: ${zipPath}`);

try {
    // List contents
    const output = execSync(`unzip -l "${zipPath}"`).toString();
    const lines = output.split('\n');

    // Parse file lines (skipping header/footer)
    // Typical unzip -l output:
    // Archive:  themes/foo.zip
    //   Length      Date    Time    Name
    // ---------  ---------- -----   ----
    //        0  12-14-2025 20:00   foo/
    //      123  12-14-2025 20:00   foo/style.css

    // We strictly check the "Name" column (last path).
    // Filter lines that look like files/dirs
    const fileLines = lines.filter(l => l.match(/^\s*\d+/));

    let rootDir: string | null = null;
    let hasStyleCss = false;
    let hasThemeJson = false;
    let hasMacOsx = false;

    // We expect the theme slug to be the filename of the zip (minus extension) usually, 
    // or we detect the single root dir.
    const expectedSlug = path.basename(zipPath, '.zip');

    for (const line of fileLines) {
        // Extract filename. It's the substring after the 3rd space-separated column usually, 
        // but unzip output is fixed width-ish. 
        // Easier regex: whitespace + Number + whitespace + Date + whitespace + Time + whitespace + (Name...)
        const match = line.match(/^\s*\d+\s+[\d-]+\s+[\d:]+\s+(.+)$/);
        if (!match) continue;

        const filePath = match[1];

        // CHECK: No __MACOSX
        if (filePath.includes('__MACOSX')) {
            console.error(`❌ FAIL: __MACOSX detected: ${filePath}`);
            hasMacOsx = true;
        }

        const parts = filePath.split('/');
        const topLevel = parts[0];

        // CHECK: Single Root
        if (rootDir === null) {
            rootDir = topLevel;
        } else if (rootDir !== topLevel && topLevel !== '') {
            // If different top level (and not emptiness), fail
            console.error(`❌ FAIL: Multiple top-level directories or loose files detected. Expected '${rootDir}', found '${topLevel}' in path '${filePath}'`);
            process.exit(1);
        }

        // CHECK: Correct Root Name
        // (Optional strictness: assert structure matches zip name)

        // CHECK: Critical Files
        if (filePath === `${expectedSlug}/style.css`) hasStyleCss = true;
        if (filePath === `${expectedSlug}/theme.json`) hasThemeJson = true;
    }

    if (hasMacOsx) process.exit(1);

    if (!rootDir) {
        console.error("❌ FAIL: Empty zip or unrecognizable structure.");
        process.exit(1);
    }

    if (rootDir !== expectedSlug) {
        console.error(`❌ FAIL: Root directory '${rootDir}' does not match expected slug '${expectedSlug}'.`);
        process.exit(1);
    }

    if (!hasStyleCss) {
        console.error("❌ FAIL: style.css missing at root (expected " + expectedSlug + "/style.css)");
        process.exit(1);
    }

    if (!hasThemeJson) {
        console.error("❌ FAIL: theme.json missing at root (expected " + expectedSlug + "/theme.json)");
        process.exit(1);
    }

    console.log("✅ Zip Structure Valid: Single root, strict contents.");
    process.exit(0);

} catch (e) {
    console.error("❌ FAIL: Could not inspect zip file.", e);
    process.exit(1);
}
