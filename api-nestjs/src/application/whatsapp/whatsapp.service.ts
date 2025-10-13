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
  private isInitializing = false;

  async onModuleInit() {
    await this.init();
  }

  async init() {
    if (this.isInitializing) {
      this.logger.warn('Inicialização já em andamento.');
      return;
    }
    this.isInitializing = true;

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
        printQRInTerminal: false,
        browser: ['CDS Bot', 'Chrome', '1.0'],
      });

      this.sock.ev.on('creds.update', saveCreds);
      this.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.qrString = qr;
          this.logger.log(
            'QR code atualizado. Use o endpoint GET /whatsapp/qr para obter o código.',
          );
        }

        if (connection === 'open') {
          this.connected = true;
          this.qrString = null;
          this.logger.log('Conectado ao WhatsApp com Baileys.');
        }

        if (connection === 'close') {
          this.connected = false;
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          const reason =
            statusCode && DisconnectReason[statusCode]
              ? DisconnectReason[statusCode]
              : 'desconhecida';
          this.logger.warn(`Conexão encerrada. Razão: ${reason}`);

          // Se a desconexão não foi intencional, tenta reconectar
          if (statusCode !== DisconnectReason.loggedOut) {
            // Opcional: Adicionar lógica de reconexão automática aqui se desejado
          }
        }
      });
    } catch (error) {
      this.logger.error('Erro ao inicializar Baileys', error as Error);
    } finally {
      this.isInitializing = false;
    }
  }

  private async close() {
    if (this.sock) {
      await this.sock.logout();
      this.sock = null;
    }
    this.connected = false;
    this.qrString = null;
  }

  async reconnect() {
    this.logger.log('Tentando reconectar...');
    await this.close();
    await this.init();
    return { message: 'Reconexão iniciada. Monitore o status e o QR code.' };
  }

  getStatus() {
    return {
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
      throw new Error('WhatsApp não está conectado.');
    }
    const result = await this.sock.sendMessage(jid, { text });
    return { messageId: result?.key?.id, to: jid };
  }
}