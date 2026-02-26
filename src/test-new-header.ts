import { getUniversalHeaderContent } from './generator/patterns/universal-header-new';

console.log('\n=== Testing New FSE-Powered Header ===\n');

const pages = [
  { title: 'About', slug: 'about' },
  { title: 'Services', slug: 'services' },
  { title: 'Contact', slug: 'contact' }
];

const header = getUniversalHeaderContent('Test Business', pages, true, false);

console.log(header);
console.log('\n=== Done ===\n');
