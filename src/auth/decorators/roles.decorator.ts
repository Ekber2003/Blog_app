import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/users/entities/user.etity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);