import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { JoinSessionDto, WebSocketSendMessageDto } from './dto/websocket.dto';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/whatsapp',
})
export class WhatsappGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WhatsappGateway.name);
  private sessionClients = new Map<string, Set<string>>();

  constructor(private readonly whatsappService: WhatsappService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway inicializado');
    
    this.whatsappService.getQRCodeStream().subscribe(({ sessionId, qr }) => {
      this.server.to(`session-${sessionId}`).emit('qr-code', { sessionId, qr });
    });

    this.whatsappService.getConnectionStatusStream().subscribe(({ sessionId, status }) => {
      this.server.to(`session-${sessionId}`).emit('status-change', { sessionId, status });
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
    client.emit('connected', {
      message: 'Conectado ao WebSocket do WhatsApp',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
    
    for (const [sessionId, clients] of this.sessionClients.entries()) {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        if (clients.size === 0) {
          this.sessionClients.delete(sessionId);
        }
        this.logger.log(`Cliente ${client.id} removido da sessão ${sessionId}`);
      }
    }
  }

  @SubscribeMessage('join-session')
  async handleJoinSession(
    @MessageBody() data: JoinSessionDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId } = data;
      
      if (!sessionId) {
        client.emit('error', {
          message: 'sessionId é obrigatório',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!this.sessionClients.has(sessionId)) {
        this.sessionClients.set(sessionId, new Set());
      }
      
      const sessionSet = this.sessionClients.get(sessionId);
      if (sessionSet) {
        sessionSet.add(client.id);
      }
      
      await client.join(`session-${sessionId}`);
      
      const sessionsResult = await this.whatsappService.getSessions();
      const existingSession = sessionsResult.data.sessions.find(s => s.sessionId === sessionId);
      
      if (!existingSession) {
        await this.whatsappService.createSession(sessionId);
      }
      
      this.logger.log(`Cliente ${client.id} entrou na sessão ${sessionId}`);
      
      client.emit('joined-session', {
        sessionId,
        message: `Conectado à sessão ${sessionId}`,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      client.emit('error', {
        message: error.message || 'Erro ao entrar na sessão',
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('leave-session')
  handleLeaveSession(
    @MessageBody() data: JoinSessionDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { sessionId } = data;
    
    if (this.sessionClients.has(sessionId)) {
      const sessionSet = this.sessionClients.get(sessionId);
      if (sessionSet) {
        sessionSet.delete(client.id);
        if (sessionSet.size === 0) {
          this.sessionClients.delete(sessionId);
        }
      }
    }

    client.leave(`session-${sessionId}`);
    this.logger.log(`Cliente ${client.id} saiu da sessão ${sessionId}`);
    
    client.emit('left-session', {
      sessionId,
      message: `Desconectado da sessão ${sessionId}`,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: WebSocketSendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId, number, message } = data;
      
      const result = await this.whatsappService.sendMessage(sessionId, number, message);
      
      client.emit('message-sent', {
        sessionId,
        number,
        message,
        messageId: result.messageId,
        timestamp: result.timestamp,
      });
      
      client.to(`session-${sessionId}`).emit('message-sent-notification', {
        sessionId,
        number,
        timestamp: result.timestamp,
      });
      
    } catch (error) {
      client.emit('error', {
        message: error.message,
        type: 'send-message-error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('get-sessions')
  async handleGetSessions(@ConnectedSocket() client: Socket) {
    try {
      const result = await this.whatsappService.getSessions();
      
      client.emit('sessions-list', {
        sessions: result.data.sessions,
        total: result.data.total,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      client.emit('error', {
        message: error.message,
        type: 'get-sessions-error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  emitQRCode(sessionId: string, qr: string) {
    this.server.to(`session-${sessionId}`).emit('qr-code', {
      sessionId,
      qr,
      timestamp: new Date().toISOString(),
    });
  }

  emitStatusChange(sessionId: string, status: string) {
    this.server.to(`session-${sessionId}`).emit('status-change', {
      sessionId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  emitMessageReceived(sessionId: string, from: string, message: string, messageId: string) {
    this.server.to(`session-${sessionId}`).emit('message-received', {
      sessionId,
      from,
      message,
      messageId,
      timestamp: new Date().toISOString(),
    });
  }

  emitError(sessionId: string, error: string) {
    this.server.to(`session-${sessionId}`).emit('session-error', {
      sessionId,
      error,
      timestamp: new Date().toISOString(),
    });
  }

  getConnectionStats() {
    const stats = {
      totalSessions: this.sessionClients.size,
      totalClients: Array.from(this.sessionClients.values()).reduce(
        (total, clients) => total + clients.size,
        0,
      ),
      sessions: Array.from(this.sessionClients.entries()).map(([sessionId, clients]) => ({
        sessionId,
        clientCount: clients.size,
      })),
    };
    return stats;
  }
}