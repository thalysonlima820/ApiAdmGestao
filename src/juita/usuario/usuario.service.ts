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
    const rows = await this.oracle.query<any>(`
    SELECT
      U.CODUSUARIO,
      U.NOME,
      U.EMAIL,
      U.ROUTE_POLICY,
      U.ATIVO,
      U.CREATED_AT,
      U.UPDATED_AT
    FROM DEVBR.JUITA_USUARIO U
    ORDER BY U.CODUSUARIO
  `);

    return rows.map((u: any) => ({
      ...u,
      ROUTEPOLICIES: u.ROUTE_POLICY ? String(u.ROUTE_POLICY).split(',') : [],
    }));
  }

  async findOne(codusuario: string) {
    const rows = await this.oracle.query<any>(
      `
    SELECT
      U.CODUSUARIO,
      U.NOME,
      U.EMAIL,
      U.CPF,
      U.ROUTE_POLICY,
      U.ATIVO,
      U.CREATED_AT,
      U.UPDATED_AT
    FROM DEVBR.JUITA_USUARIO U
    WHERE U.CODUSUARIO = :CODUSUARIO
    `,
      { CODUSUARIO: codusuario },
    );

    const usuario = rows?.[0];

    if (!usuario) {
      AppError.notFound({
        message: 'Pessoa não encontrada',
        messageType: 'aviso',
      });
    }

    return {
      ...usuario,
      ROUTEPOLICIES: usuario.ROUTE_POLICY
        ? String(usuario.ROUTE_POLICY).split(',')
        : [],
    };
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    const passwordHash = await this.hashingService.hash(createUsuarioDto.SENHA);

    try {
      const exists = await this.oracle.query<any>(
        `
      SELECT CPF, EMAIL
      FROM DEVBR.JUITA_USUARIO
      WHERE CPF = :CPF
         OR LOWER(EMAIL) = LOWER(:EMAIL)
      `,
        {
          CPF: createUsuarioDto.CPF,
          EMAIL: createUsuarioDto.EMAIL,
        },
      );

      if (exists.length > 0) {
        const jaExisteCPF = exists.some((u) => u.CPF === createUsuarioDto.CPF);

        const jaExisteEmail = exists.some(
          (u) =>
            String(u.EMAIL).toLowerCase() ===
            String(createUsuarioDto.EMAIL).toLowerCase(),
        );

        if (jaExisteCPF) {
          AppError.badRequest({
            message: 'CPF já cadastrado',
            messageType: 'aviso',
          });
        }

        if (jaExisteEmail) {
          AppError.badRequest({
            message: 'E-mail já cadastrado',
            messageType: 'aviso',
          });
        }
      }

      const sql = `
      INSERT INTO DEVBR.JUITA_USUARIO (
        NOME,
        EMAIL,
        CPF,
        SENHA,
        DATA_NASCIMENTO,
        ROUTE_POLICY,
        ATIVO
      ) VALUES (
        :NOME,
        :EMAIL,
        :CPF,
        :SENHA,
        :DATA_NASCIMENTO,
        :ROUTE_POLICY,
        :ATIVO
      )
    `;

      await this.oracle.query(sql, {
        NOME: createUsuarioDto.NOME,
        EMAIL: createUsuarioDto.EMAIL.toLowerCase().trim(),
        CPF: createUsuarioDto.CPF,
        SENHA: passwordHash,
        DATA_NASCIMENTO: createUsuarioDto.DATA_NASCIMENTO ?? null,
        ROUTE_POLICY: (createUsuarioDto.ROUTEPOLICIES ?? []).join(','),
        ATIVO: createUsuarioDto.ATIVO ?? 1,
      });
    } catch (error) {
      AppError.badRequest({
        message: error,
        messageType: 'aviso',
      });
    }

    return {
      mensagem: `Bem vindo ao Juita ${createUsuarioDto.NOME}`,
    };
  }

  async update(codusuario: string, dto: UpdateUsuarioDto) {
    const rows = await this.oracle.query<any>(
      `
    SELECT
      CODUSUARIO,
      NOME,
      EMAIL,
      CPF,
      SENHA,
      DATA_NASCIMENTO,
      ROUTE_POLICY,
      ATIVO
    FROM DEVBR.JUITA_USUARIO
    WHERE CODUSUARIO = :CODUSUARIO
    `,
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

    const routePolicyFinal =
      dto.ROUTEPOLICIES !== undefined
        ? dto.ROUTEPOLICIES.join(',')
        : atual.ROUTE_POLICY;

    await this.oracle.query(
      `
    UPDATE DEVBR.JUITA_USUARIO SET
      NOME = :NOME,
      EMAIL = :EMAIL,
      CPF = :CPF,
      SENHA = :SENHA,
      DATA_NASCIMENTO = :DATA_NASCIMENTO,
      ROUTE_POLICY = :ROUTE_POLICY,
      ATIVO = :ATIVO
    WHERE CODUSUARIO = :CODUSUARIO
    `,
      {
        CODUSUARIO: codusuario,
        NOME: dto.NOME ?? atual.NOME,
        EMAIL: dto.EMAIL ?? atual.EMAIL,
        CPF: dto.CPF ?? atual.CPF,
        SENHA: senhaFinal,
        DATA_NASCIMENTO: dto.DATA_NASCIMENTO ?? atual.DATA_NASCIMENTO,
        ROUTE_POLICY: routePolicyFinal,
        ATIVO: dto.ATIVO ?? atual.ATIVO,
      },
    );

    return { mensagem: 'Usuário atualizado com sucesso' };
  }
}
