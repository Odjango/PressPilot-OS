<?php

namespace App\Services;

use Illuminate\Support\Facades\Process;
use RuntimeException;
use ZipArchive;

class PlaygroundValidator
{
    /**
     * @return array{valid: bool, errors: array<int, array<string, string>>, warnings: array<int, array<string, string>>}
     */
    public function validate(string $themeDir): array
    {
        if (config('presspilot.skip_playground_validation')) {
            return [
                'valid' => true,
                'errors' => [],
                'warnings' => [[
                    'type' => 'VALIDATION_SKIPPED',
                    'message' => 'Playground validation bypassed via config.',
                ]],
            ];
        }

        if (! is_dir($themeDir)) {
            return [
                'valid' => false,
                'errors' => [[
                    'type' => 'MISSING_THEME_DIR',
                    'message' => "Theme directory not found: {$themeDir}",
                ]],
                'warnings' => [],
            ];
        }

        $themeSlug = basename($themeDir);
        $zipPath = sys_get_temp_dir()."/presspilot-theme-{$themeSlug}-".uniqid().'.zip';
        $blueprintPath = sys_get_temp_dir()."/presspilot-blueprint-{$themeSlug}-".uniqid().'.json';

        $this->zipTheme($themeDir, $themeSlug, $zipPath);
        file_put_contents($blueprintPath, json_encode($this->buildBlueprint($themeSlug, $zipPath), JSON_PRETTY_PRINT));

        $result = Process::timeout(120)->run(
            sprintf('npx @wp-playground/cli run-blueprint --blueprint %s --wp 6.4', escapeshellarg($blueprintPath))
        );

        $output = trim($result->output()."\n".$result->errorOutput());

        if ($this->isTimeoutError($result->errorOutput())) {
            return [
                'valid' => true,
                'errors' => [],
                'warnings' => [[
                    'type' => 'PLAYGROUND_TIMEOUT',
                    'message' => 'Playground CLI timed out.',
                ]],
            ];
        }

        if ($result->failed() && $output === '') {
            return [
                'valid' => true,
                'errors' => [],
                'warnings' => [[
                    'type' => 'PLAYGROUND_CLI_ERROR',
                    'message' => 'Playground CLI failed without output.',
                ]],
            ];
        }

        $parsed = $this->parseOutput($output, $themeSlug);

        return [
            'valid' => empty($parsed['errors']),
            'errors' => $parsed['errors'],
            'warnings' => $parsed['warnings'],
        ];
    }

    private function zipTheme(string $themeDir, string $themeSlug, string $zipPath): void
    {
        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('Unable to create zip archive for validation.');
        }

        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($themeDir, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($files as $file) {
            $filePath = $file->getRealPath();
            if (! $filePath) {
                continue;
            }

            $relativePath = $themeSlug.'/'.substr($filePath, strlen($themeDir) + 1);

            if ($file->isDir()) {
                $zip->addEmptyDir($relativePath);
            } else {
                $zip->addFile($filePath, $relativePath);
            }
        }

        $zip->close();
    }

    /**
     * @return array<string, mixed>
     */
    private function buildBlueprint(string $themeSlug, string $zipPath): array
    {
        $phpHealthCheck = <<<PHP
<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);

require_once '/wordpress/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/theme.php';
require_once ABSPATH . 'wp-includes/http.php';

$slug = {$this->encodeForPhp($themeSlug)};

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
?>
PHP;

        return [
            'landingPage' => '/',
            'steps' => [
                [
                    'step' => 'login',
                    'username' => 'admin',
                    'password' => 'password',
                ],
                [
                    'step' => 'installTheme',
                    'themeData' => [
                        'resource' => 'url',
                        'url' => "file://{$zipPath}",
                    ],
                ],
                [
                    'step' => 'activateTheme',
                    'themeFolderName' => $themeSlug,
                ],
                [
                    'step' => 'runPHP',
                    'code' => [
                        'filename' => 'playground-health-check.php',
                        'content' => $phpHealthCheck,
                    ],
                ],
            ],
        ];
    }

    private function encodeForPhp(string $value): string
    {
        return var_export($value, true);
    }

    /**
     * @return array{errors: array<int, array<string, string>>, warnings: array<int, array<string, string>>}
     */
    private function parseOutput(string $output, string $themeSlug): array
    {
        $errors = [];
        $warnings = [];

        if ($output === '') {
            $warnings[] = [
                'type' => 'PLAYGROUND_NO_OUTPUT',
                'message' => 'Playground returned no output.',
            ];

            return ['errors' => $errors, 'warnings' => $warnings];
        }

        $healthPayload = null;
        foreach (explode("\n", $output) as $line) {
            if (str_contains($line, 'PLAYGROUND_HEALTH::')) {
                $payload = explode('PLAYGROUND_HEALTH::', $line)[1] ?? null;
                if ($payload) {
                    $healthPayload = json_decode($payload, true);
                }
            }
        }

        if (! $healthPayload) {
            $warnings[] = [
                'type' => 'PLAYGROUND_HEALTH_MISSING',
                'message' => 'Playground health check output was not found.',
            ];

            return ['errors' => $errors, 'warnings' => $warnings];
        }

        if (($healthPayload['active_theme'] ?? null) !== $themeSlug) {
            $errors[] = [
                'type' => 'THEME_ACTIVATION_FAILED',
                'message' => 'Theme activation failed.',
            ];
        }

        foreach ($healthPayload['theme_errors'] ?? [] as $message) {
            $errors[] = [
                'type' => 'THEME_ERRORS',
                'message' => $message,
            ];
        }

        if (! empty($healthPayload['front_error'])) {
            $errors[] = [
                'type' => 'FRONTEND_ERROR',
                'message' => $healthPayload['front_error'],
            ];
        }

        if (($healthPayload['front_status'] ?? 0) >= 500) {
            $errors[] = [
                'type' => 'FRONTEND_HTTP_ERROR',
                'message' => 'Frontend request returned HTTP '.$healthPayload['front_status'].'.',
            ];
        }

        if (! empty($healthPayload['white_screen'])) {
            $errors[] = [
                'type' => 'WHITE_SCREEN',
                'message' => 'Frontend render returned an empty/white screen.',
            ];
        }

        return ['errors' => $errors, 'warnings' => $warnings];
    }

    private function isTimeoutError(string $output): bool
    {
        $lower = strtolower($output);

        return str_contains($lower, 'timed out') || str_contains($lower, 'etimedout');
    }
}
