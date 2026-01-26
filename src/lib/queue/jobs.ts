
import { createClient } from '../supabase/client'; // Import from client not server for this utility usage, or pass client
import { SupabaseClient } from '@supabase/supabase-js';

// Define Job Type
export type Job = {
    id: string;
    project_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    type: 'generate' | 'regenerate' | 'cleanup';
    result?: any;
    created_at: string;
};

/**
 * Enqueues a new generation job.
 */
export async function enqueueJob(
    supabase: SupabaseClient,
    projectId: string,
    type: Job['type'] = 'generate'
) {
    const { data, error } = await supabase
        .from('jobs')
        .insert({
            project_id: projectId,
            type: type,
            status: 'pending'
        })
        .select('id')
        .single();

    if (error) throw error;
    return data.id;
}

/**
 * Gets job status.
 */
export async function getJobStatus(supabase: SupabaseClient, jobId: string) {
    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

    if (error) throw error;
    return data as Job;
}
