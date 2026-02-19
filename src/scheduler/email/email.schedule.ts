import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EmailRelatorioService } from './email-relatorio.service';

@Injectable()
export class EmailSchedule {
  private readonly logger = new Logger(EmailSchedule.name);

  constructor(private readonly relatorio: EmailRelatorioService) {}

  @Cron('0 6 * * *', { timeZone: 'America/Santarem' })
  async enviarEmailDiario() {
    this.logger.log('📧 Iniciando envio de email diário (06:00)');

    try {
      await this.relatorio.enviarRelatorioGerencial();
      this.logger.log('✅ Email enviado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao enviar email diário', error);
    }
  }
}
