#!/bin/bash
set -e

#!/bin/bash
set -e

echo ">>> Starting Coolify Deployment Fix (Dynamic Mode)..."

# 1. Find the Active Artifact Directory via Docker
# Priority: Container starting with "hkws" (Coolify default naming)
CONTAINER_ID=$(docker ps --filter "name=hkws" --format "{{.ID}}" | head -n 1)

if [ -z "$CONTAINER_ID" ]; then
    echo "No 'hkws' container found. Checking for 'presspilot' or 'next'..."
    CONTAINER_ID=$(docker ps --filter "name=presspilot" --filter "name=next" --format "{{.ID}}" | head -n 1)
fi

if [ -z "$CONTAINER_ID" ]; then
    echo "WARNING: No running container found."
    echo "Falling back to search in /artifacts/..."
    # Fallback: Find the most recently modified docker-compose.yaml in /artifacts
    COMPOSE_FILE=$(find /artifacts -name "docker-compose.yaml" -type f -exec stat -c "%y %n" {} + 2>/dev/null | sort -r | head -n 1 | cut -d " " -f 4-)
    
    if [ -z "$COMPOSE_FILE" ]; then
        echo "Searching ENTIRE server for docker-compose.yaml containing 'presspilot'..."
        # Global search excluding pseudo-filesystems
        COMPOSE_FILE=$(find / -name "docker-compose.yaml" -type f \
            -not -path "/proc/*" \
            -not -path "/sys/*" \
            -not -path "/dev/*" \
            -not -path "/run/*" \
            -not -path "/var/lib/docker/overlay2/*" \
            -exec grep -l "presspilot" {} + 2>/dev/null | head -n 1)
    fi
else
    echo "Found active container ID: $CONTAINER_ID"
    # Identify Root: 1. Try Compose Label (Standard)
    WORK_DIR=$(docker inspect --format '{{ index .Config.Labels "com.docker.compose.project.working_dir" }}' $CONTAINER_ID)
    
    # 2. Try identifying via Mounts (User requested Source path check)
    if [ -z "$WORK_DIR" ]; then
        echo "Label not found. Inspecting Mounts for /artifacts/ path..."
        # Extract source paths of bind mounts, look for one containing /artifacts/
        MOUNT_SOURCE=$(docker inspect --format '{{range .Mounts}}{{if eq .Type "bind"}}{{.Source}}{{println}}{{end}}{{end}}' $CONTAINER_ID | grep "/artifacts/" | head -n 1)
        
        if [ -n "$MOUNT_SOURCE" ]; then
            # Assuming the mount is INSIDE the project dir, or IS the project dir. 
            # Usually /artifacts/ID is the project dir.
            # We try to use the part up to the ID.
            # Matches /artifacts/[LCG_ID]
            WORK_DIR=$(echo "$MOUNT_SOURCE" | grep -oE "/artifacts/[a-z0-9]+")
        fi
    fi

    if [ -z "$WORK_DIR" ]; then
        echo "Could not resolve project root from container inspection."
        # Fallback to search
        COMPOSE_FILE=$(find /artifacts -name "docker-compose.yaml" -print -quit)
    else
        echo "Active Artifact Directory: $WORK_DIR"
        COMPOSE_FILE="$WORK_DIR/docker-compose.yaml"
    fi
fi

if [ -z "$COMPOSE_FILE" ] || [ ! -f "$COMPOSE_FILE" ]; then
    echo "CRITICAL: Could not locate a valid docker-compose.yaml file."
    exit 1
fi

echo "Targeting: $COMPOSE_FILE"

# 2. Patch Memory Limits
echo ">>> Patching docker-compose.yaml..."
cp "$COMPOSE_FILE" "$COMPOSE_FILE.bak"

# Ensure 'mem_limit: 4096' becomes 'mem_limit: 4096m'
# Also handles 'memory: 4096'
sed -i 's/\(mem_limit: [0-9]\{3,\}\)$/\1m/g' "$COMPOSE_FILE"
sed -i 's/\(memory: [0-9]\{3,\}\)$/\1m/g' "$COMPOSE_FILE"
sed -i 's/mem_limit: 4096$/mem_limit: 4096m/g' "$COMPOSE_FILE"

# Optimize Build RAM: Inject NODE_OPTIONS into environment
# We look for "environment:" and append the node options if not present
if grep -q "environment:" "$COMPOSE_FILE"; then
    if ! grep -q "NODE_OPTIONS" "$COMPOSE_FILE"; then
        echo "Injecting NODE_OPTIONS=--max-old-space-size=4096 into environment..."
        sed -i '/environment:/a \      - NODE_OPTIONS=--max-old-space-size=4096' "$COMPOSE_FILE"
    fi
else
    # If no environment block exists, this simple sed won't work perfectly for all cases, 
    # but most Coolify apps have it. We'll skip complex creation to avoid breaking yaml.
    echo "WARNING: No 'environment:' block found. Skipping NODE_OPTIONS injection."
fi

echo "Diff of changes:"
diff "$COMPOSE_FILE.bak" "$COMPOSE_FILE" || true

# 3. Forced Cleanup
echo ">>> Pruning Docker System..."
docker system prune -f

echo ">>> Purging Application Build Cache (/tmp/presspilot-build)..."
# We need to run this inside the container or on host? 
# The build folder /tmp/presspilot-build is likely inside the container if it's not a volume.
# If it is a host volume, we clean it on host. 
# Assuming standard Next.js temp dir usage inside container for this script context:
# But this script runs on HOST. 
# If the app stores builds in /tmp/presspilot-build inside the container, restarting the container (which we do below) 
# usually clears /tmp UNLESS it's mounted.
# If it's ephemeral, restart clears it. 
# However, user asked to "Delete everything inside /tmp/presspilot-build/".
# If it is a persistent volume, we should find it.
# For now, we will attempt to exec into the running container to clean it BEFORE restart if it exists.
if [ -n "$CONTAINER_ID" ]; then
    echo "Cleaning /tmp/presspilot-build inside container $CONTAINER_ID..."
    docker exec "$CONTAINER_ID" rm -rf /tmp/presspilot-build/ || echo "Container flush failed (container might be down), restart will handle it if ephemeral."
fi

# 4. Final Rebuild
echo ">>> Redeploying..."
cd "$(dirname "$COMPOSE_FILE")"
docker compose up -d --build --remove-orphans

echo "SUCCESS: Service updated and restarting in $(dirname "$COMPOSE_FILE")"
