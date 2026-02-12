import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  oracle: {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    host: process.env.ORACLE_HOST,
    port: Number(process.env.ORACLE_PORT),
    sid: process.env.ORACLE_SID,
  },
  environment: process.env.NODE_ENV ?? 'development',
}));
