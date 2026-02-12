<?php
/**
 * Pattern Assembler Class
 * 
 * Assembles pre-validated patterns with AI-generated content.
 * This is the core of the new PressPilot v2 architecture.
 * 
 * Key principle: AI generates JSON content, patterns stay valid.
 * 
 * @package PressPilot
 * @version 2.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PressPilot_Pattern_Assembler {

    /**
     * Path to pattern files
     *
     * @var string
     */
    private $patterns_path;

    /**
     * Pattern registry data
     *
     * @var array
     */
    private $registry;

    /**
     * Constructor
     *
     * @param string $patterns_path Path to patterns directory
     */
    public function __construct( $patterns_path = null ) {
        $this->patterns_path = $patterns_path ?: dirname( __FILE__ ) . '/patterns/';
        $this->load_registry();
        $this->load_helpers();
    }

    /**
     * Load pattern registry
     */
    private function load_registry() {
        $registry_file = dirname( __FILE__ ) . '/config/pattern-registry.json';
        
        if ( file_exists( $registry_file ) ) {
            $this->registry = json_decode( file_get_contents( $registry_file ), true );
        } else {
            $this->registry = array( 'patterns' => array() );
        }
    }

    /**
     * Load helper functions
     */
    private function load_helpers() {
        $helpers_file = $this->patterns_path . 'pattern-helpers.php';
        
        if ( file_exists( $helpers_file ) ) {
            require_once $helpers_file;
        }
    }

    /**
     * Get all available patterns
     *
     * @param string $category Optional category filter
     * @return array
     */
    public function get_patterns( $category = null ) {
        $patterns = $this->registry['patterns'] ?? array();
        
        if ( $category ) {
            $patterns = array_filter( $patterns, function( $p ) use ( $category ) {
                return $p['category'] === $category;
            });
        }
        
        return array_values( $patterns );
    }

    /**
     * Get a single pattern by ID
     *
     * @param string $pattern_id Pattern identifier
     * @return array|null
     */
    public function get_pattern( $pattern_id ) {
        foreach ( $this->registry['patterns'] as $pattern ) {
            if ( $pattern['id'] === $pattern_id ) {
                return $pattern;
            }
        }
        return null;
    }

    /**
     * Get template definition
     *
     * @param string $template_name Template name (restaurant, business, etc.)
     * @return array|null
     */
    public function get_template( $template_name ) {
        return $this->registry['templates'][ $template_name ] ?? null;
    }

    /**
     * Assemble a pattern with content
     *
     * @param string $pattern_id Pattern identifier
     * @param array  $strings    String replacements (slug => value)
     * @param array  $images     Image replacements (slug => url)
     * @return string Generated block markup
     */
    public function assemble_pattern( $pattern_id, $strings = array(), $images = array() ) {
        $pattern = $this->get_pattern( $pattern_id );
        
        if ( ! $pattern ) {
            return '';
        }
        
        $pattern_file = $this->patterns_path . str_replace( 'patterns/', '', $pattern['file'] );
        
        if ( ! file_exists( $pattern_file ) ) {
            return '';
        }
        
        // Set the strings and images for this pattern
        if ( function_exists( 'presspilot_set_strings' ) ) {
            presspilot_set_strings( $strings );
        }
        
        if ( function_exists( 'presspilot_set_images' ) ) {
            presspilot_set_images( $images );
        }
        
        // Capture pattern output
        ob_start();
        include $pattern_file;
        $output = ob_get_clean();
        
        // Reset globals
        if ( function_exists( 'presspilot_set_strings' ) ) {
            presspilot_set_strings( array() );
        }
        
        if ( function_exists( 'presspilot_set_images' ) ) {
            presspilot_set_images( array() );
        }
        
        return $output;
    }

    /**
     * Assemble a complete page from pattern selections
     *
     * @param array $selections Array of pattern selections with content
     *                          [
     *                            ['id' => 'header-centered', 'strings' => [...], 'images' => [...]],
     *                            ['id' => 'hero-cover', 'strings' => [...], 'images' => [...]],
     *                            ...
     *                          ]
     * @return string Complete page markup
     */
    public function assemble_page( $selections ) {
        $output = '';
        
        foreach ( $selections as $selection ) {
            if ( ! isset( $selection['id'] ) ) {
                continue;
            }
            
            $strings = $selection['strings'] ?? array();
            $images  = $selection['images'] ?? array();
            
            $pattern_output = $this->assemble_pattern( $selection['id'], $strings, $images );
            
            if ( $pattern_output ) {
                $output .= $pattern_output . "\n\n";
            }
        }
        
        return trim( $output );
    }

    /**
     * Assemble a complete template with content
     *
     * @param string $template_name Template identifier
     * @param array  $content       Content for all patterns
     *                              [
     *                                'header-centered' => ['strings' => [...], 'images' => [...]],
     *                                'hero-cover' => ['strings' => [...], 'images' => [...]],
     *                                ...
     *                              ]
     * @return string Complete page markup
     */
    public function assemble_template( $template_name, $content ) {
        $template = $this->get_template( $template_name );
        
        if ( ! $template ) {
            return '';
        }
        
        $selections = array();
        
        foreach ( $template['patterns'] as $pattern_id ) {
            $pattern_content = $content[ $pattern_id ] ?? array();
            
            $selections[] = array(
                'id'      => $pattern_id,
                'strings' => $pattern_content['strings'] ?? array(),
                'images'  => $pattern_content['images'] ?? array(),
            );
        }
        
        return $this->assemble_page( $selections );
    }

    /**
     * Generate theme.json from brand colors
     *
     * @param array $colors Brand color palette
     *                      [
     *                        'primary' => '#2563eb',
     *                        'secondary' => '#64748b',
     *                        'accent' => '#f59e0b',
     *                        'background' => '#ffffff',
     *                        'foreground' => '#1e293b',
     *                        'tertiary' => '#f8fafc',
     *                      ]
     * @return string theme.json content
     */
    public function generate_theme_json( $colors ) {
        $template_file = dirname( __FILE__ ) . '/templates/theme.json.template';
        
        if ( ! file_exists( $template_file ) ) {
            return '';
        }
        
        $content = file_get_contents( $template_file );
        
        // Replace color placeholders
        $replacements = array(
            '#PRESSPILOT_PRIMARY#'    => $colors['primary'] ?? '#2563eb',
            '#PRESSPILOT_SECONDARY#'  => $colors['secondary'] ?? '#64748b',
            '#PRESSPILOT_ACCENT#'     => $colors['accent'] ?? '#f59e0b',
            '#PRESSPILOT_BACKGROUND#' => $colors['background'] ?? '#ffffff',
            '#PRESSPILOT_FOREGROUND#' => $colors['foreground'] ?? '#1e293b',
            '#PRESSPILOT_TERTIARY#'   => $colors['tertiary'] ?? '#f8fafc',
        );
        
        $content = str_replace( array_keys( $replacements ), array_values( $replacements ), $content );
        
        return $content;
    }

    /**
     * Recommend patterns for a business type
     *
     * @param string $business_type Type of business (restaurant, ecommerce, etc.)
     * @return array Recommended pattern IDs
     */
    public function recommend_patterns( $business_type ) {
        $recommendations = array();
        
        foreach ( $this->registry['patterns'] as $pattern ) {
            $recommended_for = $pattern['recommended_for'] ?? array();
            
            if ( in_array( $business_type, $recommended_for ) || in_array( 'all', $recommended_for ) ) {
                $recommendations[] = $pattern['id'];
            }
        }
        
        return $recommendations;
    }

    /**
     * Get the JSON schema for AI content generation
     *
     * This schema tells the AI what content to generate for each pattern.
     *
     * @param array $pattern_ids Array of pattern IDs to include
     * @return array JSON schema for AI prompt
     */
    public function get_content_schema( $pattern_ids ) {
        $schema = array(
            'patterns' => array(),
        );
        
        foreach ( $pattern_ids as $pattern_id ) {
            $pattern = $this->get_pattern( $pattern_id );
            
            if ( ! $pattern ) {
                continue;
            }
            
            $pattern_schema = array(
                'id'          => $pattern_id,
                'name'        => $pattern['name'],
                'description' => $pattern['description'],
                'strings'     => array(),
                'images'      => array(),
            );
            
            // Add string fields
            foreach ( $pattern['strings'] ?? array() as $string ) {
                $pattern_schema['strings'][] = array(
                    'slug'        => $string['slug'],
                    'description' => $string['description'],
                    'max_length'  => $string['max_length'] ?? 100,
                );
            }
            
            // Add image fields
            foreach ( $pattern['images'] ?? array() as $image ) {
                $pattern_schema['images'][] = array(
                    'slug'        => $image['slug'],
                    'description' => $image['description'],
                    'size'        => $image['size'] ?? '800x600',
                );
            }
            
            $schema['patterns'][] = $pattern_schema;
        }
        
        return $schema;
    }

    /**
     * Validate content against pattern schema
     *
     * @param string $pattern_id Pattern identifier
     * @param array  $content    Content to validate
     * @return array Validation result ['valid' => bool, 'errors' => array]
     */
    public function validate_content( $pattern_id, $content ) {
        $pattern = $this->get_pattern( $pattern_id );
        
        if ( ! $pattern ) {
            return array(
                'valid'  => false,
                'errors' => array( 'Pattern not found: ' . $pattern_id ),
            );
        }
        
        $errors = array();
        
        // Validate strings
        foreach ( $pattern['strings'] ?? array() as $string ) {
            $slug = $string['slug'];
            
            if ( ! isset( $content['strings'][ $slug ] ) ) {
                // Not required, just use default
                continue;
            }
            
            $value = $content['strings'][ $slug ];
            $max_length = $string['max_length'] ?? 100;
            
            if ( strlen( $value ) > $max_length ) {
                $errors[] = sprintf(
                    'String "%s" exceeds max length of %d characters',
                    $slug,
                    $max_length
                );
            }
        }
        
        return array(
            'valid'  => empty( $errors ),
            'errors' => $errors,
        );
    }
}
