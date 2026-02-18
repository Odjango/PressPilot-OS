FROM node:20-slim

WORKDIR /app

# Install system dependencies for Chromium
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    chromium \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps && npm cache clean --force

# Install Playwright Chromium
RUN npx playwright install chromium

COPY . .

RUN npm run build && rm -rf .git node_modules/.cache

RUN mkdir -p output && chmod 777 output

EXPOSE 3000
CMD ["npm", "start"]
