<?php
/**
 * Title: Pricing two column highlight
 * Slug: spectra-one/pricing-2
 * Categories: pricing
 * Keywords: pricing two column highlight
 */

$get_url = trailingslashit(get_template_directory_uri());

$images = [
    $get_url . 'assets/image/circle-check.svg',
];

?>

<!-- wp:group {"align":"wide","style":{"spacing":{"padding":{"top":"var:preset|spacing|xx-large","bottom":"var:preset|spacing|xx-large"},"blockGap":"var:preset|spacing|large"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignwide" style="padding-top:var(--wp--preset--spacing--xx-large);padding-bottom:var(--wp--preset--spacing--xx-large)"><!-- wp:group {"align":"wide","layout":{"type":"constrained","contentSize":""}} -->
<div class="wp-block-group alignwide"><!-- wp:paragraph {"align":"center","style":{"typography":{"letterSpacing":"2px","textTransform":"uppercase"}},"textColor":"primary","fontSize":"x-small"} -->
<p class="has-text-align-center has-primary-color has-text-color has-x-small-font-size" style="letter-spacing:2px;text-transform:uppercase">{{PRICING_TEXT}}</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"textAlign":"center","textColor":"heading","className":"wp-block-heading"} -->
<h2 class="wp-block-heading has-text-align-center has-heading-color has-text-color">{{PRICING_TITLE}}</h2>
<!-- /wp:heading -->
<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">{{PLAN_1_FEATURES}}</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|medium","left":"var:preset|spacing|medium"}}}} -->
<div class="wp-block-columns alignwide"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:group {"style":{"border":{"radius":"8px","width":"1px"},"spacing":{"padding":{"top":"var:preset|spacing|medium","right":"var:preset|spacing|medium","bottom":"var:preset|spacing|medium","left":"var:preset|spacing|medium"},"blockGap":"var:preset|spacing|small"}},"borderColor":"outline","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-border-color has-outline-border-color" style="border-width:1px;border-radius:8px;padding-top:var(--wp--preset--spacing--medium);padding-right:var(--wp--preset--spacing--medium);padding-bottom:var(--wp--preset--spacing--medium);padding-left:var(--wp--preset--spacing--medium)"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|xxx-small"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:heading {"level":6} -->
<h6 class="wp-block-heading">Starter Plan</h6>
<!-- /wp:heading -->
<!-- wp:paragraph {"fontSize":"x-small"} -->
<p class="has-x-small-font-size">{{PLAN_2_FEATURES}}</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|xxx-small"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"bottom"}} -->
<div class="wp-block-group"><!-- wp:heading -->
<h2 class="wp-block-heading">$9.99</h2>
<!-- /wp:heading -->
<!-- wp:paragraph {"fontSize":"x-small"} -->
<p class="has-x-small-font-size">/ month</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"textColor":"primary","width":100,"className":"is-style-outline"} -->
<div class="wp-block-button has-custom-width wp-block-button__width-100 is-style-outline"><a class="wp-block-button__link has-primary-color has-text-color wp-element-button">{{PLAN_1_CTA}}</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->
<!-- wp:group {"style":{"spacing":{}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"},"typography":{"lineHeight":1.3}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group" style="line-height:1.3"><!-- wp:image {"id":59,"sizeSlug":"full","linkDestination":"none","style":{"color":{"duotone":"var:preset|duotone|secondary"}},"className":"swt-duotone-secondary"} -->
<figure class="wp-block-image size-full swt-duotone-secondary"><img src="<?php echo esc_url( $images[0] ); ?>" alt="" class="wp-image-59"/></figure>
<!-- /wp:image -->
<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"},"layout":{"selfStretch":"fixed","flexSize":"94%"}},"fontSize":"small"} -->
<p class="has-small-font-size" style="line-height:1.5">Customization options</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"},"typography":{"lineHeight":1.3}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group" style="line-height:1.3"><!-- wp:image {"id":59,"sizeSlug":"full","linkDestination":"none","style":{"color":{"duotone":"var:preset|duotone|secondary"}},"className":"swt-duotone-secondary"} -->
<figure class="wp-block-image size-full swt-duotone-secondary"><img src="<?php echo esc_url( $images[0] ); ?>" alt="" class="wp-image-59"/></figure>
<!-- /wp:image -->
<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"},"layout":{"selfStretch":"fixed","flexSize":"94%"}},"fontSize":"small"} -->
<p class="has-small-font-size" style="line-height:1.5">Essential pattern library</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"},"typography":{"lineHeight":1.3}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group" style="line-height:1.3"><!-- wp:image {"id":59,"sizeSlug":"full","linkDestination":"none","style":{"color":{"duotone":"var:preset|duotone|secondary"}},"className":"swt-duotone-secondary"} -->
<figure class="wp-block-image size-full swt-duotone-secondary"><img src="<?php echo esc_url( $images[0] ); ?>" alt="" class="wp-image-59"/></figure>
<!-- /wp:image -->
<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"},"layout":{"selfStretch":"fixed","flexSize":"94%"}},"fontSize":"small"} -->
<p class="has-small-font-size" style="line-height:1.5">Handcrafted theme styles</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"},"typography":{"lineHeight":1.3}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group" style="line-height:1.3"><!-- wp:image {"id":59,"sizeSlug":"full","linkDestination":"none","style":{"color":{"duotone":"var:preset|duotone|secondary"}},"className":"swt-duotone-secondary"} -->
<figure class="wp-block-image size-full swt-duotone-secondary"><img src="<?php echo esc_url( $images[0] ); ?>" alt="" class="wp-image-59"/></figure>
<!-- /wp:image -->
<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"},"layout":{"selfStretch":"fixed","flexSize":"94%"}},"fontSize":"small"} -->
<p class="has-small-font-size" style="line-height:1.5">Unmatched performance</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->
<!-- wp:column -->
<div class="wp-block-column"><!-- wp:group {"style":{"border":{"radius":"8px","width":"1px"},"spacing":{"padding":{"top":"var:preset|spacing|medium","right":"var:preset|spacing|medium","bottom":"var:preset|spacing|medium","left":"var:preset|spacing|medium"},"blockGap":"var:preset|spacing|small"}},"borderColor":"outline","backgroundColor":"heading","layout":{"type":"constrained"}} -->
<div class="wp-block-group has-border-color has-outline-border-color has-heading-background-color has-background" style="border-width:1px;border-radius:8px;padding-top:var(--wp--preset--spacing--medium);padding-right:var(--wp--preset--spacing--medium);padding-bottom:var(--wp--preset--spacing--medium);padding-left:var(--wp--preset--spacing--medium)"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|xxx-small"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:heading {"level":6,"textColor":"background"} -->
<h6 class="wp-block-heading has-background-color has-text-color">Pro Plan</h6>
<!-- /wp:heading -->
<!-- wp:paragraph {"textColor":"surface","fontSize":"x-small"} -->
<p class="has-surface-color has-text-color has-x-small-font-size">Unlock the full potential of your website with our Pro plan.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|xxx-small"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"bottom"}} -->
<div class="wp-block-group"><!-- wp:heading {"textColor":"background"} -->
<h2 class="wp-block-heading has-background-color has-text-color">$19.99</h2>
<!-- /wp:heading -->
<!-- wp:paragraph {"textColor":"outline","fontSize":"x-small"} -->
<p class="has-outline-color has-text-color has-x-small-font-size">/ month</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"width":100,"className":"is-style-fill"} -->
<div class="wp-block-button has-custom-width wp-block-button__width-100 is-style-fill"><a class="wp-block-button__link wp-element-button">{{PLAN_2_CTA}}</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->
<!-- wp:group {"style":{"spacing":{}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"},"typography":{"lineHeight":1.3}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group" style="line-height:1.3"><!-- wp:image {"id":59,"sizeSlug":"full","linkDestination":"none","style":{"color":{"duotone":"var:preset|duotone|tertiary"}},"className":"swt-duotone-tertiary"} -->
<figure class="wp-block-image size-full swt-duotone-tertiary"><img src="<?php echo esc_url( $images[0] ); ?>" alt="" class="wp-image-59"/></figure>
<!-- /wp:image -->
<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"},"layout":{"selfStretch":"fixed","flexSize":"94%"}},"textColor":"surface","fontSize":"small"} -->
<p class="has-surface-color has-text-color has-small-font-size" style="line-height:1.5">Everything in Starter Plan plus...</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"},"typography":{"lineHeight":1.3}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group" style="line-height:1.3"><!-- wp:image {"id":59,"sizeSlug":"full","linkDestination":"none","style":{"color":{"duotone":"var:preset|duotone|tertiary"}},"className":"swt-duotone-tertiary"} -->
<figure class="wp-block-image size-full swt-duotone-tertiary"><img src="<?php echo esc_url( $images[0] ); ?>" alt="" class="wp-image-59"/></figure>
<!-- /wp:image -->
<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"},"layout":{"selfStretch":"fixed","flexSize":"94%"}},"textColor":"surface","fontSize":"small"} -->
<p class="has-surface-color has-text-color has-small-font-size" style="line-height:1.5">Custom typography</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"},"typography":{"lineHeight":1.3}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group" style="line-height:1.3"><!-- wp:image {"id":59,"sizeSlug":"full","linkDestination":"none","style":{"color":{"duotone":"var:preset|duotone|tertiary"}},"className":"swt-duotone-tertiary"} -->
<figure class="wp-block-image size-full swt-duotone-tertiary"><img src="<?php echo esc_url( $images[0] ); ?>" alt="" class="wp-image-59"/></figure>
<!-- /wp:image -->
<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"},"layout":{"selfStretch":"fixed","flexSize":"94%"}},"textColor":"surface","fontSize":"small"} -->
<p class="has-surface-color has-text-color has-small-font-size" style="line-height:1.5">Premium pattern library</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"},"typography":{"lineHeight":1.3}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group" style="line-height:1.3"><!-- wp:image {"id":59,"sizeSlug":"full","linkDestination":"none","style":{"color":{"duotone":"var:preset|duotone|tertiary"}},"className":"swt-duotone-tertiary"} -->
<figure class="wp-block-image size-full swt-duotone-tertiary"><img src="<?php echo esc_url( $images[0] ); ?>" alt="" class="wp-image-59"/></figure>
<!-- /wp:image -->
<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"},"layout":{"selfStretch":"fixed","flexSize":"94%"}},"textColor":"surface","fontSize":"small"} -->
<p class="has-surface-color has-text-color has-small-font-size" style="line-height:1.5">Pro blocks access</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"},"typography":{"lineHeight":1.3}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group" style="line-height:1.3"><!-- wp:image {"id":59,"sizeSlug":"full","linkDestination":"none","style":{"color":{"duotone":"var:preset|duotone|tertiary"}},"className":"swt-duotone-tertiary"} -->
<figure class="wp-block-image size-full swt-duotone-tertiary"><img src="<?php echo esc_url( $images[0] ); ?>" alt="" class="wp-image-59"/></figure>
<!-- /wp:image -->
<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"},"layout":{"selfStretch":"fixed","flexSize":"94%"}},"textColor":"surface","fontSize":"small"} -->
<p class="has-surface-color has-text-color has-small-font-size" style="line-height:1.5">Priority customer support</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->