import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/common/database/oracle.service';
import * as fs from 'fs';
import * as path from 'path';
import { UpdatePrecoDto } from './dto/update-preco.dto';

@Injectable()
export class PrecificacaoService {
  constructor(private readonly oracle: OracleService) {}

  async GetAjuste(data_entrada: string) {
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'apiAdm',
      'precificacao',
      'sql',
      'NfEntrada.sql',
    );
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    const rows = await this.oracle.query<any>(sql, { data_entrada });

    return rows;
  }
  async GetEntradaNf(data_entrada: string) {
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'apiAdm',
      'precificacao',
      'sql',
      'TodasEntrada.sql',
    );
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    const rows = await this.oracle.query<any>(sql, { data_entrada });

    return rows;
  }
  async GetPreVenda(data_entrada: string) {
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'apiAdm',
      'precificacao',
      'sql',
      'PreVenda.sql',
    );
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    const rows = await this.oracle.query<any>(sql, { data_entrada });

    return rows;
  }

  async UpdatePreco(dados: UpdatePrecoDto) {
    await this.oracle.query(
      `UPDATE PCEMBALAGEM B 
      SET B.PTABELA = :PRECOMINSUG, B.JUSTIFICATIVAPRECO = NULL, B.DTULTALTPTABELA = SYSDATE
      WHERE B.CODPROD = :COD_PRODUTO
      AND B.UNIDADE in ('UN', 'KG')`,
      { PRECOMINSUG: dados.PRECOMINSUG, COD_PRODUTO: dados.COD_PRODUTO },
    );
    await this.oracle.query(
      `UPDATE PCEMBALAGEM B 
      SET B.PTABELAATAC = ROUND(:PRECOMINSUG * 0.95, 2), B.JUSTIFICATIVAPRECO = NULL, B.DTULTALTPTABELA = SYSDATE
      WHERE B.CODPROD = :COD_PRODUTO
      AND B.UNIDADE in ('UN', 'KG')`,
      { PRECOMINSUG: dados.PRECOMINSUG, COD_PRODUTO: dados.COD_PRODUTO },
    );
    await this.oracle.query(
      `UPDATE PCEMBALAGEM B 
      SET B.PTABELA = ROUND(:PRECOMINSUG * B.QTUNIT, 2), B.JUSTIFICATIVAPRECO = NULL, B.DTULTALTPTABELA = SYSDATE
      WHERE B.CODPROD = :COD_PRODUTO
      AND B.UNIDADE IN ('CX','SC','CT','DP','FD','PC','PT')`,
      { PRECOMINSUG: dados.PRECOMINSUG, COD_PRODUTO: dados.COD_PRODUTO },
    );
    await this.oracle.query(
      `UPDATE PCEMBALAGEM B 
      SET B.PTABELAATAC = ROUND(:PRECOMINSUG * 0.95 * B.QTUNIT, 2), B.JUSTIFICATIVAPRECO = NULL, B.DTULTALTPTABELA = SYSDATE
      WHERE B.CODPROD = :COD_PRODUTO
      AND B.UNIDADE IN ('CX','SC','CT','DP','FD','PC','PT')`,
      { PRECOMINSUG: dados.PRECOMINSUG, COD_PRODUTO: dados.COD_PRODUTO },
    );

    return {
      menssage: `Sucesso Produto ${dados.COD_PRODUTO} Alterado`
    }
  }
}
