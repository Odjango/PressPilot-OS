import fs from 'fs-extra';
import path from 'path';
import { GeneratorData, BaseTheme } from '../types';

export interface ThemeCatalogEntry {
    coreId: string;
    label: string;
    baseTheme: BaseTheme;
    vertical: string;
    style: string;
    layout: string;
    features: string[];
    bestFor: string[];
}

export interface ThemeSelectionResult {
    coreThemeId: string;
    baseTheme: BaseTheme;
    reasoning: string;
}

export class ThemeSelector {
    private catalogPath: string;

    constructor(rootDir: string) {
        this.catalogPath = path.join(rootDir, 'proven-cores', 'cores.json');
    }

    /**
     * Internal implementation of theme selection
     */
    async selectTheme(data: GeneratorData): Promise<ThemeSelectionResult> {
        const vertical = (data.industry || 'general').toLowerCase();
        console.log(`[ThemeSelector] Selecting theme with Vertical Focus: ${vertical}`);

        if (!await fs.pathExists(this.catalogPath)) {
            return {
                coreThemeId: 'twentytwentyfour/general',
                baseTheme: 'twentytwentyfour',
                reasoning: 'Catalog missing, falling back to TT4.'
            };
        }

        const catalog = await fs.readJson(this.catalogPath);
        const themes: ThemeCatalogEntry[] = catalog.themes;

        if (!themes || themes.length === 0) {
            return {
                coreThemeId: 'twentytwentyfour/general',
                baseTheme: 'twentytwentyfour',
                reasoning: 'Catalog is empty, falling back to TT4.'
            };
        }

        // 1. VERTICAL EXTRACTION MAP (Deterministic Core Logic)
        let targetBase: BaseTheme | null = null;

        if (vertical === 'restaurant' || vertical === 'cafe' || vertical === 'restaurant_cafe') {
            // Restaurant brandStyle routing: playful → Tove, modern → Frost
            const brandStyle = data.brandStyle || 'playful';
            if (brandStyle === 'modern') {
                targetBase = 'frost';
                console.log(`[ThemeSelector] Restaurant + Modern brandStyle -> Frost`);
            } else {
                targetBase = 'tove';
                console.log(`[ThemeSelector] Restaurant + Playful brandStyle -> Tove`);
            }
        } else if (vertical === 'portfolio' || vertical === 'agency' || vertical === 'creative') {
            targetBase = 'frost';
        } else if (vertical === 'ecommerce' || vertical === 'shop') {
            targetBase = 'ollie'; // Ollie has cleaner shop grid placeholders in our vault
        } else if (vertical === 'saas' || vertical === 'technology' || vertical === 'startup') {
            targetBase = 'ollie';
        } else if (vertical === 'business' || vertical === 'corporate' || vertical === 'service') {
            targetBase = 'blockbase';
        }

        // 2. Resolve specific core from the target base
        let selected = themes.find(t => t.baseTheme === targetBase && (t.vertical === vertical || t.vertical === 'general'));

        // Fallback if target base has nothing for this exact vertical
        if (!selected && targetBase) {
            selected = themes.find(t => t.baseTheme === targetBase);
        }

        // Global fallback if everything fails
        if (!selected) {
            console.warn(`[ThemeSelector] No theme found for vertical '${vertical}' or target base. Falling back to TT4.`);
            selected = themes.find(t => t.baseTheme === 'twentytwentyfour') || themes[0];
        }

        console.log(
            `[ThemeSelector] Strategy (Vertical Focus): ${selected.coreId} (base: ${selected.baseTheme})`
        );

        return {
            coreThemeId: selected.coreId,
            baseTheme: selected.baseTheme,
            reasoning: `Applied Vertical Extraction Strategy: Industry '${vertical}' mapped to canonical Vault theme '${selected.baseTheme}'.`
        };
    }
}

/**
 * Convenience function for the Core Theme Pipeline
 */
export async function selectTheme(userProfile: GeneratorData, rootDir: string = process.cwd()): Promise<ThemeSelectionResult> {
    const selector = new ThemeSelector(rootDir);
    return await selector.selectTheme(userProfile);
}
