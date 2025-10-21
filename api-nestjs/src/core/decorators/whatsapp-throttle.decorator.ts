import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

/**
 * Decorator para aplicar rate limiting específico em rotas do WhatsApp
 * Permite mais requisições devido à natureza de polling do QR code
 */
export const WhatsAppThrottle = () =>
  applyDecorators(
    // 30 requisições por minuto para rotas do WhatsApp
    Throttle({ default: { ttl: 60000, limit: 30 } }),
  );