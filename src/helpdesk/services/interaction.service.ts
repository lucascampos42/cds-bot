import { Injectable } from '@nestjs/common';

export interface Interaction {
  id: string;
  conversationId: string;
  type:
    | 'message_received'
    | 'message_sent'
    | 'note'
    | 'status_change'
    | 'assignment';
  content: string;
  agentId?: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface LogInteractionDto {
  conversationId: string;
  type: Interaction['type'];
  content: string;
  agentId?: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

@Injectable()
export class InteractionService {
  private interactions: Map<string, Interaction[]> = new Map();

  async logInteraction(
    conversationId: string,
    type: Interaction['type'],
    content: string,
    agentId?: string,
    metadata: Record<string, any> = {},
  ): Promise<void> {
    const interaction: Interaction = {
      id: this.generateId(),
      conversationId,
      type,
      content,
      agentId,
      timestamp: new Date(),
      metadata,
    };

    if (!this.interactions.has(conversationId)) {
      this.interactions.set(conversationId, []);
    }

    this.interactions.get(conversationId)!.push(interaction);
  }

  async getByConversationId(conversationId: string): Promise<Interaction[]> {
    const interactions = this.interactions.get(conversationId) || [];
    return interactions.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
  }

  async getByAgentId(agentId: string): Promise<Interaction[]> {
    const allInteractions = Array.from(this.interactions.values()).flat();
    return allInteractions
      .filter((interaction) => interaction.agentId === agentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getStatistics(startDate?: Date, endDate?: Date) {
    const allInteractions = Array.from(this.interactions.values()).flat();

    const filteredInteractions = allInteractions.filter((interaction) => {
      if (startDate && interaction.timestamp < startDate) return false;
      if (endDate && interaction.timestamp > endDate) return false;
      return true;
    });

    return {
      total: filteredInteractions.length,
      byType: {
        message_received: filteredInteractions.filter(
          (i) => i.type === 'message_received',
        ).length,
        message_sent: filteredInteractions.filter(
          (i) => i.type === 'message_sent',
        ).length,
        note: filteredInteractions.filter((i) => i.type === 'note').length,
        status_change: filteredInteractions.filter(
          (i) => i.type === 'status_change',
        ).length,
        assignment: filteredInteractions.filter((i) => i.type === 'assignment')
          .length,
      },
      averageResponseTime:
        this.calculateAverageResponseTime(filteredInteractions),
    };
  }

  async getRecentInteractions(limit: number = 50): Promise<Interaction[]> {
    const allInteractions = Array.from(this.interactions.values()).flat();
    return allInteractions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  private calculateAverageResponseTime(interactions: Interaction[]): number {
    const responseTimes: number[] = [];

    for (let i = 0; i < interactions.length - 1; i++) {
      const current = interactions[i];
      const next = interactions[i + 1];

      if (current.type === 'message_received' && next.type === 'message_sent') {
        const responseTime =
          next.timestamp.getTime() - current.timestamp.getTime();
        responseTimes.push(responseTime);
      }
    }

    if (responseTimes.length === 0) return 0;

    const average =
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    return Math.round(average / 1000); // Retorna em segundos
  }

  private generateId(): string {
    return `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
