import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'WhatsApp Microservice',
      version: '1.0.0',
    };
  }

  @Get('docs-json')
  getOpenApiSpec() {
    return {
      openapi: '3.0.0',
      info: {
        title: 'WhatsApp Microservice API',
        description: 'API para envio de mensagens WhatsApp',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Servidor de desenvolvimento',
        },
      ],
      paths: {
        '/': {
          get: {
            summary: 'Hello World',
            responses: {
              '200': {
                description: 'Sucesso',
                content: {
                  'text/plain': {
                    schema: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
        '/health': {
          get: {
            summary: 'Health Check',
            responses: {
              '200': {
                description: 'Status do serviço',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string' },
                        timestamp: { type: 'string' },
                        service: { type: 'string' },
                        version: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/whatsapp/sessions': {
          get: {
            summary: 'Listar sessões WhatsApp',
            responses: {
              '200': {
                description: 'Lista de sessões',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          sessionId: { type: 'string' },
                          status: { type: 'string' },
                          lastActivity: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            summary: 'Criar nova sessão WhatsApp',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      sessionId: { type: 'string' },
                    },
                    required: ['sessionId'],
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Sessão criada com sucesso',
              },
            },
          },
        },
        '/whatsapp/send': {
          post: {
            summary: 'Enviar mensagem WhatsApp',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      sessionId: { type: 'string' },
                      number: { type: 'string' },
                      message: { type: 'string' },
                    },
                    required: ['sessionId', 'number', 'message'],
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Mensagem enviada com sucesso',
              },
            },
          },
        },
      },
    };
  }
}
