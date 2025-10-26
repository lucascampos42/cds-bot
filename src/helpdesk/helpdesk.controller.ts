import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { StartConversationDto } from './dto/start-conversation.dto';
import { HelpdeskService } from './helpdesk.service';
import { SendResponseDto } from './dto/send-response.dto';
import { 
  SendMessageDto, 
  MessageSentResponseDto, 
  BulkMessageDto, 
  BulkMessageResponseDto 
} from './dto/messaging.dto';

@ApiTags('helpdesk')
@Controller('helpdesk')
export class HelpdeskController {
  constructor(private readonly helpdeskService: HelpdeskService) {}

  @Post('conversation/start')
  @ApiOperation({ summary: 'Iniciar nova conversa de atendimento' })
  @ApiResponse({ status: 201, description: 'Conversa iniciada com sucesso' })
  async startConversation(@Body() startConversationDto: StartConversationDto) {
    return this.helpdeskService.startConversationLegacy(startConversationDto);
  }

  @Post('conversation/:conversationId/respond')
  @ApiOperation({ summary: 'Enviar resposta em uma conversa' })
  @ApiResponse({ status: 200, description: 'Resposta enviada com sucesso' })
  async sendResponse(
    @Param('conversationId') conversationId: string,
    @Body() sendResponseDto: SendResponseDto,
  ) {
    return this.helpdeskService.sendResponseLegacy(
      conversationId,
      sendResponseDto,
    );
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Listar conversas ativas' })
  @ApiResponse({ status: 200, description: 'Lista de conversas' })
  async getActiveConversations(
    @Query('status') status?: string,
    @Query('agent') agentId?: string,
  ) {
    return this.helpdeskService.getActiveConversationsLegacy(status, agentId);
  }

  @Get('conversation/:conversationId/history')
  @ApiOperation({ summary: 'Obter histórico de uma conversa' })
  @ApiResponse({ status: 200, description: 'Histórico da conversa' })
  async getConversationHistory(
    @Param('conversationId') conversationId: string,
  ) {
    return this.helpdeskService.getConversationHistoryLegacy(conversationId);
  }

  @Post('conversation/:conversationId/close')
  @ApiOperation({ summary: 'Encerrar uma conversa' })
  @ApiResponse({ status: 200, description: 'Conversa encerrada' })
  async closeConversation(@Param('conversationId') conversationId: string) {
    return this.helpdeskService.closeConversationLegacy(conversationId);
  }

  // === ENDPOINTS DE MENSAGERIA ===

  @Post('messages/send')
  @ApiOperation({ 
    summary: 'Enviar mensagem via WhatsApp',
    description: 'Envia uma mensagem de texto para um cliente através do sistema de helpdesk'
  })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 200, type: MessageSentResponseDto, description: 'Mensagem enviada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Sessão não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async sendMessage(@Body() sendMessageDto: SendMessageDto): Promise<MessageSentResponseDto> {
    return this.helpdeskService.sendMessage(sendMessageDto);
  }

  @Post('messages/bulk')
  @ApiOperation({ 
    summary: 'Enviar múltiplas mensagens',
    description: 'Envia múltiplas mensagens em lote para diferentes clientes'
  })
  @ApiBody({ type: BulkMessageDto })
  @ApiResponse({ status: 200, type: BulkMessageResponseDto, description: 'Mensagens processadas' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async sendBulkMessages(@Body() bulkMessageDto: BulkMessageDto): Promise<BulkMessageResponseDto> {
    return this.helpdeskService.sendBulkMessages(bulkMessageDto);
  }

  @Get('sessions/available')
  @ApiOperation({ 
    summary: 'Listar sessões disponíveis',
    description: 'Lista todas as sessões WhatsApp conectadas e disponíveis para envio'
  })
  @ApiResponse({ status: 200, description: 'Lista de sessões disponíveis' })
  async getAvailableSessions() {
    return this.helpdeskService.getAvailableSessions();
  }
}
