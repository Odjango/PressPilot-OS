# Agent 1: Forensics Report
*Theme*: presspilot-capital-corp-v1
*Date*: 2025-12-16

## 1. OFFENDER: Missing Header
**File**: `templates/front-page.html`
**Block**: *Missing*
**Issue**: The file begins with `<!-- wp:group {"tagName":"main" ...} -->`. It completely ignores the standard header template part.
**Visual Impact**: User sees no header on front page.

## 2. OFFENDER: Hero Group
**File**: `templates/front-page.html`
**Block**: `core/group` (Line 4)
**Attributes**: `{"align":"full","backgroundColor":"tertiary","layout":{"type":"constrained"}}`
**InnerHTML Snippet**:
```html
<div class="wp-block-group alignfull has-tertiary-background-color has-background">
    <!-- wp:columns {"align":"wide"} -->
```
**Expected vs Actual Mismatch**: 
WordPress `core/group` with `layout: constrained` often expects a nested inner container logic or specific class combinations (`is-layout-constrained`) that change dynamically. Hardcoding `<div class="wp-block-group alignfull ...">` virtually guarantees an "Attempt Recovery" error when the Block Editor tries to re-serialize the attributes and finds a mismatch in classes or structure.

## 3. OFFENDER: Columns Wrapper
**File**: `templates/front-page.html`
**Block**: `core/columns` (Line 6)
**Attributes**: `{"align":"wide"}`
**InnerHTML Snippet**:
```html
<div class="wp-block-columns alignwide">
    <!-- wp:column {"width":"60%"} -->
```
**Mismatch**: Similary, `core/columns` often manages its own flex/grid classes (`is-layout-flex`, etc.). Hardcoded wrappers are brittle.

## 4. Recommendation (Agent 2)
**Stop emitting manual wrapper HTML.**
For `core/group`, `core/columns`, etc., emit **ONLY** the block comments and the inner content.
Example Target:
```html
<!-- wp:group {"align":"full","backgroundColor":"tertiary","layout":{"type":"constrained"}} -->
    <!-- wp:columns {"align":"wide"} -->
        ...
    <!-- /wp:columns -->
<!-- /wp:group -->
```
Let WordPress render the wrappers. This is the **Canonical** way to avoid invalidation.
