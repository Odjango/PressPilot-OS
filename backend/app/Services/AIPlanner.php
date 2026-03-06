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
        // Build a compact token list: just names grouped by purpose.
        // This dramatically reduces input token count vs. dumping the full schema.
        $textTokens = array_filter(
            $this->tokenSchema,
            fn (array $t) => ! str_starts_with($t['name'] ?? '', 'IMAGE_')
        );

        $tokenNames = array_map(fn (array $t) => $t['name'], $textTokens);
        $tokenList = implode(', ', $tokenNames);

        return <<<PROMPT
You are generating content for a WordPress theme builder.
Return ONLY a valid JSON object with token names as keys and plain text values.
No HTML, no markdown, no block markup. Do not include any IMAGE_* tokens.

Required tokens: {$tokenList}

Rules:
- HERO_TITLE, HERO_PRETITLE, HERO_TEXT: compelling hero section copy
- ABOUT_TITLE, ABOUT_TEXT: about the business (2-3 sentences)
- FEATURE_*: feature titles and descriptions
- TESTIMONIAL_*: realistic customer testimonials with names and roles
- CTA_*: call-to-action text and button labels
- CONTACT_*: business contact info (address, phone, email, hours)
- FOOTER_*: footer tagline and copyright text
- All values must be plain text, specific to the business. No placeholders.
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
        $maxAttempts = 3;

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                return $this->requestCompletion($systemPrompt, $userPrompt);
            } catch (ContentGenerationException $exception) {
                $isRateLimit = str_contains($exception->getMessage(), 'status 429')
                    || str_contains($exception->getMessage(), 'rate limit');

                if ($attempt >= $maxAttempts) {
                    throw $exception;
                }

                // Exponential backoff: 15s, 30s — longer for rate limits
                $delay = $isRateLimit ? $attempt * 15 : $attempt * 5;
                Log::warning("AIPlanner: Attempt {$attempt} failed, retrying in {$delay}s", [
                    'error' => $exception->getMessage(),
                    'is_rate_limit' => $isRateLimit,
                ]);
                sleep($delay);
            }
        }

        throw new ContentGenerationException('AI request failed after retries.');
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
            $status = $response->status();
            $body = $response->body();
            $errorMsg = "AI request failed with status {$status}.";

            // Include rate limit detail so retry logic can detect it
            if ($status === 429) {
                $retryAfter = $response->header('retry-after');
                $errorMsg = "AI rate limit hit (status 429). Retry-After: {$retryAfter}s. Body: ".mb_substr($body, 0, 200);
                Log::warning('AIPlanner: Rate limit exceeded', [
                    'status' => $status,
                    'retry_after' => $retryAfter,
                    'body' => mb_substr($body, 0, 500),
                ]);
            }

            throw new ContentGenerationException($errorMsg);
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
    /**
     * Validate AI-generated tokens against schema.
     * Soft validation: logs warnings for missing tokens and fills empty defaults
     * so the pipeline can continue. Hard-failing here blocks the entire generation
     * when the AI omits even one token (common with large vocabularies).
     *
     * @param  array<string, string>  $tokens
     * @return array<string, string>  Tokens with defaults filled for any missing entries
     */
    private function validateTokens(array &$tokens): void
    {
        $missing = [];

        foreach ($this->tokenSchema as $token) {
            $name = $token['name'] ?? null;
            $maxLength = $token['maxLength'] ?? null;

            if (! $name) {
                continue;
            }

            // IMAGE_* tokens are sourced by ImageHandler, not AI.
            if (str_starts_with($name, 'IMAGE_')) {
                continue;
            }

            // Fill missing tokens with empty string so TokenInjector can proceed.
            if (! array_key_exists($name, $tokens)) {
                $tokens[$name] = '';
                $missing[] = $name;
                continue;
            }

            $value = (string) $tokens[$name];

            if ($maxLength && mb_strlen($value) > $maxLength) {
                // Truncate instead of failing — preserves partial content.
                $tokens[$name] = mb_substr($value, 0, $maxLength);
                Log::warning("AIPlanner: Token {$name} truncated to {$maxLength} chars");
            }
        }

        if (count($missing) > 0) {
            Log::warning('AIPlanner: Missing tokens filled with defaults', [
                'count' => count($missing),
                'tokens' => array_slice($missing, 0, 10),
            ]);
        }
    }
}
