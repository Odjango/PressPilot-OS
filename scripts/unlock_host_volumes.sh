#!/bin/bash

# Configuration
SERVER_IP="96.59.252.101"
USER="root"

echo "Connecting to $USER@$SERVER_IP for HOST LEVEL UNLOCK..."

ssh -t $USER@$SERVER_IP << 'EOF'
    echo "Scanning /var/lib/docker for 'wp-content' directories..."
    echo "Warning: This is a deep scan and may take a moment."
    
    # Find all 'wp-content' directories within Docker volumes
    # We supress permission denied errors for non-accessible system paths just in case
    find /var/lib/docker -type d -name "wp-content" 2>/dev/null | while read DIR; do
        echo "---------------------------------------------------"
        echo "📂 FOUND VOLUME: $DIR"
        
        echo "   > 🔓 Setting Internal User (33:33)..."
        chown -R 33:33 "$DIR"
        
        echo "   > 🔓 Force Enabling Write Access (777)..."
        chmod -R 777 "$DIR"
        
        if [ $? -eq 0 ]; then
            echo "   ✅ UNLOCKED: $DIR"
        else
            echo "   ❌ ERROR unlocking $DIR"
        fi
    done
    
    echo "---------------------------------------------------"
    echo "Host volume unlock complete."
EOF
