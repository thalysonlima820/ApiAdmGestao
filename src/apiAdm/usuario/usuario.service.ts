import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/common/database/oracle.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { AppError } from 'src/common/filters/exceptions/app-exceptions';

@Injectable()
export class UsuarioService {
  constructor(
    private readonly oracle: OracleService,
    private readonly hashingService: HashingService,
  ) {}

  async findAll() {
    return this.oracle.query(`
      SELECT *
      FROM SITEUSUARIO
    `);
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    const passwordHash = await this.hashingService.hash(createUsuarioDto.SENHA);

    const sql = `
    INSERT INTO SITEUSUARIO (
      CODUSUARIO,
      NOME,
      SENHA,
      ROUTEPOLICIES,
      ACTIVE
    ) VALUES (
      :CODUSUARIO,
      :NOME,
      :SENHA,
      :ROUTEPOLICIES,
      1
    )
  `;

    await this.oracle.query(sql, {
      CODUSUARIO: createUsuarioDto.CODUSUARIO,
      NOME: createUsuarioDto.NOME,
      SENHA: passwordHash,
      ROUTEPOLICIES: createUsuarioDto.ROUTEPOLICIES.join(','),
    });

    return { mensagem: `Bem vindo ao Adm Gestão ${createUsuarioDto.NOME}` };
  }

  async findOne(codusuario: string) {
    const rows = await this.oracle.query<any>(
      `SELECT
        CODUSUARIO,
        NOME,
        SENHA,
        ACTIVE,
        ROUTEPOLICIES
      FROM SITEUSUARIO
      WHERE CODUSUARIO = :codusuario`,
      { CODUSUARIO: codusuario },
    );

    if (rows === null) {
      AppError.notFound({
        message: 'Pessoa Não encontrada',
        messageType: 'aviso',
      });
    }

    return rows[0] ?? null;
  }
}
