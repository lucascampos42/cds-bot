export interface IWhatsappMessage {
  sessionId: string;
  to: string;
  message: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document' | 'audio';
}

export interface IWhatsappSession {
  sessionId: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  qrCode?: string;
  clientInfo?: {
    pushname: string;
    platform: string;
    phone: string;
  };
  lastActivity: Date;
}

export interface IWhatsappMessageReceived {
  sessionId: string;
  from: string;
  message: string;
  messageId: string;
  timestamp: Date;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document' | 'audio';
  isGroup: boolean;
  groupId?: string;
}

export interface IWhatsappMessageStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  error?: string;
}

export interface IWhatsappService {
  // Gestão de sessões
  createSession(sessionId: string): Promise<void>;
  getSession(sessionId: string): Promise<IWhatsappSession | null>;
  getAllSessions(): Promise<IWhatsappSession[]>;
  destroySession(sessionId: string): Promise<void>;

  // Status e eventos
  onMessageReceived(
    callback: (message: IWhatsappMessageReceived) => void,
  ): void;
  onMessageStatus(callback: (status: IWhatsappMessageStatus) => void): void;
  onSessionStatus(callback: (session: IWhatsappSession) => void): void;
}
