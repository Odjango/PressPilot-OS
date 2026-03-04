<?php

namespace App\Services;

use App\Exceptions\ContentGenerationException;
use Illuminate\Support\Facades\Http;

class AIPlanner
{
    private array $tokenSchema;

    public function __construct(?string $schemaPath = null)
    {
        $schemaPath ??= base_path('../pattern-library/token-schema.json');
        $payload = json_decode(file_get_contents($schemaPath), true, 512, JSON_THROW_ON_ERROR);
        $this->tokenSchema = $payload['tokens'] ?? [];
    }

    /**
     * @param  array<string, mixed>  $project
     * @return array<string, string>
     */
    public function generate(array $project): array
    {
        $systemPrompt = $this->buildSystemPrompt();
        $userPrompt = $this->buildUserPrompt($project);

        $response = $this->requestWithRetry($systemPrompt, $userPrompt);

        $decoded = json_decode($response, true);
        if (! is_array($decoded)) {
            throw new ContentGenerationException('AI response was not valid JSON.');
        }

        $this->validateTokens($decoded);

        return $decoded;
    }

    private function buildSystemPrompt(): string
    {
        $tokens = json_encode($this->tokenSchema, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

        return <<<PROMPT
You are generating content for a WordPress theme builder.
Return ONLY a valid JSON object with token names as keys and plain text values.
No HTML, no markdown, no block markup.
Token vocabulary:
{$tokens}
PROMPT;
    }

    /**
     * @param  array<string, mixed>  $project
     */
    private function buildUserPrompt(array $project): string
    {
        $name = $project['name'] ?? 'Business';
        $description = $project['description'] ?? $project['businessDescription'] ?? '';
        $category = $project['category'] ?? $project['businessCategory'] ?? 'general';
        $language = $project['language'] ?? 'English';
        $pages = $project['pages'] ?? ['home', 'about', 'services', 'contact', 'blog'];
        $pageList = is_array($pages) ? implode(', ', $pages) : (string) $pages;

        return <<<PROMPT
Business Name: {$name}
Description: {$description}
Category: {$category}
Language: {$language}
Pages: {$pageList}
PROMPT;
    }

    private function requestWithRetry(string $systemPrompt, string $userPrompt): string
    {
        $attempts = 0;

        while ($attempts < 3) {
            $attempts++;

            try {
                return $this->requestCompletion($systemPrompt, $userPrompt);
            } catch (ContentGenerationException $exception) {
                if ($attempts >= 3) {
                    throw $exception;
                }
            }
        }

        throw new ContentGenerationException('AI request failed.');
    }

    private function requestCompletion(string $systemPrompt, string $userPrompt): string
    {
        $endpoint = config('presspilot.ai.endpoint');
        $apiKey = config('presspilot.ai.api_key');

        if (! $endpoint || ! $apiKey) {
            throw new ContentGenerationException('Missing AI credentials.');
        }

        $payload = [
            'model' => config('presspilot.ai.model'),
            'max_tokens' => (int) config('presspilot.ai.max_tokens'),
            'system' => $systemPrompt,
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $userPrompt,
                ],
            ],
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'x-api-key' => $apiKey,
            'anthropic-version' => '2023-06-01',
        ])
            ->timeout(30)
            ->post($endpoint, $payload);

        if ($response->failed()) {
            throw new ContentGenerationException('AI request failed with status '.$response->status().'.');
        }

        $content = $response->json('content.0.text');
        if (! is_string($content)) {
            throw new ContentGenerationException('AI response missing content.');
        }

        return $content;
    }

    /**
     * @param  array<string, string>  $tokens
     */
    private function validateTokens(array $tokens): void
    {
        foreach ($this->tokenSchema as $token) {
            $name = $token['name'] ?? null;
            $maxLength = $token['maxLength'] ?? null;
            $required = $token['required'] ?? true;

            if (! $name) {
                continue;
            }

            if ($required && ! array_key_exists($name, $tokens)) {
                throw new ContentGenerationException("Missing token: {$name}");
            }

            if (! array_key_exists($name, $tokens)) {
                continue;
            }

            $value = (string) $tokens[$name];

            if ($maxLength && mb_strlen($value) > $maxLength) {
                throw new ContentGenerationException("Token {$name} exceeds max length");
            }
        }
    }
}
