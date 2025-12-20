// Shim Browser Environment (JSDOM)
require('jsdom-global')('', {
    url: 'http://localhost/',
    resources: 'usable',
    runScripts: 'dangerously',
});
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.window.cancelAnimationFrame = (id) => clearTimeout(id);
global.window.matchMedia = global.window.matchMedia || function () {
    return { matches: false, addListener: function () { }, removeListener: function () { } };
};
global.MutationObserver = window.MutationObserver;
global.requestIdleCallback = (cb) => setTimeout(cb, 1);
global.cancelIdleCallback = (id) => clearTimeout(id);
global.window.requestIdleCallback = global.requestIdleCallback;
global.window.cancelIdleCallback = global.cancelIdleCallback;
global.navigator = { userAgent: 'node.js', platform: 'MacIntel' };

const { registerCoreBlocks } = require('@wordpress/block-library');
const { getBlockType } = require('@wordpress/blocks');

registerCoreBlocks();

const { createBlock, serialize } = require('@wordpress/blocks');

// Test Paragraph
const p = createBlock('core/paragraph', { content: 'Hello World' });
console.log('Paragraph:', serialize(p));

// Test Heading
const h = createBlock('core/heading', { content: 'My Title', level: 1 });
console.log('Heading:', serialize(h));

// Test Button
const b = createBlock('core/button', { text: 'Click Me' });
console.log('Button (text):', serialize(b));
const b2 = createBlock('core/button', { content: 'Click Me Content' });
console.log('Button (content):', serialize(b2));

// Test List Item
const li = createBlock('core/list-item', { content: 'List Item' });
console.log('List Item:', serialize(li));

// Test Navigation Link
const navLink = createBlock('core/navigation-link', { label: 'Home', url: '/' });
console.log('Nav Link:', serialize(navLink));

