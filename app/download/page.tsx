'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download, CheckCircle, FileText, Loader2 } from 'lucide-react';

function DownloadPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const previewId = searchParams.get('previewId');

    const [loading, setLoading] = useState(true);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [themeName, setThemeName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!previewId) {
            router.push('/dashboard');
            return;
        }

        fetchDownloadUrl();
    }, [previewId]);

    const fetchDownloadUrl = async () => {
        try {
            const response = await fetch(`/api/get-download?previewId=${previewId}`);
            const data = await response.json();

            if (data.downloadUrl) {
                setDownloadUrl(data.downloadUrl);
                setThemeName(data.themeName || 'Your Theme');
                setLoading(false);
            } else {
                throw new Error('Theme not ready yet');
            }
        } catch (error: any) {
            console.error('[Download Error]', error);
            setError(error.message);
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (downloadUrl) {
            window.location.href = downloadUrl;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Generating Your Theme
                    </h1>
                    <p className="text-gray-600">
                        This will only take a moment...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Theme Not Ready
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Your theme is still being generated. Please check your email for the download link, or try refreshing this page in a moment.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Your Theme Is Ready!
                    </h1>
                    <p className="text-lg text-gray-600">
                        {themeName} has been generated and is ready to download
                    </p>
                </div>

                {/* Download Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{themeName}.zip</h2>
                            <p className="text-sm text-gray-500">WordPress FSE Theme</p>
                        </div>
                    </div>

                    <button
                        onClick={handleDownload}
                        className="w-full py-4 bg-black text-white rounded-lg font-semibold text-lg hover:bg-gray-800 transition-all hover:scale-105 flex items-center justify-center gap-3"
                    >
                        <Download className="w-5 h-5" />
                        Download Theme
                    </button>

                    <p className="text-sm text-gray-500 text-center mt-4">
                        A download link has also been sent to your email
                    </p>
                </div>

                {/* Installation Instructions */}
                <div className="bg-white rounded-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Installation Instructions
                    </h2>

                    <ol className="space-y-4">
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">
                                1
                            </span>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Download the theme ZIP file
                                </h3>
                                <p className="text-gray-600">
                                    Click the download button above to save the theme to your computer
                                </p>
                            </div>
                        </li>

                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">
                                2
                            </span>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Log in to your WordPress admin
                                </h3>
                                <p className="text-gray-600">
                                    Go to your WordPress dashboard (usually yoursite.com/wp-admin)
                                </p>
                            </div>
                        </li>

                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">
                                3
                            </span>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Upload and activate
                                </h3>
                                <p className="text-gray-600 mb-2">
                                    Navigate to Appearance → Themes → Add New → Upload Theme
                                </p>
                                <p className="text-gray-600">
                                    Choose the ZIP file and click "Install Now", then "Activate"
                                </p>
                            </div>
                        </li>

                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">
                                4
                            </span>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Customize your site
                                </h3>
                                <p className="text-gray-600">
                                    Use the WordPress Site Editor to customize colors, fonts, and content
                                </p>
                            </div>
                        </li>
                    </ol>

                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                            <strong>Need help?</strong> Visit our{' '}
                            <a href="mailto:support@presspilotapp.com" className="text-black underline">support team</a>
                            {' '}or contact support
                        </p>
                    </div>
                </div>

                {/* Back to Dashboard */}
                <div className="text-center mt-8">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        ← Generate Another Theme
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function DownloadPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Loading Download Page
                    </h1>
                </div>
            </div>
        }>
            <DownloadPageContent />
        </Suspense>
    );
}

