import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface WhatsAppStatus {
  instanceId: string;
  connected: boolean;
  hasQr: boolean;
  isInitializing: boolean;
}

export interface WhatsAppQR {
  qr: string | null;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {
  private apiUrl = `${environment.apiUrl}/whatsapp`;
  private instanceId = 'default';

  constructor(private http: HttpClient) { }

  createInstance(): Observable<WhatsAppStatus> {
    return this.http.post<ApiResponse<WhatsAppStatus>>(`${this.apiUrl}/instances/${this.instanceId}`, {})
      .pipe(map(response => response.data));
  }

  getStatus(): Observable<WhatsAppStatus> {
    return this.http.get<ApiResponse<WhatsAppStatus>>(`${this.apiUrl}/instances/${this.instanceId}/status`)
      .pipe(map(response => response.data));
  }

  getQrCode(): Observable<WhatsAppQR> {
    return this.http.get<ApiResponse<WhatsAppQR>>(`${this.apiUrl}/instances/${this.instanceId}/qr`)
      .pipe(map(response => response.data));
  }

  reconnect(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/instances/${this.instanceId}/reconnect`)
      .pipe(map(response => response.data));
  }
}
