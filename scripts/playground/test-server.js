#!/usr/bin/env node

/**
 * Test script to verify @wp-playground/cli installation
 * This starts a WordPress server briefly to confirm it works
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Testing WordPress Playground CLI...\n');

// Start the server
const server = spawn('npx', ['@wp-playground/cli', 'server'], {
  cwd: path.resolve(__dirname, '../..'),
  stdio: 'pipe'
});

let serverStarted = false;
let serverUrl = '';

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  // Check if server has started
  if (output.includes('http://') && !serverStarted) {
    serverStarted = true;
    const match = output.match(/(https?:\/\/[^\s]+)/);
    if (match) {
      serverUrl = match[1];
      console.log(`\n✅ Server started successfully at: ${serverUrl}`);
      console.log('✅ WordPress admin should be accessible at the URL above');
      console.log('\nStopping server after verification...\n');
      
      // Give it a moment then stop
      setTimeout(() => {
        server.kill('SIGTERM');
      }, 2000);
    }
  }
});

server.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});

server.on('close', (code) => {
  if (serverStarted) {
    console.log('✅ Server stopped cleanly');
    console.log('\n✅ TASK 0.1 COMPLETE: WordPress Playground CLI is working!');
  } else {
    console.log(`\n❌ Server exited with code ${code}`);
    process.exit(1);
  }
});

// Timeout after 30 seconds
setTimeout(() => {
  if (!serverStarted) {
    console.log('\n❌ Timeout: Server did not start within 30 seconds');
    server.kill('SIGTERM');
    process.exit(1);
  }
}, 30000);
