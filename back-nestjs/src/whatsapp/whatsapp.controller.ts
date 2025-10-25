import { Controller, Get, Post, Body } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('sessions')
  async createSession(@Body('sessionId') sessionId: string): Promise<any> {
    return this.whatsappService.createSession(sessionId);
  }

  @Get('sessions')
  getSessions() {
    return this.whatsappService.getSessions();
  }

  @Post('send')
  async sendMessage(
    @Body('sessionId') sessionId: string,
    @Body('number') number: string,
    @Body('message') message: string,
  ) {
    return this.whatsappService.sendMessage(sessionId, number, message);
  }
}