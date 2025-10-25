import { Injectable } from '@nestjs/common';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import { Subject } from 'rxjs';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsappService {
  private sessions: Map<string, any> = new Map();
  public qrCodeSubject = new Subject<{ sessionId: string; qr: string }>();
  public connectionStatusSubject = new Subject<{
    sessionId: string;
    status: string;
  }>();

  async createSession(sessionId: string): Promise<any> {
    const { state, saveCreds } = await useMultiFileAuthState(
      `sessions/${sessionId}`,
    );
    const sock = makeWASocket({
      auth: state,
    });

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrcode.generate(qr, { small: true });
        this.qrCodeSubject.next({ sessionId, qr });
      }

      if (connection === 'close') {
        const shouldReconnect =
          lastDisconnect?.error &&
          (lastDisconnect.error as any)?.output?.statusCode !==
            DisconnectReason.loggedOut;
        this.connectionStatusSubject.next({
          sessionId,
          status: 'disconnected',
        });
        if (shouldReconnect) {
          void this.createSession(sessionId);
        }
      } else if (connection === 'open') {
        this.connectionStatusSubject.next({ sessionId, status: 'connected' });
      }
    });

    sock.ev.on('creds.update', saveCreds);

    this.sessions.set(sessionId, sock);
    return sock;
  }

  getQRCodeStream() {
    return this.qrCodeSubject.asObservable();
  }

  getConnectionStatusStream() {
    return this.connectionStatusSubject.asObservable();
  }

  getSessions() {
    const sessions = Array.from(this.sessions.keys()).map((sessionId) => ({
      sessionId,
      status: this.sessions.get(sessionId) ? 'connected' : 'disconnected',
      lastActivity: new Date().toISOString(),
    }));

    return {
      success: true,
      message: 'Sessões listadas com sucesso',
      data: {
        sessions,
        total: sessions.length,
      },
    };
  }

  async sendMessage(sessionId: string, number: string, message: string) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error(`Sessão ${sessionId} não encontrada`);
    }

    try {
      const formattedNumber = number.includes('@')
        ? number
        : `${number}@s.whatsapp.net`;

      const messageInfo = await session.sendMessage(formattedNumber, {
        text: message,
      });

      return {
        success: true,
        message: 'Mensagem enviada com sucesso',
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
