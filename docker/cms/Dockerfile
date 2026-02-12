# syntax=docker/dockerfile:1

# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

COPY apps/cms/package.json apps/cms/package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:22-alpine AS builder
WORKDIR /app

# Cache buster - change this to force rebuild
ARG CACHE_BUST=1

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

COPY --from=deps /app/node_modules ./node_modules
COPY apps/cms/ ./

# Build Strapi (includes admin panel)
# Note: Strapi v5 runs from ./dist in production. We ensure JSON schemas/components
# are present there; otherwise Content API endpoints can return 404 in prod.
RUN echo "Cache bust: $CACHE_BUST" && npm run build && npm run copy:schemas

# Stage 3: Production runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
# PORT is set by Yandex Cloud Serverless (8080) or can be overridden

# Runtime dependencies
RUN apk add --no-cache libpq

# Security: run as non-root user
RUN addgroup --system --gid 1001 strapi && \
    adduser --system --uid 1001 strapi

# Copy built application
COPY --from=builder --chown=strapi:strapi /app/dist ./dist
# Copy admin panel build to root (Strapi 5 expects it at ./build)
COPY --from=builder --chown=strapi:strapi /app/dist/build ./build
COPY --from=builder --chown=strapi:strapi /app/node_modules ./node_modules
COPY --from=builder --chown=strapi:strapi /app/package.json ./
COPY --from=builder --chown=strapi:strapi /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=strapi:strapi /app/config ./config
COPY --from=builder --chown=strapi:strapi /app/src ./src
COPY --from=builder --chown=strapi:strapi /app/public ./public
COPY --from=builder --chown=strapi:strapi /app/favicon.png ./favicon.png

# Create uploads directory (will be overridden by S3 in production)
RUN mkdir -p ./public/uploads && chown strapi:strapi ./public/uploads

# Strapi writes user migrations and tmp files at runtime.
# Since we run as a non-root user, ensure /app is writable.
RUN mkdir -p ./database/migrations ./tmp && \
    chown -R strapi:strapi ./database ./tmp && \
    chown strapi:strapi /app

USER strapi

EXPOSE 8080

# Healthcheck uses PORT env var (default 8080 for YC Serverless)
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/_health || exit 1

CMD ["npm", "run", "start"]
