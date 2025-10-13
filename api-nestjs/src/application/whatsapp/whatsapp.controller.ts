import { Body, Controller, Get, Post, Param, Delete } from '@nestjs/common';
import { WhatsAppInstanceManager } from './whatsapp-instance-manager.service';
import { SendTextDto } from './dto/send-text.dto';

@Controller({ path: 'whatsapp', version: '1' })
export class WhatsAppController {
  constructor(private readonly instanceManager: WhatsAppInstanceManager) {}

  @Post('instances/:instanceId')
  async createInstance(@Param('instanceId') instanceId: string) {
    const instance = await this.instanceManager.createInstance(instanceId);
    return instance.getStatus();
  }

  @Get('instances')
  getAllInstancesStatus() {
    return this.instanceManager.getAllInstancesStatus();
  }

  @Get('instances/:instanceId/status')
  getStatus(@Param('instanceId') instanceId: string) {
    const instance = this.instanceManager.getInstance(instanceId);
    return instance.getStatus();
  }

  @Get('instances/:instanceId/qr')
  getQr(@Param('instanceId') instanceId: string) {
    const instance = this.instanceManager.getInstance(instanceId);
    return instance.getQr();
  }

  @Get('instances/:instanceId/reconnect')
  reconnect(@Param('instanceId') instanceId: string) {
    return this.instanceManager.reconnect(instanceId);
  }
  
  @Delete('instances/:instanceId')
  closeInstance(@Param('instanceId') instanceId: string) {
    return this.instanceManager.closeInstance(instanceId);
  }

  @Post('instances/:instanceId/send-text')
  async sendText(
    @Param('instanceId') instanceId: string,
    @Body() body: SendTextDto,
  ) {
    const { jid, text } = body;
    const instance = this.instanceManager.getInstance(instanceId);
    return instance.sendText(jid, text);
  }
}
