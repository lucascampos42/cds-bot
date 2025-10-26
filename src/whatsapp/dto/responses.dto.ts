import { ApiProperty } from '@nestjs/swagger';

export class SessionCreatedResponseDto {
  @ApiProperty({
    description: 'Mensagem de confirmação da criação da sessão',
    example:
      'A sessão está sendo iniciada. Conecte-se ao stream para obter o QR code.',
  })
  message: string;
}

export class SessionInfoDto {
  @ApiProperty({
    description: 'Identificador único da sessão',
    example: 'meu-bot-vendas',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Status atual da sessão',
    example: 'connected',
    enum: ['connecting', 'connected', 'disconnected', 'qr_required'],
  })
  status: string;

  @ApiProperty({
    description: 'Timestamp da última atividade da sessão',
    example: '2024-01-15T10:30:00.000Z',
  })
  lastActivity: string;
}

export class SessionListResponseDto {
  @ApiProperty({
    description: 'Indica se a operação foi bem-sucedida',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensagem de confirmação',
    example: 'Sessões listadas com sucesso',
  })
  message: string;

  @ApiProperty({
    description: 'Dados das sessões',
    type: 'object',
    properties: {
      sessions: {
        type: 'array',
        items: { $ref: '#/components/schemas/SessionInfoDto' },
        description: 'Lista de sessões ativas',
      },
      total: {
        type: 'number',
        description: 'Total de sessões',
        example: 2,
      },
    },
  })
  data: {
    sessions: SessionInfoDto[];
    total: number;
  };
}



export class ErrorResponseDto {
  @ApiProperty({
    description: 'Código do erro HTTP',
    example: 404,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Descrição do erro',
    example: 'Sessão não encontrada',
  })
  message: string;

  @ApiProperty({
    description: 'Timestamp do erro',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Caminho da requisição que gerou o erro',
    example: '/whatsapp/send',
  })
  path: string;
}

export class QRCodeEventDto {
  @ApiProperty({
    description: 'Tipo do evento',
    example: 'qr',
  })
  type: string;

  @ApiProperty({
    description: 'Código QR em formato base64 para autenticação',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  })
  data: string;
}

export class StatusEventDto {
  @ApiProperty({
    description: 'Tipo do evento',
    example: 'status',
  })
  type: string;

  @ApiProperty({
    description: 'Status atual da conexão',
    example: 'connected',
    enum: ['connecting', 'connected', 'disconnected', 'qr_required'],
  })
  data: string;
}
