import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantService } from './services';

@Module({
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
