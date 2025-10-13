import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { WhatsAppInstance } from './whatsapp.instance';

@Injectable()
export class WhatsAppInstanceManager {
  private readonly logger = new Logger(WhatsAppInstanceManager.name);
  private instances = new Map<string, WhatsAppInstance>();

  async createInstance(instanceId: string): Promise<WhatsAppInstance> {
    if (this.instances.has(instanceId)) {
      this.logger.warn(`Instance ${instanceId} already exists.`);
      return this.getInstance(instanceId);
    }

    this.logger.log(`Creating new instance: ${instanceId}`);
    const instance = new WhatsAppInstance(instanceId);
    this.instances.set(instanceId, instance);
    await instance.init();
    return instance;
  }

  getInstance(instanceId: string): WhatsAppInstance {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new NotFoundException(`Instance ${instanceId} not found.`);
    }
    return instance;
  }

  getAllInstancesStatus() {
    return Array.from(this.instances.values()).map(instance => instance.getStatus());
  }

  async reconnect(instanceId: string) {
    this.logger.log(`Reconnecting instance: ${instanceId}`);
    const instance = this.getInstance(instanceId);
    await instance.close();
    await instance.init();
    return { message: 'Reconnection initiated. Monitor status and QR code.' };
  }

  async closeInstance(instanceId: string) {
    this.logger.log(`Closing instance: ${instanceId}`);
    const instance = this.getInstance(instanceId);
    await instance.close();
    this.instances.delete(instanceId);
    return { message: `Instance ${instanceId} closed.` };
  }
}
