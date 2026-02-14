import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/common/database/oracle.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { AppError } from 'src/common/filters/exceptions/app-exceptions';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(
    private readonly oracle: OracleService,
    private readonly hashingService: HashingService,
  ) {}

  async findAll() {
    return this.oracle.query(`
      SELECT U.CODUSUARIO, U.NOME, U.IDTELEGRAM, U.ROUTEPOLICIES, U.ULTIMO_LOGIN, U.EMAIL, U.ACTIVE FROM SITEUSUARIO U
    `);
  }

  async findOne(codusuario: string) {
    const rows = await this.oracle.query<any>(
      `SELECT
        U.CODUSUARIO, U.NOME, U.IDTELEGRAM, U.ROUTEPOLICIES, U.ULTIMO_LOGIN, U.EMAIL, U.ACTIVE
      FROM SITEUSUARIO u
      WHERE u.CODUSUARIO = :codusuario`,
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

  async create(createUsuarioDto: CreateUsuarioDto) {
    const passwordHash = await this.hashingService.hash(createUsuarioDto.SENHA);

    try {
      const sql = `
        INSERT INTO SITEUSUARIO (
          CODUSUARIO,
          NOME,
          SENHA,
          ROUTEPOLICIES,
          ACTIVE,
          EMAIL,
          IDTELEGRAM
        ) VALUES (
          :CODUSUARIO,
          :NOME,
          :SENHA,
          :ROUTEPOLICIES,
          1,
          :EMAIL,
          :IDTELEGRAM
        )
      `;

      await this.oracle.query(sql, {
        CODUSUARIO: createUsuarioDto.CODUSUARIO,
        NOME: createUsuarioDto.NOME,
        SENHA: passwordHash,
        ROUTEPOLICIES: createUsuarioDto.ROUTEPOLICIES.join(','),
        EMAIL: createUsuarioDto.EMAIL,
        IDTELEGRAM: createUsuarioDto.IDTELEGRAM ?? 0,
      });
    } catch (error) {
      AppError.badRequest({
        message: error,
        messageType: 'aviso',
      });
    }

    return { mensagem: `Bem vindo ao Adm Gestão ${createUsuarioDto.NOME}` };
  }

  async Update(codusuario: string, dto: UpdateUsuarioDto) {
    const rows = await this.oracle.query<any>(
      `SELECT ACTIVE, CODUSUARIO, NOME, SENHA, ROUTEPOLICIES, IDTELEGRAM, EMAIL
     FROM SITEUSUARIO
     WHERE CODUSUARIO = :CODUSUARIO`,
      { CODUSUARIO: codusuario },
    );

    const atual = rows?.[0];
    if (!atual) {
      AppError.notFound({
        message: 'Usuário não encontrado',
        messageType: 'aviso',
      });
    }

    const senhaFinal = dto.SENHA
      ? await this.hashingService.hash(dto.SENHA)
      : atual.SENHA;

    const policiesFinal =
      dto.ROUTEPOLICIES !== undefined
        ? dto.ROUTEPOLICIES.join(',')
        : atual.ROUTEPOLICIES;

    await this.oracle.query(
      `UPDATE SITEUSUARIO SET
          NOME = :NOME,
          SENHA = :SENHA,
          ROUTEPOLICIES = :ROUTEPOLICIES,
          IDTELEGRAM = :IDTELEGRAM,
          EMAIL = :EMAIL,
          ACTIVE = :ACTIVE
        WHERE CODUSUARIO = :CODUSUARIO
      `,
      {
        CODUSUARIO: codusuario,
        NOME: dto.NOME ?? atual.NOME,
        SENHA: senhaFinal,
        ROUTEPOLICIES: policiesFinal,
        IDTELEGRAM: dto.IDTELEGRAM ?? atual.IDTELEGRAM,
        EMAIL: dto.EMAIL ?? atual.EMAIL,
        ACTIVE: dto.ACTIVE ?? atual.ACTIVE,
      },
    );

    return { mensagem: 'Usuário atualizado com sucesso' };
  }
}
