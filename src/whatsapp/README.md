# WhatsApp Module

Este módulo fornece funcionalidades para integração com WhatsApp Web através de WebSocket e HTTP APIs, com suporte robusto a múltiplas conexões PostgreSQL usando Prisma.

## Funcionalidades

- Criação e gerenciamento de sessões WhatsApp
- Envio de mensagens de texto
- Stream de eventos em tempo real (QR codes, status de conexão)
- API WebSocket para comunicação bidirecional
- Sistema de múltiplas conexões PostgreSQL por cliente
- Pool de conexões otimizado com health check automático
- Transações isoladas e logging detalhado
- Documentação Swagger completa

## Arquitetura de Banco de Dados

### Configuração Multi-Schema

O sistema utiliza schemas PostgreSQL separados para cada cliente:
- Schema padrão: `client_{clientId}`
- Configuração via variáveis de ambiente no `.env`

### Modelos de Dados

#### Session
```prisma
model Session {
  id          String   @id @default(cuid())
  sessionId   String   @unique
  clientId    String
  status      String   @default("disconnected")
  qrCode      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### Contact
```prisma
model Contact {
  id          String   @id @default(cuid())
  sessionId   String
  phoneNumber String
  name        String?
  profilePic  String?
  isGroup     Boolean  @default(false)
}
```

#### Message
```prisma
model Message {
  id          String   @id @default(cuid())
  sessionId   String
  contactId   String
  messageId   String   @unique
  content     String
  type        String   @default("text")
  direction   String   // "inbound" or "outbound"
  status      String   @default("pending")
  timestamp   DateTime
}
```

## Sistema de Conexões

### ConnectionManager

Gerencia pool de conexões ativas por schema:

```typescript
// Obter conexão para cliente específico
const client = await connectionManager.getConnection('cliente123');

// Executar transação isolada
const result = await connectionManager.executeTransaction('cliente123', async (tx) => {
  const session = await tx.session.create({
    data: { sessionId: 'session-123', clientId: 'cliente123' }
  });
  return session;
});
```

### Health Check Automático

- Verificação a cada 30 segundos
- Reconexão automática em caso de falha
- Limpeza de conexões inativas (5+ minutos)

### Logging de Operações

Todas as operações são logadas com:
- Duração da operação
- Schema utilizado
- Status de sucesso/erro
- Timestamp detalhado

## Guia de Implementação

### 1. Adicionar Novo Cliente

```typescript
// 1. O schema será criado automaticamente na primeira conexão
const clientId = 'novo_cliente_123';

// 2. Executar migração do Prisma para o novo schema
await connectionManager.getConnection(clientId);

// 3. Criar primeira sessão
const session = await connectionManager.executeTransaction(clientId, async (tx) => {
  return tx.session.create({
    data: {
      sessionId: `session_${Date.now()}`,
      clientId,
      status: 'disconnected'
    }
  });
});
```

### 2. Operações CRUD

#### Criar Mensagem
```typescript
const message = await connectionManager.executeTransaction(clientId, async (tx) => {
  return tx.message.create({
    data: {
      sessionId: session.id,
      contactId: contact.id,
      messageId: `msg_${Date.now()}`,
      content: 'Olá!',
      direction: 'outbound',
      timestamp: new Date()
    }
  });
});
```

#### Buscar Mensagens
```typescript
const client = await connectionManager.getConnection(clientId);
const messages = await client.message.findMany({
  where: { sessionId },
  include: { contact: true },
  orderBy: { timestamp: 'desc' }
});
```

#### Atualizar Status da Sessão
```typescript
await connectionManager.executeTransaction(clientId, async (tx) => {
  return tx.session.update({
    where: { sessionId },
    data: { status: 'connected' }
  });
});
```

### 3. Monitoramento de Saúde

```typescript
// Verificar saúde de conexão específica
const isHealthy = await healthCheckService.checkSingleConnection(clientId);

// Health check automático roda a cada 30 segundos via @Cron
```

## Estrutura dos Arquivos

```
whatsapp/
├── README.md                    # Este arquivo
├── whatsapp.module.ts          # Módulo NestJS principal
├── whatsapp.controller.ts      # Endpoints REST API
├── whatsapp.gateway.ts         # WebSocket Gateway
├── whatsapp.service.ts         # Lógica de negócio principal
├── whatsapp.controller.spec.ts # Testes do controller
├── whatsapp.service.spec.ts    # Testes do service
└── dto/                        # Data Transfer Objects
    ├── create-session.dto.ts   # DTO para criação de sessão
    ├── send-message.dto.ts     # DTO para envio de mensagem
    ├── websocket.dto.ts        # DTOs para WebSocket
    └── responses.dto.ts        # DTOs de resposta
```

## Dependências Necessárias

### Principais
- `@whiskeysockets/baileys`: Cliente WhatsApp não-oficial
- `@nestjs/websockets`: WebSocket support
- `@nestjs/platform-socket.io`: Socket.IO adapter
- `qrcode`: Geração de QR Codes
- `class-validator`: Validação de DTOs
- `class-transformer`: Transformação de dados

### Desenvolvimento
- `@types/qrcode`: Tipos TypeScript para qrcode

## Integração com API do WhatsApp

### Endpoints REST

- `POST /whatsapp/session` - Criar nova sessão
- `GET /whatsapp/sessions` - Listar sessões ativas
- `POST /whatsapp/send` - Enviar mensagem
- `GET /whatsapp/stream` - Stream de eventos (SSE)

### WebSocket Events

#### Cliente → Servidor
- `join-session`: Entrar em uma sessão específica
- `leave-session`: Sair de uma sessão
- `send-message`: Enviar mensagem via WebSocket
- `get-sessions`: Obter lista de sessões

#### Servidor → Cliente
- `qr-code`: QR Code para autenticação
- `status-change`: Mudança de status da sessão
- `message-received`: Nova mensagem recebida
- `error`: Erro na sessão

## Configuração

### Variáveis de Ambiente

```env
# WhatsApp Configuration
WHATSAPP_SESSION_TIMEOUT=300000  # 5 minutos
WHATSAPP_MAX_SESSIONS=10         # Máximo de sessões simultâneas
WHATSAPP_QR_TIMEOUT=60000        # Timeout do QR Code (1 minuto)
```

## Uso Básico

### Criar Sessão

```typescript
const response = await fetch('/whatsapp/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId: 'user123' })
});
```

### Conectar via WebSocket

```javascript
const socket = io('/whatsapp');
socket.emit('join-session', { sessionId: 'user123' });
socket.on('qr-code', (data) => {
  // Exibir QR Code para o usuário
});
```

### Enviar Mensagem

```typescript
const response = await fetch('/whatsapp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'user123',
    to: '5511999999999',
    message: 'Olá! Como posso ajudar?'
  })
});
```

## Segurança

- Validação rigorosa de entrada com `class-validator`
- Sanitização de números de telefone
- Rate limiting por sessão
- Timeout automático de sessões inativas
- Logs de auditoria para todas as operações

## Monitoramento

- Métricas de conexões ativas
- Status de saúde das sessões
- Logs estruturados para debugging
- Eventos de erro centralizados

## Limitações

- Máximo de 10 sessões simultâneas por instância
- QR Code expira em 60 segundos
- Reconexão automática limitada a 3 tentativas
- Mensagens limitadas a 4096 caracteres