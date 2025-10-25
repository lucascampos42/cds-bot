import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WhatsappService, WhatsAppSession } from '../services/whatsapp.service';

@Component({
  selector: 'app-whatsapp-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h3>Sessões WhatsApp</h3>
      
      <div>
        <input [(ngModel)]="newSessionId" placeholder="ID da sessão" />
        <button (click)="createSession()" [disabled]="!newSessionId">Criar</button>
        <button (click)="loadSessions()">Atualizar</button>
      </div>

      <div *ngIf="isLoading">Carregando...</div>

      <table *ngIf="sessions.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Última Atividade</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let session of sessions">
            <td>{{ session.sessionId }}</td>
            <td>{{ session.status }}</td>
            <td>{{ session.lastActivity }}</td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="sessions.length === 0 && !isLoading">Nenhuma sessão</div>
      <div *ngIf="error">{{ error }}</div>
    </div>
  `
})
export class WhatsappSessionsComponent implements OnInit {
  sessions: WhatsAppSession[] = [];
  newSessionId: string = '';
  isLoading: boolean = false;
  error: string = '';

  constructor(private whatsappService: WhatsappService) {}

  ngOnInit() {
    this.loadSessions();
  }

  loadSessions() {
    this.isLoading = true;
    this.error = '';
    this.whatsappService.getSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erro ao carregar sessões';
        this.isLoading = false;
      }
    });
  }

  createSession() {
    if (!this.newSessionId.trim()) return;

    this.whatsappService.createSession(this.newSessionId.trim()).subscribe({
      next: () => {
        this.newSessionId = '';
        this.loadSessions();
      },
      error: () => {
        this.error = 'Erro ao criar sessão';
      }
    });
  }
}