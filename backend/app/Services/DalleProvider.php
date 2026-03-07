<?php

namespace App\Services;

use App\Contracts\ImageProviderInterface;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class DalleProvider implements ImageProviderInterface
{
    public function fetch(string $query, int $width, int $height, array $context = []): array
    {
        $apiKey = config('services.openai.key');
        if (! $apiKey) {
            throw new RuntimeException('Missing OpenAI API key.');
        }

        $prompt = $this->buildPrompt($query, $width, $height, $context);
        $size = $this->resolveSize($width, $height);

        $response = Http::withToken($apiKey)
            ->timeout(60)
            ->connectTimeout(10)
            ->post('https://api.openai.com/v1/images/generations', [
                'model' => 'dall-e-3',
                'prompt' => $prompt,
                'n' => 1,
                'size' => $size,
                'quality' => 'standard',
            ]);

        if ($response->failed()) {
            $error = $response->json('error.message', 'Unknown OpenAI error');
            throw new RuntimeException("DALL-E request failed: {$error}");
        }

        $url = $response->json('data.0.url');
        if (! is_string($url) || $url === '') {
            throw new RuntimeException('DALL-E response missing image URL.');
        }

        return ['url' => $url];
    }

    private function buildPrompt(string $query, int $width, int $height, array $context): string
    {
        $businessName = $context['businessName'] ?? $context['business_name'] ?? '';
        $category = $context['category'] ?? $context['businessCategory'] ?? $query;

        $orientation = $width > $height ? 'landscape' : ($height > $width ? 'portrait' : 'square');

        $prompt = "Professional, high-quality {$orientation} photograph for a {$category} business";
        if ($businessName !== '') {
            $prompt .= " called \"{$businessName}\"";
        }
        $prompt .= ". The image should be suitable for a modern website hero section. ";
        $prompt .= 'Clean, well-lit, editorial style. No text or logos in the image.';

        return mb_substr($prompt, 0, 4000);
    }

    /**
     * DALL-E 3 supports: 1024x1024, 1792x1024, 1024x1792
     */
    private function resolveSize(int $width, int $height): string
    {
        $ratio = $width / max($height, 1);

        if ($ratio > 1.3) {
            return '1792x1024'; // landscape
        }
        if ($ratio < 0.77) {
            return '1024x1792'; // portrait
        }

        return '1024x1024'; // square
    }
}
