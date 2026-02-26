<?php
/**
 * Block Builder - Creates WordPress blocks using native APIs
 *
 * This class uses WordPress's serialize_blocks() function to ensure
 * all generated blocks are valid and properly formatted.
 *
 * Generated HTML must match WordPress's block save() output exactly,
 * otherwise the Site Editor shows "Attempt Recovery" errors.
 *
 * @package PressPilot_Factory
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PressPilot_Block_Builder {

    /**
     * Brand settings for styling
     */
    private $brand = array();

    /**
     * Constructor
     *
     * @param array $brand Brand configuration (colors, fonts, etc.)
     */
    public function __construct( $brand = array() ) {
        $this->brand = wp_parse_args( $brand, array(
            'primary_color'    => '#0073aa',
            'secondary_color'  => '#23282d',
            'background_color' => '#ffffff',
            'text_color'       => '#1e1e1e',
        ) );
    }

    /**
     * Create a block array structure (leaf blocks without wrapper HTML)
     *
     * @param string $name       Block name (e.g., 'core/group')
     * @param array  $attrs      Block attributes
     * @param array  $inner      Inner blocks
     * @param string $inner_html Inner HTML content
     * @return array Block structure
     */
    public function block( $name, $attrs = array(), $inner = array(), $inner_html = '' ) {
        $inner_content = array();

        if ( ! empty( $inner_html ) ) {
            $inner_content = array( $inner_html );
        } elseif ( ! empty( $inner ) ) {
            // Add null placeholders so serialize_blocks() recurses into children
            foreach ( $inner as $_ ) {
                $inner_content[] = null;
            }
        }

        return array(
            'blockName'    => $name,
            'attrs'        => $attrs,
            'innerBlocks'  => $inner,
            'innerHTML'    => $inner_html,
            'innerContent' => $inner_content,
        );
    }

    /**
     * Create a container block with proper wrapper HTML
     *
     * WordPress serialize_blocks() needs innerContent to contain:
     * 1. Opening wrapper HTML string
     * 2. null for each inner block (placeholder for recursive serialization)
     * 3. Closing wrapper HTML string
     *
     * The wrapper HTML must include classes and styles that WordPress's
     * block save() function would produce, matching the block attributes.
     *
     * @param string $name         Block name (e.g., 'core/group')
     * @param array  $attrs        Block attributes
     * @param array  $inner_blocks Inner blocks
     * @param string $tag          HTML tag for wrapper (default 'div')
     * @param string $extra_class  Additional CSS classes
     * @return array Block structure
     */
    private function container_block( $name, $attrs, $inner_blocks, $tag = 'div', $extra_class = '' ) {
        $block_slug  = str_replace( 'core/', '', $name );
        $block_class = 'wp-block-' . $block_slug;
        $classes     = array( $block_class );
        $styles      = array();

        if ( $extra_class ) {
            $classes[] = $extra_class;
        }

        // Named background color
        if ( ! empty( $attrs['backgroundColor'] ) ) {
            $classes[] = 'has-' . $attrs['backgroundColor'] . '-background-color';
            $classes[] = 'has-background';
        } elseif ( ! empty( $attrs['style']['color']['background'] ) ) {
            $classes[] = 'has-background';
            $styles[]  = 'background-color:' . $attrs['style']['color']['background'];
        }

        // Named text color
        if ( ! empty( $attrs['textColor'] ) ) {
            $classes[] = 'has-' . $attrs['textColor'] . '-color';
            $classes[] = 'has-text-color';
        } elseif ( ! empty( $attrs['style']['color']['text'] ) ) {
            $classes[] = 'has-text-color';
            $styles[]  = 'color:' . $attrs['style']['color']['text'];
        }

        // Padding
        if ( ! empty( $attrs['style']['spacing']['padding'] ) ) {
            $padding = $attrs['style']['spacing']['padding'];
            foreach ( array( 'top', 'right', 'bottom', 'left' ) as $side ) {
                if ( ! empty( $padding[ $side ] ) ) {
                    $styles[] = 'padding-' . $side . ':' . $padding[ $side ];
                }
            }
        }

        $class_str = implode( ' ', $classes );
        $style_str = ! empty( $styles ) ? ' style="' . esc_attr( implode( ';', $styles ) ) . '"' : '';

        $open_tag  = '<' . $tag . ' class="' . esc_attr( $class_str ) . '"' . $style_str . '>';
        $close_tag = '</' . $tag . '>';

        // Build innerContent: opening HTML, null per child, closing HTML
        $inner_content = array( $open_tag );
        foreach ( $inner_blocks as $_ ) {
            $inner_content[] = null;
        }
        $inner_content[] = $close_tag;

        return array(
            'blockName'    => $name,
            'attrs'        => $attrs,
            'innerBlocks'  => $inner_blocks,
            'innerHTML'    => $open_tag . $close_tag,
            'innerContent' => $inner_content,
        );
    }

    /**
     * Serialize blocks to valid WordPress block markup
     *
     * @param array $blocks Array of block structures
     * @return string Serialized block content
     */
    public function serialize( $blocks ) {
        return serialize_blocks( $blocks );
    }

    /**
     * Create a Group block (container)
     */
    public function group( $inner_blocks = array(), $attrs = array() ) {
        $default_attrs = array(
            'layout' => array( 'type' => 'constrained' ),
        );

        $merged = array_merge( $default_attrs, $attrs );
        $tag    = ! empty( $merged['tagName'] ) ? $merged['tagName'] : 'div';

        return $this->container_block( 'core/group', $merged, $inner_blocks, $tag );
    }

    /**
     * Create a Heading block
     *
     * WordPress 6.2+ adds class="wp-block-heading" to all headings.
     * textAlign produces has-text-align-{value} class.
     * Typography styles produce inline styles.
     */
    public function heading( $text, $level = 2, $attrs = array() ) {
        $tag     = 'h' . $level;
        $classes = array( 'wp-block-heading' );
        $styles  = array();

        // Text alignment
        if ( ! empty( $attrs['textAlign'] ) ) {
            $classes[] = 'has-text-align-' . $attrs['textAlign'];
        }

        // Named text color
        if ( ! empty( $attrs['textColor'] ) ) {
            $classes[] = 'has-' . $attrs['textColor'] . '-color';
            $classes[] = 'has-text-color';
        }

        // Font size
        if ( ! empty( $attrs['fontSize'] ) ) {
            $classes[] = 'has-' . $attrs['fontSize'] . '-font-size';
        } elseif ( ! empty( $attrs['style']['typography']['fontSize'] ) ) {
            $styles[] = 'font-size:' . $attrs['style']['typography']['fontSize'];
        }

        // Line height
        if ( ! empty( $attrs['style']['typography']['lineHeight'] ) ) {
            $styles[] = 'line-height:' . $attrs['style']['typography']['lineHeight'];
        }

        $class_str = ' class="' . esc_attr( implode( ' ', $classes ) ) . '"';
        $style_str = ! empty( $styles ) ? ' style="' . esc_attr( implode( ';', $styles ) ) . '"' : '';

        $html = "<{$tag}{$class_str}{$style_str}>" . esc_html( $text ) . "</{$tag}>";

        return $this->block(
            'core/heading',
            array_merge( array( 'level' => $level ), $attrs ),
            array(),
            $html
        );
    }

    /**
     * Create a Paragraph block
     *
     * align produces has-text-align-{value} class.
     * Typography and color styles produce inline styles/classes.
     */
    public function paragraph( $text, $attrs = array() ) {
        $classes = array();
        $styles  = array();

        // Text alignment
        if ( ! empty( $attrs['align'] ) ) {
            $classes[] = 'has-text-align-' . $attrs['align'];
        }

        // Named text color
        if ( ! empty( $attrs['textColor'] ) ) {
            $classes[] = 'has-' . $attrs['textColor'] . '-color';
            $classes[] = 'has-text-color';
        } elseif ( ! empty( $attrs['style']['color']['text'] ) ) {
            $classes[] = 'has-text-color';
            $styles[]  = 'color:' . $attrs['style']['color']['text'];
        }

        // Named font size
        if ( ! empty( $attrs['fontSize'] ) ) {
            $classes[] = 'has-' . $attrs['fontSize'] . '-font-size';
        } elseif ( ! empty( $attrs['style']['typography']['fontSize'] ) ) {
            $styles[] = 'font-size:' . $attrs['style']['typography']['fontSize'];
        }

        // Font style (italic)
        if ( ! empty( $attrs['style']['typography']['fontStyle'] ) ) {
            $styles[] = 'font-style:' . $attrs['style']['typography']['fontStyle'];
        }

        // Font weight (bold)
        if ( ! empty( $attrs['style']['typography']['fontWeight'] ) ) {
            $styles[] = 'font-weight:' . $attrs['style']['typography']['fontWeight'];
        }

        // Margin top (supports WP preset format var:preset|spacing|XX)
        if ( ! empty( $attrs['style']['spacing']['margin']['top'] ) ) {
            $val = $attrs['style']['spacing']['margin']['top'];
            if ( strpos( $val, 'var:preset|' ) === 0 ) {
                $val = 'var(--wp--preset--' . str_replace( '|', '--', substr( $val, 11 ) ) . ')';
            }
            $styles[] = 'margin-top:' . $val;
        }

        $class_str = ! empty( $classes ) ? ' class="' . esc_attr( implode( ' ', $classes ) ) . '"' : '';
        $style_str = ! empty( $styles ) ? ' style="' . esc_attr( implode( ';', $styles ) ) . '"' : '';

        $html = '<p' . $class_str . $style_str . '>' . wp_kses_post( $text ) . '</p>';

        return $this->block(
            'core/paragraph',
            $attrs,
            array(),
            $html
        );
    }

    /**
     * Create a Button block
     *
     * WordPress's button save() puts color classes and styles on the <a> tag,
     * not the outer wrapper. The wrapper is always <div class="wp-block-button">.
     */
    public function button( $text, $url = '#', $attrs = array() ) {
        $default_attrs = array(
            'style' => array(
                'color' => array(
                    'background' => $this->brand['primary_color'],
                ),
            ),
        );

        $merged = array_merge( $default_attrs, $attrs );

        // Build <a> tag classes and styles
        $link_classes = array( 'wp-block-button__link' );
        $link_styles  = array();

        // Named background color on link
        if ( ! empty( $merged['backgroundColor'] ) ) {
            $link_classes[] = 'has-' . $merged['backgroundColor'] . '-background-color';
            $link_classes[] = 'has-background';
        } elseif ( ! empty( $merged['style']['color']['background'] ) ) {
            $link_classes[] = 'has-background';
            $link_styles[]  = 'background-color:' . $merged['style']['color']['background'];
        }

        // Named text color on link
        if ( ! empty( $merged['textColor'] ) ) {
            $link_classes[] = 'has-' . $merged['textColor'] . '-color';
            $link_classes[] = 'has-text-color';
        } elseif ( ! empty( $merged['style']['color']['text'] ) ) {
            $link_classes[] = 'has-text-color';
            $link_styles[]  = 'color:' . $merged['style']['color']['text'];
        }

        // Border radius
        if ( ! empty( $merged['style']['border']['radius'] ) ) {
            $link_styles[] = 'border-radius:' . $merged['style']['border']['radius'];
        }

        // Font weight
        if ( ! empty( $merged['style']['typography']['fontWeight'] ) ) {
            $link_styles[] = 'font-weight:' . $merged['style']['typography']['fontWeight'];
        }

        // wp-element-button must come last
        $link_classes[] = 'wp-element-button';

        $link_class_str = implode( ' ', $link_classes );
        $link_style_str = ! empty( $link_styles ) ? ' style="' . esc_attr( implode( ';', $link_styles ) ) . '"' : '';

        $html = '<div class="wp-block-button"><a class="' . esc_attr( $link_class_str ) . '" href="' . esc_url( $url ) . '"' . $link_style_str . '>' . esc_html( $text ) . '</a></div>';

        return $this->block(
            'core/button',
            $merged,
            array(),
            $html
        );
    }

    /**
     * Create a Buttons container
     */
    public function buttons( $button_blocks = array(), $attrs = array() ) {
        return $this->container_block( 'core/buttons', $attrs, $button_blocks );
    }

    /**
     * Create an Image block
     */
    public function image( $url, $alt = '', $attrs = array() ) {
        $default_attrs = array(
            'url' => $url,
            'alt' => $alt,
        );

        return $this->block(
            'core/image',
            array_merge( $default_attrs, $attrs ),
            array(),
            '<figure class="wp-block-image"><img src="' . esc_url( $url ) . '" alt="' . esc_attr( $alt ) . '"/></figure>'
        );
    }

    /**
     * Create a Site Logo block (server-rendered, self-closing)
     */
    public function site_logo( $width = 120, $attrs = array() ) {
        return $this->block(
            'core/site-logo',
            array_merge( array( 'width' => $width ), $attrs )
        );
    }

    /**
     * Create a Site Title block (server-rendered, self-closing)
     */
    public function site_title( $attrs = array() ) {
        return $this->block(
            'core/site-title',
            $attrs
        );
    }

    /**
     * Create a Navigation block (server-rendered, inner blocks are nav links)
     */
    public function navigation( $items = array(), $attrs = array() ) {
        $default_attrs = array(
            'layout' => array(
                'type'        => 'flex',
                'orientation' => 'horizontal',
            ),
        );

        // Create navigation link blocks
        $nav_links = array();
        foreach ( $items as $item ) {
            $nav_links[] = $this->navigation_link( $item );
        }

        return $this->block(
            'core/navigation',
            array_merge( $default_attrs, $attrs ),
            $nav_links
        );
    }

    /**
     * Create a Navigation Link block (self-closing)
     */
    public function navigation_link( $item ) {
        $label = is_array( $item ) ? $item['label'] : $item;
        $url   = is_array( $item ) ? ( $item['url'] ?? '#' ) : '#';

        return $this->block(
            'core/navigation-link',
            array(
                'label' => $label,
                'url'   => $url,
            )
        );
    }

    /**
     * Create a Columns block
     */
    public function columns( $column_blocks = array(), $attrs = array() ) {
        return $this->container_block( 'core/columns', $attrs, $column_blocks );
    }

    /**
     * Create a Column block
     */
    public function column( $inner_blocks = array(), $attrs = array() ) {
        return $this->container_block( 'core/column', $attrs, $inner_blocks );
    }

    /**
     * Create a Cover block with proper overlay span and inner container
     *
     * WordPress's cover save() produces:
     * <div class="wp-block-cover" style="min-height:...">
     *   <span aria-hidden="true" class="wp-block-cover__background has-background-dim-XX has-background-dim ..."></span>
     *   <div class="wp-block-cover__inner-container">
     *     <!-- inner blocks -->
     *   </div>
     * </div>
     */
    public function cover( $inner_blocks = array(), $attrs = array() ) {
        $default_attrs = array(
            'dimRatio'           => 50,
            'isUserOverlayColor' => true,
            'minHeight'          => 500,
            'minHeightUnit'      => 'px',
        );

        $merged = array_merge( $default_attrs, $attrs );

        // --- Outer div ---
        $outer_styles = array();
        if ( ! empty( $merged['minHeight'] ) ) {
            $unit = ! empty( $merged['minHeightUnit'] ) ? $merged['minHeightUnit'] : 'px';
            $outer_styles[] = 'min-height:' . $merged['minHeight'] . $unit;
        }
        $outer_style_str = ! empty( $outer_styles ) ? ' style="' . esc_attr( implode( ';', $outer_styles ) ) . '"' : '';

        // --- Overlay span ---
        $span_classes = array( 'wp-block-cover__background' );
        $span_styles  = array();

        // Named overlay color
        if ( ! empty( $merged['overlayColor'] ) ) {
            $span_classes[] = 'has-' . $merged['overlayColor'] . '-background-color';
        }

        // Dim ratio classes
        $dim = isset( $merged['dimRatio'] ) ? (int) $merged['dimRatio'] : 50;
        $span_classes[] = 'has-background-dim-' . ( (int) ( round( $dim / 10 ) * 10 ) );
        $span_classes[] = 'has-background-dim';

        // Custom overlay color (used when no named overlayColor)
        if ( ! empty( $merged['customOverlayColor'] ) && empty( $merged['overlayColor'] ) ) {
            $span_styles[] = 'background-color:' . $merged['customOverlayColor'];
        }

        $span_class_str = implode( ' ', $span_classes );
        $span_style_str = ! empty( $span_styles ) ? ' style="' . esc_attr( implode( ';', $span_styles ) ) . '"' : '';

        $overlay = '<span aria-hidden="true" class="' . esc_attr( $span_class_str ) . '"' . $span_style_str . '></span>';

        // --- Build wrapper ---
        $open_tag  = '<div class="wp-block-cover"' . $outer_style_str . '>' . $overlay . '<div class="wp-block-cover__inner-container">';
        $close_tag = '</div></div>';

        // Build innerContent
        $inner_content = array( $open_tag );
        foreach ( $inner_blocks as $_ ) {
            $inner_content[] = null;
        }
        $inner_content[] = $close_tag;

        return array(
            'blockName'    => 'core/cover',
            'attrs'        => $merged,
            'innerBlocks'  => $inner_blocks,
            'innerHTML'    => $open_tag . $close_tag,
            'innerContent' => $inner_content,
        );
    }

    /**
     * Create a Spacer block
     */
    public function spacer( $height = '40px' ) {
        return $this->block(
            'core/spacer',
            array( 'height' => $height ),
            array(),
            '<div style="height:' . esc_attr( $height ) . '" aria-hidden="true" class="wp-block-spacer"></div>'
        );
    }

    /**
     * Create a Separator block
     */
    public function separator( $attrs = array() ) {
        return $this->block(
            'core/separator',
            $attrs,
            array(),
            '<hr class="wp-block-separator has-alpha-channel-opacity"/>'
        );
    }

    /**
     * Create a Row (flex horizontal group)
     */
    public function row( $inner_blocks = array(), $attrs = array() ) {
        $default_attrs = array(
            'layout' => array(
                'type'           => 'flex',
                'flexWrap'       => 'nowrap',
                'justifyContent' => 'space-between',
            ),
        );

        return $this->group( $inner_blocks, array_merge( $default_attrs, $attrs ) );
    }

    /**
     * Create a Stack (flex vertical group)
     */
    public function stack( $inner_blocks = array(), $attrs = array() ) {
        $default_attrs = array(
            'layout' => array(
                'type'        => 'flex',
                'orientation' => 'vertical',
            ),
        );

        return $this->group( $inner_blocks, array_merge( $default_attrs, $attrs ) );
    }

    /**
     * Create styled hero section
     */
    public function hero( $headline, $subheadline = '', $cta_text = '', $cta_link = '#' ) {
        $inner_blocks = array(
            $this->heading( $headline, 1, array(
                'textAlign' => 'center',
                'style'     => array(
                    'typography' => array( 'fontSize' => '3rem' ),
                ),
            ) ),
        );

        if ( $subheadline ) {
            $inner_blocks[] = $this->paragraph( $subheadline, array(
                'align' => 'center',
                'style' => array(
                    'typography' => array( 'fontSize' => '1.25rem' ),
                ),
            ) );
        }

        if ( $cta_text ) {
            $inner_blocks[] = $this->buttons(
                array( $this->button( $cta_text, $cta_link ) ),
                array( 'layout' => array( 'type' => 'flex', 'justifyContent' => 'center' ) )
            );
        }

        return $this->cover( $inner_blocks, array(
            'customOverlayColor' => $this->brand['primary_color'],
            'minHeight'          => 500,
        ) );
    }

    /**
     * Create a features grid section
     */
    public function features_grid( $items = array() ) {
        $columns = array();

        foreach ( $items as $item ) {
            $column_content = array();

            // Icon (if provided as emoji or text)
            if ( ! empty( $item['icon'] ) ) {
                $column_content[] = $this->paragraph( $item['icon'], array(
                    'align' => 'center',
                    'style' => array(
                        'typography' => array( 'fontSize' => '3rem' ),
                    ),
                ) );
            }

            // Title
            if ( ! empty( $item['title'] ) ) {
                $column_content[] = $this->heading( $item['title'], 3, array( 'textAlign' => 'center' ) );
            }

            // Description
            if ( ! empty( $item['description'] ) ) {
                $column_content[] = $this->paragraph( $item['description'], array( 'align' => 'center' ) );
            }

            $columns[] = $this->column( $column_content );
        }

        return $this->group(
            array( $this->columns( $columns ) ),
            array(
                'style' => array(
                    'spacing' => array(
                        'padding' => array(
                            'top'    => '4rem',
                            'bottom' => '4rem',
                        ),
                    ),
                ),
            )
        );
    }

    /**
     * Create a CTA section
     */
    public function cta_section( $headline, $description = '', $button_text = '', $button_url = '#' ) {
        $inner_blocks = array(
            $this->heading( $headline, 2, array( 'textAlign' => 'center' ) ),
        );

        if ( $description ) {
            $inner_blocks[] = $this->paragraph( $description, array( 'align' => 'center' ) );
        }

        if ( $button_text ) {
            $inner_blocks[] = $this->buttons(
                array( $this->button( $button_text, $button_url ) ),
                array( 'layout' => array( 'type' => 'flex', 'justifyContent' => 'center' ) )
            );
        }

        return $this->group( $inner_blocks, array(
            'style' => array(
                'color' => array(
                    'background' => $this->brand['secondary_color'],
                    'text'       => '#ffffff',
                ),
                'spacing' => array(
                    'padding' => array(
                        'top'    => '4rem',
                        'bottom' => '4rem',
                    ),
                ),
            ),
        ) );
    }
}
