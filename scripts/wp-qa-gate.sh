#!/bin/bash
set -e

# Path to compose file
COMPOSE="docker-compose -f docker-compose.wp-qa.yml"

echo "🔍 Checking WordPress QA Stack status..."
if ! $COMPOSE ps | grep -q "Up"; then
    echo "⚠️  Stack is not running. Booting up..."
    $COMPOSE up -d
    echo "⏳ Waiting 10s for services..."
    sleep 10
fi

# Ensure WP is installed (idempotent check)
echo "📦 Verifying WordPress installation..."
if ! $COMPOSE exec wpqa-cli wp core is-installed > /dev/null 2>&1; then
    echo "❌ WordPress not installed. Running initialization..."
    # We can reuse the setup script logic or just quick install
    # Reusing setup script is safer as it handles DB wait loop
    ./scripts/wp-qa-setup.sh
else
    echo "✅ WordPress is ready."
fi

# Target Theme Directory (Source)
# Target Theme Config
THEME_SLUG="presspilot-heavy-content-v3"
HOST_THEME_DIR="themes/$THEME_SLUG"
DOCKER_THEME_DIR="/presspilot/themes/$THEME_SLUG"

# Allow override via argument (Artifact Lock)
if [ ! -z "$1" ]; then
    # If explicit path provided, ensure it maps correctly to Docker volume
    # Assuming the input path is relative to repo root like "artifacts/run-123/theme"
    HOST_THEME_DIR="$1"
    DOCKER_THEME_DIR="/presspilot/$1"
    echo "🔒 Artifact Lock: Validating explicit build at $HOST_THEME_DIR"
fi

# Note: Editor compliance is now enforced during 'theme:build' via serializer.ts strict check.

echo "🚀 Running PHP Round-Trip Validator on DOCKER: $DOCKER_THEME_DIR"
# Use run --rm for ephemeral execution
$COMPOSE run --rm wpqa-cli wp eval-file /presspilot/scripts/validate-roundtrip.php $DOCKER_THEME_DIR

STATUS=$?
if [ $STATUS -eq 0 ]; then
    echo "✅ GATE PASSED: Theme matches strict serialization rules."
else
    echo "❌ GATE FAILED: Discrepancies found."
    exit 1
fi
