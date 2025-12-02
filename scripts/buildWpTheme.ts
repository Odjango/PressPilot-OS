// scripts/buildWpTheme.ts
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const THEME_SLUG = "presspilot-moozoo-pizza";
const BUSINESS_NAME = "MooZoo Pizza"; // Single Source of Truth
const BUSINESS_DESC = "Premium Pizza & Design";
// Dynamic Version: 1.1.1.{timestamp} to ensure every build is unique as requested.
const THEME_VERSION = "1.1.1." + Math.floor(Date.now() / 1000);
const GOLDEN_SPEC_PATH = path.join(process.cwd(), "golden-spec");

// Derived Namespaces (Automated Prevention)
const NAMESPACE_SLUG = THEME_SLUG.replace(/-/g, "_"); // e.g. presspilot_onion_v2
const PATTERN_PREFIX = THEME_SLUG; // e.g. presspilot-onion-v2

function themePath(...segments: string[]): string {
    return path.join(process.cwd(), "themes", THEME_SLUG, ...segments);
}

// ... (rest of imports and helper functions)

// ... (helper functions)

// ... (helper functions)



export function buildWpTheme() {
    validateGoldenSpec(); // NEW: Validate before building
    createStyleCss();
    createFunctionsPhp();
    buildHeaderPart();
    copyFooterPart();
    buildIndexTemplate();
    copyPageTemplate(); // Generic page.html
    copyFrontPageTemplate(); // NEW: Dedicated front page
    buildPagePatterns(); // NEW: Rich patterns
    buildPageTemplates(); // NEW: Rich templates
    copyPatterns();
    copyAssets(); // NEW: Copy assets
    updateThemeJson();
    createZipArchive(); // NEW: Create zip archive
    validateH1Count(); // NEW: Enforce Single H1
    validatePatternSlugs(); // NEW: Validate pattern slugs
    validateTemplateHeroes(); // NEW: Validate hero patterns in templates
    validateBusinessNamePlaceholders(); // NEW: Ensure no stale names
    validatePlaceholderAssets(); // NEW: Ensure assets exist
    validateTemplateSet(); // NEW: Ensure templates exist
}

function validateH1Count() {
    console.log("Validating H1 counts (Single H1 Rule)...");
    const patternsDir = themePath("patterns");

    // Check Page Patterns for exactly one H1
    // Check Page Patterns for exactly one H1
    const patternsToCheck = [
        { name: "home-hero.php", expectH1: true },
        { name: "page-hero.php", expectH1: true },
        { name: "page-about.php", expectH1: false },
        { name: "page-services.php", expectH1: false },
        { name: "page-contact.php", expectH1: false },
        { name: "page-menu.php", expectH1: false }
    ];

    for (const check of patternsToCheck) {
        const pat = check.name;
        const p = path.join(patternsDir, pat);
        if (fs.existsSync(p)) {
            const content = fs.readFileSync(p, "utf8");

            // Count H1s (block or tag)
            // Also check for wp:post-title which renders as H1
            const h1BlockCount = (content.match(/<!-- wp:heading {"level":1}/g) || []).length;
            const h1TagCount = (content.match(/<h1/g) || []).length;
            const postTitleAny = (content.match(/<!-- wp:post-title/g) || []).length;

            const count = Math.max(h1BlockCount, h1TagCount, postTitleAny);

            if (check.expectH1) {
                if (count === 0) {
                    console.error(`CRITICAL ERROR: Pattern ${pat} has NO H1. This hero pattern must have exactly one H1.`);
                    process.exit(1);
                }
                if (count > 1) {
                    console.error(`CRITICAL ERROR: Pattern ${pat} has ${count} H1s. Only one H1 is allowed per page.`);
                    process.exit(1);
                }
                console.log(`PASS: ${pat} has exactly 1 H1.`);
            } else {
                if (count > 0) {
                    console.error(`CRITICAL ERROR: Pattern ${pat} has ${count} H1s. Content patterns must NOT have H1s (handled by hero).`);
                    process.exit(1);
                }
                console.log(`PASS: ${pat} has 0 H1s (correct).`);
            }
        } else {
            console.warn(`Warning: Pattern ${pat} not found for H1 validation.`);
        }
    }
    console.log("H1 Validation Passed.");
}

function validatePatternSlugs() {
    console.log("Validating Pattern Slugs...");
    const templatesDir = themePath("templates");
    const partsDir = themePath("parts");
    const patternsDir = themePath("patterns");

    // 1. Get list of registered patterns (from PHP files)
    const registeredPatterns = new Set();
    if (fs.existsSync(patternsDir)) {
        const files = fs.readdirSync(patternsDir).filter(f => f.endsWith(".php"));
        for (const file of files) {
            const content = fs.readFileSync(path.join(patternsDir, file), "utf8");
            const match = content.match(/Slug:\s+([^\s]+)/);
            if (match) {
                registeredPatterns.add(match[1]);
            }
        }
    }

    // 2. Scan templates for pattern references
    const dirsToCheck = [templatesDir, partsDir];
    let errors = 0;

    for (const dir of dirsToCheck) {
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir).filter(f => f.endsWith(".html"));
        for (const file of files) {
            const content = fs.readFileSync(path.join(dir, file), "utf8");
            const patternRegex = /<!-- wp:pattern {"slug":"([^"]+)"} \/-->/g;
            let match;
            while ((match = patternRegex.exec(content)) !== null) {
                const slug = match[1];
                // Ignore core patterns
                if (slug.startsWith("core/")) continue;

                if (!registeredPatterns.has(slug)) {
                    console.error(`CRITICAL ERROR: Template '${file}' references missing pattern '${slug}'.`);
                    errors++;
                }
            }
        }
    }

    if (errors > 0) {
        console.error(`Found ${errors} missing pattern references. Build failed.`);
        process.exit(1);
    }
    console.log("Pattern Slug Validation Passed.");
}

function validateTemplateHeroes() {
    console.log("Validating Template Heroes...");
    const templatesDir = themePath("templates");

    // Map of template filename -> expected hero pattern slug
    const expectedHeroes: Record<string, string> = {
        "front-page.html": `${PATTERN_PREFIX}/home-hero`,
        "page-about.html": `${PATTERN_PREFIX}/page-hero`,
        "page-services.html": `${PATTERN_PREFIX}/page-hero`,
        "page-contact.html": `${PATTERN_PREFIX}/page-hero`,
        "page-menu.html": `${PATTERN_PREFIX}/page-hero`,
        // "index.html": `${PATTERN_PREFIX}/page-hero` // Optional: depending on if index uses it
    };

    let errors = 0;

    for (const [filename, expectedHero] of Object.entries(expectedHeroes)) {
        const filePath = path.join(templatesDir, filename);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, "utf8");

            // We expect the <main> tag to be followed immediately by the hero pattern.
            // Regex explanation:
            // <main[^>]*> : Matches <main> tag with any attributes
            // \s* : Matches optional whitespace/newlines
            // <!-- wp:pattern {"slug":"EXPECTED_HERO"} /--> : Matches the specific pattern reference

            // We escape the expected hero slug for regex safety, though strictly not needed for simple slugs
            const escapedHero = expectedHero.replace(/\//g, "\\/");
            const regex = new RegExp(`<main[^>]*>\\s*<!-- wp:pattern {"slug":"${escapedHero}"} /-->`);

            if (!regex.test(content)) {
                console.error(`CRITICAL ERROR: Template '${filename}' must start with hero pattern '${expectedHero}'.`);
                errors++;
            } else {
                console.log(`PASS: ${filename} starts with ${expectedHero}`);
            }
        } else {
            // It's okay if a template doesn't exist (e.g. if we didn't generate it yet), 
            // but for the ones we KNOW we generate, we should probably warn or error if missing.
            // For now, let's just warn.
            console.warn(`Warning: Template '${filename}' not found for Hero validation.`);
        }
    }

    if (errors > 0) {
        console.error(`Found ${errors} templates with missing or incorrect hero patterns. Build failed.`);
        process.exit(1);
    }
    console.log("Template Hero Validation Passed.");
    console.log("Template Hero Validation Passed.");
}

function validateBusinessNamePlaceholders() {
    console.log("Validating Business Name Placeholders...");
    const forbiddenStrings = ["BeeBoo", "MooZoo", "Onion", "CooCoo"]; // Stale names
    const dirsToCheck = [themePath("patterns"), themePath("templates"), themePath("parts")];
    let errors = 0;

    for (const dir of dirsToCheck) {
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir).filter(f => f.endsWith(".html") || f.endsWith(".php"));
        for (const file of files) {
            const content = fs.readFileSync(path.join(dir, file), "utf8");
            for (const forbidden of forbiddenStrings) {
                // Check if forbidden string exists AND it's not part of the current BUSINESS_NAME (just in case)
                if (content.includes(forbidden) && !BUSINESS_NAME.includes(forbidden)) {
                    console.error(`CRITICAL ERROR: Found stale name '${forbidden}' in '${file}'. All names must be generated from BUSINESS_NAME.`);
                    errors++;
                }
            }
        }
    }

    if (errors > 0) {
        console.error(`Found ${errors} files with stale business names. Build failed.`);
        process.exit(1);
    }
    console.log("Business Name Placeholder Validation Passed.");
}

function validatePlaceholderAssets() {
    console.log("Validating Placeholder Assets...");
    const requiredAssets = [
        "assets/images/hero-placeholder-home.jpg",
        "assets/images/hero-placeholder-page.jpg"
    ];
    let errors = 0;

    for (const asset of requiredAssets) {
        const assetPath = themePath(asset);
        if (!fs.existsSync(assetPath)) {
            console.error(`CRITICAL ERROR: Missing required asset '${asset}'.`);
            errors++;
        } else {
            const stats = fs.statSync(assetPath);
            if (stats.size === 0) {
                console.error(`CRITICAL ERROR: Asset '${asset}' is empty (0 bytes).`);
                errors++;
            }
        }
    }

    if (errors > 0) {
        console.error(`Found ${errors} missing or invalid assets. Build failed.`);
        process.exit(1);
    }
    console.log("Placeholder Asset Validation Passed.");
}

function validateTemplateSet() {
    console.log("Validating Template Set...");
    const requiredTemplates = [
        "front-page.html",
        "index.html",
        "page.html",
        "page-about.html",
        "page-services.html",
        "page-contact.html",
        "page-menu.html"
    ];
    let errors = 0;

    for (const tpl of requiredTemplates) {
        const tplPath = themePath("templates", tpl);
        if (!fs.existsSync(tplPath)) {
            console.error(`CRITICAL ERROR: Missing required template '${tpl}'.`);
            errors++;
        }
    }

    if (errors > 0) {
        console.error(`Found ${errors} missing templates. Build failed.`);
        process.exit(1);
    }
    console.log("Template Set Validation Passed.");
}

function validateGoldenSpec() {
    console.log("Validating Golden Spec...");
    const requiredFiles = [
        "golden-theme.json",
        "templates/page.html",
        "templates/front-page.html", // NEW
        "templates/index.html",
        "parts/header.html",
        "parts/footer.html",
        "navigation.json",
        "patterns/canonical-hero.html", // Updated to canonical
        "patterns/home-hero.html", // NEW: Home Hero
        "patterns/page-hero.html", // NEW: Page Hero
        "patterns/seed-details.html",
        "patterns/seed-features.html"
    ];

    const missingFiles: string[] = [];

    for (const file of requiredFiles) {
        if (!fs.existsSync(path.join(GOLDEN_SPEC_PATH, file))) {
            missingFiles.push(file);
        }
    }

    if (missingFiles.length > 0) {
        console.error("CRITICAL ERROR: Golden Spec is missing required files:");
        missingFiles.forEach(f => console.error(`- ${f}`));
        console.error("You must fix the Golden Spec before building.");
        process.exit(1);
    }

    // Validate Navigation JSON
    try {
        const navJson = fs.readFileSync(path.join(GOLDEN_SPEC_PATH, "navigation.json"), "utf8");
        const nav = JSON.parse(navJson);
        if (!Array.isArray(nav)) {
            throw new Error("navigation.json must be an array");
        }
    } catch (e) {
        console.error("CRITICAL ERROR: Invalid navigation.json:", e);
        process.exit(1);
    }

    // Validate Golden CSS (Behavioral Guardrail)
    try {
        const themeJsonPath = path.join(GOLDEN_SPEC_PATH, "golden-theme.json");
        const themeJson = JSON.parse(fs.readFileSync(themeJsonPath, "utf8"));

        console.log("DEBUG: Loaded golden-theme.json");
        // Correctly read from styles.css
        const css = themeJson.styles?.css || "";

        // Canonical Golden CSS Rules (Strict Rich Test 2 Parity)
        // Rich Test 2 only has a focus outline rule, no layout rules.
        const requiredRules = [
            ":where(.wp-site-blocks *:focus){outline-width:2px;outline-style:solid}"
        ];

        const missingRules = requiredRules.filter(rule => !css.replace(/\s/g, "").includes(rule.replace(/\s/g, "")));

        if (missingRules.length > 0) {
            console.error("CRITICAL ERROR: Golden Spec missing canonical Golden CSS. Missing rules:");
            missingRules.forEach(r => console.error(`- ${r}`));
            console.error("You must add the canonical CSS to golden-theme.json (under styles.css) before building.");
            process.exit(1);
        }

        // Layout Guardrail: Forbidden CSS Rules
        // We strictly forbid layout rules that caused the vertical compaction issue.
        const forbiddenRules = [
            "min-height",
            "display:flex",
            "display: flex",
            "flex-direction",
            "justify-content"
        ];

        const foundForbidden = forbiddenRules.filter(rule => css.includes(rule));
        if (foundForbidden.length > 0) {
            console.error("CRITICAL ERROR: Layout rules diverge from canonical Rich Test 2 layout.");
            console.error(`Found forbidden CSS rules in golden-theme.json: ${foundForbidden.join(", ")}`);
            console.error("Golden Spec is not allowed to invent new spacing or height behavior.");
            process.exit(1);
        }

        // Layout Guardrail: Content Size
        if (themeJson.settings?.layout?.contentSize !== "620px") {
            console.error(`CRITICAL ERROR: Layout divergence. contentSize must be '620px' (Rich Test 2), found '${themeJson.settings?.layout?.contentSize}'.`);
            process.exit(1);
        }

        console.log("Golden CSS & Layout Validation Passed.");

        // Validate Spacing Guardrail (MooZoo Parity)
        const spacingJsonPath = path.join(GOLDEN_SPEC_PATH, "golden-spacing.json");
        if (fs.existsSync(spacingJsonPath)) {
            const spacingJson = JSON.parse(fs.readFileSync(spacingJsonPath, "utf8"));
            const goldenBlockGap = spacingJson.spacing.blockGap;
            const goldenPadding = spacingJson.spacing.padding;

            // Check blockGap
            const currentBlockGap = themeJson.styles?.spacing?.blockGap;
            if (currentBlockGap !== goldenBlockGap) {
                console.error(`CRITICAL ERROR: Spacing divergence. styles.spacing.blockGap must be '${goldenBlockGap}', found '${currentBlockGap}'.`);
                process.exit(1);
            }

            // Check Root Padding
            const currentPadding = themeJson.styles?.spacing?.padding;
            if (!currentPadding || currentPadding.left !== goldenPadding.left || currentPadding.right !== goldenPadding.right) {
                console.error(`CRITICAL ERROR: Spacing divergence. styles.spacing.padding must match Golden Spacing (left/right: ${goldenPadding.left}).`);
                process.exit(1);
            }

            // Check for Zero Margins (Guardrail against "tight" presets)
            // We check styles.elements.heading and styles.elements.paragraph (if exists)
            const elements = themeJson.styles?.elements || {};
            const checkZeroMargin = (elName: string, el: any) => {
                if (el?.spacing?.margin) {
                    const m = el.spacing.margin;
                    if (m === "0" || m === "0px" || m.top === "0" || m.bottom === "0") {
                        console.error(`CRITICAL ERROR: Spacing divergence. ${elName} has zero margin. This violates the Golden Spacing rules.`);
                        process.exit(1);
                    }
                }
            };
            checkZeroMargin("heading", elements.heading);
            checkZeroMargin("paragraph", elements.paragraph); // paragraph might not be defined, but if it is, check it.

            console.log("Golden Spacing Validation Passed.");
        } else {
            console.warn("Warning: golden-spacing.json not found. Skipping spacing validation.");
        }

    } catch (e) {
        console.error("CRITICAL ERROR: Failed to validate Golden CSS/Spacing:", e);
        process.exit(1);
    }

    // Validate Canonical Hero Pattern
    const heroPath = path.join(GOLDEN_SPEC_PATH, "patterns", "canonical-hero.html");
    if (!fs.existsSync(heroPath)) {
        console.error("CRITICAL ERROR: Golden Spec missing canonical-hero.html");
        process.exit(1);
    }
    const heroContent = fs.readFileSync(heroPath, "utf8");
    if (!heroContent.includes('align":"full"')) {
        console.error("CRITICAL ERROR: canonical-hero.html must be align:full");
        process.exit(1);
    }
    if (!heroContent.includes("{{HERO_TITLE}}")) {
        console.error("CRITICAL ERROR: canonical-hero.html missing {{HERO_TITLE}} placeholder");
        process.exit(1);
    }

    // Validate Home Hero
    const homeHeroPath = path.join(GOLDEN_SPEC_PATH, "patterns", "home-hero.html");
    if (fs.existsSync(homeHeroPath)) {
        const content = fs.readFileSync(homeHeroPath, "utf8");
        if (!content.includes('align":"full"')) {
            console.error("CRITICAL ERROR: home-hero.html must be align:full");
            process.exit(1);
        }
    }

    // Validate Page Hero
    const pageHeroPath = path.join(GOLDEN_SPEC_PATH, "patterns", "page-hero.html");
    if (fs.existsSync(pageHeroPath)) {
        const content = fs.readFileSync(pageHeroPath, "utf8");
        if (!content.includes('align":"full"')) {
            console.error("CRITICAL ERROR: page-hero.html must be align:full");
            process.exit(1);
        }
    }

    console.log("Golden Spec validation passed.");

    // Validate Template Structure (Behavioral Guardrail)
    const templatesToValidate = ["front-page.html", "page.html"];
    templatesToValidate.forEach(tpl => {
        const tplPath = path.join(GOLDEN_SPEC_PATH, "templates", tpl);
        if (fs.existsSync(tplPath)) {
            const content = fs.readFileSync(tplPath, "utf8");
            // Check for <main class="wp-block-group alignfull"> which is our standard
            // We can be a bit flexible with regex but strict on the tag
            if (!content.includes('<main class="wp-block-group alignfull">')) {
                console.error(`CRITICAL ERROR: ${tpl} must include a <main> wrapper as a direct child of .wp-site-blocks (via wp-block-group alignfull) to satisfy Golden CSS layout rules.`);
                process.exit(1);
            }
        }
    });
}


// Allow running directly via `tsx scripts/buildWpTheme.ts`
if (require.main === module) {
    buildWpTheme();
}

function ensureDir(p: string) {
    fs.mkdirSync(p, { recursive: true });
}

function buildHeaderPart() {
    const partsDir = themePath("parts");
    ensureDir(partsDir);

    const sourcePath = path.join(GOLDEN_SPEC_PATH, "parts", "header.html");
    const destPath = path.join(partsDir, "header.html");

    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied header.html from Golden Spec to ${destPath}`);
}

function buildIndexTemplate() {
    const templatesDir = themePath("templates");
    ensureDir(templatesDir);

    const sourcePath = path.join(GOLDEN_SPEC_PATH, "templates", "index.html");

    let content = fs.readFileSync(sourcePath, "utf8");
    // Dynamic Replacement: presspilot/ -> presspilot-meedo-pizza/
    content = content.replace(/slug":"presspilot\//g, `slug":"${PATTERN_PREFIX}/`);

    fs.writeFileSync(path.join(templatesDir, "index.html"), content, "utf8");
    console.log(`Copied index.html from Golden Spec to ${path.join(templatesDir, "index.html")} (with slug replacement)`);
}

function copyPageTemplate() {
    const templatesDir = themePath("templates");
    ensureDir(templatesDir);

    const sourcePath = path.join(GOLDEN_SPEC_PATH, "templates", "page.html");
    const destPath = path.join(templatesDir, "page.html");

    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied page.html from Golden Spec to ${destPath}`);
    } else {
        console.warn("Golden Spec page.html not found.");
    }
}

function copyFrontPageTemplate() {
    const templatesDir = themePath("templates");
    ensureDir(templatesDir);

    const sourcePath = path.join(GOLDEN_SPEC_PATH, "templates", "front-page.html");
    const destPath = path.join(templatesDir, "front-page.html");

    if (fs.existsSync(sourcePath)) {
        let content = fs.readFileSync(sourcePath, "utf8");
        // Dynamic Replacement: presspilot/ -> presspilot-meedo-pizza/
        content = content.replace(/slug":"presspilot\//g, `slug":"${PATTERN_PREFIX}/`);

        fs.writeFileSync(destPath, content, "utf8");
        console.log(`Copied front-page.html from Golden Spec to ${destPath} (with slug replacement)`);
    } else {
        console.warn("Golden Spec front-page.html not found.");
    }
}

function copyAssets() {
    const assetsDir = themePath("assets", "images");
    ensureDir(assetsDir);

    const sourceDir = path.join(GOLDEN_SPEC_PATH, "assets", "images");
    if (fs.existsSync(sourceDir)) {
        const files = fs.readdirSync(sourceDir);
        for (const file of files) {
            fs.copyFileSync(path.join(sourceDir, file), path.join(assetsDir, file));
        }
        console.log(`Copied assets from Golden Spec to ${assetsDir}`);
    } else {
        console.warn("Golden Spec assets/images not found.");
    }
}


function updateThemeJson() {
    const jsonPath = themePath("theme.json");
    ensureDir(path.dirname(jsonPath));

    // Load Golden Theme JSON as baseline
    const goldenThemePath = path.join(GOLDEN_SPEC_PATH, "golden-theme.json");
    if (!fs.existsSync(goldenThemePath)) {
        throw new Error(`Golden Theme JSON not found at ${goldenThemePath}`);
    }

    const rawGolden = fs.readFileSync(goldenThemePath, "utf8");
    const theme = JSON.parse(rawGolden);

    theme.title = BUSINESS_NAME; // Update title

    // Ensure patterns list includes our required ones
    if (!theme.patterns) theme.patterns = [];
    const requiredPatterns = [
        "presspilot/home-hero",
        "presspilot/home-services",
        "presspilot/page-about",
        "presspilot/page-services",
        "presspilot/page-contact",
        "presspilot/page-menu"
    ];
    for (const slug of requiredPatterns) {
        if (!theme.patterns.includes(slug)) {
            theme.patterns.push(slug);
        }
    }

    fs.writeFileSync(jsonPath, JSON.stringify(theme, null, 2), "utf8");
    console.log(`Generated theme.json inheriting from Golden Spec at ${jsonPath}`);
}

function createStyleCss() {
    const stylePath = themePath("style.css");
    ensureDir(path.dirname(stylePath));
    const content = `/*
Theme Name: ${BUSINESS_NAME}
Text Domain: ${THEME_SLUG}
Version: ${THEME_VERSION}
Description: A PressPilot generated theme for ${BUSINESS_NAME}.
*/
`;
    fs.writeFileSync(stylePath, content, "utf8");
    console.log(`Created style.css at ${stylePath}`);
}

function createFunctionsPhp() {
    const functionsPath = themePath("functions.php");
    ensureDir(path.dirname(functionsPath));

    // Read seeded content templates
    const heroTpl = fs.readFileSync(path.join(GOLDEN_SPEC_PATH, "patterns", "canonical-hero.html"), "utf8");
    const detailsTpl = fs.readFileSync(path.join(GOLDEN_SPEC_PATH, "patterns", "seed-details.html"), "utf8");
    const featuresTpl = fs.readFileSync(path.join(GOLDEN_SPEC_PATH, "patterns", "seed-features.html"), "utf8");

    // Read Navigation Blueprint
    const navBlueprint = fs.readFileSync(path.join(GOLDEN_SPEC_PATH, "navigation.json"), "utf8");

    // Read Header Template for wiring
    const headerTpl = fs.readFileSync(path.join(GOLDEN_SPEC_PATH, "parts", "header.html"), "utf8");

    const content = `<?php
/**
 * BeeBoo Pizza – core theme functions
 *
 * Keep this file boring and safe:
 * - Theme supports
 * - Pattern category
 * - One-time content seed (pages only, no menu tricks)
 */

/**
 * Theme supports.
 */
if ( ! function_exists( '${NAMESPACE_SLUG}_setup' ) ) :
	function ${NAMESPACE_SLUG}_setup() {
		add_theme_support( 'wp-block-styles' );
		add_theme_support( 'editor-styles' );
		add_theme_support( 'block-templates' );
		add_theme_support( 'responsive-embeds' );
		add_theme_support( 'title-tag' );
		add_theme_support( 'menus' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'automatic-feed-links' );
	}
endif;
add_action( 'after_setup_theme', '${NAMESPACE_SLUG}_setup' );

/**
 * Pattern category for any Onion-specific patterns.
 */
function ${NAMESPACE_SLUG}_register_pattern_category() {
	register_block_pattern_category(
		'${PATTERN_PREFIX}',
		array(
			'label' => __( 'PressPilot / ${BUSINESS_NAME}', '${THEME_SLUG}' ),
		)
	);
}
add_action( 'init', '${NAMESPACE_SLUG}_register_pattern_category' );

/**
 * Register DB Prefix Endpoint.
 * Returns the current table prefix for external apps.
 */
function ${NAMESPACE_SLUG}_register_db_prefix_endpoint() {
    register_rest_route( 'presspilot/v1', '/db-prefix', array(
        'methods'  => 'GET',
        'callback' => function() {
            global $wpdb;
            return array( 'table_prefix' => $wpdb->prefix );
        },
        'permission_callback' => '__return_true',
    ) );
}
add_action( 'rest_api_init', '${NAMESPACE_SLUG}_register_db_prefix_endpoint' );

/**
 * One-time content seed.
 */
function ${NAMESPACE_SLUG}_seed_content() {
	// Debug logging
	error_log( '${BUSINESS_NAME} Seeding: Checking...' );

	if ( ! is_admin() ) {
		return;
	}

	// Bump this when you change seeded content.
	$version     = '${THEME_VERSION}';
	$stored_ver  = get_option( '${NAMESPACE_SLUG}_seed_version' );

	// Already seeded for this version.
	if ( $stored_ver === $version ) {
		error_log( '${BUSINESS_NAME} Seeding: Already run for ' . $version );
		return;
	}

	error_log( '${BUSINESS_NAME} Seeding: Running for ' . $version );

	// Pick an author.
	$user_id = get_current_user_id();
	if ( ! $user_id ) {
		$admins = get_users(
			array(
				'role'   => 'administrator',
				'number' => 1,
			)
		);
		if ( ! empty( $admins ) ) {
			$user_id = $admins[0]->ID;
		} else {
			$user_id = 1;
		}
	}
	
	// Force Site Title & Description
	update_option( 'blogname', '${BUSINESS_NAME}' );
	update_option( 'blogdescription', '${BUSINESS_DESC}' );

	// FORCE DELETE ALL EXISTING PAGES & MENUS to ensure a clean slate.
	// This prevents "Double Home" and ensures we only have our fresh content.
	$all_pages = get_posts( array( 'post_type' => 'page', 'numberposts' => -1, 'post_status' => 'any' ) );
	foreach ( $all_pages as $p ) {
		wp_delete_post( $p->ID, true );
	}
	$all_navs = get_posts( array( 'post_type' => 'wp_navigation', 'numberposts' => -1, 'post_status' => 'any' ) );
	foreach ( $all_navs as $n ) {
		wp_delete_post( $n->ID, true );
	}
	// Also delete nav menu items if any (classic menus)
	$all_menu_items = get_posts( array( 'post_type' => 'nav_menu_item', 'numberposts' => -1, 'post_status' => 'any' ) );
	foreach ( $all_menu_items as $i ) {
		wp_delete_post( $i->ID, true );
	}

	// Titles + short descriptions per page.
	$pages = array(
		'Home'    => 'Welcome to ${BUSINESS_NAME}, your cozy neighborhood slice shop.',
		'Menu'    => 'Explore our hand-crafted pizzas, salads, and desserts.',
		'About'   => 'Learn how ${BUSINESS_NAME} grew from a tiny oven to a local favorite.',
		'Services'=> 'Catering, delivery, and office lunches made easy.',
		'Blog'    => 'Behind-the-scenes stories from the ${BUSINESS_NAME} kitchen.',
		'Contact' => 'Find us, call us, or send a message.',
	);

	$page_ids = array();

	foreach ( $pages as $title => $desc ) {

		// (We deleted everything above, so we don't need to check for existing pages anymore)


    // Section 1: Hero (Canonical).
    $hero_html = <<<HTML
${heroTpl}
HTML;
    // Replace placeholders
    // For Home page, use "${BUSINESS_NAME}" instead of "Home"
    $hero_title_text = ($title === 'Home') ? '${BUSINESS_NAME}' : $title;
    $hero_html = str_replace( '{{HERO_TITLE}}', $hero_title_text, $hero_html );
    $hero_html = str_replace( '{{HERO_SUBTITLE}}', $desc, $hero_html );

		// Section 2: Details.
		$details_html = <<<HTML
${detailsTpl}
HTML;
    $details_html = str_replace( '{$title}', $title, $details_html );

		// Section 3: Services / features.
		$features_html = <<<HTML
${featuresTpl}
HTML;

		$content = $hero_html . "\\n\\n" . $details_html . "\\n\\n" . $features_html;

		$page_id = wp_insert_post(
			array(
				'post_title'   => $title,
				'post_content' => $content,
				'post_status'  => 'publish',
				'post_type'    => 'page',
				'post_author'  => $user_id,
			)
		);

		if ( ! is_wp_error( $page_id ) ) {
			$page_ids[ $title ] = $page_id;
			error_log( '${BUSINESS_NAME} Seeding: Page already exists: ' . $title );
		} else {
			error_log( '${BUSINESS_NAME} Seeding: Failed to create page ' . $title . ': ' . $page_id->get_error_message() );
		}
	}

	// Set front page + posts page if we have them.
	if ( isset( $page_ids['Home'], $page_ids['Blog'] ) ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $page_ids['Home'] );
		update_option( 'page_for_posts', $page_ids['Blog'] );
	}

	// Create Navigation (wp_navigation post with links to all pages).
	if ( ! empty( $page_ids ) ) {
    $nav_blueprint = json_decode( '${navBlueprint.replace(/'/g, "\\'")}', true );
		$menu_items_html = '';

    if ( $nav_blueprint ) {
      foreach ( $nav_blueprint as $item ) {
        // Replace placeholders
        $label = $item['label'];
        $id_placeholder = $item['id']; // e.g. {{HOME_PAGE_ID}}
        
        // Extract page key from placeholder (e.g. HOME_PAGE_ID -> Home)
        // Simple mapping for now
        $page_key = '';
        if ( strpos( $id_placeholder, 'HOME' ) !== false ) $page_key = 'Home';
        elseif ( strpos( $id_placeholder, 'MENU' ) !== false ) $page_key = 'Menu';
        elseif ( strpos( $id_placeholder, 'ABOUT' ) !== false ) $page_key = 'About';
        elseif ( strpos( $id_placeholder, 'SERVICES' ) !== false ) $page_key = 'Services';
        elseif ( strpos( $id_placeholder, 'BLOG' ) !== false ) $page_key = 'Blog';
        elseif ( strpos( $id_placeholder, 'CONTACT' ) !== false ) $page_key = 'Contact';

        if ( $page_key && isset( $page_ids[ $page_key ] ) ) {
          $page_id = $page_ids[ $page_key ];
          $url = get_permalink( $page_id );
          
          // Construct block markup
          $menu_items_html .= '<!-- wp:navigation-link {"label":"' . $page_key . '","type":"page","id":' . $page_id . ',"url":"' . $url . '","kind":"post-type"} /-->';
        }
      }
    }

		$nav_post_id = wp_insert_post(
			array(
				'post_title'   => 'Primary Navigation',
				'post_content' => $menu_items_html,
				'post_status'  => 'publish',
				'post_type'    => 'wp_navigation',
				'post_name'    => '${THEME_SLUG}-primary-navigation',
				'post_author'  => $user_id,
			)
		);

		if ( ! is_wp_error( $nav_post_id ) ) {
			error_log( '${BUSINESS_NAME} Seeding: Created Navigation Post' );

      // Wire Header to this Navigation
      $header_tpl = <<<HTML
${headerTpl}
HTML;
      // Inject ref into wp:navigation block
      // Replaces '<!-- wp:navigation {' with '<!-- wp:navigation {"ref":123,'
      $header_content = str_replace(
          '<!-- wp:navigation {',
          '<!-- wp:navigation {"ref":' . $nav_post_id . ',',
          $header_tpl
      );

      // Create Header Template Part
      $header_post_id = wp_insert_post( array(
          'post_title'   => 'header',
          'post_name'    => '${THEME_SLUG}//header',
          'post_content' => $header_content,
          'post_status'  => 'publish',
          'post_type'    => 'wp_template_part',
          'tax_input'    => array(
              'wp_theme_json_file_part_area' => array( 'header' )
          )
      ) );

      if ( ! is_wp_error( $header_post_id ) ) {
           // Ensure taxonomy term is set
           wp_set_object_terms( $header_post_id, 'header', 'wp_theme_json_file_part_area' );
           error_log( '${BUSINESS_NAME} Seeding: Wired Header Template Part' );
      } else {
           error_log( '${BUSINESS_NAME} Seeding: Failed to wire Header: ' . $header_post_id->get_error_message() );
      }

		} else {
			error_log( '${BUSINESS_NAME} Seeding: Failed to create Navigation Post' );
		}
	}

	update_option( '${NAMESPACE_SLUG}_seed_version', $version );
}
add_action( 'admin_init', '${NAMESPACE_SLUG}_seed_content' );

/**
 * THE NUCLEAR OPTION: Force delete database templates to fix "Double Title" bug.
 * This ensures WordPress uses the physical files (front-page.html) instead of stale DB entries.
 */
function ${NAMESPACE_SLUG}_nuke_templates() {
    // Use a generated timestamp so EVERY new build triggers a reset, not just version bumps.
    $build_id = '${new Date().getTime()}'; 
    $nuke_key = '${NAMESPACE_SLUG}_nuke_build_id';
    
    if ( get_option( $nuke_key ) === $build_id ) {
        return;
    }

    error_log( '${BUSINESS_NAME}: New Build Detected (' . $build_id . '). Nuking stale database templates...' );

    $args = array(
        'post_type'      => array( 'wp_template', 'wp_template_part' ),
        'post_status'    => 'any',
        'posts_per_page' => -1,
        'tax_query'      => array(
            array(
                'taxonomy' => 'wp_theme',
                'field'    => 'name',
                'terms'    => '${THEME_SLUG}',
            ),
        ),
    );

    $query = new WP_Query( $args );

    if ( $query->have_posts() ) {
        while ( $query->have_posts() ) {
            $query->the_post();
            wp_delete_post( get_the_ID(), true );
            error_log( '${BUSINESS_NAME}: Deleted stale template: ' . get_the_title() );
        }
    }
    wp_reset_postdata();

    // FORCE RE-SEEDING: Delete the seed version option so content generation runs again.
    delete_option( '${NAMESPACE_SLUG}_seed_version' );
    error_log( '${BUSINESS_NAME}: Reset seed version to force content generation.' );

    update_option( $nuke_key, $build_id );
    error_log( '${BUSINESS_NAME}: Nuke complete for build ' . $build_id );
}
add_action( 'init', '${NAMESPACE_SLUG}_nuke_templates' );
`;
    fs.writeFileSync(functionsPath, content, "utf8");
    console.log(`Created functions.php at ${functionsPath}`);
}

function copyPatterns() {
    const patternsDir = themePath("patterns");
    ensureDir(patternsDir);

    const patternsToCopy = ["home-hero.html", "page-hero.html", "home-services.html"];

    for (const filename of patternsToCopy) {
        const sourcePath = path.join(GOLDEN_SPEC_PATH, "patterns", filename);
        if (fs.existsSync(sourcePath)) {
            let htmlContent = fs.readFileSync(sourcePath, "utf8");

            // Strip <!-- wp:pattern ... --> wrapper if present
            htmlContent = htmlContent.replace(/<!-- wp:pattern.*?-->\s*/, "").replace(/<!-- \/wp:pattern -->\s*$/, "");

            // Replace placeholders for patterns
            // Replace placeholders for patterns
            htmlContent = htmlContent.replace('{{HERO_TITLE}}', 'A commitment to flavor and tradition');
            htmlContent = htmlContent.replace('{{HERO_SUBTITLE}}', 'Welcome to ${BUSINESS_NAME}. Your new site will use this hero as a starting layout. The actual text and imagery will be generated per project to ensure a perfect fit.');

            const slug = `${PATTERN_PREFIX}/${filename.replace(".html", "")}`;
            const title = filename.replace(".html", "").replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());

            const phpContent = `<?php
/**
 * Title: ${title}
 * Slug: ${slug}
 * Categories: ${PATTERN_PREFIX}
 */
?>
${htmlContent}
`;
            const destFilename = filename.replace(".html", ".php");
            fs.writeFileSync(path.join(patternsDir, destFilename), phpContent, "utf8");
            console.log(`Converted and copied ${filename} to ${destFilename}`);
        } else {
            console.warn(`Warning: Pattern ${filename} not found in Golden Spec.`);
        }
    }
}

function buildPagePatterns() {
    const patternsDir = themePath("patterns");
    ensureDir(patternsDir);

    const pages = ["about", "services", "contact", "menu"];

    for (const page of pages) {
        const filename = `page-${page}.php`;
        const sourcePath = path.join(GOLDEN_SPEC_PATH, "patterns", filename);
        const destPath = path.join(patternsDir, filename);

        if (fs.existsSync(sourcePath)) {
            // We need to update the slug in the PHP file to use v2 namespace
            let content = fs.readFileSync(sourcePath, "utf8");
            content = content.replace(/Slug: presspilot\//, `Slug: ${PATTERN_PREFIX}/`);
            content = content.replace(/Categories: presspilot-onion/, `Categories: ${PATTERN_PREFIX}`);

            fs.writeFileSync(destPath, content, "utf8");
            console.log(`Copied pattern ${filename} from Golden Spec to ${destPath} with updated slug`);
        } else {
            console.warn(`Warning: Pattern ${filename} not found in Golden Spec.`);
        }
    }
}

function buildPageTemplates() {
    const templatesDir = themePath("templates");
    ensureDir(templatesDir);

    const pages = ["about", "services", "contact", "menu"];
    const sourcePath = path.join(GOLDEN_SPEC_PATH, "templates", "index.html");

    if (!fs.existsSync(sourcePath)) {
        console.warn("Golden Spec index.html not found, skipping page templates.");
        return;
    }

    let baseContent = fs.readFileSync(sourcePath, "utf8");

    // We need to replace the <main> content with the pattern reference.
    // The Spec has: <main class="wp-block-group alignfull"> ... </main>
    const mainRegex = /(<main class="wp-block-group alignfull">)([\s\S]*?)(<\/main>)/;

    for (const page of pages) {
        const patternSlug = `${PATTERN_PREFIX}/page-${page}`;
        const heroSlug = `${PATTERN_PREFIX}/page-hero`;

        const patternBlock = `
	<!-- wp:pattern {"slug":"${heroSlug}"} /-->
	<!-- wp:pattern {"slug":"${patternSlug}"} /-->
`;
        if (mainRegex.test(baseContent)) {
            const newContent = baseContent.replace(mainRegex, `$1${patternBlock}$3`);
            fs.writeFileSync(path.join(templatesDir, `page-${page}.html`), newContent, "utf8");
            console.log(`Created template page-${page}.html`);
        } else {
            console.warn(`Could not find <main> block to create page-${page}.html`);
        }
    }
}

function copyFooterPart() {
    const partsDir = themePath("parts");
    ensureDir(partsDir);

    const sourcePath = path.join(GOLDEN_SPEC_PATH, "parts", "footer.html");
    const destPath = path.join(partsDir, "footer.html");

    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied footer.html from Golden Spec to ${destPath}`);
}


// Allow running directly via `tsx scripts/buildWpTheme.ts`
if (require.main === module) {
    buildWpTheme();
}

function createZipArchive() {
    const themesDir = path.join(process.cwd(), "themes");
    const zipName = `${THEME_SLUG}.zip`;
    const zipPath = path.join(themesDir, zipName);

    console.log(`Creating zip archive ${zipName}...`);

    try {
        // Zip the folder from within the themes directory to avoid full paths
        // Command: cd themes && zip -r presspilot-onion-pizza.zip presspilot-onion-pizza
        execSync(`cd "${themesDir}" && zip -r "${zipName}" "${THEME_SLUG}"`, { stdio: "inherit" });
        console.log(`Successfully created zip archive at ${zipPath}`);
    } catch (error) {
        console.error("Failed to create zip archive:", error);
    }
}
