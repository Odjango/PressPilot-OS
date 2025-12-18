
import { PressPilotBusinessCopy } from './kit';

export interface SiteLayout {
    siteTitle: string;
    header: {
        navItems: NavItem[];
    };
    footer: {
        copyright: string;
        columns: FooterColumn[];
        socialLinks: SocialLink[];
    };
    frontPage: {
        sections: Section[];
    };
    pages: Record<string, PageLayout>;
}

export interface NavItem {
    label: string;
    url: string;
}

export interface FooterColumn {
    heading: string;
    links: NavItem[];
}

export interface SocialLink {
    platform: string;
    url: string;
}

export interface PageLayout {
    title: string;
    slug: string;
    sections: Section[];
}

export type Section =
    | { type: 'hero'; title: string; subtitle: string; primaryCta: Link; secondaryCta?: Link }
    | { type: 'features'; heading: string; items: FeatureItem[] }
    | { type: 'pricing'; heading: string; subheading: string; tiers: PricingTier[] }
    | { type: 'updates'; heading: string; subheading: string; cards: UpdateCard[] }
    | { type: 'contact'; headline: string; body: string; primaryCta: string; email: string }
    | { type: 'generic-content'; title: string; body: string };

export interface Link {
    label: string;
    url: string;
}

export interface FeatureItem {
    icon: string;
    label: string;
    description: string;
}

export interface PricingTier {
    name: string;
    price: string;
    features: string[];
    cta: string;
    highlight?: boolean;
}

export interface UpdateCard {
    eyebrow: string;
    title: string;
    body: string;
}

/**
 * Agent 1: Extractor
 * Transforms raw Kit Config + Business Copy into a clean, abstract Site Layout.
 * 
 * This layer knows NOTHING about WordPress blocks. It only knows about "Sections" and "Content".
 */
export function extractLayout(
    brandName: string,
    copy: PressPilotBusinessCopy
): SiteLayout {

    // 1. Build Front Page Sections
    const frontPageSections: Section[] = [
        {
            type: 'hero',
            title: copy.hero.title,
            subtitle: copy.hero.subtitle,
            primaryCta: { label: copy.hero.primaryCta, url: copy.hero.primaryCtaUrl || '#contact' },
            secondaryCta: copy.hero.secondaryCta ? { label: copy.hero.secondaryCta, url: copy.hero.secondaryCtaUrl || '#services' } : undefined
        },
        {
            type: 'features',
            heading: copy.featuresHeading,
            items: copy.features
        },
        {
            type: 'pricing',
            heading: copy.pricingHeading,
            subheading: copy.pricingSubheading,
            tiers: copy.pricing
        },
        {
            type: 'updates',
            heading: copy.updatesHeading,
            subheading: copy.updatesSubheading,
            cards: copy.updates
        },
        {
            type: 'contact',
            headline: copy.contact.headline,
            body: copy.contact.body,
            primaryCta: copy.contact.primaryCta,
            email: copy.contact.email || ''
        }
    ];

    // 2. Build Pages (Standard set based on typical kit needs)
    // In a real scenario, this might come from kit config, but for now we standardize.
    const pages: Record<string, PageLayout> = {
        'about': {
            title: 'About',
            slug: 'about',
            sections: [{ type: 'generic-content', title: 'About Us', body: 'We are ' + brandName }]
        },
        'services': {
            title: 'Services',
            slug: 'services',
            sections: [{ type: 'generic-content', title: 'Our Services', body: 'We offer great services.' }]
        },
        'contact': {
            title: 'Contact',
            slug: 'contact',
            sections: [{ type: 'generic-content', title: 'Contact Us', body: copy.contact.body }]
        }
    };

    return {
        siteTitle: brandName,
        header: {
            navItems: [
                { label: 'Home', url: '/' },
                { label: 'About', url: '/about' },
                { label: 'Services', url: '/services' },
                { label: 'Contact', url: '/contact' }
            ]
        },
        footer: {
            copyright: `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`,
            columns: [
                { heading: 'Company', links: [{ label: 'About', url: '/about' }, { label: 'Contact', url: '/contact' }] },
                { heading: 'Services', links: [{ label: 'Services', url: '/services' }] }
            ],
            socialLinks: [
                { platform: 'twitter', url: '#' },
                { platform: 'instagram', url: '#' }
            ]
        },
        frontPage: {
            sections: frontPageSections
        },
        pages
    };
}
