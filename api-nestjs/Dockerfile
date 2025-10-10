## Stage 1: Dependencies (Bun)
FROM oven/bun:1 AS deps

WORKDIR /usr/src/app

# Dependências de sistema para Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Arquivos de dependências
COPY package*.json ./
COPY bun.lock bun.lock
COPY prisma ./prisma/

# Instalação com Bun (forçada)
RUN bun install --force

## Stage 2: Build (Bun)
FROM oven/bun:1 AS builder

WORKDIR /usr/src/app

# Dependências de sistema
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copiar dependências da stage anterior
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/bun.lock ./bun.lock
COPY --from=deps /usr/src/app/prisma ./prisma
COPY package*.json ./

# Copiar código fonte
COPY . .

# Selecionar arquivo de ambiente para geração do Prisma Client
RUN if [ -f .env.docker ]; then cp .env.docker .env; else cp .env.example .env; fi

# Gerar Prisma Client (via bunx)
RUN bunx prisma generate

# Build da aplicação (usa script "build": nest build)
RUN bun run build

## Stage 3: Runtime (Bun)
FROM oven/bun:1 AS runner

WORKDIR /usr/src/app

# Dependências de sistema (OpenSSL para Prisma em runtime)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copiar artefatos
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/bun.lock ./bun.lock

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Comando padrão: executar app com Bun
CMD ["bun", "./dist/main.js"]
