import { isDockerAvailable, isUsingExistingWordPress, isWordPressReady, startWordPress } from './setup/docker';
import { ensureTestAdminCredentials, ensureWordPressInstalled } from './setup/wp-cli';

async function globalSetup(): Promise<void> {
  const baseUrl = process.env.WP_TESTS_BASE_URL ?? 'http://localhost:8089';
  const dockerAvailable = await isDockerAvailable();
  if (!dockerAvailable) {
    console.warn('[wp-tests] Docker is not available. WordPress tests will auto-skip.');
    process.env.WP_TESTS_DOCKER_UNAVAILABLE = '1';
    return;
  }

  if (isUsingExistingWordPress()) {
    const ready = await isWordPressReady();
    if (!ready) {
      throw new Error(`[wp-tests] Expected existing WordPress at ${baseUrl}, but it is not reachable.`);
    }
    await ensureTestAdminCredentials();
    process.env.SKIP_WP_TEARDOWN = 'true';
    return;
  }

  await startWordPress();
  await ensureWordPressInstalled();
  await ensureTestAdminCredentials();
}

export default globalSetup;
