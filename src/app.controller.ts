import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({
    summary: '🏥 Verificação de saúde do serviço',
    description:
      'Endpoint para monitoramento da saúde da aplicação. Retorna informações sobre o status, timestamp e versão do serviço.',
  })
  @ApiResponse({
    status: 200,
    description: 'Status de saúde do serviço',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
          description: 'Status atual do serviço',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z',
          description: 'Timestamp da verificação',
        },
        service: {
          type: 'string',
          example: 'WhatsApp Microservice',
          description: 'Nome do serviço',
        },
        version: {
          type: 'string',
          example: '1.0.0',
          description: 'Versão atual do serviço',
        },
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'WhatsApp Microservice',
      version: '1.0.0',
    };
  }
}
