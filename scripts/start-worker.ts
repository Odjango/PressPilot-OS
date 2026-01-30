
import { createClient } from '@supabase/supabase-js';
import { generateTheme } from '../src/generator';
import { StructureValidator } from '../src/generator/validators/StructureValidator';
import { BlockValidator } from '../src/generator/validators/BlockValidator';
import { TokenValidator } from '../src/generator/validators/TokenValidator';
import JSZip from 'jszip';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import path from 'path';
import { buildStaticSite } from '../lib/presspilot/staticSite';
import { getVariationById } from '../lib/presspilot/variationRegistry';
import { applyBusinessInputs } from '../lib/presspilot/context';
import { resolveBusinessCopy } from '../lib/presspilot/kit';
import { buildSaaSInputFromStudioInput } from '../lib/presspilot/studioAdapter';

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

            // Data is already transformed by the API, use it directly
            const generatorData = project.data || {};

            // Fallback to project name if not set
            if (!generatorData.name) generatorData.name = project.name;

            console.log(`[${WORKER_ID}] 📝 Business: ${generatorData.name}, Industry: ${generatorData.industry}`);

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

            // 4. Create Static Bundle (RE-ENABLED for Preview Accuracy)
            console.log(`[${WORKER_ID}] 📦 Creating Static Bundle...`);

            // Build Context & Variation for Static Site
            const saasInput = buildSaaSInputFromStudioInput({
                businessName: generatorData.name,
                businessDescription: generatorData.hero_subheadline || project.name,
                businessCategory: generatorData.industry,
                heroTitle: generatorData.hero_headline,
                palette: generatorData.colors,
                logoPath: generatorData.logo,
                menus: generatorData.menus
            });

            const context = applyBusinessInputs(saasInput);

            // Get the variation used (or default)
            const variationId = job.payload?.variationId || 'saas-bright';
            const variationEntry: any = getVariationById(variationId) || { id: 'saas-bright', title: 'Default' };

            const variationManifest: any = {
                id: variationEntry.id,
                tokens: {
                    palette_id: saasInput.visualControls.palette_id,
                    font_pair_id: saasInput.visualControls.font_pair_id,
                    layout_density: saasInput.visualControls.layout_density,
                    corner_style: saasInput.visualControls.corner_style
                },
                preview: {
                    id: variationEntry.id,
                    label: variationEntry.title,
                    description: saasInput.narrative.description_long
                }
            };

            const staticResult = await buildStaticSite(context, variationManifest, {
                businessTypeId: generatorData.industry
            });

            const staticZipBuffer = await fs.readFile(staticResult.staticZipPath);

            // Upload Theme (Restored)
            const filePath = `themes/${job.project_id}/${job.id}.zip`;
            console.log(`[${WORKER_ID}] 🔼 Uploading Theme Zip...`);
            const { error: themeUploadError } = await supabase.storage
                .from('generated-themes')
                .upload(filePath, zipBuffer, { contentType: 'application/zip', upsert: true });

            if (themeUploadError) {
                console.error(`[${WORKER_ID}] ❌ Theme Upload Error:`, themeUploadError);
                throw themeUploadError;
            }

            // Upload Static Preview
            const staticPath = `previews/${job.project_id}/${job.id}.zip`;
            console.log(`[${WORKER_ID}] 🔼 Uploading Static Preview...`);
            const { error: staticUploadError } = await supabase.storage
                .from('generated-themes')
                .upload(staticPath, staticZipBuffer, { contentType: 'application/zip', upsert: true });

            if (staticUploadError) {
                console.warn(`[${WORKER_ID}] ⚠️ Static Preview Upload failed, but continuing:`, staticUploadError);
            }

            // 5. Complete
            const { error: updateError } = await supabase.from('jobs').update({
                status: 'completed',
                result: {
                    download_path: filePath,
                    static_path: staticPath
                },
                updated_at: new Date().toISOString()
            }).eq('id', job.id);

            if (updateError) {
                console.error(`[${WORKER_ID}] ❌ Job Status Update Error:`, updateError);
                throw updateError;
            }

            // 6. Record Generated Theme
            const { error: recordError } = await supabase.from('generated_themes').insert({
                job_id: job.id,
                file_path: filePath,
                status: 'active',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
            });

            if (recordError) {
                console.error(`[${WORKER_ID}] ❌ Record Insert Error:`, recordError);
                throw recordError;
            }

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
