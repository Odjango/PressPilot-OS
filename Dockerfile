# ---- Base image ----
FROM node:22-alpine AS base
WORKDIR /app

# ---- Install deps ----
FROM base AS deps
RUN corepack enable
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# ---- Build stage ----
FROM deps AS build
COPY . .
RUN pnpm run build

# ---- Production Deps ----
FROM base AS prod-deps
RUN corepack enable
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile

# ---- Production runner ----
FROM node:22-alpine AS runner
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
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/themes ./themes

EXPOSE 3000

# Run the production server
CMD ["pnpm", "start"]
