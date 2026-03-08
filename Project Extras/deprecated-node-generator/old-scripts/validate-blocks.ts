#!/usr/bin/env npx tsx
/**
 * validate-blocks.ts — Static analysis for WP block grammar errors in pattern source files.
 *
 * Catches three classes of bugs BEFORE they reach generated themes:
 * 1. class="wp-element-border" on <img> tags (should be on <figure>)
 * 2. border-radius or box-shadow on <img> style (should be on <figure>)
 * 3. Unreplaced {{PLACEHOLDER}} strings in non-library template files
 *
 * Usage: npx tsx scripts/validate-blocks.ts
 * Exit code 0 = clean, 1 = errors found
 */

import fs from 'fs';
import path from 'path';

const PATTERNS_DIR = path.resolve(__dirname, '../src/generator/patterns');

interface Violation {
    file: string;
    line: number;
    rule: string;
    text: string;
}

function scanFile(filePath: string): Violation[] {
    const violations: Violation[] = [];
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const relPath = path.relative(process.cwd(), filePath);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Rule 1: class="wp-element-border" on img tags
        if (/<img[^>]*class="wp-element-border"/.test(line)) {
            violations.push({
                file: relPath,
                line: lineNum,
                rule: 'img-class-wp-element-border',
                text: 'class="wp-element-border" found on <img> — move to <figure>'
            });
        }

        // Rule 2: border-radius or box-shadow in img style
        if (/<img[^>]*style="[^"]*(?:border-radius|box-shadow)/.test(line)) {
            violations.push({
                file: relPath,
                line: lineNum,
                rule: 'img-style-border',
                text: '<img> has border-radius or box-shadow — move to <figure>'
            });
        }

        // Rule 3: Unreplaced placeholders (skip library/ files which use them intentionally)
        if (!filePath.includes('/library/')) {
            const placeholderMatch = line.match(/\{\{[A-Z_]+[0-9]*\}\}/g);
            if (placeholderMatch) {
                for (const ph of placeholderMatch) {
                    violations.push({
                        file: relPath,
                        line: lineNum,
                        rule: 'unreplaced-placeholder',
                        text: `Unreplaced placeholder: ${ph}`
                    });
                }
            }
        }
    }

    return violations;
}

function walkDir(dir: string): string[] {
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...walkDir(fullPath));
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.html')) {
            results.push(fullPath);
        }
    }
    return results;
}

// Main
const files = walkDir(PATTERNS_DIR);
let totalViolations: Violation[] = [];

for (const file of files) {
    totalViolations.push(...scanFile(file));
}

if (totalViolations.length === 0) {
    console.log('✓ validate-blocks: 0 errors found across', files.length, 'files');
    process.exit(0);
} else {
    console.error(`✗ validate-blocks: ${totalViolations.length} error(s) found:\n`);
    for (const v of totalViolations) {
        console.error(`  ${v.file}:${v.line} [${v.rule}] ${v.text}`);
    }
    process.exit(1);
}
