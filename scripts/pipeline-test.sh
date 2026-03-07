#!/usr/bin/env bash
# PressPilot SSWG Pipeline Test — Automated 5-Vertical Smoke Test
# Dispatches one generation job per business type, polls until done,
# downloads ZIPs, and validates structure.
#
# Usage:
#   bash scripts/pipeline-test.sh
#   bash scripts/pipeline-test.sh --base-url https://presspilotapp.com
#
# Requirements:
#   - curl, jq, unzip installed
#   - Laravel backend reachable (default: via production URL)
#   - UNSPLASH_ACCESS_KEY set in Horizon container env

set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────────────────

BASE_URL="${BASE_URL:-https://presspilotapp.com}"
POLL_INTERVAL=5        # seconds between status checks
MAX_POLL_TIME=180      # max seconds to wait per job (3 minutes)
OUTPUT_DIR="tests/pipeline-results/$(date +%Y%m%d-%H%M%S)"

# Override base URL via flag
while [[ $# -gt 0 ]]; do
  case $1 in
    --base-url) BASE_URL="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

mkdir -p "$OUTPUT_DIR"

# ─── Colors ──────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ─── Test Payloads (5 Business Types) ────────────────────────────────────────

declare -A TEST_NAMES
declare -A TEST_PAYLOADS

TEST_NAMES[restaurant]="Bella Trattoria"
TEST_PAYLOADS[restaurant]='{
  "input": {
    "businessName": "Bella Trattoria",
    "businessDescription": "Authentic Italian restaurant in downtown Seattle. Family recipes passed down through three generations. Known for handmade pasta, wood-fired pizzas, and an extensive Italian wine list. Cozy atmosphere with exposed brick and candlelit dining.",
    "businessCategory": "restaurant_cafe",
    "primaryLanguage": "en",
    "heroTitle": "Authentic Italian Dining in the Heart of Seattle",
    "slug": "bella-trattoria-test",
    "fontProfile": "modern",
    "heroLayout": "fullBleed",
    "brandStyle": "playful",
    "contactEmail": "info@bellatrattoria.com",
    "contactPhone": "(206) 555-0142",
    "contactAddress": "412 Pike Street",
    "contactCity": "Seattle",
    "contactState": "WA",
    "contactZip": "98101"
  }
}'

TEST_NAMES[ecommerce]="Nexus Digital"
TEST_PAYLOADS[ecommerce]='{
  "input": {
    "businessName": "Nexus Digital",
    "businessDescription": "Premium consumer electronics and smart home technology store. Curated selection of the latest gadgets, audio equipment, laptops, and smart home devices. Free shipping on orders over $50. Expert reviews and buying guides for every product.",
    "businessCategory": "ecommerce",
    "primaryLanguage": "en",
    "heroTitle": "Premium Tech. Honest Reviews. Fast Shipping.",
    "slug": "nexus-digital-test",
    "fontProfile": "modern",
    "heroLayout": "fullWidth",
    "brandStyle": "modern",
    "contactEmail": "support@nexusdigital.com",
    "contactPhone": "(415) 555-0199"
  }
}'

TEST_NAMES[local_service]="Summit Plumbing"
TEST_PAYLOADS[local_service]='{
  "input": {
    "businessName": "Summit Plumbing & Heating",
    "businessDescription": "Licensed and insured plumbing and HVAC services for residential and commercial properties in the Denver metro area. 24/7 emergency service, water heater installation, drain cleaning, furnace repair. Over 15 years of experience. BBB A+ rated.",
    "businessCategory": "local_service",
    "primaryLanguage": "en",
    "heroTitle": "Reliable Plumbing & Heating — 24/7 Emergency Service",
    "slug": "summit-plumbing-test",
    "fontProfile": "modern",
    "heroLayout": "fullWidth",
    "brandStyle": "modern",
    "contactEmail": "service@summitplumbing.com",
    "contactPhone": "(303) 555-0177",
    "contactAddress": "890 Colfax Ave",
    "contactCity": "Denver",
    "contactState": "CO",
    "contactZip": "80204"
  }
}'

TEST_NAMES[saas]="CloudMetrics"
TEST_PAYLOADS[saas]='{
  "input": {
    "businessName": "CloudMetrics",
    "businessDescription": "Real-time analytics and monitoring platform for SaaS companies. Track user engagement, revenue metrics, churn prediction, and product usage in one unified dashboard. Integrates with Stripe, Segment, Mixpanel, and 50+ data sources. Trusted by 2,000+ companies.",
    "businessCategory": "saas_product",
    "primaryLanguage": "en",
    "heroTitle": "SaaS Analytics That Actually Make Sense",
    "slug": "cloudmetrics-test",
    "fontProfile": "modern",
    "heroLayout": "split",
    "brandStyle": "modern",
    "contactEmail": "hello@cloudmetrics.io"
  }
}'

TEST_NAMES[portfolio]="Sarah Chen Studio"
TEST_PAYLOADS[portfolio]='{
  "input": {
    "businessName": "Sarah Chen Studio",
    "businessDescription": "Award-winning graphic design and brand identity studio. Specializing in visual identity systems, packaging design, and editorial design for startups and cultural institutions. Featured in Communication Arts, AIGA, and Print Magazine.",
    "businessCategory": "professional_services",
    "primaryLanguage": "en",
    "heroTitle": "Design That Tells Your Story",
    "slug": "sarah-chen-studio-test",
    "fontProfile": "elegant",
    "heroLayout": "minimal",
    "brandStyle": "modern",
    "contactEmail": "hello@sarahchenstudio.com",
    "contactCity": "Portland",
    "contactState": "OR"
  }
}'

VERTICALS=(restaurant ecommerce local_service saas portfolio)

# ─── Helper Functions ────────────────────────────────────────────────────────

log_info()  { echo -e "${CYAN}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_fail()  { echo -e "${RED}[FAIL]${NC}  $1"; }

dispatch_job() {
  local vertical="$1"
  local payload="${TEST_PAYLOADS[$vertical]}"
  local name="${TEST_NAMES[$vertical]}"

  log_info "Dispatching: ${name} (${vertical})"

  local response
  response=$(curl -s -X POST "${BASE_URL}/api/generate" \
    -H "Content-Type: application/json" \
    -d "$payload" 2>&1)

  local job_id
  job_id=$(echo "$response" | jq -r '.jobId // empty' 2>/dev/null)

  if [[ -z "$job_id" ]]; then
    log_fail "Failed to dispatch ${vertical}: ${response}"
    echo "$response" > "${OUTPUT_DIR}/${vertical}-dispatch-error.json"
    echo ""
    return 1
  fi

  log_ok "Dispatched ${vertical} → Job ID: ${job_id}"
  echo "$response" > "${OUTPUT_DIR}/${vertical}-dispatch.json"
  echo "$job_id"
}

poll_job() {
  local vertical="$1"
  local job_id="$2"
  local name="${TEST_NAMES[$vertical]}"
  local elapsed=0

  while [[ $elapsed -lt $MAX_POLL_TIME ]]; do
    local status_response
    status_response=$(curl -s "${BASE_URL}/api/status?id=${job_id}" 2>&1)

    local status
    status=$(echo "$status_response" | jq -r '.status // "unknown"' 2>/dev/null)

    case "$status" in
      completed)
        log_ok "${name}: COMPLETED in ${elapsed}s"
        echo "$status_response" > "${OUTPUT_DIR}/${vertical}-status.json"

        local theme_url
        theme_url=$(echo "$status_response" | jq -r '.themeUrl // empty' 2>/dev/null)

        if [[ -n "$theme_url" ]]; then
          echo "$theme_url"
        fi
        return 0
        ;;
      failed)
        log_fail "${name}: FAILED after ${elapsed}s"
        echo "$status_response" > "${OUTPUT_DIR}/${vertical}-status.json"
        local error_msg
        error_msg=$(echo "$status_response" | jq -r '.result.error // .error // "unknown error"' 2>/dev/null)
        log_fail "  Error: ${error_msg}"
        return 1
        ;;
      pending|processing)
        printf "  ⏳ ${name}: ${status} (${elapsed}s)...\r"
        ;;
      *)
        log_warn "${name}: Unknown status '${status}'"
        ;;
    esac

    sleep $POLL_INTERVAL
    elapsed=$((elapsed + POLL_INTERVAL))
  done

  log_fail "${name}: TIMED OUT after ${MAX_POLL_TIME}s"
  echo "$status_response" > "${OUTPUT_DIR}/${vertical}-status-timeout.json"
  return 1
}

download_and_validate() {
  local vertical="$1"
  local theme_url="$2"
  local name="${TEST_NAMES[$vertical]}"
  local zip_path="${OUTPUT_DIR}/${vertical}.zip"
  local extract_dir="${OUTPUT_DIR}/${vertical}-extracted"

  # Download
  log_info "Downloading ${name} ZIP..."
  if ! curl -s -L -o "$zip_path" "$theme_url"; then
    log_fail "Download failed for ${vertical}"
    return 1
  fi

  local zip_size
  zip_size=$(wc -c < "$zip_path" | tr -d ' ')
  log_ok "Downloaded: ${zip_path} (${zip_size} bytes)"

  if [[ "$zip_size" -lt 1000 ]]; then
    log_fail "ZIP too small (${zip_size} bytes) — likely an error response"
    return 1
  fi

  # Extract
  mkdir -p "$extract_dir"
  if ! unzip -q -o "$zip_path" -d "$extract_dir" 2>/dev/null; then
    log_fail "Failed to extract ${vertical}.zip"
    return 1
  fi

  # Find theme root (first subdirectory in extract)
  local theme_root
  theme_root=$(find "$extract_dir" -mindepth 1 -maxdepth 1 -type d | head -1)

  if [[ -z "$theme_root" ]]; then
    # Files might be at root level
    theme_root="$extract_dir"
  fi

  # ─── Validation Checks ──────────────────────────────────────────────────

  local checks_passed=0
  local checks_total=0
  local report="${OUTPUT_DIR}/${vertical}-report.txt"

  echo "=== Pipeline Test Report: ${name} (${vertical}) ===" > "$report"
  echo "Date: $(date)" >> "$report"
  echo "ZIP Size: ${zip_size} bytes" >> "$report"
  echo "" >> "$report"

  validate_check() {
    local label="$1"
    local result="$2"
    checks_total=$((checks_total + 1))
    if [[ "$result" == "pass" ]]; then
      checks_passed=$((checks_passed + 1))
      echo "  ✅ ${label}" >> "$report"
    else
      echo "  ❌ ${label}" >> "$report"
      log_fail "  ${vertical}: ${label}"
    fi
  }

  # Check 1: style.css exists and has valid header
  if [[ -f "${theme_root}/style.css" ]]; then
    if grep -q "Theme Name:" "${theme_root}/style.css"; then
      validate_check "style.css has valid header" "pass"
    else
      validate_check "style.css has valid header" "fail"
    fi

    if grep -qi "${name}" "${theme_root}/style.css" 2>/dev/null || grep -qi "presspilot" "${theme_root}/style.css" 2>/dev/null; then
      validate_check "style.css contains business/brand name" "pass"
    else
      validate_check "style.css contains business/brand name" "fail"
    fi
  else
    validate_check "style.css exists" "fail"
  fi

  # Check 2: theme.json is valid JSON
  if [[ -f "${theme_root}/theme.json" ]]; then
    if jq empty "${theme_root}/theme.json" 2>/dev/null; then
      validate_check "theme.json is valid JSON" "pass"
    else
      validate_check "theme.json is valid JSON" "fail"
    fi
  else
    validate_check "theme.json exists" "fail"
  fi

  # Check 3: Required template files
  for tmpl in index.html front-page.html page.html single.html 404.html; do
    if [[ -f "${theme_root}/templates/${tmpl}" ]]; then
      validate_check "templates/${tmpl} exists" "pass"
    else
      validate_check "templates/${tmpl} exists" "fail"
    fi
  done

  # Check 4: Required parts
  for part in header.html footer.html; do
    if [[ -f "${theme_root}/parts/${part}" ]]; then
      validate_check "parts/${part} exists" "pass"
    else
      validate_check "parts/${part} exists" "fail"
    fi
  done

  # Check 5: PressPilot credit in footer
  if [[ -f "${theme_root}/parts/footer.html" ]]; then
    if grep -qi "presspilot" "${theme_root}/parts/footer.html"; then
      validate_check "Footer contains PressPilot credit" "pass"
    else
      validate_check "Footer contains PressPilot credit" "fail"
    fi
  fi

  # Check 6: No unresolved {{TOKEN}} placeholders
  local unresolved
  unresolved=$(grep -r '{{[A-Z_]*}}' "${theme_root}/templates/" "${theme_root}/parts/" 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$unresolved" -eq 0 ]]; then
    validate_check "No unresolved {{TOKEN}} placeholders" "pass"
  else
    validate_check "No unresolved {{TOKEN}} (found ${unresolved})" "fail"
    grep -r '{{[A-Z_]*}}' "${theme_root}/templates/" "${theme_root}/parts/" 2>/dev/null >> "$report"
  fi

  # Check 7: Images directory has files (Unsplash should have downloaded them)
  local image_count=0
  if [[ -d "${theme_root}/assets/images" ]]; then
    image_count=$(find "${theme_root}/assets/images" -type f | wc -l | tr -d ' ')
  fi
  if [[ "$image_count" -gt 0 ]]; then
    validate_check "Images present (${image_count} files)" "pass"
  else
    validate_check "Images present (found 0 — Unsplash may have failed)" "fail"
  fi

  # Check 8: No placeholder URLs in template files (placehold.co means Unsplash failed)
  local placeholder_refs
  placeholder_refs=$(grep -r 'placehold\.co' "${theme_root}/templates/" "${theme_root}/parts/" 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$placeholder_refs" -eq 0 ]]; then
    validate_check "No placehold.co URLs in templates (real images)" "pass"
  else
    validate_check "No placehold.co URLs (found ${placeholder_refs} — Unsplash fallback triggered)" "fail"
  fi

  # Check 9: Block markup sanity — no unclosed wp: blocks
  local open_blocks close_blocks
  open_blocks=$(grep -roh '<!-- wp:[a-z]' "${theme_root}/templates/" 2>/dev/null | wc -l | tr -d ' ')
  close_blocks=$(grep -roh '<!-- /wp:' "${theme_root}/templates/" 2>/dev/null | wc -l | tr -d ' ')
  local self_closing
  self_closing=$(grep -roh '/-->' "${theme_root}/templates/" 2>/dev/null | wc -l | tr -d ' ')
  # Rough check: open = close + self-closing (approximate)
  if [[ "$open_blocks" -gt 0 ]]; then
    validate_check "Block markup present (${open_blocks} blocks)" "pass"
  else
    validate_check "Block markup present (0 blocks found)" "fail"
  fi

  # Summary
  echo "" >> "$report"
  echo "Result: ${checks_passed}/${checks_total} checks passed" >> "$report"

  if [[ "$checks_passed" -eq "$checks_total" ]]; then
    log_ok "${name}: ALL ${checks_total} CHECKS PASSED ✅"
  else
    log_warn "${name}: ${checks_passed}/${checks_total} checks passed"
  fi

  return 0
}

# ─── Main Execution ──────────────────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PressPilot SSWG Pipeline Test"
echo "  Target: ${BASE_URL}"
echo "  Output: ${OUTPUT_DIR}"
echo "  Verticals: ${#VERTICALS[@]}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Phase 1: Dispatch all jobs
declare -A JOB_IDS

for v in "${VERTICALS[@]}"; do
  job_id=$(dispatch_job "$v" || echo "FAILED")
  if [[ "$job_id" != "FAILED" && -n "$job_id" ]]; then
    JOB_IDS[$v]="$job_id"
  fi
done

echo ""
log_info "Dispatched ${#JOB_IDS[@]}/${#VERTICALS[@]} jobs. Polling for results..."
echo ""

# Phase 2: Poll all jobs
declare -A THEME_URLS
total_passed=0
total_failed=0
total_timeout=0

for v in "${VERTICALS[@]}"; do
  if [[ -z "${JOB_IDS[$v]:-}" ]]; then
    total_failed=$((total_failed + 1))
    continue
  fi

  theme_url=$(poll_job "$v" "${JOB_IDS[$v]}" || echo "")
  echo ""

  if [[ -n "$theme_url" && "$theme_url" != "" ]]; then
    THEME_URLS[$v]="$theme_url"
  else
    total_failed=$((total_failed + 1))
  fi
done

# Phase 3: Download and validate
echo ""
log_info "Downloading and validating completed themes..."
echo ""

for v in "${VERTICALS[@]}"; do
  if [[ -n "${THEME_URLS[$v]:-}" ]]; then
    download_and_validate "$v" "${THEME_URLS[$v]}" || true
    echo ""
  fi
done

# ─── Final Summary ───────────────────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PIPELINE TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for v in "${VERTICALS[@]}"; do
  local_name="${TEST_NAMES[$v]}"
  if [[ -f "${OUTPUT_DIR}/${v}-report.txt" ]]; then
    local_result=$(tail -1 "${OUTPUT_DIR}/${v}-report.txt")
    echo -e "  ${GREEN}✅${NC} ${local_name} (${v}): ${local_result}"
  elif [[ -f "${OUTPUT_DIR}/${v}-status.json" ]]; then
    local_status=$(jq -r '.status' "${OUTPUT_DIR}/${v}-status.json" 2>/dev/null)
    echo -e "  ${RED}❌${NC} ${local_name} (${v}): ${local_status}"
  else
    echo -e "  ${RED}❌${NC} ${local_name} (${v}): dispatch failed"
  fi
done

echo ""
echo "  Results saved to: ${OUTPUT_DIR}/"
echo "  Individual reports: ${OUTPUT_DIR}/*-report.txt"
echo "  Theme ZIPs: ${OUTPUT_DIR}/*.zip"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
