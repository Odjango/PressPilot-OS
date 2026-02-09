# PressPilot M0 — Laravel App Container
# PHP 8.3-fpm + nginx via supervisord
# Internal only (port 8080) — NOT reverse-proxied by Coolify

# Stage 1: Composer dependencies
FROM composer:2.8 AS composer
WORKDIR /app
COPY composer.json composer.lock ./
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

# PHP-FPM configuration
RUN sed -i 's/listen = 127.0.0.1:9000/listen = \/run\/php-fpm.sock/' /usr/local/etc/php-fpm.d/www.conf && \
    echo "listen.owner = www-data" >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "listen.group = www-data" >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "listen.mode = 0660" >> /usr/local/etc/php-fpm.d/www.conf

# nginx config
COPY docker/app/nginx.conf /etc/nginx/sites-available/default

# supervisord config
COPY docker/app/supervisord.conf /etc/supervisor/conf.d/presspilot.conf

# Application code
WORKDIR /app
COPY --from=composer /app/vendor ./vendor
COPY . .

# Laravel directory permissions
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache && \
    chmod -R 775 /app/storage /app/bootstrap/cache

# Create PHP-FPM socket directory
RUN mkdir -p /run && chown www-data:www-data /run

EXPOSE 8080

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/presspilot.conf"]
