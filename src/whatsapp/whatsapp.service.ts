import { Injectable } from '@nestjs/common';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  proto,
} from '@whiskeysockets/baileys';
import { Subject } from 'rxjs';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsappService {
  private sessions: Map<string, WASocket> = new Map();
  public qrCodeSubject = new Subject<{ sessionId: string; qr: string }>();
  public connectionStatusSubject = new Subject<{
    sessionId: string;
    status: string;
  }>();

  async createSession(sessionId: string): Promise<WASocket> {
    const { state, saveCreds } = await useMultiFileAuthState(
      `./sessions/${sessionId}`,
    );

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        setTimeout(() => {
          qrcode.generate(qr, { small: true }, (qrOutput: string) => {
            this.qrCodeSubject.next({ sessionId, qr: qrOutput });
          });
        }, 0);
      }

      if (connection === 'close') {
        const shouldReconnect =
          (lastDisconnect?.error as { output?: { statusCode: number } })?.output
            ?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          void this.createSession(sessionId);
        }
      }
    });

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
    return {
      success: true,
      message: 'Sessões listadas com sucesso',
      data: {
        sessions: Array.from(this.sessions.keys()).map((sessionId) => ({
          sessionId,
          status: 'connected',
          lastActivity: new Date().toISOString(),
        })),
        total: this.sessions.size,
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

      const messageInfo = await session.sendMessage(
        formattedNumber,
        { text: message },
      );

      return {
        success: true,
        message: 'Mensagem enviada com sucesso',
        messageId: messageInfo?.key?.id || 'unknown',
        timestamp: new Date().toISOString(),
        to: number,
        sessionId,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Falha ao enviar mensagem: ${errorMessage}`);
    }
  }
}
