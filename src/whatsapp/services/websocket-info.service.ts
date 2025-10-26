import { Injectable } from '@nestjs/common';
import { WEBSOCKET_CONFIG } from '../config/websocket.config';

@Injectable()
export class WebsocketInfoService {
  getWebSocketInfo() {
    return {
      websocket: WEBSOCKET_CONFIG,
    };
  }
}