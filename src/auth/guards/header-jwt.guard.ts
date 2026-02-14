import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { AppError } from 'src/common/filters/exceptions/app-exceptions';

@Injectable()
export class HeaderJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token = this.extractBearer(req) ?? this.extractFromCustomHeader(req);

    if (!token) {
      AppError.notFound({
        message: 'Token não fornecido.',
        messageType: 'aviso',
      });
      return false
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );
      req.user = payload;
      return true;
    } catch {
      AppError.notFound({
        message: 'Token inválido ou expirado.',
        messageType: 'aviso',
      });
      return false
    }
  }

  private extractBearer(req: any): string | undefined {
    const authorization = req.headers?.authorization;
    if (!authorization || typeof authorization !== 'string') return;
    const [type, token] = authorization.split(' ');
    if (type?.toLowerCase() !== 'bearer') return;
    return token;
  }

  private extractFromCustomHeader(req: any): string | undefined {
    const headerName = (process.env.AUTH_HEADER ?? 'admgestao').toLowerCase();
    const token = req.headers?.[headerName];
    return typeof token === 'string' && token.trim() ? token.trim() : undefined;
  }
}
