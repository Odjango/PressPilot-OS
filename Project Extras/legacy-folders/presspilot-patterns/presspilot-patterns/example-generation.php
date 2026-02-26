<?php
/**
 * PressPilot Pattern Assembly Example
 * 
 * This file demonstrates how to use the new pattern assembly system.
 * AI generates JSON content → Pattern Assembler builds valid WordPress blocks.
 * 
 * @package PressPilot
 * @version 2.0.0
 */

// Load the pattern assembler
require_once __DIR__ . '/class-pattern-assembler.php';

// Initialize the assembler
$assembler = new PressPilot_Pattern_Assembler( __DIR__ . '/patterns/' );

/**
 * Example 1: Generate a restaurant homepage
 * 
 * This is what the AI would output as JSON:
 */
$restaurant_content = array(
    'header-centered' => array(
        'strings' => array(
            'site-title' => 'Bella Cucina',
        ),
        'images' => array(),
    ),
    
    'hero-cover' => array(
        'strings' => array(
            'headline' => 'Authentic Italian Cuisine',
            'subheadline' => 'Experience the flavors of Italy in the heart of downtown. Fresh ingredients, family recipes, unforgettable meals.',
            'button-primary' => 'View Our Menu',
            'button-secondary' => 'Make a Reservation',
        ),
        'images' => array(
            'background' => 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920',
        ),
    ),
    
    'features-grid-icons' => array(
        'strings' => array(
            'section-title' => 'Why Dine With Us',
            'feature-1-icon' => '🍝',
            'feature-1-title' => 'Fresh Pasta Daily',
            'feature-1-desc' => 'Handmade pasta prepared fresh every morning using traditional techniques.',
            'feature-2-icon' => '🍷',
            'feature-2-title' => 'Fine Wine Selection',
            'feature-2-desc' => 'Curated wine list featuring the best Italian and local varietals.',
            'feature-3-icon' => '👨‍🍳',
            'feature-3-title' => 'Expert Chefs',
            'feature-3-desc' => 'Our chefs trained in Italy bring authentic recipes to your table.',
            'feature-4-icon' => '🌿',
            'feature-4-title' => 'Farm to Table',
            'feature-4-desc' => 'Locally sourced ingredients from trusted farmers and producers.',
        ),
        'images' => array(),
    ),
    
    'restaurant-menu' => array(
        'strings' => array(
            'section-title' => 'Our Menu',
            'category-1-name' => 'Antipasti',
            'item-1-1-name' => 'Burrata Caprese',
            'item-1-1-desc' => 'Creamy burrata with heirloom tomatoes, fresh basil, aged balsamic',
            'item-1-1-price' => '$16',
            'item-1-2-name' => 'Carpaccio di Manzo',
            'item-1-2-desc' => 'Thinly sliced beef tenderloin, arugula, shaved parmesan, truffle oil',
            'item-1-2-price' => '$18',
            'item-1-3-name' => 'Arancini',
            'item-1-3-desc' => 'Crispy risotto balls filled with mozzarella, served with marinara',
            'item-1-3-price' => '$14',
            'category-2-name' => 'Primi Piatti',
            'item-2-1-name' => 'Tagliatelle al Ragù',
            'item-2-1-desc' => 'Fresh ribbon pasta with slow-cooked Bolognese sauce',
            'item-2-1-price' => '$24',
            'item-2-2-name' => 'Risotto ai Funghi',
            'item-2-2-desc' => 'Arborio rice with wild mushrooms, truffle butter, parmesan',
            'item-2-2-price' => '$26',
            'item-2-3-name' => 'Linguine alle Vongole',
            'item-2-3-desc' => 'Fresh clams, white wine, garlic, parsley, chili flakes',
            'item-2-3-price' => '$28',
        ),
        'images' => array(),
    ),
    
    'testimonials-grid' => array(
        'strings' => array(
            'section-title' => 'What Our Guests Say',
            'testimonial-1-quote' => 'The best Italian food outside of Italy. The homemade pasta is incredible and the service is impeccable.',
            'testimonial-1-name' => 'Maria S.',
            'testimonial-1-role' => 'Food Blogger',
            'testimonial-2-quote' => 'We celebrate every special occasion here. The atmosphere is romantic and the food never disappoints.',
            'testimonial-2-name' => 'James & Lisa K.',
            'testimonial-2-role' => 'Regular Guests',
            'testimonial-3-quote' => 'From the warm welcome to the last bite of tiramisu, everything was perfect. A true gem!',
            'testimonial-3-name' => 'David R.',
            'testimonial-3-role' => 'Local Resident',
        ),
        'images' => array(),
    ),
    
    'cta-banner' => array(
        'strings' => array(
            'headline' => 'Ready for an Unforgettable Dining Experience?',
            'subtext' => 'Book your table today and let us take you on a culinary journey through Italy.',
            'button-text' => 'Reserve Your Table',
        ),
        'images' => array(),
    ),
    
    'footer-standard' => array(
        'strings' => array(
            'business-name' => 'Bella Cucina',
            'tagline' => 'Authentic Italian cuisine in the heart of downtown.',
            'address' => '123 Main Street',
            'city-state-zip' => 'Anytown, CA 90210',
            'phone' => '(555) 123-4567',
            'email' => 'info@bellacucina.com',
            'hours-weekday' => 'Mon-Thu: 5PM - 10PM',
            'hours-weekend' => 'Fri-Sun: 4PM - 11PM',
        ),
        'images' => array(),
    ),
);

/**
 * Example 2: Generate brand colors
 */
$brand_colors = array(
    'primary'    => '#B91C1C', // Deep red - Italian inspired
    'secondary'  => '#78716C', // Warm gray
    'accent'     => '#D97706', // Amber gold
    'background' => '#FFFBEB', // Warm white
    'foreground' => '#1C1917', // Almost black
    'tertiary'   => '#FEF3C7', // Light amber
);

/**
 * Generate the complete homepage
 */
echo "=== Generating Restaurant Homepage ===\n\n";

// Get the pattern order from template
$template = $assembler->get_template( 'restaurant' );
$pattern_order = $template['patterns'];

// Build selections in correct order
$selections = array();
foreach ( $pattern_order as $pattern_id ) {
    if ( isset( $restaurant_content[ $pattern_id ] ) ) {
        $selections[] = array(
            'id'      => $pattern_id,
            'strings' => $restaurant_content[ $pattern_id ]['strings'],
            'images'  => $restaurant_content[ $pattern_id ]['images'],
        );
    }
}

// Generate the page
$homepage_content = $assembler->assemble_page( $selections );

echo "Generated homepage content:\n";
echo "---\n";
echo substr( $homepage_content, 0, 2000 ) . "...\n";
echo "---\n";
echo "Total length: " . strlen( $homepage_content ) . " characters\n\n";

/**
 * Generate theme.json
 */
echo "=== Generating theme.json ===\n\n";

$theme_json = $assembler->generate_theme_json( $brand_colors );

echo "Generated theme.json:\n";
echo "---\n";
echo substr( $theme_json, 0, 1500 ) . "...\n";
echo "---\n\n";

/**
 * Get content schema for AI
 */
echo "=== Content Schema for AI ===\n\n";

$schema = $assembler->get_content_schema( array( 'hero-cover', 'features-grid-icons' ) );

echo "AI should generate content matching this schema:\n";
echo json_encode( $schema, JSON_PRETTY_PRINT ) . "\n\n";

/**
 * Validate content
 */
echo "=== Content Validation ===\n\n";

$validation = $assembler->validate_content( 'hero-cover', array(
    'strings' => array(
        'headline' => 'This is a test headline',
        'subheadline' => 'This is a test subheadline that should be within limits',
    ),
));

echo "Validation result: " . ( $validation['valid'] ? 'PASSED' : 'FAILED' ) . "\n";

if ( ! empty( $validation['errors'] ) ) {
    echo "Errors: " . implode( ', ', $validation['errors'] ) . "\n";
}

echo "\n=== Complete ===\n";
