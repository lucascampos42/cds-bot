import { Injectable } from '@nestjs/common';
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';

@Injectable()
export class WhatsappService {
  private sessions: Map<string, any> = new Map();

  async createSession(sessionId: string) {
    const { state, saveCreds } = await useMultiFileAuthState(`sessions/${sessionId}`);
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
    });

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'close') {
        if (lastDisconnect && lastDisconnect.error) {
          const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
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
    return Array.from(this.sessions.keys());
  }
}