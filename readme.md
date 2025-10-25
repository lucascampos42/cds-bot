# 📱 WhatsApp Microservice

**WhatsApp Microservice** é um serviço especializado para envio de mensagens via WhatsApp, projetado para ser integrado por outros sistemas que precisam enviar avisos, notificações e campanhas promocionais.

## 💡 Sobre o Projeto

Este microserviço foi desenvolvido para fornecer uma API simples e robusta para envio de mensagens WhatsApp, oferecendo:

- **API RESTful**: Endpoints simples para integração com qualquer sistema
- **Envio de Avisos**: Notificações automáticas para usuários
- **Campanhas Promocionais**: Envio de propagandas e ofertas
- **Multi-instância**: Suporte a múltiplas contas WhatsApp
- **Confiabilidade**: Reconexão automática e controle de status

## 🏗️ Arquitetura

Microserviço containerizado com arquitetura simples e eficiente:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Sistemas       │    │   WhatsApp      │    │   WhatsApp      │
│  Externos       │◄──►│   Microservice  │◄──►│   API           │
│  (Clientes)     │    │   NestJS        │    │   (Baileys)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   (Opcional)    │
                    └─────────────────┘
```

## 🚀 Tecnologias

### Core do Microserviço
- **Framework**: NestJS 11 com TypeScript
- **WhatsApp API**: Baileys (Multi-device API)
- **Documentação**: OpenAPI/Swagger
- **Segurança**: JWT, Rate Limiting, CORS
- **Logs**: Sistema de logs estruturados
- **Testes**: Jest (unitários e e2e)

### Infraestrutura
- **Containerização**: Docker + Docker Compose
- **Banco de Dados**: PostgreSQL (opcional para logs/histórico)
- **Deploy**: Suporte a containers e cloud

## ✨ Funcionalidades

### 📱 Envio de Mensagens
- **Envio de Texto**: Mensagens simples via API REST
- **Avisos Automáticos**: Notificações para usuários específicos
- **Campanhas Promocionais**: Envio em massa de ofertas e propagandas
- **Validação de Números**: Verificação automática de números válidos
- **Status de Entrega**: Confirmação de envio e entrega

### 🔧 Gestão de Instâncias
- **Multi-instância**: Múltiplas contas WhatsApp simultâneas
- **QR Code**: Autenticação via endpoint dedicado
- **Reconexão Automática**: Recuperação de falhas de conexão
- **Status em Tempo Real**: Monitoramento de conexões ativas
- **Isolamento**: Cada instância opera independentemente

### 🔐 Segurança e Controle
- **API Key Authentication**: Autenticação entre sistemas via chaves de API
- **Rate Limiting**: Proteção contra spam e abuso
- **Logs Detalhados**: Rastreamento de todas as operações
- **Validação de Entrada**: Sanitização automática de dados

### 🚀 Integração
- **API RESTful**: Endpoints simples e documentados
- **Webhooks**: Notificações de status para sistemas externos
- **Formato JSON**: Comunicação padronizada
- **SDKs**: Bibliotecas para linguagens populares (em desenvolvimento)

## 🚀 Como Executar

### Pré-requisitos
- Docker e Docker Compose
- Node.js 20+ (para desenvolvimento local)

### Execução com Docker (Recomendado)

1. **Clone o repositório**:
   ```bash
   git clone <url-do-repositorio>
   cd whatsapp-microservice
   ```

2. **Configure as variáveis de ambiente**:
   ```bash
   cp back-nestjs/.env.example back-nestjs/.env
   # Edite as variáveis conforme necessário
   ```

3. **Execute o microserviço**:
   ```bash
   docker-compose up -d
   ```

4. **Acesse o serviço**:
   - **API**: http://localhost:3000
   - **Documentação**: http://localhost:3000/docs

### Desenvolvimento Local

```bash
cd back-nestjs
npm install
cp .env.example .env
# Configure as variáveis no .env
npm run start:dev
```

### Exemplo de Uso da API

```bash
# Enviar mensagem
curl -X POST http://localhost:3000/whatsapp/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "instance": "default",
    "number": "5511999999999",
    "message": "Olá! Esta é uma mensagem de teste."
  }'
```

## 📚 Documentação da API

### Endpoints Principais

#### WhatsApp
```
GET  /whatsapp/instances - Listar instâncias ativas
POST /whatsapp/qr/:instance - Obter QR Code para autenticação
POST /whatsapp/send - Enviar mensagem
GET  /whatsapp/status/:instance - Status da instância
```

#### Monitoramento
```
GET  /health - Status do serviço
GET  /metrics - Métricas de uso (opcional)
```

### Documentação Interativa
- **Swagger UI**: http://localhost:3000/docs
- **OpenAPI JSON**: http://localhost:3000/docs-json

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Aplicação
PORT=3000
NODE_ENV=production

# JWT (para autenticação da API)
JWT_SECRET="your-super-secret-key"
JWT_ACCESS_TTL="24h"

# WhatsApp
WHATSAPP_SESSION_PATH="./baileys_auth"
WHATSAPP_MAX_INSTANCES=5

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Database (opcional - para logs)
DATABASE_URL="postgresql://user:password@localhost:5432/whatsapp-service"
```

## 🛡️ Segurança

- **Rate Limiting**: Proteção contra spam e abuso
- **JWT Authentication**: Acesso seguro à API
- **CORS**: Configuração de origens permitidas
- **Validação**: Sanitização automática de entrada
- **Logs**: Rastreamento de todas as operações

## 📊 Monitoramento

- **Health Check**: `GET /health` - Status do serviço
- **Logs Estruturados**: Rastreamento de mensagens enviadas
- **Métricas**: Contadores de envio e falhas
- **Status WhatsApp**: Monitoramento de conexões ativas

## 🧪 Testes

```bash
cd back-nestjs

# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 🚀 Deploy

### Docker
```bash
docker build -t whatsapp-microservice .
docker run -p 3000:3000 whatsapp-microservice
```

### Cloud
- Suporte a Heroku, AWS, Google Cloud
- Variáveis de ambiente via secrets
- Volumes persistentes para sessões WhatsApp

## 📄 Licença

Este projeto está sob a licença MIT.

---

<div align="center">
  <strong>📱 Microserviço WhatsApp - Envio de avisos e propagandas</strong>
</div>