import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatsappSessionsComponent } from '../whatsapp-sessions/whatsapp-sessions.component';
import { SendMessageComponent } from '../send-message/send-message.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    WhatsappSessionsComponent,
    SendMessageComponent
  ],
  template: `
    <div>
      <h1>WhatsApp Bot</h1>
      
      <app-whatsapp-sessions></app-whatsapp-sessions>
      <hr>
      <app-send-message></app-send-message>
    </div>
  `
})
export class DashboardComponent {}
