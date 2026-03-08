/**
 * BlockConfigValidator.ts
 *
 * Validates that every WordPress block in an HTML template file has a
 * COMPLETE configuration — all required attributes present and all
 * variation/service values valid.
 *
 * This fills the gap between:
 *   • BlockValidator  — checks block *names* are allowed
 *   • TokenValidator  — checks design token usage
 *   • BlockConfigValidator — checks block *attributes* are complete
 *
 * Two checkpoints call this validator:
 *   1. PatternInjector.validateAndWrite() — pre-file-write (logs early warnings)
 *   2. bin/generate.ts  Step 2            — pre-ZIP gate (blocks download on CRITICAL)
 */

import { BLOCK_ATTRIBUTE_SCHEMA } from './blocks/BlockAttributeSchema';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BlockConfigIssue {
    /** Full block name, e.g. "core/cover" */
    block: string;
    /** Human-readable description of what is wrong */
    issue: string;
    /**
     * critical — missing required attr; will cause WP "Attempt Recovery" crash
     * error    — invalid value (wrong service name, out-of-range level, etc.)
     * warning  — missing recommended attr (accessibility, UX degradation)
     */
    severity: 'critical' | 'error' | 'warning';
}

export interface BlockConfigResult {
    /** false when any 'critical' issue exists */
    valid: boolean;
    /** All issues found (critical + error + warning) */
    issues: BlockConfigIssue[];
    /** Human-readable summary, set only when valid=false */
    error?: string;
}

// ── Regex ──────────────────────────────────────────────────────────────────────

/**
 * Matches opening block comments that carry JSON attributes:
 *   <!-- wp:cover {"dimRatio":50} -->
 *   <!-- wp:core/social-link {"service":"twitter","url":"https://..."} /-->
 *
 * Groups:
 *   1 — raw block identifier (may be "namespace/name" or just "name")
 *   2 — JSON string (may be absent for self-closing no-attr blocks)
 */
const BLOCK_OPEN_REGEX = /<!--\s*wp:([\w/-]+)(?:\s+({[^}]*(?:}[^>]*?)?}))?\s*\/?-->/g;

// ── Validator ──────────────────────────────────────────────────────────────────

export class BlockConfigValidator {

    /**
     * Parse all WordPress block opening comments in `htmlContent` and validate
     * that each block's JSON attributes satisfy the requirements in
     * BlockAttributeSchema.
     *
     * @param htmlContent  Raw HTML/template string to validate
     * @param filename     File name used in issue messages (for readability)
     */
    static validate(htmlContent: string, filename: string): BlockConfigResult {
        const issues: BlockConfigIssue[] = [];

        let match: RegExpExecArray | null;
        BLOCK_OPEN_REGEX.lastIndex = 0; // reset stateful regex

        while ((match = BLOCK_OPEN_REGEX.exec(htmlContent)) !== null) {
            const rawIdentifier = match[1]; // e.g. "cover" or "woocommerce/cart"
            const jsonString = match[2];    // may be undefined

            // Normalise to full name: "cover" → "core/cover"
            const fullName = rawIdentifier.includes('/')
                ? rawIdentifier
                : `core/${rawIdentifier}`;

            // Only validate blocks that have a schema entry
            const spec = BLOCK_ATTRIBUTE_SCHEMA[fullName];
            if (!spec) continue;

            // Parse the block's JSON attributes (or treat as empty object)
            let attrs: Record<string, unknown> = {};
            if (jsonString) {
                try {
                    attrs = JSON.parse(jsonString);
                } catch {
                    // Malformed JSON is caught by ThemeValidator RULE 1 — skip here
                    continue;
                }
            }

            // ── 1. Required attributes ────────────────────────────────────────
            for (const requiredAttr of spec.required) {
                if (!(requiredAttr in attrs)) {
                    issues.push({
                        block: fullName,
                        issue: `[${filename}] Missing required attribute "${requiredAttr}" on ${fullName}`,
                        severity: 'critical',
                    });
                }
            }

            // ── 2. Valid-value constraints ────────────────────────────────────
            if (spec.validValues) {
                for (const [attr, allowedValues] of Object.entries(spec.validValues)) {
                    if (!(attr in attrs)) continue; // already caught as required above if needed

                    const actualValue = String(attrs[attr]);
                    if (!allowedValues.includes(actualValue)) {
                        issues.push({
                            block: fullName,
                            issue: `[${filename}] Invalid value "${actualValue}" for attribute "${attr}" on ${fullName}. Allowed: ${allowedValues.join(', ')}`,
                            severity: 'error',
                        });
                    }
                }
            }

            // ── 3. Recommended attributes ─────────────────────────────────────
            for (const recAttr of spec.recommended) {
                if (!(recAttr in attrs)) {
                    issues.push({
                        block: fullName,
                        issue: `[${filename}] Missing recommended attribute "${recAttr}" on ${fullName}`,
                        severity: 'warning',
                    });
                }
            }

            // ── 4. Style variation check ──────────────────────────────────────
            // If className contains "is-style-X", verify X is a known variation
            if (spec.knownStyleVariations && spec.knownStyleVariations.length > 0) {
                const className = typeof attrs['className'] === 'string' ? attrs['className'] : '';
                const styleVariantMatch = className.match(/\bis-style-([\w-]+)\b/);
                if (styleVariantMatch) {
                    const variant = styleVariantMatch[1];
                    if (!spec.knownStyleVariations.includes(variant)) {
                        issues.push({
                            block: fullName,
                            issue: `[${filename}] Unknown style variation "is-style-${variant}" on ${fullName}. Known variations: ${spec.knownStyleVariations.join(', ')}`,
                            severity: 'warning',
                        });
                    }
                }
            }

            // ── 5. Special case: navigation block with no attrs and no children ─
            if (fullName === 'core/navigation') {
                const isSelfClosing = match[0].endsWith('/-->');
                const hasNoAttrs = Object.keys(attrs).length === 0;
                if (isSelfClosing && hasNoAttrs) {
                    issues.push({
                        block: fullName,
                        issue: `[${filename}] core/navigation is self-closing with no attributes and no children — navigation will be empty`,
                        severity: 'warning',
                    });
                }
            }
        }

        const criticalIssues = issues.filter(i => i.severity === 'critical');
        const valid = criticalIssues.length === 0;

        let error: string | undefined;
        if (!valid) {
            error = criticalIssues
                .map(i => i.issue)
                .join('; ');
        }

        return { valid, issues, error };
    }
}
