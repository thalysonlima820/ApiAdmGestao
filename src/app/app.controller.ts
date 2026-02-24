import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('log')
  getLog() {
    return this.appService.getLog();
  }
  @Get('log/usuario')
  getLogUsuario() {
    return this.appService.getLogUser();
  }
  @Get('log/precificacao')
  getLogPrecificacao() {
    return this.appService.getLogPrecificacao();
  }
  @Get('log/limite')
  getLogLimite() {
    return this.appService.getLogLimite();
  }
  @Get('log/telegram')
  getLogTelegram() {
    return this.appService.getLogTelegram();
  }
}
