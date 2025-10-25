import { Injectable } from '@nestjs/common';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';

@Injectable()
export class WhatsappService {
  private sessions: Map<string, any> = new Map();

  async createSession(sessionId: string): Promise<any> {
    const { state, saveCreds } = await useMultiFileAuthState(
      `sessions/${sessionId}`,
    );
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
    });

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'close') {
        if (lastDisconnect && lastDisconnect.error) {
          const shouldReconnect =
            (lastDisconnect.error as any)?.output?.statusCode !==
            DisconnectReason.loggedOut;
          console.log(
            'connection closed due to ',
            lastDisconnect.error,
            ', reconnecting ',
            shouldReconnect,
          );
          if (shouldReconnect) {
            this.createSession(sessionId);
          }
        }
      } else if (connection === 'open') {
        console.log('opened connection');
      }
    });

    sock.ev.on('creds.update', saveCreds);

    this.sessions.set(sessionId, sock);
    return sock;
  }

  getSessions() {
    return Array.from(this.sessions.keys()).map((sessionId) => ({
      sessionId,
      status: this.sessions.get(sessionId) ? 'connected' : 'disconnected',
      lastActivity: new Date().toISOString(),
    }));
  }

  async sendMessage(sessionId: string, number: string, message: string) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error(`Sessão ${sessionId} não encontrada`);
    }

    try {
      // Formatar número para o padrão do WhatsApp
      const formattedNumber = number.includes('@')
        ? number
        : `${number}@s.whatsapp.net`;

      const messageInfo = await session.sendMessage(formattedNumber, {
        text: message,
      });

      return {
        success: true,
        messageId: messageInfo.key.id,
        timestamp: new Date().toISOString(),
        to: number,
        sessionId,
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw new Error(`Falha ao enviar mensagem: ${error.message}`);
    }
  }
}
