'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Zap, Check } from 'lucide-react';

function CheckoutPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const previewId = searchParams.get('previewId');
    const selectedStyle = searchParams.get('style');

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('Bypassing payment...');

    useEffect(() => {
        if (!previewId || !selectedStyle) {
            router.push('/studio');
            return;
        }

        bypassPaymentAndGenerate();
    }, [previewId, selectedStyle]);

    const bypassPaymentAndGenerate = async () => {
        try {
            setStatus('Skipping payment (dev mode)...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStatus('Generating your WordPress theme...');

            // Call the theme generation API directly
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    previewId,
                    selectedStyle,
                    bypass: true // Flag to indicate payment bypass
                })
            });

            const data = await response.json();

            if (data.jobId) {
                setStatus('Theme generation started!');
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Redirect to job status page
                router.push(`/dashboard/status/${data.jobId}`);
            } else {
                throw new Error('Failed to start theme generation');
            }
        } catch (error) {
            console.error('[Checkout Bypass Error]', error);
            setStatus('Error: ' + (error as Error).message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {loading ? (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Dev Mode: Payment Bypassed
                            </h1>
                            <p className="text-gray-600">
                                {status}
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        </div>

                        {/* Order Summary */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h2 className="font-semibold text-gray-900 mb-4">Development Mode</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">PressPilot WordPress Theme</span>
                                    <span className="font-semibold line-through text-gray-400">$29.99</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Hero Style:</span>
                                    <span className="capitalize">{selectedStyle}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600 font-semibold">Payment Bypass:</span>
                                    <span className="text-green-600 font-semibold">FREE (Dev)</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-green-600">$0.00</span>
                            </div>
                        </div>

                        {/* Dev Mode Badge */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-purple-600 bg-purple-50 rounded-lg p-3">
                            <Check className="w-4 h-4" />
                            <span className="font-semibold">Development Mode - Payment Disabled</span>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Something Went Wrong
                        </h1>
                        <p className="text-gray-600 mb-2">
                            {status}
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Check the console for details.
                        </p>
                        <button
                            onClick={() => router.push('/studio')}
                            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                        >
                            Back to Studio
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        }>
            <CheckoutPageContent />
        </Suspense>
    );
}
