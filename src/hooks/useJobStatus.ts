
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Job } from '@/lib/queue/jobs';

export function useJobStatus(jobId: string | null) {
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        if (!jobId) return;

        let intervalId: NodeJS.Timeout;

        const fetchStatus = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('id', jobId)
                    .single();

                if (error) throw error;
                setJob(data as Job);

                // Stop polling if completed or failed
                if (['completed', 'failed'].includes(data.status)) {
                    clearInterval(intervalId);
                }
            } catch (err: any) {
                setError(err.message);
                clearInterval(intervalId);
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchStatus();

        // Poll every 2s
        intervalId = setInterval(fetchStatus, 2000);

        return () => clearInterval(intervalId);
    }, [jobId]);

    return { job, loading, error };
}
