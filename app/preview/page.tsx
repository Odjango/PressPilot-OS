'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HeroCarousel, HeroPreview } from '@/src/components/HeroCarousel';
import { Loader2 } from 'lucide-react';

function PreviewPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const previewId = searchParams.get('id');

    const [previews, setPreviews] = useState<HeroPreview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!previewId) {
            router.push('/studio');
            return;
        }

        // Fetch preview data from session storage (set by studio after generation)
        const previewData = sessionStorage.getItem(`preview-${previewId}`);
        if (previewData) {
            const data = JSON.parse(previewData);
            setPreviews(data.previews);
            setLoading(false);
        } else {
            setError('Preview not found. Please generate a new theme.');
            setLoading(false);
        }
    }, [previewId, router]);

    const handleSelectHero = async (style: string) => {
        // Store selected style
        sessionStorage.setItem(`selected-style-${previewId}`, style);

        // Redirect to checkout (Lemon Squeezy)
        router.push(`/checkout?previewId=${previewId}&style=${style}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your hero previews...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/studio')}
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                        Back to Studio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            {/* Header */}
            <div className="max-w-6xl mx-auto px-4 mb-8">
                <button
                    onClick={() => router.push('/studio')}
                    className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
                >
                    ← Back to edit
                </button>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Choose Your Hero Style
                </h1>
                <p className="text-lg text-gray-600">
                    Select the hero section that best represents your brand
                </p>
            </div>

            {/* Carousel */}
            <HeroCarousel previews={previews} onSelect={handleSelectHero} />

            {/* Info Section */}
            <div className="max-w-4xl mx-auto px-4 mt-16">
                <div className="bg-white rounded-xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        What happens next?
                    </h2>
                    <ol className="space-y-3 text-gray-700">
                        <li className="flex gap-3">
                            <span className="font-bold text-black">1.</span>
                            <span>Select your favorite hero style above</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-black">2.</span>
                            <span>Complete your purchase ($29.99)</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-black">3.</span>
                            <span>Download your complete WordPress theme instantly</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-black">4.</span>
                            <span>Install and customize on any WordPress host</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

export default function PreviewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Loading preview...</p>
                </div>
            </div>
        }>
            <PreviewPageContent />
        </Suspense>
    );
}
