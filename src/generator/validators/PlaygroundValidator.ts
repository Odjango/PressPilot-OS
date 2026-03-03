import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import AdmZip from 'adm-zip';

export interface PlaygroundValidationResult {
    valid: boolean;
    errors: { type: string; message: string; template?: string }[];
    warnings: { type: string; message: string }[];
    duration: number;
}

export interface PlaygroundValidatorOptions {
    themeDir: string;
    timeout?: number; // default 30000ms
}

const execFileAsync = promisify(execFile);
const DEFAULT_TIMEOUT = 30000;
const MAX_BUFFER = 10 * 1024 * 1024;

const PHP_FATAL_REGEX = /(PHP Fatal error|Fatal error|Uncaught Error|Parse error)/i;
const PHP_WARNING_REGEX = /(PHP Warning|PHP Notice|Warning:|Notice:)/i;

interface PlaygroundHealthPayload {
    active_theme?: string;
    switched?: boolean;
    theme_errors?: string[];
    front_status?: number | null;
    front_error?: string | null;
    white_screen?: boolean;
    front_body_length?: number;
}

function buildBlueprint(themeSlug: string, zipPath: string) {
    const phpHealthCheck = `<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);

require_once '/wordpress/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/theme.php';
require_once ABSPATH . 'wp-includes/http.php';

$slug = ${JSON.stringify(themeSlug)};

switch_theme($slug);
$theme = wp_get_theme();
$active_slug = $theme->get_stylesheet();
$errors = $theme->errors();
$theme_errors = [];

if ($errors instanceof WP_Error) {
    $theme_errors = $errors->get_error_messages();
}

$response = wp_remote_get(home_url('/'), [ 'timeout' => 10 ]);
$front_status = null;
$front_error = null;
$body = '';

if (is_wp_error($response)) {
    $front_error = $response->get_error_message();
} else {
    $front_status = wp_remote_retrieve_response_code($response);
    $body = wp_remote_retrieve_body($response);
}

$trimmed = trim($body);
$white_screen = (!$front_error && $trimmed === '') || (!$front_error && stripos($trimmed, '<html') === false);

$payload = [
    'active_theme' => $active_slug,
    'switched' => ($active_slug === $slug),
    'theme_errors' => $theme_errors,
    'front_status' => $front_status,
    'front_error' => $front_error,
    'white_screen' => $white_screen,
    'front_body_length' => strlen($body)
];

echo "PLAYGROUND_HEALTH::" . json_encode($payload) . "\n";
?>`;

    return {
        landingPage: '/',
        steps: [
            {
                step: 'login',
                username: 'admin',
                password: 'password',
            },
            {
                step: 'installTheme',
                themeData: {
                    resource: 'url',
                    url: `file://${zipPath}`,
                },
            },
            {
                step: 'activateTheme',
                themeFolderName: themeSlug,
            },
            {
                step: 'runPHP',
                code: {
                    filename: 'playground-health-check.php',
                    content: phpHealthCheck,
                },
            },
        ],
    };
}

function extractHealth(output: string): PlaygroundHealthPayload | null {
    const line = output
        .split('\n')
        .find(entry => entry.includes('PLAYGROUND_HEALTH::'));
    if (!line) return null;
    const payload = line.split('PLAYGROUND_HEALTH::')[1];
    if (!payload) return null;
    try {
        return JSON.parse(payload) as PlaygroundHealthPayload;
    } catch {
        return null;
    }
}

function parseOutput(output: string, themeSlug: string) {
    const errors: { type: string; message: string }[] = [];
    const warnings: { type: string; message: string }[] = [];

    const outputLines = output.split('\n');

    for (const line of outputLines) {
        if (PHP_FATAL_REGEX.test(line)) {
            errors.push({ type: 'PHP_FATAL', message: line.trim() });
        } else if (PHP_WARNING_REGEX.test(line)) {
            warnings.push({ type: 'PHP_WARNING', message: line.trim() });
        }
    }

    const health = extractHealth(output);
    if (!health) {
        warnings.push({
            type: 'PLAYGROUND_HEALTH_MISSING',
            message: 'Playground health check output was not found in CLI output.',
        });
        return { errors, warnings };
    }

    if (!health.switched || health.active_theme !== themeSlug) {
        errors.push({
            type: 'THEME_ACTIVATION_FAILED',
            message: `Theme activation failed. Active theme: ${health.active_theme ?? 'unknown'}.`,
        });
    }

    if (health.theme_errors && health.theme_errors.length > 0) {
        for (const msg of health.theme_errors) {
            errors.push({
                type: 'THEME_ERRORS',
                message: msg,
            });
        }
    }

    if (health.front_error) {
        errors.push({
            type: 'FRONTEND_ERROR',
            message: `Frontend request failed: ${health.front_error}`,
        });
    }

    if (health.front_status && health.front_status >= 500) {
        errors.push({
            type: 'FRONTEND_HTTP_ERROR',
            message: `Frontend request returned HTTP ${health.front_status}.`,
        });
    }

    if (health.white_screen) {
        errors.push({
            type: 'WHITE_SCREEN',
            message: 'Frontend render returned an empty/white screen.',
        });
    }

    return { errors, warnings };
}

function isTimeoutError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const err = error as NodeJS.ErrnoException & { killed?: boolean; signal?: string; code?: any };
    if (err.code === 'ETIMEDOUT') return true;
    if (err.killed) return true;
    if (err.signal && err.signal !== '') return true;
    if (typeof err.message === 'string' && err.message.toLowerCase().includes('timed out')) {
        return true;
    }
    return false;
}

export class PlaygroundValidator {
    static async validate(options: PlaygroundValidatorOptions): Promise<PlaygroundValidationResult> {
        const startTime = Date.now();
        const errors: { type: string; message: string; template?: string }[] = [];
        const warnings: { type: string; message: string }[] = [];

        const themeDir = path.resolve(options.themeDir);
        const timeout = options.timeout ?? DEFAULT_TIMEOUT;

        if (!(await fs.pathExists(themeDir))) {
            return {
                valid: false,
                errors: [
                    {
                        type: 'MISSING_THEME_DIR',
                        message: `Theme directory not found: ${themeDir}`,
                    },
                ],
                warnings,
                duration: Date.now() - startTime,
            };
        }

        const themeSlug = path.basename(themeDir);
        const zipPath = path.join(
            os.tmpdir(),
            `presspilot-theme-${themeSlug}-${Date.now()}-${Math.random().toString(16).slice(2)}.zip`
        );
        const blueprintPath = path.join(
            os.tmpdir(),
            `presspilot-blueprint-${themeSlug}-${Date.now()}-${Math.random().toString(16).slice(2)}.json`
        );

        try {
            const zip = new AdmZip();
            zip.addLocalFolder(themeDir, themeSlug);
            zip.writeZip(zipPath);

            const blueprint = buildBlueprint(themeSlug, zipPath);
            await fs.writeJson(blueprintPath, blueprint, { spaces: 2 });

            let stdout = '';
            let stderr = '';
            let execError: any = null;

            try {
                const result = await execFileAsync(
                    'npx',
                    ['@wp-playground/cli', 'run-blueprint', '--blueprint', blueprintPath, '--wp', '6.4'],
                    {
                        timeout,
                        maxBuffer: MAX_BUFFER,
                    }
                );
                stdout = result.stdout ?? '';
                stderr = result.stderr ?? '';
            } catch (error: any) {
                execError = error;
                stdout = error.stdout ?? '';
                stderr = error.stderr ?? '';

                if (isTimeoutError(error)) {
                    warnings.push({
                        type: 'PLAYGROUND_TIMEOUT',
                        message: `Playground CLI timed out after ${timeout}ms.`,
                    });
                    return {
                        valid: true,
                        errors: [],
                        warnings,
                        duration: Date.now() - startTime,
                    };
                }
            }

            const output = `${stdout}\n${stderr}`.trim();

            if (execError && output.length === 0) {
                warnings.push({
                    type: 'PLAYGROUND_CLI_ERROR',
                    message: execError?.message || 'Playground CLI failed without output.',
                });
                return {
                    valid: true,
                    errors: [],
                    warnings,
                    duration: Date.now() - startTime,
                };
            }

            const parsed = parseOutput(output, themeSlug);
            errors.push(...parsed.errors);
            warnings.push(...parsed.warnings);

            return {
                valid: errors.length === 0,
                errors,
                warnings,
                duration: Date.now() - startTime,
            };
        } catch (error: any) {
            errors.push({
                type: 'PLAYGROUND_EXCEPTION',
                message: error?.message || String(error),
            });
            return {
                valid: false,
                errors,
                warnings,
                duration: Date.now() - startTime,
            };
        } finally {
            await fs.remove(zipPath).catch(() => undefined);
            await fs.remove(blueprintPath).catch(() => undefined);
        }
    }
}
