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
RUN --mount=type=secret,id=DATABASE_HOST \
    --mount=type=secret,id=DATABASE_PORT \
    --mount=type=secret,id=DATABASE_NAME \
    --mount=type=secret,id=DATABASE_USERNAME \
    --mount=type=secret,id=DATABASE_PASSWORD \
    --mount=type=secret,id=APP_KEYS \
    --mount=type=secret,id=API_TOKEN_SALT \
    --mount=type=secret,id=ADMIN_JWT_SECRET \
    --mount=type=secret,id=JWT_SECRET \
    --mount=type=secret,id=TRANSFER_TOKEN_SALT \
    --mount=type=secret,id=AWS_BUCKET \
    --mount=type=secret,id=AWS_ACCESS_KEY_ID \
    --mount=type=secret,id=AWS_SECRET_ACCESS_KEY \
    --mount=type=secret,id=AWS_REGION \
    --mount=type=secret,id=AWS_ENDPOINT \
    set -eu; \
    export DATABASE_HOST="$(cat /run/secrets/DATABASE_HOST)"; \
    export DATABASE_PORT="$(cat /run/secrets/DATABASE_PORT)"; \
    export DATABASE_NAME="$(cat /run/secrets/DATABASE_NAME)"; \
    export DATABASE_USERNAME="$(cat /run/secrets/DATABASE_USERNAME)"; \
    export DATABASE_PASSWORD="$(cat /run/secrets/DATABASE_PASSWORD)"; \
    export APP_KEYS="$(cat /run/secrets/APP_KEYS)"; \
    export API_TOKEN_SALT="$(cat /run/secrets/API_TOKEN_SALT)"; \
    export ADMIN_JWT_SECRET="$(cat /run/secrets/ADMIN_JWT_SECRET)"; \
    export JWT_SECRET="$(cat /run/secrets/JWT_SECRET)"; \
    export TRANSFER_TOKEN_SALT="$(cat /run/secrets/TRANSFER_TOKEN_SALT)"; \
    export AWS_BUCKET="$(cat /run/secrets/AWS_BUCKET)"; \
    export AWS_ACCESS_KEY_ID="$(cat /run/secrets/AWS_ACCESS_KEY_ID)"; \
    export AWS_SECRET_ACCESS_KEY="$(cat /run/secrets/AWS_SECRET_ACCESS_KEY)"; \
    export AWS_REGION="$(cat /run/secrets/AWS_REGION)"; \
    export AWS_ENDPOINT="$(cat /run/secrets/AWS_ENDPOINT)"; \
    echo "Cache bust: $CACHE_BUST"; \
    npm run build; \
    npm run copy:schemas

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
