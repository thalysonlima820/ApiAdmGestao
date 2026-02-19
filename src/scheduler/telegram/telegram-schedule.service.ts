import { Injectable } from '@nestjs/common';
import { TELEGRAM_IDS_MONITORAMENTO_SERVIDOR } from 'src/apiAdm/telegram/constants/Telegram.constants';
import { TelegramService } from 'src/apiAdm/telegram/telegram.service';
import { mensagemTeste } from 'src/apiAdm/telegram/templates/mensagens.ts';
import { OracleService } from 'src/common/database/oracle.service';

@Injectable()
export class TelegramScheduleService {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly oracle: OracleService,
  ) {}

  async enviarTelegramTeste() {
    const msg = mensagemTeste;
    const ids = TELEGRAM_IDS_MONITORAMENTO_SERVIDOR;
    const boot = 'admin';
    const title = 'telegram Teste';
    
    await this.telegramService.sendToMany(msg, ids, boot, title);
  }
}
