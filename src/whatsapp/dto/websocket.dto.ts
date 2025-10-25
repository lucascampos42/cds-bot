import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class JoinSessionDto {
  @ApiProperty({
    description: 'ID da sessão para se conectar',
    example: 'meu-bot-vendas',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}

export class WebSocketSendMessageDto {
  @ApiProperty({
    description: 'ID da sessão WhatsApp',
    example: 'meu-bot-vendas',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'Número do destinatário (formato internacional)',
    example: '5511999999999',
  })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    description: 'Mensagem a ser enviada',
    example: 'Olá! Esta é uma mensagem via WebSocket.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class WebSocketEventDto {
  @ApiProperty({
    description: 'Tipo do evento',
    example: 'qr-code',
    enum: [
      'connected',
      'qr-code',
      'status-change',
      'message-received',
      'message-sent',
      'error',
    ],
  })
  event: string;

  @ApiProperty({
    description: 'Dados do evento',
    example: { sessionId: 'meu-bot', qr: '2@abc123...' },
  })
  data: any;

  @ApiProperty({
    description: 'Timestamp do evento',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;
}
