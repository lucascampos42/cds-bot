import { Body, Controller, Get, Post } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { SendTextDto } from './dto/send-text.dto';

@Controller({ path: 'whatsapp', version: '1' })
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Get('status')
  getStatus() {
    return this.whatsappService.getStatus();
  }

  @Get('qr')
  getQr() {
    return this.whatsappService.getQr();
  }

  @Post('send-text')
  async sendText(@Body() body: SendTextDto) {
    const { jid, text } = body;
    return this.whatsappService.sendText(jid, text);
  }
}