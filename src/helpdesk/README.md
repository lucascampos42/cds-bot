# Módulo Helpdesk

## Propósito

Este módulo é responsável por toda a **lógica de atendimento via WhatsApp**, incluindo fluxos de conversação, tratamento de mensagens e registro de interações entre clientes e agentes de suporte.

## Funcionalidades Principais

### Gestão de Conversas
- Criação automática de conversas a partir de mensagens recebidas
- Atribuição de agentes para atendimento
- Controle de status (aguardando, ativa, encerrada)
- Sistema de prioridades (baixa, normal, alta, urgente)

### Fluxos de Conversação
- Roteamento inteligente de mensagens
- Templates de resposta automática
- Escalação por prioridade
- Histórico completo de interações

### Tratamento de Mensagens
- Processamento de mensagens recebidas
- Validação e sanitização de conteúdo
- Integração com módulo WhatsApp para envio
- Suporte a diferentes tipos de mídia

### Registro de Interações
- Log completo de todas as interações
- Métricas de tempo de resposta
- Análise de performance dos agentes
- Relatórios de atendimento

## Estrutura dos Arquivos

```
helpdesk/
├── README.md                       # Este arquivo
├── helpdesk.module.ts             # Módulo NestJS principal
├── helpdesk.controller.ts         # Endpoints REST API
├── helpdesk.service.ts            # Lógica de negócio principal
├── services/                      # Services especializados
│   ├── conversation.service.ts    # Gestão de conversas
│   └── interaction.service.ts     # Registro de interações
└── dto/                          # Data Transfer Objects
    ├── start-conversation.dto.ts  # DTO para iniciar conversa
    └── send-response.dto.ts       # DTO para enviar resposta
```

## Dependências Necessárias

### Internas
- `WhatsappModule`: Para envio de mensagens
- `@nestjs/common`: Core do NestJS
- `@nestjs/swagger`: Documentação da API

### Externas
- `class-validator`: Validação de DTOs
- `class-transformer`: Transformação de dados

## Fluxo de Atendimento

### 1. Início da Conversa
```
Cliente envia mensagem → WhatsApp Module → Helpdesk cria conversa → Atribui agente
```

### 2. Atendimento Ativo
```
Agente responde → Helpdesk processa → WhatsApp Module envia → Cliente recebe
```

### 3. Encerramento
```
Agente/Cliente encerra → Helpdesk registra → Conversa arquivada
```

## Endpoints da API

### Conversas

#### `POST /helpdesk/conversation/start`
Inicia uma nova conversa de atendimento.

**Body:**
```json
{
  "customerPhone": "5511999999999",
  "sessionId": "session_123",
  "initialMessage": "Preciso de ajuda",
  "priority": "normal"
}
```

#### `GET /helpdesk/conversations`
Lista conversas ativas com filtros opcionais.

**Query Parameters:**
- `status`: Filtrar por status (waiting, active, closed)
- `agent`: Filtrar por ID do agente

#### `POST /helpdesk/conversation/{conversationId}/respond`
Envia resposta em uma conversa específica.

**Body:**
```json
{
  "message": "Como posso ajudá-lo?",
  "agentId": "agent_123"
}
```

#### `GET /helpdesk/conversation/{conversationId}/history`
Obtém histórico completo de uma conversa.

#### `POST /helpdesk/conversation/{conversationId}/close`
Encerra uma conversa ativa.

## Modelos de Dados

### Conversation
```typescript
interface Conversation {
  id: string;
  customerPhone: string;
  sessionId: string;
  status: 'waiting' | 'active' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  agentId?: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}
```

### Interaction
```typescript
interface Interaction {
  id: string;
  conversationId: string;
  type: 'customer_message' | 'agent_response' | 'system_message' | 'conversation_closed';
  content: string;
  agentId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

## Integração com WhatsApp Module

### Envio de Mensagens
```typescript
// Através do WhatsappService
await this.whatsappService.sendMessage(
  sessionId,
  customerPhone,
  message
);
```

### Recebimento de Mensagens
O módulo WhatsApp deve notificar o Helpdesk sobre novas mensagens recebidas através de eventos ou callbacks.

## Configuração

### Variáveis de Ambiente
```env
# Helpdesk Configuration
HELPDESK_MAX_CONVERSATIONS=100      # Máximo de conversas simultâneas
HELPDESK_AUTO_CLOSE_TIMEOUT=3600000 # Auto-encerrar após 1 hora de inatividade
HELPDESK_PRIORITY_ESCALATION=true   # Ativar escalação automática
```

## Uso Básico

### Iniciar Atendimento
```typescript
const conversation = await helpdeskService.startConversation({
  customerPhone: '5511999999999',
  sessionId: 'session_123',
  initialMessage: 'Preciso de ajuda',
  priority: 'normal'
});
```

### Responder Cliente
```typescript
await helpdeskService.sendResponse(conversationId, {
  message: 'Como posso ajudá-lo?',
  agentId: 'agent_123'
});
```

### Obter Conversas Ativas
```typescript
const conversations = await helpdeskService.getActiveConversations();
```

## Métricas e Relatórios

### Estatísticas de Conversas
- Total de conversas por período
- Distribuição por status e prioridade
- Tempo médio de atendimento
- Taxa de resolução

### Performance dos Agentes
- Número de atendimentos por agente
- Tempo médio de resposta
- Avaliação de qualidade
- Produtividade por período

## Escalação e Prioridades

### Sistema de Prioridades
- **Urgente**: Atendimento imediato (< 1 min)
- **Alta**: Atendimento prioritário (< 5 min)
- **Normal**: Atendimento padrão (< 15 min)
- **Baixa**: Atendimento quando disponível

### Escalação Automática
- Conversas não atendidas são escaladas automaticamente
- Notificações para supervisores
- Redistribuição de carga entre agentes

## Segurança e Compliance

- Logs de auditoria para todas as interações
- Anonização de dados sensíveis
- Controle de acesso por perfil de agente
- Retenção de dados configurável
- Backup automático de conversas

## Limitações

- Máximo de 100 conversas simultâneas por instância
- Mensagens limitadas a 4096 caracteres
- Histórico mantido por 90 dias (configurável)
- Suporte inicial apenas para texto (mídia em roadmap)