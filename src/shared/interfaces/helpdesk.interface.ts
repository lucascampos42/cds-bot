export interface IConversation {
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
}

export interface IInteraction {
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

export interface IHelpdeskMessage {
  conversationId: string;
  message: string;
  agentId?: string;
  isInternal?: boolean;
  attachments?: {
    url: string;
    type: 'image' | 'video' | 'document' | 'audio';
    filename: string;
  }[];
}

export interface IHelpdeskStats {
  totalConversations: number;
  openConversations: number;
  averageResponseTime: number;
  conversationsByStatus: Record<string, number>;
  conversationsByPriority: Record<string, number>;
  agentWorkload: Record<string, number>;
}

export interface IHelpdeskService {
  // Gestão de conversas
  startConversation(
    customerPhone: string,
    sessionId: string,
    initialMessage?: string,
    priority?: string,
  ): Promise<IConversation>;
  getConversation(conversationId: string): Promise<IConversation | null>;
  getActiveConversations(agentId?: string): Promise<IConversation[]>;
  closeConversation(conversationId: string, agentId?: string): Promise<void>;
  assignConversation(conversationId: string, agentId: string): Promise<void>;

  // Mensagens e interações
  sendResponse(
    conversationId: string,
    message: string,
    agentId: string,
  ): Promise<void>;
  addNote(conversationId: string, note: string, agentId: string): Promise<void>;
  getConversationHistory(conversationId: string): Promise<IInteraction[]>;

  // Estatísticas
  getStats(agentId?: string): Promise<IHelpdeskStats>;

  // Eventos
  onNewConversation(callback: (conversation: IConversation) => void): void;
  onMessageReceived(
    callback: (conversationId: string, message: string) => void,
  ): void;
}
