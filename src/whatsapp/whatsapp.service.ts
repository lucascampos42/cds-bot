import { Injectable } from '@nestjs/common';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
} from '@whiskeysockets/baileys';
import { Subject } from 'rxjs';
import * as qrcode from 'qrcode-terminal';
import {
  IWhatsappService,
  IWhatsappMessage,
  IWhatsappSession,
  IWhatsappMessageReceived,
  IWhatsappMessageStatus,
} from '../shared/interfaces';
import { EventService } from '../shared/services/event.service';

@Injectable()
export class WhatsappService implements IWhatsappService {
  constructor(private readonly eventService: EventService) {}
  private sessions: Map<string, WASocket> = new Map();
  private sessionInfo: Map<string, IWhatsappSession> = new Map();
  public qrCodeSubject = new Subject<{ sessionId: string; qr: string }>();
  public connectionStatusSubject = new Subject<{
    sessionId: string;
    status: string;
  }>();
  private messageReceivedCallbacks: ((
    message: IWhatsappMessageReceived,
  ) => void)[] = [];
  private messageStatusCallbacks: ((status: IWhatsappMessageStatus) => void)[] =
    [];
  private sessionStatusCallbacks: ((session: IWhatsappSession) => void)[] = [];

  async createSession(sessionId: string): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState(
      `./sessions/${sessionId}`,
    );

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', (m) => {
      m.messages.forEach(async (message) => {
        if (!message.key.fromMe) {
          this.eventService.messageReceived.next({ sessionId, message });
        }
      });
    });

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        setTimeout(() => {
          qrcode.generate(qr, { small: true }, (qrOutput: string) => {
            this.qrCodeSubject.next({ sessionId, qr: qrOutput });
          });
        }, 0);
      }

      const sessionInfo: IWhatsappSession = {
        sessionId,
        status:
          connection === 'open'
            ? 'connected'
            : connection === 'close'
              ? 'disconnected'
              : connection === 'connecting'
                ? 'connecting'
                : 'error',
        qrCode: qr,
        lastActivity: new Date(),
      };

      this.sessionInfo.set(sessionId, sessionInfo);
      this.sessionStatusCallbacks.forEach((callback) => callback(sessionInfo));

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

  async getSession(sessionId: string): Promise<IWhatsappSession | null> {
    return this.sessionInfo.get(sessionId) || null;
  }

  async getAllSessions(): Promise<IWhatsappSession[]> {
    return Array.from(this.sessionInfo.values());
  }

  async destroySession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      await session.logout();
      this.sessions.delete(sessionId);
      this.sessionInfo.delete(sessionId);
    }
  }

  onMessageReceived(
    callback: (message: IWhatsappMessageReceived) => void,
  ): void {
    this.messageReceivedCallbacks.push(callback);
  }

  onMessageStatus(callback: (status: IWhatsappMessageStatus) => void): void {
    this.messageStatusCallbacks.push(callback);
  }

  onSessionStatus(callback: (session: IWhatsappSession) => void): void {
    this.sessionStatusCallbacks.push(callback);
  }
}
