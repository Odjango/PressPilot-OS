<?php

namespace App\Services;

use App\Contracts\ImageProviderInterface;

class PlaceholderProvider implements ImageProviderInterface
{
    public function fetch(string $query, int $width, int $height, array $context = []): array
    {
        $url = "https://placehold.co/{$width}x{$height}";

        return ['url' => $url];
    }
}
