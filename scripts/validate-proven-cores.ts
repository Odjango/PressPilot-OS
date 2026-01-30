import fs from 'fs-extra';
import path from 'path';

async function validateAllPatterns() {
    const provenCoresDir = path.join(process.cwd(), 'proven-cores');
    const errors: string[] = [];

    async function scan(dir: string) {
        const files = await fs.readdir(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = await fs.stat(fullPath);
            if (stat.isDirectory()) {
                await scan(fullPath);
            } else if (file.endsWith('.php') || file.endsWith('.html')) {
                const content = await fs.readFile(fullPath, 'utf8');

                // Rule: JSON Syntax in block comments
                const blockRegex = /<!--\s*wp:([a-z0-9\/-]+)\s+({.*?})\s*-->/g;
                let match;
                while ((match = blockRegex.exec(content)) !== null) {
                    const [fullMatch, blockName, jsonString] = match;
                    try {
                        JSON.parse(jsonString);
                    } catch (e) {
                        errors.push(`[${fullPath}] Invalid JSON in ${blockName}: ${e}`);
                    }
                }
            }
        }
    }

    await scan(provenCoresDir);

    if (errors.length > 0) {
        console.log('Errors found:');
        errors.forEach(err => console.log(err));
    } else {
        console.log('No JSON errors found in proven-cores.');
    }
}

validateAllPatterns();
