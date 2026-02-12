import { registerAs } from '@nestjs/config';
import { EMAIL_CONFIG_KEY } from '../constants/email.constants';

export default registerAs(EMAIL_CONFIG_KEY, () => ({
  HOST: process.env.SMTP_HOST,
  PORT: Number(process.env.SMTP_PORT),
  SECURE: process.env.SMTP_SECURE === 'true',
  USER: process.env.SMTP_USER,
  PASS: process.env.SMTP_PASS,
  FROM: process.env.SMTP_FROM,
}));
