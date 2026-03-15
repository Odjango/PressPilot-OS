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
# 3. wp:spacer blocks with var:preset|spacing|* in height attribute (invalid block grammar)
# 4. Buttons missing wp-element-button class (required by WP 6.1+ save() function)
# 5. Headings missing wp-block-heading class (required by WP 6.x+ save() function)
# 6. Separators missing opacity class (required by separator save() function)
# 7. Using iconColorValue/iconBackgroundColorValue (banned - use semantic slugs instead)
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
declare -a SPACER_VIOLATIONS=()
declare -a BUTTON_CLASS_VIOLATIONS=()
declare -a HEADING_CLASS_VIOLATIONS=()
declare -a SEPARATOR_OPACITY_VIOLATIONS=()
declare -a ICON_COLOR_VALUE_VIOLATIONS=()

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

    # Check for invalid wp:spacer blocks using var:preset|spacing|* in height attribute
    if grep -n 'wp:spacer.*"height":"var:preset|spacing|' "$file" 2>/dev/null | head -1 | grep -q .; then
        # Get the line number of the first occurrence
        local line_number=$(grep -n 'wp:spacer.*"height":"var:preset|spacing|' "$file" | head -1 | cut -d: -f1)
        SPACER_VIOLATIONS+=("$relative_path:$line_number")
    fi

    # Check for buttons missing wp-element-button class
    if grep -q 'class="wp-block-button__link' "$file" 2>/dev/null; then
        if grep 'class="wp-block-button__link' "$file" | grep -v 'wp-element-button' > /dev/null 2>&1; then
            BUTTON_CLASS_VIOLATIONS+=("$relative_path")
        fi
    fi

    # Check for headings missing wp-block-heading class
    if grep -q 'wp:heading' "$file" 2>/dev/null; then
        if grep -A1 'wp:heading' "$file" | grep '<h[1-6]' | grep -v 'wp-block-heading' > /dev/null 2>&1; then
            HEADING_CLASS_VIOLATIONS+=("$relative_path")
        fi
    fi

    # Check for separators missing opacity class
    if grep -q '<hr class="wp-block-separator' "$file" 2>/dev/null; then
        if grep '<hr class="wp-block-separator' "$file" | grep -v 'has-alpha-channel-opacity\|has-css-opacity' > /dev/null 2>&1; then
            SEPARATOR_OPACITY_VIOLATIONS+=("$relative_path")
        fi
    fi

    # Check for banned iconColorValue/iconBackgroundColorValue
    if grep -q 'iconColorValue\|iconBackgroundColorValue' "$file" 2>/dev/null; then
        ICON_COLOR_VALUE_VIOLATIONS+=("$relative_path")
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

# Scan tokenized patterns (SSWG-generated patterns)
echo "Scanning tokenized patterns..."
if [ -d "$REPO_ROOT/pattern-library/tokenized" ]; then
    for core_dir in "$REPO_ROOT/pattern-library/tokenized"/*; do
        if [ -d "$core_dir" ]; then
            core_name=$(basename "$core_dir")
            echo "  - $core_name"
            while IFS= read -r -d '' file; do
                scan_file "$file"
            done < <(find "$core_dir" -type f -name "*.php" -print0)
        fi
    done
else
    echo -e "${YELLOW}Warning: pattern-library/tokenized/ directory not found${NC}"
fi

# Scan proven-cores patterns (original theme files - read-only reference)
echo "Scanning proven-cores patterns (reference only)..."
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

# Report spacer violations
if [ ${#SPACER_VIOLATIONS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Invalid wp:spacer blocks found (${#SPACER_VIOLATIONS[@]} files):${NC}"
    for violation in "${SPACER_VIOLATIONS[@]}"; do
        echo "   $violation"
    done
    echo ""
else
    echo -e "${GREEN}✓ No invalid spacer blocks${NC}"
fi

# Report button class violations
if [ ${#BUTTON_CLASS_VIOLATIONS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Buttons missing wp-element-button class (${#BUTTON_CLASS_VIOLATIONS[@]} files):${NC}"
    for violation in "${BUTTON_CLASS_VIOLATIONS[@]}"; do
        echo "   $violation"
    done
    echo ""
else
    echo -e "${GREEN}✓ All buttons have wp-element-button class${NC}"
fi

# Report heading class violations
if [ ${#HEADING_CLASS_VIOLATIONS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Headings missing wp-block-heading class (${#HEADING_CLASS_VIOLATIONS[@]} files):${NC}"
    for violation in "${HEADING_CLASS_VIOLATIONS[@]}"; do
        echo "   $violation"
    done
    echo ""
else
    echo -e "${GREEN}✓ All headings have wp-block-heading class${NC}"
fi

# Report separator opacity violations
if [ ${#SEPARATOR_OPACITY_VIOLATIONS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Separators missing opacity class (${#SEPARATOR_OPACITY_VIOLATIONS[@]} files):${NC}"
    for violation in "${SEPARATOR_OPACITY_VIOLATIONS[@]}"; do
        echo "   $violation"
    done
    echo ""
else
    echo -e "${GREEN}✓ All separators have opacity class${NC}"
fi

# Report iconColorValue violations
if [ ${#ICON_COLOR_VALUE_VIOLATIONS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Using banned iconColorValue (${#ICON_COLOR_VALUE_VIOLATIONS[@]} files):${NC}"
    for violation in "${ICON_COLOR_VALUE_VIOLATIONS[@]}"; do
        echo "   $violation"
    done
    echo ""
else
    echo -e "${GREEN}✓ No iconColorValue violations${NC}"
fi

# Exit with error if any violations found
TOTAL_VIOLATIONS=$((${#NAV_REF_VIOLATIONS[@]} + ${#HEX_COLOR_VIOLATIONS[@]} + ${#SPACER_VIOLATIONS[@]} + ${#BUTTON_CLASS_VIOLATIONS[@]} + ${#HEADING_CLASS_VIOLATIONS[@]} + ${#SEPARATOR_OPACITY_VIOLATIONS[@]} + ${#ICON_COLOR_VALUE_VIOLATIONS[@]}))

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
    echo "3. Invalid spacer: Use px values in height attribute (e.g., {\"height\":\"48px\",\"style\":{\"layout\":{}}})"
    echo "4. Button class: Add 'wp-element-button' to all <a class=\"wp-block-button__link\"> elements"
    echo "5. Heading class: Add 'wp-block-heading' to all <h1>-<h6> tags in wp:heading blocks"
    echo "6. Separator opacity: Add 'has-alpha-channel-opacity' or 'has-css-opacity' to <hr> separators"
    echo "7. iconColorValue: Replace with semantic slugs (iconColor, iconBackgroundColor)"
    exit 1
fi
