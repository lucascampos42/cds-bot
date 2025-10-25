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
} from '@nestjs/swagger';

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Cria uma nova sessão do WhatsApp' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { sessionId: { type: 'string' } },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'A sessão foi iniciada. Aguarde o QR code no stream.',
  })
  async createSession(@Body('sessionId') sessionId: string): Promise<any> {
    void this.whatsappService.createSession(sessionId);
    return {
      message:
        'A sessão está sendo iniciada. Conecte-se ao stream para obter o QR code.',
    };
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Lista todas as sessões ativas' })
  @ApiResponse({
    status: 200,
    description: 'Uma lista de sessões ativas.',
  })
  getSessions() {
    return this.whatsappService.getSessions();
  }

  @Sse('sessions/:sessionId/stream')
  @ApiOperation({
    summary: 'Stream de eventos para QR code e status da conexão',
  })
  @ApiParam({ name: 'sessionId', description: 'O ID da sessão' })
  @ApiResponse({
    status: 200,
    description: 'Um stream de eventos (QR code e status).',
  })
  stream(@Param('sessionId') sessionId: string): Observable<MessageEvent> {
    const qrStream = this.whatsappService.getQRCodeStream().pipe(
      filter((event) => event.sessionId === sessionId),
      map((event) => new MessageEvent('qr', { data: event.qr })),
    );

    const statusStream = this.whatsappService
      .getConnectionStatusStream()
      .pipe(
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
  @ApiOperation({ summary: 'Envia uma mensagem de texto' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        number: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'A mensagem foi enviada.' })
  @ApiResponse({ status: 404, description: 'Sessão não encontrada.' })
  async sendMessage(
    @Body('sessionId') sessionId: string,
    @Body('number') number: string,
    @Body('message') message: string,
  ) {
    return this.whatsappService.sendMessage(sessionId, number, message);
  }
}
