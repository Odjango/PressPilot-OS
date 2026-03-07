# Phase 3: Image Tier & Error Handling — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add DALL-E image generation (hero at preview, full upgrade at download) and harden the frontend with adaptive polling, graceful error states, and retry flows.

**Architecture:** The generation pipeline stays unchanged (always Unsplash). DALL-E is additive — a `DalleProvider` generates the hero image at Step 4 preview, and an `UpgradeThemeImagesJob` swaps remaining images after payment. The frontend gets adaptive polling with timeout messaging and inline error states with retry buttons.

**Tech Stack:** Laravel (backend jobs + providers), OpenAI Images API (DALL-E 3), Next.js/React (frontend polling + UI), LemonSqueezy (payment — existing), Supabase S3 (storage — existing).

**Design doc:** `docs/plans/2026-03-07-phase3-image-tier-and-error-handling-design.md`

---

## Task 1: DalleProvider — OpenAI Images API Integration

**Files:**
- Create: `backend/app/Services/DalleProvider.php`
- Create: `backend/tests/Unit/DalleProviderTest.php`
- Modify: `backend/config/services.php`
- Modify: `backend/.env.example`

**Step 1: Write the failing test**

```php
<?php
// backend/tests/Unit/DalleProviderTest.php
namespace Tests\Unit;

use App\Services\DalleProvider;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DalleProviderTest extends TestCase
{
    public function test_fetch_returns_url_from_openai_response(): void
    {
        Http::fake([
            'api.openai.com/*' => Http::response([
                'data' => [['url' => 'https://oaidalleapiprodscus.blob.core.windows.net/test-image.png']],
            ]),
        ]);

        $provider = new DalleProvider;
        $result = $provider->fetch('modern restaurant interior', 1920, 800, [
            'businessName' => 'Bella Trattoria',
            'category' => 'restaurant_cafe',
        ]);

        $this->assertArrayHasKey('url', $result);
        $this->assertStringContainsString('oaidalleapiprodscus', $result['url']);
        Http::assertSentCount(1);
    }

    public function test_fetch_throws_on_missing_api_key(): void
    {
        config(['services.openai.key' => null]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Missing OpenAI API key');

        $provider = new DalleProvider;
        $provider->fetch('test', 800, 600);
    }

    public function test_fetch_throws_on_api_error(): void
    {
        Http::fake([
            'api.openai.com/*' => Http::response(['error' => ['message' => 'Rate limit']], 429),
        ]);

        $this->expectException(\RuntimeException::class);

        $provider = new DalleProvider;
        $provider->fetch('test', 800, 600);
    }
}
```

**Step 2: Run test to verify it fails**

Run: `docker exec <horizon-container> php artisan test --filter=DalleProviderTest`
Expected: FAIL — class `DalleProvider` not found.

**Step 3: Write the implementation**

```php
<?php
// backend/app/Services/DalleProvider.php
namespace App\Services;

use App\Contracts\ImageProviderInterface;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class DalleProvider implements ImageProviderInterface
{
    public function fetch(string $query, int $width, int $height, array $context = []): array
    {
        $apiKey = config('services.openai.key');
        if (! $apiKey) {
            throw new RuntimeException('Missing OpenAI API key.');
        }

        $prompt = $this->buildPrompt($query, $width, $height, $context);
        $size = $this->resolveSize($width, $height);

        $response = Http::withToken($apiKey)
            ->timeout(60)
            ->connectTimeout(10)
            ->post('https://api.openai.com/v1/images/generations', [
                'model' => 'dall-e-3',
                'prompt' => $prompt,
                'n' => 1,
                'size' => $size,
                'quality' => 'standard',
            ]);

        if ($response->failed()) {
            $error = $response->json('error.message', 'Unknown OpenAI error');
            throw new RuntimeException("DALL-E request failed: {$error}");
        }

        $url = $response->json('data.0.url');
        if (! is_string($url) || $url === '') {
            throw new RuntimeException('DALL-E response missing image URL.');
        }

        return ['url' => $url];
    }

    private function buildPrompt(string $query, int $width, int $height, array $context): string
    {
        $businessName = $context['businessName'] ?? $context['business_name'] ?? '';
        $category = $context['category'] ?? $context['businessCategory'] ?? $query;

        $orientation = $width > $height ? 'landscape' : ($height > $width ? 'portrait' : 'square');

        $prompt = "Professional, high-quality {$orientation} photograph for a {$category} business";
        if ($businessName !== '') {
            $prompt .= " called \"{$businessName}\"";
        }
        $prompt .= ". The image should be suitable for a modern website hero section. ";
        $prompt .= 'Clean, well-lit, editorial style. No text or logos in the image.';

        return mb_substr($prompt, 0, 4000);
    }

    /**
     * DALL-E 3 supports: 1024x1024, 1792x1024, 1024x1792
     */
    private function resolveSize(int $width, int $height): string
    {
        $ratio = $width / max($height, 1);

        if ($ratio > 1.3) {
            return '1792x1024'; // landscape
        }
        if ($ratio < 0.77) {
            return '1024x1792'; // portrait
        }

        return '1024x1024'; // square
    }
}
```

**Step 4: Add config**

In `backend/config/services.php`, add the OpenAI key:
```php
'openai' => [
    'key' => env('OPENAI_API_KEY'),
],
```

In `backend/.env.example`, add:
```
OPENAI_API_KEY=
```

**Step 5: Run test to verify it passes**

Run: `docker exec <horizon-container> php artisan test --filter=DalleProviderTest`
Expected: 3 tests, 3 assertions, PASS.

**Step 6: Commit**

```bash
git add backend/app/Services/DalleProvider.php backend/tests/Unit/DalleProviderTest.php backend/config/services.php backend/.env.example
git commit -m "feat(sswg): add DalleProvider for OpenAI DALL-E 3 image generation"
```

---

## Task 2: Add `tier` Column to Projects Table

**Files:**
- Create: `backend/database/migrations/2026_03_08_000001_add_tier_to_projects_table.php`
- Modify: `backend/app/Models/Project.php`

**Step 1: Create migration**

```php
<?php
// backend/database/migrations/2026_03_08_000001_add_tier_to_projects_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('tier', 20)->default('individual')->after('language');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('tier');
        });
    }
};
```

**Step 2: Update Project model**

Add `'tier'` to the `$fillable` array in `backend/app/Models/Project.php`.

Add helper method:
```php
public function isAgency(): bool
{
    return $this->tier === 'agency';
}
```

**Step 3: Run migration**

Run: `docker exec <laravel-container> php artisan migrate`
Expected: Migration runs, `tier` column added with default `'individual'`.

**Step 4: Commit**

```bash
git add backend/database/migrations/2026_03_08_000001_add_tier_to_projects_table.php backend/app/Models/Project.php
git commit -m "feat(sswg): add tier column to projects table (individual/agency)"
```

---

## Task 3: Update GenerateThemeJob — Store IMAGE Token Manifest in Job Result

The `UpgradeThemeImagesJob` (Task 5) needs to know which IMAGE_* tokens were used and their dimensions so it can regenerate them with DALL-E. The cheapest way is to store this metadata in the job's `result` JSON alongside `download_path`.

**Files:**
- Modify: `backend/app/Jobs/GenerateThemeJob.php`

**Step 1: Store image token manifest in job result**

In `GenerateThemeJob::handle()`, after the image handler runs and before marking the job complete, add the image token list to the result payload.

Find the section where `$job->markCompleted(...)` is called and ensure the result array includes:

```php
'image_tokens' => $imageTokens, // array of IMAGE_* token names used
'project_data' => [
    'businessName' => data_get($projectData, 'name', ''),
    'category' => data_get($projectData, 'data.modes.business_category', 'business'),
],
```

This is a small addition to the existing `markCompleted()` call — just adding two keys to the result array.

**Step 2: Verify existing tests still pass**

Run: `docker exec <horizon-container> php artisan test`
Expected: All existing tests pass.

**Step 3: Commit**

```bash
git add backend/app/Jobs/GenerateThemeJob.php
git commit -m "feat(sswg): store image token manifest in job result for DALL-E upgrade"
```

---

## Task 4: Update Generated Theme Expiry — 7 Days

Currently `GenerateThemeJob` creates `GeneratedTheme` records with 24-hour expiry. Change to 7 days per design spec.

**Files:**
- Modify: `backend/app/Jobs/GenerateThemeJob.php`

**Step 1: Change expiry**

Find the line that creates the `GeneratedTheme` record (search for `expires_at`). Change from:
```php
'expires_at' => now()->addDay(),
```
to:
```php
'expires_at' => now()->addDays(7),
```

**Step 2: Commit**

```bash
git add backend/app/Jobs/GenerateThemeJob.php
git commit -m "fix(sswg): extend generated theme expiry from 24h to 7 days"
```

---

## Task 5: UpgradeThemeImagesJob — DALL-E Image Swap

**Files:**
- Create: `backend/app/Jobs/UpgradeThemeImagesJob.php`
- Create: `backend/tests/Unit/UpgradeThemeImagesJobTest.php`

**Step 1: Write the failing test**

```php
<?php
// backend/tests/Unit/UpgradeThemeImagesJobTest.php
namespace Tests\Unit;

use App\Jobs\UpgradeThemeImagesJob;
use Tests\TestCase;

class UpgradeThemeImagesJobTest extends TestCase
{
    public function test_job_properties(): void
    {
        $job = new UpgradeThemeImagesJob('fake-job-id');

        $this->assertEquals(1, $job->tries);
        $this->assertEquals(300, $job->timeout);
        $this->assertEquals('generate', $job->queue);
    }
}
```

**Step 2: Write the implementation**

```php
<?php
// backend/app/Jobs/UpgradeThemeImagesJob.php
namespace App\Jobs;

use App\Models\GeneratedTheme;
use App\Models\GenerationJob;
use App\Services\DalleProvider;
use App\Services\ImageHandler;
use App\Services\PlaceholderProvider;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class UpgradeThemeImagesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 300; // 5 minutes
    public string $queue = 'generate';

    public function __construct(
        private readonly string $jobId,
    ) {}

    public function handle(): void
    {
        $job = GenerationJob::findOrFail($this->jobId);
        $theme = GeneratedTheme::where('job_id', $this->jobId)->firstOrFail();

        $imageTokens = data_get($job->result, 'image_tokens', []);
        $projectData = data_get($job->result, 'project_data', []);

        if (empty($imageTokens)) {
            Log::warning('UpgradeThemeImagesJob: No image tokens to upgrade', ['job_id' => $this->jobId]);
            return;
        }

        // Filter out IMAGE_HERO — already upgraded at preview time
        $tokensToUpgrade = array_values(array_filter(
            $imageTokens,
            fn (string $token) => $token !== 'IMAGE_HERO'
        ));

        if (empty($tokensToUpgrade)) {
            Log::info('UpgradeThemeImagesJob: Only IMAGE_HERO present, nothing to upgrade');
            return;
        }

        $tempDir = sys_get_temp_dir() . '/upgrade-' . $this->jobId;
        $zipPath = $tempDir . '/theme.zip';
        $extractDir = $tempDir . '/extracted';

        try {
            mkdir($tempDir, 0755, true);
            mkdir($extractDir, 0755, true);

            // Download ZIP from Supabase
            $contents = Storage::disk('supabase')->get($theme->file_path);
            file_put_contents($zipPath, $contents);

            // Generate DALL-E images
            $imageHandler = new ImageHandler(new DalleProvider, new PlaceholderProvider);
            $context = [
                'category' => $projectData['category'] ?? 'business',
                'businessName' => $projectData['businessName'] ?? '',
            ];
            $imagesDir = $tempDir . '/dalle-images';
            mkdir($imagesDir, 0755, true);
            $newImages = $imageHandler->generateImages($context, $imagesDir, $tokensToUpgrade);

            // Open ZIP and replace images
            $zip = new ZipArchive;
            if ($zip->open($zipPath) !== true) {
                throw new \RuntimeException('Failed to open theme ZIP');
            }

            // Find theme slug (first directory in ZIP)
            $themeSlug = '';
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $name = $zip->getNameIndex($i);
                if (str_contains($name, '/')) {
                    $themeSlug = explode('/', $name)[0];
                    break;
                }
            }

            foreach ($newImages as $token => $localPath) {
                if (! file_exists($localPath)) {
                    Log::warning("UpgradeThemeImagesJob: DALL-E image missing for {$token}, skipping");
                    continue;
                }
                $zipEntryName = $themeSlug . '/assets/images/' . strtolower($token) . '.jpg';
                $zip->addFile($localPath, $zipEntryName);
            }

            $zip->close();

            // Re-upload to Supabase (same path, overwrite)
            Storage::disk('supabase')->put($theme->file_path, file_get_contents($zipPath));

            Log::info('UpgradeThemeImagesJob: Images upgraded', [
                'job_id' => $this->jobId,
                'tokens_upgraded' => count($newImages),
            ]);

            // Update job result with upgrade status
            $result = $job->result ?? [];
            $result['images_upgraded'] = true;
            $result['images_upgraded_at'] = now()->toIso8601String();
            $job->update(['result' => $result]);

        } finally {
            // Cleanup temp files
            if (is_dir($tempDir)) {
                $this->deleteDirectory($tempDir);
            }
        }
    }

    private function deleteDirectory(string $dir): void
    {
        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($files as $file) {
            $file->isDir() ? rmdir($file->getRealPath()) : unlink($file->getRealPath());
        }
        rmdir($dir);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('UpgradeThemeImagesJob failed', [
            'job_id' => $this->jobId,
            'error' => $exception->getMessage(),
        ]);

        // Mark job result so frontend knows upgrade failed but theme is still downloadable
        $job = GenerationJob::find($this->jobId);
        if ($job) {
            $result = $job->result ?? [];
            $result['images_upgraded'] = false;
            $result['images_upgrade_error'] = mb_substr($exception->getMessage(), 0, 500);
            $job->update(['result' => $result]);
        }
    }
}
```

**Step 3: Run tests**

Run: `docker exec <horizon-container> php artisan test --filter=UpgradeThemeImagesJobTest`
Expected: PASS.

**Step 4: Commit**

```bash
git add backend/app/Jobs/UpgradeThemeImagesJob.php backend/tests/Unit/UpgradeThemeImagesJobTest.php
git commit -m "feat(sswg): add UpgradeThemeImagesJob for DALL-E image swap after payment"
```

---

## Task 6: Backend API — Upgrade Images Endpoint

**Files:**
- Modify: `backend/app/Http/Controllers/GenerationController.php`
- Modify: `backend/routes/api.php`

**Step 1: Add endpoint to controller**

Add to `GenerationController.php`:

```php
/**
 * POST /api/upgrade-images
 */
public function upgradeImages(Request $request, MetricsLogger $metrics): JsonResponse
{
    $validated = $request->validate([
        'jobId' => 'required|uuid',
    ]);

    $job = GenerationJob::find($validated['jobId']);
    if (! $job || $job->status !== GenerationJob::STATUS_COMPLETED) {
        return response()->json(['error' => 'Job not found or not completed'], 404);
    }

    UpgradeThemeImagesJob::dispatch($job->id);

    $metrics->emit('job.upgrade_images.dispatched', [
        'job_id' => $job->id,
        'project_id' => $job->project_id,
    ]);

    return response()->json(['success' => true, 'jobId' => $job->id], 202);
}
```

Add the import: `use App\Jobs\UpgradeThemeImagesJob;`

**Step 2: Add route**

In `backend/routes/api.php`, add:
```php
Route::post('/upgrade-images', [GenerationController::class, 'upgradeImages']);
```

**Step 3: Commit**

```bash
git add backend/app/Http/Controllers/GenerationController.php backend/routes/api.php
git commit -m "feat(sswg): add POST /api/upgrade-images endpoint for DALL-E image swap"
```

---

## Task 7: Frontend — Adaptive Status Polling

**Files:**
- Modify: `app/studio/StudioClient.tsx`

**Step 1: Replace the polling useEffect**

Find the existing polling `useEffect` (around line 336-363 in `StudioClient.tsx`). Replace it with adaptive polling logic:

```typescript
// Adaptive polling: faster initially, slower over time, with user feedback
useEffect(() => {
  if (currentStep !== 5 || !jobId || jobStatus === "completed" || jobStatus === "failed") return;

  const elapsedMs = pollCount * 3000; // approximate elapsed time
  const interval = elapsedMs < 90_000 ? 3000 : 5000; // 3s for first 90s, then 5s
  const maxPollTime = 600_000; // 10 minutes (matches backend job timeout)

  if (elapsedMs >= maxPollTime) {
    setJobStatus("failed");
    return;
  }

  const timer = setTimeout(async () => {
    try {
      const res = await fetch(`/api/status?id=${jobId}`);
      if (!res.ok) {
        setPollCount((prev) => prev + 1);
        return;
      }
      const data = await res.json();
      setJobStatus(data.status);

      if (data.status === "completed") {
        setArtifacts({
          themeUrl: data.themeUrl,
          staticUrl: data.staticUrl,
          slug: data.project_id,
        });
        toast.success("Generation complete! Your kit is ready.");
      } else if (data.status === "failed") {
        // Don't toast — inline error will show
      }

      setPollCount((prev) => prev + 1);
    } catch {
      // Network error — keep polling, don't crash
      setPollCount((prev) => prev + 1);
    }
  }, interval);

  return () => clearTimeout(timer);
}, [currentStep, jobId, jobStatus, pollCount]);
```

**Step 2: Add dynamic status messages**

Add a helper function above the JSX return:

```typescript
function getPollingMessage(pollCount: number, jobStatus: string): string {
  if (jobStatus === "completed") return "Your Kit is Ready";
  if (jobStatus === "failed") return "Generation Failed";

  const elapsed = pollCount * 3; // seconds (approximate)
  if (elapsed < 90) return "Building Your Assets";
  if (elapsed < 180) return "Taking a bit longer than usual...";
  if (elapsed < 300) return "Still working on your theme...";
  return "This is taking longer than expected";
}
```

Use it in the Step 5 JSX title:
```typescript
{getPollingMessage(pollCount, jobStatus)}
```

**Step 3: Add retry button for timeout/failure states**

In the Step 5 JSX, after the failure icon, add:

```typescript
{jobStatus === "failed" && (
  <div className="space-y-4">
    <p className="text-sm text-slate-400">
      Something went wrong during generation. This is rare — please try again.
    </p>
    <button
      onClick={async () => {
        setJobStatus("pending");
        setPollCount(0);
        try {
          const res = await fetch("/api/regenerate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: artifacts?.slug || projectId }),
          });
          const data = await res.json();
          if (data.success) {
            setJobId(data.jobId);
            toast.success("Retrying generation...");
          }
        } catch {
          toast.error("Could not retry. Please refresh and try again.");
        }
      }}
      className="rounded-xl bg-teal-500 px-6 py-3 text-sm font-bold text-white hover:bg-teal-400 transition-colors"
    >
      Try Again
    </button>
  </div>
)}
```

Also add a "Show retry" state for the long-wait scenario:

```typescript
{jobStatus !== "completed" && jobStatus !== "failed" && pollCount * 3 >= 300 && (
  <button
    onClick={() => setJobStatus("failed")} // trigger the retry UI
    className="mt-4 text-sm text-slate-500 underline hover:text-slate-300"
  >
    Not working? Try again
  </button>
)}
```

**Step 4: Commit**

```bash
git add app/studio/StudioClient.tsx
git commit -m "feat(studio): adaptive polling with timeout messaging and retry button"
```

---

## Task 8: Frontend — Proxy Upgrade Images Endpoint

**Files:**
- Create: `app/api/upgrade-images/route.ts`

**Step 1: Create the frontend proxy route**

This follows the same proxy pattern as `/api/generate` and `/api/status`.

```typescript
// app/api/upgrade-images/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: "Backend not configured" }, { status: 503 });
  }

  const body = await req.json();

  const res = await fetch(`${backendUrl}/api/upgrade-images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
```

**Step 2: Commit**

```bash
git add app/api/upgrade-images/route.ts
git commit -m "feat(studio): add frontend proxy for /api/upgrade-images endpoint"
```

---

## Task 9: Update Status Endpoint — Include Upgrade Status

**Files:**
- Modify: `backend/app/Http/Controllers/GenerationController.php`

**Step 1: Add upgrade fields to status response**

In the `status()` method, add to the response array:

```php
'images_upgraded' => data_get($job->result, 'images_upgraded'),
'images_upgrade_error' => data_get($job->result, 'images_upgrade_error'),
```

This allows the frontend to know whether DALL-E image upgrade succeeded, failed, or hasn't run yet (null).

**Step 2: Commit**

```bash
git add backend/app/Http/Controllers/GenerationController.php
git commit -m "feat(sswg): include image upgrade status in /api/status response"
```

---

## Task 10: Frontend — Payment Gate UI at Step 5

This task adds the payment wall between generation complete and download. The user sees their theme is ready, must sign up + pay, then gets the download.

**Files:**
- Modify: `app/studio/StudioClient.tsx`

**Step 1: Add payment state management**

Add state variables near the other state declarations:

```typescript
const [paymentCompleted, setPaymentCompleted] = useState(false);
const [upgradeStatus, setUpgradeStatus] = useState<"idle" | "upgrading" | "done" | "failed">("idle");
```

**Step 2: Update Step 5 UI — split into phases**

Replace the Step 5 download button section with a phased UI:

Phase A — Generation in progress (existing spinner + adaptive messages).

Phase B — Generation complete, payment required:
```typescript
{jobStatus === "completed" && !paymentCompleted && (
  <div className="space-y-6">
    <h2 className="text-2xl font-black text-white">Your Theme is Ready!</h2>
    <p className="text-slate-400">Sign up and purchase to download your custom WordPress theme.</p>
    <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-left space-y-3">
      <p className="text-lg font-bold text-white">Single Theme — $29.99</p>
      <p className="text-sm text-slate-400">One-time payment. AI-generated images. Use on unlimited sites.</p>
    </div>
    <button
      onClick={() => {
        // Open LemonSqueezy checkout overlay or redirect
        // On success callback: setPaymentCompleted(true)
        // TODO: Wire LemonSqueezy JS SDK here
        window.open("https://presspilotapp.lemonsqueezy.com/buy/single-theme", "_blank");
      }}
      className="w-full rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 hover:bg-slate-200 transition-colors"
    >
      Purchase & Download — $29.99
    </button>
  </div>
)}
```

Phase C — Payment done, image upgrade in progress:
```typescript
{paymentCompleted && upgradeStatus === "upgrading" && (
  <div className="space-y-4 text-center">
    <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-400" />
    <p className="text-lg font-bold text-white">Personalizing your theme images...</p>
    <p className="text-sm text-slate-400">Our AI is generating custom images for your theme. This takes about 30-60 seconds.</p>
  </div>
)}
```

Phase D — Ready to download:
```typescript
{paymentCompleted && (upgradeStatus === "done" || upgradeStatus === "failed") && (
  <div className="space-y-6">
    <CheckCircle2 className="mx-auto h-16 w-16 text-teal-400" />
    <h2 className="text-2xl font-black text-white">Your Theme is Ready to Download</h2>
    {upgradeStatus === "failed" && (
      <p className="text-sm text-amber-400">
        Custom images couldn't be generated. Your theme uses high-quality stock photos instead.
      </p>
    )}
    <button
      onClick={() => window.open(artifacts?.themeUrl || "", "_blank")}
      className="w-full rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950"
    >
      Download Theme
    </button>
  </div>
)}
```

**Step 3: Add image upgrade trigger after payment**

When payment completes (LemonSqueezy callback), trigger the upgrade:

```typescript
async function handlePaymentSuccess() {
  setPaymentCompleted(true);
  setUpgradeStatus("upgrading");

  try {
    // Trigger DALL-E image upgrade
    await fetch("/api/upgrade-images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });

    // Poll for upgrade completion
    let attempts = 0;
    const maxAttempts = 40; // ~2 minutes at 3s intervals
    const pollUpgrade = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/status?id=${jobId}`);
        const data = await res.json();

        if (data.images_upgraded === true) {
          clearInterval(pollUpgrade);
          // Refresh the download URL (it may have changed after ZIP re-upload)
          setArtifacts({
            themeUrl: data.themeUrl,
            staticUrl: data.staticUrl,
            slug: data.project_id,
          });
          setUpgradeStatus("done");
        } else if (data.images_upgraded === false) {
          clearInterval(pollUpgrade);
          setUpgradeStatus("failed");
        } else if (attempts >= maxAttempts) {
          clearInterval(pollUpgrade);
          setUpgradeStatus("failed");
        }
      } catch {
        // Keep trying
      }
    }, 3000);
  } catch {
    setUpgradeStatus("failed");
  }
}
```

**Step 4: Commit**

```bash
git add app/studio/StudioClient.tsx
git commit -m "feat(studio): add payment gate UI with DALL-E image upgrade flow at Step 5"
```

---

## Task 11: Cleanup Job — Delete Expired ZIPs from Supabase

**Files:**
- Create: `backend/app/Console/Commands/CleanupExpiredThemes.php`

**Step 1: Write the command**

```php
<?php
// backend/app/Console/Commands/CleanupExpiredThemes.php
namespace App\Console\Commands;

use App\Models\GeneratedTheme;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CleanupExpiredThemes extends Command
{
    protected $signature = 'themes:cleanup';
    protected $description = 'Delete expired theme ZIPs from Supabase storage';

    public function handle(): int
    {
        $expired = GeneratedTheme::where('status', GeneratedTheme::STATUS_ACTIVE)
            ->where('expires_at', '<', now())
            ->get();

        $deleted = 0;
        foreach ($expired as $theme) {
            try {
                Storage::disk('supabase')->delete($theme->file_path);
                $theme->update(['status' => GeneratedTheme::STATUS_ARCHIVED]);
                $deleted++;
            } catch (\Throwable $e) {
                Log::warning('CleanupExpiredThemes: Failed to delete', [
                    'theme_id' => $theme->id,
                    'path' => $theme->file_path,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("Cleaned up {$deleted} expired themes.");
        Log::info("CleanupExpiredThemes: Deleted {$deleted} expired ZIPs");

        return self::SUCCESS;
    }
}
```

**Step 2: Schedule it**

In `backend/routes/console.php` (or `app/Console/Kernel.php` depending on Laravel version), add:
```php
Schedule::command('themes:cleanup')->daily();
```

**Step 3: Commit**

```bash
git add backend/app/Console/Commands/CleanupExpiredThemes.php backend/routes/console.php
git commit -m "feat(sswg): add daily cleanup command for expired theme ZIPs"
```

---

## Task 12: Integration Verification

**Step 1: Deploy to Coolify**

Omar pushes all commits to `origin/main`, then manually redeploys both frontend and backend in Coolify. Add `OPENAI_API_KEY` to both `laravel-app` and `laravel-horizon` environment variables in Coolify.

**Step 2: End-to-end smoke test**

1. Visit `presspilotapp.com` → click "Create Your Theme Now"
2. Fill Studio form (restaurant, "Bella Trattoria")
3. Select hero layout, pick colors/fonts
4. At Step 4: verify hero preview loads (check Laravel logs for DALL-E call)
5. At Step 5: verify payment gate appears
6. After simulated payment: verify "Personalizing images..." appears
7. Verify download works

**Step 3: Error path verification**

1. Set invalid `OPENAI_API_KEY` → verify DALL-E hero falls back to Unsplash silently
2. Disconnect network during polling → verify reconnection message appears
3. Wait 5+ minutes → verify timeout message and retry button appear

**Step 4: Update memory and roadmap**

Update `_memory/main.md` with Phase 3 completion status.
Update `docs/PROJECT_ROADMAP.md` to mark Tasks 3.3 and 3.4 complete.

**Step 5: Final commit**

```bash
git add _memory/main.md docs/PROJECT_ROADMAP.md
git commit -m "docs: mark Phase 3 Tasks 3.3 + 3.4 complete"
```

---

## Task Order & Dependencies

```
Task 1 (DalleProvider) ─────────┐
Task 2 (tier column) ──────┐    │
Task 3 (image manifest) ───┤    │
Task 4 (7-day expiry) ─────┘    │
                                 │
Task 5 (UpgradeThemeImagesJob) ──┤ depends on Task 1 + Task 3
Task 6 (upgrade-images API) ─────┤ depends on Task 5
                                 │
Task 7 (adaptive polling) ───────┤ independent (frontend only)
Task 8 (upgrade proxy) ──────────┤ depends on Task 6
Task 9 (status upgrade fields) ──┤ depends on Task 5
                                 │
Task 10 (payment gate UI) ───────┤ depends on Tasks 7, 8, 9
Task 11 (cleanup command) ───────┤ depends on Task 4
                                 │
Task 12 (integration test) ──────┘ depends on all above
```

**Parallelizable groups:**
- Group A (backend core): Tasks 1, 2, 3, 4 — all independent
- Group B (backend jobs): Tasks 5, 6, 9 — depend on Group A
- Group C (frontend): Tasks 7, 8 — Task 7 independent, Task 8 depends on Task 6
- Group D (integration): Tasks 10, 11, 12 — depend on everything above
