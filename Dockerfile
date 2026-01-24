FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

# CRITICAL FIX: Use --legacy-peer-deps to bypass React 19 vs 18 conflicts
RUN npm ci --legacy-peer-deps

COPY . .

# Ensure the generator has permission to write zip files
RUN mkdir -p output && chmod 777 output

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
