# 1. Setup Arguments and Base
ARG NODE_VERSION=24
ARG ALPINE_VERSION=3.23
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# 2. Dependencies Stage
# Only copy files needed for install to leverage layer caching
FROM base AS deps
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

# 3. Build Stage
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build
# Prune dev dependencies after build to save space
RUN pnpm prune --prod

# 4. Production Stage (Final)
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS production
WORKDIR /app

# Install curl for the healthcheck only
RUN apk add --no-cache curl tini

# Security: Run as a non-root user
USER node

# Copy only the necessary artifacts from the build stage
COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD ["node", "build/index.js"]
