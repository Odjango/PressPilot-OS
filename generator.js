/**
 * PressPilot Theme Generator Engine
 * Usage: node generator.js --data='{"name":"My Theme","primary":"#00D084","secondary":"#FF6900"}'
 */

const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

// 1. CONFIGURATION
const BASE_THEME_PATH = path.join(__dirname, 'themes/presspilot-child');
const OUTPUT_DIR = path.join(__dirname, 'output');
const TEMP_DIR = path.join(__dirname, 'temp');

// 2. PARSE INPUT (From Command Line or n8n)
// We expect a JSON string passed as an argument
const args = process.argv.slice(2);
let userData = {};

try {
    // Look for the --data flag
    const dataArg = args.find(arg => arg.startsWith('--data='));
    if (dataArg) {
        // Handle n8n escaping potentially
        let rawData = dataArg.split('=', 2)[1];
        // If wrapped in single quotes that node didn't strip (unlikely but safe)
        if (rawData.startsWith("'") && rawData.endsWith("'")) {
            rawData = rawData.slice(1, -1);
        }
        userData = JSON.parse(rawData);
    } else {
        throw new Error("No data provided. Use --data='{...}'");
    }
} catch (error) {
    console.error(JSON.stringify({ status: "error", message: "Error parsing input: " + error.message }));
    process.exit(1);
}

async function generateTheme() {
    const timestamp = Date.now();
    const themeSlug = (userData.name || 'presspilot-theme').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const uniqueId = `${themeSlug}-${timestamp}`;
    const buildPath = path.join(TEMP_DIR, uniqueId);
    const zipFilename = `${uniqueId}.zip`;
    const zipPath = path.join(OUTPUT_DIR, zipFilename);

    try {
        // A. PREPARE DIRECTORIES
        await fs.ensureDir(OUTPUT_DIR);
        await fs.ensureDir(TEMP_DIR);

        // B. COPY BASE THEME
        if (!fs.existsSync(BASE_THEME_PATH)) {
            throw new Error(`Base theme not found at ${BASE_THEME_PATH}`);
        }
        await fs.copy(BASE_THEME_PATH, buildPath);

        // C. INJECT DATA INTO THEME.JSON
        const themeJsonPath = path.join(buildPath, 'theme.json');
        if (await fs.pathExists(themeJsonPath)) {
            const themeJson = await fs.readJson(themeJsonPath);

            // Ensure structure matches
            if (!themeJson.settings) themeJson.settings = {};
            if (!themeJson.settings.color) themeJson.settings.color = {};
            if (!themeJson.settings.color.palette) themeJson.settings.color.palette = [];

            const palette = themeJson.settings.color.palette;

            // Helper to update/insert color
            const upsertColor = (slug, name, colorValue) => {
                if (!colorValue) return;
                const existing = palette.find(c => c.slug === slug);
                if (existing) {
                    existing.color = colorValue;
                } else {
                    palette.push({ slug, name, color: colorValue });
                }
            };

            // Update specific slots based on user input
            if (userData.primary) upsertColor('primary', 'Brand Primary', userData.primary);
            if (userData.secondary) upsertColor('secondary', 'Brand Secondary', userData.secondary);
            if (userData.surface) upsertColor('base', 'Base Color', userData.surface);

            // Write back
            await fs.writeJson(themeJsonPath, themeJson, { spaces: '\t' });
        }

        // D. UPDATE STYLE.CSS (Metadata)
        const styleCssPath = path.join(buildPath, 'style.css');
        if (await fs.pathExists(styleCssPath)) {
            let styleCss = await fs.readFile(styleCssPath, 'utf8');
            const themeName = userData.name || 'PressPilot Generated Theme';

            // Simple regex replacement for standard headers
            if (styleCss.includes('Theme Name:')) {
                styleCss = styleCss.replace(/^Theme Name:.*$/m, `Theme Name: ${themeName}`);
            } else {
                styleCss = `/*\nTheme Name: ${themeName}\n*/\n` + styleCss;
            }

            await fs.writeFile(styleCssPath, styleCss);
        }

        // H. PROCESS PATTERNS (The Pure FSE Logic)
        // We replace placeholders in the PHP pattern files with actual content
        const patternsDir = path.join(buildPath, 'patterns');
        if (await fs.pathExists(patternsDir)) {
            // 1. Process Home Pattern
            const homePatternPath = path.join(patternsDir, 'home.php');
            if (await fs.pathExists(homePatternPath)) {
                let content = await fs.readFile(homePatternPath, 'utf8');

                // Define replacements map
                const replacements = {
                    '{{hero_headline}}': userData.hero_headline || 'Welcome to ' + (userData.name || 'Our Site'),
                    '{{hero_subheadline}}': userData.hero_subheadline || userData.tagline || 'We provide excellent services.',
                    '{{hero_image}}': userData.hero_image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=800&fit=crop',
                    '{{cta_text}}': userData.cta_text || 'Get Started',
                    '{{cta_description}}': userData.cta_description || 'Contact us to learn more.',
                    '{{cta_button_text}}': userData.cta_button_text || 'Contact Us',
                    // Complex HTML replacements (Features/Testimonials)
                    '{{features_columns}}': generateFeaturesHTML(userData.benefits, userData.primary || '#111827'),
                    '{{testimonial_columns}}': generateTestimonialsHTML(userData.testimonials, userData.primary || '#111827')
                };

                // Execute replacements
                for (const [key, value] of Object.entries(replacements)) {
                    // specific string replace, global flag if needed for multiple occurrences
                    content = content.replace(new RegExp(key, 'g'), value);
                }

                await fs.writeFile(homePatternPath, content);
            }
        }

        function generateFeaturesHTML(benefits, color) {
            if (!benefits || !Array.isArray(benefits)) return '';
            let html = '';
            benefits.forEach((benefit, index) => {
                html += `<!-- wp:column -->
 <div class="wp-block-column">
     <!-- wp:group {"style":{"border":{"radius":"10px"},"spacing":{"padding":{"top":"30px","bottom":"30px","left":"25px","right":"25px"}},"color":{"background":"#f8f9fa"}}} -->
     <div class="wp-block-group has-background" style="background-color:#f8f9fa;border-radius:10px;padding:30px 25px">
         <!-- wp:paragraph {"align":"center","fontSize":"large","style":{"color":{"text":"var:preset|color|primary"}}} -->
         <p class="has-text-align-center has-large-font-size" style="color:var(--wp--preset--color--primary)">✓</p>
         <!-- /wp:paragraph -->
         
         <!-- wp:heading {"level":3,"textAlign":"center","fontSize":"medium"} -->
         <h3 class="wp-block-heading has-text-align-center has-medium-font-size">Benefit ${index + 1}</h3>
         <!-- /wp:heading -->
         
         <!-- wp:paragraph {"textAlign":"center"} -->
         <p class="has-text-align-center">${benefit}</p>
         <!-- /wp:paragraph -->
     </div>
     <!-- /wp:group -->
 </div>
 <!-- /wp:column -->`;
            });
            return html;
        }

        function generateTestimonialsHTML(testimonials, color) {
            const items = testimonials && Array.isArray(testimonials) ? testimonials : [
                { text: "Excellent service!", name: "Happy Client" },
                { text: "Highly recommended.", name: "Satisfied Customer" }
            ];

            let html = '';
            items.forEach(item => {
                html += `<!-- wp:column -->
 <div class="wp-block-column">
     <!-- wp:group {"style":{"border":{"radius":"10px"},"spacing":{"padding":{"top":"30px","bottom":"30px","left":"25px","right":"25px"}},"color":{"background":"#ffffff"}}} -->
     <div class="wp-block-group has-background" style="background-color:#ffffff;border-radius:10px;padding:30px 25px">
         <!-- wp:paragraph {"style":{"typography":{"fontSize":"1.125rem","fontStyle":"italic"}}} -->
         <p style="font-size:1.125rem;font-style:italic">"${item.text}"</p>
         <!-- /wp:paragraph -->
         
         <!-- wp:paragraph {"style":{"color":{"text":"var:preset|color|primary"},"typography":{"fontWeight":"600"}}} -->
         <p style="color:var(--wp--preset--color--primary);font-weight:600">— ${item.name}</p>
         <!-- /wp:paragraph -->
     </div>
     <!-- /wp:group -->
 </div>
 <!-- /wp:column -->`;
            });
            return html;
        }

        // E. ZIP THE FOLDER
        await zipDirectory(buildPath, zipPath);

        // F. CLEANUP
        await fs.remove(buildPath);

        // G. OUTPUT RESULT (JSON for n8n)
        console.log(JSON.stringify({
            status: "success",
            themeName: userData.name,
            downloadPath: zipPath,
            filename: zipFilename
        }));

    } catch (err) {
        console.error(JSON.stringify({ status: "error", message: err.message }));
        process.exit(1);
    }
}

// HELPER: Zip Logic
function zipDirectory(source, out) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(out);

    return new Promise((resolve, reject) => {
        archive
            .directory(source, false) // false = zip contents, not the folder itself
            .on('error', err => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
    });
}

// RUN
generateTheme();
