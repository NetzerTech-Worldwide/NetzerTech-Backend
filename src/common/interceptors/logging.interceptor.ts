import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, headers, ip } = request;
    const now = Date.now();

    const authHeader = headers?.authorization;
    const hasAuth = authHeader ? `[Auth: ${authHeader.substring(0, 20)}...]` : '[No Auth]';
    const userInfo = user ? `[User: ${user.id}]` : '';

    this.logger.log(
      `Incoming Request: ${method} ${url} ${hasAuth} ${userInfo} [IP: ${ip}]`,
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const delay = Date.now() - now;

          this.logger.log(
            `Response: ${method} ${url} ${statusCode} - ${delay}ms`,
          );
        },
        error: (error) => {
          const delay = Date.now() - now;
          const statusCode = error.status || 500;
          this.logger.error(
            `Error: ${method} ${url} ${statusCode} - ${error.message} - ${delay}ms`,
          );

          if (statusCode !== 401) {
            this.logger.debug(error.stack);
          }
        },
      }),
    );
  }
}

