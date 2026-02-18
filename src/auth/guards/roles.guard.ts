import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from 'src/users/entities/user.etity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Rol tələb olunmursa, icazə ver
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      return false; // İstifadəçi və ya rol yoxdursa, icazə vermə
    }

    // ✅ İstifadəçinin rolllarından ən azı biri tələb olunan rollardan biridir?
    return requiredRoles.some((role) => user.role.includes(role));
  }
}