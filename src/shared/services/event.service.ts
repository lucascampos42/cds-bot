import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class EventService {
  public readonly messageReceived = new Subject<{ sessionId: string; message: any }>();
}
