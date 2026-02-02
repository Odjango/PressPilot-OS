/**
 * ContentValidator - Post-Generation Quality Gate
 *
 * Phase 13 - Best Practices: Scans generated theme content for forbidden
 * demo strings that should have been replaced with user data.
 *
 * Usage:
 *   const result = ContentValidator.validateContent(htmlContent, 'front-page.html');
 *   if (!result.valid) {
 *     console.error('Validation failed:', result.errors);
 *   }
 */

import * as fs from 'fs-extra';
import * as path from 'path';

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Demo content strings that MUST NOT appear in production themes.
 * These are hardcoded brand names and placeholders from base themes.
 */
export const FORBIDDEN_STRINGS = [
    // ============================================
    // Tove Base Theme Demo Content (Swedish Café)
    // ============================================
    'Niofika Café',
    'Niofika',
    'hammarby@niofika.se',
    '08-123 45 67',
    'Hammarby Kaj 10',
    'Hammarby Sjöstad',
    '120 32 Stockholm',
    'Coffee Snob',

    // ============================================
    // TwentyTwentyFour / Études Demo Content
    // ============================================
    'Études',
    'étude',
    'pioneering firm',
    'architectural excellence',

    // ============================================
    // PressPilot Internal Fallback Placeholders
    // (These indicate data flow issues)
    // ============================================
    'contact@presspilot.com',
    '+1 555-0199',
    '123 Innovation Dr',
    'Tech City, TC 90210',

    // ============================================
    // Generic Placeholder Content
    // ============================================
    'Lorem ipsum',
    'dolor sit amet',
    'example.com',
    'yourwebsite.com',
    'your-email@example.com',
];

/**
 * Patterns that indicate unreplaced template slots.
 * These should never appear in final output.
 */
export const UNREPLACED_SLOT_PATTERNS = [
    /\{\{[A-Z][A-Z0-9_]+\}\}/g,   // {{CONTACT_EMAIL}}, {{HERO_TITLE}}
    /\{\{[a-z][a-z0-9_]+\}\}/g,   // {{contact_email}}, {{hero_title}}
];

/**
 * Warning strings - not errors, but indicate potential issues
 */
export const WARNING_STRINGS = [
    'info@yourbusiness.com',
    '(555) 123-4567',
    '123 Main Street',
    'Your City',
    'Our Business',
    'Happy Customer', // Generic testimonial fallback
];

export class ContentValidator {
    /**
     * Validate a single content string for forbidden demo content
     */
    static validateContent(content: string, filename: string): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check for forbidden demo strings
        for (const forbidden of FORBIDDEN_STRINGS) {
            if (content.includes(forbidden)) {
                errors.push(
                    `[ContentValidator] Forbidden demo string in ${filename}: "${forbidden}"`
                );
            }
        }

        // Check for unreplaced slot patterns
        for (const pattern of UNREPLACED_SLOT_PATTERNS) {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
                // Filter out common false positives
                const realMatches = matches.filter(m =>
                    !m.includes('wp:') && // WordPress block attributes
                    !m.includes('preset|') // CSS preset values
                );
                if (realMatches.length > 0) {
                    errors.push(
                        `[ContentValidator] Unreplaced slots in ${filename}: ${[...new Set(realMatches)].join(', ')}`
                    );
                }
            }
        }

        // Check for warning strings (not blocking, but logged)
        for (const warning of WARNING_STRINGS) {
            if (content.includes(warning)) {
                warnings.push(
                    `[ContentValidator] Generic fallback in ${filename}: "${warning}" - user data may be missing`
                );
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate an entire theme directory
     */
    static async validateThemeDirectory(themeDir: string): Promise<ValidationResult> {
        const allErrors: string[] = [];
        const allWarnings: string[] = [];

        // Key files to validate
        const filesToCheck = [
            'parts/header.html',
            'parts/footer.html',
            'templates/front-page.html',
            'templates/index.html',
            'templates/page.html',
            'templates/single.html',
        ];

        for (const file of filesToCheck) {
            const filePath = path.join(themeDir, file);
            if (await fs.pathExists(filePath)) {
                const content = await fs.readFile(filePath, 'utf8');
                const result = this.validateContent(content, file);
                allErrors.push(...result.errors);
                allWarnings.push(...result.warnings);
            }
        }

        // Also check pattern files if they exist
        const patternsDir = path.join(themeDir, 'patterns');
        if (await fs.pathExists(patternsDir)) {
            const patternFiles = await fs.readdir(patternsDir);
            for (const patternFile of patternFiles) {
                if (patternFile.endsWith('.html') || patternFile.endsWith('.php')) {
                    const content = await fs.readFile(path.join(patternsDir, patternFile), 'utf8');
                    const result = this.validateContent(content, `patterns/${patternFile}`);
                    allErrors.push(...result.errors);
                    allWarnings.push(...result.warnings);
                }
            }
        }

        // Log results
        if (allErrors.length > 0) {
            console.error(`[ContentValidator] VALIDATION FAILED: ${allErrors.length} error(s) found`);
            allErrors.forEach(err => console.error(err));
        } else {
            console.log(`[ContentValidator] Validation passed for ${themeDir}`);
        }

        if (allWarnings.length > 0) {
            console.warn(`[ContentValidator] ${allWarnings.length} warning(s):`);
            allWarnings.forEach(warn => console.warn(warn));
        }

        return {
            valid: allErrors.length === 0,
            errors: allErrors,
            warnings: allWarnings
        };
    }

    /**
     * Quick check for a specific forbidden string
     */
    static containsForbiddenContent(content: string): boolean {
        for (const forbidden of FORBIDDEN_STRINGS) {
            if (content.includes(forbidden)) {
                return true;
            }
        }
        return false;
    }
}
