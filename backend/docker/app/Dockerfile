# PressPilot M0 — Laravel App Container
# PHP 8.3-fpm + nginx via supervisord
# Internal only (port 8080) — NOT reverse-proxied by Coolify
#
# Build context MUST be the repo root (.), not backend/.
# See docker-compose.m0-laravel.yml: context: .

# Stage 1: Composer dependencies
FROM composer:2.8 AS composer
WORKDIR /app
COPY backend/composer.json backend/composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader \
    --ignore-platform-reqs

# Stage 2: Runtime
FROM php:8.3-fpm-bookworm AS runner

# System packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    libpq-dev \
    libzip-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-install \
    pdo_pgsql \
    pgsql \
    pcntl \
    zip \
    bcmath

# Redis extension via PECL
RUN pecl install redis && docker-php-ext-enable redis

# nginx config
COPY backend/docker/app/nginx.conf /etc/nginx/sites-available/default

# supervisord config
COPY backend/docker/app/supervisord.conf /etc/supervisor/conf.d/presspilot.conf

# Application code
WORKDIR /app
COPY --from=composer /app/vendor ./vendor
COPY backend/ .

# Ensure all required Laravel storage subdirectories exist
RUN mkdir -p /app/storage/framework/cache/data \
             /app/storage/framework/sessions \
             /app/storage/framework/views \
             /app/storage/logs

# Laravel directory permissions
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache && \
    chmod -R 775 /app/storage /app/bootstrap/cache

# ─── SSWG: pattern-library + proven-cores at paths expected by PHP ────────────
# PHP services use base_path('../pattern-library/') => /pattern-library/
# and base_path('../proven-cores/') => /proven-cores/
# These must be siblings of /app/ so the relative paths resolve correctly.
COPY pattern-library /pattern-library
COPY proven-cores /proven-cores

# Runtime entrypoint: ensures storage dirs exist even when volume is empty
COPY backend/docker/app/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

EXPOSE 8080

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/presspilot.conf"]
