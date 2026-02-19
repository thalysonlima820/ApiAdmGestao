import { Controller, Get } from '@nestjs/common';
import { EmailRelatorioService } from './email-relatorio.service';

@Controller('email')
export class EmailController {
  constructor(private readonly relatorio: EmailRelatorioService) {}

  @Get('relatorio/venda')
  async sendEmailRelatorioGerencial() {
    return this.relatorio.enviarRelatorioGerencial();
  }
}
