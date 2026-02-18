import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, of } from 'rxjs';

@Injectable()
export class ChangeDataInterceptor implements NestInterceptor {
  private readonly cache = new Map<string,{ data: any; expires: number }>();

  private readonly TTL = 60 * 1000;

  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const key = `${req.method}:${req.originalUrl}`;
    const now = Date.now();

    const cached = this.cache.get(key);

    if (cached && cached.expires > now) {
      res.setHeader('x-cache', 'HIT');
      return of(cached.data);
    }

    res.setHeader('x-cache', 'MISS');

    return next.handle().pipe(
      map((data) => {
        const response = Array.isArray(data)
          ? { data, count: data.length }
          : data;

        this.cache.set(key, {
          data: response,
          expires: now + this.TTL,
        });

        return response;
      }),
    );
  }
}

