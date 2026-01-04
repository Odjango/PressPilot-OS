#!/bin/bash

echo "⚠️  STARTING AGGRESSIVE DOCKER CLEANUP ⚠️"

# 1. Stop all running containers (optional, usually safe on build servers)
# echo "Stopping all containers..."
# docker stop $(docker ps -aq)

# 2. Prune everything (Stopped containers, unused networks, dangling images)
echo "🧹 Pruning System..."
docker system prune -af

# 3. Explicitly remove builder cache (The silent killer)
echo "🏗️  Pruning Builder Cache..."
docker builder prune -af

# 4. Remove all unused volumes (Dangerous if DBs are not persistent, but good for build nodes)
# echo "💾 Pruning Volumes..."
# docker volume prune -f

echo "✅ CLEANUP COMPLETE"
echo "You can now retry the deployment."
