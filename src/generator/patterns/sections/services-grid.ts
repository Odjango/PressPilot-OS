import { PageContent } from '../../types';

/**
 * Services/Features Grid Section
 *
 * 4-6 service cards with descriptions.
 * Uses `base-2` background for subtle card surface.
 */
export function getServicesGridSection(content?: PageContent, industry?: string): string {
    const services = getServicesForIndustry(industry);
    const sectionTitle = getSectionTitle(industry);

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"base-2","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-2-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">${sectionTitle}</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">Explore what we have to offer</p>
    <!-- /wp:paragraph -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|30"},"margin":{"top":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--50)">
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}},"border":{"radius":"8px"}},"backgroundColor":"base"} -->
        <div class="wp-block-column has-base-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
            <!-- wp:heading {"level":4,"textColor":"accent"} -->
            <h4 class="wp-block-heading has-accent-color has-text-color">${services[0].title}</h4>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"fontSize":"small","textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color has-small-font-size">${services[0].description}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}},"border":{"radius":"8px"}},"backgroundColor":"base"} -->
        <div class="wp-block-column has-base-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
            <!-- wp:heading {"level":4,"textColor":"accent"} -->
            <h4 class="wp-block-heading has-accent-color has-text-color">${services[1].title}</h4>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"fontSize":"small","textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color has-small-font-size">${services[1].description}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
    <!-- wp:columns {"align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|30"},"margin":{"top":"var:preset|spacing|30"}}}} -->
    <div class="wp-block-columns alignwide" style="margin-top:var(--wp--preset--spacing--30)">
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}},"border":{"radius":"8px"}},"backgroundColor":"base"} -->
        <div class="wp-block-column has-base-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
            <!-- wp:heading {"level":4,"textColor":"accent"} -->
            <h4 class="wp-block-heading has-accent-color has-text-color">${services[2].title}</h4>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"fontSize":"small","textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color has-small-font-size">${services[2].description}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","right":"var:preset|spacing|30","bottom":"var:preset|spacing|30","left":"var:preset|spacing|30"}},"border":{"radius":"8px"}},"backgroundColor":"base"} -->
        <div class="wp-block-column has-base-background-color has-background" style="border-radius:8px;padding-top:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
            <!-- wp:heading {"level":4,"textColor":"accent"} -->
            <h4 class="wp-block-heading has-accent-color has-text-color">${services[3].title}</h4>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"fontSize":"small","textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color has-small-font-size">${services[3].description}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->`;
}

function getSectionTitle(industry?: string): string {
    const titles: Record<string, string> = {
        'restaurant': 'Our Specialties',
        'restaurant_cafe': 'What We Serve',
        'cafe': 'Our Menu',
        'ecommerce': 'Shop Categories',
        'saas_product': 'Features',
        'service': 'Our Services',
        'local_store': 'What We Offer',
        'fitness': 'Programs & Classes',
        'portfolio': 'Services'
    };
    return titles[industry || ''] || 'What We Offer';
}

interface Service {
    title: string;
    description: string;
}

function getServicesForIndustry(industry?: string): Service[] {
    const defaults: Service[] = [
        { title: 'Consultation', description: 'Get expert advice tailored to your specific needs and goals.' },
        { title: 'Implementation', description: 'We handle the details so you can focus on what matters most.' },
        { title: 'Support', description: 'Ongoing assistance to ensure your continued success.' },
        { title: 'Training', description: 'Learn the skills you need to maximize your results.' }
    ];

    const industryServices: Record<string, Service[]> = {
        'restaurant': [
            { title: 'Dine In', description: 'Enjoy our carefully crafted dishes in a welcoming atmosphere.' },
            { title: 'Takeout', description: 'Order ahead and pick up your favorites at your convenience.' },
            { title: 'Catering', description: 'Let us bring our delicious food to your next event.' },
            { title: 'Private Events', description: 'Host your special occasion in our private dining space.' }
        ],
        'ecommerce': [
            { title: 'New Arrivals', description: 'Discover the latest additions to our curated collection.' },
            { title: 'Best Sellers', description: 'Shop our most popular products loved by customers.' },
            { title: 'Sale Items', description: 'Great deals on quality products you\'ll love.' },
            { title: 'Gift Cards', description: 'The perfect gift for any occasion.' }
        ],
        'saas_product': [
            { title: 'Dashboard', description: 'Intuitive interface to manage everything in one place.' },
            { title: 'Analytics', description: 'Deep insights to help you make data-driven decisions.' },
            { title: 'Integrations', description: 'Connect with the tools you already use and love.' },
            { title: 'API Access', description: 'Build custom solutions with our developer-friendly API.' }
        ],
        'service': [
            { title: 'Consultation', description: 'Initial assessment to understand your unique needs.' },
            { title: 'Strategy', description: 'Custom plans designed to achieve your goals.' },
            { title: 'Execution', description: 'Professional implementation with attention to detail.' },
            { title: 'Follow-up', description: 'Ongoing support to ensure lasting results.' }
        ],
        'fitness': [
            { title: 'Personal Training', description: 'One-on-one sessions tailored to your fitness goals.' },
            { title: 'Group Classes', description: 'High-energy workouts in a motivating group setting.' },
            { title: 'Nutrition Coaching', description: 'Expert guidance to fuel your fitness journey.' },
            { title: 'Recovery', description: 'Stretching, massage, and recovery services.' }
        ]
    };

    return industryServices[industry || ''] || defaults;
}
