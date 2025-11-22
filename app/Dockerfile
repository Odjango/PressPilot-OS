# --- Base image with Node & pnpm via Corepack ---
    FROM node:20-alpine AS base
    WORKDIR /app
    
    # Enable Corepack so pnpm is available
    RUN corepack enable
    
    # --- Install dependencies layer ---
    FROM base AS deps
    # Copy only package + lockfile first for better caching
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --frozen-lockfile
    
    # --- Build layer ---
    FROM base AS build
    COPY --from=deps /app/node_modules ./node_modules
    # Copy the rest of the app source
    COPY . .
    # Build Next.js for production
    RUN pnpm run build
    
    # --- Runtime image (small & production only) ---
    FROM node:20-alpine AS runner
    WORKDIR /app
    
    ENV NODE_ENV=production
    # Next.js expects HOSTNAME + PORT when running in Docker
    ENV HOSTNAME=0.0.0.0
    ENV PORT=3000
    
    # Enable pnpm via Corepack in the runner too
    RUN corepack enable
    
    # Copy only what is needed to run the app
    COPY --from=build /app/public ./public
    COPY --from=build /app/.next ./.next
    COPY --from=build /app/package.json ./package.json
    COPY --from=deps /app/node_modules ./node_modules
    
    EXPOSE 3000
    
    # Run the production server
    CMD ["pnpm", "start"]
    