/**
 * WordPress Core Blocks Registry
 * Source: https://developer.wordpress.org/block-editor/reference-guides/core-blocks/
 * Last Updated: 2026-01-25
 */

export const WORDPRESS_CORE_BLOCKS = [
    // Text
    'core/paragraph',
    'core/heading',
    'core/list',
    'core/list-item',
    'core/quote',
    'core/code',
    'core/preformatted',
    'core/pullquote',
    'core/table',
    'core/verse',

    // Media
    'core/image',
    'core/gallery',
    'core/audio',
    'core/cover',
    'core/file',
    'core/media-text',
    'core/video',

    // Design
    'core/buttons',
    'core/button',
    'core/columns',
    'core/column',
    'core/group',
    'core/row',
    'core/stack',
    'core/separator',
    'core/spacer',

    // Widgets
    'core/shortcode',
    'core/archives',
    'core/calendar',
    'core/categories',
    'core/html',
    'core/latest-comments',
    'core/latest-posts',
    'core/page-list',
    'core/rss',
    'core/search',
    'core/social-links',
    'core/social-link',
    'core/tag-cloud',

    // Theme
    'core/navigation',
    'core/navigation-link',
    'core/navigation-submenu',
    'core/site-logo',
    'core/site-title',
    'core/site-tagline',
    'core/query',
    'core/post-template',
    'core/post-title',
    'core/post-content',
    'core/post-date',
    'core/post-excerpt',
    'core/post-featured-image',
    'core/post-terms',
    'core/post-author',
    'core/post-author-biography',
    'core/avatar',
    'core/comment-author-name',
    'core/comment-content',
    'core/comment-date',
    'core/comment-edit-link',
    'core/comment-reply-link',
    'core/comment-template',
    'core/comments',
    'core/comments-pagination',
    'core/comments-pagination-next',
    'core/comments-pagination-numbers',
    'core/comments-pagination-previous',
    'core/comments-title',
    'core/loginout',
    'core/term-description',
    'core/query-pagination',
    'core/query-pagination-next',
    'core/query-pagination-numbers',
    'core/query-pagination-previous',
    'core/read-more',
    'core/template-part',
    'core/block',

    // Embeds
    'core/embed',
    'core-embed/twitter',
    'core-embed/youtube',
    'core-embed/facebook',
    'core-embed/instagram',
    'core-embed/wordpress',
    'core-embed/soundcloud',
    'core-embed/spotify',
    'core-embed/flickr',
    'core-embed/vimeo',
    'core-embed/animoto',
    'core-embed/cloudup',
    'core-embed/crowdsignal',
    'core-embed/dailymotion',
    'core-embed/imgur',
    'core-embed/issuu',
    'core-embed/kickstarter',
    'core-embed/meetup-com',
    'core-embed/mixcloud',
    'core-embed/reddit',
    'core-embed/reverbnation',
    'core-embed/screencast',
    'core-embed/scribd',
    'core-embed/slideshare',
    'core-embed/smugmug',
    'core-embed/speaker-deck',
    'core-embed/tiktok',
    'core-embed/ted',
    'core-embed/tumblr',
    'core-embed/videopress',
    'core-embed/wordpress-tv',
    'core-embed/amazon-kindle',

    // Patterns
    'core/pattern',

    // Misc
    'core/more',
    'core/nextpage',
    'core/missing',
    'core/freeform',
    'core/legacy-widget'
];

/**
 * WooCommerce Blocks Registry
 * Source: https://github.com/woocommerce/woocommerce-blocks
 * Last Updated: 2026-01-25
 */
export const WOOCOMMERCE_BLOCKS = [
    // Product Display
    'woocommerce/product-collection',
    'woocommerce/product-template',
    'woocommerce/product-image',
    'woocommerce/product-title',
    'woocommerce/product-price',
    'woocommerce/product-rating',
    'woocommerce/product-button',
    'woocommerce/product-summary',
    'woocommerce/product-sku',
    'woocommerce/product-category-list',
    'woocommerce/product-tag-list',
    'woocommerce/product-stock-indicator',
    'woocommerce/product-sale-badge',

    // Featured Products
    'woocommerce/featured-product',
    'woocommerce/featured-category',

    // Product Categories
    'woocommerce/product-categories',
    'woocommerce/product-category',

    // Cart & Checkout
    'woocommerce/cart',
    'woocommerce/checkout',
    'woocommerce/mini-cart',
    'woocommerce/cart-items-block',
    'woocommerce/cart-totals-block',
    'woocommerce/checkout-fields-block',
    'woocommerce/checkout-totals-block',

    // Customer Account
    'woocommerce/customer-account',
    'woocommerce/order-confirmation',

    // Filters (Product Collection)
    'woocommerce/product-filter',
    'woocommerce/active-filters',
    'woocommerce/attribute-filter',
    'woocommerce/price-filter',
    'woocommerce/stock-filter',
    'woocommerce/rating-filter',

    // Store Elements
    'woocommerce/store-notices',
    'woocommerce/breadcrumbs',
    'woocommerce/product-search',

    // Legacy (Shortcode-based, avoid in FSE)
    'woocommerce/legacy-template',
    'woocommerce/classic-shortcode'
];

/**
 * Combined allowlist for BlockValidator
 */
export const ALLOWED_BLOCKS = [
    ...WORDPRESS_CORE_BLOCKS,
    ...WOOCOMMERCE_BLOCKS
];

/**
 * Block Categories for validation context
 */
export const BLOCK_CATEGORIES = {
    text: ['core/paragraph', 'core/heading', 'core/list', 'core/quote'],
    media: ['core/image', 'core/gallery', 'core/video', 'core/audio'],
    design: ['core/buttons', 'core/columns', 'core/group', 'core/separator'],
    widgets: ['core/search', 'core/latest-posts', 'core/categories'],
    theme: ['core/navigation', 'core/site-logo', 'core/template-part'],
    woocommerce: WOOCOMMERCE_BLOCKS
};

/**
 * Blocks that MUST NOT appear in FSE themes (Classic/Legacy)
 */
export const FORBIDDEN_BLOCKS = [
    'core/legacy-widget',
    'core/freeform', // Classic editor block
    'woocommerce/legacy-template',
    'woocommerce/classic-shortcode'
];
