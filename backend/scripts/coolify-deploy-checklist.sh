#!/usr/bin/env bash
#
# M0 Post-Deploy Verification
#
# Run this ON THE VPS after deploying the Laravel Docker Compose stack via Coolify.
# Checks that all containers are healthy, services are connected, and no ports are public.
#
# Usage: bash backend/scripts/coolify-deploy-checklist.sh
#

set -euo pipefail

PASS=0
FAIL=0

pass() { echo "  PASS: $1"; PASS=$((PASS + 1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }

echo "=== M0 Post-Deploy Verification ==="
echo ""

# ── 1. Containers running ─────────────────────────────────────────────

echo "--- 1. Container Health ---"

for CONTAINER in presspilot-laravel-app presspilot-laravel-horizon presspilot-redis; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo "not_found")
    if [ "$STATUS" = "healthy" ]; then
        pass "$CONTAINER is healthy"
    elif [ "$STATUS" = "not_found" ]; then
        fail "$CONTAINER not found — is the stack deployed?"
    else
        fail "$CONTAINER status: $STATUS"
    fi
done

echo ""

# ── 2. No public port binding ─────────────────────────────────────────

echo "--- 2. Security: No Public Ports ---"

PUBLIC_PORTS=$(docker ps --filter "name=presspilot" --format "{{.Ports}}" | grep -c "0.0.0.0" || true)
if [ "$PUBLIC_PORTS" -eq 0 ]; then
    pass "No public port bindings (Docker-internal only)"
else
    fail "PUBLIC PORTS DETECTED — fix immediately in compose file"
    docker ps --filter "name=presspilot" --format "{{.Names}}: {{.Ports}}" | grep "0.0.0.0"
fi

echo ""

# ── 3. Health endpoint ─────────────────────────────────────────────────

echo "--- 3. Laravel Health Endpoint ---"

HEALTH=$(docker exec presspilot-laravel-app curl -sf http://localhost:8080/api/internal/health 2>/dev/null || echo '{"status":"unreachable"}')
HEALTH_STATUS=$(echo "$HEALTH" | jq -r '.status' 2>/dev/null || echo "parse_error")

if [ "$HEALTH_STATUS" = "ok" ]; then
    pass "Health endpoint returns status=ok"

    DB=$(echo "$HEALTH" | jq -r '.checks.database.status' 2>/dev/null)
    REDIS=$(echo "$HEALTH" | jq -r '.checks.redis.status' 2>/dev/null)
    STORAGE=$(echo "$HEALTH" | jq -r '.checks.storage.status' 2>/dev/null)

    [ "$DB" = "connected" ] && pass "Database connected" || fail "Database: $DB"
    [ "$REDIS" = "connected" ] && pass "Redis connected" || fail "Redis: $REDIS"
    [ "$STORAGE" = "connected" ] && pass "Storage connected" || fail "Storage: $STORAGE"
else
    fail "Health endpoint: $HEALTH_STATUS"
fi

echo ""

# ── 4. Horizon status ──────────────────────────────────────────────────

echo "--- 4. Horizon ---"

HORIZON=$(docker exec presspilot-laravel-horizon php artisan horizon:status 2>/dev/null || echo "error")
if echo "$HORIZON" | grep -qi "running"; then
    pass "Horizon is running"
else
    fail "Horizon status: $HORIZON"
fi

echo ""

# ── 5. Scheduler process ──────────────────────────────────────────────

echo "--- 5. Scheduler ---"

SCHEDULER=$(docker exec presspilot-laravel-app supervisorctl status scheduler 2>/dev/null || echo "not_found")
if echo "$SCHEDULER" | grep -qi "RUNNING"; then
    pass "Scheduler process is running (metric #8 will fire)"
else
    fail "Scheduler: $SCHEDULER"
fi

echo ""

# ── 6. Node.js + tsx in horizon container ──────────────────────────────

echo "--- 6. Generator Runtime ---"

# Node.js generator checks removed — SSWG pipeline is pure PHP now (2026-03-08)

PATTERN_LIB=$(docker exec presspilot-laravel-horizon ls /pattern-library/skeletons 2>/dev/null || echo "not_found")
if [ "$PATTERN_LIB" != "not_found" ]; then
    pass "SSWG pattern-library mounted at /pattern-library"
else
    fail "pattern-library not found — check COPY in Dockerfile"
fi

echo ""

# ── Summary ────────────────────────────────────────────────────────────

echo "=== Results ==="
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "POST-DEPLOY VERIFICATION: ALL PASSED"
    echo ""
    echo "Next steps:"
    echo "  1. Run smoke test: docker exec presspilot-laravel-app bash /app/scripts/m0-smoke-test.sh"
    echo "  2. Check metrics: docker logs presspilot-laravel-app 2>&1 | grep '\"metric\"' | head -5"
    echo "  3. Begin P8 3-day observation (see output/P8_OBSERVATION_RUNBOOK.md)"
    exit 0
else
    echo "POST-DEPLOY VERIFICATION: $FAIL FAILURE(S)"
    echo "Fix issues above before proceeding."
    exit 1
fi
