FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# CRITICAL: Create output folder and ensure write permissions for the generator
RUN mkdir -p output && chmod 777 output

# Build the Next.js application
RUN npm run build

# Expose port and start
EXPOSE 3000
CMD ["npm", "start"]
