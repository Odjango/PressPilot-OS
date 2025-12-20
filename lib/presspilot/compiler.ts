
import { BlockNode } from './serializer';
import { SiteLayout, Section, PageLayout, NavItem, FooterColumn, SocialLink, FeatureItem, PricingTier, UpdateCard } from './extractor';

/**
 * Agent 2: Compiler
 * Transforms the abstract Site Layout into concrete WordPress Block ASTs.
 * 
 * Output: map of "filename" -> AST.
 */
export function compileAST(layout: SiteLayout): Record<string, BlockNode[]> {
    const artifacts: Record<string, BlockNode[]> = {};

    // 1. Compile Parts
    artifacts['parts/header.html'] = compileHeader(layout);
    artifacts['parts/footer.html'] = compileFooter(layout);

    // 2. Compile Front Page
    artifacts['templates/front-page.html'] = compileFrontPage(layout.frontPage.sections);

    // 3. Compile Pages
    for (const [key, page] of Object.entries(layout.pages)) {
        artifacts[`templates/page-${key}.html`] = compilePage(page);
    }

    // 4. Compile Fallback Index (Critical for Site Editor)
    artifacts['templates/index.html'] = compileIndex();

    return artifacts;
}

// --- Specific Compilers ---

function compileHeader(layout: SiteLayout): BlockNode[] {
    // SAFE MODE: Simplified Header structure per user request.
    // Exact requested structure wrapper: <div class="wp-block-group">...</div>
    // We include Logo + Title + Navigation simply.

    return [
        {
            name: 'core/group',
            attributes: {
                tagName: 'header',
                align: 'full',
                layout: { type: 'constrained' } // Minimal attributes
            },
            innerBlocks: [
                {
                    name: 'core/group',
                    attributes: { layout: { type: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' } },
                    innerBlocks: [
                        {
                            name: 'core/group',
                            attributes: { layout: { type: 'flex' } },
                            innerBlocks: [
                                { name: 'core/site-logo', attributes: { width: 64 } },
                                { name: 'core/site-title', attributes: { level: 1 } }
                            ]
                        },
                        {
                            name: 'core/navigation',
                            attributes: { overlayMenu: 'mobile' }
                        }
                    ]
                }
            ]
        }
    ];
}

function compileFooter(layout: SiteLayout): BlockNode[] {
    // Structure: Group(Footer) -> Columns -> [Copyright, Links, Social]
    // Simplifying for MVP assembly line:
    // Group -> Columns [ Branding/Copyright, Links, Social ]

    // Col 1: Branding info
    const brandingCol: BlockNode = {
        name: 'core/column',
        attributes: { width: '40%' },
        innerBlocks: [
            { name: 'core/site-title', attributes: { level: 2 } }, // Fixed: level: 0 is invalid
            { name: 'core/paragraph', textContent: layout.footer.copyright, attributes: { fontSize: 'small' } }
        ]
    };

    // Col 2: Links
    const linksCol: BlockNode = {
        name: 'core/column',
        attributes: { width: '30%' },
        innerBlocks: layout.footer.columns.flatMap(col => [
            { name: 'core/heading', attributes: { level: 4 }, textContent: col.heading },
            ...col.links.map(link => ({
                name: 'core/paragraph',
                innerHTML: `<p><a href="${link.url}">${link.label}</a></p>`
            }))
        ])
    };

    // Col 3: Social
    const validSocialLinks = layout.footer.socialLinks
        .filter(link => link.url && link.url.trim().length > 0)
        .map(link => createSocialLink(link));

    const socialCol: BlockNode = {
        name: 'core/column',
        attributes: { width: '30%' },
        innerBlocks: [
            {
                name: 'core/social-links',
                attributes: {}, // layout flex default
                innerBlocks: validSocialLinks
            }
        ]
    };

    return [
        {
            name: 'core/group',
            attributes: { tagName: 'footer', align: 'full', style: { spacing: { padding: { top: 'var:preset|spacing|50', bottom: 'var:preset|spacing|50' } } } },
            innerBlocks: [
                {
                    name: 'core/columns',
                    attributes: { align: 'wide' },
                    innerBlocks: [brandingCol, linksCol, socialCol]
                }
            ]
        }
    ];
}

function compileFrontPage(sections: Section[]): BlockNode[] {
    let mainBlocks = sections.map(compileSection);

    // STRESS TEST INJECTION: Heavy Content V3
    // If the site title indicates a stress test, we inject massively more content.
    if ((global as any).THEME_CONFIG?.site_title === 'Heavy Stress Test') {
        console.log("Injecting MASSIVE content for stress test (Heavy Content V3)...");

        // 1. Duplicate existing sections 5 times (Volume)
        const volumeSections = [...sections, ...sections, ...sections, ...sections, ...sections].map(compileSection);
        mainBlocks = [...mainBlocks, ...volumeSections];

        // 2. Button Wall (60+ buttons)
        const buttonWall: BlockNode = {
            name: 'core/group',
            attributes: { layout: { type: 'constrained' }, style: { spacing: { margin: { top: 'var:preset|spacing|80' } } } },
            innerBlocks: [
                { name: 'core/heading', attributes: { level: 2 }, textContent: 'Stress Test: 60 Buttons' },
                {
                    name: 'core/buttons',
                    attributes: { layout: { type: 'flex', flexWrap: 'wrap' } },
                    innerBlocks: Array.from({ length: 60 }).map((_, i) => ({
                        name: 'core/button',
                        attributes: { className: i % 2 === 0 ? 'is-style-fill' : 'is-style-outline' },
                        textContent: `Button ${i + 1}`
                    }))
                }
            ]
        };
        mainBlocks.push(buttonWall);

        // 3. Deep Nesting (Group > Columns > Column > Group > Columns > Column)
        const deepNesting: BlockNode = {
            name: 'core/group',
            attributes: { layout: { type: 'constrained' }, backgroundColor: 'base' },
            innerBlocks: [{
                name: 'core/columns',
                innerBlocks: [{
                    name: 'core/column',
                    innerBlocks: [{
                        name: 'core/group',
                        attributes: { backgroundColor: 'surface' },
                        innerBlocks: [{
                            name: 'core/columns',
                            innerBlocks: [{
                                name: 'core/column',
                                innerBlocks: [
                                    { name: 'core/heading', attributes: { level: 3 }, textContent: 'Deep Nest Level 6' },
                                    { name: 'core/paragraph', textContent: 'This text is buried 6 levels deep.' }
                                ]
                            }]
                        }]
                    }]
                }]
            }]
        };
        mainBlocks.push(deepNesting);

        // 4. Tables with alignment (Stress Test)
        const tableBlock: BlockNode = {
            name: 'core/table',
            attributes: { hasFixedLayout: true, className: 'is-style-stripes' },
            innerHTML: `<figure class="wp-block-table is-style-stripes"><table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Data A</td><td>Data B</td></tr><tr><td>Data C</td><td>Data D</td></tr></tbody></table></figure>` // Table block uses innerHTML mostly
        };
        mainBlocks.push({
            name: 'core/group',
            attributes: { layout: { type: 'constrained' } },
            innerBlocks: [{ name: 'core/heading', attributes: { level: 2 }, textContent: 'Stress Test: Tables' }, tableBlock]
        });

        // 5. Query Loops (3 Variations)
        const queryLoop = (postType: string, perPage: number) => ({
            name: 'core/query',
            attributes: { query: { perPage, pages: 0, offset: 0, postType, order: 'desc', orderBy: 'date', author: '', search: '', exclude: [], sticky: '' } },
            innerBlocks: [
                {
                    name: 'core/post-template',
                    innerBlocks: [
                        { name: 'core/post-title', attributes: { isLink: true } },
                        { name: 'core/post-date' },
                        { name: 'core/post-excerpt' },
                        { name: 'core/list', innerBlocks: [{ name: 'core/list-item', textContent: 'Nested List in Query' }] }
                    ]
                },
                { name: 'core/query-pagination' },
                { name: 'core/query-no-results', innerBlocks: [{ name: 'core/paragraph', textContent: 'No posts found.' }] }
            ]
        });

        mainBlocks.push(queryLoop('post', 3));
        mainBlocks.push(queryLoop('post', 6));
        mainBlocks.push(queryLoop('page', 3));
    }

    return [
        createTemplatePart('header'),
        {
            name: 'core/group',
            attributes: { tagName: 'main' },
            innerBlocks: mainBlocks
        },
        createTemplatePart('footer')
    ];
}

function compileIndex(): BlockNode[] {
    return [
        createTemplatePart('header'),
        {
            name: 'core/group',
            attributes: { tagName: 'main', layout: { type: 'constrained' } },
            innerBlocks: [
                { name: 'core/heading', attributes: { level: 1 }, textContent: 'Blog' },
                { name: 'core/paragraph', textContent: 'Welcome to the blog.' }
            ]
        },
        createTemplatePart('footer')
    ];
}

function compilePage(page: PageLayout): BlockNode[] {
    const mainBlocks = page.sections.map(compileSection);
    return [
        createTemplatePart('header'),
        {
            name: 'core/group',
            attributes: { tagName: 'main' },
            innerBlocks: [
                {
                    name: 'core/group',
                    attributes: { layout: { type: 'constrained' } },
                    innerBlocks: [
                        { name: 'core/post-title', attributes: { textAlign: 'center' } }, // Dynamic title
                        ...mainBlocks
                    ]
                }
            ]
        },
        createTemplatePart('footer')
    ];
}

// --- Section Factories ---

function compileSection(section: Section): BlockNode {
    switch (section.type) {
        case 'hero': return compileHero(section);
        case 'features': return compileFeatures(section);
        case 'pricing': return compilePricing(section);
        case 'updates': return compileUpdates(section);
        case 'contact': return compileContact(section);
        case 'generic-content': return compileGeneric(section);
    }
}

function compileHero(hero: Section & { type: 'hero' }): BlockNode {
    // SAFE MODE: Hard-replaced Hero logic.
    // Structure: <div class="wp-block-cover"><span ...></span><div ...><h1>...</h1></div></div>

    return {
        name: 'core/cover',
        attributes: {
            url: '', // No image for safe mode
            dimRatio: 100, // Matches has-background-dim-100
            overlayColor: 'black', // Matches has-black-background-color
            align: 'full',
            contentPosition: 'center center'
        },
        innerBlocks: [
            {
                name: 'core/heading',
                attributes: { textAlign: 'center', level: 1 },
                textContent: hero.title
            }
        ]
    };
}

function compileFeatures(section: Section & { type: 'features' }): BlockNode {
    return {
        name: 'core/group',
        attributes: { align: 'full', layout: { type: 'constrained' }, backgroundColor: 'surface', style: { spacing: { padding: { top: 'var:preset|spacing|60', bottom: 'var:preset|spacing|60' } } } },
        innerBlocks: [
            { name: 'core/heading', attributes: { level: 2, textAlign: 'center' }, textContent: section.heading },
            {
                name: 'core/columns',
                attributes: { align: 'wide' },
                innerBlocks: section.items.map(item => ({
                    name: 'core/column',
                    innerBlocks: [
                        { name: 'core/paragraph', attributes: { fontSize: 'large' }, textContent: item.icon }, // icon as emoji
                        { name: 'core/heading', attributes: { level: 3, fontSize: 'medium' }, textContent: item.label },
                        { name: 'core/paragraph', attributes: { fontSize: 'small' }, textContent: item.description }
                    ]
                }))
            }
        ]
    };
}

function compilePricing(section: Section & { type: 'pricing' }): BlockNode {
    // Similar to Features but 3 cols
    return {
        name: 'core/group',
        attributes: { align: 'full', layout: { type: 'constrained' }, style: { spacing: { padding: { top: 'var:preset|spacing|60', bottom: 'var:preset|spacing|60' } } } },
        innerBlocks: [
            { name: 'core/heading', attributes: { level: 2, textAlign: 'center' }, textContent: section.heading },
            { name: 'core/paragraph', attributes: { align: 'center' }, textContent: section.subheading },
            {
                name: 'core/columns',
                attributes: { align: 'wide' },
                innerBlocks: section.tiers.map(tier => ({
                    name: 'core/column',
                    attributes: { style: { border: { width: '1px' } } }, // Simplification
                    innerBlocks: [
                        { name: 'core/heading', attributes: { level: 3 }, textContent: tier.name },
                        { name: 'core/heading', attributes: { level: 2 }, textContent: tier.price },
                        { name: 'core/list', innerBlocks: tier.features.map(f => ({ name: 'core/list-item', textContent: f })) },
                        { name: 'core/button', attributes: { width: '100%' }, textContent: tier.cta }
                    ]
                }))
            }
        ]
    };
}

function compileUpdates(section: Section & { type: 'updates' }): BlockNode {
    return {
        name: 'core/group',
        attributes: { align: 'full', layout: { type: 'constrained' }, backgroundColor: 'surface' },
        innerBlocks: [
            { name: 'core/heading', attributes: { level: 2, textAlign: 'center' }, textContent: section.heading },
            {
                name: 'core/columns',
                attributes: { align: 'wide' },
                innerBlocks: section.cards.map(card => ({
                    name: 'core/column',
                    innerBlocks: [
                        { name: 'core/paragraph', attributes: { fontSize: 'small', style: { typography: { textTransform: 'uppercase' } } }, textContent: card.eyebrow },
                        { name: 'core/heading', attributes: { level: 3 }, textContent: card.title },
                        { name: 'core/paragraph', textContent: card.body }
                    ]
                }))
            }
        ]
    };
}

function compileContact(section: Section & { type: 'contact' }): BlockNode {
    return {
        name: 'core/group',
        attributes: {
            align: 'full',
            layout: { type: 'constrained' },
            backgroundColor: 'base',
            tagName: 'section', // Semantic HTML
            style: { spacing: { padding: { top: 'var:preset|spacing|80', bottom: 'var:preset|spacing|80' } } }
        },
        innerBlocks: [
            { name: 'core/heading', attributes: { level: 2, textAlign: 'center' }, textContent: section.headline },
            { name: 'core/paragraph', attributes: { align: 'center' }, textContent: section.body },
            {
                name: 'core/buttons',
                attributes: { layout: { type: 'flex', justifyContent: 'center' } },
                innerBlocks: [
                    { name: 'core/button', attributes: { className: 'is-style-fill' }, textContent: section.primaryCta }
                ]
            }
        ]
    };
}

function compileGeneric(section: Section & { type: 'generic-content' }): BlockNode {
    return {
        name: 'core/group',
        innerBlocks: [
            { name: 'core/heading', attributes: { level: 2 }, textContent: section.title },
            { name: 'core/paragraph', textContent: section.body }
        ]
    };
}

// --- Helpers ---

function createNavLink(item: NavItem): BlockNode {
    return {
        name: 'core/navigation-link',
        attributes: { label: item.label, url: item.url, kind: 'custom' }
    };
}

function createSocialLink(link: SocialLink): BlockNode {
    // Map platform to service
    const serviceMap: Record<string, string> = { 'twitter': 'twitter', 'instagram': 'instagram', 'facebook': 'facebook', 'linkedin': 'linkedin' };
    return {
        name: 'core/social-link',
        attributes: { service: serviceMap[link.platform] || 'link', url: link.url }
    };
}

function createTemplatePart(slug: 'header' | 'footer'): BlockNode {
    return {
        name: 'core/template-part',
        attributes: { slug, tagName: slug }
    };
}

