import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, of } from 'rxjs';

@Injectable()
export class ChangeDataInterceptor implements NestInterceptor {
  private readonly cache = new Map<string, any>();

  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request = context.switchToHttp().getRequest();

    const key = `${request.method}:${request.originalUrl}`;

    if (this.cache.has(key)) {
      return of(this.cache.get(key));
    }

    return next.handle().pipe(
      map((data) => {
        const response = Array.isArray(data)
          ? {
              data,
              count: data.length,
            }
          : data;
        this.cache.set(key, response);
        return response;
      }),
    );
  }
}
