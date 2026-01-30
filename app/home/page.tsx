import Link from 'next/link';
import { ArrowRight, Check, Zap, Shield, Sparkles, FileCode } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="max-w-7xl mx-auto px-6 py-20 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-8">
                    <Sparkles className="w-4 h-4" />
                    Professional WordPress. Zero Hassle.
                </div>

                <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                    Production-Ready WordPress,<br />
                    <span className="text-gray-400">Structured by AI</span>
                </h2>

                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                    Generate clean, FSE-native WordPress themes with correct structure, zero plugins, and no technical debt.<br />
                    Built for agencies, developers, and serious WordPress users.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <Link
                        href="/studio"
                        className="px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-all font-semibold text-lg flex items-center gap-2 hover:scale-105"
                    >
                        Generate Your Theme
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                        href="/pricing"
                        className="px-8 py-4 border-2 border-gray-200 text-gray-900 rounded-lg hover:border-gray-300 transition-colors font-semibold text-lg"
                    >
                        View Pricing
                    </Link>
                </div>

                <p className="text-sm text-gray-500 mt-6">
                    Starting at $29.99 • No monthly fees • Instant download
                </p>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 border border-gray-200 rounded-2xl">
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Lightning Fast
                        </h3>
                        <p className="text-gray-600">
                            Preview your site structure in seconds. Download a complete WordPress theme in under a minute.
                        </p>
                    </div>

                    <div className="p-8 border border-gray-200 rounded-2xl">
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Zero Dependencies
                        </h3>
                        <p className="text-gray-600">
                            Pure WordPress FSE themes. No plugins. No page builders. Just clean, standard WordPress code.
                        </p>
                    </div>

                    <div className="p-8 border border-gray-200 rounded-2xl">
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                            <Check className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Own It Forever
                        </h3>
                        <p className="text-gray-600">
                            One-time purchase. Unlimited sites. Full source code included. No lock-in.
                        </p>
                    </div>
                </div>
            </section>

            {/* Technical Differentiation */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Built for Real WordPress Projects
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            PressPilot doesn't generate demos or experiments.<br />
                            It generates production-ready WordPress themes designed to work correctly in the Site Editor.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-8 md:p-12">
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold text-gray-900">FSE-native block themes</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold text-gray-900">Clean block markup and layout structure</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold text-gray-900">No database-bound navigation</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold text-gray-900">No editor "Attempt Recovery" issues</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold text-gray-900">No cleanup after installation</span>
                                </div>
                            </li>
                        </ul>

                        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                            <p className="text-lg font-semibold text-gray-900 text-center">
                                What you download is what you ship.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
                        How It Works
                    </h2>

                    <div className="space-y-8">
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl">
                                1
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Enter Your Business Info
                                </h3>
                                <p className="text-gray-600">
                                    Define structure, content, and layout rules in minutes.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl">
                                2
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Choose Your Hero Style
                                </h3>
                                <p className="text-gray-600">
                                    Select from professionally generated structural variations.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl">
                                3
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Download & Install
                                </h3>
                                <p className="text-gray-600">
                                    Pay once. Download instantly. Install on any WordPress host. Done.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">
                        Ready to Generate a Clean WordPress Theme?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join agencies and developers who want WordPress done right — without plugins, builders, or technical debt.
                    </p>
                    <Link
                        href="/studio"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-all font-semibold text-lg hover:scale-105"
                    >
                        Start Generating
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>


        </div>
    );
}
