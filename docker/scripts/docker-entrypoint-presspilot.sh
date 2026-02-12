#!/bin/bash
set -e

# PressPilot WordPress Docker Entrypoint
# Handles WordPress installation and plugin activation on first run

echo "🚀 PressPilot WordPress Environment Starting..."

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL..."
while ! mysqladmin ping -h"mysql" --silent; do
    sleep 1
done
echo "✅ MySQL is ready"

# Run the original WordPress entrypoint
docker-entrypoint.sh apache2 -v > /dev/null 2>&1 || true

# Check if WordPress is installed
if ! wp core is-installed --allow-root 2>/dev/null; then
    echo "📦 Installing WordPress..."
    
    # Install WordPress
    wp core install \
        --url="${WORDPRESS_URL:-http://localhost:8080}" \
        --title="PressPilot Generator" \
        --admin_user="${WP_ADMIN_USER:-admin}" \
        --admin_password="${WP_ADMIN_PASSWORD:-admin}" \
        --admin_email="${WP_ADMIN_EMAIL:-admin@presspilot.local}" \
        --skip-email \
        --allow-root
    
    echo "✅ WordPress installed"
    
    # Activate Factory Plugin
    if [ -d "/var/www/html/wp-content/plugins/presspilot-factory" ]; then
        echo "🔌 Activating PressPilot Factory Plugin..."
        wp plugin activate presspilot-factory --allow-root
        echo "✅ Factory Plugin activated"
    fi
    
    # Set permalink structure for REST API
    wp rewrite structure '/%postname%/' --allow-root
    wp rewrite flush --allow-root
    
    # Disable default themes we don't need
    wp theme delete twentytwentythree twentytwentyfour --allow-root 2>/dev/null || true
    
    # Configure for headless/API use
    wp option update blog_public 0 --allow-root
    
    echo "🎉 PressPilot WordPress environment ready!"
else
    echo "✅ WordPress already installed"
    
    # Ensure Factory Plugin is activated
    if [ -d "/var/www/html/wp-content/plugins/presspilot-factory" ]; then
        wp plugin activate presspilot-factory --allow-root 2>/dev/null || true
    fi
fi

# Execute the main command (apache2-foreground)
exec "$@"
