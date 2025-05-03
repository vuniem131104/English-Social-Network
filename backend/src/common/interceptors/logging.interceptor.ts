// src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now       = Date.now();
    const request   = context.switchToHttp().getRequest();
    const method    = request.method;
    const url       = request.url;
    const userId    = request.user?.id || 'Guest';

    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(
            `${method} ${url} - User: ${userId} - IP: ${request.ip} - ${Date.now() - now}ms`,
          ),
        ),
      );
  }
}
