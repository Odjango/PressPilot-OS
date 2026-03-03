import fs from 'fs-extra';
import path from 'path';

export interface InputValidationResult {
    valid: boolean;
    errors: { field: string; message: string }[];
    warnings: { field: string; message: string }[];
}

const VALID_MODES = new Set(['standard', 'heavy']);
const VALID_BRAND_MODES = new Set(['modern', 'playful', 'bold', 'minimal']);

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

function isString(value: unknown): value is string {
    return typeof value === 'string';
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidSlug(value: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function isValidHexColor(value: string): boolean {
    return /^#[0-9a-fA-F]{6}$/.test(value);
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function getValidBaseThemes(): string[] {
    try {
        const coresPath = path.resolve(process.cwd(), 'proven-cores', 'cores.json');
        const coresJson = fs.readJsonSync(coresPath) as { cores?: { slug?: string }[] };
        return (coresJson.cores || [])
            .map(core => core.slug)
            .filter((slug): slug is string => typeof slug === 'string');
    } catch {
        return [];
    }
}

function isWritableDir(targetPath: string): boolean {
    try {
        fs.accessSync(targetPath, fs.constants.W_OK);
        return true;
    } catch {
        return false;
    }
}

export class InputValidator {
    static validate(input: Record<string, unknown>): InputValidationResult {
        const errors: { field: string; message: string }[] = [];
        const warnings: { field: string; message: string }[] = [];

        const validBases = getValidBaseThemes();

        if (!('base' in input)) {
            errors.push({ field: 'base', message: 'Missing required field.' });
        } else if (!isNonEmptyString(input.base)) {
            errors.push({ field: 'base', message: 'Base must be a non-empty string.' });
        } else if (!validBases.includes(input.base)) {
            errors.push({
                field: 'base',
                message: `Invalid base theme "${input.base}". Valid options: ${validBases.join(', ') || 'none found'}.`,
            });
        }

        if (!('mode' in input)) {
            errors.push({ field: 'mode', message: 'Missing required field.' });
        } else if (!isNonEmptyString(input.mode)) {
            errors.push({ field: 'mode', message: 'Mode must be a non-empty string.' });
        } else if (!VALID_MODES.has(input.mode)) {
            errors.push({ field: 'mode', message: 'Mode must be "standard" or "heavy".' });
        }

        if ('brandMode' in input && input.brandMode !== undefined) {
            if (!isNonEmptyString(input.brandMode)) {
                errors.push({ field: 'brandMode', message: 'brandMode must be a non-empty string.' });
            } else if (!VALID_BRAND_MODES.has(input.brandMode)) {
                errors.push({
                    field: 'brandMode',
                    message: 'brandMode must be one of: modern, playful, bold, minimal.',
                });
            }
        }

        if (!('slug' in input)) {
            errors.push({ field: 'slug', message: 'Missing required field.' });
        } else if (!isNonEmptyString(input.slug)) {
            errors.push({ field: 'slug', message: 'Slug must be a non-empty string.' });
        } else if (!isValidSlug(input.slug)) {
            errors.push({
                field: 'slug',
                message: 'Slug must be lowercase and use only letters, numbers, and hyphens.',
            });
        }

        if (!('outDir' in input)) {
            errors.push({ field: 'outDir', message: 'Missing required field.' });
        } else if (!isNonEmptyString(input.outDir)) {
            errors.push({ field: 'outDir', message: 'outDir must be a non-empty string.' });
        } else {
            const resolvedOutDir = path.resolve(input.outDir);
            if (fs.pathExistsSync(resolvedOutDir)) {
                const stats = fs.statSync(resolvedOutDir);
                if (!stats.isDirectory()) {
                    errors.push({ field: 'outDir', message: 'outDir must be a writable directory.' });
                } else if (!isWritableDir(resolvedOutDir)) {
                    errors.push({ field: 'outDir', message: 'outDir is not writable.' });
                }
            } else {
                const parentDir = path.dirname(resolvedOutDir);
                if (!fs.pathExistsSync(parentDir)) {
                    errors.push({ field: 'outDir', message: 'Parent directory does not exist.' });
                } else if (!isWritableDir(parentDir)) {
                    errors.push({ field: 'outDir', message: 'Parent directory is not writable.' });
                }
            }
        }

        if (!('data' in input)) {
            errors.push({ field: 'data', message: 'Missing required field.' });
        } else if (!isPlainObject(input.data)) {
            errors.push({ field: 'data', message: 'data must be a JSON object.' });
        } else {
            const data = input.data as Record<string, unknown>;

            if (!('businessName' in data)) {
                errors.push({ field: 'data.businessName', message: 'Missing required field.' });
            } else if (!isNonEmptyString(data.businessName)) {
                errors.push({ field: 'data.businessName', message: 'businessName must be a non-empty string.' });
            } else if (data.businessName.length > 100) {
                errors.push({ field: 'data.businessName', message: 'businessName must be 1–100 characters.' });
            }

            if ('businessDescription' in data && data.businessDescription !== undefined) {
                if (!isString(data.businessDescription)) {
                    errors.push({
                        field: 'data.businessDescription',
                        message: 'businessDescription must be a string.',
                    });
                } else if (data.businessDescription.length > 500) {
                    errors.push({
                        field: 'data.businessDescription',
                        message: 'businessDescription must be 500 characters or fewer.',
                    });
                }
            }

            if ('businessCategory' in data && data.businessCategory !== undefined && !isString(data.businessCategory)) {
                errors.push({ field: 'data.businessCategory', message: 'businessCategory must be a string.' });
            }

            if ('tagline' in data && data.tagline !== undefined) {
                if (!isString(data.tagline)) {
                    errors.push({ field: 'data.tagline', message: 'tagline must be a string.' });
                } else if (data.tagline.length > 150) {
                    errors.push({ field: 'data.tagline', message: 'tagline must be 150 characters or fewer.' });
                }
            }

            if ('email' in data && data.email !== undefined) {
                if (!isString(data.email)) {
                    errors.push({ field: 'data.email', message: 'email must be a string.' });
                } else if (!isValidEmail(data.email)) {
                    errors.push({ field: 'data.email', message: 'email must be a valid email address.' });
                }
            }

            if ('phone' in data && data.phone !== undefined && !isString(data.phone)) {
                errors.push({ field: 'data.phone', message: 'phone must be a string.' });
            }

            if ('address' in data && data.address !== undefined && !isString(data.address)) {
                errors.push({ field: 'data.address', message: 'address must be a string.' });
            }

            if ('primaryColor' in data && data.primaryColor !== undefined) {
                if (!isString(data.primaryColor)) {
                    errors.push({ field: 'data.primaryColor', message: 'primaryColor must be a string.' });
                } else if (!isValidHexColor(data.primaryColor)) {
                    errors.push({ field: 'data.primaryColor', message: 'primaryColor must be a valid hex color (e.g. #000000).' });
                }
            }

            const urlFields = ['website', 'facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'];
            for (const field of urlFields) {
                if (field in data && data[field] !== undefined) {
                    if (!isString(data[field])) {
                        errors.push({ field: `data.${field}`, message: `${field} must be a string.` });
                    } else if (!isValidUrl(data[field])) {
                        errors.push({ field: `data.${field}`, message: `${field} must be a valid URL.` });
                    }
                }
            }

            if ('socialLinks' in data && data.socialLinks !== undefined) {
                if (!isPlainObject(data.socialLinks)) {
                    errors.push({ field: 'data.socialLinks', message: 'socialLinks must be an object.' });
                } else {
                    for (const [key, value] of Object.entries(data.socialLinks)) {
                        if (value === undefined || value === null || value === '') continue;
                        if (!isString(value)) {
                            errors.push({ field: `data.socialLinks.${key}`, message: 'social link must be a string URL.' });
                        } else if (!isValidUrl(value)) {
                            errors.push({ field: `data.socialLinks.${key}`, message: 'social link must be a valid URL.' });
                        }
                    }
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
}
