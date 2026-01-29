# Multi-stage Dockerfile for DANI Frontend (Development & Production)
# Development: docker build --target dev -f Dockerfile .
# Production: docker build --target production -f Dockerfile .

# ============================================================================
# Stage 1: Base - Install dependencies
# ============================================================================
FROM node:20-alpine AS base

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# ============================================================================
# Stage 2: Development - Hot reload enabled
# ============================================================================
FROM base AS dev

WORKDIR /app

# Copy all source files (will be overridden by volume mount in docker-compose)
COPY . .

ENV NODE_ENV=development
ENV PORT=3000

# Expose port
EXPOSE 3000

# Run development server with hot reload
CMD ["npm", "run", "dev"]

# ============================================================================
# Stage 3: Builder - Build production assets
# ============================================================================
FROM base AS builder

WORKDIR /app

# Copy source code
COPY . .

# Build arguments for NEXT_PUBLIC_* vars (embedded at build time)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID

# Set as environment variables for the build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

# Build the application
RUN npm run build

# ============================================================================
# Stage 4: Production - Optimized runtime
# ============================================================================
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built assets from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Add metadata labels
LABEL org.opencontainers.image.title="DANI UI"
LABEL org.opencontainers.image.description="AI-powered document analysis frontend"
LABEL org.opencontainers.image.version="1.0.0"
LABEL maintainer="DANI Team"

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["node", "server.js"]
