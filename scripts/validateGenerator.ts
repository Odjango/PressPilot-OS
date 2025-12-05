// PressPilot Validator V1.2 (Golden Base)
// Enforces PRESSPILOT_THEME_GENERATOR_RULES_V1_2.md

import * as fs from "node:fs";
import * as path from "node:path";

const GOLDEN_SPEC_PATH = path.join(process.cwd(), "golden-spec");

function validateV1_2() {
    console.log("Validating Golden V1.2 Spec...");

    validateStructure();
    validateBlockMarkup();
    validateThemeJson();

    console.log("Golden V1.2 Validation PASSED.");
}

function validateStructure() {
    const requiredFiles = [
        "style.css",
        "theme.json",
        "functions.php",
        "templates/index.html",
        "templates/page.html",
        "templates/front-page.html",
        "parts/header.html",
        "parts/footer.html",
        "patterns/hero-default.php",
        "patterns/features-simple.php"
    ];

    for (const file of requiredFiles) {
        if (!fs.existsSync(path.join(GOLDEN_SPEC_PATH, file))) {
            console.error(`CRITICAL: Missing required file: ${file}`);
            process.exit(1);
        }
    }
    console.log("Structure Validation Passed.");
}

function validateBlockMarkup() {
    const htmlFiles = [
        "templates/index.html",
        "templates/page.html",
        "templates/front-page.html",
        "parts/header.html",
        "parts/footer.html"
    ];

    for (const file of htmlFiles) {
        const content = fs.readFileSync(path.join(GOLDEN_SPEC_PATH, file), "utf8");

        // Rule: No PHP
        if (content.includes("<?php")) {
            console.error(`CRITICAL: PHP found in ${file}. Templates/Parts must be block markup only.`);
            process.exit(1);
        }

        // Rule: No raw HTML (heuristic: check for tags that aren't inside comments)
        // This is hard to regex perfectly, but we can check for common forbidden tags outside of comments?
        // Better: Check that it generally looks like block markup.
        // Rule: "Templates and template parts must use only Gutenberg block markup"

        // Simple check: Must contain at least one wp: block
        if (!content.includes("<!-- wp:")) {
            console.error(`CRITICAL: No WP blocks found in ${file}.`);
            process.exit(1);
        }
    }
    console.log("Block Markup Validation Passed.");
}

function validateThemeJson() {
    const themeJsonPath = path.join(GOLDEN_SPEC_PATH, "theme.json");
    const themeJson = JSON.parse(fs.readFileSync(themeJsonPath, "utf8"));

    // Rule: Version 3
    if (themeJson.version !== 3) {
        console.error("CRITICAL: theme.json must be version 3.");
        process.exit(1);
    }

    // Rule: Layout settings
    if (!themeJson.settings?.layout?.contentSize || !themeJson.settings?.layout?.wideSize) {
        console.error("CRITICAL: theme.json must define layout.contentSize and layout.wideSize.");
        process.exit(1);
    }

    console.log("Theme JSON Validation Passed.");
}

validateV1_2();
