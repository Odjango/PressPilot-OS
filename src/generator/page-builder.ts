import fs from 'fs-extra';
import path from 'path';
import { PageData, UniversalPageTemplate } from './types';
// Patterns will be imported here in the next step
import { getUniversalAboutContent } from './patterns/universal-about';
import { getUniversalServicesContent } from './patterns/universal-services';
import { getUniversalContactContent } from './patterns/universal-contact';

export const buildPageTemplate = async (themeDir: string, page: PageData) => {
    const filename = `page-${page.slug}.html`;
    const filePath = path.join(themeDir, 'templates', filename);

    let content = '';

    // Switch for templates (To be populated with actual pattern calls)
    switch (page.template) {
        case 'universal-about':
            content = getUniversalAboutContent(page.content);
            break;
        case 'universal-services':
            content = getUniversalServicesContent(page.content);
            break;
        case 'universal-contact':
            content = getUniversalContactContent(page.content);
            break;
        default:
            content = `<!-- wp:paragraph --><p>Default Page</p><!-- /wp:paragraph -->`;
    }

    // Wrap in standard Header/Footer layout if needed, or if patterns handle it.
    // Our patterns usually include header/footer refs? 
    // Wait, patterns in 'patterns/index.ts' like `getUniversalBlogContent` include `wp:template-part header`.
    // So our page content should also include them.

    // For now, let's wrap the content with the basic FSE structure
    const fullTemplate = `
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:group {"tagName":"main","layout":{"inherit":true}} -->
<main class="wp-block-group">
    ${content}
</main>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
`;

    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, fullTemplate.trim());
    console.log(`Generated template: ${filename}`);
};
