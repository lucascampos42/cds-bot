FROM oven/bun:1

WORKDIR /usr/src/app

# Instalar dependências de sistema
RUN apt-get update && apt-get install -y openssl postgresql-client

# Instalar ferramentas globais
RUN bun add -g prisma @nestjs/cli

# Copiar arquivos de dependência
COPY package*.json ./
COPY bun.lock ./

# Instalar dependências do projeto
RUN bun install

# Copiar o restante do código
COPY . .

# Manter o container rodando para que possamos executar comandos nele
CMD ["tail", "-f", "/dev/null"]