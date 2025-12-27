#!/bin/bash

# Configuration
SERVER_IP="96.59.252.101"
USER="root"

echo "Connecting to $USER@$SERVER_IP for INTERNAL PERMISSION FIX..."

ssh -t $USER@$SERVER_IP << 'EOF'
    echo "Scanning ALL containers for 'wp-config.php'..."
    
    # Iterate through every running container ID
    docker ps -q | while read ID; do
        # Check if wp-config.php exists inside the container
        if docker exec $ID test -f /var/www/html/wp-config.php; then
            echo "---------------------------------------------------"
            echo "🎯 FOUND WORDPRESS CONTAINER: $ID"
            
            # Get name for clarity
            NAME=$(docker inspect --format '{{.Name}}' $ID | sed 's/\///')
            echo "   Name: $NAME"
            
            echo "   > 📁 Ensuring uploads directory exists..."
            docker exec $ID mkdir -p /var/www/html/wp-content/uploads
            
            echo "   > 🔓 Setting Ownership (www-data)..."
            docker exec $ID chown -R www-data:www-data /var/www/html/wp-content
            
            echo "   > 🔓 Setting Permissions (777)..."
            docker exec $ID chmod -R 777 /var/www/html/wp-content
            
            if [ $? -eq 0 ]; then
                echo "   ✅ Fixed permissions inside WordPress container: $ID"
            else
                echo "   ❌ ERROR applying permissions to $ID"
            fi
        # else 
        #    echo "Skipping non-WP container $ID"
        fi
    done
    
    echo "---------------------------------------------------"
    echo "Internal permission fix complete."
EOF
