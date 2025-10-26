import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { HelpdeskModule } from './helpdesk/helpdesk.module';
import { SharedModule } from './shared/shared.module';
import { TenantModule } from './tenant-management/tenant.module';

@Module({
  imports: [SharedModule, WhatsappModule, HelpdeskModule, TenantModule],
  controllers: [AppController],
})
export class AppModule {}
