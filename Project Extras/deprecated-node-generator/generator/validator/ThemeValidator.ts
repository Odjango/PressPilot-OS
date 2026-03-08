import fs from 'fs-extra';
import path from 'path';

export interface ValidationReport {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export class ThemeValidator {
    /**
     * Scans the generated theme directory for common FSE validation errors.
     * "Trust but Verify" - ensures we never ship a broken theme.
     */
    async validateTheme(themeDir: string): Promise<ValidationReport> {
        const report: ValidationReport = {
            isValid: true,
            errors: [],
            warnings: []
        };

        // 1. Scan Templates and Patterns
        const files = await this.getAllFiles(themeDir);
        for (const file of files) {
            if (file.endsWith('.html') || file.endsWith('.php')) {
                const content = await fs.readFile(file, 'utf8');
                this.validateFileContent(file, content, report);
            }
        }

        if (report.errors.length > 0) {
            report.isValid = false;
        }

        return report;
    }

    private async getAllFiles(dir: string): Promise<string[]> {
        const subdirs = await fs.readdir(dir);
        const files = await Promise.all(subdirs.map(async (subdir) => {
            const res = path.resolve(dir, subdir);
            return (await fs.stat(res)).isDirectory() ? this.getAllFiles(res) : res;
        }));
        return files.reduce((a, f) => a.concat(f), []);
    }

    private validateFileContent(filePath: string, content: string, report: ValidationReport) {
        const fileName = path.basename(filePath);

        // RULE 1: JSON Syntax in Block Comments
        // Regex to find <!-- wp:blockname {...} -->
        const blockRegex = /<!--\s*wp:([a-z0-9\/-]+)\s+({.*?})\s*-->/g;
        let match;
        while ((match = blockRegex.exec(content)) !== null) {
            const [fullMatch, blockName, jsonString] = match;
            try {
                JSON.parse(jsonString);
            } catch (e) {
                report.errors.push(`[${fileName}] Invalid JSON in ${blockName}: ${e}`);
            }
        }

        // RULE 2: Cover Block Overlay (Fix for "Attempt Recovery")
        if (content.includes('wp:cover')) {
            // Check if overlayColor is missing but text is white/light?
            // Conservative check: If verify it has SOME overlay settings if it has text.
            // For now, just warn if we see a cover block without explicitly "overlayColor"
            // Actually, let's just ensure we don't have empty attrs like {} if it's a critical block.
            if (content.includes('wp:cover {}')) {
                report.warnings.push(`[${fileName}] Cover block has empty attributes. Ensure overlayColor is set for contrast.`);
            }
        }

        // RULE 2b: Cover Block dimRatio Consistency
        // WP rounds dimRatio to nearest 10 for the class: Math.round(dimRatio / 10) * 10
        const coverDimRegex = /<!--\s*wp:cover\s+\{[^}]*"dimRatio"\s*:\s*(\d+)[^}]*\}\s*-->/g;
        let coverDimMatch;
        while ((coverDimMatch = coverDimRegex.exec(content)) !== null) {
            const dimRatio = parseInt(coverDimMatch[1]);
            const rounded = Math.round(dimRatio / 10) * 10;
            const afterComment = content.substring(coverDimMatch.index, coverDimMatch.index + 1000);
            const dimClassMatch = afterComment.match(/has-background-dim-(\d+)/);
            if (dimClassMatch) {
                const dimClass = parseInt(dimClassMatch[1]);
                if (rounded !== dimClass) {
                    report.errors.push(
                        `[${fileName}] Cover block dimRatio mismatch: JSON says ${dimRatio} (rounds to ${rounded}), HTML class says ${dimClass}. ` +
                        `Expected has-background-dim-${rounded}.`
                    );
                }
            }
        }

        // RULE 2c: Cover Block must NOT have "has-background" class on outer div
        // (has-background is for wp:group blocks with backgroundColor, not wp:cover)
        const coverHasBgRegex = /<!--\s*wp:cover\s+\{[^]*?\}\s*-->\s*\n\s*<div[^>]*class="([^"]*)"/g;
        let coverHasBgMatch;
        while ((coverHasBgMatch = coverHasBgRegex.exec(content)) !== null) {
            const classes = coverHasBgMatch[1];
            if (/\bhas-background\b/.test(classes) && !/\bhas-background-dim/.test(classes)) {
                report.errors.push(
                    `[${fileName}] Cover block div has "has-background" class which is invalid for wp:cover. ` +
                    `Remove it (has-background is only for wp:group blocks with backgroundColor).`
                );
            }
        }

        // RULE 2d: Cover Block with contentPosition must have has-custom-content-position class
        // When contentPosition is set to anything other than "center center", WP's save()
        // adds has-custom-content-position to the outer div. Missing it causes "Attempt Recovery".
        const coverPosRegex = /<!--\s*wp:cover\s+\{[^}]*"contentPosition"\s*:\s*"([^"]+)"[^}]*\}\s*-->\s*\n\s*<div[^>]*class="([^"]*)"/g;
        let coverPosMatch;
        while ((coverPosMatch = coverPosRegex.exec(content)) !== null) {
            const position = coverPosMatch[1];
            const classes = coverPosMatch[2];
            if (position !== 'center center' && !/\bhas-custom-content-position\b/.test(classes)) {
                report.errors.push(
                    `[${fileName}] Cover block with contentPosition "${position}" is missing ` +
                    `"has-custom-content-position" class on outer div.`
                );
            }
        }

        // RULE 2e: Cover Block img must NOT have style="object-fit:cover"
        // WP's save() does not produce inline object-fit on the img — it uses data-object-fit
        // and the CSS stylesheet applies the actual style. Having it inline causes validation failure.
        const coverImgStyleRegex = /<img[^>]*class="wp-block-cover__image-background[^"]*"[^>]*style="object-fit:cover"[^>]*\/>/g;
        let coverImgStyleMatch;
        while ((coverImgStyleMatch = coverImgStyleRegex.exec(content)) !== null) {
            report.errors.push(
                `[${fileName}] Cover block <img> has style="object-fit:cover" which WP does not produce. ` +
                `Remove it — only data-object-fit="cover" should remain.`
            );
        }

        // RULE 3: Button Structure
        // wp:button must be inside wp:buttons (Visual check, hard to regex perfectly without parse)
        // Simple check: if we see wp:button but NOT wp:buttons in the file, that's sus (though maybe nested in another file).
        // Skip for now to avoid false positives.

        // RULE 4: Navigation
        // Warn if raw <a> tags are used outside of expected areas.
        // This is hard to enforce strictly without a parser.

        // RULE 5: PHP Open Tags in HTML files
        if (filePath.endsWith('.html') && content.includes('<?php')) {
            report.errors.push(`[${fileName}] PHP tags found in .html template. This will not render.`);
        }

        // RULE 6: img tags in wp:image blocks must not have class attribute
        // (wp:cover img tags CAN have class="wp-block-cover__image-background")
        const imgClassInImageBlock = /<figure class="wp-block-image[^"]*"[^>]*><img[^>]*\sclass=/gi;
        let imgClassMatch;
        while ((imgClassMatch = imgClassInImageBlock.exec(content)) !== null) {
            report.errors.push(`[${fileName}] <img> inside wp:image has class attribute — move classes to <figure>`);
        }

        // RULE 7: img tags must not have border-radius or box-shadow styles
        // (aspect-ratio and object-fit are allowed per WP 6.3+)
        const imgBorderStyle = /<img[^>]*style="[^"]*(?:border-radius|box-shadow)/gi;
        let imgStyleMatch;
        while ((imgStyleMatch = imgBorderStyle.exec(content)) !== null) {
            report.errors.push(`[${fileName}] <img> has border-radius or box-shadow in style — move to <figure>`);
        }

        // RULE 8: No unreplaced placeholders
        const unreplacedPlaceholder = /\{\{[A-Z_]+[0-9]*\}\}/g;
        let placeholderMatch;
        while ((placeholderMatch = unreplacedPlaceholder.exec(content)) !== null) {
            report.errors.push(`[${fileName}] Unreplaced placeholder found: ${placeholderMatch[0]}`);
        }
    }
}
