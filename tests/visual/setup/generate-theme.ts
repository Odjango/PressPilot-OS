import { spawn } from 'node:child_process';

export type BrandMode = 'modern' | 'playful' | 'bold' | 'minimal';

export interface GenerateThemeRequest {
  vertical: string;
  recipe: string;
  brandMode: BrandMode;
  outputDir: string;
  slug: string;
}

export interface GenerateThemeResult {
  themeName: string;
  themeZipPath: string;
  staticZipPath?: string;
  themeDir: string;
  slug: string;
}

function runGenerate(payload: Record<string, unknown>): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['tsx', 'bin/generate.ts'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Generator failed (code ${code})\n${stderr}`));
        return;
      }
      resolve(stdout.trim());
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

export async function generateThemeForVisual(request: GenerateThemeRequest): Promise<GenerateThemeResult> {
  const payload = {
    mode: 'standard',
    brandMode: request.brandMode,
    slug: request.slug,
    outDir: request.outputDir,
    data: {
      name: `${request.vertical} ${request.brandMode}`,
      industry: request.vertical,
      businessType: request.recipe,
      brandMode: request.brandMode,
      hero_headline: 'Built for Visual Testing',
      hero_subheadline: 'Automated screenshots verify generated layouts.'
    }
  };

  const raw = await runGenerate(payload);
  const line = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .reverse()
    .find((l) => l.startsWith('{') && l.endsWith('}'));

  if (!line) {
    throw new Error(`Could not parse generator JSON output: ${raw}`);
  }

  const parsed = JSON.parse(line) as {
    status: string;
    error?: string;
    themeName: string;
    downloadPath: string;
    staticPath?: string;
    themeDir: string;
  };

  if (parsed.status !== 'success') {
    throw new Error(parsed.error || 'Generator returned non-success status');
  }

  return {
    themeName: parsed.themeName,
    themeZipPath: parsed.downloadPath,
    staticZipPath: parsed.staticPath,
    themeDir: parsed.themeDir,
    slug: request.slug,
  };
}
