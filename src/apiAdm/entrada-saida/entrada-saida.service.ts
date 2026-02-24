import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/common/database/oracle.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EntradaSaidaService {
  constructor(private readonly oracle: OracleService) {}

  async GetEntradaSaidaDep(datainicio: string, datafim: string, trans:string, filial: string) {
    const condiferartransferencia = String(trans).toUpperCase() === 'S' ? 'S' : 'N';

    if(filial.toUpperCase() === 'TODOS'){
      const sqlPath = path.join(
        process.cwd(),
        'src',
        'apiAdm',
        'entrada-saida',
        'sql',
        'EntradaSaidaDep.sql',
      );
      const sql = fs.readFileSync(sqlPath, 'utf-8');
      const row = await this.oracle.query(sql, { datainicio, datafim, condiferartransferencia });
      return row;
    }
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'apiAdm',
      'entrada-saida',
      'sql',
      'EntradaSaidaDepFilial.sql',
    );
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const row = await this.oracle.query(sql, { datainicio, datafim, condiferartransferencia, filial });

    return row;
  }
  async GetEntradaSaidaSec(datainicio: string, datafim: string, trans:string, filial: string, codepto: number,) {
    const condiferartransferencia = String(trans).toUpperCase() === 'S' ? 'S' : 'N';
     if(filial.toUpperCase() === 'TODOS'){
      const sqlPath = path.join(
        process.cwd(),
        'src',
        'apiAdm',
        'entrada-saida',
        'sql',
        'EntradaSaidaSec.sql',
      );
      const sql = fs.readFileSync(sqlPath, 'utf-8');
      const row = await this.oracle.query(sql, { datainicio, datafim, condiferartransferencia, codepto });
      return row;
     }
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'apiAdm',
      'entrada-saida',
      'sql',
      'EntradaSaidaSecFilial.sql',
    );
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const row = await this.oracle.query(sql, { datainicio, datafim, condiferartransferencia, filial, codepto });

    return row;
  }
  async GetEntradaSaidaCate(datainicio: string, datafim: string, trans:string, filial: string, codepto: number, codsec: number) {
    const condiferartransferencia = String(trans).toUpperCase() === 'S' ? 'S' : 'N';
     if(filial.toUpperCase() === 'TODOS'){
      const sqlPath = path.join(
        process.cwd(),
        'src',
        'apiAdm',
        'entrada-saida',
        'sql',
        'EntradaSaidaCate.sql',
      );
      const sql = fs.readFileSync(sqlPath, 'utf-8');
      const row = await this.oracle.query(sql, { datainicio, datafim, condiferartransferencia, codepto, codsec });
      return row;
     }
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'apiAdm',
      'entrada-saida',
      'sql',
      'EntradaSaidaCateFilial.sql',
    );
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const row = await this.oracle.query(sql, { datainicio, datafim, condiferartransferencia, filial, codepto, codsec });

    return row;
  }
  async GetEntradaSaidaProd(datainicio: string, datafim: string, trans:string, filial: string, codepto: number, codsec: number, codcategoria: number) {
    const condiferartransferencia = String(trans).toUpperCase() === 'S' ? 'S' : 'N';
     if(filial.toUpperCase() === 'TODOS'){
        const sqlPath = path.join(
        process.cwd(),
        'src',
        'apiAdm',
        'entrada-saida',
        'sql',
        'EntradaSaidaProd.sql',
      );
      const sql = fs.readFileSync(sqlPath, 'utf-8');
      const row = await this.oracle.query(sql, { datainicio, datafim, condiferartransferencia, codepto, codsec, codcategoria });

      return row;
     }
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'apiAdm',
      'entrada-saida',
      'sql',
      'EntradaSaidaProdFilial.sql',
    );
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const row = await this.oracle.query(sql, { datainicio, datafim, condiferartransferencia, filial, codepto, codsec, codcategoria });

    return row;
  }
  
}
