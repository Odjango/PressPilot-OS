<?php

namespace App\Services;

use App\Contracts\ImageProviderInterface;
use RuntimeException;

class ImageHandler
{
    private array $tokenSizes = [
        'IMAGE_HERO' => [1920, 800],
        'IMAGE_FEATURE_1' => [800, 500],
        'IMAGE_FEATURE_2' => [800, 500],
        'IMAGE_ABOUT' => [1200, 800],
        'IMAGE_TEAM_1' => [800, 800],
        'IMAGE_TEAM_2' => [800, 800],
        'IMAGE_TESTIMONIAL_1' => [400, 400],
        'IMAGE_GALLERY_1' => [900, 600],
        'IMAGE_GALLERY_2' => [900, 600],
        'IMAGE_GALLERY_3' => [900, 600],
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
        return $this->tokenSizes;
    }

    /**
     * @param  array<string, mixed>  $context
     * @param  array<string, string>  $imageTokens
     * @return array<string, string>
     */
    public function generateImages(array $context, string $destinationDir, array $imageTokens = []): array
    {
        $results = [];
        $query = (string) ($context['category'] ?? $context['businessCategory'] ?? $context['industry'] ?? 'business');

        foreach ($this->tokenSizes as $token => [$width, $height]) {
            $url = $imageTokens[$token] ?? null;

            if (! $url || ! filter_var($url, FILTER_VALIDATE_URL)) {
                $result = $this->fetchImage($query, $width, $height, $context);
                $url = $result['url'];
            }

            $path = $this->downloadImage($url, $destinationDir, $token);
            $results[$token] = $path;
        }

        return $results;
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
