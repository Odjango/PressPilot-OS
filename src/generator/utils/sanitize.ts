import path from 'path';

/**
 * Sanitizes a filename/path segment for safe filesystem usage.
 * Strips traversal, null bytes, separators, and unsafe characters.
 */
export function sanitizePath(filename: string): string {
    const raw = String(filename || '');
    const withoutNulls = raw.replace(/\0/g, '');
    const withoutTraversal = withoutNulls.replace(/\.\.(\/|\\)/g, '');
    const base = path.basename(withoutTraversal);

    const cleaned = base
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^\.+/, '')
        .replace(/^-+|-+$/g, '');

    return cleaned || 'safe-name';
}

/**
 * Sanitizes potentially unsafe user content before template/PHP embedding.
 * - Removes PHP open/close tags
 * - Removes null bytes
 * - Neutralizes constructor-template payloads
 * - HTML-escapes high-risk characters
 */
export function sanitizeForPHP(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    const raw = String(value);
    const withoutNulls = raw.replace(/\0/g, '');
    const withoutTraversal = withoutNulls.replace(/\.\.(\/|\\)+/g, '');
    const withoutPhpTags = withoutTraversal
        .replace(/<\?(?:php|=)?/gi, '')
        .replace(/\?>/g, '');
    const withoutCtorPayload = withoutPhpTags.replace(
        /\{\{\s*constructor\.constructor\([^)]*\)\(\)\s*\}\}/gi,
        '[blocked]'
    );
    const withoutTemplateBraces = withoutCtorPayload
        .replace(/\{\{/g, '')
        .replace(/\}\}/g, '');

    return withoutTemplateBraces
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Recursively sanitizes user-provided objects by applying sanitizeForPHP()
 * to all string leaves.
 */
export function sanitizeUserInput<T>(input: T): T {
    if (typeof input === 'string') {
        return sanitizeForPHP(input) as T;
    }

    if (Array.isArray(input)) {
        return input.map((item) => sanitizeUserInput(item)) as T;
    }

    if (input && typeof input === 'object') {
        const out: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
            out[key] = sanitizeUserInput(value);
        }
        return out as T;
    }

    return input;
}
