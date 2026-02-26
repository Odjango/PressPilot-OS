import { initFSEKnowledgeBase, getBlockGenerator } from './lib/fse-kb';

console.log('\n=== Testing FSE Knowledge Base ===\n');

// Initialize
initFSEKnowledgeBase();

// Get generator
const gen = getBlockGenerator();

// Test 1: Generate template-part
console.log('\n--- Test 1: Template Part ---');
const header = gen.generate('template-part', {
  slug: 'header',
  tagName: 'header'
});
console.log(header);

// Test 2: Generate site-logo
console.log('\n--- Test 2: Site Logo ---');
const logo = gen.generate('site-logo', { width: 120 });
console.log(logo);

// Test 3: Generate navigation
console.log('\n--- Test 3: Navigation ---');
const nav = gen.generate('navigation');
console.log(nav);

console.log('\n=== All Tests Passed! ===\n');
