import { Controller, Get, Post, Body, Sse, Param } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiExtraModels,
} from '@nestjs/swagger';
import {
  CreateSessionDto,
  SendMessageDto,
  SessionCreatedResponseDto,
  SessionListResponseDto,
  MessageSentResponseDto,
  ErrorResponseDto,
  QRCodeEventDto,
  StatusEventDto,
} from './dto';

@ApiTags('WhatsApp')
@ApiExtraModels(
  CreateSessionDto,
  SendMessageDto,
  SessionCreatedResponseDto,
  SessionListResponseDto,
  MessageSentResponseDto,
  ErrorResponseDto,
  QRCodeEventDto,
  StatusEventDto,
)
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('sessions')
  @ApiOperation({
    summary: 'Cria uma nova sessão do WhatsApp',
    description: 'Inicia uma nova sessão do WhatsApp para autenticação e envio de mensagens.',
  })
  @ApiBody({ type: CreateSessionDto })
  @ApiResponse({ status: 201, type: SessionCreatedResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
  ): Promise<SessionCreatedResponseDto> {
    void this.whatsappService.createSession(createSessionDto.sessionId);
    return {
      message: 'A sessão está sendo iniciada. Conecte-se ao stream para obter o QR code.',
    };
  }

  @Get('sessions')
  @ApiOperation({
    summary: 'Lista todas as sessões ativas',
    description: 'Retorna informações sobre todas as sessões WhatsApp criadas.',
  })
  @ApiResponse({ status: 200, type: SessionListResponseDto })
  getSessions(): SessionListResponseDto {
    return this.whatsappService.getSessions();
  }

  @Sse('sessions/:sessionId/stream')
  @ApiOperation({
    summary: 'Stream de eventos para QR code e status da conexão',
    description: 'Estabelece uma conexão Server-Sent Events (SSE) para receber eventos em tempo real.',
  })
  @ApiParam({ name: 'sessionId', description: 'Identificador único da sessão WhatsApp' })
  @ApiResponse({ status: 200, description: 'Stream de eventos estabelecido' })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  stream(@Param('sessionId') sessionId: string): Observable<MessageEvent> {
    const qrStream = this.whatsappService.getQRCodeStream().pipe(
      filter((event) => event.sessionId === sessionId),
      map((event) => new MessageEvent('qr', { data: event.qr })),
    );

    const statusStream = this.whatsappService.getConnectionStatusStream().pipe(
      filter((event) => event.sessionId === sessionId),
      map((event) => new MessageEvent('status', { data: event.status })),
    );

    return new Observable((subscriber) => {
      const qrSubscription = qrStream.subscribe(subscriber);
      const statusSubscription = statusStream.subscribe(subscriber);

      return () => {
        qrSubscription.unsubscribe();
        statusSubscription.unsubscribe();
      };
    });
  }

  @Post('send')
  @ApiOperation({
    summary: 'Envia uma mensagem de texto',
    description: 'Envia uma mensagem de texto para um número WhatsApp específico.',
  })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 200, type: MessageSentResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ApiResponse({ status: 500, type: ErrorResponseDto })
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<MessageSentResponseDto> {
    return this.whatsappService.sendMessage(
      sendMessageDto.sessionId,
      sendMessageDto.number,
      sendMessageDto.message,
    );
  }

  @Get('websocket-info')
  @ApiOperation({
    summary: 'Informações sobre WebSocket',
    description: 'Retorna informações sobre a API WebSocket disponível.',
  })
  @ApiResponse({
    status: 200,
    description: 'Informações sobre WebSocket',
    schema: {
      type: 'object',
      properties: {
        websocket: {
          type: 'object',
          properties: {
            url: { type: 'string', example: 'ws://localhost:3099/whatsapp' },
            namespace: { type: 'string', example: '/whatsapp' },
            events: {
              type: 'object',
              properties: {
                client_to_server: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['join-session', 'leave-session', 'send-message', 'get-sessions'],
                },
                server_to_client: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['connected', 'qr-code', 'status-change', 'message-received', 'message-sent', 'error'],
                },
              },
            },
          },
        },
        advantages: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'Comunicação bidirecional em tempo real',
            'Menor latência que HTTP polling',
            'Recebimento instantâneo de mensagens',
            'Conexão persistente',
            'Suporte a múltiplos clientes por sessão',
          ],
        },
      },
    },
  })
  getWebSocketInfo() {
    return {
      websocket: {
        url: 'ws://localhost:3099/whatsapp',
        namespace: '/whatsapp',
        events: {
          client_to_server: ['join-session', 'leave-session', 'send-message', 'get-sessions'],
          server_to_client: ['connected', 'qr-code', 'status-change', 'message-received', 'message-sent', 'error'],
        },
      },
      advantages: [
        'Comunicação bidirecional em tempo real',
        'Menor latência que HTTP polling',
        'Recebimento instantâneo de mensagens',
        'Conexão persistente',
        'Suporte a múltiplos clientes por sessão',
      ],
    };
  }
}
