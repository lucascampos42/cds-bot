import { IsString, IsNotEmpty, IsOptional, IsEmail, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({
    description: 'ID único do cliente (usado para criar o schema)',
    example: 'empresa123',
    minLength: 3,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-z0-9_]+$/, {
    message: 'clientId deve conter apenas letras minúsculas, números e underscore'
  })
  clientId: string;

  @ApiProperty({
    description: 'Nome da empresa/cliente',
    example: 'Empresa XYZ Ltda'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Email de contato do cliente',
    example: 'contato@empresa.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Telefone de contato',
    example: '+5511999999999',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Observações adicionais',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}