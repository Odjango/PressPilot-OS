import { PageContent } from '../../types';

/**
 * Value Proposition Section
 *
 * "Built for [industry]" with 3 benefit cards.
 * Uses `base` background for clean white appearance.
 */
export function getValuePropositionSection(content?: PageContent, industry?: string): string {
    const industryLabel = getIndustryLabel(industry);
    const benefits = getBenefitsForIndustry(industry);

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Built for ${industryLabel}</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">Everything you need to succeed, all in one place.</p>
    <!-- /wp:paragraph -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|40"},"margin":{"top":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--50)">
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}},"border":{"radius":"8px"}},"backgroundColor":"base-2"} -->
        <div class="wp-block-column has-base-2-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
            <!-- wp:heading {"level":3,"textColor":"accent"} -->
            <h3 class="wp-block-heading has-accent-color has-text-color">${benefits[0].title}</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">${benefits[0].description}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}},"border":{"radius":"8px"}},"backgroundColor":"base-2"} -->
        <div class="wp-block-column has-base-2-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
            <!-- wp:heading {"level":3,"textColor":"accent"} -->
            <h3 class="wp-block-heading has-accent-color has-text-color">${benefits[1].title}</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">${benefits[1].description}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}},"border":{"radius":"8px"}},"backgroundColor":"base-2"} -->
        <div class="wp-block-column has-base-2-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
            <!-- wp:heading {"level":3,"textColor":"accent"} -->
            <h3 class="wp-block-heading has-accent-color has-text-color">${benefits[2].title}</h3>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">${benefits[2].description}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

function getIndustryLabel(industry?: string): string {
    const labels: Record<string, string> = {
        'restaurant': 'Restaurants',
        'restaurant_cafe': 'Restaurants & Cafes',
        'cafe': 'Cafes',
        'ecommerce': 'E-commerce',
        'saas_product': 'SaaS Products',
        'service': 'Service Businesses',
        'local_store': 'Local Businesses',
        'fitness': 'Fitness & Wellness',
        'portfolio': 'Creative Professionals'
    };
    return labels[industry || ''] || 'Your Business';
}

interface Benefit {
    title: string;
    description: string;
}

function getBenefitsForIndustry(industry?: string): Benefit[] {
    const defaults: Benefit[] = [
        { title: 'Professional Design', description: 'Stand out with a polished, modern look that builds trust with your audience.' },
        { title: 'Easy to Update', description: 'Make changes anytime with an intuitive interface. No coding required.' },
        { title: 'Mobile Ready', description: 'Look great on every device, from desktop to smartphone.' }
    ];

    const industryBenefits: Record<string, Benefit[]> = {
        'restaurant': [
            { title: 'Menu Showcase', description: 'Display your dishes beautifully with organized menus and appetizing descriptions.' },
            { title: 'Online Reservations', description: 'Let customers book tables directly through your website, 24/7.' },
            { title: 'Location & Hours', description: 'Help diners find you easily with maps, hours, and contact info front and center.' }
        ],
        'ecommerce': [
            { title: 'Product Catalog', description: 'Showcase your products with stunning galleries and detailed descriptions.' },
            { title: 'Secure Checkout', description: 'Give customers confidence with a smooth, secure purchasing experience.' },
            { title: 'Inventory Ready', description: 'Connect with WooCommerce to manage products, orders, and shipping.' }
        ],
        'saas_product': [
            { title: 'Feature Highlights', description: 'Clearly communicate what makes your product unique and valuable.' },
            { title: 'Conversion Focused', description: 'Guide visitors toward signup with strategic calls to action.' },
            { title: 'Trust Signals', description: 'Build credibility with testimonials, logos, and social proof.' }
        ],
        'service': [
            { title: 'Service Showcase', description: 'Present your offerings clearly so clients know exactly what you provide.' },
            { title: 'Lead Generation', description: 'Capture inquiries with prominent contact forms and calls to action.' },
            { title: 'Credibility Building', description: 'Highlight your expertise, experience, and client success stories.' }
        ],
        'fitness': [
            { title: 'Class Schedules', description: 'Display your fitness classes and training sessions in an easy-to-read format.' },
            { title: 'Membership Info', description: 'Showcase pricing plans and membership benefits clearly.' },
            { title: 'Trainer Profiles', description: 'Introduce your team and build trust with potential members.' }
        ]
    };

    return industryBenefits[industry || ''] || defaults;
}
