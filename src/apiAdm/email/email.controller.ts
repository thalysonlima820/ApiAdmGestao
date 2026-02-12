import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  async teste() {
    const to = ['thalysonlima820@gmail.com'];
    const subject = `title: Teste`;
    const html = 'conteudo do e-mail';
    const text = 'Email texte Enviado com Sucesso';
    await this.emailService.teste(to, subject, html, text);
    return { texto: text };
  }
}
