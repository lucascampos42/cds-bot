import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WhatsappService, WhatsAppSession, SendMessageRequest } from '../services/whatsapp.service';

@Component({
  selector: 'app-send-message',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h3>Enviar Mensagem</h3>
      
      <form (ngSubmit)="sendMessage()">
        <div>
          <label>Sessão:</label>
          <select [(ngModel)]="messageData.sessionId" name="sessionId" required>
            <option value="">Selecione uma sessão</option>
            <option *ngFor="let session of sessions" [value]="session.sessionId">
              {{ session.sessionId }} ({{ session.status }})
            </option>
          </select>
        </div>

        <div>
          <label>Número:</label>
          <input [(ngModel)]="messageData.number" name="number" placeholder="5511999999999" required />
        </div>

        <div>
          <label>Mensagem:</label>
          <textarea [(ngModel)]="messageData.message" name="message" rows="3" required></textarea>
        </div>

        <div>
          <button type="submit" [disabled]="isSending">Enviar</button>
          <button type="button" (click)="clearForm()">Limpar</button>
        </div>
      </form>

      <div *ngIf="isSending">Enviando...</div>
      <div *ngIf="error">{{ error }}</div>
      <div *ngIf="lastMessageResult">
        Status: {{ lastMessageResult.success ? 'Sucesso' : 'Falha' }}
        <div *ngIf="lastMessageResult.messageId">ID: {{ lastMessageResult.messageId }}</div>
      </div>
    </div>
  `
})
export class SendMessageComponent implements OnInit {
  messageData: SendMessageRequest = {
    sessionId: '',
    number: '',
    message: ''
  };

  sessions: WhatsAppSession[] = [];
  isSending: boolean = false;
  error: string = '';
  lastMessageResult: any = null;

  constructor(private whatsappService: WhatsappService) {}

  ngOnInit() {
    this.loadSessions();
  }

  loadSessions() {
    this.whatsappService.getSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
      },
      error: () => {
        this.error = 'Erro ao carregar sessões';
      }
    });
  }

  sendMessage() {
    if (!this.messageData.sessionId || !this.messageData.number || !this.messageData.message) {
      this.error = 'Preencha todos os campos';
      return;
    }

    this.isSending = true;
    this.error = '';
    this.whatsappService.sendMessage(this.messageData).subscribe({
      next: (response) => {
        this.lastMessageResult = response;
        this.isSending = false;
      },
      error: () => {
        this.error = 'Erro ao enviar mensagem';
        this.lastMessageResult = { success: false };
        this.isSending = false;
      }
    });
  }

  clearForm() {
    this.messageData = {
      sessionId: '',
      number: '',
      message: ''
    };
    this.lastMessageResult = null;
    this.error = '';
  }
}
