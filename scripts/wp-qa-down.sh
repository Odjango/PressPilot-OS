#!/bin/bash
echo "🛑 Tearing down WordPress QA Stack..."
docker compose -f docker-compose.wp-qa.yml down -v
echo "✅ QA Environment destroyed."
