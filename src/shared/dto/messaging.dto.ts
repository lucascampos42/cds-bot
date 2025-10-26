import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Matches,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
}

export class SendMessageDto {
  @ApiProperty({
    description: 'Identificador da sessão WhatsApp ativa',
    example: 'meu-bot-vendas',
    pattern: '^[a-zA-Z0-9-_]+$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-_]+$/)
  sessionId: string;

  @ApiProperty({
    description: 'Número do WhatsApp no formato internacional (sem símbolos)',
    example: '5511999887766',
    pattern: '^[1-9][0-9]{7,14}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9][0-9]{7,14}$/, {
    message:
      'Número deve estar no formato internacional sem símbolos (ex: 5511999887766)',
  })
  to: string;

  @ApiProperty({
    description: 'Conteúdo da mensagem a ser enviada',
    example: 'Olá! Esta é uma mensagem de teste do nosso bot.',
    maxLength: 4096,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096, {
    message: 'Mensagem não pode exceder 4096 caracteres',
  })
  message: string;

  @ApiProperty({
    description: 'Tipo da mensagem',
    enum: MessageType,
    default: MessageType.TEXT,
    required: false,
  })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;
}

export class MessageSentResponseDto {
  @ApiProperty({
    description: 'Indica se a mensagem foi enviada com sucesso',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensagem de status da operação',
    example: 'Mensagem enviada com sucesso',
  })
  message: string;

  @ApiProperty({
    description: 'Dados da resposta',
    type: 'object',
    properties: {
      messageId: {
        type: 'string',
        description: 'ID único da mensagem enviada',
        example: 'msg_123456789',
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp do envio',
      },
    },
  })
  data?: {
    messageId?: string;
    timestamp: Date;
  };

  @ApiProperty({
    description: 'Detalhes do erro (se houver)',
    required: false,
  })
  error?: string;
}

export class BulkMessageDto {
  @ApiProperty({
    description: 'Lista de mensagens para envio em lote',
    type: [SendMessageDto],
  })
  messages: SendMessageDto[];
}

export class BulkMessageResponseDto {
  @ApiProperty({
    description: 'Indica se o envio em lote foi processado',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensagem de status da operação',
    example: 'Mensagens processadas com sucesso',
  })
  message: string;

  @ApiProperty({
    description: 'Resultados individuais de cada mensagem',
    type: [MessageSentResponseDto],
  })
  results: MessageSentResponseDto[];
}
