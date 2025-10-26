# Módulo WhatsApp

## Propósito

Este módulo é responsável pelo **controle de sessões do WhatsApp** e pela integração com a API oficial do WhatsApp Business. Ele gerencia conexões, autenticação, envio/recebimento de mensagens e eventos em tempo real através de WebSockets.

## Como o Controle de Sessão Funciona

### Arquitetura de Sessões

1. **Criação de Sessão**: Cada usuário/cliente pode ter múltiplas sessões ativas
2. **Autenticação**: QR Code gerado para pareamento com dispositivo móvel
3. **Persistência**: Sessões mantidas em memória com possibilidade de reconexão
4. **WebSocket**: Comunicação em tempo real para eventos (QR Code, status, mensagens)

### Fluxo de Autenticação

```
Cliente → Criar Sessão → QR Code → Scan Mobile → Conectado → Pronto para Envio
```

### Estados de Sessão

- `connecting`: Iniciando conexão
- `qr`: Aguardando scan do QR Code
- `connected`: Conectado e autenticado
- `disconnected`: Desconectado (temporário ou permanente)

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