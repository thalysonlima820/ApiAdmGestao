import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/common/database/oracle.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TributacaoService {
     constructor(private readonly oracle: OracleService) {}
    
      async GetFiguraTrib(dataInicio: string, datafim: string, filial: string) {
        const sqlPath = path.join(
          process.cwd(),
          'src',
          'apiAdm',
          'tributacao',
          'sql',
          'figuraTrib.sql',
        );
        const sql = fs.readFileSync(sqlPath, 'utf-8');
    
        const rows = await this.oracle.query<any>(sql, { dataInicio, datafim, filial });
    
        return rows;
      }
      async GetLogTrib(dataInicio: string, datafim: string,) {
        const sqlPath = path.join(
          process.cwd(),
          'src',
          'apiAdm',
          'tributacao',
          'sql',
          'logTrib.sql',
        );
        const sql = fs.readFileSync(sqlPath, 'utf-8');
    
        const rows = await this.oracle.query<any>(sql, { dataInicio, datafim });
    
        return rows;
      }
}
