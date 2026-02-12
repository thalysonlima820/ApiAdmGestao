import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as oracledb from 'oracledb';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { AppError } from '../filters/exceptions/app-exceptions';

@Injectable()
export class OracleService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const libDir = path.join(process.cwd(), 'DB', 'instantclient_23_3');

    oracledb.initOracleClient({ libDir });

    await oracledb.createPool({
      user: this.config.get('app.oracle.user'),
      password: this.config.get('app.oracle.password'),
      connectString: `(DESCRIPTION=
        (ADDRESS=(PROTOCOL=TCP)(HOST=${this.config.get('app.oracle.host')})(PORT=${this.config.get('app.oracle.port')}))
        (CONNECT_DATA=(SID=${this.config.get('app.oracle.sid')}))
      )`,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
  }

  async query<T = any>(
    sql: string,
    binds: Record<string, any> = {},
  ): Promise<T[]> {
    const conn = await oracledb.getConnection();
    try {
      const result = await conn.execute(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: true,
      });
      return (result.rows ?? []) as T[];
    } catch (erro: unknown)   {
      await conn.close();
      const msg = erro instanceof Error ? erro.message : String(erro);
      AppError.ServerErro({message: msg, error: 'Conexão com Servidor', messageType: 'alerta', telegram: true})
      return ([])
    } finally {
      await conn.close();
    }
  }

  async onModuleDestroy() {
    await oracledb.getPool().close(10);
  }
}
