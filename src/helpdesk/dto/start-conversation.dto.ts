import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';

export class StartConversationDto {
  @ApiProperty({
    description: 'Número do telefone do cliente',
    example: '5511999999999',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^55\d{10,11}$/, {
    message: 'Número deve estar no formato brasileiro: 55XXXXXXXXXXX',
  })
  customerPhone: string;

  @ApiProperty({
    description: 'ID da sessão do WhatsApp',
    example: 'session_123',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'Mensagem inicial do cliente',
    example: 'Olá, preciso de ajuda com meu pedido',
  })
  @IsString()
  @IsNotEmpty()
  initialMessage: string;

  @ApiProperty({
    description: 'Prioridade da conversa',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    required: false,
  })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}