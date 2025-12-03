# Dockerfile for PressPilot-OS (YT Summarizer + main app) on Coolify
# Uses npm (since package-lock.json is present) and a multi-stage build.

# 1. Base image
FROM node:20-alpine AS base
WORKDIR /app

# 2. Dependencies
FROM base AS deps
# libc6-compat is often needed for some Node modules on Alpine
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
# Install dependencies based on lockfile
RUN npm ci

# 3. Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
# Build the application (Next.js)
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

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy themes folder as it is required by PressPilot
COPY --from=builder --chown=nextjs:nodejs /app/themes ./themes

USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
