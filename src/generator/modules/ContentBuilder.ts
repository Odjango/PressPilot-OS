import { GeneratorData, PageData, RestaurantMenu, ThemePersonality } from '../types';
import { PATTERN_REGISTRY } from '../config/PatternRegistry';
import { getModernImageUrl } from '../utils/ImageProvider';

export interface ContentJSON {
    hero: {
        headline: string;
        subheadline: string;
        pretitle: string;
        images: string[];
    };
    pages: PageData[];
    menus: RestaurantMenu[];
    slots: Record<string, string>; // Pattern search/replace pairs
    baseName: string;
    businessName: string;
    industry: string; // Added industry field
}

export class ContentBuilder {
    invoke(baseTheme: string, userData: GeneratorData): ContentJSON {
        console.log(`[ContentBuilder] Building content for base: ${baseTheme}`);

        const personality = PATTERN_REGISTRY[baseTheme];
        const slots: Record<string, string> = {};

        // 1. Map Hero Content
        const hero_headline = userData.hero_headline || 'Build your site with clicks, not code.';
        const hero_subheadline = userData.hero_subheadline || 'Easily create beautiful, fully-customizable websites.';
        const industry = (userData.industry || 'saas').toLowerCase();

        if (personality) {
            slots[personality.patterns.hero_search_headline] = hero_headline;
            slots[personality.patterns.hero_search_sub] = hero_subheadline;
            if (personality.patterns.hero_search_pretitle) {
                slots[personality.patterns.hero_search_pretitle] = industry.toUpperCase();
            }
        }

        // 2. Prepare Images
        const images: string[] = [];
        for (let i = 0; i < 5; i++) {
            images.push(getModernImageUrl(userData.industry || 'general', i));
        }

        // 3. Prepare Pages and Menus
        const pages = [...(userData.pages || [])];
        const menus = userData.menus || [];

        // Industry-specific Page Injection
        const vertical = industry;

        if (vertical === 'restaurant' || vertical === 'cafe' || vertical === 'restaurant_cafe') {
            if (!pages.find(p => p.slug === 'menu')) {
                pages.push({ title: 'Menu', slug: 'menu', template: 'universal-menu' });
            }
        } else if (vertical === 'portfolio' || vertical === 'agency' || vertical === 'creative') {
            if (!pages.find(p => p.slug === 'gallery')) {
                pages.push({ title: 'Gallery', slug: 'gallery', template: 'universal-about' });
            }
        }

        // 4. Universal Slots (For Prepared Cores)
        slots['{{BUSINESS_NAME}}'] = userData.name || 'My PressPilot Site';
        slots['{{HERO_TITLE}}'] = hero_headline;
        slots['{{HERO_TEXT}}'] = hero_subheadline;
        slots['{{HERO_PRETITLE}}'] = industry.toUpperCase();
        slots['{{HERO_CTA}}'] = 'Get Started';
        slots['{{LOGO_URL}}'] = userData.logo || '';
        slots['{{SERVICES_TITLE}}'] = 'Our Services';
        slots['{{SERVICES_TEXT}}'] = userData.description || 'We offer high-quality services tailored to your needs.';
        slots['{{ABOUT_PRETITLE}}'] = 'Overview';
        slots['{{ABOUT_TEXT}}'] = userData.description || 'Dedicated to excellence since 2024.';
        slots['{{FAQ_TITLE}}'] = 'Common Questions';
        slots['{{NEWSLETTER_TITLE}}'] = 'Join our Newsletter';
        slots['{{NEWSLETTER_TEXT}}'] = 'Stay updated with our latest news and offers.';
        slots['{{NEWSLETTER_BUTTON}}'] = 'Subscribe';

        // Add numbered services placeholders
        for (let i = 1; i <= 6; i++) {
            slots[`{{SERVICE_${i}_TITLE}}`] = `Service ${i}`;
            slots[`{{SERVICE_${i}_TEXT}}`] = `High-quality description for service ${i}.`;
        }

        // Add numbered FAQ placeholders
        for (let i = 1; i <= 4; i++) {
            slots[`{{FAQ_${i}_QUESTION}}`] = `Frequently Asked Question ${i}?`;
            slots[`{{FAQ_${i}_ANSWER}}`] = `This is a helpful answer that provides details about question ${i}.`;
        }

        // Add numbered pricing placeholders (3 plans)
        slots['{{PRICING_TITLE}}'] = 'Our Pricing';
        slots['{{PRICING_TEXT}}'] = 'Choose a plan that fits your budget and goals.';
        slots['{{PRICING_CTA}}'] = 'Subscribe Now';
        for (let i = 1; i <= 3; i++) {
            slots[`{{PLAN_${i}_NAME}}`] = ['Starter', 'Professional', 'Enterprise'][i - 1];
            slots[`{{PLAN_${i}_PRICE}}`] = ['$19', '$49', '$99'][i - 1];
            for (let j = 1; j <= 3; j++) {
                slots[`{{PLAN_${i}_FEATURE_${j}}}`] = `Premium feature #${j} for your plan.`;
            }
        }

        return {
            hero: {
                headline: hero_headline,
                subheadline: hero_subheadline,
                pretitle: industry.toUpperCase(),
                images: images
            },
            pages: pages,
            menus: menus,
            slots: slots,
            baseName: baseTheme,
            businessName: userData.name || 'My PressPilot Site',
            industry: industry // Now passing industry through
        };
    }
}