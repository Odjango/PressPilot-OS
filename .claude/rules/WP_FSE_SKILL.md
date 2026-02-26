Trigger: “This rule applies ONLY when output includes <!-- wp: markup, templates/.html, parts/.html, patterns/*.php, or theme JSON block style decisions.”

When generating ANY WordPress blocks/templates/patterns:
Read: docs/fse-kb/FSE-KNOWLEDGE-BASE-INDEX.md
Identify blocks you will use
Read relevant batch files in docs/fse-kb/BLOCK-REFERENCE-BATCH-*.md
Generate markup strictly per specs
Critical rules:
Never guess block markup (always reference docs)
Validate parent/child nesting constraints
Apply attributes + classes exactly
Use Block Context API patterns where required

Required output footer (always):
KB Index read: YES
Batch files read: <list>
Blocks used: <list>
Nesting validated: YES
No guessing: YES