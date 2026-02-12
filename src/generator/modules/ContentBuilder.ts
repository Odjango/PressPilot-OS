import { GeneratorData, PageData, RestaurantMenu, ThemePersonality, HeroLayout } from '../types';
import { PATTERN_REGISTRY } from '../config/PatternRegistry';
import { getModernImageUrl } from '../utils/ImageProvider';
import { sanitizeUserInput } from '../utils/sanitize';

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
    heroLayout?: HeroLayout; // Hero layout selection (fullBleed, fullWidth, split, minimal)
}

export class ContentBuilder {
    invoke(baseTheme: string, userData: GeneratorData): ContentJSON {
        console.log(`[ContentBuilder] Building content for base: ${baseTheme}`);
        const safeUserData = sanitizeUserInput<GeneratorData>(userData);

        const personality = PATTERN_REGISTRY[baseTheme];
        const slots: Record<string, string> = {};

        // 1. Map Hero Content
        const hero_headline = safeUserData.hero_headline || 'Build your site with clicks, not code.';
        const hero_subheadline = safeUserData.hero_subheadline || 'Easily create beautiful, fully-customizable websites.';
        const industry = (safeUserData.industry || 'saas').toLowerCase();

        if (personality) {
            slots[personality.patterns.hero_search_headline] = hero_headline;
            slots[personality.patterns.hero_search_sub] = hero_subheadline;
            if (personality.patterns.hero_search_pretitle) {
                slots[personality.patterns.hero_search_pretitle] = industry.toUpperCase();
            }
        }

        // 2. Prepare Images (uses cached Unsplash images or fallback)
        const images: string[] = [];
        for (let i = 0; i < 5; i++) {
            images.push(getModernImageUrl(safeUserData.industry || 'general', i));
        }

        // Add hero images to slots for pattern injection
        slots['{{HERO_IMAGE}}'] = images[0];
        slots['{{HERO_IMAGE_2}}'] = images[1];
        slots['{{HERO_IMAGE_3}}'] = images[2];
        slots['{{HERO_IMAGE_4}}'] = images[3];
        slots['{{HERO_IMAGE_5}}'] = images[4];

        // 3. Prepare Pages and Menus
        const pages = [...(safeUserData.pages || [])];
        const menus = safeUserData.menus || [];

        // Industry-specific Page Injection
        const vertical = industry;

        if (vertical === 'restaurant' || vertical === 'cafe' || vertical === 'restaurant_cafe') {
            if (!pages.find(p => p.slug === 'menu')) {
                pages.push({ title: 'Menu', slug: 'menu', template: 'universal-menu' });
            }
        } else if (vertical === 'ecommerce' || vertical === 'retail' || vertical === 'shop' || vertical === 'online_store') {
            if (!pages.find(p => p.slug === 'shop')) {
                pages.push({ title: 'Shop', slug: 'shop', template: 'universal-shop' });
            }
        } else if (vertical === 'portfolio' || vertical === 'talent' || vertical === 'agency' || vertical === 'creative') {
            if (!pages.find(p => p.slug === 'gallery')) {
                pages.push({ title: 'Gallery', slug: 'gallery', template: 'universal-portfolio' });
            }
        }

        // 4. Universal Slots (For Prepared Cores)
        slots['{{BUSINESS_NAME}}'] = safeUserData.name || 'My PressPilot Site';
        slots['{{HERO_TITLE}}'] = hero_headline;
        slots['{{HERO_TEXT}}'] = hero_subheadline;
        slots['{{HERO_PRETITLE}}'] = industry.toUpperCase();
        slots['{{HERO_CTA}}'] = 'Get Started';
        slots['{{LOGO_URL}}'] = safeUserData.logo || '';
        slots['{{SERVICES_TITLE}}'] = 'Our Services';
        slots['{{SERVICES_TEXT}}'] = safeUserData.description || 'We offer high-quality services tailored to your needs.';
        slots['{{ABOUT_PRETITLE}}'] = 'Overview';
        slots['{{ABOUT_TEXT}}'] = safeUserData.description || 'Dedicated to excellence since 2024.';
        slots['{{FAQ_TITLE}}'] = 'Common Questions';
        slots['{{NEWSLETTER_TITLE}}'] = 'Join our Newsletter';
        slots['{{NEWSLETTER_TEXT}}'] = 'Stay updated with our latest news and offers.';
        slots['{{NEWSLETTER_BUTTON}}'] = 'Subscribe';
        slots['{{store_name}}'] = safeUserData.name || 'Our Store';
        slots['{{business_name}}'] = safeUserData.name || 'Our Business';
        slots['{{tagline}}'] = hero_subheadline;
        slots['{{brand_story}}'] = safeUserData.description || 'We curate thoughtful products with quality craftsmanship and everyday usefulness.';
        slots['{{sale_headline}}'] = 'Seasonal Picks Are Here';
        slots['{{sale_discount}}'] = '20%';
        slots['{{sale_end_date}}'] = 'Sunday';
        slots['{{instagram_handle}}'] = 'ourstore';
        slots['{{featured_collection_image}}'] = images[0];
        slots['{{brand_story_image}}'] = images[1];
        slots['{{brand_value_1}}'] = 'Small-batch quality';
        slots['{{brand_value_2}}'] = 'Ethically sourced materials';
        slots['{{brand_value_3}}'] = 'Designed for everyday use';

        // Add numbered services placeholders
        for (let i = 1; i <= 6; i++) {
            slots[`{{SERVICE_${i}_TITLE}}`] = `Service ${i}`;
            slots[`{{SERVICE_${i}_TEXT}}`] = `High-quality description for service ${i}.`;
        }

        // Ecommerce placeholders
        for (let i = 1; i <= 6; i++) {
            slots[`{{product_${i}_title}}`] = `Product ${i}`;
            slots[`{{product_${i}_price}}`] = `$${(19 + i * 7).toFixed(2)}`;
            slots[`{{product_${i}_image}}`] = images[(i - 1) % images.length];
        }
        for (let i = 1; i <= 4; i++) {
            slots[`{{category_${i}_name}}`] = ['Women', 'Men', 'Accessories', 'New Arrivals'][i - 1] || `Category ${i}`;
            slots[`{{category_${i}_image}}`] = images[(i + 1) % images.length];
        }
        for (let i = 1; i <= 3; i++) {
            slots[`{{testimonial_${i}_quote}}`] = `Love the quality and fast delivery.`;
            slots[`{{testimonial_${i}_name}}`] = `Customer ${i}`;
            slots[`{{testimonial_${i}_product}}`] = `Product ${i}`;
            slots[`{{testimonial_${i}_rating}}`] = '5';
        }
        for (let i = 1; i <= 6; i++) {
            slots[`{{instagram_post_${i}_image}}`] = images[(i + 2) % images.length];
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

        // ========================================================================
        // Contact Information Slots (Phase 13 - Best Practices)
        // These slots are used by universal-contact.ts and universal-footer.ts
        // Values come from user input; fallback to empty string (not hardcoded demos)
        // ========================================================================
        slots['{{CONTACT_EMAIL}}'] = safeUserData.email || '';
        slots['{{CONTACT_PHONE}}'] = safeUserData.phone || '';
        slots['{{CONTACT_ADDRESS}}'] = safeUserData.address || '';
        slots['{{CONTACT_CITY}}'] = safeUserData.city || '';
        slots['{{CONTACT_STATE}}'] = safeUserData.state || '';
        slots['{{CONTACT_ZIP}}'] = safeUserData.zip || '';
        slots['{{CONTACT_COUNTRY}}'] = safeUserData.country || '';
        slots['{{CONTACT_NEIGHBORHOOD}}'] = safeUserData.neighborhood || '';

        // Build full address from parts (if any are provided)
        const addressParts = [
            safeUserData.address,
            safeUserData.city,
            safeUserData.state,
            safeUserData.zip
        ].filter(Boolean);
        slots['{{CONTACT_FULL_ADDRESS}}'] = addressParts.length > 0 ? addressParts.join(', ') : '';

        // Social link slots
        slots['{{SOCIAL_FACEBOOK}}'] = safeUserData.socialLinks?.facebook || '#';
        slots['{{SOCIAL_INSTAGRAM}}'] = safeUserData.socialLinks?.instagram || '#';
        slots['{{SOCIAL_TWITTER}}'] = safeUserData.socialLinks?.twitter || '#';
        slots['{{SOCIAL_LINKEDIN}}'] = safeUserData.socialLinks?.linkedin || '#';
        slots['{{SOCIAL_YOUTUBE}}'] = safeUserData.socialLinks?.youtube || '#';
        slots['{{SOCIAL_TIKTOK}}'] = safeUserData.socialLinks?.tiktok || '#';

        // ========================================================================
        // Populate page.content with contact info for each page
        // This ensures patterns like universal-contact.ts have access to data
        // ========================================================================
        const contactInfo = {
            business_name: safeUserData.name || 'Our Business',
            business_type: safeUserData.businessType || safeUserData.industry || '',
            email: safeUserData.email || '',
            phone: safeUserData.phone || '',
            address: safeUserData.address || '',
            city: safeUserData.city || '',
            state: safeUserData.state || '',
            zip: safeUserData.zip || '',
            full_address: addressParts.length > 0 ? addressParts.join(', ') : '',
            opening_hours: safeUserData.openingHours || {},
            social_facebook: safeUserData.socialLinks?.facebook || '#',
            social_instagram: safeUserData.socialLinks?.instagram || '#',
            social_twitter: safeUserData.socialLinks?.twitter || '#'
        };

        // Add contact info to each page's content
        for (const page of pages) {
            if (!page.content) {
                page.content = {};
            }
            // Merge contact info into page content
            page.content = { ...page.content, ...contactInfo };
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
            businessName: safeUserData.name || 'My PressPilot Site',
            industry: industry, // Now passing industry through
            heroLayout: safeUserData.heroLayout // Hero layout selection
        };
    }
}
