import { Module } from '@nestjs/common';
import { PrecificacaoController } from './precificacao.controller';
import { PrecificacaoService } from './precificacao.service';
import { AuthModule } from 'src/auth/auth.module';
import { CryptoModule } from 'src/crypto/crypto.module';

@Module({
  imports: [AuthModule, CryptoModule],
  controllers: [PrecificacaoController],
  providers: [PrecificacaoService],
})
export class PrecificacaoModule {}
