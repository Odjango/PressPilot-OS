# BlockBuilder Location & Usage

## Location
The `BlockBuilder` class is defined in:
-   **File**: `scripts/buildWpTheme.ts`
-   **Scope**: Class `BlockBuilder` (Global within module)

## Purpose
`BlockBuilder` provides safe, deterministic helper methods for generating WordPress block comment markup. It eliminates the risk of manual string concatenation errors (e.g., malformed JSON, unclosed tags).

## API
```typescript
class BlockBuilder {
    // Open a block with attributes
    static open(name: string, attrs: Record<string, any> = {}): string;

    // Close a block
    static close(name: string): string;

    // Create a self-closing block
    static self(name: string, attrs: Record<string, any> = {}): string;

    // Create a paragraph block with content
    static paragraph(content: string, attrs: Record<string, any> = {}): string;
}
```

## Usage in Generator
The generator uses `BlockBuilder` in the `Seeder` class (`setup_menus`, `create_pages`) to safely emit content seeded into the WordPress database. This ensures that even programmatically generated content adheres to the strict validation rules.
