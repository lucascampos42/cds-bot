import { Module, forwardRef } from '@nestjs/common';
import { MessagingService } from './services/messaging.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [forwardRef(() => WhatsappModule)],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class SharedModule {}
