import { Module } from '@nestjs/common';

import { ConversationService } from './services/conversation.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { HelpdeskController } from './helpdesk.controller';
import { InteractionService } from './services/interaction.service';
import { HelpdeskService } from './helpdesk.service';

@Module({
  imports: [WhatsappModule],
  controllers: [HelpdeskController],
  providers: [HelpdeskService, ConversationService, InteractionService],
  exports: [HelpdeskService],
})
export class HelpdeskModule {}
