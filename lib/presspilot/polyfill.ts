import 'jsdom-global/register';

// Polyfills for WP dependencies
if (typeof window !== 'undefined') {
    (window as any).requestAnimationFrame = (cb: any) => setTimeout(cb, 0);
    (window as any).cancelAnimationFrame = (id: any) => clearTimeout(id);
    (window as any).requestIdleCallback = (cb: any) => setTimeout(cb, 1);
    (window as any).cancelIdleCallback = (id: any) => clearTimeout(id);
    (window as any).matchMedia = (window as any).matchMedia || function () {
        return { matches: false, addListener: function () { }, removeListener: function () { } };
    };

    // Critical: RequestIdleCallback dependency needs MutationObserver on global scope immediately
    (global as any).MutationObserver = (window as any).MutationObserver;
    (global as any).requestIdleCallback = (window as any).requestIdleCallback;
    (global as any).cancelIdleCallback = (window as any).cancelIdleCallback;
    (global as any).window = window; // Ensure global.window is explicit
    (global as any).navigator = { userAgent: 'node.js', platform: 'MacIntel' };

    // React Polyfill for WP
    const React = require('react');
    const ReactDOM = require('react-dom');
    (global as any).React = React;
    (global as any).ReactDOM = ReactDOM;
    (window as any).React = React;
    (window as any).ReactDOM = ReactDOM;
}
