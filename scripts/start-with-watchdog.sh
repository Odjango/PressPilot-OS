#!/bin/bash

# STARTUP SCRIPT: Watchdog + Next.js

# 1. Setup Watchdog Cron
echo "Setting up Watchdog..."
# Write out current crontab
crontab -l > mycron 2>/dev/null
# Echo new cron into cron file (Run every 5 minutes)
echo "*/5 * * * * /bin/bash /app/scripts/watchdog.sh >> /var/log/cron.log 2>&1" >> mycron
# Install new cron file
crontab mycron
rm mycron

# 2. Start Cron Service
service cron start

# 3. Start Next.js App
echo "Starting PressPilot OS..."
exec npm start
