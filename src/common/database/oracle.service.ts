import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as oracledb from 'oracledb';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

@Injectable()
export class OracleService implements OnModuleInit, OnModuleDestroy {
  private pool!: oracledb.Pool;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const libDir = path.join(process.cwd(), 'DB', 'instantclient_23_3');
    oracledb.initOracleClient({ libDir });

    this.pool = await oracledb.createPool({
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

  async query<T = any>(sql: string, binds: Record<string, any> = {}): Promise<T[]> {
    let conn: any;

    try {
      conn = await this.pool.getConnection();
      await conn.execute(
        `BEGIN DBMS_APPLICATION_INFO.SET_MODULE(:m, :a); END;`,
        { m: 'API_ADM', a: 'PRECIF' },
      );

      const result = await conn.execute(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: true,
      });

      return (result.rows ?? []) as T[];
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch {
          //
        }
      }
    }
  }

  async onModuleDestroy() {
    if (this.pool) await this.pool.close(10);
  }
}
