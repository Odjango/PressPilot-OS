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
THEME_DIR="/presspilot/themes/presspilot-heavy-content-v3"

echo "🚀 Running PHP Round-Trip Validator on: $THEME_DIR"
# Run the gate
$COMPOSE exec wpqa-cli wp eval-file /presspilot/scripts/validate-roundtrip.php -- $THEME_DIR

STATUS=$?
if [ $STATUS -eq 0 ]; then
    echo "✅ GATE PASSED: Theme matches strict serialization rules."
else
    echo "❌ GATE FAILED: Discrepancies found."
    exit 1
fi
