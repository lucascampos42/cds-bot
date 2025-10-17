import { Logger } from '@nestjs/common';
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  WASocket,
} from 'baileys';
import * as fs from 'fs';
import * as path from 'path';

export class WhatsAppInstance {
  private readonly logger: Logger;
  sock: WASocket | null = null;
  qrString: string | null = null;
  connected = false;
  private isInitializing = false;

  constructor(private readonly instanceId: string) {
    this.logger = new Logger(`${WhatsAppInstance.name}:${this.instanceId}`);
  }

  async init() {
    if (this.isInitializing) {
      this.logger.warn('Initialization already in progress.');
      return;
    }
    this.isInitializing = true;
    this.logger.log('Initializing instance...');

    try {
      const authDir = path.resolve(process.cwd(), 'baileys_auth', this.instanceId);
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(authDir);
      const { version } = await fetchLatestBaileysVersion();

      this.sock = makeWASocket({
        auth: state,
        version,
        printQRInTerminal: false,
        browser: ['CDS Bot', 'Chrome', '1.0'],
      });

      this.sock.ev.on('creds.update', saveCreds);
      this.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.qrString = qr;
          this.logger.log('QR code updated. Use the GET /whatsapp/:instanceId/qr endpoint to get the code.');
        }

        if (connection === 'open') {
          this.connected = true;
          this.qrString = null;
          this.logger.log('Connected to WhatsApp with Baileys.');
        }

        if (connection === 'close') {
          this.connected = false;
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const reason =
            statusCode && DisconnectReason[statusCode]
              ? DisconnectReason[statusCode]
              : 'unknown';
          this.logger.warn(`Connection closed. Reason: ${reason}`);

          if (statusCode === DisconnectReason.loggedOut) {
            this.logger.warn('Logged out. Please scan the QR code again.');
            // Should probably destroy the instance here.
          }
        }
      });
    } catch (error) {
      this.logger.error('Error during Baileys initialization', error as Error);
    } finally {
      this.isInitializing = false;
    }
  }

  async close() {
    if (this.sock) {
      await this.sock.logout();
      this.sock = null;
    }
    this.connected = false;
    this.qrString = null;
  }

  getStatus() {
    return {
      instanceId: this.instanceId,
      connected: this.connected,
      hasQr: !!this.qrString,
      isInitializing: this.isInitializing,
    };
  }

  getQr() {
    return {
      qr: this.qrString,
    };
  }

  async sendText(jid: string, text: string) {
    if (!this.sock || !this.connected) {
      throw new Error('WhatsApp is not connected.');
    }
    const result = await this.sock.sendMessage(jid, { text });
    return { messageId: result?.key?.id, to: jid };
  }
}
