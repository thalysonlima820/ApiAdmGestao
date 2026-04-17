import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/common/database/oracle.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BiService {
  constructor(private readonly oracle: OracleService) {}

  async GetVendaMes() {
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'bi',
      'sql',
      'VendaMesAtual.sql',
    );

    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const row = await this.oracle.query(sql);
    return row;
  }

  async GetVendaData(datainicio: string, datafim: string) {
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'bi',
      'sql',
      'VendaData.sql',
    );

    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const row = await this.oracle.query(sql, { datainicio, datafim });
    return row;
  }
}