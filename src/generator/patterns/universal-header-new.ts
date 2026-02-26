import { initFSEKnowledgeBase, getBlockGenerator } from '../../lib/fse-kb';

// Initialize FSE KB once
let isInitialized = false;
function ensureFSEKnowledgeBase() {
  if (!isInitialized) {
    initFSEKnowledgeBase();
    isInitialized = true;
  }
}

/**
 * Universal Header Pattern - FSE Knowledge Base Powered
 */
export const getUniversalHeaderContent = (
  businessName: string,
  pages: { title: string, slug: string }[],
  hasLogo?: boolean,
  isEcommerce?: boolean
) => {
  // Ensure FSE KB is ready
  ensureFSEKnowledgeBase();
  const gen = getBlockGenerator();
  
  // Generate Navigation Links
  const landingPages = [...pages];
  if (!landingPages.find(p => p.slug === 'home' || p.slug === '')) {
    landingPages.unshift({ title: 'Home', slug: '' });
  }
  
  const navLinks = landingPages.map(page => {
    // Using manual navigation-link markup (not in our KB yet)
    const linkAttrs = JSON.stringify({
      label: page.title,
      url: `/${page.slug === 'home' || page.slug === '' ? '' : page.slug}`,
      kind: 'custom',
      isTopLevelLink: true
    });
    return `<!-- wp:navigation-link ${linkAttrs} /-->`;
  }).join('\n');
  
  // Generate logo block using FSE KB
  const logoBlock = hasLogo
    ? gen.generate('site-logo', {
        width: 80,
        className: 'site-logo'
      })
    : '';
  
  // Generate site title (level 0 = paragraph)
  const siteTitleBlock = `<!-- wp:site-title {"level":0,"style":{"typography":{"fontStyle":"normal","fontWeight":"700","fontSize":"1.5rem"}},"textColor":"contrast"} /-->`;
  
  // Build logo + title group
  const logoTitleGroup = gen.generate('group', {
    layout: { type: 'flex', flexWrap: 'nowrap' },
    style: { spacing: { blockGap: 'var:preset|spacing|20' } }
  }, `    ${logoBlock}\n    ${siteTitleBlock}`);
  
  // Build navigation group
  const navigationGroup = gen.generate('group', {
    layout: { type: 'flex', flexWrap: 'nowrap', justifyContent: 'right' },
    style: { spacing: { blockGap: 'var:preset|spacing|30' } }
  }, `    <!-- wp:navigation {"textColor":"contrast","layout":{"type":"flex","justifyContent":"right","orientation":"horizontal"},"style":{"typography":{"fontWeight":"600","fontSize":"1rem"},"spacing":{"blockGap":"var:preset|spacing|30"}}} -->\n    ${navLinks}\n    <!-- /wp:navigation -->`);
  
  // Build main header group
  const headerContent = `${logoTitleGroup}\n${navigationGroup}`;
  
  const headerGroup = gen.generate('group', {
    tagName: 'header',
    className: 'presspilot-header',
    align: 'full',
    backgroundColor: 'base',
    style: {
      spacing: {
        padding: {
          top: 'var:preset|spacing|30',
          bottom: 'var:preset|spacing|30',
          left: 'var:preset|spacing|50',
          right: 'var:preset|spacing|50'
        }
      },
      border: {
        bottom: {
          color: 'var:preset|color|contrast-3',
          width: '1px'
        }
      }
    },
    layout: {
      type: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'nowrap'
    }
  }, headerContent);
  
  return headerGroup;
};
