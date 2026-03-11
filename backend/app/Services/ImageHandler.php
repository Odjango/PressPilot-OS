<?php

namespace App\Services;

use App\Contracts\ImageProviderInterface;
use RuntimeException;

class ImageHandler
{
    /**
     * Known IMAGE token dimensions. Tokens not listed here use smart defaults
     * based on their prefix (HERO=1920x800, TEAM=800x800, etc.).
     */
    private array $knownTokenSizes = [
        'IMAGE_HERO' => [1920, 800],
        'IMAGE_FEATURE_1' => [800, 500],
        'IMAGE_FEATURE_2' => [800, 500],
        'IMAGE_ABOUT' => [1200, 800],
        'IMAGE_TEAM_1' => [800, 800],
        'IMAGE_TEAM_2' => [800, 800],
        'IMAGE_TEAM_3' => [800, 800],
        'IMAGE_TESTIMONIAL_1' => [400, 400],
        'IMAGE_GALLERY_1' => [900, 600],
        'IMAGE_GALLERY_2' => [900, 600],
        'IMAGE_GALLERY_3' => [900, 600],
        'IMAGE_GALLERY_4' => [900, 600],
        'IMAGE_GALLERY_5' => [900, 600],
        'IMAGE_GALLERY_6' => [900, 600],
        'IMAGE_PRODUCT_1' => [800, 800],
        'IMAGE_PRODUCT_2' => [800, 800],
        'IMAGE_PRODUCT_3' => [800, 800],
        'IMAGE_PRODUCT_4' => [800, 800],
        'IMAGE_PRODUCT_5' => [800, 800],
        'IMAGE_PRODUCT_6' => [800, 800],
        'IMAGE_CHEF' => [800, 800],
        'IMAGE_PAGE_BANNER' => [1920, 600],
    ];

    /**
     * Default sizes by IMAGE token prefix, for tokens not in $knownTokenSizes.
     */
    private array $prefixDefaults = [
        'IMAGE_HERO' => [1920, 800],
        'IMAGE_FEATURE' => [800, 500],
        'IMAGE_ABOUT' => [1200, 800],
        'IMAGE_TEAM' => [800, 800],
        'IMAGE_TESTIMONIAL' => [400, 400],
        'IMAGE_GALLERY' => [900, 600],
        'IMAGE_PRODUCT' => [800, 800],
        'IMAGE_CHEF' => [800, 800],
        'IMAGE_PORTFOLIO' => [900, 600],
        'IMAGE_PAGE_BANNER' => [1920, 600],
    ];

    /**
     * Query overrides by token prefix — ensures people-related tokens
     * get person photos instead of generic category images.
     * Tokens not matched here use the business category as query.
     */
    private array $tokenQueryOverrides = [
        'IMAGE_TEAM' => 'professional person portrait headshot',
        'IMAGE_CHEF' => 'chef portrait professional kitchen',
        'IMAGE_TESTIMONIAL' => 'person portrait professional',
    ];

    public function __construct(
        private ImageProviderInterface $provider,
        private ImageProviderInterface $fallbackProvider,
    ) {
    }

    /**
     * @return array<string, array{0:int,1:int}>
     */
    public function getTokenSizes(): array
    {
        return $this->knownTokenSizes;
    }

    /**
     * Resolve dimensions for an IMAGE token — use known sizes first,
     * then prefix-based defaults, then a generic fallback.
     *
     * @return array{0:int, 1:int}
     */
    private function resolveTokenSize(string $token): array
    {
        // Exact match in known sizes
        if (isset($this->knownTokenSizes[$token])) {
            return $this->knownTokenSizes[$token];
        }

        // Prefix-based default (e.g., IMAGE_PRODUCT_7 → IMAGE_PRODUCT default)
        foreach ($this->prefixDefaults as $prefix => $size) {
            if (str_starts_with($token, $prefix)) {
                return $size;
            }
        }

        // Generic fallback
        return [800, 600];
    }

    /**
     * Generate images for all required IMAGE_* tokens.
     *
     * The $requiredTokens array (from skeleton selections) drives which tokens
     * get images. Tokens not in $requiredTokens are skipped — no wasted API calls.
     *
     * @param  array<string, mixed>  $context
     * @param  array<string>  $requiredTokens  IMAGE_* token names from skeleton registry
     * @return array{urls: array<string, string>, paths: array<string, string>}  Token name → URL and local file path
     */
    public function generateImages(array $context, string $destinationDir, array $requiredTokens = []): array
    {
        $urls = [];
        $paths = [];
        $query = (string) ($context['category'] ?? $context['businessCategory'] ?? $context['industry'] ?? 'business');

        // If no required tokens specified, fall back to all known tokens
        $tokensToProcess = ! empty($requiredTokens)
            ? $requiredTokens
            : array_keys($this->knownTokenSizes);

        foreach ($tokensToProcess as $tokenOrKey => $tokenOrUrl) {
            // Support both indexed array ['IMAGE_HERO', ...] and assoc ['IMAGE_HERO' => 'url']
            if (is_int($tokenOrKey)) {
                $token = $tokenOrUrl;
                $presetUrl = null;
            } else {
                $token = $tokenOrKey;
                $presetUrl = $tokenOrUrl;
            }

            [$width, $height] = $this->resolveTokenSize($token);

            $url = null;
            if ($presetUrl && filter_var($presetUrl, FILTER_VALIDATE_URL)) {
                $url = $presetUrl;
            }

            if (! $url) {
                // Use token-specific query for people-related images,
                // fall back to business category for everything else
                $imageQuery = $this->resolveTokenQuery($token, $query);
                $result = $this->fetchImage($imageQuery, $width, $height, $context);
                $url = $result['url'];
            }

            $path = $this->downloadImage($url, $destinationDir, $token);
            $urls[$token] = $url;
            $paths[$token] = $path;
        }

        return [
            'urls' => $urls,
            'paths' => $paths,
        ];
    }

    /**
     * Resolve the Unsplash query for a given IMAGE token.
     * People-related tokens (TEAM, CHEF, TESTIMONIAL) get person-specific queries
     * instead of the generic business category to avoid food/product images in people sections.
     */
    private function resolveTokenQuery(string $token, string $defaultQuery): string
    {
        foreach ($this->tokenQueryOverrides as $prefix => $overrideQuery) {
            if (str_starts_with($token, $prefix)) {
                return $overrideQuery;
            }
        }

        return $defaultQuery;
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array{url: string, attribution?: array<string, string>}
     */
    private function fetchImage(string $query, int $width, int $height, array $context): array
    {
        try {
            return $this->provider->fetch($query, $width, $height, $context);
        } catch (RuntimeException $exception) {
            return $this->fallbackProvider->fetch($query, $width, $height, $context);
        }
    }

    private function downloadImage(string $url, string $destinationDir, string $token): string
    {
        if (! is_dir($destinationDir)) {
            mkdir($destinationDir, 0755, true);
        }

        $contents = @file_get_contents($url);
        if ($contents === false) {
            throw new RuntimeException("Failed to download image: {$url}");
        }

        $path = rtrim($destinationDir, '/').'/'.strtolower($token).'.jpg';
        file_put_contents($path, $contents);

        if (filesize($path) === 0) {
            throw new RuntimeException("Downloaded image is empty: {$token}");
        }

        return $path;
    }
}
