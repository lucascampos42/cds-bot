import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TenantStatus } from './tenant-response.dto';

export class UpdateTenantStatusDto {
  @ApiProperty({
    description: 'Novo status do tenant',
    enum: TenantStatus,
    example: TenantStatus.SUSPENDED
  })
  @IsEnum(TenantStatus)
  status: TenantStatus;

  @ApiProperty({
    description: 'Motivo da alteração de status',
    example: 'Cliente solicitou suspensão temporária',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
