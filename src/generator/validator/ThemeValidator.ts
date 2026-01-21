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
    }
}
