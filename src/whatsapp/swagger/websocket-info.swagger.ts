import { ApiResponseOptions } from '@nestjs/swagger';

export const WEBSOCKET_INFO_SWAGGER: ApiResponseOptions = {
  status: 200,
  description: 'Informações sobre WebSocket',
  schema: {
    type: 'object',
    properties: {
      websocket: {
        type: 'object',
        properties: {
          url: { type: 'string', example: 'ws://localhost:3099/whatsapp' },
          namespace: { type: 'string', example: '/whatsapp' },
          events: {
            type: 'object',
            properties: {
              client_to_server: {
                type: 'array',
                items: { type: 'string' },
                example: [
                  'join-session',
                  'leave-session',
                  'send-message',
                  'get-sessions',
                ],
              },
              server_to_client: {
                type: 'array',
                items: { type: 'string' },
                example: [
                  'connected',
                  'qr-code',
                  'status-change',
                  'message-received',
                  'message-sent',
                  'error',
                ],
              },
            },
          },
          advantages: {
            type: 'array',
            items: { type: 'string' },
            example: [
              'Comunicação bidirecional em tempo real',
              'Menor latência que HTTP polling',
              'Recebimento instantâneo de mensagens',
              'Conexão persistente',
              'Suporte a múltiplos clientes por sessão',
            ],
          },
        },
      },
    },
  },
};
