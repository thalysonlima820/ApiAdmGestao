import { registerAs } from '@nestjs/config';

export default registerAs('crypto', () => ({
  enabled: String(process.env.RESPONSE_ENCRYPTION_ENABLED).toLowerCase() !== 'false',
  keyBase64: process.env.RESPONSE_ENC_KEY_BASE64!,
}));
