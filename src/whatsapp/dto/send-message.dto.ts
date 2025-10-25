import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, MaxLength } from 'class-validator';

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
    message: 'Número deve estar no formato internacional sem símbolos (ex: 5511999887766)',
  })
  number: string;

  @ApiProperty({
    description: 'Conteúdo da mensagem de texto a ser enviada',
    example: 'Olá! Esta é uma mensagem de teste do nosso bot.',
    maxLength: 4096,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096, {
    message: 'Mensagem não pode exceder 4096 caracteres',
  })
  message: string;
}