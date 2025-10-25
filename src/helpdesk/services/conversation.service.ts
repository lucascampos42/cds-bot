import { Injectable } from '@nestjs/common';

export interface Conversation {
  id: string;
  customerPhone: string;
  sessionId: string;
  status: 'open' | 'in_progress' | 'waiting' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAgent?: string;
  subject?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
  metadata: Record<string, any>;
  // Campos adicionais para compatibilidade
  agentId?: string;
  closedAt?: Date;
}

export interface CreateConversationDto {
  customerPhone: string;
  sessionId: string;
  initialMessage: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

@Injectable()
export class ConversationService {
  private conversations: Map<string, Conversation> = new Map();

  async create(createDto: CreateConversationDto): Promise<Conversation> {
    const id = this.generateId();
    const now = new Date();
    const conversation: Conversation = {
      id,
      customerPhone: createDto.customerPhone,
      sessionId: createDto.sessionId,
      status: 'open',
      priority: createDto.priority,
      tags: [],
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      metadata: {},
      // Campos de compatibilidade
      agentId: undefined,
      assignedAgent: undefined,
      subject: undefined,
    };

    this.conversations.set(id, conversation);
    return conversation;
  }

  async findById(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) || null;
  }

  async findActive(status?: string, agentId?: string): Promise<Conversation[]> {
    const conversations = Array.from(this.conversations.values());
    return conversations.filter((c) => {
      const statusMatch =
        !status ||
        c.status === status ||
        (status === 'active' &&
          (c.status === 'open' || c.status === 'in_progress'));
      const agentMatch =
        !agentId || c.agentId === agentId || c.assignedAgent === agentId;
      return statusMatch && agentMatch;
    });
  }

  async updateStatus(
    id: string,
    status: Conversation['status'],
  ): Promise<void> {
    const conversation = this.conversations.get(id);
    if (conversation) {
      conversation.status = status;
      conversation.updatedAt = new Date();

      if (status === 'closed') {
        conversation.closedAt = new Date();
      }
    }
  }

  async assignAgent(id: string, agentId: string): Promise<void> {
    const conversation = this.conversations.get(id);
    if (conversation) {
      conversation.agentId = agentId;
      conversation.assignedAgent = agentId;
      conversation.status = 'in_progress';
      conversation.updatedAt = new Date();
    }
  }

  async findAll(): Promise<Conversation[]> {
    return Array.from(this.conversations.values());
  }

  async getByCustomerPhone(customerPhone: string): Promise<Conversation[]> {
    const conversations = Array.from(this.conversations.values());
    return conversations.filter((conv) => conv.customerPhone === customerPhone);
  }

  async getStatistics(): Promise<any> {
    const conversations = Array.from(this.conversations.values());
    return {
      total: conversations.length,
      open: conversations.filter((c) => c.status === 'open').length,
      waiting: conversations.filter((c) => c.status === 'waiting').length,
      inProgress: conversations.filter((c) => c.status === 'in_progress')
        .length,
      closed: conversations.filter((c) => c.status === 'closed').length,
    };
  }

  private generateId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
