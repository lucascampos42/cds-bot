import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({
    description: 'Identificador único da sessão WhatsApp',
    example: 'meu-bot-vendas',
    pattern: '^[a-zA-Z0-9-_]+$',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message:
      'sessionId deve conter apenas letras, números, hífens e underscores',
  })
  sessionId: string;
}
