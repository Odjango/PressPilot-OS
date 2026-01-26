import fs from 'fs-extra';
import path from 'path';
import { PageData, UniversalPageTemplate } from './types';
// Patterns will be imported here in the next step
import { getUniversalAboutContent } from './patterns/universal-about';
import { getUniversalServicesContent } from './patterns/universal-services';
import { getUniversalContactContent } from './patterns/universal-contact';
import { getUniversalHomeContent } from './patterns/universal-home';
import { getUniversalMenuContent } from './patterns/universal-menu';
import { getUniversalReservationContent } from './patterns/universal-reservation';
import { getUniversalFooterContent } from './patterns/universal-footer';

export const buildPageTemplate = async (themeDir: string, page: PageData) => {
    const filename = `page-${page.slug}.html`;
    const filePath = path.join(themeDir, 'templates', filename);

    let content = '';

    // Switch for templates (To be populated with actual pattern calls)
    switch (page.template) {
        case 'universal-home':
            content = getUniversalHomeContent(page.content);
            break;
        case 'universal-about':
            content = getUniversalAboutContent(page.content);
            break;
        case 'universal-services':
            content = getUniversalServicesContent(page.content);
            break;
        case 'universal-contact':
            content = getUniversalContactContent(page.content);
            break;
        case 'universal-menu':
            content = getUniversalMenuContent(page.content);
            break;
        case 'universal-reservation':
            content = getUniversalReservationContent(page.content);
            break;
            console.log(`[Override] Overwrote front-page.html with custom home template.`);
    }
};

import { getUniversalHeaderContent } from './patterns/universal-header';

export const buildHeaderTemplate = async (themeDir: string, businessName: string, pages: { title: string, slug: string }[]) => {
    const filename = 'header.html';
    const filePath = path.join(themeDir, 'parts', filename);
    const content = getUniversalHeaderContent(businessName, pages);

    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content.trim());
    console.log(`[Override] Generated custom header with navigation: ${filename}`);
};

export const buildFooterTemplate = async (themeDir: string, businessName: string) => {
    const filename = 'footer.html';
    // Overwrite the 'parts' footer if it exists (Ollie structure)
    // Also check 'patterns' folder if some themes store it there, but standard is parts.
    const filePath = path.join(themeDir, 'parts', filename);
    const content = getUniversalFooterContent(businessName);

    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content.trim());
    console.log(`[Override] Generated branded footer: ${filename}`);
};
