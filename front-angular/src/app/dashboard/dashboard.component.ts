import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { WhatsappService, WhatsAppStatus } from '../services/whatsapp.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, QRCodeModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  qrCodeData: string | null = null;
  isConnected = false;
  private statusSubscription: Subscription | undefined;

  constructor(private whatsappService: WhatsappService) {}

  ngOnInit(): void {
    this.getStatus();
    this.statusSubscription = timer(0, 5000) // Poll every 5 seconds
      .pipe(switchMap(() => this.whatsappService.getStatus()))
      .subscribe((status: WhatsAppStatus) => {
        this.isConnected = status.connected;
        if (!status.connected && status.hasQr) {
          this.fetchQrCode();
        } else {
          this.qrCodeData = null;
        }
      });
  }

  ngOnDestroy(): void {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  getStatus(): void {
    this.whatsappService.getStatus().subscribe(status => {
      this.isConnected = status.connected;
      if (!status.connected && status.hasQr) {
        this.fetchQrCode();
      }
    });
  }

  fetchQrCode(): void {
    this.whatsappService.getQrCode().subscribe(data => {
      this.qrCodeData = data.qr;
    });
  }
}
