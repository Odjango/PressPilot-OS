import Link from "next/link";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8">
            <div className="max-w-2xl text-center space-y-8">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase font-sans">
                    Pricing Plans
                </h1>
                <p className="text-lg font-mono text-neutral-600">
                    Our intelligent theme engine is currently in beta. All features are unlocked for early access users.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-12 font-mono text-sm max-w-lg mx-auto">
                    <div className="border border-black bg-white p-6 space-y-4">
                        <h3 className="font-bold uppercase tracking-widest text-xs border-b border-black/10 pb-2">Pilot</h3>
                        <p className="text-3xl font-bold">$0</p>
                        <ul className="space-y-2 text-neutral-500">
                            <li>• Unlimited Generations</li>
                            <li>• AI Wireframing</li>
                            <li>• Standard Themes</li>
                        </ul>
                    </div>
                    <div className="border border-black/20 bg-black text-cream p-6 space-y-4 opacity-50 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-[2px] z-10">
                            <span className="uppercase tracking-widest text-xs border border-cream/30 px-3 py-1 bg-black">Coming Soon</span>
                        </div>
                        <h3 className="font-bold uppercase tracking-widest text-xs border-b border-cream/20 pb-2 text-neutral-400">Enterprise</h3>
                        <p className="text-3xl font-bold text-neutral-400">$299</p>
                        <ul className="space-y-2 text-neutral-600">
                            <li>• Custom Patterns</li>
                            <li>• White Labeling</li>
                            <li>• Priority Support</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12">
                    <Link href="/" className="text-sm font-mono underline hover:text-black/60">
                        ← Return to Studio
                    </Link>
                </div>
            </div>
        </div>
    );
}
