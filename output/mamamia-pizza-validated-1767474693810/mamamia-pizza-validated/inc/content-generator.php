<?php
/**
 * Module: Content Generator
 * Purpose: Generate text and fetch images for the site.
 */

if (!defined('ABSPATH')) {
    exit;
}

class PressPilot_Content_Generator
{
    /**
     * Generate complete website content
     */
    public function generate($business_name, $business_type, $tagline = '')
    {
        // 1. Text Content (Mocked/Template for now, wired for OpenAI)
        $content = [
            'home' => $this->generate_home_content($business_name, $business_type, $tagline),
            'about' => $this->generate_generic_page('About Us', $business_name),
            'services' => $this->generate_generic_page('Services', $business_name),
            'contact' => $this->generate_contact_page($business_name),
            'blog' => ['intro' => 'Latest news from ' . $business_name],
            'shop' => ['intro' => 'Browse our products']
        ];

        return $content;
    }

    /**
     * Get images based on keyword (The "Unsplash" Logic)
     */
    public function get_images($keyword)
    {
        $keyword = strtolower($keyword);
        $map = $this->get_image_map();

        // diverse fallback if keyword not found
        $category = isset($map[$keyword]) ? $keyword : 'corporate';
        if (!isset($map[$keyword])) {
            // Try to find a partial match or default
            foreach ($map as $k => $v) {
                if (strpos($keyword, $k) !== false) {
                    $category = $k;
                    break;
                }
            }
        }

        return $map[$category];
    }

    private function generate_home_content($name, $type, $tagline)
    {
        $images = $this->get_images($type);

        return [
            'hero_headline' => "Welcome to $name",
            'hero_text' => $tagline ? $tagline : "The best $type in town.",
            'cta_text' => "Get Started",
            'benefits' => [
                "Quality Service",
                "Expert Team",
                "Satisfaction Guaranteed"
            ],
            // Pass images back for the assembler to use
            'images' => $images
        ];
    }

    private function generate_generic_page($title, $name)
    {
        return [
            'title' => $title,
            'content' => "Welcome to the $title page of $name. We are dedicated to providing the best service."
        ];
    }

    private function generate_contact_page($name)
    {
        return [
            'headline' => "Contact $name",
            'intro' => "We'd love to hear from you.",
            'hours_text' => "Mon-Fri: 9am - 5pm",
            'response_promise' => "We reply within 24 hours."
        ];
    }

    /**
     * The User's "Working Very Well" Logic: High-Quality Curated Maps
     * We simulate "Fetching by keyword" by mapping keywords to curated Unsplash Collections.
     */
    private function get_image_map()
    {
        return [
            'pizza' => [
                'hero' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&q=80', // Pepperoni Pizza
                'about' => 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=1200&q=80', // Pizza Oven
                'service' => 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&q=80' // Chef
            ],
            'restaurant' => [
                'hero' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80',
                'about' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
                'service' => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80'
            ],
            'corporate' => [
                'hero' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
                'about' => 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
                'service' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80'
            ],
            'fitness' => [
                'hero' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80',
                'about' => 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80',
                'service' => 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80'
            ],
            'tech' => [
                'hero' => 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80',
                'about' => 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80',
                'service' => 'https://images.unsplash.com/photo-1504384308090-c54be3855833?w=800&q=80'
            ]
        ];
    }
}
