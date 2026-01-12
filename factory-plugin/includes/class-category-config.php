<?php
/**
 * Category Config - Defines category-specific pages, patterns, and features
 *
 * Centralizes all business category configurations for smart page generation
 *
 * @package PressPilot_Factory
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PressPilot_Factory_Category_Config {

    /**
     * Category definitions with pages, patterns, and features
     *
     * @var array
     */
    private static $categories = [
        'restaurant' => [
            'name'        => 'Restaurant',
            'description' => 'Restaurants, cafes, bakeries, food service',
            'pages'       => [
                'home' => [
                    'title'    => 'Home',
                    'patterns' => [ 'hero', 'features', 'testimonials', 'cta' ],
                    'priority' => 1,
                ],
                'menu' => [
                    'title'    => 'Menu',
                    'patterns' => [ 'menu-grid' ],
                    'priority' => 2,
                ],
                'about' => [
                    'title'    => 'About',
                    'patterns' => [ 'about-content', 'values-section' ],
                    'priority' => 3,
                ],
                'contact' => [
                    'title'    => 'Contact',
                    'patterns' => [ 'contact-form' ],
                    'priority' => 4,
                ],
            ],
            'features'    => [ 'reservations', 'delivery', 'catering', 'menu' ],
            'nav_order'   => [ 'home', 'menu', 'about', 'contact' ],
            'recommended_layout' => 'restaurant',
        ],

        'corporate' => [
            'name'        => 'Corporate',
            'description' => 'Professional services, consulting, B2B',
            'pages'       => [
                'home' => [
                    'title'    => 'Home',
                    'patterns' => [ 'hero', 'features', 'testimonials', 'cta' ],
                    'priority' => 1,
                ],
                'services' => [
                    'title'    => 'Services',
                    'patterns' => [ 'services-grid' ],
                    'priority' => 2,
                ],
                'about' => [
                    'title'    => 'About',
                    'patterns' => [ 'about-content', 'values-section' ],
                    'priority' => 3,
                ],
                'contact' => [
                    'title'    => 'Contact',
                    'patterns' => [ 'contact-form' ],
                    'priority' => 4,
                ],
            ],
            'features'    => [ 'case_studies', 'team', 'careers', 'clients' ],
            'nav_order'   => [ 'home', 'services', 'about', 'contact' ],
            'recommended_layout' => 'corporate',
        ],

        'ecommerce' => [
            'name'        => 'E-commerce',
            'description' => 'Online stores, retail, product sales',
            'pages'       => [
                'home' => [
                    'title'    => 'Home',
                    'patterns' => [ 'hero', 'features', 'testimonials', 'cta' ],
                    'priority' => 1,
                ],
                'shop' => [
                    'title'    => 'Shop',
                    'patterns' => [ 'shop-grid' ],
                    'priority' => 2,
                ],
                'about' => [
                    'title'    => 'About',
                    'patterns' => [ 'about-content', 'values-section' ],
                    'priority' => 3,
                ],
                'contact' => [
                    'title'    => 'Contact',
                    'patterns' => [ 'contact-form' ],
                    'priority' => 4,
                ],
            ],
            'features'    => [ 'cart', 'wishlist', 'reviews', 'shipping' ],
            'nav_order'   => [ 'home', 'shop', 'about', 'contact' ],
            'recommended_layout' => 'ecommerce',
        ],

        'agency' => [
            'name'        => 'Agency',
            'description' => 'Creative agencies, design studios, marketing',
            'pages'       => [
                'home' => [
                    'title'    => 'Home',
                    'patterns' => [ 'hero', 'features', 'testimonials', 'cta' ],
                    'priority' => 1,
                ],
                'work' => [
                    'title'    => 'Work',
                    'patterns' => [ 'services-grid' ],
                    'priority' => 2,
                ],
                'about' => [
                    'title'    => 'About',
                    'patterns' => [ 'about-content', 'values-section' ],
                    'priority' => 3,
                ],
                'contact' => [
                    'title'    => 'Contact',
                    'patterns' => [ 'contact-form' ],
                    'priority' => 4,
                ],
            ],
            'features'    => [ 'portfolio', 'case_studies', 'process', 'team' ],
            'nav_order'   => [ 'home', 'work', 'about', 'contact' ],
            'recommended_layout' => 'agency',
        ],

        'startup' => [
            'name'        => 'Startup',
            'description' => 'Tech startups, SaaS, software products',
            'pages'       => [
                'home' => [
                    'title'    => 'Home',
                    'patterns' => [ 'hero', 'features', 'testimonials', 'cta' ],
                    'priority' => 1,
                ],
                'features' => [
                    'title'    => 'Features',
                    'patterns' => [ 'features', 'services-grid' ],
                    'priority' => 2,
                ],
                'pricing' => [
                    'title'    => 'Pricing',
                    'patterns' => [ 'services-grid' ],
                    'priority' => 3,
                ],
                'about' => [
                    'title'    => 'About',
                    'patterns' => [ 'about-content', 'values-section' ],
                    'priority' => 4,
                ],
                'contact' => [
                    'title'    => 'Contact',
                    'patterns' => [ 'contact-form' ],
                    'priority' => 5,
                ],
            ],
            'features'    => [ 'demo', 'integrations', 'api', 'support' ],
            'nav_order'   => [ 'home', 'features', 'pricing', 'about', 'contact' ],
            'recommended_layout' => 'startup',
        ],

        'local' => [
            'name'        => 'Local Business',
            'description' => 'Local services, trades, small businesses',
            'pages'       => [
                'home' => [
                    'title'    => 'Home',
                    'patterns' => [ 'hero', 'features', 'testimonials', 'cta' ],
                    'priority' => 1,
                ],
                'services' => [
                    'title'    => 'Services',
                    'patterns' => [ 'services-grid' ],
                    'priority' => 2,
                ],
                'about' => [
                    'title'    => 'About',
                    'patterns' => [ 'about-content', 'values-section' ],
                    'priority' => 3,
                ],
                'contact' => [
                    'title'    => 'Contact',
                    'patterns' => [ 'contact-form' ],
                    'priority' => 4,
                ],
            ],
            'features'    => [ 'reviews', 'map', 'hours', 'booking' ],
            'nav_order'   => [ 'home', 'services', 'about', 'contact' ],
            'recommended_layout' => 'local',
        ],

        'healthcare' => [
            'name'        => 'Healthcare',
            'description' => 'Medical practices, clinics, wellness',
            'pages'       => [
                'home' => [
                    'title'    => 'Home',
                    'patterns' => [ 'hero', 'features', 'testimonials', 'cta' ],
                    'priority' => 1,
                ],
                'services' => [
                    'title'    => 'Services',
                    'patterns' => [ 'services-grid' ],
                    'priority' => 2,
                ],
                'about' => [
                    'title'    => 'About',
                    'patterns' => [ 'about-content', 'values-section' ],
                    'priority' => 3,
                ],
                'contact' => [
                    'title'    => 'Contact',
                    'patterns' => [ 'contact-form' ],
                    'priority' => 4,
                ],
            ],
            'features'    => [ 'appointments', 'team', 'insurance', 'emergency' ],
            'nav_order'   => [ 'home', 'services', 'about', 'contact' ],
            'recommended_layout' => 'corporate',
        ],

        'realestate' => [
            'name'        => 'Real Estate',
            'description' => 'Real estate agents, property listings',
            'pages'       => [
                'home' => [
                    'title'    => 'Home',
                    'patterns' => [ 'hero', 'features', 'testimonials', 'cta' ],
                    'priority' => 1,
                ],
                'listings' => [
                    'title'    => 'Listings',
                    'patterns' => [ 'services-grid' ],
                    'priority' => 2,
                ],
                'about' => [
                    'title'    => 'About',
                    'patterns' => [ 'about-content', 'values-section' ],
                    'priority' => 3,
                ],
                'contact' => [
                    'title'    => 'Contact',
                    'patterns' => [ 'contact-form' ],
                    'priority' => 4,
                ],
            ],
            'features'    => [ 'listings', 'virtual_tours', 'mortgage', 'area_guide' ],
            'nav_order'   => [ 'home', 'listings', 'about', 'contact' ],
            'recommended_layout' => 'classic',
        ],

        'fitness' => [
            'name'        => 'Fitness',
            'description' => 'Gyms, personal trainers, fitness studios',
            'pages'       => [
                'home' => [
                    'title'    => 'Home',
                    'patterns' => [ 'hero', 'features', 'testimonials', 'cta' ],
                    'priority' => 1,
                ],
                'classes' => [
                    'title'    => 'Classes',
                    'patterns' => [ 'services-grid' ],
                    'priority' => 2,
                ],
                'about' => [
                    'title'    => 'About',
                    'patterns' => [ 'about-content', 'values-section' ],
                    'priority' => 3,
                ],
                'contact' => [
                    'title'    => 'Contact',
                    'patterns' => [ 'contact-form' ],
                    'priority' => 4,
                ],
            ],
            'features'    => [ 'schedule', 'membership', 'trainers', 'equipment' ],
            'nav_order'   => [ 'home', 'classes', 'about', 'contact' ],
            'recommended_layout' => 'bold',
        ],

        'education' => [
            'name'        => 'Education',
            'description' => 'Schools, tutoring, online courses',
            'pages'       => [
                'home' => [
                    'title'    => 'Home',
                    'patterns' => [ 'hero', 'features', 'testimonials', 'cta' ],
                    'priority' => 1,
                ],
                'courses' => [
                    'title'    => 'Courses',
                    'patterns' => [ 'services-grid' ],
                    'priority' => 2,
                ],
                'about' => [
                    'title'    => 'About',
                    'patterns' => [ 'about-content', 'values-section' ],
                    'priority' => 3,
                ],
                'contact' => [
                    'title'    => 'Contact',
                    'patterns' => [ 'contact-form' ],
                    'priority' => 4,
                ],
            ],
            'features'    => [ 'enrollment', 'curriculum', 'instructors', 'certification' ],
            'nav_order'   => [ 'home', 'courses', 'about', 'contact' ],
            'recommended_layout' => 'modern',
        ],
    ];

    /**
     * Get pages for a category
     *
     * @param string $category Category name
     * @return array Pages configuration
     */
    public static function get_pages( $category ) {
        $category = strtolower( $category );

        if ( isset( self::$categories[ $category ] ) ) {
            return self::$categories[ $category ]['pages'];
        }

        // Default to corporate if category not found
        return self::$categories['corporate']['pages'];
    }

    /**
     * Get navigation order for a category
     *
     * @param string $category Category name
     * @return array Ordered array of page slugs
     */
    public static function get_nav_order( $category ) {
        $category = strtolower( $category );

        if ( isset( self::$categories[ $category ] ) ) {
            return self::$categories[ $category ]['nav_order'];
        }

        return self::$categories['corporate']['nav_order'];
    }

    /**
     * Get features for a category
     *
     * @param string $category Category name
     * @return array Available features
     */
    public static function get_features( $category ) {
        $category = strtolower( $category );

        if ( isset( self::$categories[ $category ] ) ) {
            return self::$categories[ $category ]['features'];
        }

        return [];
    }

    /**
     * Get recommended layout for a category
     *
     * @param string $category Category name
     * @return string Layout name
     */
    public static function get_recommended_layout( $category ) {
        $category = strtolower( $category );

        if ( isset( self::$categories[ $category ] ) ) {
            return self::$categories[ $category ]['recommended_layout'];
        }

        return 'modern';
    }

    /**
     * Get all available categories
     *
     * @return array List of category names
     */
    public static function get_all_categories() {
        return array_keys( self::$categories );
    }

    /**
     * Get category info
     *
     * @param string $category Category name
     * @return array|null Category info or null
     */
    public static function get_category_info( $category ) {
        $category = strtolower( $category );

        if ( isset( self::$categories[ $category ] ) ) {
            return [
                'name'        => self::$categories[ $category ]['name'],
                'description' => self::$categories[ $category ]['description'],
            ];
        }

        return null;
    }

    /**
     * Check if category exists
     *
     * @param string $category Category name
     * @return bool
     */
    public static function category_exists( $category ) {
        return isset( self::$categories[ strtolower( $category ) ] );
    }

    /**
     * Get page patterns for a specific page in a category
     *
     * @param string $category Category name
     * @param string $page_slug Page slug
     * @return array Patterns for the page
     */
    public static function get_page_patterns( $category, $page_slug ) {
        $pages = self::get_pages( $category );

        if ( isset( $pages[ $page_slug ] ) ) {
            return $pages[ $page_slug ]['patterns'];
        }

        return [];
    }

    /**
     * Get full category configuration
     *
     * @param string $category Category name
     * @return array|null Full configuration or null
     */
    public static function get_full_config( $category ) {
        $category = strtolower( $category );

        if ( isset( self::$categories[ $category ] ) ) {
            return self::$categories[ $category ];
        }

        return null;
    }

    /**
     * Add or override a category configuration
     *
     * @param string $category Category name
     * @param array $config Category configuration
     */
    public static function set_category( $category, $config ) {
        self::$categories[ strtolower( $category ) ] = $config;
    }
}
