import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { WhatsappService } from '../../whatsapp/whatsapp.service';
import { IWhatsappMessage } from '../interfaces';

export interface SendMessageRequest {
  sessionId: string;
  to: string;
  message: string;
  type?: 'text' | 'image' | 'document';
  metadata?: Record<string, any>;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data?: {
    messageId: string;
    timestamp: Date;
  };
  error?: string;
}

@Injectable()
export class MessagingService {
  constructor(
    @Inject(forwardRef(() => WhatsappService))
    private readonly whatsappService: WhatsappService,
  ) {}

  /**
   * Envia uma mensagem através do WhatsApp
   * Este serviço centraliza o envio de mensagens para ser usado por Helpdesk e Marketing
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      // Verificar se a sessão existe
      const session = await this.whatsappService.getSession(request.sessionId);
      if (!session || session.status !== 'connected') {
        return {
          success: false,
          message: 'Sessão não encontrada ou não conectada',
          error: 'Session not available',
        };
      }

      // Implementar envio direto usando a sessão do WhatsApp
      const messageId = await this.sendDirectMessage(
        request.sessionId,
        request.to,
        request.message
      );

      return {
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: {
          messageId,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao enviar mensagem',
        error: error.message,
      };
    }
  }

  private async sendDirectMessage(sessionId: string, to: string, message: string): Promise<string> {
    // Acessar diretamente a sessão do WhatsApp para envio
    const whatsappService = this.whatsappService as any;
    const session = whatsappService.sessions?.get(sessionId);
    
    if (!session) {
      throw new Error(`Sessão ${sessionId} não encontrada`);
    }

    try {
      const jid = `${to}@s.whatsapp.net`;
      const messageInfo = await session.sendMessage(jid, { text: message });
      const messageId = messageInfo?.key?.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return messageId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Falha ao enviar mensagem: ${errorMessage}`);
    }
  }

  /**
   * Envia múltiplas mensagens em lote
   */
  async sendBulkMessages(
    requests: SendMessageRequest[],
  ): Promise<SendMessageResponse[]> {
    const results: SendMessageResponse[] = [];

    for (const request of requests) {
      try {
        const result = await this.sendMessage(request);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          message: 'Erro ao processar mensagem',
          error: error.message || 'Erro desconhecido',
        });
      }
    }

    return results;
  }

  /**
   * Verifica se uma sessão está disponível para envio
   */
  async isSessionAvailable(sessionId: string): Promise<boolean> {
    const session = await this.whatsappService.getSession(sessionId);
    return session?.status === 'connected';
  }

  /**
   * Lista todas as sessões disponíveis
   */
  async getAvailableSessions() {
    const sessions = await this.whatsappService.getAllSessions();
    return sessions.filter((session) => session.status === 'connected');
  }
}