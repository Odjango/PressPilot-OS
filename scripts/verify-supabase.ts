import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_EMAIL =
  process.env.DEV_TEST_EMAIL ?? `dev-test+${Date.now()}@presspilot.local`;
// Test user_id for projects table (mock UUID for verification)
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'FAILED: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    detectSessionInUrl: false,
    autoRefreshToken: false,
  },
});

const TEST_PROFILE_NAME = `Automated Test ${new Date().toISOString()}`;
const TEST_PROJECT = {
  name: `Automated Project ${new Date().toISOString()}`,
  slug: `auto-${Date.now()}`,
  status: 'draft',
};

let createdProjectId: string | null = null;
let createdProfile = false;

async function checkConnection() {
  console.log('Checking Supabase connection…');
  const { error } = await supabase.from('projects').select('id').limit(1);
  if (error) {
    throw new Error(`unable to query projects: ${error.message}`);
  }
  console.log('Connection OK');
}

async function checkProfileUpsert() {
  console.log('Checking profile upsert…');
  const { error: upsertError } = await supabase
    .from('pp_profiles')
    .upsert(
      {
        email: TEST_EMAIL,
        full_name: TEST_PROFILE_NAME,
      },
      { onConflict: 'email' },
    );

  if (upsertError) {
    throw new Error(`profile upsert failed: ${upsertError.message}`);
  }

  const { data, error: fetchError } = await supabase
    .from('pp_profiles')
    .select('email,full_name')
    .eq('email', TEST_EMAIL)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`profile fetch failed: ${fetchError.message}`);
  }

  if (!data || data.full_name !== TEST_PROFILE_NAME) {
    throw new Error('profile verification failed: mismatched full_name');
  }

  createdProfile = true;
  console.log('Profile upsert OK');
}

async function checkProjectCreateAndList() {
  console.log('Checking project create + list…');
  const { data: inserted, error: insertError } = await supabase
    .from('projects')
    .insert({
      user_id: TEST_USER_ID,
      name: TEST_PROJECT.name,
      slug: TEST_PROJECT.slug,
      status: TEST_PROJECT.status,
    })
    .select('id');

  if (insertError) {
    throw new Error(`project insert failed: ${insertError.message}`);
  }

  createdProjectId = inserted?.[0]?.id ?? null;

  const { data, error: listError } = await supabase
    .from('projects')
    .select('id,slug')
    .eq('slug', TEST_PROJECT.slug)
    .maybeSingle();

  if (listError) {
    throw new Error(`project list failed: ${listError.message}`);
  }

  if (!data || data.slug !== TEST_PROJECT.slug) {
    throw new Error('project verification failed: slug not found');
  }

  console.log('Project create/list OK');
}

async function cleanup() {
  try {
    if (createdProjectId) {
      await supabase.from('projects').delete().eq('id', createdProjectId);
    } else {
      await supabase
        .from('projects')
        .delete()
        .eq('slug', TEST_PROJECT.slug);
    }
  } catch (error) {
    console.warn('Warning: unable to delete test project:', error);
  }

  if (createdProfile) {
    try {
      await supabase.from('pp_profiles').delete().eq('email', TEST_EMAIL);
    } catch (error) {
      console.warn('Warning: unable to delete test profile:', error);
    }
  }
}

async function main() {
  try {
    await checkConnection();
    await checkProfileUpsert();
    await checkProjectCreateAndList();
    console.log('Supabase smoke test completed successfully.');
  } catch (error) {
    console.error('FAILED:', error instanceof Error ? error.message : error);
    await cleanup();
    process.exit(1);
  }

  await cleanup();
}

void main();


