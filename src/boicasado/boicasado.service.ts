import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/common/database/oracle.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BoicasadoService {
  constructor(private readonly oracle: OracleService) {}

  async TotalEntrada(datainicio: string, datafim: string, filial: string) {
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'boicasado',
      'sql',
      'TotalEntrada.sql',
    );
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const row = await this.oracle.query(sql, { datainicio, datafim, filial });
    return row;
  }
  async TotalExplosao(datainicio: string, datafim: string, filial: string) {
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'boicasado',
      'sql',
      'TotalExplosao.sql',
    );
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const row = await this.oracle.query(sql, { datainicio, datafim, filial });
    return row;
  }
  async PecaExplosao(datainicio: string, datafim: string, filial: string) {
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'boicasado',
      'sql',
      'PecasExplosao.sql',
    );
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const row = await this.oracle.query(sql, { datainicio, datafim, filial });
    return row;
  }
  async EstoqueSaida(datainicio: string, datafim: string, filial: string) {
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'boicasado',
      'sql',
      'estoqueSaida.sql',
    );
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const row = await this.oracle.query(sql, { datainicio, datafim, filial });
    return row;
  }
  async Saida(datainicio: string, datafim: string, filial: string) {
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'boicasado',
      'sql',
      'Saida.sql',
    );
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const row = await this.oracle.query(sql, { datainicio, datafim, filial });
    return row;
  }
}
