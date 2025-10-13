import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WhatsAppStatus {
  connected: boolean;
  hasQr: boolean;
}

export interface WhatsAppQR {
  qr: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {
  private apiUrl = '/api/v1/whatsapp'; // Adjust if your API URL is different

  constructor(private http: HttpClient) { }

  getStatus(): Observable<WhatsAppStatus> {
    return this.http.get<WhatsAppStatus>(`${this.apiUrl}/status`);
  }

  getQrCode(): Observable<WhatsAppQR> {
    return this.http.get<WhatsAppQR>(`${this.apiUrl}/qr`);
  }
}
