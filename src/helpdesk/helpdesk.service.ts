import { Injectable, NotFoundException } from '@nestjs/common';
import { ConversationService } from './services/conversation.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { StartConversationDto } from './dto/start-conversation.dto';
import { SendResponseDto } from './dto/send-response.dto';
import { 
  SendMessageDto, 
  MessageSentResponseDto, 
  BulkMessageDto, 
  BulkMessageResponseDto 
} from './dto/messaging.dto';
import { MessagingService } from '../shared/services/messaging.service';
import {
  IHelpdeskService,
  IConversation,
  IInteraction,
  IHelpdeskStats,
} from '../shared/interfaces';
import { InteractionService } from './services/interaction.service';

@Injectable()
export class HelpdeskService implements IHelpdeskService {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly interactionService: InteractionService,
    private readonly whatsappService: WhatsappService,
    private readonly messagingService: MessagingService,
  ) {}

  async startConversation(
    customerPhone: string,
    sessionId: string,
    initialMessage?: string,
    priority?: 'low' | 'medium' | 'high' | 'urgent',
  ): Promise<IConversation> {
    const conversation = await this.conversationService.create({
      customerPhone,
      sessionId,
      initialMessage: initialMessage || '',
      priority: priority || 'medium',
    });

    // Registrar interação inicial se houver mensagem
    if (initialMessage) {
      await this.interactionService.logInteraction(
        conversation.id,
        'message_received',
        initialMessage,
        undefined,
        { source: 'customer' },
      );
    }

    return conversation;
  }

  // Método auxiliar para manter compatibilidade com DTO
  async startConversationLegacy(startConversationDto: StartConversationDto) {
    const conversation = await this.startConversation(
      startConversationDto.customerPhone,
      startConversationDto.sessionId,
      startConversationDto.initialMessage,
      startConversationDto.priority,
    );

    return {
      success: true,
      conversationId: conversation.id,
      message: 'Conversa iniciada com sucesso',
    };
  }

  async sendResponse(
    conversationId: string,
    message: string,
    agentId: string,
  ): Promise<void> {
    const conversation =
      await this.conversationService.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    // Enviar mensagem via MessagingService
    await this.messagingService.sendMessage({
      sessionId: conversation.sessionId,
      to: conversation.customerPhone,
      message,
      type: 'text',
    });

    // Registrar interação
    await this.interactionService.logInteraction(
      conversationId,
      'message_sent',
      message,
      agentId,
      { source: 'agent' },
    );

    // Atualizar status da conversa
    await this.conversationService.updateStatus(conversationId, 'in_progress');
  }

  // Método auxiliar para manter compatibilidade com DTO
  async sendResponseLegacy(
    conversationId: string,
    sendResponseDto: SendResponseDto,
  ) {
    await this.sendResponse(
      conversationId,
      sendResponseDto.message,
      sendResponseDto.agentId,
    );

    return {
      success: true,
      message: 'Resposta enviada com sucesso',
    };
  }

  async getActiveConversations(agentId?: string): Promise<IConversation[]> {
    return this.conversationService.findActive('active', agentId);
  }

  // Método auxiliar para manter compatibilidade com filtros adicionais
  async getActiveConversationsLegacy(status?: string, agentId?: string) {
    return this.conversationService.findActive(status, agentId);
  }

  async getConversationHistory(
    conversationId: string,
  ): Promise<IInteraction[]> {
    const conversation =
      await this.conversationService.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    return this.interactionService.getByConversationId(conversationId);
  }

  // Método auxiliar para manter compatibilidade com retorno completo
  async getConversationHistoryLegacy(conversationId: string) {
    const conversation =
      await this.conversationService.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    const interactions =
      await this.interactionService.getByConversationId(conversationId);

    return {
      conversation,
      interactions,
    };
  }

  async closeConversation(
    conversationId: string,
    agentId?: string,
  ): Promise<void> {
    const conversation =
      await this.conversationService.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    await this.conversationService.updateStatus(conversationId, 'closed');

    // Registrar encerramento
    await this.interactionService.logInteraction(
      conversationId,
      'status_change',
      'Conversa encerrada',
      agentId,
      { action: 'conversation_closed' },
    );
  }

  // Método auxiliar para manter compatibilidade com retorno de status
  async closeConversationLegacy(conversationId: string) {
    await this.closeConversation(conversationId);

    return {
      success: true,
      message: 'Conversa encerrada com sucesso',
    };
  }

  // Métodos adicionais da interface que ainda não foram implementados
  async getConversation(conversationId: string): Promise<IConversation | null> {
    return this.conversationService.findById(conversationId);
  }

  async assignConversation(
    conversationId: string,
    agentId: string,
  ): Promise<void> {
    await this.conversationService.assignAgent(conversationId, agentId);
  }

  async addNote(
    conversationId: string,
    note: string,
    agentId: string,
  ): Promise<void> {
    await this.interactionService.logInteraction(
      conversationId,
      'note',
      note,
      agentId,
      { type: 'agent_note' },
    );
  }

  async getStats(agentId?: string): Promise<IHelpdeskStats> {
    // Implementação básica - pode ser expandida conforme necessário
    const conversations = await this.conversationService.findAll();

    return {
      totalConversations: conversations.length,
      openConversations: conversations.filter(
        (c) => c.status === 'open' || c.status === 'in_progress',
      ).length,
      averageResponseTime: 0, // Calcular baseado nas interações
      conversationsByStatus: conversations.reduce(
        (acc, conv) => {
          acc[conv.status] = (acc[conv.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      conversationsByPriority: conversations.reduce(
        (acc, conv) => {
          acc[conv.priority] = (acc[conv.priority] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      agentWorkload: {}, // Implementar baseado nas atribuições
    };
  }

  onNewConversation(callback: (conversation: IConversation) => void): void {
    // Implementar sistema de eventos se necessário
  }

  onMessageReceived(
    callback: (conversationId: string, message: string) => void,
  ): void {
    // Implementar sistema de eventos se necessário
  }

  // === MÉTODOS DE MENSAGERIA ===

  async sendMessage(sendMessageDto: SendMessageDto): Promise<MessageSentResponseDto> {
    try {
      const result = await this.messagingService.sendMessage({
        sessionId: sendMessageDto.sessionId,
        to: sendMessageDto.to,
        message: sendMessageDto.message,
        type: sendMessageDto.type || 'text',
      });

      return {
        success: result.success,
        message: result.message,
        data: result.data ? {
          messageId: result.data.messageId,
          timestamp: result.data.timestamp,
          conversationId: sendMessageDto.conversationId,
        } : undefined,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao enviar mensagem',
        error: error.message,
      };
    }
  }

  async sendBulkMessages(bulkMessageDto: BulkMessageDto): Promise<BulkMessageResponseDto> {
    try {
      const results = await this.messagingService.sendBulkMessages(
        bulkMessageDto.messages.map(msg => ({
          sessionId: msg.sessionId,
          to: msg.to,
          message: msg.message,
          type: msg.type || 'text',
        }))
      );

      return {
        success: true,
        message: 'Mensagens processadas com sucesso',
        results: results.map((result, index) => ({
          success: result.success,
          message: result.message,
          data: result.data ? {
            messageId: result.data.messageId,
            timestamp: result.data.timestamp,
            conversationId: bulkMessageDto.messages[index].conversationId,
          } : undefined,
          error: result.error,
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao processar mensagens em lote',
        results: [],
      };
    }
  }

  async getAvailableSessions() {
    try {
      const sessions = await this.messagingService.getAvailableSessions();
      return {
        success: true,
        message: 'Sessões disponíveis recuperadas com sucesso',
        data: sessions,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao recuperar sessões disponíveis',
        error: error.message,
      };
    }
  }
}
