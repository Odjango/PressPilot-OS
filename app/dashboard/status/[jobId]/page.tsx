
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useJobStatus } from '../../../../hooks/useJobStatus';
import { useEffect, useState } from 'react';

// Define the extended Job type here or import if possible, 
// for simplicity in this file we just treat job as any or extend locally
type ExtendedJob = {
    id: string;
    status: string;
    project_id: string;
    result?: any;
    generated_theme?: {
        status: 'active' | 'expired';
        expires_at: string;
        file_path: string;
    } | null;
    download_url?: string | null;
};

export default function JobStatusPage() {
    const { jobId } = useParams();
    const router = useRouter();
    // Hook now returns the whole object from API including theme data
    const { job: rawJob, loading, error } = useJobStatus(jobId as string);
    const job = rawJob as unknown as ExtendedJob | null; // Cast to our extended type

    const [isRegenerating, setIsRegenerating] = useState(false);

    // Derived State from the API response (No more separate fetch!)
    const downloadUrl = job?.download_url;
    const themeStatus = job?.generated_theme?.status;
    const expiresAt = job?.generated_theme?.expires_at;

    const handleRegenerate = async () => {
        if (!job) return;
        setIsRegenerating(true);
        try {
            const res = await fetch('/api/regenerate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: job.project_id }),
            });

            if (!res.ok) throw new Error('Failed to regenerate');

            const data = await res.json();
            router.push(`/dashboard/status/${data.jobId}`);
        } catch (e) {
            alert('Failed to regenerate. Please try again.');
            setIsRegenerating(false);
        }
    };

    if (error) return <div className="p-8 text-red-500 text-center">Error: {error}</div>;
    if (loading || !job) return <div className="p-8 text-center text-gray-500">Loading Job Details...</div>;

    // Logic: Completed but no theme data means "Missing"
    const isCompletedButMissing = job.status === 'completed' && !job.generated_theme && !loading;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">

                {/* Pending / Processing */}
                {(job.status === 'pending' || job.status === 'processing') && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold animate-pulse text-blue-600">Generating your theme...</h2>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div className="bg-blue-600 h-4 rounded-full animate-progress" style={{ width: '60%' }}></div>
                        </div>
                        <p className="text-gray-500 text-sm">Validating blocks and tokens...</p>
                    </div>
                )}

                {/* Failed */}
                {job.status === 'failed' && (
                    <div className="space-y-4">
                        <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800">Generation Failed</h2>
                        <p className="text-gray-600 bg-red-50 p-4 rounded text-left text-sm font-mono break-all border border-red-100">
                            {typeof job.result?.error === 'string' ? job.result.error : JSON.stringify(job.result?.error || 'Unknown error')}
                        </p>
                        <button
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                            className="w-full py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                        >
                            {isRegenerating ? 'Starting...' : 'Try Again'}
                        </button>
                    </div>
                )}

                {/* Completed & Active */}
                {job.status === 'completed' && themeStatus === 'active' && downloadUrl && (
                    <div className="space-y-6">
                        <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl">✅</div>
                        <h2 className="text-2xl font-bold text-gray-900">Theme Ready!</h2>
                        <p className="text-gray-600">Your specific Wordpress theme has been generated and validated.</p>

                        <a href={downloadUrl} className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg transition-all">
                            Download .ZIP
                        </a>

                        {expiresAt && (
                            <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded border border-amber-200">
                                ⚠️ <strong>Expires in 24 hours</strong><br />
                                File will be deleted at {new Date(expiresAt).toLocaleString()}.
                            </div>
                        )}

                        <button
                            onClick={handleRegenerate}
                            className="text-gray-400 text-sm hover:text-gray-600 underline"
                        >
                            Generate New Version
                        </button>
                    </div>
                )}

                {/* Expired or Missing */}
                {(themeStatus === 'expired' || themeStatus === 'deleted' || isCompletedButMissing) && (
                    <div className="space-y-4">
                        <div className="mx-auto w-12 h-12 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-2xl">🗑️</div>
                        <h2 className="text-2xl font-bold text-gray-700">
                            {isCompletedButMissing ? 'Theme Not Found' : 'Download Expired'}
                        </h2>
                        <p className="text-gray-500">
                            {isCompletedButMissing
                                ? "The job completed but the file seems missing from storage."
                                : "As per our retention policy, generated files are deleted after 24 hours."}
                        </p>
                        <button
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full disabled:opacity-50"
                        >
                            {isRegenerating ? 'Queueing...' : 'Regenerate Theme'}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
