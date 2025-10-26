import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { WhatsappService } from '../whatsapp.service';

@Injectable()
export class WhatsappStreamService {
  constructor(private readonly whatsappService: WhatsappService) {}

  createSessionStream(sessionId: string): Observable<MessageEvent> {
    const qrStream = this.createQRCodeStream(sessionId);
    const statusStream = this.createStatusStream(sessionId);

    return new Observable((subscriber) => {
      const qrSubscription = qrStream.subscribe(subscriber);
      const statusSubscription = statusStream.subscribe(subscriber);

      return () => {
        qrSubscription.unsubscribe();
        statusSubscription.unsubscribe();
      };
    });
  }

  private createQRCodeStream(sessionId: string): Observable<MessageEvent> {
    return this.whatsappService.getQRCodeStream().pipe(
      filter((event) => event.sessionId === sessionId),
      map((event) => this.createMessageEvent('qr-code', { qrCode: event.qr })),
    );
  }

  private createStatusStream(sessionId: string): Observable<MessageEvent> {
    return this.whatsappService.getConnectionStatusStream().pipe(
      filter((event) => event.sessionId === sessionId),
      map((event) =>
        this.createMessageEvent('status', { status: event.status }),
      ),
    );
  }

  private createMessageEvent(type: string, data: any): MessageEvent {
    return {
      type,
      data: JSON.stringify(data),
    } as MessageEvent;
  }
}
