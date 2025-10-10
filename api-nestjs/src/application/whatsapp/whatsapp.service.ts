import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  WASocket,
} from 'baileys';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppService.name);
  private sock: WASocket | null = null;
  private qrString: string | null = null;
  private connected = false;

  async onModuleInit() {
    await this.init();
  }

  async init() {
    try {
      const authDir = path.resolve(process.cwd(), 'baileys_auth');
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(authDir);
      const { version } = await fetchLatestBaileysVersion();

      this.sock = makeWASocket({
        auth: state,
        version,
        printQRInTerminal: false, // QR será exposto via endpoint
        browser: ['CDS Bot', 'Chrome', '1.0'],
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update as {
          connection?: 'open' | 'close' | 'connecting';
          lastDisconnect?: { error: { output?: { statusCode?: number } } };
          qr?: string;
        };

        if (qr) {
          this.qrString = qr;
          this.logger.log(
            'QR code atualizado. Use o endpoint GET /whatsapp/qr para obter o código.',
          );
        }

        if (connection === 'open') {
          this.connected = true;
          this.qrString = null; // QR não é mais necessário
          this.logger.log('Conectado ao WhatsApp com Baileys.');
        }

        if (connection === 'close') {
          this.connected = false;
          const statusCode = (lastDisconnect as any)?.error?.output?.statusCode;
          const reason = DisconnectReason[statusCode as number];
          this.logger.warn(
            `Conexão encerrada. Razão: ${reason ?? statusCode ?? 'desconhecida'}`,
          );
        }
      });
    } catch (error) {
      this.logger.error('Erro ao inicializar Baileys', error as Error);
    }
  }

  getStatus() {
    return {
      connected: this.connected,
      hasQr: !!this.qrString,
    };
  }

  getQr() {
    return {
      qr: this.qrString,
    };
  }

  async sendText(jid: string, text: string) {
    if (!this.sock) {
      throw new Error('Socket WhatsApp não inicializado');
    }
    const result = await this.sock.sendMessage(jid, { text });
    if (result) {
      return { messageId: result.key?.id, to: jid };
    } else {
      return { messageId: null, to: jid, error: 'Falha ao enviar mensagem' };
    }
  }
}