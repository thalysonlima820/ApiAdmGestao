import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TelegramScheduleService } from './telegram-schedule.service';

@Injectable()
export class TelegramSchedule {
  private readonly logger = new Logger(TelegramSchedule.name);

  constructor(private readonly telegramScheduleService: TelegramScheduleService) {}

  @Cron('00 20 * * *', { timeZone: 'America/Santarem' })
  async enviarEmailDiario() {
    this.logger.log('📧 Iniciando envio do Telegram diário (06:00)');
    try {
      await this.telegramScheduleService.enviarTelegramTeste();
      this.logger.log('✅ telegram teste enviado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao enviar Telegram teste', error);
    }
  }
  @Cron('00 05 * * *', { timeZone: 'America/Santarem' })
  async enviarVendaDiaAnterior() {
    this.logger.log('📧 Iniciando envio do Telegram diário (06:00)');
    try {
      await this.telegramScheduleService.enviarTelegramVendaDiaAnterior();
      this.logger.log('✅ telegram teste enviado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao enviar Telegram teste', error);
    }
  }
  @Cron('00 12 * * *', { timeZone: 'America/Santarem' })
  async enviarVendaDia() {
    this.logger.log('📧 Iniciando envio do Telegram diário (06:00)');
    try {
      await this.telegramScheduleService.enviarTelegramVendaDia();
      this.logger.log('✅ telegram teste enviado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao enviar Telegram teste', error);
    }
  }
}
