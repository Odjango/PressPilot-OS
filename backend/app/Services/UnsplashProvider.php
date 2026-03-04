<?php

namespace App\Services;

use App\Contracts\ImageProviderInterface;
use RuntimeException;

class UnsplashProvider implements ImageProviderInterface
{
    public function fetch(string $query, int $width, int $height, array $context = []): array
    {
        $accessKey = config('services.unsplash.key');
        if (! $accessKey) {
            throw new RuntimeException('Missing Unsplash access key.');
        }

        $url = 'https://api.unsplash.com/photos/random?query='.
            urlencode($query).
            "&orientation=landscape&content_filter=high";

        $response = file_get_contents($url, false, stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => "Authorization: Client-ID {$accessKey}\r\n",
                'timeout' => 10,
            ],
        ]));

        if ($response === false) {
            throw new RuntimeException('Unsplash request failed.');
        }

        $payload = json_decode($response, true);
        if (! is_array($payload) || empty($payload['urls']['regular'])) {
            throw new RuntimeException('Unsplash response invalid.');
        }

        $imageUrl = $payload['urls']['regular'];
        $imageUrl .= (str_contains($imageUrl, '?') ? '&' : '?')."w={$width}&h={$height}&fit=crop";

        return [
            'url' => $imageUrl,
            'attribution' => [
                'name' => $payload['user']['name'] ?? 'Unsplash',
                'link' => $payload['user']['links']['html'] ?? 'https://unsplash.com',
            ],
        ];
    }
}
