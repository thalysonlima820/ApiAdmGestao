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
    const rows = await this.oracle.query<any>(
      `SELECT
        CODUSUARIO,
        NOME,
        SENHA,
        ACTIVE,
        ROUTEPOLICIES
      FROM SITEUSUARIO
      WHERE NOME = :NOME`,
      { NOME: dto.NOME },
    );

    const usuario = rows[0];

    if (!usuario || usuario.ACTIVE !== 1) {
      AppError.notFound({
        message: 'Pessoa Não encontrada ou Inativa',
        messageType: 'aviso',
      });
    }

    const senhaValida = await this.hashingService.compare(
      dto.SENHA,
      usuario.SENHA,
    );

    if (!senhaValida) {
      AppError.notFound({
        message: 'Senha incorreta',
        messageType: 'aviso',
      });
    }

    const payload = {
      sub: usuario.CODUSUARIO,
      nome: usuario.NOME,
      policies: usuario.ROUTEPOLICIES ? usuario.ROUTEPOLICIES.split(',') : [],
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      usuario: {
        CODUSUARIO: usuario.CODUSUARIO,
        NOME: usuario.NOME,
        ROUTEPOLICIES: payload.policies,
      },
    };
  }
}
