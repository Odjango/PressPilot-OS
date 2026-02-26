# BLOCK-MARKUP-SPEC.md
**WordPress Block Serialization Specification for AI Coding Agents**  
*Target: WordPress 6.7+ / Gutenberg Block Parser*

**⚠️ CRITICAL: This is THE document that prevents "Attempt Recovery" errors**

---

## OVERVIEW: Why Block Markup Validation Fails

WordPress blocks are **declarative** and use strict **HTML-based serialization**. The block editor performs **exact string comparison** between:

1. **Saved HTML** (stored in database/template file)
2. **Generated HTML** (from block's `save()` function with current attributes)

**If these don't match EXACTLY → "This block contains unexpected or invalid content" error**

This document specifies the EXACT format WordPress expects.

---

## 1. BLOCK GRAMMAR SYNTAX: THE THREE FORMATS

### Format 1: Wrapper Block (Opening + Closing Comment)

**Structure:**
```
<!-- wp:{namespace}/{blockname} {json-attributes} -->
<html>Inner HTML Content</html>
<!-- /wp:{namespace}/{blockname} -->
```

**Anatomy:**
- **Opening delimiter**: `<!-- wp:`
- **Block identifier**: `{namespace}/{blockname}` (core blocks omit namespace)
- **Attributes** (optional): `{json-object}`
- **Closing opening comment**: ` -->`
- **Inner HTML**: Actual HTML content
- **Opening closing comment**: `<!-- /wp:`
- **Block identifier** (repeated): `{namespace}/{blockname}`
- **Closing delimiter**: ` -->`

**Example (core block - no namespace):**
```html
<!-- wp:paragraph {"align":"center","fontSize":"large"} -->
<p class="has-text-align-center has-large-font-size">Hello World</p>
<!-- /wp:paragraph -->
```

**Example (custom block - with namespace):**
```html
<!-- wp:mytheme/hero {"title":"Welcome"} -->
<div class="wp-block-mytheme-hero">
  <h1>Welcome</h1>
</div>
<!-- /wp:mytheme/hero -->
```

### Format 2: Self-Closing Block (No Inner HTML)

**Structure:**
```
<!-- wp:{namespace}/{blockname} {json-attributes} /-->
```

**Note the `/-->` closing** - this signals "self-closing"

**When to use:** 
- Dynamic blocks (`save: null` in block registration)
- Blocks that generate HTML server-side
- Blocks with no static content to save

**Example (dynamic block):**
```html
<!-- wp:latest-posts {"postsToShow":5} /-->
```

**Example (void block):**
```html
<!-- wp:separator /-->
```

**Example (template part reference):**
```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
```

### Format 3: Self-Closing WITH Void Tag (Hybrid)

Some self-closing blocks include a void HTML element for fallback:

```html
<!-- wp:separator {"className":"is-style-wide"} -->
<hr class="wp-block-separator is-style-wide"/>
<!-- /wp:separator -->
```

**This is still wrapper format** (opening + closing comment) but the inner HTML is a single void tag.

---

## 2. SELF-CLOSING BLOCKS: CRITICAL SYNTAX RULES

### DO: Correct Self-Closing Syntax

```html
✅ <!-- wp:post-title /-->
✅ <!-- wp:post-featured-image /-->
✅ <!-- wp:site-logo /-->
✅ <!-- wp:latest-posts {"postsToShow":3} /-->
```

**Note:** Space before `/-->`

### DON'T: Incorrect Self-Closing Variations

```html
❌ <!-- wp:post-title /> (missing --)
❌ <!-- wp:post-title/--> (missing space before /)
❌ <!-- wp:post-title --> (missing /, not self-closing)
❌ <!---wp:post-title /--> (three hyphens)
```

### Self-Closing vs Wrapper: Decision Rule

**Use SELF-CLOSING when:**
- Block has `save: null` (dynamic rendering)
- Block generates HTML server-side only
- Block has no inner HTML to store

**Use WRAPPER when:**
- Block has static HTML to save
- Block contains nested blocks (innerBlocks)
- Block has any content between delimiters

---

## 3. ATTRIBUTE JSON RULES: STRICT COMPLIANCE REQUIRED

Block attributes are stored as **valid JSON** inside the HTML comment. WordPress uses **JSON.parse()** - any deviation breaks parsing.

### RULE 1: Must Be Valid JSON (Not JavaScript Object Literal)

**VALID JSON:**
```html
✅ <!-- wp:paragraph {"align":"center","fontSize":"large"} -->
✅ <!-- wp:image {"id":123,"sizeSlug":"large","linkDestination":"none"} -->
✅ <!-- wp:group {"layout":{"type":"constrained","wideSize":"1200px"}} -->
```

**INVALID JSON:**
```html
❌ <!-- wp:paragraph {align:"center"} -->           (keys must have quotes)
❌ <!-- wp:paragraph {'align':'center'} -->         (must use double quotes)
❌ <!-- wp:paragraph {"align":"center",} -->        (trailing comma forbidden)
❌ <!-- wp:paragraph {"align":"center", } -->       (trailing comma forbidden)
❌ <!-- wp:image {"id":0x7B} -->                    (hex numbers forbidden)
❌ <!-- wp:button {"text":"Click"} {"style":"bold"} --> (two objects forbidden)
```

### RULE 2: Double Quotes ONLY

```html
✅ {"align":"center"}        (correct)
❌ {'align':'center'}        (single quotes invalid)
❌ {align:"center"}          (unquoted keys invalid)
```

**Why:** JSON spec requires double quotes. JavaScript allows single quotes, but JSON does NOT.

### RULE 3: No Trailing Commas

```html
✅ {"align":"center","fontSize":"large"}      (correct)
❌ {"align":"center","fontSize":"large",}     (trailing comma forbidden)
❌ {"align":"center", "fontSize":"large",}    (trailing comma forbidden)
```

**Why:** JSON spec forbids trailing commas. JavaScript allows them (ES5+), but JSON does NOT.

### RULE 4: Nested Objects Must Be Valid JSON

```html
✅ {"layout":{"type":"constrained","contentSize":"840px"}}
✅ {"style":{"color":{"background":"#000000"}}}
❌ {"layout":{type:"constrained"}}              (unquoted key)
❌ {"style":{"color":{"background":"#000",}}}   (trailing comma)
```

### RULE 5: Arrays Must Be Valid JSON

```html
✅ {"categories":["news","sports"]}
✅ {"ids":[1,2,3]}
❌ {"categories":["news","sports",]}     (trailing comma)
❌ {"ids":[1,2,3,]}                      (trailing comma)
```

### RULE 6: Special Characters Must Be Escaped

WordPress automatically escapes certain characters to prevent HTML comment breakage:

**Automatic escaping (WordPress handles this):**
```javascript
// WordPress serialization function:
JSON.stringify(attributes)
  .replace(/--/g, '\\u002d\\u002d')      // Escape -- (HTML comment delimiter)
  .replace(/</g, '\\u003c')              // Escape <
  .replace(/>/g, '\\u003e')              // Escape >
  .replace(/&/g, '\\u0026')              // Escape &
  .replace(/\\"/g, '\\u0022')            // Escape \"
```

**What you'll see in serialized blocks:**
```html
<!-- wp:paragraph {"content":"This has \u002d\u002d dashes"} -->
```

**Don't manually create these escapes** - let WordPress serialize attributes through `JSON.stringify()`.

### RULE 7: Booleans and Numbers (No Quotes)

```html
✅ {"showTitle":true}              (boolean, no quotes)
✅ {"postsToShow":5}              (number, no quotes)
✅ {"width":100.5}                (float, no quotes)
❌ {"showTitle":"true"}           (string "true", not boolean)
❌ {"postsToShow":"5"}            (string "5", not number)
```

**Type matters:** WordPress validates attribute types match block schema.

### RULE 8: Null is Valid

```html
✅ {"customValue":null}
❌ {"customValue":"null"}          (string "null", not null)
```

### RULE 9: Empty Attributes

**If block has NO custom attributes, OMIT the JSON object entirely:**

```html
✅ <!-- wp:paragraph -->
❌ <!-- wp:paragraph {} -->        (WordPress omits empty objects)
```

**Exception:** Some blocks save `{}` for empty attributes. Copy EXACTLY what WordPress editor generates.

---

## 4. HOW WORDPRESS VALIDATES BLOCKS (THE CRITICAL MECHANISM)

### The Validation Process

**On page load, for EVERY block, WordPress:**

1. **Parses** the serialized block markup from database/template
2. **Extracts** block name and attributes from HTML comment
3. **Calls** the block's `save()` function with extracted attributes
4. **Compares** the generated HTML to the original saved HTML
5. **Validates** using `isEquivalentHTML()` comparison

**Validation code (from Gutenberg source):**

```javascript
// packages/blocks/src/api/validation/index.js
function validateBlock(block, blockType) {
  // Generate what the block SHOULD look like with current save() function
  const generatedBlockContent = getSaveContent(blockType, block.attributes);
  
  // Compare to what's actually saved in database
  const isValid = isEquivalentHTML(
    block.originalContent,      // From database/template
    generatedBlockContent,      // From save() function
    logger
  );
  
  if (!isValid) {
    // TRIGGER "Attempt Recovery" error
    logger.error(
      'Block validation failed for `%s`.\n\n' +
      'Content generated by `save` function:\n%s\n\n' +
      'Content retrieved from post body:\n%s',
      blockType.name,
      generatedBlockContent,
      block.originalContent
    );
  }
  
  return [isValid, logger.getItems()];
}
```

### What `isEquivalentHTML()` Actually Checks

**WordPress compares:**

✅ **HTML structure** (tags, nesting, order)  
✅ **Attribute names and values** (exact match)  
✅ **Text content** (exact match)  
✅ **Class names** (order doesn't matter, but all must match)  
⚠️ **Some whitespace** (see whitespace section)  
❌ **NOT** checking visual appearance  
❌ **NOT** checking functionality

**Example validation failure:**

```javascript
// Saved in database:
<p class="has-text-align-center">Hello</p>

// Generated by save() function:
<p class="has-text-align-center has-large-font-size">Hello</p>

// Result: INVALID - missing class in database version
```

### Critical Insight: Why Blocks Break

**Common scenario causing validation errors:**

1. User saves a block → `save()` function generates HTML → Stored in database
2. Developer updates the block code → `save()` function now generates DIFFERENT HTML
3. User edits the post → WordPress compares old HTML to new `save()` output → **MISMATCH**
4. WordPress shows "Attempt Recovery" error

**This is why** even trivial changes to `save()` break all existing blocks of that type.

---

## 5. NESTING RULES AND INNERBLOCKS STRUCTURE

### Nested Blocks Syntax

**Parent block wraps child blocks:**

```html
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
  
  <!-- wp:paragraph -->
  <p>Child block 1</p>
  <!-- /wp:paragraph -->
  
  <!-- wp:paragraph -->
  <p>Child block 2</p>
  <!-- /wp:paragraph -->
  
</div>
<!-- /wp:group -->
```

### InnerBlocks Placement Rules

**RULE 1:** Inner blocks go INSIDE the parent block's HTML wrapper

```html
✅ CORRECT:
<!-- wp:columns -->
<div class="wp-block-columns">
  <!-- wp:column -->
  <div class="wp-block-column">
    <!-- Inner content -->
  </div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->

❌ WRONG:
<!-- wp:columns -->
<div class="wp-block-columns"></div>
<!-- /wp:columns -->
<!-- wp:column --> (Outside parent - invalid)
<div class="wp-block-column"></div>
<!-- /wp:column -->
```

**RULE 2:** Inner blocks MUST close before parent closes

```html
✅ CORRECT order:
<!-- wp:group -->
  <!-- wp:paragraph -->
  <p>Text</p>
  <!-- /wp:paragraph -->  ← Child closes
<!-- /wp:group -->         ← Parent closes

❌ WRONG order:
<!-- wp:group -->
  <!-- wp:paragraph -->
  <p>Text</p>
<!-- /wp:group -->         ← Parent closes too early
  <!-- /wp:paragraph -->  ← Child tries to close after parent
```

### InnerHTML vs InnerBlocks

**WordPress parser extracts TWO types of content:**

1. **innerHTML**: Static HTML BETWEEN block markers (no nested blocks)
2. **innerBlocks**: Nested block structures WITHIN parent block

**Example breakdown:**

```html
<!-- wp:group -->
<div class="wp-block-group">
  <p>This is innerHTML</p>        ← Part of parent's innerHTML
  
  <!-- wp:paragraph -->            ← Start of innerBlocks
  <p>This is a child block</p>
  <!-- /wp:paragraph -->           ← End of innerBlocks
  
  <p>More innerHTML</p>            ← Back to parent's innerHTML
</div>
<!-- /wp:group -->
```

**Parser logic:**
- Content OUTSIDE nested block comments → parent's innerHTML
- Content INSIDE nested block comments → innerBlocks

---

## 6. COMMON SERIALIZATION MISTAKES THAT TRIGGER RECOVERY ERRORS

### Mistake #1: Adding/Removing HTML Elements

```html
❌ OLD (saved in database):
<!-- wp:button -->
<div class="wp-block-button">
  <a class="wp-block-button__link">Click</a>
</div>
<!-- /wp:button -->

❌ NEW (from updated save() function):
<!-- wp:button -->
<div class="wp-block-button">
  <span class="button-wrapper">        ← Added wrapper
    <a class="wp-block-button__link">Click</a>
  </span>
</div>
<!-- /wp:button -->

🚫 RESULT: Validation error - HTML structure changed
```

**Solution:** Use block deprecations to handle structure changes.

### Mistake #2: Changing Class Names

```html
❌ OLD:
<!-- wp:paragraph -->
<p class="my-paragraph">Text</p>
<!-- /wp:paragraph -->

❌ NEW:
<!-- wp:paragraph -->
<p class="custom-paragraph">Text</p>  ← Changed class
<!-- /wp:paragraph -->

🚫 RESULT: Validation error - className mismatch
```

### Mistake #3: Changing Attribute Order

**Attributes in HTML:**

```html
✅ SAFE - Attribute order doesn't matter in HTML:
<img src="image.jpg" alt="Photo"/>
<img alt="Photo" src="image.jpg"/>
(These validate as equivalent)

✅ SAFE - Class order doesn't matter:
<p class="align-center large-text"/>
<p class="large-text align-center"/>
(These validate as equivalent)
```

**Attributes in JSON comment:**

```html
⚠️ JSON attribute order MIGHT matter (implementation dependent):
<!-- wp:image {"id":123,"sizeSlug":"large"} -->
<!-- wp:image {"sizeSlug":"large","id":123} -->

(Best practice: Keep consistent order, but WordPress generally handles this)
```

### Mistake #4: Whitespace in Inner HTML (See Section 7)

```html
❌ OLD:
<!-- wp:paragraph -->
<p>Text</p>
<!-- /wp:paragraph -->

❌ NEW:
<!-- wp:paragraph -->
<p>
  Text
</p>
<!-- /wp:paragraph -->

🚫 RESULT: Validation error - whitespace changed
```

### Mistake #5: Changing Text Content Via Save Function

```html
❌ WRONG - Dynamic text in save():
save: ({ attributes }) => {
  return (
    <p>
      Today is {new Date().toLocaleDateString()}
    </p>
  );
}
// Every day this generates different HTML → validation fails
```

**Solution:** Use dynamic blocks (`save: null`) for any dynamic content.

### Mistake #6: Using Conditional Logic in Save Function

```html
❌ WRONG:
save: ({ attributes }) => {
  return (
    <div>
      {attributes.showTitle && <h2>{attributes.title}</h2>}
      <p>{attributes.content}</p>
    </div>
  );
}
// Generates different HTML based on showTitle → causes validation errors
```

**Solution:** Always render all possible elements, use CSS to hide/show.

### Mistake #7: Missing Closing Comments

```html
❌ WRONG:
<!-- wp:paragraph -->
<p>Text</p>
(Missing closing comment)

✅ CORRECT:
<!-- wp:paragraph -->
<p>Text</p>
<!-- /wp:paragraph -->
```

### Mistake #8: Malformed Self-Closing Syntax

```html
❌ WRONG variations:
<!-- wp:separator/>          (missing space)
<!-- wp:separator / -->      (space in wrong place)
<!-- wp:separator --->       (too many hyphens)

✅ CORRECT:
<!-- wp:separator /-->       (space before /-->)
```

### Mistake #9: Invalid JSON in Attributes

```html
❌ WRONG - Trailing comma:
<!-- wp:paragraph {"align":"center",} -->

❌ WRONG - Single quotes:
<!-- wp:paragraph {'align':'center'} -->

❌ WRONG - Unquoted keys:
<!-- wp:paragraph {align:"center"} -->

✅ CORRECT:
<!-- wp:paragraph {"align":"center"} -->
```

### Mistake #10: HTML Entities in Attributes

```html
❌ PROBLEMATIC:
<!-- wp:paragraph {"content":"Hello &amp; goodbye"} -->

✅ BETTER - Use Unicode escapes:
<!-- wp:paragraph {"content":"Hello \u0026 goodbye"} -->

✅ BEST - Store in innerHTML, not attributes:
<!-- wp:paragraph -->
<p>Hello &amp; goodbye</p>
<!-- /wp:paragraph -->
```

---

## 7. WHITESPACE SENSITIVITY: WHERE IT MATTERS

### Where Whitespace DOES Matter (Validation Fails)

**Inside text content:**

```html
❌ Different:
<!-- wp:paragraph --><p>Hello</p><!-- /wp:paragraph -->
<!-- wp:paragraph --><p> Hello </p><!-- /wp:paragraph -->

🚫 Leading/trailing spaces cause validation error
```

**Newlines inside inline elements:**

```html
❌ Different:
<p>Hello World</p>
<p>Hello
World</p>

🚫 Newline causes validation error
```

**Newlines affecting text:**

```html
❌ Different:
<div class="content">
  <p>Text</p>
</div>

vs.

<div class="content"><p>Text</p></div>

⚠️ MAY cause validation error depending on context
```

### Where Whitespace DOESN'T Matter (Validation Passes)

**Between block-level elements:**

```html
✅ Equivalent:
<div><p>Text</p></div>

<div>
  <p>Text</p>
</div>

<div>

  <p>Text</p>

</div>
```

**In HTML comment delimiters:**

```html
✅ Equivalent:
<!-- wp:paragraph -->
<!--wp:paragraph-->
<!-- wp:paragraph  -->

⚠️ But stick to standard: <!-- wp:paragraph -->
```

**Around self-closing blocks:**

```html
✅ Equivalent:
<!-- wp:separator /-->
<!--wp:separator /-->

⚠️ But standard format: <!-- wp:separator /-->
```

### Whitespace Best Practices

**DO:**
- ✅ Be consistent with indentation
- ✅ Use newlines between blocks for readability
- ✅ Match the whitespace WordPress editor generates

**DON'T:**
- ❌ Add extra spaces inside text content
- ❌ Add newlines inside inline elements
- ❌ Mix tabs and spaces inconsistently
- ❌ Rely on whitespace to "fix" layout (use CSS)

### Practical Rule

**COPY EXACT WHITESPACE from WordPress editor output**

Use Code Editor view (Ctrl+Shift+Alt+M) to see EXACTLY how WordPress formats blocks, then match that formatting.

---

## 8. SPECIAL CHARACTERS: CONTENT VS ATTRIBUTES

### In Block Attributes (JSON String Values)

**Special characters are automatically escaped by WordPress:**

```javascript
// You provide:
attributes: { content: 'Use "quotes" and <tags>' }

// WordPress serializes to:
{"content":"Use \u0022quotes\u0022 and \u003ctags\u003e"}
```

**Manually escape for JSON:**

```javascript
// JavaScript:
JSON.stringify({ text: 'Line 1\nLine 2' })
// Result: {"text":"Line 1\nLine 2"}

// Backslash: must be double-escaped
JSON.stringify({ path: 'C:\\Users\\Name' })
// Result: {"path":"C:\\\\Users\\\\Name"}
```

**Do NOT manually create escapes** - use JSON.stringify() and let WordPress handle serialization.

### In Inner HTML Content

**HTML entities work normally:**

```html
<!-- wp:paragraph -->
<p>Copyright &copy; 2025 &mdash; All rights reserved</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Less than: &lt; Greater than: &gt; Ampersand: &amp;</p>
<!-- /wp:paragraph -->
```

**Special characters to entity-encode:**

| Character | Entity | Use When |
|-----------|--------|----------|
| < | `&lt;` | In text content |
| > | `&gt;` | In text content |
| & | `&amp;` | In text content |
| " | `&quot;` | In attribute values |
| ' | `&apos;` or `&#39;` | In attribute values |

**Em dashes, quotes, symbols:**

```html
✅ Use HTML entities:
<p>&ldquo;Quoted text&rdquo;</p>
<p>&mdash; Em dash &mdash;</p>
<p>Bullet: &bull;</p>

✅ Or Unicode directly (if UTF-8 encoded):
<p>"Quoted text"</p>
<p>— Em dash —</p>
<p>Bullet: •</p>
```

### Apostrophes (The Common Mistake)

**Problem case:**

```html
❌ CAUSES ISSUE:
<!-- wp:paragraph -->
<p>It's a beautiful day</p>
<!-- /wp:paragraph -->

When saved to database, might become:
<p>It&#039;s a beautiful day</p>

Then validation fails because ' !== &#039;
```

**Solutions:**

```html
✅ Option 1 - Use entity in source:
<!-- wp:paragraph -->
<p>It&apos;s a beautiful day</p>
<!-- /wp:paragraph -->

✅ Option 2 - Use HTML5 entity:
<!-- wp:paragraph -->
<p>It&#39;s a beautiful day</p>
<!-- /wp:paragraph -->

✅ Option 3 - Use straight apostrophe (not curly):
<!-- wp:paragraph -->
<p>It's a beautiful day</p>
<!-- /wp:paragraph -->
(Safer than curly quotes)
```

### Characters That Break HTML Comments

**These MUST be escaped in attributes:**

```html
❌ BREAKS HTML COMMENT:
<!-- wp:paragraph {"title":"Use -- dashes"} -->
(The -- breaks out of HTML comment)

✅ CORRECT (WordPress auto-escapes):
<!-- wp:paragraph {"title":"Use \u002d\u002d dashes"} -->
```

**WordPress escapes automatically (you don't need to):**
- `--` → `\u002d\u002d`
- `<` → `\u003c`
- `>` → `\u003e`
- `&` → `\u0026`

---

## 9. COMPLETE VALIDATION CHECKLIST

Before using ANY block markup in theme templates, verify:

### Block Comment Structure

- [ ] Opening comment format: `<!-- wp:{namespace}/{blockname}`
- [ ] Core blocks omit namespace: `<!-- wp:paragraph` (not `<!-- wp:core/paragraph`)
- [ ] Custom blocks include namespace: `<!-- wp:mytheme/blockname`
- [ ] Self-closing uses `/-->`: `<!-- wp:separator /-->`
- [ ] Wrapper blocks have closing comment: `<!-- /wp:paragraph -->`
- [ ] Block name matches in opening and closing comments

### JSON Attributes

- [ ] Valid JSON (no single quotes, no trailing commas)
- [ ] Double quotes around keys: `{"align":"center"}`
- [ ] Double quotes around string values: `{"title":"Hello"}`
- [ ] Numbers without quotes: `{"count":5}`
- [ ] Booleans without quotes: `{"enabled":true}`
- [ ] No trailing commas: `{"a":1,"b":2}` not `{"a":1,"b":2,}`
- [ ] Nested objects properly formatted
- [ ] Arrays properly formatted
- [ ] Special characters escaped (WordPress handles this)

### Inner HTML

- [ ] HTML is valid and well-formed
- [ ] All opening tags have closing tags (except void elements)
- [ ] Attributes use double quotes: `<img src="photo.jpg"/>`
- [ ] Special characters entity-encoded where needed
- [ ] Whitespace matches WordPress editor output
- [ ] No extra newlines inside inline elements
- [ ] Class names match save() function output

### Nesting

- [ ] Inner blocks placed INSIDE parent block HTML wrapper
- [ ] Inner blocks close BEFORE parent block closes
- [ ] Nesting level is logical and matches block structure

### Self-Closing Blocks

- [ ] Correct syntax: `<!-- wp:blockname /-->`
- [ ] Space before `/-->`
- [ ] Used ONLY for dynamic blocks or void blocks
- [ ] No closing comment after self-closing block

### Dynamic Blocks

- [ ] Use self-closing format
- [ ] Attributes stored in JSON comment
- [ ] No innerHTML (server renders content)
- [ ] Block registered with `save: null`

---

## 10. HOW TO VERIFY BLOCK MARKUP IS CORRECT

### Method 1: Use WordPress Editor (Recommended)

1. **Add block in WordPress editor** (Post or Site Editor)
2. **Configure block** with desired settings
3. **Switch to Code Editor** (Ctrl+Shift+Alt+M or Shift+Option+Command+M)
4. **Copy EXACT markup** WordPress generates
5. **Paste into template file**

**This is the ONLY guaranteed way to get correct markup.**

### Method 2: Check in Browser Console

When validation fails, WordPress logs details to console:

```javascript
// Check console for:
"Block validation failed for `core/paragraph`"
"Content generated by `save` function: [HTML]"
"Content retrieved from post body: [HTML]"

// Compare the two HTML outputs to find differences
```

### Method 3: Use Block Validation Tools

WordPress provides debugging in console. Look for:

```javascript
// From Post Content (what's saved):
block.originalContent

// From Save Function (what's expected):
generatedBlockContent

// Validation result:
isValid: true/false
```

### Method 4: Test in Isolated Environment

1. **Create a test page** in WordPress
2. **Add your block** with exact attributes you need
3. **Save and reload**
4. **Check for "Attempt Recovery"** error
5. **If error appears**, compare console output

### Method 5: Diff Comparison

**When validation fails, compare:**

```
Original (from database):
<p class="text-center">Hello</p>

Generated (from save function):
<p class="has-text-align-center">Hello</p>

Difference: class name changed
```

**Fix:** Update save() function to use EXACT class name, or use deprecations.

---

## 11. CRITICAL RULES SUMMARY FOR AI AGENTS

### NEVER Guess Block Markup

❌ **DON'T:** Create block markup from memory or assumption  
✅ **DO:** Copy EXACT markup from WordPress editor

### NEVER Mix Block Types

❌ **DON'T:** Use PHP template tags in block templates  
✅ **DO:** Use only block comment + HTML format

### ALWAYS Match Save Function

❌ **DON'T:** Manually write markup different from save() output  
✅ **DO:** Ensure markup exactly matches what save() generates

### ALWAYS Use Valid JSON

❌ **DON'T:** Use JavaScript object literal syntax  
✅ **DO:** Use strict JSON (double quotes, no trailing commas)

### ALWAYS Preserve Whitespace

❌ **DON'T:** Add random newlines/spaces  
✅ **DO:** Match whitespace from WordPress editor exactly

### ALWAYS Close Blocks Properly

❌ **DON'T:** Forget closing comments  
✅ **DO:** Every `<!-- wp:block -->` needs `<!-- /wp:block -->`

### ALWAYS Use Self-Closing for Dynamic Blocks

❌ **DON'T:** Use wrapper format for blocks with `save: null`  
✅ **DO:** Use `<!-- wp:blockname /-->` for dynamic blocks

---

## 12. DEBUGGING VALIDATION ERRORS

### Step 1: Identify the Failing Block

WordPress shows which block type failed:
```
"This block contains unexpected or invalid content"
Block: core/paragraph
```

### Step 2: Open Browser Console

Look for detailed error:
```javascript
Block validation failed for `core/paragraph` (Object).

Content generated by `save` function:
<p class="has-text-align-center">Text</p>

Content retrieved from post body:
<p class="text-center">Text</p>
```

### Step 3: Compare HTML

Differences that cause validation errors:
- Class name changed
- Attribute added/removed
- HTML tag changed
- Text content changed
- Whitespace changed

### Step 4: Fix the Issue

**Option A:** Update save() function to match database content (requires deprecation)  
**Option B:** Update database content to match new save() function (data migration)  
**Option C:** Use block deprecations to handle both versions

### Common Fixes

**Deprecated class name:**
```javascript
// Add deprecation in block registration:
deprecated: [
  {
    attributes: { /* old attributes */ },
    save: ({ attributes }) => {
      return <p className="text-center">{attributes.content}</p>;
    }
  }
]
```

**Changed HTML structure:**
```javascript
deprecated: [
  {
    attributes: { /* old attributes */ },
    save: ({ attributes }) => {
      // Old structure without wrapper
      return <p>{attributes.content}</p>;
    }
  }
]
```

---

## FINAL CHECKLIST FOR AI AGENTS

When generating block markup for WordPress themes:

1. ✅ **Source:** Get markup from WordPress editor Code view
2. ✅ **Format:** Use exact block comment syntax (`<!-- wp:blockname -->`)
3. ✅ **JSON:** Validate all attributes are valid JSON
4. ✅ **Quotes:** Use double quotes only
5. ✅ **Commas:** No trailing commas
6. ✅ **Whitespace:** Match editor output exactly
7. ✅ **Entities:** Encode special characters in HTML
8. ✅ **Closing:** All blocks properly closed
9. ✅ **Nesting:** Inner blocks inside parent wrapper
10. ✅ **Dynamic:** Self-closing format for dynamic blocks

**If you violate any of these rules → "Attempt Recovery" error appears**

---

*Document version: 1.0*  
*Last updated: February 2025*  
*Based on: WordPress 6.7+ / Gutenberg Block Serialization Parser*  
*Source: @wordpress/block-serialization-default-parser*
