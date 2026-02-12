import { isDockerAvailable, isUsingExistingWordPress, stopWordPress } from './setup/docker';

async function globalTeardown(): Promise<void> {
  const dockerAvailable = await isDockerAvailable();
  if (!dockerAvailable) {
    return;
  }

  if (process.env.SKIP_WP_TEARDOWN === 'true' || isUsingExistingWordPress()) {
    return;
  }

  await stopWordPress();
}

export default globalTeardown;
