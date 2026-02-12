import { spawn } from 'node:child_process';
import path from 'node:path';

const COMPOSE_FILE = path.resolve(process.cwd(), 'tests/wordpress/docker-compose.yml');
const PROJECT_NAME = 'presspilot_wp_test';
const WORDPRESS_URL = process.env.WP_TESTS_BASE_URL ?? 'http://localhost:8089';
const USE_EXISTING_WORDPRESS = process.env.WP_TESTS_USE_EXISTING !== '0';
const EXTERNAL_WP_CONTAINER = process.env.WP_TESTS_WORDPRESS_CONTAINER ?? 'presspilot-os-wordpress-1';

interface CmdResult {
  code: number;
  stdout: string;
  stderr: string;
}

function runCommand(command: string, args: string[]): Promise<CmdResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env: process.env });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

export async function isDockerAvailable(): Promise<boolean> {
  try {
    const res = await runCommand('docker', ['--version']);
    return res.code === 0;
  } catch {
    return false;
  }
}

async function compose(args: string[]): Promise<CmdResult> {
  return runCommand('docker', ['compose', '-f', COMPOSE_FILE, '-p', PROJECT_NAME, ...args]);
}

export async function isWordPressReady(): Promise<boolean> {
  if (USE_EXISTING_WORDPRESS) {
    const health = await runCommand('docker', [
      'exec',
      EXTERNAL_WP_CONTAINER,
      'sh',
      '-lc',
      "curl -I -s -o /dev/null -w '%{http_code}' http://localhost/wp-login.php",
    ]);
    const statusCode = Number.parseInt(health.stdout.trim(), 10);
    return health.code === 0 && statusCode >= 200 && statusCode < 400;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${WORDPRESS_URL}/wp-login.php`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export async function startWordPress(): Promise<void> {
  if (USE_EXISTING_WORDPRESS) {
    if (!(await isWordPressReady())) {
      throw new Error(`Expected existing WordPress instance at ${WORDPRESS_URL}, but it is not reachable.`);
    }
    return;
  }

  // Reuse already-running local stack (e.g., started via npm run test:wp:setup)
  if (await isWordPressReady()) return;

  const up = await compose(['up', '-d']);
  if (up.code !== 0) {
    throw new Error(`Failed to start docker compose:\n${up.stderr}`);
  }

  const timeoutMs = 180000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (await isWordPressReady()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  throw new Error('WordPress did not become ready within timeout');
}

export async function stopWordPress(): Promise<void> {
  if (USE_EXISTING_WORDPRESS || process.env.SKIP_WP_TEARDOWN === 'true') {
    return;
  }

  const down = await compose(['down', '-v']);
  if (down.code !== 0) {
    throw new Error(`Failed to stop docker compose:\n${down.stderr}`);
  }
}

export function isUsingExistingWordPress(): boolean {
  return USE_EXISTING_WORDPRESS;
}

export const dockerCompose = {
  composeFile: COMPOSE_FILE,
  projectName: PROJECT_NAME,
  baseUrl: WORDPRESS_URL,
};
