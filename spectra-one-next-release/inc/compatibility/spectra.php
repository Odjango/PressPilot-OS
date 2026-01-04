<?php
/**
 * Spectra Plugin compatibility
 *
 * @package Spectra One
 * @author Brainstorm Force
 * @since 0.0.3
 */

declare(strict_types=1);

namespace Swt;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


add_filter( 'wp', SWT_NS . 'spectra_compatibility', 10, 2 );


/**
 * Spectra compatibility
 *
 * @since 0.0.3
 * @return void
 */
function spectra_compatibility() {
	if ( is_spectra_plugin() ) {
		add_filter( 'swt_dynamic_theme_css', SWT_NS . 'spectra_compatibility_inline_css' );
	}
}

/**
 * Load spectra compatibility inline css.
 *
 * @since 0.0.3
 * @param string $css Inline CSS.
 * @return string
 */
function spectra_compatibility_inline_css( string $css ): string {

	$margin = 0;

		$css_output = array(
			"body [class*='uagb-block-']" => array(
				'margin-top'         => $margin . 'px',
				'margin-block-start' => $margin . 'px',
			),
		);

		$css .= parse_css( $css_output );

		return $css;
}
