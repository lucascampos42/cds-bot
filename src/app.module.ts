import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { HelpdeskModule } from './helpdesk/helpdesk.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [SharedModule, WhatsappModule, HelpdeskModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
