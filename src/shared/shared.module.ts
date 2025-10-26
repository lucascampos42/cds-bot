import { Module, forwardRef } from '@nestjs/common';
import { MessagingService } from './services/messaging.service';
import { EventService } from './services/event.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [forwardRef(() => WhatsappModule)],
  providers: [MessagingService, EventService],
  exports: [MessagingService, EventService],
})
export class SharedModule {}
