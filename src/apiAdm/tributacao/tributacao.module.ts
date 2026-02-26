import { Module } from '@nestjs/common';
import { TributacaoController } from './tributacao.controller';
import { TributacaoService } from './tributacao.service';
import { AuthModule } from 'src/auth/auth.module';
import { CryptoModule } from 'src/crypto/crypto.module';

@Module({
  imports: [AuthModule, CryptoModule],
  controllers: [TributacaoController],
  providers: [TributacaoService]
})
export class TributacaoModule {}
