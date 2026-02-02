import fs from 'fs-extra';
import path from 'path';
import { PageData, UniversalPageTemplate, HeroLayout } from './types';
// Patterns will be imported here in the next step
import { getUniversalAboutContent } from './patterns/universal-about';
import { getUniversalServicesContent } from './patterns/universal-services';
import { getUniversalContactContent } from './patterns/universal-contact';
import { getUniversalHomeContent } from './patterns/universal-home';
import { getUniversalMenuContent } from './patterns/universal-menu';
import { getUniversalReservationContent } from './patterns/universal-reservation';
import { getUniversalFooterContent } from './patterns/universal-footer';

export const buildPageTemplate = async (themeDir: string, page: PageData, baseName: string = 'twentytwentyfour', heroLayout?: HeroLayout) => {
    const filename = `page-${page.slug}.html`;
    const filePath = path.join(themeDir, 'templates', filename);

    let innerContent = '';

    // Switch for templates
    switch (page.template) {
        case 'universal-home':
            innerContent = getUniversalHomeContent(page.content, heroLayout);
            break;
        case 'universal-about':
            innerContent = getUniversalAboutContent(page.content);
            break;
        case 'universal-services':
            innerContent = getUniversalServicesContent(page.content);
            break;
        case 'universal-contact':
            innerContent = getUniversalContactContent(page.content);
            break;
        case 'universal-menu':
            innerContent = getUniversalMenuContent(page.content);
            break;
        case 'universal-reservation':
            innerContent = getUniversalReservationContent(page.content);
            break;
    }

    if (innerContent) {
        // FSE COMPLIANT WRAPPING: Using wp:group with inherit:true for alignment support
        const content = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:group {"tagName":"main","layout":{"type":"constrained","contentSize":"1000px","wideSize":"1200px"},"align":"full"} -->
<main class="wp-block-group alignfull">
${innerContent.trim()}
</main>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->`;

        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, content.trim());
        console.log(`[Content] Built FSE-Compliant page template: ${filename}`);

        // If it's the home page, also overwrite front-page.html (Blank Canvas Logic)
        if (page.slug === 'home') {
            const frontPagePath = path.join(themeDir, 'templates', 'front-page.html');
            await fs.writeFile(frontPagePath, content.trim());
            console.log(`[Content] Overwrote front-page.html with clean home content.`);
        }
    }
};


import { getUniversalHeaderContent } from './patterns/universal-header';

export const buildHeaderTemplate = async (themeDir: string, businessName: string, pages: { title: string, slug: string }[], logo?: string, themeSlug: string = 'presspilot-theme', baseName: string = 'twentytwentyfour') => {
    const filename = 'header.html';
    const filePath = path.join(themeDir, 'parts', filename);

    let content = getUniversalHeaderContent(businessName, pages as any, !!logo);

    // Replace theme slug placeholder for branding assets
    content = content.replace(/{THEME_SLUG}/g, themeSlug);

    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content.trim());
    console.log(`[Override] Generated custom header with navigation for theme: ${themeSlug}`);
};

export const buildFooterTemplate = async (themeDir: string, businessName: string, baseName: string = 'twentytwentyfour', themeSlug: string = 'presspilot-theme', tagline?: string, logo?: string) => {
    const filename = 'footer.html';
    const filePath = path.join(themeDir, 'parts', filename);
    let content = getUniversalFooterContent(businessName, baseName, undefined, !!logo);
    content = content.replace(/{THEME_SLUG}/g, themeSlug);

    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content.trim());
    console.log(`[Override] Generated branded footer: ${filename}`);
};
