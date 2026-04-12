# Build stage - Backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copiar package.json e instalar dependências
COPY backend/package*.json ./
RUN npm ci --production

# Copiar código fonte e compilar
COPY backend/src ./src
COPY backend/tsconfig.json ./
COPY backend/prisma ./prisma

RUN npm run build && npm run prisma:generate

# ============================================
# Build stage - Frontend Painel
# ============================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend-painel

# Copiar package.json e instalar dependências
COPY frontend-painel/package*.json ./
RUN npm ci

# Copiar código e fazer build
COPY frontend-painel . .
RUN npm run build

# ============================================
# Build stage - Site Principal
# ============================================
FROM node:18-alpine AS site-builder

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código
COPY . .
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=frontend-builder /app/frontend-painel/dist ./frontend-painel/dist

# Build do site principal
RUN npm run build || true

# ============================================
# Production stage
# ============================================
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5032

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar arquivos do backend builder
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/prisma ./backend/prisma

# Copiar arquivos do frontend builder
COPY --from=frontend-builder /app/frontend-painel/dist ./frontend-painel/dist

# Copiar arquivos do site builder
COPY --from=site-builder /app/dist ./dist

# Copiar package.json para referência
COPY backend/package*.json ./backend/
COPY package*.json ./

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5032/api/health || exit 1

# Expor porta
EXPOSE 5032

# Comando de inicialização
CMD ["node", "backend/dist/server.js"]
