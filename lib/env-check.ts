/**
 * Environment Variables Validation
 * Fails fast with clear error messages if required vars are missing
 */

const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const OPTIONAL_BUT_RECOMMENDED = [
  'UNSPLASH_ACCESS_KEY',
];

export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required
  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Check recommended
  for (const key of OPTIONAL_BUT_RECOMMENDED) {
    if (!process.env[key]) {
      warnings.push(key);
    }
  }

  // Report warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️  Missing recommended environment variables:');
    warnings.forEach(v => console.warn(`   - ${v}`));
    console.warn('   App will work but some features may be limited.\n');
  }

  // Fail on missing required
  if (missing.length > 0) {
    console.error('\n❌ Missing REQUIRED environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('\nAdd these to your .env.local file and restart.\n');
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
}
