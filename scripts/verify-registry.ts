import fs from 'fs-extra';
import path from 'path';

interface RegistryEntry {
  pattern_id: string;
  slug: string;
  file: string;
  category: string;
  sub_type: string;
  source_core: string;
  required_tokens: string[];
  image_slots: string[];
  vertical_affinity: string[];
  style_affinity: string[];
  complexity: string;
  supports_dark: boolean;
  dark_variant: string | null;
}

interface RegistryFile {
  generated: string;
  count: number;
  patterns: RegistryEntry[];
}

interface TokenSchemaFile {
  version: string;
  tokens: { name: string }[];
}

const ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'pattern-library', 'registry.json');
const TOKEN_SCHEMA_PATH = path.join(ROOT, 'pattern-library', 'token-schema.json');
const TOKENIZED_DIR = path.join(ROOT, 'pattern-library', 'tokenized');

async function listTokenizedFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await listTokenizedFiles(full);
      files.push(...nested);
    } else if (entry.isFile() && entry.name.endsWith('.php')) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!(await fs.pathExists(REGISTRY_PATH))) {
    console.error(`Registry not found: ${REGISTRY_PATH}`);
    process.exit(1);
  }

  const registry = (await fs.readJson(REGISTRY_PATH)) as RegistryFile;
  const tokenSchema = (await fs.readJson(TOKEN_SCHEMA_PATH)) as TokenSchemaFile;

  const tokenSet = new Set(tokenSchema.tokens.map((t) => t.name));
  const registryFiles = new Set<string>();
  const categoryCounts: Record<string, number> = {};

  for (const entry of registry.patterns) {
    const filePath = path.join(ROOT, 'pattern-library', entry.file);
    registryFiles.add(path.resolve(filePath));

    categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1;

    if (!(await fs.pathExists(filePath))) {
      errors.push(`Missing pattern file for ${entry.pattern_id}: ${entry.file}`);
    }

    for (const token of entry.required_tokens) {
      if (!tokenSet.has(token)) {
        errors.push(`Unknown token in ${entry.pattern_id}: ${token}`);
      }
    }
  }

  const tokenizedFiles = await listTokenizedFiles(TOKENIZED_DIR);
  const tokenizedSet = new Set(tokenizedFiles.map((f) => path.resolve(f)));

  for (const file of tokenizedSet) {
    if (!registryFiles.has(file)) {
      errors.push(`Orphan tokenized pattern (missing in registry): ${path.relative(ROOT, file)}`);
    }
  }

  for (const regFile of registryFiles) {
    if (!tokenizedSet.has(regFile)) {
      errors.push(`Registry entry missing file: ${path.relative(ROOT, regFile)}`);
    }
  }

  for (const [category, count] of Object.entries(categoryCounts)) {
    if (count < 3) {
      errors.push(`Category has fewer than 3 entries: ${category} (${count})`);
    }
  }

  console.log('Registry verification summary');
  console.log('------------------------------');
  console.log(`Patterns in registry: ${registry.patterns.length}`);
  console.log(`Tokenized files on disk: ${tokenizedFiles.length}`);
  console.log('\nPer-category counts:');
  Object.entries(categoryCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([cat, count]) => console.log(`  ${cat}: ${count}`));

  if (warnings.length > 0) {
    console.warn('\nWarnings:');
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (errors.length > 0) {
    console.error('\nErrors:');
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log('\n✅ Registry validation passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
