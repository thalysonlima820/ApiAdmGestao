import { Controller, Get } from '@nestjs/common';
import { TelegramScheduleService } from './telegram-schedule.service';

@Controller('telegram')
export class TelegramScheduleController {
  constructor(
    private readonly telegramScheduleService: TelegramScheduleService,
  ) {}

  @Get('teste')
  async sendEmailRelatorioGerencial() {
    return this.telegramScheduleService.enviarTelegramTeste();
  }
}
