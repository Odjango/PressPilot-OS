
/**
 * PHP String Escaper for PressPilot
 * Ensures that user-generated strings injected into PHP files
 * don't break syntax (e.g., single quotes in esc_html_e).
 */

export class PhpEscaper {
    /**
     * Escapes a string for use within a single-quoted PHP string.
     * In PHP single-quoted strings, only ' and \ need to be escaped.
     */
    static escapeSingleQuoted(str: string): string {
        if (!str) return '';
        // Escape backslashes first, then single quotes
        return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }

    /**
     * Escapes a string for use within a double-quoted PHP string.
     */
    static escapeDoubleQuoted(str: string): string {
        if (!str) return '';
        return str
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\$/g, '\\$');
    }
}
