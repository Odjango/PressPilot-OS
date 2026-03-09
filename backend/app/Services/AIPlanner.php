<?php

namespace App\Services;

use App\Exceptions\ContentGenerationException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIPlanner
{
    private array $tokenSchema;
    private array $verticalRecipes;
    private array $skeletonRegistry;

    public function __construct(?string $schemaPath = null, ?string $recipesPath = null, ?string $registryPath = null)
    {
        $schemaPath ??= base_path('../pattern-library/token-schema.json');
        $recipesPath ??= base_path('../pattern-library/vertical-recipes.json');
        $registryPath ??= base_path('../pattern-library/skeleton-registry.json');

        $this->tokenSchema = json_decode(file_get_contents($schemaPath), true, 512, JSON_THROW_ON_ERROR)['tokens'] ?? [];
        $this->verticalRecipes = json_decode(file_get_contents($recipesPath), true) ?? [];
        $this->skeletonRegistry = json_decode(file_get_contents($registryPath), true) ?? [];
    }

    /**
     * @param  array<string, mixed>  $project
     * @return array<string, string>
     */
    public function generate(array $project): array
    {
        $category = $project['category'] ?? $project['businessCategory'] ?? 'local_service';
        $category = strtolower(trim($category));

        $requiredTokens = $this->getRequiredTokens($category);
        $systemPrompt = $this->buildSystemPrompt($category, $requiredTokens);
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

        $this->validateTokens($decoded, $requiredTokens, $project);

        return $decoded;
    }

    /**
     * Get the list of text tokens needed for this vertical.
     * Looks up the recipe, collects all skeleton required_tokens, removes IMAGE_* tokens.
     *
     * @return array<int, string>
     */
    private function getRequiredTokens(string $category): array
    {
        $recipe = $this->verticalRecipes[$category]
            ?? $this->verticalRecipes['local_service']
            ?? [];

        $requiredTokens = [];

        foreach ($recipe as $page => $skeletonIds) {
            foreach ($skeletonIds as $skeletonEntry) {
                // Support pipe-delimited alternatives: "hero-cover | hero-split | hero-minimal"
                // Collect required tokens from ALL alternatives so the AI generates
                // tokens that satisfy whichever variant PatternSelector picks at random.
                $alternatives = str_contains($skeletonEntry, '|')
                    ? array_map('trim', explode('|', $skeletonEntry))
                    : [trim($skeletonEntry)];

                foreach ($alternatives as $skeletonId) {
                    $skeleton = $this->skeletonRegistry[$skeletonId] ?? null;
                    if ($skeleton && isset($skeleton['required_tokens'])) {
                        $requiredTokens = array_merge($requiredTokens, $skeleton['required_tokens']);
                    }
                }
            }
        }

        // Also add footer tokens used by ThemeAssembler (not in skeletons)
        $requiredTokens[] = 'FOOTER_TAGLINE';
        $requiredTokens[] = 'CONTACT_TEXT';
        $requiredTokens[] = 'BUSINESS_NAME';

        // Remove IMAGE_* tokens (handled by ImageHandler) and deduplicate
        return array_values(array_unique(array_filter(
            $requiredTokens,
            fn(string $t) => !str_starts_with($t, 'IMAGE_')
        )));
    }

    /**
     * Build a compact system prompt listing only the tokens this vertical needs.
     */
    private function buildSystemPrompt(string $category, array $requiredTokens): string
    {
        $tokenList = implode(', ', $requiredTokens);

        // Build category-specific hints
        $categoryHints = match ($category) {
            'restaurant' => "- MENU_ITEM_*: real dish names with descriptions and realistic prices\n- SPECIAL_*: featured daily/seasonal specials with descriptions and prices\n- CHEF_*: chef/owner name, title, and compelling bio\n- RESERVATION_*: compelling reservation call-to-action\n- HOURS_*: realistic business hours",
            'ecommerce' => "- PRODUCT_*: real product names with descriptions and realistic prices\n- PRODUCT_CTA: shopping call-to-action like 'Shop Now' or 'Add to Cart'",
            'saas' => "- PLAN_*: realistic SaaS pricing tiers (free/starter, pro, enterprise)\n- STATS_*: impressive but believable metrics (e.g., '99.9%' uptime, '10K+' users)\n- PRICING_CTA: action-oriented like 'Start Free Trial'",
            'portfolio' => "- PROCESS_*: creative workflow steps (e.g., Discovery, Design, Deliver)\n- GALLERY_ALT_*: descriptive alt text for portfolio pieces",
            'local_service' => "- SERVICE_AREA_*: realistic local area/neighborhood names\n- EMERGENCY_CTA: urgent call-to-action like 'Call Now for Emergency Service'\n- LICENSE_TEXT: professional licensing statement",
            default => "",
        };

        return <<<PROMPT
You are generating website content for a WordPress theme.
Write as if you ARE the business owner. Every text must be specific to the business.
No generic placeholder text. No lorem ipsum. No "Your Business Here".

Return ONLY a valid JSON object with token names as keys and plain text values.
No HTML tags, no markdown, no block markup. Do not include any IMAGE_* tokens.

Required tokens: {$tokenList}

Content rules:
- HERO_TITLE: compelling, specific headline (not generic)
- HERO_PRETITLE: short eyebrow text (category or tagline)
- HERO_TEXT: 1-2 sentences describing the business value
- ABOUT_TITLE, ABOUT_TEXT, ABOUT_TEXT_2: genuine business story
- FEATURE_*_TITLE, FEATURE_*_TEXT: specific features/benefits of THIS business
- TESTIMONIAL_*_TEXT: realistic customer quotes (2-3 sentences each)
- TESTIMONIAL_*_NAME: realistic full names
- TESTIMONIAL_*_ROLE: customer context (e.g., "Loyal Customer since 2019")
- CTA_*: action-oriented button text and supporting copy
- CONTACT_*: realistic business contact information
- FOOTER_TAGLINE: short business tagline for footer
- BUSINESS_NAME: exact business name
- FAQ_*_Q, FAQ_*_A: real frequently asked questions and detailed answers
- PAGE_BANNER_TITLE: a compelling page title for inner pages (e.g., "Explore Our Services" or "Get In Touch")
- PAGE_BANNER_TEXT: a short supporting sentence for the inner page banner
{$categoryHints}
- All values must be plain text only. No HTML.
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
        $rawPages = $project['pages'] ?? ['home', 'about', 'services', 'contact'];
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

Generate ALL required tokens with content specific to "{$name}". Make it sound professional and authentic.
PROMPT;
    }

    private function requestWithRetry(string $systemPrompt, string $userPrompt): string
    {
        $maxAttempts = 5;

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                return $this->requestCompletion($systemPrompt, $userPrompt);
            } catch (ContentGenerationException $exception) {
                $message = $exception->getMessage();
                $isRetryable = str_contains($message, 'status 429')
                    || str_contains($message, 'status 529')
                    || str_contains($message, 'rate limit')
                    || str_contains($message, 'overloaded');

                if ($attempt >= $maxAttempts || ! $isRetryable) {
                    throw $exception;
                }

                // Exponential backoff with jitter:
                // 429 (rate limit): 15s, 30s, 45s, 60s
                // 529 (overloaded): 30s, 60s, 90s, 120s
                // Other retryable:  5s, 10s, 15s, 20s
                $isOverloaded = str_contains($message, 'status 529') || str_contains($message, 'overloaded');
                $isRateLimit = str_contains($message, 'status 429') || str_contains($message, 'rate limit');

                $baseDelay = match (true) {
                    $isOverloaded => $attempt * 30,
                    $isRateLimit => $attempt * 15,
                    default => $attempt * 5,
                };

                // Add jitter (±25%) to prevent thundering herd
                $jitter = (int) ($baseDelay * 0.25 * (mt_rand() / mt_getrandmax() * 2 - 1));
                $delay = max(5, $baseDelay + $jitter);

                Log::warning("AIPlanner: Attempt {$attempt}/{$maxAttempts} failed, retrying in {$delay}s", [
                    'error' => mb_substr($message, 0, 200),
                    'is_rate_limit' => $isRateLimit,
                    'is_overloaded' => $isOverloaded,
                    'next_attempt' => $attempt + 1,
                ]);
                sleep($delay);
            }
        }

        throw new ContentGenerationException('AI request failed after '.$maxAttempts.' retries.');
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
            ->timeout(90)
            ->connectTimeout(15)
            ->post($endpoint, $payload);

        if ($response->failed()) {
            $status = $response->status();
            $body = $response->body();
            $errorMsg = "AI request failed with status {$status}.";

            if ($status === 429) {
                $retryAfter = $response->header('retry-after');
                $errorMsg = "AI rate limit hit (status 429). Retry-After: {$retryAfter}s. Body: ".mb_substr($body, 0, 200);
                Log::warning('AIPlanner: Rate limit exceeded', [
                    'status' => $status,
                    'retry_after' => $retryAfter,
                    'body' => mb_substr($body, 0, 500),
                ]);
            } elseif ($status === 529) {
                $errorMsg = "AI API overloaded (status 529). Body: ".mb_substr($body, 0, 200);
                Log::warning('AIPlanner: API overloaded — will retry', [
                    'status' => $status,
                    'body' => mb_substr($body, 0, 500),
                ]);
            }

            throw new ContentGenerationException($errorMsg);
        }

        $stopReason = $response->json('stop_reason');
        if ($stopReason === 'max_tokens') {
            Log::warning('AIPlanner: Response was truncated (stop_reason=max_tokens)', [
                'max_tokens' => config('presspilot.ai.max_tokens'),
            ]);
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

        if (json_decode($trimmed, true) !== null) {
            return $trimmed;
        }

        if (preg_match('/```(?:json)?\s*\n?(.*?)\n?\s*```/s', $trimmed, $matches)) {
            return trim($matches[1]);
        }

        $firstBrace = strpos($trimmed, '{');
        $lastBrace = strrpos($trimmed, '}');
        if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
            return substr($trimmed, $firstBrace, $lastBrace - $firstBrace + 1);
        }

        return $trimmed;
    }

    /**
     * Validate and fill missing tokens with sensible defaults.
     *
     * @param  array<string, string>  $tokens
     * @param  array<int, string>  $requiredTokens
     * @param  array<string, mixed>  $project
     */
    private function validateTokens(array &$tokens, array $requiredTokens, array $project): void
    {
        $businessName = $project['name'] ?? 'Business';
        $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '', $businessName));
        $missing = [];

        foreach ($requiredTokens as $tokenName) {
            if (str_starts_with($tokenName, 'IMAGE_')) {
                continue;
            }

            if (! array_key_exists($tokenName, $tokens) || trim((string) $tokens[$tokenName]) === '') {
                $tokens[$tokenName] = $this->getDefaultValue($tokenName, $businessName, $slug);
                $missing[] = $tokenName;
            }
        }

        // Also validate against full schema for maxLength
        $schemaMap = [];
        foreach ($this->tokenSchema as $t) {
            $schemaMap[$t['name']] = $t;
        }

        foreach ($tokens as $name => $value) {
            $maxLen = $schemaMap[$name]['maxLength'] ?? null;
            if ($maxLen && mb_strlen((string) $value) > $maxLen) {
                // Truncate at word boundary to avoid cutting mid-word
                $truncated = mb_substr((string) $value, 0, $maxLen);
                $lastSpace = mb_strrpos($truncated, ' ');
                if ($lastSpace !== false && $lastSpace > (int) ($maxLen * 0.7)) {
                    // Only break at word boundary if we keep at least 70% of the content
                    $truncated = mb_substr($truncated, 0, $lastSpace);
                }
                $tokens[$name] = $truncated;
                Log::warning("AIPlanner: Token {$name} truncated to {$maxLen} chars (word-boundary)");
            }
        }

        if (count($missing) > 0) {
            Log::warning('AIPlanner: Missing tokens filled with defaults', [
                'count' => count($missing),
                'tokens' => array_slice($missing, 0, 20),
            ]);
        }
    }

    /**
     * Get a sensible default value for a missing token.
     */
    private function getDefaultValue(string $tokenName, string $businessName, string $slug): string
    {
        return match (true) {
            $tokenName === 'BUSINESS_NAME' => $businessName,
            $tokenName === 'CONTACT_EMAIL' => "info@{$slug}.com",
            $tokenName === 'CONTACT_PHONE' => '(555) 123-4567',
            $tokenName === 'CONTACT_ADDRESS' => '123 Main Street, Suite 100',
            $tokenName === 'CONTACT_HOURS' => 'Mon-Fri 9:00 AM - 5:00 PM',
            $tokenName === 'FOOTER_TAGLINE' => "Welcome to {$businessName}",
            $tokenName === 'CONTACT_TEXT' => "Get in touch with {$businessName} today.",
            str_contains($tokenName, '_CTA') || str_contains($tokenName, '_BUTTON') => 'Get Started',
            str_contains($tokenName, 'PRICE') => '$0',
            str_contains($tokenName, 'PERIOD') => '/mo',
            str_contains($tokenName, '_TITLE') || str_contains($tokenName, '_NAME') => $businessName,
            str_contains($tokenName, '_TEXT') || str_contains($tokenName, '_DESC') || str_contains($tokenName, '_BIO') => "Learn more about {$businessName}.",
            str_contains($tokenName, '_ROLE') => 'Team Member',
            str_contains($tokenName, '_NUMBER') => '100+',
            str_contains($tokenName, '_LABEL') => 'Metric',
            str_contains($tokenName, '_Q') => "What makes {$businessName} different?",
            str_contains($tokenName, '_A') => "We pride ourselves on quality and customer satisfaction.",
            str_contains($tokenName, 'HOURS_WEEKDAY') => 'Monday - Friday: 9:00 AM - 6:00 PM',
            str_contains($tokenName, 'HOURS_WEEKEND') => 'Saturday - Sunday: 10:00 AM - 4:00 PM',
            str_contains($tokenName, 'LOCATION_') => $businessName,
            str_contains($tokenName, 'SERVICE_AREA_') => 'Local Area',
            str_contains($tokenName, 'LICENSE_TEXT') => 'Licensed and Insured',
            str_contains($tokenName, 'GALLERY_ALT_') => "{$businessName} gallery image",
            default => $businessName,
        };
    }
}
