import { Module } from '@nestjs/common';
import { WhatsAppInstanceManager } from './whatsapp-instance-manager.service';
import { WhatsAppController } from './whatsapp.controller';

@Module({
  providers: [WhatsAppInstanceManager],
  controllers: [WhatsAppController],
  exports: [WhatsAppInstanceManager],
})
export class WhatsAppModule {}