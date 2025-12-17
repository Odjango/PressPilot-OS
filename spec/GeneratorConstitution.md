# PressPilot Generator Constitution (V1.1)

## Preamble
The Generator is a deterministic state machine. It converts a Task Brief into a WordPress Theme. It does not think; it executes.

## Core Laws
1. **The Single-Pass Rule**: Execution is linear. No retry loops. No self-correction.
2. **The Output Determinism Rule**: `f(TaskBrief) -> Hash`. Same input must produce exact same output hash. Timestamps must be frozen.
3. **The Schema Lock Rule**: Only `theme.json` settings defined in the Golden Spec are permitted.
4. **The No-Implicit Rule**: All features must be explicitly requested in the Task Brief.

## Capabilities (Phase 1.5)
- **i18n/RTL**: Controlled by `language` and `direction` fields. Static output must reflect `dir="rtl"`.
- **Dark Mode**: Controlled by `darkMode` field. Must output dual `theme.json` palettes and `styles/dark.json`.
- **Ecommerce**: Controlled by `ecommerce` field. Must output safe patterns only.
- **Business Nav**: Controlled by `businessType`. Must output strict, deterministic navigation links.

## Agent Roles
- **Initializer**: Defines the Spec.
- **Generator**: Executes the Spec (Blindly).
- **Validator**: Audits the Output (Ruthlessly).
- **Observer**: Certifies the Result.

## Failure Philosophy
If a rule is broken, the process halts. We do not "fix" broken themes; we fix the Generator.
