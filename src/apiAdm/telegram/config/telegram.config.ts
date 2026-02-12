import { registerAs } from '@nestjs/config';
import { TELEGRAM_BASE_URL, TELEGRAM_DISABLE_PREVIEW, TELEGRAM_PARSE_MODE } from 'src/apiAdm/telegram/constants/Telegram.constants';

export default registerAs('telegram', () => ({
  baseUrl: TELEGRAM_BASE_URL,
  botTokenAlert: process.env.TOKEN_BOOT_ALERTA,
  botTokenAdm: process.env.TOKEN_BOOT_ADM,
  parseMode: TELEGRAM_PARSE_MODE,
  disableWebPagePreview: TELEGRAM_DISABLE_PREVIEW,
}));
