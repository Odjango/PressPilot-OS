interface PlaceholderFallbackOptions {
    industry?: string;
    heroImage?: string;
}

function titleCaseFromToken(token: string): string {
    return token
        .split('_')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function extractIndex(token: string): number | null {
    const match = token.match(/_(\d+)(?:_|$)/);
    if (!match) return null;
    return Number.parseInt(match[1], 10);
}

function fallbackImageUrl(industry: string, token: string): string {
    const seed = token.replace(/[^a-z0-9_]/gi, '').toLowerCase() || 'image';
    const category = industry || 'business';
    return `https://source.unsplash.com/1200x900/?${category},${seed}`;
}

function defaultForToken(token: string, options: PlaceholderFallbackOptions): string {
    const t = token.toLowerCase();
    const idx = extractIndex(t) || 1;
    const industry = (options.industry || 'business').toLowerCase();

    if (t.startsWith('social_')) return '#';
    if (t.includes('phone')) return '(555) 123-4567';
    if (t.includes('email')) return 'hello@example.com';
    if (t.includes('address')) return '123 Market Street';
    if (t === 'city') return 'San Francisco';
    if (t === 'state') return 'CA';
    if (t === 'zip') return '94103';
    if (t.includes('service_area')) return 'Downtown and nearby neighborhoods';
    if (t.includes('parking_info')) return 'Street parking and paid garage nearby';
    if (t.includes('years_in_business')) return '12+';
    if (t.includes('license_badge')) return 'State Licensed';
    if (t.includes('insurance_badge')) return 'Fully Insured';
    if (t.includes('certification_badge')) return 'Certified Professionals';
    if (t.includes('guarantee_badge')) return 'Satisfaction Guaranteed';
    if (t.startsWith('hours_')) return '9:00 AM - 6:00 PM';

    if (t.includes('image') || t.endsWith('_photo')) {
        return options.heroImage || fallbackImageUrl(industry, t);
    }

    if (t.endsWith('_price') || t.includes('price_')) return `$${(idx * 7 + 12).toFixed(0)}`;
    if (t.endsWith('_rating')) return '5';

    if (t.startsWith('logo_') && t.endsWith('_name')) return `Partner ${idx}`;
    if (t.startsWith('step_') && t.endsWith('_title')) return `Step ${idx}`;
    if (t.startsWith('step_') && t.endsWith('_description')) return `Clear step ${idx} to move from setup to results.`;
    if (t.startsWith('faq_') && t.endsWith('_question')) return `How does this work for ${industry}?`;
    if (t.startsWith('faq_') && t.endsWith('_answer')) return `We tailor the process for ${industry} teams with fast setup and clear next steps.`;

    if (t.startsWith('feature_') && t.endsWith('_title')) return `Feature ${idx}`;
    if (t.startsWith('feature_') && t.endsWith('_description')) return `Built to improve day-to-day operations with less manual effort.`;

    if (t.startsWith('service_') && t.endsWith('_title')) return `Service ${idx}`;
    if (t.startsWith('service_') && t.endsWith('_description')) return `Professional service with transparent pricing and reliable delivery.`;

    if (t.startsWith('product_') && t.endsWith('_title')) return `Product ${idx}`;
    if (t.startsWith('project_') && t.endsWith('_title')) return `Project ${idx}`;
    if (t.startsWith('project_') && t.endsWith('_category')) return 'Featured';

    if (t.startsWith('team_') && t.endsWith('_name')) return `Team Member ${idx}`;
    if (t.startsWith('team_') && t.endsWith('_role')) return 'Specialist';
    if (t.startsWith('team_') && t.endsWith('_bio')) return 'Experienced professional focused on client outcomes.';

    if (t.startsWith('chef_name_')) return `Chef ${idx}`;
    if (t.startsWith('chef_role_')) return 'Executive Chef';
    if (t.startsWith('chef_bio_')) return 'Leads the kitchen with seasonal ingredients and refined technique.';

    if (t.startsWith('testimonial_') && t.endsWith('_name')) return `Customer ${idx}`;
    if (t.startsWith('testimonial_') && t.endsWith('_role')) return 'Client';
    if (t.startsWith('testimonial_') && t.endsWith('_company')) return `Company ${idx}`;
    if (t.startsWith('testimonial_') && t.endsWith('_product')) return `Product ${idx}`;
    if (t.startsWith('testimonial_') && t.endsWith('_quote')) return 'Excellent quality, smooth process, and great results.';

    return titleCaseFromToken(t);
}

export function replaceRemainingPlaceholders(content: string, options: PlaceholderFallbackOptions = {}): string {
    return content.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_m, token: string) => {
        return defaultForToken(token, options);
    });
}
