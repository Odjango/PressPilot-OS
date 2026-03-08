import JSZip from 'jszip';

export class StructureValidator {
    static async validate(zipBuffer: Buffer): Promise<{ valid: boolean; error?: string }> {
        const zip = new JSZip();
        await zip.loadAsync(zipBuffer);

        // Identify nested folder (standard WP zip structure: theme-name/style.css)
        // We expect one root folder.
        const files = Object.keys(zip.files);
        if (files.length === 0) {
            return { valid: false, error: '[StructureValidator] Zip is empty.' };
        }

        const rootFolders = new Set(files.map(f => f.split('/')[0]));
        if (rootFolders.size > 1) {
            // It might be file.txt and folder/
            // But strictly for a theme zip, it usually unpacks to a single slug.
            // Let's find the theme folder.
        }
        const themeSlug = Array.from(rootFolders)[0]; // simplistic assumption, robust for generated code

        const requiredFiles = [
            'style.css',
            'theme.json',
            'templates/front-page.html',
            'parts/header.html',
            'parts/footer.html'
        ];

        for (const req of requiredFiles) {
            // Allow for "slug/style.css" or just "style.css" depending on how we zipped it.
            // Usually we zip the CONTENTS of the folder, or the FOLDER itself.
            // Let's support both check: exist exactly or exists under single root.

            const existsDirect = zip.file(req);
            const existsNested = zip.file(`${themeSlug}/${req}`);

            if (!existsDirect && !existsNested) {
                return {
                    valid: false,
                    error: `[StructureValidator] Missing required file: ${req}. Theme must comply with FSE structure.`
                };
            }
        }

        return { valid: true };
    }
}
