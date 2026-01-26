import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-2xl font-bold text-gray-900">
                            PRESSPILOT<span className="text-gray-400">OS</span>
                        </Link>
                        <nav className="flex items-center gap-8">
                            <Link href="/pricing" className="text-gray-900 font-medium">
                                Pricing
                            </Link>
                            <Link href="/docs" className="text-gray-600 hover:text-gray-900 font-medium">
                                Docs
                            </Link>
                            <Link
                                href="/studio"
                                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                            >
                                Get Started
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="max-w-5xl mx-auto px-6 py-16 text-center">
                <h1 className="text-5xl font-bold text-gray-900 mb-4">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-xl text-gray-600">
                    No subscriptions. No hidden fees. Just pay once and own it forever.
                </p>
            </section>

            {/* Pricing Cards */}
            <section className="max-w-6xl mx-auto px-6 pb-20">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Single Theme */}
                    <div className="border-2 border-gray-200 rounded-2xl p-8 hover:border-gray-300 transition-colors">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Single Theme
                            </h3>
                            <p className="text-gray-600">
                                Perfect for individual projects
                            </p>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold text-gray-900">$29.99</span>
                                <span className="text-gray-600">one-time</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">1 WordPress FSE theme</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">Choose from 3 hero styles</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">WooCommerce ready</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">Use on unlimited sites</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">Full source code included</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">Instant download</span>
                            </li>
                        </ul>

                        <Link
                            href="/studio"
                            className="block w-full py-4 bg-black text-white text-center rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                        >
                            Generate Theme
                        </Link>
                    </div>

                    {/* Agency Bundle */}
                    <div className="border-2 border-black rounded-2xl p-8 relative bg-gray-50">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-black text-white text-sm font-semibold rounded-full">
                            Best Value
                        </div>

                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Agency Bundle
                            </h3>
                            <p className="text-gray-600">
                                For agencies & high-volume users
                            </p>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold text-gray-900">$149.99</span>
                                <span className="text-gray-600">one-time</span>
                            </div>
                            <p className="text-sm text-green-600 font-medium mt-2">
                                Save $30 compared to individual purchases
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 font-semibold">6 WordPress FSE themes</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">Choose from 3 hero styles per theme</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">WooCommerce ready</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">Use on unlimited sites</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">Full source code included</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">Priority support</span>
                            </li>
                        </ul>

                        <Link
                            href="/studio"
                            className="block w-full py-4 bg-black text-white text-center rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                        >
                            Get Agency Bundle
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Can I use the theme on multiple sites?
                            </h3>
                            <p className="text-gray-600">
                                Yes! Once you purchase a theme, you can use it on unlimited sites. No restrictions.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Do I need any plugins?
                            </h3>
                            <p className="text-gray-600">
                                No. PressPilot generates pure WordPress FSE themes. No page builders, no dependencies. For e-commerce themes, you'll need WooCommerce (free plugin).
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Can I customize the theme after download?
                            </h3>
                            <p className="text-gray-600">
                                Absolutely! You get full source code. Customize colors, fonts, layouts, and content using the WordPress Site Editor or by editing the code directly.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                What if I need more than 6 themes?
                            </h3>
                            <p className="text-gray-600">
                                Purchase multiple agency bundles or contact us for custom enterprise pricing.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Do you offer refunds?
                            </h3>
                            <p className="text-gray-600">
                                Yes. If you're not satisfied with your theme, contact us within 7 days for a full refund.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-5xl mx-auto px-6 py-20 text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                    Ready to Get Started?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                    Generate your first theme in under 5 minutes
                </p>
                <Link
                    href="/studio"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-all font-semibold text-lg hover:scale-105"
                >
                    Start Generating
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            © 2026 PressPilot. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm text-gray-600">
                            <Link href="/faq" className="hover:text-gray-900">FAQ</Link>
                            <Link href="/docs" className="hover:text-gray-900">Documentation</Link>
                            <Link href="/support" className="hover:text-gray-900">Support</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
