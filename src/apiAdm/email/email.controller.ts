import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email/service')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
  ) {}

  @Get()
  async sendEmailRelatorioGerencial() {
 
    const to = ['thalysonlima820@gmail.com'];
    const subject = `Email Teste`;
    const html = 'Email teste enviado com Sucesso!'
    const text = 'Email Relatório Gerencial enviado com Sucesso';
    
    await this.emailService.sendEmail(to, subject, html, text);

    return { texto: text };
  }
}
