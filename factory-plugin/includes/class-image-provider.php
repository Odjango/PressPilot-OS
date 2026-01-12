<?php
/**
 * Image Provider - Generates contextual placeholder images for websites
 *
 * Uses Unsplash Source API for hero/about images and pravatar for avatars
 *
 * @package PressPilot_Factory
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PressPilot_Factory_Image_Provider {

    /**
     * Category-specific image queries for Unsplash
     *
     * @var array
     */
    private $category_queries = [
        'restaurant' => [
            'hero'  => 'restaurant,food,dining,cuisine',
            'about' => 'chef,kitchen,cooking,restaurant-interior',
            'feature' => 'food,dish,meal,gourmet',
        ],
        'corporate' => [
            'hero'  => 'office,business,modern-workplace,corporate',
            'about' => 'team,meeting,collaboration,professionals',
            'feature' => 'technology,innovation,business-growth',
        ],
        'ecommerce' => [
            'hero'  => 'shopping,products,retail,store',
            'about' => 'warehouse,packaging,delivery,logistics',
            'feature' => 'product,package,shipping',
        ],
        'agency' => [
            'hero'  => 'creative,design,studio,workspace',
            'about' => 'creative-team,designers,brainstorming',
            'feature' => 'design,creativity,art',
        ],
        'local' => [
            'hero'  => 'storefront,small-business,local-shop',
            'about' => 'owner,entrepreneur,local-business',
            'feature' => 'community,neighborhood,service',
        ],
        'startup' => [
            'hero'  => 'technology,startup,innovation,modern-office',
            'about' => 'startup-team,coding,developers',
            'feature' => 'tech,software,cloud',
        ],
        'default' => [
            'hero'  => 'business,professional,modern',
            'about' => 'team,office,professionals',
            'feature' => 'success,growth,innovation',
        ],
    ];

    /**
     * Image dimensions for different use cases
     *
     * @var array
     */
    private $dimensions = [
        'hero'    => ['width' => 1920, 'height' => 1080],
        'about'   => ['width' => 800, 'height' => 600],
        'feature' => ['width' => 600, 'height' => 400],
        'avatar'  => ['width' => 150, 'height' => 150],
    ];

    /**
     * Get hero image URL for a category
     *
     * @param string $category Business category
     * @param string $keywords Additional keywords (optional)
     * @return string Image URL
     */
    public function get_hero_image( $category, $keywords = '' ) {
        $query = $this->get_query( $category, 'hero' );

        if ( ! empty( $keywords ) ) {
            $query .= ',' . $keywords;
        }

        return $this->build_unsplash_url( $query, 'hero' );
    }

    /**
     * Get about/team image URL for a category
     *
     * @param string $category Business category
     * @return string Image URL
     */
    public function get_about_image( $category ) {
        $query = $this->get_query( $category, 'about' );
        return $this->build_unsplash_url( $query, 'about' );
    }

    /**
     * Get feature image URL
     *
     * @param string $category Business category
     * @param int $index Feature index for variety
     * @return string Image URL
     */
    public function get_feature_image( $category, $index = 0 ) {
        $query = $this->get_query( $category, 'feature' );
        // Add index to get different images
        return $this->build_unsplash_url( $query, 'feature', $index );
    }

    /**
     * Get avatar image URL
     *
     * @param int $index Avatar index (1-70 available)
     * @return string Image URL
     */
    public function get_avatar( $index = 1 ) {
        // Use pravatar.cc for consistent, realistic avatars
        // Index range: 1-70
        $avatar_index = ( ( $index - 1 ) % 70 ) + 1;
        return "https://i.pravatar.cc/150?img={$avatar_index}";
    }

    /**
     * Get all images for a website
     *
     * @param string $category Business category
     * @param array $options Additional options
     * @return array All image URLs
     */
    public function get_all_images( $category, $options = [] ) {
        $images = [
            'hero_image'   => $this->get_hero_image( $category ),
            'about_image'  => $this->get_about_image( $category ),
            'feature_1'    => $this->get_feature_image( $category, 1 ),
            'feature_2'    => $this->get_feature_image( $category, 2 ),
            'feature_3'    => $this->get_feature_image( $category, 3 ),
            'avatar_1'     => $this->get_avatar( 1 ),
            'avatar_2'     => $this->get_avatar( 2 ),
            'avatar_3'     => $this->get_avatar( 3 ),
        ];

        return $images;
    }

    /**
     * Get query string for category and image type
     *
     * @param string $category Business category
     * @param string $type Image type (hero, about, feature)
     * @return string Query string
     */
    private function get_query( $category, $type ) {
        $category = strtolower( $category );

        if ( isset( $this->category_queries[ $category ][ $type ] ) ) {
            return $this->category_queries[ $category ][ $type ];
        }

        return $this->category_queries['default'][ $type ];
    }

    /**
     * Build Unsplash Source URL
     *
     * @param string $query Search query
     * @param string $type Image type for dimensions
     * @param int $sig Signature for cache busting/variety
     * @return string Complete URL
     */
    private function build_unsplash_url( $query, $type, $sig = 0 ) {
        $dims = $this->dimensions[ $type ] ?? $this->dimensions['feature'];
        $width = $dims['width'];
        $height = $dims['height'];

        // Use Unsplash Source API (free, no auth required)
        // Format: https://source.unsplash.com/{WIDTH}x{HEIGHT}/?{QUERY}
        $base_url = "https://source.unsplash.com/{$width}x{$height}/";

        // Clean and encode query
        $query = str_replace( ' ', ',', $query );
        $encoded_query = urlencode( $query );

        // Add signature for variety (different images for same query)
        if ( $sig > 0 ) {
            $encoded_query .= "&sig={$sig}";
        }

        return $base_url . '?' . $encoded_query;
    }

    /**
     * Get placeholder image as fallback
     *
     * @param string $type Image type
     * @param string $text Optional text to display
     * @return string Placeholder URL
     */
    public function get_placeholder( $type = 'feature', $text = '' ) {
        $dims = $this->dimensions[ $type ] ?? $this->dimensions['feature'];
        $width = $dims['width'];
        $height = $dims['height'];

        // Use placehold.co as fallback
        $url = "https://placehold.co/{$width}x{$height}";

        if ( ! empty( $text ) ) {
            $url .= '?text=' . urlencode( $text );
        }

        return $url;
    }

    /**
     * Get category-specific food images for restaurants
     *
     * @param string $dish_type Type of dish
     * @return string Image URL
     */
    public function get_food_image( $dish_type = 'food' ) {
        $food_queries = [
            'pizza'     => 'pizza,italian-food',
            'pasta'     => 'pasta,spaghetti,italian',
            'burger'    => 'burger,hamburger,gourmet',
            'sushi'     => 'sushi,japanese-food',
            'salad'     => 'salad,healthy-food',
            'dessert'   => 'dessert,cake,sweet',
            'coffee'    => 'coffee,latte,cafe',
            'default'   => 'food,dish,gourmet',
        ];

        $query = $food_queries[ strtolower( $dish_type ) ] ?? $food_queries['default'];
        return $this->build_unsplash_url( $query, 'feature' );
    }

    /**
     * Add custom category queries
     *
     * @param string $category Category name
     * @param array $queries Queries for hero, about, feature
     */
    public function add_category( $category, $queries ) {
        $this->category_queries[ strtolower( $category ) ] = $queries;
    }

    /**
     * Get available categories
     *
     * @return array List of category names
     */
    public function get_categories() {
        return array_keys( $this->category_queries );
    }
}
