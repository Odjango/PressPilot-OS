import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-slate-950">
            {/* Hero - with radial gradient background */}
            <section className="relative pt-20 pb-16 text-center overflow-hidden">
                {/* Gradient background effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-slate-950 to-slate-950 pointer-events-none" />
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] blur-3xl pointer-events-none opacity-40"
                    style={{ background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.4) 0%, transparent 70%)' }}
                />

                <div className="relative max-w-5xl mx-auto px-6">
                    {/* Trust Badge - gradient border style */}
                    <div className="inline-flex items-center px-5 py-2 bg-slate-900/80 border border-cyan-500/30 rounded-full text-sm text-slate-300 mb-8 backdrop-blur-sm">
                        <span className="text-cyan-400">AI-Generated</span>
                        <span className="mx-2 text-slate-600">·</span>
                        <span className="text-emerald-400">FSE-Validated</span>
                        <span className="mx-2 text-slate-600">·</span>
                        <span className="text-white">Client-Safe</span>
                    </div>

                    {/* Main Headline - with gradient text */}
                    <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
                        WordPress FSE themes<br />
                        — <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">without editor errors</span> .
                    </h1>

                {/* Subheadline */}
                <p className="text-base text-slate-400 max-w-2xl mx-auto mb-4">
                    Generate production-ready WordPress Full Site Editing themes using AI.
                    No coding required. No broken blocks. No "Attempt Recovery."
                </p>

                {/* Speed Value Prop */}
                <p className="text-lg font-semibold text-emerald-400 mb-8">
                    ⚡ Generated in under 30 seconds
                </p>

                    {/* CTA Buttons - pill shapes matching reference */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                        <Link
                            href="/studio"
                            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 rounded-full hover:from-cyan-400 hover:to-teal-400 transition-all font-semibold shadow-lg shadow-cyan-500/25"
                        >
                            Start Building Your Theme
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="px-8 py-3 border border-slate-600 text-white rounded-full hover:border-slate-400 hover:bg-white/5 transition-all font-semibold"
                        >
                            See How It Works
                        </Link>
                    </div>

                    {/* Sub-CTA text */}
                    <p className="text-sm text-slate-500">
                        Built for agencies, freelancers, and WordPress professionals who need client-safe FSE themes they can ship with confidence.
                    </p>
                </div>
            </section>

            {/* Features - tight 2x4 grid matching landing reference */}
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-white mb-2">
                            Everything you need to build safe, professional WordPress themes
                        </h2>
                        <p className="text-sm text-slate-400 max-w-2xl">
                            PressPilot combines AI generation with WordPress FSE best practices to produce themes that work reliably — in the editor and in production.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Row 1 - Cyan titles */}
                        <div className="p-5 bg-slate-900/60 border border-slate-800/60 rounded-lg">
                            <h3 className="text-sm font-semibold text-cyan-400 mb-2">
                                Zero Editor Errors
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Themes are generated using validated block structures to prevent editor issues like "Attempt Recovery," broken navigation, or invalid templates.
                            </p>
                        </div>

                        <div className="p-5 bg-slate-900/60 border border-slate-800/60 rounded-lg">
                            <h3 className="text-sm font-semibold text-cyan-400 mb-2">
                                FSE-Compatible by Design
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Built specifically for WordPress Full Site Editing with correct templates, parts, and layout structure — no legacy hacks or classic theme assumptions.
                            </p>
                        </div>

                        {/* Row 2 - Cyan titles */}
                        <div className="p-5 bg-slate-900/60 border border-slate-800/60 rounded-lg">
                            <h3 className="text-sm font-semibold text-cyan-400 mb-2">
                                WooCommerce Ready
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                E-commerce layouts and templates are generated with WooCommerce compatibility in mind, so shop, product, and cart pages behave as expected.
                            </p>
                        </div>

                        <div className="p-5 bg-slate-900/60 border border-slate-800/60 rounded-lg">
                            <h3 className="text-sm font-semibold text-cyan-400 mb-2">
                                Industry-Specific Structures
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Choose layouts optimized for restaurants, e-commerce, portfolios, fitness, and more — not generic one-size-fits-all templates.
                            </p>
                        </div>

                        {/* Row 3 - Emerald titles (lower 4 cards) */}
                        <div className="p-5 bg-slate-900/60 border border-slate-800/60 rounded-lg">
                            <h3 className="text-sm font-semibold text-emerald-400 mb-2">
                                Instant Download
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Receive a clean, ready-to-install ZIP file you can upload directly to WordPress — no extra setup or builder account required.
                            </p>
                        </div>

                        <div className="p-5 bg-slate-900/60 border border-slate-800/60 rounded-lg">
                            <h3 className="text-sm font-semibold text-emerald-400 mb-2">
                                Brand Color Extraction
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Upload your logo and PressPilot automatically derives a cohesive color palette for your theme.
                            </p>
                        </div>

                        {/* Row 4 - Emerald titles */}
                        <div className="p-5 bg-slate-900/60 border border-slate-800/60 rounded-lg">
                            <h3 className="text-sm font-semibold text-emerald-400 mb-2">
                                AI-Generated Starter Content
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Generate starter copy tailored to your business, ready to refine in the WordPress Site Editor.
                            </p>
                        </div>

                        <div className="p-5 bg-slate-900/60 border border-slate-800/60 rounded-lg">
                            <h3 className="text-sm font-semibold text-emerald-400 mb-2">
                                Multiple Hero Layouts
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Select from professionally designed hero layouts — full-bleed, full-width, split, or minimal — to match your brand.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Theme Showcase Section */}
            <section className="py-16 bg-slate-900/30">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-white mb-3">
                            Real themes. Real businesses. Zero errors.
                        </h2>
                        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                            Every theme is generated with production-ready code, validated block structures, and industry-specific layouts.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Restaurant Theme */}
                        <div className="group">
                            <div className="relative overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/40 mb-3 hover:border-cyan-500/50 transition-all">
                                <img
                                    src="/marketing/restaurant-showcase.png"
                                    alt="Restaurant theme example - Bella Trattoria"
                                    className="w-full h-auto"
                                />
                            </div>
                            <h3 className="text-sm font-semibold text-white mb-1">Restaurant</h3>
                            <p className="text-xs text-slate-500">Full-width hero • Menu sections • Hours & location</p>
                        </div>

                        {/* SaaS Theme */}
                        <div className="group">
                            <div className="relative overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/40 mb-3 hover:border-cyan-500/50 transition-all">
                                <img
                                    src="/marketing/saas-showcase.png"
                                    alt="SaaS theme example - CloudMetrics Analytics"
                                    className="w-full h-auto"
                                />
                            </div>
                            <h3 className="text-sm font-semibold text-white mb-1">SaaS</h3>
                            <p className="text-xs text-slate-500">Features grid • Pricing tables • CTA sections</p>
                        </div>

                        {/* Portfolio Theme */}
                        <div className="group">
                            <div className="relative overflow-hidden rounded-lg border border-slate-800/60 bg-slate-900/40 mb-3 hover:border-cyan-500/50 transition-all">
                                <img
                                    src="/marketing/portfolio-showcase.png"
                                    alt="Portfolio theme example - Sarah Chen Photography"
                                    className="w-full h-auto"
                                />
                            </div>
                            <h3 className="text-sm font-semibold text-white mb-1">Portfolio</h3>
                            <p className="text-xs text-slate-500">Gallery layouts • Project showcase • About page</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works - same card style, aligned spacing */}
            <section id="how-it-works" className="py-16">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-10">
                        <h2 className="text-xl font-bold text-white mb-2">
                            From business details to install-ready theme
                        </h2>
                        <p className="text-sm text-slate-400">
                            Three simple steps — engineered to produce editor-safe WordPress themes.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <div className="p-6 bg-slate-900/60 border border-slate-800/60 rounded-lg">
                            <p className="text-cyan-400 font-semibold text-sm mb-2">01 — Configure Your Brand</p>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Enter your business details, upload your logo, and select colors, fonts, and hero layouts — all mapped to valid theme.json settings.
                            </p>
                        </div>

                        <div className="p-6 bg-slate-900/60 border border-slate-800/60 rounded-lg">
                            <p className="text-cyan-400 font-semibold text-sm mb-2">02 — Generate & Preview</p>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Our AI generates your theme with validated blocks, industry-specific layouts, and custom content in under 30 seconds.
                            </p>
                        </div>

                        <div className="p-6 bg-slate-900/60 border border-slate-800/60 rounded-lg">
                            <p className="text-cyan-400 font-semibold text-sm mb-2">03 — Download & Install</p>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Get your production-ready WordPress theme ZIP — validated, installable, and fully editable in the Site Editor.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-16 bg-slate-900/30">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-white mb-3">
                            Simple, transparent pricing
                        </h2>
                        <p className="text-sm text-slate-400">
                            One-time payment. No subscriptions. No recurring fees.
                        </p>
                    </div>

                    <div className="max-w-md mx-auto">
                        <div className="p-8 bg-slate-900/60 border border-cyan-500/30 rounded-xl">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold text-white mb-2">Single Theme</h3>
                                <div className="flex items-baseline justify-center gap-2 mb-2">
                                    <span className="text-4xl font-bold text-white">$29</span>
                                    <span className="text-slate-400">.99</span>
                                </div>
                                <p className="text-xs text-slate-500">One-time purchase</p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start gap-3 text-sm">
                                    <span className="text-emerald-400 mt-0.5">✓</span>
                                    <span className="text-slate-300">Complete FSE theme ZIP file</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <span className="text-emerald-400 mt-0.5">✓</span>
                                    <span className="text-slate-300">AI-generated content & images</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <span className="text-emerald-400 mt-0.5">✓</span>
                                    <span className="text-slate-300">Premium DALL-E hero image</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <span className="text-emerald-400 mt-0.5">✓</span>
                                    <span className="text-slate-300">Block validation & error checks</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <span className="text-emerald-400 mt-0.5">✓</span>
                                    <span className="text-slate-300">Industry-specific layouts</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <span className="text-emerald-400 mt-0.5">✓</span>
                                    <span className="text-slate-300">7-day download access</span>
                                </li>
                            </ul>

                            <Link
                                href="/studio"
                                className="block w-full text-center px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 rounded-full hover:from-cyan-400 hover:to-teal-400 transition-all font-semibold shadow-lg shadow-cyan-500/25"
                            >
                                Start Building Your Theme
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Flagship Themes - simplified */}
            <section className="py-12">
                <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-white mb-1">
                            Built on real client-style themes
                        </h2>
                        <p className="text-sm text-slate-500">
                            Bella Trattoria, Slate Wine Bar, Nexus Digital, The Cozy Cup, and Ember & Oak are our flagship demo sites, generated with PressPilot and used for screenshots and walkthroughs.
                        </p>
                    </div>
                    <p className="text-xs text-slate-600 whitespace-nowrap">
                        Screenshots and live previews coming in Phase 15.
                    </p>
                </div>
            </section>

            {/* CTA - clean dark section, single centered button */}
            <section className="py-16">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-2xl font-bold text-white mb-3">
                        Ready to build your theme — without the risk?
                    </h2>
                    <p className="text-sm text-slate-400 mb-6">
                        Join businesses and professionals creating reliable WordPress FSE themes with PressPilot.
                    </p>
                    <Link
                        href="/studio"
                        className="inline-flex px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 rounded-full hover:from-cyan-400 hover:to-teal-400 transition-all font-semibold shadow-lg shadow-cyan-500/25"
                    >
                        Create Your Theme Now
                    </Link>
                </div>
            </section>
        </div>
    );
}
