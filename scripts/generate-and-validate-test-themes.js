#!/usr/bin/env node

/**
 * PressPilot Golden V1.2 - Theme Smoke Test Harness
 *
 * GOAL:
 *  - For each test scenario JSON:
 *      1. Generate a theme using the PressPilot generator.
 *      2. Run presspilot-validator.js on the generated theme.
 *      3. Print a summarized PASS/FAIL report.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const TEST_THEMES_DIR = path.join(ROOT, 'tests', 'themes');
const OUTPUT_BASE_DIR = path.join(ROOT, 'generated-themes');

// --------------- Helpers ----------------

/**
 * Load all scenario JSON files from tests/themes
 */
function loadScenarios() {
    const files = fs.readdirSync(TEST_THEMES_DIR)
        .filter((f) => f.endsWith('.json'));

    return files.map((file) => {
        const fullPath = path.join(TEST_THEMES_DIR, file);
        const json = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        return {
            file,
            path: fullPath,
            ...json
        };
    });
}

/**
 * Wire this to the actual PressPilot theme generator.
 */
function generateThemeForScenario(scenario) {
    const outDir = path.join(OUTPUT_BASE_DIR, scenario.slug);
    fs.mkdirSync(outDir, { recursive: true });

    // Using npx tsx to run the TypeScript build script
    const CLI_COMMAND = `npx tsx scripts/buildWpTheme.ts --config "${scenario.path}" --out-dir "${outDir}"`;

    console.log(`\n🛠  Generating theme for scenario: ${scenario.slug}`);
    console.log(`    Using command: ${CLI_COMMAND}`);

    try {
        execSync(CLI_COMMAND, {
            stdio: 'inherit',
            cwd: ROOT
        });
    } catch (err) {
        console.error(`❌ Generator failed for scenario ${scenario.slug}`);
        return { success: false, error: err, outDir };
    }

    return { success: true, outDir };
}

/**
 * Wire this to presspilot-validator.js.
 */
function validateThemeDir(themeDir) {
    console.log(`\n🔍 Validating theme in: ${themeDir}`);

    try {
        // Option B: CLI mode
        // Note: The validator script prints to stdout. We want to capture it to parse JSON if possible,
        // but the current validator doesn't seem to support --format=json flag in the code I wrote earlier.
        // It prints human readable text.
        // However, the user prompt implies "Prints a detailed summary: ✅ or ❌".
        // The user prompt's suggested code for this file uses --format=json, but the validator I implemented
        // in the previous step DOES NOT implement --format=json.
        // I should probably stick to capturing the exit code and maybe stdout for logging.
        // Or I can update the validator to support JSON.
        // For now, let's just run it and check exit code.

        // Actually, let's just run it with stdio inherit so the user sees the output,
        // and rely on exit code for pass/fail.

        const VALIDATOR_COMMAND = `node validator/presspilot-validator.js "${themeDir}"`;

        try {
            execSync(VALIDATOR_COMMAND, {
                cwd: ROOT,
                stdio: 'inherit'
            });
            return { ok: true, errors: [], warnings: [] };
        } catch (e) {
            return { ok: false, errors: ["Validator exited with error code"], warnings: [] };
        }

    } catch (err) {
        console.error('❌ Validator crashed:', err.message);
        return {
            ok: false,
            errors: ['Validator crashed'],
            warnings: []
        };
    }
}

// --------------- Main Runner ----------------

function main() {
    console.log('🚀 PressPilot Golden V1.2 – Theme Smoke Tests\n');

    if (!fs.existsSync(TEST_THEMES_DIR)) {
        console.error(`❌ tests/themes folder not found at: ${TEST_THEMES_DIR}`);
        process.exit(1);
    }

    fs.mkdirSync(OUTPUT_BASE_DIR, { recursive: true });

    const scenarios = loadScenarios();
    if (scenarios.length === 0) {
        console.error('❌ No scenario JSON files found in tests/themes.');
        process.exit(1);
    }

    const summary = [];

    for (const scenario of scenarios) {
        console.log('===========================================');
        console.log(`Scenario: ${scenario.slug}`);
        console.log('===========================================');

        // 1. Generate
        const gen = generateThemeForScenario(scenario);
        if (!gen.success) {
            summary.push({
                scenario: scenario.slug,
                status: 'GEN_FAIL',
                errors: ['Generator failed (see logs above).']
            });
            continue;
        }

        // 2. Validate
        const validation = validateThemeDir(gen.outDir);

        // Normalize
        const ok = !!validation.ok;
        const errors = validation.errors || [];
        const warnings = validation.warnings || [];

        if (ok) {
            console.log(`✅ Scenario ${scenario.slug}: VALIDATION PASSED`);
        } else {
            console.log(`❌ Scenario ${scenario.slug}: VALIDATION FAILED`);
        }

        summary.push({
            scenario: scenario.slug,
            status: ok ? 'PASS' : 'FAIL',
            errors,
            warnings
        });
    }

    // --------------- Summary ----------------
    console.log('\n\n📊 SUMMARY');
    console.log('-------------------------------------------');
    let allPass = true;
    for (const item of summary) {
        const icon = item.status === 'PASS' ? '✅' : (item.status === 'GEN_FAIL' ? '💥' : '❌');
        console.log(`${icon} ${item.scenario} → ${item.status}`);
        if (item.status !== 'PASS') {
            allPass = false;
        }
    }

    console.log('-------------------------------------------');
    if (allPass) {
        console.log('🎉 All scenarios passed. Golden V1.2 looks stable across test themes.');
        process.exit(0);
    } else {
        console.log('⚠️ Some scenarios failed. Check errors above before trusting this generator build.');
        process.exit(1);
    }
}

main();
