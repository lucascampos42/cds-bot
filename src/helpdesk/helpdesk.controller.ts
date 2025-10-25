import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StartConversationDto } from './dto/start-conversation.dto';
import { HelpdeskService } from './helpdesk.service';
import { SendResponseDto } from './dto/send-response.dto';

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
}
