export const WEBSOCKET_CONFIG = {
  url: 'ws://localhost:3099/whatsapp',
  namespace: '/whatsapp',
  events: {
    client_to_server: [
      'join-session',
      'leave-session',
      'send-message',
      'get-sessions',
    ],
    server_to_client: [
      'connected',
      'qr-code',
      'status-change',
      'message-received',
      'message-sent',
      'error',
    ],
  },
  advantages: [
    'Comunicação bidirecional em tempo real',
    'Menor latência que HTTP polling',
    'Recebimento instantâneo de mensagens',
    'Conexão persistente',
    'Suporte a múltiplos clientes por sessão',
  ],
} as const;
