# /mnt/skills/user/wordpress-fse-blocks/SKILL.md

**When to use:** Generating WordPress FSE themes, templates, or block markup

**Before generating ANY WordPress block markup:**
1. Read the index: `/path/to/FSE-KNOWLEDGE-BASE-INDEX.md`
2. Identify which blocks you'll use
3. Read the relevant BATCH file(s)
4. Generate markup following exact specifications

**Critical Rules:**
- NEVER guess block markup - always reference the docs
- Check parent-child constraints before nesting blocks
- Apply CSS classes exactly as documented
- Use Block Context API patterns from BATCH 4 and BATCH 6

**File Locations:**
- Fundamentals: `/path/to/FSE-FUNDAMENTALS.md`
- Markup Rules: `/path/to/BLOCK-MARKUP-SPEC.md`
- Block Reference Index: `/path/to/FSE-KNOWLEDGE-BASE-INDEX.md`
- Batch Files: `/path/to/BLOCK-REFERENCE-BATCH-{1-7}.md`
```

### Approach B: Inline Prompting (For Quick Tasks)

For individual theme generation requests:
```
Generate a restaurant theme header.

BEFORE generating markup:
1. Read /path/to/BLOCK-REFERENCE-BATCH-4.md (navigation block)
2. Read /path/to/BLOCK-REFERENCE-BATCH-5.md (site blocks)
3. Follow exact specifications for all blocks

Then generate the header following WordPress FSE standards.