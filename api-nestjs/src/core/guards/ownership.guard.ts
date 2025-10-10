import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OWNERSHIP_KEY } from '../decorators/ownership.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireOwnership = this.reflector.getAllAndOverride<boolean>(
      OWNERSHIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se não há requisito de ownership, permite acesso
    if (requireOwnership === undefined || requireOwnership === false) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Apenas ADMIN possui acesso total sem restrições de ownership
    const hasFullAccess = user.role === Role.ADMIN;

    if (hasFullAccess) {
      return true;
    }

    // CLIENT/USER: só podem acessar seus próprios dados
    if (user.role === Role.CLIENT || user.role === Role.USER) {
      if (!resourceId) {
        throw new ForbiddenException('ID do recurso é obrigatório');
      }

      if (user.userId !== resourceId) {
        throw new ForbiddenException(
          'Acesso negado: você só pode acessar seus próprios dados',
        );
      }
    }

    return true;
  }
}
