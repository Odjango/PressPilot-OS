/**
 * PressPilot Factory Worker
 * Location: /root/presspilot/generator.js
 */

const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

// Helper function to process variables in a string
function processTemplate(content, data) {
    return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] || match;
    });
}

/**
 * Generates HTML for Feature Columns
 * @param {Array} features - Array of feature strings or objects
 * @returns {string} - HTML string for the columns
 */
function generateFeaturesHTML(features) {
    if (!features || !Array.isArray(features)) return '';

    let html = '';
    features.forEach(feature => {
        const text = typeof feature === 'string' ? feature : feature.text;
        html += `<!-- wp:column -->
<div class="wp-block-column">
    <!-- wp:group {"style":{"border":{"radius":"10px"},"spacing":{"padding":{"top":"30px","bottom":"30px","left":"25px","right":"25px"}},"color":{"background":"#f8f9fa"}}} -->
    <div class="wp-block-group has-background" style="background-color:#f8f9fa;border-radius:10px;padding-top:30px;padding-bottom:30px;padding-left:25px;padding-right:25px">
        <!-- wp:paragraph {"align":"center","fontSize":"large","style":{"color":{"text":"var:preset|color|primary"}}} -->
        <p class="has-text-align-center has-large-font-size" style="color:var(--wp--preset--color--primary)">✓</p>
        <!-- /wp:paragraph -->

        <!-- wp:heading {"textAlign":"center","level":4} -->
        <h4 class="wp-block-heading has-text-align-center">${text}</h4>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"align":"center","fontSize":"small"} -->
        <p class="has-text-align-center has-small-font-size">Detail about standard feature compliance.</p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:column -->`;
    });
    return html;
}

/**
 * Generates HTML for Testimonials
 * @param {Array} testimonials
 * @returns {string}
 */
function generateTestimonialsHTML(testimonials) {
    if (!testimonials || !Array.isArray(testimonials)) {
        // Default testimonials if none provided
        testimonials = [
            { text: "Amazing service! Highly recommended.", author: "Happy Client" },
            { text: "Professional and reliable.", author: "Satisfied Customer" }
        ];
    }

    let html = '';
    testimonials.forEach(item => {
        html += `<!-- wp:column -->
 <div class="wp-block-column">
     <!-- wp:group {"style":{"border":{"radius":"10px"},"spacing":{"padding":{"top":"30px","bottom":"30px","left":"25px","right":"25px"}},"color":{"background":"#ffffff"}}} -->
     <div class="wp-block-group has-background" style="background-color:#ffffff;border-radius:10px;padding-top:30px;padding-bottom:30px;padding-left:25px;padding-right:25px">
         <!-- wp:paragraph {"style":{"typography":{"fontSize":"1.125rem","fontStyle":"italic"}}} -->
         <p style="font-size:1.125rem;font-style:italic">"${item.text}"</p>
         <!-- /wp:paragraph -->

         <!-- wp:paragraph {"style":{"typography":{"weight":"700"},"color":{"text":"var:preset|color|primary"}}} -->
         <p style="color:var(--wp--preset--color--primary);font-weight:700">— ${item.author}</p>
         <!-- /wp:paragraph -->
     </div>
     <!-- /wp:group -->
 </div>
 <!-- /wp:column -->`;
    });
    return html;
}


async function generateTheme() {
    // 1. SETUP
    const args = process.argv.slice(2);
    const dataArg = args.find(arg => arg.startsWith('--data='));

    let userData = {};
    if (dataArg) {
        try {
            userData = JSON.parse(dataArg.split('=')[1]);
        } catch (e) {
            console.error("Error parsing JSON data:", e);
            process.exit(1);
        }
    }

    const themeName = userData.name || 'PressPilot Theme';
    const safeName = themeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();
    const buildDir = path.join(__dirname, 'output', `${safeName}-${timestamp}`);
    const zipPath = path.join(__dirname, 'output', `${safeName}-${timestamp}.zip`);
    const themeDir = path.join(buildDir, safeName); // Structure: output/ID/theme-slug/

    // Use the new BASE THEME path
    const BASE_THEME_PATH = path.join(__dirname, 'presspilot-base');

    console.log(`Starting generation for: ${themeName}`);

    try {
        // A. Create Output Directory
        await fs.ensureDir(themeDir);

        // B. Copy Base Theme
        if (!fs.existsSync(BASE_THEME_PATH)) {
            throw new Error(`Base theme not found at ${BASE_THEME_PATH}`);
        }
        await fs.copy(BASE_THEME_PATH, themeDir);
        console.log('Base theme copied.');

        // C. Inject Data into theme.json (Colors)
        const themeJsonPath = path.join(themeDir, 'theme.json');
        if (await fs.pathExists(themeJsonPath)) {
            const themeJson = await fs.readJson(themeJsonPath);

            if (userData.primary) {
                const palette = themeJson.settings.color.palette;
                // Upsert Primary
                let primary = palette.find(c => c.slug === 'primary');
                if (primary) primary.color = userData.primary;
                else palette.push({ slug: 'primary', name: 'Primary', color: userData.primary });

                // Upsert Brand Primary
                let brand = palette.find(c => c.slug === 'brand-primary');
                if (brand) brand.color = userData.primary;
                else palette.push({ slug: 'brand-primary', name: 'Brand Primary', color: userData.primary });
            }

            if (userData.secondary) {
                const palette = themeJson.settings.color.palette;
                // Upsert Secondary
                let secondary = palette.find(c => c.slug === 'secondary');
                if (secondary) secondary.color = userData.secondary;
                else palette.push({ slug: 'secondary', name: 'Secondary', color: userData.secondary });

                // Upsert Brand Secondary
                let brand = palette.find(c => c.slug === 'brand-secondary');
                if (brand) brand.color = userData.secondary;
                else palette.push({ slug: 'brand-secondary', name: 'Brand Secondary', color: userData.secondary });
            }

            await fs.writeJson(themeJsonPath, themeJson, { spaces: 4 });
            console.log('theme.json updated.');
        }

        // D. Create site-info.json for Actvator
        const siteInfo = {
            name: themeName,
            description: userData.tagline || 'Just another PressPilot site',
            logo: userData.logo || ''
        };
        await fs.writeJson(path.join(themeDir, 'site-info.json'), siteInfo, { spaces: 4 });
        console.log('site-info.json created.');

        // E. Inject Data into style.css (Theme Name)
        const styleCssPath = path.join(themeDir, 'style.css');
        if (await fs.pathExists(styleCssPath)) {
            let styleContent = await fs.readFile(styleCssPath, 'utf8');
            styleContent = styleContent.replace(/Theme Name:.*$/m, `Theme Name: ${themeName}`);
            await fs.writeFile(styleCssPath, styleContent);
            console.log('style.css updated.');
        }

        // F. PERSONALIZATION: patterns/hero.php
        const heroPath = path.join(themeDir, 'patterns', 'hero.php');
        if (await fs.pathExists(heroPath) && userData.hero_headline) {
            let heroContent = await fs.readFile(heroPath, 'utf8');
            heroContent = heroContent.replace('Launch Your Vision with PressPilot', userData.hero_headline);
            // Also replace subheadline if present
            if (userData.hero_subheadline) {
                heroContent = heroContent.replace('A scalable, modern foundation for your next big idea. Generated in seconds, built to last.', userData.hero_subheadline);
            }
            await fs.writeFile(heroPath, heroContent);
            console.log('hero.php pattern updated.');
        }

        // G. Create ZIP
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', function () {
            console.log(JSON.stringify({
                status: "success",
                themeName: themeName,
                downloadPath: zipPath,
                filename: `${safeName}-${timestamp}.zip`
            }));
        });

        archive.on('error', function (err) {
            throw err;
        });

        archive.pipe(output);
        // Zip the content instructions
        // We want the zip to contain a folder named [theme-slug], so we use archive.directory with that name
        archive.directory(themeDir, safeName);
        await archive.finalize();

    } catch (err) {
        console.error('Error:', err);
        console.log(JSON.stringify({ status: "error", message: err.message }));
        process.exit(1);
    }
}

generateTheme();
