#!/bin/bash
echo "🚀 Starting PressPilot OS (Standalone Mode)..."
echo "📂 Current Directory: $(pwd)"
echo "📄 Listing Listing:"
ls -F

# Run the server
echo "⚡ Executing: node server.js"
node server.js

# Capture Exit Code
EXIT_CODE=$?
echo "❌ Server crashed with exit code: $EXIT_CODE"

# Prevent Restart Loop
echo "🛑 Entering Safe Mode (Sleeping infinity) to preserve logs..."
tail -f /dev/null
