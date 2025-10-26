import { Controller, Get, Post, Body, Sse, Param } from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiExtraModels,
} from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';
import { WhatsappStreamService } from './services/whatsapp-stream.service';
import { WebsocketInfoService } from './services/websocket-info.service';
import { WEBSOCKET_INFO_SWAGGER } from './swagger/websocket-info.swagger';
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
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly streamService: WhatsappStreamService,
    private readonly websocketInfoService: WebsocketInfoService,
  ) {}

  @Post('sessions')
  @ApiOperation({
    summary: 'Cria uma nova sessão do WhatsApp',
    description:
      'Inicia uma nova sessão do WhatsApp para autenticação e envio de mensagens.',
  })
  @ApiBody({ type: CreateSessionDto })
  @ApiResponse({ status: 201, type: SessionCreatedResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  createSession(
    @Body() createSessionDto: CreateSessionDto,
  ): SessionCreatedResponseDto {
    void this.whatsappService.createSession(createSessionDto.sessionId);
    return {
      message:
        'A sessão está sendo iniciada. Conecte-se ao stream para obter o QR code.',
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
    description:
      'Estabelece um stream de eventos para receber QR codes e atualizações de status.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'ID da sessão WhatsApp',
    example: 'session-123',
  })
  @ApiResponse({ status: 200, description: 'Stream de eventos estabelecido' })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  stream(@Param('sessionId') sessionId: string): Observable<MessageEvent> {
    return this.streamService.createSessionStream(sessionId);
  }

  @Post('send')
  @ApiOperation({
    summary: 'Envia uma mensagem de texto',
    description:
      'Envia uma mensagem de texto para um número específico através de uma sessão ativa.',
  })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 200, type: MessageSentResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ApiResponse({ status: 500, type: ErrorResponseDto })
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<MessageSentResponseDto> {
    const result = await this.whatsappService.sendMessageLegacy(
      sendMessageDto.sessionId,
      sendMessageDto.to,
      sendMessageDto.message,
    );
    return {
      message: result.message,
      messageId: result.messageId,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('websocket-info')
  @ApiOperation({
    summary: 'Informações sobre WebSocket',
    description: 'Retorna informações sobre a API WebSocket disponível.',
  })
  @ApiResponse(WEBSOCKET_INFO_SWAGGER)
  getWebSocketInfo() {
    return this.websocketInfoService.getWebSocketInfo();
  }
}
