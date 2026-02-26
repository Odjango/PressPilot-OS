import { FSEKnowledgeBase, FSEBlockGenerator } from './parser';

// Singleton instances
let kbInstance: FSEKnowledgeBase | null = null;
let generatorInstance: FSEBlockGenerator | null = null;

/**
 * Initialize the FSE Knowledge Base.
 *
 * Must be called once before using getBlockGenerator().
 * Loads block specifications for WordPress 6.7+ compliance.
 *
 * @example
 * ```typescript
 * initFSEKnowledgeBase();
 * const gen = getBlockGenerator();
 * const block = gen.generate('site-logo', { width: 120 });
 * ```
 */
export function initFSEKnowledgeBase(): void {
  if (kbInstance) {
    console.log('⚠️  FSE Knowledge Base already initialized');
    return;
  }
  
  console.log('🚀 Initializing FSE Knowledge Base...');
  
  kbInstance = new FSEKnowledgeBase();
  generatorInstance = new FSEBlockGenerator(kbInstance);
  
  console.log('✅ FSE Knowledge Base ready');
  console.log(`📚 Available blocks: ${kbInstance.getBlockNames().join(', ')}`);
}

/**
 * Get the block generator instance.
 *
 * Returns a singleton FSEBlockGenerator for creating WordPress blocks.
 * Throws error if FSE Knowledge Base not initialized.
 *
 * @returns Block generator instance
 * @throws {Error} If initFSEKnowledgeBase() not called first
 *
 * @example
 * ```typescript
 * const gen = getBlockGenerator();
 * const logo = gen.generate('site-logo', { width: 120 });
 * // Returns: <!-- wp:core/site-logo {"width":120,"isLink":true} /-->
 * ```
 */
export function getBlockGenerator(): FSEBlockGenerator {
  if (!generatorInstance) {
    throw new Error('FSE Knowledge Base not initialized. Call initFSEKnowledgeBase() first.');
  }
  return generatorInstance;
}

/**
 * Get the knowledge base instance for direct spec lookups.
 *
 * @returns FSE Knowledge Base instance
 * @throws {Error} If initFSEKnowledgeBase() not called first
 */
export function getKnowledgeBase(): FSEKnowledgeBase {
  if (!kbInstance) {
    throw new Error('FSE Knowledge Base not initialized. Call initFSEKnowledgeBase() first.');
  }
  return kbInstance;
}

// Re-export types
export type { BlockSpec } from './parser';
export { FSEKnowledgeBase, FSEBlockGenerator } from './parser';
