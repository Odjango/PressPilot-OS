# PressPilot M0 — Laravel Horizon Worker Container
# PHP 8.3-cli + Node.js 20 LTS + pre-installed generator deps
# Runs Horizon and invokes the Node generator via subprocess.
#
# Build context MUST be the repo root (.), not backend/.
# See docker-compose.m0-laravel.yml: context: .

# ─── Stage 1: Install generator Node.js dependencies ────────────────────────
FROM node:20-bookworm-slim AS generator-deps
WORKDIR /deps
COPY package.json package-lock.json .npmrc ./
# --ignore-scripts: skip postinstall hooks (Puppeteer Chromium download, etc.)
# Full install (not --omit=dev) because tsx is a devDependency.
RUN npm ci --ignore-scripts

# ─── Stage 2: PHP + Node runtime ────────────────────────────────────────────
FROM php:8.3-cli-bookworm

# System packages + NodeSource setup
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libzip-dev \
    curl \
    gnupg \
    ca-certificates \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Node.js 20 LTS via NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-install \
    pdo_pgsql \
    pgsql \
    pcntl \
    zip \
    bcmath

# Redis extension via PECL
RUN pecl install redis && docker-php-ext-enable redis

# ─── Generator Node.js dependencies (from stage 1) ──────────────────────────
# Stored outside /app/generator so the read-only bind-mount doesn't shadow them.
# NODE_PATH tells Node's CJS resolver to check this directory for packages.
# PATH addition makes tsx, npx, and other .bin scripts available.
COPY --from=generator-deps /deps/node_modules /opt/generator-deps/node_modules
ENV NODE_PATH=/opt/generator-deps/node_modules
ENV PATH="/opt/generator-deps/node_modules/.bin:${PATH}"

# ─── Laravel application code ────────────────────────────────────────────────
# Build context is repo root, so Laravel files are under backend/
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

# ─── Generator source code (COPY instead of bind-mount for Coolify) ─────────
# Build context is repo root, so we copy the full generator structure.
COPY src/generator /app/generator/src/generator
COPY lib /app/generator/lib
COPY proven-cores /app/generator/proven-cores
COPY tsconfig.json /app/generator/tsconfig.json
COPY bin /app/generator/bin
# Node.js deps are pre-installed at /opt/generator-deps/node_modules (stage 1).
# tsx resolves @/ path aliases from /app/generator/tsconfig.json (via cwd).
#
# Invocation chain (from GenerateThemeJob.php):
#   Process::path('/app/generator')->run('npx tsx /app/generator/bin/generate.ts')

CMD ["php", "artisan", "horizon"]
