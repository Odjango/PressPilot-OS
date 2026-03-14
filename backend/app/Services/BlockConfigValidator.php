<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

/**
 * Validates WordPress block markup for required attributes.
 * Runs as a pre-ZIP quality gate to catch missing/invalid block attributes
 * that would cause "Attempt Recovery" errors in the WP Site Editor.
 */
class BlockConfigValidator
{
    /**
     * Required attributes per block type.
     * Key = block name (without wp: prefix), value = array of required attribute names.
     */
    private const REQUIRED_ATTRIBUTES = [
        'cover' => ['dimRatio'],
        'template-part' => ['slug'],
        'social-link' => ['service', 'url'],
        'heading' => ['level'],
        'query' => ['queryId', 'query'],
        'embed' => ['url'],
    ];

    /**
     * Banned attributes that must NOT appear in any block.
     */
    private const BANNED_ATTRIBUTES = [
        'iconColorValue',
        'iconBackgroundColorValue',
    ];

    /**
     * Validate all HTML files in a theme directory.
     *
     * @return array{errors: array<string>, warnings: array<string>}
     */
    public function validateTheme(string $themeDir): array
    {
        $errors = [];
        $warnings = [];

        $scanDirs = [
            $themeDir . '/templates',
            $themeDir . '/parts',
        ];

        foreach ($scanDirs as $dir) {
            if (!is_dir($dir)) {
                continue;
            }

            $files = glob($dir . '/*.html');
            if (!$files) {
                continue;
            }

            foreach ($files as $file) {
                $relPath = basename(dirname($file)) . '/' . basename($file);
                $content = file_get_contents($file);
                $result = $this->validateMarkup($content, $relPath);
                $errors = array_merge($errors, $result['errors']);
                $warnings = array_merge($warnings, $result['warnings']);
            }
        }

        if (!empty($errors)) {
            Log::error('BlockConfigValidator: Critical issues found', ['errors' => $errors]);
        }

        if (!empty($warnings)) {
            Log::warning('BlockConfigValidator: Warnings found', ['warnings' => $warnings]);
        }

        return ['errors' => $errors, 'warnings' => $warnings];
    }

    /**
     * Validate a single HTML string for block attribute requirements.
     *
     * @return array{errors: array<string>, warnings: array<string>}
     */
    public function validateMarkup(string $html, string $context = 'unknown'): array
    {
        $errors = [];
        $warnings = [];

        // Extract all block comments with their JSON attributes
        // Match: <!-- wp:block-name {"key":"value"} --> and <!-- wp:block-name {"key":"value"} /-->
        preg_match_all(
            '/<!-- wp:(\S+)\s+(\{[^}]*(?:\{[^}]*\}[^}]*)*\})\s*(?:\/)?-->/',
            $html,
            $matches,
            PREG_SET_ORDER
        );

        foreach ($matches as $match) {
            $blockName = $match[1];
            $jsonStr = $match[2];
            $attrs = json_decode($jsonStr, true);

            if ($attrs === null) {
                $errors[] = "[{$context}] Block '{$blockName}': Invalid JSON in attributes";
                continue;
            }

            // Check required attributes
            if (isset(self::REQUIRED_ATTRIBUTES[$blockName])) {
                foreach (self::REQUIRED_ATTRIBUTES[$blockName] as $requiredAttr) {
                    if (!array_key_exists($requiredAttr, $attrs)) {
                        $severity = $this->getSeverity($blockName, $requiredAttr);
                        $message = "[{$context}] Block '{$blockName}': Missing required attribute '{$requiredAttr}'";

                        if ($severity === 'error') {
                            $errors[] = $message;
                        } else {
                            $warnings[] = $message;
                        }
                    }
                }
            }

            // Check banned attributes
            foreach (self::BANNED_ATTRIBUTES as $banned) {
                if (array_key_exists($banned, $attrs)) {
                    $warnings[] = "[{$context}] Block '{$blockName}': Contains banned attribute '{$banned}'";
                }
            }
        }

        // Also check for navigation blocks with ref attribute (banned per project rules)
        if (preg_match_all('/<!-- wp:navigation\s+(\{[^}]*"ref"[^}]*\})/', $html, $navMatches)) {
            foreach ($navMatches[0] as $navMatch) {
                $errors[] = "[{$context}] wp:navigation block has banned 'ref' attribute";
            }
        }

        return ['errors' => $errors, 'warnings' => $warnings];
    }

    /**
     * Determine if a missing attribute is an error or warning.
     */
    private function getSeverity(string $blockName, string $attribute): string
    {
        // These cause Attempt Recovery errors — critical
        $critical = [
            'cover:dimRatio',
            'template-part:slug',
            'social-link:service',
        ];

        return in_array("{$blockName}:{$attribute}", $critical) ? 'error' : 'warning';
    }
}
