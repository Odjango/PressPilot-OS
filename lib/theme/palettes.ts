
export interface PaletteColor {
    slug: string;
    color: string;
    name: string;
}

export interface Palette {
    id: string;
    label: string;
    colors: PaletteColor[];
}

export const PALETTES: Palette[] = [
    {
        id: 'saas-bright',
        label: 'SaaS Bright',
        colors: [
            { slug: 'background', color: '#f8fafc', name: 'Background' },
            { slug: 'soft-bg', color: '#ffffff', name: 'Soft background' },
            { slug: 'foreground', color: '#0f172a', name: 'Foreground' },
            { slug: 'muted', color: '#64748b', name: 'Muted' },
            { slug: 'border', color: '#e2e8f0', name: 'Border' },
            { slug: 'primary', color: '#3b82f6', name: 'Primary' },
            { slug: 'accent', color: '#a855f7', name: 'Accent' },
            { slug: 'warning', color: '#f97316', name: 'Warning' },
            { slug: 'success', color: '#22c55e', name: 'Success' }
        ]
    },
    {
        id: 'local-biz-soft',
        label: 'Local Biz Soft',
        colors: [
            { slug: 'background', color: '#fdfaf4', name: 'Background' },
            { slug: 'soft-bg', color: '#ffffff', name: 'Soft background' },
            { slug: 'foreground', color: '#1f2937', name: 'Foreground' },
            { slug: 'muted', color: '#6b7280', name: 'Muted' },
            { slug: 'border', color: '#e7dfd2', name: 'Border' },
            { slug: 'primary', color: '#0d9488', name: 'Primary' },
            { slug: 'accent', color: '#f4a261', name: 'Accent' },
            { slug: 'warning', color: '#f97316', name: 'Warning' },
            { slug: 'success', color: '#16a34a', name: 'Success' }
        ]
    },
    {
        id: 'restaurant-soft',
        label: 'Restaurant Soft',
        colors: [
            { slug: 'background', color: '#fffaf5', name: 'Background' },
            { slug: 'soft-bg', color: '#fff7ed', name: 'Soft background' },
            { slug: 'foreground', color: '#1f1b16', name: 'Foreground' },
            { slug: 'muted', color: '#6b4f4f', name: 'Muted' },
            { slug: 'border', color: '#f4ded0', name: 'Border' },
            { slug: 'primary', color: '#b45309', name: 'Primary' },
            { slug: 'accent', color: '#7c2d12', name: 'Accent' },
            { slug: 'warning', color: '#f97316', name: 'Warning' },
            { slug: 'success', color: '#16a34a', name: 'Success' }
        ]
    },
    {
        id: 'ecom-bold',
        label: 'E-Commerce Bold',
        colors: [
            { slug: 'background', color: '#ffffff', name: 'Background' },
            { slug: 'soft-bg', color: '#f9fafb', name: 'Soft background' },
            { slug: 'foreground', color: '#111827', name: 'Foreground' },
            { slug: 'muted', color: '#6b7280', name: 'Muted' },
            { slug: 'border', color: '#d4d4d8', name: 'Border' },
            { slug: 'primary', color: '#059669', name: 'Primary' },
            { slug: 'accent', color: '#0f172a', name: 'Accent' },
            { slug: 'warning', color: '#f97316', name: 'Warning' },
            { slug: 'success', color: '#16a34a', name: 'Success' }
        ]
    }
];

export function getPaletteById(id: string): Palette | undefined {
    return PALETTES.find(p => p.id === id);
}
