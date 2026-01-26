
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testConnection() {
    console.log("Testing DB Connection...");

    // 1. Create (or find) a Dummy Auth User using Admin API
    const email = `test-user-${Date.now()}@presspilot.co`;
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: email,
        password: 'password123',
        email_confirm: true
    });

    if (userError) {
        console.error("❌ Failed to create auth user:", userError);
        return;
    }

    const testUserId = userData.user.id;
    console.log(`✅ Created Test User: ${testUserId} (${email})`);

    // 2. Insert Project
    const { data: project, error: projError } = await supabase
        .from('projects')
        .insert({
            user_id: testUserId,
            name: 'Smoke Test Project',
            site_type: 'general',
            language: 'en',
            data: { description: "Smoke Test" }
        })
        .select()
        .single();

    if (projError) {
        console.error("❌ Failed to insert project.", projError);
        return;
    }
    console.log("✅ Project inserted:", project.id);

    // 3. Insert Job
    const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
            project_id: project.id,
            type: 'generate',
            status: 'pending'
        })
        .select()
        .single();

    if (jobError) {
        console.error("❌ Failed to insert job.", jobError);
        return;
    }
    console.log("✅ Job enqueued:", job.id);
    console.log("Ready to run worker...");
}

testConnection();
