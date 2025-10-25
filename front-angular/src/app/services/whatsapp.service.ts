import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WhatsAppSession {
  sessionId: string;
  status: 'connected' | 'disconnected';
  lastActivity: string;
}

export interface SendMessageRequest {
  sessionId: string;
  number: string;
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  messageId: string;
  timestamp: string;
  to: string;
  sessionId: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {
  private apiUrl = `${environment.apiUrl}/whatsapp`;

  constructor(private http: HttpClient) { }

  createSession(sessionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions`, { sessionId });
  }

  getSessions(): Observable<WhatsAppSession[]> {
    return this.http.get<WhatsAppSession[]>(`${this.apiUrl}/sessions`);
  }

  sendMessage(request: SendMessageRequest): Observable<SendMessageResponse> {
    return this.http.post<SendMessageResponse>(`${this.apiUrl}/send`, request);
  }
}
