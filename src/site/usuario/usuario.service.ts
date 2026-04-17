import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { OracleService } from 'src/common/database/oracle.service';
import * as fs from 'fs';
import * as path from 'path';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { CreateCupomDto } from './dto/create-cupom.dto';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';

@Injectable()
export class UsuarioService {
  constructor(private readonly oracle: OracleService) {}

  async CadastroUsuario(data: CreateUsuarioDto) {
    const sqlCheckPath = path.join(
      process.cwd(),
      'src',
      'site',
      'usuario',
      'sql',
      'CheckCpf.sql',
    );

    const sqlCadastroPath = path.join(
      process.cwd(),
      'src',
      'site',
      'usuario',
      'sql',
      'Cadastro.sql',
    );

    const sqlCheck = fs.readFileSync(sqlCheckPath, 'utf-8');
    const sqlCadastro = fs.readFileSync(sqlCadastroPath, 'utf-8');

    const cpfExiste = await this.oracle.query(sqlCheck, {
      CPF: data.CPF,
    });

    if (cpfExiste.length > 0) {
      throw new BadRequestException('CPF já cadastrado');
    }

    await this.oracle.query(sqlCadastro, {
      NOME: data.NOME,
      EMAIL: data.EMAIL,
      CPF: data.CPF,
      TELEFONE: data.TELEFONE,
      BAIRRO: data.BAIRRO,
    });

    return {
      ok: true,
      message: 'Usuário cadastrado com sucesso',
    };
  }

  async LoginUsuario(data: LoginUsuarioDto) {
    const sqlLoginPath = path.join(
      process.cwd(),
      'src',
      'site',
      'usuario',
      'sql',
      'Login.sql',
    );

    const sqlLogin = fs.readFileSync(sqlLoginPath, 'utf-8');

    const usuario = await this.oracle.query(sqlLogin, {
      CPF: data.CPF,
    });

    if (!usuario || usuario.length === 0) {
      throw new UnauthorizedException('CPF não encontrado');
    }

    return {
      IDUSUARIO: String(usuario[0].IDUSUARIO),
      NOME: usuario[0].NOME,
    };
  }

  async CadastroCupom(data: CreateCupomDto) {
    const sqlVerificaCupomPath = path.join(
      process.cwd(),
      'src',
      'site',
      'usuario',
      'sql',
      'cupom',
      'VerificaCupomWinthor.sql',
    );

    const sqlCheckExistentePath = path.join(
      process.cwd(),
      'src',
      'site',
      'usuario',
      'sql',
      'cupom',
      'CheckCupomExistente.sql',
    );

    const sqlCadastroCupomPath = path.join(
      process.cwd(),
      'src',
      'site',
      'usuario',
      'sql',
      'cupom',
      'CadastroCupom.sql',
    );

    const sqlVerificaCupom = fs.readFileSync(sqlVerificaCupomPath, 'utf-8');
    const sqlCheckExistente = fs.readFileSync(sqlCheckExistentePath, 'utf-8');
    const sqlCadastroCupom = fs.readFileSync(sqlCadastroCupomPath, 'utf-8');

    let valor = 0
    valor = typeof data.VALOR === 'string'
        ? Number(data.VALOR.replace(',', '.'))
        : Number(data.VALOR);

    if (
      !data.NUMCUPOM ||
      !data.SERIE ||
      !data.IDUSUARIO ||
      Number.isNaN(valor) ||
      valor <= 0
    ) {
      throw new BadRequestException(
        'Parâmetros obrigatórios ausentes ou inválidos',
      );
    }

    const cupomWinthor = await this.oracle.query(sqlVerificaCupom, {
      NUMCUPOM: data.NUMCUPOM,
      SERIE: data.SERIE,
      VALOR: valor,
    });

    if (!cupomWinthor || cupomWinthor.length === 0) {
      throw new NotFoundException(
        'Cupom não localizado. A venda pode não ter subido ainda. Tente novamente em 30m',
      );
    }

    const cupomExistente = await this.oracle.query(sqlCheckExistente, {
      NUMCUPOM: data.NUMCUPOM,
      SERIE: data.SERIE,
    });

    if (cupomExistente && cupomExistente.length > 0) {
      throw new ConflictException('Cupom já cadastrado');
    }

    await this.oracle.query(sqlCadastroCupom, {
      NUMCUPOM: data.NUMCUPOM,
      SERIE: data.SERIE,
      IDUSUARIO: data.IDUSUARIO,
      VALOR: valor,
    });

    return {
      ok: true,
      message: 'Cupom registrado com sucesso',
    };
  }
  
  async CadastroAvaliacao(data: CreateAvaliacaoDto) {
  const sqlCheckCupomPath = path.join(
    process.cwd(),
    'src',
    'site',
    'usuario',
    'sql',
    'avaliacao',
    'CheckCupomAvaliacao.sql',
  );

  const sqlCadastroAvaliacaoPath = path.join(
    process.cwd(),
    'src',
    'site',
    'usuario',
    'sql',
    'avaliacao',
    'CadastroAvaliacao.sql',
  );

  const sqlCheckCupom = fs.readFileSync(sqlCheckCupomPath, 'utf-8');
  const sqlCadastroAvaliacao = fs.readFileSync(
    sqlCadastroAvaliacaoPath,
    'utf-8',
  );

  const valor =
    typeof data.VALOR === 'string'
      ? Number(data.VALOR.replace(',', '.'))
      : Number(data.VALOR);

  if (
    !data.NUMCUPOM ||
    !data.SERIE ||
    Number.isNaN(valor) ||
    valor <= 0 ||
    !data.AVALIACAO ||
    data.AVALIACAO < 1 ||
    data.AVALIACAO > 5
  ) {
    throw new BadRequestException(
      'Parâmetros obrigatórios ausentes ou inválidos',
    );
  }

  const cupomExiste = await this.oracle.query(sqlCheckCupom, {
    NUMCUPOM: data.NUMCUPOM,
    SERIE: data.SERIE,
    VALOR: valor,
  });

  if (!cupomExiste || cupomExiste.length === 0) {
    throw new NotFoundException('Cupom não encontrado para avaliação');
  }

  await this.oracle.query(sqlCadastroAvaliacao, {
    NUMCUPOM: data.NUMCUPOM,
    SERIE: data.SERIE,
    VALOR: valor,
    AVALIACAO: data.AVALIACAO,
    FALARSOBRE: data.FALARSOBRE?.trim() || null,
  });

  return {
    ok: true,
    message: 'Avaliação registrada com sucesso',
  };
}
}