import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SendResponseDto {
  @ApiProperty({
    description: 'Mensagem de resposta para o cliente',
    example: 'Olá! Como posso ajudá-lo hoje?',
    maxLength: 4096,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096, {
    message: 'Mensagem não pode exceder 4096 caracteres',
  })
  message: string;

  @ApiProperty({
    description: 'ID do agente que está respondendo',
    example: 'agent_123',
  })
  @IsString()
  @IsNotEmpty()
  agentId: string;
}