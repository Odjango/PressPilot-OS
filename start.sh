#!/bin/bash

# PressPilot v2 - Quick Start Script
# Usage: ./start.sh [command]
# Commands: up, down, restart, logs, test, shell

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$SCRIPT_DIR/docker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[PressPilot]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[Warning]${NC} $1"
}

print_error() {
    echo -e "${RED}[Error]${NC} $1"
}

# Start the environment
start_env() {
    print_status "Starting PressPilot WordPress environment..."
    cd "$DOCKER_DIR"
    docker-compose up -d
    print_status "Waiting for WordPress to be ready..."
    sleep 10
    
    # Wait for health check
    MAX_ATTEMPTS=30
    ATTEMPT=0
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if curl -s http://localhost:8080/wp-json/presspilot/v1/status > /dev/null 2>&1; then
            print_status "✅ WordPress is ready!"
            print_status "Factory Plugin API: http://localhost:8080/wp-json/presspilot/v1/"
            print_status "WordPress Admin: http://localhost:8080/wp-admin/"
            print_status "Credentials: admin / admin"
            return 0
        fi
        ATTEMPT=$((ATTEMPT + 1))
        echo -n "."
        sleep 2
    done
    
    print_error "WordPress failed to start. Check logs with: ./start.sh logs"
    return 1
}

# Stop the environment
stop_env() {
    print_status "Stopping PressPilot environment..."
    cd "$DOCKER_DIR"
    docker-compose down
    print_status "Environment stopped."
}

# Restart
restart_env() {
    stop_env
    start_env
}

# Show logs
show_logs() {
    cd "$DOCKER_DIR"
    docker-compose logs -f
}

# Test generation
test_generation() {
    print_status "Testing theme generation..."
    
    RESPONSE=$(curl -s -X POST http://localhost:8080/wp-json/presspilot/v1/generate \
        -H "Content-Type: application/json" \
        -d @"$SCRIPT_DIR/sample-input.json")
    
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        print_status "✅ Theme generated successfully!"
    else
        print_error "Theme generation failed. Check the response above."
    fi
}

# Open shell in WordPress container
open_shell() {
    print_status "Opening shell in WordPress container..."
    docker exec -it presspilot-wordpress bash
}

# WP-CLI command
run_wpcli() {
    shift
    docker-compose -f "$DOCKER_DIR/docker-compose.yml" run --rm wpcli "$@"
}

# Status check
check_status() {
    print_status "Checking PressPilot status..."
    
    RESPONSE=$(curl -s http://localhost:8080/wp-json/presspilot/v1/status 2>/dev/null)
    
    if [ -n "$RESPONSE" ]; then
        echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
        print_status "✅ Factory Plugin is running"
    else
        print_error "Factory Plugin is not responding. Start with: ./start.sh up"
    fi
}

# Main
case "${1:-help}" in
    up|start)
        start_env
        ;;
    down|stop)
        stop_env
        ;;
    restart)
        restart_env
        ;;
    logs)
        show_logs
        ;;
    test)
        test_generation
        ;;
    shell)
        open_shell
        ;;
    wp)
        run_wpcli "$@"
        ;;
    status)
        check_status
        ;;
    *)
        echo ""
        echo "PressPilot v2 - WordPress Theme Generation Environment"
        echo ""
        echo "Usage: ./start.sh [command]"
        echo ""
        echo "Commands:"
        echo "  up, start    Start the Docker environment"
        echo "  down, stop   Stop the Docker environment"
        echo "  restart      Restart the environment"
        echo "  logs         Show container logs"
        echo "  test         Test theme generation with sample input"
        echo "  shell        Open bash shell in WordPress container"
        echo "  wp [args]    Run WP-CLI commands"
        echo "  status       Check Factory Plugin status"
        echo ""
        echo "Examples:"
        echo "  ./start.sh up           # Start everything"
        echo "  ./start.sh test         # Generate a test theme"
        echo "  ./start.sh wp plugin list  # List plugins via WP-CLI"
        echo ""
        ;;
esac
