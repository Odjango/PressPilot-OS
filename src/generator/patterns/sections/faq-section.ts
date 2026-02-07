import { PageContent } from '../../types';

/**
 * FAQ Section
 *
 * 3-4 frequently asked questions.
 * Uses `base` background for clean white appearance.
 */
export function getFAQSection(content?: PageContent, industry?: string): string {
    const faqs = getFAQsForIndustry(industry);

    return `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
    <!-- wp:heading {"textAlign":"center","textColor":"contrast"} -->
    <h2 class="wp-block-heading has-text-align-center has-contrast-color has-text-color">Frequently Asked Questions</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"align":"center","textColor":"contrast-2"} -->
    <p class="has-text-align-center has-contrast-2-color has-text-color">Have questions? We have answers.</p>
    <!-- /wp:paragraph -->
    <!-- wp:group {"align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}},"layout":{"type":"constrained","contentSize":"800px"}} -->
    <div class="wp-block-group alignwide" style="margin-top:var(--wp--preset--spacing--50)">
        <!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30"}},"border":{"bottom":{"color":"var:preset|color|base-2","width":"1px"}}},"layout":{"type":"constrained"}} -->
        <div class="wp-block-group" style="border-bottom-color:var(--wp--preset--color--base-2);border-bottom-width:1px;padding-top:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30)">
            <!-- wp:heading {"level":4,"textColor":"accent"} -->
            <h4 class="wp-block-heading has-accent-color has-text-color">${faqs[0].question}</h4>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">${faqs[0].answer}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30"}},"border":{"bottom":{"color":"var:preset|color|base-2","width":"1px"}}},"layout":{"type":"constrained"}} -->
        <div class="wp-block-group" style="border-bottom-color:var(--wp--preset--color--base-2);border-bottom-width:1px;padding-top:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30)">
            <!-- wp:heading {"level":4,"textColor":"accent"} -->
            <h4 class="wp-block-heading has-accent-color has-text-color">${faqs[1].question}</h4>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">${faqs[1].answer}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30"}},"border":{"bottom":{"color":"var:preset|color|base-2","width":"1px"}}},"layout":{"type":"constrained"}} -->
        <div class="wp-block-group" style="border-bottom-color:var(--wp--preset--color--base-2);border-bottom-width:1px;padding-top:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30)">
            <!-- wp:heading {"level":4,"textColor":"accent"} -->
            <h4 class="wp-block-heading has-accent-color has-text-color">${faqs[2].question}</h4>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">${faqs[2].answer}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
        <!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30"}}},"layout":{"type":"constrained"}} -->
        <div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30)">
            <!-- wp:heading {"level":4,"textColor":"accent"} -->
            <h4 class="wp-block-heading has-accent-color has-text-color">${faqs[3].question}</h4>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"contrast-2"} -->
            <p class="has-contrast-2-color has-text-color">${faqs[3].answer}</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->`;
}

interface FAQ {
    question: string;
    answer: string;
}

function getFAQsForIndustry(industry?: string): FAQ[] {
    const defaults: FAQ[] = [
        {
            question: 'How do I get started?',
            answer: 'Getting started is easy! Simply reach out through our contact form or give us a call. We\'ll schedule a consultation to understand your needs and provide a customized plan.'
        },
        {
            question: 'What are your hours of operation?',
            answer: 'We\'re available Monday through Friday, 9am to 6pm. For urgent matters, we also offer after-hours support.'
        },
        {
            question: 'Do you offer any guarantees?',
            answer: 'Yes! We stand behind our work with a satisfaction guarantee. If you\'re not happy, we\'ll make it right.'
        },
        {
            question: 'How can I contact you?',
            answer: 'You can reach us by phone, email, or through the contact form on our website. We typically respond within one business day.'
        }
    ];

    const industryFAQs: Record<string, FAQ[]> = {
        'restaurant': [
            {
                question: 'Do you take reservations?',
                answer: 'Yes! We accept reservations online through our website or by phone. For parties of 8 or more, we recommend calling ahead.'
            },
            {
                question: 'Do you accommodate dietary restrictions?',
                answer: 'Absolutely. We offer vegetarian, vegan, and gluten-free options. Please let your server know about any allergies or dietary needs.'
            },
            {
                question: 'Is parking available?',
                answer: 'Yes, we have a dedicated parking lot behind the restaurant with complimentary parking for all guests.'
            },
            {
                question: 'Do you offer catering services?',
                answer: 'We offer full-service catering for events of all sizes. Contact us for a custom menu and quote.'
            }
        ],
        'ecommerce': [
            {
                question: 'What is your shipping policy?',
                answer: 'We offer free standard shipping on orders over $50. Express and overnight options are also available at checkout.'
            },
            {
                question: 'What is your return policy?',
                answer: 'We accept returns within 30 days of purchase. Items must be unused and in original packaging. Free returns on all orders.'
            },
            {
                question: 'Do you ship internationally?',
                answer: 'Yes, we ship to most countries worldwide. International shipping rates are calculated at checkout.'
            },
            {
                question: 'How can I track my order?',
                answer: 'Once your order ships, you\'ll receive an email with a tracking number. You can also check order status in your account.'
            }
        ],
        'saas_product': [
            {
                question: 'Is there a free trial?',
                answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to start.'
            },
            {
                question: 'Can I cancel anytime?',
                answer: 'Absolutely. There are no long-term contracts. You can upgrade, downgrade, or cancel your subscription at any time.'
            },
            {
                question: 'Is my data secure?',
                answer: 'Security is our top priority. We use industry-standard encryption and undergo regular security audits.'
            },
            {
                question: 'Do you offer onboarding support?',
                answer: 'Yes, all plans include access to our knowledge base and email support. Premium plans include dedicated onboarding sessions.'
            }
        ],
        'service': [
            {
                question: 'How much does it cost?',
                answer: 'Pricing varies based on the scope of your project. We offer free consultations and detailed quotes so you know exactly what to expect.'
            },
            {
                question: 'How long does a typical project take?',
                answer: 'Project timelines depend on complexity. We\'ll provide a realistic timeline during our initial consultation.'
            },
            {
                question: 'Are you licensed and insured?',
                answer: 'Yes, we are fully licensed and insured. We\'re happy to provide documentation upon request.'
            },
            {
                question: 'Do you offer warranties on your work?',
                answer: 'Yes, all our work comes with a satisfaction guarantee. We stand behind everything we do.'
            }
        ],
        'fitness': [
            {
                question: 'Do I need to be in shape to join?',
                answer: 'Not at all! We welcome members of all fitness levels. Our trainers will help you start where you are and progress at your own pace.'
            },
            {
                question: 'What should I bring to my first class?',
                answer: 'Just bring comfortable workout clothes, athletic shoes, a water bottle, and a positive attitude. We provide everything else.'
            },
            {
                question: 'Can I freeze my membership?',
                answer: 'Yes, we offer membership freezes for vacations, injuries, or other circumstances. Just let us know in advance.'
            },
            {
                question: 'Do you offer personal training?',
                answer: 'Yes! We have certified personal trainers available for one-on-one sessions. Packages and rates are available at the front desk.'
            }
        ]
    };

    return industryFAQs[industry || ''] || defaults;
}
