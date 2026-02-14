import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { AppError } from 'src/common/filters/exceptions/app-exceptions';

@Injectable()
export class CryptoService {
  private readonly key: Buffer;

  constructor(private readonly config: ConfigService) {
    const raw = this.config.get<string>('RESPONSE_ENC_KEY_BASE64');
    if (!raw) {
      AppError.ServerErro({
        message: 'RESPONSE_ENC_KEY_BASE64 não definido',
        messageType: 'alerta',
      });
      return;
    }

    const key = Buffer.from(raw, 'base64');
    if (key.length !== 32) {
      AppError.ServerErro({
        message: 'RESPONSE_ENC_KEY_BASE64 precisa ser 32 bytes em base64',
        messageType: 'alerta',
      });
      return;
    }

    this.key = key;
  }

  encryptJson(payload: unknown) {
    const iv = randomBytes(12); // recomendado pro GCM
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);

    const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
    const data = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      encrypted: true,
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      data: data.toString('base64'),
    };
  }

  decryptJson<T = any>(input: { iv: string; tag: string; data: string }): T {
    const iv = Buffer.from(input.iv, 'base64');
    const tag = Buffer.from(input.tag, 'base64');
    const data = Buffer.from(input.data, 'base64');

    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);

    const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
    return JSON.parse(plaintext.toString('utf8'));
  }
}
