#!/bin/bash

# WATCHDOG SCRIPT: PressPilot Self-Healing
# Pings the site. If down, logs it and restarts the container.

# CONFIGURATION
URL="https://factory.presspilotapp.com"
LOG_FILE="/app/watchdog_history.log"
CONTAINER_NAME="presspilot-app" # Adjust if running inside container or on host

# DATE
NOW=$(date '+%Y-%m-%d %H:%M:%S')

# CHECK STATUS
# We follow redirects (-L) and look for 200 OK
HTTP_CODE=$(curl -L -s -o /dev/null -w "%{http_code}" "$URL")

if [ "$HTTP_CODE" != "200" ]; then
    # SITE IS DOWN (Or returning error)
    echo "[$NOW] CRITICAL: Site returned $HTTP_CODE. Triggering restart..." >> "$LOG_FILE"
    
    # Trigger Restart (This assumes script runs with Docker privileges)
    # If running INSIDE the container, we might just kill the node process to let Docker restart it?
    # Or exit with error?
    
    # STRATEGY: Exit with error to force Docker Restart Policy to kick in.
    echo "Exiting with error to trigger Docker restart..."
    kill 1 # Kills the PID 1 (Node) process inside the container
else
    # SITE IS UP
    # Optional: Log success (Every hour only? Logic omitted for simplicity)
    # echo "[$NOW] Status OK" >> "$LOG_FILE"
    :
fi
