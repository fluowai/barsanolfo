# Build stage - Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

RUN apk add --no-cache openssl

# Install all dependencies because the TypeScript build needs devDependencies.
COPY backend/package*.json ./
RUN npm ci --include=dev

COPY backend/src ./src
COPY backend/tsconfig.json ./
COPY backend/prisma ./prisma

RUN npm run prisma:generate
RUN npm run build
RUN npm prune --omit=dev

# ============================================
# Build stage - Frontend Painel
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend-painel

COPY frontend-painel/package*.json ./
RUN npm ci --include=dev

COPY frontend-painel/ ./
RUN npm run build

# ============================================
# Build stage - Site Principal
# ============================================
FROM node:20-alpine AS site-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY . ./
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=frontend-builder /app/frontend-painel/dist ./frontend-painel/dist

RUN npx vite build

# ============================================
# Production stage
# ============================================
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5032

RUN apk add --no-cache curl openssl

COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/prisma ./backend/prisma
COPY --from=frontend-builder /app/frontend-painel/dist ./frontend-painel/dist
COPY --from=site-builder /app/dist ./dist

COPY backend/package*.json ./backend/
COPY package*.json ./

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5032/api/health || exit 1

EXPOSE 5032

CMD ["node", "backend/dist/server.js"]
