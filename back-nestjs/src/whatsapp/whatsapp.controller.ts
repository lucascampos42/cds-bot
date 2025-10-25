import { Controller, Post, Body, Get } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('session')
  async createSession(@Body('sessionId') sessionId: string) {
    return this.whatsappService.createSession(sessionId);
  }

  @Get('sessions')
  getSessions() {
    return this.whatsappService.getSessions();
  }
}