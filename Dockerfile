# Dockerfile for PressPilot-OS (YT Summarizer) on Coolify
# Uses npm (since package-lock.json is present) and multi-stage build.
# SECURITY: Runtime secrets only. No secret ARGs.

# 1. Base image
# 1. Base image
FROM node:20-bookworm-slim AS base
WORKDIR /app

# 2. Dependencies
FROM base AS deps
# Install dependencies for canvas and node-gyp
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Fix: Set PYTHON for node-gyp
ENV PYTHON=/usr/bin/python3

COPY package.json package-lock.json ./
# Install dependencies based on lockfile
RUN npm ci

# 3. Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# 4. Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# We are using the standard "npm start" (next start) so we need node_modules and the built .next folder
# (If we used "output: standalone" in next.config.mjs, we would copy .next/standalone instead)
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy themes folder as it is required by PressPilot
COPY --from=builder --chown=nextjs:nodejs /app/themes ./themes

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
