#!/bin/bash

# Configuration
SERVER_IP="96.59.252.101"
USER="root"

echo "Connecting to $USER@$SERVER_IP..."

ssh -t $USER@$SERVER_IP << 'EOF'
    echo "Finding WordPress container..."
    # Try to find container by name or image containing 'wordpress'
    CONTAINER_ID=$(docker ps | grep -i wordpress | awk '{print $1}' | head -n 1)

    if [ -z "$CONTAINER_ID" ]; then
        echo "Error: WordPress container not found!"
        exit 1
    fi

    echo "Found WordPress container: $CONTAINER_ID"
    echo "Fixing permissions..."
    
    docker exec $CONTAINER_ID chown -R www-data:www-data /var/www/html/wp-content
    
    if [ $? -eq 0 ]; then
        echo "✅ Permissions fixed successfully for /var/www/html/wp-content"
    else
        echo "❌ Failed to change permissions"
        exit 1
    fi
EOF
