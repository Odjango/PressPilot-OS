#!/usr/bin/env tsx
import { PlaygroundValidator } from '../../src/generator/validators/PlaygroundValidator';

async function main() {
    const themeDir = process.argv[2];
    if (!themeDir) {
        console.error('Usage: tsx validate-theme.ts <theme-dir>');
        process.exit(1);
    }

    const result = await PlaygroundValidator.validate({ themeDir, timeout: 30000 });
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.valid ? 0 : 1);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
