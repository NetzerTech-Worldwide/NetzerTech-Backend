import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PasswordChangeGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Allow access to change-password endpoint
    if (request.url?.includes('/auth/change-password') || request.path?.includes('/auth/change-password')) {
      return true;
    }

    // Check if user must change password
    if (user?.mustChangePassword) {
      throw new ForbiddenException('Password change required. Please change your password before accessing this resource.');
    }

    return true;
  }
}



