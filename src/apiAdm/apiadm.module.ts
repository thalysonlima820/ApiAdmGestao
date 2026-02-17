import { Module } from '@nestjs/common';
import { UsuarioModule } from './usuario/usuario.module';
import { TelegramModule } from './telegram/telegram.module';
import { EmailModule } from './email/email.module';
import { PrecificacaoModule } from './precificacao/precificacao.module';


@Module({
  imports: [
    UsuarioModule,
    TelegramModule,
    EmailModule,
    PrecificacaoModule
  ],
  exports: [TelegramModule, EmailModule],
})
export class ApiAdmModule {}
 