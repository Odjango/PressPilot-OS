# PressPilot M0 — Laravel Horizon Worker Container
# PHP 8.3-cli — Runs Horizon queue worker for SSWG Laravel pipeline.
#
# The old Node.js generator has been removed (2026-03-08).
# Theme generation is now 100% PHP via the SSWG Laravel pipeline.
#
# Build context MUST be the repo root (.), not backend/.
# See docker-compose.m0-laravel.yml: context: .

FROM php:8.3-cli-bookworm

# System packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libzip-dev \
    curl \
    ca-certificates \
    unzip \
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

# ─── Laravel application code ────────────────────────────────────────────────
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer
WORKDIR /app

COPY backend/composer.json backend/composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader \
    --ignore-platform-reqs

COPY backend/ .

# Laravel directory permissions
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache && \
    chmod -R 775 /app/storage /app/bootstrap/cache

# Create job scratch directory
RUN mkdir -p /tmp/pp-jobs && chown www-data:www-data /tmp/pp-jobs

# ─── SSWG: pattern-library + proven-cores at paths expected by PHP ────────────
# PHP services use base_path('../pattern-library/') => /pattern-library/
# and base_path('../proven-cores/') => /proven-cores/
# These must be siblings of /app/ so the relative paths resolve correctly.
COPY pattern-library /pattern-library
COPY proven-cores /proven-cores

CMD ["php", "artisan", "horizon"]
