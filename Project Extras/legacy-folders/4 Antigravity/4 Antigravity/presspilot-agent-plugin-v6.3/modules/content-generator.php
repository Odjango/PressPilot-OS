<?php
/**
 * Module: Content Generator
 * Purpose: Generate website content using OpenAI GPT
 * Architecture: Modular - can upgrade models or switch AI providers easily
 * Documentation Injection: OpenAI API docs embedded
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Content_Generator {
    
    private $api_key;
    private $model = 'gpt-3.5-turbo'; // MVP uses cost-effective model
    private $patterns_dir;
    
    public function __construct() {
        $this->api_key = presspilot_get_api_key();
        $this->patterns_dir = PRESSPILOT_PLUGIN_DIR . 'patterns/';
    }
    
    /**
     * Generate complete website content
     * Using Hasan's Pattern strategy for consistency
     */
    public function generate($business_name, $business_tagline, $business_description, $content_language, $business_type, $colors) {
        // Load business type pattern
        $pattern = $this->load_pattern($business_type);
        
        // Generate content for each page (with multi-language support)
        $content = array(
            'home' => $this->generate_home_page($business_name, $business_tagline, $business_description, $content_language, $business_type, $pattern),
            'about' => $this->generate_about_page($business_name, $business_tagline, $business_description, $content_language, $business_type, $pattern),
            'services' => $this->generate_services_page($business_name, $business_tagline, $business_description, $content_language, $business_type, $pattern),
            'contact' => $this->generate_contact_page($business_name, $business_tagline, $business_description, $content_language, $business_type, $pattern),
            'blog' => $this->generate_blog_page($business_name, $business_tagline, $business_description, $content_language, $business_type, $pattern)
        );
        
        // Add e-commerce specific content if needed
        if ($business_type === 'ecommerce') {
            $content['shop'] = $this->generate_shop_page($business_name, $business_tagline, $business_description, $content_language, $business_type, $pattern);
            $content['cart'] = $this->generate_cart_page($business_name, $business_tagline, $business_description, $content_language, $business_type, $pattern);
        }
        
        return $content;
    }
    
    /**
     * Load business type pattern
     * Hasan's Pattern Trick: Reference templates for consistent output
     */
    private function load_pattern($business_type) {
        $pattern_file = $this->patterns_dir . $business_type . '.json';
        
        if (!file_exists($pattern_file)) {
            // Fallback to corporate pattern
            $pattern_file = $this->patterns_dir . 'corporate.json';
        }
        
        $pattern_json = file_get_contents($pattern_file);
        return json_decode($pattern_json, true);
    }
    
    /**
     * Generate Home Page content
     */
    private function generate_home_page($business_name, $business_tagline, $business_description, $content_language, $business_type, $pattern) {
        $tagline_context = !empty($business_tagline) ? "BUSINESS TAGLINE: {$business_tagline}\n" : "";
        $language_instruction = PressPilot_Language_Helper::get_ai_language_instruction($content_language);
        
        $prompt = "You are a professional website copywriter. Generate compelling home page content for {$business_name}.

{$language_instruction}{$tagline_context}BUSINESS DESCRIPTION: {$business_description}
BUSINESS TYPE: {$business_type}

IMPORTANT: Use the tagline and business description above to understand what this business actually does. Do not make assumptions based only on the business name.

STYLE REFERENCE (follow this pattern):
" . json_encode($pattern['tone']) . "

REQUIREMENTS:
- Hero headline (6-10 words, attention-grabbing)
- Hero subheadline (1-2 sentences explaining value proposition)
- 3 key benefits (short, punchy bullet points)
- Call-to-action text (3-5 words)

OUTPUT FORMAT (JSON):
{
    \"hero_headline\": \"...\",
    \"hero_subheadline\": \"...\",
    \"benefits\": [\"benefit1\", \"benefit2\", \"benefit3\"],
    \"cta_text\": \"...\"
}

Business type context: " . $pattern['keywords'] . "
Generate professional, engaging content now:";

        return $this->call_openai($prompt);
    }
    
    /**
     * Generate About Page content
     */
    private function generate_about_page($business_name, $business_tagline, $business_description, $content_language, $business_type, $pattern) {
        $tagline_context = !empty($business_tagline) ? "BUSINESS TAGLINE: {$business_tagline}\n" : "";
        $language_instruction = PressPilot_Language_Helper::get_ai_language_instruction($content_language);
        
        $prompt = "Generate an About Us page for {$business_name}.

{$language_instruction}{$tagline_context}BUSINESS DESCRIPTION: {$business_description}
BUSINESS TYPE: {$business_type}

IMPORTANT: Base content on the tagline and business description provided, not assumptions from the business name.

STYLE: " . $pattern['tone'] . "

STRUCTURE:
- Company story (2-3 paragraphs, 150-200 words)
- Mission statement (1-2 sentences)
- Core values (3-4 key values)
- Team description (1 paragraph)

OUTPUT FORMAT (JSON):
{
    \"story\": \"...\",
    \"mission\": \"...\",
    \"values\": [\"value1\", \"value2\", \"value3\"],
    \"team_intro\": \"...\"
}

Generate authentic, credible content:";

        return $this->call_openai($prompt);
    }
    
    /**
     * Generate Services Page content
     */
    private function generate_services_page($business_name, $business_tagline, $business_description, $content_language, $business_type, $pattern) {
        $services_count = $pattern['typical_services_count'] ?? 4;
        $tagline_context = !empty($business_tagline) ? "BUSINESS TAGLINE: {$business_tagline}\n" : "";
        $language_instruction = PressPilot_Language_Helper::get_ai_language_instruction($content_language);
        
        $prompt = "Generate a Services page for {$business_name}.

{$language_instruction}{$tagline_context}BUSINESS DESCRIPTION: {$business_description}
BUSINESS TYPE: {$business_type}

IMPORTANT: Create services based on the tagline and actual business description provided.

STYLE: " . $pattern['tone'] . "

REQUIREMENTS:
- Page intro (2-3 sentences)
- {$services_count} services/products with:
  * Service name (3-5 words)
  * Description (2-3 sentences)
  * Key feature (1 sentence)

OUTPUT FORMAT (JSON):
{
    \"intro\": \"...\",
    \"services\": [
        {
            \"name\": \"...\",
            \"description\": \"...\",
            \"feature\": \"...\"
        }
    ]
}

Industry context: " . implode(', ', $pattern['typical_services']) . "
Generate relevant, professional content:";

        return $this->call_openai($prompt);
    }
    
    /**
     * Generate Contact Page content
     */
    private function generate_contact_page($business_name, $business_tagline, $business_description, $content_language, $business_type, $pattern) {
        $tagline_context = !empty($business_tagline) ? "BUSINESS TAGLINE: {$business_tagline}\n" : "";
        $language_instruction = PressPilot_Language_Helper::get_ai_language_instruction($content_language);
        
        $prompt = "Generate a Contact page for {$business_name}.

{$language_instruction}{$tagline_context}BUSINESS DESCRIPTION: {$business_description}
BUSINESS TYPE: {$business_type}

REQUIREMENTS:
- Page headline (5-8 words, welcoming)
- Contact intro (2-3 sentences encouraging visitors to reach out)
- Business hours description (1 sentence)
- Response time promise (1 sentence)

OUTPUT FORMAT (JSON):
{
    \"headline\": \"...\",
    \"intro\": \"...\",
    \"hours_text\": \"...\",
    \"response_promise\": \"...\"
}

Generate friendly, professional content:";

        return $this->call_openai($prompt);
    }
    
    /**
     * Generate Blog Page content
     */
    private function generate_blog_page($business_name, $business_tagline, $business_description, $content_language, $business_type, $pattern) {
        $tagline_context = !empty($business_tagline) ? "BUSINESS TAGLINE: {$business_tagline}\n" : "";
        $language_instruction = PressPilot_Language_Helper::get_ai_language_instruction($content_language);
        
        $prompt = "Generate initial blog content for {$business_name}.

{$language_instruction}{$tagline_context}BUSINESS DESCRIPTION: {$business_description}
BUSINESS TYPE: {$business_type}

REQUIREMENTS:
- Blog intro/tagline (1-2 sentences)
- 3 sample blog post titles relevant to the industry
- Brief blog description (1 sentence explaining what visitors will find)

OUTPUT FORMAT (JSON):
{
    \"intro\": \"...\",
    \"sample_posts\": [\"title1\", \"title2\", \"title3\"],
    \"description\": \"...\"
}

Industry: {$business_type}
Generate engaging, relevant content:";

        return $this->call_openai($prompt);
    }
    
    /**
     * Generate Shop Page content for e-commerce
     */
    private function generate_shop_page($business_name, $business_tagline, $business_description, $content_language, $business_type, $pattern) {
        $tagline_context = !empty($business_tagline) ? "BUSINESS TAGLINE: {$business_tagline}\n" : "";
        $language_instruction = PressPilot_Language_Helper::get_ai_language_instruction($content_language);
        
        $prompt = "Generate a Shop/Products page for {$business_name}.

{$language_instruction}{$tagline_context}BUSINESS DESCRIPTION: {$business_description}
BUSINESS TYPE: {$business_type}

REQUIREMENTS:
- Page intro (2-3 sentences about the products)
- 3 sample products with:
  * Product name
  * Product description (2-3 sentences)
  * Key feature

OUTPUT FORMAT (JSON):
{
    \"intro\": \"...\",
    \"products\": [
        {\"name\": \"...\", \"description\": \"...\", \"feature\": \"...\"},
        {\"name\": \"...\", \"description\": \"...\", \"feature\": \"...\"},
        {\"name\": \"...\", \"description\": \"...\", \"feature\": \"...\"}
    ]
}

Generate relevant products based on the business description:";

        return $this->call_openai($prompt);
    }
    
    /**
     * Generate Cart Page content for e-commerce
     */
    private function generate_cart_page($business_name, $business_tagline, $business_description, $content_language, $business_type, $pattern) {
        // Simple cart page - mostly handled by HTML template
        return [
            'title' => 'Shopping Cart',
            'empty_message' => 'Your cart is currently empty.',
            'continue_shopping' => 'Continue Shopping'
        ];
    }
    
    /**
     * Call OpenAI API
     * Documentation Injection: OpenAI API structure embedded
     */
    private function call_openai($prompt) {
        $url = 'https://api.openai.com/v1/chat/completions';
        
        $data = array(
            'model' => $this->model,
            'messages' => array(
                array(
                    'role' => 'system',
                    'content' => 'You are a professional website copywriter. Always respond with valid JSON only, no additional text.'
                ),
                array(
                    'role' => 'user',
                    'content' => $prompt
                )
            ),
            'temperature' => 0.7,
            'max_tokens' => 1000
        );
        
        $response = wp_remote_post($url, array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode($data),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            throw new Exception('OpenAI API request failed: ' . $response->get_error_message());
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($body['error'])) {
            throw new Exception('OpenAI API error: ' . $body['error']['message']);
        }
        
        // Extract and parse the JSON response
        $content = $body['choices'][0]['message']['content'];
        
        // Clean up response (remove markdown code blocks if present)
        $content = preg_replace('/```json\s*|\s*```/', '', $content);
        $content = trim($content);
        
        return json_decode($content, true);
    }
}
