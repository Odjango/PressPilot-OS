import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { dockerCompose, isUsingExistingWordPress, startWordPress, stopWordPress } from './docker';

const THEMES_DIR = path.resolve(process.cwd(), 'tests/wordpress/themes');
const SITE_URL = dockerCompose.baseUrl;
const EXTERNAL_WP_CLI_CONTAINER = process.env.WP_TESTS_CLI_CONTAINER ?? 'presspilot-os-cli';
const TEST_ADMIN_USER = process.env.WP_TESTS_ADMIN_USER || 'admin';
const TEST_ADMIN_PASS = process.env.WP_TESTS_ADMIN_PASS || 'admin';

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

export async function runWpCli(args: string[]): Promise<string> {
  const cmdArgs = isUsingExistingWordPress()
    ? [
        'exec',
        EXTERNAL_WP_CLI_CONTAINER,
        'wp',
        '--allow-root',
        '--path=/var/www/html',
        ...args,
      ]
    : [
        'compose',
        '-f',
        dockerCompose.composeFile,
        '-p',
        dockerCompose.projectName,
        'run',
        '--rm',
        'wpcli',
        '--allow-root',
        '--path=/var/www/html',
        ...args,
      ];

  const res = await runCommand('docker', cmdArgs);
  if (res.code !== 0) {
    throw new Error(`WP-CLI failed:\n${res.stderr}`);
  }
  return res.stdout.trim();
}

async function coreIsInstalled(): Promise<boolean> {
  try {
    await runWpCli(['core', 'is-installed']);
    return true;
  } catch {
    return false;
  }
}

export async function ensureWordPressInstalled(): Promise<void> {
  if (await coreIsInstalled()) {
    return;
  }

  await runWpCli([
    'core',
    'install',
    `--url=${SITE_URL}`,
    '--title=PressPilot Test',
    '--admin_user=admin',
    '--admin_password=admin',
    '--admin_email=admin@example.com',
    '--skip-email',
  ]);

  await runWpCli(['rewrite', 'structure', '/%postname%/', '--hard']);
  await runWpCli(['option', 'update', 'blog_public', '0']);
}

export async function ensureTestAdminCredentials(): Promise<void> {
  try {
    await runWpCli(['user', 'get', TEST_ADMIN_USER, '--field=ID']);
    await runWpCli(['user', 'update', TEST_ADMIN_USER, `--user_pass=${TEST_ADMIN_PASS}`]);
    return;
  } catch {
    await runWpCli([
      'user',
      'create',
      TEST_ADMIN_USER,
      `${TEST_ADMIN_USER}@example.com`,
      '--role=administrator',
      `--user_pass=${TEST_ADMIN_PASS}`,
    ]);
  }
}

export async function resetWordPress(): Promise<void> {
  if (isUsingExistingWordPress()) {
    return;
  }

  // `wp db reset` relies on mysql client SSL defaults that are inconsistent in local Docker.
  // Recreate containers/volumes for a deterministic clean state between test runs.
  await stopWordPress();
  await startWordPress();
  await ensureWordPressInstalled();
}

export async function installTheme(zipPath: string): Promise<void> {
  await fs.mkdir(THEMES_DIR, { recursive: true });
  const fileName = path.basename(zipPath);
  const localCopy = path.join(THEMES_DIR, fileName);
  await fs.copyFile(zipPath, localCopy);

  if (isUsingExistingWordPress()) {
    const remotePath = `/tmp/${fileName}`;
    const copyRes = await runCommand('docker', ['cp', localCopy, `${EXTERNAL_WP_CLI_CONTAINER}:${remotePath}`]);
    if (copyRes.code !== 0) {
      throw new Error(`Failed to copy theme ZIP into existing WP-CLI container:\n${copyRes.stderr}`);
    }
    await runWpCli(['theme', 'install', remotePath, '--force', '--activate']);
    return;
  }

  await runWpCli(['theme', 'install', `/themes/${fileName}`, '--force', '--activate']);
}
