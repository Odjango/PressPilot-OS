<?php
/**
 * Title: Three column featured grid
 * Slug: spectra-one/feature-4
 * Categories: featured
 * Keywords: three column featured grid
 */

$get_url = trailingslashit(get_template_directory_uri());

$images = [
    $get_url . 'assets/image/featured-1.svg',
    $get_url . 'assets/image/featured-2.svg',
    $get_url . 'assets/image/featured-3.svg',
    $get_url . 'assets/image/featured-4.svg',
    $get_url . 'assets/image/featured-5.svg',
    $get_url . 'assets/image/featured-6.svg',
];

?>

<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|x-large","bottom":"var:preset|spacing|x-large"},"blockGap":"var:preset|spacing|large"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--x-large);padding-bottom:var(--wp--preset--spacing--x-large)"><!-- wp:group {"style":{"spacing":{"padding":{"bottom":"var:preset|spacing|x-small"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-bottom:var(--wp--preset--spacing--x-small)"><!-- wp:paragraph {"align":"center","style":{"typography":{"letterSpacing":"2px","textTransform":"uppercase"}},"textColor":"primary","fontSize":"x-small"} -->
<p class="has-text-align-center has-primary-color has-text-color has-x-small-font-size" style="letter-spacing:2px;text-transform:uppercase">{{FEATURES_TEXT}}</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center"} -->
<h2 class="wp-block-heading has-text-align-center">{{FEATURES_TITLE}}</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">{{FEATURE_1_TEXT}}</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|x-large","left":"var:preset|spacing|x-large"}}}} -->
<div class="wp-block-columns alignwide"><!-- wp:column {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}}} -->
<div class="wp-block-column"><!-- wp:image {"id":139,"sizeSlug":"large","linkDestination":"none","style":{"color":{"duotone":"var:preset|duotone|primary"}},"className":"swt-duotone-primary"} -->
<figure class="wp-block-image size-large swt-duotone-primary"><img src="<?php echo esc_url( $images[0] ); ?>" alt="{{IMAGE_FEATURE_1}}" class="wp-image-139"/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":5,"style":{"spacing":{"margin":{"top":"var:preset|spacing|small"}}},"textColor":"heading","className":"wp-block-heading"} -->
<h5 class="wp-block-heading has-heading-color has-text-color" style="margin-top:var(--wp--preset--spacing--small)">Easily Customizable</h5>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>{{FEATURE_2_TEXT}}</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}}} -->
<div class="wp-block-column"><!-- wp:image {"id":139,"sizeSlug":"large","linkDestination":"none","style":{"color":{"duotone":"var:preset|duotone|primary"}},"className":"swt-duotone-primary"} -->
<figure class="wp-block-image size-large swt-duotone-primary"><img src="<?php echo esc_url( $images[1] ); ?>" alt="{{IMAGE_FEATURE_2}}" class="wp-image-139"/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":5,"style":{"spacing":{"margin":{"top":"var:preset|spacing|small"}}},"textColor":"heading","className":"wp-block-heading"} -->
<h5 class="wp-block-heading has-heading-color has-text-color" style="margin-top:var(--wp--preset--spacing--small)">Blazing Fast</h5>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>{{FEATURE_3_TEXT}}</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}}} -->
<div class="wp-block-column"><!-- wp:image {"id":866,"sizeSlug":"large","linkDestination":"none","style":{"color":{"duotone":"var:preset|duotone|primary"}},"className":"swt-duotone-primary"} -->
<figure class="wp-block-image size-large swt-duotone-primary"><img src="<?php echo esc_url( $images[2] ); ?>" alt="" class="wp-image-866"/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":5,"style":{"spacing":{"margin":{"top":"var:preset|spacing|small"}}},"textColor":"heading","className":"wp-block-heading"} -->
<h5 class="wp-block-heading has-heading-color has-text-color" style="margin-top:var(--wp--preset--spacing--small)">SEO Optimized</h5>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Built with search engines in mind, achieve higher rankings and more traffic with optimized code.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|x-large","left":"var:preset|spacing|x-large"}}}} -->
<div class="wp-block-columns alignwide"><!-- wp:column {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}}} -->
<div class="wp-block-column"><!-- wp:image {"id":139,"sizeSlug":"large","linkDestination":"none","style":{"color":{"duotone":"var:preset|duotone|primary"}},"className":"swt-duotone-primary"} -->
<figure class="wp-block-image size-large swt-duotone-primary"><img src="<?php echo esc_url( $images[3] ); ?>" alt="" class="wp-image-139"/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":5,"style":{"spacing":{"margin":{"top":"var:preset|spacing|small"}}},"textColor":"heading","className":"wp-block-heading"} -->
<h5 class="wp-block-heading has-heading-color has-text-color" style="margin-top:var(--wp--preset--spacing--small)">Drag and Drop</h5>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Easily customize your website's layout and design using an intuitive, drag-and-drop interface.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}}} -->
<div class="wp-block-column"><!-- wp:image {"id":139,"sizeSlug":"large","linkDestination":"none","style":{"color":{"duotone":"var:preset|duotone|primary"}},"className":"swt-duotone-primary"} -->
<figure class="wp-block-image size-large swt-duotone-primary"><img src="<?php echo esc_url( $images[4] ); ?>" alt="" class="wp-image-139"/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":5,"style":{"spacing":{"margin":{"top":"var:preset|spacing|small"}}},"textColor":"heading","className":"wp-block-heading"} -->
<h5 class="wp-block-heading has-heading-color has-text-color" style="margin-top:var(--wp--preset--spacing--small)">Global Styles</h5>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Define global styling settings for your website, such as typography, colors, and spacing.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}}} -->
<div class="wp-block-column"><!-- wp:image {"id":866,"sizeSlug":"large","linkDestination":"none","style":{"color":{"duotone":"var:preset|duotone|primary"}},"className":"swt-duotone-primary"} -->
<figure class="wp-block-image size-large swt-duotone-primary"><img src="<?php echo esc_url( $images[5] ); ?>" alt="" class="wp-image-866"/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":5,"style":{"spacing":{"margin":{"top":"var:preset|spacing|small"}}},"textColor":"heading","className":"wp-block-heading"} -->
<h5 class="wp-block-heading has-heading-color has-text-color" style="margin-top:var(--wp--preset--spacing--small)">Design Patterns</h5>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Spectra offers a wide selection of meticulously crafted patterns to enhance your content.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->