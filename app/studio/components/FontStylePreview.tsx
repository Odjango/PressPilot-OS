
import React from 'react';

interface FontStylePreviewProps {
    fontPairId: string;
    className?: string;
}

/**
 * Get font family CSS values for a given font profile ID.
 * Supports both TT4 profiles and legacy font IDs.
 */
export function getFontStyles(id: string): { heading: string; body: string } {
    switch (id) {
        // TT4 font profiles (match lib/theme/palettes.ts FONT_PROFILE_OPTIONS)
        case 'elegant':
            return {
                heading: '"Cardo", "Georgia", "Times New Roman", serif',
                body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
            };
        case 'modern':
            return {
                heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
            };
        case 'bold':
            return {
                heading: '"Jost", "Arial Black", "Helvetica Neue", sans-serif',
                body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
            };
        case 'friendly':
            return {
                heading: '"Instrument Sans", "Trebuchet MS", "Helvetica Neue", sans-serif',
                body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
            };
        // Legacy font profiles (backwards compatibility)
        case 'serif-display':
            return {
                heading: '"Playfair Display", "Times New Roman", serif',
                body: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
            };
        case 'system-mono':
            return {
                heading: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                body: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
            };
        case 'system-sans':
        default:
            return {
                heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                body: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
            };
    }
}

export default function FontStylePreview({ fontPairId, className = '' }: FontStylePreviewProps) {
    const styles = getFontStyles(fontPairId);

    return (
        <div className={`rounded-lg border border-slate-700 bg-slate-800 p-4 ${className}`}>
            <div className="space-y-2">
                <h4
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: styles.heading }}
                >
                    The quick brown fox
                </h4>
                <p
                    className="text-sm text-slate-400 leading-relaxed"
                    style={{ fontFamily: styles.body }}
                >
                    Jumps over the lazy dog. This is a preview of the body text style for the selected font pairing.
                </p>
            </div>
            <div className="mt-3 text-xs text-slate-600 font-mono">
                {fontPairId}
            </div>
        </div>
    );
}
