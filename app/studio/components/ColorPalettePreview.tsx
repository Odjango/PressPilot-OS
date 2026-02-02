
import React from 'react';
import { getPaletteById } from '@/lib/theme/palettes';

interface ColorPalettePreviewProps {
    paletteId: string;
    className?: string;
}

export default function ColorPalettePreview({ paletteId, className = '' }: ColorPalettePreviewProps) {
    const palette = getPaletteById(paletteId);

    if (!palette) {
        return (
            <div className={`flex gap-1 ${className}`}>
                <div className="h-6 w-6 rounded-full bg-neutral-200" />
                <div className="h-6 w-6 rounded-full bg-neutral-200" />
                <div className="h-6 w-6 rounded-full bg-neutral-200" />
                <div className="h-6 w-6 rounded-full bg-neutral-200" />
                <div className="h-6 w-6 rounded-full bg-neutral-200" />
            </div>
        );
    }

    // TT4-aligned color display - show distinctive accent colors first
    // Actual slugs in PALETTES: base, base-2, contrast, accent, accent-3, accent-4

    const getColor = (slug: string) => palette.colors.find(c => c.slug === slug)?.color || '#cccccc';

    // Show the most visually distinctive colors (accents) first, then base
    const previewColors = [
        { slug: 'accent', color: getColor('accent') },        // Primary accent (bold color)
        { slug: 'accent-4', color: getColor('accent-4') },    // Secondary/pop color
        { slug: 'accent-3', color: getColor('accent-3') },    // Dark accent
        { slug: 'base', color: getColor('base') },            // Background
    ];

    return (
        <div className={`flex gap-1 ${className}`} title={palette.label}>
            {previewColors.map((c) => (
                <div
                    key={c.slug}
                    className="h-6 w-6 rounded-full border border-black/5 shadow-sm"
                    style={{ backgroundColor: c.color }}
                    title={c.slug}
                />
            ))}
        </div>
    );
}
