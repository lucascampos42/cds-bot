import { Test, TestingModule } from '@nestjs/testing';
import { HelpdeskGateway } from './helpdesk.gateway';
import { HelpdeskService } from './helpdesk.service';
import { EventService } from '../shared/services/event.service';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

describe('HelpdeskGateway', () => {
  let gateway: HelpdeskGateway;
  let helpdeskService: HelpdeskService;
  let eventService: EventService;
  let socket: Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HelpdeskGateway,
        {
          provide: HelpdeskService,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
        {
          provide: EventService,
          useValue: {
            messageReceived: new Subject(),
          },
        },
      ],
    }).compile();

    gateway = module.get<HelpdeskGateway>(HelpdeskGateway);
    helpdeskService = module.get<HelpdeskService>(HelpdeskService);
    eventService = module.get<EventService>(EventService);

    // Mock do servidor socket.io
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle join-session and emit joined-session', () => {
    const client = {
      join: jest.fn(),
      emit: jest.fn(),
    };
    const sessionId = 'test-session';

    gateway.handleJoinSession(sessionId, client as any);

    expect(client.join).toHaveBeenCalledWith(`session-${sessionId}`);
    expect(client.emit).toHaveBeenCalledWith('joined-session', { sessionId });
  });

  it('should handle send-message and call helpdeskService', async () => {
    const message = {
      sessionId: 'test-session',
      recipient: '12345',
      text: 'Hello',
    };

    await gateway.handleSendMessage(message);

    expect(helpdeskService.sendMessage).toHaveBeenCalledWith({
      sessionId: message.sessionId,
      to: message.recipient,
      message: message.text,
      type: 'text',
    });
  });

  it('should emit new-message when eventService receives a message', () => {
    const message = { sessionId: 'test-session', message: 'new message' };
    eventService.messageReceived.next(message);

    expect(gateway.server.to).toHaveBeenCalledWith(`session-${message.sessionId}`);
    expect(gateway.server.emit).toHaveBeenCalledWith('new-message', message.message);
  });
});
