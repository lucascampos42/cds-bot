FROM oven/bun:1

WORKDIR /usr/src/app

# Instalar dependências de sistema
RUN apt-get update && apt-get install -y openssl postgresql-client

# Copiar arquivos de dependência
COPY package*.json ./
COPY bun.lock ./

# Instalar TODAS as dependências
RUN bun install --production=false

# Copiar o restante do código
COPY . .

# Copiar e preparar o entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN sed -i 's/\r$//g' /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]