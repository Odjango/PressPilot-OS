<?php
/**
 * Title: Testimonial grid
 * Slug: spectra-one/testimonials-2
 * Categories: featured
 * Keywords: testimonial grid
 */

 $get_url = trailingslashit(get_template_directory_uri());

 $images = [
     $get_url . 'assets/image/avatar-1.png',
     $get_url . 'assets/image/avatar-2.png',
     $get_url . 'assets/image/avatar-3.png',
     $get_url . 'assets/image/avatar-4.png',
     $get_url . 'assets/image/avatar-5.png',
     $get_url . 'assets/image/avatar-6.png',
 ];
?>

<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|small","bottom":"var:preset|spacing|x-large"},"blockGap":"var:preset|spacing|medium"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--small);padding-bottom:var(--wp--preset--spacing--x-large)"><!-- wp:group {"style":{"spacing":{"padding":{"bottom":"var:preset|spacing|x-small"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-bottom:var(--wp--preset--spacing--x-small)"><!-- wp:paragraph {"align":"center","style":{"typography":{"letterSpacing":"2px","textTransform":"uppercase"}},"textColor":"primary","fontSize":"x-small"} -->
<p class="has-text-align-center has-primary-color has-text-color has-x-small-font-size" style="letter-spacing:2px;text-transform:uppercase">{{TESTIMONIAL_1_TEXT}}</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center"} -->
<h2 class="wp-block-heading has-text-align-center">{{TESTIMONIALS_TITLE}}</h2>
<!-- /wp:heading --></div>
<!-- /wp:group -->

<!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|medium","left":"var:preset|spacing|medium"}}}} -->
<div class="wp-block-columns alignwide"><!-- wp:column {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}}} -->
<div class="wp-block-column"><!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|small","right":"var:preset|spacing|small","bottom":"var:preset|spacing|small","left":"var:preset|spacing|small"}},"border":{"radius":"16px","width":"1px"},"dimensions":{"minHeight":"100%"}},"borderColor":"outline","layout":{"type":"flex","orientation":"vertical","verticalAlignment":"space-between"}} -->
<div class="wp-block-group has-border-color has-outline-border-color" style="border-width:1px;border-radius:16px;min-height:100%;padding-top:var(--wp--preset--spacing--small);padding-right:var(--wp--preset--spacing--small);padding-bottom:var(--wp--preset--spacing--small);padding-left:var(--wp--preset--spacing--small)"><!-- wp:group {"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-group"><!-- wp:paragraph -->
<p>{{TESTIMONIAL_2_TEXT}}</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":6,"textColor":"heading","className":"wp-block-heading"} -->
<h6 class="wp-block-heading has-heading-color has-text-color">Highly recommended!</h6>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This theme made the process of building my website a breeze. The drag-and-drop interface was easy to use and the templates were customizable. </p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"margin":{"top":"var:preset|spacing|x-small"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"left"}} -->
<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--x-small)"><!-- wp:image {"id":931,"sizeSlug":"full","linkDestination":"none","style":{"border":{"radius":"20px"}}} -->
<figure class="wp-block-image size-full has-custom-border"><img src="<?php echo esc_url( $images[0] ); ?>" alt="{{IMAGE_TESTIMONIAL_1}}" class="wp-image-931" style="border-radius:20px"/></figure>
<!-- /wp:image -->

<!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">Darlene Robertson</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"fontSize":"x-small"} -->
<p class="has-x-small-font-size">Web designer</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}}} -->
<div class="wp-block-column"><!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|small","right":"var:preset|spacing|small","bottom":"var:preset|spacing|small","left":"var:preset|spacing|small"}},"border":{"radius":"16px","width":"1px"},"dimensions":{"minHeight":"100%"}},"borderColor":"outline","layout":{"type":"flex","orientation":"vertical","verticalAlignment":"space-between"}} -->
<div class="wp-block-group has-border-color has-outline-border-color" style="border-width:1px;border-radius:16px;min-height:100%;padding-top:var(--wp--preset--spacing--small);padding-right:var(--wp--preset--spacing--small);padding-bottom:var(--wp--preset--spacing--small);padding-left:var(--wp--preset--spacing--small)"><!-- wp:group {"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-group"><!-- wp:paragraph -->
<p>★★★★★</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":6,"textColor":"heading","className":"wp-block-heading"} -->
<h6 class="wp-block-heading has-heading-color has-text-color">Endless customization</h6>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Endless customization options and responsive design, plus great customer support. Highly recommend!</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"margin":{"top":"var:preset|spacing|x-small"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"left"}} -->
<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--x-small)"><!-- wp:image {"id":932,"sizeSlug":"full","linkDestination":"none","style":{"border":{"radius":"20px"}}} -->
<figure class="wp-block-image size-full has-custom-border"><img src="<?php echo esc_url( $images[2]); ?>" alt="" class="wp-image-932" style="border-radius:20px"/></figure>
<!-- /wp:image -->

<!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">Ralph Edwards</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"fontSize":"x-small"} -->
<p class="has-x-small-font-size">Marketing Coordinator</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}}} -->
<div class="wp-block-column"><!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|small","right":"var:preset|spacing|small","bottom":"var:preset|spacing|small","left":"var:preset|spacing|small"}},"border":{"radius":"16px","width":"1px"},"dimensions":{"minHeight":"100%"}},"borderColor":"outline","layout":{"type":"flex","orientation":"vertical","verticalAlignment":"space-between"}} -->
<div class="wp-block-group has-border-color has-outline-border-color" style="border-width:1px;border-radius:16px;min-height:100%;padding-top:var(--wp--preset--spacing--small);padding-right:var(--wp--preset--spacing--small);padding-bottom:var(--wp--preset--spacing--small);padding-left:var(--wp--preset--spacing--small)"><!-- wp:group {"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-group"><!-- wp:paragraph -->
<p>★★★★★</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":6,"textColor":"heading","className":"wp-block-heading"} -->
<h6 class="wp-block-heading has-heading-color has-text-color">Superb quality!</h6>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I've tried countless themes, but none have impressed me as much as this! It's incredibly fast, which means my website load in a snap.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"margin":{"top":"var:preset|spacing|x-small"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"left"}} -->
<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--x-small)"><!-- wp:image {"id":1037,"sizeSlug":"full","linkDestination":"none","style":{"border":{"radius":"20px"}}} -->
<figure class="wp-block-image size-full has-custom-border"><img src="<?php echo esc_url( $images[4] ); ?>" alt="" class="wp-image-1037" style="border-radius:20px"/></figure>
<!-- /wp:image -->

<!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">Jenny Wilson</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"fontSize":"x-small"} -->
<p class="has-x-small-font-size">Marketer</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|medium","left":"var:preset|spacing|medium"}}}} -->
<div class="wp-block-columns alignwide"><!-- wp:column {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}}} -->
<div class="wp-block-column"><!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|small","right":"var:preset|spacing|small","bottom":"var:preset|spacing|small","left":"var:preset|spacing|small"}},"border":{"radius":"16px","width":"1px"},"dimensions":{"minHeight":"100%"}},"borderColor":"outline","layout":{"type":"flex","orientation":"vertical","verticalAlignment":"space-between"}} -->
<div class="wp-block-group has-border-color has-outline-border-color" style="border-width:1px;border-radius:16px;min-height:100%;padding-top:var(--wp--preset--spacing--small);padding-right:var(--wp--preset--spacing--small);padding-bottom:var(--wp--preset--spacing--small);padding-left:var(--wp--preset--spacing--small)"><!-- wp:group {"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-group"><!-- wp:paragraph -->
<p>★★★★★</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":6,"textColor":"heading","className":"wp-block-heading"} -->
<h6 class="wp-block-heading has-heading-color has-text-color">Easy to use</h6>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>As a small business owner, I needed a website that was affordable. I was able to create a beautiful website that represented my brand.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"margin":{"top":"var:preset|spacing|x-small"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"left"}} -->
<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--x-small)"><!-- wp:image {"id":938,"sizeSlug":"full","linkDestination":"none","style":{"border":{"radius":"20px"}}} -->
<figure class="wp-block-image size-full has-custom-border"><img src="<?php echo esc_url( $images[5] ); ?>" alt="" class="wp-image-938" style="border-radius:20px"/></figure>
<!-- /wp:image -->

<!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">Ronald Richards</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"fontSize":"x-small"} -->
<p class="has-x-small-font-size">Developer</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}}} -->
<div class="wp-block-column"><!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|small","right":"var:preset|spacing|small","bottom":"var:preset|spacing|small","left":"var:preset|spacing|small"}},"border":{"radius":"16px","width":"1px"},"dimensions":{"minHeight":"100%"}},"borderColor":"outline","layout":{"type":"flex","orientation":"vertical","verticalAlignment":"space-between"}} -->
<div class="wp-block-group has-border-color has-outline-border-color" style="border-width:1px;border-radius:16px;min-height:100%;padding-top:var(--wp--preset--spacing--small);padding-right:var(--wp--preset--spacing--small);padding-bottom:var(--wp--preset--spacing--small);padding-left:var(--wp--preset--spacing--small)"><!-- wp:group {"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-group"><!-- wp:paragraph -->
<p>★★★★★</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":6,"textColor":"heading","className":"wp-block-heading"} -->
<h6 class="wp-block-heading has-heading-color has-text-color">Really love it!</h6>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This block-based WordPress theme is a game-changer. I've struggled with complex themes in the past, but this one is easy to use.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"margin":{"top":"var:preset|spacing|x-small"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"left"}} -->
<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--x-small)"><!-- wp:image {"id":931,"sizeSlug":"full","linkDestination":"none","style":{"border":{"radius":"20px"}}} -->
<figure class="wp-block-image size-full has-custom-border"><img src="<?php echo esc_url( $images[3] ); ?>" alt="" class="wp-image-931" style="border-radius:20px"/></figure>
<!-- /wp:image -->

<!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">Leslie Alexander</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"fontSize":"x-small"} -->
<p class="has-x-small-font-size">Business owner</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"style":{"spacing":{"blockGap":"var:preset|spacing|xx-small"}}} -->
<div class="wp-block-column"><!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|small","right":"var:preset|spacing|small","bottom":"var:preset|spacing|small","left":"var:preset|spacing|small"}},"border":{"radius":"16px","width":"1px"},"dimensions":{"minHeight":"100%"}},"borderColor":"outline","layout":{"type":"flex","orientation":"vertical","verticalAlignment":"space-between"}} -->
<div class="wp-block-group has-border-color has-outline-border-color" style="border-width:1px;border-radius:16px;min-height:100%;padding-top:var(--wp--preset--spacing--small);padding-right:var(--wp--preset--spacing--small);padding-bottom:var(--wp--preset--spacing--small);padding-left:var(--wp--preset--spacing--small)"><!-- wp:group {"layout":{"type":"constrained","justifyContent":"left"}} -->
<div class="wp-block-group"><!-- wp:paragraph -->
<p>★★★★★</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":6,"textColor":"heading","className":"wp-block-heading"} -->
<h6 class="wp-block-heading has-heading-color has-text-color">Great on any device</h6>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I've used a few different website builders over the years, and this one is by far the best. The responsive design ensures that my website looks great on any device.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"margin":{"top":"var:preset|spacing|x-small"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"left"}} -->
<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--x-small)"><!-- wp:image {"id":931,"sizeSlug":"full","linkDestination":"none","style":{"border":{"radius":"20px"}}} -->
<figure class="wp-block-image size-full has-custom-border"><img src="<?php echo esc_url( $images[1] ); ?>" alt="" class="wp-image-931" style="border-radius:20px"/></figure>
<!-- /wp:image -->

<!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size">Jacob Jones</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"fontSize":"x-small"} -->
<p class="has-x-small-font-size">Freelancer</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->