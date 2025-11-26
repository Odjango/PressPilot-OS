
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

    // We want to show: Primary, Secondary (Accent), Background, Foreground, Muted
    // Mapping:
    // Primary -> primary
    // Secondary -> accent
    // Background -> background
    // Foreground -> foreground
    // Muted -> muted

    const getColor = (slug: string) => palette.colors.find(c => c.slug === slug)?.color || '#cccccc';

    const previewColors = [
        { slug: 'primary', color: getColor('primary') },
        { slug: 'accent', color: getColor('accent') },
        { slug: 'background', color: getColor('background') },
        { slug: 'foreground', color: getColor('foreground') },
        { slug: 'muted', color: getColor('muted') },
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
