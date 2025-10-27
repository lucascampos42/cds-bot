import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappStreamService } from './services/whatsapp-stream.service';
import { WebsocketInfoService } from './services/websocket-info.service';
import { WhatsappGateway } from './whatsapp.gateway';
import { ConnectionManager } from './database/connection-manager';
import { HealthCheckService } from './database/health-check.service';
import { DatabaseLoggerService } from './database/database-logger.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [ScheduleModule.forRoot(), forwardRef(() => SharedModule)],
  controllers: [WhatsappController],
  providers: [
    WhatsappService,
    WhatsappGateway,
    WhatsappStreamService,
    WebsocketInfoService,
    ConnectionManager,
    HealthCheckService,
    DatabaseLoggerService,
  ],
  exports: [WhatsappService, WhatsappGateway, ConnectionManager],
})
export class WhatsappModule {}
