import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../auth.constants';
import { OracleService } from 'src/common/database/oracle.service';
import { AppError } from 'src/common/filters/exceptions/app-exceptions';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(
    private readonly oracle: OracleService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: any = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      AppError.unauthorized({
        message: 'Não logada, faça login',
        messageType: 'aviso',
      });
      return false;
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      const rows = await this.oracle.query<any>(
        `SELECT CODUSUARIO, NOME, ACTIVE, ROUTEPOLICIES
         FROM SITEUSUARIO
         WHERE CODUSUARIO = :CODUSUARIO AND ACTIVE = 1`,
        { CODUSUARIO: payload.sub },
      );

      const usuario = rows[0];
      if (!usuario) {
        AppError.notFound({
          message: 'Pessoa Não encontrada ou Inativa',
          messageType: 'alerta',
        });
        return false;
      }

      payload.pessoa = usuario;
      request[REQUEST_TOKEN_PAYLOAD_KEY] = payload;

      return true;
    } catch {
      AppError.badRequest({
        message: 'Token invalido Refaça seu Login',
        messageType: 'aviso',
      });
      return false;
    }
  }

private extractTokenFromHeader(request: any): string | undefined {
  const headerName = (process.env.AUTH_HEADER ?? 'admgestao').toLowerCase();
  const token = request.headers?.[headerName];

  if (!token || typeof token !== 'string') return;

  return token.trim();
}

}
