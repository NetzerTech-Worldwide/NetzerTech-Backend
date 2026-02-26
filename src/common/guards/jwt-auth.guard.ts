import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    
    // Log authentication attempt
    if (!authHeader) {
      this.logger.warn(`Authentication attempt without token: ${request.method} ${request.url}`);
    } else {
      this.logger.debug(`Authentication attempt: ${request.method} ${request.url}`);
    }
    
    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    if (err || !user) {
      // Log the specific error
      if (info?.name === 'TokenExpiredError') {
        this.logger.warn(`Token expired for ${request.method} ${request.url}`);
        throw new UnauthorizedException('Token has expired');
      }
      if (info?.name === 'JsonWebTokenError') {
        this.logger.warn(`Invalid token for ${request.method} ${request.url}: ${info.message}`);
        throw new UnauthorizedException('Invalid token');
      }
      if (info?.name === 'NotBeforeError') {
        this.logger.warn(`Token not active yet for ${request.method} ${request.url}`);
        throw new UnauthorizedException('Token not active yet');
      }
      if (err) {
        this.logger.error(`Authentication error for ${request.method} ${request.url}: ${err.message}`);
        throw err;
      }
      this.logger.warn(`Authentication failed for ${request.method} ${request.url} - no user returned`);
      throw new UnauthorizedException('Authentication failed');
    }
    
    // Allow access to change-password endpoint even if password change is required
    const url = request.url || request.path || '';
    const isChangePasswordEndpoint = url.includes('/auth/change-password') || url.includes('change-password');
    
    // Check if user must change password (except for change-password endpoint)
    if (user.mustChangePassword && !isChangePasswordEndpoint) {
      this.logger.warn(`User ${user.id} attempted to access ${request.method} ${url} but must change password`);
      throw new UnauthorizedException('Password change required. Please change your password first.');
    }
    
    this.logger.debug(`Authentication successful for user ${user.id}: ${request.method} ${request.url}`);
    return user;
  }
}
