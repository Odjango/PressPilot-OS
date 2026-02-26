# Contributing to PressPilot OS

## Contributing to Theme Generation

### Before Making Changes to Generators

1. **Read the FSE Knowledge Base**
   - Location: `docs/fse-kb/`
   - Start with: `FSE-KNOWLEDGE-BASE-INDEX.md`
   - Reference: Specific BATCH files for blocks you're working with

2. **Never Hardcode Block Markup**
   - All blocks MUST use `getBlockGenerator()`
   - Never write `<!-- wp:...` strings directly

### Correct Pattern

**WRONG:**
```typescript
const logo = `<!-- wp:site-logo {"width":120} /-->`;
```

**CORRECT:**
```typescript
const gen = getBlockGenerator();
const logo = gen.generate('site-logo', { width: 120 });
```

### Testing Requirements

All generator changes must:
1. Pass TypeScript compilation
2. Generate valid WordPress block markup
3. Pass WordPress Site Editor validation (zero errors)
4. Include test in `src/test-fse.ts`
