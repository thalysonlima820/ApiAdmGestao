import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/common/database/oracle.service';
import * as fs from 'fs';
import * as path from 'path';

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

    const rows = await this.oracle.query<any>(sql, {data_entrada});

    return rows
  }
}
