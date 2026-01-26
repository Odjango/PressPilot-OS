
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

const VAULT_DIR = path.join(process.cwd(), 'proven-cores');

// Shared Content Structure (Columns, Links, Social)
const getFooterInnerContent = (themeName: string) => `
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|50","left":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-columns alignwide">
        <!-- wp:column {"width":"40%"} -->
        <div class="wp-block-column" style="flex-basis:40%">
            <!-- wp:site-title {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"700"}}} /-->
            
            <!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.6"}}} -->
            <p style="line-height:1.6">Built with robust, clean code. Optimized for performance and scale.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"30%"} -->
        <div class="wp-block-column" style="flex-basis:30%">
            <!-- wp:heading {"level":6,"style":{"typography":{"textTransform":"uppercase","letterSpacing":"1px"}}} -->
            <h6 class="wp-block-heading" style="text-transform:uppercase;letter-spacing:1px">Quick Links</h6>
            <!-- /wp:heading -->
            
            <!-- wp:navigation {"overlayMenu":"never","layout":{"type":"flex","orientation":"vertical"}} /-->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"30%"} -->
        <div class="wp-block-column" style="flex-basis:30%">
            <!-- wp:heading {"level":6,"style":{"typography":{"textTransform":"uppercase","letterSpacing":"1px"}}} -->
            <h6 class="wp-block-heading" style="text-transform:uppercase;letter-spacing:1px">Connect</h6>
            <!-- /wp:heading -->
             <!-- wp:social-links {"iconColor":"base","iconColorValue":"#ffffff","style":{"spacing":{"blockGap":"1rem"}}} -->
            <ul class="wp-block-social-links has-icon-color has-base-color">
                <!-- wp:social-link {"url":"#","service":"twitter"} /-->
                <!-- wp:social-link {"url":"#","service":"linkedin"} /-->
            </ul>
            <!-- /wp:social-links -->
            <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}, "fontSize":"small"} -->
             <p class="has-small-font-size" style="margin-top:var(--wp--preset--spacing--20)">© ${new Date().getFullYear()} ${themeName}.<br>Powered by PressPilot OS.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
`;

// Dark Footer: Contrast BG + Base Text
const getUniversalFooterDark = (themeName: string) => `
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70"}}},"backgroundColor":"contrast","textColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-color has-contrast-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">
    ${getFooterInnerContent(themeName)}
</div>
<!-- /wp:group -->
`;

// Light Footer: Base BG + Contrast Text
const getUniversalFooterLight = (themeName: string) => `
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70"}}},"backgroundColor":"base","textColor":"contrast","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-contrast-color has-base-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">
    ${getFooterInnerContent(themeName)}
</div>
<!-- /wp:group -->
`;

async function run() {
    console.log("🛡️  Starting PROVEN-CORES Optimization...");

    if (!await fs.pathExists(VAULT_DIR)) {
        console.error(`❌ Error: ${VAULT_DIR} does not exist!`);
        process.exit(1);
    }

    const themes = await fs.readdir(VAULT_DIR);

    for (const theme of themes) {
        if (theme.startsWith('.') || theme.includes('json')) continue;

        const themeDir = path.join(VAULT_DIR, theme);
        const stats = await fs.stat(themeDir);
        if (!stats.isDirectory()) continue;

        console.log(`\n📦 Processing: ${theme.toUpperCase()}`);

        // 1. DELETE IMAGES (The Nuclear Option)
        const imagePatterns = [
            '**/assets/images',
            '**/patterns/images',
            '**/inc/images',
            '**/images',
            '**/img',
            '**/screenshot.png',
            '**/screenshot.jpg',
            '**/screenshot.webp'
        ];

        for (const pattern of imagePatterns) {
            const matches = await glob(pattern, { cwd: themeDir, absolute: true });
            for (const match of matches) {
                console.log(`   🗑️  Deleting: ${path.relative(themeDir, match)}`);
                await fs.remove(match);
                if (!match.includes('.')) await fs.ensureDir(match);
            }
        }

        // 2. BRAND FOOTERS (Smart Light/Dark Logic)
        const footerFiles = await glob('**/*footer*.{php,html}', { cwd: themeDir, absolute: true });

        for (const file of footerFiles) {
            const filename = path.basename(file).toLowerCase();

            // Skip non-layout parts if possible
            if (filename.includes('script')) continue;

            // SMART LOGIC:
            // If filename has 'light' -> Use Light Footer (Base BG, Contrast Text)
            // Else -> Use Dark Footer (Contrast BG, Base Text) - Default for standard 'footer.php'

            const isLight = filename.includes('light');
            const newContent = isLight ? getUniversalFooterLight("PressPilot Site") : getUniversalFooterDark("PressPilot Site");
            const variantType = isLight ? "LIGHT" : "DARK";

            console.log(`   ✨ Re-Branding Footer (${variantType}): ${path.relative(themeDir, file)}`);

            // Keep PHP header if needed
            if (filename.endsWith('.php')) {
                const phpHeader = `<?php
/**
 * Title: Footer (${variantType})
 * Slug: ${theme}/${filename.replace('.php', '')}-${Date.now()}
 * Categories: footer
 * Block Types: core/template-part/footer
 */
?>\n`;
                await fs.writeFile(file, phpHeader + newContent);
            } else {
                await fs.writeFile(file, newContent);
            }
        }
    }

    console.log("\n✅ PROVEN-CORES Optimized. All targets Clean & Branded.");
}

run();
