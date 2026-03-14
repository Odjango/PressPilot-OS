#!/usr/bin/env bash
# PressPilot Theme Structure Validator
# Validates that a theme directory meets all WordPress FSE requirements.
# Usage: ./scripts/validate-theme-structure.sh [theme-dir]
# Default: themes/gold-standard-restaurant

set -uo pipefail

THEME_DIR="${1:-themes/gold-standard-restaurant}"
ERRORS=0
WARNINGS=0

red()    { printf "\033[0;31m%s\033[0m\n" "$1"; }
green()  { printf "\033[0;32m%s\033[0m\n" "$1"; }
yellow() { printf "\033[0;33m%s\033[0m\n" "$1"; }

fail() { red "  ✗ $1"; ERRORS=$((ERRORS + 1)); }
pass() { green "  ✓ $1"; }
warn() { yellow "  ⚠ $1"; WARNINGS=$((WARNINGS + 1)); }

echo "═══════════════════════════════════════════════"
echo "  PressPilot Theme Structure Validator"
echo "  Theme: $THEME_DIR"
echo "═══════════════════════════════════════════════"
echo ""

# ─── 1. Theme directory exists ───
echo "▸ Check 1: Theme directory"
if [ -d "$THEME_DIR" ]; then
  pass "Theme directory exists"
else
  fail "Theme directory not found: $THEME_DIR"
  red "\nFATAL: Cannot continue without theme directory."
  exit 1
fi

# ─── 2. Required files ───
echo "▸ Check 2: Required files"
REQUIRED_FILES=(
  "style.css"
  "theme.json"
  "index.php"
  "templates/index.html"
  "parts/header.html"
  "parts/footer.html"
)

for f in "${REQUIRED_FILES[@]}"; do
  if [ -f "$THEME_DIR/$f" ]; then
    pass "$f exists"
  else
    fail "Missing required file: $f"
  fi
done

# ─── 3. style.css header validation ───
echo "▸ Check 3: style.css header fields"
if [ -f "$THEME_DIR/style.css" ]; then
  REQUIRED_HEADERS=("Theme Name:" "Author:" "Version:" "Text Domain:" "License:")
  for header in "${REQUIRED_HEADERS[@]}"; do
    if grep -q "$header" "$THEME_DIR/style.css"; then
      pass "Header field: $header"
    else
      fail "Missing header field: $header"
    fi
  done
fi

# ─── 4. theme.json validation ───
echo "▸ Check 4: theme.json validity"
if [ -f "$THEME_DIR/theme.json" ]; then
  # Valid JSON check (try node first, then python3)
  JSON_VALID=false
  if command -v node &>/dev/null; then
    node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" "$THEME_DIR/theme.json" 2>/dev/null && JSON_VALID=true
  elif command -v python3 &>/dev/null; then
    python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$THEME_DIR/theme.json" 2>/dev/null && JSON_VALID=true
  fi
  if [ "$JSON_VALID" = true ]; then
    pass "theme.json is valid JSON"
  else
    fail "theme.json is NOT valid JSON"
  fi

  # Version field
  if grep -q '"version"' "$THEME_DIR/theme.json"; then
    pass "theme.json has version field"
  else
    fail "theme.json missing version field"
  fi

  # Color palette
  if grep -q '"palette"' "$THEME_DIR/theme.json"; then
    pass "theme.json has color palette"
  else
    warn "theme.json has no color palette"
  fi

  # useRootPaddingAwareAlignments
  if grep -q 'useRootPaddingAwareAlignments' "$THEME_DIR/theme.json"; then
    pass "useRootPaddingAwareAlignments is set"
  else
    warn "useRootPaddingAwareAlignments not set (may cause horizontal scroll)"
  fi
fi

# ─── 5. Block markup validation ───
echo "▸ Check 5: Block markup integrity"
BLOCK_ERRORS=0

# Check all HTML files in templates/ and parts/
for html_file in "$THEME_DIR"/templates/*.html "$THEME_DIR"/parts/*.html; do
  [ -f "$html_file" ] || continue
  basename_f=$(basename "$html_file")

  # Check for template syntax (banned)
  if grep -qE '\{\{[A-Z_]+\}\}' "$html_file"; then
    fail "$basename_f contains unresolved {{TOKEN}} placeholders"
    BLOCK_ERRORS=$((BLOCK_ERRORS + 1))
  fi

  # Check for PHP template tags in HTML (banned)
  if grep -qE '<\?php' "$html_file"; then
    fail "$basename_f contains PHP tags (not allowed in FSE HTML)"
    BLOCK_ERRORS=$((BLOCK_ERRORS + 1))
  fi
done

if [ "$BLOCK_ERRORS" -eq 0 ]; then
  pass "No banned markup found in templates/parts"
fi

# ─── 6. Pattern lint (if patterns exist) ───
echo "▸ Check 6: Pattern quality"
if [ -d "$THEME_DIR/patterns" ]; then
  PATTERN_COUNT=$(find "$THEME_DIR/patterns" -name "*.php" | wc -l | tr -d ' ')
  pass "Found $PATTERN_COUNT pattern files"

  # Check for hardcoded hex colors in patterns
  HEX_LINES=$(grep -rl '#[0-9A-Fa-f]\{6\}' "$THEME_DIR/patterns/" 2>/dev/null | wc -l | xargs)
  HEX_VIOLATIONS="${HEX_LINES:-0}"
  if [ "$HEX_VIOLATIONS" -gt 0 ] 2>/dev/null; then
    warn "$HEX_VIOLATIONS lines with potential hardcoded hex colors in patterns"
  else
    pass "No hardcoded hex colors in patterns"
  fi
else
  warn "No patterns/ directory found"
fi

# ─── 7. PressPilot footer credit ───
echo "▸ Check 7: PressPilot footer credit"
if [ -f "$THEME_DIR/parts/footer.html" ]; then
  if grep -qi "presspilot" "$THEME_DIR/parts/footer.html"; then
    pass "Footer contains PressPilot credit"
  else
    warn "Footer missing PressPilot credit"
  fi
fi

# ─── 8. Global pattern linter (skeleton + proven-cores) ───
echo "▸ Check 8: Global pattern linter"
if [ -f "tools/lint-patterns.sh" ]; then
  if bash tools/lint-patterns.sh > /dev/null 2>&1; then
    pass "lint-patterns.sh passed (0 violations)"
  else
    fail "lint-patterns.sh found violations"
  fi
else
  warn "tools/lint-patterns.sh not found — skipping global lint"
fi

# ─── Summary ───
echo ""
echo "═══════════════════════════════════════════════"
if [ "$ERRORS" -gt 0 ]; then
  red "  FAILED: $ERRORS error(s), $WARNINGS warning(s)"
  echo "═══════════════════════════════════════════════"
  exit 1
else
  green "  PASSED: 0 errors, $WARNINGS warning(s)"
  echo "═══════════════════════════════════════════════"
  exit 0
fi
