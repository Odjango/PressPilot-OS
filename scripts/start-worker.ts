
import { createClient } from '@supabase/supabase-js';
import { generateTheme } from '../src/generator/index';
import { BlockValidator } from '../src/generator/validators/BlockValidator';
import { TokenValidator } from '../src/generator/validators/TokenValidator';
import { StructureValidator } from '../src/generator/validators/StructureValidator';
import JSZip from 'jszip';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: '.env.local' });

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing Supabase keys in .env.local. Worker cannot start.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const WORKER_ID = `worker-${Math.random().toString(36).substring(7)}`;

async function runWorker() {
    console.log(`[${WORKER_ID}] 🚀 Worker started. Polling for jobs...`);

    while (true) {
        try {
            // Atomic Claim (Optimistic Locking)
            const { data: jobToClaim, error: fetchError } = await supabase
                .from('jobs')
                .select('id')
                .eq('status', 'pending')
                .limit(1)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (jobToClaim) {
                const { data: claimedJob, error: claimError } = await supabase
                    .from('jobs')
                    .update({
                        status: 'processing',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', jobToClaim.id)
                    .eq('status', 'pending')
                    .select('*')
                    .single();

                if (claimedJob) {
                    await processJob(claimedJob);
                }
            }
        } catch (err: any) {
            console.error(`[${WORKER_ID}] Loop Error:`, err.message);
        }
        await new Promise(r => setTimeout(r, 2000));
    }
}

async function processJob(job: any) {
    console.log(`[${WORKER_ID}] ⚙️ Processing Job: ${job.id} (${job.type})`);

    let isTimedOut = false;
    const timeoutMs = 5 * 60 * 1000; // 5 mins
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => { isTimedOut = true; reject(new Error("Timeout")); }, timeoutMs)
    );

    try {
        const processPromise = (async () => {
            // 1. Fetch Project
            const { data: project } = await supabase.from('projects').select('*').eq('id', job.project_id).single();
            if (!project) throw new Error("Project not found");

            // 2. Generate (REAL)
            console.log(`[${WORKER_ID}] 🏭 Generating Theme...`);

            // Map project data to generator format
            // Project data is stored in 'data' column
            const generatorData = project.data || {};

            // Ensure we have a valid name
            if (!generatorData.name) generatorData.name = project.name;

            const result = await generateTheme({
                data: generatorData,
                mode: 'standard', // or 'heavy' based on project settings
                slug: job.id // Ensure unique filename using Job ID to avoid collisions
            });

            if (result.status !== 'success') {
                throw new Error("Generator failed to produce success status");
            }

            // Read the generated ZIP from disk
            const zipBuffer = await fs.readFile(result.downloadPath);

            // 3. Strict Validation
            console.log(`[${WORKER_ID}] 🔍 Validating...`);

            // A. Structure Check
            const struct = await StructureValidator.validate(zipBuffer);
            if (!struct.valid) throw new Error(struct.error);

            // B. Content Check (Block & Token)
            const validatorZip = new JSZip();
            await validatorZip.loadAsync(zipBuffer);

            const filesToCheck = [
                'templates/index.html', // Required for Block Themes
                'theme.json',
                'style.css'
            ];

            // Determine root folder if any
            const files = Object.keys(validatorZip.files);
            const rootFolder = files[0]?.split('/')[0];

            for (const relPath of filesToCheck) {
                let content: string | undefined;
                let checkPath = relPath;

                // Try direct
                if (validatorZip.file(relPath)) {
                    content = await validatorZip.file(relPath)?.async('string');
                }
                // Try nested (e.g. valid-theme/templates/...)
                else if (rootFolder && validatorZip.file(`${rootFolder}/${relPath}`)) {
                    checkPath = `${rootFolder}/${relPath}`;
                    content = await validatorZip.file(checkPath)?.async('string');
                }

                if (!content) {
                    // Warn but don't fail immediately if index.html is missing but front-page exists? 
                    // WP strictly requires index.html or index.php.
                    // The real generator MUST produce index.html.
                    if (relPath === 'templates/index.html') {
                        // Check for index.php fallback
                        const phpPath = rootFolder ? `${rootFolder}/index.php` : 'index.php';
                        if (!validatorZip.file(phpPath)) {
                            throw new Error(`Validation Error: Missing required template (index.html or index.php).`);
                        }
                        continue; // Handled
                    }
                    throw new Error(`Validation Error: Could not read ${relPath} for inspection.`);
                }

                // Block & Token Validators
                const blockRes = BlockValidator.validate(content, checkPath);
                if (!blockRes.valid) throw new Error(blockRes.error);

                // Skip Token Validator for theme.json (it defines the hexes!)
                if (!checkPath.endsWith('theme.json')) {
                    const tokenRes = TokenValidator.validate(content, checkPath);
                    if (!tokenRes.valid) throw new Error(tokenRes.error);
                }
            }

            // 4. Upload
            const filePath = `themes/${job.project_id}/${job.id}.zip`;
            const { error: uploadError } = await supabase.storage
                .from('generated-themes')
                .upload(filePath, zipBuffer, { contentType: 'application/zip', upsert: true });

            if (uploadError) throw uploadError;

            // 5. Complete
            await supabase.from('jobs').update({
                status: 'completed',
                result: { download_path: filePath },
                updated_at: new Date().toISOString()
            }).eq('id', job.id);

            // 6. Record Generated Theme
            await supabase.from('generated_themes').insert({
                job_id: job.id,
                file_path: filePath,
                status: 'active',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
            });

            console.log(`[${WORKER_ID}] ✅ Job Completed: ${job.id}`);
        })();

        await Promise.race([processPromise, timeoutPromise]);

    } catch (err: any) {
        console.error(`[${WORKER_ID}] ❌ Job Failed: ${err.message}`);
        await supabase.from('jobs').update({
            status: 'failed',
            result: { error: err.message },
            updated_at: new Date().toISOString()
        }).eq('id', job.id);
    }
}

if (require.main === module) {
    runWorker();
}
