# FSE Knowledge Base - Developer Guide

## For Developers Working on PressPilot Theme Generation

### Quick Start

```typescript
// 1. Import
import { initFSEKnowledgeBase, getBlockGenerator } from './lib/fse-kb';

// 2. Initialize (once per app lifecycle)
initFSEKnowledgeBase();

// 3. Get generator
const gen = getBlockGenerator();

// 4. Generate blocks
const header = gen.generate('template-part', {
  slug: 'header',
  tagName: 'header'
});
```

### Available Blocks

Currently supported (9 core blocks):
- `template-part` - Reusable template sections
- `group` - Container block with layout options
- `site-logo` - Site logo from WordPress settings
- `navigation` - Navigation menus
- `heading` - h1-h6 headings
- `paragraph` - Text paragraphs
- `cover` - Full-width hero sections
- `buttons` - Button container
- `button` - Individual buttons

### Pattern Generation Example

```typescript
import { getBlockGenerator } from '../../lib/fse-kb';

export const generateHeader = (businessName: string, pages: PageData[]) => {
  const gen = getBlockGenerator();

  // Generate individual blocks
  const logo = gen.generate('site-logo', { width: 120 });
  const nav = gen.generate('navigation');

  // Compose into header
  const header = gen.generate('group', {
    tagName: 'header',
    className: 'site-header',
    layout: { type: 'flex', justifyContent: 'space-between' }
  }, `${logo}\n${nav}`);

  return header;
};
```

### Adding New Block Support

To add support for additional WordPress blocks:

1. **Open `src/lib/fse-kb/parser.ts`**

2. **Add block specification:**
   ```typescript
   this.specs.set('new-block', {
     name: 'new-block',
     blockName: 'core/new-block',
     selfClosing: true, // or false
     requiredAttributes: ['attr1', 'attr2'],
     defaultAttributes: {
       width: 100,
       align: 'center'
     }
   });
   ```

3. **Reference documentation:**
   - Check `docs/fse-kb/BLOCK-REFERENCE-BATCH-*.md`
   - Find the block specification
   - Copy exact attribute names and defaults

### Testing

Always test generated themes in WordPress:

1. Generate a theme: `npm run generate`
2. Upload to WordPress 6.7+
3. Open Site Editor
4. Check for validation errors (should be zero)

### Troubleshooting

**Issue:** Block not generating
```typescript
// Check if block exists
const kb = getKnowledgeBase();
console.log(kb.getBlockNames()); // List all available blocks
```

**Issue:** Missing required attribute
```typescript
// Error will specify which attribute is missing
Error: Missing required attribute "slug" for core/template-part
```

**Issue:** Wrong output format
```typescript
// Compare your output to docs/fse-kb/BLOCK-REFERENCE-BATCH-*.md
```
