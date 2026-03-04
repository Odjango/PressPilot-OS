<?php

namespace App\Contracts;

interface ImageProviderInterface
{
    /**
     * @param  array<string, mixed>  $context
     * @return array{url: string, attribution?: array<string, string>}
     */
    public function fetch(string $query, int $width, int $height, array $context = []): array;
}
