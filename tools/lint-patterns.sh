#!/usr/bin/env bash
#
# Pattern Linter - Detects banned patterns in WordPress FSE pattern files
#
# Scans all pattern files in:
# - pattern-library/skeletons/
# - proven-cores/*/patterns/
#
# Violations:
# 1. wp:navigation blocks with ref attribute (causes broken menus in generated themes)
# 2. Hardcoded hex colors (#RRGGBB) instead of theme.json tokens
#
# Exit codes:
# 0 - All patterns pass
# 1 - Violations found

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory (works even if called from elsewhere)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "PressPilot Pattern Linter"
echo "========================="
echo ""

# Arrays to store violations
declare -a NAV_REF_VIOLATIONS=()
declare -a HEX_COLOR_VIOLATIONS=()

# Counter for total files scanned
TOTAL_FILES=0

# Function to scan a single file
scan_file() {
    local file="$1"
    local relative_path="${file#$REPO_ROOT/}"

    TOTAL_FILES=$((TOTAL_FILES + 1))

    # Check for wp:navigation with ref attribute
    if grep -q 'wp:navigation.*"ref":' "$file" 2>/dev/null; then
        NAV_REF_VIOLATIONS+=("$relative_path")
    fi

    # Check for hardcoded hex colors (#RRGGBB or #RGB)
    # Exclude common WordPress color values that are intentionally hardcoded in core
    if grep -q '#[0-9a-fA-F]\{6\}' "$file" 2>/dev/null; then
        # Get the hex colors found
        local hex_colors=$(grep -o '#[0-9a-fA-F]\{6\}' "$file" | sort -u | tr '\n' ' ')
        HEX_COLOR_VIOLATIONS+=("$relative_path (colors: $hex_colors)")
    fi
}

# Scan skeleton patterns
echo "Scanning skeleton patterns..."
if [ -d "$REPO_ROOT/pattern-library/skeletons" ]; then
    while IFS= read -r -d '' file; do
        scan_file "$file"
    done < <(find "$REPO_ROOT/pattern-library/skeletons" -type f -name "*.html" -print0)
else
    echo -e "${YELLOW}Warning: pattern-library/skeletons/ directory not found${NC}"
fi

# Scan proven-cores patterns
echo "Scanning proven-cores patterns..."
if [ -d "$REPO_ROOT/proven-cores" ]; then
    for core_dir in "$REPO_ROOT/proven-cores"/*; do
        if [ -d "$core_dir/patterns" ]; then
            core_name=$(basename "$core_dir")
            echo "  - $core_name"
            while IFS= read -r -d '' file; do
                scan_file "$file"
            done < <(find "$core_dir/patterns" -type f -name "*.php" -print0)
        fi
    done
else
    echo -e "${YELLOW}Warning: proven-cores/ directory not found${NC}"
fi

echo ""
echo "Scan Results"
echo "============"
echo "Total files scanned: $TOTAL_FILES"
echo ""

# Report navigation ref violations
if [ ${#NAV_REF_VIOLATIONS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Navigation ref violations found (${#NAV_REF_VIOLATIONS[@]} files):${NC}"
    for violation in "${NAV_REF_VIOLATIONS[@]}"; do
        echo "   $violation"
    done
    echo ""
else
    echo -e "${GREEN}✓ No navigation ref violations${NC}"
fi

# Report hex color violations
if [ ${#HEX_COLOR_VIOLATIONS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠ Hardcoded hex colors found (${#HEX_COLOR_VIOLATIONS[@]} files):${NC}"
    for violation in "${HEX_COLOR_VIOLATIONS[@]}"; do
        echo "   $violation"
    done
    echo ""
else
    echo -e "${GREEN}✓ No hardcoded hex colors${NC}"
fi

# Exit with error if any violations found
TOTAL_VIOLATIONS=$((${#NAV_REF_VIOLATIONS[@]} + ${#HEX_COLOR_VIOLATIONS[@]}))

echo ""
if [ $TOTAL_VIOLATIONS -eq 0 ]; then
    echo -e "${GREEN}✓ All patterns pass linting!${NC}"
    exit 0
else
    echo -e "${RED}✗ Found $TOTAL_VIOLATIONS violation(s)${NC}"
    echo ""
    echo "Fix violations:"
    echo "1. Navigation ref: Remove 'ref' attribute and add inline navigation-link blocks"
    echo "2. Hex colors: Replace with theme.json color tokens (e.g., var:preset|color|primary)"
    exit 1
fi
