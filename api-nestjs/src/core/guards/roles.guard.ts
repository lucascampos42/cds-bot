import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../generated/prisma-client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // Hierarquia de roles: maior número = maior privilégio
  private readonly roleHierarchy = {
    [Role.USER]: 1,
    [Role.CLIENT]: 2,
    [Role.ADMIN]: 3,
  };

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    const userRoleLevel = this.roleHierarchy[user.role];
    const minRequiredLevel = Math.min(
      ...requiredRoles.map((role) => this.roleHierarchy[role]),
    );

    // Usuário tem acesso se seu nível for >= ao mínimo exigido
    return userRoleLevel >= minRequiredLevel;
  }
}
