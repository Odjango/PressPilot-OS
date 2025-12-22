
import { GET } from '../app/api/download/route';
import fs from 'node:fs';
import path from 'node:path';
import { assert } from 'console';

const BUILD_ROOT = '/tmp/presspilot-build/themes';

async function setup() {
    if (!fs.existsSync(BUILD_ROOT)) {
        fs.mkdirSync(BUILD_ROOT, { recursive: true });
    }

    // Create valid file (> 1MB)
    const validData = Buffer.alloc(1_000_001, 'a');
    fs.writeFileSync(path.join(BUILD_ROOT, 'valid-theme.zip'), validData);

    // Create invalid file (< 1MB)
    const invalidData = Buffer.alloc(999_999, 'b');
    fs.writeFileSync(path.join(BUILD_ROOT, 'invalid-theme.zip'), invalidData);
}

async function cleanup() {
    if (fs.existsSync(path.join(BUILD_ROOT, 'valid-theme.zip'))) fs.unlinkSync(path.join(BUILD_ROOT, 'valid-theme.zip'));
    if (fs.existsSync(path.join(BUILD_ROOT, 'invalid-theme.zip'))) fs.unlinkSync(path.join(BUILD_ROOT, 'invalid-theme.zip'));
}

async function testValidDownload() {
    console.log('Testing valid download (>1MB)...');
    const request = new Request('http://localhost:3000/api/download?kind=theme&slug=valid-theme');
    const response = await GET(request);

    if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType !== 'application/zip') {
        throw new Error(`Expected content-type application/zip, got ${contentType}`);
    }

    const contentLength = response.headers.get('Content-Length');
    if (contentLength !== '1000001') {
        throw new Error(`Expected content-length 1000001, got ${contentLength}`);
    }

    console.log('✅ Valid download test passed');
}

async function testInvalidDownload() {
    console.log('Testing invalid download (<1MB)...');
    const request = new Request('http://localhost:3000/api/download?kind=theme&slug=invalid-theme');
    const response = await GET(request);

    if (response.status !== 500) {
        throw new Error(`Expected 500, got ${response.status}`);
    }

    const data = await response.json();
    if (!data.error || !data.error.includes('too small')) {
        throw new Error(`Expected error message about size, got ${JSON.stringify(data)}`);
    }

    console.log('✅ Invalid download test passed');
}

async function run() {
    try {
        await setup();
        await testValidDownload();
        await testInvalidDownload();
    } catch (error) {
        console.error('❌ Tests failed:', error);
        process.exit(1);
    } finally {
        await cleanup();
    }
}

run();
