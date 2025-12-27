#!/bin/bash

# Configuration
SERVER_IP="96.59.252.101"
USER="root"

echo "Connecting to $USER@$SERVER_IP..."

ssh -t $USER@$SERVER_IP << 'EOF'
    echo "Scanning containers..."
    
    # Get ID and Names of all running containers
    docker ps --format "{{.ID}} {{.Names}}" | while read -r line; do
        ID=$(echo $line | awk '{print $1}')
        NAME=$(echo $line | awk '{print $2}')
        
        # Check matching keywords (case insensitive just in case, though docker names are usually lowercase)
        if [[ "$NAME" == *"wordpress"* ]] || [[ "$NAME" == *"factory"* ]] || [[ "$NAME" == *"presspilot"* ]]; then
             echo "---------------------------------------------------"
             echo "Found target container: $NAME ($ID)"
             
             # Attempt Chown
             echo "  > Setting ownership to www-data..."
             docker exec $ID chown -R www-data:www-data /var/www/html/wp-content
             
             # Attempt Chmod
             echo "  > Setting permissions to 755..."
             docker exec $ID chmod -R 755 /var/www/html/wp-content
             
             echo "✅ Fixed permissions for $NAME"
        fi
    done
    
    echo "---------------------------------------------------"
    echo "Scan complete."
EOF
