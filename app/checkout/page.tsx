'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShoppingCart, Check } from 'lucide-react';

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const previewId = searchParams.get('previewId');
    const selectedStyle = searchParams.get('style');

    const [loading, setLoading] = useState(true);
    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!previewId || !selectedStyle) {
            router.push('/dashboard');
            return;
        }

        createCheckoutSession();
    }, [previewId, selectedStyle]);

    const createCheckoutSession = async () => {
        try {
            const response = await fetch('/api/lemon-squeezy/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    previewId,
                    selectedStyle,
                    productType: 'single' // or 'bundle' for agency
                })
            });

            const data = await response.json();

            if (data.checkoutUrl) {
                setCheckoutUrl(data.checkoutUrl);
                // Redirect to Lemon Squeezy checkout
                window.location.href = data.checkoutUrl;
            } else {
                throw new Error('Failed to create checkout session');
            }
        } catch (error) {
            console.error('[Checkout Error]', error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {loading ? (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShoppingCart className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Preparing Your Checkout
                            </h1>
                            <p className="text-gray-600">
                                Redirecting you to secure payment...
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>

                        {/* Order Summary */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">PressPilot WordPress Theme</span>
                                    <span className="font-semibold">$29.99</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Hero Style:</span>
                                    <span className="capitalize">{selectedStyle}</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>$29.99</span>
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>Secure payment powered by Lemon Squeezy</span>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Something Went Wrong
                        </h1>
                        <p className="text-gray-600 mb-6">
                            We couldn't create your checkout session. Please try again.
                        </p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
