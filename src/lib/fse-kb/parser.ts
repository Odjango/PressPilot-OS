import fs from 'fs';
import path from 'path';

/**
 * Simple block specification structure
 */
export interface BlockSpec {
  name: string; // e.g., "template-part"
  blockName: string; // e.g., "core/template-part"
  selfClosing: boolean;
  requiredAttributes: string[];
  defaultAttributes: Record<string, any>;
}

/**
 * Hardcoded block specs from FSE knowledge base
 * This is Phase 1 - we'll parse markdown files in Phase 2
 */
export class FSEKnowledgeBase {
  private specs: Map<string, BlockSpec> = new Map();
  
  constructor() {
    this.loadHardcodedSpecs();
  }
  
  /**
   * Load essential block specs (hardcoded for now)
   */
  private loadHardcodedSpecs() {
    // Template Part (BATCH 7)
    this.specs.set('template-part', {
      name: 'template-part',
      blockName: 'core/template-part',
      selfClosing: true,
      requiredAttributes: ['slug'],
      defaultAttributes: {
        tagName: 'div'
      }
    });
    
    // Group (BATCH 1)
    this.specs.set('group', {
      name: 'group',
      blockName: 'core/group',
      selfClosing: false,
      requiredAttributes: [],
      defaultAttributes: {
        tagName: 'div'
      }
    });
    
    // Site Logo (BATCH 5)
    this.specs.set('site-logo', {
      name: 'site-logo',
      blockName: 'core/site-logo',
      selfClosing: true,
      requiredAttributes: [],
      defaultAttributes: {
        width: 120,
        isLink: true
      }
    });
    
    // Navigation (BATCH 4)
    this.specs.set('navigation', {
      name: 'navigation',
      blockName: 'core/navigation',
      selfClosing: true,
      requiredAttributes: [],
      defaultAttributes: {}
    });
    
    // Heading (BATCH 2)
    this.specs.set('heading', {
      name: 'heading',
      blockName: 'core/heading',
      selfClosing: false,
      requiredAttributes: [],
      defaultAttributes: {
        level: 2
      }
    });
    
    // Paragraph (BATCH 2)
    this.specs.set('paragraph', {
      name: 'paragraph',
      blockName: 'core/paragraph',
      selfClosing: false,
      requiredAttributes: [],
      defaultAttributes: {}
    });
    
    // Cover (BATCH 1)
    this.specs.set('cover', {
      name: 'cover',
      blockName: 'core/cover',
      selfClosing: false,
      requiredAttributes: [],
      defaultAttributes: {
        dimRatio: 50
      }
    });
    
    // Buttons (BATCH 4)
    this.specs.set('buttons', {
      name: 'buttons',
      blockName: 'core/buttons',
      selfClosing: false,
      requiredAttributes: [],
      defaultAttributes: {}
    });
    
    // Button (BATCH 4)
    this.specs.set('button', {
      name: 'button',
      blockName: 'core/button',
      selfClosing: false,
      requiredAttributes: [],
      defaultAttributes: {}
    });
    
    console.log(`✅ Loaded ${this.specs.size} block specifications`);
  }
  
  /**
   * Get block specification
   */
  getSpec(blockName: string): BlockSpec | undefined {
    // Handle with or without 'core/' prefix
    const normalized = blockName.replace('core/', '');
    return this.specs.get(normalized);
  }
  
  /**
   * Get all block names
   */
  getBlockNames(): string[] {
    return Array.from(this.specs.keys());
  }
}

/**
 * Generate WordPress FSE block markup
 */
export class FSEBlockGenerator {
  constructor(private kb: FSEKnowledgeBase) {}
  
  /**
   * Generate block markup
   */
  generate(
    blockName: string,
    attributes: Record<string, any> = {},
    innerContent: string = ''
  ): string {
    const spec = this.kb.getSpec(blockName);
    
    if (!spec) {
      throw new Error(`Unknown block: ${blockName}`);
    }
    
    // Merge with defaults
    const attrs = { ...spec.defaultAttributes, ...attributes };
    
    // Check required attributes
    for (const required of spec.requiredAttributes) {
      if (!(required in attrs)) {
        throw new Error(`Missing required attribute "${required}" for ${spec.blockName}`);
      }
    }
    
    // Generate markup
    if (spec.selfClosing) {
      return this.generateSelfClosing(spec.blockName, attrs);
    } else {
      return this.generateContainer(spec.blockName, attrs, innerContent);
    }
  }
  
  /**
   * Generate self-closing block
   */
  private generateSelfClosing(blockName: string, attrs: Record<string, any>): string {
    const attrStr = Object.keys(attrs).length > 0 
      ? ' ' + JSON.stringify(attrs)
      : '';
    
    return `<!-- wp:${blockName}${attrStr} /-->`;
  }
  
  /**
   * Generate container block
   */
  private generateContainer(
    blockName: string,
    attrs: Record<string, any>,
    innerContent: string
  ): string {
    const attrStr = Object.keys(attrs).length > 0 
      ? ' ' + JSON.stringify(attrs)
      : '';
    
    const blockNameShort = blockName.replace('core/', '');
    const cssClass = `wp-block-${blockNameShort}`;
    
    // Determine HTML tag
    let htmlTag = 'div';
    if (blockNameShort === 'heading' && attrs.level) {
      htmlTag = `h${attrs.level}`;
    } else if (blockNameShort === 'paragraph') {
      htmlTag = 'p';
    }
    
    return `<!-- wp:${blockName}${attrStr} -->
<${htmlTag} class="${cssClass}">
${innerContent}
</${htmlTag}>
<!-- /wp:${blockName} -->`;
  }
}