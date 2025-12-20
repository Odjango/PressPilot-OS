
// PressPilot Theme Generator V2.0 (Assembly Line)
// Implements Strict 5-Stage Pipeline: Extract -> Compile -> Serialize -> Assemble -> Validate

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

// Import Assembly Line Agents
import { extractLayout } from "../lib/presspilot/extractor";
import { compileAST } from "../lib/presspilot/compiler";
import { serialize } from "../lib/presspilot/serializer";
// Import Copy Resolvers
import { resolveBusinessCopy } from "../lib/presspilot/kit";
import { MOCK_CONTEXT, MOCK_VARIATION } from "../lib/presspilot/demo/mockContext";

const THEME_VERSION = "2.0.0." + Math.floor(Date.now() / 1000);

// Config Interface
interface ThemeGeneratorConfig {
    theme_name: string;
    theme_slug: string;
    site_title: string;
    destructive_mode: boolean;
    pages: Array<{ slug: string; title: string; content: string }>;
    copyrightText?: string;
    colors: {
        base: string;
        accent: string;
        background: string;
    };
}

// Mock Config
const MOCK_CONFIG: ThemeGeneratorConfig = {
    theme_name: "Heavy Stress Test",
    theme_slug: "presspilot-heavy-content-v3",
    site_title: "Heavy Stress Test", // Triggers compiler injection
    destructive_mode: true,
    pages: [], // Pages are handled by Extractor now
    colors: {
        base: "#ffffff",
        accent: "#ff0000",
        background: "#f0f0f0"
    }
};

// Use injected config or mock, or load from CLI arg
let CONFIG: ThemeGeneratorConfig & { source_spec?: string } = (global as any).THEME_CONFIG || MOCK_CONFIG;
let OUTPUT_DIR = path.join(process.cwd(), "themes");

// CLI Argument Parsing
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--config" || arg.startsWith("--config=")) {
        const val = arg.includes("=") ? arg.split("=")[1] : args[++i];
        if (val) {
            try {
                const configPath = path.resolve(val);
                const configRaw = fs.readFileSync(configPath, "utf8");
                CONFIG = JSON.parse(configRaw);

                if (!CONFIG.theme_slug) CONFIG.theme_slug = (CONFIG as any).slug || "generated-theme";
                if (!CONFIG.theme_name) CONFIG.theme_name = (CONFIG as any).siteTitle || "Generated Theme";
                if (!CONFIG.site_title) CONFIG.site_title = (CONFIG as any).siteTitle || "My Site";
                if (!CONFIG.colors) CONFIG.colors = MOCK_CONFIG.colors;
                if (!CONFIG.pages) CONFIG.pages = [];

                CONFIG.pages = CONFIG.pages.map((p: any) => ({
                    slug: p.slug,
                    title: p.title,
                    content: p.content || `Content for ${p.title}`
                }));

            } catch (e) {
                console.error("Failed to load config from file:", e);
                process.exit(1);
            }
        }
    }
    if (arg === "--out-dir" || arg.startsWith("--out-dir=")) {
        const val = arg.includes("=") ? arg.split("=")[1] : args[++i];
        if (val) OUTPUT_DIR = path.resolve(val);
    }
    if (arg === "--build-id" || arg.startsWith("--build-id=")) {
        const val = arg.includes("=") ? arg.split("=")[1] : args[++i];
        if (val) (CONFIG as any).build_id = val;
    }
    if (arg === "--commit" || arg.startsWith("--commit=")) {
        const val = arg.includes("=") ? arg.split("=")[1] : args[++i];
        if (val) (CONFIG as any).commit = val;
    }
}

// For V2 Assembly Line, we still rely on 'golden-spec' for BASE files (theme.json, functions.php) logic
const GOLDEN_SPEC_PATH = CONFIG.source_spec
    ? path.resolve(CONFIG.source_spec)
    : path.join(process.cwd(), "golden-spec");

const { theme_name, theme_slug, site_title } = CONFIG;

const THEME_SLUG = theme_slug;
const NAMESPACE_SLUG = theme_slug.replace(/-/g, "_");

function themePath(...parts: string[]) {
    if (path.basename(OUTPUT_DIR) === THEME_SLUG) {
        return path.join(OUTPUT_DIR, ...parts);
    }
    return path.join(OUTPUT_DIR, THEME_SLUG, ...parts);
}

function ensureDir(p: string) {
    fs.mkdirSync(p, { recursive: true });
}

async function buildWpTheme() {
    console.log(`Building V2.0 Assembly Line Theme: ${THEME_SLUG} (Version ${THEME_VERSION})`);

    // 0. Clean
    if (fs.existsSync(themePath())) {
        fs.rmSync(themePath(), { recursive: true, force: true });
    }
    ensureDir(themePath());

    // 1. Core Files (Base)
    copyCoreFiles();
    updateThemeJson();
    updateFunctionsPhp();
    createIndexPhp();
    createReadme();

    // 2. THE ASSEMBLY LINE (Agents 1-3)
    // Generate HTML Artifacts
    await generateHtmlArtifacts();

    // 3. Asset Copy (Images/Fonts)
    copyAssets();

    // 4. Archive
    copyPatterns(); // [NEW] Ensure patterns are included
    createZipArchive();
    console.log("Build Complete.");
}

function copyPatterns() {
    const src = path.join(GOLDEN_SPEC_PATH, "patterns");
    if (fs.existsSync(src)) {
        ensureDir(themePath("patterns"));
        // Filter for .html and .php files
        const files = fs.readdirSync(src).filter(f => f.endsWith('.html') || f.endsWith('.php') || f.endsWith('.json'));
        for (const file of files) {
            fs.copyFileSync(path.join(src, file), themePath("patterns", file));
        }
        console.log(`Copied ${files.length} patterns.`);
    }
}

async function generateHtmlArtifacts() {
    console.log("Running Assembly Line: Extract -> Compile -> Serialize...");

    // Agent 1: Extraction
    // We construct a mock copy environment for CLI usage
    const copy = await resolveBusinessCopy(
        MOCK_CONTEXT,
        MOCK_VARIATION,
        null
    );
    // Override with CONFIG
    copy.hero.title = CONFIG.site_title;

    const layout = extractLayout(CONFIG.site_title, copy);

    // Agent 2: Compilation
    const artifacts = compileAST(layout);

    // Agent 3: Serialization
    for (const [relativePath, ast] of Object.entries(artifacts)) {
        const fullPath = themePath(relativePath);
        ensureDir(path.dirname(fullPath));

        const html = serialize(ast);
        fs.writeFileSync(fullPath, html);
        console.log(`Serialized: ${relativePath}`);
    }
}

function copyCoreFiles() {
    // Copy style.css
    const styleSrc = path.join(GOLDEN_SPEC_PATH, "style.css");
    if (fs.existsSync(styleSrc)) {
        let content = fs.readFileSync(styleSrc, "utf8");
        content = content.replace(/Theme Name: PressPilot Golden V1/, `Theme Name: ${theme_name}`);
        content = content.replace(/Text Domain: presspilot-golden-v1/, `Text Domain: ${THEME_SLUG}`);

        const buildId = (CONFIG as any).build_id || "";
        const versionSuffix = buildId ? `.${buildId}` : "";
        content = content.replace(/Version: 1.0.0/, `Version: ${THEME_VERSION}${versionSuffix}`);

        // Stamp Metadata
        const commit = (CONFIG as any).commit || "unknown";
        const generatedAt = new Date().toISOString();

        content += `\n/*`;
        content += `\n * PressPilot-Build-ID: ${buildId}`;
        content += `\n * PressPilot-Commit: ${commit}`;
        content += `\n * PressPilot-Generated-At: ${generatedAt}`;
        content += `\n */`;

        fs.writeFileSync(themePath("style.css"), content);
    } else {
        console.error("CRITICAL: style.css missing in Golden Spec");
        process.exit(1);
    }
}

function updateThemeJson() {
    const src = path.join(GOLDEN_SPEC_PATH, "theme.json");
    if (fs.existsSync(src)) {
        const themeJson = JSON.parse(fs.readFileSync(src, "utf8"));
        if (themeJson.settings?.color?.palette) {
            const paletteMap: Record<string, string> = {
                "base": CONFIG.colors.background || "#ffffff",
                "contrast": "#1e1e1e",
                "primary": CONFIG.colors.accent || "#0066cc",
                "secondary": CONFIG.colors.base || "#6c757d",
                "tertiary": "#f8f9fa"
            };
            themeJson.settings.color.palette = themeJson.settings.color.palette.map((p: any) => {
                if (paletteMap[p.slug]) {
                    return { ...p, color: paletteMap[p.slug] };
                }
                return p;
            });
        }
        fs.writeFileSync(themePath("theme.json"), JSON.stringify(themeJson, null, 2));
    } else {
        console.error("CRITICAL: theme.json missing in Golden Spec");
        process.exit(1);
    }
}

function updateFunctionsPhp() {
    const src = path.join(GOLDEN_SPEC_PATH, "functions.php");
    if (fs.existsSync(src)) {
        let content = fs.readFileSync(src, "utf8");
        content = content.replace(/presspilot_golden_v1/g, NAMESPACE_SLUG);
        content = content.replace(/presspilot-golden-v1/g, THEME_SLUG);
        fs.writeFileSync(themePath("functions.php"), content);
    }
}

function createIndexPhp() {
    fs.writeFileSync(themePath("index.php"), "<?php\n// Silence is golden.");
}

function createReadme() {
    fs.writeFileSync(themePath("README.txt"), `Theme: ${theme_name}\nVersion: ${THEME_VERSION}\nGenerated by PressPilot OS Assembly Line.`);
}

function copyAssets() {
    const src = path.join(GOLDEN_SPEC_PATH, "assets");
    if (fs.existsSync(src)) {
        fs.cpSync(src, themePath("assets"), { recursive: true });
    }
}

function createZipArchive() {
    const zipName = `${THEME_SLUG}.zip`;
    const themeDir = themePath();
    const zipPath = path.join(OUTPUT_DIR, zipName);
    console.log(`Creating ZIP: ${zipPath}`);
    try {
        execSync(`cd "${OUTPUT_DIR}" && zip -r "${zipName}" "${THEME_SLUG}"`);
    } catch (e) {
        console.error("Zip failed.", e);
    }
}

buildWpTheme().catch(e => {
    console.error("Build Failed:", e);
    process.exit(1);
});
