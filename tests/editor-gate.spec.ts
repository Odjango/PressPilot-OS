import { test, expect } from '@playwright/test';

const WP = 'http://localhost:8089';
const user = 'admin';
const pass = 'admin';

async function login(page) {
    await page.goto(`${WP}/wp-login.php`);
    await page.fill('#user_login', user);
    await page.fill('#user_pass', pass);
    await page.click('#wp-submit');
    await expect(page).toHaveURL(/wp-admin/);
}

async function assertNoAttemptRecovery(page, label: string) {
    // Common UI strings
    const badText1 = page.getByText('Attempt recovery', { exact: false });
    const badText2 = page.getByText('unexpected or invalid content', { exact: false });

    // Give editor time to validate/render (wait for application root)
    await page.waitForSelector('#wpwrap', { timeout: 30000 });
    await page.waitForTimeout(5000); // 5s wait for full init

    const has1 = await badText1.count();
    const has2 = await badText2.count();

    if (has1 > 0 || has2 > 0) {
        await page.screenshot({ path: `test-results/${label}-attempt-recovery.png`, fullPage: true });
        // Also try to capture the block error if visible in console logs?
        // Playwright handles that if we configure it, but screenshot is key.
        throw new Error(`Editor Gate FAILED: "${label}" contains Attempt recovery / invalid content warnings.`);
    }
}

test('Site Editor templates have zero Attempt Recovery', async ({ page }) => {
    await login(page);

    // Open Site Editor (templates)
    // Note: WP 6.6+ site editor URL structure might vary, but site-editor.php is standard entry.
    await page.goto(`${WP}/wp-admin/site-editor.php`);
    await assertNoAttemptRecovery(page, 'site-editor-home');

    // Explicit Template Check (e.g. Front Page)
    if (process.env.TEMPLATE_ID) {
        console.log(`Checking Template ID: ${process.env.TEMPLATE_ID}`);
        await page.goto(`${WP}/wp-admin/site-editor.php?postType=wp_template&postId=${encodeURIComponent(process.env.TEMPLATE_ID)}`);
        await assertNoAttemptRecovery(page, 'template-explicit');
    }

    // Explicit Template Part Check (e.g. Header)
    if (process.env.PART_ID) {
        console.log(`Checking Part ID: ${process.env.PART_ID}`);
        await page.goto(`${WP}/wp-admin/site-editor.php?postType=wp_template_part&postId=${encodeURIComponent(process.env.PART_ID)}`);
        await assertNoAttemptRecovery(page, 'part-explicit');
    }

    // Template Parts list (Backup)
    await page.goto(`${WP}/wp-admin/site-editor.php?postType=wp_template_part`);
    await assertNoAttemptRecovery(page, 'template-parts-list');

    // Templates list (Backup)
    await page.goto(`${WP}/wp-admin/site-editor.php?postType=wp_template`);
    await assertNoAttemptRecovery(page, 'templates-list');
});

test('Front end pages do not inject invalid block warnings in editor preview paths', async ({ page }) => {
    await login(page);

    // Optional: create a test page that includes your “heavy page” pattern
    // (If your pipeline already creates content, just open it.)
    await page.goto(`${WP}/wp-admin/edit.php?post_type=page`);
    await assertNoAttemptRecovery(page, 'pages-list');
});
