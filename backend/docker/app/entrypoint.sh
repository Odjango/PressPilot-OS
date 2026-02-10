#!/bin/sh
set -e

mkdir -p /app/storage/framework/cache/data \
         /app/storage/framework/sessions \
         /app/storage/framework/views \
         /app/storage/logs

chown -R www-data:www-data /app/storage

exec "$@"
