<?php
/**
 * Layout Manager - Handles layout presets for site generation
 *
 * @package PressPilot_Factory
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PressPilot_Factory_Layout_Manager {

    /**
     * Available layout presets
     *
     * @var array
     */
    private $presets = [];

    /**
     * Path to presets file
     *
     * @var string
     */
    private $presets_file;

    /**
     * Constructor
     */
    public function __construct() {
        $this->presets_file = PRESSPILOT_FACTORY_PATH . 'layouts/presets.json';
        $this->load_presets();
    }

    /**
     * Load presets from JSON file
     */
    private function load_presets() {
        if ( file_exists( $this->presets_file ) ) {
            $json = file_get_contents( $this->presets_file );
            $this->presets = json_decode( $json, true );

            if ( json_last_error() !== JSON_ERROR_NONE ) {
                error_log( 'PressPilot Layout Manager - Failed to parse presets.json: ' . json_last_error_msg() );
                $this->presets = [];
            }
        } else {
            error_log( 'PressPilot Layout Manager - presets.json not found at: ' . $this->presets_file );
        }
    }

    /**
     * Get a specific preset configuration
     *
     * @param string $name Preset name (modern, classic, minimal, elegant)
     * @return array Preset configuration or default
     */
    public function get_preset( $name ) {
        if ( isset( $this->presets[ $name ] ) ) {
            return $this->presets[ $name ];
        }

        // Return modern as default
        if ( isset( $this->presets['modern'] ) ) {
            return $this->presets['modern'];
        }

        // Fallback if no presets loaded
        return [
            'name' => 'Default',
            'patterns' => [
                'hero' => 'hero',
                'features' => 'features',
                'testimonials' => 'testimonials',
                'cta' => 'cta',
            ],
        ];
    }

    /**
     * Get the actual pattern name for a given pattern type and layout preset
     *
     * @param string $layout_name The layout preset name
     * @param string $pattern_type The generic pattern type (hero, features, etc.)
     * @return string The actual pattern file name to use
     */
    public function get_pattern_name( $layout_name, $pattern_type ) {
        $preset = $this->get_preset( $layout_name );

        if ( isset( $preset['patterns'][ $pattern_type ] ) ) {
            return $preset['patterns'][ $pattern_type ];
        }

        // Return the generic pattern type as fallback
        return $pattern_type;
    }

    /**
     * Get all available preset names
     *
     * @return array List of preset names
     */
    public function get_available_presets() {
        return array_keys( $this->presets );
    }

    /**
     * Check if a preset exists
     *
     * @param string $name Preset name
     * @return bool
     */
    public function preset_exists( $name ) {
        return isset( $this->presets[ $name ] );
    }

    /**
     * Get preset metadata for display
     *
     * @param string $name Preset name
     * @return array
     */
    public function get_preset_info( $name ) {
        $preset = $this->get_preset( $name );

        return [
            'name'        => $preset['name'] ?? $name,
            'description' => $preset['description'] ?? '',
        ];
    }

    /**
     * Get colors preset hint (for potential future auto-color selection)
     *
     * @param string $layout_name Layout preset name
     * @return string Colors preset hint
     */
    public function get_colors_preset( $layout_name ) {
        $preset = $this->get_preset( $layout_name );
        return $preset['colors_preset'] ?? 'default';
    }
}
