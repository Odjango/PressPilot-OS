#!/bin/bash

# Configuration
SERVER_IP="96.59.252.101"
USER="root"

echo "Connecting to $USER@$SERVER_IP for BRUTE FORCE UNLOCK..."

ssh -t $USER@$SERVER_IP << 'EOF'
    echo "Starting Brute Force Scan of ALL Containers..."
    
    # Iterate through every running container ID
    docker ps -q | while read ID; do
        # Get Name for logging
        NAME=$(docker inspect --format '{{.Name}}' $ID | sed 's/\///')
        
        # Check if the specific WP content directory exists inside
        if docker exec $ID test -d /var/www/html/wp-content; then
            echo "---------------------------------------------------"
            echo "🎯 TARGET ACQUIRED: $NAME ($ID)"
            echo "   Found /var/www/html/wp-content"
            
            echo "   > 🔓 Executing chown www-data..."
            docker exec $ID chown -R www-data:www-data /var/www/html/wp-content
            
            echo "   > 🔓 Executing chmod 777 (Total Unlock)..."
            docker exec $ID chmod -R 777 /var/www/html/wp-content
            
            if [ $? -eq 0 ]; then
                echo "   ✅ UNLOCKED SUCCESSFULLY"
            else
                echo "   ❌ ERROR applying permissions"
            fi
        # Optional: minimal logging for non-matches to show progress
        # else
        #    echo "   (Skipping $NAME - Not WordPress)"
        fi
    done
    
    echo "---------------------------------------------------"
    echo "Brute force unlock complete."
EOF
