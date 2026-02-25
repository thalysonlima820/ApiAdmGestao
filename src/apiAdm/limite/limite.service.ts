import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/common/database/oracle.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LimiteService {
  constructor(private readonly oracle: OracleService) {}

  async GetLimite(DataInicio: string, DataFim: string) {
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'apiAdm',
      'limite',
      'sql',
      'GetLimite.sql',
    );
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const row = await this.oracle.query(sql, { DataInicio, DataFim });

    return row;
  }

  async GetLimiteNEntregue(
    dataInicio: string,
    dataFim: string,
    codcomprador: number,
    codfilial: string,
  ) {
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'apiAdm',
      'limite',
      'sql',
      'GetLimiteNEntregue.sql',
    );
    if (codfilial.toUpperCase() === 'TODOS') {
      const sql = fs.readFileSync(sqlPath, 'utf-8');
      const row = await this.oracle.query(sql, {
        dataInicio,
        dataFim,
        codcomprador,
      });
      return row;
    }
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const row = await this.oracle.query(sql, {
      dataInicio,
      dataFim,
      codcomprador,
    });
    return row.filter((i) => i.CODFILIAL === codfilial)
  }
  
}
