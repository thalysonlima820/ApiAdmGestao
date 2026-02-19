import { Controller, Get } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TELEGRAM_IDS_MONITORAMENTO_SERVIDOR } from 'src/apiAdm/telegram/constants/Telegram.constants';
import { mensagemTeste } from './templates/mensagens.ts';

@Controller('telegram/service')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get()
  enviarMensagem() {
    const msg = mensagemTeste;
    const ids = TELEGRAM_IDS_MONITORAMENTO_SERVIDOR;
    const title = 'telegram Teste'

    return this.telegramService.sendToMany(msg, ids, 'admin', title);
  }
}
