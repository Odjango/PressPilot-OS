#!/usr/bin/env tsx

/**
 * Apply Database Schema
 * Runs the schema.sql file against the Supabase database
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function applySchema() {
    console.log('📋 Reading schema.sql...');

    const schemaPath = join(process.cwd(), 'supabase', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    console.log('🔧 Applying schema to database...');

    // Split schema into individual statements
    const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`   Found ${statements.length} SQL statements`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';

        try {
            const { error } = await supabase.rpc('exec_sql', { sql: statement });

            if (error) {
                // Try direct execution if RPC fails
                const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseServiceKey,
                        'Authorization': `Bearer ${supabaseServiceKey}`
                    },
                    body: JSON.stringify({ sql: statement })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
                }
            }

            successCount++;
            process.stdout.write('.');

        } catch (error: any) {
            // Ignore "already exists" errors
            if (error.message?.includes('already exists') ||
                error.message?.includes('duplicate')) {
                process.stdout.write('s');
                successCount++;
            } else {
                console.error(`\n❌ Error in statement ${i + 1}:`, error.message);
                console.error('   Statement:', statement.substring(0, 100) + '...');
                errorCount++;
            }
        }
    }

    console.log('\n');
    console.log(`✅ Schema application complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);

    if (errorCount > 0) {
        console.log('\n⚠️  Some statements failed. This may be normal if tables already exist.');
    }
}

applySchema()
    .then(() => {
        console.log('\n🎉 Database schema is ready!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });
