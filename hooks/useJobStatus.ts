
import { useState, useEffect } from 'react';
import { Job } from '../lib/queue/jobs';

export function useJobStatus(jobId: string | null) {
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!jobId) return;

        let intervalId: NodeJS.Timeout;

        const fetchStatus = async () => {
            try {
                setLoading(true);
                // Switch to Proxy API instead of direct Supabase Client
                const res = await fetch(`/api/status?id=${jobId}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch status');
                }
                const data = await res.json();

                setJob(data as Job);

                if (['completed', 'failed'].includes(data.status)) {
                    clearInterval(intervalId);
                }
            } catch (err: any) {
                // Don't set error on first failure to avoid flickering if polling hiccups
                console.error("Poll Error:", err);
                // setError(err.message); 
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
        intervalId = setInterval(fetchStatus, 2000);

        return () => clearInterval(intervalId);
    }, [jobId]);

    return { job, loading, error };
}
