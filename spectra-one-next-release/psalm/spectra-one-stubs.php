<?php

namespace Swt {
    const SWT_VER = '1.0.1';
    const SWT_SLUG = 'spectra-one';
    const SWT_NAME = 'Spectra One';
    const SWT_PFX = 'swt';
    const SWT_LOC = 'spectraOne';
    const SWT_NS = __NAMESPACE__ . '\\';
    const SWT_DS = DIRECTORY_SEPARATOR;
    const SWT_DIR = __DIR__ . SWT_DS;
}
namespace Swt {
    /**
     * Render the welcome notice.
     *
     * @since 0.0.1
     * @return void
     */
    function render_welcome_notice() : void
    {
    }
    /**
     * Close welcome notice.
     *
     * @since 0.0.1
     */
    function close_welcome_notice()
    {
    }
    /**
     * Welcome notice condition.
     *
     * @since 0.0.1
     * @return bool
     */
    function welcome_notice_display_conditions() : bool
    {
    }
    /**
     * Spectra plugin status.
     *
     * @since 0.0.1
     * @return string
     */
    function is_spectra_plugin_status() : string
    {
    }
    /**
     * Localize js.
     *
     * @since 0.0.1
     * @param string $plugin_status plugin current status.
     * @return array
     */
    function localize_welcome_notice_js($plugin_status) : array
    {
    }
}
namespace Swt {
    /**
     * Modifies front end HTML output of block.
     *
     * @since 1.0.0
     *
     * @param string $html  Block HTML.
     * @param array  $block Block data.
     *
     * @return string
     */
    function render_latest_post_block(string $html, array $block) : string
    {
    }
}
namespace Swt {
    /**
     * Modifies front end HTML output of block.
     *
     * @since 1.0.0
     *
     * @param string $html  Block HTML.
     * @param array  $block Block data.
     *
     * @return string
     */
    function render_navigation_submenu_block(string $html, array $block) : string
    {
    }
    /**
     * Load Inline Css.
     *
     * @since 1.0.0
     * @param string $css Inline CSS.
     * @return string
     */
    function navigation_submenu_inline_css(string $css) : string
    {
    }
}
namespace Swt {
    /**
     * Modifies front end HTML output of block.
     *
     * @since 1.0.0
     *
     * @param string $html  Block HTML.
     * @param array  $block Block data.
     *
     * @return string
     */
    function render_post_author_block(string $html, array $block) : string
    {
    }
    /**
     * Load Inline Css.
     *
     * @since 1.0.0
     * @param string $css Inline CSS.
     * @return string
     */
    function post_author_inline_css(string $css) : string
    {
    }
    /**
     * Remove author bio.
     *
     * @since 1.0.0
     * @param string $css Inline CSS.
     * @return string
     */
    function remove_author_bio(string $css) : string
    {
    }
}
namespace Swt {
    /**
     * Modifies front end HTML output of block.
     *
     * @since 1.0.0
     *
     * @param string $html  Block HTML.
     * @param array  $block Block data.
     *
     * @return string
     */
    function render_post_comments_form_block(string $html, array $block) : string
    {
    }
    /**
     * Load Inline Css.
     *
     * @since 1.0.0
     * @param string $css Inline CSS.
     * @return string
     */
    function post_comments_form_inline_css(string $css) : string
    {
    }
}
namespace Swt {
    /**
     * Modifies front end HTML output of block.
     *
     * @since 0.0.1
     *
     * @param string $html  Block HTML.
     * @param array  $block Block data.
     *
     * @return string
     */
    function render_featured_image_block(string $html, array $block) : string
    {
    }
    /**
     * Load Inline Css.
     *
     * @since 0.0.1
     * @param string $css Inline CSS.
     * @return string
     */
    function post_featured_image_inline_css(string $css) : string
    {
    }
}
namespace Swt {
    /**
     * Modifies front end HTML output of block.
     *
     * @since 1.0.0
     *
     * @param string $html  Block HTML.
     * @param array  $block Block data.
     *
     * @return string
     */
    function render_post_terms_block(string $html, array $block) : string
    {
    }
    /**
     * Load Inline Css.
     *
     * @since 1.0.0
     * @param string $css Inline CSS.
     * @return string
     */
    function post_terms_inline_css(string $css) : string
    {
    }
}
namespace Swt {
    /**
     * Spectra compatibility
     *
     * @since 0.0.3
     * @return void
     */
    function spectra_compatibility()
    {
    }
    /**
     * Load spectra compatibility inline css.
     *
     * @since 0.0.3
     * @param string $css Inline CSS.
     * @return string
     */
    function spectra_compatibility_inline_css(string $css) : string
    {
    }
}
namespace Swt {
    /**
     * Add Admin menu item.
     *
     * @param object \WP_Admin_Bar $admin_bar Admin bar.
     * @since 1.0.0
     * @return void
     */
    function add_admin_menu(\WP_Admin_Bar $admin_bar) : void
    {
    }
}
namespace Swt {
    /**
     * Header render function.
     *
     * @param string $block_content Entire Block Content.
     * @param array  $block Block Properties As An Array.
     * @return string
     */
    function render_header(string $block_content, array $block) : string
    {
    }
    /**
     * Load header inline css.
     *
     * @since 1.0.1
     * @param string $css Inline CSS.
     * @return string
     */
    function header_shadow_inline_css(string $css) : string
    {
    }
    /**
     * Load header inline css.
     *
     * @since 0.0.1
     * @param string $css Inline CSS.
     * @return string
     */
    function header_sticky_inline_css(string $css) : string
    {
    }
    /**
     * Load header inline js.
     *
     * @since 0.0.1
     * @param string $js Inline JS.
     * @return string
     */
    function header_sticky_inline_js(string $js) : string
    {
    }
    /**
     * Load transparent header inline css.
     *
     * @since 0.0.1
     * @param string $css Inline CSS.
     * @return string
     */
    function header_transparent_inline_css(string $css) : string
    {
    }
    /**
     * Load header wp_admin_bar spacing inline js.
     *
     * @since 0.0.1
     * @param string $js Inline JS.
     * @return string
     */
    function header_wp_admin_bar_spacing_js(string $js) : string
    {
    }
}
namespace Swt {
    /**
     * Hide Elements.
     *
     * @since 0.0.1
     * @param string $block_content Entire Block Content.
     * @param array  $block Block Properties As An Array.
     * @return string
     */
    function hide_elements(string $block_content, array $block) : string
    {
    }
    /**
     * Get disable section fields.
     *
     * @return array $swt_page_meta_elements All toggle based page elements.
     */
    function get_disable_section_fields() : array
    {
    }
}
namespace Swt {
    /**
     * Icomoon render function.
     * 
     * @since 1.0.0
     * @param string $block_content Entire Block Content.
     * @param array  $block Block Properties As An Array.
     * @return string
     */
    function render_icomoon(string $block_content, array $block) : string
    {
    }
    /**
     * Load icomoon inline css.
     *
     * @since 1.0.0
     * @param string $css Inline CSS.
     * @return string
     */
    function icomoon_inline_css(string $css) : string
    {
    }
    /**
     * Load icomoon editor inline css.
     *
     * @since 1.0.0
     * @param array  $editor_settings Inline CSS.
     * @param object $block_editor_context Inline CSS.
     * @return array
     */
    function icomoon_block_editor_css(array $editor_settings, object $block_editor_context) : array
    {
    }
    /**
     * Import icomoon fonts.
     *
     * @since 1.0.0
     * @return string
     */
    function icomoon_import_fonts() : string
    {
    }
}
namespace Swt {
    /**
     * Register Post Meta options for react based fields.
     *
     * @since 0.0.1
     * @return void
     */
    function register_meta_settings() : void
    {
    }
}
namespace Swt {
    /**
     * Hide Elements.
     *
     * @since 0.0.1
     * @param string $title Page title.
     * @param int    $post_id Post id.
     * @return string
     */
    function remove_page_title(string $title, int $post_id = 0) : string
    {
    }
}
namespace Swt {
    /**
     *  Render function.
     *
     * @param string $block_content Entire Block Content.
     * @param array  $block Block Properties As An Array.
     * @return string
     */
    function render_remove_blocks(string $block_content, array $block) : string
    {
    }
}
namespace Swt {
    /**
     *  Render Responsive Blocks.
     *
     * @since 0.0.1
     * @param string $block_content Entire Block Content.
     * @param array  $block Block Properties As An Array.
     * @return string
     */
    function render_responsive_blocks(string $block_content, array $block) : string
    {
    }
    /**
     * Responsive Blocks Inline CSS.
     *
     * @since 0.0.1
     * @param string $css Inline CSS.
     * @return string
     */
    function responsive_blocks_inline_css($css) : string
    {
    }
}
namespace Swt {
    /**
     * Enqueue Frontend Scripts.
     *
     * @since 0.0.1
     * @return void
     */
    function enqueue_frontend_scripts() : void
    {
    }
    /**
     * Enqueue Editor Scripts.
     *
     * @since 0.0.1
     *
     * @return void
     */
    function enqueue_editor_scripts() : void
    {
    }
    /**
     * Localize Editor Script.
     *
     * @since 0.0.1
     *
     * @return mixed|void
     */
    function localize_editor_script()
    {
    }
    /**
     * Enqueue Editor Scripts.
     *
     * @since 0.0.1
     *
     * @return void
     */
    function enqueue_editor_block_styles() : void
    {
    }
    /**
     * Enqueue Editor Scripts.
     *
     * @since 0.0.3
     *
     * @return void
     */
    function spectra_one_setup() : void
    {
    }
    /**
     * Pattern categories.
     *
     * @since 1.0.0
     *
     * @return void
     */
    function pattern_categories() : void
    {
    }
}
namespace Swt {
    /**
     * Get theme.json
     *
     * @since 0.0.1
     * @return array
     */
    function get_theme_json() : array
    {
    }
    /**
     * Get custom styles
     *
     * @since 0.0.1
     * @return array
     */
    function get_theme_custom_styles() : array
    {
    }
}
namespace Swt {
    /**
     * Formatted DOMDocument object from string.
     *
     * @since 0.0.1
     *
     * @param string $html HTML string to convert to DOM.
     *
     * @return \DOMDocument
     */
    function dom(string $html) : \DOMDocument
    {
    }
    /**
     *  Formatted DOMElement object from a DOMDocument object.
     *
     * @since 0.0.1
     *
     * @param string $tag            HTML tag.
     * @param mixed  $dom_or_element DOMDocument.
     * @param int    $index          Index of element to return.
     *
     * @return \DOMElement|null
     */
    function get_dom_element(string $tag, $dom_or_element, int $index = 0)
    {
    }
    /**
     * DOMNode to a DOMElement.
     *
     * @since 0.0.1
     *
     * @param mixed $node DOMNode.
     *
     * @return \DOMElement|null
     */
    function dom_element($node)
    {
    }
    /**
     * Change html tag name.
     *
     * @since 0.0.1
     *
     * @param \DOMElement $element DOM Element.
     * @param string     $name    Tag name.
     *
     * @return \DOMElement
     */
    function change_tag_name(\DOMElement $element, string $name) : \DOMElement
    {
    }
    /**
     * Returns dom elements by class name as array.
     *
     * @since 0.0.1
     *
     * @param \DOMDocument|\DOMElement $dom        DOM document.
     * @param string                 $class_name class name.
     * @param string                 $tag        tag name.
     *
     * @return array
     */
    function get_elements_by_class_name($dom, string $class_name, string $tag = '*') : array
    {
    }
}
namespace Swt {
    /**
     * Get template Directory Uri
     *
     * @since 0.0.1
     *
     * @param string $path Optional path.
     *
     * @return string
     */
    function get_uri(string $path = '') : string
    {
    }
    /**
     * Is spectra plugin is enabled / available
     *
     * @since 0.0.3
     * @return bool
     */
    function is_spectra_plugin() : bool
    {
    }
    /**
     * RTL For Dynamic / Inline css
     *
     * @since 0.0.1
     *
     * @param string $direction Left or Right Direction.
     *
     * @return string
     */
    function rtl_css(string $direction = '') : string
    {
    }
    /**
     * Parse CSS
     *
     * @param  array $css_output Array of CSS.
     * @param  mixed $min_media  Min Media breakpoint.
     * @param  mixed $max_media  Max Media breakpoint.
     * @return string             Generated CSS.
     */
    function parse_css(array $css_output = array(), $min_media = '', $max_media = '') : string
    {
    }
    /**
     * Render Image Placeholder
     *
     * @since 0.0.1
     *
     * @param string $html Html.
     * @param array  $block Block array.
     *
     * @return string
     */
    function render_image_placeholder(string $html, array $block) : string
    {
    }
    /**
     * Get SVG icon
     *
     * @since 0.0.1
     *
     * @param string   $slug Icon name.
     * @param int|null $size Icon size.
     *
     * @return string
     */
    function get_svg_icon(string $slug, int $size = null) : string
    {
    }
    /**
     * Converts css array to string.
     *
     * @since 0.0.1
     *
     * @param array $styles Styles array.
     * @param bool  $trim  trim trailing semicolon.
     *
     * @return string
     */
    function css_array_to_string(array $styles, bool $trim = false) : string
    {
    }
    /**
     * Converts string of CSS rules to an array.
     *
     * @since 0.0.1
     *
     * @param string $css CSS string.
     *
     * @return array
     */
    function css_string_to_array(string $css) : array
    {
    }
    /**
     * Check if page title is enabled or disabled.
     *
     * @since 1.0.0
     * @param int $post_id Post id.
     * @return bool
     */
    function is_page_title(int $post_id = 0) : bool
    {
    }
}
namespace {
    /**
     * Title: Alternate image text
     * Slug: spectra-one/alternate-image-text
     * Categories: featured
     * Keywords: alternate image text
     */
    $get_url = \trailingslashit(\get_template_directory_uri());
    /**
     * Title: Featured logos
     * Slug: spectra-one/featured-logos
     * Categories: gallery
     * Keywords: featured logos
     */
    $get_url = \trailingslashit(\get_template_directory_uri());
    /**
     * Title: Footer minimal menu center
     * Slug: spectra-one/footer-2
     * Categories: footer
     * Block Types: core/template-part/footer
     */
    $get_url = \trailingslashit(\get_template_directory_uri());
    /**
     * Title: Footer minimal menu right
     * Slug: spectra-one/footer-3
     * Categories: footer
     * Block Types: core/template-part/footer
     */
    $get_url = \trailingslashit(\get_template_directory_uri());
    /**
     * Title: Footer five columns menu inline
     * Slug: spectra-one/footer-4
     * Categories: footer
     * Block Types: core/template-part/footer
     */
    $get_url = \trailingslashit(\get_template_directory_uri());
    /**
     * Title: Footer six columns menu separated
     * Slug: spectra-one/footer-5
     * Categories: footer
     * Block Types: core/template-part/footer
     */
    $get_url = \trailingslashit(\get_template_directory_uri());
    /**
     * Title: Footer
     * Slug: spectra-one/footer
     * Categories: footer
     * Block Types: core/template-part/footer
     */
    $get_url = \trailingslashit(\get_template_directory_uri());
    /**
     * Title: Header center menu
     * Slug: spectra-one/header-2
     * Categories: header
     * Block Types: core/template-part/header
     */
    $get_url = \trailingslashit(\get_template_directory_uri());
    /**
     * Title: Header left menu
     * Slug: spectra-one/header-3
     * Categories: header
     * Block Types: core/template-part/header
     */
    $get_url = \trailingslashit(\get_template_directory_uri());
    /**
     * Title: Header blend
     * Slug: spectra-one/header-4
     * Categories: header
     * Block Types: core/template-part/header
     */
    $get_url = \trailingslashit(\get_template_directory_uri());
    /**
     * Title: Header center menu blend
     * Slug: spectra-one/header-5
     * Categories: header
     * Block Types: core/template-part/header
     */
    $get_url = \trailingslashit(\get_template_directory_uri());
    /**
     * Title: Header left menu blend
     * Slug: spectra-one/header-6
     * Categories: header
     * Block Types: core/template-part/header
     */
    $get_url = \trailingslashit(\get_template_directory_uri());
    /**
     * Title: Header
     * Slug: spectra-one/header
     * Categories: header
     * Block Types: core/template-part/header
     */
    $get_url = \trailingslashit(\get_template_directory_uri());
    /**
     * Title: Hero banner
     * Slug: spectra-one/hero-banner
     * Categories: featured
     * Keywords: hero Banner
     */
    $get_url = \trailingslashit(\get_template_directory_uri());
    /**
     * Title: Split image right
     * Slug: spectra-one/split-image-right
     * Categories: media
     * Keywords: split image right
     */
    $get_url = \trailingslashit(\get_template_directory_uri());
    /**
     * Title: Testimonial
     * Slug: spectra-one/testimonials
     * Categories: featured
     * Keywords: testimonials
     */
    $get_url = \trailingslashit(\get_template_directory_uri());
    /**
     * Title: Three column featured
     * Slug: spectra-one/three-column-featured
     * Categories: services
     * Keywords: three column featured
     */
    $get_url = \trailingslashit(\get_template_directory_uri());
}