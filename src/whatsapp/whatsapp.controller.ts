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
    description: `
    Inicia uma nova sessão do WhatsApp. Após criar a sessão, você deve:
    1. Conectar-se ao stream de eventos para receber o QR code
    2. Escanear o QR code com seu WhatsApp
    3. Aguardar o status 'connected' no stream
    4. Começar a enviar mensagens
    `,
  })
  @ApiBody({
    type: CreateSessionDto,
    description: 'Dados para criação da sessão',
    examples: {
      exemplo1: {
        summary: 'Sessão de vendas',
        value: { sessionId: 'bot-vendas-2024' },
      },
      exemplo2: {
        summary: 'Sessão de suporte',
        value: { sessionId: 'suporte-cliente' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Sessão criada com sucesso',
    type: SessionCreatedResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Sessão já existe',
    type: ErrorResponseDto,
  })
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
  ): Promise<SessionCreatedResponseDto> {
    void this.whatsappService.createSession(createSessionDto.sessionId);
    return {
      message:
        'A sessão está sendo iniciada. Conecte-se ao stream para obter o QR code.',
    };
  }

  @Get('sessions')
  @ApiOperation({
    summary: 'Lista todas as sessões ativas',
    description:
      'Retorna informações sobre todas as sessões WhatsApp criadas, incluindo status e última atividade.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de sessões recuperada com sucesso',
    type: SessionListResponseDto,
  })
  getSessions(): SessionListResponseDto {
    return this.whatsappService.getSessions();
  }

  @Sse('sessions/:sessionId/stream')
  @ApiOperation({
    summary: 'Stream de eventos para QR code e status da conexão',
    description: `
    Estabelece uma conexão Server-Sent Events (SSE) para receber eventos em tempo real:
    - Eventos 'qr': Contém o código QR para autenticação
    - Eventos 'status': Informa mudanças no status da conexão
    
    Use este endpoint para monitorar o processo de autenticação e conexão.
    `,
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Identificador único da sessão WhatsApp',
    example: 'meu-bot-vendas',
  })
  @ApiResponse({
    status: 200,
    description: 'Stream de eventos estabelecido com sucesso',
    content: {
      'text/event-stream': {
        schema: {
          oneOf: [
            { $ref: '#/components/schemas/QRCodeEventDto' },
            { $ref: '#/components/schemas/StatusEventDto' },
          ],
        },
        examples: {
          qrEvent: {
            summary: 'Evento de QR Code',
            value: 'event: qr\ndata: {"qr":"2@abc123..."}\n\n',
          },
          statusEvent: {
            summary: 'Evento de Status',
            value: 'event: status\ndata: {"status":"connected"}\n\n',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Sessão não encontrada',
    type: ErrorResponseDto,
  })
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
    description: `
    Envia uma mensagem de texto para um número WhatsApp específico.
    A sessão deve estar conectada (status 'connected') para enviar mensagens.
    `,
  })
  @ApiBody({
    type: SendMessageDto,
    description: 'Dados da mensagem a ser enviada',
    examples: {
      exemplo1: {
        summary: 'Mensagem de boas-vindas',
        value: {
          sessionId: 'bot-vendas-2024',
          number: '5511999887766',
          message: 'Olá! Bem-vindo ao nosso atendimento automatizado.',
        },
      },
      exemplo2: {
        summary: 'Confirmação de pedido',
        value: {
          sessionId: 'bot-vendas-2024',
          number: '5511999887766',
          message:
            'Seu pedido #12345 foi confirmado e será entregue em 2 dias úteis.',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Mensagem enviada com sucesso',
    type: MessageSentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sessão não encontrada ou não conectada',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ErrorResponseDto,
  })
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<MessageSentResponseDto> {
    return this.whatsappService.sendMessage(
      sendMessageDto.sessionId,
      sendMessageDto.number,
      sendMessageDto.message,
    );
  }
}
