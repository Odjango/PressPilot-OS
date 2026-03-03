import fs from 'fs-extra';
import path from 'path';
import { getThemePalette } from '../utils/theme-palette';

export interface AccessibilityValidationResult {
    valid: boolean;
    errors: { message: string }[];
    warnings: { message: string }[];
}

interface HeadingEntry {
    level: number;
    text: string;
}

const IMG_TAG_REGEX = /<img\s+[^>]*>/gi;
const ALT_ATTR_REGEX = /\salt\s*=\s*"([^"]*)"/i;
const BUTTON_BLOCK_REGEX = /<!--\s*wp:button[^>]*-->[\s\S]*?<!--\s*\/wp:button\s*-->/gi;
const HEADING_REGEX = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
const LINK_REGEX = /<a\s+[^>]*>([\s\S]*?)<\/a>/gi;
const COLOR_HEX_REGEX = /#[0-9a-fA-F]{6}/g;

const GENERIC_LINK_TEXT = new Set(['click here', 'read more', 'learn more', 'more']);

function stripHtml(value: string): string {
    return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function getAllHtmlFiles(dir: string): string[] {
    if (!fs.pathExistsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...getAllHtmlFiles(full));
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            files.push(full);
        }
    }
    return files;
}

function extractHeadings(content: string): HeadingEntry[] {
    const headings: HeadingEntry[] = [];
    let match: RegExpExecArray | null;
    HEADING_REGEX.lastIndex = 0;
    while ((match = HEADING_REGEX.exec(content)) !== null) {
        headings.push({
            level: Number(match[1]),
            text: stripHtml(match[2] || ''),
        });
    }
    return headings;
}

function checkHeadings(headings: HeadingEntry[], filename: string, errors: { message: string }[], warnings: { message: string }[]) {
    let lastLevel: number | null = null;
    let h1Count = 0;

    for (const heading of headings) {
        if (!heading.text) {
            errors.push({ message: `[${filename}] Empty heading (h${heading.level}) found.` });
        }
        if (heading.level === 1) {
            h1Count += 1;
        }
        if (lastLevel !== null && heading.level > lastLevel + 1) {
            warnings.push({
                message: `[${filename}] Heading level skipped from h${lastLevel} to h${heading.level}.`,
            });
        }
        lastLevel = heading.level;
    }

    if (h1Count > 1) {
        warnings.push({ message: `[${filename}] Multiple H1 headings found (${h1Count}).` });
    }
}

function parseLinks(content: string, filename: string, warnings: { message: string }[]) {
    let match: RegExpExecArray | null;
    LINK_REGEX.lastIndex = 0;
    while ((match = LINK_REGEX.exec(content)) !== null) {
        const text = stripHtml(match[1] || '').toLowerCase();
        if (text && GENERIC_LINK_TEXT.has(text)) {
            warnings.push({ message: `[${filename}] Link text "${text}" is too generic.` });
        }
    }
}

function parseImages(content: string, filename: string, errors: { message: string }[]) {
    let match: RegExpExecArray | null;
    IMG_TAG_REGEX.lastIndex = 0;
    while ((match = IMG_TAG_REGEX.exec(content)) !== null) {
        const imgTag = match[0];
        const altMatch = imgTag.match(ALT_ATTR_REGEX);
        if (!altMatch) {
            errors.push({ message: `[${filename}] <img> tag missing alt attribute.` });
        }
    }
}

function parseButtons(content: string, filename: string, errors: { message: string }[]) {
    let match: RegExpExecArray | null;
    BUTTON_BLOCK_REGEX.lastIndex = 0;
    while ((match = BUTTON_BLOCK_REGEX.exec(content)) !== null) {
        const block = match[0];
        const text = stripHtml(block);
        if (!text) {
            errors.push({ message: `[${filename}] Button block has no visible text content.` });
        }
    }
}

function hexToRgb(value: string): { r: number; g: number; b: number } | null {
    const cleaned = value.replace('#', '');
    if (cleaned.length !== 6) return null;
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return { r, g, b };
}

function channelToLinear(value: number): number {
    const normalized = value / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
    const rLin = channelToLinear(r);
    const gLin = channelToLinear(g);
    const bLin = channelToLinear(b);
    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

function contrastRatio(colorA: string, colorB: string): number | null {
    const rgbA = hexToRgb(colorA);
    const rgbB = hexToRgb(colorB);
    if (!rgbA || !rgbB) return null;
    const lumA = relativeLuminance(rgbA);
    const lumB = relativeLuminance(rgbB);
    const lighter = Math.max(lumA, lumB);
    const darker = Math.min(lumA, lumB);
    return (lighter + 0.05) / (darker + 0.05);
}

function checkColorContrast(palette: Array<{ slug: string; color: string }>, warnings: { message: string }[]) {
    const paletteMap = new Map(palette.map((entry) => [entry.slug, entry.color]));
    const background = paletteMap.get('background') || '#ffffff';
    const foreground = paletteMap.get('foreground') || '#000000';
    const primary = paletteMap.get('primary');

    const baseRatio = contrastRatio(foreground, background);
    if (baseRatio !== null && baseRatio < 4.5) {
        warnings.push({
            message: `Foreground (${foreground}) on background (${background}) contrast ratio ${baseRatio.toFixed(2)}:1 is below 4.5:1.`,
        });
    }

    if (primary) {
        const primaryRatio = contrastRatio(primary, background);
        if (primaryRatio !== null && primaryRatio < 4.5) {
            warnings.push({
                message: `Primary (${primary}) on background (${background}) contrast ratio ${primaryRatio.toFixed(2)}:1 is below 4.5:1.`,
            });
        }
    }
}

function checkInlineColors(content: string, filename: string, warnings: { message: string }[]) {
    const hexes = content.match(COLOR_HEX_REGEX) || [];
    if (hexes.length < 2) return;
    const unique = Array.from(new Set(hexes));
    if (unique.length < 2) return;
    const ratio = contrastRatio(unique[0], unique[1]);
    if (ratio !== null && ratio < 4.5) {
        warnings.push({
            message: `[${filename}] Inline color contrast between ${unique[0]} and ${unique[1]} is ${ratio.toFixed(2)}:1 (<4.5:1).`,
        });
    }
}

export class AccessibilityValidator {
    static async validate(themeDir: string): Promise<AccessibilityValidationResult> {
        const errors: { message: string }[] = [];
        const warnings: { message: string }[] = [];

        const htmlFiles = getAllHtmlFiles(themeDir);
        for (const file of htmlFiles) {
            const content = await fs.readFile(file, 'utf8');
            const rel = path.relative(themeDir, file);

            parseImages(content, rel, errors);
            parseButtons(content, rel, errors);
            parseLinks(content, rel, warnings);
            checkHeadings(extractHeadings(content), rel, errors, warnings);
            checkInlineColors(content, rel, warnings);
        }

        const palette = await getThemePalette(themeDir);
        if (palette.length > 0) {
            checkColorContrast(palette, warnings);
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
}
