import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from '../shared/services/event.service';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappStreamService } from './services/whatsapp-stream.service';
import { WebsocketInfoService } from './services/websocket-info.service';

describe('WhatsappController', () => {
  let controller: WhatsappController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhatsappController],
      providers: [
        WhatsappService,
        {
          provide: EventService,
          useValue: { messageReceived: { next: jest.fn() } },
        },
        {
          provide: WhatsappStreamService,
          useValue: { createSessionStream: jest.fn() },
        },
        {
          provide: WebsocketInfoService,
          useValue: { getWebSocketInfo: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<WhatsappController>(WhatsappController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
