import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TelegramScheduleService } from './telegram-schedule.service';

@Injectable()
export class TelegramSchedule {
  private readonly logger = new Logger(TelegramSchedule.name);

  constructor(private readonly telegramScheduleService: TelegramScheduleService) {}

  @Cron('53 16 * * *', { timeZone: 'America/Santarem' })
  async enviarEmailDiario() {
    this.logger.log('📧 Iniciando envio do Telegram diário (06:00)');

    try {
      await this.telegramScheduleService.enviarTelegramTeste();
      this.logger.log('✅ telegram teste enviado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao enviar Telegram teste', error);
    }
  }
}
