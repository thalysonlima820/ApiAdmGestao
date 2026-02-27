import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { OracleService } from 'src/common/database/oracle.service';
import { HashingService } from './hashing/hashing.service';
import { AppError } from 'src/common/filters/exceptions/app-exceptions';

@Injectable()
export class AuthService {
  constructor(
    private readonly oracle: OracleService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const email = String(dto.EMAIL ?? '').trim().toLowerCase();

    const rows = await this.oracle.query<any>(
      `
      SELECT
        CODUSUARIO,
        NOME,
        EMAIL,
        SENHA,
        ATIVO,
        ROUTE_POLICY
      FROM DEVBR.JUITA_USUARIO
      WHERE LOWER(EMAIL) = :EMAIL
      `,
      { EMAIL: email },
    );

    const usuario = rows?.[0];

    if (!usuario) {
      AppError.notFound({
        message: 'Usuário não encontrado',
        messageType: 'aviso',
      });
    }

    if (Number(usuario.ATIVO) !== 1) {
      AppError.badRequest({
        message: 'Usuário inativo',
        messageType: 'aviso',
      });
    }

    const senhaValida = await this.hashingService.compare(
      dto.SENHA,
      usuario.SENHA,
    );

    if (!senhaValida) {
      AppError.badRequest({
        message: 'Senha incorreta',
        messageType: 'aviso',
      });
    }

    const policies = usuario.ROUTE_POLICY
      ? String(usuario.ROUTE_POLICY)
          .split(',')
          .map((p: string) => p.trim())
          .filter(Boolean)
      : [];

    const payload = {
      sub: usuario.CODUSUARIO,
      nome: usuario.NOME,
      policies,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      usuario: {
        CODUSUARIO: usuario.CODUSUARIO,
        NOME: usuario.NOME,
        EMAIL: usuario.EMAIL,
        ROUTEPOLICIES: policies,
        ATIVO: Number(usuario.ATIVO),
      },
    };
  }
}