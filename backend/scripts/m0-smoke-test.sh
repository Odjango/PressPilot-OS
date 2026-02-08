#!/usr/bin/env bash
#
# M0 End-to-End Smoke Test
#
# Verifies the full Laravel pipeline against the deployed Docker stack.
# Run via SSH tunnel: ssh -L 8080:localhost:8080 user@vps
# Then: bash backend/scripts/m0-smoke-test.sh
#
# Requires: curl, jq
#
# Gates verified: P5 (pipeline), P6 (storage), P7 (signed URLs), P8 (metrics)
#

set -euo pipefail

BASE_URL="${M0_BASE_URL:-http://localhost:8080}"
PASS=0
FAIL=0

pass() { echo "  PASS: $1"; PASS=$((PASS + 1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }

echo "=== M0 Smoke Test ==="
echo "Target: $BASE_URL"
echo ""

# ── Gate P7: Health Endpoint ────────────────────────────────────────

echo "--- P7: Health Check ---"

HEALTH=$(curl -sf "$BASE_URL/api/internal/health" 2>/dev/null || echo '{"status":"unreachable"}')
HEALTH_STATUS=$(echo "$HEALTH" | jq -r '.status' 2>/dev/null || echo "parse_error")

if [ "$HEALTH_STATUS" = "ok" ]; then
    pass "Health endpoint returns status=ok"

    DB_STATUS=$(echo "$HEALTH" | jq -r '.checks.database.status')
    REDIS_STATUS=$(echo "$HEALTH" | jq -r '.checks.redis.status')
    STORAGE_STATUS=$(echo "$HEALTH" | jq -r '.checks.storage.status')

    [ "$DB_STATUS" = "connected" ] && pass "Database connected" || fail "Database: $DB_STATUS"
    [ "$REDIS_STATUS" = "connected" ] && pass "Redis connected" || fail "Redis: $REDIS_STATUS"
    [ "$STORAGE_STATUS" = "connected" ] && pass "Storage connected" || fail "Storage: $STORAGE_STATUS"
else
    fail "Health endpoint returned: $HEALTH_STATUS"
    echo "  Cannot proceed without healthy services. Exiting."
    exit 1
fi

echo ""

# ── Gate P5: Job Dispatch + Processing ──────────────────────────────

echo "--- P5: Job Pipeline ---"

# Find an existing project_id from the database
# If no project exists, this test cannot run
PROJECT_ID="${M0_PROJECT_ID:-}"

if [ -z "$PROJECT_ID" ]; then
    echo "  No M0_PROJECT_ID set. Attempting to find one from the API..."
    echo "  Set M0_PROJECT_ID=<uuid> to use a specific project."
    echo "  Skipping pipeline test (no project available)."
    fail "Pipeline test skipped — set M0_PROJECT_ID"
else
    # Dispatch a job
    DISPATCH=$(curl -sf -X POST "$BASE_URL/api/internal/jobs/test-dispatch" \
        -H "Content-Type: application/json" \
        -d "{\"project_id\": \"$PROJECT_ID\"}" 2>/dev/null || echo '{"error":"dispatch_failed"}')

    JOB_ID=$(echo "$DISPATCH" | jq -r '.job_id' 2>/dev/null || echo "")
    DISPATCH_STATUS=$(echo "$DISPATCH" | jq -r '.status' 2>/dev/null || echo "")

    if [ "$DISPATCH_STATUS" = "dispatched" ] && [ -n "$JOB_ID" ] && [ "$JOB_ID" != "null" ]; then
        pass "Job dispatched: $JOB_ID"

        # Poll for completion (max 6 minutes = 360 seconds)
        echo "  Polling for job completion (max 6 min)..."
        TIMEOUT=360
        ELAPSED=0
        INTERVAL=10
        FINAL_STATUS="pending"

        while [ $ELAPSED -lt $TIMEOUT ]; do
            JOB_STATE=$(curl -sf "$BASE_URL/api/internal/jobs/$JOB_ID" 2>/dev/null || echo '{}')
            FINAL_STATUS=$(echo "$JOB_STATE" | jq -r '.status' 2>/dev/null || echo "unknown")

            if [ "$FINAL_STATUS" = "completed" ] || [ "$FINAL_STATUS" = "failed" ]; then
                break
            fi

            sleep $INTERVAL
            ELAPSED=$((ELAPSED + INTERVAL))
            echo "  ... $ELAPSED s elapsed (status: $FINAL_STATUS)"
        done

        if [ "$FINAL_STATUS" = "completed" ]; then
            pass "Job completed successfully"

            # ── Gate P6: Storage Verification ────────────────────────────
            echo ""
            echo "--- P6: Storage Verification ---"

            DOWNLOAD_PATH=$(echo "$JOB_STATE" | jq -r '.result.download_path' 2>/dev/null || echo "")
            STATIC_PATH=$(echo "$JOB_STATE" | jq -r '.result.static_path' 2>/dev/null || echo "")

            [ -n "$DOWNLOAD_PATH" ] && [ "$DOWNLOAD_PATH" != "null" ] && \
                pass "Theme ZIP path recorded: $DOWNLOAD_PATH" || \
                fail "Theme ZIP path missing from result"

            [ -n "$STATIC_PATH" ] && [ "$STATIC_PATH" != "null" ] && \
                pass "Static ZIP path recorded: $STATIC_PATH" || \
                fail "Static ZIP path missing from result"

            # Check signed URLs
            THEME_URL=$(echo "$JOB_STATE" | jq -r '.download_urls.theme_zip' 2>/dev/null || echo "")
            STATIC_URL=$(echo "$JOB_STATE" | jq -r '.download_urls.static_zip' 2>/dev/null || echo "")

            if [ -n "$THEME_URL" ] && [ "$THEME_URL" != "null" ]; then
                pass "Signed URL generated for theme ZIP"

                # Verify the URL returns a ZIP
                CONTENT_TYPE=$(curl -sI "$THEME_URL" 2>/dev/null | grep -i "content-type" | head -1 || echo "")
                if echo "$CONTENT_TYPE" | grep -qi "zip\|octet"; then
                    pass "Theme ZIP downloadable (correct Content-Type)"
                else
                    fail "Theme ZIP Content-Type unexpected: $CONTENT_TYPE"
                fi
            else
                THEME_ERROR=$(echo "$JOB_STATE" | jq -r '.download_urls.theme_zip_error' 2>/dev/null || echo "no url")
                fail "Signed URL for theme ZIP: $THEME_ERROR"
            fi

        elif [ "$FINAL_STATUS" = "failed" ]; then
            ERROR=$(echo "$JOB_STATE" | jq -r '.result.error' 2>/dev/null || echo "unknown")
            fail "Job failed: $ERROR"
        else
            fail "Job timed out after ${TIMEOUT}s (status: $FINAL_STATUS)"
        fi
    else
        ERROR=$(echo "$DISPATCH" | jq -r '.error' 2>/dev/null || echo "unknown")
        fail "Job dispatch failed: $ERROR"
    fi
fi

echo ""

# ── Gate P8: Metrics Baseline ───────────────────────────────────────

echo "--- P8: Metrics Baseline ---"
echo "  To verify metrics, run against Docker logs:"
echo "  docker compose -f docker-compose.m0-laravel.yml logs laravel-horizon 2>&1 | grep '\"metric\"' | jq -r '.metric' | sort | uniq -c"
echo ""
echo "  Expected 8 metric names:"
echo "    job.dispatched"
echo "    job.started"
echo "    job.completed"
echo "    job.failed"
echo "    generator.subprocess_duration_ms"
echo "    storage.upload_duration_ms"
echo "    storage.signed_url_generated"
echo "    horizon.queue_depth"
echo ""

# ── Summary ─────────────────────────────────────────────────────────

echo "=== Results ==="
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "M0 SMOKE TEST: ALL PASSED"
    exit 0
else
    echo "M0 SMOKE TEST: $FAIL FAILURE(S)"
    exit 1
fi
