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

# Instalar dependências de sistema para o PostgreSQL client, OpenSSL e dos2unix
RUN apt-get update && apt-get install -y postgresql-client openssl dos2unix && rm -rf /var/lib/apt/lists/*

# Copiar artefatos da build
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/bun.lock ./bun.lock

# Copiar o schema do Prisma e o seed script compilado
COPY --from=builder /usr/src/app/prisma ./prisma

# Copiar, converter e dar permissão de execução para o entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN dos2unix /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Definir o entrypoint e o comando padrão
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["bun", "./dist/src/main.js"]
