
import React from 'react';

interface FontStylePreviewProps {
    fontPairId: string;
    className?: string;
}

export default function FontStylePreview({ fontPairId, className = '' }: FontStylePreviewProps) {
    // Map fontPairId to actual font families for preview
    // This is a simplified mapping for the UI preview.
    // In a real app, this might come from a font registry.

    const getFontStyles = (id: string) => {
        switch (id) {
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
    };

    const styles = getFontStyles(fontPairId);

    return (
        <div className={`rounded-lg border border-neutral-100 bg-white p-4 shadow-sm ${className}`}>
            <div className="space-y-2">
                <h4
                    className="text-xl font-bold text-neutral-900"
                    style={{ fontFamily: styles.heading }}
                >
                    The quick brown fox
                </h4>
                <p
                    className="text-sm text-neutral-600 leading-relaxed"
                    style={{ fontFamily: styles.body }}
                >
                    Jumps over the lazy dog. This is a preview of the body text style for the selected font pairing.
                </p>
            </div>
            <div className="mt-3 text-xs text-neutral-400 font-mono">
                {fontPairId}
            </div>
        </div>
    );
}
