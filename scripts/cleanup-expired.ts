
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanupExpired() {
    console.log('🧹 Starting Cleanup Job...');

    // 1. Find Expired & Active Themes
    const { data: expiredThemes, error } = await supabase
        .from('generated_themes') // Verified table name
        .select('*')
        .eq('status', 'active')
        .lt('expires_at', new Date().toISOString());

    if (error) {
        console.error('Error fetching expired themes:', error);
        return;
    }

    if (!expiredThemes || expiredThemes.length === 0) {
        console.log('No expired themes found.');
        return;
    }

    console.log(`Found ${expiredThemes.length} expired themes. Processing...`);

    for (const theme of expiredThemes) {
        try {
            // 2. Delete from Storage
            const { error: removeError } = await supabase.storage
                .from('generated-themes')
                .remove([theme.file_path]);

            if (removeError) {
                console.error(`Failed to remove file ${theme.file_path}:`, removeError);
                // We continue even if storage delete fails, or maybe we shouldn't mark expired?
                // Let's mark expired anyway to prevent user access.
            }

            // 3. Update DB Status
            const { error: updateError } = await supabase
                .from('generated_themes')
                .update({ status: 'expired' })
                .eq('id', theme.id);

            if (updateError) {
                console.error(`Failed to update DB for ${theme.id}:`, updateError);
            } else {
                console.log(`✅ Expired: ${theme.id} (${theme.file_path})`);
            }

        } catch (err) {
            console.error(`Error processing theme ${theme.id}:`, err);
        }
    }

    console.log('🧹 Cleanup Complete.');
}

if (require.main === module) {
    cleanupExpired();
}
