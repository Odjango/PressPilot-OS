import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

/**
 * Type-Safe Job Operations
 * Replaces raw SQL with atomic, validated operations
 */
export const JobOperations = {
    /**
     * Atomically claim a pending job for a worker
     * Uses optimistic locking to prevent race conditions
     */
    claim: async (workerId: string): Promise<{ jobId: string; data: any } | null> => {
        const { data, error } = await supabaseAdmin
            .from('jobs')
            .update({
                status: 'processing',
                worker_id: workerId,
                started_at: new Date().toISOString()
            })
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(1)
            .select()
            .single();

        if (error || !data) return null;
        return { jobId: data.id, data: data.input_data };
    },

    /**
     * Mark job as completed with result
     */
    complete: async (jobId: string, result: { downloadPath: string; filename: string; themeName: string }) => {
        const { error } = await supabaseAdmin
            .from('jobs')
            .update({
                status: 'completed',
                result_data: result,
                completed_at: new Date().toISOString()
            })
            .eq('id', jobId);

        if (error) throw new Error(`Failed to complete job: ${error.message}`);
    },

    /**
     * Mark job as failed with error details
     */
    fail: async (jobId: string, errorMessage: string) => {
        const { error } = await supabaseAdmin
            .from('jobs')
            .update({
                status: 'failed',
                error_message: errorMessage,
                completed_at: new Date().toISOString()
            })
            .eq('id', jobId);

        if (error) throw new Error(`Failed to mark job as failed: ${error.message}`);
    },

    /**
     * Get job status and result
     */
    getStatus: async (jobId: string) => {
        const { data, error } = await supabaseAdmin
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (error) throw new Error(`Failed to get job status: ${error.message}`);
        return data;
    },

    /**
     * Create a new job
     */
    create: async (inputData: any, userId?: string) => {
        const { data, error } = await supabaseAdmin
            .from('jobs')
            .insert({
                input_data: inputData,
                user_id: userId,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create job: ${error.message}`);
        return data;
    }
};

/**
 * Type-Safe Storage Operations
 */
export const StorageOperations = {
    /**
     * Upload theme ZIP to storage
     */
    uploadTheme: async (filePath: string, fileName: string): Promise<string> => {
        const fs = await import('fs-extra');
        const fileBuffer = await fs.readFile(filePath);

        const { data, error } = await supabaseAdmin.storage
            .from('generated-themes')
            .upload(fileName, fileBuffer, {
                contentType: 'application/zip',
                upsert: false
            });

        if (error) throw new Error(`Failed to upload theme: ${error.message}`);

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('generated-themes')
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    },

    /**
     * Delete expired theme files
     */
    deleteExpired: async (fileNames: string[]) => {
        const { error } = await supabaseAdmin.storage
            .from('generated-themes')
            .remove(fileNames);

        if (error) throw new Error(`Failed to delete files: ${error.message}`);
    },

    /**
     * Get logo file from storage
     */
    getLogo: async (fileName: string): Promise<Blob> => {
        const { data, error } = await supabaseAdmin.storage
            .from('logos')
            .download(fileName);

        if (error) throw new Error(`Failed to download logo: ${error.message}`);
        return data;
    }
};

/**
 * Type-Safe Project Operations
 */
export const ProjectOperations = {
    /**
     * Create a new project
     */
    create: async (projectData: { name: string; user_id?: string; config?: any }) => {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .insert(projectData)
            .select()
            .single();

        if (error) throw new Error(`Failed to create project: ${error.message}`);
        return data;
    },

    /**
     * Get user's projects
     */
    getByUser: async (userId: string) => {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to get projects: ${error.message}`);
        return data;
    }
};
