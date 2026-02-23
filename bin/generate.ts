/**
 * bin/generate.ts — M0 Generator CLI Wrapper
 *
 * Contract: JSON stdin → generateTheme + validators + static build → JSON stdout
 * All progress logs go to stderr. Only final result JSON goes to stdout.
 *
 * Invoked by Laravel GenerateThemeJob as:
 *   npx tsx /app/generator/bin/generate.ts
 *   stdin: {"data":{...}, "mode":"standard", "slug":"uuid", "outDir":"/tmp/pp-jobs/uuid"}
 *   stdout: {"status":"success", "themeName":"...", "downloadPath":"...", ...}
 */

// ── STEP 0: Redirect console.log → stderr (MUST be before all imports) ──────
// The generator uses console.log() for progress messages. The Laravel job
// parses stdout as JSON. Any leaked progress text breaks JSON parsing.
const _origLog = console.log;
console.log = (...args: unknown[]) => console.error(...args);

// ── Imports ─────────────────────────────────────────────────────────────────
import { generateTheme } from '../src/generator/index';
import { StructureValidator } from '../src/generator/validators/StructureValidator';
import { BlockValidator } from '../src/generator/validators/BlockValidator';
import { TokenValidator } from '../src/generator/validators/TokenValidator';
import { BlockConfigValidator } from '../src/generator/validators/BlockConfigValidator';
import { buildStaticSite } from '../lib/presspilot/staticSite';
import { buildSaaSInputFromStudioInput } from '../lib/presspilot/studioAdapter';
import { applyBusinessInputs } from '../lib/presspilot/context';
import { getVariationById } from '../lib/presspilot/variationRegistry';
import JSZip from 'jszip';
import fs from 'fs-extra';
import path from 'path';

import type { GeneratorMode, BaseTheme, BrandMode } from '../src/generator/types';

// ── Helpers ─────────────────────────────────────────────────────────────────

function readStdin(): Promise<string> {
    return new Promise((resolve, reject) => {
        let data = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk: string) => (data += chunk));
        process.stdin.on('end', () => resolve(data));
        process.stdin.on('error', reject);
    });
}

function writeResult(obj: Record<string, unknown>): void {
    process.stdout.write(JSON.stringify(obj) + '\n');
}

/** Recursively collect all .html files under a directory */
async function getAllHtmlFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const nested = await Promise.all(
        entries.map(e => {
            const fullPath = path.join(dir, e.name);
            return e.isDirectory() ? getAllHtmlFiles(fullPath) : Promise.resolve([fullPath]);
        })
    );
    return nested.flat().filter(f => f.endsWith('.html'));
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    // 1. chdir to repo root (parent of bin/)
    const repoRoot = path.resolve(__dirname, '..');
    process.chdir(repoRoot);
    console.error(`[cli] cwd: ${process.cwd()}`);

    // 2. Read and parse stdin
    const raw = await readStdin();
    if (!raw.trim()) {
        writeResult({ status: 'error', error: 'Empty stdin — expected JSON payload' });
        process.exit(1);
    }

    let input: Record<string, unknown>;
    try {
        input = JSON.parse(raw);
    } catch {
        writeResult({ status: 'error', error: 'Invalid JSON on stdin' });
        process.exit(1);
    }

    const {
        base,
        mode,
        brandMode,
        slug,
        outDir,
        heroPattern,
        data,
        variationId: inputVariationId,
    } = input as {
        base?: BaseTheme;
        mode?: GeneratorMode;
        brandMode?: BrandMode;
        slug?: string;
        outDir?: string;
        heroPattern?: string;
        data?: Record<string, unknown>;
        variationId?: string;
    };

    const generatorData: Record<string, unknown> = data ?? {};
    if (brandMode && !generatorData.brandMode) {
        generatorData.brandMode = brandMode;
    }

    // ── STEP 1: Generate Theme ──────────────────────────────────────────
    console.error('[cli] Starting theme generation...');

    const result = await generateTheme({
        base,
        mode: mode || 'standard',
        brandMode: (generatorData.brandMode as BrandMode | undefined) || brandMode,
        slug,
        outDir,
        heroPattern,
        data: generatorData as any,
    });

    if (result.status !== 'success') {
        throw new Error('Generator failed to produce success status');
    }

    console.error(`[cli] Theme generated: ${result.themeName}`);

    // ── STEP 2: Validate Theme ZIP ──────────────────────────────────────
    const zipBuffer = await fs.readFile(result.downloadPath);

    // A. Structure validation
    console.error('[cli] Running StructureValidator...');
    const struct = await StructureValidator.validate(zipBuffer);
    if (!struct.valid) {
        throw new Error(`Structure validation failed: ${struct.error}`);
    }

    // B. Block name + Token validation on key non-HTML files (theme.json, style.css)
    //    The HTML check below covers all templates; we still validate theme.json here.
    console.error('[cli] Running Block & Token validators on theme.json / style.css...');
    const validatorZip = new JSZip();
    await validatorZip.loadAsync(zipBuffer);
    const zipFiles = Object.keys(validatorZip.files);
    const rootFolder = zipFiles[0]?.split('/')[0];

    for (const relPath of ['theme.json', 'style.css']) {
        let content: string | undefined;
        let checkPath = relPath;
        if (validatorZip.file(relPath)) {
            content = await validatorZip.file(relPath)?.async('string');
        } else if (rootFolder && validatorZip.file(`${rootFolder}/${relPath}`)) {
            checkPath = `${rootFolder}/${relPath}`;
            content = await validatorZip.file(checkPath)?.async('string');
        }
        if (!content) continue; // missing file already caught by StructureValidator

        // Only BlockValidator for style.css (TokenValidator would false-positive on hex values)
        if (!checkPath.endsWith('theme.json')) {
            const tokenRes = TokenValidator.validate(content, checkPath);
            if (!tokenRes.valid) throw new Error(tokenRes.error);
        }
    }

    // C. Full HTML scan: BlockName + Token + BlockConfig on every .html file in themeDir
    //    This is the pre-ZIP gate — catches incomplete block configurations before download.
    console.error('[cli] Running full HTML scan (BlockName + Token + BlockConfig)...');
    const allHtmlFiles = await getAllHtmlFiles(result.themeDir);
    const criticalConfigIssues: string[] = [];

    for (const htmlFile of allHtmlFiles) {
        const content = await fs.readFile(htmlFile, 'utf8');
        const rel = path.relative(result.themeDir, htmlFile);

        // Block name validation
        const blockRes = BlockValidator.validate(content, rel);
        if (!blockRes.valid) throw new Error(blockRes.error);

        // Design token validation
        const tokenRes = TokenValidator.validate(content, rel);
        if (!tokenRes.valid) throw new Error(tokenRes.error);

        // Block config completeness (new: required attributes, valid variation values)
        const configRes = BlockConfigValidator.validate(content, rel);
        for (const issue of configRes.issues) {
            if (issue.severity === 'critical') {
                criticalConfigIssues.push(`${rel}: ${issue.issue}`);
            } else if (issue.severity === 'error') {
                console.error(`[BlockConfig][ERROR] ${issue.issue}`);
            }
            // warnings already logged by validateAndWrite during assembly
        }
    }

    if (criticalConfigIssues.length > 0) {
        throw new Error(
            `Block configuration validation failed — missing required attributes that would crash WordPress Site Editor:\n` +
            criticalConfigIssues.map(i => `  • ${i}`).join('\n')
        );
    }

    console.error('[cli] Validation passed.');

    // D. Write content manifest alongside the ZIP (documents slot→value mapping for re-spin)
    if (result.slots && Object.keys(result.slots).length > 0) {
        const manifestPath = path.join(
            path.dirname(result.downloadPath),
            `${slug ?? 'theme'}-manifest.json`
        );
        await fs.writeJson(manifestPath, {
            generated_at: new Date().toISOString(),
            theme: result.themeName,
            slots: result.slots,
        }, { spaces: 2 });
        console.error(`[cli] Content manifest written: ${path.basename(manifestPath)}`);
    }

    // ── STEP 3: Build Static Site ───────────────────────────────────────
    // Mirrors start-worker.ts lines 176-209
    console.error('[cli] Building static site bundle...');

    const saasInput = buildSaaSInputFromStudioInput({
        businessName: generatorData.name as string | undefined,
        businessDescription:
            (generatorData.hero_subheadline as string) ||
            (generatorData.name as string) ||
            '',
        businessCategory: generatorData.industry as string | undefined,
        heroTitle: generatorData.hero_headline as string | undefined,
        palette: generatorData.colors as
            | { primary?: string; secondary?: string; accent?: string }
            | undefined,
        logoPath: generatorData.logo as string | undefined,
        menus: generatorData.menus as any[] | undefined,
    });

    const context = applyBusinessInputs(saasInput);

    const variationId = (inputVariationId as string) || 'saas-bright';
    const variationEntry: any =
        getVariationById(variationId) || { id: 'saas-bright', title: 'Default' };

    const variationManifest: any = {
        id: variationEntry.id,
        tokens: {
            palette_id: saasInput.visualControls.palette_id,
            font_pair_id: saasInput.visualControls.font_pair_id,
            layout_density: saasInput.visualControls.layout_density,
            corner_style: saasInput.visualControls.corner_style,
        },
        preview: {
            id: variationEntry.id,
            label: variationEntry.title,
            description: saasInput.narrative.description_long,
        },
    };

    const staticResult = await buildStaticSite(context, variationManifest, {
        businessTypeId: generatorData.industry as string | undefined,
    });

    console.error(`[cli] Static site built: ${staticResult.staticZipPath}`);

    // ── STEP 4: Write final result to stdout ────────────────────────────
    writeResult({
        status: 'success',
        themeName: result.themeName,
        downloadPath: result.downloadPath,
        filename: result.filename,
        themeDir: result.themeDir,
        staticPath: staticResult.staticZipPath,
    });
}

// ── Entry Point ─────────────────────────────────────────────────────────────

main()
    .then(() => process.exit(0))
    .catch((err: Error) => {
        console.error(`[cli] Fatal: ${err.message}`);
        writeResult({
            status: 'error',
            error: err.message || String(err),
        });
        process.exit(1);
    });
