import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { Subscription, timer } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { WhatsappService, WhatsAppStatus } from '../services/whatsapp.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  qrCodeData: string | null = null;
  isConnected = false;
  isLoading = false;
  error: string | null = null;
  private statusSubscription: Subscription | undefined;

  constructor(private whatsappService: WhatsappService) {}

  ngOnInit(): void {
    this.initializeInstance();
  }

  ngOnDestroy(): void {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  initializeInstance(): void {
    this.isLoading = true;
    this.error = null;
    
    // Primeiro tenta obter o status, se falhar, cria a instância
    this.whatsappService.getStatus().pipe(
      catchError(() => {
        // Se falhar ao obter status, cria a instância
        return this.whatsappService.createInstance();
      })
    ).subscribe({
      next: () => {
        this.startStatusPolling();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erro ao inicializar WhatsApp: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  startStatusPolling(): void {
    this.statusSubscription = timer(0, 5000) // Poll every 5 seconds
      .pipe(
        switchMap(() => this.whatsappService.getStatus()),
        catchError(err => {
          console.error('Erro ao obter status:', err);
          return of({ connected: false, hasQr: false } as WhatsAppStatus);
        })
      )
      .subscribe((status: WhatsAppStatus) => {
        this.isConnected = status.connected;
        if (!status.connected && status.hasQr) {
          this.fetchQrCode();
        } else if (status.connected) {
          this.qrCodeData = null;
        }
      });
  }

  fetchQrCode(): void {
    this.whatsappService.getQrCode().subscribe({
      next: (data) => {
        this.qrCodeData = data.qr;
      },
      error: (err) => {
        console.error('Erro ao obter QR code:', err);
        this.error = 'Erro ao obter QR code';
      }
    });
  }

  requestNewQrCode(): void {
    this.isLoading = true;
    this.error = null;
    this.qrCodeData = null;
    
    this.whatsappService.reconnect().subscribe({
      next: () => {
        this.isLoading = false;
        // O polling irá detectar o novo QR code automaticamente
      },
      error: (err) => {
        this.error = 'Erro ao solicitar novo QR code: ' + err.message;
        this.isLoading = false;
      }
    });
  }
}
