import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WhatsappService } from './whatsapp.service';
import { JoinSessionDto, WebSocketSendMessageDto } from './dto/websocket.dto';

@WebSocketGateway({
  namespace: '/whatsapp',
  cors: { origin: '*' },
})
export class WhatsappGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private sessionClients: Map<string, string> = new Map();

  constructor(private readonly whatsappService: WhatsappService) {}

  afterInit(): void {
    this.whatsappService.qrCodeSubject.subscribe(({ sessionId, qr }) => {
      this.emitQRCode(sessionId, qr);
    });

    this.whatsappService.connectionStatusSubject.subscribe(
      ({ sessionId, status }) => {
        this.emitStatusChange(sessionId, status);
      },
    );
  }

  handleConnection(client: Socket): void {
    client.emit('connected', {
      message: 'Conectado ao gateway WhatsApp',
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket): void {
    const sessionId = this.sessionClients.get(client.id);
    if (sessionId) {
      void client.leave(`session-${sessionId}`);
      this.sessionClients.delete(client.id);
    }
  }

  @SubscribeMessage('join-session')
  handleJoinSession(
    @MessageBody() data: JoinSessionDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const { sessionId } = data;

    if (
      !this.whatsappService
        .getSessions()
        .data.sessions.find((s) => s.sessionId === sessionId)
    ) {
      void this.whatsappService.createSession(sessionId);
    }

    void client.join(`session-${sessionId}`);
    this.sessionClients.set(client.id, sessionId);

    client.emit('joined-session', { sessionId });
  }

  @SubscribeMessage('leave-session')
  handleLeaveSession(@ConnectedSocket() client: Socket): void {
    const sessionId = this.sessionClients.get(client.id);
    if (sessionId) {
      void client.leave(`session-${sessionId}`);
      this.sessionClients.delete(client.id);
      client.emit('left-session', { sessionId });
    }
  }

  @SubscribeMessage('send-message')
  handleSendMessage(@MessageBody() data: WebSocketSendMessageDto): void {
    void this.whatsappService.sendMessage({
      sessionId: data.sessionId,
      to: data.to,
      message: data.message,
    });
  }

  @SubscribeMessage('get-sessions')
  handleGetSessions(@ConnectedSocket() client: Socket): void {
    const sessions = this.whatsappService.getSessions();
    client.emit('sessions-list', sessions);
  }

  private emitQRCode(sessionId: string, qr: string): void {
    this.server.to(`session-${sessionId}`).emit('qr-code', { qr });
  }

  private emitStatusChange(sessionId: string, status: string): void {
    this.server.to(`session-${sessionId}`).emit('status-change', { status });
  }

  private emitMessageReceived(sessionId: string, message: unknown): void {
    this.server.to(`session-${sessionId}`).emit('message-received', message);
  }

  private emitError(sessionId: string, error: string): void {
    this.server.to(`session-${sessionId}`).emit('error', {
      message: error,
      timestamp: new Date().toISOString(),
    });
  }

  getConnectionStats(): {
    totalConnections: number;
    sessionConnections: Record<string, number>;
  } {
    const stats = {
      totalConnections: this.sessionClients.size,
      sessionConnections: {} as Record<string, number>,
    };

    for (const sessionId of this.sessionClients.values()) {
      stats.sessionConnections[sessionId] =
        (stats.sessionConnections[sessionId] || 0) + 1;
    }

    return stats;
  }
}
