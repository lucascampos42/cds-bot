import { Module } from '@nestjs/common';

import { ConversationService } from './services/conversation.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { HelpdeskController } from './helpdesk.controller';
import { InteractionService } from './services/interaction.service';
import { HelpdeskService } from './helpdesk.service';
import { SharedModule } from '../shared/shared.module';
import { HelpdeskGateway } from './helpdesk.gateway';

@Module({
  imports: [WhatsappModule, SharedModule],
  controllers: [HelpdeskController],
  providers: [
    HelpdeskService,
    ConversationService,
    InteractionService,
    HelpdeskGateway,
  ],
  exports: [HelpdeskService],
})
export class HelpdeskModule {}
