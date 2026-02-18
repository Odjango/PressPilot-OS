FROM node:20-slim

WORKDIR /app

# Install system Chromium (Playwright will use this)
RUN apt-get update && \
    apt-get install -y --no-install-recommends chromium && \
    rm -rf /var/lib/apt/lists/*

ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps && npm cache clean --force

COPY . .

RUN npm run build && rm -rf .git node_modules/.cache

RUN mkdir -p output && chmod 777 output

EXPOSE 3000
CMD ["npm", "start"]
