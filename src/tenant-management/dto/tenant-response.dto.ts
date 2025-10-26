import { ApiProperty } from '@nestjs/swagger';

export enum TenantStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export class TenantResponseDto {
  @ApiProperty({
    description: 'ID único do tenant',
    example: 'empresa123',
  })
  clientId: string;

  @ApiProperty({
    description: 'Nome do schema no banco',
    example: 'client_empresa123',
  })
  schemaName: string;

  @ApiProperty({
    description: 'Nome da empresa/cliente',
    example: 'Empresa XYZ Ltda',
  })
  name: string;

  @ApiProperty({
    description: 'Email de contato',
    example: 'contato@empresa.com',
  })
  email: string;

  @ApiProperty({
    description: 'Telefone de contato',
    example: '+5511999999999',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Status atual do tenant',
    enum: TenantStatus,
    example: TenantStatus.ACTIVE,
  })
  status: TenantStatus;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Observações adicionais',
    required: false,
  })
  notes?: string;
}
