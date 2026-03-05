<?php

namespace App\Services;

use App\Exceptions\ContentGenerationException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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

        $cleaned = $this->extractJson($response);
        $decoded = json_decode($cleaned, true);
        if (! is_array($decoded)) {
            Log::error('AIPlanner: Failed to parse AI response', [
                'raw_response' => mb_substr($response, 0, 500),
                'cleaned' => mb_substr($cleaned, 0, 500),
            ]);
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
        $rawPages = $project['pages'] ?? ['home', 'about', 'services', 'contact', 'blog'];
        // Pages may be nested objects from DataTransformer (e.g. [{title, slug, ...}])
        // or flat strings. Extract slug/title for the prompt.
        $pages = array_map(function ($page) {
            if (is_array($page)) {
                return $page['slug'] ?? $page['title'] ?? 'page';
            }
            return (string) $page;
        }, $rawPages);
        $pageList = implode(', ', $pages);

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
     * Extract JSON from AI response, stripping markdown code fences and preamble.
     */
    private function extractJson(string $response): string
    {
        $trimmed = trim($response);

        // Try raw parse first — if it's already valid JSON, return as-is.
        if (json_decode($trimmed, true) !== null) {
            return $trimmed;
        }

        // Strip markdown code fences: ```json ... ``` or ``` ... ```
        if (preg_match('/```(?:json)?\s*\n?(.*?)\n?\s*```/s', $trimmed, $matches)) {
            return trim($matches[1]);
        }

        // Find first { and last } — extract the JSON object.
        $firstBrace = strpos($trimmed, '{');
        $lastBrace = strrpos($trimmed, '}');
        if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
            return substr($trimmed, $firstBrace, $lastBrace - $firstBrace + 1);
        }

        return $trimmed;
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
