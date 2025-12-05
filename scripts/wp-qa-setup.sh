#!/bin/bash
set -e

echo "🚀 Starting WordPress QA Stack..."
docker compose -f docker-compose.wp-qa.yml up -d

echo "⏳ Waiting for WordPress to be ready..."
# Wait loop for WP installation check
# We use 'wp core is-installed' inside the CLI container to check if it returns 0 (installed) or 1 (not)
# But initially, DB connections might fail.
MAX_RETRIES=30
COUNT=0
URL="http://wpqa-wordpress"

# Function to run wp-cli command
run_wp() {
    docker compose -f docker-compose.wp-qa.yml run --rm wpqa-cli wp "$@"
}

# Function to run arbitrary command in cli container
run_cmd() {
    docker compose -f docker-compose.wp-qa.yml run --rm --entrypoint "" wpqa-cli "$@"
}

sleep 5

while ! docker compose -f docker-compose.wp-qa.yml exec wpqa-db mysqladmin ping -h"localhost" --silent; do
    echo "   Waiting for database connection..."
    sleep 2
    COUNT=$((COUNT+1))
    if [ $COUNT -ge $MAX_RETRIES ]; then echo "❌ Database timed out"; exit 1; fi
done

echo "✅ Database is up."

# Check if installed
if run_wp core is-installed; then
    echo "ℹ️  WordPress is already installed."
else
    echo "📦 Installing WordPress..."
    run_wp core install \
        --url="$URL" \
        --title="PressPilot Golden QA" \
        --admin_user="admin" \
        --admin_password="admin" \
        --admin_email="admin@example.com" \
        --skip-email

    # Force external URL to localhost:8089 (fix wpqa-wordpress redirects)
    echo "🔧 Setting URL to localhost:8089..."
    run_wp option update siteurl "http://localhost:8089"
    run_wp option update home "http://localhost:8089"
fi

echo "🔧 Fixing permissions..."
docker compose -f docker-compose.wp-qa.yml run --rm --user root wpqa-cli chown -R www-data:www-data /var/www/html

echo "🎨 Installing Golden Demo Theme..."
# Theme file path inside the container (mapped volume)
THEME_ZIP="/dist/presspilot-golden-demo-v1-2.zip"

if run_wp theme is-installed presspilot-golden-demo-v1-2; then
    echo "   Theme already installed, reactivating..."
    run_wp theme activate presspilot-golden-demo-v1-2
else
    echo "   Installing generic theme from zip..."
    run_wp theme install "$THEME_ZIP" --activate
fi

echo "🔗 Configuring Permalinks..."
run_wp rewrite structure '/%postname%/' --hard
run_wp rewrite flush --hard

echo ""
echo "🎉 Golden QA site is ready!"
echo "-----------------------------------------"
echo "🏠 URL:   http://localhost:8089"
echo "🔑 Login: admin / admin"
echo "-----------------------------------------"
