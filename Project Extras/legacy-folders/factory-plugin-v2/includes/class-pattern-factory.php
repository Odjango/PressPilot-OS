<?php
/**
 * Pattern Factory - Creates theme patterns and template parts
 * 
 * Uses Block Builder to create valid WordPress block content
 * for headers, footers, and page sections.
 *
 * @package PressPilot_Factory
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PressPilot_Pattern_Factory {

    /**
     * Block Builder instance
     */
    private $builder;

    /**
     * Constructor
     *
     * @param PressPilot_Block_Builder $builder Block builder instance
     */
    public function __construct( PressPilot_Block_Builder $builder ) {
        $this->builder = $builder;
    }

    /**
     * Create header template part
     *
     * @param array $config Header configuration
     * @return string Serialized block content
     */
    public function create_header( $config = array() ) {
        $config = wp_parse_args( $config, array(
            'style'      => 'default',
            'show_logo'  => true,
            'navigation' => array( 'Home', 'About', 'Services', 'Contact' ),
        ) );

        // Build header inner content based on style
        switch ( $config['style'] ) {
            case 'centered':
                $header_content = $this->create_centered_header( $config );
                break;
            case 'minimal':
                $header_content = $this->create_minimal_header( $config );
                break;
            default:
                $header_content = $this->create_default_header( $config );
        }

        // Wrap in header group
        $header = $this->builder->group(
            $header_content,
            array(
                'tagName' => 'header',
                'layout'  => array( 'type' => 'constrained' ),
                'style'   => array(
                    'spacing' => array(
                        'padding' => array(
                            'top'    => '1rem',
                            'bottom' => '1rem',
                        ),
                    ),
                ),
            )
        );

        return $this->builder->serialize( array( $header ) );
    }

    /**
     * Default header layout - logo left, nav right
     */
    private function create_default_header( $config ) {
        $left_content = array();
        $right_content = array();

        // Logo or site title on left
        if ( $config['show_logo'] ) {
            $left_content[] = $this->builder->site_logo( 120 );
        } else {
            $left_content[] = $this->builder->site_title();
        }

        // Navigation on right
        if ( ! empty( $config['navigation'] ) ) {
            $right_content[] = $this->builder->navigation( $config['navigation'] );
        }

        return array(
            $this->builder->row(
                array(
                    $this->builder->group( $left_content, array(
                        'layout' => array( 'type' => 'flex' ),
                    ) ),
                    $this->builder->group( $right_content, array(
                        'layout' => array( 'type' => 'flex' ),
                    ) ),
                ),
                array(
                    'layout' => array(
                        'type'           => 'flex',
                        'justifyContent' => 'space-between',
                        'flexWrap'       => 'wrap',
                    ),
                )
            ),
        );
    }

    /**
     * Centered header layout - logo top center, nav below
     */
    private function create_centered_header( $config ) {
        $content = array();

        // Logo centered
        if ( $config['show_logo'] ) {
            $content[] = $this->builder->group(
                array( $this->builder->site_logo( 150 ) ),
                array( 'layout' => array( 'type' => 'flex', 'justifyContent' => 'center' ) )
            );
        } else {
            $content[] = $this->builder->group(
                array( $this->builder->site_title() ),
                array( 'layout' => array( 'type' => 'flex', 'justifyContent' => 'center' ) )
            );
        }

        // Navigation centered below
        if ( ! empty( $config['navigation'] ) ) {
            $content[] = $this->builder->group(
                array( $this->builder->navigation( $config['navigation'] ) ),
                array( 'layout' => array( 'type' => 'flex', 'justifyContent' => 'center' ) )
            );
        }

        return $content;
    }

    /**
     * Minimal header - just site title and nav inline
     */
    private function create_minimal_header( $config ) {
        $content = array(
            $this->builder->site_title(),
        );

        if ( ! empty( $config['navigation'] ) ) {
            $content[] = $this->builder->navigation( $config['navigation'] );
        }

        return array(
            $this->builder->row( $content ),
        );
    }

    /**
     * Create footer template part (PressPilot branded)
     *
     * @param array $config Footer configuration
     * @return string Serialized block content
     */
    public function create_footer( $config = array() ) {
        $config = wp_parse_args( $config, array(
            'style'       => 'presspilot-branded',
            'show_social' => false,
            'copyright'   => '© ' . date( 'Y' ) . ' All rights reserved.',
            'columns'     => array(),
        ) );

        $footer_content = array();

        // Main footer content area
        if ( ! empty( $config['columns'] ) ) {
            $columns = array();
            foreach ( $config['columns'] as $col ) {
                $col_content = array();
                if ( ! empty( $col['title'] ) ) {
                    $col_content[] = $this->builder->heading( $col['title'], 4 );
                }
                if ( ! empty( $col['content'] ) ) {
                    $col_content[] = $this->builder->paragraph( $col['content'] );
                }
                $columns[] = $this->builder->column( $col_content );
            }
            $footer_content[] = $this->builder->columns( $columns );
        }

        // Separator
        $footer_content[] = $this->builder->separator();

        // Copyright and PressPilot branding
        $footer_content[] = $this->builder->row(
            array(
                $this->builder->paragraph( $config['copyright'], array(
                    'style' => array(
                        'typography' => array( 'fontSize' => '0.875rem' ),
                    ),
                ) ),
                $this->builder->paragraph(
                    'Powered by <a href="https://presspilot.io" target="_blank" rel="noopener">PressPilot</a>',
                    array(
                        'style' => array(
                            'typography' => array( 'fontSize' => '0.875rem' ),
                        ),
                    )
                ),
            ),
            array(
                'layout' => array(
                    'type'           => 'flex',
                    'justifyContent' => 'space-between',
                    'flexWrap'       => 'wrap',
                ),
            )
        );

        // Wrap in footer group
        $footer = $this->builder->group(
            $footer_content,
            array(
                'tagName' => 'footer',
                'layout'  => array( 'type' => 'constrained' ),
                'style'   => array(
                    'spacing' => array(
                        'padding' => array(
                            'top'    => '3rem',
                            'bottom' => '2rem',
                        ),
                    ),
                    'color' => array(
                        'background' => '#1e1e1e',
                        'text'       => '#ffffff',
                    ),
                ),
            )
        );

        return $this->builder->serialize( array( $footer ) );
    }

    /**
     * Create front page template
     *
     * @param array $content Page content configuration
     * @return string Serialized block content
     */
    public function create_front_page( $content = array() ) {
        $blocks = array();

        // Header template part
        $blocks[] = $this->builder->block( 'core/template-part', array(
            'slug' => 'header',
            'area' => 'header',
        ) );

        // Main content wrapper
        $main_content = array();

        // Hero section
        if ( ! empty( $content['hero'] ) ) {
            $hero = $content['hero'];
            $main_content[] = $this->builder->hero(
                $hero['headline'] ?? 'Welcome',
                $hero['subheadline'] ?? '',
                $hero['cta_text'] ?? '',
                $hero['cta_link'] ?? '#'
            );
        }

        // Dynamic sections
        if ( ! empty( $content['sections'] ) ) {
            foreach ( $content['sections'] as $section ) {
                $main_content[] = $this->create_section( $section, false );
            }
        }

        // Wrap main content
        $blocks[] = $this->builder->group(
            $main_content,
            array(
                'tagName' => 'main',
                'layout'  => array( 'type' => 'default' ),
            )
        );

        // Footer template part
        $blocks[] = $this->builder->block( 'core/template-part', array(
            'slug' => 'footer',
            'area' => 'footer',
        ) );

        return $this->builder->serialize( $blocks );
    }

    /**
     * Create a section based on type
     *
     * @param array $section Section configuration
     * @param bool  $serialize Whether to serialize (for patterns) or return block array
     * @return string|array Serialized content or block array
     */
    public function create_section( $section, $serialize = true ) {
        $type = $section['type'] ?? 'generic';

        switch ( $type ) {
            case 'features':
                $block = $this->create_features_section( $section );
                break;

            case 'cta':
                $block = $this->create_cta_section( $section );
                break;

            case 'testimonials':
                $block = $this->create_testimonials_section( $section );
                break;

            case 'gallery':
                $block = $this->create_gallery_section( $section );
                break;

            case 'text':
            case 'content':
                $block = $this->create_text_section( $section );
                break;

            case 'hero':
                $block = $this->builder->hero(
                    $section['headline'] ?? 'Headline',
                    $section['subheadline'] ?? '',
                    $section['cta_text'] ?? '',
                    $section['cta_link'] ?? '#'
                );
                break;

            default:
                $block = $this->create_generic_section( $section );
        }

        return $serialize ? $this->builder->serialize( array( $block ) ) : $block;
    }

    /**
     * Create features section
     */
    private function create_features_section( $section ) {
        $items = $section['items'] ?? array();

        if ( ! empty( $section['title'] ) ) {
            $title_block = $this->builder->heading( $section['title'], 2, array( 'textAlign' => 'center' ) );
            
            return $this->builder->group(
                array(
                    $title_block,
                    $this->builder->features_grid( $items ),
                ),
                array(
                    'style' => array(
                        'spacing' => array(
                            'padding' => array( 'top' => '4rem', 'bottom' => '4rem' ),
                        ),
                    ),
                )
            );
        }

        return $this->builder->features_grid( $items );
    }

    /**
     * Create CTA section
     */
    private function create_cta_section( $section ) {
        return $this->builder->cta_section(
            $section['headline'] ?? 'Ready to Get Started?',
            $section['description'] ?? '',
            $section['button_text'] ?? 'Contact Us',
            $section['button_url'] ?? '#contact'
        );
    }

    /**
     * Create testimonials section
     */
    private function create_testimonials_section( $section ) {
        $testimonials = $section['items'] ?? array();
        $columns = array();

        foreach ( $testimonials as $testimonial ) {
            $column_content = array(
                $this->builder->paragraph( '"' . ( $testimonial['quote'] ?? '' ) . '"', array(
                    'style' => array(
                        'typography' => array( 'fontStyle' => 'italic' ),
                    ),
                ) ),
                $this->builder->paragraph( '— ' . ( $testimonial['author'] ?? 'Anonymous' ), array(
                    'style' => array(
                        'typography' => array( 'fontWeight' => 'bold' ),
                    ),
                ) ),
            );

            $columns[] = $this->builder->column( $column_content );
        }

        $content = array();
        
        if ( ! empty( $section['title'] ) ) {
            $content[] = $this->builder->heading( $section['title'], 2, array( 'textAlign' => 'center' ) );
        }

        $content[] = $this->builder->columns( $columns );

        return $this->builder->group( $content, array(
            'style' => array(
                'spacing' => array(
                    'padding' => array( 'top' => '4rem', 'bottom' => '4rem' ),
                ),
                'color' => array(
                    'background' => '#f5f5f5',
                ),
            ),
        ) );
    }

    /**
     * Create gallery section
     */
    private function create_gallery_section( $section ) {
        $images = $section['images'] ?? array();
        $gallery_items = array();

        foreach ( $images as $image ) {
            $gallery_items[] = $this->builder->image(
                $image['url'] ?? '',
                $image['alt'] ?? ''
            );
        }

        $content = array();

        if ( ! empty( $section['title'] ) ) {
            $content[] = $this->builder->heading( $section['title'], 2, array( 'textAlign' => 'center' ) );
        }

        $content[] = $this->builder->block( 'core/gallery', array(
            'columns'   => min( count( $gallery_items ), 3 ),
            'linkTo'    => 'none',
            'imageCrop' => true,
        ), $gallery_items );

        return $this->builder->group( $content, array(
            'style' => array(
                'spacing' => array(
                    'padding' => array( 'top' => '4rem', 'bottom' => '4rem' ),
                ),
            ),
        ) );
    }

    /**
     * Create text/content section
     */
    private function create_text_section( $section ) {
        $content = array();

        if ( ! empty( $section['title'] ) ) {
            $content[] = $this->builder->heading( $section['title'], 2 );
        }

        if ( ! empty( $section['content'] ) ) {
            // Split content into paragraphs
            $paragraphs = explode( "\n\n", $section['content'] );
            foreach ( $paragraphs as $para ) {
                if ( trim( $para ) ) {
                    $content[] = $this->builder->paragraph( trim( $para ) );
                }
            }
        }

        return $this->builder->group( $content, array(
            'layout' => array( 'type' => 'constrained' ),
            'style'  => array(
                'spacing' => array(
                    'padding' => array( 'top' => '3rem', 'bottom' => '3rem' ),
                ),
            ),
        ) );
    }

    /**
     * Create generic section (fallback)
     */
    private function create_generic_section( $section ) {
        $content = array();

        if ( ! empty( $section['title'] ) ) {
            $content[] = $this->builder->heading( $section['title'], 2, array( 'textAlign' => 'center' ) );
        }

        if ( ! empty( $section['description'] ) ) {
            $content[] = $this->builder->paragraph( $section['description'], array( 'align' => 'center' ) );
        }

        return $this->builder->group( $content, array(
            'style' => array(
                'spacing' => array(
                    'padding' => array( 'top' => '3rem', 'bottom' => '3rem' ),
                ),
            ),
        ) );
    }
}
