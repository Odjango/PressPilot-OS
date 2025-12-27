// Polyfills for WP dependencies - Lazy Loaded
export function shim() {
    if (typeof window === 'undefined') {
        const jsdom = require('jsdom-global');
        jsdom(); // Register JSDOM

        // Critical: RequestIdleCallback dependency needs MutationObserver on global scope immediately
        (global as any).MutationObserver = (window as any).MutationObserver;
        (global as any).requestIdleCallback = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 1));
        (global as any).cancelIdleCallback = (window as any).cancelIdleCallback || ((id: any) => clearTimeout(id));
        (global as any).window = window; // Ensure global.window is explicit
        (global as any).navigator = { userAgent: 'node.js', platform: 'MacIntel' };

        // Mock matchMedia
        (window as any).matchMedia = (window as any).matchMedia || function () {
            return { matches: false, addListener: function () { }, removeListener: function () { } };
        };
        (window as any).getComputedStyle = (window as any).getComputedStyle || function () {
            return {
                getPropertyValue: () => '',
            };
        };
        (global as any).ResizeObserver = class ResizeObserver {
            observe() { }
            unobserve() { }
            disconnect() { }
        };

        // React Polyfill for WP
        // We use the project's React. 
        // If we require('react') here, it might conflict if not careful, but dynamic require works in Node.
        const React = require('react');
        const ReactDOM = require('react-dom');
        (global as any).React = React;
        (global as any).ReactDOM = ReactDOM;
        (window as any).React = React;
        (window as any).ReactDOM = ReactDOM;
    } else {
        // Browser env - ensure shims if needed
        (window as any).requestAnimationFrame = (window as any).requestAnimationFrame || ((cb: any) => setTimeout(cb, 0));
        (window as any).cancelAnimationFrame = (window as any).cancelAnimationFrame || ((id: any) => clearTimeout(id));
        (window as any).requestIdleCallback = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 1));
        (window as any).cancelIdleCallback = (window as any).cancelIdleCallback || ((id: any) => clearTimeout(id));
    }
}

