// PressPilot Theme Generator V3.0 (Manual Override)

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

// IMPORT LOCAL SERIALIZER (The Fix)
import { serialize } from "./serializer"; 

// Mock Imports for Extraction/Compilation (Keep existing logic if files exist, else mock)
// Assuming these libraries exist in your environment. If not, we'd need to mock them too.
import { extractLayout } from "../lib/presspilot/extractor";
import { compileAST } from "../lib/presspilot/compiler";
import { resolveBusinessCopy } from "../lib/presspilot/kit";
import { MOCK_CONTEXT, MOCK_VARIATION } from "../lib/presspilot/demo/mockContext";

const THEME_VERSION = "3.0.0";
const OUTPUT_DIR = path.join(process.cwd(), "themes");

// CONFIG
const CONFIG = {
    theme_name: "Antigravity V3 Final",
    theme_slug: "antigravity-v3-final",
    site_title: "PressPilot V3",
    colors: { base: "#ffffff", accent: "#000000", background: "#f0f0f0" }
};

const GOLDEN_SPEC_PATH = path.join(process.cwd(), "golden-spec");
const THEME_DIR = path.join(OUTPUT_DIR, CONFIG.theme_slug);

function ensureDir(p: string) {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

async function build() {
    console.log(`Building Final Fix: ${CONFIG.theme_slug}`);

    // 0. Clean & Init
    if (fs.existsSync(THEME_DIR)) fs.rmSync(THEME_DIR, { recursive: true, force: true });
    ensureDir(THEME_DIR);
    ensureDir(path.join(THEME_DIR, "parts"));
    ensureDir(path.join(THEME_DIR, "templates"));

    // 1. Generate Header & Footer (The "Attempt Recovery" Fix)
    // We manually construct the AST here to guarantee validity, bypassing the complex compiler.
    
    const headerAST = {
        blockName: "core/group",
        attributes: {
            tagName: "header",
            align: "full",
            layout: { type: "constrained" },
            style: { spacing: { padding: { top: "var:preset|spacing|30", bottom: "var:preset|spacing|30" } } }
        },
        innerBlocks: [
            {
                blockName: "core/group",
                attributes: { 
                    align: "wide", 
                    layout: { type: "flex", justifyContent: "space-between", flexWrap: "nowrap" } 
                },
                innerBlocks: [
                    { blockName: "core/site-title", attributes: { level: 1 } },
                    { blockName: "core/navigation", attributes: { layout: { type: "flex", orientation: "horizontal" } } }
                ]
            }
        ]
    };

    const footerAST = {
        blockName: "core/group",
        attributes: {
            tagName: "footer",
            align: "full",
            layout: { type: "constrained" },
            style: { spacing: { padding: { top: "var:preset|spacing|50", bottom: "var:preset|spacing|50" } } }
        },
        innerBlocks: [
            {
                blockName: "core/paragraph",
                attributes: { align: "center", content: "© 2024 PressPilot Generated Theme" }
            }
        ]
    };

    // Serialize
    console.log("Serializing parts...");
    fs.writeFileSync(path.join(THEME_DIR, "parts", "header.html"), await serialize(headerAST));
    fs.writeFileSync(path.join(THEME_DIR, "parts", "footer.html"), await serialize(footerAST));

    // 2. Generate Index Template
    const indexContent = `<main class="wp-block-group is-layout-constrained">
    <h1>Hello World</h1><p>Welcome to the fixed theme.</p></main>
`;
    
    fs.writeFileSync(path.join(THEME_DIR, "templates", "index.html"), indexContent);

    // 3. Base Files
    console.log("Copying Base Files...");
    
    // theme.json (Critical)
    const themeJsonPath = path.join(GOLDEN_SPEC_PATH, "theme.json");
    if (fs.existsSync(themeJsonPath)) {
        fs.copyFileSync(themeJsonPath, path.join(THEME_DIR, "theme.json"));
    } else {
        // Fallback if missing
        console.warn("WARNING: Golden spec theme.json missing. creating minimal.");
        fs.writeFileSync(path.join(THEME_DIR, "theme.json"), JSON.stringify({
            version: 2,
            settings: { layout: { contentSize: "800px", wideSize: "1200px" } }
        }, null, 2));
    }

    // style.css
    const styleContent = `/*
Theme Name: ${CONFIG.theme_name}
Text Domain: ${CONFIG.theme_slug}
Version: ${THEME_VERSION}
*/`;
    fs.writeFileSync(path.join(THEME_DIR, "style.css"), styleContent);

    // functions.php
    fs.writeFileSync(path.join(THEME_DIR, "functions.php"), "<?php\n// Silence.");

    console.log(`Build Complete: ${THEME_DIR}`);
}

build().catch(console.error);