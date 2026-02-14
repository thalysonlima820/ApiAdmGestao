import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, map } from 'rxjs';
import { CryptoService } from '../../crypto/crypto.service';

@Injectable()
export class EncryptResponseInterceptor implements NestInterceptor {
  constructor(
    private readonly crypto: CryptoService,
    private readonly config: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const enabled = this.config.get<boolean>('RESPONSE_ENCRYPTION_ENABLED', true);
    if (!enabled) return next.handle();

    const req = context.switchToHttp().getRequest();
    const url = String(req?.originalUrl ?? req?.url ?? '');

    if (url.startsWith('/auth/login')) {
      return next.handle();
    }

    const res = context.switchToHttp().getResponse();
    const ct = String(res?.getHeader?.('content-type') ?? '');
    if (ct.includes('text/event-stream') || ct.includes('application/octet-stream')) {
      return next.handle();
    }

    return next.handle().pipe(map((data) => this.crypto.encryptJson(data)));
  }
}
