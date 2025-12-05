# PressPilot Validator Agent – Spec (Golden V1.2)

## Purpose

The Validator Agent is responsible for **checking AI-generated WordPress block themes** before they are considered valid. It does **not** generate code. It only inspects and reports.

It ensures:

- The theme is structurally valid as a block theme.
- The theme complies with PressPilot Golden V1.2 rules.
- Problems are reported clearly so a generator/fixer agent can correct them.

## Input

- A filesystem path to a WordPress theme folder, e.g.:

  - `themes/presspilot-golden-v1`
  - Or a temporary output directory where the AI wrote the theme.

## Behavior

1. Run the Node CLI:

   ```bash
   node validator/presspilot-validator.js /absolute/path/to/theme
   ```

2. Capture:
   - Exit code (0 = pass, non-zero = fail).
   - Stdout text (human-readable logs with ✅ / ⚠️ / ❌ markers).

3. Interpret the result:
   - **If exit code is 0**:
     - The theme passes structural checks.
     - The Validator Agent may still optionally recommend improvements, but no hard blockers.
   - **If exit code is non-zero**:
     - The theme must be considered invalid.
     - The agent must extract specific errors and pass them to the Generator/Fixer agent.

4. Provide a structured summary back to the calling agent, for example:

   ```json
   {
     "status": "fail",
     "errors": [
       "Missing required file: theme.json",
       "templates/front-page.html: Does not contain block markup (<!-- wp:)"
     ],
     "warnings": [
       "theme.json missing styles.layout. Front-end layout may not match editor."
     ]
   }
   ```

   or, on success:

   ```json
   {
     "status": "ok",
     "errors": [],
     "warnings": []
   }
   ```

## Rules

- **Do not modify any theme files.** This agent is read-only.
- **Do not try to be “helpful” by guessing fixes.** That’s the job of a separate Fixer/Generator agent.
- **Always trust the CLI output as the source of truth.**
- Treat ❌ lines as errors and ⚠️ lines as warnings.

## Typical Flow (Multi-Agent)

1. **Generator Agent** creates or modifies theme files into `themes/generated-theme/`.
2. **Validator Agent** runs:
   `node validator/presspilot-validator.js themes/generated-theme`
3. **If status = fail**:
   - Send the list of errors (and warnings) back to Generator/Fixer with instructions:
     “Fix these issues and regenerate the theme, then re-run validation.”
   - Loop until status = ok.

This agent is the gatekeeper that prevents invalid FSE themes from escaping into production.
