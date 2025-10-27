import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventService } from '../shared/services/event.service';
import { HelpdeskService } from './helpdesk.service';
import { WebSocketSendMessageDto } from './dto/websocket-send-message.dto';
import { MessageType } from './dto/messaging.dto';

@WebSocketGateway({
  namespace: '/helpdesk',
  // TODO: Em produção, restrinja a origem para o domínio do front-end.
  // Ex: cors: { origin: 'https://seu-erp.com' }
  cors: { origin: '*' },
})
export class HelpdeskGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly helpdeskService: HelpdeskService,
    private readonly eventService: EventService,
  ) {
    this.eventService.messageReceived.subscribe(({ sessionId, message }) => {
      this.server.to(`session-${sessionId}`).emit('new-message', message);
    });
  }

  handleConnection(client: Socket) {
    client.emit('connected', {
      message: 'Conectado ao gateway de Helpdesk',
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('join-session')
  handleJoinSession(
    @MessageBody('sessionId') sessionId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(`session-${sessionId}`);
    client.emit('joined-session', { sessionId });
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: WebSocketSendMessageDto,
  ): Promise<void> {
    await this.helpdeskService.sendMessage({
      sessionId: data.sessionId,
      to: data.recipient,
      message: data.text,
      type: MessageType.TEXT
    });
  }
}
